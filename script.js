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
    ridgeFar: [138, 138, 168],
    ridgeNear: [42, 52, 68],
    duneFar: [196, 148, 132],
    duneNear: [118, 68, 56],
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
    ridgeFar: [128, 164, 180],
    ridgeNear: [38, 88, 76],
    duneFar: [222, 184, 142],
    duneNear: [168, 112, 74],
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
    ridgeFar: [134, 172, 186],
    ridgeNear: [34, 92, 70],
    duneFar: [230, 200, 156],
    duneNear: [190, 146, 96],
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
    ridgeFar: [198, 166, 144],
    ridgeNear: [66, 58, 52],
    duneFar: [212, 140, 90],
    duneNear: [150, 80, 50],
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
    ridgeFar: [164, 112, 118],
    ridgeNear: [48, 36, 54],
    duneFar: [162, 92, 96],
    duneNear: [92, 52, 62],
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
    ridgeFar: [52, 62, 94],
    ridgeNear: [13, 17, 30],
    duneFar: [70, 76, 102],
    duneNear: [34, 38, 58],
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
    ridgeFar: lerpRGB(a.ridgeFar, b.ridgeFar, k),
    ridgeNear: lerpRGB(a.ridgeNear, b.ridgeNear, k),
    duneFar: lerpRGB(a.duneFar, b.duneFar, k),
    duneNear: lerpRGB(a.duneNear, b.duneNear, k),
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

/* two recognizable (simplified, not astronomically exact) constellation
   patterns, placed once in fixed sky positions. Local point coords are
   0..1 within the constellation's own box, mapped onto the sky at
   render time via originX/Y + scale, same fractional system as stars */
const CONSTELLATIONS = [
  {
    // Big Dipper — bowl + curved handle
    originX: 0.1,
    originY: 0.06,
    scale: 0.22,
    stars: [
      [0, 0.62],
      [0.16, 0.5],
      [0.32, 0.44],
      [0.47, 0.34],
      [0.66, 0.4],
      [0.72, 0.14],
      [0.46, 0.1],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
  {
    // Orion — shoulders, belt, feet
    originX: 0.66,
    originY: 0.03,
    scale: 0.2,
    stars: [
      [0.1, 0.05],
      [0.92, 0.12],
      [0.35, 0.46],
      [0.5, 0.51],
      [0.66, 0.56],
      [0.15, 0.96],
      [0.85, 0.9],
    ],
    edges: [
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
    ],
  },
];

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

/* mountain ridge silhouettes — generated once (they don't move like
   water does), as fractional {xf 0..1, hf 0..1} points so they stay
   correct across resizes without needing to be rebuilt.
   `sharpness` (0..1) controls how dramatic this layer is: low = soft,
   barely-defined hazy hills; high = jagged peaks. Within a sharp layer,
   only some peaks roll a "hero" height — real ranges have a few
   dominant summits, not a uniform row of same-size teeth. */
function generateRidgeLayer(sharpness) {
  const pts = [{ xf: 0, hf: 0.05 + Math.random() * 0.08 }];
  let x = 0;
  let goingUp = true;
  while (x < 0.998) {
    const step = 0.06 + Math.random() * 0.11;
    x = Math.min(1, x + step);
    let hf;
    if (goingUp) {
      const isHero = Math.random() < 0.25;
      const base = 0.22 + sharpness * 0.2;
      const range = isHero ? 0.78 : 0.28 + sharpness * 0.22;
      hf = Math.min(1, base + Math.random() * range);
    } else {
      hf = 0.03 + Math.random() * (0.06 + sharpness * 0.14);
    }
    pts.push({ xf: x, hf });
    goingUp = !goingUp;
  }
  if (pts[pts.length - 1].xf < 1) {
    pts.push({ xf: 1, hf: 0.05 + Math.random() * 0.08 });
  }
  return subdivideRidge(pts, 4, 0.14);
}

/* midpoint-displacement (fractal) subdivision: repeatedly halves each
   segment and nudges the new point up/down a little. A single straight
   line from valley to summit reads as a clean geometric triangle —
   real slopes are rocky and irregular along their whole length, not
   just at the tip. Roughness shrinks each pass so the result stays a
   mountain silhouette, not static. */
function subdivideRidge(pts, iterations, roughness) {
  let points = pts;
  let rough = roughness;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i],
        b = points[i + 1];
      const dxf = (a.xf + b.xf) / 2 + (Math.random() - 0.5) * 0.002;
      const disp = (Math.random() - 0.5) * rough;
      const dhf = Math.max(0, Math.min(1, (a.hf + b.hf) / 2 + disp));
      next.push({ xf: dxf, hf: dhf });
      next.push(b);
    }
    points = next;
    rough *= 0.52;
  }
  return points;
}

/* far → near. amp = fraction of min(W,H) this layer's peaks can reach.
   Hand-tuned instead of a smooth formula so ONE layer (i3) clearly
   dominates as the hero range, with soft hazy hills behind it and a
   calmer foothill/valley in front — that's what reads as "hierarchy"
   instead of repeated same-size spikes. */
const RIDGE_PROFILE = [
  { amp: 0.05, sharp: 0.1 }, // farthest — barely-there soft hills
  { amp: 0.1, sharp: 0.22 }, // soft, gently defined
  { amp: 0.2, sharp: 0.5 }, // building up
  { amp: 0.46, sharp: 1.0 }, // hero range: tall, sharp, varied
  { amp: 0.3, sharp: 0.42 }, // supporting foothill, calmer
  { amp: 0.09, sharp: 0.15 }, // nearest — gentle valley floor
];
const NUM_RIDGES = RIDGE_PROFILE.length;
const mountainLayers = RIDGE_PROFILE.map((p) => generateRidgeLayer(p.sharp));

/* dune silhouettes — smooth and rolling, not jagged like the mountain
   ridges. A gentle point-count with height variance, rendered later
   through quadratic curves so the line itself stays soft. */
function generateDuneLayer(sharpness) {
  const numPts = 6 + Math.floor(Math.random() * 3);
  const pts = [];
  for (let i = 0; i <= numPts; i++) {
    pts.push({
      xf: i / numPts,
      hf: 0.22 + Math.random() * (0.35 + sharpness * 0.4),
    });
  }
  return pts;
}
/* far → near: dunes stay much gentler than mountains overall — even
   the "big" one is a soft roll, never a jagged spike */
