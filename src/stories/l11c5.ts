/**
 * Land 11, chapter 5: The Bread Shop.
 *
 * Broth without bread won't do (the end of chapter 4), so off they go to
 * the bread stall in the meadow. A big loaf costs fifteen pence, and Beth
 * pays with a twenty pence coin. They count on for the change: sixteen,
 * seventeen, eighteen, nineteen, twenty, and down drops a five pence coin
 * (the chapter's change and coins). A slice of bread for every child! All
 * that broth and bread makes {name}'s eyes heavy, and the Old Woman says
 * it's bedtime in the toe. Next: Bedtime in the Toe.
 *
 * Beth is the host. If Beth is the child he climbs with, Joe says her line.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, numberTag, roundTag } from './bits';
import { breadStall, clink, coin, giggle, priceSign } from './shoe';

const STALL = { x: 290, y: 250, w: 420 };

export default defineStory({
  lines: {
    pay_beth: { who: 'beth', text: 'A big loaf is fifteen pence. I’ll pay with a twenty pence coin.' },
    pay_joe: { who: 'joe', text: 'A big loaf is fifteen pence. I’ll pay with a twenty pence coin.' },
    count: { who: 'narrator', text: 'Count on from fifteen. Sixteen, seventeen, eighteen, nineteen, twenty. Five pence change!' },
    slice: { who: 'oldWoman', text: 'Bread at last! A slice for every child. Thank you, my dears!' },
    yawn: { who: 'hero', text: 'Broth and bread… Yaaawn. I’m so sleepy now.' },
    bed: { who: 'oldWoman', text: 'Then it’s bedtime in the toe. Off we go, sleepyheads!' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'beth', 'joe');
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 8 });

    k.add(breadStall('l11c5-stall'), { x: STALL.x, y: STALL.y, w: STALL.w, z: 12, still: true });
    const sign = k.add(priceSign('15p', 'l11c5-price'), { x: STALL.x + 40, y: STALL.y + 120, w: 130, z: 14 });
    const ow = k.character('oldWoman', { x: 10, y: 370, w: 230, z: 20 });
    const hostEl = k.character(host, { x: 720, y: 390, w: 220, z: 21, flip: true });
    const hero = k.character('hero', { x: 935, y: 400, w: 215, z: 20, flip: true });
    k.set([ow, hostEl, hero], { opacity: 0 });
    await k.all(k.enter(ow, 'left'), k.enter(hostEl, 'right'), k.wait(200).then(() => k.enter(hero, 'right')));
    await k.pop(sign, 1.15);

    // ---- A twenty pence coin on the counter.
    const twenty = k.add(coin(20), { x: STALL.x + 170, y: STALL.y + 112, w: 96, z: 16 });
    k.set(twenty, { x: 360, y: 60, opacity: 0 });
    const paying = async () => {
      await k.wait(1500);
      k.set(twenty, { opacity: 1 });
      await k.to(twenty, 0.6, { x: 0, y: 0, ease: 'power2.out' });
      clink();
      await k.pop(twenty, 1.1);
    };
    await k.all(k.say(`pay_${host}`, hostEl), paying());

    // ---- Counting on from fifteen to twenty: five pence change.
    const TAG = (i: number): number => 200 + i * 128;
    const tags = [15, 16, 17, 18, 19, 20].map((n, i) => {
      const t = k.add(roundTag(n, n === 20 ? C.goldLight : C.cream, `l11c5-tag-${n}`), { x: TAG(i), y: 70, w: 100, z: 24 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const five = k.add(coin(5), { x: STALL.x + 290, y: STALL.y + 112, w: 90, z: 17 });
    k.set(five, { opacity: 0, y: -160 });
    const change = k.add(numberTag('5p', C.goldLight, 'l11c5-change'), { x: STALL.x + 350, y: STALL.y + 10, w: 120, z: 24 });
    k.set(change, { opacity: 0 });
    const counting = async () => {
      await k.appear(tags[0], 0.3);
      await k.wait(1000);
      for (let i = 1; i < tags.length; i++) {
        k.fx.pop();
        await k.appear(tags[i], 0.28);
        await k.wait(i < 5 ? 330 : 500);
      }
      k.set(five, { opacity: 1 });
      await k.to(five, 0.45, { y: 0, ease: 'bounce.out' });
      clink(2);
      k.sfx.success();
      await k.appear(change, 0.35);
      k.sparkle(STALL.x + 335, STALL.y + 150, 12, 120);
    };
    await k.all(k.say('count'), counting());
    await k.wait(1000);

    // ---- A slice for every child.
    await k.all(
      ...tags.map((t) => k.fade(t, 0, 0.4)),
      k.fade(change, 0, 0.4),
      k.fade(twenty, 0, 0.4),
      k.to(five, 0.6, { x: 360, y: 40, opacity: 0, scale: 0.5, ease: 'power2.in' }),
    );
    const loaf = k.keepsake('loaf', { x: STALL.x + 150, y: STALL.y + 40, w: 150, z: 18 });
    k.set(loaf, { opacity: 0 });
    await k.appear(loaf, 0.4);
    giggle(3);
    await k.all(k.say('slice', ow), k.hop(ow, 16, 1), k.pop(loaf, 1.12));

    // ---- Sleepy now: bedtime in the toe.
    const dusk = k.dim(0, '#2a2050');
    void k.fade(dusk, 0.3, 3);
    await k.all(k.say('yawn', hero), k.to(hero, 1.2, { rotation: -4, y: 8, ease: 'sine.inOut' }));
    await k.all(k.say('bed', ow), k.walk(ow, 60, 1, 2));
    await k.wait(500);
  },
});
