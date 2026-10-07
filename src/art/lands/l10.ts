/**
 * Land 10: Dame Snap's Prison. The big finale, and the scariest place in
 * the game (scary, never gory): a stone hall under a huge pale moon seen
 * through a barred window, a corridor stretching away into the dark with
 * her rules nailed up all along the walls, chains and keys hanging from
 * hooks, cold lanterns, and iron bars across the front. Ink-black,
 * chalk-white and ruler-red.
 */
import { C } from '../palette';
import { band, circle, ellipse, group, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, flat, sceneSvg, star } from './common';

const COLD = '#c9d6c2';

/** A hanging chain of links from (x, y) down by len. */
function chain(x: number, y: number, len: number, s = 1): Node[] {
  const out: Node[] = [];
  for (let d = 0, i = 0; d < len; d += 16 * s, i++) {
    out.push(piece(i % 2 ? ellipse(x, y + d, 4 * s, 10 * s) : ellipse(x, y + d, 7 * s, 10 * s), C.ironLight, { edge: 'cut', fibre: false }));
    if (i % 2 === 0) out.push(piece(ellipse(x, y + d, 3 * s, 6 * s), C.prisonWall, { edge: 'clean', shadow: false }));
  }
  return out;
}

/** One of her rules on the wall: a nailed-up card with lines of writing and a red underline. */
function rule(x: number, y: number, w: number, h: number, tilt: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [
    piece(rect(x, y, w, h, 2), C.chalk, { rough: 0.8 }),
    piece(circle(x + w / 2, y + 6, 3), C.ironLight, { edge: 'clean', shadow: false }),
    // A big number at the top, then scribbled lines of rules.
    ink([[x + w * 0.42, y + h * 0.18], [x + w * 0.5, y + h * 0.12], [x + w * 0.5, y + h * 0.34]], { width: 3, color: C.snapInk }),
  ];
  for (let k = 0; k < 3; k++) {
    const ly = y + h * (0.48 + k * 0.15);
    out.push(ink([[x + w * 0.12, ly], [x + w * (0.6 + r() * 0.28), ly + (r() - 0.5) * 3]], { width: 2.5, color: C.snapInk, opacity: 0.8 }));
  }
  out.push(ink([[x + w * 0.1, y + h * 0.92], [x + w * 0.9, y + h * 0.9]], { width: 3, color: C.ruler }));
  return [group({ transform: `rotate(${tilt} ${x + w / 2} ${y})` }, out)];
}

/** A cold lantern on a bracket. */
function lantern(x: number, y: number, s: number): Node[] {
  return [
    piece(circle(x, y + 30 * s, 70 * s), COLD, { ...flat, opacity: 0.12 }),
    piece(band([[x - 30 * s, y - 10 * s], [x, y - 14 * s]], 5 * s), C.iron, { edge: 'cut' }),
    ink([[x, y - 14 * s], [x, y]], { width: 2 * s, color: C.iron }),
    piece(poly([[x - 12 * s, y], [x + 12 * s, y], [x + 16 * s, y + 10 * s], [x - 16 * s, y + 10 * s]]), C.iron, { edge: 'cut' }),
    piece(rect(x - 12 * s, y + 10 * s, 24 * s, 34 * s, 3), COLD, { edge: 'cut', fibre: false }),
    piece(rect(x - 1.5 * s, y + 10 * s, 3 * s, 34 * s), C.iron, { edge: 'clean', shadow: false }),
    piece(rect(x - 16 * s, y + 44 * s, 32 * s, 8 * s), C.iron, { edge: 'cut' }),
  ];
}

/** A bunch of big iron keys on a ring. */
function keys(x: number, y: number, s: number): Node[] {
  const key = (a: number): Node[] => {
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const at = (d: number, o = 0): Pt => [x + c * d - sn * o, y + 18 * s + sn * d + c * o];
    return [
      piece(band([at(10 * s), at(54 * s)], 5 * s), C.goldLight, { edge: 'cut' }),
      piece(poly([at(44 * s, 0), at(44 * s, 10 * s), at(52 * s, 10 * s), at(52 * s, 0)]), C.goldLight, { edge: 'cut', fibre: false }),
    ];
  };
  return [
    ink([[x, y - 20 * s], [x, y]], { width: 2, color: C.iron }),
    piece(circle(x, y + 10 * s, 12 * s), C.gold, { edge: 'cut' }),
    piece(circle(x, y + 10 * s, 7 * s), C.prisonWall, { edge: 'clean', shadow: false }),
    ...key(Math.PI * 0.4),
    ...key(Math.PI * 0.55),
    ...key(Math.PI * 0.7),
  ];
}

