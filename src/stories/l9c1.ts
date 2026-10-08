/**
 * Land 9, chapter 1: A Land of Snow.
 *
 * Mr Snowman greets {name} and the snow-white hush of the new land. He
 * has six snowballs to share between the two of them: one for you, one
 * for me… three each (the chapter's sharing into equal groups). But {name}
 * is sad: Silky is missing, and her dewdrop glows only a little. So Mr
 * Snowman scratches a map in the snow with his twig arm: the first pieces
 * of THE PLAN (the Faraway Tree, and Silky in Dame Snap's cage). A friend
 * comes running with a bucket of snowballs. Next: Snowball Sharing.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag } from './bits';
import { crunch, dewdrop, flourish, mapBoard, pat, shimmer } from './snow';

export default defineStory({
  lines: {
    hello: { who: 'snowman', text: 'Brr! Hello, {name}! Welcome to the Land of Snow. Shall we share these snowballs fairly?' },
    share: { who: 'narrator', text: 'Six snowballs. One for you, one for me. Again, and again. Three each!' },
    sad: { who: 'hero', text: 'Silky would love it here. I miss her. Her dewdrop is still glowing.' },
    plan: { who: 'snowman', text: 'Then we will rescue her! Every good rescue starts with a plan. Let me draw a map.' },
    map: { who: 'snowman', text: 'Here is your tree. And here is Silky, in Dame Snap’s cage. That is piece one!' },
    next_joe: { who: 'joe', text: 'Hello! Look at my bucket of snowballs. Can I share too?' },
    next_beth: { who: 'beth', text: 'Hello! Look at my bucket of snowballs. Can I share too?' },
  },

  async play(k: Kit) {
    // Joe arrives at the end, unless the hero is Joe: then Beth does.
    const sib = k.hero === 'joe' ? 'beth' : 'joe';
    k.landScene();
    k.ambient('snow', { count: 24, z: 40 });
    k.music('cosy');

    const snowman = k.character('snowman', { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 890, y: 352, z: 20, flip: true });
    await k.all(k.enter(snowman, 'left'), k.enter(hero, 'right'));
    crunch(3);
    const drop = dewdrop(k);
    await k.say('hello', snowman);

    // ---- Six snowballs, shared out one at a time: three each.
    const SPOT: [number, number][] = [
      [440, 300], [520, 300], [600, 300],
      [440, 380], [520, 380], [600, 380],
    ];
    const balls = SPOT.map(([x, y]) => {
      const b = k.prop('snowball', { x, y, w: 80, z: 15 });
      k.set(b, { opacity: 0 });
      void k.appear(b, 0.25);
      return b;
    });
    await k.wait(300);
    const mine = k.add(numberTag('3', C.goldLight, 'l9c1-three-a'), { x: 230, y: 600, w: 110, z: 18 });
    const yours = k.add(numberTag('3', C.goldLight, 'l9c1-three-b'), { x: 830, y: 600, w: 110, z: 18 });
    [mine, yours].forEach((t) => k.set(t, { opacity: 0 }));
    const dealing = async () => {
      await k.wait(300);
      // Even balls to the snowman's side, odd to the hero's.
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        const toSnowman = i % 2 === 0;
        const side = Math.floor(i / 2);
        const tx = toSnowman ? 200 + side * 70 : 790 + side * 70;
        await k.to(b, 0.4, { x: tx - parseFloat(b.style.left), y: 520 - parseFloat(b.style.top), scale: 0.8, ease: 'power2.inOut' });
        pat();
        await k.wait(120);
      }
      await k.all(k.appear(mine, 0.3), k.appear(yours, 0.3));
      await drop.glow();
    };
    await k.all(k.say('share'), dealing());

    // ---- But {name} misses Silky… so Mr Snowman draws a plan in the snow.
    await k.say('sad', hero);
    await k.all(...balls.map((b) => k.fade(b, 0, 0.5)), k.fade(mine, 0, 0.5), k.fade(yours, 0, 0.5));
    await k.say('plan', snowman);
    const plan = mapBoard(k, 1);
    k.set(plan.board, { opacity: 0 });
    await k.fade(plan.board, 1, 0.6);
    const drawing = async () => {
      await flourish(k, snowman, 'armR');
      await plan.reveal();
      shimmer();
    };
    await k.all(k.say('map', snowman), drawing());
    await drop.glow();

    // ---- Here comes a friend with a bucket of snowballs.
    const friend = k.character(sib, { x: 460, y: 400, z: 24 });
    await k.enter(friend, 'right', 0.8);
    crunch(2);
    await k.all(k.say(`next_${sib}`, friend), k.hop(snowman, 24, 2));
    await k.wait(500);
  },
});
