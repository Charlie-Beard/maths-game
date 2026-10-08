/**
 * Land 10, chapter 5: The Folk in Cages.
 *
 * The great hall of the prison, under the moon. Two cages hang there: Dame
 * Washalot (beside herself: she's taken my washtub too!) and Mr Watzisname
 * (asleep, of course). Her tub hangs high on a hook that only comes down
 * for the right answer: 60 add what makes 100? {name} counts on in tens,
 * 70, 80, 90, 100: forty (the chapter's missing numbers to 100). Down comes
 * the tub, in through the bars, and Dame Washalot sets to scrubbing, suds
 * everywhere. Mr Watzisname wakes for a moment, wants breakfast, and snores
 * again. The cage locks are her own and won't open yet, so they promise to
 * come back. Then, down the corridor: clank, CLANK. The Saucepan Man is
 * going the wrong way! Next: The Hardest Sum.
 */
import { C, defineStory, ink, svg, type Kit } from './kit';
import { roundTag } from './bits';
import { crowFlying } from './snapSchool';
import { answerTag, caged, prisonSound, slateSum, washtub } from './snapPrison';

const WASH = { x: 40, y: 50, w: 300 };
const WATZ = { x: 840, y: 50, w: 300 };
const TUB = { x: 500, y: 60, w: 180 };
const SLATE = { x: 390, y: 210, w: 400 };

/** A hook on a chain, hanging from the ceiling, 60 × 120. */
const hook = (): string =>
  svg({ w: 60, h: 120, name: 'l10c5-hook', boil: false }, [
    ink([[30, 0], [30, 80]], { width: 5, color: C.ironLight }),
    ink([[30, 80], [30, 104], [44, 110], [50, 96]], { width: 6, color: C.ironLight }),
  ]);

