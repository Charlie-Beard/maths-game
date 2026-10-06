import { expect, test, type Page } from '@playwright/test';
import { AUTH_KEY, fakeCloud, signedOut } from './cloud';
import { settled } from './wait';

test.use(signedOut);

const password = (page: Page) => page.getByRole('textbox', { name: 'Password' });

/** Opens the game at the password screen, once its card has slid into place. */
async function open(page: Page, url = '/') {
  await page.goto(url);
  await expect(page.getByText('What’s the password?')).toBeVisible();
  await settled(page.locator('.login-card'));
}

test('Moon-Face asks for the password, turns a wrong one away, and lets Jasper in', async ({ page }) => {
  await fakeCloud(page);
  await open(page);
  await expect(page.locator('.login-moon svg')).toBeVisible();
  // No way into the grown-ups' corner before signing in.
  await expect(page.getByRole('button', { name: 'Grown-ups' })).toBeHidden();

  await password(page).fill('frog');
  await page.getByRole('button', { name: 'Go in' }).click();
  await expect(page.getByRole('status')).toHaveText('That’s not the password. Try again!');

  await password(page).fill('  OWL');
  await password(page).press('Enter');
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Grown-ups' })).toBeVisible();

  // Remembered: no password next time.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('What’s the password?')).toHaveCount(0);
  expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), AUTH_KEY)).toMatchObject({ who: 'jasper' });
});

test('says so when the cloud can’t be reached', async ({ page }) => {
  // No fake cloud: the API address answers nothing.
  await open(page);
  await password(page).fill('owl');
  await password(page).press('Enter');
  await expect(page.getByRole('status')).toContainText('Can’t reach the Faraway Tree', { timeout: 10_000 });
  await expect(page.getByText('What’s the password?')).toBeVisible();
});

test('moves the save from before sign-in into the cloud, and brings the cloud’s copy down', async ({ page }) => {
  const cloud = await fakeCloud(page, { v: 1, name: 'Jasper', cards: ['silky'], toffees: 4, chapters: { l1c2: { plays: 1, done: true } } });
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const before = { v: 1, name: 'Jasper', avatar: 'joe', seenOpening: true, cards: ['moonface'], toffees: 8, chapters: { l1c1: { plays: 1, done: true } } };
    localStorage.setItem('faraway-maths:v1:jasper', JSON.stringify(before));
  });
  await open(page);
  await password(page).fill('owl');
  await password(page).press('Enter');
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible({ timeout: 10_000 });

  await expect.poll(() => cloud.jasper.rev, { timeout: 10_000 }).toBe(2);
  const merged = cloud.jasper.data;
  expect(merged.avatar).toBe('joe');
  expect(merged.cards.sort()).toEqual(['moonface', 'silky']);
  expect(merged.toffees).toBe(8);
  expect(merged.chapters.l1c1.done).toBe(true);
  expect(merged.chapters.l1c2.done).toBe(true);
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(kept.cards.sort()).toEqual(['moonface', 'silky']);
});

test('a dev shortcut waits for the password, then opens', async ({ page }) => {
  await fakeCloud(page);
  await open(page, '/?scene=map');
  await password(page).fill('owl');
  await password(page).press('Enter');
  await expect(page.locator('.map-stop[data-chapter="l1c1"]')).toBeVisible({ timeout: 10_000 });
});
