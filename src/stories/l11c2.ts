/**
 * Land 11, chapter 2: So Many Children!
 *
 * The next morning the children are everywhere: out of the windows, up the
 * laces, peeping over the top of the boot, tumbling round the meadow.
 * Fifteen of them pop up, one after another. The Old Woman says to count
 * them in fives, a gate for every five, and the tally fills up gate by
 * gate while the tags count in fives: 5, 10, 15 (the chapter's tally and
 * counting in 5s). Fifteen children, and every one has muddy socks… which
 * brings Dame Washalot up the tree with her tub. Next: Socks on the Line.
 *
 * Joe is the host. If Joe is the child he climbs with, Beth says his line.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { card, creak, giggle, kid, showMark, tallyMarks, tallyWidth } from './shoe';

/** Where each child pops up (the top-left of a 54-wide child), in the order they appear. */
const POPS: [number, number][] = [
  [623, 500], // the front door
  [976, 196], // the windows high up
  [1062, 196],
  [1019, 318],
  [760, 430], // the round window
  [905, 180], // on the laces
  [835, 262],
  [674, 270], // up the chimney
  [980, 70], // over the top of the boot
  [1060, 66],
  [470, 560], // round the meadow
  [540, 586],
  [860, 568],
  [940, 590],
  [1100, 560],
];

export default defineStory({
  lines: {
    everywhere_joe: { who: 'joe', text: 'Children everywhere! In the windows, on the laces, even up the chimney!' },
    everywhere_beth: { who: 'beth', text: 'Children everywhere! In the windows, on the laces, even up the chimney!' },
    fives: { who: 'oldWoman', text: 'Count them in fives, my dear. Make a gate for every five.' },
    count: { who: 'narrator', text: 'One gate, two gates, three gates. Five, ten, fifteen!' },
    socks: { who: 'hero', text: 'Fifteen children! And look at all their muddy socks.' },
    washalot: { who: 'washalot', text: 'Did somebody say muddy socks? Leave them to me!' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'joe', 'beth');
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 10 });

    const ow = k.character('oldWoman', { x: 20, y: 360, w: 240, z: 20 });
    const hostEl = k.character(host, { x: 230, y: 380, w: 220, z: 21 });
    k.set([ow, hostEl], { opacity: 0 });
    await k.all(k.enter(ow, 'left'), k.wait(200).then(() => k.enter(hostEl, 'left')));

    // ---- Fifteen children pop up all over the shoe and the meadow.
    const kids = POPS.map(([x, y], i) => {
      const el = k.add(kid(i, (['wave', 'jump', 'stand', 'skip'] as const)[i % 4]), { x, y, w: 54, z: 15 + (y > 500 ? 4 : 0) });
      k.set(el, { opacity: 0 });
      return el;
    });
    const popping = async () => {
      creak(0.6);
      for (let i = 0; i < kids.length; i++) {
        if (i % 3 === 0) giggle(1);
        void k.appear(kids[i], 0.3);
        await k.wait(170);
      }
    };
    await k.all(k.say(`everywhere_${host}`, hostEl), popping());
    await k.say('fives', ow);

    // ---- The tally, gate by gate, counting in fives.
    const CARD = { x: 450, y: 50, w: 460, h: 180 };
    const board = k.add(card(CARD.w, CARD.h, 'l11c2-card'), { x: CARD.x, y: CARD.y, w: CARD.w, z: 22 });
    k.set(board, { opacity: 0 });
    await k.appear(board, 0.35);
    const x0 = CARD.x + (CARD.w - tallyWidth(15)) / 2;
    const marks = tallyMarks(k, x0, CARD.y + 30, 15, { name: 'l11c2', z: 24 });
    const tags = [5, 10, 15].map((n, g) => {
      const t = k.add(roundTag(n, g === 2 ? C.goldLight : C.cream, `l11c2-tag-${n}`), { x: x0 + g * 138 + 12, y: CARD.y + CARD.h - 26, w: 76, z: 26 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const counting = async () => {
      for (let g = 0; g < 3; g++) {
        for (let j = 0; j < 5; j++) {
          await showMark(k, marks[g * 5 + j], j === 4);
          await k.wait(j === 4 ? 120 : 40);
        }
        k.fx.pop();
        await k.appear(tags[g], 0.3);
        // The five children this gate counted hop together.
        void k.all(...kids.slice(g * 5, g * 5 + 5).map((el) => k.hop(el, 16, 1)));
        await k.wait(500);
      }
      k.sfx.success();
      k.sparkle(x0 + 2 * 138 + 50, CARD.y + CARD.h, 12, 120);
    };
    await k.all(k.say('count'), counting());

    // ---- Muddy socks… and here comes Dame Washalot with her tub.
    const hero = k.character('hero', { x: 470, y: 420, w: 200, z: 23 });
    k.set(hero, { opacity: 0 });
    await k.enter(hero, 'bottom', 0.6);
    await k.all(k.say('socks', hero), k.hop(hero, 20, 1));
    const wash = k.character('washalot', { x: 900, y: 370, w: 250, z: 30, flip: true });
    k.set(wash, { opacity: 0 });
    k.fx.splash();
    await k.enter(wash, 'right', 0.7);
    k.puff(1000, 560, 160, C.white);
    k.fx.bubbles(6);
    await k.all(k.say('washalot', wash), k.shake(wash, 6, 1));
    await k.wait(500);
  },
});
