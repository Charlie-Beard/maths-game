/**
 * Land 3, chapter 6: Sugar Mice.
 *
 * Late afternoon in the sugar meadow. Ten sugar mice scamper out to play:
 * six pink and four white. Six and four make ten, four and six make ten,
 * ten take away six is four, ten take away four is six: one happy family
 * of sums. One mouse hops into {name}'s hands to keep. Then, squelch: a
 * great green sticky footprint, still wobbling, and another, closer. A
 * shadow slides over the grass, the mice scatter, and it's back to Silky,
 * quick! Next: Too Many Treats.
 *
 * The chapter's host is Beth. If he climbs with Beth, Fran comes instead
 * (the hero speaks the lines either way).
 */
import { C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, raw, rect, rng, svg, tone, tune, type Kit, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** A sugar mouse's squeak (higher for the little ones). */
function squeak(pitch = 1): void {
  const t = now();
  tone(1900 * pitch, t, { wave: 'sine', peak: 0.06, attack: 0.005, decay: 0.08, glideTo: 2600 * pitch });
  tone(2300 * pitch, t + 0.1, { wave: 'sine', peak: 0.05, attack: 0.005, decay: 0.07, glideTo: 1800 * pitch });
}

/** Tiny feet pattering over the sugar. */
function scamper(steps = 10): void {
  const t = now();
  for (let i = 0; i < steps; i++) noiseBurst(t + i * 0.07, { freq: 5000, q: 3, peak: 0.03, decay: 0.03 });
}

/** A big wet squelch: something sticky putting its foot down. */
function squelch(): void {
  const t = now();
  tone(160, t, { wave: 'sine', peak: 0.2, attack: 0.01, decay: 0.3, glideTo: 60, vibrato: [20, 30] });
  noiseBurst(t, { freq: 700, q: 1.5, peak: 0.12, attack: 0.01, decay: 0.3, sweepTo: 250 });
  noiseBurst(t + 0.25, { freq: 1800, q: 4, peak: 0.05, decay: 0.15, sweepTo: 900 });
}

/** A low, wobbly rumble as the shadow comes over. */
function looming(): void {
  const t = now();
  tone(62, t, { wave: 'sine', peak: 0.18, attack: 0.5, decay: 1.8, vibrato: [3.5, 8] });
  tone(93, t + 0.3, { wave: 'triangle', peak: 0.05, attack: 0.5, decay: 1.4, vibrato: [3.5, 6], lowpass: 400 });
}

// --------------------------------------------------------------------- art

/** The sugar meadow late in the afternoon: a peachy sky, sugar-cube cottages, sugar grass. */
function meadow(): string {
  const r = rng(61);
  const cube = (x: number, y: number, s: number): Node[] => [
    piece(rect(x, y, s, s, 6), C.white),
    piece(poly([[x - 8, y + 4], [x + s / 2, y - s * 0.5], [x + s + 8, y + 4]]), C.candyPink),
    // a mouse-hole door
    piece(curve([[x + s * 0.35, y + s], [x + s * 0.35, y + s * 0.62], [x + s * 0.5, y + s * 0.52], [x + s * 0.65, y + s * 0.62], [x + s * 0.65, y + s]], 2), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(x + s * 0.12, y + s * 0.18, s * 0.18, s * 0.18, 3), C.candle, { edge: 'cut', fibre: false }),
  ];
  const sparkles: Node[] = [];
  for (let i = 0; i < 40; i++) sparkles.push(dot(r() * 1180, 560 + r() * 260, 2 + r() * 2, C.white, 0.7));
  return svg({ w: 1180, h: 820, name: 'l3c6-meadow', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#f6d4b8', { edge: 'clean', shadow: false }),
    piece(rect(-20, 200, 1220, 300), '#f8e2cc', { rough: 2, shadow: false }),
    piece(circle(930, 230, 70), '#fbe7a6', { rough: 0.8, shadow: false }),
    piece(ellipse(260, 120, 140, 30), C.white, { rough: 1.4, shadow: false, opacity: 0.8 }),
    piece(curve([[-40, 470], [240, 420], [520, 460], [820, 420], [1220, 450], [1220, 860], [-40, 860]], 2), '#e9c0c8', { rough: 1.3 }),
    ...cube(130, 380, 90),
    ...cube(330, 410, 64),
    ...cube(860, 390, 80),
    ...cube(1010, 420, 60),
    piece(curve([[-40, 540], [300, 510], [640, 540], [900, 512], [1220, 534], [1220, 860], [-40, 860]], 2), '#f3d2d8', { rough: 1.2 }),
    ...sparkles,
  ]);
}

/** A sugar mouse (120 × 80), facing right: pink or white, with a string tail. */
function mouse(color: string, name: string): string {
  return svg({ w: 120, h: 80, name }, [
    piece(ellipse(60, 76, 44, 5), 'rgba(40,25,10,0.15)', { edge: 'cut', fibre: false, shadow: false }),
    ink([[18, 66], [6, 58], [4, 42], [14, 36]], { width: 3, color: C.ink }),
    piece(curve([[16, 72], [26, 36], [64, 22], [98, 44], [114, 66], [96, 74], [30, 74]], 2), color),
    piece(circle(84, 32, 12), color),
    piece(circle(84, 32, 6), C.raspberry, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    piece(curve([[40, 46], [62, 36], [70, 40], [48, 54]], 2), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    dot(98, 50, 3.5, C.ink),
    piece(circle(115, 64, 4.5), C.raspberry, { edge: 'cut' }),
  ]);
}

/** A big green sticky footprint (200 × 150): a jelly blob with three toes. */
function footprint(name: string): string {
  return svg({ w: 200, h: 150, name }, [
    piece(curve([[30, 110], [40, 70], [100, 56], [160, 70], [172, 110], [140, 140], [60, 140]], 2), C.jelly, { edge: 'cut' }),
    piece(ellipse(52, 40, 22, 26), C.jelly, { edge: 'cut' }),
    piece(ellipse(100, 26, 24, 28), C.jelly, { edge: 'cut' }),
    piece(ellipse(150, 40, 22, 26), C.jelly, { edge: 'cut' }),
    piece(ellipse(80, 96, 22, 10), C.jellyLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
    piece(ellipse(96, 20, 8, 6), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
  ]);
}

/** A soft dark shadow on the grass (600 × 160), cast by something out of sight. */
function groundShadow(): string {
  return svg({ w: 600, h: 160, name: 'l3c6-shadow', boil: false }, [
    piece(curve([[20, 120], [60, 40], [200, 10], [400, 10], [540, 40], [580, 120], [300, 150]], 3), '#1d2a22', { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[140, 40], [70, 0], [170, 20]]), '#1d2a22', { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[460, 40], [530, 0], [430, 20]]), '#1d2a22', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A small torn paper card with a sum (300 × 90). */
function sumCard(text: string, name: string): string {
  return svg({ w: 300, h: 90, name }, [
    piece(rect(6, 6, 288, 78, 8), C.cream, { rough: 1.1 }),
    raw(`<text x="150" y="66" font-family="Andika, sans-serif" font-weight="700" font-size="56" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------ helpers

/** The chapter's host, or another child if the host is the one he climbs with. */
const buddy = (k: Kit, host: string, instead: string): string => (host === k.hero ? instead : host);

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    meadow: { who: 'narrator', text: 'In the sugar meadow, the sugar mice came out to play.' },
    six: { who: 'hero', text: 'Six pink mice and four white mice. Six and four make ten!' },
    family: { who: 'narrator', text: 'Four and six make ten. Ten take away four is six. One happy family!' },
    foot: { who: 'hero', text: 'Eek! A great big sticky footprint. And it’s still wobbling!' },
    run: { who: 'narrator', text: 'Squeak! The sugar mice scattered. Quick, {name}, back to Silky!' },
  },

  async play(k) {
    k.backdrop(meadow());
    k.music('dreamy');
    k.ambient('dust', { count: 18 });
    const sun = k.light(930, 230, 260, { color: '#ffe9b0', strength: 0.4, z: 2 });

    const hero = k.character('hero', { x: 10, y: 380, w: 250, z: 20 });
    const pal = k.character(buddy(k, k.chapter!.host, 'fran'), { x: 920, y: 384, w: 250, z: 20 });
    // Ten mice, six pink then four white, in a row across the meadow.
    const mice = Array.from({ length: 10 }, (_, i) => {
      const pink = i < 6;
      // Two rows: the six pink ones behind, the four white ones in front.
      const x = pink ? 278 + i * 106 : 384 + (i - 6) * 106;
      const el = k.add(mouse(pink ? C.sherbet : C.white, `l3c6-mouse${pink ? 'p' : 'w'}`), { x, y: pink ? 516 : 590, w: 108, h: 72, z: pink ? 10 : 12, flip: !pink });
      k.set(el, { opacity: 0 });
      return el;
    });
    k.set([hero, pal], { opacity: 0 });

    void k.camera({ zoom: 1.2, x: 590, y: 400 }, 0.01);
    void k.camera({}, 2.6);
    await k.all(k.say('meadow'), k.enter(hero, 'left'), k.enter(pal, 'right'));

    // Out they scamper: the pink ones from the left, the white ones from the right.
    const out = (async () => {
      scamper(14);
      for (const [i, m] of mice.entries()) {
        k.set(m, { opacity: 1, x: i < 6 ? -500 : 500 });
        void k.to(m, 0.6, { x: 0, ease: 'power2.out' });
        if (i % 3 === 0) squeak(1 + i * 0.03);
        await k.wait(90);
      }
      await k.wait(500);
    })();
    await out;
    const c1 = k.add(sumCard('6 + 4 = 10', 'l3c6-c1'), { x: 280, y: 30, w: 300, h: 90, z: 40 });
    k.set(c1, { opacity: 0 });
    void k.appear(c1, 0.35);
    const hopRow = (async () => {
      await k.wait(800);
      for (let i = 0; i < 6; i++) void k.hop(mice[i], 16);
      squeak(1);
      await k.wait(1100);
      for (let i = 6; i < 10; i++) void k.hop(mice[i], 16);
      squeak(1.2);
    })();
    await k.all(k.say('six', hero), hopRow);

    // The rest of the family of sums, one card at a time.
    const cards = [
      ['4 + 6 = 10', 600, 30],
      ['10 − 4 = 6', 280, 130],
      ['10 − 6 = 4', 600, 130],
    ].map(([t, x, y], i) => {
      const c = k.add(sumCard(t as string, `l3c6-c${i + 2}`), { x: x as number, y: y as number, w: 300, h: 90, z: 40 });
      k.set(c, { opacity: 0 });
      return c;
    });
    const deal = (async () => {
      for (const c of cards) {
        tone(NOTE.E5, now(), { wave: 'triangle', peak: 0.05, decay: 0.2 });
        await k.appear(c, 0.35);
        await k.wait(700);
      }
    })();
    await k.all(k.say('family'), deal);
    tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24], [NOTE.C6, 0.4]], 0.1);
    k.sparkle(590, 130, 14, 220);

    // A sugar mouse of his own.
    for (const c of [c1, ...cards]) void k.fade(c, 0, 0.4);
    const keep = k.keepsake(k.chapter!.keepsake, { x: 500, y: 200, w: 180, z: 42 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    squeak(1.3);
    await k.appear(keep, 0.4);
    k.sparkle(590, 290, 12, 130);
    await k.wait(1200);
    void k.fade(keep, 0, 0.4);

    // Squelch. The light goes, and a sticky footprint wobbles on the grass.
    k.music('spooky');
    void k.fade(sun, 0, 1);
    const veil = k.dim(0, '#2a1830');
    void k.fade(veil, 0.25, 1);
    const f1 = k.add(footprint('l3c6-f1'), { x: 780, y: 410, w: 150, h: 112, z: 8 });
    const f2 = k.add(footprint('l3c6-f2'), { x: 500, y: 400, w: 170, h: 128, z: 8 });
    k.set([f1, f2], { opacity: 0 });
    await k.wait(400);
    squelch();
    k.set(f1, { opacity: 1 });
    await k.pop(f1, 1.15);
    for (const m of mice) void k.shake(m, 4, 1);
    await k.wait(500);
    squelch();
    k.set(f2, { opacity: 1 });
    await k.all(k.pop(f2, 1.15), k.quake(4));
    // Still wobbling…
    const jiggle = async (f: HTMLElement) => {
      for (let i = 0; i < 4; i++) {
        await k.to(f, 0.12, { scaleY: 0.9, scaleX: 1.08, transformOrigin: '50% 100%' });
        await k.to(f, 0.12, { scaleY: 1.05, scaleX: 0.96 });
      }
      await k.to(f, 0.12, { scaleY: 1, scaleX: 1 });
    };
    void jiggle(f1);
    void jiggle(f2);
    await k.all(k.say('foot', hero), k.shake(hero, 6, 2));

    // A shadow slides over the grass and the mice scatter.
    const sh = k.add(groundShadow(), { x: 1200, y: 440, w: 600, h: 160, z: 9 });
    k.set(sh, { opacity: 0.4 });
    looming();
    void k.to(sh, 2.6, { x: -900, ease: 'sine.in' });
    const scatter = (async () => {
      await k.wait(500);
      scamper(16);
      for (const [i, m] of mice.entries()) {
        k.face(m, true);
        if (i % 2) squeak(1.1 + i * 0.04);
        void k.to(m, 0.7, { x: -900 - i * 40, ease: 'power2.in' });
        await k.wait(70);
      }
    })();
    await k.all(k.say('run'), scatter, k.walk(pal, -40, 0.5, 2));
    await k.wait(300);
  },
});
