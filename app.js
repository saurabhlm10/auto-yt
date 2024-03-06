const express = require("express");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const axios = require("axios"); // Add axios for HTTP requests
const stream = require("stream"); // Used for streaming data

require("dotenv").config();

const app = express();
app.use(express.json()); // Enable JSON body parsing

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

app.post("/upload", async (req, res) => {
  // const videoUrl = req.body.videoUrl;  // URL of the video in cloud storage
  const videoUrl = "./short.mp4"; // URL of the video in cloud storage
  const videoTitle = "Ephemeral Whispers"; // Title from request body or default
  // const videoTitle = req.body.title || 'Default Title'; // Title from request body or default

  try {
    const response = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
    });

    const passThroughStream = new stream.PassThrough();
    response.data.pipe(passThroughStream);

    youtube.videos.insert(
      {
        part: "id,snippet,status",
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: videoTitle,
            description:
              "Chase the elusive whispers that vanish like dreams in the wind.",
            tags: ["Whispers", "Dreams", "Silence", "Mystery", "Ethereal"],
            categoryId: "22",
          },
          status: {
            privacyStatus: "public", // Can be changed as needed
          },
        },
        media: {
          body: passThroughStream,
        },
      },
      (err, uploadResponse) => {
        if (err) {
          console.error("The API returned an error: ", err);
          return res.status(500).send(err);
        }
        res
          .status(200)
          .send(
            `Video uploaded successfully! Video ID: ${uploadResponse.data.id}`
          );
      }
    );
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log("Error", err);
      console.log("Error Message", err.response);
      return res.status(500).send(err.response);
    }
    console.error("Error downloading file:", err);
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
