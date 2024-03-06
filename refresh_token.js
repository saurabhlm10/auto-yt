const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/youtube'];

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send('Authentication successful! You can close this tab.');
  console.log(`Refresh Token: ${tokens.refresh_token}`);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
