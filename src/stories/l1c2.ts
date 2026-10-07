/**
 * Land 1, chapter 2: Wisha-Wisha.
 *
 * Up on the first big branch of the Faraway Tree, the leaves go
 * "wisha-wisha", and the old knot-face in the trunk whispers. Then leaves
 * float down and hang in the air in patterns: three in a triangle, five
 * like the spots on a dice. A quick look, no counting, and he knows how
 * many. A gust of wind (a little wobble on the branch, everyone holds on)
 * whirls them all away, all but one special leaf: the keepsake. High up the
 * trunk, a little round window with a red shutter… Next: the Angry Pixie's
 * Window.
 *
 * The chapter's host is Beth; if he climbs with Beth, Joe plays her part.
 */
import { gsap } from 'gsap';
import { C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The leaves whispering: wisha… wisha… (breathy swells, high and soft). */
function wisha(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) noiseBurst(t + i * 0.5, { freq: 2600, q: 0.9, peak: 0.055, attack: 0.16, decay: 0.3, sweepTo: 1300 });
}

/** Leaves landing in a pattern: a soft chord, one note per leaf. */
function settle(n: number): void {
  const t = now();
  const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6];
  for (let i = 0; i < n; i++) tone(notes[i % notes.length], t + i * 0.02, { peak: 0.05, attack: 0.01, decay: 0.9 });
}

/** "Got it!": a bright little ping when he names the number. */
function ding(): void {
  const t = now();
  tone(NOTE.G5, t, { wave: 'triangle', peak: 0.08, decay: 0.25 });
  tone(NOTE.C6, t + 0.09, { wave: 'triangle', peak: 0.08, decay: 0.5 });
}

/** A big gust of wind, rising and falling. */
function gust(): void {
  const t = now();
  noiseBurst(t, { freq: 500, q: 0.6, peak: 0.12, attack: 0.5, decay: 1.4, sweepTo: 1400 });
  noiseBurst(t + 0.3, { freq: 900, q: 0.8, peak: 0.06, attack: 0.4, decay: 1.2, sweepTo: 2600 });
}

/** The branch creaking as it sways. */
function creak(): void {
  const t = now();
  tone(110, t, { wave: 'sawtooth', peak: 0.05, attack: 0.08, decay: 0.5, glideTo: 150, vibrato: [18, 6], lowpass: 700 });
}

// --------------------------------------------------------------------- art

/** High in the tree: leafy light, the great trunk on the right with its knot-face, and a branch to stand on. */
function branchBackdrop(): string {
  const r = rng(2002);
  const clumps: Node[] = [];
  const shades = [C.leafDark, C.greenDark, C.leaf, C.moss];
  for (let i = 0; i < 22; i++) {
    const x = r() * 1180;
    const y = r() < 0.7 ? r() * 130 : 470 + r() * 120;
    clumps.push(piece(circle(x, y, 40 + r() * 50), shades[i % 4], { rough: 1.4, shadow: i % 3 === 0 }));
  }
  const far: Node[] = [];
  for (let i = 0; i < 9; i++) far.push(piece(circle(60 + i * 140, 520 + (i % 2) * 40, 110), i % 2 ? '#8fae7c' : '#a3bd8a', { shadow: false, fibre: false }));
  const trunk: Pt[] = [[880, 860], [900, 600], [930, 300], [940, -40], [1220, -40], [1220, 860]];
  return svg({ w: 1180, h: 820, name: 'l1c2-branch', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#e7e6b0', { edge: 'clean', shadow: false }),
    piece(rect(-20, 260, 1220, 600), '#cbd8a0', { rough: 2, shadow: false, fibre: false }),
    ...far,
    // Thin far branches.
    piece(curve([[-20, 330], [200, 300], [420, 320], [600, 280]], 2), '#8a7258', { rough: 0.8, shadow: false }),
    piece(curve([[-20, 336], [200, 310], [420, 330], [600, 290]], 2), '#8a7258', { rough: 0.8, shadow: false }),
    ...clumps,
    // The great trunk, with bark grooves.
    piece(curve(trunk, 2), C.barkLight, { rough: 1.2 }),
    ...[970, 1030, 1100, 1160].map((x) => ink([[x, 820], [x - 10, 420], [x - 4, 0]], { width: 4, color: C.bark, opacity: 0.5, wobble: 1.5 })),
    // The pixie's little round window, high up, with its red shutter ajar.
    piece(circle(1040, 110, 46), C.barkDark, { rough: 0.8 }),
    piece(circle(1040, 110, 36), C.candle, { edge: 'cut' }),
    ink([[1040, 76], [1040, 144]], { width: 4, color: C.barkDark }),
    ink([[1006, 110], [1074, 110]], { width: 4, color: C.barkDark }),
    piece(rect(1084, 70, 30, 82, 6), C.red, { rough: 0.8 }),
    piece(rect(1006, 156, 70, 12, 4), C.wood),
    // The branch they stand on, from the trunk out to the left.
    piece(curve([[-30, 640], [300, 620], [620, 630], [900, 600], [960, 560], [980, 760], [620, 720], [300, 712], [-30, 730]], 2), C.barkLight, { rough: 1.3 }),
    ink([[40, 676], [300, 664], [600, 672], [880, 640]], { width: 3, color: C.bark, opacity: 0.5, wobble: 2 }),
    piece(rect(-20, 720, 1220, 120), C.greenDeep, { rough: 2 }),
  ]);
}

