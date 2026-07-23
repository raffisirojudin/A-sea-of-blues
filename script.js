const canvas = document.getElementById("ocean");
const ctx = canvas.getContext("2d");

let W, H, DPR, horizonY, oceanH, sandH, sandTopY;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  horizonY = H * 0.42;
  sandH = Math.min(H * 0.16, 170);
  sandTopY = H - sandH;
  oceanH = sandTopY - horizonY;
}
window.addEventListener("resize", resize);
resize();

/* ════════════════════════════════════════
   PALETTE KEYFRAMES  (r,g,b arrays)
   sunH = height of sun above horizon (0 = on horizon, 1 = high)
   sand = dry sand color, sandWet = sand color at the waterline
═══════════════════════════════════════ */
const KEYS = [
  {
    t: 0.0,
    name: "DAWN",
    skyTop: [38, 44, 86],
    skyHor: [247, 176, 128],
    sun: [255, 238, 206],
    glow: [255, 178, 120],
    wFar: [176, 150, 150],
    wNear: [34, 62, 84],
    foam: [255, 244, 234],
    sand: [225, 178, 163],
    sandWet: [130, 90, 92],
    sunH: 0.1,
    glit: 0.7,
    star: 0,
    moon: 0,
  },
  {
    t: 0.28,
    name: "MORNING",
    skyTop: [64, 134, 206],
    skyHor: [188, 222, 236],
    sun: [255, 255, 246],
    glow: [255, 250, 224],
    wFar: [120, 186, 196],
    wNear: [20, 92, 114],
    foam: [255, 255, 255],
    sand: [230, 208, 175],
    sandWet: [110, 145, 148],
    sunH: 0.55,
    glit: 0.5,
    star: 0,
    moon: 0,
  },
  {
    t: 0.5,
    name: "MIDDAY",
    skyTop: [58, 142, 214],
    skyHor: [176, 216, 230],
    sun: [255, 255, 248],
    glow: [255, 252, 232],
    wFar: [96, 178, 188],
    wNear: [16, 96, 120],
    foam: [255, 255, 255],
    sand: [238, 218, 178],
    sandWet: [95, 150, 155],
    sunH: 0.92,
    glit: 0.45,
    star: 0,
    moon: 0,
  },
  {
    t: 0.68,
    name: "GOLDEN HOUR",
    skyTop: [74, 92, 156],
    skyHor: [255, 202, 120],
    sun: [255, 236, 194],
    glow: [255, 168, 92],
    wFar: [206, 164, 118],
    wNear: [34, 78, 98],
    foam: [255, 244, 228],
    sand: [222, 168, 112],
    sandWet: [130, 88, 68],
    sunH: 0.3,
    glit: 0.95,
    star: 0,
    moon: 0,
  },
  {
    t: 0.84,
    name: "SUNSET",
    skyTop: [48, 38, 86],
    skyHor: [255, 108, 68],
    sun: [255, 206, 148],
    glow: [255, 92, 58],
    wFar: [188, 98, 84],
    wNear: [30, 42, 72],
    foam: [255, 222, 200],
    sand: [188, 110, 92],
    sandWet: [70, 48, 72],
    sunH: 0.06,
    glit: 1.0,
    star: 0.15,
    moon: 0.2,
  },
  {
    t: 1.0,
    name: "MOONLIT",
    skyTop: [8, 12, 30],
    skyHor: [34, 44, 82],
    sun: [228, 234, 255],
    glow: [140, 164, 216],
    wFar: [28, 42, 76],
    wNear: [6, 16, 32],
    foam: [196, 208, 234],
    sand: [58, 66, 92],
    sandWet: [26, 34, 58],
    sunH: 0.55,
    glit: 0.55,
    star: 1,
    moon: 1,
  },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpRGB(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function rgb(c, a = 1) {
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
}

function getPalette(t) {
  let i = 0;
  while (i < KEYS.length - 1 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i],
    b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const span = b.t - a.t || 1;
  const k = Math.max(0, Math.min(1, (t - a.t) / span));
  return {
    name: k < 0.5 ? a.name : b.name,
    skyTop: lerpRGB(a.skyTop, b.skyTop, k),
    skyHor: lerpRGB(a.skyHor, b.skyHor, k),
    sun: lerpRGB(a.sun, b.sun, k),
    glow: lerpRGB(a.glow, b.glow, k),
    wFar: lerpRGB(a.wFar, b.wFar, k),
    wNear: lerpRGB(a.wNear, b.wNear, k),
    foam: lerpRGB(a.foam, b.foam, k),
    sand: lerpRGB(a.sand, b.sand, k),
    sandWet: lerpRGB(a.sandWet, b.sandWet, k),
    sunH: lerp(a.sunH, b.sunH, k),
    glit: lerp(a.glit, b.glit, k),
    star: lerp(a.star, b.star, k),
    moon: lerp(a.moon, b.moon, k),
  };
}

/* ════════════════════════════════════════
   STATIC ELEMENTS
═══════════════════════════════════════ */
const stars = Array.from({ length: 140 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.4,
  r: Math.random() * 1.2 + 0.3,
  tw: Math.random() * Math.PI * 2,
}));

const clouds = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random(),
  y: 0.08 + Math.random() * 0.18,
  w: 0.18 + Math.random() * 0.22,
  speed: 0.000015 + Math.random() * 0.00002,
}));

