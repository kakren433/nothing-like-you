/* ============================================================
   NOTHING LIKE YOU — quiz app logic
   Static screens (landing, reveal, why, other matches) use the
   fixed phone artwork in assets/. The Recustomise screen (and a
   customised Share card) composite a live image on a canvas:
   the "(Recustomisable)" base art is recoloured to the chosen
   swatch and the chosen glyph is drawn into the blank lens.
   ============================================================ */

// ---------- Content ----------

// Each option carries a primary archetype (3 pts) and a thematically
// related secondary archetype (1 pt), so the final result reflects the
// whole pattern of answers rather than a single tie-breaking pick.
// `popularity` is the simulated share of quiz-takers who picked that option
// (each question's four values sum to 100) — powers the "How you compare"
// section on the Why This Match screen.
const QUESTIONS = [
  {
    text: "How many photos are living rent-free on your phone?",
    options: [
      { label: "Under 100, I stay disciplined", scores: { silent: 3, overthinker: 1 }, popularity: 22 },
      { label: "A few thousand, no regrets", scores: { enjoyer: 3, doomscroller: 1 }, popularity: 31 },
      { label: "Lost count, send help", scores: { doomscroller: 3, gremlin: 1 }, popularity: 28 },
      { label: "Zero, I delete everything", scores: { overthinker: 3, silent: 1 }, popularity: 19 },
    ],
  },
  {
    text: "Pick a vibe.",
    options: [
      { label: "Loud & colourful", scores: { enjoyer: 3, gremlin: 1 }, popularity: 29 },
      { label: "Clean & minimal", scores: { silent: 3, overthinker: 1 }, popularity: 26 },
      { label: "Dark & moody", scores: { overthinker: 3, silent: 1 }, popularity: 24 },
      { label: "Nostalgic & retro", scores: { gremlin: 3, doomscroller: 1 }, popularity: 21 },
    ],
  },
  {
    text: "Your notifications are\u2026",
    options: [
      { label: "Answered within seconds", scores: { enjoyer: 3, doomscroller: 1 }, popularity: 33 },
      { label: "Batched & checked in bulk", scores: { overthinker: 3, silent: 1 }, popularity: 22 },
      { label: "On silent, forever", scores: { silent: 3, overthinker: 1 }, popularity: 27 },
      { label: "Only on for people I actually like", scores: { gremlin: 3, enjoyer: 1 }, popularity: 18 },
    ],
  },
  {
    text: "Friday night, you\u2019re\u2026",
    options: [
      { label: "Out till 2am", scores: { enjoyer: 3, gremlin: 1 }, popularity: 24 },
      { label: "In bed with a show on", scores: { silent: 3, overthinker: 1 }, popularity: 32 },
      { label: "Gaming or anime marathon", scores: { gremlin: 3, doomscroller: 1 }, popularity: 23 },
      { label: "Cooking & hosting for friends", scores: { overthinker: 3, silent: 1 }, popularity: 21 },
    ],
  },
  {
    text: "How many hours do you spend on your phone each day?",
    options: [
      { label: "Under 3 hours", scores: { silent: 3, overthinker: 1 }, popularity: 20 },
      { label: "3\u20136 hours", scores: { overthinker: 3, enjoyer: 1 }, popularity: 35 },
      { label: "6+ hours", scores: { doomscroller: 3, enjoyer: 1 }, popularity: 29 },
      { label: "Honestly, I don\u2019t wanna know", scores: { gremlin: 3, doomscroller: 1 }, popularity: 16 },
    ],
  },
  {
    text: "At a party, your phone is\u2026",
    options: [
      { label: "In your hand the whole time", scores: { doomscroller: 3, enjoyer: 1 }, popularity: 27 },
      { label: "Forgotten in your bag", scores: { silent: 3, overthinker: 1 }, popularity: 24 },
      { label: "Out taking everyone\u2019s photo", scores: { enjoyer: 3, doomscroller: 1 }, popularity: 26 },
      { label: "Being passed around so everyone can see something", scores: { gremlin: 3, enjoyer: 1 }, popularity: 23 },
    ],
  },
];

const ARCHETYPES = {
  enjoyer: {
    name: "The 326GB Enjoyer",
    color: "pink",
    glyph: "camera",
    image: "assets/The 326GB Enjoyer.png",
    rarity: "Only 12% get this match.",
    tagline: "pink, 326GB, zero regrets",
    reasoning: "You lost count of your photos ages ago, and you don\u2019t hold back \u2014 loud colours, quick replies, always out before you\u2019re supposed to be. We\u2019re both running a little full, a little bright, and a little too online for our own good.",
  },
  silent: {
    name: "The Silent Operator",
    color: "blue",
    glyph: "moon",
    image: "assets/The Silent Operator.png",
    rarity: "Only 18% get this match.",
    tagline: "blue, on silent, always composed",
    reasoning: "You keep things clean \u2014 low screen time, notifications off, in bed early with a show on. Nothing about you is loud, and that\u2019s exactly the point. We\u2019re both quietly running the show without needing anyone to notice.",
  },
  doomscroller: {
    name: "The Doomscroller",
    color: "orange",
    glyph: "eye",
    image: "assets/The Doomscroller.png",
    rarity: "Only 25% get this match.",
    tagline: "orange, eyes open, thumb scrolling",
    reasoning: "Your phone is never out of reach and the hours add up before you notice. You\u2019re not proud of it, but you\u2019re not stopping either. We\u2019re both a little too aware of everything, all the time.",
  },
  overthinker: {
    name: "The Overthinker",
    color: "green",
    glyph: "brain",
    image: "assets/The Overthinker.png",
    rarity: "Only 20% get this match.",
    tagline: "green, overanalysed, deeply felt",
    reasoning: "You check things in batches, host instead of going out, and mean it when you delete a photo. Careful, considered, a little guarded. We\u2019re both thinking three steps ahead of everyone else in the room.",
  },
  gremlin: {
    name: "The Chaos Gremlin",
    color: "charcoal",
    glyph: "skull",
    image: "assets/The Chaos Gremlin.png",
    rarity: "Only 15% get this match.",
    tagline: "black, feral, no notifications needed",
    reasoning: "Notifications are only on for the people who\u2019ve earned it, your Fridays are anime marathons, and honestly you don\u2019t want to know your screen time. Unpredictable, a little nostalgic, entirely your own thing. Same.",
  },
};

