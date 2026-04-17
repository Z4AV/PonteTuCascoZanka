
const video = document.getElementById('v-casco');

window.addEventListener('scroll', () => {
    // Calculamos el porcentaje de scroll
    const totalScroll = document.body.offsetHeight - window.innerHeight;
    const currentScroll = window.pageYOffset;
    const scrollFraction = currentScroll / totalScroll;

    // Movemos el tiempo del video según el scroll
    if (video.duration) {
        video.currentTime = video.duration * scrollFraction;
    }
});