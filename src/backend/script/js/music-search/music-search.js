document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const input = document.getElementById('search');
    const ytMusicResultsContainer = document.querySelector('.yt-music');
    const spotifyResultsContainer = document.querySelector('.Spotify');
    const videoResultsContainer = document.querySelector('.yt');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.textContent = 'Mostrar más';
    loadMoreButton.style.display = 'none'; // Oculta el botón inicialmente
    loadMoreButton.className = 'load-more'; // Añade una clase para estilizar si es necesario

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita el envío del formulario por defecto
        const query = input.value.trim(); // Obtiene el valor del input y elimina los espacios en blanco
        if (query) {
            ytMusicResultsContainer.innerHTML = ''; // Limpiar resultados anteriores de YouTube
            spotifyResultsContainer.innerHTML = ''; // Limpiar resultados anteriores de Spotify
            videoResultsContainer.innerHTML = ''; // Limpiar resultados anteriores de YouTube videos

            searchYouTubeMusic(query); // Realizar la búsqueda en YouTube Music
            const spotifyResults = await searchSpotify(query); // Realizar la búsqueda en Spotify
            displaySpotifyResults(spotifyResults); // Mostrar los resultados de Spotify
        }
    });

    let nextPageToken = ''; // Token para la paginación
    const resultsPerPage = 20; // Número de resultados a mostrar por página
    let allResults = []; // Almacena todos los resultados obtenidos
    let currentIndex = 0; // Índice actual para mostrar los resultados

    async function getSpotifyToken() {
        const clientId = '8b6fe43adf434898aadfa61415c23ebe';
        const clientSecret = 'e338596c25d94b02abe305388455ec1f';
        const credentials = btoa(`${clientId}:${clientSecret}`);

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        return data.access_token;
    }

    async function searchSpotify(query) {
        const token = await getSpotifyToken();
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data.tracks.items; // Devuelve los resultados de las pistas
    }

    function searchYouTubeMusic(query) {
        const apiKey = 'AIzaSyBgFksnrVaj8jd9ap7_bdMhjNnUjHHSjcQ'; // Reemplaza con tu API key de YouTube Data API v3
        const apiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=${resultsPerPage}&pageToken=${nextPageToken}`;

        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                nextPageToken = data.nextPageToken || ''; // Actualiza el token para la siguiente página
                allResults = data.items; // Almacena todos los resultados
                currentIndex = 0; // Reinicia el índice
                displayYouTubeResults();
                if (nextPageToken) {
                    loadMoreButton.style.display = 'block'; // Muestra el botón "Mostrar más"
                } else {
                    loadMoreButton.style.display = 'none'; // Oculta el botón si no hay más resultados
                }
            })
            .catch(error => console.error('Error fetching YouTube data:', error));
    }

    function displayYouTubeResults() {
        // Mostrar un número específico de resultados
        for (let i = currentIndex; i < currentIndex + resultsPerPage && i < allResults.length; i++) {
            const item = allResults[i];
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const thumbnail = item.snippet.thumbnails.default.url;
            const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

            // Crear un elemento para mostrar el resultado
            const resultElement = document.createElement('div');
            resultElement.classList.add('result');

            resultElement.innerHTML = `
                <h3>YouTube</h3><br>
                <img src="${thumbnail}" alt="${title}">
                <a href="${videoURL}" target="_blank">${title}</a>
            `;

            // Añadir el resultado a los contenedores correspondientes
            ytMusicResultsContainer.appendChild(resultElement);
            videoResultsContainer.appendChild(resultElement.cloneNode(true)); // Clonar el nodo para evitar que se elimine del DOM original
        }

        currentIndex += resultsPerPage; // Actualiza el índice para la siguiente página
        if (currentIndex >= allResults.length) {
            loadMoreButton.style.display = 'none'; // Oculta el botón si no hay más resultados
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
            <h3>Spotify</h3><br>
                <img src="${albumArt}" alt="${title}">
                <a href="${trackURL}" target="_blank">${title} - ${artist}</a>
            `;

            spotifyResultsContainer.appendChild(resultElement);
        });
    }

    function loadMoreResults() {
        if (nextPageToken) {
            searchYouTubeMusic(input.value.trim()); // Realiza una nueva búsqueda con el token de la siguiente página
        }
    }

    // Añadir el botón "Mostrar más" a la página
    loadMoreButton.addEventListener('click', function(event) {
        event.preventDefault(); // Evita el comportamiento por defecto del botón
        loadMoreResults();
    });

    document.querySelector('.main-content').appendChild(loadMoreButton);
});
