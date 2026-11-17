import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import adminUsersHandler from './api/admin-users.js';

const root = dirname(fileURLToPath(import.meta.url));
const production = process.env.NODE_ENV === 'production';
for (const [key, value] of Object.entries(loadEnv(production ? 'production' : 'development', root, ''))) {
  if (process.env[key] === undefined) process.env[key] = value;
}
const vite = production ? null : await import('vite').then(({ createServer: createViteServer }) => createViteServer({ configFile: false, root, appType: 'spa', server: { middlewareMode: true } }));
const server = createServer((req, res) => {
  if (new URL(req.url, 'http://localhost').pathname === '/api/admin-users') {
    adminUsersHandler(req, res).catch((error) => {
      console.error('Admin user endpoint failed:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Terjadi kesalahan server.' }));
      }
    });
    return;
  }
  if (vite) {
    vite.middlewares(req, res, () => { res.statusCode = 404; res.end('Not found'); });
    return;
  }
  const distDir = resolve(root, 'dist');
  const requestedPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = resolve(distDir, `.${requestedPath}`);
  if (file !== distDir && !file.startsWith(`${distDir}${sep}`)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (!existsSync(file) || !statSync(file).isFile()) file = resolve(distDir, 'index.html');
  if (!existsSync(file)) { res.writeHead(503); res.end('Build the app before starting production.'); return; }
  const contentTypes = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
  res.writeHead(200, { 'Content-Type': contentTypes[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

const port = Number(process.env.PORT || 5173);
server.listen(port, '0.0.0.0', () => console.log(`Nusa Wear siap di http://localhost:${port}`));
server.on('close', () => { vite?.close(); });