const COLOURS = [
  { key: "pink", hex: "#f2c9dc" },
  { key: "blue", hex: "#4e8fa3" },
  { key: "orange", hex: "#f3b98a" },
  { key: "green", hex: "#d9e6b8" },
  { key: "charcoal", hex: "#2b2b2b" },
  { key: "white", hex: "#ffffff" },
  { key: "purple", hex: "#d8c8ea" },
  { key: "lightblue", hex: "#c3dcea" },
  { key: "yellow", hex: "#f3e6a8" },
];

const GLYPHS = {
  smiley: ["0000000","0110110","0110110","0000000","1000001","0111110","0000000"],
  heart:  ["0110110","1111111","1111111","1111111","0111110","0011100","0001000"],
  wink:   ["0000000","0111000","0000000","0000000","1000001","0111110","0000000"],
  camera: ["0000000","0111110","1000001","1011101","1000001","0111110","0000000"],
  moon:   ["0001100","0011110","0111100","0111000","0111100","0011110","0001100"],
  brain:  ["0011000","0111100","1101101","1111111","1101101","0111100","0011000"],
  skull:  ["0111110","1111111","1101101","1111111","0111110","0100010","0111110"],
  eye:    ["0000000","0111110","1101101","1111111","1101101","0111110","0000000"],
  sparkle:["0001000","0101010","0011100","1111111","0011100","0101010","0001000"],
  bolt:   ["0001100","0011000","0110000","1111111","0000110","0001100","0011000"],
  note:   ["0000110","0000101","0000100","0000100","0000100","0111100","1111100"],
  battery:["0011100","1111111","1000001","1000001","1011101","1000001","1111111"],
  cloud:  ["0000000","0001000","0011100","0111110","1111111","0111110","0000000"],
  flame:  ["0001000","0001000","0011100","0111110","1111111","0111110","0011100"],
};
const GLYPH_ORDER = ["smiley","heart","wink","camera","moon","brain","skull","eye","sparkle","bolt","note","battery","cloud","flame"];

// Each glyph's second pose — the Recustomise phone flips between a glyph and
// this version so it feels alive (smiley winks, skull opens its mouth, the
// bolt flips, etc.). Every pose is kept centred in its 7x7 grid.
const mirrorRows = (rows) => rows.map((r) => r.split("").reverse().join(""));
const GLYPH_ALT = {
  smiley:  ["0000000","0110000","0110110","0000000","1000001","0111110","0000000"], // winks
  heart:   ["0000000","0110110","1111111","0111110","0011100","0001000","0000000"], // beats smaller
  wink:    ["0000000","0110110","0110110","0000000","1000001","0111110","0000000"], // opens both eyes
  camera:  ["0000000","0111110","1011101","1010101","1011101","0111110","0000000"], // lens focuses
  moon:    ["0001110","0011000","0110000","0110000","0110000","0011000","0001110"], // thin crescent
  brain:   ["0011000","0111100","1110111","1111111","1110111","0111100","0011000"], // folds shift
  skull:   ["0111110","1111111","1101101","1111111","0111110","0000000","0111110"], // mouth opens wider
  eye:     ["0000000","0000000","0011100","1111111","0011100","0000000","0000000"], // blinks
  sparkle: ["1000001","0100010","0010100","0001000","0010100","0100010","1000001"], // spins to an X
  bolt:    mirrorRows(GLYPHS.bolt),                                                   // flips horizontally
  note:    mirrorRows(GLYPHS.note),                                                   // flips horizontally
  battery: ["0011100","1111111","1011101","1011101","1011101","1011101","1111111"], // charges up
  cloud:   ["0001000","0011100","0111110","1111111","0000000","0101010","0010100"], // starts to rain
  flame:   ["0000100","0001000","0011100","0111110","1111111","0111110","0011100"], // flickers
};

