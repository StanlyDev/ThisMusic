document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const input = document.getElementById('search');
    const pages = document.getElementById('pages');
    const spotifyResultsContainer = document.querySelector('.spt-results');
    const videoResultsContainer = document.querySelector('.yt-results');

    // Crear botones separados para Spotify y YouTube
    const loadMoreSpotifyButton = createLoadMoreButton('Spotify');
    const loadMoreYouTubeButton = createLoadMoreButton('YouTube');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const query = input.value.trim();
        if (query) {
            clearResults();
            try {
                await searchYouTubeMusic(query);
                await searchSpotify(query);
                pages.style.display = "block";
            } catch (error) {
                console.error('Error during search:', error);
            }
        }
    });

    let nextPageTokenYouTube = '';
    let nextSpotifyURL = '';
    const resultsPerPage = 20;
    let allResultsYouTube = [];
    let allResultsSpotify = [];
    let currentIndexYouTube = 0;
    let currentIndexSpotify = 0;

    // Cache para evitar consultas repetidas
    const cache = {};

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
        const cacheKey = `spotify-${query}`;
        if (cache[cacheKey]) {
            allResultsSpotify = cache[cacheKey].results;
            nextSpotifyURL = cache[cacheKey].nextURL;
        } else {
            const apiURL = nextSpotifyURL || `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${resultsPerPage}`;
            const response = await fetch(apiURL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            nextSpotifyURL = data.tracks.next;
            allResultsSpotify = data.tracks.items;
            cache[cacheKey] = { results: allResultsSpotify, nextURL: nextSpotifyURL };
        }
        currentIndexSpotify = 0;
        displaySpotifyResults();
        loadMoreSpotifyButton.style.display = nextSpotifyURL ? 'block' : 'none';
    }

    async function searchYouTubeMusic(query) {
        const apiKey = 'AIzaSyD-a_4Q9ShBeTaNtX_GSZIzslHcj7YAi1Q';
        const cacheKey = `youtube-${query}`;
        if (cache[cacheKey]) {
            allResultsYouTube = cache[cacheKey].results;
            nextPageTokenYouTube = cache[cacheKey].nextPageToken;
        } else {
            const apiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=${resultsPerPage}&pageToken=${nextPageTokenYouTube}`;        
            try {
                const response = await fetch(apiURL);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                nextPageTokenYouTube = data.nextPageToken || '';
                allResultsYouTube = data.items || [];
                cache[cacheKey] = { results: allResultsYouTube, nextPageToken: nextPageTokenYouTube };
            } catch (error) {
                console.error('Error fetching YouTube data:', error);
            }
        }
        currentIndexYouTube = 0;
        displayYouTubeResults();
        loadMoreYouTubeButton.style.display = nextPageTokenYouTube ? 'block' : 'none';
    }    

    function displayYouTubeResults() {
        for (let i = currentIndexYouTube; i < currentIndexYouTube + resultsPerPage && i < allResultsYouTube.length; i++) {
            const item = allResultsYouTube[i];
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const thumbnail = item.snippet.thumbnails.default.url;
            const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="${videoURL}" target="_blank"><img src="${thumbnail}" alt="${title}" style="width:100px;"></a></td>
                <td>${title}</td>
                <td><a href="${videoURL}" target="_blank">Ver video</a></td>
            `;

            videoResultsContainer.appendChild(row);
        }

        currentIndexYouTube += resultsPerPage;
        if (currentIndexYouTube >= allResultsYouTube.length) {
            loadMoreYouTubeButton.style.display = nextPageTokenYouTube ? 'block' : 'none';
        }
    }

    function displaySpotifyResults() {
        for (let i = currentIndexSpotify; i < currentIndexSpotify + resultsPerPage && i < allResultsSpotify.length; i++) {
            const item = allResultsSpotify[i];
            const title = item.name;
            const artist = item.artists[0].name;
            const image = item.album.images[0]?.url;
            const url = item.external_urls.spotify;
            const uri = item.uri;  // Spotify URI to embed

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="${url}" target="_blank"><img src="${image}" alt="${title}" style="width:100px;"></a></td>
                <td>${title}</td>
                <td>${artist}</td>
                <td><button class="play-button" data-uri="${uri}">Escuchar</button></td>
            `;

            spotifyResultsContainer.appendChild(row);
        }

        currentIndexSpotify += resultsPerPage;
        if (currentIndexSpotify >= allResultsSpotify.length) {
            loadMoreSpotifyButton.style.display = nextSpotifyURL ? 'block' : 'none';
        }

        // Add event listeners to the play buttons
        const playButtons = document.querySelectorAll('.play-button');
        playButtons.forEach(button => {
            button.addEventListener('click', function() {
                const uri = this.getAttribute('data-uri');
                playSpotifyTrack(uri);
            });
        });
    }

    function playSpotifyTrack(uri) {
        const trackId = uri.split(':').pop(); // Extrae el ID del track del URI
        const existingIframe = document.getElementById('spotify-embed');
        if (existingIframe) {
            existingIframe.src = `https://open.spotify.com/embed/track/${trackId}`;
        } else {
            const iframe = document.createElement('iframe');
            iframe.id = 'spotify-embed';
            iframe.src = `https://open.spotify.com/embed/track/${trackId}`;
            iframe.width = '300'; // Ajusta el tamaño según sea necesario
            iframe.height = '80'; // Ajusta el tamaño según sea necesario
            iframe.frameBorder = '0';
            iframe.allowtransparency = 'true';
            iframe.allow = 'encrypted-media';
            document.body.appendChild(iframe);
        }
    }    

    function clearResults() {
        spotifyResultsContainer.innerHTML = '';
        videoResultsContainer.innerHTML = '';
        nextPageTokenYouTube = '';
        nextSpotifyURL = '';
        allResultsYouTube = [];
        allResultsSpotify = [];
        currentIndexYouTube = 0;
        currentIndexSpotify = 0;
    }

    function createLoadMoreButton(type) {
        const button = document.createElement('button');
        button.textContent = `Mostrar más ${type}`;
        button.style.display = 'none';
        
        button.addEventListener('click', async function() {
            if (type === 'Spotify' && nextSpotifyURL) {
                await searchSpotify(input.value.trim());
            }
            if (type === 'YouTube' && nextPageTokenYouTube) {
                await searchYouTubeMusic(input.value.trim());
            }
        });

        // Añadir el botón al contenedor adecuado
        if (type === 'Spotify') {
            spotifyResultsContainer.parentElement.appendChild(button);
        } else if (type === 'YouTube') {
            videoResultsContainer.parentElement.appendChild(button);
        }
        
        return button;
    }
});
