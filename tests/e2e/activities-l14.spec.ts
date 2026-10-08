/**
 * Land 14's `measure` activity: tap the heavier sack, the fuller jug, the
 * hotter thermometer; put three in order; read a scale; and the help steps.
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

const answerOf = async (page: Page): Promise<string> => (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';

/** Answers the problem on screen correctly. */
async function solve(page: Page): Promise<void> {
  const answer = await answerOf(page);
  if (!/^\d+$/.test(answer)) {
    // An order is tapped item by item; a side is one tap.
    const items = answer.includes(',') ? answer.split(',') : [answer];
    for (const v of items) await tap(page, `.m-item[data-value="${v}"]`);
  } else {
    await tap(page, `.activity [data-value="${answer}"]`);
  }
}

test('measure: tap the heavier sack, the fuller jug, the hotter thermometer, and put three in order', async ({ page }) => {
  // Each right answer has its praise to wait for.
  test.setTimeout(180_000);
  await page.goto('/?scene=fixtures&kind=measure&seed=1');
  await expect(page.locator('.activity-measure')).toBeVisible();
  // A fixtures round is every fixture, not just eight.
  const count = await page.locator('.pdot').count();
  expect(count).toBeGreaterThanOrEqual(8);
  for (let i = 0; i < count; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await expect(page.locator('.activity')).toBeVisible();
    await solve(page);
  }
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 20_000 });
});

test('measure: tap targets are big enough and carry their value', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=measure&seed=1');
  const items = page.locator('.m-item');
  await expect(items).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const box = await items.nth(i).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(72);
    expect(box!.height).toBeGreaterThanOrEqual(72);
  }
  await expect(items.nth(0)).toHaveAttribute('data-value', 'left');
  await expect(items.nth(1)).toHaveAttribute('data-value', 'right');
});

test('measure: a wrong tap wobbles, and help 3 shows the answer to tap', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=measure&seed=1');
  await expect(page.locator('.m-item')).toHaveCount(2);
  const answer = await answerOf(page);
  const wrong = answer === 'left' ? 'right' : 'left';
  for (let k = 0; k < 3; k++) await tap(page, `.m-item[data-value="${wrong}"]`);
  await expect(page.locator('.m-wash')).toHaveCount(1);
  await expect(page.locator(`.m-item.hint-answer`)).toHaveAttribute('data-value', answer);
  await tap(page, `.m-item[data-value="${answer}"]`);
  await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
});

test('measure: a wrong order starts again, and help 3 numbers them', async ({ page }) => {
  await page.goto('/?scene=fixtures&kind=measure&seed=1');
  // The fifth fixture is the order of three sacks.
  for (let i = 0; i < 4; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await solve(page);
  }
  await expect(page.locator('.pdot.done')).toHaveCount(4, { timeout: 20_000 });
  await expect(page.locator('.m-item')).toHaveCount(3, { timeout: 20_000 });
  const order = (await answerOf(page)).split(',');
  const wrong = [...order].reverse();
  for (let k = 0; k < 3; k++) {
    for (const v of wrong) await tap(page, `.m-item[data-value="${v}"]`);
    // From help 2 the first one is put in place for him, so it stays.
    await expect(page.locator('.m-badge:not(.m-ghost)')).toHaveCount(k === 0 ? 0 : 1, { timeout: 5_000 });
  }
  await expect(page.locator('.m-ghost').first()).toBeVisible();
  await expect(page.locator('.m-item.hint-answer')).toHaveAttribute('data-value', order[1]);
  for (const v of order) await tap(page, `.m-item[data-value="${v}"]`);
  await expect(page.locator('.pdot.done')).toHaveCount(5, { timeout: 20_000 });
});

test('read-scales: read a dial, a jug and a thermometer, with and without every number', async ({ page }) => {
  test.setTimeout(180_000);
  for (let tier = 1; tier <= 4; tier++) {
    await page.goto(`/?scene=skill&id=read-scales&tier=${tier}&seed=3`);
    await expect(page.locator('.activity')).toBeVisible();
    const svg = page.locator('.visual-measure svg');
    await expect(svg).toBeVisible();
    // Numbers on the gauge are big.
    const sizes = await svg.locator('text').evaluateAll((els) => els.map((e) => Number(e.getAttribute('font-size'))));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(28);
    await solve(page);
    await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
  }
});

test('compare-measures: real problems play at every tier', async ({ page }) => {
  test.setTimeout(180_000);
  for (let tier = 1; tier <= 4; tier++) {
    for (const seed of [1, 2]) {
      await page.goto(`/?scene=skill&id=compare-measures&tier=${tier}&seed=${seed}`);
      await expect(page.locator('.m-item').first()).toBeVisible();
      await solve(page);
      await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
    }
  }
});