// ---------- Recustomise: canvas-based recolouring ----------
// Each archetype's "(Recustomisable)" base art uses two flat fills sharing
// one hue — a lighter and a darker shade — with the glyph lens left blank.
// The light/dark RGB values below were sampled straight out of those PNGs.
// To recolour we find pixels close to those two references and blend them
// toward a new light/dark pair generated from the chosen swatch. Black
// (lenses/outlines), white, the grey camera housing and the red flash accent
// sit far from both references, so they're left untouched automatically.
//
// NOTE: these filenames follow the same "assets/<Name>.png" convention as
// ARCHETYPES above. Adjust the strings here if your recustomisable files
// are named differently.
const RECOLOR_REF = {
  enjoyer:      { base: "assets/The 326GB Enjoyer (Recustomisable).png",   light: [241, 232, 238], dark: [224, 178, 209] },
  silent:       { base: "assets/The Silent Operator (Recustomisable).png", light: [176, 199, 214], dark: [104, 147, 175] },
  doomscroller: { base: "assets/The Doomscroller (Recustomisable).png",    light: [241, 199, 166], dark: [224, 150, 92] },
  overthinker:  { base: "assets/The Overthinker (Recustomisable).png",     light: [228, 233, 209], dark: [188, 200, 143] },
  gremlin:      { base: "assets/The Chaos Gremlin (Recustomisable).png",   light: [101, 106, 115], dark: [44, 47, 52] },
};

// Position of the blank glyph lens as a fraction of image width/height —
// measured from the source art, and identical across all five files.
const GLYPH_CIRCLE = { cxFrac: 0.6549, cyFrac: 0.2013, rFrac: 0.1426 };

// ---------- State ----------

const state = {
  quizIndex: 0,
  answers: [], // selected option index per question
  scores: {},
  resultKey: null,
  custom: { colour: null, glyph: null },
};

// ---------- Screen navigation ----------

function showScreen(id) {
  const current = document.querySelector(".screen.active");
  const next = document.getElementById(id);
  if (current === next) return;

  // Stop animating any phone that isn't on the screen we're heading to.
  document.querySelectorAll(".phone-mock").forEach((el) => {
    if (!next.contains(el)) stopPhoneAnimation(el);
  });

  if (current) current.classList.remove("active");
  next.classList.add("active", "entering");

  // force layout so the browser registers the "entering" (offset/transparent)
  // state before we remove it — otherwise there's nothing to transition from.
  void next.offsetWidth;
  requestAnimationFrame(() => next.classList.remove("entering"));

  window.scrollTo(0, 0);
}

// ---------- Phone mock renderer ----------
// CSS-drawn placeholder — shown instantly while the canvas composite is
// still being built, and as a fallback if the base art can't be loaded.
function renderPhone(el, colourKey, glyphKey, label) {
  el.classList.remove("has-photo");
  const colour = COLOURS.find((c) => c.key === colourKey) || COLOURS[0];
  el.style.setProperty("--phone-color", colour.hex);
  el.dataset.label = label || "NOTHING";
  el.innerHTML = "";

  const glyphDot = document.createElement("div");
  glyphDot.className = "phone-glyph-dot";
  glyphDot.appendChild(renderGlyphMatrix(glyphKey, "#fff"));
  el.appendChild(glyphDot);

  const swatchDot = document.createElement("div");
  swatchDot.className = "phone-swatch-dot";
  el.appendChild(swatchDot);

  const charm = document.createElement("div");
  charm.className = "phone-charm";
  el.appendChild(charm);
}

// Real artwork — used wherever the phone result is fixed (landing, reveal,
// why, other matches), and for the composited recolour output.
function renderPhoneImage(el, src, alt) {
  el.classList.add("has-photo");
  el.style.removeProperty("--phone-color");
  el.innerHTML = `<img class="phone-photo" src="${src}" alt="${alt}">`;
}

function renderGlyphMatrix(glyphKey, dotColor) {
  const rows = GLYPHS[glyphKey] || GLYPHS.smiley;
  const wrap = document.createElement("div");
  wrap.className = "glyph-matrix";
  wrap.style.gridTemplateColumns = `repeat(${rows[0].length}, 1fr)`;
  wrap.style.gridTemplateRows = `repeat(${rows.length}, 1fr)`;
  wrap.style.padding = "22%";
  rows.forEach((row) => {
    row.split("").forEach((bit) => {
      const dot = document.createElement("div");
      dot.className = "glyph-dot" + (bit === "0" ? " off" : "");
      if (bit === "1") dot.style.background = dotColor || "#111";
      wrap.appendChild(dot);
    });
  });
  return wrap;
}

// ---------- Colour maths (hex <-> RGB <-> HSL) ----------

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function colorDist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

// Build a light/dark pair around any swatch's own lightness. ±11 points
// matches the spread measured across the real artwork (14–24, averaging ~19),
// so a new colour still gets its own lighter and darker shade.
function getTargetShades(hex) {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const delta = 11;
  return {
    light: hslToRgb(h, s, Math.min(l + delta, 96)),
    dark: hslToRgb(h, s, Math.max(l - delta, 4)),
  };
}

// ---------- Image loading (cached) ----------

const _imageCache = {};
function loadImage(src) {
  if (_imageCache[src]) return _imageCache[src];
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load " + src));
    img.src = src;
  });
  _imageCache[src] = p;
  return p;
}

// ---------- Canvas recolour + glyph overlay ----------

const RECOLOR_TOLERANCE = 46; // within this distance of a reference, fully replaced
const RECOLOR_FEATHER = 26;   // fades out over this extra distance, softening anti-aliased edges

// Composite at the source art's own native resolution (~1714px wide) for the
// sharpest possible result — anything higher would just be upscaling.
const RECOLOR_RENDER_WIDTH = Infinity;

// The expensive part (the per-pixel recolour) depends only on archetype +
// colour, NOT on the glyph, so it's cached on its own. That means switching
// glyphs — or animating between a glyph's two frames — never repeats it.
// Canvases at native resolution are big (~24MB each), so only the few most
// recently used are kept. Promises are cached so two quick requests for the
// same colour share one pass instead of both doing the work.
const _baseCanvasCache = new Map();
const BASE_CACHE_LIMIT = 4;

