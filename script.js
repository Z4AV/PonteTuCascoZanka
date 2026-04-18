
const video = document.getElementById('v-casco');

// Intentar cargar el video al inicio
video.load();

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const maxScroll = document.body.offsetHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScroll;

    if (video.duration) {
        // El secreto es calcular el tiempo exacto basado en el scroll
        video.currentTime = video.duration * scrollFraction;
    }
});