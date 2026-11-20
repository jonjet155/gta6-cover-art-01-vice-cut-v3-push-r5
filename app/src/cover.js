// VICE CUT — cover painter. One photo, one face, one poster.
// Draws the whole one-sheet onto a canvas: the hero photo cover-fit with a
// pan/zoom transform, a colour grade, the neon CUT slash across the LOWER
// third (never over the face), the VICE CUT lockup, the Caveat tagline and
// the poster furniture (seal, stars, VOL. 06, billing block).

export const GRADES = {
  sunset: { label: 'Warm Sunset', sky: 'rgba(255,122,60,0.20)', low: 'rgba(214,32,120,0.42)', wash: 'rgba(255,170,80,0.10)' },
  neon: { label: 'Neon Night', sky: 'rgba(120,40,255,0.22)', low: 'rgba(255,20,150,0.45)', wash: 'rgba(40,200,255,0.10)' },
  teal: { label: 'Teal Coast', sky: 'rgba(0,180,190,0.16)', low: 'rgba(0,90,110,0.40)', wash: 'rgba(0,220,200,0.08)' },
  ink: { label: 'Ink Mono', sky: 'rgba(0,0,0,0.10)', low: 'rgba(0,0,0,0.55)', wash: 'rgba(255,255,255,0.06)' },
};

export const STYLES = {
  fullbleed: 'Full-Bleed',
  split: 'Split',
  duotone: 'Duotone',
  framed: 'Framed',
};

/** Fits `photo` into the canvas with a zoom + pan transform, keeping the focus point centred. */
export function drawPhotoCover(ctx, photo, w, h, transform) {
  const zoom = transform.zoom || 1;
  const fx = transform.focusX ?? 0.5;
  const fy = transform.focusY ?? 0.42;
  const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * base;
  const ph = photo.naturalHeight * base;
  // Centre the focus point, then apply the user's pan on top.
  const x = w / 2 - fx * pw + (transform.panX || 0);
  const y = h / 2 - fy * ph + (transform.panY || 0);
  ctx.save();
  ctx.drawImage(photo, x, y, pw, ph);
  ctx.restore();
  return { x, y, pw, ph };
}

/** Washes the photo with the chosen grade: a warm/neon/teal sky tint up top, a deep tint low down. */
export function applyGrade(ctx, w, h, grade, photoTop, photoBottom) {
  const g = GRADES[grade] || GRADES.sunset;
  const top = photoTop ?? 0;
  const bottom = photoBottom ?? h;
  const span = bottom - top;
  const wash = ctx.createLinearGradient(0, top, 0, bottom);
  wash.addColorStop(0, g.sky);
  wash.addColorStop(0.55, 'rgba(0,0,0,0)');
  wash.addColorStop(1, g.low);
  ctx.fillStyle = wash;
  ctx.fillRect(0, top, w, span);
  ctx.fillStyle = g.wash;
  ctx.fillRect(0, top, w, span);
  if (grade === 'ink') {
    ctx.fillStyle = 'rgba(20,16,28,0.35)';
    ctx.fillRect(0, top, w, span);
  }
  // Vignette: darkens the edges so the face stays the brightest thing on the poster.
  const vig = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.35, w / 2, h * 0.5, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,4,20,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, top, w, span);
}

/** The CUT: a thin neon diagonal slash (pink -> purple) across the lower third.
 *  Its highest point stays at 0.64 of the height, so it can never touch the face. */
export function drawNeonSlash(ctx, w, h, top, bottom) {
  const yLeft = bottom - (bottom - top) * 0.18;
  const yRight = top + (bottom - top) * 0.10;
  const grad = ctx.createLinearGradient(0, yLeft, w, yRight);
  grad.addColorStop(0, '#ff2e88');
  grad.addColorStop(0.5, '#ff5ce1');
  grad.addColorStop(1, '#8b5cf6');
  ctx.save();
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(3, h * 0.006);
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255,46,136,0.9)';
  ctx.shadowBlur = h * 0.02;
  ctx.beginPath();
  ctx.moveTo(w * 0.02, yLeft);
  ctx.lineTo(w * 0.98, yRight);
  ctx.stroke();
  ctx.restore();
}

/** The diagonal slash glyph that slices between the words VICE and CUT, at about 30 degrees. */
export function drawSlashGlyph(ctx, x, y, size) {
  const grad = ctx.createLinearGradient(x - size * 0.3, y + size * 0.5, x + size * 0.3, y - size * 0.5);
  grad.addColorStop(0, '#ff2e88');
  grad.addColorStop(1, '#8b5cf6');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(255,46,136,0.85)';
  ctx.shadowBlur = size * 0.12;
  const w = size * 0.14;
  const h = size * 1.05;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, w / 2);
  ctx.fill();
  ctx.restore();
}

/** The VICE CUT lockup: VICE in solid white (or dark ink on a light frame), CUT in a
 *  neon pink->purple gradient, split by the slash glyph, with a thick dark outline
 *  and drop shadow. */
