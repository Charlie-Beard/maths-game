import { expect, test } from '@playwright/test';
import { fakeCloud } from './cloud';
import { settled } from './wait';

// The way back from a problem screen, and Practice's sign-off.
test.beforeEach(async ({ page }) => {
  await fakeCloud(page);
});

test('the back button asks first: "Keep playing" carries on, "Yes" goes to the map', async ({ page }) => {
  await page.goto('/?scene=chapter&id=l1c1&seed=7');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  const scene = page.locator('.scene.play');
  await expect(scene).toHaveAttribute('data-answer', /.+/);

  const back = page.getByRole('button', { name: 'Back to the tree' });
  await settled(back);
  const size = await back.evaluate((el) => parseFloat((el as HTMLElement).style.width));
  expect(size).toBeGreaterThanOrEqual(72);
  await back.click({ force: true });
  await expect(page.locator('.play-card-title')).toHaveText('Back to the tree?');

  // Keep playing closes the card and the problem is still there.
  await page.getByRole('button', { name: 'Keep playing' }).click({ force: true });
  await expect(page.locator('.play-veil')).toHaveCount(0);
  await expect(scene).toBeVisible();

  // (Taps on one button closer than 250 ms apart are ignored on purpose.)
  await page.waitForTimeout(350);
  // Yes leaves for the map, and the chapter is not marked done.
  await back.click({ force: true });
  const yes = page.getByRole('button', { name: 'Yes, back to the tree' });
  await settled(yes);
  await yes.click({ force: true });
  await expect(page.locator('.map-stop[data-chapter="l1c1"]')).toBeVisible({ timeout: 10_000 });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(saved.chapters?.l1c1?.done).toBeFalsy();
});

test("Practice ends with Silky's sign-off, then the map", async ({ page }) => {
  await page.goto('/?scene=practice&seed=7');
  const scene = page.locator('.scene.play');
  for (let i = 0; i < 8; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await expect(scene).toHaveAttribute('data-answer', /.+/);
    const answer = await scene.getAttribute('data-answer');
    const card = page.locator(`.choice[data-value="${answer}"]`);
    await settled(card);
    await card.click({ force: true });
  }
  await expect(page.locator('.play-card-title')).toContainText('Lovely practising', { timeout: 20_000 });
  await expect(page.locator('.play-card-toffees')).toContainText('toffee');
  const on = page.locator('.play-card').getByRole('button', { name: 'Back to the tree' });
  await settled(on);
  await on.click({ force: true });
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 10_000 });
});

test('leaving part way and coming back carries on from the same problem', async ({ page }) => {
  await page.goto('/?scene=chapter&id=l1c1&seed=7');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  const scene = page.locator('.scene.play');
  for (let i = 0; i < 2; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    await expect(scene).toHaveAttribute('data-answer', /.+/);
    const answer = await scene.getAttribute('data-answer');
    const card = page.locator(`.choice[data-value="${answer}"]`);
    await settled(card);
    await card.click({ force: true });
  }
  await expect(page.locator('.pdot.done')).toHaveCount(2, { timeout: 20_000 });
  const third = await scene.getAttribute('data-answer');
  const back = page.getByRole('button', { name: 'Back to the tree' });
  await settled(back);
  await back.click({ force: true });
  const yes = page.getByRole('button', { name: 'Yes, back to the tree' });
  await settled(yes);
  await yes.click({ force: true });
  await expect(page.locator('.map-stop[data-chapter="l1c1"]')).toBeVisible({ timeout: 10_000 });

  // Back into the same chapter: two dots already done, the same third problem.
  await page.goto('/?scene=chapter&id=l1c1&seed=99');
  const again = page.getByRole('button', { name: 'Play' });
  await settled(again);
  await again.click({ force: true });
  await expect(page.locator('.pdot')).toHaveCount(8);
  await expect(page.locator('.pdot.done')).toHaveCount(2, { timeout: 20_000 });
  await expect(scene).toHaveAttribute('data-answer', third!);
});
