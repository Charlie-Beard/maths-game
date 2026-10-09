/**
 * Land finales, part 3 (lands 7–8): Dame Snap's rules cracked one by one
 * (land 4's finale, as a test of its own), Silky's help inside a finale,
 * and each land's finale through to its reward.
 * See finale-helpers.ts for the shared steps.
 */
import { expect, test } from '@playwright/test';
import { fakeCloud } from './cloud';
import { LANDS, openFinale, playThrough, solve, tap, watchErrors } from './finale-helpers';
import { settled } from './wait';

test.beforeEach(async ({ page }) => {
  await fakeCloud(page);
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

test.describe('every land’s finale', () => {
  // One viewport is enough to play them all through; the layout is checked by eye.
  test.skip(({ viewport }) => viewport?.height !== 820, 'home-screen only');

  for (const land of LANDS.filter((l) => l.n >= 7 && l.n <= 8)) {
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