export function drawTitleLockup(ctx, w, h, title, top, bottom, dark) {
  const words = (title || 'VICE CUT').trim().toUpperCase().split(/\s+/);
  const first = words[0] || 'VICE';
  const rest = words.slice(1).join(' ') || 'CUT';
  const bandH = bottom - top;
  let size = bandH * 0.62;
  ctx.textBaseline = 'middle';
  const gap = size * 0.55;
  const measure = (s) => {
    ctx.font = `${size}px "Bebas Neue", sans-serif`;
    return ctx.measureText(s).width;
  };
  while (measure(first) + measure(rest) + gap > w * 0.94 && size > 10) {
    size -= 2;
  }
  ctx.font = `${size}px "Bebas Neue", sans-serif`;
  const total = measure(first) + measure(rest) + gap;
  let x = (w - total) / 2;
  const cy = top + bandH * 0.52;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, size * 0.07);
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.85)' : 'rgba(12,4,24,0.9)';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.05;
  // VICE in solid white (dark ink on a light frame).
  ctx.fillStyle = dark ? '#1d1420' : '#ffffff';
  ctx.strokeText(first, x, cy);
  ctx.fillText(first, x, cy);
  x += measure(first) + gap / 2;
  // The CUT glyph between the words.
  drawSlashGlyph(ctx, x, cy, size);
  x += gap / 2;
  // CUT in a neon gradient.
  const grad = ctx.createLinearGradient(x, cy - size / 2, x + measure(rest), cy + size / 2);
  grad.addColorStop(0, '#ff5ce1');
  grad.addColorStop(0.55, '#ff2e88');
  grad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(255,46,136,0.75)';
  ctx.strokeText(rest, x, cy);
  ctx.fillText(rest, x, cy);
  ctx.restore();
}

