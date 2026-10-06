/**
 * Character portraits: 300 × 340, head and shoulders, torn paper.
 *
 * SCAFFOLD: every character is a quick stand-in built by `standIn` from a
 * few colours and features, so screens and stories can be built now.
 * Workstream W3 (docs/ROADMAP.md) replaces each with proper art, one file
 * per group (folk.ts, family.ts, villains.ts, lands.ts), keeping the same
 * ids, size and face position (the face sits in the box 78 62 144 144,
 * which caption chips crop to).
 */
import { C } from '../palette';
import { circle, curve, dot, ellipse, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';

interface Look {
  skin: string;
  body: string;
  hair?: string;
  /** Hair shape. */
  style?: 'short' | 'long' | 'bun' | 'bald' | 'wild';
  /** Something on top. */
  hat?: { color: string; shape: 'pointy' | 'pot' | 'cap' | 'crown' | 'tall' };
  /** Extra pieces drawn last (props, details). */
  extra?: Node[];
  /** A round moon face instead of a head shape. */
  moon?: boolean;
  /** Frowning (villains and grumps). */
  cross?: boolean;
}

function standIn(id: string, l: Look): () => string {
  return () => {
    const head: Pt[] = l.moon ? circle(150, 140, 78) : ellipse(150, 140, 58, 66);
    const hair: Node[] = [];
    if (l.hair && l.style !== 'bald') {
      if (l.style === 'long') hair.push(piece(curve([[86, 130], [96, 66], [150, 56], [204, 66], [214, 130], [222, 230], [78, 230]], 2), l.hair));
      else if (l.style === 'bun') hair.push(piece(circle(150, 58, 30), l.hair), piece(curve([[92, 120], [104, 76], [150, 68], [196, 76], [208, 120], [150, 96]], 2), l.hair));
      else if (l.style === 'wild') hair.push(piece(curve([[80, 130], [70, 70], [120, 50], [150, 70], [180, 46], [232, 70], [220, 130], [150, 100]], 2), l.hair));
      else hair.push(piece(curve([[90, 128], [100, 76], [150, 66], [200, 76], [210, 128], [150, 100]], 2), l.hair));
    }
    const hat: Node[] = [];
    if (l.hat) {
      const c = l.hat.color;
      if (l.hat.shape === 'pointy') hat.push(piece(poly([[96, 96], [150, -10], [204, 96]]), c));
      if (l.hat.shape === 'pot') hat.push(piece(rect(100, 40, 100, 52, 6), c), piece(rect(80, 84, 140, 14, 4), c), piece(rect(200, 56, 46, 10, 4), C.greyDark));
      if (l.hat.shape === 'cap') hat.push(piece(curve([[92, 100], [104, 60], [150, 50], [196, 60], [208, 100]], 2), c));
      if (l.hat.shape === 'crown') hat.push(piece(poly([[104, 86], [108, 44], [128, 66], [150, 36], [172, 66], [192, 44], [196, 86]]), c));
      if (l.hat.shape === 'tall') hat.push(piece(rect(112, 6, 76, 86, 4), c), piece(rect(96, 84, 108, 14, 4), c));
    }
    const brow = l.cross
      ? [ink([[118, 118], [140, 126]], { width: 4 }), ink([[182, 118], [160, 126]], { width: 4 })]
      : [];
    const mouth = l.cross ? ink([[132, 182], [150, 176], [168, 182]], { width: 3.5 }) : ink([[128, 172], [150, 186], [172, 172]], { width: 3.5 });
    return svg({ w: 300, h: 340, name: 'char-' + id }, [
      piece(curve([[40, 340], [56, 250], [150, 214], [244, 250], [260, 340]], 2), l.body),
      ...(l.style === 'long' ? hair : []),
      piece(head, l.skin),
      ...(l.style === 'long' ? [] : hair),
      ...hat,
      dot(128, 142, 7, C.ink),
      dot(172, 142, 7, C.ink),
      dot(130, 139, 2, C.white),
      dot(174, 139, 2, C.white),
      ...brow,
      mouth,
      dot(114, 164, 10, C.rose, 0.35),
      dot(186, 164, 10, C.rose, 0.35),
      ...(l.extra ?? []),
    ]);
  };
}

const wings = (color: string): Node[] => [
  piece(ellipse(60, 250, 50, 26, -0.6), color, { edge: 'cut' }),
  piece(ellipse(240, 250, 50, 26, 0.6), color, { edge: 'cut' }),
];

export const characters: Record<string, () => string> = {
  // The Folk
  moonface: standIn('moonface', { skin: '#f3dc8a', body: C.blue, moon: true }),
  silky: standIn('silky', { skin: C.skin, body: C.cream, hair: '#f0e2a8', style: 'long', extra: wings('rgba(220,235,245,0.8)') }),
  saucepan: standIn('saucepan', {
    skin: C.skin,
    body: C.greyDark,
    hair: C.brown,
    hat: { color: C.stone, shape: 'pot' },
    extra: [piece(circle(70, 300, 26), C.stone), piece(circle(232, 296, 22), C.stoneLight), piece(rect(90, 260, 40, 30, 6), C.grey)],
  }),
  washalot: standIn('washalot', { skin: C.skinShade, body: C.teal, hair: C.greyDark, style: 'bun', extra: [piece(rect(70, 286, 160, 40, 10), C.wood)] }),
  watzisname: standIn('watzisname', { skin: C.skin, body: C.plum, hair: C.sand, hat: { color: C.plum, shape: 'pointy' } }),
  pixie: standIn('pixie', { skin: '#e8c79a', body: C.greenDark, hair: C.ginger, style: 'wild', hat: { color: C.red, shape: 'pointy' }, cross: true }),
  oomboom: standIn('oomboom', { skin: C.skinShade, body: C.orange, hair: C.ink, hat: { color: C.gold, shape: 'tall' } }),
  // The family
  beth: standIn('beth', { skin: C.skin, body: C.rose, hair: C.brownDark, style: 'long' }),
  joe: standIn('joe', { skin: C.skin, body: C.blueDark, hair: C.brown }),
  fran: standIn('fran', { skin: C.skin, body: C.yellow, hair: C.ginger, style: 'long' }),
  mum: standIn('mum', { skin: C.skin, body: C.green, hair: C.ginger, style: 'long' }),
  dad: standIn('dad', { skin: C.skin, body: C.brown, hair: C.brownDark }),
  // The lands
  topsy: standIn('topsy', { skin: C.skin, body: '#9a5aa0', hair: C.green, style: 'wild', hat: { color: C.pink, shape: 'cap' } }),
  jellyGoblin: standIn('jellyGoblin', { skin: '#b7cf6a', body: C.rose, style: 'bald', cross: true }),
  giant: standIn('giant', { skin: C.skinShade, body: C.brown, hair: C.ginger, style: 'wild' }),
  enchanter: standIn('enchanter', { skin: C.skinPale, body: C.purple, hair: C.white, style: 'long', hat: { color: C.blueDark, shape: 'pointy' } }),
  toySoldier: standIn('toySoldier', { skin: C.skin, body: C.red, hat: { color: C.ink, shape: 'tall' }, style: 'bald' }),
  snowman: standIn('snowman', { skin: C.white, body: C.white, moon: true, hat: { color: C.ink, shape: 'tall' } }),
  // The villain
  dameSnap: standIn('dameSnap', {
    skin: C.skinPale,
    body: C.snapInk,
    hair: C.ink,
    style: 'bun',
    cross: true,
    extra: [piece(rect(214, 180, 18, 150, 2), C.ruler, { edge: 'cut' })],
  }),
};

export const characterArt = (id: string): string => (characters[id] ?? characters.moonface)();
