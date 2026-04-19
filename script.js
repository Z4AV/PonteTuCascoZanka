const video = document.getElementById('v-casco');

// Función para manejar el scroll
function controlVideo() {
    const scrollPos = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = scrollPos / maxScroll;

    if (video.duration) {
        // Limitamos el progreso para que no intente ir más allá del video
        video.currentTime = video.duration * Math.min(progress, 0.99);
    }
}

window.addEventListener('scroll', controlVideo);

// Botón alerta
document.querySelector('.btn-main-register').addEventListener('click', () => {
    alert("Iniciando registro #PonteTuCascoZanka");
});
