/**
 * Land 9, chapter 8 (the land's finale): The Big Thaw.
 *
 * Plays straight after the escape game. The plan to rescue Silky is
 * finished, the snow melts, and then the cliffhanger into the last land.
 * Six scenes:
 *
 *   1. The sun comes out over the Land of Snow: drip, drip, the Big Thaw.
 *      One last look at THE PLAN, drawn in the snow across the land's
 *      chapters (the tree, Silky's cage, the key with icicle teeth, the
 *      sledge, her gates, six o'clock and quarter past six), while Silky's
 *      dewdrop glows, before it melts. The Saucepan Man mishears
 *      ("a snow-plan?"), and Mr Snowman, a little smaller already, gives
 *      them a snow globe and sends them off: he'll be back next winter.
 *   2. The sledge (the quick way home, from the plan) whisks them to the
 *      melting edge of the land and the top of the ladder: down they
 *      go, and the land rises away, dripping, Mr Snowman waving.
 *   3. Home in Moon-Face's room: the snow globe, the seal, hot cocoa… and
 *      then the window goes dark and cold.
 *   4. The top of the tree under a stormy sky: a bell tolls, and a grim
 *      black prison settles into the cloud.
 *   5. Close up on its bell tower, barred like a cell: the bell swings, and
 *      Dame Snap rises up behind the bars and shrieks. Clack, clack. SNAP.
 *   6. Back to the heroes, brave: Silky is in there, and they have a plan.
 *
 * Scary, never cruel (PLAN.md §2): she shrieks from far off behind bars;
 * nobody is caught, and it ends on the children being brave.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree, TREE_SPOTS } from '../art/scenery';
import { band, bell, C, circle, curve, defineStory, dot, ellipse, group, ink, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { blackSheet, flump, sting, together, wave } from './bits';
import { snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** Melting snow: soft drips, `times` of them, never quite in time. */
function drips(times = 6): void {
  const t = now();
  const r = rng(Math.floor(t * 100));
  for (let i = 0; i < times; i++) {
    const at = t + i * 0.32 + r() * 0.12;
    const f = 900 + r() * 700;
    tone(f, at, { wave: 'sine', peak: 0.05, attack: 0.003, decay: 0.12, glideTo: f * 1.6 });
  }
}

/** The sun coming out: a warm, rising shimmer. */
function sunrise(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => bell(f, t + i * 0.22, 0.05, 1.4));
  tone(NOTE.C4, t, { peak: 0.04, attack: 0.8, decay: 2 });
}

/** A prison bell tolling, far off: deep, slow and heavy. */
function toll(): void {
  const t = now();
  bell(174.6, t, 0.16, 3.6);
  tone(87.3, t, { peak: 0.1, attack: 0.01, decay: 3.6 });
  bell(174.6 * 1.19, t + 0.01, 0.04, 2.4);
}

/** Hot cocoa poured into mugs: a warm glug and a clink. */
function pour(): void {
  const t = now();
  for (let i = 0; i < 4; i++) tone(240 + i * 30, t + i * 0.12, { wave: 'sine', peak: 0.05, attack: 0.01, decay: 0.12, glideTo: 380 + i * 30 });
  bell(NOTE.E6, t + 0.6, 0.04, 0.5);
}

// --------------------------------------------------------------------- art

/** The colour of lines scratched in the snow with a stick (as in l9c1 … l9c7). */
const LINE = '#3f6a9a';

/** A hand-drawn line in the snow. */
const draw = (pts: Pt[], width = 5, closed = false): Node => ink(pts, { width, color: LINE, wobble: 1.2, closed });

/** Points round a circle (for drawn rings). */
const ring = (cx: number, cy: number, r: number, n = 18): Pt[] => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt);

/** A five-pointed star outline (Silky on the map). */
function starPoints(cx: number, cy: number, r: number): Pt[] {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const rr = i % 2 ? r * 0.45 : r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as Pt;
  });
}