function getRecoloredBase(archetypeKey, colourKey) {
  const key = `${archetypeKey}|${colourKey}`;
  if (_baseCanvasCache.has(key)) {
    const cached = _baseCanvasCache.get(key);
    _baseCanvasCache.delete(key); // re-insert to mark as most recently used
    _baseCanvasCache.set(key, cached);
    return cached;
  }

  const promise = buildRecoloredBase(archetypeKey, colourKey);
  _baseCanvasCache.set(key, promise);
  promise.catch(() => _baseCanvasCache.delete(key)); // don't cache failures
  while (_baseCanvasCache.size > BASE_CACHE_LIMIT) {
    _baseCanvasCache.delete(_baseCanvasCache.keys().next().value);
  }
  return promise;
}

async function buildRecoloredBase(archetypeKey, colourKey) {
  const ref = RECOLOR_REF[archetypeKey];
  if (!ref) throw new Error("No recolour reference for " + archetypeKey);
  const colour = COLOURS.find((c) => c.key === colourKey) || COLOURS[0];
  const target = getTargetShades(colour.hex);
  const img = await loadImage(ref.base);

  // Never upscale past the source art's own resolution.
  const targetWidth = Math.min(RECOLOR_RENDER_WIDTH, img.width);
  const scale = targetWidth / img.width;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const maxDist = RECOLOR_TOLERANCE + RECOLOR_FEATHER;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // transparent
    const px = [data[i], data[i + 1], data[i + 2]];
    const dLight = colorDist(px, ref.light);
    const dDark = colorDist(px, ref.dark);
    const closest = dLight <= dDark ? "light" : "dark";
    const d = closest === "light" ? dLight : dDark;
    if (d >= maxDist) continue; // far from both references — leave it alone
    const t = d <= RECOLOR_TOLERANCE ? 1 : 1 - (d - RECOLOR_TOLERANCE) / RECOLOR_FEATHER;
    const tc = target[closest];
    data[i] = px[0] + (tc[0] - px[0]) * t;
    data[i + 1] = px[1] + (tc[1] - px[1]) * t;
    data[i + 2] = px[2] + (tc[2] - px[2]) * t;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas; // recoloured body, glyph lens still blank
}

function glyphGeometry(w, h) {
  return {
    cx: w * GLYPH_CIRCLE.cxFrac,
    cy: h * GLYPH_CIRCLE.cyFrac,
    r: w * GLYPH_CIRCLE.rFrac,
  };
}

// ---------- Animated phone (the glyph flips between two poses) ----------

const GLYPH_ANIM_MS = 800; // how long each pose is held before flipping

// Which colour to draw a phone in. null means "leave the artwork's own
// colours alone" — used whenever the person hasn't picked a different colour,
// so an untouched phone looks exactly like the supplied art.
function customColourFor(archetypeKey) {
  const a = ARCHETYPES[archetypeKey];
  return state.custom.colour && state.custom.colour !== a.color ? state.custom.colour : null;
}

function getBaseForPhone(archetypeKey, colourKey) {
  return colourKey
    ? getRecoloredBase(archetypeKey, colourKey)
    : loadImage(RECOLOR_REF[archetypeKey].base);
}

function sourceSize(src) {
  return [src.naturalWidth || src.width, src.naturalHeight || src.height];
}

function stopPhoneAnimation(el) {
  clearInterval(el._glyphTimer);
  el._glyphTimer = null;
}

// Flat PNG of a phone (first pose of the glyph) — used for downloading.
const _recolorCache = {};

async function recolorPhoneDataUrl(archetypeKey, colourKey, glyphKey) {
  const cacheKey = `${archetypeKey}|${colourKey || "original"}|${glyphKey}`;
  if (_recolorCache[cacheKey]) return _recolorCache[cacheKey];

  const base = await getBaseForPhone(archetypeKey, colourKey);
  const [w, h] = sourceSize(base);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(base, 0, 0, w, h);

  const { cx, cy, r } = glyphGeometry(w, h);
  drawGlyphOnCanvas(ctx, glyphKey, cx, cy, r, 0);

  const dataUrl = canvas.toDataURL("image/png");
  _recolorCache[cacheKey] = dataUrl;
  return dataUrl;
}

// Draws a phone into `el` as a live canvas and flips its glyph between the
// two poses. Only the glyph is redrawn each flip, so it stays smooth.
async function renderAnimatedPhone(el, archetypeKey, colourKey, glyphKey, alt) {
  stopPhoneAnimation(el);
  const token = (el._animToken = (el._animToken || 0) + 1);

  try {
    const base = await getBaseForPhone(archetypeKey, colourKey);
    if (token !== el._animToken) return; // a newer render took over
    const screenEl = el.closest(".screen");
    if (screenEl && !screenEl.classList.contains("active")) return; // they've moved on

    const [w, h] = sourceSize(base);
    const live = document.createElement("canvas");
    live.className = "phone-photo";
    live.width = w;
    live.height = h;
    live.setAttribute("role", "img");
    live.setAttribute("aria-label", alt || "Nothing phone");
    const ctx = live.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    const { cx, cy, r } = glyphGeometry(w, h);

    const draw = (frame) => {
      ctx.drawImage(base, 0, 0, w, h);
      drawGlyphOnCanvas(ctx, glyphKey, cx, cy, r, frame);
    };
    draw(0);

    el.classList.add("has-photo");
    el.style.removeProperty("--phone-color");
    el.innerHTML = "";
    el.appendChild(live);
    el._phoneArchetype = archetypeKey;

    let frame = 0;
    el._glyphTimer = setInterval(() => {
      frame = frame === 0 ? 1 : 0;
      draw(frame);
    }, GLYPH_ANIM_MS);
  } catch (err) {
    console.warn("Animated phone render failed:", err);
  }
}

