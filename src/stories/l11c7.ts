/**
 * Land 11, chapter 7: A Red Cap in the Laces.
 *
 * Morning, and Silky buys buns for the children's breakfast at the bread
 * stall: sixteen pence, paid with a twenty pence coin. They count on for
 * the change, seventeen, eighteen, nineteen, twenty, and four pennies drop
 * onto the counter (the chapter's change). But then one penny goes
 * skittering off on its own, up towards the laces… and there, peeping out
 * between them, is a little red cap with a bell on it, and two narrow
 * yellow eyes. Jingle. Gone. Silky saw it. (The first sign of the Red
 * Goblins: ROADMAP "Session 6".) Then the old leather creaks and the
 * ground rumbles: the shoe wants to walk. Next: The Shoe Walks Away!
 *
 * Only a peep, never a fright (PLAN.md §2): a cap and two eyes, gone at once.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag, roundTag } from './bits';
import { breadStall, clink, coin, creak, jingle, priceSign, redPeek, SHOE } from './shoe';

const STALL = { x: 250, y: 250, w: 420 };

export default defineStory({
  lines: {
    buns: { who: 'silky', text: 'Buns for breakfast! They cost sixteen pence. I’ll pay with twenty pence.' },
    count: { who: 'narrator', text: 'Count on from sixteen. Seventeen, eighteen, nineteen, twenty. Four pennies change!' },
    gone: { who: 'hero', text: 'Hey! One penny is rolling away… all by itself!' },
    cap: { who: 'silky', text: 'Did you see that? A little red cap, hiding in the laces…' },
    walk: { who: 'oldWoman', text: 'Red caps? Oh my. And listen! The shoe is creaking. I think it wants to walk!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 8 });

    k.add(breadStall('l11c7-stall'), { x: STALL.x, y: STALL.y, w: STALL.w, z: 12, still: true });
    const sign = k.add(priceSign('16p', 'l11c7-price'), { x: STALL.x + 40, y: STALL.y + 120, w: 130, z: 14 });
    const silky = k.character('silky', { x: 10, y: 330, w: 230, z: 20 });
    const hero = k.character('hero', { x: 920, y: 400, w: 220, z: 21, flip: true });
    k.set([silky, hero], { opacity: 0 });
    await k.all(k.enter(silky, 'left'), k.enter(hero, 'right'));
    k.float(silky, 8, 2.4);

    // ---- Twenty pence on the counter.
    const twenty = k.add(coin(20), { x: STALL.x + 170, y: STALL.y + 112, w: 96, z: 16 });
    k.set(twenty, { x: -260, y: 0, opacity: 0 });
    const paying = async () => {
      await k.pop(sign, 1.15);
      await k.wait(1500);
      k.set(twenty, { opacity: 1 });
      await k.to(twenty, 0.6, { x: 0, ease: 'power2.out' });
      clink();
    };
    await k.all(k.say('buns', silky), paying());

    // ---- Counting on from sixteen: a penny for every number.
    const TAG = (i: number): number => 250 + i * 120;
    const tags = [16, 17, 18, 19, 20].map((n, i) => {
      const t = k.add(roundTag(n, n === 20 ? C.goldLight : C.cream, `l11c7-tag-${n}`), { x: TAG(i), y: 70, w: 96, z: 24 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const PENNY = (i: number): number => STALL.x + 30 + i * 66;
    const PENNY_Y = STALL.y + 205;
    const pennies = [0, 1, 2, 3].map((i) => {
      const p = k.add(coin(1), { x: PENNY(i), y: PENNY_Y, w: 60, z: 17 });
      k.set(p, { opacity: 0 });
      return p;
    });
    const change = k.add(numberTag('4p', C.goldLight, 'l11c7-change'), { x: STALL.x + 290, y: STALL.y + 10, w: 120, z: 24 });
    k.set(change, { opacity: 0 });
    const counting = async () => {
      void k.fade(sign, 0, 0.3);
      await k.appear(tags[0], 0.3);
      await k.wait(1000);
      for (let i = 1; i < tags.length; i++) {
        await k.appear(tags[i], 0.28);
        k.set(pennies[i - 1], { opacity: 1, y: -50 });
        await k.to(pennies[i - 1], 0.3, { y: 0, ease: 'bounce.out' });
        clink(i);
        await k.wait(260);
      }
      k.sfx.success();
      await k.appear(change, 0.35);
    };
    await k.all(k.say('count'), counting());
    await k.wait(900);
    await k.all(...tags.map((t) => k.fade(t, 0, 0.4)), k.fade(change, 0, 0.4));

    // ---- One penny rolls away, up towards the laces…
    const runaway = pennies[3];
    const rolling = async () => {
      await k.to(runaway, 1.0, { x: 560 - PENNY(3), rotation: 360, ease: 'power1.inOut' });
      await k.to(runaway, 1.6, { x: SHOE.laces.x - PENNY(3) - 30, y: SHOE.laces.y - PENNY_Y + 10, rotation: 900, ease: 'sine.inOut' });
      jingle();
      await k.to(runaway, 0.25, { scale: 0, opacity: 0 });
    };
    await k.all(k.wait(400).then(() => k.say('gone', hero)), rolling(), k.wait(600).then(() => k.shake(hero, 4, 1)));

    // ---- A red cap peeps out between the laces. Jingle. Gone.
    k.silence();
    const peek = k.add(redPeek('l11c7-peek'), { x: SHOE.laces.x - 55, y: SHOE.laces.y - 50, w: 110, z: 10 });
    k.set(peek, { opacity: 0, y: 30 });
    await k.camera({ zoom: 1.5, x: SHOE.laces.x - 80, y: SHOE.laces.y + 60 }, 1);
    await k.to(peek, 0.5, { opacity: 1, y: 0, ease: 'power2.out' });
    const eyes = k.part(peek, 'eyes');
    await k.to(eyes, 0.3, { x: -6 });
    await k.to(eyes, 0.3, { x: 6 });
    jingle();
    await k.to(peek, 0.3, { y: 30, opacity: 0, ease: 'power2.in' });
    await k.camera({}, 0.8);
    k.music('sneaky');
    await k.all(k.say('cap', silky), k.to(silky, 0.6, { x: 120, ease: 'sine.inOut' }));

    // ---- And the old shoe creaks: it wants to walk.
    const ow = k.character('oldWoman', { x: 430, y: 380, w: 230, z: 23 });
    k.set(ow, { opacity: 0 });
    await k.enter(ow, 'bottom', 0.6);
    creak(1.2);
    k.fx.rumble(2);
    void k.quake(5);
    await k.all(k.say('walk', ow), k.shake(ow, 4, 2));
    creak();
    await k.wait(500);
  },
});
