import { expect, type Page, test } from '@playwright/test';
import { settled } from './wait';

/**
 * W2a's activities, played through their fixtures (src/activities/fixtures-a.ts)
 * on the dev page ?scene=fixtures&kind=…: each plays one problem to the
 * right answer the way he would, then asks Silky three times on the next
 * and checks the answer is shown.
 */

const open = async (page: Page, kind: string) => {
  await page.goto(`/?scene=fixtures&kind=${kind}`);
  await expect(page.locator('.scene.play')).toBeVisible();
  await expect(page.locator(`.activity-${kind}`)).toBeVisible();
};

/** Taps, leaving time between taps on one thing (taps closer than 250 ms are one tap). */
const tapSlowly = async (page: Page, selector: string, times: number) => {
  for (let i = 0; i < times; i++) {
    await page.locator(selector).first().click();
    await page.waitForTimeout(320);
  }
};

const solved = (page: Page, n: number) => expect(page.locator('.pdot.done')).toHaveCount(n, { timeout: 20_000 });

/** Asks Silky three times: help 1, 2, then 3 (the answer shown). */
const askSilkyThrice = async (page: Page) => {
  const silky = page.locator('.silky-btn');
  await settled(silky);
  for (let i = 0; i < 3; i++) {
    await silky.click();
    await page.waitForTimeout(450);
  }
};

test('count: tap each object to number it, then choose the total', async ({ page }) => {
  await open(page, 'count');
  const objs = page.locator('.ct-obj:not(.gone)');
  await expect(objs).toHaveCount(4);
  await settled(objs.first());
  for (let i = 0; i < 4; i++) await objs.nth(i).click();
  await expect(page.locator('.ct-obj.counted')).toHaveCount(4);
  await expect(page.locator('.ct-tag')).toHaveText(['1', '2', '3', '4']);
  await page.locator('.choice[data-value="4"]').click();
  await solved(page, 1);

  // The next one (9 scattered): Silky counts them all and shows the answer.
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', '9');
  await askSilkyThrice(page);
  await expect(page.locator('.choice.hint-answer')).toHaveAttribute('data-value', '9');
  await expect(page.locator('.ct-obj.counted')).toHaveCount(9);
  await expect(page.locator('.choice')).toHaveCount(3); // one wrong card went at help 2
});

test('tenFrame: fill the tin, add from the tray, and Silky takes away', async ({ page }) => {
  await open(page, 'tenFrame');
  // Fill: 6 in the tin, 4 more to tap in.
  for (const i of [6, 7, 8, 9]) {
    await page.locator(`.tf-cell[data-cell="${i}"]`).click();
  }
  await expect(page.locator('.tf-done')).toHaveAttribute('data-value', '4');
  await page.locator('.tf-done').click();
  await solved(page, 1);

  // Add: tap the three waiting acorns into the frame, then choose 7.
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', '7');
  await expect(page.locator('.tf-counter.in-tray')).toHaveCount(3);
  await settled(page.locator('.tf-counter.in-tray').first());
  await tapSlowly(page, '.tf-counter.in-tray', 3);
  await expect(page.locator('.tf-counter.in-tray')).toHaveCount(0);
  await page.locator('.choice[data-value="7"]').click();
  await solved(page, 2);

  // Remove: Silky takes the four away and the answer glows.
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', '5');
  await askSilkyThrice(page);
  await expect(page.locator('.tf-counter.taken')).toHaveCount(4);
  await expect(page.locator('.choice.hint-answer')).toHaveAttribute('data-value', '5');
  await page.locator('.choice.hint-answer').click();
  await solved(page, 3);
});

test('numberLine: hop back rung by rung, then confirm where he lands', async ({ page }) => {
  await open(page, 'numberLine');
  await expect(page.locator('.nl-num.here')).toHaveAttribute('data-value', '7');
  await settled(page.locator('.nl-back'));
  await tapSlowly(page, '.nl-back', 3);
  await expect(page.locator('.nl-here')).toHaveAttribute('data-value', '4');
  await expect(page.locator('.nl-arc-n')).toHaveText(['1', '2', '3']);
  await expect(page.locator('.nl-num.here')).toHaveAttribute('data-value', '4');
  await page.locator('.nl-here').click();
  await solved(page, 1);

  // One more than 6: Silky shows 7.
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', '7');
  await askSilkyThrice(page);
  await expect(page.locator('.nl-num.hint-answer')).toHaveAttribute('data-value', '7');
  await expect(page.locator('.nl-step')).toHaveCount(1);
  await page.locator('.nl-num.hint-answer').click();
  await solved(page, 2);
});

test('partWhole: choose the missing part; Silky shows counters and the answer', async ({ page }) => {
  await open(page, 'partWhole');
  await settled(page.locator('.choice[data-value="7"]'));
  await page.locator('.choice[data-value="7"]').click();
  await expect(page.locator('.pw-box.missing .pw-n')).toHaveText('7');
  await solved(page, 1);

  // The whole is missing (4 and 2).
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', '6');
  await askSilkyThrice(page);
  await expect(page.locator('.choice.hint-answer')).toHaveAttribute('data-value', '6');
  await expect(page.locator('.pw-box.with-dots')).toHaveCount(2);
});

test('numberPad: type the answer; at help 2 cards replace the keypad', async ({ page }) => {
  await open(page, 'numberPad');
  const keys = page.locator('.np-key');
  await expect(keys).toHaveCount(12);
  for (const box of await keys.all()) {
    const b = await box.boundingBox();
    expect(Math.min(b!.width, b!.height)).toBeGreaterThanOrEqual(96);
  }
  await settled(page.locator('.np-key[data-value="9"]'));
  // A slip, rubbed out, then the right answer.
  await page.locator('.np-key[data-value="6"]').click();
  await page.locator('.np-key[data-value="delete"]').click();
  await page.locator('.np-key[data-value="9"]').click();
  await expect(page.locator('.np-box')).toHaveText('9');
  await page.locator('.np-key[data-value="ok"]').click();
  await solved(page, 1);

  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', '8');
  await askSilkyThrice(page);
  await expect(page.locator('.np-key')).toHaveCount(0);
  await expect(page.locator('.choice')).toHaveCount(3);
  await expect(page.locator('.choice.hint-answer')).toHaveAttribute('data-value', '8');
});
