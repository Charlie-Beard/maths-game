/**
 * Land 13, chapter 3: The Spinning Teacups.
 *
 * The Saucepan Man is riding the teacups (seen from above: his gold cup,
 * with a saucepan in it, starts at the bottom). The ride turns a quarter
 * at a time, and each quarter is counted: two quarter turns make a half
 * turn, and four make a whole turn, back where he started (the chapter's
 * turns as fractions). He mishears "whole" as "hole", which he really
 * doesn't want to fall down. Then a stripy ball rolls past by itself.
 * Next: Rolling Shapes.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { clank, FAIR_CREAM, organ, teacupRide, turn, whirr, wordTag } from './fair';

export default defineStory({
  lines: {
    whee: { who: 'saucepan', text: 'EH? SPINNING? Wheee! My saucepans are spinning too!' },
    half: { who: 'narrator', text: 'One quarter turn. Two quarter turns. That makes a half turn!' },
    whole: { who: 'narrator', text: 'Three quarter turns. Four! A whole turn, back where he started.' },
    hole: { who: 'saucepan', text: 'EH? A HOLE? Where? I don’t want to fall down a hole!' },
    not: { who: 'hero', text: 'Not a hole. A WHOLE turn! All the way round.' },
    next_joe: { who: 'joe', text: 'Look! A stripy ball, rolling away all by itself!' },
    next_fran: { who: 'fran', text: 'Look! A stripy ball, rolling away all by itself!' },
  },

  async play(k: Kit) {
    // Joe spots the ball (the next chapter is his), or Fran if Joe is the hero.
    const sib = buddy(k, 'joe', 'fran');
    k.landScene();
    k.music('adventure');
    organ();

    const hero = k.character('hero', { x: 30, y: 380, w: 230, z: 20 });
    const sauce = k.character('saucepan', { x: 890, y: 360, w: 250, z: 20, flip: true });
    const ride = k.add(teacupRide('l13c3-ride'), { x: 420, y: 100, w: 340, z: 12 });
    k.set(ride, { opacity: 0 });
    await k.all(k.enter(hero, 'left', 0.7), k.appear(ride, 0.5));
    clank(4);
    await k.enter(sauce, 'right', 0.6);
    whirr(1.2);
    // Whee: a whole turn round, so his cup is back at the bottom before the counting.
    await k.all(k.say('whee', sauce), turn(k, ride, 1, 2.2), k.shake(sauce, 6, 2));

    // ---- A quarter at a time, counted: two quarters make a half turn.
    const tags: HTMLElement[] = [];
    const quarter = async (n: number) => {
      whirr(0.8);
      clank(2);
      await turn(k, ride, 0.25, 0.9);
      const t = k.add(roundTag(n, C.goldLight, `l13c3-q${n}`), { x: 340 + n * 100, y: 470, w: 84, z: 18 });
      tags.push(t);
      k.fx.pop();
      await k.appear(t, 0.25);
    };
    const halfTag = k.add(wordTag('a half turn', FAIR_CREAM, 'l13c3-half', 280), { x: 450, y: 10, w: 280, z: 16 });
    k.set(halfTag, { opacity: 0 });
    const first = async () => {
      await quarter(1);
      await k.wait(700);
      await quarter(2);
      await k.appear(halfTag, 0.3);
    };
    await k.all(k.say('half'), first());

    // ---- Three, four: a whole turn, back where he started.
    const wholeTag = k.add(wordTag('a whole turn', FAIR_CREAM, 'l13c3-whole', 280), { x: 450, y: 10, w: 280, z: 16 });
    k.set(wholeTag, { opacity: 0 });
    const second = async () => {
      await quarter(3);
      await k.wait(500);
      await quarter(4);
      void k.fade(halfTag, 0, 0.2);
      await k.appear(wholeTag, 0.3);
      k.sparkle(590, 400, 12, 120);
    };
    await k.all(k.say('whole'), second());

    // ---- "EH? A HOLE?"
    await k.all(k.say('hole', sauce), k.shake(sauce, 10, 2));
    await k.all(k.say('not', hero), k.hop(hero, 30, 1));

    // ---- A stripy ball rolls past, all by itself.
    await k.all(...tags.map((t) => k.fade(t, 0, 0.3)), k.fade(wholeTag, 0, 0.3));
    const ball = k.keepsake('rollingBall', { x: 1200, y: 500, w: 110, z: 24 });
    const kid = k.character(sib, { x: 300, y: 400, w: 220, z: 22 });
    k.set(kid, { opacity: 0 });
    k.fx.boing();
    void k.all(k.to(ball, 3, { x: -1500, ease: 'none' }), k.to(ball, 3, { rotation: -900, ease: 'none' }));
    await k.wait(500);
    await k.enter(kid, 'bottom', 0.6);
    await k.all(k.say(`next_${sib}`, kid), k.hop(kid, 26, 1));
    await k.wait(400);
  },
});
