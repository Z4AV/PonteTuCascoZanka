/* ============================================================
   PONTE TU CASCO ZANKA — script.js
   ✅ = código original intacto
   🌊 = nuevo: motor de olas
   ============================================================ */


/* ============================================================
   ✅ PARTE 1 — Video scrubbing con scroll (original intacto)
   ============================================================ */
const video = document.getElementById('v-casco');

function controlVideo() {
    const scrollPos = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = scrollPos / maxScroll;
    if (video.duration) {
        video.currentTime = video.duration * Math.min(progress, 0.99);
    }
}
window.addEventListener('scroll', controlVideo);

/* ✅ Botón alerta original */
document.querySelector('.btn-main-register').addEventListener('click', () => {
    alert("Iniciando registro #PonteTuCascoZanka");
});


/* ============================================================
   🌊 PARTE 2 — MOTOR DE OLAS
   
   CÓMO FUNCIONA (explicado para novatos):
   
   Hay DOS canvas independientes:
   
   A) #wave-canvas (en #wave-transition)
      Detecta qué tan cerca estás de la action-section
      usando IntersectionObserver. Cuando el elemento
      entra en pantalla, anima una ola que sube desde
      abajo hasta cubrir toda la pantalla.
      → "La ola que invade mientras scrolleas"
   
   B) #action-wave-canvas (dentro de .action-section)
      Siempre animado en loop. Dibuja 3 capas de olas
      sobre el fondo de arena.
      → "Las olas que se mueven en la sección naranja/arena"
   
   Ambos usan el mismo helper drawWaves() para ser
   consistentes visualmente.
   ============================================================ */


/* ── Colores compartidos ── */
const COLORS = {
    oceanDeep: [10, 60, 120],   // azul profundo
    oceanMid: [20, 130, 190],   // azul medio
    oceanShallow: [58, 181, 200],   // turquesa cerca de la orilla
    foamAlpha: 0.75,             // opacidad de la espuma blanca
};