export function farNodes(): Node[] {
  const base = farBase('#3e3a44', 1001, { cloud: '#8e8a94', shade: '#5c5866' });
  return [
    // A pale moon behind, and a storm cloud.
    piece(circle(470, 40, 30), C.moonPale, { edge: 'cut' }),
    cloud(250, 48, 230, 3, '#2a2732', 0.9),
    ...base.back,
    // The prison: a squat black keep with towers and barred windows (scaled to sit inside the box).
    group({ transform: 'translate(60 32) scale(0.8)' }, [
      piece(rect(170, 60, 260, 86), C.prisonWall),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => piece(rect(170 + i * 34, 48, 20, 16), C.prisonWall, { edge: 'cut' })),
      piece(rect(140, 30, 50, 116), C.prisonStone),
      piece(rect(410, 30, 50, 116), C.prisonStone),
      piece(poly([[134, 32], [165, -6], [196, 32]]), C.iron),
      piece(poly([[404, 32], [435, -6], [466, 32]]), C.iron),
      ...[200, 250, 350, 400].map((x) => piece(rect(x, 80, 16, 26, 8), COLD, { edge: 'cut' })),
      ...[200, 250, 350, 400].flatMap((x) => [0, 1].map((k) => piece(rect(x + 4 + k * 6, 80, 2, 26), C.iron, { edge: 'clean', shadow: false }))),
      piece(rect(276, 96, 48, 50, 24), C.iron, { edge: 'cut' }),
      ...[0, 1, 2, 3].map((k) => piece(rect(282 + k * 11, 96, 3, 50), C.ironLight, { edge: 'clean', shadow: false })),
      piece(rect(286, 74, 28, 12, 2), C.ruler, { edge: 'cut' }),
    ]),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'Dame Snap’s Prison');

