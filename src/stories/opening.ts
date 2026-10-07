/**
 * The opening film: Up the Faraway Tree.
 *
 * The first thing he sees after choosing who to climb with (about 110 s, six
 * scenes), and kept in Moon-Face's Treasure Room afterwards.
 *
 *   1. Moving day. A little open-topped car, piled high with boxes, putters
 *      down a country lane to a new cottage at the edge of a dark wood. Mum
 *      sends the children (and him) off to explore.
 *   2. The Enchanted Wood. Sunbeams and dust, and the old trees whisper
 *      "wisha-wisha".
 *   3. The Faraway Tree. The camera climbs the enormous trunk from the roots
 *      to the cloud: little lit windows, washing water pouring down, a snore.
 *   4. The foot of the tree. The Saucepan Man clanks down and mishears
 *      everything, Silky floats down with pop biscuits, and the Angry Pixie
 *      slams his shutters on a peeping child.
 *   5. The top. Moon-Face peeks over the cloud and explains the lands, which
 *      arrive in the cloud (a lovely one, a dangerous one) and move on. The
 *      cloud darkens for a moment with a faint clack-clack of heels, then
 *      it's gone, and Moon-Face laughs it off.
 *   6. The climb. "Come on, {name}!" The three children start up the tree
 *      and the trunk scrolls past until Moon-Face beams down from the cloud.
 *      Straight on into chapter 1, Into the Enchanted Wood.
 *
 * The scary rules (PLAN §2): the only menace is a darkening cloud and a
 * distant clacking, over in two seconds, with the camera back on the
 * children straight after. Dame Snap is not shown.
 *
 * The car, the cottage, the lane, the foot of the tree and the tall climbing
 * view are drawn here (they are only needed by this film for now).
 */
import { gsap } from 'gsap';
import { AVATARS } from '../core/curriculum';
import { tree } from '../art/scenery';
import { band, bell, C, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type PlaceOpts, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The little car's engine: a soft, uneven putt-putt for a few seconds. */
function putter(seconds: number): void {
  const t = now();
  const r = rng(7);
  for (let s = 0; s < seconds; s += 0.13) {
    const f = 62 + r() * 10;
    tone(f, t + s, { wave: 'sawtooth', peak: 0.05, attack: 0.005, decay: 0.09, glideTo: f * 0.8, lowpass: 320 });
    noiseBurst(t + s, { freq: 220, q: 1.5, peak: 0.025, decay: 0.06, type: 'lowpass' });
  }
}

/** A cheery "parp-parp" on the horn. */
function parp(): void {
  const t = now();
  for (const dt of [0, 0.26]) {
    tone(415, t + dt, { wave: 'square', peak: 0.06, attack: 0.01, decay: 0.16, lowpass: 1400 });
    tone(523, t + dt, { wave: 'square', peak: 0.04, attack: 0.01, decay: 0.16, lowpass: 1400 });
  }
}

/** Birds in the hedges: a few quick chirps and a little trill. */
function birdsong(): void {
  const t = now();
  const r = rng(23);
  for (let i = 0; i < 7; i++) {
    const at = t + i * 0.32 + r() * 0.12;
    const f = 2300 + r() * 900;
    tone(f, at, { peak: 0.035, attack: 0.005, decay: 0.07, glideTo: f * 1.35 });
    if (i % 3 === 2) for (let j = 0; j < 4; j++) tone(f * 1.2, at + 0.1 + j * 0.05, { peak: 0.025, attack: 0.003, decay: 0.04, glideTo: f });
  }
}

/** The trees whispering: soft breathy swells, "wisha… wisha… wisha". */
function wisha(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    noiseBurst(t + i * 0.62, { freq: 2200, q: 0.8, peak: 0.06, attack: 0.22, decay: 0.38, sweepTo: 900 });
    tone(330 + i * 20, t + i * 0.62, { peak: 0.018, attack: 0.25, decay: 0.4, vibrato: [5, 6] });
  }
}

/** Wind in the leaves. */
function leaves(seconds = 3): void {
  const t = now();
  noiseBurst(t, { freq: 700, q: 0.6, peak: 0.05, attack: seconds * 0.4, decay: seconds * 0.6, sweepTo: 1600 });
}

/** Washing water splashing down the trunk. */
function splash(): void {
  const t = now();
  for (let i = 0; i < 5; i++) noiseBurst(t + i * 0.09, { freq: 1800 + i * 300, q: 1.4, peak: 0.04, attack: 0.01, decay: 0.12 });
}

/** A big snore from a branch: in through the nose, out with a whistle. */
function snore(): void {
  const t = now();
  noiseBurst(t, { freq: 320, q: 2.2, peak: 0.09, attack: 0.55, decay: 0.35, sweepTo: 520 });
  tone(88, t, { wave: 'sawtooth', peak: 0.05, attack: 0.5, decay: 0.4, glideTo: 104, lowpass: 420 });
  tone(950, t + 1.0, { peak: 0.025, attack: 0.15, decay: 0.5, glideTo: 620 });
}

/** Pots and pans clanking (one clank per step). */
function clank(steps = 1, gap = 0.22): void {
  const t = now();
  const r = rng(steps * 31);
  for (let i = 0; i < steps; i++) {
    const at = t + i * gap;
    const f = 520 + r() * 400;
    tone(f, at, { wave: 'triangle', peak: 0.07, attack: 0.002, decay: 0.25 });
    tone(f * 2.76, at, { peak: 0.04, attack: 0.002, decay: 0.15 });
    tone(f * 5.4, at, { peak: 0.02, attack: 0.002, decay: 0.08 });
    noiseBurst(at, { freq: 4200, q: 3, peak: 0.05, decay: 0.05 });
  }
}

/** Shutters slammed shut: a wooden BANG. */
function slam(): void {
  const t = now();
  tone(110, t, { peak: 0.24, attack: 0.002, decay: 0.22, glideTo: 50 });
  noiseBurst(t, { freq: 900, q: 0.8, peak: 0.2, attack: 0.002, decay: 0.18, type: 'lowpass' });
  noiseBurst(t + 0.05, { freq: 2600, q: 2, peak: 0.05, decay: 0.08 });
}

/** A pop biscuit going pop. */
function popBiscuit(i: number): void {
  const t = now();
  tone(620 + i * 90, t, { wave: 'triangle', peak: 0.09, attack: 0.004, decay: 0.12, glideTo: 1500 + i * 120 });
  noiseBurst(t, { freq: 3000, q: 2, peak: 0.04, decay: 0.04 });
}

/** A land arriving in the cloud: a soft rising shimmer. */
function landArrives(): void {
  const t = now();
  noiseBurst(t, { freq: 600, q: 0.7, peak: 0.07, attack: 0.3, decay: 0.6, sweepTo: 3000 });
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => bell(f, t + 0.2 + i * 0.1, 0.06, 0.9));
}

/** A land moving on: a whoosh away and a little falling tune. */
function landLeaves(): void {
  const t = now();
  noiseBurst(t, { freq: 2600, q: 0.7, peak: 0.08, attack: 0.05, decay: 0.7, sweepTo: 400 });
  [NOTE.G5, NOTE.E5, NOTE.C5].forEach((f, i) => bell(f, t + 0.1 + i * 0.12, 0.05, 0.6));
}

