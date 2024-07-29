document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const input = document.getElementById('search');
    const musicResultsContainer = document.querySelector('.music-page .search-result');
    const videoResultsContainer = document.querySelector('.video-page .search-result');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita el envío del formulario por defecto
        const query = input.value.trim(); // Obtiene el valor del input y elimina los espacios en blanco
        if (query) {
            searchYouTubeMusic(query);
        }
    });

    function searchYouTubeMusic(query) {
        const apiKey = 'AIzaSyBgFksnrVaj8jd9ap7_bdMhjNnUjHHSjcQ'; // Reemplaza con tu API key de YouTube Data API v3
        const apiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`;

        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                displayResults(data.items);
            })
            .catch(error => console.error('Error fetching YouTube data:', error));
    }

    function displayResults(items) {
        // Limpiar resultados previos
        musicResultsContainer.innerHTML = '';
        videoResultsContainer.innerHTML = '';

        items.forEach(item => {
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
        });
    }
});
