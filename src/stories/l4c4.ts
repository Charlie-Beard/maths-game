/**
 * Land 4, chapter 4: Rule Number One: No Fun.
 *
 * Dame Snap reads from her rule book: Rule Number One is NO FUN, and odd
 * numbers are banned. She chalks 1 to 10 and slashes a red cross through
 * every odd one, snapping her ruler on each. Fran says that's silly: odd
 * numbers are the ones left over when you pair up. {name} finds them all,
 * the crosses fall away, the odd numbers shine gold, and Rule Number One
 * cracks. She shrieks, slams her rule book shut, and sneezes in its puff of
 * chalk dust. Then she rounds on Moon-Face. Next: Lines on the Blackboard.
 *
 * Fran is the host. If Fran is the child he climbs with, Fran says the
 * lines and Beth sits with them.
 */
import { C, defineStory, ink, noiseBurst, now, svg, tone, type Kit } from './kit';
import { chalkText, classroom, crackRule, deskFront, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 800, y: 50, w: 330 };
/** The slate of numbers 1–10 across the top left. */
const NUMS = { x: 20, y: 60, w: 740, h: 150 };
const numX = (n: number): number => NUMS.x + 22 + (n - 1) * 68;

/** A red chalk cross, 70 × 80. */
const cross = (): string =>
  svg({ w: 70, h: 80, name: 'l4c4-cross', boil: false }, [
    ink([[12, 14], [58, 68]], { width: 7, color: C.ruler, wobble: 1.2 }),
    ink([[58, 12], [12, 66]], { width: 7, color: C.ruler, wobble: 1.2 }),
  ]);

/** A sneeze: a rising "ah… ah…" then a breathy "TISHOO". */
function sneeze(): void {
  const t = now();
  tone(320, t, { wave: 'triangle', peak: 0.06, attack: 0.2, decay: 0.25, glideTo: 520, lowpass: 1500 });
  tone(360, t + 0.5, { wave: 'triangle', peak: 0.07, attack: 0.15, decay: 0.2, glideTo: 640, lowpass: 1500 });
  noiseBurst(t + 0.9, { freq: 2600, q: 0.7, peak: 0.16, attack: 0.01, decay: 0.35, sweepTo: 900 });
}