/**
 * Far-off heels on a hard floor: clack… clack… clack, each with a faint
 * echo. Quiet: something far away, not something here.
 */
function clacks(times = 4, gap = 0.42): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    for (const [dt, k] of [[0, 1], [0.16, 0.35]] as const) {
      const at = t + i * gap + dt;
      noiseBurst(at, { freq: 3200, q: 7, peak: 0.07 * k, attack: 0.002, decay: 0.035 });
      tone(1250, at, { wave: 'triangle', peak: 0.04 * k, attack: 0.002, decay: 0.05, glideTo: 900 });
    }
  }
}

// -------------------------------------------------------------- the family

interface Kids {
  hero: HTMLElement;
  /** The other two children, in AVATARS order. */
  a: HTMLElement;
  b: HTMLElement;
  all: HTMLElement[];
}

/** All three children: the one he chose up front, the other two a little behind. */
function kids(k: Kit, hero: PlaceOpts, a: PlaceOpts, b: PlaceOpts): Kids {
  const [ia, ib] = AVATARS.filter((x) => x !== k.hero);
  const el = { a: k.character(ia, { z: 14, ...a }), b: k.character(ib, { z: 14, ...b }), hero: k.character('hero', { z: 16, ...hero }) };
  return { ...el, all: [el.hero, el.a, el.b] };
}

/** Moves the camera instantly (to start a scene already zoomed in). Same maths as k.camera. */
function snapCamera(k: Kit, zoom: number, x: number, y: number): void {
  const tx = Math.min(0, Math.max(1180 - 1180 * zoom, 590 - x * zoom));
  const ty = Math.min(0, Math.max(820 - 820 * zoom, 410 - y * zoom));
  if (!k.calm) k.set(k.root, { x: tx, y: ty, scale: zoom, transformOrigin: '0 0' });
}

/** Rattles an actor's parts (the Saucepan Man's pots) from side to side. */
async function rattle(k: Kit, parts: Element[]): Promise<void> {
  if (!parts.length) return;
  for (const dx of [5, -5, 3, 0]) await k.to(parts, 0.06, { x: dx, rotation: dx, ease: 'none' });
}

const FLAT = { edge: 'cut' as const, fibre: false as const, shadow: false };

// ------------------------------------------------------- scene 1: the lane

const SKY_TOP = '#a9c7df';
const SKY_LOW = '#d7e6e4';
const HAZE = '#f2ead2';
const THATCH = '#c9a35e';
const THATCH_DARK = '#9e7a3c';
const WALL = '#efe3c8';

/** A little thatched cottage with roses round the door, standing on baseY. */
function cottage(x: number, baseY: number): Node[] {
  const w = 240;
  const h = 140;
  const left = x - w / 2;
  const top = baseY - h;
  const roses: Node[] = [];
  const r = rng(91);
  for (let i = 0; i < 9; i++) roses.push(piece(circle(x - 46 + r() * 20 - (i % 2) * 6, top + 40 + i * 10, 5 + r() * 3), i % 3 ? C.rose : C.pink, FLAT));
  return [
    // Chimney, walls and a deep thatched roof.
    piece(rect(left + w * 0.7, top - 96, 30, 70), C.rust, { edge: 'cut' }),
    piece(rect(left + w * 0.7 - 4, top - 100, 38, 10, 2), C.redDark, { edge: 'cut' }),
    piece(rect(left, top, w, h, 4), WALL, { rough: 0.8 }),
    piece(curve([[left - 26, top + 22], [left + 10, top - 50], [x - 10, top - 92], [x + 40, top - 92], [left + w - 6, top - 50], [left + w + 28, top + 22]], 2), THATCH, { rough: 1.2 }),
    ink([[left - 10, top + 10], [left + w + 12, top + 10]], { width: 3, color: THATCH_DARK, opacity: 0.6, wobble: 2 }),
    ink([[left + 30, top - 30], [left + w - 30, top - 30]], { width: 3, color: THATCH_DARK, opacity: 0.45, wobble: 2 }),
    // A round-topped red door with roses climbing round it.
    piece(rect(x - 26, baseY - 82, 52, 82, 24), C.red, { edge: 'cut' }),
    piece(circle(x + 14, baseY - 40, 3.5), C.gold, FLAT),
    ...roses,
    // Little cottage windows with criss-cross panes.
    ...[left + 26, left + w - 76].flatMap((wx) => [
      piece(rect(wx, top + 34, 50, 44, 3), C.brownDark, { edge: 'cut' }),
      piece(rect(wx + 4, top + 38, 42, 36, 2), C.sky, { ...FLAT }),
      ink([[wx + 25, top + 38], [wx + 25, top + 74]], { width: 2.5, color: C.brownDark }),
      ink([[wx + 4, top + 56], [wx + 46, top + 56]], { width: 2.5, color: C.brownDark }),
      piece(rect(wx - 4, top + 78, 58, 7, 2), C.wood, { edge: 'cut' }),
    ]),
    // The garden: a white picket fence and a gate left open.
    ...Array.from({ length: 7 }, (_, i) => piece(poly([[left - 60 + i * 20, baseY + 26], [left - 60 + i * 20, baseY - 8], [left - 54 + i * 20, baseY - 16], [left - 48 + i * 20, baseY - 8], [left - 48 + i * 20, baseY + 26]]), C.white, { edge: 'cut', fibre: false })),
    piece(rect(left - 64, baseY - 2, 140, 6), C.white, { edge: 'cut', fibre: false, shadow: false }),
  ];
}

/** A dark wood: tall trees in deep greens, crowding together. */
function darkWood(x0: number, x1: number, baseY: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  const shades = [C.woodShade, C.greenDeep, '#24392e', C.greenDark];
  for (let x = x0; x < x1; x += 34 + r() * 20) {
    const hh = 240 + r() * 150;
    const c = shades[Math.floor(r() * shades.length)];
    if (r() < 0.55) {
      const w = hh * 0.36;
      out.push(piece(poly([[x, baseY - hh], [x + w, baseY], [x - w, baseY]]), c, { rough: 1.1, shadow: false }));
    } else {
      out.push(piece(rect(x - 7, baseY - hh * 0.5, 14, hh * 0.5), C.barkDark, { edge: 'cut', shadow: false }));
      out.push(piece(circle(x, baseY - hh * 0.62, hh * 0.3), c, { rough: 1.3, shadow: false }));
    }
  }
  return out;
}

