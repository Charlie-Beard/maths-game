/**
 * Land 9, chapter 3: Sledges in Groups.
 *
 * Fran (or Beth, if he climbs with Fran) has eight friends and sledges
 * that hold two. How many sledges? The friends hop on two at a time and
 * a number appears over each sledge: one, two, three, four. Four sledges!
 * Off they whoosh down the hill. A sledge is quick, and quick is just what
 * a rescue needs: piece three of the plan (the sledge for the getaway)
 * goes on the map. Then the Saucepan Man comes clanking with an ice-pie.
 * Next: Half an Ice-Pie.
 */
import { keepsakeArt } from '../art/keepsakes';
import { C, defineStory, type Kit } from './kit';
import { roundTag, tick as tickNote } from './bits';
import { dewdrop, mapBoard, rider, swish } from './snow';

const COATS: [string, string][] = [
  [C.red, C.gold],
  [C.blue, C.red],
  [C.green, C.white],
  [C.pink, C.blue],
  [C.gold, C.green],
  [C.purple, C.pink],
  [C.orange, C.blue],
  [C.sky, C.red],
];

export default defineStory({
  lines: {
    ask_fran: { who: 'fran', text: 'Eight friends, and two on every sledge. How many sledges do we need?' },
    ask_beth: { who: 'beth', text: 'Eight friends, and two on every sledge. How many sledges do we need?' },
    count: { who: 'narrator', text: 'Two on a sledge. Two, four, six, eight. That is four sledges!' },
    whee: { who: 'hero', text: 'Hold on tight! Whee, down the hill!' },
    plan_fran: { who: 'fran', text: 'Sledges are quick. We can ride one home with Silky! Put it on the map.' },
    plan_beth: { who: 'beth', text: 'Sledges are quick. We can ride one home with Silky! Put it on the map.' },
    next: { who: 'saucepan', text: 'Ice-pie! I made an ice-pie! Who wants a bit?' },
  },

  async play(k: Kit) {
    // Fran hosts, unless the hero is Fran: then Beth does.
    const host = k.hero === 'fran' ? 'beth' : 'fran';
    k.landScene();
    k.ambient('snow', { count: 24, z: 40 });
    k.music('adventure');

    const hostEl = k.character(host, { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'right'));
    const drop = dewdrop(k);

    // ---- Four empty sledges in a row, and eight friends waiting at the top.
    const SX = [300, 450, 600, 750];
    const sleds = SX.map((x) => {
      const s = k.prop('sledge', { x, y: 470, w: 150, z: 14 });
      k.set(s, { opacity: 0 });
      return s;
    });
    const riders = COATS.map(([coat, hat], i) => {
      const r = k.add(rider(coat, hat, `l9c3-rider-${i}`), { x: 290 + i * 80, y: 150, w: 62, z: 16 });
      k.set(r, { opacity: 0 });
      return r;
    });
    void k.say(`ask_${host}`, hostEl);
    await k.all(...sleds.map((s, i) => k.wait(i * 120).then(() => k.appear(s, 0.3))), ...riders.map((r, i) => k.wait(i * 80).then(() => k.appear(r, 0.3))));
    await k.wait(1800);

    // ---- Two hop on each sledge, and the sledges are counted.
    const tags = SX.map((x, n) => {
      const t = k.add(roundTag(n + 1, C.goldLight, `l9c3-tag-${n + 1}`), { x: x + 35, y: 330, w: 80, z: 18 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const loading = async () => {
      await k.wait(300);
      for (let n = 0; n < 4; n++) {
        const pair = [riders[n * 2], riders[n * 2 + 1]];
        await k.all(
          ...pair.map((r, j) => {
            const tx = SX[n] + 18 + j * 52;
            return k.to(r, 0.5, { x: tx - parseFloat(r.style.left), y: 405 - parseFloat(r.style.top), ease: 'power2.inOut' });
          }),
        );
        tickNote(n);
        await k.appear(tags[n], 0.25);
        await k.wait(180);
      }
      await drop.glow();
    };
    await k.all(k.say('count'), loading());
    await k.wait(300);

    // ---- Off they whoosh, down the hill and out of sight.
    const ride = async () => {
      swish();
      for (let n = 0; n < 4; n++) {
        const group = [sleds[n], riders[n * 2], riders[n * 2 + 1], tags[n]];
        void k.all(...group.map((el) => k.to(el, 1.3, { x: '+=1100', y: '+=90', ease: 'power2.in' })));
        await k.wait(260);
      }
      await k.wait(900);
    };
    void k.hop(hero, 28, 2);
    await k.all(k.say('whee', hero), ride());

    // ---- A sledge for the getaway, drawn on the map.
    const plan = mapBoard(k, 3);
    k.set(plan.board, { opacity: 0 });
    Object.values(plan.pieces).forEach((el) => k.set(el!, { opacity: 0 }));
    await k.fade(plan.board, 1, 0.5);
    await k.all(...Object.entries(plan.pieces).filter(([kind]) => kind !== 'sledge').map(([, el]) => k.fade(el!, 1, 0.4)));
    const drawing = async () => {
      await k.wait(500);
      await plan.reveal();
    };
    await k.all(k.say(`plan_${host}`, hostEl), drawing());
    await drop.glow();

    // ---- The Saucepan Man clanks in with an ice-pie.
    const sp = k.character('saucepan', { x: 470, y: 380, z: 40 });
    const pie = k.add(keepsakeArt('icePie'), { x: 500, y: 560, w: 170, z: 41 });
    k.fx.patter(5, 0.1);
    await k.all(k.enter(sp, 'right', 0.8), k.enter(pie, 'right', 0.8));
    await k.all(k.say('next', sp), k.hop(hero, 24, 2));
    await k.wait(500);
  },
});
