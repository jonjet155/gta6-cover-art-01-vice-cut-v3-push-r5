// VICE CUT — editor wiring. Three steps from photo to poster:
//  1. uploadPhoto / loadSamplePhoto + cropPhoto + positionPhoto
//  2. pickGrade + pickPosterStyle + editTitle / editTagline / editBilling
//  3. exportPNG in 1080x1080, 1080x1350 or 1920x1080.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, GRADES, STYLES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const titleInput = document.getElementById('title');
const taglineInput = document.getElementById('tagline');
const billingInput = document.getElementById('billing');
const zoomInput = document.getElementById('zoom');
const sampleStrip = document.getElementById('samples');

export const SAMPLES = [
  { file: 'sunset.jpg', label: 'Sunset Face', focusX: 0.5, focusY: 0.52, zoom: 1.0 },
  { file: 'beach.jpg', label: 'Beach Dusk', focusY: 0.40, zoom: 1.05 },
  { file: 'portrait.jpg', label: 'Golden Portrait', focusY: 0.42, zoom: 1.05 },
  { file: 'yacht.jpg', label: 'Dusk Yacht', focusY: 0.45, zoom: 1.0 },
  { file: 'field.jpg', label: 'Golden Field', focusY: 0.42, zoom: 1.0 },
  { file: 'boulevard.jpg', label: 'Boulevard Gold', focusY: 0.45, zoom: 1.0 },
];

export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

const state = {
  photo: null,
  photoName: 'sunset.jpg',
  transform: { zoom: 1.0, panX: 0, panY: 0, focusX: 0.5, focusY: 0.52 },
  grade: 'sunset',
  style: 'fullbleed',
  title: 'VICE CUT',
  tagline: 'Painted in Leonida.',
  billing: 'A LEONIDA STORY — ONE COAST · NO RULES · COMING SOON',
  stars: true,
  badge: true,
};

let fontsReady = false;

function redraw() {
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + url));
    img.src = url;
  });
}

/** Waits for the OFL lettering (Bebas Neue + Caveat) so the first paint is already in the right fonts. */
export async function ensureFonts() {
  if (fontsReady) return;
  try {
    await Promise.all([
      document.fonts.load('100px "Bebas Neue"'),
      document.fonts.load('700 40px Caveat'),
      document.fonts.load('600 40px Caveat'),
    ]);
    await document.fonts.ready;
  } catch {
    // The poster still draws with the fallback stack; the woff2 files ship with the app.
  }
  fontsReady = true;
}