/* ── Utilidades de color ── */
function lerp(a, b, t) { return a + (b - a) * t; }
function rgb(c, alpha) {
    return alpha !== undefined
        ? `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
        : `rgb(${c[0]},${c[1]},${c[2]})`;
}


/* ============================================================
   🌊 HELPER: drawWaves(ctx, W, H, time, shorelineY)
   
   Esta función dibuja todo el efecto de olas en UN canvas.
   Se llama 60 veces por segundo desde requestAnimationFrame.
   
   Parámetros:
     ctx        → el contexto 2D del canvas (como el "pincel")
     W, H       → ancho y alto del canvas en píxeles
     time       → tiempo en segundos (hace que las olas se muevan)
     shorelineY → dónde está la línea de costa
                  0   = ola en la parte superior (mar lleno)
                  H   = ola en la parte inferior (aún no llega)
   ============================================================ */
function drawWaves(ctx, W, H, time, shorelineY) {

    /* Limpia el frame anterior */
    ctx.clearRect(0, 0, W, H);

    /* Si la línea de costa está por debajo de la pantalla, no dibujar nada */
    if (shorelineY >= H) return;

    /*
      CLAVE PARA ENTENDER LAS OLAS:
      Usamos Math.sin() — una función que oscila entre -1 y +1.
      Si dibujas el borde del mar siguiendo esa curva, obtienes
      una ola perfecta. Sumamos VARIAS frecuencias (freq1, freq2)
      con velocidades distintas para que parezca natural.
      Es el mismo truco que usa Unity, Three.js y el océano real.
    */
    function waveY(x, layer) {
        const freq1 = 0.009 + layer * 0.002;   // qué tan "juntas" están las olas
        const freq2 = 0.017 + layer * 0.003;
        const amp1 = 14 - layer * 3;          // altura de la ola principal
        const amp2 = 7 - layer * 1.5;        // altura de la ola secundaria
        const dir = layer % 2 === 0 ? 1 : -0.8; // olas alternadas van en direcciones distintas
        return shorelineY
            + Math.sin(x * freq1 + time * dir) * amp1
            + Math.sin(x * freq2 - time * 1.4) * amp2;
    }

    /* ── Cuerpo del océano ── */
    ctx.beginPath();
    ctx.moveTo(0, waveY(0, 0));
    for (let x = 0; x <= W; x += 4) {        // cada 4px es suficiente precisión en móvil
        ctx.lineTo(x, waveY(x, 0));
    }
    ctx.lineTo(W, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();

    /* Gradiente vertical: más oscuro arriba (profundidad), más claro cerca de la orilla */
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, shorelineY);
    oceanGrad.addColorStop(0, rgb(COLORS.oceanDeep, 0.95));
    oceanGrad.addColorStop(0.6, rgb(COLORS.oceanMid, 0.92));
    oceanGrad.addColorStop(1, rgb(COLORS.oceanShallow, 0.85));
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    /* ── Capas de espuma (3 olas escalonadas) ── */
    for (let layer = 0; layer < 3; layer++) {
        const offset = layer * 20;           // cada capa está más abajo
        const opacity = (0.65 - layer * 0.18);
        const thickness = 12 - layer * 3;      // la espuma es más fina capa a capa

        ctx.beginPath();
        ctx.moveTo(0, waveY(0, layer) + offset);
        for (let x = 0; x <= W; x += 4) {
            ctx.lineTo(x, waveY(x, layer) + offset);
        }
        ctx.lineTo(W, waveY(W, layer) + offset + thickness);
        for (let x = W; x >= 0; x -= 4) {
            ctx.lineTo(x, waveY(x, layer) + offset + thickness);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
    }

    /* ── Destellos de luz en el agua ── */
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 30; i++) {
        /* Posiciones "pseudo-aleatorias" pero deterministas gracias al índice i */
        const sx = (Math.sin(i * 137.5 + time * 0.25) * 0.5 + 0.5) * W;
        const sy = (Math.cos(i * 97.3 + time * 0.18) * 0.5 + 0.5) * Math.max(0, shorelineY - 10);
        const sr = 1.5 + Math.sin(i + time * 1.5) * 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    ctx.restore();
}


/* ============================================================
   🌊 CANVAS A — Transición de ola (en #wave-transition)
   
   Usa IntersectionObserver para saber qué porcentaje
   de la sección es visible. A más visible → la ola
   baja más (shorelineY más pequeño → más mar).
   ============================================================ */
(function initTransitionWave() {
    const section = document.getElementById('wave-transition');
    const canvas = document.getElementById('wave-canvas');
    const ctx = canvas.getContext('2d');

    let W, H, time = 0, progress = 0, rafId = null;

    function resize() {
        W = canvas.width = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Cada vez que el usuario scrollea, recalculamos manualmente
       qué porcentaje de la sección está en viewport */
    function updateProgress() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        /* ¿cuánto del elemento ya "pasó" por pantalla?
           0 = recién entró por abajo, 1 = ya salió por arriba */
        const visible = (vh - rect.top) / (vh + rect.height);
        progress = Math.max(0, Math.min(1, visible));
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    let lastTs = null;
    function loop(ts) {
        if (!lastTs) lastTs = ts;
        time += (ts - lastTs) / 1000;
        lastTs = ts;

        /* shorelineY: cuando progress=0 la ola está fuera (H+20),
           cuando progress=1 la ola está en el tope (0) */
        const shorelineY = H * (1 - progress) - 20;

        drawWaves(ctx, W, H, time, shorelineY);
        rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
})();


/* ============================================================
   🌊 CANVAS B — Olas en loop dentro de .action-section
   
   Siempre activo. La línea de costa está fija en el 35%
   superior del canvas, así el mar ocupa la parte de arriba
   de la sección y la arena el resto → se ve como playa.
   ============================================================ */
(function initActionWave() {
    const section = document.querySelector('.action-section');
    const canvas = document.getElementById('action-wave-canvas');
    const ctx = canvas.getContext('2d');

    let W, H, time = 0;

    function resize() {
        W = canvas.width = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
    }
    resize();

    /* Observamos cambios de tamaño (cuando el contenido crece) */
    if (window.ResizeObserver) {
        new ResizeObserver(resize).observe(section);
    }
    window.addEventListener('resize', resize);

    let lastTs = null;
    function loop(ts) {
        if (!lastTs) lastTs = ts;
        time += (ts - lastTs) / 1000;
        lastTs = ts;

        /*
          La línea de costa en la action-section está fija
          al 30% del alto — el mar ocupa el tercio superior,
          dando la sensación de playa con oleaje constante.
        */
        const shorelineY = H * 0.30;
        drawWaves(ctx, W, H, time, shorelineY);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
