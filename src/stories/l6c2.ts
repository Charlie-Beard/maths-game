/**
 * Land 6, chapter 2: Bundles of Sticks.
 *
 * By the giant's woodpile, Moon-Face is helping to tie firewood into
 * bundles of ten. Three bundles stand in a row, and four loose sticks lie
 * beside them. The hero counts the tens (ten, twenty, thirty), then the
 * ones (thirty-one … thirty-four): three tens and four ones make 34 (the
 * chapter's tens and ones). A tag shows 30 + 4 = 34. Moon-Face smells
 * something baking in the giant's kitchen. Next: The Giant's Kitchen.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag, tick } from './bits';
import { giantHead, meadow, peek, strip } from './giants';

export default defineStory({
  lines: {
    hello: { who: 'moonface', text: 'The giant ties his firewood in bundles of ten. Help me count them!' },
    count: { who: 'narrator', text: 'Ten, twenty, thirty. Then four loose sticks: thirty-one, thirty-two, thirty-three, thirty-four!' },
    tens: { who: 'hero', text: 'Three tens and four ones. That makes thirty-four!' },
    smell: { who: 'moonface', text: 'Well done! Sniff, sniff. What is that lovely smell? The giant’s kitchen!' },
  },

  async play(k: Kit) {
    k.backdrop(meadow('l6c2-meadow'));
    k.music('cosy');

    const mf = k.character('moonface', { x: 20, y: 300, z: 20 });
    const hero = k.character('hero', { x: 900, y: 300, z: 20, flip: true });
    await k.all(k.enter(mf, 'left'), k.enter(hero, 'right'));

    // Three bundles of ten (the chapter's keepsake), tied up.
    const bundleX = [290, 470, 650];
    const bundles = bundleX.map((x) => k.keepsake('bundle', { x, y: 380, w: 180, z: 15 }));
    bundles.forEach((b) => k.set(b, { opacity: 0 }));
    await k.say('hello', mf);
    for (const b of bundles) void k.appear(b, 0.3);

    // Four loose sticks lie on the grass.
    const loose = [0, 1, 2, 3].map((i) => k.prop('stick', { x: 800 + i * 30, y: 470 + (i % 2) * 16, w: 120, z: 15 }));
    loose.forEach((s, i) => k.set(s, { opacity: 0, rotation: -20 + i * 12 }));

    const giant = giantHead(k, { x: 380, y: -150, w: 360 });
    k.set(giant, { opacity: 0 });

    // ---- Count the tens, then the ones.
    const tag = (text: string, color: string, x: number, y: number, n: string) => k.add(numberTag(text, color, `l6c2-tag-${n}`), { x, y, w: 120, z: 22 });
    const counting = async () => {
      await k.wait(300);
      for (let i = 0; i < 3; i++) {
        tick(i);
        void k.pop(bundles[i], 1.12);
        const t = tag(String((i + 1) * 10), C.goldLight, bundleX[i] + 30, 330, `t${i}`);
        void k.appear(t, 0.25);
        await k.wait(900);
      }
      for (let i = 0; i < 4; i++) {
        tick(3 + i);
        void k.appear(loose[i], 0.2);
        const t = tag(String(31 + i), C.sky, 810 + i * 30, 410, `o${i}`);
        void k.appear(t, 0.2);
        await k.wait(i === 3 ? 600 : 650);
        void k.vanish(t, 0.2);
      }
    };
    await k.all(k.say('count'), counting());

    // ---- Three tens and four ones.
    const sum = k.add(strip('30 + 4 = 34', C.leafLight, 'l6c2-sum'), { x: 330, y: 200, z: 25 });
    k.set(sum, { opacity: 0 });
    await k.all(k.say('tens', hero), k.appear(sum, 0.4));
    void k.hop(hero, 36, 2);

    // ---- A lovely smell: the giant's head peeks over, sniffing.
    void k.fade(sum, 0, 0.3);
    await peek(k, giant);
    await k.say('smell', mf);
    await k.wait(300);
  },
});