/** Moving day: a sunny lane through the fields to the cottage by the dark wood. */
function countryside(): string {
  const r = rng(61);
  const hedge: Node[] = [];
  for (let i = 0; i < 18; i++) hedge.push(piece(circle(-20 + i * 46 + r() * 10, 744 + r() * 10, 30 + r() * 12), i % 2 ? C.leafDark : C.greenDark, { rough: 1.2, shadow: i % 3 === 0 }));
  const flowers: Node[] = [];
  for (let i = 0; i < 22; i++) flowers.push(dot(r() * 820, 712 + r() * 60, 4 + r() * 2, i % 3 ? C.white : C.yellow));
  const fieldLines: Node[] = [];
  for (let i = 0; i < 5; i++) fieldLines.push(ink([[-20 + i * 160, 500], [80 + i * 170, 440 - (i % 2) * 14]], { width: 4, color: C.leafDark, opacity: 0.45, wobble: 2 }));
  return svg({ w: 1180, h: 820, name: 'opening-lane', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 300), SKY_TOP, { edge: 'clean', shadow: false }),
    piece(rect(-20, 220, 1220, 220), SKY_LOW, { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 380, 1220, 140), HAZE, { rough: 2, shadow: false, fibre: false }),
    // The sun and a few fair-weather clouds.
    piece(circle(170, 130, 84), C.goldLight, { ...FLAT, opacity: 0.3 }),
    piece(circle(170, 130, 52), C.goldLight, { edge: 'cut', fibre: false }),
    ...[[430, 110, 1], [700, 70, 0.8], [1000, 140, 0.9]].flatMap(([x, y, s]) => [
      piece(ellipse(x, y, 90 * s, 22 * s), C.cloud, { ...FLAT, opacity: 0.9 }),
      piece(circle(x - 30 * s, y - 14 * s, 30 * s), C.cloud, { ...FLAT, opacity: 0.9 }),
      piece(circle(x + 22 * s, y - 20 * s, 36 * s), C.cloud, { ...FLAT, opacity: 0.9 }),
    ]),
    // Patchwork hills far away.
    piece(curve([[-40, 440], [120, 360], [320, 384], [520, 350], [700, 380], [900, 360], [1220, 400], [1220, 600], [-40, 600]], 2), '#b6cd94', { rough: 1.4, shadow: false }),
    piece(curve([[-40, 500], [200, 430], [420, 450], [640, 420], [900, 450], [1220, 440], [1220, 640], [-40, 640]], 2), '#97b877', { rough: 1.4 }),
    ...fieldLines,
    // The dark wood, behind the cottage on the right.
    ...darkWood(760, 1240, 590, 71),
    // The near meadow.
    piece(curve([[-40, 600], [260, 572], [560, 590], [820, 572], [1220, 590], [1220, 860], [-40, 860]], 2), C.green, { rough: 1.4 }),
    ...cottage(970, 600),
    // The lane, winding up to the garden gate.
    piece(band([[-60, 676], [200, 664], [480, 656], [760, 640], [880, 626], [930, 612]], 64), C.sand, { rough: 1.2 }),
    ink([[-60, 676], [200, 664], [480, 656], [760, 640]], { width: 3, color: C.tan, opacity: 0.6, wobble: 2 }),
    // The hedgerow along the front, with daisies and buttercups.
    ...hedge,
    ...flowers,
  ]);
}

const CAR_W = 520;
const CAR_H = 330;
/** Wheel centres in the car's own units (for spinning them). */
const WHEELS: Pt[] = [[128, 282], [404, 282]];

/** The back of the car: the seats the family sit in (heads go in front of this). */
function carBack(): string {
  return svg({ w: CAR_W, h: CAR_H, name: 'opening-car-back', boil: false }, [
    piece(rect(150, 150, 70, 70, 10), C.brownDark, { edge: 'cut' }),
    piece(rect(276, 150, 70, 70, 10), C.brownDark, { edge: 'cut' }),
    // The heap of moving boxes on the luggage rack at the back.
    piece(rect(10, 120, 120, 90, 4), C.tan, { rough: 0.8 }),
    piece(rect(64, 116, 8, 94), C.goldLight, FLAT),
    piece(rect(22, 56, 96, 68, 4), C.sand, { rough: 0.8 }),
    piece(rect(66, 56, 8, 68), C.goldLight, FLAT),
    piece(rect(36, 6, 64, 54, 4), C.tan, { rough: 0.8 }),
    // A lamp, a pot plant and a teddy peeping out of the top box.
    piece(poly([[104, 20], [150, 20], [140, -20], [114, -20]]), C.rose, { edge: 'cut' }),
    piece(rect(124, 20, 6, 40), C.brownDark, FLAT),
    piece(circle(56, 8, 13), C.teddy, { edge: 'cut' }),
    piece(circle(46, -2, 6), C.teddy, { edge: 'cut' }),
    piece(circle(66, -2, 6), C.teddy, { edge: 'cut' }),
    dot(52, 6, 1.8, C.ink),
    dot(60, 6, 1.8, C.ink),
    ink([[4, 40], [132, 210]], { width: 3, color: C.brownDark, opacity: 0.8 }),
    ink([[132, 40], [4, 210]], { width: 3, color: C.brownDark, opacity: 0.8 }),
  ]);
}

/** The front of the car: an open-topped little red car (the family sit inside it). */
function carFront(): string {
  const wheel = (i: number): Node => {
    const [x, y] = WHEELS[i];
    return group({ part: 'wheel' }, [
      piece(circle(x, y, 42), C.charcoal, { edge: 'cut' }),
      piece(circle(x, y, 22), C.steelLight, { edge: 'cut', fibre: false }),
      ...[0, 1, 2, 3].map((j) => ink([[x, y], [x + Math.cos((j * Math.PI) / 2) * 20, y + Math.sin((j * Math.PI) / 2) * 20]], { width: 3, color: C.steelDark })),
      dot(x, y, 5, C.steelDark),
    ]);
  };
  return svg({ w: CAR_W, h: CAR_H, name: 'opening-car', boil: false }, [
    // Windscreen: a thin frame with pale glass.
    piece(poly([[400, 200], [376, 120], [386, 116], [412, 198]]), C.steelDark, { edge: 'cut' }),
    piece(poly([[386, 124], [440, 128], [446, 198], [408, 198]]), C.glass, { ...FLAT, opacity: 0.45 }),
    piece(poly([[436, 126], [446, 124], [458, 198], [446, 200]]), C.steelDark, { edge: 'cut' }),
    // The body: round and red, with a long bonnet.
    piece(curve([[20, 280], [16, 220], [40, 196], [140, 192], [380, 196], [460, 200], [500, 220], [510, 264], [500, 282]], 2), C.red, { rough: 0.8 }),
    piece(band([[36, 214], [480, 222]], 6), C.redDark, { ...FLAT, opacity: 0.5 }),
    // A door with a little handle, a round headlamp, a bumper.
    ink([[240, 204], [240, 270]], { width: 3, color: C.redDark, opacity: 0.7 }),
    piece(rect(200, 226, 22, 6, 3), C.steelLight, FLAT),
    piece(circle(498, 232, 13), C.candle, { edge: 'cut' }),
    piece(rect(470, 270, 46, 10, 4), C.steel, { edge: 'cut' }),
    piece(rect(4, 268, 40, 10, 4), C.steel, { edge: 'cut' }),
    // Mudguards over the wheels.
    piece(curve([[70, 270], [84, 230], [128, 220], [172, 230], [186, 270]], 2), C.redDark, { edge: 'cut' }),
    piece(curve([[346, 270], [360, 230], [404, 220], [448, 230], [462, 270]], 2), C.redDark, { edge: 'cut' }),
    wheel(0),
    wheel(1),
  ]);
}

