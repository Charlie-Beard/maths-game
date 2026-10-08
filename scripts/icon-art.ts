/**
 * The home-screen icon: the Faraway Tree as torn paper. A big round crown
 * on a trunk against a sky, with no text, so it still reads at 60 px.
 * It fills the whole square (iOS rounds the corners itself and fills any
 * transparent pixels with black). Rendered to PNGs by scripts/icons.mjs.
 */
import { C } from '../src/art/palette';
import { circle, curve, ellipse, piece, rect, rng, svg, type Node, type Pt } from '../src/art/paper';

export function iconSvg(): string {
  const r = rng(11);
  const crown: Node[] = [];
  // The crown: a ring of big discs round a centre, then lighter leaves on top.
  const shades = [C.greenDeep, C.leafDark, C.greenDark];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    crown.push(piece(circle(256 + Math.cos(a) * 112, 218 + Math.sin(a) * 96, 78 + r() * 10), shades[i % 3]));
  }
  crown.push(piece(circle(256, 218, 120), C.greenDark));
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 90;
    crown.push(piece(circle(236 + Math.cos(a) * d, 196 + Math.sin(a) * d * 0.8, 34 + r() * 14), i % 2 ? C.leaf : C.leafLight, { shadow: false }));
  }

  const trunk: Pt[] = curve([[212, 300], [228, 360], [214, 440], [186, 500], [326, 500], [298, 440], [284, 360], [300, 300]], 2);
  const nodes: Node[] = [
    piece(rect(-20, -20, 552, 552), C.sky, { edge: 'clean', shadow: false }),
    piece(rect(-20, 250, 552, 300), C.duskHigh, { rough: 2, shadow: false, fibre: false, opacity: 0.55 }),
    piece(circle(430, 90, 46), C.goldLight, { edge: 'cut', shadow: false, fibre: false }),
    piece(ellipse(92, 128, 70, 24), C.cloud, { shadow: false }),
    piece(ellipse(130, 112, 48, 26), C.cloud, { shadow: false }),
    piece(curve([[-20, 450], [140, 430], [300, 452], [532, 432], [532, 540], [-20, 540]], 2), C.green, { rough: 1.4 }),
    piece(trunk, C.bark),
    piece(rect(238, 310, 14, 150, 6), C.barkLight, { shadow: false, opacity: 0.5, edge: 'cut' }),
    ...crown,
    // A little lit window in the trunk: the Folk who live up the Tree.
    piece(rect(246, 396, 24, 34, 12), C.candle, { edge: 'cut', shadow: false, fibre: false }),
    piece(curve([[-20, 488], [160, 470], [340, 492], [532, 474], [532, 540], [-20, 540]], 2), C.greenDeep, { rough: 1.4 }),
  ];
  return svg({ w: 512, h: 512, name: 'app-icon' }, nodes);
}