/** The knot-face in the trunk (200 × 200). Parts: lids (sleepy), mouth (O, opens). */
function knotFace(): string {
  return svg({ w: 200, h: 200, name: 'l1c2-knot' }, [
    piece(ellipse(60, 70, 34, 14, -8), C.barkDark, { edge: 'cut', fibre: false }),
    piece(ellipse(140, 64, 34, 14, 8), C.barkDark, { edge: 'cut', fibre: false }),
    ink([[22, 40], [56, 28], [86, 36]], { width: 4, color: C.barkDark, opacity: 0.7 }),
    ink([[114, 30], [146, 20], [178, 30]], { width: 4, color: C.barkDark, opacity: 0.7 }),
    piece(ellipse(100, 140, 22, 30), C.barkDark, { edge: 'cut', fibre: false }),
  ]);
}

/** One falling leaf (100 × 100). */
function leaf(i: number): string {
  // Autumn colours, so a pattern stands out bright against the green.
  const fill = [C.gold, C.orange, C.goldLight][i % 3];
  return svg({ w: 100, h: 100, name: `l1c2-leaf${i % 3}`, boil: false }, [
    piece(curve([[50, 92], [18, 66], [16, 30], [50, 6], [84, 30], [82, 66]], 2), fill, { rough: 0.8 }),
    ink([[50, 96], [50, 64], [50, 18]], { width: 3, color: C.brown }),
    ink([[50, 56], [30, 40]], { width: 2, color: C.brown }),
    ink([[50, 46], [70, 30]], { width: 2, color: C.brown }),
  ]);
}

/** A dark round of shade behind a pattern (300 × 300), so the bright leaves read as one picture. */
function halo(): string {
  return svg({ w: 300, h: 300, name: 'l1c2-halo', boil: false }, [
    piece(circle(150, 150, 140), C.greenDeep, { rough: 1.2, opacity: 0.85 }),
    dot(150, 150, 118, C.woodShade, 0.5),
  ]);
}

// ---------------------------------------------------------------- helpers

/** The child playing the host's part: Beth, or Joe if he climbs with Beth. */
const sibling = (k: Kit): string => (k.hero === 'beth' ? 'joe' : 'beth');

/** Where a quick-look pattern sits, around (cx, cy). */
const PATTERNS: Record<number, Pt[]> = {
  3: [[0, -60], [-62, 46], [62, 46]],
  5: [[-70, -70], [70, -70], [0, 0], [-70, 70], [70, 70]],
};

/**
 * Leaves drift down from the canopy and hang in a pattern for a quick look.
 * Returns the leaves (still hanging) so they can be blown away later.
 */
async function pattern(k: Kit, n: 3 | 5, cx: number, cy: number): Promise<HTMLElement[]> {
  const glow = k.add(halo(), { x: cx - 150, y: cy - 150, w: 300, z: 12 });
  k.set(glow, { opacity: 0 });
  void k.fade(glow, 1, 0.5);
  const leaves = PATTERNS[n].map(([dx, dy], i) => {
    const el = k.add(leaf(i), { x: cx + dx - 45, y: cy + dy - 45, w: 90, z: 14 });
    k.set(el, { y: -cy - 120 + dy, x: (i % 2 ? 1 : -1) * 60, rotation: i % 2 ? 50 : -50 });
    return el;
  });
  wisha(2);
  // They all arrive together, as one picture, with a little flutter.
  await k.all(...leaves.map((el, i) => k.to(el, 0.9, { x: 0, y: 0, rotation: (i % 2 ? 8 : -8), ease: 'sine.out' })));
  settle(n);
  leaves.forEach((el) => k.float(el, 4, 1.6));
  return [glow, ...leaves];
}

