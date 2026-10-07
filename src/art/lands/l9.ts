/**
 * Land 9: the Land of Snow. Blue-white and hushed: soft snowdrifts,
 * snow-laden firs, a frozen pond, snowflakes hanging still in the air and
 * a frozen clock tower hung with icicles, its clock stuck at a quarter
 * past eleven (useful for telling the time).
 */
import { C } from '../palette';
import { circle, curve, ellipse, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, firTree, flat, hills, sceneSvg, sky } from './common';

/** A row of icicles hanging under an edge from x0 to x1 at y. */
function icicles(x0: number, x1: number, y: number, len: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let x = x0; x < x1; x += len * 0.4) {
    const l = len * (0.4 + r() * 0.7);
    out.push(piece(poly([[x, y], [x + len * 0.3, y], [x + len * 0.15, y + l]]), C.ice, { edge: 'cut', fibre: C.white }));
  }
  return out;
}

/** A snow cap lying along the top of a shape (a soft lumpy strip). */
function snowCap(x0: number, x1: number, y: number, depth: number): Node {
  const pts: Pt[] = [[x0 - 6, y + depth * 0.4]];
  const n = Math.max(3, Math.round((x1 - x0) / 30));
  for (let i = 0; i <= n; i++) pts.push([x0 + (i / n) * (x1 - x0), y - depth * (0.4 + (i % 2) * 0.3)]);
  pts.push([x1 + 6, y + depth * 0.4]);
  for (let i = n; i >= 0; i--) pts.push([x0 + (i / n) * (x1 - x0), y + depth * (0.6 + ((i + 1) % 2) * 0.5)]);
  return piece(curve(pts, 1), C.snow, { rough: 0.7 });
}

/** The frozen clock tower. Hands stuck at a quarter past eleven. */
function clockTower(cx: number, baseY: number, s: number): Node[] {
  const w = 150 * s;
  const h = 440 * s;
  const top = baseY - h;
  const face = top + 90 * s;
  return [
    piece(rect(cx - w / 2, top, w, h), '#8fa6b8', { rough: 0.7 }),
    ...[0.3, 0.55, 0.8].map((k) => ink([[cx - w / 2, top + h * k], [cx + w / 2, top + h * k]], { width: 3 * s, color: '#6d8496', opacity: 0.6 })),
    piece(poly([[cx - w * 0.62, top + 6], [cx, top - 150 * s], [cx + w * 0.62, top + 6]]), C.blueDark, { rough: 0.7 }),
    piece(poly([[cx - w * 0.3, top - 70 * s], [cx, top - 150 * s], [cx + w * 0.3, top - 70 * s], [cx + w * 0.1, top - 60 * s], [cx - w * 0.14, top - 66 * s]]), C.snow, { edge: 'cut' }),
    snowCap(cx - w * 0.64, cx + w * 0.64, top + 6, 12 * s),
    // The clock face, frosted over.
    piece(circle(cx, face, 52 * s), C.cream, { edge: 'cut' }),
    piece(circle(cx, face, 52 * s), C.ice, { ...flat, opacity: 0.3 }),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return piece(circle(cx + Math.sin(a) * 42 * s, face - Math.cos(a) * 42 * s, (i % 3 ? 3 : 5) * s), C.ink, { edge: 'clean', shadow: false });
    }),
    ink([[cx, face], [cx + 36 * s, face]], { width: 5 * s, color: C.ink }),
    ink([[cx, face], [cx + 26 * s * Math.sin((337.5 * Math.PI) / 180), face - 26 * s * Math.cos((337.5 * Math.PI) / 180)]], { width: 7 * s, color: C.ink }),
    piece(circle(cx, face, 5 * s), C.ink, { edge: 'clean', shadow: false }),
    // A frozen arched window and door.
    piece(rect(cx - 20 * s, top + 180 * s, 40 * s, 64 * s, 20 * s), C.blueDark, { edge: 'cut' }),
    piece(rect(cx - 34 * s, baseY - 100 * s, 68 * s, 100 * s, 34 * s), C.blueDark, { edge: 'cut' }),
    ...icicles(cx - w / 2, cx + w / 2, top + 150 * s, 40 * s, 91),
    ...icicles(cx - 36 * s, cx + 36 * s, baseY - 100 * s, 30 * s, 92),
  ];
}