const DUNE_PROFILE = [
  { amp: 0.035, sharp: 0.1 },
  { amp: 0.07, sharp: 0.2 },
  { amp: 0.13, sharp: 0.35 },
  { amp: 0.3, sharp: 0.55 }, // the big dune
  { amp: 0.17, sharp: 0.35 },
  { amp: 0.06, sharp: 0.15 },
];
const NUM_DUNES = DUNE_PROFILE.length;
const duneLayers = DUNE_PROFILE.map((p) => generateDuneLayer(p.sharp));

/* an extra, fainter star field only switched on in the desert — the
   sky there should read as noticeably more star-dense than the other
   two scenes */
const desertStars = Array.from({ length: 120 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.42,
  r: Math.random() * 0.9 + 0.2,
  tw: Math.random() * Math.PI * 2,
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

/* scene mode: swaps the foreground (ocean+beach vs mountains) while
   the sky/sun/moon/stars keep driving both from the same palette */
const SCENE_LABELS = {
  ocean: "◑ \u00A0T I D E S",
  mountain: "▲ \u00A0S U M M I T",
  desert: "☼ \u00A0M I R A G E",
};
let sceneMode = "ocean";
const sceneLabel = document.getElementById("scene-label");
const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.mode === sceneMode) return;
    sceneMode = btn.dataset.mode;
    modeButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    sceneLabel.textContent = SCENE_LABELS[sceneMode];
  });
});

/* season: tints the mountain's near ground/forest color and shifts
   how far down the snow line sits. Kept subtle in ocean mode since a
   tropical beach doesn't read four seasons the way a mountainside does */
const SEASON_TINTS = {
  spring: { ground: [88, 156, 92], snowLine: 0.64, sandTint: [235, 210, 185] },
  summer: { ground: [46, 108, 64], snowLine: 0.72, sandTint: [230, 196, 150] },
  autumn: { ground: [168, 98, 42], snowLine: 0.6, sandTint: [214, 170, 130] },
  winter: {
    ground: [206, 214, 222],
    snowLine: 0.32,
    sandTint: [200, 200, 205],
  },
};
let season = "summer";
const seasonButtons = document.querySelectorAll(".season-btn");
seasonButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.season === season) return;
    season = btn.dataset.season;
    seasonButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  });
});

/* weather: rain works the same in both scenes — it's layered on top
   rather than baked into the palette */
let rainOn = false;
const rainBtn = document.getElementById("rainBtn");
rainBtn.addEventListener("click", () => {
  rainOn = !rainOn;
  rainBtn.classList.toggle("muted", !rainOn);
  rainBtn.setAttribute("aria-pressed", String(rainOn));
  rainBtn.setAttribute("aria-label", rainOn ? "Turn rain off" : "Turn rain on");
});

/* ════════════════════════════════════════
   AMBIENT AUDIO — synthesized, no external files.
   Waves/wind are filtered noise; birds/crickets are short scheduled
   chirps. Everything is silent until the person opts in (browsers
   block audio before a user gesture anyway), via the sound button.
═══════════════════════════════════════ */
let audioCtx = null;
let audioOn = false;
let audioNodes = null;
const soundBtn = document.getElementById("soundBtn");

function makeNoiseBuffer(ctxRef, seconds, brown) {
  const bufferSize = ctxRef.sampleRate * seconds;
  const buffer = ctxRef.createBuffer(1, bufferSize, ctxRef.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 7;
    } else {
      data[i] = white * 0.4;
    }
  }
  return buffer;
}

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const master = audioCtx.createGain();
  master.gain.value = 0.4;
  master.connect(audioCtx.destination);

  /* ocean waves: white noise through a bandpass filter gives that
     characteristic hiss-and-wash — the cutoff breathes slowly to
     feel like swells rolling in */
  const waveSrc = audioCtx.createBufferSource();
  waveSrc.buffer = makeNoiseBuffer(audioCtx, 4, false);
  waveSrc.loop = true;
  const waveFilter = audioCtx.createBiquadFilter();
  waveFilter.type = "bandpass";
  waveFilter.frequency.value = 700;
  waveFilter.Q.value = 0.5;
  const waveGain = audioCtx.createGain();
  waveGain.gain.value = 0;
  waveSrc.connect(waveFilter).connect(waveGain).connect(master);
  waveSrc.start();

  /* mountain wind: brownian noise (deep, continuous) through a
     lowpass filter — a low moaning rumble instead of a hiss */
  const windSrc = audioCtx.createBufferSource();
  windSrc.buffer = makeNoiseBuffer(audioCtx, 4, true);
  windSrc.loop = true;
  const windFilter = audioCtx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 450;
  const windGain = audioCtx.createGain();
  windGain.gain.value = 0;
  windSrc.connect(windFilter).connect(windGain).connect(master);
  windSrc.start();

  /* rain: high-passed white noise for a hissy patter, distinct from
     both the wave hiss (bandpass, lower) and the wind rumble */
  const rainSrc = audioCtx.createBufferSource();
  rainSrc.buffer = makeNoiseBuffer(audioCtx, 4, false);
  rainSrc.loop = true;
  const rainFilter = audioCtx.createBiquadFilter();
  rainFilter.type = "highpass";
  rainFilter.frequency.value = 2200;
  const rainGain = audioCtx.createGain();
  rainGain.gain.value = 0;
  rainSrc.connect(rainFilter).connect(rainGain).connect(master);
  rainSrc.start();

  audioNodes = {
    master,
    waveFilter,
    waveGain,
    windFilter,
    windGain,
    rainFilter,
    rainGain,
  };

  setInterval(() => {
    if (!audioOn) return;
    const P = getPalette(timeOfDay);
    const dayness = 1 - P.star; // 1 = full day, 0 = full night
    const birdChance = dayness * (sceneMode === "ocean" ? 0.4 : 0.3);
    if (Math.random() < birdChance * 0.5) playChirp(2200, 0.05);
    const cricketChance = P.star * (sceneMode === "mountain" ? 0.55 : 0.2);
    if (Math.random() < cricketChance * 0.5) playChirp(4200, 0.035);
  }, 1400);
}

function playChirp(freqBase, level) {
  if (!audioCtx || !audioOn) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  const g = audioCtx.createGain();
  g.gain.value = 0;
  osc.connect(g).connect(audioNodes.master);
  const freq = freqBase + (Math.random() - 0.5) * 300;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.82, now + 0.12);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(level, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playThunder() {
  if (!audioCtx || !audioOn) return;
  const now = audioCtx.currentTime;
  const src = audioCtx.createBufferSource();
  src.buffer = makeNoiseBuffer(audioCtx, 2.2, true);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 110;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.55, now + 0.2);
  g.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
  src.connect(filter).connect(g).connect(audioNodes.master);
  src.start(now);
  src.stop(now + 2.5);
}