/** Two tiny birds flapping across the sky. */
function birdsArt(): string {
  const bird = (x: number, y: number, s: number): Node => ink([[x - s, y - s * 0.4], [x - s * 0.4, y - s * 0.6], [x, y], [x + s * 0.4, y - s * 0.6], [x + s, y - s * 0.4]], { width: 3, color: C.ink, opacity: 0.75 });
  return svg({ w: 120, h: 60, name: 'opening-birds', boil: true }, [bird(30, 30, 16), bird(84, 18, 12)]);
}

// ---------------------------------------------------- scene 2: the wood

/** Little curls of breath: a tree's whisper drifting out. */
function whisperArt(): string {
  return svg({ w: 200, h: 80, name: 'opening-whisper', boil: true }, [
    ink([[10, 40], [40, 22], [70, 44], [100, 24], [130, 42], [160, 26], [190, 36]], { width: 4, color: '#f4efc0', opacity: 0.85 }),
    ink([[30, 64], [60, 52], [90, 66], [120, 54], [150, 62]], { width: 3, color: '#f4efc0', opacity: 0.6 }),
  ]);
}

// ---------------------------------------------------- scene 3: the tree

/** One snoring Z. */
function zArt(): string {
  return svg({ w: 40, h: 40, name: 'opening-z', boil: true }, [ink([[6, 6], [34, 6], [6, 34], [34, 34]], { width: 5, color: C.cream })]);
}

/** A drop of washing water. */
function dropArt(): string {
  return svg({ w: 20, h: 28, name: 'opening-drop', boil: false }, [piece(curve([[10, 0], [18, 16], [10, 26], [2, 16]], 2), '#d6ebf2', { edge: 'cut', fibre: false })]);
}

// -------------------------------------------- scene 4: the foot of the tree

const PIXIE_WIN = { x: 520, y: 300 };

/** The foot of the Faraway Tree, close up: roots, the door, the Pixie's window. */
function treeFoot(): string {
  const r = rng(41);
  const { x: wx, y: wy } = PIXIE_WIN;
  const backTrees: Node[] = [];
  for (let i = 0; i < 12; i++) backTrees.push(piece(circle(-20 + i * 110 + r() * 30, 470 + (i % 2) * 30, 110 + r() * 30), i % 2 ? C.greenDeep : C.leafDark, { shadow: false }));
  const grass: Node[] = [];
  for (let i = 0; i < 30; i++) {
    const gx = r() * 1180;
    grass.push(ink([[gx, 812], [gx + 4, 784 - r() * 18]], { width: 3, color: C.leafDark, opacity: 0.8 }));
  }
  return svg({ w: 1180, h: 820, name: 'opening-foot', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 280), C.duskHigh, { edge: 'clean', shadow: false }),
    piece(rect(-20, 220, 1220, 200), C.duskSky, { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 380, 1220, 460), C.dusk, { rough: 2, shadow: false, fibre: false }),
    ...backTrees,
    piece(curve([[-20, 640], [300, 620], [600, 640], [900, 616], [1200, 640], [1200, 860], [-20, 860]], 2), C.greenDark, { rough: 1.4 }),
    // Great branches reaching out overhead.
    piece(band([[600, 90], [380, 60], [160, 80], [-30, 40]], 60), C.bark),
    piece(band([[700, 150], [900, 110], [1060, 120], [1220, 80]], 54), C.bark),
    // The trunk: far too wide to fit, flaring into roots.
    piece(curve([[300, 860], [400, 760], [440, 600], [450, 300], [440, -30], [820, -30], [810, 300], [820, 600], [870, 760], [980, 860]], 2), C.bark),
    piece(band([[520, -20], [520, 300], [500, 560], [470, 760]], 30), C.barkLight, { shadow: false, opacity: 0.45, edge: 'cut' }),
    ink([[740, -20], [756, 300], [770, 560], [800, 740]], { width: 4, color: C.barkDark, opacity: 0.5, wobble: 1.6 }),
    ink([[660, 0], [664, 160]], { width: 3, color: C.barkDark, opacity: 0.45, wobble: 1.4 }),
    piece(band([[430, 720], [330, 780], [220, 808], [140, 812]], 50), C.bark),
    piece(band([[840, 720], [930, 780], [1040, 804], [1120, 812]], 50), C.bark),
    // Clumps of leaves on the branches.
    ...[[60, 60, 90], [250, 30, 80], [1000, 80, 90], [1160, 50, 80]].map(([x, y, s]) => piece(circle(x, y, s), C.leafDark, { rough: 1.3 })),
    ...[[110, 90, 50], [1060, 110, 46]].map(([x, y, s]) => piece(circle(x, y, s), C.leaf, { rough: 1.3, shadow: false })),
    // A lit window high up, and Dame Washalot's water trickling down the side.
    piece(rect(690, 70, 44, 58, 22), C.barkDark, { edge: 'cut' }),
    piece(rect(696, 76, 32, 46, 16), C.candle, FLAT),
    piece(curve([[812, -20], [826, 200], [840, 420], [858, 620], [880, 744], [862, 750], [836, 620], [818, 420], [802, 200], [796, -20]], 2), '#bcd9e6', { rough: 0.8, fibre: '#e6f2f4' }),
    piece(ellipse(884, 754, 52, 12), '#bcd9e6', { edge: 'cut' }),
    // The door in the roots, with steps and a lantern.
    piece(rect(570, 520, 140, 196, 66), C.barkDark, { edge: 'cut' }),
    piece(rect(582, 532, 116, 184, 56), C.brown, { edge: 'cut', fibre: false }),
    ...[0, 1, 2].map((i) => ink([[612 + i * 28, 548], [612 + i * 28, 712]], { width: 3, color: C.brownDark, opacity: 0.6 })),
    piece(circle(676, 624, 7), C.gold, { edge: 'cut' }),
    piece(rect(550, 714, 180, 20, 6), C.stone),
    piece(rect(530, 732, 220, 20, 6), C.stoneLight),
    ink([[724, 520], [740, 520], [740, 540]], { width: 4, color: C.ink }),
    piece(rect(726, 540, 30, 42, 6), C.candle, { edge: 'cut' }),
    piece(rect(726, 534, 30, 8, 3), C.ink, FLAT),
    // The Angry Pixie's window: round-topped, candlelit, a red curtain.
    piece(rect(wx - 62, wy - 76, 124, 146, 54), C.barkDark, { edge: 'cut' }),
    piece(rect(wx - 50, wy - 64, 100, 122, 46), C.candle, FLAT),
    piece(poly([[wx - 50, wy - 40], [wx - 10, wy - 56], [wx - 26, wy + 58], [wx - 50, wy + 58]]), C.red, { edge: 'cut', fibre: false }),
    piece(poly([[wx + 50, wy - 40], [wx + 10, wy - 56], [wx + 26, wy + 58], [wx + 50, wy + 58]]), C.red, { edge: 'cut', fibre: false }),
    piece(rect(wx - 74, wy + 58, 148, 16, 4), C.wood),
    piece(poly([[wx + 18, wy + 58], [wx + 58, wy + 58], [wx + 52, wy + 26], [wx + 24, wy + 26]]), C.rust, { edge: 'cut' }),
    piece(circle(wx + 30, wy + 16, 11), C.orange, { edge: 'cut' }),
    piece(circle(wx + 48, wy + 14, 9), C.yellow, { edge: 'cut' }),
    // The front of the ground.
    piece(curve([[-20, 790], [200, 772], [420, 800], [780, 796], [1000, 772], [1200, 790], [1200, 840], [-20, 840]], 2), C.greenDeep, { rough: 1.4 }),
    ...grass,
  ]);
}