export function landScene(name: string): string {
  const r = rng(101);
  // The vanishing point of the long corridor.
  const vx = 640;
  const vy = 380;
  const stones: Node[] = [];
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 7; col++) {
      const x = -20 + col * 180 + (row % 2) * 90;
      const y = -10 + row * 56;
      stones.push(piece(rect(x, y, 170, 50, 6), row % 2 ? C.prisonWall : '#423d4a', { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }));
    }
  }
  // The corridor opening: walls rushing away to a dark point, with rules on both sides.
  const corridor: Node[] = [
    piece(poly([[440, 160], [840, 160], [840, 640], [440, 640]]), C.prisonNight, { edge: 'cut' }),
    piece(poly([[440, 160], [vx - 40, vy - 30], [vx - 40, vy + 40], [440, 640]]), '#2c2933', { edge: 'clean', shadow: false }),
    piece(poly([[840, 160], [vx + 40, vy - 30], [vx + 40, vy + 40], [840, 640]]), '#2c2933', { edge: 'clean', shadow: false }),
    piece(poly([[440, 640], [vx - 40, vy + 40], [vx + 40, vy + 40], [840, 640]]), '#24212a', { edge: 'clean', shadow: false }),
    piece(rect(vx - 40, vy - 30, 80, 70), '#0c0b10', { edge: 'clean', shadow: false }),
    // A far glimmer of a lantern deep inside.
    piece(circle(vx, vy + 4, 10), COLD, { ...flat, opacity: 0.5 }),
  ];
  // Rules shrinking into the distance along each wall.
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const k = 1 - t * 0.78;
    const lx = 440 + (vx - 40 - 440) * t;
    const rx = 840 + (vx + 40 - 840) * t;
    const y = 260 + (vy - 20 - 260) * t;
    corridor.push(...rule(lx + 8 * k, y, 46 * k, 60 * k, -3, 200 + i));
    corridor.push(...rule(rx - 54 * k, y, 46 * k, 60 * k, 3, 300 + i));
  }
  // The arch round the corridor mouth.
  const arch: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    const ax = 640 + Math.cos(a) * 220;
    const ay = 200 + Math.sin(a) * 90;
    arch.push(piece(rect(ax - 26, ay - 22, 52, 44, 5), C.prisonStone, { edge: 'cut' }));
  }
  const floor: Node[] = [];
  for (let i = -6; i <= 6; i++) floor.push(ink([[vx + i * 30, vy + 40], [vx + i * 240, 840]], { width: 2, color: C.ink, opacity: 0.35 }));
  for (const y of [670, 720, 790]) floor.push(ink([[-20, y], [1200, y]], { width: 2, color: C.ink, opacity: 0.3 }));
  // Iron bars across the front edges (the cell we're looking out of).
  const bars: Node[] = [];
  for (const x of [30, 100, 170, 1010, 1080, 1150]) bars.push(piece(rect(x - 9, -20, 18, 860, 4), C.iron, { rough: 0.6 }));
  bars.push(piece(rect(-20, 100, 230, 20, 3), C.iron, { rough: 0.6 }));
  bars.push(piece(rect(990, 100, 230, 20, 3), C.iron, { rough: 0.6 }));
  bars.push(piece(rect(-20, 600, 230, 20, 3), C.iron, { rough: 0.6 }));
  bars.push(piece(rect(990, 600, 230, 20, 3), C.iron, { rough: 0.6 }));
  // Rivets.
  for (const x of [30, 100, 170, 1010, 1080, 1150]) for (const y of [110, 610]) bars.push(piece(circle(x, y, 5), C.ironLight, { edge: 'clean', shadow: false }));
  const dust: Node[] = [];
  for (let i = 0; i < 20; i++) dust.push(piece(circle(r() * 1180, r() * 820, 1.5 + r() * 1.5), C.moonPale, { ...flat, opacity: 0.4 }));

  return sceneSvg(name, [
    piece(rect(-20, -20, 1220, 860), C.prisonNight, { edge: 'clean', shadow: false }),
    ...stones,
    // The high barred window with the spooky moon, clouds drifting across it.
    piece(rect(150, 40, 200, 170, 90), '#1c2236', { edge: 'cut' }),
    piece(circle(250, 120, 66), C.moonPale, { edge: 'cut' }),
    piece(circle(228, 104, 12), '#cfcbb4', { ...flat }),
    piece(circle(274, 140, 9), '#cfcbb4', { ...flat }),
    piece(circle(260, 96, 6), '#cfcbb4', { ...flat }),
    cloud(240, 150, 200, 4, '#3a3a52', 0.9),
    piece(star(330, 70, 5), C.cream, flat),
    ...[190, 230, 270, 310].map((x) => piece(rect(x - 4, 40, 8, 170), C.iron, { edge: 'cut' })),
    piece(rect(150, 120, 200, 8), C.iron, { edge: 'cut' }),
    piece(rect(140, 204, 220, 16, 3), C.prisonStone),
    // Moonlight falling across the floor.
    piece(poly([[180, 220], [330, 220], [620, 820], [260, 820]]), C.moonPale, { ...flat, opacity: 0.08 }),
    // The corridor and its arch.
    ...corridor,
    ...arch,
    // More rules on the walls of this hall.
    ...rule(900, 200, 90, 110, 4, 401),
    ...rule(370, 320, 60, 76, -5, 402),
    ...rule(880, 360, 70, 86, -3, 403),
    // The floor.
    piece(rect(-20, 640, 1220, 220), '#2a2730', { rough: 0.8 }),
    ...floor,
    // Chains hanging from the ceiling, keys on a hook, lanterns.
    ...chain(300, -10, 300),
    ...chain(940, -10, 170),
    piece(circle(940, 166, 14), C.ironLight, { edge: 'cut' }),
    piece(circle(940, 166, 8), C.prisonWall, { edge: 'clean', shadow: false }),
    ...keys(380, 470, 1),
    ...lantern(470, 150, 1),
    ...lantern(820, 150, 1),
    // Her stool and a rule book left open, a snapped piece of chalk.
    piece(ellipse(760, 720, 70, 16), C.iron),
    piece(rect(704, 722, 10, 70), C.iron, { edge: 'cut' }),
    piece(rect(806, 722, 10, 70), C.iron, { edge: 'cut' }),
    piece(poly([[700, 714], [758, 700], [758, 712], [700, 724]]), C.chalk, { edge: 'cut' }),
    piece(poly([[820, 714], [762, 700], [762, 712], [820, 724]]), C.chalk, { edge: 'cut' }),
    piece(rect(600, 780, 30, 10, 3), C.chalk, { edge: 'cut' }),
    piece(rect(636, 786, 18, 10, 3), C.chalk, { edge: 'cut' }),
    ...dust,
    ...bars,
  ]);
}