// Renders whatever the person currently has selected into `el`, with the
// glyph animating. Used by the Reveal, Why and Share screens.
async function renderCurrentPhone(el, alt) {
  const a = ARCHETYPES[state.resultKey];
  if (!a) return;

  if (!RECOLOR_REF[state.resultKey]) {
    stopPhoneAnimation(el);
    renderPhoneImage(el, a.image, alt || a.name);
    return;
  }

  const colourKey = customColourFor(state.resultKey);
  if (colourKey) {
    // A recolour can take a moment — show the quick placeholder meanwhile.
    stopPhoneAnimation(el);
    renderPhone(el, state.custom.colour, state.custom.glyph);
  } else if (el._phoneArchetype !== state.resultKey) {
    // Don't leave a previous result's phone showing after a retake.
    stopPhoneAnimation(el);
    el.innerHTML = "";
  }

  await renderAnimatedPhone(el, state.resultKey, colourKey, state.custom.glyph, alt || a.name);
}

function drawGlyphOnCanvas(ctx, glyphKey, cx, cy, r, frame = 0) {
  // frame 0 = the glyph as shown in the picker, frame 1 = its alternate
  // pose (used for the little animation on the Recustomise phone).
  const rows =
    (frame === 1 && GLYPH_ALT[glyphKey]) || GLYPHS[glyphKey] || GLYPHS.smiley;
  const cols = rows[0].length;
  const rowCount = rows.length;
  const boxSize = r * 2 * 0.597; // 0.78 base, -15% then another -10%
  const cellSize = boxSize / Math.max(cols, rowCount);
  const startX = cx - (cellSize * cols) / 2;
  const startY = cy - (cellSize * rowCount) / 2;
  const dotRadius = cellSize * 0.42;

  ctx.fillStyle = "#ffffff";
  rows.forEach((row, ri) => {
    row.split("").forEach((bit, ci) => {
      if (bit !== "1") return;
      ctx.beginPath();
      ctx.arc(
        startX + cellSize * (ci + 0.5),
        startY + cellSize * (ri + 0.5),
        dotRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  });
}

// ---------- Dot-matrix UI icons (back arrow, share, download, chevrons) ----------
// Same pixel-dot language as the Doto font / glyph patterns, applied to
// every small interface icon so the whole app reads as one visual system.
const UI_ICONS = {
  chevronLeft:  ["00100","01000","10000","01000","00100"],
  chevronRight: ["00100","00010","00001","00010","00100"],
  download: ["00100","00100","00100","01110","00000","11111"],
  share:    ["00100","01110","00100","00100","00000","11111"],
};

function buildDotMatrix(rows, cellSize) {
  const cols = rows[0].length;
  const rowCount = rows.length;
  const wrap = document.createElement("div");
  wrap.className = "icon-dot-matrix";
  wrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  wrap.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
  // Size by a fixed per-cell dimension rather than a forced square box —
  // these bitmaps aren't all the same aspect ratio (share/download are
  // 5x6, chevrons are 5x5), and squashing a non-square grid into a square
  // container stretches each cell, turning the round dots into ellipses.
  const gap = 1; // must match the gap used for dot spacing
  wrap.style.gap = `${gap}px`;
  wrap.style.width = `${cols * cellSize + (cols - 1) * gap}px`;
  wrap.style.height = `${rowCount * cellSize + (rowCount - 1) * gap}px`;
  rows.forEach((row) => {
    row.split("").forEach((bit) => {
      const dot = document.createElement("div");
      dot.className = "icon-dot" + (bit === "0" ? " off" : "");
      wrap.appendChild(dot);
    });
  });
  return wrap;
}

function initUIIcons() {
  document.querySelectorAll("[data-dir], [data-icon]").forEach((el) => {
    let rows = null;
    if (el.dataset.dir === "left") rows = UI_ICONS.chevronLeft;
    else if (el.dataset.dir === "right") rows = UI_ICONS.chevronRight;
    else if (el.dataset.icon === "download") rows = UI_ICONS.download;
    else if (el.dataset.icon === "share") rows = UI_ICONS.share;
    if (!rows) return;

    let cellSize = 1.6; // inline chevrons: ~12px wide overall
    if (el.closest(".btn-back-arrow")) cellSize = 3.2; // back arrow: ~20px wide
    else if (el.dataset.icon) cellSize = 3.2; // share/download: ~20px wide, ~24px tall

    el.innerHTML = "";
    el.appendChild(buildDotMatrix(rows, cellSize));
  });
}

// ---------- Quiz ----------

function renderQuiz() {
  const q = QUESTIONS[state.quizIndex];
  document.getElementById("quiz-question").textContent = q.text;
  document.getElementById("quiz-count").textContent = `${state.quizIndex + 1}/${QUESTIONS.length}`;

  const pct = Math.round(((state.quizIndex) / QUESTIONS.length) * 100);
  document.getElementById("quiz-progress-fill").style.width = pct + "%";
  document.getElementById("quiz-progress-label").textContent = pct + "%";

  const answersEl = document.getElementById("quiz-answers");
  answersEl.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    const label = document.createElement("span");
    label.className = "answer-btn-label";
    label.textContent = opt.label;
    btn.appendChild(label);
    if (state.answers[state.quizIndex] === i) btn.classList.add("selected");
    btn.addEventListener("click", () => {
      state.answers[state.quizIndex] = i;
      renderQuiz();
    });
    answersEl.appendChild(btn);
  });

  document.getElementById("btn-back").style.visibility = state.quizIndex === 0 ? "hidden" : "visible";
  document.getElementById("btn-next").textContent = state.quizIndex === QUESTIONS.length - 1 ? "Finish" : "Next";
}

function startQuiz() {
  stopLandingPhoneCycle();
  state.quizIndex = 0;
  state.answers = [];
  showScreen("screen-quiz");
  renderQuiz();
}

function computeResult() {
  const scores = { enjoyer: 0, silent: 0, doomscroller: 0, overthinker: 0, gremlin: 0 };
  QUESTIONS.forEach((q, qi) => {
    const chosen = state.answers[qi];
    if (chosen === undefined) return; // unanswered question contributes nothing
    const s = q.options[chosen].scores;
    Object.keys(s).forEach((k) => (scores[k] += s[k]));
  });

  // Pick the highest score. On an exact tie, prefer whichever archetype
  // picked up the most *primary* (3pt) hits, so a tie isn't just decided
  // by object key order — it still traces back to the actual answers.
  const primaryHits = { enjoyer: 0, silent: 0, doomscroller: 0, overthinker: 0, gremlin: 0 };
  QUESTIONS.forEach((q, qi) => {
    const chosen = state.answers[qi];
    if (chosen === undefined) return;
    const s = q.options[chosen].scores;
    const topKey = Object.keys(s).reduce((a, b) => (s[a] >= s[b] ? a : b));
    primaryHits[topKey] += 1;
  });

  let best = null;
  Object.keys(scores).forEach((k) => {
    if (
      best === null ||
      scores[k] > scores[best] ||
      (scores[k] === scores[best] && primaryHits[k] > primaryHits[best])
    ) {
      best = k;
    }
  });

  state.resultKey = best;
  state.custom.colour = ARCHETYPES[best].color;
  state.custom.glyph = ARCHETYPES[best].glyph;

  console.log("Quiz answers:", state.answers);
  console.log("Scores:", scores, "\u2192 result:", best);
}

// ---------- Calculating ----------

let _glyphLoaderTimer = null;

function runCalculating() {
  showScreen("screen-calculating");
  document.body.classList.add("calc-dark");

  const fill = document.getElementById("calc-progress-fill");
  const label = document.getElementById("calc-progress-label");
  const status = document.getElementById("calc-status");
  const loader = document.getElementById("dot-loader");

  // Cycle through the glyph patterns as the "thinking" animation, fading
  // between each one.
  loader.innerHTML = '<div class="glyph-loader-frame"></div>';
  const frame = loader.querySelector(".glyph-loader-frame");
  let glyphIndex = 0;
  const showGlyph = () => {
    frame.classList.remove("in");
    setTimeout(() => {
      frame.innerHTML = "";
      frame.appendChild(renderGlyphMatrix(GLYPH_ORDER[glyphIndex], "#fff"));
      frame.classList.add("in");
      glyphIndex = (glyphIndex + 1) % GLYPH_ORDER.length;
    }, 180);
  };
  showGlyph();
  clearInterval(_glyphLoaderTimer);
  _glyphLoaderTimer = setInterval(showGlyph, 650);

  const messages = ["Reading your vibe\u2026", "Cross-checking your screen time\u2026", "Matching your energy\u2026"];
  let pct = 0;
  status.textContent = messages[0];
  const timer = setInterval(() => {
    pct += 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(timer);
      clearInterval(_glyphLoaderTimer);
      document.body.classList.remove("calc-dark");
      computeResult();
      setTimeout(renderReveal, 400);
    }
    fill.style.width = pct + "%";
    label.textContent = pct + "%";
    if (pct > 30 && pct < 34) status.textContent = messages[1];
    if (pct > 65 && pct < 69) status.textContent = messages[2];
  }, 60);
}

