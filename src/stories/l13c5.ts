/**
 * Land 13, chapter 5: The Helter-Skelter.
 *
 * At the foot of the helter-skelter, Beth (or Fran, if Beth is the hero)
 * opens the box the slide mats are kept in. It's a cube, so how many faces
 * has it got? The six faces come off it one by one and are counted in a
 * row: six faces, and every face is a square (the chapter's faces of 3D
 * shapes, and the 2D shape on each). Then {name} takes a mat and whizzes
 * down the spiral slide, and at the bottom the third child finds a signpost
 * pointing to the big wheel. Next: Left, Right, Forwards.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy } from './bits';
import { organ, signpostArt, solid, squareTag, whirr } from './fair';

/** The mat box: a cube on the ground in the middle. */
const BOX = { x: 470, y: 300, w: 240 };

export default defineStory({
  lines: {
    box_beth: { who: 'beth', text: 'The slide mats live in this box. Look, it’s a cube!' },
    box_fran: { who: 'fran', text: 'The slide mats live in this box. Look, it’s a cube!' },
    faces: { who: 'narrator', text: 'How many faces has a cube got? Let’s count them.' },
    six: { who: 'narrator', text: 'One, two, three, four, five, six. Six faces, and every face is a square!' },
    whee: { who: 'hero', text: 'Wheee! Round and round and down I go!' },
    next_fran: { who: 'fran', text: 'Look, a signpost! The arrows show the way to the big wheel.' },
    next_joe: { who: 'joe', text: 'Look, a signpost! The arrows show the way to the big wheel.' },
  },

  async play(k: Kit) {
    // Beth hosts (or Fran, if Beth is the hero); the third child finds the signpost.
    const host = buddy(k, 'beth', 'fran');
    const finder = (['beth', 'joe', 'fran'] as const).find((c) => c !== k.hero && c !== host)!;
    k.landScene();
    k.music('adventure');
    organ();

    const kid = k.character(host, { x: 240, y: 380, w: 220, z: 20 });
    const hero = k.character('hero', { x: 910, y: 380, w: 220, z: 20, flip: true });
    const box = k.add(solid('cube', 'l13c5-box', ['#e9c99a', '#c99a62', '#8a6a3a']), { ...BOX, z: 14 });
    k.set(box, { opacity: 0 });
    await k.all(k.enter(kid, 'left', 0.7), k.enter(hero, 'right', 0.7), k.wait(300).then(() => k.appear(box, 0.4)));
    await k.say(`box_${host}`, kid);
    await k.say('faces');

    // ---- Six faces come off the cube, one at a time, into a row.
    const colours = [C.goldLight, C.rose, C.goldLight, C.rose, C.goldLight, C.rose];
    const faces: HTMLElement[] = [];
    const counting = async () => {
      for (let i = 0; i < 6; i++) {
        const f = k.add(squareTag(i + 1, colours[i], `l13c5-face${i + 1}`), { x: 300 + i * 100, y: 60, w: 90, z: 18 });
        faces.push(f);
        // Each one lifts off the box and flies up to its place.
        k.set(f, { x: BOX.x + 70 - (300 + i * 100), y: BOX.y + 80 - 60, scale: 0.5, opacity: 0 });
        k.fx.pop();
        await k.to(f, 0.45, { x: 0, y: 0, scale: 1, opacity: 1, ease: 'back.out(1.4)' });
        void k.pop(box, 1.04);
        await k.wait(330);
      }
      k.sparkle(590, 100, 14, 220);
      k.sfx.success();
    };
    await k.all(k.say('six'), counting());
    // Let the row of six squares sit for a moment before it goes.
    await k.all(...faces.map((f, i) => k.wait(i * 90).then(() => k.pop(f, 1.1))));
    await k.wait(900);
    await k.all(...faces.map((f) => k.fade(f, 0, 0.3)));

    // ---- Up the helter-skelter, and down on a mat.
    await k.all(k.exit(hero, 'left', 0.9), k.exit(kid, 'left', 0.8), k.fade(box, 0, 0.4));
    const mat = k.keepsake(k.chapter?.keepsake ?? 'helterMat', { x: 60, y: 150, w: 110, z: 26 });
    const small = k.character('hero', { x: 55, y: 90, w: 110, z: 25 });
    k.set([mat, small], { opacity: 0 });
    await k.all(k.fade(mat, 1, 0.3), k.fade(small, 1, 0.3));
    whirr(3);
    // Round the spiral: across the front, round the back (smaller), and down.
    const path: [number, number, number][] = [
      [110, 70, 1],
      [0, 140, 0.8],
      [110, 210, 1],
      [0, 280, 0.8],
      [110, 350, 1],
      [380, 420, 1],
    ];
    const slide = async () => {
      for (const [x, y, s] of path) await k.all(k.to([mat, small], 0.55, { x, y, scale: s, ease: 'sine.inOut' }));
    };
    await k.all(k.say('whee', small), slide());
    await k.hop(small, 30, 1);

    // ---- At the bottom: a signpost to the big wheel.
    const post = k.add(signpostArt('l13c5-post'), { x: 700, y: 330, w: 190, z: 16 });
    k.set(post, { opacity: 0 });
    const kid2 = k.character(finder, { x: 900, y: 380, w: 220, z: 20, flip: true });
    k.set(kid2, { opacity: 0 });
    await k.all(k.appear(post, 0.4), k.enter(kid2, 'right', 0.7));
    await k.all(k.say(`next_${finder}`, kid2), k.shake(post, 4, 1));
    await k.wait(400);
  },
});
