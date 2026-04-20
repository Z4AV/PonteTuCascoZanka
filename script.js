/* ============================================================
   PONTE TU CASCO ZANKA — script.js
   ✅ = código original intacto
   🌊 = motor de olas (reescrito para subir desde abajo)
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
   🌊 PARTE 2 — MOTOR DE OLAS (ola invertida, sube desde abajo)

   CONCEPTO NUEVO respecto a la versión anterior:

   Antes: el mar cubría desde ARRIBA hacia abajo (shorelineY bajaba).
   Ahora: el mar sube desde ABAJO hacia arriba (como una ola real
          que llega a la orilla y se trepa por la pantalla).

   La función drawWavesInverted() dibuja el cuerpo del océano
   desde shorelineY hasta el FONDO del canvas (H), no hasta 0.

   ┌─────────────────┐  ← y = 0 (tope del canvas)
   │   fondo arena   │
   │   (naranja)     │
   ├~~~~~~~~~~~~~~~~~┤  ← shorelineY  (la ola oscila aquí)
   │                 │
   │   OCÉANO        │  el mar rellena de shorelineY → H
   │                 │
   └─────────────────┘  ← y = H (fondo del canvas)

   Cuando el usuario llega a la action-section con el scroll,
   shorelineY baja (el mar "sube" visualmente cubriendo más).
   ============================================================ */


/* ── Colores compartidos ── */
const COLORS = {
    oceanDeep: [10, 60, 120],
    oceanMid: [20, 130, 190],
    oceanShallow: [58, 181, 200],
};