const birds = Array.from({ length: 4 }, () => ({
  x: Math.random(),
  y: 0.15 + Math.random() * 0.18,
  speed: 0.00004 + Math.random() * 0.00004,
  size: 8 + Math.random() * 6,
  flap: Math.random() * Math.PI * 2,
}));

const sandGrains = Array.from({ length: 260 }, () => ({
  x: Math.random(),
  y: Math.random(),
  s: Math.random() * 1.5 + 0.4,
}));

const palmFronds = [-165, -136, -108, -80, -52, -24, 5, 32].map((deg) => ({
  deg,
  len: 80 + Math.random() * 26,
  droop: 16 + Math.random() * 24,
  width: 0.16 + Math.random() * 0.05,
}));

/* pre-baked noise tile, reused every frame as a repeating pattern
   (cheap: no per-pixel work in the render loop) */
const grainCanvas = document.createElement("canvas");
grainCanvas.width = 128;
grainCanvas.height = 128;
(function bakeGrain() {
  const gctx = grainCanvas.getContext("2d");
  const img = gctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  gctx.putImageData(img, 0, 0);
})();
const grainPattern = ctx.createPattern(grainCanvas, "repeat");

/* crater positions as fractions of the disc radius (x,y from center, r size) */
const moonCraters = [
  { x: -0.38, y: -0.22, r: 0.16 },
  { x: 0.3, y: -0.34, r: 0.11 },
  { x: 0.06, y: 0.14, r: 0.21 },
  { x: -0.2, y: 0.36, r: 0.09 },
  { x: 0.4, y: 0.1, r: 0.13 },
  { x: -0.02, y: -0.4, r: 0.08 },
];

/* ════════════════════════════════════════
   INPUT
═══════════════════════════════════════ */
let timeOfDay = 0.6;
let mouseX = 0.5;

const slider = document.getElementById("time");
const playBtn = document.getElementById("playBtn");

/* auto-play: sweeps timeOfDay 0 → 1 → 0 so the mood glides
   through the whole day without needing to drag the slider */
let autoPlay = false;
let autoDir = 1; // 1 = toward night, -1 = toward dawn
const AUTO_CYCLE_SECONDS = 60; // seconds for one dawn→moonlit sweep

function setAutoPlay(on) {
  autoPlay = on;
  playBtn.textContent = autoPlay ? "❚❚" : "▶";
  playBtn.setAttribute("aria-pressed", String(autoPlay));
  playBtn.setAttribute(
    "aria-label",
    autoPlay ? "Pause automatic time-lapse" : "Play automatic time-lapse",
  );
}

playBtn.addEventListener("click", () => setAutoPlay(!autoPlay));

slider.addEventListener("input", () => {
  timeOfDay = slider.value / 1000;
  if (autoPlay) setAutoPlay(false); // hand control back once the user grabs it
});
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX / W;
});
window.addEventListener(
  "touchmove",
  (e) => {
    mouseX = e.touches[0].clientX / W;
  },
  { passive: true },
);

const moodName = document.getElementById("mood-name");
const moodTime = document.getElementById("mood-time");

/* ════════════════════════════════════════
   RIPPLES — tap/click the water to disturb it
═══════════════════════════════════════ */
let ripples = [];
const MAX_RIPPLES = 30;

