
const video = document.getElementById('v-casco');

// Forzamos a que el video esté en el segundo 0 al inicio
video.currentTime = 0;

window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset;
    const totalHeight = document.body.offsetHeight - window.innerHeight;

    // Calculamos el progreso (entre 0 y 1)
    const progress = Math.max(0, Math.min(1, scrollPos / totalHeight));

    if (video.duration) {
        // Multiplicamos por la duración del video
        video.currentTime = video.duration * progress;
    }
});

// Este pequeño truco ayuda a que el video cargue sus metadatos rápido
video.load();