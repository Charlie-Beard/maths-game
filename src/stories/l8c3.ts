/**
 * Land 8, chapter 3: The Toy Box.
 *
 * Joe (or Fran, if he climbs with Joe) lifts the lid of the big toy box and
 * looks down into it: twelve teddies, packed in three rows of four. A row at
 * a time they are counted, four, eight, twelve (an array: rows and how many
 * in each). The dewdrop glows. Then, far off, a drum: oom, boom, boom.
 * Next: Twos and Tens.
 */
import { C, defineStory, piece, rect, svg, type Kit } from './kit';
import { numberTag, tick } from './bits';
import { boom, dewdrop } from './toys';

/** The toy box seen from above: a wooden tray with a lining (520 × 330). */
function box(): string {
  return svg({ w: 520, h: 330, name: 'l8c3-box', boil: false }, [
    piece(rect(8, 8, 504, 314, 10), C.wood, { rough: 0.8 }),
    piece(rect(34, 34, 452, 262, 6), C.toyBlue, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }),
  ]);
}

export default defineStory({
  lines: {
    open_joe: { who: 'joe', text: 'Come and see the toy box! The toys are packed in rows.' },
    open_fran: { who: 'fran', text: 'Come and see the toy box! The toys are packed in rows.' },
    rows_joe: { who: 'joe', text: 'Three rows, and four teddies in every row. Count with me!' },
    rows_fran: { who: 'fran', text: 'Three rows, and four teddies in every row. Count with me!' },
    count: { who: 'narrator', text: 'Four, eight, twelve. Twelve teddies in the box!' },
    dew: { who: 'hero', text: 'Silky would love these teddies.' },
    drum: { who: 'narrator', text: 'Oom, boom, boom! Somebody far away was playing a big drum.' },
  },

  async play(k: Kit) {
    // Joe hosts, unless the hero is Joe: then Fran does.
    const host = k.hero === 'joe' ? 'fran' : 'joe';
    k.landScene();
    k.music('cosy');
    const hostEl = k.character(host, { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'right'));

    const tray = k.add(box(), { x: 330, y: 470, w: 520, z: 14 });
    k.set(tray, { opacity: 0 });
    await k.all(k.appear(tray, 0.5), k.say(`open_${host}`, hostEl));

    // ---- Three rows of four teddies, a row at a time.
    const ROW_Y = [496, 580, 664];
    const teds = ROW_Y.map((y) => Array.from({ length: 4 }, (_, i) => k.prop('teddy', { x: 366 + i * 104, y, w: 84, z: 16 })));
    const sums = [4, 8, 12].map((n, r) => k.add(numberTag(String(n), [C.pink, C.goldLight, C.sky][r], `l8c3-tag-${n}`), { x: 790, y: ROW_Y[r] + 4, w: 90, z: 18 }));
    teds.flat().forEach((t) => k.set(t, { opacity: 0 }));
    sums.forEach((t) => k.set(t, { opacity: 0 }));
    const filling = async () => {
      await k.wait(700);
      for (let r = 0; r < 3; r++) {
        await k.all(...teds[r].map((t, i) => k.wait(i * 110).then(() => k.appear(t, 0.3))));
        tick(r * 2);
        await k.appear(sums[r], 0.3);
        await k.wait(500);
      }
    };
    await k.all(k.say(`rows_${host}`, hostEl), filling());
    await k.all(k.say('count'), ...teds.flat().map((t, i) => k.wait(i * 90).then(() => k.hop(t, 14, 1))));

    // ---- The dewdrop, and then a drum far away.
    await k.all(k.say('dew', hero), dew.glow());
    boom();
    await k.wait(500);
    boom();
    boom(true);
    await k.say('drum');
    await k.wait(400);
  },
});
