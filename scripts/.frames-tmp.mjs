// Films a chapter's reward story onto ONE contact sheet, to check it by eye.
//
//   node scripts/storyshots.mjs l1c1 [out.png] [everyMs] [avatar]
//
// Starts its own dev server without live reload (so files saved meanwhile
// can't restart the story), plays the story with speech timed like the
// recorded voices (the dev server starts signed in), grabs a small frame every `everyMs` (default 1500) until
// the Next button appears, and writes them as a labelled grid to out.png
// (default test-results/<id>.png). Prints the length, the captions and any
// errors. One image to look at instead of dozens of screenshots.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const [, , id = 'l1c1', outDir = 'test-results/frames', times = '10', avatar = 'joe'] = process.argv;
const want = times.split(',').map(Number);
const out = outDir + '/x.png';
mkdirSync(dirname(out), { recursive: true });
const server = await createServer({ server: { port: 0, strictPort: false, hmr: false, watch: null }, logLevel: 'error', clearScreen: false });
await server.listen();
const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1, hasTouch: true });
await page.addInitScript((avatar) => {
  // A saved player who has chosen who to climb with, so the story can show them.
  const key = 'faraway-maths:v1:jasper';
  let p = {};
  try {
    p = JSON.parse(localStorage.getItem(key) ?? '{}') ?? {};
  } catch {}
  localStorage.setItem(key, JSON.stringify({ ...p, v: 1, name: 'Jasper', avatar }));
  // Speech that takes as long as a recorded line would (~15 characters a second).
  const synth = {
    getVoices: () => [],
    cancel() {},
    speak(u) {
      setTimeout(() => u.onend?.(), 400 + u.text.length * 65);
    },
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth });
  // When the story's Next button appears, by the page's own clock.
  new MutationObserver((_, obs) => {
    if (document.querySelector('[aria-label="Next"]')) {
      window.__storyEnd = performance.now();
      obs.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
}, avatar);
const errors = [];
// Unrecorded voice lines 404 and fall back to speech: not an error.
page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${origin}/?scene=story&id=${id}`);

const t0 = Date.now();
for (const s of want) {
  const dt = s * 1000 - (Date.now() - t0);
  if (dt > 0) await page.waitForTimeout(dt);
  await page.screenshot({ path: `${outDir}/${id}-${s}.png` });
}
if (errors.length) console.log('ERRORS:\n  ' + [...new Set(errors)].join('\n  '));
await browser.close();
await server.close();
