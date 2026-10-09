import { expect, test, type Page } from '@playwright/test';
import { settled } from './wait';

/*
 * Leaving and coming back (docs/REVIEW.md, phase 5): the home button, a
 * locked screen, another app, portrait, and the tab closed and reopened.
 * The game must hold still while he's away, say nothing to an empty room,
 * and carry on where he was.
 *
 * The iPad's own voice is replaced by a stand-in that logs what is said, so
 * the tests can see speech starting, ending and being cut off.
 */

interface Said {
  t: number;
  ev: 'speak' | 'end' | 'cancel';
  text: string;
}

async function logVoice(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: { t: number; ev: string; text: string }[] = [];
    (window as unknown as { __said: typeof log }).__said = log;
    let q: { u: SpeechSynthesisUtterance; t: ReturnType<typeof setTimeout> }[] = [];
    const synth = {
      speak(u: SpeechSynthesisUtterance) {
        log.push({ t: Date.now(), ev: 'speak', text: u.text });
        // About as long as the iPad takes to say it.
        const item = {
          u,
          t: setTimeout(() => {
            q = q.filter((x) => x !== item);
            log.push({ t: Date.now(), ev: 'end', text: u.text });
            u.onend?.(new Event('end') as SpeechSynthesisEvent);
          }, 400 + u.text.length * 50),
        };
        q.push(item);
      },
      cancel() {
        for (const { u, t } of q) {
          clearTimeout(t);
          log.push({ t: Date.now(), ev: 'cancel', text: u.text });
          u.onerror?.(new Event('error') as SpeechSynthesisErrorEvent);
        }
        q = [];
      },
      getVoices: () => [],
      onvoiceschanged: null,
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth });
  });
}

const said = (page: Page): Promise<Said[]> => page.evaluate(() => (window as unknown as { __said: Said[] }).__said.slice());