/** One of the Pixie's shutters (each covers half the window when shut). */
function shutterArt(): string {
  return svg({ w: 64, h: 140, name: 'opening-shutter', boil: false }, [
    piece(rect(2, 2, 60, 136, 6), C.greenDark, { edge: 'cut' }),
    ...[0, 1, 2, 3, 4].map((i) => ink([[10, 22 + i * 24], [54, 22 + i * 24]], { width: 3, color: C.woodShade, opacity: 0.7 })),
    piece(circle(50, 70, 4), C.gold, FLAT),
  ]);
}

// --------------------------------------------------- scene 5: the top

/** A soft bank of cloud to peek over (wide, low). */
function cloudBand(seed: number, color: string = C.cloud, shade: string = C.cloudShade): string {
  const r = rng(seed);
  const puffs: Node[] = [];
  // Shaded puffs at the back, bright ones in front, so it reads as a soft heap and not a slab.
  for (let i = 0; i < 8; i++) puffs.push(piece(circle(40 + i * 57, 64 + r() * 12, 34 + r() * 14), shade, { shadow: false }));
  for (let i = 0; i < 9; i++) puffs.push(piece(circle(20 + i * 55, 96 + (i % 2) * 8, 36 + r() * 12), color, { shadow: i % 3 === 0 }));
  for (let i = 0; i < 6; i++) puffs.push(piece(circle(60 + i * 72, 128, 30 + r() * 8), color, { shadow: false }));
  return svg({ w: 480, h: 170, name: 'opening-cloudband' + seed + color, boil: false }, puffs);
}

// --------------------------------------------------- scene 6: the climb