/** A drawn clock face (96 × 96) with its hands at a time; the quarter shaded for quarter past. */
function drawnClock(hour: number, minute: number, shadeQuarter = false): Node[] {
  const hDeg = ((hour % 12) * 30 + minute * 0.5) * (Math.PI / 180);
  const mDeg = minute * 6 * (Math.PI / 180);
  const tip = (r: number, a: number): Pt => [48 + Math.sin(a) * r, 48 - Math.cos(a) * r];
  const wedge: Pt[] = [[48, 48], ...Array.from({ length: 8 }, (_, i) => tip(34, (i / 7) * (Math.PI / 2)))];
  return [
    piece(circle(48, 48, 44), C.snowShade, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    ...(shadeQuarter ? [piece(poly(wedge), C.ice, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 })] : []),
    draw(ring(48, 48, 42), 4, true),
    ...[0, 3, 6, 9].map((n) => draw([tip(34, (n / 12) * Math.PI * 2), tip(40, (n / 12) * Math.PI * 2)], 4)),
    draw([[48, 48], tip(24, hDeg)], 6),
    draw([[48, 48], tip(36, mDeg)], 4),
  ];
}

/**
 * THE PLAN, finished, as the land 9 chapter stories drew it piece by piece
 * in the snow (640 × 420, the same layout as their map): the tree, Silky in
 * her cage, the key with its icicle teeth, the sledge (the quick way home),
 * her gates (only half need open), six o'clock (when her land comes back)
 * and quarter past six (when they creep in).
 */