export default defineStory({
  lines: {
    help: { who: 'washalot', text: 'Oh, my dears! Get us out of here! And she’s taken my washtub!' },
    hook: { who: 'narrator', text: 'The tub hung high on a hook. Under it: 60 add what makes 100?' },
    forty: { who: 'narrator', text: '{name} counted on in tens. 70, 80, 90, 100. Forty! Down came the tub.' },
    scrub: { who: 'washalot', text: 'My lovely tub! I’ll scrub this horrid prison clean!' },
    sleepy: { who: 'watzisname', text: 'Wha…? Is it breakfast? Zzz…' },
    promise: { who: 'hero', text: 'Her cage locks won’t open yet. But we’ll come back for you. Promise.' },
    clank: { who: 'moonface', text: 'Clank? CLANK? Oh no. The Saucepan Man is going the wrong way!' },
  },

  async play(k: Kit) {
    k.landScene(10);
    k.music('sneaky');
    k.dim(0.2, '#0b0a14');
    k.light(250, 120, 150, { color: C.moonPale, strength: 0.25 });
    k.ambient('dust', { count: 10, area: [0, 80, 1180, 500] });

    const wash = caged(k, 'washalot', { ...WASH, z: 34, lock: '? ? ?' });
    const watz = caged(k, 'watzisname', { ...WATZ, z: 34, lock: '? ? ?', flip: true });
    const tubPart = k.part(wash.who, 'tub');
    tubPart.forEach((p) => (p.style.opacity = '0'));
    k.part(wash.who, 'suds').forEach((p) => (p.style.opacity = '0'));
    if (!k.calm) void k.to(k.part(watz.who, 'zzz'), 1.2, { y: -8, opacity: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const crow = k.add(crowFlying('c5'), { x: 880, y: -6, w: 120, z: 37 });
    k.set(crow, { rotation: -10 });

    const hookEl = k.add(hook(), { x: TUB.x + 60, y: -10, w: 60, z: 35 });
    const tub = k.add(washtub('l10c5-tub'), { ...TUB, z: 36 });
    const sl = k.add(slateSum('60 + ? = 100', SLATE.w, 'c5'), { ...SLATE, z: 35 });
    k.set(sl, { opacity: 0 });

    const hero = k.character('hero', { x: 300, y: 410, w: 220, z: 38 });
    const mf = k.character('moonface', { x: 660, y: 410, w: 220, z: 38, flip: true });
    k.set([hero, mf], { opacity: 0 });
    await k.all(k.enter(hero, 'left', 0.9), k.enter(mf, 'right', 0.9));

    // Dame Washalot, beside herself.
    prisonSound.rattle(4);
    await k.all(k.say('help', wash.who), ...wash.all.map((el) => k.shake(el, 5, 2)));

    // The tub on its hook, and the sum.
    await k.all(k.say('hook'), k.wait(400).then(() => k.appear(sl, 0.35)), k.pop(tub, 1.1));

    // Counting on in tens: 70, 80, 90, 100.
    const counting = async () => {
      const tags = [70, 80, 90, 100].map((n, i) => {
        const t = k.add(roundTag(n, i === 3 ? C.goldLight : C.chalk, `l10c5-${n}`), { x: 380 + i * 110, y: 340, w: 90, z: 37 });
        k.set(t, { opacity: 0 });
        return t;
      });
      for (const t of tags) {
        prisonSound.drip();
        await k.appear(t, 0.3);
        await k.wait(350);
      }
      const ans = k.add(answerTag('40'), { x: SLATE.x + 170, y: SLATE.y + 100, w: 110, z: 36 });
      k.set(ans, { opacity: 0 });
      prisonSound.chalk(0.4);
      await k.appear(ans, 0.3);
      prisonSound.unlock();
      k.sparkle(SLATE.x + 225, SLATE.y + 140, 12, 120);
      await k.all(...tags.map((t) => k.fade(t, 0, 0.3)));
      // The hook lets the tub down and it glides in through her bars.
      k.fx.creak();
      await k.all(k.to(tub, 1.0, { y: 200, ease: 'sine.inOut' }), k.to(hookEl, 1.0, { y: 200, ease: 'sine.inOut' }), k.fade(sl, 0, 0.6), k.fade(ans, 0, 0.6));
      prisonSound.squeeze();
      await k.to(tub, 0.9, { x: -330, y: 300, scale: 0.6, ease: 'power1.inOut' });
      await k.fade(tub, 0, 0.2);
      tubPart.forEach((p) => (p.style.opacity = '1'));
      k.part(wash.who, 'suds').forEach((p) => (p.style.opacity = '1'));
    };
    await k.all(k.say('forty'), counting());

    // Scrub, scrub: suds everywhere.
    k.music('cosy');
    k.fx.splash();
    k.fx.bubbles(8);
    k.ambient('bubbles', { count: 10, area: [40, 60, 320, 400] });
    void k.to(wash.who, 0.25, { rotation: 4, yoyo: true, repeat: 5, ease: 'sine.inOut' });
    await k.all(k.say('scrub', wash.who), k.hop(hero, 24), k.hop(mf, 24));

    // Mr Watzisname wakes for a moment.
    const lids = k.part(watz.who, 'eyesOpen');
    lids.forEach((p) => (p.style.opacity = '1'));
    k.part(watz.who, 'eyes').forEach((p) => (p.style.opacity = '0'));
    await k.all(k.say('sleepy', watz.who), k.shake(watz.who, 3, 1));
    lids.forEach((p) => (p.style.opacity = '0'));
    k.part(watz.who, 'eyes').forEach((p) => (p.style.opacity = '1'));

    // A promise: the locks are hers, and won't open yet.
    k.music('sneaky');
    prisonSound.stuck();
    await k.all(...[...wash.all, ...watz.all].map((el) => k.shake(el, 3, 1)));
    await k.say('promise', hero);

    // Down the corridor: clank, CLANK.
    prisonSound.clank(4);
    await k.wait(300);
    prisonSound.clank(5);
    prisonSound.caw(1);
    void k.to(crow, 0.6, { y: -200, x: 200, opacity: 0, ease: 'power2.in' });
    await k.all(k.say('clank', mf), k.shake(mf, 6, 2));
    k.face(mf, false);
    await k.all(k.to(hero, 0.8, { x: 700, ease: 'power2.in' }), k.to(mf, 0.8, { x: 600, ease: 'power2.in' }));
    await k.wait(400);
  },
});
