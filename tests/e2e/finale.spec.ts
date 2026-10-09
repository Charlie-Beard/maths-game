/**
 * Land finales (scenes/finale.ts): the climb (land 1), an escape (land 2)
 * and Dame Snap (land 4), each played through to the reward with right
 * answers, plus Silky's help inside a finale. Then every land's finale,
 * 1 to 10, played through with its own hazard or board: the set piece
 * must hold still while a problem is up, nothing may throw, and calm mode
 * must still reach the end.
 */
import { expect, test, type Page } from '@playwright/test';
import { fakeCloud } from './cloud';
import { settled } from './wait';

test.beforeEach(async ({ page }) => {
  await fakeCloud(page);
});

async function tap(page: Page, selector: string): Promise<void> {
  const el = page.locator(selector).first();
  await settled(el);
  await el.click({ force: true });
  // onTap ignores a second tap on the same thing within 250 ms.
  await page.waitForTimeout(300);
}

/** Answers the problem on screen correctly (the activities finales of lands 1–4 use). */
async function solve(page: Page): Promise<void> {
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', /.+/, { timeout: 30_000 });
  const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  // Every activity in the finales offers the answer as a card or key to tap.
  const target = page.locator(`.activity [data-value="${answer}"], .np-key`).first();
  await settled(target);
  await expectStill(page);
  if (page.viewportSize()?.height === 820) {
    // Unscaled stage: the thing he taps is a full-size target.
    const box = (await target.boundingBox())!;
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(72);
  }
  if (await page.locator('.np-key').count()) {
    for (const d of answer) await tap(page, `.np-key[data-value="${d}"]`);
    return tap(page, '.np-key[data-value="ok"]');
  }
  await tap(page, `.activity [data-value="${answer}"]`);
}

/**
 * The stillness rule: while a problem is up, nothing in the set piece moves.
 * Every piece of it (and any balloon or drip left over from the last beat)
 * must be where it was a moment ago.
 */
async function expectStill(page: Page): Promise<void> {
  await expect(page.locator('.finale-set')).toHaveClass(/still/);
  const boxes = () =>
    page.locator('.finale-set').evaluate((set) =>
      [...set.querySelectorAll(':scope > *, .finale-particle, .finale-dust')].map((el) => {
        const r = el.getBoundingClientRect();
        return [el.className, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(' ');
      }),
    );
  const a = await boxes();
  await page.waitForTimeout(500);
  expect(await boxes()).toEqual(a);
}

async function openFinale(page: Page, id: string, mode: string): Promise<void> {
  await page.goto(`/?scene=chapter&id=${id}&seed=3`);
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  // The page wipe and building the set piece can take a while on a busy machine.
  await expect(page.locator('.scene.play.finale')).toHaveAttribute('data-finale', mode, { timeout: 30_000 });
}

/** Plays every problem right, checking the set piece holds still while he thinks. */
async function playThrough(page: Page, count: number, from = 0): Promise<void> {
  for (let i = from; i < count; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 30_000 });
    await solve(page);
  }
  // The story (if it's written yet), then the reward. After the very last
  // finale a second story follows (the ending film) before the reward.
  const skip = page.getByRole('button', { name: 'Skip the story' });
  const next = page.getByRole('button', { name: 'Next' });
  const map = page.locator('.map-stop').first();
  // Skipping goes straight on to whatever follows, so skip each story in
  // turn, waiting for the skipped one's button to go before looking again.
  for (let story = 0; story < 2; story++) {
    await expect(skip.or(next).first()).toBeVisible({ timeout: 40_000 });
    const button = await skip.elementHandle({ timeout: 1000 }).catch(() => null);
    if (!button || !(await button.isVisible())) break;
    await button.click({ force: true });
    await button.waitForElementState('hidden', { timeout: 20_000 });
  }
  await settled(next);
  await next.click({ force: true });
  await expect(map).toBeVisible({ timeout: 20_000 });
}

test('climb: up the tree to Moon-Face’s door, then the reward', async ({ page }) => {
  test.setTimeout(300_000);
  await openFinale(page, 'l1c8', 'climb');
  await expect(page.locator('.finale-door')).toBeAttached();
  await expect(page.locator('.pdot')).toHaveCount(10);
  await playThrough(page, 10);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(saved.chapters.l1c8.done).toBe(true);
});

test('escape: down the ladder before Topsy-Turvy moves on', async ({ page }) => {
  test.setTimeout(300_000);
  await openFinale(page, 'l2c8', 'escape');
  await expect(page.locator('.finale-ladder')).toBeAttached();
  await playThrough(page, 10);
});

