/**
 * Land 7: the Land of Spells. The Enchanter's land under a deep violet,
 * starry sky: a crooked tower with a starry pointed roof and glowing
 * windows, a crescent moon, glowing toadstools and big potion bottles
 * bubbling on the ground. A little eerie (this is where Dame Snap strikes
 * her deal), but beautiful.
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { crescent, farBase, farSvg, flat, hills, sceneSvg, sky, star, stars, toadstool } from './common';

const GLOW = '#e4d38a';

/** The Enchanter's tower: crooked, tapering, with a starry pointed roof. */
function tower(cx: number, baseY: number, s: number): Node[] {
  const h = 520 * s;
  const w = 130 * s;
  const lean = 30 * s;
  const top = baseY - h;
  const out: Node[] = [
    piece(curve([[cx - w * 0.6, baseY], [cx - w * 0.5, baseY - h * 0.5], [cx - w * 0.42 + lean, top], [cx + w * 0.42 + lean, top], [cx + w * 0.5, baseY - h * 0.5], [cx + w * 0.6, baseY]], 1), C.slate, { rough: 0.8 }),
    // A balcony round the top.
    piece(ellipse(cx + lean, top + 10 * s, w * 0.62, 16 * s), C.nightLight),
    // The roof, a tall witch-hat cone with a crook at the tip.
    piece(poly([[cx - w * 0.62 + lean, top + 4], [cx + lean * 1.6, top - 200 * s], [cx + lean * 2.6, top - 230 * s], [cx + lean * 1.9, top - 190 * s], [cx + w * 0.62 + lean, top + 4]]), C.spellViolet, { rough: 0.8 }),
    piece(star(cx + lean * 1.2, top - 60 * s, 10 * s), C.goldLight, flat),
    piece(star(cx + lean * 0.4, top - 30 * s, 7 * s), C.goldLight, flat),
    piece(star(cx + lean * 1.8, top - 120 * s, 8 * s), C.goldLight, flat),
    piece(circle(cx + lean * 2.6, top - 230 * s, 8 * s), C.goldLight, { edge: 'cut' }),
    // Stones.
    ...[0.2, 0.45, 0.7].map((k) => ink([[cx - w * 0.5 + lean * (1 - k), baseY - h * k], [cx + w * 0.5 + lean * (1 - k), baseY - h * k + 6 * s]], { width: 3 * s, color: C.charcoal, opacity: 0.5 })),
    // The door.
    piece(rect(cx - 26 * s, baseY - 90 * s, 52 * s, 90 * s, 26 * s), C.plum, { edge: 'cut' }),
    piece(circle(cx + 12 * s, baseY - 44 * s, 4 * s), C.goldLight, { edge: 'clean', shadow: false }),
  ];
  // Glowing windows climbing round the tower.
  const wins: [number, number][] = [[-0.2, 0.32], [0.24, 0.5], [-0.14, 0.68], [0.18, 0.86]];
  for (const [dx, k] of wins) {
    const wx = cx + dx * w + lean * k;
    const wy = baseY - h * k;
    out.push(piece(rect(wx - 12 * s, wy - 22 * s, 24 * s, 40 * s, 12 * s), GLOW, { edge: 'cut' }));
    out.push(piece(circle(wx, wy, 26 * s), GLOW, { ...flat, opacity: 0.2 }));
  }
  return out;
}

/** A potion bottle: round, square or tall, glowing, with a cork and bubbles. */
function bottle(x: number, baseY: number, h: number, glass: string, potion: string, shape: 'round' | 'tall' | 'square'): Node[] {
  const w = h * (shape === 'tall' ? 0.36 : shape === 'square' ? 0.6 : 0.7);
  const body: Pt[] =
    shape === 'round'
      ? curve([[x - w * 0.15, baseY - h * 0.75], [x - w * 0.6, baseY - h * 0.5], [x - w * 0.55, baseY], [x + w * 0.55, baseY], [x + w * 0.6, baseY - h * 0.5], [x + w * 0.15, baseY - h * 0.75]], 2)
      : rect(x - w / 2, baseY - h * 0.72, w, h * 0.72, w * 0.18);
  const level = shape === 'round' ? baseY - h * 0.42 : baseY - h * 0.5;
  return [
    piece(ellipse(x, baseY - h * 0.3, w * 0.9, h * 0.4), potion, { ...flat, opacity: 0.18 }),
    piece(body, glass, { rough: 0.6, opacity: 0.85 }),
    piece(rect(x - w * 0.42, level, w * 0.84, baseY - level - 4, 6), potion, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(x - w * 0.14, baseY - h * 0.94, w * 0.28, h * 0.24, 3), glass, { edge: 'cut', opacity: 0.85 }),
    piece(rect(x - w * 0.16, baseY - h, w * 0.32, h * 0.1, 3), C.tan, { edge: 'cut' }),
    piece(ellipse(x - w * 0.24, baseY - h * 0.5, w * 0.06, h * 0.12), C.white, { ...flat, opacity: 0.6 }),
    piece(circle(x + w * 0.1, level - h * 0.06, h * 0.03), C.white, { ...flat, opacity: 0.8 }),
    piece(circle(x - w * 0.05, level - h * 0.14, h * 0.02), C.white, { ...flat, opacity: 0.7 }),
    // A little label tied on with string.
    piece(rect(x - w * 0.26, baseY - h * 0.34, w * 0.4, h * 0.14, 2), C.cream, { edge: 'cut' }),
  ];
}

