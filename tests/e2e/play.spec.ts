import { expect, test } from '@playwright/test';
import { fakeCloud, type FakeCloud } from './cloud';
import { settled } from './wait';

// Signed in already (playwright.config.ts), with a stand-in for the cloud save.
let cloud: FakeCloud;
test.beforeEach(async ({ page }) => {
  cloud = await fakeCloud(page);
});

test('a first chapter plays end to end: choose, map, intro, 8 problems, story, reward', async ({ page }) => {
  await page.goto('/?seed=7');
  const play = page.getByRole('button', { name: 'Play' });
  await settled(play);
  await play.click({ force: true });

  // Choose who to climb with.
  const joe = page.getByRole('button', { name: 'Joe' });
  await settled(joe);
  await joe.click({ force: true });

  // The opening film plays the first time: skip it.
  const skipOpening = page.getByRole('button', { name: 'Skip the story' });
  await expect(skipOpening).toBeVisible({ timeout: 20_000 });
  await skipOpening.click({ force: true });

  // The map: the first stop glows.
  const first = page.locator('.map-stop.is-next');
  await expect(first).toHaveAttribute('data-chapter', 'l1c1');
  await settled(first);
  await first.click({ force: true });

  // The intro.
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });

  // Eight problems: tap the right answer each time.
  const scene = page.locator('.scene.play');
  await expect(scene).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    // The problem may still be building: wait until it says what the answer is.
    await expect(scene).toHaveAttribute('data-answer', /.+/);
    const answer = await scene.getAttribute('data-answer');
    const card = page.locator(`.choice[data-value="${answer}"]`);
    await settled(card);
    await card.click({ force: true });
  }

  // The story: skip it.
  const skip = page.getByRole('button', { name: 'Skip the story' });
  await expect(skip).toBeVisible({ timeout: 20_000 });
  await skip.click({ force: true });

  // The reward, then back to the map with chapter 1 done.
  const next = page.getByRole('button', { name: 'Next' });
  await settled(next);
  await next.click({ force: true });
  await expect(page.locator('.map-stop[data-chapter="l1c1"]')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(saved.chapters.l1c1.done).toBe(true);
  expect(saved.toffees).toBe(8);
  expect(saved.skills['count-10'].seen).toBeGreaterThan(0);
  // And it goes up to the cloud a moment later.
  await expect.poll(() => cloud.jasper?.data?.chapters?.l1c1?.done, { timeout: 10_000 }).toBe(true);
});

test('a wrong answer brings help, and Silky shows the answer on the third', async ({ page }) => {
  await page.goto('/?scene=chapter&id=l1c6&seed=3');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  const scene = page.locator('.scene.play');
  await expect(scene).toBeVisible();
  for (let k = 0; k < 3; k++) {
    const answer = await scene.getAttribute('data-answer');
    const wrong = page.locator(`.choice:not([data-value="${answer}"])`).first();
    await settled(wrong);
    await wrong.click({ force: true });
  }
  await expect(page.locator('.choice.hint-answer')).toHaveCount(1);
});