// ---------- Reveal ----------

function renderReveal() {
  const a = ARCHETYPES[state.resultKey];
  document.getElementById("reveal-name").textContent = a.name;
  document.getElementById("reveal-rarity").textContent = a.rarity;
  renderCurrentPhone(document.getElementById("reveal-phone"), a.name);
  showScreen("screen-reveal");
}

// ---------- Why this match ----------

function renderWhy() {
  const a = ARCHETYPES[state.resultKey];
  document.getElementById("why-name").textContent = a.name;
  document.getElementById("why-tagline").textContent = a.tagline;
  document.getElementById("why-reasoning").textContent = a.reasoning;
  renderCurrentPhone(document.getElementById("why-phone"), a.name);
  renderCompareList();
  showScreen("screen-why");
}

function renderCompareList() {
  const list = document.getElementById("compare-list");
  list.innerHTML = "";

  QUESTIONS.forEach((q, qi) => {
    const chosenIdx = state.answers[qi];
    if (chosenIdx === undefined) return; // quiz was retaken/skipped somehow
    const opt = q.options[chosenIdx];

    const row = document.createElement("div");
    row.className = "compare-row";
    row.innerHTML = `
      <p class="compare-question">${q.text}</p>
      <div class="compare-bar-head">
        <span class="compare-answer">${opt.label}</span>
        <span class="compare-pct doto">${opt.popularity}%</span>
      </div>
      <div class="compare-bar-track">
        <div class="compare-bar-fill" style="width:${opt.popularity}%"></div>
      </div>
    `;
    list.appendChild(row);
  });
}