/** A magic swirl of sparkles. */
function swirl(cx: number, cy: number, r: number, color: string): Node[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 3;
    pts.push([cx + Math.cos(a) * r * (i / 40), cy - i * r * 0.04 + Math.sin(a) * r * 0.4 * (i / 40)]);
  }
  return [ink(pts, { width: 3, color, opacity: 0.7 }), piece(star(pts[40][0], pts[40][1], 9), color, flat)];
}

export function farNodes(): Node[] {
  const base = farBase(C.spellViolet, 701, { cloud: '#d9d2ea', shade: '#a99cc8' });
  return [
    ...stars(12, 7, 600, 60, [C.goldLight, C.spellGlow]),
    ...base.back,
    ...tower(300, 140, 0.22),
    ...bottle(150, 144, 40, C.spellGlow, C.teal, 'round'),
    ...bottle(190, 144, 46, C.spellGlow, C.topsyPink, 'tall'),
    ...bottle(420, 144, 36, C.spellGlow, C.gold, 'square'),
    ...toadstool(470, 146, 18, C.spellGlow),
    ...toadstool(110, 146, 14, C.spellGlow),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Spells');

export function landScene(name: string): string {
  const r = rng(71);
  const fireflies: Node[] = [];
  for (let i = 0; i < 18; i++) fireflies.push(piece(circle(r() * 1180, 420 + r() * 300, 3 + r() * 2), GLOW, { ...flat, opacity: 0.8 }));
  return sceneSvg(name, [
    ...sky([
      [C.spellNight, 0],
      ['#33295e', 280],
      ['#4a3a78', 460],
    ]),
    ...stars(80, 72, 1180, 460, [C.cream, C.goldLight, C.spellGlow]),
    ...crescent(980, 130, 60, C.moonPale, C.spellNight),
    // Faraway spiky hills.
    piece(poly([[-20, 560], [80, 470], [160, 520], [260, 430], [360, 510], [460, 450], [560, 520], [700, 440], [820, 510], [940, 420], [1060, 500], [1200, 450], [1200, 600], [-20, 600]]), '#3a2f63', { rough: 1.2 }),
    hills(570, 30, '#2f2652', 73),
    ...tower(820, 646, 0.8),
    ...swirl(560, 330, 80, C.spellGlow),
    ...swirl(1080, 420, 50, C.goldLight),
    // The ground: moss in deep violet.
    hills(640, 20, '#3d2f5c', 74, { step: 80 }),
    // Stepping stones up to the Enchanter's door, each with a faint glow.
    ...[[800, 790, 64], [760, 730, 50], [800, 686, 40], [826, 656, 30]].flatMap(([x, y, w]) => [
      piece(ellipse(x, y, w, w * 0.32), '#6a5a8c', { rough: 0.8 }),
      piece(ellipse(x, y - 2, w * 0.7, w * 0.18), C.spellGlow, { ...flat, opacity: 0.25 }),
    ]),
    ...fireflies,
    // Glowing toadstools.
    ...toadstool(560, 700, 50, C.spellGlow),
    ...toadstool(620, 720, 34, C.teal),
    ...toadstool(1080, 760, 60, C.spellGlow),
    // A twisted bare tree on the left with a lantern.
    piece(band([[120, 700], [160, 500], [110, 330], [160, 200]], 40), C.charcoal, { rough: 0.9 }),
    piece(band([[150, 460], [240, 400], [300, 400]], 14), C.charcoal, { edge: 'cut' }),
    piece(band([[130, 360], [60, 300], [40, 250]], 12), C.charcoal, { edge: 'cut' }),
    ink([[290, 400], [290, 430]], { width: 2, color: C.ink }),
    piece(rect(278, 430, 24, 34, 6), GLOW, { edge: 'cut' }),
    piece(circle(290, 448, 36), GLOW, { ...flat, opacity: 0.18 }),
    // Potion bottles in the front, glowing.
    ...bottle(260, 800, 150, C.spellGlow, C.teal, 'round'),
    ...bottle(380, 790, 190, C.spellGlow, C.topsyPink, 'tall'),
    ...bottle(470, 810, 110, C.spellGlow, C.gold, 'square'),
    ...bottle(1000, 810, 130, C.spellGlow, C.green, 'round'),
    ...bottle(80, 810, 120, C.spellGlow, C.purple, 'tall'),
    // A spell book open on a stone.
    piece(ellipse(720, 806, 110, 26), C.slate),
    piece(poly([[640, 790], [716, 776], [716, 796], [640, 806]]), C.cream, { edge: 'cut' }),
    piece(poly([[796, 790], [722, 776], [722, 796], [796, 806]]), C.cream, { edge: 'cut' }),
    ink([[654, 792], [704, 784]], { width: 2, color: C.plum, opacity: 0.6 }),
    ink([[736, 784], [782, 792]], { width: 2, color: C.plum, opacity: 0.6 }),
    piece(star(720, 750, 10), C.goldLight, flat),
  ]);
}