export default defineStory({
  lines: {
    rule: { who: 'dameSnap', text: 'Rule Number One: NO FUN! And odd numbers are BANNED!' },
    crossed: { who: 'narrator', text: 'She crossed out every odd number. One, three, five, seven, nine!' },
    silly: { who: 'fran', text: 'That’s silly! Odd numbers are the ones left over. Let’s find them, {name}!' },
    crack: { who: 'narrator', text: '{name} found every odd number. And Rule Number One cracked!' },
    what: { who: 'dameSnap', text: 'WHAT? Who is having FUN in my school?' },
    lines: { who: 'dameSnap', text: 'Moon-Face! You were SMILING. Lines on the board, now!' },
  },

  async play(k: Kit) {
    k.backdrop(classroom());
    k.music('spooky');
    k.dim(0.15, '#14121c');
    k.ambient('dust', { count: 10, area: [0, 100, 1180, 500] });

    const board = k.add(rulesBoard([RULE_FOR[1], RULE_FOR[2], RULE_FOR[3]]), { ...BOARD, z: 6 });
    const nums = k.add(slate(NUMS.w, NUMS.h, 'nums'), { ...NUMS, z: 6 });
    const hero = k.character('hero', { x: 20, y: 330, w: 240, z: 20 });
    const sib = k.character(k.hero === 'fran' ? 'beth' : 'fran', { x: 250, y: 335, w: 235, z: 20 });
    const mf = k.character('moonface', { x: 880, y: 315, w: 260, z: 20 });
    const fran = k.hero === 'fran' ? hero : sib;
    k.add(deskFront('a'), { x: 0, y: 560, w: 270, z: 24 });
    k.add(deskFront('b'), { x: 230, y: 560, w: 270, z: 24 });
    k.add(deskFront('c'), { x: 870, y: 560, w: 280, z: 24 });
    k.set([board, nums], { opacity: 0.95 });

    // She clacks in with her rule book and reads Rule Number One.
    const snap = k.snap('point', { x: 470, y: 200, w: 320, z: 14 });
    const book = k.keepsake('rulebook', { x: 670, y: 360, w: 150, z: 15 });
    k.set([snap, book], { opacity: 0 });
    await k.wait(300);
    snapSound.heels(5, 0.3);
    k.set([snap, book], { opacity: 1, x: 500 });
    await k.to([snap, book], 1.4, { x: 0, ease: 'power1.out' });
    void k.camera({ zoom: 1.3, x: 620, y: 380 }, 0.8);
    k.pose(snap, 'shriek');
    void k.to(book, 0.3, { y: -60, rotation: -10 });
    await k.all(k.say('rule', snap), k.shake(snap, 4, 2));
    void k.camera({}, 0.8);
    k.pose(snap, 'stomp');

    // 1 to 10 in chalk; a red cross snaps through every odd one.
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
      const el = k.add(chalkText(String(n), { w: 70, size: 64 }), { x: numX(n), y: NUMS.y + 30, w: 70, z: 8 });
      k.set(el, { opacity: 0 });
      return el;
    });
    snapSound.chalk(0.8);
    for (const d of digits) {
      void k.fade(d, 1, 0.2);
      await k.wait(70);
    }
    const crossed = k.say('crossed');
    const crosses: HTMLElement[] = [];
    for (const n of [1, 3, 5, 7, 9]) {
      const x = k.add(cross(), { x: numX(n), y: NUMS.y + 32, w: 70, z: 9 });
      k.set(x, { opacity: 0 });
      snapSound.ruler();
      await k.appear(x, 0.2);
      crosses.push(x);
      await k.wait(220);
    }
    await crossed;

    // Fran: odd numbers are the ones left over. {name} finds them.
    await k.all(k.say('silly', fran), k.hop(fran, 30));
    const told = k.say('crack');
    for (const [i, n] of [1, 3, 5, 7, 9].entries()) {
      k.fx.pop();
      void k.vanish(crosses[i], 0.25);
      const gold = k.add(chalkText(String(n), { w: 70, size: 64, color: C.goldLight }), { x: numX(n), y: NUMS.y + 30, w: 70, z: 10 });
      k.set(gold, { opacity: 0 });
      await k.fade(gold, 1, 0.2);
      void k.hop(gold, 18);
      await k.wait(260);
    }
    await crackRule(k, BOARD, RULE_FOR[4]);
    k.sparkle(380, 140, 14, 220);
    k.sfx.sparkle();
    void k.hop(hero, 30);
    void k.hop(sib, 30);
    await k.all(k.hop(mf, 30), told);

    // She shrieks, slams the book shut… and sneezes in its chalk dust.
    k.pose(snap, 'shriek');
    void k.camera({ zoom: 1.25, x: 620, y: 360 }, 0.5);
    await k.all(k.say('what', snap), k.shake(snap, 5, 2));
    snapSound.slam();
    await k.to(book, 0.2, { y: 0, rotation: 0 });
    k.puff(740, 420, 180, C.chalk);
    k.puff(640, 300, 140, C.chalk);
    await k.wait(400);
    sneeze();
    await k.to(snap, 0.5, { y: 10, rotation: 3, ease: 'sine.in' });
    await k.to(snap, 0.12, { y: -20, rotation: -4 });
    await k.to(snap, 0.2, { y: 0, rotation: 0 });
    void k.hop(mf, 14);
    await k.wait(300);

    // Then she rounds on Moon-Face.
    k.pose(snap, 'point');
    k.face(snap, false);
    void k.camera({ zoom: 1.2, x: 760, y: 400 }, 0.6);
    await k.say('lines', snap);
    // Moon-Face gulps; the children give him a brave little nod.
    void k.camera({}, 0.6);
    await k.shake(mf, 6, 1);
    k.fx.twinkle();
    await k.all(k.hop(hero, 24), k.hop(sib, 24));
    await k.wait(300);
  },
});