function planMap(): string {
  const at = (x: number, y: number, nodes: Node[]): Node => group({ transform: `translate(${x} ${y})` }, nodes);
  return svg({ w: 640, h: 420, name: 'l9c8-plan', label: 'the plan, drawn in the snow' }, [
    piece(rect(8, 8, 624, 404, 28), C.snowShade, { rough: 1.4 }),
    piece(rect(18, 16, 604, 388, 24), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    ...Array.from({ length: 12 }, (_, i) => dot(150 + i * 28, 250 - Math.sin(i / 3.2) * 40 - i * 4, 4, LINE, 0.45)),
    // The tree.
    at(24, 120, [
      draw([[44, 218], [46, 120]], 6),
      draw([[66, 218], [64, 120]], 6),
      draw(ring(55, 76, 50, 20), 5, true),
      draw([[55, 120], [40, 96], [34, 80]], 4),
      draw([[55, 116], [72, 90], [80, 70]], 4),
      piece(rect(48, 164, 14, 22, 4), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
    ]),
    // Silky in her cage.
    at(488, 20, [
      draw([[14, 140], [14, 56], [30, 22], [60, 10], [90, 22], [106, 56], [106, 140]], 5),
      ...[34, 60, 86].map((x) => draw([[x, 140], [x, 18 + Math.abs(x - 60) * 0.5]], 4)),
      draw([[10, 140], [110, 140]], 5),
      piece(curve(starPoints(60, 84, 22), 1), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
      piece(ellipse(34, 80, 12, 6, -30), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
      piece(ellipse(86, 80, 12, 6, 30), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    ]),
    // The key, with icicle teeth.
    at(190, 28, [
      draw(ring(28, 32, 22), 6, true),
      draw([[50, 32], [140, 32]], 6),
      ...[94, 112, 130].map((x, i) => piece(poly([[x - 7, 32], [x + 7, 32], [x, 60 - i * 3]]), C.ice, { edge: 'cut', fibre: C.white })),
    ]),
    // The sledge.
    at(150, 322, [
      draw([[14, 44], [96, 44], [112, 36], [122, 40]], 5),
      draw([[10, 60], [110, 60], [124, 50]], 5),
      draw([[36, 44], [36, 60]], 4),
      draw([[84, 44], [84, 60]], 4),
      draw([[22, 20], [100, 20]], 4),
    ]),
    // Her gates: one half shut, one half swung open, and the way through.
    at(396, 176, [
      draw([[10, 130], [10, 20]], 7),
      ...[30, 50, 70].map((x) => draw([[x, 126], [x, 24]], 4)),
      draw([[10, 24], [86, 24]], 5),
      draw([[10, 126], [86, 126]], 5),
      draw([[190, 130], [190, 20]], 7),
      draw([[96, 124], [150, 100], [168, 40], [112, 66], [96, 124]], 4),
      draw([[104, 110], [140, 120], [180, 110]], 4),
      piece(poly([[176, 100], [192, 112], [174, 124]]), LINE, { edge: 'clean', fibre: false, shadow: false }),
    ]),
    // Six o'clock, and quarter past six.
    at(316, 300, drawnClock(6, 0)),
    at(426, 312, drawnClock(6, 15, true)),
  ]);
}

/** Silky's dewdrop (60 × 80), kept since land 7; it glows when the sums go right. */
function dewdrop(): string {
  return svg({ w: 60, h: 80, name: 'l9c8-dew', boil: false, label: 'Silky’s dewdrop' }, [
    piece(curve([[30, 6], [40, 30], [50, 50], [44, 70], [30, 76], [16, 70], [10, 50], [20, 30]], 2), C.dew, { edge: 'cut' }),
    piece(ellipse(24, 52, 7, 12, 20), C.white, { edge: 'clean', fibre: false, shadow: false, opacity: 0.8 }),
  ]);
}

/** The sledge (the quick way home), seen from the side, for riding (520 × 130). */
function sledgeArt(): string {
  return svg({ w: 520, h: 130, name: 'l9c8-sledge', label: 'a sledge' }, [
    piece(rect(20, 20, 470, 56, 12), C.red, { rough: 0.6 }),
    piece(rect(30, 34, 450, 8, 3), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
    ...[90, 260, 430].map((x) => piece(rect(x, 74, 14, 34), C.greyDark, { edge: 'cut' })),
    piece(band([[10, 112], [480, 112], [506, 100], [514, 80]], 10), C.greyDark, { edge: 'cut' }),
  ]);
}

/** A puddle of meltwater (400 × 90). */
function puddle(): string {
  return svg({ w: 400, h: 90, name: 'l9c8-puddle', boil: false }, [
    piece(curve([[10, 50], [80, 20], [200, 14], [330, 22], [392, 50], [320, 80], [180, 84], [50, 76]], 2), C.ice, { edge: 'cut' }),
    piece(ellipse(140, 40, 60, 8), C.white, { edge: 'clean', fibre: false, shadow: false, opacity: 0.7 }),
  ]);
}

/** A falling drop of meltwater (30 × 40). */
function drop(): string {
  return svg({ w: 30, h: 40, name: 'l9c8-drop', boil: false }, [piece(curve([[15, 2], [24, 20], [22, 34], [15, 38], [8, 34], [6, 20]], 2), C.ice, { edge: 'cut' })]);
}

/** The sky beyond the melting edge: pale, wet and bright. */
function edgeSky(): string {
  return svg({ w: 1180, h: 820, name: 'l9c8-sky', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.snowSky, { edge: 'clean', shadow: false }),
    piece(rect(-20, 280, 1220, 300), '#dce8f0', { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 520, 1220, 340), C.duskSky, { edge: 'torn', shadow: false, fibre: false }),
    piece(circle(1000, 140, 60), '#f6efc8', { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    ...[[200, 120], [640, 80]].map(([x, y]) => piece(ellipse(x, y, 120, 26), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.8 })),
  ]);
}

/** The melting edge of the Land of Snow: drifts slumping, icicles dripping off the lip. */
function landEdge(): string {
  const icicles: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 68;
    const len = 30 + ((i * 37) % 50);
    icicles.push(piece(poly([[x - 9, 640], [x + 9, 640], [x, 640 + len]]), C.ice, { edge: 'cut' }));
  }
  return svg({ w: 800, h: 900, name: 'l9c8-edge', boil: false }, [
    piece(poly([[60, 600], [140, 380], [220, 600]]), C.greenDeep, { rough: 0.6 }),
    piece(poly([[100, 470], [140, 380], [180, 470]]), C.snow, { edge: 'cut' }),
    piece(curve([[-40, 600], [300, 580], [620, 590], [760, 610], [780, 650], [700, 660], [-40, 660]], 2), C.snow, { rough: 1.2 }),
    piece(curve([[-40, 640], [760, 640], [740, 720], [690, 800], [640, 900], [-40, 900]], 2), '#b8cbd9', { rough: 1.2 }),
    ...icicles,
    piece(ellipse(420, 600, 120, 14), C.ice, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
  ]);
}

/** The top of the ladder, coming up through the cloud (600 × 400). */
function ladderTop(): string {
  return svg({ w: 600, h: 400, name: 'l9c8-ladder', boil: false }, [
    piece(band([[190, 420], [196, 40]], 12), C.wood, { edge: 'cut' }),
    piece(band([[300, 420], [294, 40]], 12), C.wood, { edge: 'cut' }),
    ...[80, 140, 200, 260].map((y) => piece(rect(196, y, 98, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(30 + i * 110, 300 + (i % 2) * 30, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}

/** Where the bell tower's open belfry is, on the stage. */
const ARCH = { x: 470, y: 230, w: 240, h: 230 };
const STONE = '#4b4652';
const STONE_DARK = '#38343f';

/**
 * Her prison's bell tower, close up, under a stormy sky (the backdrop):
 * the upper tower, a pointed iron roof and the dark belfry with its bell
 * (part `bell`, swinging from the top). The bars and the wall below the
 * belfry are a separate actor (towerFront) so she can rise up between.
 */
function towerBack(): string {
  const r = rng(909);
  const clouds: Node[] = [];
  for (let i = 0; i < 9; i++) clouds.push(piece(ellipse(r() * 1180, 60 + r() * 260, 170 + r() * 90, 34 + r() * 20), i % 2 ? '#3b3546' : '#4a4356', { edge: 'torn', fibre: false, shadow: false, opacity: 0.9 }));
  const { x, y, w, h } = ARCH;
  return svg({ w: 1180, h: 820, name: 'l9c8-tower', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.prisonNight, { edge: 'clean', shadow: false }),
    piece(rect(-20, 420, 1220, 440), '#3a3446', { edge: 'torn', shadow: false, fibre: false }),
    piece(circle(930, 150, 54), C.moonPale, { edge: 'cut', fibre: false, opacity: 0.85 }),
    ...clouds,
    // The upper tower and its roof.
    piece(rect(x - 50, y - 60, w + 100, h + 120), STONE, { rough: 0.6 }),
    piece(poly([[x - 80, y - 50], [x + w / 2, y - 220], [x + w + 80, y - 50]]), C.iron, { rough: 0.6 }),
    piece(rect(x - 70, y - 64, w + 140, 22, 3), STONE_DARK, { edge: 'cut' }),
    piece(rect(x + w / 2 - 4, y - 280, 8, 70), C.iron, { edge: 'cut' }),
    piece(rect(x + w / 2 - 34, y - 262, 68, 12, 3), C.ruler, { edge: 'cut' }),
    // The dark belfry, and the bell inside it.
    piece(rect(x, y, w, h, w / 2), '#15121b', { edge: 'cut', fibre: false }),
    group({ part: 'bell', origin: [x + w / 2, y + 20] }, [
      ink([[x + w / 2, y + 6], [x + w / 2, y + 30]], { width: 5, color: C.iron }),
      piece(curve([[x + w / 2 - 14, y + 24], [x + w / 2 + 14, y + 24], [x + w / 2 + 22, y + 58], [x + w / 2 + 30, y + 66], [x + w / 2 - 30, y + 66], [x + w / 2 - 22, y + 58]], 1), C.brassDark),
      piece(circle(x + w / 2, y + 70, 6), C.iron, { edge: 'cut' }),
    ]),
  ]);
}

/** The front of the tower: thick bars across the belfry, and the stone wall below it. */
function towerFront(): string {
  const { x, y, w, h } = ARCH;
  const bars: Node[] = [];
  for (let i = 1; i < 7; i++) bars.push(piece(rect(x + (w * i) / 7 - 6, y - 6, 12, h + 10), C.iron, { edge: 'cut' }));
  const stones: Node[] = [];
  for (let row = 0; row < 8; row++) {
    const yy = y + h + 30 + row * 46;
    stones.push(ink([[x - 50, yy], [x + w + 50, yy]], { width: 3, color: STONE_DARK, opacity: 0.7 }));
    for (let c = 0; c < 4; c++) {
      const xx = x - 10 + c * 90 + (row % 2) * 45;
      stones.push(ink([[xx, yy], [xx, yy + 46]], { width: 3, color: STONE_DARK, opacity: 0.6 }));
    }
  }
  return svg({ w: 1180, h: 820, name: 'l9c8-front', boil: false }, [
    piece(rect(x - 30, y + 20, 24, h - 20), C.iron, { edge: 'cut', fibre: false }),
    ...bars,
    piece(rect(x - 10, y + 40, w + 20, 12, 3), C.iron, { edge: 'cut' }),
    piece(rect(x - 50, y + h, w + 100, 420), STONE, { rough: 0.6 }),
    piece(rect(x - 64, y + h - 6, w + 128, 26, 3), STONE_DARK, { edge: 'cut' }),
    ...stones,
  ]);
}

// -------------------------------------------------------------------- moves

/** Drops of meltwater fall from (x, y), one after another. */
function dripDown(k: Kit, x: number, y: number, count: number): void {
  if (k.calm) return;
  for (let i = 0; i < count; i++) {
    const d = k.add(drop(), { x: x + ((i * 53) % 240) - 120, y, w: 20, z: 30 });
    k.set(d, { opacity: 0 });
    void k
      .wait(i * 300)
      .then(() => k.fade(d, 1, 0.1))
      .then(() => k.to(d, 0.9, { y: 260, ease: 'power2.in' }))
      .then(() => k.remove(d));
  }
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    thaw: { who: 'snowman', text: 'Drip, drip! The sun is out. It’s the Big Thaw! My land is melting!' },
    look: { who: 'moonface', text: 'Quick! One last look at our plan, before the snow map melts away.' },
    recap: { who: 'hero', text: 'The key with icicle teeth. Six o’clock, her land comes. Quarter past six, we creep in.' },
    remember: { who: 'narrator', text: '{name} looked hard at the map, and remembered every bit.' },
    eh: { who: 'saucepan', text: 'EH? A SNOW-PLAN? Don’t worry, I’ve packed some snow in my saucepan!' },
    globe: { who: 'snowman', text: 'Take this snow globe. Then you’ll always have a little snow with you.' },
    bye: { who: 'snowman', text: 'Don’t worry about me. I’ll be back next winter! Now run!' },
    down: { who: 'moonface', text: 'The sledge got us here, quick as a wink! Now down the ladder, before it melts!' },
    prize: { who: 'narrator', text: 'Home, safe and warm! With a snow globe, and the seal of the Land of Snow.' },
    cocoa: { who: 'saucepan', text: 'Hot cocoa for everyone! Clank, clank!' },
    dark: { who: 'hero', text: 'Moon-Face… why has it gone so dark? And so cold?' },
    bars: { who: 'moonface', text: 'Look. A bell tower, with bars on it. It’s her prison.' },
    come: { who: 'dameSnap', text: 'Ready or not, little ones… here I COME!' },
    ready: { who: 'hero', text: 'Silky is in there. And we’ve got a plan, {name}.' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: the thaw, and the plan
    k.landScene(9);
    k.music('dreamy');
    const sun = k.light(1040, 210, 260, { color: '#fff3c4', strength: 0, z: 8 });
    const map = k.add(planMap(), { x: 380, y: 250, w: 540, z: 12 });
    const dew = k.add(dewdrop(), { x: 420, y: 600, w: 34, z: 22 });
    const dewGlow = k.light(437, 625, 70, { color: C.dew, strength: 0.25, flicker: true, z: 21 });
    k.float(dew, 4, 2.6);
    const mf = k.character('moonface', { x: 20, y: 360, w: 220, z: 20 });
    const hero = k.character('hero', { x: 190, y: 420, w: 200, z: 21 });
    const snowy = k.character('snowman', { x: 890, y: 320, w: 270, z: 18, flip: true });
    k.set([mf, hero, snowy], { opacity: 0 });
    await k.all(k.enter(mf, 'left'), k.wait(150).then(() => k.enter(hero, 'left')), k.enter(snowy, 'right'));
    sunrise();
    await k.fade(sun, 0.7, 1.4);
    drips(6);
    dripDown(k, 1000, 330, 4);
    await k.all(k.say('thaw', snowy), k.to(snowy, 2, { scale: 0.95, y: 10, ease: 'sine.inOut' }));
    await k.all(k.say('look', mf), k.pop(map, 1.04));
    // Each part of the plan, pointed out in turn.
    const S = 540 / 640;
    const marks = [
      [380 + 265 * S, 250 + 60 * S],
      [380 + 364 * S, 250 + 348 * S],
      [380 + 474 * S, 250 + 360 * S],
      [380 + 548 * S, 250 + 95 * S],
    ];
    const recap = k.say('recap', hero);
    for (const [x, y] of marks) {
      k.sparkle(x, y, 8, 70);
      k.fx.twinkle();
      await k.wait(900);
    }
    await recap;
    // Silky's dewdrop glows: the plan is a good one.
    k.sparkle(437, 610, 8, 70);
    await k.to(dewGlow, 0.6, { opacity: 0.7, ease: 'sine.out' });
    await k.all(k.say('remember'), k.camera({ zoom: 1.3, x: 650, y: 430 }, 1.6));
    await k.camera({}, 0.8);

    // The map melts away into a puddle.
    k.music('cosy');
    drips(8);
    const pool = k.add(puddle(), { x: 450, y: 560, w: 400, z: 11 });
    k.set(pool, { opacity: 0 });
    await k.all(k.to(map, 2, { scaleY: 0.4, y: 80, opacity: 0, ease: 'power1.in' }), k.fade(pool, 1, 2));
    k.remove(map);

    // The Saucepan Man clanks in, a saucepan full of snow.
    const sauce = k.character('saucepan', { x: 560, y: 360, w: 230, z: 19 });
    k.set(sauce, { opacity: 0 });
    snapSound.clank(4);
    await k.enter(sauce, 'bottom', 0.6);
    await k.all(k.say('eh', sauce), k.hop(sauce, 24, 2));
    // Mr Snowman gives them a snow globe, and sends them off.
    const globe = k.keepsake(k.chapter!.keepsake, { x: 760, y: 250, w: 140, z: 30 });
    k.set(globe, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(globe, 0.4);
    k.sparkle(830, 320, 10, 100);
    await k.all(k.say('globe', snowy), wave(k, snowy, 'armL', 2));
    await k.to(globe, 0.8, { x: -520, y: 220, scale: 0.4, ease: 'power2.inOut' });
    k.remove(globe);
    void k.hop(hero, 24, 1);
    k.fx.rumble(1.5);
    drips(6);
    await k.all(k.say('bye', snowy), k.to(snowy, 1.5, { scale: 0.88, y: 30 }));
    k.fx.whizz();
    void k.fade(dewGlow, 0, 0.5);
    await k.all(k.exit(mf, 'right', 0.7), k.exit(hero, 'right', 0.7), k.wait(200).then(() => k.exit(sauce, 'right', 0.7)), k.fade(dew, 0, 0.5));

    // ------------------------------------------- scene 2: the sledge, and the ladder
    let edge!: HTMLElement;
    let s2!: HTMLElement;
    let h2!: HTMLElement;
    let p2!: HTMLElement;
    let m2!: HTMLElement;
    let sled!: HTMLElement;
    await k.cut(() => {
      k.backdrop(edgeSky());
      edge = k.add(landEdge(), { x: -20, y: 0, w: 800, h: 900, z: 4, still: true });
      k.add(ladderTop(), { x: 600, y: 420, w: 600, z: 26, still: true });
      s2 = k.character('snowman', { x: 20, y: 330, w: 220, z: 6 });
      // On the sledge: Moon-Face at the front, then the hero, then the Saucepan Man.
      m2 = k.character('moonface', { x: 520, y: 360, w: 190, z: 20, flip: true });
      h2 = k.character('hero', { x: 380, y: 380, w: 180, z: 20 });
      p2 = k.character('saucepan', { x: 220, y: 360, w: 190, z: 19 });
      sled = k.add(sledgeArt(), { x: 200, y: 540, w: 520, z: 22 });
      k.set(s2, { scale: 0.85, transformOrigin: '50% 100%' });
    });
    k.music('adventure');
    // Swish! The sledge slides in to the top of the ladder.
    const riders = [sled, m2, h2, p2];
    k.set(riders, { x: -760 });
    k.fx.whizz();
    await k.to(riders, 1.4, { x: 0, ease: 'power3.out' });
    k.puff(720, 640, 140, C.snow);
    drips(5);
    dripDown(k, 420, 640, 5);
    await k.all(k.say('down', m2), wave(k, m2, 'armL', 2));
    // Down the ladder, one after another.
    k.fx.whizz();
    await k.to(m2, 0.5, { x: 230, y: -60, ease: 'power1.out' });
    await k.to(m2, 0.4, { y: 400, ease: 'power2.in' });
    await k.to(h2, 0.7, { x: 375, y: -60, ease: 'power1.out' });
    await k.to(h2, 0.4, { y: 400, ease: 'power2.in' });
    snapSound.clank(3);
    await k.to(p2, 0.8, { x: 530, y: -60, ease: 'power1.out' });
    await k.to(p2, 0.4, { y: 400, ease: 'power2.in' });
    // The land rises away, dripping, Mr Snowman waving goodbye.
    k.fx.rumble(3);
    drips(10);
    void wave(k, s2, 'armR', 4);
    await k.all(k.to([edge, sled], 5, { y: -780, ease: 'power1.in' }), k.to(s2, 5, { y: -780, ease: 'power1.in' }), k.wait(800).then(() => dripDown(k, 400, 300, 6)));

    // ------------------------------------------- scene 3: home… and dark
    let h3!: HTMLElement;
    let p3!: HTMLElement;
    let m3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l9c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      h3 = k.character('hero', { x: 110, y: 360, w: 240, z: 20 });
      p3 = k.character('saucepan', { x: 350, y: 350, w: 240, z: 19 });
      m3 = k.character('moonface', { x: 870, y: 350, w: 250, z: 20, flip: true });
    });
    k.music('cosy');
    flump();
    await together(k, [h3, p3, m3], 0.3, { y: '+=10' });
    await together(k, [h3, p3, m3], 0.3, { y: '-=10' });
    const keep = k.keepsake(k.chapter!.keepsake, { x: 600, y: 500, w: 150, z: 24 });
    const seal = k.add(landSeal(9), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    await k.all(k.say('prize'), k.hop(h3, 30, 2));
    pour();
    snapSound.clank(3);
    await k.all(k.say('cocoa', p3), k.hop(p3, 20, 2));
    // The window darkens, and a cold wind blows.
    k.silence();
    k.fx.wind(3);
    const gloom = k.dim(0, '#100c1c');
    await k.fade(gloom, 0.5, 2);
    void k.shake(h3, 4, 2);
    await k.say('dark', h3);

    // ------------------------------------------- scene 4: the prison arrives
    let prison!: HTMLElement;
    let veil!: HTMLElement;
    const box = TREE_SPOTS.cloud;
    await k.cut(() => {
      k.backdrop(tree('l9c8-tree'));
      prison = k.landFar(10, { x: box.x, y: box.y, w: box.w, z: 4 });
      veil = k.dim(0.35, '#100c1c');
      k.set(prison, { y: -220, opacity: 0 });
    });
    k.music('spooky');
    k.fx.rumble(3);
    k.fx.wind(3);
    void k.to(veil, 3, { opacity: 0.55 });
    await k.all(k.to(prison, 3.2, { y: 0, opacity: 1, ease: 'sine.out' }), k.camera({ zoom: 1.8, x: 590, y: 120 }, 3.4));
    toll();
    void k.quake(3);
    await k.wait(1400);

    // ------------------------------------------- scene 5: the bell tower, with bars
    let back!: HTMLElement;
    let snap!: HTMLElement;
    await k.cut(() => {
      back = k.backdrop(towerBack());
      snap = k.snap('shriek', { x: ARCH.x + 10, y: ARCH.y + 60, w: 220, z: 8 });
      k.add(towerFront(), { x: 0, y: 0, w: 1180, h: 820, z: 12, still: true });
      k.set(snap, { y: 260, opacity: 0 });
    });
    const bellPart = k.pivot(k.part(back, 'bell'));
    const swing = (async () => {
      for (let i = 0; i < 3; i++) {
        toll();
        await k.to(bellPart, 0.9, { rotation: 14, ease: 'sine.inOut' });
        await k.to(bellPart, 0.9, { rotation: -14, ease: 'sine.inOut' });
      }
      await k.to(bellPart, 0.6, { rotation: 0 });
    })();
    await k.say('bars');
    await swing;
    // Clack… clack… CLACK. She rises up behind the bars.
    snapSound.heels(3, 0.4, 0.7);
    await k.wait(1300);
    snapSound.caw(1);
    await k.to(snap, 1.2, { y: 0, opacity: 1, ease: 'power2.out' });
    snapSound.ruler();
    void k.camera({ zoom: 1.35, x: 590, y: 330 }, 0.8);
    void k.shake(snap, 4, 2);
    await k.say('come', snap);
    snapSound.heels(4, 0.3);
    await k.all(k.camera({}, 0.6), k.to(snap, 0.8, { y: 260, opacity: 0, ease: 'power2.in' }));

    // ------------------------------------------- scene 6: brave
    let h6!: HTMLElement;
    let m6!: HTMLElement;
    let p6!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l9c8-tree2', { landN: 10 }));
      k.dim(0.5, '#100c1c');
      h6 = k.character('hero', { x: 160, y: 430, w: 250, z: 40 });
      p6 = k.character('saucepan', { x: 430, y: 430, w: 240, z: 39 });
      m6 = k.character('moonface', { x: 760, y: 430, w: 250, z: 40, flip: true });
      k.light(590, 560, 380, { color: C.candle, strength: 0.25, z: 38 });
    });
    k.music('triumph');
    await k.all(k.say('ready', h6), k.hop(h6, 20, 1), k.wait(200).then(() => k.hop(m6, 16, 1)), k.wait(300).then(() => k.hop(p6, 16, 1)));
    await k.wait(600);
    k.silence();
    sting();
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(1200);
  },
});