let lastAudioMixMs = 0;
function updateAudioMix(P, nowMs) {
  if (!audioCtx || !audioOn) return;
  if (nowMs - lastAudioMixMs < 200) return; // a few times a second is plenty
  lastAudioMixMs = nowMs;
  const now = audioCtx.currentTime;
  const oceanTarget = sceneMode === "ocean" ? 0.55 : 0.02;
  const windTarget = sceneMode === "mountain" ? 0.32 : 0.04;
  const rainTarget = rainOn ? 0.3 : 0;
  audioNodes.waveGain.gain.setTargetAtTime(oceanTarget, now, 0.9);
  audioNodes.windGain.gain.setTargetAtTime(windTarget, now, 0.9);
  audioNodes.rainGain.gain.setTargetAtTime(rainTarget, now, 0.7);
  audioNodes.waveFilter.frequency.setTargetAtTime(
    650 + Math.sin(T * 0.25) * 180,
    now,
    0.6,
  );
  audioNodes.windFilter.frequency.setTargetAtTime(
    420 + Math.sin(T * 0.18) * 110,
    now,
    0.6,
  );
}

soundBtn.addEventListener("click", () => {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
  audioOn = !audioOn;
  soundBtn.classList.toggle("muted", !audioOn);
  soundBtn.setAttribute("aria-pressed", String(audioOn));
  soundBtn.setAttribute(
    "aria-label",
    audioOn ? "Turn ambient sound off" : "Turn ambient sound on",
  );
  if (!audioOn && audioNodes) {
    const now = audioCtx.currentTime;
    audioNodes.waveGain.gain.setTargetAtTime(0, now, 0.3);
    audioNodes.windGain.gain.setTargetAtTime(0, now, 0.3);
    audioNodes.rainGain.gain.setTargetAtTime(0, now, 0.3);
  }
});

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

let sunHoldTimer = null;
canvas.addEventListener("pointerdown", (e) => {
  if (sceneMode === "ocean" && e.clientY > horizonY && e.clientY < sandTopY) {
    spawnRipple(e.clientX, e.clientY);
  }
  checkSunClickEasterEgg(e.clientX, e.clientY);
  checkMirageEasterEgg(e.clientX, e.clientY);

  const distToSun = Math.hypot(
    e.clientX - currentSunX,
    e.clientY - currentSunY,
  );
  if (distToSun < currentSunR * 2.2 && !eclipseActive) {
    sunHoldTimer = setTimeout(triggerEclipse, 1600);
  }
});
["pointerup", "pointerleave", "pointercancel"].forEach((evt) => {
  canvas.addEventListener(evt, () => {
    if (sunHoldTimer) {
      clearTimeout(sunHoldTimer);
      sunHoldTimer = null;
    }
  });
});

canvas.addEventListener("dblclick", (e) => {
  if (sceneMode !== "ocean") return;
  if (e.clientY > horizonY && e.clientY < sandTopY) {
    fishJumps.push({
      x: e.clientX,
      y: e.clientY,
      age: 0,
      life: 0.85 + Math.random() * 0.3,
      dir: Math.random() < 0.5 ? -1 : 1,
    });
  }
});

/* ════════════════════════════════════════
   EASTER EGGS — for anyone curious enough to poke at things
═══════════════════════════════════════ */
let currentSunX = 0,
  currentSunY = 0,
  currentSunR = 0;
let currentHeat = 0; // how strong the desert heat-shimmer is right now

/* egg #5 — desert-only. Click into the shimmer near the horizon on a
   hot, bright dune day and the heat briefly plays a trick on you: a
   little oasis, borrowed straight from the ocean scene, that was
   never really there */
