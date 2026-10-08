/**
 * Land 6, chapter 4: Counting to a Hundred.
 *
 * Joe (or Beth, if he climbs with Joe) says giants count to a hundred
 * before breakfast. A big square fills up row by row, ten squares in each
 * row, and a tag lands at the end of every row: ten, twenty … a hundred
 * (the chapter's counting to 100). Ten rows of ten make a hundred. The
 * giant booms along with it. Next: Giant Steps.
 */
import { C, defineStory, piece, rect, svg, type Kit } from './kit';
import { buddy, tick } from './bits';
import { countTag, giantHead, meadow, peek } from './giants';

const ROW = [C.red, C.orange, C.gold, C.leaf, C.teal, C.blue, C.purple, C.pink, C.rose, C.sky];

/** One row of ten paper squares (460 × 44). */
function row(n: number): string {
  return svg({ w: 460, h: 44, name: `l6c4-row-${n}`, boil: false }, [
    ...Array.from({ length: 10 }, (_, i) => piece(rect(i * 46 + 2, 2, 42, 40, 4), ROW[n % ROW.length], { rough: 0.6, shadow: false })),
  ]);
}

export default defineStory({
  lines: {
    hello_joe: { who: 'joe', text: 'Giants count to a hundred before breakfast. Let’s try, ten at a time!' },
    hello_beth: { who: 'beth', text: 'Giants count to a hundred before breakfast. Let’s try, ten at a time!' },
    count: { who: 'narrator', text: 'Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred!' },
    tens: { who: 'hero', text: 'Ten rows of ten make a hundred!' },
    boom: { who: 'giant', text: 'ONE HUNDRED! Well counted, little ones!' },
    go_joe: { who: 'joe', text: 'Come on! There’s a giant shoelace to measure.' },
    go_beth: { who: 'beth', text: 'Come on! There’s a giant shoelace to measure.' },
  },

  async play(k: Kit) {
    // Joe hosts, unless the hero is Joe: then Beth does.
    const host = buddy(k, 'joe', 'beth');
    k.backdrop(meadow('l6c4-meadow'));
    k.music('adventure');

    const hostEl = k.character(host, { x: 20, y: 360, z: 20 });
    const hero = k.character('hero', { x: 310, y: 360, z: 20 });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'left', 0.8));
    await k.say(`hello_${host}`, hostEl);

    // ---- The hundred square fills up, a row of ten at a time.
    const rows = async () => {
      await k.wait(300);
      for (let r = 0; r < 10; r++) {
        const el = k.add(row(r), { x: 660, y: 110 + r * 48, w: 460, z: 15 });
        k.set(el, { opacity: 0, x: -30 });
        tick(r);
        void k.to(el, 0.3, { opacity: 1, x: 0 });
        const t = k.add(countTag((r + 1) * 10, ROW[r], `l6c4-tag-${r}`), { x: 592, y: 106 + r * 48, w: 56, z: 16 });
        void k.appear(t, 0.2);
        await k.wait(r === 9 ? 700 : 450);
      }
    };
    await k.all(k.say('count'), rows());

    await k.say('tens', hero);
    void k.hop(hero, 40, 2);

    // ---- The giant booms the answer.
    const giant = giantHead(k, { x: 150, y: -110, w: 320 });
    k.set(giant, { opacity: 0 });
    await peek(k, giant);
    void k.quake(6);
    await k.say('boom', giant);
    await k.say(`go_${host}`, hostEl);
    await k.wait(300);
  },
});
