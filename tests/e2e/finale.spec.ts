/**
 * Land finales (scenes/finale.ts): the climb (land 1), an escape (land 2)
 * and Dame Snap (land 4), each played through to the reward with right
 * answers, plus Silky's help inside a finale.
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
  if (await page.locator('.np-key').count()) {
    for (const d of answer) await tap(page, `.np-key[data-value="${d}"]`);
    return tap(page, '.np-key[data-value="ok"]');
  }
  await tap(page, `.activity [data-value="${answer}"]`);
}

async function openFinale(page: Page, id: string, mode: string): Promise<void> {
  await page.goto(`/?scene=chapter&id=${id}&seed=3`);
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  await expect(page.locator('.scene.play.finale')).toHaveAttribute('data-finale', mode);
}

/** Plays every problem right, checking the set piece holds still while he thinks. */
async function playThrough(page: Page, count: number, from = 0): Promise<void> {
  for (let i = from; i < count; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 30_000 });
    await expect(page.locator('.finale-set')).toHaveClass(/still/);
    await solve(page);
  }
  // The story (if it's written yet), then the reward.
  const skip = page.getByRole('button', { name: 'Skip the story' });
  const next = page.getByRole('button', { name: 'Next' });
  await expect(skip.or(next).first()).toBeVisible({ timeout: 40_000 });
  if (await skip.isVisible()) await skip.click({ force: true });
  await settled(next);
  await next.click({ force: true });
  await expect(page.locator('.map-stop').first()).toBeVisible({ timeout: 20_000 });
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