function rgb(c, alpha) {
    return alpha !== undefined
        ? `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
        : `rgb(${c[0]},${c[1]},${c[2]})`;
}


/* ============================================================
   🌊 HELPER: drawWavesInverted(ctx, W, H, time, shorelineY)

   DIFERENCIA CLAVE con la versión anterior:
   - El océano se dibuja de shorelineY → H  (no de 0 → shorelineY)
   - El gradiente va de abajo (profundo) a arriba (orilla)
   - Las olas oscilan EN shorelineY, que baja cuando el usuario
     hace scroll → el mar "sube" cubriendo más pantalla

   shorelineY = H   → el mar está completamente fuera (abajo)
   shorelineY = H*0.5 → el mar cubre la mitad inferior
   shorelineY = 0   → el mar cubre toda la pantalla
   ============================================================ */
function drawWavesInverted(ctx, W, H, time, shorelineY) {
    ctx.clearRect(0, 0, W, H);

    /* Si la orilla está en el fondo o más abajo, no hay nada que dibujar */
    if (shorelineY >= H) return;

    /*
      waveY(x, layer):
      Devuelve la coordenada Y de la superficie del mar en la posición X.
      Suma dos ondas sinusoidales con frecuencias y velocidades distintas
      para dar movimiento orgánico. Es exactamente lo mismo que antes,
      pero ahora esta línea es el TOPE del mar (no el tope del vacío).
    */
    function waveY(x, layer) {
        const freq1 = 0.009 + layer * 0.002;
        const freq2 = 0.017 + layer * 0.003;
        const amp1 = 14 - layer * 3;
        const amp2 = 7 - layer * 1.5;
        const dir = layer % 2 === 0 ? 1 : -0.8;
        return shorelineY
            + Math.sin(x * freq1 + time * dir) * amp1
            + Math.sin(x * freq2 - time * 1.4) * amp2;
    }

    /* ── Cuerpo del océano: va de la ola (arriba) al fondo (H) ── */
    ctx.beginPath();
    ctx.moveTo(0, waveY(0, 0));
    for (let x = 0; x <= W; x += 4) {
        ctx.lineTo(x, waveY(x, 0));
    }
    /* Cierro el path bajando al fondo del canvas */
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    /*
      Gradiente INVERTIDO respecto a la versión anterior:
      - Arriba (shorelineY): color de orilla turquesa
      - Abajo (H):           color de profundidad azul oscuro
      Esto simula que el fondo del mar está abajo y la orilla arriba.
    */
    const oceanGrad = ctx.createLinearGradient(0, shorelineY, 0, H);
    oceanGrad.addColorStop(0, rgb(COLORS.oceanShallow, 0.92));
    oceanGrad.addColorStop(0.5, rgb(COLORS.oceanMid, 0.95));
    oceanGrad.addColorStop(1, rgb(COLORS.oceanDeep, 0.98));
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    /* ── Capas de espuma (3 olas escalonadas hacia ARRIBA) ── */
    /*
      En la versión original la espuma iba con offset positivo (hacia abajo).
      Ahora el offset es NEGATIVO para que las olas de espuma queden
      encima de la ola principal (más arriba en Y = más cerca del tope).
    */
    for (let layer = 0; layer < 3; layer++) {
        const offset = -(layer * 18);       /* 🌊 negativo = sube */
        const opacity = 0.65 - layer * 0.18;
        const thickness = 12 - layer * 3;

        ctx.beginPath();
        ctx.moveTo(0, waveY(0, layer) + offset);
        for (let x = 0; x <= W; x += 4) {
            ctx.lineTo(x, waveY(x, layer) + offset);
        }
        /* La espuma rellena hacia ABAJO (hasta shorelineY + un poco) */
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
        const sx = (Math.sin(i * 137.5 + time * 0.25) * 0.5 + 0.5) * W;
        /* Los destellos ahora están en la zona del OCÉANO (de shorelineY a H) */
        const sy = shorelineY + (Math.cos(i * 97.3 + time * 0.18) * 0.5 + 0.5) * (H - shorelineY);
        const sr = 1.5 + Math.sin(i + time * 1.5) * 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    ctx.restore();
}


/* ============================================================
   🌊 CANVAS — Olas en .action-section
   
   CÓMO CALCULA LA POSICIÓN:
   Usamos getBoundingClientRect() en cada scroll para saber
   dónde está la section en el viewport.

   Cuando la section empieza a entrar por la parte INFERIOR
   del viewport (rect.bottom == vh), el mar empieza a aparecer
   (shorelineY = H, el mar está justo fuera del canvas).

   Conforme el usuario baja y la section sube en pantalla,
   shorelineY disminuye → el mar "sube" cubriendo más área.

   La ola llega a su máximo (shorelineY = H * 0.25, cubriendo
   el 75% inferior) cuando la section está centrada en pantalla.
   ============================================================ */
(function initActionWave() {
    const section = document.querySelector('.action-section');
    const canvas = document.getElementById('action-wave-canvas');
    const ctx = canvas.getContext('2d');

    let W, H, time = 0, shorelineY = 9999;

    /* Ajusta el tamaño del canvas al tamaño real de la section */
    function resize() {
        W = canvas.width = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
    }
    resize();
    if (window.ResizeObserver) {
        new ResizeObserver(resize).observe(section);
    }
    window.addEventListener('resize', resize);

    /*
      updateShorelineY():
      Lee la posición de la section en el viewport y calcula
      hasta dónde debe subir el mar.
  
      rect.top  = distancia del tope de la section al tope del viewport
                  (negativo cuando ya subiste más allá del inicio)
      rect.bottom = distancia del fondo de la section al tope del viewport
  
      Progreso 0: la section recién entró por abajo (rect.top == vh)
      Progreso 1: la section está completamente visible o más arriba
    */
    function updateShorelineY() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;

        /*
          ¿Cuánto de la section ya pasó hacia arriba?
          - Cuando rect.top == vh → progress = 0 (acaba de entrar)
          - Cuando rect.top == 0  → progress = 1 (el tope ya está en pantalla)
          Usamos rect.top para que la animación inicie ANTES de ver la section.
        */
        const progress = Math.max(0, Math.min(1,
            1 - (rect.top / vh)
        ));

        /*
          Mapeamos progress (0→1) a shorelineY (H → H*0.20):
          - progress 0 → shorelineY = H      (mar fuera, solo arena)
          - progress 1 → shorelineY = H*0.20 (mar cubre 80% de la section)
    
          H*0.20 deja un 20% de "arena" arriba visible — justo debajo
          del botón REGISTRARSE — para que la sección no quede 100% azul.
        */
        shorelineY = H - (progress * H * 0.80);
    }

    window.addEventListener('scroll', updateShorelineY, { passive: true });
    updateShorelineY(); /* corre una vez al cargar */

    /* Loop de animación a ~60fps */
    let lastTs = null;
    function loop(ts) {
        if (!lastTs) lastTs = ts;
        time += (ts - lastTs) / 1000;
        lastTs = ts;

        drawWavesInverted(ctx, W, H, time, shorelineY);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();