let mirageActive = false;
let mirageAge = 0;
let mirageLife = 0;
let mirageX = 0;
function triggerMirage(x) {
  if (mirageActive) return;
  mirageActive = true;
  mirageAge = 0;
  mirageLife = 5 + Math.random() * 2;
  mirageX = Math.max(W * 0.15, Math.min(W * 0.85, x));
  showSecretMessage("~ just a mirage ~");
}
function checkMirageEasterEgg(x, y) {
  if (sceneMode !== "desert" || mirageActive) return;
  if (currentHeat < 0.15) return; // needs real midday heat to work
  if (Math.abs(y - horizonY) > 55) return; // has to be near the shimmer band
  triggerMirage(x);
}
function updateAndDrawMirage(dt) {
  if (!mirageActive) return;
  mirageAge += dt;
  if (mirageAge > mirageLife) {
    mirageActive = false;
    return;
  }
  const t = mirageAge / mirageLife;
  const fade = Math.min(1, t * 3) * Math.min(1, (1 - t) * 1.6);
  if (fade <= 0.01) return;

  const wobbleX = Math.sin(T * 3.2) * 4;
  const baseY = horizonY + 4;

  ctx.save();
  ctx.globalAlpha = fade * 0.78;

  const poolGrad = ctx.createRadialGradient(
    mirageX,
    baseY,
    2,
    mirageX,
    baseY,
    90,
  );
  poolGrad.addColorStop(0, "rgba(170,220,232,0.6)");
  poolGrad.addColorStop(1, "rgba(170,220,232,0)");
  ctx.beginPath();
  ctx.ellipse(mirageX + wobbleX, baseY, 85, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = poolGrad;
  ctx.fill();

  drawPalmTree(
    mirageX + wobbleX * 1.4,
    baseY,
    1.05,
    Math.sin(T * 2) * 0.4,
    "rgba(38,40,50,0.82)",
  );

  ctx.restore();
}

/* egg #3 — hold the sun/moon down for a second and a half: the
   whole sky goes dark in the middle of the day, corona and all,
   then eases back like nothing happened */
let eclipseActive = false;
let eclipseT = 0;
function triggerEclipse() {
  if (eclipseActive) return;
  eclipseActive = true;
  eclipseT = 0;
  showSecretMessage("◑ totality ◑");
}

/* on-screen toast for the moments a secret is actually found */
let secretMsg = { text: "", alpha: 0 };
function showSecretMessage(text) {
  secretMsg = { text, alpha: 1 };
}
function updateAndDrawSecretMessage() {
  if (secretMsg.alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, secretMsg.alpha);
  ctx.font = "13px 'DM Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10;
  ctx.fillText(secretMsg.text, W / 2, Math.min(H * 0.16, 90));
  ctx.restore();
  secretMsg.alpha -= 0.0045;
}

/* egg #1 — click the sun/moon five times in a row: a private
   shooting-star shower, any time of day */
let sunClickTimes = [];
function checkSunClickEasterEgg(x, y) {
  if (currentSunR <= 0) return;
  const dist = Math.hypot(x - currentSunX, y - currentSunY);
  if (dist > currentSunR * 2) return;
  const now = performance.now();
  sunClickTimes.push(now);
  sunClickTimes = sunClickTimes.filter((t) => now - t < 2600);
  if (sunClickTimes.length >= 5) {
    sunClickTimes = [];
    for (let i = 0; i < 14; i++) {
      setTimeout(() => spawnShootingStar({ bright: 1 }), i * 90);
    }
    showSecretMessage("✦ make a wish ✦");
  }
}

/* egg #4 — no click, no code: just be patient in the right place.
   Mountain + Winter + a dark enough sky, held for a while, and the
   aurora quietly shows up on its own — guaranteed within ~25s of
   holding those conditions, not left purely to chance */
let auroraActive = false;
let auroraAge = 0;
let auroraLife = 0;
let auroraConditionTime = 0;
function maybeTriggerAurora(P, dt) {
  const conditionsMet =
    sceneMode === "mountain" && season === "winter" && !rainOn && P.star >= 0.7;
  if (!conditionsMet) {
    auroraConditionTime = 0;
    return;
  }
  if (auroraActive) return;
  auroraConditionTime += dt;
  if (Math.random() < 0.05 * dt || auroraConditionTime > 25) {
    auroraActive = true;
    auroraAge = 0;
    auroraLife = 16 + Math.random() * 6;
    auroraConditionTime = 0;
    showSecretMessage("◑ the aurora finds you ◑");
  }
}

function updateAndDrawAurora(dt) {
  if (!auroraActive) return;
  auroraAge += dt;
  if (auroraAge > auroraLife) {
    auroraActive = false;
    return;
  }
  const t = auroraAge / auroraLife;
  const fade = Math.min(1, t * 4) * Math.min(1, (1 - t) * 2.2);
  if (fade <= 0.01) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const bands = [
    { col: [90, 255, 175], yBase: 0.05, amp: 0.045, speed: 0.15 },
    { col: [150, 130, 255], yBase: 0.11, amp: 0.055, speed: 0.11 },
    { col: [90, 205, 255], yBase: 0.17, amp: 0.04, speed: 0.19 },
  ];
  bands.forEach((b, bi) => {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const xf = x / W;
      const y =
        (b.yBase + Math.sin(xf * 4 + T * b.speed + bi) * b.amp) * horizonY;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    for (let x = W; x >= 0; x -= 16) {
      const xf = x / W;
      const y =
        (b.yBase + 0.13 + Math.sin(xf * 4 + T * b.speed + bi + 1) * b.amp) *
        horizonY;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = rgb(b.col, fade * 0.22);
    ctx.fill();
  });
  ctx.restore();
}

/* egg #2 — the Konami code guarantees a UFO sighting */
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiProgress = 0;
window.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const expected = KONAMI[konamiProgress];
  if (key === expected) {
    konamiProgress++;
    if (konamiProgress === KONAMI.length) {
      konamiProgress = 0;
      spawnShootingStar({ ufo: true, bright: 1 });
      showSecretMessage("◑ you found the secret ◑");
    }
  } else {
    konamiProgress = key === KONAMI[0] ? 1 : 0;
  }
});

