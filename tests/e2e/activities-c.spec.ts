/**
 * W2c's activities (clock, coins, shape) and every Visual kind, played
 * through the hand-made fixtures (src/activities/fixtures-c.ts) on the dev
 * page ?scene=fixtures&kind=…, plus real generated problems.
 */
import { expect, test, type Page } from '@playwright/test';
import { settled } from './wait';

/** Reads a time answer: "3:30", "half past 3", "quarter to 4", "20 past 5", "3 o’clock". */
function parseTime(a: string): { hour: number; minute: number } {
  const s = a.toLowerCase().replace(/’/g, "'");
  let m: RegExpExecArray | null;
  if ((m = /^(\d+):(\d\d)$/.exec(s))) return { hour: Number(m[1]), minute: Number(m[2]) };
  if ((m = /^(\d+) o'clock$/.exec(s))) return { hour: Number(m[1]), minute: 0 };
  if ((m = /^half past (\d+)$/.exec(s))) return { hour: Number(m[1]), minute: 30 };
  if ((m = /^quarter past (\d+)$/.exec(s))) return { hour: Number(m[1]), minute: 15 };
  if ((m = /^quarter to (\d+)$/.exec(s))) return { hour: ((Number(m[1]) + 10) % 12) + 1, minute: 45 };
  if ((m = /^(\d+) past (\d+)$/.exec(s))) return { hour: Number(m[2]), minute: Number(m[1]) };
  if ((m = /^(\d+) to (\d+)$/.exec(s))) return { hour: ((Number(m[2]) + 10) % 12) + 1, minute: 60 - Number(m[1]) };
  throw new Error('Unknown time ' + a);
}

const pence = (a: string): number => (a.startsWith('£') ? Math.round(Number(a.slice(1)) * 100) : parseInt(a, 10));

async function tap(page: Page, selector: string, index = 0): Promise<void> {
  const el = page.locator(selector).nth(index);
  await settled(el);
  await el.click({ force: true });
  // onTap ignores a second tap on the same thing within 250 ms.
  await page.waitForTimeout(300);
}

/** Sets the clock's hands to the answer and taps OK. */
async function setClock(page: Page, answer: string): Promise<void> {
  const want = parseTime(answer);
  const face = page.locator('.c-clock');
  for (let i = 0; i < 12; i++) {
    const [h] = ((await face.getAttribute('data-time')) ?? '').split(':').map(Number);
    if (h % 12 === want.hour % 12) break;
    await tap(page, '[data-step="hour+"].c-step');
  }
  for (let i = 0; i < 12; i++) {
    const [, m] = ((await face.getAttribute('data-time')) ?? '').split(':').map(Number);
    if (m === want.minute) break;
    await tap(page, '[data-step="minute+"].c-step');
  }
  await expect(face).toHaveAttribute('data-time', `${want.hour}:${String(want.minute).padStart(2, '0')}`);
  await tap(page, '.c-ok');
}

/** Pays the amount from the purse (coins used once each, or as many as needed when the purse has one of each kind). */
async function pay(page: Page, amount: number): Promise<void> {
  const purse = (await page.locator('.c-purse-coin').evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.value)))) as number[];
  const distinct = new Set(purse).size === purse.length;
  const picks: number[] = [];
  let left = amount;
  // Try each coin once, biggest first (the purse can always make it).
  const order = purse.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const search = (k: number, rest: number, used: number[]): number[] | null => {
    if (rest === 0) return used;
    if (k >= order.length || rest < 0) return null;
    return search(k + 1, rest - order[k].v, [...used, order[k].i]) ?? search(k + 1, rest, used);
  };
  const once = search(0, amount, []);
  if (once) picks.push(...once);
  else if (distinct) {
    for (const { v, i } of order) while (v <= left) (picks.push(i), (left -= v));
  }
  expect(picks.length).toBeGreaterThan(0);
  for (const i of picks) await tap(page, '.c-purse-coin', i);
  await expect(page.locator('.c-counter')).toHaveAttribute('data-total', String(amount));
  await tap(page, '.c-ok');
}

/** Answers the problem on screen correctly, whatever kind it is. */
async function solve(page: Page): Promise<void> {
  const scene = page.locator('.scene.play');
  const answer = (await scene.getAttribute('data-answer')) ?? '';
  if (await page.locator('.c-ok').count()) {
    if (await page.locator('.c-clock').count()) return setClock(page, answer);
    return pay(page, pence(answer));
  }
  await tap(page, `.activity [data-value="${answer}"]`);
}

/** Plays every fixture of a kind to the right answer. */
async function playAll(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await solve(page);
  }
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 20_000 });
}

