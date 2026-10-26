import { createServer } from 'node:http';
import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';

// Production-output harness: no source serving, route fallback, or SPA rewrite.
const root = realpathSync(resolve(import.meta.dirname, '../dist'));
const port = Number(process.env.PORT ?? 4173);
const configuredBase = process.env.STATIC_BASE_PATH ?? '/';
if (!/^\/(?:[^?#\\]*\/)?$/.test(configuredBase) || configuredBase.includes('..')) {
  throw new Error('STATIC_BASE_PATH must be an absolute directory path ending in /');
}
const base = configuredBase;
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt; charset=utf-8',
  '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
};

createServer((request, response) => {
  const reject = (status) => { response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end(status === 404 ? 'Not found' : 'Bad request'); };
  if (!['GET', 'HEAD'].includes(request.method ?? '')) { reject(405); return; }
  let url;
  let pathname;
  try {
    url = new URL(request.url ?? '/', 'http://localhost');
    pathname = decodeURIComponent(url.pathname);
  } catch { reject(400); return; }
  if (pathname.includes('\0') || pathname.includes('\\')) { reject(400); return; }
  if (base !== '/' && pathname === base.slice(0, -1)) {
    response.writeHead(301, { Location: `${base}${url.search}` }); response.end(); return;
  }
  if (!pathname.startsWith(base)) { reject(404); return; }
  let path = resolve(root, pathname.slice(base.length));
  if (path !== root && !path.startsWith(`${root}${sep}`)) { reject(404); return; }
  if (!existsSync(path)) { reject(404); return; }
  if (statSync(path).isDirectory()) {
    if (!pathname.endsWith('/')) {
      response.writeHead(301, { Location: `${url.pathname}/${url.search}` }); response.end(); return;
    }
    path = resolve(path, 'index.html');
  }
  if (!existsSync(path) || !statSync(path).isFile()) { reject(404); return; }
  const realPath = realpathSync(path);
  if (realPath !== root && !realPath.startsWith(`${root}${sep}`)) { reject(404); return; }
  response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  if (request.method === 'HEAD') { response.end(); return; }
  createReadStream(path).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Serving dist at http://127.0.0.1:${port}${base}`));
