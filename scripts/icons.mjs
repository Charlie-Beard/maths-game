/**
 * Renders the home-screen icons (public/icons/*.png) from scripts/icon-art.ts.
 * Starts a throwaway Vite dev server so the TypeScript art engine can be
 * imported as it is, then screenshots the SVG at each size with Playwright.
 *
 *   PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/icons.mjs
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const SIZES = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 };
const out = new URL('../public/icons/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const server = await createServer({ server: { port: 5190 }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  for (const [file, size] of Object.entries(SIZES)) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.goto(url + 'lab.html');
    const markup = await page.evaluate(async () => (await import('/scripts/icon-art.ts')).iconSvg());
    await page.setContent(
      `<style>html,body{margin:0;overflow:hidden}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`,
    );
    await page.screenshot({ path: out + file, clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
    console.log('wrote', out + file);
  }
} finally {
  await browser.close();
  await server.close();
}
