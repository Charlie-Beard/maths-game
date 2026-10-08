/**
 * Land 6, chapter 3: The Giant's Kitchen.
 *
 * In the giant's kitchen the Saucepan Man stares up at a saucepan as big as
 * a house and falls in love with it. On the table the giant's biscuits
 * are laid out in rows of ten: ten, twenty, thirty, forty, and a short row
 * of seven more. Four tens and seven ones make forty-seven (the chapter's
 * tens and ones, counting on towards a hundred). The Saucepan Man wants to
 * count even higher. Next: Counting to a Hundred.
 */
import { sceneSvg, sky } from '../art/lands/common';
import { C, defineStory, piece, rect, type Kit } from './kit';
import { tick } from './bits';
import { countTag, popRow, strip } from './giants';

/** The giant's kitchen: warm walls, a long wooden table top, a window onto giant sky. */
function kitchen(): string {
  return sceneSvg('l6c3-kitchen', [
    ...sky([
      ['#e9cf9e', 0],
      ['#efd9ae', 300],
      ['#f1e0bd', 500],
    ]),
    // A window onto the giant sky, and a shelf.
    piece(rect(60, 60, 260, 200, 8), C.brownDark),
    piece(rect(76, 76, 228, 168, 4), C.giantSky, { edge: 'cut', fibre: false }),
    piece(rect(188, 76, 4, 168), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(76, 156, 228, 4), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
    // The table.
    piece(rect(-20, 560, 1220, 280), C.wood, { rough: 0.8 }),
    piece(rect(-20, 548, 1220, 22), C.tan, { rough: 0.6 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(rect(i * 220 - 40, 580, 6, 240), C.brownDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.25 })),
  ]);
}

export default defineStory({
  lines: {
    love: { who: 'saucepan', text: 'A saucepan as big as a HOUSE! I think I’m in love!' },
    count: { who: 'narrator', text: 'The giant baked his biscuits in rows of ten. Ten, twenty, thirty, forty. And seven more!' },
    tens: { who: 'hero', text: 'Four tens and seven ones. That’s forty-seven biscuits!' },
    more: { who: 'saucepan', text: 'Forty-seven! But how high can we go? Let’s count all the way to a hundred!' },
  },

  async play(k: Kit) {
    k.backdrop(kitchen());
    k.music('cosy');

    // The enormous saucepan, with the giant's spoon beside it.
    const bigPan = k.prop('saucepan', { x: 760, y: 190, w: 400, z: 12 });
    const spoon = k.keepsake('giantSpoon', { x: 1000, y: 330, w: 260, z: 14 });
    k.set(spoon, { opacity: 0 });
    k.set(bigPan, { opacity: 0 });

    const pan = k.character('saucepan', { x: 20, y: 330, z: 20 });
    const hero = k.character('hero', { x: 460, y: 340, z: 20 });
    await k.all(k.enter(pan, 'left'), k.enter(hero, 'bottom'), k.appear(bigPan, 0.6));
    void k.fade(spoon, 1, 0.4);

    await k.say('love', pan);
    void k.hop(pan, 40, 2);

    // ---- Rows of ten biscuits on the table, then seven more.
    const tags: HTMLElement[] = [];
    const rows = async () => {
      await k.wait(300);
      for (let r = 0; r < 4; r++) {
        await popRow(k, 'popBiscuit', 10, 330, 130 + r * 52, 40, 44, { startTick: 0, gap: 55 });
        const t = k.add(countTag((r + 1) * 10, C.goldLight, `l6c3-tag-${r}`), { x: 250, y: 120 + r * 52, w: 64, z: 22 });
        tags.push(t);
        void k.appear(t, 0.2);
        await k.wait(350);
      }
      await popRow(k, 'popBiscuit', 7, 330, 130 + 4 * 52, 40, 44, { startTick: 0, gap: 120 });
      tick(7);
      const t = k.add(countTag('+7', C.sky, 'l6c3-tag-ones'), { x: 250, y: 120 + 4 * 52, w: 64, z: 22 });
      void k.appear(t, 0.2);
      tags.push(t);
      await k.wait(300);
    };
    await k.all(k.say('count'), rows());

    const sum = k.add(strip('40 + 7 = 47', C.leafLight, 'l6c3-sum'), { x: 400, y: 12, z: 25 });
    k.set(sum, { opacity: 0 });
    await k.all(k.say('tens', hero), k.appear(sum, 0.4));
    void k.hop(hero, 36, 2);
    await k.say('more', pan);
    void k.wait(200);
  },
});
