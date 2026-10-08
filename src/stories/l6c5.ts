/**
 * Land 6, chapter 5: Giant Steps.
 *
 * Beth (or Joe, if he climbs with Beth) has found a giant shoelace lying on
 * the grass and wants to know how long it is. The hero walks beside it,
 * heel to toe, one footstep at a time, and a number lands at every step:
 * one, two, three … six (the chapter's measuring in footsteps). The
 * shoelace is six footsteps long. The giant wonders which of his laces is
 * longer. Next: Bigger or Smaller?
 */
import { C, defineStory, ink, piece, rect, svg, type Kit } from './kit';
import { buddy, jump, tick } from './bits';
import { countTag, giantHead, meadow, peek } from './giants';

const STEP = 130;
const X0 = 270;

/** A long shoelace with a stiff tip at each end (800 × 60). */
function lace(): string {
  const pts: [number, number][] = [[20, 36], [140, 26], [260, 38], [400, 28], [540, 38], [680, 28], [780, 34]];
  return svg({ w: 800, h: 60, name: 'l6c5-lace', boil: false }, [
    ink(pts, { width: 20, color: C.ochre }),
    ink(pts, { width: 4, color: C.honeyDark, opacity: 0.6 }),
    piece(rect(0, 26, 26, 20, 4), C.steelDark, { edge: 'cut', fibre: false }),
    piece(rect(774, 22, 26, 20, 4), C.steelDark, { edge: 'cut', fibre: false }),
  ]);
}

export default defineStory({
  lines: {
    hello_beth: { who: 'beth', text: 'How long is a giant’s shoelace? Let’s measure it in footsteps!' },
    hello_joe: { who: 'joe', text: 'How long is a giant’s shoelace? Let’s measure it in footsteps!' },
    count: { who: 'narrator', text: 'Heel to toe, heel to toe. One, two, three, four, five, six footsteps!' },
    six: { who: 'hero', text: 'The shoelace is six footsteps long!' },
    next: { who: 'giant', text: 'Six footsteps! Now, is my other lace bigger or smaller? Let me see!' },
  },

  async play(k: Kit) {
    // Beth hosts, unless the hero is Beth: then Joe does.
    const host = buddy(k, 'beth', 'joe');
    k.backdrop(meadow('l6c5-meadow'));
    k.music('cosy');

    const hostEl = k.character(host, { x: 10, y: 330, w: 230, z: 20 });
    const laceEl = k.add(lace(), { x: X0, y: 470, w: STEP * 6, z: 12 });
    k.set(laceEl, { opacity: 0 });
    const hero = k.character('hero', { x: X0 - 20, y: 270, w: 200, z: 20 });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'left', 0.8), k.fade(laceEl, 1, 0.5));
    await k.say(`hello_${host}`, hostEl);

    // ---- Walk beside it, heel to toe: a number at the end of each footstep.
    const walk = async () => {
      await k.wait(300);
      // Little marks along the lace where each footstep ends.
      for (let i = 0; i < 6; i++) {
        const x = X0 + (i + 1) * STEP;
        await jump(k, hero, x - 100, 270, 60, 0.45);
        tick(i);
        const t = k.add(countTag(i + 1, C.goldLight, `l6c5-tag-${i}`), { x: x - 65, y: 395, w: 64, z: 22 });
        void k.appear(t, 0.2);
        const m = k.add(svg({ w: 8, h: 70, name: `l6c5-mark-${i}`, boil: false }, [piece(rect(0, 0, 8, 70), C.brownDark, { edge: 'cut', fibre: false, shadow: false })]), { x: x - 4, y: 440, w: 8, z: 14 });
        void k.appear(m, 0.2);
        await k.wait(i === 5 ? 500 : 350);
      }
    };
    await k.all(k.say('count'), walk());

    await k.say('six', hero);
    void k.hop(hero, 40, 2);

    const giant = giantHead(k, { x: 800, y: -110, w: 340 });
    k.set(giant, { opacity: 0 });
    await peek(k, giant);
    await k.say('next', giant);
    await k.wait(300);
  },
});
