/* ============================================================
   PONTE TU CASCO ZANKA — script.js v5
   ✅ = sin cambios
   🔧 = fix
   🌊 = olas (sin cambios)
   ============================================================ */

const video = document.getElementById('v-casco');

function isMobile() {
    return (
        navigator.maxTouchPoints > 1 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
}

if (isMobile()) {
    /* ── MÓVIL: loop completo ── */
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    function startMobilePlay() {
        video.play().catch(() => {
            const tryPlay = () => {
                video.play().catch(() => { });
                window.removeEventListener('touchstart', tryPlay);
            };
            window.addEventListener('touchstart', tryPlay, { once: true });
        });
    }

    if (video.readyState >= 4) {
        startMobilePlay();
    } else {
        video.addEventListener('canplaythrough', startMobilePlay, { once: true });
        video.load();
    }

} else {
    /* ── DESKTOP: scrubbing ──────────────────────────────────
       🔧 BUG FIX: El video no se veía completo porque el progreso
       se calculaba sobre TODA la página (incluyendo la action-section
       y todo lo que hay después). Eso significa que cuando el usuario
       llegaba al final del segundo spacer, el scroll solo iba al 50%
       del total → el video solo avanzaba hasta la mitad.
  
       SOLUCIÓN: limitamos el rango del scrubbing al área de los
       spacers únicamente. El video avanza de 0% a 100% exactamente
       mientras el usuario scrollea por los 2 spacers (2 × 100vh).
       Cuando pasa de ahí, el video se queda en el último frame.
  
       Cómo funciona:
       - scrollStart = donde termina la nav/marquesina (≈ 0)
       - scrollEnd   = top del primer spacer + altura de los 2 spacers
                     = 2 × window.innerHeight
       - progress    = (scrollPos - scrollStart) / (scrollEnd - scrollStart)
                     clampado a [0, 0.99]
    ─────────────────────────────────────────────────────────── */
    video.pause();
    video.currentTime = 0;
    video.removeAttribute('autoplay');

    function controlVideo() {
        /* Altura total de los spacers: 2 secciones × 100vh */
        const spacerHeight = window.innerHeight * 2;

        /*
          scrollPos relativo al inicio de los spacers.
          Los spacers empiezan justo después de la nav (~0px de scroll),
          así que usamos pageYOffset directamente como punto de partida.
        */
        const scrollPos = window.pageYOffset;
        const progress = scrollPos / spacerHeight;  /* 0 → 1 durante los 2 spacers */

        if (video.duration) {
            video.currentTime = video.duration * Math.min(Math.max(progress, 0), 0.99);
        }
    }

    window.addEventListener('scroll', controlVideo);
}

/* ✅ Botón — intacto */
document.querySelector('.btn-main-register').addEventListener('click', () => {
    alert("Iniciando registro #PonteTuCascoZanka");
});


/* ============================================================
   🌊 MOTOR DE OLAS — sin cambios
   ============================================================ */

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

function drawWavesInverted(ctx, W, H, time, shorelineY) {
    ctx.clearRect(0, 0, W, H);
    if (shorelineY >= H) return;

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

    ctx.beginPath();
    ctx.moveTo(0, waveY(0, 0));
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, waveY(x, 0));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    const oceanGrad = ctx.createLinearGradient(0, shorelineY, 0, H);
    oceanGrad.addColorStop(0, rgb(COLORS.oceanShallow, 0.92));
    oceanGrad.addColorStop(0.5, rgb(COLORS.oceanMid, 0.95));
    oceanGrad.addColorStop(1, rgb(COLORS.oceanDeep, 0.98));
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    for (let layer = 0; layer < 3; layer++) {
        const offset = -(layer * 18);
        const opacity = 0.65 - layer * 0.18;
        const thickness = 12 - layer * 3;
        ctx.beginPath();
        ctx.moveTo(0, waveY(0, layer) + offset);
        for (let x = 0; x <= W; x += 4) ctx.lineTo(x, waveY(x, layer) + offset);
        ctx.lineTo(W, waveY(W, layer) + offset + thickness);
        for (let x = W; x >= 0; x -= 4) ctx.lineTo(x, waveY(x, layer) + offset + thickness);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
    }

    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 30; i++) {
        const sx = (Math.sin(i * 137.5 + time * 0.25) * 0.5 + 0.5) * W;
        const sy = shorelineY + (Math.cos(i * 97.3 + time * 0.18) * 0.5 + 0.5) * (H - shorelineY);
        const sr = 1.5 + Math.sin(i + time * 1.5) * 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    ctx.restore();
}

(function initActionWave() {
    const section = document.querySelector('.action-section');
    const canvas = document.getElementById('action-wave-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, time = 0, shorelineY = 9999;

    function resize() {
        W = canvas.width = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(section);
    window.addEventListener('resize', resize);

    function updateShorelineY() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / vh)));
        shorelineY = H - (progress * H * 0.80);
    }
    window.addEventListener('scroll', updateShorelineY, { passive: true });
    updateShorelineY();

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