// ---------- Other matches ----------

function renderOther() {
  const a = ARCHETYPES[state.resultKey];
  document.getElementById("other-your-name").textContent = a.name;
  renderPhoneImage(document.getElementById("other-your-phone"), a.image, a.name);

  const grid = document.getElementById("other-grid");
  grid.innerHTML = "";
  Object.keys(ARCHETYPES).forEach((key) => {
    if (key === state.resultKey) return;
    const arche = ARCHETYPES[key];
    const item = document.createElement("div");
    item.className = "other-item";
    const phone = document.createElement("div");
    phone.className = "phone-mock";
    item.appendChild(phone);
    const p = document.createElement("p");
    p.textContent = arche.name;
    item.appendChild(p);
    grid.appendChild(item);
    renderPhoneImage(phone, arche.image, arche.name);
  });

  showScreen("screen-other");
}

// ---------- Recustomise ----------

function renderRecustomise() {
  document.getElementById("colour-grid").innerHTML = "";
  document.getElementById("glyph-grid").innerHTML = "";

  COLOURS.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "swatch" + (state.custom.colour === c.key ? " selected" : "");
    btn.style.background = c.hex;
    btn.addEventListener("click", () => {
      state.custom.colour = c.key;
      updateRecustomisePhone();
      renderRecustomise();
    });
    document.getElementById("colour-grid").appendChild(btn);
  });

  GLYPH_ORDER.forEach((g) => {
    const btn = document.createElement("button");
    btn.className = "glyph-swatch" + (state.custom.glyph === g ? " selected" : "");
    btn.appendChild(renderGlyphMatrix(g, state.custom.glyph === g ? "#fff" : "#111"));
    btn.addEventListener("click", () => {
      state.custom.glyph = g;
      updateRecustomisePhone();
      renderRecustomise();
    });
    document.getElementById("glyph-grid").appendChild(btn);
  });

  updateRecustomisePhone();
  showScreen("screen-recustomise");
}

async function updateRecustomisePhone() {
  const el = document.getElementById("recustomise-phone");
  stopPhoneAnimation(el);

  // Instant placeholder so tapping a swatch feels immediate; replaced by the
  // real artwork as soon as it's ready.
  renderPhone(el, state.custom.colour, state.custom.glyph);

  if (!state.resultKey || !RECOLOR_REF[state.resultKey]) return;
  await renderAnimatedPhone(
    el,
    state.resultKey,
    customColourFor(state.resultKey),
    state.custom.glyph,
    "Your customised phone"
  );
}

function setTab(tab) {
  document.getElementById("tab-colour").classList.toggle("active", tab === "colour");
  document.getElementById("tab-glyph").classList.toggle("active", tab === "glyph");
  document.getElementById("panel-colour").classList.toggle("hidden", tab !== "colour");
  document.getElementById("panel-glyph").classList.toggle("hidden", tab !== "glyph");
}

// ---------- Share ----------

function renderShare() {
  const a = ARCHETYPES[state.resultKey];
  renderCurrentPhone(document.getElementById("share-phone"), a.name);
  showScreen("screen-share");
}

// ---------- Toast (download / share confirmation) ----------

let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "toast";
    toast.innerHTML = '<span class="toast-check"></span><span class="toast-msg"></span>';
    document.body.appendChild(toast);
  }
  toast.querySelector(".toast-msg").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Wire up events ----------

document.getElementById("btn-start").addEventListener("click", startQuiz);

document.getElementById("btn-back").addEventListener("click", () => {
  if (state.quizIndex === 0) return;
  state.quizIndex -= 1;
  renderQuiz();
});

document.getElementById("btn-next").addEventListener("click", () => {
  if (state.answers[state.quizIndex] === undefined) return; // require an answer
  if (state.quizIndex === QUESTIONS.length - 1) {
    runCalculating();
  } else {
    state.quizIndex += 1;
    renderQuiz();
  }
});

document.getElementById("btn-recustomise-1").addEventListener("click", renderRecustomise);
document.getElementById("btn-recustomise-2").addEventListener("click", renderRecustomise);
document.getElementById("btn-retake-1").addEventListener("click", startQuiz);
document.getElementById("btn-retake-2").addEventListener("click", startQuiz);
document.getElementById("btn-share-icon-1").addEventListener("click", renderShare);
document.getElementById("btn-share-icon-2").addEventListener("click", shareResult);
document.getElementById("btn-download").addEventListener("click", downloadPhoneImage);
document.getElementById("btn-see-why").addEventListener("click", renderWhy);
document.getElementById("btn-why-back").addEventListener("click", renderReveal);
document.getElementById("btn-go-back").addEventListener("click", renderReveal);
document.getElementById("btn-recustomise-back").addEventListener("click", renderReveal);
document.getElementById("btn-done").addEventListener("click", renderReveal);
document.getElementById("btn-share-back").addEventListener("click", renderReveal);
document.getElementById("btn-see-other").addEventListener("click", renderOther);
document.getElementById("btn-see-other-1").addEventListener("click", renderOther);
function openNothingWebsite() {
  // Force a real popup window (not just a new tab) with explicit size/position.
  window.open(
    "https://au.nothing.tech/",
    "nothingTechWindow",
    "noopener,noreferrer,width=480,height=860,left=120,top=60"
  );
}
document.getElementById("btn-meet-real-life").addEventListener("click", openNothingWebsite);
document.getElementById("btn-visit-nothing").addEventListener("click", openNothingWebsite);

