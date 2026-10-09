import { expect, test, type Page } from '@playwright/test';
import { fakeCloud } from './cloud';
import { settled } from './wait';

// The save: nothing he has done is lost, and a damaged save never stops the game.

const KEY = 'faraway-maths:v1:jasper';
const saved = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), KEY);

/** Starts chapter 1 and answers its first problem right (`before` runs just before the tap). */
async function answerOne(page: Page, before = async () => {}): Promise<void> {
  await page.goto('/?scene=chapter&id=l1c1&seed=7');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  const scene = page.locator('.scene.play');
  await expect(scene).toHaveAttribute('data-answer', /.+/);
  const card = page.locator(`.choice[data-value="${await scene.getAttribute('data-answer')}"]`);
  await settled(card);
  await before();
  await card.click({ force: true });
  await expect.poll(async () => (await saved(page)).toffees).toBeGreaterThan(0);
}

test('a damaged save still opens the map, and he plays on from it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Numbers out of range, a skill with no list of recent answers, a
  // half-written chapter record: the kinds of damage a save can come back with.
  const damaged = {
    v: 1,
    name: 'Jasper',
    avatar: 'joe',
    seenOpening: true,
    unlockedTo: 2.5,
    toffees: 'lots',
    settings: { volume: 'loud', idleHintSeconds: -5 },
    chapters: { l1c1: { done: true }, l1c2: null },
    skills: Object.fromEntries(['count-10', 'subitise', 'one-more', 'one-less'].map((id) => [id, { tier: 9, recent: null, seen: 'x' }])),
  };
  await page.addInitScript(([k, v]) => localStorage.getItem(k) || localStorage.setItem(k, v), [KEY, JSON.stringify(damaged)] as const);

  await page.goto('/?scene=map');
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 10_000 });
  // The first tap starts the sound, at the saved volume.
  await page.mouse.click(590, 410);
  await page.waitForTimeout(300);

  await answerOne(page);
  const s = await saved(page);
  expect(s.toffees).toBe(1);
  expect(s.chapters.l1c1).toMatchObject({ done: true, plays: 1 });
  expect(errors).toEqual([]);
});

test('a save made just before the iPad goes to sleep still reaches the cloud', async ({ page }) => {
  const cloud = await fakeCloud(page, { v: 1, name: 'Jasper', avatar: 'joe', seenOpening: true });
  await page.clock.install();
  // The iPad stops the game's timers almost as soon as it goes to the
  // background, so the short wait before sending would never end. Here
  // they stop just before the tap.
  await answerOne(page, async () => page.clock.pauseAt(await page.evaluate(() => Date.now() + 500)));
  // The answer is saved on the iPad straight away, then the home button.
  expect((await saved(page)).toffees).toBe(1);
  expect(cloud.jasper.data.toffees).toBeUndefined();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => cloud.jasper.data.toffees, { timeout: 5_000 }).toBe(1);
});

test('two tabs on one iPad never write over each other’s play', async ({ context }) => {
  // Offline, so only the copy on the device is in play.
  const start = JSON.stringify({ v: 1, name: 'Jasper', avatar: 'joe', seenOpening: true });
  await context.addInitScript(([k, v]) => localStorage.getItem(k) || localStorage.setItem(k, v), [KEY, start] as const);
  const a = await context.newPage();
  await answerOne(a);
  const b = await context.newPage();
  await answerOne(b);
  // Tab A answers again after tab B saved: it must keep B's answer too.
  await a.bringToFront();
  const scene = a.locator('.scene.play');
  await expect(scene).toHaveAttribute('data-answer', /.+/);
  const card = a.locator(`.choice[data-value="${await scene.getAttribute('data-answer')}"]`);
  await settled(card);
  await card.click({ force: true });
  await expect(a.locator('.pdot.done')).toHaveCount(2, { timeout: 20_000 });
  await expect.poll(async () => (await saved(a)).toffees).toBe(3);
});