/** A snowflake: six little spokes. */
function flake(x: number, y: number, s: number, opacity: number): Node {
  const pts: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    pts.push([x, y], [x + Math.cos(a) * s, y + Math.sin(a) * s]);
  }
  return ink(pts, { width: 2, color: C.white, opacity, wobble: 0.2 });
}

export function farNodes(): Node[] {
  const base = farBase(C.snow, 901, { cloud: '#e4edf2', shade: C.snowShade });
  return [
    ...base.back,
    ...firTree(80, 146, 70, C.greenDeep, C.barkDark, C.snow),
    ...firTree(130, 142, 90, C.woodShade, C.barkDark, C.snow),
    ...clockTower(300, 140, 0.24),
    ...firTree(420, 142, 86, C.greenDeep, C.barkDark, C.snow),
    ...firTree(480, 146, 66, C.woodShade, C.barkDark, C.snow),
    piece(ellipse(210, 140, 40, 8), C.ice, { edge: 'cut' }),
    piece(ellipse(300, 132, 300, 16), C.snow, { rough: 1, shadow: false }),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Snow');

export function landScene(name: string): string {
  const r = rng(91);
  const flakes: Node[] = [];
  for (let i = 0; i < 50; i++) flakes.push(flake(r() * 1180, r() * 760, 4 + r() * 6, 0.5 + r() * 0.4));
  return sceneSvg(name, [
    ...sky([
      ['#a9c3d8', 0],
      [C.snowSky, 260],
      ['#dbe7ee', 440],
    ]),
    cloud(260, 120, 340, 1, '#e6eef3', 0.9),
    cloud(900, 90, 300, 2, '#e6eef3', 0.9),
    piece(circle(1040, 210, 46), '#f4f1dc', { ...flat, opacity: 0.8 }),
    // Faraway snowy mountains.
    piece(poly([[-20, 520], [140, 330], [260, 470], [380, 300], [520, 480], [700, 340], [860, 470], [1000, 320], [1200, 480], [1200, 600], [-20, 600]]), '#b8cbd9', { rough: 1 }),
    ...[[140, 330], [380, 300], [700, 340], [1000, 320]].map(([x, y]) => piece(poly([[x - 50, y + 60], [x, y], [x + 50, y + 60], [x + 20, y + 50], [x, y + 64], [x - 24, y + 48]]), C.snow, { edge: 'cut' })),
    hills(540, 40, '#d0dde6', 93),
    ...firTree(80, 600, 220, C.greenDeep, C.barkDark, C.snow),
    ...firTree(220, 580, 160, C.woodShade, C.barkDark, C.snow),
    ...clockTower(640, 600, 1),
    ...firTree(900, 590, 200, C.greenDeep, C.barkDark, C.snow),
    ...firTree(1070, 610, 260, C.woodShade, C.barkDark, C.snow),
    // Snow on the ground and the frozen pond.
    hills(620, 30, C.snowShade, 94, { step: 100 }),
    piece(ellipse(330, 690, 230, 50), C.ice, { rough: 0.8 }),
    piece(ellipse(330, 686, 200, 38), '#c4dbe8', { edge: 'cut', fibre: false, shadow: false }),
    ink([[220, 680], [270, 690], [320, 676]], { width: 2, color: C.white, opacity: 0.8 }),
    ink([[360, 700], [420, 690]], { width: 2, color: C.white, opacity: 0.8 }),
    // Drifts in front.
    hills(740, 40, C.snow, 95, { step: 140 }),
    piece(ellipse(1000, 770, 260, 70), C.snow, { rough: 1 }),
    piece(ellipse(120, 790, 220, 60), C.snow, { rough: 1 }),
    piece(ellipse(1000, 790, 200, 30), C.snowShade, { ...flat, opacity: 0.5 }),
    // A sledge left by the pond.
    piece(rect(560, 760, 120, 22, 6), C.red),
    piece(rect(550, 790, 140, 6, 3), C.greyDark, { edge: 'cut' }),
    ink([[560, 790], [570, 782]], { width: 3, color: C.greyDark }),
    ink([[670, 790], [660, 782]], { width: 3, color: C.greyDark }),
    ...flakes,
  ]);
}
