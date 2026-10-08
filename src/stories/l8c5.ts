/**
 * Land 8, chapter 5: Fives on Parade.
 *
 * Captain Tin's parade: four rows of five soldiers march across the floor,
 * one row after another. A big counter at the top climbs with every row:
 * five, ten, fifteen, twenty (counting in fives). Tin pins a medal on the
 * hero, the dewdrop glows, and he points to the toy shop. Next: The Toy Shop.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag, tick } from './bits';
import { dewdrop } from './toys';

export default defineStory({
  lines: {
    parade: { who: 'toySoldier', text: 'Parade, parade! Five soldiers in every row. Quick march!' },
    count: { who: 'narrator', text: 'Five, ten, fifteen, twenty. Four rows, and twenty soldiers!' },
    medal: { who: 'toySoldier', text: 'Splendid counting! Here is a medal for you, {name}.' },
    thanks: { who: 'hero', text: 'Thank you, Captain! The dewdrop is glowing again.' },
    next: { who: 'toySoldier', text: 'Now pop along to Mr Oom Boom Boom’s toy shop!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('adventure');
    const tin = k.character('toySoldier', { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    await k.all(k.enter(tin, 'left'), k.enter(hero, 'right'));

    // ---- Four rows of five march in, one row after another.
    const ROW_Y = [330, 400, 470, 540];
    const rows = ROW_Y.map((y) => Array.from({ length: 5 }, (_, i) => k.prop('soldier', { x: 340 + i * 98, y, w: 80, z: 16 })));
    const totals = [5, 10, 15, 20].map((n) => k.add(numberTag(String(n), C.goldLight, `l8c5-tag-${n}`), { x: 535, y: 130, w: 140, z: 30 }));
    rows.flat().forEach((s) => k.set(s, { x: -560, opacity: 1 }));
    totals.forEach((t) => k.set(t, { opacity: 0 }));
    const marching = async () => {
      await k.wait(700);
      for (let r = 0; r < 4; r++) {
        k.fx.patter(6, 0.1);
        await k.all(...rows[r].map((s, i) => k.wait(i * 60).then(() => k.to(s, 0.9, { x: 0, ease: 'power1.out' }))));
        tick(r * 2);
        if (r) void k.fade(totals[r - 1], 0, 0.15);
        await k.appear(totals[r], 0.3);
        await k.wait(450);
      }
    };
    await k.all(k.say('parade', tin), marching());
    await k.all(k.say('count'), ...rows.flat().map((s, i) => k.wait((i % 5) * 60).then(() => k.hop(s, 14, 1))));

    // ---- A medal for the hero.
    k.music('triumph');
    const medal = k.keepsake(k.chapter!.keepsake, { x: 530, y: 60, w: 150, z: 40 });
    k.set(medal, { opacity: 0 });
    k.sfx.reveal();
    await k.appear(medal, 0.4);
    k.sparkle(605, 130, 12, 120);
    await k.all(k.say('medal', tin), k.to(medal, 2.2, { x: 330, y: 250, scale: 0.7, ease: 'sine.inOut' }));
    await k.all(k.say('thanks', hero), dew.glow(), k.hop(hero, 24, 1));
    await k.say('next', tin);
    await k.wait(400);
  },
});
