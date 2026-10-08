/**
 * Land 9, chapter 2: Snowball Sharing.
 *
 * Joe (or Beth, if he climbs with Joe), {name} and Mr Snowman have twelve
 * snowballs to share between three: one for you, one for you, one for me,
 * again and again, four each (the chapter's fair sharing). Then the
 * snowballs are good for something else: laid out as a KEY, piece two of
 * the plan to rescue Silky, and the key is scratched on the map beside
 * the tree. Fran (or Beth) turns up with a sledge. Next: Sledges in Groups.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag } from './bits';
import { dewdrop, flourish, mapBoard, pat, shimmer } from './snow';

export default defineStory({
  lines: {
    rule_joe: { who: 'joe', text: 'Twelve snowballs for three of us. Everyone gets the same! That’s the rule of the snow.' },
    rule_beth: { who: 'beth', text: 'Twelve snowballs for three of us. Everyone gets the same! That’s the rule of the snow.' },
    share: { who: 'narrator', text: 'One for you, one for you, one for me. Again, and again. Four each!' },
    idea: { who: 'hero', text: 'Let’s make something with them. What about a key?' },
    key: { who: 'snowman', text: 'A key! Locks need keys. That is piece two of our plan.' },
    map: { who: 'snowman', text: 'Now it goes on the map. The tree, Silky and the key!' },
    next_fran: { who: 'fran', text: 'Hello! Who wants to go sledging? I found a sledge!' },
    next_beth: { who: 'beth', text: 'Hello! Who wants to go sledging? I found a sledge!' },
  },

  async play(k: Kit) {
    // Joe hosts, unless the hero is Joe: then Beth does. Fran brings the sledge (Beth, if he climbs with Fran).
    const host = k.hero === 'joe' ? 'beth' : 'joe';
    const sib = k.hero === 'fran' ? 'beth' : 'fran';
    k.landScene();
    k.ambient('snow', { count: 24, z: 40 });
    k.music('cosy');

    const hostEl = k.character(host, { x: 20, y: 352, z: 20 });
    const snowman = k.character('snowman', { x: 450, y: 300, w: 240, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    await k.all(k.enter(hostEl, 'left'), k.enter(snowman, 'bottom'), k.enter(hero, 'right'));
    const drop = dewdrop(k);

    // ---- Twelve snowballs, in a row along the top.
    const balls = Array.from({ length: 12 }, (_, i) => {
      const b = k.prop('snowball', { x: 254 + i * 56, y: 42, w: 74, z: 15 });
      k.set(b, { opacity: 0 });
      return b;
    });
    void k.say(`rule_${host}`, hostEl);
    for (const b of balls) {
      await k.appear(b, 0.18);
      await k.wait(60);
    }
    await k.wait(900);

    // ---- Dealt out one at a time: host, hero, Mr Snowman. Four each.
    // A pile is a square of four under each of them.
    const PILE: [number, number][] = [[110, 548], [545, 568], [900, 548]];
    const who = [hostEl, hero, snowman];
    const pileOf = [0, 2, 1]; // host, hero, snowman -> pile positions
    const tags = [0, 1, 2].map((i) => {
      // The children's shares sit above their heads; the snowman's on his tummy.
      const t = k.add(numberTag('4', C.goldLight, `l9c2-four-${i}`), { x: PILE[i][0] - 30, y: i === 1 ? PILE[i][1] - 90 : 290, w: 100, z: 22 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const dealing = async () => {
      for (let i = 0; i < balls.length; i++) {
        const p = pileOf[i % 3];
        const n = Math.floor(i / 3);
        const tx = PILE[p][0] + (n % 2) * 58;
        const ty = PILE[p][1] + Math.floor(n / 2) * 52;
        void k.hop(who[i % 3], 10, 1);
        await k.to(balls[i], 0.32, { x: tx - parseFloat(balls[i].style.left), y: ty - parseFloat(balls[i].style.top), ease: 'power2.inOut' });
        pat();
        await k.wait(80);
      }
      await k.all(...tags.map((t) => k.appear(t, 0.3)));
      await drop.glow();
    };
    await k.all(k.say('share'), dealing());
    await k.wait(300);

    // ---- A key out of snowballs: a ring of six, a shaft of four and two teeth.
    await k.say('idea', hero);
    await k.all(...tags.map((t) => k.fade(t, 0, 0.3)));
    const KEY: [number, number][] = [
      ...[0, 1, 2, 3, 4, 5].map((i) => [400 + Math.cos((i / 6) * Math.PI * 2) * 54, 160 + Math.sin((i / 6) * Math.PI * 2) * 54] as [number, number]),
      [518, 160], [576, 160], [634, 160], [692, 160],
      [634, 216], [692, 216],
    ];
    const keying = async () => {
      for (let i = 0; i < balls.length; i++) {
        void k.to(balls[i], 0.7, { x: KEY[i][0] - 37 - parseFloat(balls[i].style.left), y: KEY[i][1] - 37 - parseFloat(balls[i].style.top), ease: 'power2.inOut' });
        await k.wait(70);
      }
      await k.wait(700);
      shimmer();
    };
    await k.all(k.say('key', snowman), keying());
    await k.hop(snowman, 24, 1);

    // ---- The key goes on the map.
    await k.all(...balls.map((b) => k.fade(b, 0, 0.5)));
    const plan = mapBoard(k, 2);
    k.set(plan.board, { opacity: 0 });
    Object.values(plan.pieces).forEach((el) => k.set(el!, { opacity: 0 }));
    await k.fade(plan.board, 1, 0.5);
    await k.all(...Object.entries(plan.pieces).filter(([kind]) => kind !== 'key').map(([, el]) => k.fade(el!, 1, 0.4)));
    const drawing = async () => {
      await flourish(k, snowman, 'armR');
      await plan.reveal();
    };
    await k.all(k.say('map', snowman), drawing());
    await drop.glow();

    // ---- Along comes a sledge.
    const friend = k.character(sib, { x: 470, y: 380, z: 40 });
    const sled = k.prop('sledge', { x: 440, y: 560, w: 200, z: 41 });
    k.fx.whizz();
    await k.all(k.enter(friend, 'right', 0.7), k.enter(sled, 'right', 0.7));
    await k.all(k.say(`next_${sib}`, friend), k.hop(hero, 24, 2));
    await k.wait(500);
  },
});
