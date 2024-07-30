document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const input = document.getElementById('search');
    const pages = document.getElementById('pages');
    const ytMusicResultsContainer = document.querySelector('.yt-results');
    const spotifyResultsContainer = document.querySelector('.spt-results');
    const videoResultsContainer = document.querySelector('.yt');
    const loadMoreButton = createLoadMoreButton();

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const query = input.value.trim();
        if (query) {
            clearResults();
            try {
                await searchYouTubeMusic(query);
                const spotifyResults = await searchSpotify(query);
                displaySpotifyResults(spotifyResults);
                pages.style.display = "block";
            } catch (error) {
                console.error('Error during search:', error);
            }
        }
    });

    let nextPageToken = '';
    const resultsPerPage = 20;
    let allResults = [];
    let currentIndex = 0;

    async function getSpotifyToken() {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa('8b6fe43adf434898aadfa61415c23ebe:e338596c25d94b02abe305388455ec1f')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching Spotify token:', error);
        }
    }

    async function searchSpotify(query) {
        const token = await getSpotifyToken();
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.tracks.items;
    }

    async function searchYouTubeMusic(query) {
        const apiKey = 'AIzaSyAm-M70z7r4MoBhR3vhUmbz_7EOYeDC5pg';
        const apiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=${resultsPerPage}&pageToken=${nextPageToken}`;

        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            nextPageToken = data.nextPageToken || '';
            allResults = data.items;
            currentIndex = 0;
            displayYouTubeResults();
            loadMoreButton.style.display = nextPageToken ? 'block' : 'none';
        } catch (error) {
            console.error('Error fetching YouTube data:', error);
        }
    }

    function displayYouTubeResults() {
        for (let i = currentIndex; i < currentIndex + resultsPerPage && i < allResults.length; i++) {
            const item = allResults[i];
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const thumbnail = item.snippet.thumbnails.default.url;
            const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

            const resultElement = document.createElement('div');
            resultElement.classList.add('result');
            resultElement.innerHTML = `
                <h3>Youtube</h3>
                <a href="${videoURL}" target="_blank"><img src="${thumbnail}" alt="${title}"></a>
                <a href="${videoURL}" target="_blank">${title}</a>
            `;

            ytMusicResultsContainer.appendChild(resultElement);
            videoResultsContainer.appendChild(resultElement.cloneNode(true));
        }

        currentIndex += resultsPerPage;
        if (currentIndex >= allResults.length) {
            loadMoreButton.style.display = 'none';
        }
    }

    function displaySpotifyResults(results) {
        results.forEach(item => {
            const resultElement = document.createElement('div');
            resultElement.classList.add('result');
            const albumArt = item.album.images[0].url;
            const title = item.name;
            const artist = item.artists.map(artist => artist.name).join(', ');
            const trackURL = item.external_urls.spotify;

            resultElement.innerHTML = `
                <h3>Spotify</h3>
                <a href="${trackURL}" target="_blank"><img src="${albumArt}" alt="${title}"></a>
                <a href="${trackURL}" target="_blank">${title} - ${artist}</a>
            `;

            spotifyResultsContainer.appendChild(resultElement);
        });
    }

    function loadMoreResults() {
        if (nextPageToken) {
            searchYouTubeMusic(input.value.trim());
        }
    }

    function createLoadMoreButton() {
        const button = document.createElement('button');
        button.textContent = 'Mostrar más';
        button.className = 'load-more';
        button.style.display = 'none';
        button.addEventListener('click', function(event) {
            event.preventDefault();
            loadMoreResults();
        });
        document.querySelector('.main-content').appendChild(button);
        return button;
    }

    function clearResults() {
        ytMusicResultsContainer.innerHTML = '';
        spotifyResultsContainer.innerHTML = '';
        videoResultsContainer.innerHTML = '';
    }
});