test('clock: read the time and set the hands, for every fixture', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=clock&seed=1');
  await expect(page.locator('.activity-clock')).toBeVisible();
  await playAll(page, 7);
});

test('coins: know, count and pay, for every fixture', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=coins&seed=1');
  await expect(page.locator('.activity-coins')).toBeVisible();
  await playAll(page, 6);
});

test('shape: name, find and count the sides, for every fixture', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=shape&seed=1');
  await expect(page.locator('.activity-shape')).toBeVisible();
  await playAll(page, 5);
});

test('every Visual kind draws through choose', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('/?scene=fixtures&kind=choose&seed=1');
  await expect(page.locator('.activity-choose')).toBeVisible();
  const kinds = new Set<string>();
  for (let i = 0; i < 120; i++) {
    // Wait for the next problem (i done), or the map after the last one.
    await expect
      .poll(async () => (await page.locator('.map-stop').count()) > 0 || (await page.locator('.pdot.done').count()) === i, { timeout: 20_000 })
      .toBe(true);
    if (await page.locator('.map-stop').count()) break;
    // Every dot done: the round is over and the map is on its way (on a busy
    // machine it can take a while), so don't tap the last problem again.
    if (i === (await page.locator('.pdot').count())) {
      await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 20_000 });
      break;
    }
    await expect(page.locator('.activity-choose')).toBeVisible();
    const kind = await page.locator('.activity-choose .visual').getAttribute('data-kind');
    if (kind) kinds.add(kind);
    if (kind && kind !== 'none') expect(await page.locator('.activity-choose .visual svg').count()).toBeGreaterThan(0);
    await solve(page);
  }
  for (const k of ['objects', 'dots', 'tenFrame', 'numberLine', 'partWhole', 'compare', 'tensOnes', 'groups', 'share', 'fraction', 'clock', 'coins', 'shape', 'length']) expect(kinds).toContain(k);
});

test('help level 3 shows the answer: clock cards, set hands, coins to pay, shapes', async ({ page }) => {
  const askSilkyThrice = async () => {
    for (let k = 0; k < 3; k++) await tap(page, '.silky-btn');
  };

  // Clock, read: the right card glows.
  await page.goto('/?scene=fixtures&kind=clock&seed=1');
  await expect(page.locator('.c-card')).toHaveCount(3);
  for (let k = 0; k < 3; k++) {
    const answer = await page.locator('.scene.play').getAttribute('data-answer');
    await tap(page, `.c-card:not([data-value="${answer}"]):not([disabled])`);
  }
  await expect(page.locator('.c-card.hint-answer')).toHaveCount(1);
  await expect(page.locator('.c-card.hint-answer')).toHaveAttribute('data-value', (await page.locator('.scene.play').getAttribute('data-answer')) ?? '');

  // Clock, set: three wrong OKs bring faint hands where the real ones go.
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await solve(page);
  }
  await expect(page.locator('.pdot.done')).toHaveCount(3, { timeout: 20_000 });
  await expect(page.locator('.c-ok')).toBeVisible({ timeout: 20_000 });
  for (let k = 0; k < 3; k++) await tap(page, '.c-ok');
  await expect(page.locator('.clock-ghost')).toHaveCount(2);
  await solve(page);

  // Coins, pay: faint coins on the counter.
  await page.goto('/?scene=fixtures&kind=coins&seed=1');
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await solve(page);
  }
  await expect(page.locator('.pdot.done')).toHaveCount(3, { timeout: 20_000 });
  await expect(page.locator('.c-purse-coin').first()).toBeVisible({ timeout: 20_000 });
  await askSilkyThrice();
  await expect(page.locator('.c-ghost')).toHaveCount(3);
  await expect(page.locator('.c-counter')).toHaveAttribute('data-total', '0');
  await solve(page);

  // Shape: the right shape glows.
  await page.goto('/?scene=fixtures&kind=shape&seed=1');
  await askSilkyThrice();
  await expect(page.locator('.c-card.hint-answer')).toHaveAttribute('data-value', 'triangle');
});

test('real generated problems play: time, coins and shapes at every tier', async ({ page }) => {
  for (const [id, tiers] of [['time', 5], ['coins', 4], ['shapes-2d', 3]] as const) {
    for (let tier = 1; tier <= tiers; tier++) {
      await page.goto(`/?scene=skill&id=${id}&tier=${tier}&seed=5`);
      await expect(page.locator('.scene.play')).toBeVisible();
      await expect(page.locator('.activity')).toBeVisible();
      await solve(page);
      await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
    }
  }
});
