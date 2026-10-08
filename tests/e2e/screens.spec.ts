/**
 * The screens around the play: the tree map, the reward, Moon-Face's
 * Treasure Room and the grown-ups' corner. Most start from a save part way
 * up the tree: lands 1–3 finished (with their seals) and three chapters of
 * land 4 (Dame Snap's School) done.
 */
import { expect, test, type Page } from '@playwright/test';
import { KEEPSAKE_NAMES } from '../../src/art/keepsakes';
import { TREE_PLACES } from '../../src/art/scenery';
import { ALL_CHAPTERS, LANDS } from '../../src/core/curriculum';
import { SKILL_IDS } from '../../src/core/skills';
import { defaultProgress, finishChapter, recordOutcome, type Progress } from '../../src/core/progress';
import { AUTH_KEY, fakeCloud } from './cloud';
import { settled } from './wait';

const SAVE_KEY = 'faraway-maths:v1:jasper';

/** A save with the first `n` chapters done, a few days ago. */
function progressed(n = 27, change: (p: Progress) => void = () => {}): Progress {
  const p = defaultProgress();
  p.avatar = 'joe';
  p.seenOpening = true;
  const then = Date.now() - 5 * 86_400_000;
  ALL_CHAPTERS.slice(0, n).forEach((c, i) => {
    finishChapter(p, c, then + i * 1000);
    for (const skill of c.skills) recordOutcome(p, { skill, tier: c.tiers[0], wrong: 0, at: then + i * 1000 });
  });
  change(p);
  return p;
}

/** Puts a save on the device before the game opens (and says every land has already arrived). */
async function seed(page: Page, p: Progress, landSeen = 10): Promise<void> {
  await page.addInitScript(
    ([key, data, seen]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, data);
      localStorage.setItem('faraway-maths:land-seen:jasper', seen);
    },
    [SAVE_KEY, JSON.stringify(p), String(landSeen)] as const,
  );
}

/** Waits for the map of a land (after the fade, only one map is on screen). */
async function onLand(page: Page, title: string): Promise<void> {
  await expect(page.locator('.map-banner').filter({ hasText: title })).toBeVisible();
  await expect(page.locator('.map-banner')).toHaveCount(1);
}

const saved = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), SAVE_KEY);

// ---------------------------------------------------------------------------
// The map

test('the map puts the 8 stops on the tree’s places, with one glowing next stop and the seals won', async ({ page }) => {
  await seed(page, progressed());
  await page.goto('/?scene=map');
  const stops = page.locator('.map-stop');
  await expect(stops).toHaveCount(8);
  await expect(page.locator('.map-banner')).toHaveText('Dame Snap’s School');

  // Each stop sits on its place (stage coordinates, scaled to the screen).
  const stage = (await page.locator('#stage').boundingBox())!;
  const scale = stage.height / 820;
  for (let i = 0; i < 8; i++) {
    const stop = stops.nth(i);
    await expect(stop).toHaveAttribute('data-chapter', `l4c${i + 1}`);
    await expect(stop).toHaveAttribute('data-place', TREE_PLACES[i].id);
    const b = (await stop.boundingBox())!;
    expect(Math.abs(b.x + b.width / 2 - (stage.x + TREE_PLACES[i].x * scale))).toBeLessThan(3);
    expect(Math.abs(b.y + b.height / 2 - (stage.y + TREE_PLACES[i].y * scale))).toBeLessThan(3);
  }

  // One glowing next stop; the ones after it are locked.
  await expect(page.locator('.map-stop.is-next')).toHaveCount(1);
  await expect(page.locator('.map-stop.is-next')).toHaveAttribute('data-chapter', 'l4c4');
  await expect(page.locator('.map-stop.done')).toHaveCount(3);
  await expect(page.locator('.map-stop.locked')).toHaveCount(4);

  // Lands 1–3's seals hang on the tree.
  await expect(page.locator('.tree-seal')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'The Land of Goodies seal' })).toBeVisible();

  // The next stop opens its chapter.
  const next = page.locator('.map-stop.is-next');
  await settled(next);
  await next.click({ force: true });
  await expect(page.locator('.scene.intro')).toBeVisible();
});

test('down the slippery-slip to earlier lands, and back up the ladder', async ({ page }) => {
  await seed(page, progressed());
  await page.goto('/?scene=map');
  await expect(page.getByRole('button', { name: 'Climb up to the next land' })).toHaveCount(0);

  const slip = page.getByRole('button', { name: 'Slide down to the land before' });
  await settled(slip);
  await slip.click({ force: true });
  await onLand(page, 'The Land of Goodies');
  await expect(page.locator('.map-stop').first()).toHaveAttribute('data-chapter', 'l3c1');
  await expect(page.locator('.map-stop.done')).toHaveCount(8);
  await expect(page.locator('.map-stop.is-next')).toHaveCount(0);

  const up = page.getByRole('button', { name: 'Climb up to the next land' });
  await settled(up);
  await up.click({ force: true });
  await onLand(page, 'Dame Snap’s School');
  await expect(page.locator('.map-stop.is-next')).toHaveAttribute('data-chapter', 'l4c4');
});

