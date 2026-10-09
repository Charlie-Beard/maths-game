/**
 * Land finales, part 5 (lands 12–14): each land's finale through to its
 * reward.
 * See finale-helpers.ts for the shared steps.
 */
import { expect, test } from '@playwright/test';
import { fakeCloud } from './cloud';
import { LANDS, openFinale, playThrough, watchErrors } from './finale-helpers';

test.beforeEach(async ({ page }) => {
  await fakeCloud(page);
});

test.describe('every land’s finale', () => {
  // One viewport is enough to play them all through; the layout is checked by eye.
  test.skip(({ viewport }) => viewport?.height !== 820, 'home-screen only');

  for (const land of LANDS.filter((l) => l.n >= 12 && l.n <= 14)) {
    test(`land ${land.n}: ${land.mode} plays through to the reward`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await openFinale(page, `l${land.n}c8`, land.mode);
      await expect(page.locator(land.piece)).toHaveCount(land.pieces);
      await expect(page.locator('.pdot')).toHaveCount(land.count);
      await playThrough(page, land.count);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
      expect(saved.chapters[`l${land.n}c8`].done).toBe(true);
      expect(errors).toEqual([]);
    });
  }
});