/** Step 1 — reads the user's own photo from their machine (never uploaded) and places it. */
export async function uploadPhoto(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  try {
    state.photo = await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
  state.photoName = file.name;
  state.transform = { zoom: 1, panX: 0, panY: 0, focusX: 0.5, focusY: 0.42 };
  zoomInput.value = '100';
  redraw();
  statusEl.textContent = 'Photo placed — drag to position, zoom to crop.';
}

/** Step 1 — loads one of the preloaded sunset/neon samples, with its tuned focus + zoom. */
export async function loadSamplePhoto(sample) {
  state.photo = await loadImage(`samples/${sample.file}`);
  state.photoName = sample.file;
  state.transform = {
    zoom: sample.zoom ?? 1,
    panX: 0,
    panY: 0,
    focusX: sample.focusX ?? 0.5,
    focusY: sample.focusY ?? 0.42,
  };
  zoomInput.value = String(Math.round(state.transform.zoom * 100));
  redraw();
}

/** Step 1 — zooms the photo (crop) from the slider. */
export function cropPhoto(percent) {
  state.transform.zoom = Math.max(0.5, Math.min(3, percent / 100));
  redraw();
}

/** Step 1 — pans the photo inside the poster by dragging it. */
export function positionPhoto(dx, dy) {
  state.transform.panX += dx;
  state.transform.panY += dy;
  redraw();
}

/** Step 2 — picks one of the four colour grades. */
export function pickGrade(grade) {
  if (!GRADES[grade]) return;
  state.grade = grade;
  document.querySelectorAll('[data-grade]').forEach((b) => b.classList.toggle('active', b.dataset.grade === grade));
  redraw();
}

/** Step 2 — picks one of the four poster styles. */
export function pickPosterStyle(style) {
  if (!STYLES[style]) return;
  state.style = style;
  document.querySelectorAll('[data-style]').forEach((b) => b.classList.toggle('active', b.dataset.style === style));
  redraw();
}

/** Step 2 — edits the title. */
export function editTitle(text) {
  state.title = text;
  redraw();
}

/** Step 2 — edits the tagline. */
export function editTagline(text) {
  state.tagline = text;
  redraw();
}

/** Step 2 — edits the billing block. */
export function editBilling(text) {
  state.billing = text;
  redraw();
}

/** Step 2 — toggles the five stars. */
export function toggleStars(on) {
  state.stars = on;
  redraw();
}

/** Step 2 — toggles the round seal. */
export function toggleBadge(on) {
  state.badge = on;
  redraw();
}

/** Renders the current poster at an exact export size and returns the canvas. */
export function renderExport(sizeKey) {
  const size = EXPORT_SIZES[sizeKey] || EXPORT_SIZES.square;
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  return off;
}

/** Step 3 — exports the poster as a PNG at an exact size, via the real download path. */
export function exportPNG(sizeKey) {
  const size = EXPORT_SIZES[sizeKey] || EXPORT_SIZES.square;
  const off = renderExport(sizeKey);
  off.toBlob((blob) => {
    if (!blob) {
      statusEl.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cut-${size.w}x${size.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved vice-cut-${size.w}x${size.h}.png`;
  }, 'image/png');
}

/** Exposes the live state for the screenshot scenes and for tests. */
export function getState() {
  return state;
}

// --- Wire the controls -------------------------------------------------
document.getElementById('photo').addEventListener('change', (e) => {
  uploadPhoto(e.target.files[0]);
});

const dropZone = document.getElementById('dropzone');
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('over');
  uploadPhoto(e.dataTransfer.files[0]);
});
dropZone.addEventListener('click', () => document.getElementById('photo').click());

let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  positionPhoto((e.clientX - lastX) * scale, (e.clientY - lastY) * scale);
  lastX = e.clientX;
  lastY = e.clientY;
});
canvas.addEventListener('pointerup', () => { dragging = false; });

zoomInput.addEventListener('input', () => cropPhoto(Number(zoomInput.value)));
titleInput.addEventListener('input', () => editTitle(titleInput.value));
taglineInput.addEventListener('input', () => editTagline(taglineInput.value));
billingInput.addEventListener('input', () => editBilling(billingInput.value));
document.getElementById('stars').addEventListener('change', (e) => toggleStars(e.target.checked));
document.getElementById('badge').addEventListener('change', (e) => toggleBadge(e.target.checked));

document.querySelectorAll('[data-grade]').forEach((b) => {
  b.addEventListener('click', () => pickGrade(b.dataset.grade));
});
document.querySelectorAll('[data-style]').forEach((b) => {
  b.addEventListener('click', () => pickPosterStyle(b.dataset.style));
});
document.querySelectorAll('[data-export]').forEach((b) => {
  b.addEventListener('click', () => exportPNG(b.dataset.export));
});

// Sample strip: click a sample to load it.
for (const sample of SAMPLES) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sample';
  btn.title = sample.label;
  const img = document.createElement('img');
  img.src = `samples/${sample.file}`;
  img.alt = sample.label;
  img.loading = 'lazy';
  btn.appendChild(img);
  const cap = document.createElement('span');
  cap.textContent = sample.label;
  btn.appendChild(cap);
  btn.addEventListener('click', () => loadSamplePhoto(sample));
  sampleStrip.appendChild(btn);
}

// --- Boot ---------------------------------------------------------------
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  ensureFonts().then(() => runShot(shot, params, state, { loadSamplePhoto, loadImage, redraw, pickGrade, pickPosterStyle, editTitle, editTagline, editBilling, toggleStars, toggleBadge }));
} else {
  ensureFonts().then(async () => {
    await loadSamplePhoto(SAMPLES[0]);
    redraw();
  });
}
