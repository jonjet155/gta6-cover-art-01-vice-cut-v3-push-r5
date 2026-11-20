// VICE CUT — local dev server for app/ (Node 22, standard library only).
// Serves the offline poster studio on http://localhost:8080 so it can be tried
// in a desktop browser with no build step: `node serve.ts [--port N]`.
// Nothing here is part of the handed-in app: it only reads files under app/
// and refuses any path that climbs out of it.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.ttf', 'font/ttf'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function pickPort(argv) {
  const at = argv.indexOf('--port');
  const n = at === -1 ? 8080 : Number(argv[at + 1]);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8080;
}

const port = pickPort(process.argv.slice(2));

const server = createServer(async (req, res) => {
  let path = '/';
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(APP_ROOT, normalize(path)));
  if (file !== APP_ROOT && !file.startsWith(APP_ROOT + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  let body;
  try {
    body = await readFile(file);
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
    'content-length': body.length,
    'cache-control': 'no-store',
  });
  res.end(body);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`VICE CUT studio is on http://localhost:${port}`);
});