console.log(
  "%c◑ A sea of blues",
  "font-size:16px;font-weight:bold;color:#8fc6e8;",
);
console.log(
  "%csame sea, every hour a different blue — and a few things hiding in it.",
  "color:#8a97a8;font-style:italic;",
);
console.log(
  "%chint: the sun doesn't like being clicked five times. and someone left a code here in the 80s.",
  "color:#8a97a8;",
);

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
      ctx.ellipse(rp.x, rp.y, rp.r * 0.6, rp.r * 0.6 * 0.34, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(P.foam, fade * 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

/* ════════════════════════════════════════
   SHOOTING STARS — rare, only once it's dark enough.
   A tiny fraction are secretly a UFO instead — a quiet reward for
   anyone who happens to be watching closely.
═══════════════════════════════════════ */
let shootingStars = [];

function spawnShootingStar(opts) {
  opts = opts || {};
  const isUFO = opts.ufo || false;
  const bright = opts.bright; // set only by easter eggs — ignores P.star fade
  if (isUFO) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    shootingStars.push({
      ufo: true,
      x: dir > 0 ? -30 : W + 30,
      baseY: horizonY * (0.15 + Math.random() * 0.35),
      vx: dir * (95 + Math.random() * 55),
      bobPhase: Math.random() * Math.PI * 2,
      age: 0,
      life: 6 + Math.random() * 2,
      bright,
    });
  } else {
    const startX = W * (0.1 + Math.random() * 0.6);
    const startY = horizonY * (0.05 + Math.random() * 0.3);
    const angle = ((20 + Math.random() * 25) * Math.PI) / 180;
    const speed = 850 + Math.random() * 400;
    shootingStars.push({
      ufo: false,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 55 + Math.random() * 45,
      age: 0,
      life: 0.5 + Math.random() * 0.25,
      bright,
    });
  }
}

function maybeSpawnShootingStar(P, dt) {
  if (P.star < 0.5 || rainOn) return; // sky isn't dark enough, or storm hides it
  const chancePerSecond = 0.18; // roughly one every ~5-6s once it's dark
  if (Math.random() < chancePerSecond * dt) {
    spawnShootingStar({ ufo: Math.random() < 0.045 });
  }
}

function updateAndDrawShootingStars(P, dt) {
  shootingStars.forEach((s) => {
    s.age += dt;
    if (!s.ufo) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    } else {
      s.x += s.vx * dt;
    }
  });
  shootingStars = shootingStars.filter((s) => s.age < s.life);

  shootingStars.forEach((s) => {
    const t = s.age / s.life;
    const visibility = s.bright !== undefined ? s.bright : P.star;

    if (s.ufo) {
      const alpha = Math.min(1, t * 3) * Math.min(1, (1 - t) * 3) * visibility;
      if (alpha <= 0.01) return;
      const y = s.baseY + Math.sin(T * 2.3 + s.bobPhase) * 7;

      ctx.fillStyle = rgb([18, 20, 28], alpha * 0.92);
      ctx.beginPath();
      ctx.ellipse(s.x, y, 17, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s.x, y - 4, 7.5, 5.5, Math.PI, 0, Math.PI);
      ctx.fill();

      const blink = 0.5 + 0.5 * Math.sin(T * 11 + s.bobPhase);
      [-10, 0, 10].forEach((off, i) => {
        ctx.fillStyle = rgb(
          i === 1 ? [150, 255, 190] : [255, 130, 150],
          alpha * blink,
        );
        ctx.beginPath();
        ctx.arc(s.x + off, y + 3.5, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    const alpha = Math.min(1, t * 5) * (1 - t) * visibility;
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
   WILDLIFE — fish jumping (ocean), fireflies (mountain valley)
═══════════════════════════════════════ */
let fishJumps = [];

function maybeSpawnFish(dt) {
  if (sceneMode !== "ocean") return;
  if (Math.random() < 0.035 * dt) {
    const startX = W * (0.15 + Math.random() * 0.7);
    const startY = horizonY + oceanH * (0.35 + Math.random() * 0.55);
    fishJumps.push({
      x: startX,
      y: startY,
      age: 0,
      life: 0.85 + Math.random() * 0.3,
      dir: Math.random() < 0.5 ? -1 : 1,
    });
  }
}

function updateAndDrawFish(P, dt) {
  fishJumps.forEach((f) => (f.age += dt));
  fishJumps = fishJumps.filter((f) => f.age < f.life);

  fishJumps.forEach((f) => {
    const t = f.age / f.life;
    const arcH = 24;
    const yOff = -Math.sin(t * Math.PI) * arcH;
    const xOff = (t - 0.5) * 36 * f.dir;
    const x = f.x + xOff,
      y = f.y + yOff;
    const bodyAlpha = 0.85 * (1 - Math.pow(Math.abs(t - 0.5) * 1.9, 2));

    if (bodyAlpha > 0.03) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(f.dir * (0.35 - t * 0.7));
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.quadraticCurveTo(0, -4.5, 9, 0);
      ctx.quadraticCurveTo(0, 3, -9, 0);
      ctx.closePath();
      ctx.fillStyle = rgb(lerpRGB(P.wNear, [10, 10, 10], 0.2), bodyAlpha);
      ctx.fill();
      ctx.restore();
    }

    /* splash rings right as it leaves and re-enters the water */
    if (t < 0.1 || t > 0.9) {
      const splashT = t < 0.1 ? t / 0.1 : (1 - t) / 0.1;
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, 9 + splashT * 6, 2.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(P.foam, 0.4 * splashT);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  });
}

const fireflies = Array.from({ length: 16 }, () => ({
  x: Math.random(),
  y: 0.78 + Math.random() * 0.18,
  phase: Math.random() * Math.PI * 2,
  speed: 0.3 + Math.random() * 0.5,
  driftX: (Math.random() - 0.5) * 0.00035,
  driftY: (Math.random() - 0.5) * 0.00022,
}));

function drawFireflies(P) {
  if (sceneMode !== "mountain" || rainOn) return;
  const visibility = Math.max(0, Math.min(1, P.star * 1.3 - 0.12));
  if (visibility <= 0.02) return;

  fireflies.forEach((f) => {
    f.x += f.driftX;
    f.y += f.driftY;
    if (f.x < 0) f.x = 1;
    if (f.x > 1) f.x = 0;
    if (f.y < 0.7) f.y = 0.7;
    if (f.y > 0.98) f.y = 0.98;

    const glow = 0.5 + 0.5 * Math.sin(T * f.speed * 3 + f.phase);
    const x = f.x * W,
      y = f.y * H;
    const r = 2 + glow * 1.6;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, rgb([214, 255, 148], visibility * glow * 0.9));
    g.addColorStop(1, rgb([214, 255, 148], 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ════════════════════════════════════════
   RAIN — falls in front of everything, splashes on
   whatever ground the current scene has
═══════════════════════════════════════ */
const RAIN_COUNT = 200;
const rainDrops = Array.from({ length: RAIN_COUNT }, () => ({
  x: Math.random(),
  y: Math.random(),
  depth: Math.random(), // 0 = far/small/slow, 1 = near/big/fast
}));

let groundSplashes = [];
function spawnGroundSplash(x, y, size) {
  groundSplashes.push({
    x,
    y,
    age: 0,
    life: 0.22 + Math.random() * 0.08,
    size,
  });
}

let lightningAlpha = 0;
function maybeTriggerLightning(dt) {
  if (Math.random() < 0.012 * dt) {
    lightningAlpha = 0.5 + Math.random() * 0.35;
    playThunder();
  }
}

function updateAndDrawRain(P, dt) {
  const windLean = 0.22;
  const groundFrac =
    sceneMode === "ocean" ? sandTopY / H : (H - Math.min(H, W) * 0.1) / H;
  const waterTopFrac = horizonY / H;

  if (rainOn) {
    rainDrops.forEach((d) => {
      const speed = lerp(0.5, 1.6, d.depth);
      const prevY = d.y;
      d.y += speed * dt * 0.6;
      d.x += windLean * speed * dt * 0.12;

      /* in ocean mode the visible sea spans a huge apparent depth —
         each drop gets its own impact line based on its depth so
         splashes scatter across the whole surface instead of
         bunching in one strip at the shoreline. Mountain ground is
         genuinely flat, so it keeps a single impact line. */
      const impactFrac =
        sceneMode === "ocean"
          ? lerp(waterTopFrac, groundFrac, d.depth)
          : groundFrac;

      if (prevY < impactFrac && d.y >= impactFrac) {
        const sx = d.x * W;
        if (sceneMode === "ocean") {
          if (Math.random() < 0.35) spawnRipple(sx, impactFrac * H - 2);
        } else {
          spawnGroundSplash(sx, impactFrac * H, lerp(3, 7, d.depth));
        }
      }

      if (d.y > 1.02) {
        d.y = -0.02;
        d.x = Math.random();
      }
      if (d.x > 1) d.x -= 1;
      if (d.x < 0) d.x += 1;

      const x = d.x * W,
        y = d.y * H;
      if (y > impactFrac * H + 4) return;
      const len = lerp(9, 24, d.depth);
      const alpha = lerp(0.12, 0.4, d.depth);
      const dx = windLean * len * 0.55;

      ctx.strokeStyle = rgb([215, 224, 236], alpha);
      ctx.lineWidth = lerp(0.6, 1.5, d.depth);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + len);
      ctx.stroke();
    });

    maybeTriggerLightning(dt);
  }

  /* splashes keep fading out even the instant rain is switched off */
  groundSplashes.forEach((s) => (s.age += dt));
  groundSplashes = groundSplashes.filter((s) => s.age < s.life);
  groundSplashes.forEach((s) => {
    const t = s.age / s.life;
    const r = s.size * (0.4 + t * 1.4);
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rgb([230, 234, 240], (1 - t) * 0.5);
    ctx.lineWidth = 1;
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
  /* subtle seasonal shift — kept light so it still reads as a
     tropical beach, not a mountainside */
  const seasonSand = SEASON_TINTS[season].sandTint;
  const sandCol = lerpRGB(P.sand, seasonSand, 0.22);
  const sandWetCol = lerpRGB(P.sandWet, seasonSand, 0.12);

  /* base gradient: wet at the waterline → dry further down */
  const g = ctx.createLinearGradient(0, sandTopY, 0, H);
  g.addColorStop(0, rgb(sandWetCol));
  g.addColorStop(0.4, rgb(lerpRGB(sandWetCol, sandCol, 0.7)));
  g.addColorStop(1, rgb(sandCol));
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
  ctx.fillStyle = rgb(lerpRGB(sandCol, [0, 0, 0], 0.2), 0.22);
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
   MOUNTAINS — layered ridges + valley + pines
═══════════════════════════════════════ */
function drawPineTree(x, baseY, scale, sway, col) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);

  /* trunk */
  ctx.fillStyle = col;
  ctx.fillRect(-3.5, -16, 7, 16);

  /* stacked foliage tiers, widest at the bottom, swaying a bit more
     the higher up they are (like real branches would) */
  const tiers = [
    { y: -14, w: 52, h: 38 },
    { y: -42, w: 40, h: 32 },
    { y: -66, w: 28, h: 26 },
  ];
  tiers.forEach((t, i) => {
    const off = sway * (5 + i * 4);
    ctx.beginPath();
    ctx.moveTo(-t.w / 2 + off * 0.3, t.y);
    ctx.lineTo(t.w / 2 + off * 0.3, t.y);
    ctx.lineTo(off, t.y - t.h);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  });

  ctx.restore();
}

function buildRidgePath(pts, yTop, amp) {
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, yTop - amp * pts[0].hf);
  pts.forEach((p) => {
    ctx.lineTo(p.xf * W, yTop - amp * p.hf);
  });
  ctx.lineTo(W, H);
  ctx.closePath();
}

/* smooth dune silhouette — curves through each point's midpoint to
   its neighbor instead of straight lineTo segments, so the crest
   rolls softly the way sand actually does */
function buildDunePath(pts, yTop, amp) {
  const toXY = (p) => [p.xf * W, yTop - amp * p.hf];
  ctx.beginPath();
  ctx.moveTo(0, H);
  const [x0, y0] = toXY(pts[0]);
  ctx.lineTo(0, y0);
  ctx.lineTo(x0, y0);
  for (let i = 0; i < pts.length - 1; i++) {
    const [xa, ya] = toXY(pts[i]);
    const [xb, yb] = toXY(pts[i + 1]);
    const midX = (xa + xb) / 2,
      midY = (ya + yb) / 2;
    ctx.quadraticCurveTo(xa, ya, midX, midY);
  }
  const last = toXY(pts[pts.length - 1]);
  ctx.lineTo(last[0], last[1]);
  ctx.lineTo(W, H);
  ctx.closePath();
}

function drawMountainScene(P, sway) {
  const tint = SEASON_TINTS[season];
  for (let i = 0; i < NUM_RIDGES; i++) {
    const depth = i / (NUM_RIDGES - 1); // 0 = farthest, 1 = nearest
    const profile = RIDGE_PROFILE[i];
    const yTop = horizonY + Math.pow(depth, 1.4) * (H - horizonY) * 0.82;
    const amp = profile.amp * Math.min(H, W);
    let col = lerpRGB(P.ridgeFar, P.ridgeNear, depth);
    /* seasonal color only touches the lower, vegetated slopes — bare
       high rock doesn't change with the seasons the way a forested
       flank does */
    if (depth > 0.45) {
      col = lerpRGB(col, tint.ground, ((depth - 0.45) / 0.55) * 0.55);
    }
    const pts = mountainLayers[i];

    /* soft mist sitting in the fold between this ridge and the one
       behind it — only reads while the layers are still hazy/distant */
    if (depth < 0.6) {
      const mist = ctx.createLinearGradient(0, yTop - 8, 0, yTop + 26);
      mist.addColorStop(0, rgb(P.skyHor, 0));
      mist.addColorStop(
        0.5,
        rgb(lerpRGB(P.skyHor, [255, 255, 255], 0.3), 0.16),
      );
      mist.addColorStop(1, rgb(P.skyHor, 0));
      ctx.fillStyle = mist;
      ctx.fillRect(0, yTop - 8, W, 34);
    }

    /* ridge silhouette, anchored to the bottom of the canvas so nearer
       layers naturally cover the lower part of farther ones */
    buildRidgePath(pts, yTop, amp);
    ctx.fillStyle = rgb(col);
    ctx.fill();

    /* snow, clipped to the exact same silhouette so it can only ever
       sit on the rock — no floating caps that drift off the peak.
       Gated by how TALL this layer actually is, not just distance —
       only the dominant/hero range plausibly reaches snow altitude.
       The snow line itself rises and falls with the season. */
    if (profile.amp > 0.24) {
      const snowLineY = yTop - amp * tint.snowLine;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, Math.max(0, snowLineY));
      ctx.clip();
      buildRidgePath(pts, yTop, amp);
      const snowCol = lerpRGB([255, 255, 255], P.glow, 0.25);
      ctx.fillStyle = rgb(snowCol, lerp(0.92, 0.55, depth));
      ctx.fill();
      ctx.restore();
    }
  }

  /* valley floor texture — reuse the sand grain look, tinted to the
     nearest ridge + season color so it reads as grass/scree, not sand */
  const groundCol = lerpRGB(P.ridgeNear, tint.ground, 0.5);
  const groundY = H - Math.min(H, W) * 0.1;
  ctx.fillStyle = rgb(lerpRGB(groundCol, [0, 0, 0], 0.2), 0.2);
  sandGrains.forEach((sgr) => {
    if (sgr.y * H + groundY > H) return;
    ctx.fillRect(sgr.x * W, groundY + sgr.y * (H - groundY), sgr.s, sgr.s);
  });

  /* pine cluster + boulders, standing in for the palm/rocks the beach uses */
  const silCol = rgb(
    lerpRGB(lerpRGB(P.ridgeNear, tint.ground, 0.3), [0, 0, 0], 0.5),
  );
  const pineScale = Math.min(3.6, H / 220, W / 260);
  drawPineTree(W * 0.09, H - 6, pineScale, sway, silCol);
  drawPineTree(W * 0.2, H - 4, pineScale * 0.62, sway, silCol);
  drawRock(W * 0.86, H - 10, 50, 32, silCol);
  drawRock(W * 0.91, H - 6, 30, 20, silCol);
}

/* ════════════════════════════════════════
   DESERT — rolling dunes, cacti, the clearest night sky of the three
═══════════════════════════════════════ */
function drawCactus(x, baseY, scale, col) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = col;

  /* main trunk, rounded top */
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.lineTo(-10, -70);
  ctx.quadraticCurveTo(-10, -86, 0, -86);
  ctx.quadraticCurveTo(10, -86, 10, -70);
  ctx.lineTo(10, 4);
  ctx.closePath();
  ctx.fill();

  /* left arm, lower */
  ctx.beginPath();
  ctx.moveTo(-10, -30);
  ctx.bezierCurveTo(-34, -32, -40, -50, -34, -64);
  ctx.quadraticCurveTo(-32, -72, -24, -70);
  ctx.bezierCurveTo(-28, -58, -24, -44, -6, -42);
  ctx.closePath();
  ctx.fill();

  /* right arm, higher — asymmetric reads more natural */
  ctx.beginPath();
  ctx.moveTo(10, -46);
  ctx.bezierCurveTo(32, -48, 38, -64, 33, -76);
  ctx.quadraticCurveTo(31, -83, 23, -81);
  ctx.bezierCurveTo(26, -70, 22, -58, 6, -56);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHeatShimmer(P, stormMix) {
  const heat = currentHeat;
  if (heat <= 0.05) return;
  for (let i = 0; i < 3; i++) {
    const y = horizonY - 3 + i * 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 10) {
      const wob = Math.sin(x * 0.045 + T * 3.2 + i * 1.7) * 2.2 * heat;
      x === 0 ? ctx.moveTo(x, y + wob) : ctx.lineTo(x, y + wob);
    }
    ctx.strokeStyle = rgb(P.duneFar, 0.1 * heat);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawDesertScene(P, sway, stormMix) {
  for (let i = 0; i < NUM_DUNES; i++) {
    const depth = i / (NUM_DUNES - 1);
    const profile = DUNE_PROFILE[i];
    const yTop = horizonY + Math.pow(depth, 1.4) * (H - horizonY) * 0.82;
    const amp = profile.amp * Math.min(H, W);
    const col = lerpRGB(P.duneFar, P.duneNear, depth);
    const pts = duneLayers[i];

    if (depth < 0.6) {
      const haze = ctx.createLinearGradient(0, yTop - 8, 0, yTop + 22);
      haze.addColorStop(0, rgb(P.skyHor, 0));
      haze.addColorStop(
        0.5,
        rgb(lerpRGB(P.skyHor, [255, 255, 255], 0.3), 0.14),
      );
      haze.addColorStop(1, rgb(P.skyHor, 0));
      ctx.fillStyle = haze;
      ctx.fillRect(0, yTop - 8, W, 30);
    }

    buildDunePath(pts, yTop, amp);
    ctx.fillStyle = rgb(col);
    ctx.fill();

    /* crest highlight facing the sun — a soft rim of light along the
       top edge of each dune, the one lighting cue real dunes always show */
    ctx.save();
    buildDunePath(pts, yTop, amp);
    ctx.clip();
    const rim = ctx.createLinearGradient(0, yTop - amp, 0, yTop - amp * 0.4);
    rim.addColorStop(
      0,
      rgb(lerpRGB(col, P.sun, 0.4), 0.35 * (1 - depth * 0.5)),
    );
    rim.addColorStop(1, rgb(col, 0));
    ctx.fillStyle = rim;
    ctx.fillRect(0, yTop - amp - 4, W, amp * 0.65);
    ctx.restore();
  }

  drawHeatShimmer(P, stormMix);

  /* fine sand texture on the nearest dune */
  const groundY = H - Math.min(H, W) * 0.1;
  ctx.fillStyle = rgb(lerpRGB(P.duneNear, [255, 245, 225], 0.15), 0.18);
  sandGrains.forEach((sgr) => {
    if (sgr.y * H + groundY > H) return;
    ctx.fillRect(sgr.x * W, groundY + sgr.y * (H - groundY), sgr.s, sgr.s);
  });

  const silCol = rgb(lerpRGB(P.duneNear, [0, 0, 0], 0.55));
  const cactusScale = Math.min(2.6, H / 300, W / 340);
  drawCactus(W * 0.1, H - 4, cactusScale, silCol);
  drawCactus(W * 0.19, H - 2, cactusScale * 0.55, silCol);
  drawRock(W * 0.85, H - 8, 44, 26, silCol);
  drawRock(W * 0.9, H - 4, 26, 16, silCol);
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
  updateAudioMix(P, nowMs);

  /* eclipse progresses 0 → 1 → 0 over its whole run, then turns itself off */
  if (eclipseActive) {
    eclipseT += dt / 4.6;
    if (eclipseT >= 1) {
      eclipseT = 0;
      eclipseActive = false;
    }
  }
  const eclipseAmount = eclipseActive ? Math.sin(eclipseT * Math.PI) : 0;
  const effStar = Math.max(P.star, eclipseAmount * 0.92);

  /* rain overcasts the sky — blend everything toward storm grey rather
     than touching the palette itself, so it layers on any time/mood.
     A total eclipse darkens things even further, on top of that. */
  const stormMix = rainOn ? 0.6 : 0;
  const skyTopC = lerpRGB(
    lerpRGB(P.skyTop, [64, 68, 76], stormMix),
    [8, 9, 16],
    eclipseAmount * 0.88,
  );
  const skyHorC = lerpRGB(
    lerpRGB(P.skyHor, [104, 108, 116], stormMix),
    [30, 26, 40],
    eclipseAmount * 0.85,
  );

  /* sun position */
  const sunX = W * (0.5 + (mouseX - 0.5) * 0.25);
  const sunY = horizonY - P.sunH * horizonY * 0.82;

  /* ── SKY ── */
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY + oceanH * 0.1);
  sky.addColorStop(0, rgb(skyTopC));
  sky.addColorStop(0.7, rgb(lerpRGB(skyTopC, skyHorC, 0.55)));
  sky.addColorStop(1, rgb(skyHorC));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizonY + 2);

  /* ── STARS ── */
  if ((effStar > 0.01 && !rainOn) || eclipseAmount > 0.05) {
    stars.forEach((s) => {
      const tw = 0.5 + 0.5 * Math.sin(T * 2 + s.tw);
      ctx.fillStyle = rgb([255, 255, 255], effStar * tw * 0.9);
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * horizonY, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    /* the desert sky is the clearest of the three — a second, fainter
       field of stars fills in between the regular ones */
    if (sceneMode === "desert") {
      desertStars.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(T * 2.3 + s.tw);
        ctx.fillStyle = rgb([255, 255, 255], effStar * tw * 0.65);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * horizonY, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    /* constellations only emerge once the sky is properly dark —
       faint connecting lines plus slightly brighter, steadier stars */
    if (effStar > 0.35) {
      const cAlpha = ((effStar - 0.35) / 0.65) * effStar;
      CONSTELLATIONS.forEach((c) => {
        const pts = c.stars.map(([sx, sy]) => ({
          x: (c.originX + sx * c.scale) * W,
          y: (c.originY + sy * c.scale) * horizonY,
        }));
        ctx.strokeStyle = rgb([255, 255, 255], cAlpha * 0.32);
        ctx.lineWidth = 1;
        ctx.beginPath();
        c.edges.forEach(([a, b]) => {
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
        });
        ctx.stroke();
        pts.forEach((p) => {
          const tw = 0.75 + 0.25 * Math.sin(T * 1.6 + p.x);
          ctx.fillStyle = rgb([255, 255, 255], cAlpha * tw);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    maybeSpawnShootingStar(P, dt);
  }
  updateAndDrawShootingStars(P, dt);

  /* ── SUN GLOW ── */
  const sunFade = (1 - stormMix * 0.75) * (1 - eclipseAmount * 0.85);
  const glowR = Math.min(W, H) * 0.5;
  const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
  g.addColorStop(0, rgb(P.glow, 0.55 * sunFade));
  g.addColorStop(0.25, rgb(P.glow, 0.22 * sunFade));
  g.addColorStop(1, rgb(P.glow, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizonY + oceanH * 0.4);

  /* ── SUN / MOON DISC ── */
  const sunR = Math.min(W, H) * 0.045;
  currentSunX = sunX;
  currentSunY = sunY;
  currentSunR = sunR;
  ctx.save();
  ctx.globalAlpha = sunFade;
  drawCelestialBody(P, sunX, sunY, sunR);
  ctx.restore();

  /* ── ECLIPSE — a dark disc slides over the sun/moon, corona and all ── */
  if (eclipseAmount > 0.01) {
    ctx.save();
    ctx.globalAlpha = eclipseAmount;
    const corona = ctx.createRadialGradient(
      sunX,
      sunY,
      sunR * 0.8,
      sunX,
      sunY,
      sunR * 2.4,
    );
    corona.addColorStop(0, "rgba(255,244,220,0.85)");
    corona.addColorStop(0.35, "rgba(255,230,180,0.35)");
    corona.addColorStop(1, "rgba(255,230,180,0)");
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#05060a";
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 1.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ── CLOUDS — heavier and darker once it's raining, much sparser
     over the desert (those skies are famously clear) ── */
  const cloudSceneMul = sceneMode === "desert" && !rainOn ? 0.3 : 1;
  clouds.forEach((c) => {
    c.x += c.speed;
    if (c.x > 1.3) c.x = -0.3;
    const cx = c.x * W,
      cy = c.y * horizonY,
      cw = c.w * W * (1 + stormMix * 0.4);
    const cloudCol = rainOn
      ? lerpRGB(skyHorC, [30, 32, 38], 0.5)
      : lerpRGB(P.skyHor, [255, 255, 255], 0.25);
    ctx.fillStyle = rgb(cloudCol, (rainOn ? 0.4 : 0.16) * cloudSceneMul);
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
  const farRef =
    sceneMode === "ocean"
      ? P.wFar
      : sceneMode === "mountain"
        ? P.ridgeFar
        : P.duneFar;
  const haze = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40);
  haze.addColorStop(0, rgb(skyHorC, 0));
  haze.addColorStop(0.5, rgb(skyHorC, 0.45));
  haze.addColorStop(1, rgb(farRef, 0));
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizonY - 40, W, 80);

  if (sceneMode === "ocean") {
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

    /* ── FISH — rare little leaps out of the water ── */
    maybeSpawnFish(dt);
    updateAndDrawFish(P, dt);

    /* ── SUN / MOON GLITTER PATH — narrower & smaller once it's moonlight,
       and mostly washed out by rain-choppy water + a hidden sun ── */
    const glitterNarrow = lerp(1, 0.42, P.moon);
    const glitterCount = 220;
    const glitterFade = 1 - stormMix * 0.85;
    for (let i = 0; i < glitterCount; i++) {
      const dy = Math.random();
      const y = horizonY + Math.pow(dy, 1.5) * oceanH;
      const spread = lerp(6, W * 0.3, dy) * glitterNarrow;
      const x = sunX + (Math.random() - 0.5) * 2 * spread;
      const distFade = 1 - Math.min(1, Math.abs(x - sunX) / (spread + 1));
      const flick = 0.25 + Math.random() * 0.75;
      const a =
        distFade * distFade * flick * P.glit * (1 - dy * 0.25) * glitterFade;
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
  } else if (sceneMode === "mountain") {
    /* ── MOUNTAINS: layered ridges, mist, snow caps, pines ── */
    const sway = Math.sin(T * 0.4) * 0.5;
    drawMountainScene(P, sway);
    drawFireflies(P);
    maybeTriggerAurora(P, dt);
    updateAndDrawAurora(dt);
  } else {
    /* ── DESERT: rolling dunes, cacti, the clearest sky of the three ── */
    const sway = Math.sin(T * 0.4) * 0.5;
    currentHeat =
      Math.max(0, P.sunH - 0.45) * 1.8 * (1 - stormMix) * (1 - P.star);
    drawDesertScene(P, sway, stormMix);
    updateAndDrawMirage(dt);
  }

  /* ── RAIN — falls in front of the whole scene, same in both modes ── */
  updateAndDrawRain(P, dt);

  /* ── LIGHTNING ── */
  if (lightningAlpha > 0.01) {
    ctx.fillStyle = rgb([255, 255, 255], lightningAlpha);
    ctx.fillRect(0, 0, W, H);
    lightningAlpha *= 0.82;
  } else {
    lightningAlpha = 0;
  }

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

  /* ── SECRET MESSAGE (easter eggs) ── */
  updateAndDrawSecretMessage();

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
