/**
 * Big backdrops (1180 × 820).
 *
 * SCAFFOLD: one shared backdrop, the Faraway Tree at dusk, used by the
 * title and the map. Workstream W3 adds a backdrop per land (art/lands/)
 * and the opening's countryside house.
 */
import { C } from './palette';
import { band, circle, curve, ellipse, piece, rect, rng, svg, type Node, type Pt } from './paper';

/** A lumpy cloud bank centred on (cx, cy). */
function cloudBank(cx: number, cy: number, w: number, seed: number, color: string = C.cloud): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  const n = Math.max(3, Math.round(w / 70));
  for (let i = 0; i < n; i++) {
    const x = cx - w / 2 + (i + 0.5) * (w / n);
    out.push(piece(circle(x, cy - r() * 26, 40 + r() * 26), color, { shadow: i === 0 }));
  }
  out.push(piece(ellipse(cx, cy + 18, w / 2, 30), color, { shadow: false }));
  return out;
}

/** A leafy clump of canopy. */
function clump(cx: number, cy: number, size: number, seed: number): Node[] {
  const r = rng(seed);
  const colors = [C.leafDark, C.leaf, C.moss, C.leafLight];
  return [0, 1, 2, 3].map((i) =>
    piece(circle(cx + (r() - 0.5) * size * 0.8, cy + (r() - 0.5) * size * 0.5, size * (0.38 + r() * 0.18)), colors[i], { shadow: i === 0 }),
  );
}

/** A small lit window or round door in the trunk. */
const window = (x: number, y: number, round = false): Node[] => [
  piece(round ? circle(x, y, 18) : rect(x - 14, y - 20, 28, 40, 12), C.candle, { edge: 'cut' }),
  piece(round ? circle(x, y, 10) : rect(x - 2, y - 20, 4, 40), C.barkDark, { edge: 'clean', shadow: false }),
];

/**
 * The Faraway Tree at dusk. `landColor` tints the land sitting in the
 * cloud at the very top.
 */
export function treeDusk(name: string, o: { landColor?: string } = {}): string {
  const trunk: Pt[] = curve(
    [
      [430, 830],
      [500, 700],
      [535, 520],
      [545, 300],
      [560, 120],
      [620, 120],
      [640, 300],
      [655, 520],
      [690, 700],
      [760, 830],
    ],
    2,
  );
  const nodes: Node[] = [
    // Sky: dusk bands from cool blue at the top to warm gold at the horizon.
    piece(rect(-20, -20, 1220, 300), C.duskHigh, { edge: 'clean', shadow: false }),
    piece(rect(-20, 240, 1220, 220), C.duskSky, { rough: 2, shadow: false }),
    piece(rect(-20, 420, 1220, 420), C.dusk, { rough: 2, shadow: false }),
    // The land at the top of the tree, sitting in its cloud.
    piece(ellipse(590, 70, 230, 60), o.landColor ?? C.purple, { rough: 1.6 }),
    ...cloudBank(590, 120, 560, 11),
    // Distant wood.
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => piece(circle(60 + i * 135, 640 + (i % 2) * 30, 110), i % 2 ? C.greenDeep : C.leafDark, { shadow: false })),
    // The trunk and branches.
    piece(trunk, C.bark),
    piece(band([[548, 440], [430, 370], [300, 336]], 34), C.bark),
    piece(band([[650, 350], [780, 296], [900, 270]], 32), C.bark),
    piece(band([[548, 615], [460, 592], [380, 598]], 24), C.barkDark),
    piece(band([[568, 300], [588, 500], [578, 760]], 14), C.barkLight, { shadow: false, opacity: 0.6 }),
    // Canopy clumps along the way up.
    ...clump(300, 300, 150, 1),
    ...clump(900, 230, 170, 2),
    ...clump(380, 560, 120, 3),
    ...clump(780, 470, 130, 4),
    ...clump(600, 200, 140, 5),
    // Lit windows and doors.
    ...window(600, 680, true),
    ...window(590, 500),
    ...window(612, 360),
    ...window(596, 230, true),
    // The ground.
    piece(curve([[-20, 760], [300, 730], [590, 760], [900, 730], [1200, 760], [1200, 840], [-20, 840]], 2), C.greenDark),
  ];
  return svg({ w: 1180, h: 820, name, boil: false }, nodes);
}