/** Blows a pattern away, off to the left in a swirl. */
async function blowAway(k: Kit, els: HTMLElement[]): Promise<void> {
  await k.all(...els.map((el, i) => (i === 0 ? k.fade(el, 0, 0.4) : k.to(el, 0.8, { x: `-=${500 + i * 60}`, y: `-=${80 + i * 40}`, rotation: '+=220', opacity: 0, ease: 'power1.in' }))));
  els.forEach((el) => k.remove(el));
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    whisper: { who: 'narrator', text: 'Up on the big branch, the leaves went wisha-wisha… and began to fall in patterns!' },
    three: { who: 'hero', text: 'Three! I didn’t even count!' },
    five: { who: 'hero', text: 'Five, like the spots on a dice! Just one quick look!' },
    wind: { who: 'narrator', text: 'Whoosh! The wind blew every leaf away… all but one, for {name}.' },
    next: { who: 'hero', text: 'Look, {name}! A little round window up there. Shall we take a peep?' },
  },

  async play(k) {
    k.backdrop(branchBackdrop());
    const face = k.add(knotFace(), { x: 955, y: 250, w: 200, z: 3 });
    k.light(560, 60, 300, { color: '#fff6c8', strength: 0.3, flicker: true });
    k.ambient('dust', { count: 16 });
    k.music('dreamy');

    const hero = k.character('hero', { x: 110, y: 380, w: 250, z: 20 });
    const sib = k.character(sibling(k), { x: 320, y: 405, w: 225, z: 18 });
    await k.all(k.enter(hero, 'left'), k.wait(200).then(() => k.enter(sib, 'left')));

    // The trunk whispers: its O-mouth breathes in and out.
    const breathe = async () => {
      for (let i = 0; i < 2; i++) {
        wisha(2);
        await k.to(face, 0.5, { scaleY: 1.06, ease: 'sine.inOut' });
        await k.to(face, 0.5, { scaleY: 1, ease: 'sine.inOut' });
      }
    };
    await k.all(k.say('whisper'), breathe(), k.camera({ zoom: 1.15, x: 640, y: 380 }, 2));

    // ---- Quick look: three.
    const p3 = await pattern(k, 3, 700, 300);
    await k.wait(600);
    ding();
    void k.blink(sib);
    void k.hop(hero, 30, 1);
    await k.say('three', hero);
    await blowAway(k, p3);

    // ---- Quick look: five, like a dice.
    const p5 = await pattern(k, 5, 700, 290);
    await k.wait(600);
    ding();
    void k.hop(sib, 30, 1);
    void k.blink(hero);
    await k.say('five', hero);

    // ---- A gust: the branch wobbles, everyone holds on, the leaves whirl away.
    k.music('adventure');
    gust();
    creak();
    void k.camera({}, 0.6);
    const sway = async () => {
      for (const a of [3, -3, 2, -1, 0]) await k.all(k.to(hero, 0.2, { rotation: a, x: a * 4 }), k.to(sib, 0.2, { rotation: a * 1.2, x: a * 5 }));
    };
    const special = k.keepsake(k.chapter!.keepsake, { x: 560, y: 220, w: 150, z: 22 });
    k.set(special, { opacity: 0 });
    const whirl = async () => {
      await blowAway(k, p5);
      // Lots of loose leaves tumble past.
      const loose = Array.from({ length: 10 }, (_, i) => k.add(leaf(i), { x: 1200 + (i % 3) * 60, y: 80 + i * 50, w: 60, z: 30 }));
      void k.all(...loose.map((el, i) => k.to(el, 1.1 + (i % 3) * 0.2, { x: -1500, y: (i % 2 ? -1 : 1) * 80, rotation: 360, ease: 'none' }))).then(() => loose.forEach((el) => k.remove(el)));
      await k.wait(700);
      // …and one special leaf comes spinning back down.
      k.set(special, { opacity: 1, x: 300, y: -300, rotation: 90 });
      k.fx.twinkle();
      await k.to(special, 1.2, { x: 0, y: 0, rotation: 0, ease: 'sine.out' });
      k.light(635, 295, 160, { color: '#fff2b0', strength: 0.8, flicker: true, z: 21 });
      k.sparkle(635, 290, 14, 130);
      k.float(special, 6, 2);
    };
    await k.all(k.say('wind'), sway(), whirl(), k.shake(face, 4, 2));
    k.music('cosy');
    await k.all(k.hop(hero, 40, 1), k.hop(sib, 30, 1));

    // ---- Way up: the pixie's window, with its red shutter.
    const peek = async () => {
      await k.wait(600);
      await k.camera({ zoom: 1.6, x: 980, y: 200 }, 1.6);
      const shutter = k.add(svg({ w: 40, h: 90, name: 'l1c2-shutter', boil: false }, [piece(rect(4, 4, 30, 82, 6), C.red, { rough: 0.8 })]), { x: 1084, y: 70, w: 30, z: 5 });
      gsap.set(shutter, { transformOrigin: '0% 50%' });
      k.fx.creak();
      await k.to(shutter, 0.3, { scaleX: 0.5, yoyo: true, repeat: 1 });
    };
    await k.all(k.say('next', hero), peek());
    await k.wait(900);
  },
});