/** The app goes out of sight (or comes back), as when the home button is pressed. */
async function setHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((h) => {
    Object.defineProperty(document, 'visibilityState', { value: h ? 'hidden' : 'visible', configurable: true });
    Object.defineProperty(document, 'hidden', { value: h, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

async function openChapter(page: Page, url = '/?scene=chapter&id=l1c1&seed=7'): Promise<void> {
  await page.goto(url);
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', /.+/);
}

async function answerRight(page: Page, n: number): Promise<void> {
  const scene = page.locator('.scene.play');
  for (let i = 0; i < n; i++) {
    const before = await page.locator('.pdot.done').count();
    const answer = await scene.getAttribute('data-answer');
    const card = page.locator(`.choice[data-value="${answer}"]`);
    await settled(card);
    await card.click({ force: true });
    await expect(page.locator('.pdot.done')).toHaveCount(before + 1, { timeout: 20_000 });
  }
}

/** Waits until the voice has said a line containing `text` to its end. */
async function heard(page: Page, text: string, from = 0): Promise<void> {
  await expect.poll(async () => (await said(page)).slice(from).some((s) => s.ev === 'end' && s.text.includes(text)), { timeout: 20_000 }).toBe(true);
}

test('away from a question: nothing is said, and Silky reads it again on return', async ({ page }) => {
  await page.clock.install();
  await logVoice(page);
  await openChapter(page);
  const question = 'How many';
  await heard(page, question);

  await setHidden(page, true);
  await expect(page.locator('body.is-paused')).toHaveCount(1);
  const leftAt = (await said(page)).length;
  // A minute away: the 12 s idle hint would have read the question twice.
  await page.clock.fastForward(60_000);
  await page.clock.runFor(1000);
  expect((await said(page)).slice(leftAt).filter((s) => s.ev === 'speak')).toEqual([]);

  // Back: the question once, and no burst of hints that piled up.
  await setHidden(page, false);
  await heard(page, question, leftAt);
  await page.clock.runFor(3000);
  const back = (await said(page)).slice(leftAt).filter((s) => s.ev === 'speak');
  expect(back).toHaveLength(1);
  // The idle hint counts again from now: 12 s later it reads the question.
  await page.clock.runFor(12_000);
  await expect.poll(async () => (await said(page)).slice(leftAt).filter((s) => s.ev === 'speak').length).toBe(2);
});

test('away mid-line in a story: the story waits, and the line is said again on return', async ({ page }) => {
  await page.clock.install();
  await logVoice(page);
  await page.goto('/?scene=story&id=l1c1');
  // Wait until the first line has started.
  await expect.poll(async () => (await said(page)).filter((s) => s.ev === 'speak').length, { timeout: 20_000 }).toBeGreaterThan(0);
  const line = (await said(page)).filter((s) => s.ev === 'speak').at(-1)!.text;

  await setHidden(page, true);
  const leftAt = (await said(page)).length;
  await page.clock.fastForward(30_000);
  await page.clock.runFor(1000);
  const away = (await said(page)).slice(leftAt);
  expect(away.filter((s) => s.ev === 'speak')).toEqual([]);

  await setHidden(page, false);
  // The line he was hearing starts again from the beginning.
  await expect.poll(async () => (await said(page)).slice(leftAt).find((s) => s.ev === 'speak')?.text, { timeout: 10_000 }).toBe(line);
});

test('turned to portrait mid-problem: quiet behind the rotate screen, the question again when turned back', async ({ page }) => {
  await logVoice(page);
  await openChapter(page);
  await heard(page, 'How many');
  await page.setViewportSize({ width: 820, height: 1180 });
  await expect(page.locator('#rotate')).toBeVisible();
  const leftAt = (await said(page)).length;
  await page.waitForTimeout(1500);
  expect((await said(page)).slice(leftAt).filter((s) => s.ev === 'speak')).toEqual([]);
  await page.setViewportSize({ width: 1180, height: 820 });
  await expect(page.locator('#rotate')).toBeHidden();
  await heard(page, 'How many', leftAt);
  // The same problem, still waiting for him.
  await expect(page.locator('.pdot.done')).toHaveCount(0);
});

test('the back-forward cache: leaving the page pauses, coming back carries on', async ({ page }) => {
  await logVoice(page);
  await openChapter(page);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await expect(page.locator('body.is-paused')).toHaveCount(1);
  const leftAt = (await said(page)).length;
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('body.is-paused')).toHaveCount(0);
  await heard(page, 'How many', leftAt);
});

test('away during the page turn into a chapter: it finishes on return, with one problem screen', async ({ page }) => {
  await logVoice(page);
  await page.goto('/?scene=chapter&id=l1c1&seed=7');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  await setHidden(page, true);
  await page.waitForTimeout(1500);
  // Held mid-wipe: the problem hasn't been asked.
  expect((await said(page)).filter((s) => s.ev === 'speak' && s.text.includes('How many'))).toEqual([]);
  await setHidden(page, false);
  await go.click({ force: true }).catch(() => {});
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', /.+/);
  await expect(page.locator('.scene.play')).toHaveCount(1);
  await heard(page, 'How many');
});

test('the app closed mid-chapter (no tap on the way out): reopening carries on from the same problem', async ({ page }) => {
  await openChapter(page);
  await answerRight(page, 2);
  const third = await page.locator('.scene.play').getAttribute('data-answer');
  // The iPad drops the tab: a reload, with no "Back to the tree".
  await page.reload();
  await openChapter(page, '/?scene=chapter&id=l1c1&seed=99');
  await expect(page.locator('.pdot')).toHaveCount(8);
  await expect(page.locator('.pdot.done')).toHaveCount(2);
  await expect(page.locator('.scene.play')).toHaveAttribute('data-answer', third!);
  // The two answers he gave are counted once.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(saved.toffees).toBe(2);
});

test('the app closed straight after the last answer: reopening goes on to the story, not the problems again', async ({ page }) => {
  await openChapter(page);
  await answerRight(page, 7);
  const scene = page.locator('.scene.play');
  const card = page.locator(`.choice[data-value="${await scene.getAttribute('data-answer')}"]`);
  await settled(card);
  await card.click({ force: true });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}').toffees)).toBe(8);
  // Mid-celebration, before the story.
  await page.reload();
  await page.goto('/?scene=chapter&id=l1c1&seed=99');
  const go = page.getByRole('button', { name: 'Play' });
  await settled(go);
  await go.click({ force: true });
  const skip = page.getByRole('button', { name: 'Skip the story' });
  await expect(skip).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.scene.play')).toHaveCount(0);
  await skip.click({ force: true });
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 20_000 });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faraway-maths:v1:jasper') ?? '{}'));
  expect(saved.chapters.l1c1.done).toBe(true);
  expect(saved.toffees).toBe(8);
});

test('a place kept by an older build is dropped: the chapter starts again', async ({ page }) => {
  await page.goto('/?scene=map');
  await page.evaluate(() =>
    localStorage.setItem(
      'faraway-maths:resume:jasper',
      JSON.stringify({ chapter: 'l1c1', problems: [{ skill: 'count-10', old: true }, { skill: 'count-10', old: true }], index: 1, base: 2, build: 'an-old-build' }),
    ),
  );
  await openChapter(page);
  await expect(page.locator('.pdot')).toHaveCount(8);
  await expect(page.locator('.pdot.done')).toHaveCount(0);
});

test('a place kept for a chapter that is done since (on another device, say) is not used', async ({ page }) => {
  await openChapter(page);
  await answerRight(page, 2);
  expect(await page.evaluate(() => localStorage.getItem('faraway-maths:resume:jasper'))).toContain('"chapter":"l1c1"');
  // The chapter is finished elsewhere and the save comes down to this iPad.
  await page.evaluate(() => {
    const k = 'faraway-maths:v1:jasper';
    const s = JSON.parse(localStorage.getItem(k)!);
    s.chapters.l1c1 = { plays: 1, done: true, firstDone: Date.now() };
    localStorage.setItem(k, JSON.stringify(s));
  });
  await openChapter(page, '/?scene=chapter&id=l1c1&seed=99');
  await expect(page.locator('.pdot.done')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('faraway-maths:resume:jasper'))).toBeNull();
});