/** The Caveat tagline tucked tight under the title. */
export function drawTagline(ctx, w, h, tagline, titleBottom, dark) {
  const text = (tagline || '').trim();
  if (!text) return;
  let size = h * 0.042;
  ctx.font = `700 ${size}px Caveat, cursive`;
  while (ctx.measureText(text).width > w * 0.8 && size > 10) {
    size -= 1;
    ctx.font = `700 ${size}px Caveat, cursive`;
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = dark ? '#3a1c4d' : '#ffe9f4';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = size * 0.25;
  ctx.fillText(text, w / 2, titleBottom + size * 0.75);
  ctx.restore();
}

/** Round seal / stamp in a corner: ORIGINAL COVER ART - EST. 2026. */
export function drawSeal(ctx, w, h, corner) {
  const r = Math.min(w, h) * 0.062;
  const cx = corner === 'left' ? r * 1.25 : w - r * 1.25;
  const cy = r * 1.25;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(corner === 'left' ? -0.12 : 0.12);
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.fillStyle = 'rgba(20,6,30,0.45)';
  ctx.lineWidth = Math.max(1.5, r * 0.045);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = r * 0.19;
  ctx.font = `${fs}px "Bebas Neue", sans-serif`;
  ctx.fillText('ORIGINAL', 0, -r * 0.28);
  ctx.fillText('COVER ART', 0, -r * 0.02);
  ctx.font = `${fs * 0.85}px "Bebas Neue", sans-serif`;
  ctx.fillText('EST. 2026', 0, r * 0.3);
  ctx.restore();
}

/** Five stars, drawn in code. */
export function drawStars(ctx, w, h, y, size) {
  ctx.save();
  ctx.fillStyle = '#ffd166';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = size * 0.2;
  const gap = size * 1.5;
  const total = gap * 4 + size;
  let x = (w - total) / 2 + size / 2;
  for (let i = 0; i < 5; i++) {
    drawOneStar(ctx, x, y, size / 2);
    x += gap;
  }
  ctx.restore();
}

export function drawOneStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** The tiny movie-poster credits line at the very bottom. */
export function drawBillingBlock(ctx, w, h, billing, dark) {
  const text = (billing || 'A LEONIDA STORY — ONE COAST · NO RULES · COMING SOON').trim().toUpperCase();
  if (!text) return;
  let size = Math.max(9, h * 0.016);
  ctx.font = `${size}px "Bebas Neue", sans-serif`;
  while (ctx.measureText(text).width > w * 0.92 && size > 7) {
    size -= 0.5;
    ctx.font = `${size}px "Bebas Neue", sans-serif`;
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = dark ? 'rgba(29,20,32,0.85)' : 'rgba(255,255,255,0.88)';
  ctx.shadowColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = size * 0.3;
  ctx.fillText(text, w / 2, h - size * 1.1);
  ctx.restore();
}

/** The VOL. 06 mark, top-left. */
export function drawVolumeMark(ctx, w, h, dark) {
  const size = Math.max(11, h * 0.02);
  ctx.save();
  ctx.font = `${size}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = dark ? 'rgba(29,20,32,0.9)' : 'rgba(255,255,255,0.92)';
  ctx.shadowColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = size * 0.3;
  ctx.fillText('VOL. 06', w * 0.03, h * 0.025);
  ctx.restore();
}

/** The whole poster. `state` carries photo, transform, grade, style, title,
 *  tagline, billing, stars and badge. Draws at the canvas's own pixel size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const style = state.style || 'fullbleed';
  const grade = state.grade || 'sunset';
  const photo = state.photo || null;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);

  // Photo area per style.
  let photoTop = 0;
  let photoBottom = h;
  let frame = null;
  if (style === 'split') {
    photoBottom = h * 0.66;
  } else if (style === 'framed') {
    const m = Math.min(w, h) * 0.045;
    frame = { x: m, y: m, w: w - m * 2, h: h - m * 2 };
    photoTop = frame.y;
    photoBottom = frame.y + frame.h * 0.78;
  }

  if (style === 'framed') {
    ctx.fillStyle = '#f6f1e3';
    ctx.fillRect(0, 0, w, h);
  }

  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, photoTop, w, photoBottom - photoTop);
    ctx.clip();
    if (style === 'duotone' || grade === 'ink') {
      ctx.filter = 'grayscale(1) contrast(1.08)';
    } else if (grade === 'neon') {
      ctx.filter = 'saturate(1.25) contrast(1.05)';
    } else if (grade === 'teal') {
      ctx.filter = 'saturate(1.1)';
    } else {
      ctx.filter = 'saturate(1.18) contrast(1.04)';
    }
    // The photo band starts at photoTop in canvas space: translate down so the
    // cover-fit math (which centres on the band height) lands inside the clip.
    ctx.translate(0, photoTop);
    drawPhotoCover(ctx, photo, w, photoBottom - photoTop, {
      ...state.transform,
      focusY: state.transform?.focusY ?? 0.42,
    });
    ctx.restore();
    ctx.filter = 'none';
  } else {
    // No photo yet: a sunset gradient placeholder so the poster still reads.
    const g = ctx.createLinearGradient(0, photoTop, 0, photoBottom);
    g.addColorStop(0, '#ff9a3d');
    g.addColorStop(0.55, '#ff5e7a');
    g.addColorStop(1, '#7b2ff7');
    ctx.fillStyle = g;
    ctx.fillRect(0, photoTop, w, photoBottom - photoTop);
  }

  // Grade wash + vignette over the photo band.
  if (style === 'duotone') {
    applyGrade(ctx, w, h, 'ink', photoTop, photoBottom);
    const neon = ctx.createLinearGradient(0, photoBottom, 0, photoTop);
    neon.addColorStop(0, 'rgba(255,46,136,0.28)');
    neon.addColorStop(1, 'rgba(139,92,246,0.18)');
    ctx.fillStyle = neon;
    ctx.fillRect(0, photoTop, w, photoBottom - photoTop);
  } else {
    applyGrade(ctx, w, h, grade, photoTop, photoBottom);
  }

  // Title zone per style. The slash's highest point never rises above 0.64h,
  // so it can never cross the face (face lives in the upper ~60%).
  let titleTop;
  let titleBottom;
  let slashTop;
  let slashBottom;
  if (style === 'split') {
    ctx.fillStyle = '#14081f';
    ctx.fillRect(0, photoBottom, w, h - photoBottom);
    titleTop = photoBottom + (h - photoBottom) * 0.08;
    titleBottom = h * 0.93;
    slashTop = photoBottom + (h - photoBottom) * 0.04;
    slashBottom = h * 0.97;
  } else if (style === 'framed') {
    titleTop = photoBottom + (h - photoBottom) * 0.06;
    titleBottom = h - Math.min(w, h) * 0.045 - h * 0.045;
    slashTop = photoBottom + (h - photoBottom) * 0.02;
    slashBottom = h - Math.min(w, h) * 0.045;
  } else {
    titleTop = h * 0.70;
    titleBottom = h * 0.90;
    slashTop = h * 0.67;
    slashBottom = h * 0.94;
  }

  // The CUT slash, low on the poster, below the chin. On Full-Bleed and
  // Duotone the title sits on the photo itself and the hero's hair falls
  // into the lower third, so the long line would cross her head: there the
  // slash lives ONLY as the glyph between the words VICE and CUT (drawn in
  // drawTitleLockup). On Split and Framed the title block sits clear of the
  // photo, so the long line runs across that block safely.
  if (style === 'split' || style === 'framed') {
    drawNeonSlash(ctx, w, h, slashTop, slashBottom);
  }

  // Lockup + tagline. On the cream frame the lettering is dark ink.
  const darkInk = style === 'framed';
  drawTitleLockup(ctx, w, h, state.title, titleTop, titleBottom, darkInk);
  drawTagline(ctx, w, h, state.tagline, titleBottom, darkInk);

  // Furniture.
  if (state.badge !== false) drawSeal(ctx, w, h, 'right');
  drawVolumeMark(ctx, w, h, darkInk);
  if (state.stars !== false) {
    const starY = style === 'split' ? h * 0.965 : h * 0.955;
    drawStars(ctx, w, h, starY, Math.max(10, h * 0.018));
  }
  drawBillingBlock(ctx, w, h, state.billing, darkInk);

  if (style === 'framed' && frame) {
    ctx.save();
    ctx.strokeStyle = '#1d1420';
    ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.006);
    ctx.strokeRect(frame.x, frame.y, frame.w, frame.h * 0.78);
    ctx.restore();
  }
}
