// VICE CUT — the hand-in program for gta6-cover-art-01 (Node 22, standard
// library only). The app is this directory's app/ folder: plain static files a
// desktop browser loads offline (app/index.html and its ES modules, the OFL
// fonts and the CC-licensed sample photos under app/, no library, no network
// request). This program copies app/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json, the summary the judge reads,
// with the vendored make.fun library. The cover art itself — one huge
// sunset face, the neon CUT slash low on the poster, the VICE CUT lockup —
// lives in app/src/cover.js and app/src/main.js.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

// Guard rails: refuse to hand in a broken entry instead of silently copying it.
if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error('app/index.html is missing — nothing to hand in');
}
if (!existsSync(shotsDir) || readdirSync(shotsDir).filter((f) => !f.startsWith('.')).length < 3) {
  throw new Error('screenshots/ needs at least 3 images — the judge reads them first');
}
for (const shot of readdirSync(shotsDir)) {
  const size = statSync(join(shotsDir, shot)).size;
  if (size > 262144) throw new Error(`screenshots/${shot} is ${size} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
// Start from a clean output: a previous run's stale files (an old sample, a
// removed screenshot) must never leak into the dossier of this run.
for (const stale of ['app', 'screenshots', 'dossier.json']) {
  rmSync(join(out, stale), { recursive: true, force: true });
}
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of
// app files in all, or a path under app/ over 1000 bytes: app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`VICE CUT handed in: ${join(out, 'app')} + ${join(out, 'screenshots')} + dossier.json`);
