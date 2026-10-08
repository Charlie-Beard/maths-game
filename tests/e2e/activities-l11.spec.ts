/**
 * Land 11's activities (`tally`, `change`): the hand-made fixtures
 * (src/activities/fixtures-l11.ts), real generated problems at every
 * tier, and the help steps.
 */
import { expect, test, type Page } from '@playwright/test';
import { settled } from './wait';

async function tap(page: Page, selector: string, index = 0): Promise<void> {
  const el = page.locator(selector).nth(index);
  await settled(el);
  await el.click({ force: true });
  // onTap ignores a second tap on the same thing within 250 ms.
  await page.waitForTimeout(300);
}

/** Answers the problem on screen correctly. */
async function solve(page: Page): Promise<void> {
  const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  await tap(page, `.activity [data-value="${answer}"]`);
}

async function playAll(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 40_000 });
    await expect(page.locator('.activity .choice').first()).toBeVisible();
    await solve(page);
  }
}

test('tally: every fixture draws its picture and plays', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=tally&seed=1');
  await expect(page.locator('.activity-tally')).toBeVisible();
  await expect(page.locator('.activity-tally .visual-tally svg').first()).toBeVisible();
  await playAll(page, 5);
});

test('change: every fixture shows coins and money cards and plays', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=change&seed=1');
  await expect(page.locator('.activity-change')).toBeVisible();
  await playAll(page, 4);
});

test('real problems play at every tier, with big tap targets and a picture', async ({ page }) => {
  test.setTimeout(240_000);
  for (const [id, tiers] of [['tally', 5], ['change', 4]] as const) {
    for (let tier = 1; tier <= tiers; tier++) {
      await page.goto(`/?scene=skill&id=${id}&tier=${tier}&seed=${tier + 3}`);
      await expect(page.locator(`.activity-${id}`)).toBeVisible();
      await expect(page.locator(`.activity-${id} .visual svg`).first()).toBeVisible();
      const cards = page.locator('.activity .choice');
      const n = await cards.count();
      expect(n).toBeGreaterThanOrEqual(3);
      for (let i = 0; i < n; i++) {
        await settled(cards.nth(i));
        const box = await cards.nth(i).boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(72);
        expect(box!.height).toBeGreaterThanOrEqual(72);
      }
      await solve(page);
      await expect(page.locator('.pdot.done'), `${id} tier ${tier}`).toHaveCount(1, { timeout: 40_000 });
    }
  }
});

test('tally pictograms show a key only when a picture is more than one', async ({ page }) => {
  // Tier 3 (one picture is one): no key. Tier 4: the key is drawn, with the number.
  await page.goto('/?scene=skill&id=tally&tier=3&seed=2');
  await expect(page.locator('.visual-tally svg').first()).toBeVisible();
  await expect(page.locator('.visual-tally svg text', { hasText: '=' })).toHaveCount(0);
  await page.goto('/?scene=skill&id=tally&tier=4&seed=2');
  await expect(page.locator('.visual-tally svg text', { hasText: '=' })).toHaveCount(1);
});

test('help: the picture counts for him, a wrong card goes, then the right card glows', async ({ page }) => {
  await page.goto('/?scene=skill&id=tally&tier=2&seed=3');
  await expect(page.locator('.activity-tally')).toBeVisible();
  const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  const textsBefore = await page.locator('.visual-tally svg text').count();
  for (let k = 0; k < 3; k++) await tap(page, `.activity .choice:not([data-value="${answer}"]):not([disabled])`);
  // Step 2 wrote running counts under the gates (a tier 2 tally always has at least two gates).
  await expect.poll(() => page.locator('.visual-tally svg text').count()).toBeGreaterThan(textsBefore);
  await expect(page.locator('.activity .choice.hint-answer')).toHaveCount(1);
  await expect(page.locator('.activity .choice.hint-answer')).toHaveAttribute('data-value', answer);
  await solve(page);
  await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 40_000 });

  // Change: help step 2 writes the sum out when the problem has none.
  await page.goto('/?scene=skill&id=change&tier=2&seed=3');
  const a2 = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  for (let k = 0; k < 3; k++) await tap(page, `.activity .choice:not([data-value="${a2}"]):not([disabled])`);
  await expect(page.locator('.activity-change .c-sum')).toHaveCount(1);
  await expect(page.locator('.activity .choice.hint-answer')).toHaveAttribute('data-value', a2);
});

test('a chapter of land 11 plays through', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/?scene=chapter&id=l11c1&seed=3');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  await expect(page.locator('.scene.play')).toBeVisible({ timeout: 40_000 });
  const total = await page.locator('.pdot').count();
  for (let i = 0; i < Math.min(total, 3); i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 40_000 });
    await expect(page.locator('.activity .choice').first()).toBeVisible();
    await solve(page);
  }
});