test('snap: crack Dame Snap’s rules one by one', async ({ page }) => {
  test.setTimeout(300_000);
  await openFinale(page, 'l4c8', 'snap');
  await expect(page.locator('.finale-rule')).toHaveCount(10);
  await expect(page.locator('.finale-pip')).toHaveCount(10);
  await expect(page.locator('.pdot.done')).toHaveCount(0);
  await solve(page);
  await expect(page.locator('.finale-pip.done')).toHaveCount(1, { timeout: 30_000 });
  await playThrough(page, 10, 1);
});

test('help in a finale: Silky shows the answer on the third ask, and nothing else moves', async ({ page }) => {
  await openFinale(page, 'l4c8', 'snap');
  await expect(page.locator('.finale-set')).toHaveClass(/still/, { timeout: 30_000 });
  await settled(page.locator('.activity [data-value]').first());
  for (let k = 0; k < 3; k++) await tap(page, '.silky-btn');
  await expect(page.locator('.activity .hint-answer').first()).toBeVisible();
  // Help is no answer: no drama, no step.
  await expect(page.locator('.finale-set')).toHaveClass(/still/);
  await expect(page.locator('.pdot.done')).toHaveCount(0);
  await expect(page.locator('.finale-pip.done')).toHaveCount(0);
});

/** Every land's finale: how it plays, and what should be on stage. */
const LANDS: { n: number; mode: string; count: number; piece: string; pieces: number }[] = [
  { n: 1, mode: 'climb', count: 10, piece: '.finale-door', pieces: 1 },
  { n: 2, mode: 'escape', count: 10, piece: '.finale-ladder', pieces: 1 }, // spin
  { n: 3, mode: 'escape', count: 10, piece: '.finale-chaser', pieces: 1 }, // chase: the Jelly Goblin
  { n: 4, mode: 'snap', count: 10, piece: '.finale-rule', pieces: 10 },
  { n: 5, mode: 'escape', count: 10, piece: '.finale-ladder', pieces: 1 }, // balloons
  { n: 6, mode: 'escape', count: 10, piece: '.finale-giant', pieces: 1 }, // stomp
  { n: 7, mode: 'snap', count: 10, piece: '.finale-ruler', pieces: 10 },
  { n: 8, mode: 'escape', count: 10, piece: '.finale-chaser', pieces: 3 }, // march: toy soldiers
  { n: 9, mode: 'escape', count: 10, piece: '.finale-chaser', pieces: 1 }, // melt: the snowman
  { n: 10, mode: 'snap', count: 12, piece: '.finale-rule', pieces: 4 }, // rules, cages, rulers
  { n: 11, mode: 'escape', count: 10, piece: '.finale-chaser', pieces: 1 }, // chase: the Old Woman
  { n: 12, mode: 'escape', count: 10, piece: '.finale-chaser', pieces: 3 }, // march: red goblins with the drum
  { n: 13, mode: 'escape', count: 10, piece: '.finale-ladder', pieces: 1 }, // spin
  { n: 14, mode: 'escape', count: 10, piece: '.finale-chaser', pieces: 1 }, // chase: the Red Goblin
];

/** Collects anything the page throws or logs as an error (a missing voice clip is fine). */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
  return errors;
}

test.describe('every land’s finale', () => {
  // One viewport is enough to play them all through; the layout is checked by eye.
  test.skip(({ viewport }) => viewport?.height !== 820, 'home-screen only');

  for (const land of LANDS) {
    test(`land ${land.n}: ${land.mode} plays through to the reward`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await openFinale(page, `l${land.n}c8`, land.mode);
      await expect(page.locator(land.piece)).toHaveCount(land.pieces);
      await expect(page.locator('.pdot')).toHaveCount(land.count);
      if (land.n === 10) {
        // The last board changes as it goes: rules, then cages, then rulers.
        for (let i = 0; i < 4; i++) {
          await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 30_000 });
          await solve(page);
        }
        await expect(page.locator('.finale-cage')).toHaveCount(4, { timeout: 30_000 });
        for (let i = 4; i < 8; i++) {
          await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 30_000 });
          await solve(page);
        }
        await expect(page.locator('.finale-ruler')).toHaveCount(4, { timeout: 30_000 });
        await playThrough(page, 12, 8);
      } else await playThrough(page, land.count);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
      expect(saved.chapters[`l${land.n}c8`].done).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  for (const n of [9, 7]) {
    const land = LANDS[n - 1];
    test(`land ${n}: ${land.mode} in calm mode still reaches the reward`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      // A new profile follows the iPad's Reduce Motion setting.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openFinale(page, `l${n}c8`, land.mode);
      await expect(page.locator('html')).toHaveClass(/calm/);
      await playThrough(page, land.count);
      expect(errors).toEqual([]);
    });
  }
});
