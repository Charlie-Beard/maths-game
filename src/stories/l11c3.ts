/**
 * Land 11, chapter 3: Socks on the Line.
 *
 * Dame Washalot has washed all fifteen children's muddy socks (the end of
 * chapter 2) and wants to know how many of each colour she has. So they
 * make a pictogram: one picture for every sock, flying out of her tub
 * into its row. Four red, six blue, three yellow (the chapter's
 * pictogram). {name}'s friend reads it: blue has the most, yellow has the
 * fewest. Then a clank, clank: the Saucepan Man arrives with broth for
 * breakfast. Next: Broth for Breakfast.
 */
import { C, defineStory, type Kit } from './kit';
import { roundTag, tick } from './bits';
import { card, sock } from './shoe';
import { snapSound } from './snapSchool';

/** The rows of the pictogram: the colour of sock, and how many. */
const ROWS: { color: string; count: number }[] = [
  { color: C.red, count: 4 },
  { color: C.blue, count: 6 },
  { color: '#f2cf3b', count: 3 },
];

const CARD = { x: 450, y: 30, w: 580, h: 330 };
const ROW_Y = (r: number): number => CARD.y + 30 + r * 96;
const SOCK_X = (i: number): number => CARD.x + 40 + i * 66;

export default defineStory({
  lines: {
    wash: { who: 'washalot', text: 'Wash, wash, wash! Let’s make a chart. One picture for every sock.' },
    count: { who: 'narrator', text: 'Four red socks. Six blue socks. Three yellow socks.' },
    most: { who: 'hero', text: 'Blue has the most. Yellow has the fewest!' },
    broth: { who: 'saucepan', text: 'EH? SOCKS? I don’t want socks! I’ve brought BROTH for breakfast!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    k.ambient('bubbles', { count: 8, area: [0, 300, 450, 380] });

    const wash = k.character('washalot', { x: 10, y: 360, w: 250, z: 20 });
    const hero = k.character('hero', { x: 930, y: 400, w: 220, z: 21, flip: true });
    k.set([wash, hero], { opacity: 0 });
    await k.all(k.enter(wash, 'left'), k.enter(hero, 'right'));
    k.fx.splash();
    await k.all(k.say('wash', wash), k.shake(wash, 5, 2));

    // ---- The pictogram: every sock flies out of the tub into its row.
    const board = k.add(card(CARD.w, CARD.h, 'l11c3-card'), { x: CARD.x, y: CARD.y, w: CARD.w, z: 18 });
    k.set(board, { opacity: 0 });
    await k.appear(board, 0.35);
    const TUB: [number, number] = [120, 560];
    const tags = ROWS.map((row, r) => {
      const t = k.add(roundTag(row.count, r === 1 ? C.goldLight : C.cream, `l11c3-tag-${r}`), { x: CARD.x + CARD.w - 96, y: ROW_Y(r) + 4, w: 74, z: 24 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const rows: HTMLElement[][] = ROWS.map(() => []);
    const filling = async () => {
      for (let r = 0; r < ROWS.length; r++) {
        for (let i = 0; i < ROWS[r].count; i++) {
          const x = SOCK_X(i);
          const y = ROW_Y(r);
          const el = k.add(sock(ROWS[r].color), { x, y, w: 54, z: 22 });
          k.set(el, { x: TUB[0] - x, y: TUB[1] - y, scale: 0.4, rotation: -60 });
          rows[r].push(el);
          k.fx.splash();
          await k.to(el, 0.42, { x: 0, y: 0, scale: 1, rotation: 0, ease: 'power2.out' });
          tick(i);
          await k.wait(60);
        }
        await k.appear(tags[r], 0.25);
        await k.wait(r === 2 ? 0 : 520);
      }
    };
    await k.all(k.say('count'), filling());

    // ---- Most and fewest.
    const reading = async () => {
      await k.wait(200);
      k.sfx.success();
      await k.all(...rows[1].map((el) => k.hop(el, 18, 1)), k.pop(tags[1], 1.25));
      k.sparkle(SOCK_X(5) + 30, ROW_Y(1) + 36, 10, 110);
      await k.wait(700);
      await k.all(...rows[2].map((el) => k.shake(el, 3, 1)), k.pop(tags[2], 1.15));
    };
    await k.all(k.say('most', hero), reading(), k.hop(hero, 20, 1));

    // ---- Clank, clank: broth for breakfast.
    const sauce = k.character('saucepan', { x: 330, y: 380, w: 230, z: 26 });
    k.set(sauce, { opacity: 0 });
    snapSound.clank(4);
    await k.enter(sauce, 'bottom', 0.6);
    await k.all(k.say('broth', sauce), k.hop(sauce, 24, 2));
    await k.wait(500);
  },
});
