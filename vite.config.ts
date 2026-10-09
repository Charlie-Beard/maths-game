import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, searchForWorkspaceRoot, type Plugin } from 'vite';
import { voiceReview } from './scripts/voice/review-server.ts';

/**
 * Writes sw.js after the build, so the game works fully offline once it has
 * been opened on the iPad.
 *
 * The app itself (code, art, fonts: about 1.5 MB) is cached on install. The
 * voice clips (about 4,000 files, 90 MB) are not: asking GitHub Pages for
 * them all at once gets the iPad rate-limited ("Rate limit exceeded"), and
 * one failed file would fail the whole install. Instead the page asks the
 * worker to fill them in a couple at a time, backing off when told to slow
 * down and carrying on where it stopped on the next visit. Clips live in
 * their own cache, keyed by their content hash, so a new deploy only
 * downloads the clips that changed.
 */
function serviceWorker(): Plugin {
  return {
    name: 'faraway-sw',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = new Set<string>(Object.keys(bundle));
      // Bundle names already carry content hashes; public files (audio) don't,
      // so hash their bytes, or a re-recorded clip would never reach a device
      // that has the old one cached.
      const contents = createHash('sha1');
      const clips: Record<string, string> = {};
      const walk = (dir: string) => {
        for (const f of readdirSync(dir).sort()) {
          const p = join(dir, f);
          if (statSync(p).isDirectory()) walk(p);
          else {
            const path = relative('public', p).split('\\').join('/');
            const bytes = readFileSync(p);
            contents.update(bytes);
            if (path.endsWith('.mp3')) clips[path] = createHash('sha1').update(bytes).digest('hex').slice(0, 8);
            else files.add(path);
          }
        }
      };
      walk('public');
      files.delete('sw.js');
      const list = ['./', ...[...files].filter((f) => !f.endsWith('.map')).sort()];
      const version = contents.update(list.join('|')).digest('hex').slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `// Generated at build time (vite.config.ts). Cache-first, fully offline.
const SHELL = 'faraway-maths-${version}';
const AUDIO = 'faraway-maths-audio';
const FILES = ${JSON.stringify(list)};
const CLIPS = ${JSON.stringify(clips)};
const scope = new URL(self.registration.scope);
const clipKey = (path) => new URL(path + '?v=' + CLIPS[path], scope).href;
const clipPath = (url) => {
  const u = new URL(url);
  const path = u.origin === scope.origin && u.pathname.startsWith(scope.pathname) ? u.pathname.slice(scope.pathname.length) : '';
  return path in CLIPS ? path : null;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== AUDIO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Fills the audio cache gently: two at a time, a pause between, and a long
// wait (then giving up until the next visit) when the server pushes back.
let filling = null;
function fill() {
  return (filling ??= (async () => {
    const cache = await caches.open(AUDIO);
    const wanted = new Set(Object.keys(CLIPS).map(clipKey));
    const have = new Set();
    for (const req of await cache.keys()) {
      if (wanted.has(req.url)) have.add(req.url);
      else await cache.delete(req);
    }
    const todo = Object.keys(CLIPS).filter((p) => !have.has(clipKey(p)));
    let strikes = 0;
    const worker = async () => {
      while (todo.length && strikes < 3) {
        const path = todo.shift();
        try {
          const res = await fetch(new URL(path, scope), { cache: 'no-cache' });
          if (res.ok) {
            await cache.put(clipKey(path), res);
            await wait(150);
            continue;
          }
          todo.push(path);
          if (res.status === 429 || res.status >= 500) {
            strikes++;
            await wait(60000 * strikes);
          }
        } catch {
          todo.push(path);
          strikes++;
          await wait(30000 * strikes);
        }
      }
    };
    await Promise.all([worker(), worker()]);
  })().finally(() => (filling = null)));
}
self.addEventListener('message', (e) => {
  if (e.data === 'fill-audio') e.waitUntil(fill());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const clip = clipPath(e.request.url);
  if (clip) {
    // A clip not filled in yet comes from the network, and is kept.
    e.respondWith(
      caches.open(AUDIO).then((c) =>
        c.match(clipKey(clip)).then(
          (hit) =>
            hit ||
            fetch(e.request).then((res) => {
              if (res.ok) c.put(clipKey(clip), res.clone());
              return res;
            }),
        ),
      ),
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(e.request, copy));
          }
          return res;
        }),
    ),
  );
});
`,
      });
    },
  };
}

export default defineConfig({
  // Relative paths so it works at https://charlie-beard.github.io/maths-game/
  base: './',
  build: {
    target: 'safari16',
    assetsInlineLimit: 0,
    // Only the game is built. lab.html (the art gallery) and review.html (the
    // voice review) are served by the dev server alone (npm run dev, then
    // /lab.html?set=lands or /review.html) and never ship.
    rollupOptions: { input: { main: 'index.html' } },
  },
  server: {
    host: true,
    // Agent worktrees symlink node_modules from the main checkout: let the
    // dev server serve files (fonts) from wherever it really lives.
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), realpathSync('node_modules')] },
  },
  plugins: [serviceWorker(), voiceReview()],
});
