/**
 * Land 9, chapter 4: Half an Ice-Pie.
 *
 * The Saucepan Man has made an ice-pie, and there are only two of them:
 * fair's fair, so a line is cut right down the middle and the pie falls
 * apart into two equal halves (the chapter's halves). {name} sees the two
 * halves and has an idea for the plan: Dame Snap's gates open in two halves,
 * and only ONE half needs to open to slip through. The gates go on the map
 * (piece four). Then Moon-Face runs up, puffing: the clock tower has frozen!
 * Next: The Frozen Clock Tower.
 */
import { defineStory, ink, svg, C, type Kit } from './kit';
import { numberTag } from './bits';
import { dewdrop, mapBoard, pieWedges } from './snow';

/** A thin dotted line for the cut (60 × 330). */
const cutLine = (): string =>
  svg({ w: 40, h: 340, name: 'l9c4-cut', boil: false }, [ink([[20, 4], [20, 336]], { width: 5, color: C.blueDark, wobble: 0.4 })]);

export default defineStory({
  lines: {
    pie: { who: 'saucepan', text: 'An ICE-pie! Cut it in half? Fair is fair! One half for you, one for me.' },
    halves: { who: 'narrator', text: 'Two halves, exactly the same. Two halves make one whole pie!' },
    gate: { who: 'hero', text: 'Dame Snap’s gate has two halves. We only need one half open to slip through!' },
    half: { who: 'saucepan', text: 'Half a gate? Half a pie? Hooray for halves!' },
    next: { who: 'moonface', text: 'Quick, come and see! The clock tower has frozen!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.ambient('snow', { count: 24, z: 40 });
    k.music('cosy');

    const sp = k.character('saucepan', { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 890, y: 352, z: 20, flip: true });
    await k.all(k.enter(sp, 'left'), k.enter(hero, 'right'));
    const drop = dewdrop(k);

    // ---- A whole ice-pie… cut right down the middle.
    const [rightHalf, leftHalf] = pieWedges(2, 'l9c4-pie').map((art) => k.add(art, { x: 440, y: 150, w: 300, z: 15 }));
    [rightHalf, leftHalf].forEach((h) => k.set(h, { opacity: 0 }));
    void k.say('pie', sp);
    await k.all(k.appear(rightHalf, 0.4), k.appear(leftHalf, 0.4));
    await k.wait(1500);

    const line = k.add(cutLine(), { x: 570, y: 120, w: 40, z: 16 });
    k.set(line, { opacity: 0, scaleY: 0, transformOrigin: '50% 0%' });
    k.fx.pop();
    await k.to(line, 0.5, { opacity: 1, scaleY: 1, ease: 'power2.out' });
    await k.wait(200);

    // The halves slide apart, each with a half on it.
    const one = k.add(numberTag('½', C.goldLight, 'l9c4-half-a'), { x: 300, y: 460, w: 110, z: 18 });
    const two = k.add(numberTag('½', C.goldLight, 'l9c4-half-b'), { x: 770, y: 460, w: 110, z: 18 });
    [one, two].forEach((t) => k.set(t, { opacity: 0 }));
    const apart = async () => {
      await k.wait(300);
      await k.all(
        k.fade(line, 0, 0.3),
        k.to(leftHalf, 0.7, { x: -90, rotation: -4, ease: 'power2.out' }),
        k.to(rightHalf, 0.7, { x: 90, rotation: 4, ease: 'power2.out' }),
      );
      await k.all(k.appear(one, 0.3), k.appear(two, 0.3));
      await drop.glow();
      await k.wait(700);
      // Back together again: two halves make a whole.
      await k.all(k.to(leftHalf, 0.7, { x: 0, rotation: 0 }), k.to(rightHalf, 0.7, { x: 0, rotation: 0 }), k.fade(one, 0, 0.5), k.fade(two, 0, 0.5));
    };
    await k.all(k.say('halves'), apart());

    // ---- Gates in two halves: the next piece of the plan.
    await k.say('gate', hero);
    await k.all(k.fade(leftHalf, 0, 0.5), k.fade(rightHalf, 0, 0.5));
    const plan = mapBoard(k, 4);
    k.set(plan.board, { opacity: 0 });
    Object.values(plan.pieces).forEach((el) => k.set(el!, { opacity: 0 }));
    await k.fade(plan.board, 1, 0.5);
    await k.all(...Object.entries(plan.pieces).filter(([kind]) => kind !== 'gates').map(([, el]) => k.fade(el!, 1, 0.4)));
    const drawing = async () => {
      await k.wait(300);
      await plan.reveal();
      await drop.glow();
    };
    await k.all(k.say('half', sp), drawing(), k.hop(sp, 30, 2));

    // ---- Moon-Face puffs in: the clock tower has frozen!
    const mf = k.character('moonface', { x: 470, y: 380, z: 40 });
    k.fx.patter(5, 0.1);
    await k.enter(mf, 'right', 0.8);
    await k.all(k.say('next', mf), k.shake(mf, 8, 2));
    await k.wait(500);
  },
});
