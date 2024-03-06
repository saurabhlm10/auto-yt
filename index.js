require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const fs = require("fs");

const app = express();
app.set("view engine", "ejs");

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scopes = ["https://www.googleapis.com/auth/youtube.upload"];

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/privacy", (req, res) => {
  res.render("privacy");
});
app.get("/terms", (req, res) => {
  res.render("terms");
});

app.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/oauth2callback", (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.error("Error getting oAuth tokens:", err);
      return res.redirect("/");
    }
    oauth2Client.setCredentials(tokens);
    res.redirect("/upload");
  });
});

app.get("/upload", (req, res) => {
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  youtube.videos.insert(
    {
      part: "id,snippet,status",
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: "Ephemeral Whispers",
          description:
            "Chase the elusive whispers that vanish like dreams in the wind.",
          tags: ["Whispers", "Dreams", "Silence", "Mystery", "Ethereal"],
          categoryId: "22", // Choose the category based on YouTube's API documentation
        },
        status: {
          privacyStatus: "public", // or 'private' or 'unlisted'
        },
      },
      media: {
        body: fs.createReadStream("./short.mp4"), // The path to your video file
      },
    },
    (err, response) => {
      if (err) {
        console.error("Error uploading video:", err);
        return res.redirect("/");
      }
      console.log("Uploaded video with ID:", response.data.id);
      res.send(`Video uploaded! <br> Video ID: ${response.data.id}`);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
