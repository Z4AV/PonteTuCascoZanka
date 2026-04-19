const videoCasco = document.getElementById('v-casco');

// 1. Aseguramos que el video principal esté listo
const video = document.getElementById('v-casco');

// Cargamos el video y nos aseguramos de que empiece en el segundo 0
video.pause();
video.currentTime = 0;

function updateVideoScroll() {
    const scrollTop = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScroll;

    if (video.duration) {
        // El cálculo de tiempo basado en scroll
        video.currentTime = video.duration * scrollFraction;
    }

    // Ejecutamos la función en el próximo frame disponible
    requestAnimationFrame(updateVideoScroll);
}

// Iniciamos la animación
requestAnimationFrame(updateVideoScroll);

// 3. Optimización de Videos Secundarios (Puntos de Registro e Infracciones)
// Esto hace que los videos solo se reproduzcan cuando están visibles para ahorrar datos
const observerOptions = {
    threshold: 0.5
};

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.play();
        } else {
            entry.target.pause();
        }
    });
}, observerOptions);

// Aplicamos el observador a todos los videos dentro de las tarjetas naranja
document.querySelectorAll('.video-card video').forEach(v => {
    videoObserver.observe(v);
});

// 4. Logica del Botón "Registrarse"
document.querySelector('.btn-main-register').addEventListener('click', () => {
    // Aquí puedes redirigir a un formulario de Google o una sección de la web
    alert("Iniciando registro seguro para el programa #PonteTuCascoZanka");
    // window.location.href = "#seccion-formulario"; 
});