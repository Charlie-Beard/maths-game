/**
 * Land 12 (the Land of Music): one real generated problem of each tier of
 * `count-3s` and `time-5`, played through ?scene=skill, plus a look at the
 * pictures each tier draws.
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

/** Reads a time answer into the clock's hour and minute. */
function parseTime(a: string): { hour: number; minute: number } {
  const s = a.toLowerCase().replace(/’/g, "'");
  let m: RegExpExecArray | null;
  if ((m = /^(\d+) o'clock$/.exec(s))) return { hour: Number(m[1]), minute: 0 };
  if ((m = /^half past (\d+)$/.exec(s))) return { hour: Number(m[1]), minute: 30 };
  if ((m = /^quarter past (\d+)$/.exec(s))) return { hour: Number(m[1]), minute: 15 };
  if ((m = /^quarter to (\d+)$/.exec(s))) return { hour: ((Number(m[1]) + 10) % 12) + 1, minute: 45 };
  if ((m = /^(\d+) past (\d+)$/.exec(s))) return { hour: Number(m[2]), minute: Number(m[1]) };
  if ((m = /^(\d+) to (\d+)$/.exec(s))) return { hour: ((Number(m[2]) + 10) % 12) + 1, minute: 60 - Number(m[1]) };
  throw new Error('Unknown time ' + a);
}

/** Turns the hands to the answer (in 5-minute steps) and taps OK. */
async function setClock(page: Page, answer: string): Promise<void> {
  const want = parseTime(answer);
  const face = page.locator('.c-clock');
  for (let i = 0; i < 12; i++) {
    const [h] = ((await face.getAttribute('data-time')) ?? '').split(':').map(Number);
    if (h % 12 === want.hour % 12) break;
    await tap(page, '[data-step="hour+"].c-step');
  }
  for (let i = 0; i < 12; i++) {
    const [, m] = ((await face.getAttribute('data-time')) ?? '').split(':').map(Number);
    if (m === want.minute) break;
    await tap(page, '[data-step="minute+"].c-step');
  }
  await expect(face).toHaveAttribute('data-time', `${want.hour}:${String(want.minute).padStart(2, '0')}`);
  await tap(page, '.c-ok');
}

/** Answers the problem on screen correctly, whatever way it is asked. */
async function solve(page: Page): Promise<void> {
  const answer = (await page.locator('.scene.play').getAttribute('data-answer')) ?? '';
  if (await page.locator('.c-ok').count()) return setClock(page, answer);
  if (await page.locator('.np-key').count()) {
    for (const digit of answer) await tap(page, `.np-key[data-value="${digit}"]`);
    return tap(page, '.np-key[data-value="ok"]');
  }
  await tap(page, `.activity [data-value="${answer}"]`);
}

for (const [id, tiers] of [['count-3s', 4], ['time-5', 5]] as const) {
  for (let tier = 1; tier <= tiers; tier++) {
    test(`${id} tier ${tier} plays to the right answer`, async ({ page }) => {
      await page.goto(`/?scene=skill&id=${id}&tier=${tier}&seed=${tier + 2}`);
      await expect(page.locator('.scene.play')).toBeVisible();
      await expect(page.locator('.activity')).toBeVisible();
      await solve(page);
      await expect(page.locator('.pdot.done')).toHaveCount(1, { timeout: 20_000 });
    });
  }
}

test('the pictures: groups of 3, a number line in threes, and 5-minute clocks', async ({ page }) => {
  await page.goto('/?scene=skill&id=count-3s&tier=1&seed=1');
  await expect(page.locator('.activity-groups')).toBeVisible();
  await page.goto('/?scene=skill&id=count-3s&tier=2&seed=1');
  await expect(page.locator('.activity-numberLine')).toBeVisible();
  await page.goto('/?scene=skill&id=time-5&tier=1&seed=1');
  await expect(page.locator('.activity-clock')).toBeVisible();
  await page.goto('/?scene=skill&id=time-5&tier=4&seed=1');
  await expect(page.locator('.c-step').first()).toBeVisible();
});
