document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const input = document.getElementById('search');
    const musicResultsContainer = document.querySelector('.music-page .search-result');
    const videoResultsContainer = document.querySelector('.video-page .search-result');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.textContent = 'Mostrar más';
    loadMoreButton.style.display = 'none'; // Oculta el botón inicialmente
    loadMoreButton.className = 'load-more'; // Añade una clase para estilizar si es necesario

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita el envío del formulario por defecto
        const query = input.value.trim(); // Obtiene el valor del input y elimina los espacios en blanco
        if (query) {
            searchYouTubeMusic(query);
        }
    });

    let nextPageToken = ''; // Token para la paginación
    const resultsPerPage = 20; // Número de resultados a mostrar por página
    let allResults = []; // Almacena todos los resultados obtenidos
    let currentIndex = 0; // Índice actual para mostrar los resultados

    function searchYouTubeMusic(query) {
        const apiKey = 'AIzaSyBgFksnrVaj8jd9ap7_bdMhjNnUjHHSjcQ'; // Reemplaza con tu API key de YouTube Data API v3
        const apiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=${resultsPerPage}&pageToken=${nextPageToken}`;

        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                nextPageToken = data.nextPageToken || ''; // Actualiza el token para la siguiente página
                allResults = data.items; // Almacena todos los resultados
                currentIndex = 0; // Reinicia el índice
                displayResults();
                if (nextPageToken) {
                    loadMoreButton.style.display = 'block'; // Muestra el botón "Mostrar más"
                } else {
                    loadMoreButton.style.display = 'none'; // Oculta el botón si no hay más resultados
                }
            })
            .catch(error => console.error('Error fetching YouTube data:', error));
    }

    function displayResults() {
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
                <img src="${thumbnail}" alt="${title}">
                <a href="${videoURL}" target="_blank">${title}</a>
            `;

            // Añadir el resultado a los contenedores correspondientes
            musicResultsContainer.appendChild(resultElement);
            videoResultsContainer.appendChild(resultElement.cloneNode(true)); // Clonar el nodo para evitar que se elimine del DOM original
        }

        currentIndex += resultsPerPage; // Actualiza el índice para la siguiente página
        if (currentIndex >= allResults.length) {
            loadMoreButton.style.display = 'none'; // Oculta el botón si no hay más resultados
        }
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
