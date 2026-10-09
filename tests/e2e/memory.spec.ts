/**
 * Memory over a long session (Phase 5 of docs/REVIEW.md). Skipped in the
 * normal run: it plays 20+ chapters in ONE page (lands 1 to 3, with two
 * finales, one whole story, Practice with Silky and the Treasure Room in
 * between) and, after each chapter, forces a garbage collection and writes
 * down what is still alive: JS heap, DOM nodes, event listeners, documents
 * and GSAP tweens. A flat line is a pass; growth is a leak.
 *
 *   MEMORY=1 PW_CHROMIUM=... npx playwright test memory --workers=1 --project=home-screen
 *
 * The table is printed at the end, and written to MEMORY_OUT if that is set.
 * The page runs with the real game and an offline cloud (fakeCloud).
 */
import { expect, test, type CDPSession, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { fakeCloud } from './cloud';
import { settled } from './wait';

test.skip(!process.env.MEMORY, 'long run: set MEMORY=1');

interface Sample {
  step: string;
  heapMB: number;
  nodes: number;
  listeners: number;
  windowListeners: number;
  documents: number;
  tweens: number;
  timers: number;
  blobUrls: number;
  /** Nodes in the page right now; `nodes` minus this are detached (kept alive by something). */
  attached: number;
}

async function sample(page: Page, cdp: CDPSession, step: string): Promise<Sample> {
  // Let the last scene's leftovers settle, then collect twice (weak refs, finalisers).
  await page.waitForTimeout(500);
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');
  const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
  const win = await cdp.send('Runtime.evaluate', { expression: 'window' });
  const wl = await cdp.send('DOMDebugger.getEventListeners', { objectId: win.result.objectId! });
  if (process.env.MEMORY_DUMP) {
    // Every element as a short path, to diff two steps and see what was left behind.
    const outline = await page.evaluate(() =>
      [...document.querySelectorAll('*')].map((e) => {
        const path: string[] = [];
        for (let n: Element | null = e; n && n !== document.documentElement; n = n.parentElement) path.unshift(n.tagName + (n.getAttribute('class') ? '.' + n.getAttribute('class')!.split(' ')[0] : '') + (n.id ? '#' + n.id : ''));
        return path.join(' > ');
      }),
    );
    writeFileSync(`${process.env.MEMORY_DUMP}/${step.replace(/\W+/g, '_')}.txt`, outline.join('\n'));
  }
  const extra = await page.evaluate(() => {
    const w = window as any;
    const g = w.__gsap;
    return {
      tweens: g ? g.globalTimeline.getChildren(true, true, true).length : -1,
      timers: w.__live.timeouts.size + w.__live.intervals.size,
      blobUrls: w.__live.blobs,
      attached: document.getElementsByTagName('*').length,
    };
  });
  return {
    step,
    heapMB: Math.round((m.JSHeapUsedSize / 1048576) * 100) / 100,
    nodes: m.Nodes,
    listeners: m.JSEventListeners,
    windowListeners: wl.listeners.length,
    documents: m.Documents,
    ...extra,
  };
}

/** MEMORY_SNAPSHOT=dir: also writes a heap snapshot after chapters 2 and 5, to find what keeps nodes alive. */
async function snapshot(cdp: CDPSession, name: string): Promise<void> {
  const dir = process.env.MEMORY_SNAPSHOT;
  if (!dir) return;
  const chunks: string[] = [];
  cdp.on('HeapProfiler.addHeapSnapshotChunk', (e) => chunks.push(e.chunk));
  await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
  writeFileSync(`${dir}/${name}.heapsnapshot`, chunks.join(''));
}

async function tap(page: Page, selector: string): Promise<void> {
  const el = page.locator(selector).first();
  await settled(el);
  await el.click({ force: true });
  await page.waitForTimeout(300);
}

async function solve(page: Page): Promise<void> {
  const scene = page.locator('.scene.play');
  await expect(scene).toHaveAttribute('data-answer', /.+/, { timeout: 30_000 });
  const answer = (await scene.getAttribute('data-answer')) ?? '';
  if (await page.locator('.np-key').count()) {
    for (const d of answer) await tap(page, `.np-key[data-value="${d}"]`);
    return tap(page, '.np-key[data-value="ok"]');
  }
  const card = `.activity [data-value="${answer}"]`;
  if (await page.locator(card).count()) return tap(page, card);
  // No card with the answer (the tin of ten, the clock...): ask Silky until she shows it.
  const silky = page.locator('.silky-btn');
  for (let i = 0; i < 3; i++) {
    await settled(silky);
    await silky.click({ force: true });
    await page.waitForTimeout(1300);
  }
  await tap(page, `.activity .hint-answer, ${card}`);
}

/** Answers problems until every dot is done: the chapter's own, and any a helped problem brings back. */
async function playProblems(page: Page): Promise<void> {
  const dots = page.locator('.pdot');
  const done = page.locator('.pdot.done');
  await expect(dots.first()).toBeVisible({ timeout: 30_000 });
  for (let guard = 0; guard < 30 && (await done.count()) < (await dots.count()); guard++) {
    const before = await done.count();
    await solve(page);
    // Another dot is done, or (after the last one) the dots are gone with the scene.
    await expect.poll(async () => (await done.count()) > before || (await dots.count()) === 0, { timeout: 30_000 }).toBe(true);
  }
}

/** Skips the stories that follow (one or two), or lets the first run to its end, then taps Next on the reward. */
async function storyAndReward(page: Page, watch: boolean): Promise<void> {
  const skip = page.getByRole('button', { name: 'Skip the story' });
  const next = page.getByRole('button', { name: 'Next' });
  for (let story = 0; story < 2; story++) {
    await expect(skip.or(next).first()).toBeVisible({ timeout: 40_000 });
    const button = await skip.elementHandle({ timeout: 1000 }).catch(() => null);
    if (!button || !(await button.isVisible())) {
      await button?.dispose();
      break;
    }
    if (watch) await button.waitForElementState('hidden', { timeout: 150_000 });
    else {
      await button.click({ force: true });
      await button.waitForElementState('hidden', { timeout: 20_000 });
    }
    watch = false;
    // A handle keeps its element alive (as far as the heap is concerned) until it is let go.
    await button.dispose();
  }
  // The reward ignores taps while it is still arriving: tap again until the map comes.
  await expect(async () => {
    await settled(next);
    await next.click({ force: true, timeout: 2000 }).catch(() => {});
    await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 40_000 });
}

async function chapter(page: Page, id: string, watch = false): Promise<void> {
  const stop = page.locator(`.map-stop[data-chapter="${id}"]`);
  await settled(stop);
  await stop.click({ force: true });
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  await expect(page.locator('.scene.play')).toBeVisible({ timeout: 30_000 });
  await playProblems(page);
  await storyAndReward(page, watch);
}

async function practice(page: Page): Promise<void> {
  await tap(page, '[aria-label="Practice with Silky"]');
  await expect(page.locator('.scene.play')).toBeVisible({ timeout: 30_000 });
  await playProblems(page);
  // Silky signs off, then the map.
  await tap(page, '.play-card [aria-label="Back to the tree"]');
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 40_000 });
}

