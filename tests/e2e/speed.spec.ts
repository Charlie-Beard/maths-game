/**
 * Speed on an older iPad (docs/REVIEW.md, phase 5). Skipped unless SPEED=1:
 *
 *   npm run build && npx vite preview --port 4354 &
 *   SPEED=1 PW_PORT=4354 PW_CHROMIUM=/opt/pw-browsers/chromium \
 *     npx playwright test tests/e2e/speed.spec.ts --workers=1 --project=home-screen
 *
 * It slows the CPU down (CDP Emulation.setCPUThrottlingRate; 4x and 6x are
 * roughly an older iPad), and for the cold start the network too (slow 4G),
 * on the production build. Every number is the median of SPEED_REPS runs
 * (3 by default), in milliseconds, and the whole table is printed at the end
 * and written to SPEED_OUT (default speed-results.json). SPEED_RATES picks
 * the throttling rates ("4,6"). The machine is shared and noisy: compare
 * before and after in the same conditions, never against another day.
 *
 * What is measured:
 *  - cold start: from the navigation to the title being up, and to the first
 *    problem (empty cache, so no service worker), on a fast and a slow network;
 *  - the second load, served by the service worker;
 *  - a whole chapter: each change of scene from the tap to the next screen
 *    being there, and each right answer from the tap to the first visible
 *    change and to the frame that shows it (this must stay under 100 ms);
 *  - frames while things move: rAF gaps over 33 ms and long tasks (over
 *    50 ms), per phase, in the title, map, intro, play, story, finale, album
 *    and the grown-ups' corner.
 */
