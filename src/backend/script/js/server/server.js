const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

// Acceder a las variables de entorno
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const youtube_api_key = process.env.YOUTUBE_API_KEY;

// Ruta para obtener el token de Spotify
app.post('/api/spotify-token', async (req, res) => {
    const authOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
        const data = await response.json();
        res.json({ access_token: data.access_token });
    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        res.status(500).send('Error fetching Spotify token');
    }
});

// Ruta para buscar en YouTube
app.post('/api/youtube-search', async (req, res) => {
    const query = req.body.query;
    const nextPageToken = req.body.nextPageToken || '';
    const apiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${youtube_api_key}&maxResults=20&pageToken=${nextPageToken}`;

    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        res.status(500).send('Error fetching YouTube data');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
