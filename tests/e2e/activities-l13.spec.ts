/**
 * Land 13's picture-card activities (turn, solid): every fixture, a wrong
 * tap then help level 3, and real generated problems at every tier.
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

async function solve(page: Page): Promise<void> {
  const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  await tap(page, `.activity [data-value="${answer}"]`);
}

async function playAll(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await solve(page);
  }
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 20_000 });
}

test('turn: every fixture plays to the right answer', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=turn&seed=1');
  await expect(page.locator('.activity-turn')).toBeVisible();
  await playAll(page, 4);
});

test('solid: every fixture plays to the right answer', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=solid&seed=1');
  await expect(page.locator('.activity-solid')).toBeVisible();
  await playAll(page, 6);
});

test('all answer targets are at least 72 px', async ({ page }) => {
  for (const kind of ['turn', 'solid']) {
    await page.goto(`/?scene=fixtures&kind=${kind}&seed=1`);
    const targets = page.locator('.activity [data-value]');
    await expect(targets.first()).toBeVisible();
    for (const box of await targets.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))) {
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(72);
    }
  }
});

test('a wrong tap wobbles, and help 3 shows the answer', async ({ page }) => {
  for (const kind of ['turn', 'solid']) {
    await page.goto(`/?scene=fixtures&kind=${kind}&seed=1`);
    await expect(page.locator(`.activity-${kind}`)).toBeVisible();
    const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
    for (let k = 0; k < 3; k++) {
      await tap(page, `.activity [data-value]:not([data-value="${answer}"]):not([disabled])`);
    }
    await expect(page.locator('.activity .hint-answer')).toHaveCount(1);
    await expect(page.locator('.activity .hint-answer')).toHaveAttribute('data-value', answer);
    await solve(page);
    await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
  }
});

test('flags on the path: wrong flag then help 3', async ({ page }) => {
  await page.goto('/?scene=skill&id=turns&tier=4&seed=3');
  await expect(page.locator('.l13-flag').first()).toBeVisible();
  const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  for (let k = 0; k < 3; k++) await tap(page, `.l13-flag:not([data-value="${answer}"]):not([disabled])`);
  await expect(page.locator('.l13-flag.hint-answer')).toHaveAttribute('data-value', answer);
  await solve(page);
  await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
});

test('real generated problems play at every tier', async ({ page }) => {
  test.setTimeout(180_000);
  for (const [id, tiers] of [['turns', 4], ['shapes-3d', 5]] as const) {
    for (let tier = 1; tier <= tiers; tier++) {
      for (const seed of [1, 2]) {
        await page.goto(`/?scene=skill&id=${id}&tier=${tier}&seed=${seed}`);
        await expect(page.locator('.scene.play')).toBeVisible();
        await expect(page.locator('.activity')).toBeVisible();
        await solve(page);
        await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
      }
    }
  }
});
