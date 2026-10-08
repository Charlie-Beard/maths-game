/**
 * Land 10, chapter 2: Through the Bars.
 *
 * At the prison gate, by moonlight. Two sums are chalked on slates beside
 * it: 45 + 3 and 52 − 4 (the chapter's adding and taking away a one-digit
 * number). Both make 48, so bar 48 is the one: {name} counts on along the
 * bars, 46, 47, 48, and it bends with a creak. Somewhere above, her heels
 * clack and a crow lands on the gate; everyone freezes until it flaps off.
 * Then they squeeze through, Moon-Face last (he's round: breathe in…
 * POP!). Inside, a long dark corridor, her rules nailed up all along it.
 * Next: The Corridor of Rules.
 *
 * Joe is the host. If Joe is the child he climbs with, Beth says his lines.
 */
import { C, defineStory, type Kit } from './kit';
import { at, buddy, roundTag } from './bits';
import { crowFlying } from './snapSchool';
import { barRails, corridor, GAP, numberedBar, outsideWall, prisonSound, ruleCard, slateSum } from './snapPrison';

const BAR_X = (i: number): number => GAP.x + 4 + i * 84;
const BAR_Y = GAP.y - 10;

export default defineStory({
  lines: {
    sums_joe: { who: 'joe', text: 'Two sums on the gate. Both answers are the same. That’s our bar!' },
    sums_beth: { who: 'beth', text: 'Two sums on the gate. Both answers are the same. That’s our bar!' },
    bar: { who: 'narrator', text: '45 add 3 is 48. 52 take away 4 is 48 too. Bar 48!' },
    freeze: { who: 'narrator', text: 'Clack, clack, up above. A crow! Nobody moved a muscle.' },
    squeeze: { who: 'moonface', text: 'Breathe in, Moon-Face. I’m very round, you know… OOF!' },
    inside: { who: 'hero', text: 'We’re in! Her rules are nailed up all along the walls…' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'joe', 'beth');
    k.backdrop(outsideWall('l10c2-outside'));
    k.music('sneaky');
    k.dim(0.15, '#140f22');
    k.light(1010, 90, 140, { color: C.moonPale, strength: 0.25 });
    k.ambient('dust', { count: 8, area: [0, 100, 1180, 500] });

    k.add(barRails(GAP.w), { x: GAP.x, y: BAR_Y, w: GAP.w, z: 6 });
    const bars = [0, 1, 2, 3, 4].map((i) => k.add(numberedBar(46 + i), { x: BAR_X(i), y: BAR_Y, w: 80, z: 7 }));
    const s1 = k.add(slateSum('45 + 3', 250, 'c2a'), { x: 70, y: 150, w: 250, z: 8 });
    const s2 = k.add(slateSum('52 − 4', 250, 'c2b'), { x: 860, y: 150, w: 250, z: 8 });
    k.set([s1, s2], { opacity: 0 });

    const hero = k.character('hero', { x: 60, y: 450, w: 230, z: 15 });
    const hostEl = k.character(host, { x: 890, y: 450, w: 230, z: 15, flip: true });
    const mf = k.character('moonface', { x: 300, y: 470, w: 220, z: 16 });
    k.set([hero, hostEl, mf], { opacity: 0 });
    await k.all(k.enter(hero, 'left', 0.8), k.enter(mf, 'left', 0.9), k.enter(hostEl, 'right', 0.8));

    // The two sums.
    prisonSound.chalk(0.5);
    await k.appear(s1, 0.3);
    prisonSound.chalk(0.5);
    await k.appear(s2, 0.3);
    await k.say(`sums_${host}`, hostEl);

    // Counting on along the bars: 46, 47, 48. Bar 48 bends.
    const counting = async () => {
      for (let i = 0; i < 3; i++) {
        const t = k.add(roundTag(46 + i, i === 2 ? C.goldLight : C.chalk, `l10c2-tag-${i}`), { x: BAR_X(i) - 10, y: 100, w: 100, z: 20 });
        k.set(t, { opacity: 0 });
        prisonSound.rattle(1);
        void k.appear(t, 0.3);
        await k.pop(bars[i], 1.08);
        await k.wait(400);
        if (i < 2) void k.fade(t, 0.35, 0.3);
      }
      k.sfx.success();
      k.sparkle(BAR_X(2) + 40, 360, 12, 120);
      k.fx.creak();
      k.remove(bars[2]);
      bars[2] = k.add(numberedBar(48, { bent: true, tag: C.goldLight }), { x: BAR_X(2) - 6, y: BAR_Y, w: 80, z: 7 });
      await k.pop(bars[2], 1.06);
    };
    await k.all(k.say('bar'), counting());
    await k.all(k.hop(hero, 30), k.hop(hostEl, 30));

    // Clack, clack… a crow lands on the gate. Freeze!
    k.silence();
    prisonSound.heels(4, 0.34, 0.5);
    const crow = k.add(crowFlying('c2'), { x: 620, y: 70, w: 180, z: 22 });
    const moonlit = k.light(710, 125, 120, { color: C.moonPale, strength: 0, z: 21 });
    k.set(crow, { x: 600, y: -260 });
    void k.fade(moonlit, 0.35, 1.0);
    const frozen = k.say('freeze');
    await k.to(crow, 1.0, { x: 0, y: 0, ease: 'power2.out' });
    prisonSound.caw(2);
    void k.camera({ zoom: 1.3, x: 700, y: 260 }, 0.8);
    await k.shake(crow, 4, 1);
    await frozen;
    void k.camera({}, 0.8);
    prisonSound.caw(1);
    void k.fade(moonlit, 0, 0.8);
    await k.to(crow, 1.0, { x: -900, y: -200, ease: 'power2.in' });
    k.music('sneaky');

    // Squeezing through bar 48, one by one, Moon-Face last.
    const [bx] = at(bars[2]);
    const through = async (el: HTMLElement, w: number) => {
      const [ex] = at(el);
      await k.to(el, 0.6, { x: `+=${bx + 40 - w / 2 - ex}`, ease: 'sine.inOut' });
      el.style.zIndex = '5';
      prisonSound.squeeze();
      await k.to(el, 0.7, { y: '-=60', scale: 0.6, opacity: 0, ease: 'power1.in' });
    };
    await through(hostEl, 230);
    await through(hero, 230);
    await k.to(mf, 0.6, { x: `+=${bx + 40 - 110 - at(mf)[0]}`, ease: 'sine.inOut' });
    const squeezing = async () => {
      prisonSound.squeeze();
      await k.to(mf, 0.8, { scaleX: 0.75, scaleY: 1.1, ease: 'sine.inOut' });
      mf.style.zIndex = '5';
      k.fx.pop();
      void k.shake(bars[2], 4, 1);
      await k.to(mf, 0.4, { y: '-=60', scaleX: 0.6, scaleY: 0.6, opacity: 0, ease: 'back.in(2)' });
    };
    await k.all(k.say('squeeze', mf), squeezing());

    // Inside: a long dark corridor, and her rules all along it.
    let h2!: HTMLElement;
    await k.cut(() => {
      k.backdrop(corridor('l10c2-corridor'));
      k.dim(0.25, '#0b0a14');
      k.light(80, 140, 130, { color: '#d9e2cf', strength: 0.3, flicker: true });
      k.light(670, 140, 130, { color: '#d9e2cf', strength: 0.3, flicker: true });
      [[220, 160, -3], [560, 200, 2], [900, 150, -2]].forEach(([x, y, r], i) => {
        const c = k.add(ruleCard(i + 1, ['24 + 13', '35 + 21', '42 + 37'][i]), { x, y, w: 240, z: 6 });
        k.set(c, { rotation: r });
      });
      k.character(host, { x: 330, y: 440, w: 210, z: 19 });
      k.character('moonface', { x: 900, y: 430, w: 220, z: 19, flip: true });
      h2 = k.character('hero', { x: 60, y: 420, w: 230, z: 20 });
    });
    prisonSound.drip();
    await k.all(k.say('inside', h2), k.wait(900).then(() => prisonSound.drip()));
    prisonSound.heels(3, 0.4, 0.4);
    await k.wait(900);
  },
});