async function treasures(page: Page): Promise<void> {
  await tap(page, '[aria-label="Treasure Room"]');
  for (const t of ['keepsakes', 'cards', 'seals', 'stories']) {
    if (await page.locator(`.treasure-tab[data-tab="${t}"]`).count()) await tap(page, `.treasure-tab[data-tab="${t}"]`);
  }
  await tap(page, '[aria-label="Back to the map"]');
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 20_000 });
}

test('20 chapters in one page: memory stays flat', async ({ page }) => {
  test.setTimeout(60 * 60_000);
  await fakeCloud(page);
  // GSAP isn't on `window`, and the game shouldn't expose it just for this test:
  // hand it over by rewriting the built bundle on its way in (the line in director.ts
  // that sets lagSmoothing(500, 33)).
  await page.route(/\/assets\/main-[\w-]+\.js$/, async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(/(\w+)\.ticker\.lagSmoothing\(500,\s*33\)/, '($&,window.__gsap=$1)');
    await route.fulfill({ response: res, body });
  });
  // Count live timers and picture URLs the page has made (nothing should pile up).
  await page.addInitScript(() => {
    const w = window as any;
    const live = (w.__live = { timeouts: new Set<number>(), intervals: new Set<number>(), blobs: 0 });
    const st = w.setTimeout.bind(w);
    const si = w.setInterval.bind(w);
    w.setTimeout = (fn: any, ms?: number, ...a: any[]) => {
      const id: number = st((...x: any[]) => {
        live.timeouts.delete(id);
        return typeof fn === 'function' ? fn(...x) : undefined;
      }, ms, ...a);
      live.timeouts.add(id);
      return id;
    };
    w.setInterval = (fn: any, ms?: number, ...a: any[]) => {
      const id: number = si(fn, ms, ...a);
      live.intervals.add(id);
      return id;
    };
    const ct = w.clearTimeout.bind(w);
    const ci = w.clearInterval.bind(w);
    w.clearTimeout = (id: number) => (live.timeouts.delete(id), ct(id));
    w.clearInterval = (id: number) => (live.intervals.delete(id), ci(id));
    const cou = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (o: any) => (live.blobs++, cou(o));
  });
  // A save with no daily limit and the opening already seen.
  await page.addInitScript(() => {
    const key = 'faraway-maths:v1:jasper';
    if (localStorage.getItem(key)) return;
    localStorage.setItem(
      key,
      JSON.stringify({ v: 1, name: 'Jasper', avatar: 'joe', seenOpening: true, settings: { volume: 0.8, idleHintSeconds: 12, newPerDay: 0 } }),
    );
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('HeapProfiler.enable');
  await page.goto('/?scene=map&seed=5');
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 30_000 });

  const rows: Sample[] = [await sample(page, cdp, 'start (map)')];
  const lands = (n: number) => Array.from({ length: 8 }, (_, i) => `l${n}c${i + 1}`);
  const ids = [...lands(1), ...lands(2), ...lands(3).slice(0, 6)];
  const only = process.env.MEMORY_CHAPTERS ? Number(process.env.MEMORY_CHAPTERS) : ids.length;
  let n = 0;
  for (const id of ids.slice(0, only)) {
    n++;
    console.log(`chapter ${n}: ${id}`);
    await chapter(page, id, n === 3);
    rows.push(await sample(page, cdp, `${n}. ${id}`));
    if (n === 2 || n === 5) await snapshot(cdp, `after-${n}`);
    if (n % 5 === 0) {
      await practice(page);
      rows.push(await sample(page, cdp, `${n}. practice`));
      await treasures(page);
      rows.push(await sample(page, cdp, `${n}. treasures`));
    }
  }

  // The first visit to a land or a story loads its code and pictures, which stay (a few
  // MB in all). So the real test of a leak is playing the SAME chapters again: eight
  // replays of land 3's first four chapters must add (next to) nothing.
  const replays = process.env.MEMORY_CHAPTERS ? 0 : 8;
  const replayIds = lands(3).slice(0, 4);
  for (let r = 0; r < replays; r++) {
    n++;
    console.log(`chapter ${n}: ${replayIds[r % 4]} again`);
    await chapter(page, replayIds[r % 4]);
    rows.push(await sample(page, cdp, `${n}. ${replayIds[r % 4]} again`));
  }

  const head = 'step'.padEnd(18) + ['heapMB', 'nodes', 'listeners', 'winListeners', 'docs', 'tweens', 'timers', 'blobs', 'attached'].map((s) => s.padStart(13)).join('');
  const lines = rows.map((r) => r.step.padEnd(18) + [r.heapMB, r.nodes, r.listeners, r.windowListeners, r.documents, r.tweens, r.timers, r.blobUrls, r.attached].map((v) => String(v).padStart(13)).join(''));
  const table = [head, ...lines].join('\n');
  console.log('\n' + table);
  if (process.env.MEMORY_OUT) writeFileSync(process.env.MEMORY_OUT, table + '\n');

  if (!replays) return;
  const again = rows.filter((r) => /again$/.test(r.step));
  const before = rows[rows.length - 1 - again.length];
  const last = again[again.length - 1];
  expect(last.heapMB - again[0].heapMB, 'heap grew over the replays').toBeLessThan(1);
  expect(last.nodes, 'nodes grew').toBeLessThanOrEqual(again[0].nodes + 20);
  expect(last.attached, 'page elements grew').toBeLessThanOrEqual(again[0].attached + 20);
  expect(last.listeners, 'listeners grew').toBeLessThanOrEqual(again[0].listeners);
  expect(last.windowListeners, 'window listeners grew').toBeLessThanOrEqual(again[0].windowListeners);
  expect(last.documents).toBeLessThanOrEqual(before.documents);
  expect(last.tweens, 'tweens grew').toBeLessThanOrEqual(before.tweens + 2);
  expect(last.timers, 'timers grew').toBeLessThanOrEqual(before.timers + 4);
});
