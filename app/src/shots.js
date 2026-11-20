// Fixed scenes for screenshots: ?shot=cover shows the exported poster alone,
// ?shot=editor shows the studio with a sample loaded. Query params:
//   photo (sample file stem), grade, style, title, tagline, size (WxH),
//   stars (1/0), badge (1/0). window.__shotReady is set once painted.
import { EXPORT_SIZES } from './main.js';

function paramFlag(params, name, fallback) {
  const v = params.get(name);
  if (v === null) return fallback;
  return v !== '0' && v.toLowerCase() !== 'false';
}

export async function runShot(shot, params, state, actions) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');

  const photoStem = params.get('photo') ?? 'sunset';
  const sample = { file: `${photoStem}.jpg`, focusX: 0.5, focusY: 0.52, zoom: 1.0 };
  if (photoStem === 'beach') { sample.focusY = 0.40; sample.zoom = 1.05; }
  if (photoStem === 'portrait') { sample.focusY = 0.42; sample.zoom = 1.05; }
  if (photoStem === 'yacht' || photoStem === 'field' || photoStem === 'boulevard') {
    sample.focusY = 0.45; sample.zoom = 1.0;
  }

  // Size the preview canvas to the requested export size for cover shots,
  // so the screenshot IS the exported cover at that size.
  const sizeParam = params.get('size');
  const canvas = document.getElementById('cover');
  if (shot === 'cover' && sizeParam) {
    const [w, h] = sizeParam.split('x').map(Number);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      canvas.width = w;
      canvas.height = h;
    }
  } else if (shot === 'cover') {
    canvas.width = EXPORT_SIZES.wide.w;
    canvas.height = EXPORT_SIZES.wide.h;
  }

  const grade = params.get('grade');
  if (grade) actions.pickGrade(grade);
  const style = params.get('style');
  if (style) actions.pickPosterStyle(style);
  const title = params.get('title');
  if (title !== null) {
    document.getElementById('title').value = title;
    actions.editTitle(title);
  }
  const tagline = params.get('tagline');
  if (tagline !== null) {
    document.getElementById('tagline').value = tagline;
    actions.editTagline(tagline);
  }
  const billing = params.get('billing');
  if (billing !== null) {
    document.getElementById('billing').value = billing;
    actions.editBilling(billing);
  }
  actions.toggleStars(paramFlag(params, 'stars', true));
  actions.toggleBadge(paramFlag(params, 'badge', true));
  document.getElementById('stars').checked = state.stars;
  document.getElementById('badge').checked = state.badge;

  await actions.loadSamplePhoto(sample);
  actions.redraw();

  // Two frames so fonts + paint settle, then signal readiness.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
