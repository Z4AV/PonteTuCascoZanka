const videoCasco = document.getElementById('v-casco');

// 1. Aseguramos que el video principal esté listo
videoCasco.load();

window.addEventListener('scroll', () => {
    // Calculamos cuánto scroll ha hecho el usuario
    const scrollTop = window.pageYOffset;

    // Determinamos el límite de scroll (puedes ajustar el 1.5 para que la rotación sea más lenta o rápida)
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScroll;

    // 2. Sincronización del Video Principal (Efecto Scroll-Sync)
    if (videoCasco.duration) {
        // Multiplicamos por la duración para que el video avance al ritmo del dedo
        videoCasco.currentTime = videoCasco.duration * scrollFraction;
    }
});

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