test('when today’s new chapters are used up, the next stop says come back tomorrow', async ({ page }) => {
  await seed(
    page,
    progressed(27, (p) => {
      p.chapters.l4c2.firstDone = Date.now();
      p.chapters.l4c3.firstDone = Date.now();
    }),
  );
  await page.goto('/?scene=map');
  const stop = page.locator('.map-stop[data-chapter="l4c4"]');
  await expect(stop).toHaveClass(/locked/);
  await expect(stop).toHaveClass(/tomorrow/);
  await expect(stop.locator('.tomorrow-tag')).toHaveText('Come back tomorrow');
  await expect(page.locator('.map-stop.is-next')).toHaveCount(0);
  // Old chapters still open.
  await settled(page.locator('.map-stop[data-chapter="l4c1"]'));
  await page.locator('.map-stop[data-chapter="l4c1"]').click({ force: true });
  await expect(page.locator('.scene.intro')).toBeVisible();
});

test('a new land arrives in the cloud the first time, then the map is as usual', async ({ page }) => {
  await seed(page, progressed(24), 3);
  await page.goto('/?scene=map');
  await expect(page.locator('.map-banner')).toHaveText('Dame Snap’s School');
  await expect(page.locator('.arrive-cloud')).toHaveCount(2);
  await expect(page.locator('.arrive-cloud')).toHaveCount(0, { timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem('faraway-maths:land-seen:jasper'))).toBe('4');
  await page.reload();
  await expect(page.locator('.map-stop')).toHaveCount(8);
  await expect(page.locator('.arrive-cloud')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// The reward

test('finishing a chapter shows its keepsake and a new Folk card, then Next goes back to the tree', async ({ page }) => {
  await page.goto('/?scene=chapter&id=l1c1&seed=7');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  const scene = page.locator('.scene.play');
  for (let i = 0; i < 8; i++) {
    await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
    // The problem is up once the scene says its answer.
    await expect(scene).toHaveAttribute('data-answer', /.+/);
    const ans = await scene.getAttribute('data-answer');
    const card = page.locator(`.choice[data-value="${ans}"]`);
    await settled(card);
    await card.click({ force: true });
  }
  const skip = page.getByRole('button', { name: 'Skip the story' });
  await expect(skip).toBeVisible({ timeout: 20_000 });
  await skip.click({ force: true });

  const keepsake = KEEPSAKE_NAMES[ALL_CHAPTERS[0].keepsake];
  await expect(page.locator('.complete-keepsake')).toHaveAttribute('aria-label', keepsake);
  await expect(page.locator('.reward-name')).toHaveText(keepsake);
  await expect(page.locator('.card-flip')).toHaveCount(1);
  await expect(page.locator('.complete-seal')).toHaveCount(0);
  const next = page.getByRole('button', { name: 'Next' });
  await settled(next);
  await next.click({ force: true });
  await expect(page.locator('.map-stop[data-chapter="l1c1"]')).toHaveClass(/done/);
  await expect(page.locator('.map-stop.is-next')).toHaveAttribute('data-chapter', 'l1c2');
});

// ---------------------------------------------------------------------------
// The Treasure Room

test('the Treasure Room shows keepsakes (unfound ones dark), cards, seals and stories', async ({ page }) => {
  await seed(page, progressed());
  await page.goto('/?scene=map');
  const room = page.getByRole('button', { name: 'Treasure Room' });
  await settled(room);
  await room.click({ force: true });

  await expect(page.locator('.treasure-tab.on')).toHaveAttribute('data-tab', 'keepsakes');
  await expect(page.locator('.shelf-row')).toHaveCount(LANDS.length);
  await expect(page.locator('.keepsake-item:not(.missing)')).toHaveCount(27);
  await expect(page.locator('.keepsake-item.missing')).toHaveCount(ALL_CHAPTERS.length - 27);

  // Tap a keepsake: it's held up close with its name.
  const first = ALL_CHAPTERS[0].keepsake;
  const item = page.locator(`.keepsake-item[data-id="${first}"]`);
  await item.scrollIntoViewIfNeeded();
  await item.click({ force: true });
  await expect(page.locator('.treasure-zoom .zoom-name')).toHaveText(KEEPSAKE_NAMES[first]);
  await page.locator('.treasure-zoom').click({ position: { x: 40, y: 400 }, force: true });
  await expect(page.locator('.treasure-zoom')).toHaveCount(0);

  await page.locator('[data-tab="cards"]').click({ force: true });
  await expect(page.locator('.card-item')).toHaveCount(new Set(ALL_CHAPTERS.map((c) => c.host)).size);
  await expect(page.locator('.card-item .frog-card:not(.locked)')).toHaveCount(11);

  await page.locator('[data-tab="seals"]').click({ force: true });
  await expect(page.locator('.seal-item:not(.missing)')).toHaveCount(3);
  await expect(page.locator('.seal-item.missing')).toHaveCount(LANDS.length - 3);

  // Stories: only the ones that exist and have been unlocked (l1c1's, here).
  await page.locator('[data-tab="stories"]').click({ force: true });
  await expect(page.locator('.story-tile[data-story="l1c1"]')).toBeVisible();
  await expect(page.locator('.story-tile[data-story="l4c4"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Back to the map' }).click({ force: true });
  await expect(page.locator('.map-stop')).toHaveCount(8);
});

// ---------------------------------------------------------------------------
// The grown-ups' corner

/** Opens the corner the way a grown-up does: the gear, then the sum. */
async function openCorner(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Grown-ups' }).click();
  const text = (await page.locator('.gate-sum').textContent())!;
  const [a, op, b] = text.replace('=', '').trim().split(' ');
  const answer = op === '×' ? Number(a) * Number(b) : Number(a) / Number(b);
  await page.keyboard.type(String(answer));
  await page.keyboard.press('Enter');
  await expect(page.locator('.scene.parent')).toBeVisible();
}

test('the corner shows every skill, by land or by strand, and changes settings', async ({ page }) => {
  await seed(page, progressed());
  await page.goto('/?scene=map');
  await openCorner(page);
  await expect(page.locator('.skill-table tr[data-skill]')).toHaveCount(SKILL_IDS.length);
  await expect(page.locator('.skill-table tr[data-skill="count-10"]')).not.toHaveClass(/unseen/);
  await expect(page.locator('.skill-table .p-group').first()).toHaveText('1. The Enchanted Wood');
  await page.getByRole('button', { name: 'By strand' }).click();
  await expect(page.locator('.skill-table .p-group').first()).toHaveText('Number and place value');

  await page.locator('.p-tab[data-tab="settings"]').click();
  await page.getByRole('switch', { name: 'Calm mode' }).click();
  await page.getByRole('combobox', { name: 'New chapters per day' }).selectOption('0');
  await page.getByRole('combobox', { name: 'Idle hint' }).selectOption('20');
  await page.getByRole('textbox', { name: 'Player’s name' }).fill('Sam');
  const s = await saved(page);
  expect(s.settings).toMatchObject({ calm: true, newPerDay: 0, idleHintSeconds: 20 });
  expect(s.name).toBe('Sam');
  await expect(page.locator('html')).toHaveClass(/calm/);

  await page.getByRole('button', { name: 'Back to the game' }).click();
  await expect(page.locator('.map-stop')).toHaveCount(8);
});

test('levels: unlock up to a chapter, and lock the ones after a chapter again', async ({ page }) => {
  await seed(page, progressed());
  await page.goto('/?scene=parent');
  await page.locator('.p-tab[data-tab="levels"]').click();
  await page.locator('.p-level[data-chapter="l5c2"]').getByRole('button', { name: 'Unlock up to here' }).click();
  expect((await saved(page)).unlockedTo).toBe(ALL_CHAPTERS.findIndex((c) => c.id === 'l5c2'));
  await expect(page.locator('.p-level[data-chapter="l5c2"]')).toHaveClass(/open/);

  const lock = page.locator('.p-level[data-chapter="l2c3"]').getByRole('button', { name: 'Lock the ones after' });
  await lock.click();
  await page.locator('.p-level[data-chapter="l2c3"]').getByRole('button', { name: 'Tap again to lock' }).click();
  const s = await saved(page);
  expect(s.chapters.l2c3.done).toBe(true);
  expect(s.chapters.l2c4.done).toBe(false);
  expect(s.unlockedTo).toBe(ALL_CHAPTERS.findIndex((c) => c.id === 'l2c3'));
  // Keepsakes and seals already won are kept.
  expect(s.seals).toEqual([1, 2, 3]);
  await expect(page.locator('.p-level[data-chapter="l2c5"]')).toHaveClass(/locked/);
});

test('profiles: Jasper’s can’t be deleted, others can (with a second tap), and sign out needs two taps', async ({ page }) => {
  const cloud = await fakeCloud(page, progressed(), { demo: { label: 'Demo', data: defaultProgress() } });
  await page.goto('/?scene=parent');
  await page.locator('.p-tab[data-tab="profiles"]').click();
  const jasper = page.locator('.p-profile[data-profile="jasper"]');
  const demo = page.locator('.p-profile[data-profile="demo"]');
  await expect(jasper).toContainText('Playing now');
  await expect(jasper.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  await expect(demo.getByRole('button', { name: 'Play as this' })).toBeVisible();
  await demo.getByRole('button', { name: 'Delete' }).click();
  await demo.getByRole('button', { name: 'Tap again to delete' }).click();
  await expect(demo).toHaveCount(0);
  expect(cloud.demo).toBeUndefined();

  await expect(page.locator('.p-sync')).toHaveText(/cloud/);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Tap again to sign out' })).toBeVisible();
  await page.getByRole('button', { name: 'Tap again to sign out' }).click();
  await expect(page.getByText('What’s the password?')).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate((k) => localStorage.getItem(k), AUTH_KEY)).toBeNull();
});