import { expect, test, type Browser, type CDPSession, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { settled } from './wait';

const ON = !!process.env.SPEED;
const REPS = Number(process.env.SPEED_REPS ?? 3);
const RATES = (process.env.SPEED_RATES ?? '4,6').split(',').map(Number);
const OUT = process.env.SPEED_OUT ?? 'speed-results.json';
const PORT = Number(process.env.PW_PORT ?? 4173);

/** Lighthouse's "slow 4G". */
const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
const FAST = { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 };

/** Everything measured, by name, then by rate: a list of samples. */
const results: Record<string, Record<string, number[]>> = {};
function record(name: string, rate: number, ms: number | undefined): void {
  if (ms === undefined || Number.isNaN(ms)) return;
  ((results[name] ??= {})[`${rate}x`] ??= []).push(Math.round(ms * 10) / 10);
}
const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

/** Runs in the page before the game: marks, frame gaps, long tasks and answer latency. */
const PROBE = `(() => {
  const w = window;
  w.__phase = 'boot';
  w.__frames = {};      // phase -> rAF gaps
  w.__long = {};        // phase -> long task durations
  w.__fb = [];          // answers: {resp, paint}
  w.__tap = 0;
  let last = performance.now();
  const loop = (t) => {
    (w.__frames[w.__phase] ??= []).push(t - last);
    last = t;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) (w.__long[w.__phase] ??= []).push(e.duration);
    }).observe({ entryTypes: ['longtask'] });
  } catch {}
  // The moment he lets go of a finger: the start of every "tap to ..." time.
  window.addEventListener('pointerup', (e) => {
    w.__tap = e.timeStamp;
    if (!(e.target instanceof Element) || !e.target.closest('.choice, .np-key')) return;
    const t0 = e.timeStamp;
    const rec = { resp: -1, paint: -1 };
    const strip = (s) => (s || '').split(/\\s+/).filter((c) => c && c !== 'is-pressed').join(' ');
    const mo = new MutationObserver((ms) => {
      if (rec.resp >= 0) return;
      for (const m of ms) {
        if (m.type === 'attributes' && m.attributeName === 'class' && strip(m.oldValue) === strip(m.target.getAttribute('class'))) continue;
        rec.resp = performance.now() - t0;
        requestAnimationFrame(() => requestAnimationFrame(() => { rec.paint = performance.now() - t0; }));
        mo.disconnect();
        break;
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
    setTimeout(() => mo.disconnect(), 3000);
    w.__fb.push(rec);
  }, true);
  // The moment each screen first appears, for "open to ..." (the test only asks
  // after the page has loaded, so it could not tell when it really was there).
  const SEEN = ['.scene.title [aria-label="Play"]', '.scene.intro', '.scene.play[data-answer]', '.scene.album', '.scene.parent', '.scene.story', '.scene.map .map-stop', '.scene.intro button[aria-label="Play"]'];
  w.__seen = {};
  new MutationObserver(() => {
    for (const s of SEEN) if (!(s in w.__seen) && document.querySelector(s)) w.__seen[s] = performance.now();
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-answer', 'aria-label'] });
  // Time (since the last tap, or since the navigation if none) until a selector is on the page.
  w.__until = (sel, fromTap) => new Promise((resolve, reject) => {
    const from = fromTap ? w.__tap : 0;
    const giveUp = performance.now() + 60000;
    const tick = () => {
      if (!fromTap && sel in w.__seen) return resolve(w.__seen[sel]);
      if (document.querySelector(sel)) return resolve(performance.now() - from);
      if (performance.now() > giveUp) return reject(new Error('never saw ' + sel));
      requestAnimationFrame(tick);
    };
    tick();
  });
})();`;

interface Sess {
  page: Page;
  cdp: CDPSession;
  close(): Promise<void>;
}

/** A fresh browser context (empty cache, no service worker), signed in like the config's, throttled. */
async function open(browser: Browser, rate: number, net = FAST, height = 820): Promise<Sess> {
  const origin = `http://localhost:${PORT}`;
  const context = await browser.newContext({
    baseURL: origin,
    viewport: { width: 1180, height: height },
    hasTouch: true,
    deviceScaleFactor: 2,
    storageState: {
      cookies: [],
      origins: [{ origin, localStorage: [{ name: 'faraway-maths:auth', value: JSON.stringify({ token: 'test-jasper', who: 'jasper' }) }] }],
    },
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', net);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await page.addInitScript(PROBE);
  return { page, cdp, close: () => context.close() };
}

const phase = (page: Page, name: string) => page.evaluate((n) => void ((window as any).__phase = n), name);
const until = (page: Page, sel: string, fromTap = true) => page.evaluate(([s, f]) => (window as any).__until(s, f), [sel, fromTap] as const) as Promise<number>;

/** Frame gaps and long tasks of every phase so far, as numbers to record. */
async function frameStats(page: Page, rate: number, prefix: string): Promise<void> {
  const d = await page.evaluate(() => ({ f: (window as any).__frames as Record<string, number[]>, l: (window as any).__long as Record<string, number[]> }));
  for (const [ph, gaps] of Object.entries(d.f)) {
    if (ph === 'boot' || gaps.length < 20) continue;
    // The first gap is the wait for the phase to start being measured: skip it.
    const g = gaps.slice(1).sort((a, b) => a - b);
    const long = d.l[ph] ?? [];
    record(`${prefix} ${ph}: frames over 33 ms`, rate, g.filter((x) => x > 33).length);
    record(`${prefix} ${ph}: worst frame gap`, rate, g[g.length - 1]);
    record(`${prefix} ${ph}: long tasks (count)`, rate, long.length);
    record(`${prefix} ${ph}: long tasks (ms)`, rate, long.reduce((a, b) => a + b, 0));
  }
}

/** Boots a scene by its dev URL and watches it move for a few seconds. */
async function watch(browser: Browser, rate: number, label: string, url: string, ready: string, tapSel?: string, secs = 4): Promise<void> {
  const s = await open(browser, rate);
  await s.page.goto(url);
  record(`${label}: open to ready`, rate, await until(s.page, ready, false));
  if (tapSel) {
    const b = s.page.locator(tapSel).first();
    await settled(b);
    await phase(s.page, label);
    await b.click({ force: true });
  } else await phase(s.page, label);
  await s.page.waitForTimeout(secs * 1000);
  await frameStats(s.page, rate, 'frames');
  await s.close();
}

test.describe('speed on an older iPad', () => {
  test.skip(!ON, 'set SPEED=1 to measure');
  test.setTimeout(30 * 60_000);

  test.afterAll(() => {
    const table = Object.entries(results).map(([name, byRate]) => ({
      name,
      ...Object.fromEntries(Object.entries(byRate).map(([r, v]) => [r, median(v)])),
    }));
    // eslint-disable-next-line no-console
    console.log('\n' + table.map((t) => Object.entries(t).map(([k, v]) => (k === 'name' ? String(v).padEnd(58) : `${k}=${v}`)).join('  ')).join('\n'));
    writeFileSync(OUT, JSON.stringify(results, null, 1));
  });

  for (const rate of RATES) {
    test(`cold start at ${rate}x`, async ({ browser }) => {
      for (const [netName, net] of [['fast', FAST], ['slow 4G', SLOW_4G]] as const) {
        for (let i = 0; i < REPS; i++) {
          const s = await open(browser, rate, net);
          await s.page.goto('/?scene=chapter&id=l1c1&seed=7', { waitUntil: 'commit' });
          // Title is the front door; this URL goes to the intro, so measure it from the intro.
          record(`cold ${netName}: open to intro up`, rate, await until(s.page, '.scene.intro', false));
          const play = s.page.getByRole('button', { name: 'Play' });
          await settled(play);
          await play.click({ force: true });
          record(`cold ${netName}: intro tap to first problem`, rate, await until(s.page, '.scene.play[data-answer]'));
          await s.close();
          // The title itself.
          const t = await open(browser, rate, net);
          await t.page.goto('/', { waitUntil: 'commit' });
          record(`cold ${netName}: open to title up`, rate, await until(t.page, '.scene.title [aria-label="Play"]', false));
          const paints = await t.page.evaluate(() => performance.getEntriesByType('paint').map((p) => [p.name, p.startTime] as const));
          record(`cold ${netName}: first contentful paint`, rate, paints.find(([n]) => n === 'first-contentful-paint')?.[1]);
          await t.close();
        }
      }
    });

    test(`second load (service worker) at ${rate}x`, async ({ browser }) => {
      for (const [netName, net] of [['fast', FAST], ['slow 4G', SLOW_4G]] as const) {
        for (let i = 0; i < REPS; i++) {
          const s = await open(browser, rate, FAST);
          await s.page.goto('/');
          await s.page.evaluate(() => (navigator as any).serviceWorker.ready);
          // Wait for the precache to finish (install adds every file), then go slow.
          await expect.poll(() => s.page.evaluate(async () => (await caches.keys()).length), { timeout: 60_000 }).toBeGreaterThan(0);
          await s.page.waitForTimeout(1500);
          await s.cdp.send('Network.emulateNetworkConditions', net);
          await s.page.reload({ waitUntil: 'commit' });
          record(`warm ${netName}: open to title up`, rate, await until(s.page, '.scene.title [aria-label="Play"]', false));
          await s.close();
        }
      }
    });

    test(`one chapter, scene by scene, at ${rate}x`, async ({ browser }) => {
      for (let i = 0; i < REPS; i++) {
        const s = await open(browser, rate);
        const page = s.page;
        await page.goto('/?scene=map&seed=7');
        await until(page, '.map-stop.is-next', false);
        await phase(page, 'map');
        await page.waitForTimeout(2500);

        // The Treasure Room and back (112 pictures), then the map again.
        const treasure = page.getByRole('button', { name: 'Treasure Room' });
        if (await treasure.count()) {
          await settled(treasure);
          await treasure.click({ force: true });
          record('map to Treasure Room (first picture up)', rate, await until(page, '.scene.album .keepsake-item img'));
          await page.waitForTimeout(2500);
          await phase(page, 'treasure room');
          await page.waitForTimeout(2000);
          await phase(page, 'map');
          const back = page.getByRole('button', { name: 'Back to the map' });
          await settled(back);
          await back.click({ force: true });
          record('Treasure Room back to map', rate, await until(page, '.scene.map .map-stop.is-next'));
        }
        const stop = page.locator('.map-stop.is-next');
        await settled(stop);
        await stop.click({ force: true });
        record('map to intro', rate, await until(page, '.scene.intro button[aria-label="Play"]'));
        await phase(page, 'intro');
        const go = page.getByRole('button', { name: 'Play' });
        await settled(go);
        await go.click({ force: true });
        record('intro to first problem', rate, await until(page, '.scene.play[data-answer]'));
        await phase(page, 'play');

        const scene = page.locator('.scene.play');
        for (let n = 0; n < 8; n++) {
          await expect(page.locator('.pdot.done')).toHaveCount(n, { timeout: 60_000 });
          await expect(scene).toHaveAttribute('data-answer', /.+/);
          const answer = await scene.getAttribute('data-answer');
          const card = page.locator(`.choice[data-value="${answer}"]`);
          await settled(card);
          await card.click({ force: true });
        }
        record('last answer to story up', rate, await until(page, '.scene.story button[aria-label="Skip the story"]'));
        await phase(page, 'story');
        await page.waitForTimeout(6000);
        const skip = page.getByRole('button', { name: 'Skip the story' });
        await skip.click({ force: true });
        record('story skipped to reward up', rate, await until(page, '.scene.complete button[aria-label="Next"]'));
        await phase(page, 'reward');
        await page.waitForTimeout(3000);
        const next = page.getByRole('button', { name: 'Next' });
        await settled(next);
        await next.click({ force: true });
        record('reward to map', rate, await until(page, '.scene.map .map-stop'));

        const fb = await page.evaluate(() => (window as any).__fb as { resp: number; paint: number }[]);
        for (const f of fb) {
          record('right answer: tap to first change', rate, f.resp);
          record('right answer: tap to the frame showing it', rate, f.paint);
        }
        // Worst single answer of the run, which is what he would feel.
        record('right answer: worst tap to the frame showing it', rate, Math.max(...fb.map((f) => f.paint)));
        await frameStats(page, rate, 'chapter');
        await s.close();
      }
    });

    test(`scenes that move, at ${rate}x`, async ({ browser }) => {
      for (let i = 0; i < REPS; i++) {
        await watch(browser, rate, 'title', '/', '.scene.title [aria-label="Play"]');
        await watch(browser, rate, 'map (idle)', '/?scene=map', '.scene.map .map-stop');
        await watch(browser, rate, 'story l1c1', '/?scene=story&id=l1c1', '.scene.story', undefined, 8);
        await watch(browser, rate, 'story l9c8 (a finale story)', '/?scene=story&id=l9c8', '.scene.story', undefined, 8);
        await watch(browser, rate, 'finale l1c8 set piece', '/?scene=chapter&id=l1c8&seed=7', '.scene.intro button[aria-label="Play"]', '.scene.intro button[aria-label="Play"]', 7);
        await watch(browser, rate, 'finale l4c8 set piece', '/?scene=chapter&id=l4c8&seed=7', '.scene.intro button[aria-label="Play"]', '.scene.intro button[aria-label="Play"]', 7);
        await watch(browser, rate, 'album', '/?scene=album', '.scene.album', undefined, 3);
        await watch(browser, rate, 'parent corner', '/?scene=parent', '.scene.parent', undefined, 3);
      }
    });
  }
});
