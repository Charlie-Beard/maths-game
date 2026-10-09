/**
 * Land finales, part 1 (lands 1–3): the climb up the tree to Moon-Face's
 * door (land 1), and each land's finale through to its reward.
 * See finale-helpers.ts for the shared steps.
 */
import { expect, test } from '@playwright/test';
import { fakeCloud } from './cloud';
import { LANDS, openFinale, playThrough, solve, watchErrors } from './finale-helpers';

test.beforeEach(async ({ page }) => {
  await fakeCloud(page);
});

test('climb: up the tree to Moon-Face’s door, then the reward', async ({ page }) => {
  test.setTimeout(300_000);
  await openFinale(page, 'l1c8', 'climb');
  await expect(page.locator('.finale-door')).toBeAttached();
  await expect(page.locator('.pdot')).toHaveCount(10);
  await playThrough(page, 10);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(saved.chapters.l1c8.done).toBe(true);
});

test.describe('every land’s finale', () => {
  // One viewport is enough to play them all through; the layout is checked by eye.
  test.skip(({ viewport }) => viewport?.height !== 820, 'home-screen only');

  for (const land of LANDS.filter((l) => l.n >= 1 && l.n <= 3)) {
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
});