function spawnRipple(x, y) {
  const depth = Math.max(0, Math.min(1, (y - horizonY) / oceanH));
  if (ripples.length >= MAX_RIPPLES) ripples.shift(); // drop the oldest
  ripples.push({
    x,
    y,
    r: 1,
    maxR: lerp(16, 100, depth), // ripples near the shore grow bigger
    speed: lerp(20, 78, depth), // and expand faster than distant ones
    age: 0,
    life: lerp(1.1, 1.9, depth),
  });
}

canvas.addEventListener("pointerdown", (e) => {
  if (e.clientY > horizonY && e.clientY < sandTopY) {
    spawnRipple(e.clientX, e.clientY);
  }
});

function updateAndDrawRipples(P, dt) {
  ripples.forEach((rp) => {
    rp.age += dt;
    rp.r = Math.min(rp.maxR, rp.r + rp.speed * dt);
  });
  ripples = ripples.filter((rp) => rp.age < rp.life);

  ripples.forEach((rp) => {
    const t = rp.age / rp.life;
    const fade = Math.max(0, 1 - t);
    if (fade < 0.02) return;

    ctx.beginPath();
    ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.34, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(P.foam, fade * 0.55);
    ctx.lineWidth = lerp(2.2, 0.5, t);
    ctx.stroke();

    if (rp.r > 8) {
      ctx.beginPath();
      ctx.ellipse(
        rp.x,
        rp.y,
        rp.r * 0.6,
        rp.r * 0.6 * 0.34,
        0,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = rgb(P.foam, fade * 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

/* ════════════════════════════════════════
   SHOOTING STARS — rare, only once it's dark enough
═══════════════════════════════════════ */
let shootingStars = [];

function maybeSpawnShootingStar(P, dt) {
  if (P.star < 0.5) return; // sky isn't dark enough yet
  const chancePerSecond = 0.18; // roughly one every ~5-6s once it's dark
  if (Math.random() < chancePerSecond * dt) {
    const startX = W * (0.1 + Math.random() * 0.6);
    const startY = horizonY * (0.05 + Math.random() * 0.3);
    const angle = ((20 + Math.random() * 25) * Math.PI) / 180;
    const speed = 850 + Math.random() * 400;
    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 55 + Math.random() * 45,
      age: 0,
      life: 0.5 + Math.random() * 0.25,
    });
  }
}

function updateAndDrawShootingStars(P, dt) {
  shootingStars.forEach((s) => {
    s.age += dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
  });
  shootingStars = shootingStars.filter((s) => s.age < s.life);

  shootingStars.forEach((s) => {
    const t = s.age / s.life;
    const alpha = Math.min(1, t * 5) * (1 - t) * P.star;
    if (alpha <= 0.01) return;
    const mag = Math.hypot(s.vx, s.vy) || 1;
    const tailX = s.x - (s.vx / mag) * s.len;
    const tailY = s.y - (s.vy / mag) * s.len;
    const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  });
}

/* ════════════════════════════════════════
   BEACH — sand, tide wash, silhouettes
═══════════════════════════════════════ */
function drawCelestialBody(P, x, y, r) {
  /* base disc — same warm-to-cool gradient the palette already drives */
  const sd = ctx.createRadialGradient(x, y, 0, x, y, r);
  sd.addColorStop(0, rgb(P.sun, 1));
  sd.addColorStop(0.7, rgb(P.sun, 0.95));
  sd.addColorStop(1, rgb(P.sun, 0.2));
  ctx.fillStyle = sd;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  /* fade in craters + soft terminator shading as it turns into a moon */
  if (P.moon > 0.02) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    const craterCol = lerpRGB(P.sun, [30, 40, 70], 0.55);
    moonCraters.forEach((c) => {
      ctx.beginPath();
      ctx.arc(x + c.x * r * 2, y + c.y * r * 2, c.r * r * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = rgb(craterCol, P.moon * 0.22);
      ctx.fill();
    });

    const shade = ctx.createRadialGradient(
      x - r * 0.3,
      y - r * 0.3,
      0,
      x,
      y,
      r,
    );
    shade.addColorStop(0, rgb([255, 255, 255], 0));
    shade.addColorStop(1, rgb([16, 22, 46], P.moon * 0.2));
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawSand(P, sunX) {
  /* base gradient: wet at the waterline → dry further down */
  const g = ctx.createLinearGradient(0, sandTopY, 0, H);
  g.addColorStop(0, rgb(P.sandWet));
  g.addColorStop(0.4, rgb(lerpRGB(P.sandWet, P.sand, 0.7)));
  g.addColorStop(1, rgb(P.sand));
  ctx.fillStyle = g;
  ctx.fillRect(0, sandTopY, W, sandH + 2);

  /* glossy reflection of the sun/moon on the wet sand */
  const streak = ctx.createRadialGradient(
    sunX,
    sandTopY,
    0,
    sunX,
    sandTopY,
    W * 0.28,
  );
  streak.addColorStop(0, rgb(P.glow, 0.3));
  streak.addColorStop(1, rgb(P.glow, 0));
  ctx.fillStyle = streak;
  ctx.fillRect(0, sandTopY, W, sandH * 0.55);

  /* subtle grain texture */
  ctx.fillStyle = rgb(lerpRGB(P.sand, [0, 0, 0], 0.2), 0.22);
  sandGrains.forEach((sgr) => {
    ctx.fillRect(sgr.x * W, sandTopY + sgr.y * sandH, sgr.s, sgr.s);
  });
}

function drawShoreline(P) {
  /* layered wavy foam lines that surge up the sand and retreat */
  for (let i = 0; i < 3; i++) {
    const phase = T * 0.35 + i * 2.1;
    const reach = Math.sin(phase) * 0.5 + 0.5;
    const y = sandTopY - reach * sandH * 0.5 + i * 3;
    const alpha = (0.22 + reach * 0.3) * (1 - i * 0.28);

    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const yy = y + Math.sin(x / 60 + phase * 2) * 3;
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = rgb(P.foam, alpha);
    ctx.lineWidth = 2.4 - i * 0.6;
    ctx.stroke();

    const fg = ctx.createLinearGradient(0, y, 0, y + 16);
    fg.addColorStop(0, rgb(P.foam, alpha * 0.55));
    fg.addColorStop(1, rgb(P.foam, 0));
    ctx.fillStyle = fg;
    ctx.fillRect(0, y, W, 16);
  }
}

function drawPalmTree(x, baseY, scale, sway, col) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);

  /* trunk, leaning slightly with the wind — a bit thicker at the base */
  ctx.beginPath();
  ctx.moveTo(-7, 4);
  ctx.bezierCurveTo(-18, -55, 4 + sway * 6, -108, 24 + sway * 15, -150);
  ctx.lineTo(33 + sway * 15, -148);
  ctx.bezierCurveTo(13 + sway * 6, -104, -1, -52, 6, 4);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();

  /* fronds fanning out from the crown — wide tapered blades, not slivers,
     each drooping down at the tip like a real palm leaf */
  const tipX = 24 + sway * 15,
    tipY = -150;
  palmFronds.forEach((f) => {
    const rad = ((f.deg + sway * 9) * Math.PI) / 180;
    const dx = Math.cos(rad),
      dy = Math.sin(rad);
    const px = -dy,
      py = dx; // perpendicular, for blade width
    const len = f.len;
    const w = len * f.width;

    const endX = tipX + dx * len;
    const endY = tipY + dy * len * 0.7 + f.droop;

    /* bulge point sits a bit past the middle, offset sideways by the
       perpendicular so the blade reads as a solid leaf, not a hairline */
    const midX = tipX + dx * len * 0.55;
    const midY = tipY + dy * len * 0.4 - f.droop * 0.15;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(midX + px * w, midY + py * w, endX, endY);
    ctx.quadraticCurveTo(midX - px * w, midY - py * w, tipX, tipY);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  });

  ctx.restore();
}

function drawRock(x, baseY, w, h, col) {
  ctx.beginPath();
  ctx.moveTo(x - w / 2, baseY);
  ctx.bezierCurveTo(
    x - w / 2,
    baseY - h * 0.85,
    x - w * 0.1,
    baseY - h * 1.1,
    x + w * 0.05,
    baseY - h,
  );
  ctx.bezierCurveTo(
    x + w * 0.3,
    baseY - h * 0.95,
    x + w / 2,
    baseY - h * 0.55,
    x + w / 2,
    baseY,
  );
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

/* ════════════════════════════════════════
   RENDER
═══════════════════════════════════════ */
let T = 0;
let lastFrameMs = performance.now();

function draw() {
  const nowMs = performance.now();
  const dt = Math.min((nowMs - lastFrameMs) / 1000, 0.05); // seconds, clamped
  lastFrameMs = nowMs;

  T += 0.016;

  if (autoPlay) {
    timeOfDay += (dt / AUTO_CYCLE_SECONDS) * autoDir;
    if (timeOfDay >= 1) {
      timeOfDay = 1;
      autoDir = -1;
    } else if (timeOfDay <= 0) {
      timeOfDay = 0;
      autoDir = 1;
    }
    slider.value = Math.round(timeOfDay * 1000);
  }

  const P = getPalette(timeOfDay);

  /* sun position */
  const sunX = W * (0.5 + (mouseX - 0.5) * 0.25);
  const sunY = horizonY - P.sunH * horizonY * 0.82;

  /* ── SKY ── */
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY + oceanH * 0.1);
  sky.addColorStop(0, rgb(P.skyTop));
  sky.addColorStop(0.7, rgb(lerpRGB(P.skyTop, P.skyHor, 0.55)));
  sky.addColorStop(1, rgb(P.skyHor));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizonY + 2);

  /* ── STARS ── */
  if (P.star > 0.01) {
    stars.forEach((s) => {
      const tw = 0.5 + 0.5 * Math.sin(T * 2 + s.tw);
      ctx.fillStyle = rgb([255, 255, 255], P.star * tw * 0.9);
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * horizonY, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    maybeSpawnShootingStar(P, dt);
    updateAndDrawShootingStars(P, dt);
  }

  /* ── SUN GLOW ── */
  const glowR = Math.min(W, H) * 0.5;
  const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
  g.addColorStop(0, rgb(P.glow, 0.55));
  g.addColorStop(0.25, rgb(P.glow, 0.22));
  g.addColorStop(1, rgb(P.glow, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizonY + oceanH * 0.4);

  /* ── SUN / MOON DISC ── */
  const sunR = Math.min(W, H) * 0.045;
  drawCelestialBody(P, sunX, sunY, sunR);

  /* ── CLOUDS ── */
  clouds.forEach((c) => {
    c.x += c.speed;
    if (c.x > 1.3) c.x = -0.3;
    const cx = c.x * W,
      cy = c.y * horizonY,
      cw = c.w * W;
    ctx.fillStyle = rgb(lerpRGB(P.skyHor, [255, 255, 255], 0.25), 0.16);
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.ellipse(
        cx + j * cw * 0.22,
        cy + Math.sin(j) * 6,
        cw * (0.3 - j * 0.04),
        cw * 0.06,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  });

  /* ── BIRDS ── */
  birds.forEach((b) => {
    b.x += b.speed;
    b.flap += 0.15;
    if (b.x > 1.2) {
      b.x = -0.2;
      b.y = 0.15 + Math.random() * 0.18;
    }
    const bx = b.x * W,
      by = b.y * horizonY;
    const wing = Math.sin(b.flap) * b.size * 0.5;
    ctx.strokeStyle = rgb(lerpRGB(P.skyTop, [0, 0, 0], 0.3), 0.5);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - b.size, by + wing);
    ctx.quadraticCurveTo(bx, by - b.size * 0.3, bx, by);
    ctx.quadraticCurveTo(bx, by - b.size * 0.3, bx + b.size, by + wing);
    ctx.stroke();
  });

  /* ── ATMOSPHERIC HAZE AT HORIZON ── */
  const haze = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40);
  haze.addColorStop(0, rgb(P.skyHor, 0));
  haze.addColorStop(0.5, rgb(P.skyHor, 0.45));
  haze.addColorStop(1, rgb(P.wFar, 0));
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizonY - 40, W, 80);

  /* ── OCEAN SWELLS (back → front, stop at the shoreline) ── */
  const NUM = 26;
  for (let i = 0; i < NUM; i++) {
    const depth = i / (NUM - 1); // 0 horizon → 1 shoreline
    const yTop = horizonY + Math.pow(depth, 1.9) * oceanH;
    const amp = lerp(0.6, 30, depth);
    const wlen = lerp(46, 340, depth);
    const speed = lerp(0.25, 0.9, depth);
    const phase = T * speed + i * 0.9;
    const col = lerpRGB(P.wFar, P.wNear, depth);

    /* band fill */
    ctx.beginPath();
    ctx.moveTo(0, sandTopY);
    ctx.lineTo(0, yTop + Math.sin(phase) * amp);
    for (let x = 0; x <= W; x += 6) {
      const y =
        yTop +
        Math.sin(x / wlen + phase) * amp +
        Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, sandTopY);
    ctx.closePath();
    ctx.fillStyle = rgb(col);
    ctx.fill();

    /* crest highlight — brighter near the sun column */
    ctx.lineWidth = lerp(0.6, 2.2, depth);
    ctx.beginPath();
    let started = false;
    for (let x = 0; x <= W; x += 6) {
      const y =
        yTop +
        Math.sin(x / wlen + phase) * amp +
        Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;
      started ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), (started = true));
    }
    ctx.strokeStyle = rgb(lerpRGB(col, P.sun, 0.55), lerp(0.05, 0.3, depth));
    ctx.stroke();

    /* foam on the front swells */
    if (depth > 0.62) {
      const foamA = (depth - 0.62) / 0.38;
      for (let x = 0; x <= W; x += 9) {
        const y =
          yTop +
          Math.sin(x / wlen + phase) * amp +
          Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;
        const crest = Math.sin(x / wlen + phase);
        if (crest > 0.55 && Math.random() > 0.45) {
          ctx.fillStyle = rgb(P.foam, foamA * (0.18 + Math.random() * 0.35));
          ctx.fillRect(
            x + (Math.random() - 0.5) * 6,
            y - Math.random() * 3,
            1.5 + Math.random() * 3,
            1.5 + Math.random() * 2,
          );
        }
      }
    }
  }

  /* ── RIPPLES from clicks/taps ── */
  updateAndDrawRipples(P, dt);

  /* ── SUN / MOON GLITTER PATH — narrower & smaller once it's moonlight ── */
  const glitterNarrow = lerp(1, 0.42, P.moon);
  const glitterCount = 220;
  for (let i = 0; i < glitterCount; i++) {
    const dy = Math.random();
    const y = horizonY + Math.pow(dy, 1.5) * oceanH;
    const spread = lerp(6, W * 0.3, dy) * glitterNarrow;
    const x = sunX + (Math.random() - 0.5) * 2 * spread;
    const distFade = 1 - Math.min(1, Math.abs(x - sunX) / (spread + 1));
    const flick = 0.25 + Math.random() * 0.75;
    const a = distFade * distFade * flick * P.glit * (1 - dy * 0.25);
    if (a < 0.02) continue;
    ctx.fillStyle = rgb(P.sun, a * 0.85);
    const len = (1 + Math.random() * (2 + dy * 4)) * lerp(1, 0.55, P.moon);
    ctx.fillRect(x, y, len, 1 + dy);
  }

  /* ── BEACH: sand, tide wash, silhouettes ── */
  drawSand(P, sunX);
  drawShoreline(P);
  const silCol = rgb(lerpRGB(P.wNear, [0, 0, 0], 0.55));
  const sway = Math.sin(T * 0.4) * 0.5;
  drawPalmTree(
    W * 0.07,
    H - sandH * 0.1,
    Math.min(3.5, H / 260, W / 260),
    sway,
    silCol,
  );
  drawRock(W * 0.87, H - sandH * 0.12, 46, 30, silCol);
  drawRock(W * 0.92, H - sandH * 0.06, 28, 18, silCol);

  /* ── VIGNETTE ── */
  const vig = ctx.createRadialGradient(
    W / 2,
    H * 0.55,
    H * 0.25,
    W / 2,
    H * 0.55,
    H * 0.9,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,8,0.34)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  /* ── FILM GRAIN — subtle, shifts each frame so it doesn't look static ── */
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.globalCompositeOperation = "overlay";
  const gx = (Math.random() - 0.5) * 128;
  const gy = (Math.random() - 0.5) * 128;
  ctx.translate(gx, gy);
  ctx.fillStyle = grainPattern;
  ctx.fillRect(-gx, -gy, W + 128, H + 128);
  ctx.restore();

  /* ── UI TEXT ── */
  moodName.textContent = P.name;
  const hours = 5 + timeOfDay * 18; // 05:00 → 23:00
  const hh = Math.floor(hours) % 24;
  const mm = Math.floor((hours % 1) * 60);
  moodTime.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(
    2,
    "0",
  )}`;

  requestAnimationFrame(draw);
}
draw();
