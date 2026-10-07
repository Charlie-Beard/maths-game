import { expect, test, type Page } from '@playwright/test';
import { settled } from './wait';

/**
 * W2b's activities (compare, tensOnes, groups, share, fraction), played
 * through their hand-made fixtures (?scene=fixtures&kind=…): every problem
 * is answered the way he would, by building or dealing where the activity
 * asks for it, then with the right answer. A second test per kind answers
 * wrongly three times and checks Silky shows the answer.
 */

const KINDS = ['compare', 'tensOnes', 'groups', 'share', 'fraction'] as const;
const WORDS: Record<string, number> = { whole: 1, half: 1 / 2, third: 1 / 3, quarter: 1 / 4 };

const answerOf = async (page: Page): Promise<string> => (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';

/** Taps an element n times, slower than the double-tap guard. */
async function tapTimes(page: Page, selector: string, n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await page.locator(selector).first().click();
    await page.waitForTimeout(320);
  }
}

/** Does what the problem on screen asks, then gives the right answer. */
async function solve(page: Page): Promise<void> {
  const answer = await answerOf(page);
  const act = page.locator('.scene.play .activity');
  await expect(act).toHaveCount(1);
  const cls = (await act.getAttribute('class')) ?? '';

  if (cls.includes('activity-tensOnes') && cls.includes('is-build')) {
    const n = Number(answer);
    await settled(page.locator('[data-role="add-one"]'));
    await tapTimes(page, '[data-role="add-ten"]', Math.floor(n / 10));
    await tapTimes(page, '[data-role="add-one"]', n % 10);
    await expect(page.locator('[data-role="ok"]')).toHaveAttribute('data-value', answer);
    await page.locator('[data-role="ok"]').click();
    return;
  }
  if (cls.includes('activity-fraction') && cls.includes('is-build')) {
    const parts = page.locator('[data-role="part"]');
    const count = await parts.count();
    const share = answer in WORDS ? WORDS[answer] : Number(answer) / count;
    for (let i = 0; i < Math.round(share * count); i++) {
      await parts.nth(i).click();
      await page.waitForTimeout(150);
    }
    await expect(page.locator('[data-role="ok"]')).toHaveAttribute('data-value', answer);
    await page.locator('[data-role="ok"]').click();
    return;
  }
  // Building groups: fill each plate (or shelf) until it's full.
  const plates = page.locator('[data-role="plate"]');
  if ((await plates.count()) > 0) {
    await settled(plates.first());
    const n = await plates.count();
    const each = Number(answer) / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < each; j++) {
        await plates.nth(i).click();
        await page.waitForTimeout(300);
      }
    }
    await expect(page.locator('.b-plate .b-obj, .b-shelf .b-obj')).toHaveCount(Number(answer));
  }
  // Dealing or making groups: tap the pile until it's empty.
  const pile = page.locator('[data-role="pile"]');
  if ((await pile.count()) > 0) {
    await settled(pile);
    for (let i = 0; i < 40 && !(await pile.evaluate((e) => e.classList.contains('is-empty'))); i++) {
      await pile.click();
      await page.waitForTimeout(300);
    }
    await expect(pile).toHaveClass(/is-empty/);
  }
  const target = page.locator(`.scene.play .activity [data-value="${answer}"]`).first();
  await settled(target);
  await target.click();
}

for (const kind of KINDS) {
  test(`${kind}: every fixture plays to the right answer`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto(`/?scene=fixtures&kind=${kind}&seed=1`);
    await expect(page.locator('.scene.play')).toBeVisible();
    const total = await page.locator('.pdot').count();
    expect(total).toBeGreaterThan(2);
    for (let i = 0; i < total; i++) {
      await expect(page.locator('.pdot.done')).toHaveCount(i, { timeout: 20_000 });
      await expect(page.locator('.scene.play .activity')).toHaveCount(1);
      await solve(page);
      if (i < total - 1) await expect(page.locator('.pdot.done')).toHaveCount(i + 1, { timeout: 20_000 });
    }
    // The round ends and the game moves on.
    await expect(page.locator('.scene.play')).toHaveCount(0, { timeout: 20_000 });
  });

  test(`${kind}: three wrong answers and Silky shows the answer`, async ({ page }) => {
    await page.goto(`/?scene=fixtures&kind=${kind}&seed=1`);
    await expect(page.locator('.scene.play')).toBeVisible();
    const answer = await answerOf(page);
    for (let k = 0; k < 3; k++) {
      const wrong = page.locator(`.scene.play .activity [data-value]:not([data-value="${answer}"]):not(.is-gone)`).first();
      await settled(wrong);
      await wrong.click();
      await page.waitForTimeout(400);
    }
    const hint = page.locator('.scene.play .activity .hint-answer');
    await expect(hint).toHaveCount(1);
    await expect(hint).toHaveAttribute('data-value', answer, { timeout: 10_000 });
    // And tapping what she shows is right.
    await settled(hint);
    await page.waitForTimeout(600);
    await hint.click();
    await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
  });
}