async function downloadPhoneImage() {
  const arche = ARCHETYPES[state.resultKey];
  if (!arche) {
    showToast("Still loading, try again");
    return;
  }

  let href = arche.image;
  if (RECOLOR_REF[state.resultKey]) {
    try {
      // Same phone (and same first pose) as the one on screen.
      href = await recolorPhoneDataUrl(
        state.resultKey,
        customColourFor(state.resultKey),
        state.custom.glyph
      );
    } catch (err) {
      showToast("Couldn't prepare the image");
      return;
    }
  }

  const isDefault = state.custom.colour === arche.color && state.custom.glyph === arche.glyph;
  const suffix = isDefault ? "" : `-${state.custom.colour}-${state.custom.glyph}`;

  const a = document.createElement("a");
  a.href = href;
  a.download = arche.name.replace(/\s+/g, "-") + suffix + ".png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("Downloaded!");
}

function shareResult() {
  const a = ARCHETYPES[state.resultKey];
  const shareData = {
    title: "Which Nothing Phone 3 are you?",
    text: a ? `I'm ${a.name}. Find your match:` : "Find your Nothing Phone 3 match:",
    url: window.location.href,
  };
  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => showToast("Shared!"))
      .catch(() => {
        /* user cancelled the share sheet — no toast needed */
      });
  } else if (navigator.clipboard) {
    navigator.clipboard
      .writeText(shareData.url)
      .then(() => showToast("Link copied!"))
      .catch(() => showToast("Shared!"));
  } else {
    showToast("Shared!");
  }
}

document.getElementById("tab-colour").addEventListener("click", () => setTab("colour"));
document.getElementById("tab-glyph").addEventListener("click", () => setTab("glyph"));

let _landingCycleTimer = null;
let _landingGlyphTimer = null;

function startLandingPhoneCycle() {
  const el = document.getElementById("screen-landing").querySelector(".phone-mock");
  const keys = Object.keys(ARCHETYPES);
  const LANDING_MAX_WIDTH = 900; // shown at ~230 CSS px, so this is plenty and keeps two live canvases light
  let i = 0;
  let frame = 0;
  let aIsVisible = true;
  let swapping = false;

  // Two stacked canvases, alternating which is on top — the next phone fades
  // IN at the same time the current one fades OUT (a real crossfade), and
  // each one's glyph keeps animating the whole time.
  el.classList.add("has-photo", "crossfade");
  el.style.removeProperty("--phone-color");
  el.innerHTML =
    '<canvas class="phone-photo layer-a layer-visible"></canvas>' +
    '<canvas class="phone-photo layer-b"></canvas>';
  const layers = {
    a: { canvas: el.querySelector(".layer-a"), base: null, glyph: null },
    b: { canvas: el.querySelector(".layer-b"), base: null, glyph: null },
  };

  const drawLayer = (layer) => {
    if (!layer.base) return;
    const { canvas } = layer;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    const { cx, cy, r } = glyphGeometry(canvas.width, canvas.height);
    ctx.drawImage(layer.base, 0, 0, canvas.width, canvas.height);
    drawGlyphOnCanvas(ctx, layer.glyph, cx, cy, r, frame);
  };

  const loadLayer = async (layer, key) => {
    const base = await loadImage(RECOLOR_REF[key].base);
    const [sw, sh] = sourceSize(base);
    const scale = Math.min(1, LANDING_MAX_WIDTH / sw);
    layer.canvas.width = Math.round(sw * scale);
    layer.canvas.height = Math.round(sh * scale);
    layer.base = base;
    layer.glyph = ARCHETYPES[key].glyph;
    drawLayer(layer);
  };

  const swap = async () => {
    if (swapping) return; // previous swap still loading — skip this beat
    swapping = true;
    try {
      i = (i + 1) % keys.length;
      const showing = aIsVisible ? layers.a : layers.b;
      const hidden = aIsVisible ? layers.b : layers.a;
      await loadLayer(hidden, keys[i]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          showing.canvas.classList.remove("layer-visible");
          hidden.canvas.classList.add("layer-visible");
        });
      });
      aIsVisible = !aIsVisible;
    } catch (err) {
      console.warn("Landing phone swap failed:", err);
    }
    swapping = false;
  };

  loadLayer(layers.a, keys[0]).catch((err) => console.warn("Landing phone failed to load:", err));

  clearInterval(_landingCycleTimer);
  clearInterval(_landingGlyphTimer);
  _landingCycleTimer = setInterval(swap, 1500);
  _landingGlyphTimer = setInterval(() => {
    frame = frame === 0 ? 1 : 0;
    drawLayer(layers.a);
    drawLayer(layers.b);
  }, GLYPH_ANIM_MS);
}

function stopLandingPhoneCycle() {
  clearInterval(_landingCycleTimer);
  clearInterval(_landingGlyphTimer);
}

// ---------- Init ----------
startLandingPhoneCycle();
initUIIcons();