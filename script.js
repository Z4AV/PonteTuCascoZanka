/* ============================================================
   PONTE TU CASCO ZANKA — script.js v4
   ✅ = sin cambios
   🔧 = bug fix
   🌊 = motor de olas (sin cambios)
   ============================================================ */

const video = document.getElementById('v-casco');

function isMobile() {
    return (
        navigator.maxTouchPoints > 1 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
}

if (isMobile()) {
    /* ── MODO MÓVIL ──────────────────────────────────────────
       🔧 BUG FIX: Video cortado a 7s
       Causa: play() se llamaba antes de que el buffer estuviera
       listo. En redes lentas o con datos móviles, el navegador
       solo pre-carga una fracción del video.
       Fix: esperamos canplaythrough → garantiza que el browser
       tiene suficiente buffer para reproducir SIN interrupciones.
       Si el video ya está listo (cached), canplaythrough dispara
       inmediatamente.
    ─────────────────────────────────────────────────────────── */
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    function startMobilePlay() {
        video.play().catch(() => {
            /* Fallback: espera primer toque si autoplay sigue bloqueado */
            const tryPlay = () => {
                video.play().catch(() => { });
                window.removeEventListener('touchstart', tryPlay);
            };
            window.addEventListener('touchstart', tryPlay, { once: true });
        });
    }

    if (video.readyState >= 4) {
        /* readyState 4 = HAVE_ENOUGH_DATA — ya está listo, arranca ya */
        startMobilePlay();
    } else {
        /* Espera a que haya suficiente buffer cargado */
        video.addEventListener('canplaythrough', startMobilePlay, { once: true });
        /* Forzamos la carga aunque el navegador hubiera diferido */
        video.load();
    }

} else {
    /* ── MODO DESKTOP ────────────────────────────────────────
       🔧 BUG FIX: Video se auto-reproducía Y el scroll intentaba
       hacer scrubbing al mismo tiempo → el video se trababa.
       Causa: el atributo `autoplay` en el HTML arrancaba el video
       antes de que el JS pudiera controlarlo.
       Fix: pausamos y reseteamos el video inmediatamente en JS.
       El scroll es el único que controla currentTime.
    ─────────────────────────────────────────────────────────── */
    video.pause();
    video.currentTime = 0;
    /* Quitamos autoplay para que no interfiera */
    video.removeAttribute('autoplay');

    function controlVideo() {
        const scrollPos = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = scrollPos / maxScroll;
        if (video.duration) {
            video.currentTime = video.duration * Math.min(progress, 0.99);
        }
    }
    window.addEventListener('scroll', controlVideo);
}

/* ✅ Botón — intacto */
document.querySelector('.btn-main-register').addEventListener('click', () => {
    alert("Iniciando registro #PonteTuCascoZanka");
});


/* ============================================================
   🌊 MOTOR DE OLAS — sin cambios respecto a v3
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