/** The tree from bottom to top, twice the stage's height: it scrolls past as they climb. */
function climbArt(): string {
  const r = rng(77);
  const H = 1640;
  const distant: Node[] = [];
  for (let i = 0; i < 12; i++) distant.push(piece(circle(-20 + i * 110 + r() * 20, H - 260 + (i % 2) * 30, 110), i % 2 ? C.greenDeep : C.leafDark, { shadow: false }));
  const windows: Node[] = [];
  const winAt: Pt[] = [[520, 1150], [680, 900], [540, 640], [690, 420]];
  for (const [x, y] of winAt) {
    windows.push(piece(rect(x - 26, y - 34, 52, 68, 26), C.barkDark, { edge: 'cut' }));
    windows.push(piece(rect(x - 19, y - 27, 38, 54, 19), C.candle, FLAT));
  }
  const clumps: Node[] = [];
  const clumpAt: [number, number, number][] = [[110, 1180, 120], [1060, 980, 130], [120, 760, 110], [1080, 560, 120], [150, 420, 100]];
  for (const [x, y, s] of clumpAt) {
    clumps.push(piece(circle(x, y, s), C.leafDark, { rough: 1.3 }));
    clumps.push(piece(circle(x + s * 0.4, y - s * 0.3, s * 0.6), C.leaf, { rough: 1.3, shadow: false }));
    clumps.push(piece(circle(x - s * 0.5, y + s * 0.2, s * 0.5), C.greenDeep, { rough: 1.3, shadow: false }));
  }
  const puffs: Node[] = [];
  for (let i = 0; i < 14; i++) puffs.push(piece(circle(-30 + i * 92, 300 + (i % 2) * 24 + r() * 16, 80 + r() * 20), i % 3 ? C.cloud : C.cloudShade, { shadow: i % 4 === 0 }));
  return svg({ w: 1180, h: H, name: 'opening-climb', boil: false }, [
    piece(rect(-20, -20, 1220, 600), C.duskHigh, { edge: 'clean', shadow: false }),
    piece(rect(-20, 500, 1220, 500), C.duskSky, { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 940, 1220, 720), C.dusk, { rough: 2, shadow: false, fibre: false }),
    ...[[200, 120], [900, 80], [640, 180], [1080, 200], [80, 240]].map(([x, y]) => dot(x, y, 3, C.cream, 0.8)),
    ...distant,
    piece(curve([[-20, H - 170], [400, H - 200], [800, H - 176], [1200, H - 200], [1200, H + 20], [-20, H + 20]], 2), C.greenDark, { rough: 1.4 }),
    // Branches out to both sides, for hands and feet.
    piece(band([[480, 1240], [300, 1200], [120, 1190]], 40), C.bark),
    piece(band([[700, 1000], [880, 960], [1080, 980]], 40), C.bark),
    piece(band([[480, 780], [300, 760], [110, 770]], 36), C.bark),
    piece(band([[700, 580], [880, 540], [1090, 560]], 36), C.bark),
    piece(band([[480, 440], [320, 410], [150, 420]], 30), C.bark),
    // The trunk, narrowing as it climbs into the cloud.
    piece(curve([[300, H + 20], [420, H - 140], [450, 1100], [480, 600], [500, 200], [690, 200], [710, 600], [740, 1100], [770, H - 140], [890, H + 20]], 2), C.bark),
    piece(band([[530, 220], [520, 700], [500, 1200], [470, H - 100]], 24), C.barkLight, { shadow: false, opacity: 0.45, edge: 'cut' }),
    ink([[650, 240], [664, 700], [690, 1200], [720, H - 120]], { width: 4, color: C.barkDark, opacity: 0.5, wobble: 1.6 }),
    ...windows,
    ...clumps,
    // The cloud at the top of the tree.
    ...puffs,
    piece(rect(-20, -20, 1220, 290), C.cloud, { edge: 'torn', shadow: false, rough: 2 }),
  ]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    moving: { who: 'narrator', text: 'Moving day! A little car, piled high with boxes, putt-putted down a country lane.' },
    home: { who: 'dad', text: 'Here we are! Our new cottage, right at the edge of a deep, dark wood.' },
    explore: { who: 'mum', text: 'Off you all go and explore. Be back in time for tea!' },
    wood: { who: 'narrator', text: 'So off you went with the children, into the Enchanted Wood.' },
    wisha: { who: 'hero', text: 'Listen, {name}! The trees are whispering. Wisha-wisha-wisha!' },
    tree: { who: 'narrator', text: 'And in the middle stood the biggest tree in the world. The Faraway Tree!' },
    snore: { who: 'hero', text: 'Look, little windows! Somebody lives up there. And somebody is snoring!' },
    hello: { who: 'hero', text: 'Hello! Who are you?' },
    glue: { who: 'saucepan', text: 'Glue? I haven’t got any glue! I’m the Saucepan Man!' },
    biscuits: { who: 'silky', text: 'Hello, I’m Silky. Have a pop biscuit! They go pop in your mouth.' },
    pixie: { who: 'pixie', text: 'Who’s that peeping in my window? Go away! Hmph!' },
    moon: { who: 'moonface', text: 'Hello down there! I’m Moon-Face. I live right at the top!' },
    lands: { who: 'moonface', text: 'Every so often, a new land comes to the cloud at the top of our tree.' },
    danger: { who: 'moonface', text: 'Some lands are lovely. Some are dangerous. Never be up there when a land moves on!' },
    what: { who: 'hero', text: 'What was that noise?' },
    wind: { who: 'moonface', text: 'Oh, only the wind, I expect. Ho ho ho!' },
    climb: { who: 'hero', text: 'Come on, {name}! Let’s climb the Faraway Tree!' },
  },

  async play(k) {
    // Each scene's little loops (smoke, snores, drips) stop when the scene changes.
    let scene = 0;
    const loop = (every: number, fn: () => void, first = 0): void => {
      const mine = scene;
      void (async () => {
        await k.wait(first);
        while (scene === mine) {
          fn();
          await k.wait(every);
        }
      })();
    };
    const next = async (build: () => void): Promise<void> => {
      await k.cut(() => {
        scene++;
        build();
      });
    };

    // ================================================ 1. Moving day
    k.backdrop(countryside());
    k.music('cosy');
    k.ambient('dust', { count: 12, area: [0, 0, 1180, 560] });
    // Smoke from the cottage chimney.
    loop(1400, () => k.puff(1012, 360, 70, C.cloud), 300);
    const birds = k.add(birdsArt(), { x: -140, y: 170, w: 120, z: 6 });
    void k.to(birds, 14, { x: 1460, y: -60, ease: 'none' });
    birdsong();

    // The car, with the family in it, starting off the left of the stage.
    const S = 440 / CAR_W;
    const car = k.add(carBack(), { x: 400, y: 380, w: CAR_W * S, h: CAR_H * S, z: 12 });
    const seat = (id: string, cx: number, w: number, z: number, top = 72): HTMLElement => {
      const el = k.character(id, { x: (cx - w / 2) * S, y: top * S, w: w * S, z });
      car.append(el);
      return el;
    };
    const [ia, ib] = AVATARS.filter((x) => x !== k.hero);
    const inCar = {
      a: seat(ia, 160, 104, 2, 88),
      b: seat(ib, 232, 104, 3, 88),
      hero: seat('hero', 196, 112, 4, 80),
      mum: seat('mum', 290, 118, 5, 66),
      dad: seat('dad', 352, 120, 6, 66),
    };
    const front = k.add(carFront(), { x: 0, y: 0, w: CAR_W * S, h: CAR_H * S, z: 10 });
    car.append(front);
    const wheels = k.part(front, 'wheel');
    const spin = k.calm ? null : gsap.to(wheels, { rotation: '+=360', duration: 0.6, repeat: -1, ease: 'steps(6)', transformOrigin: '50% 50%' });
    k.set(car, { x: -900 });
    // A little bounce as it trundles along.
    const bounce = k.calm ? null : gsap.to(car, { y: -5, duration: 0.17, yoyo: true, repeat: -1, ease: 'steps(1)' });

    putter(5);
    const exhaust = () => {
      const x = (parseFloat(car.style.left) || 0) + (gsap.getProperty(car, 'x') as number);
      k.puff(x + 4, 600, 60, C.stoneLight);
    };
    loop(500, exhaust, 200);
    await k.all(k.to(car, 5, { x: 0, ease: 'power2.out' }), k.wait(900).then(() => k.say('moving')));
    spin?.kill();
    bounce?.kill();
    k.set(car, { y: 0 });
    scene++; // stops the exhaust
    loop(1400, () => k.puff(1012, 360, 70, C.cloud));
    parp();
    await k.all(k.hop(inCar.hero, 16), k.wait(120).then(() => k.hop(inCar.a, 14)), k.wait(220).then(() => k.hop(inCar.b, 14)));
    await k.say('home', inCar.dad);
    void k.blink(inCar.mum);
    await k.say('explore', inCar.mum);

    // The children tumble out and run off towards the wood.
    k.fx.boing();
    for (const el of [inCar.hero, inCar.a, inCar.b]) void k.vanish(el, 0.3);
    k.puff(560, 470, 140, C.cloud);
    const out1 = kids(k, { x: 150, y: 400, w: 230 }, { x: 10, y: 390, w: 180 }, { x: 290, y: 396, w: 180 });
    out1.all.forEach((el) => k.set(el, { opacity: 0 }));
    await k.all(...out1.all.map((el, i) => k.wait(i * 120).then(() => k.appear(el, 0.35))));
    k.fx.patter(8, 0.12);
    await k.all(...out1.all.map((el, i) => k.wait(i * 100).then(() => k.walk(el, 1300, 1.6, 4))));

    // ================================================ 2. The Enchanted Wood
    let woodKids!: Kids;
    await next(() => {
      k.landScene(1);
      k.music('magic');
      k.ambient('dust', { count: 30, area: [300, 0, 600, 640] });
      woodKids = kids(k, { x: 450, y: 380, w: 240 }, { x: 250, y: 370, w: 190 }, { x: 700, y: 376, w: 190 });
      woodKids.all.forEach((el) => k.set(el, { opacity: 0 }));
    });
    birdsong();
    await k.all(...woodKids.all.map((el, i) => k.wait(i * 150).then(() => k.enter(el, 'left', 1))));
    await k.say('wood');

    // The old trees begin to whisper, and their breath curls out.
    const curlL = k.add(whisperArt(), { x: 160, y: 330, w: 170, z: 12 });
    const curlR = k.add(whisperArt(), { x: 860, y: 300, w: 170, z: 12, flip: true });
    k.set([curlL, curlR], { opacity: 0 });
    const glowL = k.light(118, 368, 90, { color: '#f4efc0', strength: 0, z: 11 });
    const glowR = k.light(1052, 342, 90, { color: '#f4efc0', strength: 0, z: 11 });
    const whisper = async (): Promise<void> => {
      wisha(3);
      leaves(2.4);
      await k.all(
        k.fade(glowL, 0.5, 0.5),
        k.fade(glowR, 0.5, 0.5),
        k.to(curlL, 1.6, { opacity: 1, x: 50, ease: 'sine.out' }).then(() => k.fade(curlL, 0, 0.5)),
        k.to(curlR, 1.6, { opacity: 1, x: -50, ease: 'sine.out' }).then(() => k.fade(curlR, 0, 0.5)),
      );
      k.set([curlL, curlR], { x: 0 });
      void k.fade(glowL, 0, 0.6);
      void k.fade(glowR, 0, 0.6);
    };
    await whisper();
    // They look one way, then the other.
    k.face(woodKids.hero, true);
    void k.shake(woodKids.a, 4, 2);
    await k.wait(400);
    k.face(woodKids.hero, false);
    void whisper();
    await k.say('wisha', woodKids.hero);
    // Deeper in.
    k.fx.patter(6, 0.14);
    await k.all(k.camera({ zoom: 1.35, x: 610, y: 600 }, 1.6), ...woodKids.all.map((el) => k.to(el, 1.6, { scale: 0.8, y: 80, opacity: 0.4 })));

    // ================================================ 3. The Faraway Tree
    let treeKids!: Kids;
    await next(() => {
      k.backdrop(tree('opening-tree'));
      k.music('magic');
      k.dim(0.18);
      k.ambient('fireflies', { count: 18, area: [0, 260, 1180, 520] });
      // The Folk's little lit windows.
      for (const [x, y, rr] of [[560, 640, 46], [650, 470, 40], [610, 300, 40], [548, 520, 70], [640, 386, 64], [596, 224, 80]]) k.light(x, y, rr, { strength: 0.55, flicker: true });
      treeKids = kids(k, { x: 220, y: 548, w: 170, z: 22 }, { x: 110, y: 556, w: 140, z: 21 }, { x: 360, y: 560, w: 140, z: 21 });
      snapCamera(k, 1.7, 420, 650);
    });
    // Washing water dripping and splashing all the while.
    loop(260, () => {
      const d = k.add(dropArt(), { x: 712 + Math.random() * 40, y: 600, w: 14, z: 8 });
      void k.to(d, 0.7, { y: 170, ease: 'power1.in' }).then(() => k.remove(d));
    });
    loop(1800, splash);
    // Mr Watzisname's snores: Zs floating up from his hammock.
    loop(3000, () => {
      snore();
      const z = k.add(zArt(), { x: 300, y: 400, w: 30, z: 9 });
      void k.to(z, 2.4, { x: 70, y: -120, scale: 1.8, opacity: 0, ease: 'sine.out' }).then(() => k.remove(z));
    }, 2200);
    await k.wait(300);
    k.fx.wind(3);
    // Up, and up, and up the trunk, to the top lost in the cloud.
    await k.all(
      k.say('tree'),
      (async () => {
        await k.camera({ zoom: 1.6, x: 600, y: 480 }, 2.4);
        await k.camera({ zoom: 1.45, x: 596, y: 180 }, 2.4);
      })(),
    );
    k.fx.twinkle();
    await k.camera({}, 1.6);
    void k.hop(treeKids.hero, 30);
    await k.say('snore', treeKids.hero);
    void k.all(...treeKids.all.map((el, i) => k.wait(i * 120).then(() => k.shake(el, 4, 2))));
    await k.wait(700);

    // ================================================ 4. The Folk
    let footKids!: Kids;
    let pan!: HTMLElement;
    let silky!: HTMLElement;
    let pixie!: HTMLElement;
    let shutL!: HTMLElement;
    let shutR!: HTMLElement;
    await next(() => {
      k.backdrop(treeFoot());
      k.music('cosy');
      k.dim(0.12);
      k.light(741, 560, 70, { strength: 0.55, flicker: true });
      k.light(PIXIE_WIN.x, PIXIE_WIN.y, 110, { strength: 0.35, flicker: true });
      k.light(712, 100, 50, { strength: 0.5, flicker: true });
      k.ambient('fireflies', { count: 10, area: [0, 300, 1180, 380] });
      footKids = kids(k, { x: 130, y: 400, w: 240 }, { x: 0, y: 380, w: 190 }, { x: 300, y: 392, w: 190 });
      pixie = k.character('pixie', { x: PIXIE_WIN.x - 78, y: PIXIE_WIN.y - 92, w: 156, z: 7 });
      k.set(pixie, { opacity: 0 });
      shutL = k.add(shutterArt(), { x: PIXIE_WIN.x - 62, y: PIXIE_WIN.y - 72, w: 62, h: 136, z: 8 });
      shutR = k.add(shutterArt(), { x: PIXIE_WIN.x, y: PIXIE_WIN.y - 72, w: 62, h: 136, z: 8, flip: true });
      pan = k.character('saucepan', { x: 800, y: 400, w: 240, z: 15 });
      silky = k.character('silky', { x: 930, y: 130, w: 220, z: 13 });
      k.set([pan, silky], { opacity: 0 });
    });

    // Clank, clank, CLANK: the Saucepan Man comes down the tree.
    k.set(pan, { y: -620, opacity: 1 });
    for (let i = 0; i < 4; i++) {
      clank(2, 0.12);
      await k.to(pan, 0.36, { y: -620 + ((i + 1) * 620) / 4, ease: 'power1.in' });
      void rattle(k, k.part(pan, 'pots'));
    }
    k.fx.thud();
    clank(3, 0.09);
    void k.quake(3);
    await k.pop(pan, 1.06);
    await k.say('hello', footKids.hero);
    // He cups his ear and gets it all wrong.
    void k.to(k.part(pan, 'armR'), 0.3, { rotation: -14 });
    await k.say('glue', pan);
    void k.to(k.part(pan, 'armR'), 0.3, { rotation: 0 });
    clank(4, 0.1);
    void k.shake(pan, 6, 2);
    await k.all(...footKids.all.map((el, i) => k.wait(i * 90).then(() => k.hop(el, 26))));

    // Silky floats down like a feather, with pop biscuits.
    const wings = [...k.part(silky, 'wingL'), ...k.part(silky, 'wingR')];
    const flutter = k.calm ? null : gsap.to(wings, { scaleX: 0.8, duration: 0.17, yoyo: true, repeat: -1, ease: 'steps(1)', transformOrigin: '50% 50%' });
    k.set(silky, { y: -420, opacity: 1 });
    k.fx.twinkle();
    k.sfx.sparkle();
    await k.to(silky, 2, { y: 0, ease: 'sine.out' });
    k.float(silky, 10, 2.4);
    k.sparkle(1040, 260, 10, 120);
    await k.say('biscuits', silky);
    const targets: [HTMLElement, number, number][] = [[footKids.hero, 240, 470], [footKids.a, 90, 450], [footKids.b, 390, 460]];
    // Three biscuits fly to the three children, one after another.
    await k.all(
      ...targets.map(async ([el, tx, ty], i) => {
        await k.wait(i * 300);
        const b = k.prop('popBiscuit', { x: 990, y: 300, w: 70, z: 30 });
        k.fx.whizz();
        await k.to(b, 0.6, { x: tx - 990, y: ty - 300, rotation: 360, ease: 'power1.inOut' });
        popBiscuit(i);
        k.sparkle(tx + 35, ty + 35, 10, 80);
        void k.vanish(b, 0.2);
        await k.hop(el, 22);
      }),
    );
    flutter?.kill();

    // Somebody peeps in the Pixie's window…
    await k.walk(footKids.hero, 120, 0.8, 2);
    await k.to(footKids.hero, 0.4, { rotation: 8 });
    await k.wait(300);
    k.fx.creak();
    k.set([shutL, shutR], { transformOrigin: '0% 50%' });
    k.set(shutR, { transformOrigin: '100% 50%' });
    // …the shutters bang open and out he pops.
    void k.to(shutL, 0.15, { x: -58, scaleX: 0.5, ease: 'power2.out' });
    void k.to(shutR, 0.15, { x: 58, scaleX: 0.5, ease: 'power2.out' });
    k.set(pixie, { opacity: 1 });
    await k.appear(pixie, 0.25);
    void k.to(footKids.hero, 0.25, { rotation: -6, x: '-=50' });
    const puffs = k.part(pixie, 'puff');
    if (!k.calm) gsap.to(puffs, { scale: 1.3, duration: 0.17, yoyo: true, repeat: 7, ease: 'steps(1)', transformOrigin: '50% 50%' });
    void k.shake(pixie, 5, 2);
    await k.say('pixie', pixie);
    // SLAM!
    void k.vanish(pixie, 0.15);
    await k.all(k.to(shutL, 0.1, { x: 0, scaleX: 1, ease: 'power3.in' }), k.to(shutR, 0.1, { x: 0, scaleX: 1, ease: 'power3.in' }));
    slam();
    void k.quake(6);
    k.puff(PIXIE_WIN.x, PIXIE_WIN.y + 60, 120, C.stoneLight);
    // The bang rattles every pot on the Saucepan Man, and everyone jumps.
    clank(5, 0.08);
    void k.shake(pan, 8, 3);
    await k.all(k.to(footKids.hero, 0.3, { rotation: 0 }), ...footKids.all.map((el) => k.hop(el, 40)));
    await k.wait(300);

    // ================================================ 5. Moon-Face and the lands
    let mf!: HTMLElement;
    let topKids!: Kids;
    let veil!: HTMLElement;
    await next(() => {
      k.backdrop(tree('opening-top'));
      k.music('magic');
      k.dim(0.15);
      k.ambient('stars', { count: 18, area: [0, 0, 1180, 140], z: 4 });
      k.light(596, 224, 110, { strength: 0.5, flicker: true });
      topKids = kids(k, { x: 220, y: 548, w: 170, z: 22 }, { x: 110, y: 556, w: 140, z: 21 }, { x: 360, y: 560, w: 140, z: 21 });
      mf = k.character('moonface', { x: 511, y: 150, w: 170, z: 11 });
      k.add(cloudBand(3), { x: 436, y: 258, w: 320, z: 12, still: true });
      veil = k.add(cloudBand(5, C.slate, C.charcoal), { x: 150, y: -40, w: 880, z: 9, still: true });
      k.set(veil, { opacity: 0 });
      k.set(mf, { y: 130 });
      snapCamera(k, 1.7, 596, 240);
    });
    // Up he comes, beaming over the cloud.
    k.sfx.sparkle();
    await k.to(mf, 1, { y: 0, ease: 'back.out(1.4)' });
    const mfGlow = k.light(600, 215, 130, { color: '#fff3c0', strength: 0.4, z: 10 });
    void k.blink(mf);
    await k.say('moon', mf);
    // A land arrives in the cloud: a lovely one, all sweets and lemonade.
    void k.camera({ zoom: 1.3, x: 590, y: 200 }, 1.4);
    const lovely = k.landFar(3, { x: 290, y: 4, w: 600, z: 6 });
    k.set(lovely, { opacity: 0, y: 60 });
    landArrives();
    void k.to(lovely, 1.2, { opacity: 1, y: 0, ease: 'sine.out' });
    await k.say('lands', mf);
    k.sparkle(590, 90, 12, 200);
    k.fx.twinkle();
    // It moves on, and a giant's land comes instead (boots that could squash you!).
    landLeaves();
    await k.to(lovely, 0.6, { x: -900, ease: 'power2.in' });
    k.remove(lovely);
    const giants = k.landFar(6, { x: 290, y: 4, w: 600, z: 6 });
    k.set(giants, { x: 900 });
    landArrives();
    await k.to(giants, 0.6, { x: 0, ease: 'power2.out' });
    k.fx.stomp(2, 0.5);
    void k.quake(3);
    void k.shake(mf, 4, 2);
    await k.say('danger', mf);
    landLeaves();
    await k.to(giants, 0.6, { x: -900, ease: 'power2.in' });
    k.remove(giants);

    // Back out to see the whole tree… and the cloud goes dark for a moment.
    await k.camera({}, 1.2);
    k.music('spooky');
    k.fx.rumble(2);
    const dark = k.dim(0, '#0b1030');
    await k.all(k.fade(veil, 0.9, 0.8), k.fade(dark, 0.3, 0.8), k.fade(mfGlow, 0.1, 0.8));
    clacks(4, 0.42);
    await k.all(...topKids.all.map((el, i) => k.wait(i * 100).then(() => k.shake(el, 4, 3))), k.wait(1500));
    // Gone. Everyone looks at each other.
    await k.all(k.fade(veil, 0, 0.8), k.fade(dark, 0, 0.8), k.fade(mfGlow, 0.4, 0.8));
    k.music('cosy');
    await k.say('what', topKids.hero);
    await k.say('wind', mf);
    // Everyone laughs it off.
    k.fx.boing();
    await k.all(k.hop(mf, 30, 2), ...topKids.all.map((el, i) => k.wait(i * 120).then(() => k.hop(el, 30, 2))));

    // ================================================ 6. The climb
    let climb!: HTMLElement;
    let upKids!: Kids;
    let topFace!: HTMLElement;
    let topCloud!: HTMLElement;
    await next(() => {
      climb = k.add(climbArt(), { x: 0, y: -820, w: 1180, h: 1640, z: 1, still: true });
      k.music('adventure');
      k.ambient('fireflies', { count: 12, area: [0, 200, 1180, 480] });
      upKids = kids(k, { x: 420, y: 380, w: 250 }, { x: 230, y: 380, w: 200 }, { x: 680, y: 384, w: 200 });
      // Moon-Face waits at the top, out of sight for now.
      topFace = k.character('moonface', { x: 500, y: -820 + 110, w: 180, z: 3 });
      topCloud = k.add(cloudBand(9), { x: 400, y: -820 + 250, w: 380, z: 4, still: true });
    });
    k.sfx.sparkle();
    await k.hop(upKids.hero, 36);
    await k.say('climb', upKids.hero);
    k.sfx.fanfare();

    // Up they go: hand over hand, and the tree slides by.
    k.fx.patter(12, 0.2);
    const scramble = async (): Promise<void> => {
      for (let i = 0; i < 6; i++) {
        await k.all(
          ...upKids.all.map((el, j) => k.to(el, 0.3, { y: (i + j) % 2 ? -14 : 6, rotation: (i + j) % 2 ? -4 : 4, ease: 'none' })),
        );
      }
    };
    await k.all(
      k.to(climb, 5, { y: 820 - 100, ease: 'sine.inOut' }),
      k.to([topFace, topCloud], 5, { y: 820 - 100, ease: 'sine.inOut' }),
      // They gather on the trunk as they climb: one behind the other.
      k.to(upKids.a, 1.6, { x: 120, y: -40 }),
      k.to(upKids.b, 1.6, { x: -150, y: 40 }),
      scramble(),
    );
    k.set(upKids.all, { rotation: 0 });
    // Moon-Face beams down from the cloud.
    k.light(590, 250, 160, { color: '#fff3c0', strength: 0.4 });
    k.fx.jingle();
    k.sparkle(590, 220, 18, 260);
    await k.all(k.hop(topFace, 20, 2), ...upKids.all.map((el, i) => k.wait(i * 120).then(() => k.hop(el, 24, 1))));
    await k.wait(1400);
  },
});
