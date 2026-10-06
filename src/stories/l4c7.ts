/**
 * Land 4, chapter 7: The Secret Key.
 *
 * Night in the classroom: moonlight through the barred window, everything
 * still. A tiny light flutters in: Silky, with a brass key from Dame
 * Snap's desk. It only works if the sums are right. {name} works them out
 * (a missing number and a double), the key glows brighter with each one,
 * and her very last rule, No escaping, begins to crack. Then, down the
 * corridor: clack… clack… CLACK. Her shadow grows on the glass of the
 * door, the handle rattles, and she wants to know who is out of bed. They
 * get ready to run. Next: Escape from Dame Snap.
 */
import { C, circle, defineStory, ellipse, piece, poly, rect, svg, type Kit } from './kit';
import { chalkText, classroom, crackRule, deskFront, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 330, y: 40, w: 300 };
const SLATE = { x: 280, y: 400, w: 350, h: 170 };
const DOOR = { x: 860, y: 110, w: 280 };

/** The classroom door with a frosted glass panel, 280 × 460. */
function door(): string {
  return svg({ w: 280, h: 460, name: 'l4c7-door' }, [
    piece(rect(0, 0, 280, 460, 4), C.schoolDark),
    piece(rect(20, 20, 240, 440, 3), C.brownDark),
    piece(rect(50, 50, 180, 170, 6), '#8d91a8', { edge: 'cut', fibre: false }),
    piece(rect(50, 250, 180, 170, 6), C.brown, { edge: 'cut' }),
    piece(circle(225, 250, 12), C.brass, { edge: 'cut' }),
  ]);
}

/** Her shadow on the frosted glass: the bun and the sharp shoulders, 180 × 170. */
function shadow(): string {
  return svg({ w: 180, h: 170, name: 'l4c7-shadow', boil: false }, [
    piece(circle(90, 28, 16), C.snapInk, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(90, 74, 30, 36), C.snapInk, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[10, 170], [30, 118], [150, 118], [170, 170]]), C.snapInk, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

export default defineStory({
  lines: {
    night: { who: 'narrator', text: 'That night, the school was dark and still. Then… a tiny light!' },
    key: { who: 'silky', text: 'I found a key in her desk! But it only works if the sums are right.' },
    glow: { who: 'narrator', text: '{name} got every sum right. The key glowed, and her last rule began to crack!' },
    clack: { who: 'narrator', text: 'Then, down the corridor… clack. Clack. CLACK.' },
    who: { who: 'dameSnap', text: 'Who is OUT of bed in MY school?' },
    run: { who: 'hero', text: 'Get ready, {name}. When that door opens, we RUN!' },
  },

  async play(k: Kit) {
    k.backdrop(classroom({ name: 'l4c7-night' }));
    k.music('sneaky');
    const dim = k.dim(0.5, '#0b0c20');
    k.light(135, 240, 170, { color: '#c9d4f0', strength: 0.35 });
    k.ambient('dust', { count: 8, area: [0, 100, 600, 500] });

    const cracked = [1, 2, 3, 4, 5, 6].map((n) => RULE_FOR[n]);
    const board = k.add(rulesBoard(cracked), { ...BOARD, z: 6 });
    const dr = k.add(door(), { ...DOOR, z: 7 });
    const hero = k.character('hero', { x: 20, y: 340, w: 240, z: 20 });
    const mf = k.character('moonface', { x: 640, y: 340, w: 230, z: 20 });
    k.add(deskFront('hero'), { x: 0, y: 570, w: 270, z: 24 });
    k.add(deskFront('mf'), { x: 630, y: 570, w: 250, z: 24 });
    k.set(board, { opacity: 0.9 });

    // Dark and still. Then a tiny light flutters in through the bars.
    await k.wait(400);
    snapSound.caw(1);
    await k.say('night');
    const silky = k.character('silky', { x: 250, y: 150, w: 210, z: 26 });
    const lamp = k.light(355, 260, 120, { color: C.goldLight, strength: 0.45, z: 25 });
    k.set([silky, lamp], { opacity: 0, x: -170, y: -40 });
    k.fx.twinkle();
    await k.all(k.to([silky, lamp], 1.2, { opacity: 1, x: 0, y: 0, ease: 'sine.out' }), k.fade(lamp, 0.45, 1.2));
    k.float(silky, 8, 1.8);

    // The key, and the sums it needs.
    const key = k.keepsake('brassKey', { x: 380, y: 250, w: 150, z: 27 });
    const keyGlow = k.light(455, 330, 90, { color: C.goldLight, strength: 0.1, z: 26 });
    k.set(key, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(key, 0.35);
    k.float(key, 5, 1.4);
    await k.all(k.say('key', silky), k.hop(hero, 24), k.hop(mf, 24));

    const sl = k.add(slate(SLATE.w, SLATE.h, 'key'), { ...SLATE, z: 18 });
    k.set(sl, { opacity: 0 });
    await k.appear(sl, 0.3);
    const told = k.say('glow');
    for (const [i, s] of ['3 + 7 = 10', '4 + 4 = 8'].entries()) {
      const el = k.add(chalkText(s, { w: 310, size: 54 }), { x: SLATE.x + 20, y: SLATE.y + 14 + i * 70, w: 310, z: 19 });
      k.set(el, { opacity: 0 });
      snapSound.chalk(0.4);
      await k.fade(el, 1, 0.4);
      k.fx.pop();
      void k.fade(keyGlow, 0.3 + i * 0.25, 0.4);
      await k.pop(key, 1.15);
    }
    void k.fade(dim, 0.4, 0.6);
    await crackRule(k, BOARD, RULE_FOR[7], 0.55);
    k.sparkle(455, 320, 12, 120);
    await told;

    // Clack… clack… CLACK. Her shadow grows on the glass.
    k.silence();
    const shade = k.add(shadow(), { x: DOOR.x + 50, y: DOOR.y + 50, w: 180, z: 8 });
    k.set(shade, { opacity: 0, scale: 0.4, transformOrigin: '50% 100%' });
    const clacks = k.say('clack');
    for (const [i, loud] of [0.4, 0.7, 1].entries()) {
      snapSound.heels(1, 0.3, loud);
      void k.to(shade, 0.4, { opacity: 0.35 + i * 0.25, scale: 0.6 + i * 0.2 });
      await k.wait(800);
    }
    await clacks;
    k.music('spooky');
    snapSound.ruler();
    void k.shake(dr, 3, 2);
    void k.camera({ zoom: 1.35, x: 960, y: 330 }, 0.6);
    await k.all(k.say('who'), k.shake(silky, 4, 2), k.shake(mf, 4, 2));

    // Cut back to the heroes: brave, and ready.
    void k.camera({}, 0.6);
    await k.all(k.say('run', hero), k.hop(hero, 30));
    snapSound.heels(2, 0.3);
    await k.wait(600);
  },
});
