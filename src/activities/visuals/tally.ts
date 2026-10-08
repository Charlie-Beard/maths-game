/**
 * The `tally` visual (land 11, The Old Woman's Shoe): a tally chart (marks in gates of five) or a pictogram (rows of pictures, with a key when one picture stands for more than one).
 *
 * A row's `count` is always the real number (a pictogram where one
 * picture is 5 and the count is 30 shows six pictures), so the generators
 * and the answers never have to divide. Everything here is drawn once and
 * holds still: he counts from it, so nothing may move or flicker.
 *
 * `counts` is a help step. It writes the running count under each gate of
 * five (5, 10, 15 …) or on each picture (2, 4, 6 … when one picture is 2),
 * so he can read the answer off the end.
 */
import { C } from '../../art/palette';
import { circle, ink, piece, raw, rect, type Node } from '../../art/paper';
import type { Visual } from '../../core/problem';
import { label, propAt as place } from '../visual';

/** A picture at an exact size. A page-wide rule sets every nested svg to the box's width, so the size is also written as a style. */
const propAt = (id: Parameters<typeof place>[0], x: number, y: number, size: number): Node => place(id, x, y, size, `style="width:${size.toFixed(1)}px;height:${size.toFixed(1)}px"`);

type TallyVisual = Extract<Visual, { type: 'tally' }>;
type Row = TallyVisual['rows'][number];

export interface TallyOpts {
  /** Write the running counts (a help step). */
  counts?: boolean;
}

/** The first row to show a number for, to size the label column. */
const labelFont = (text: string): number => Math.max(26, Math.min(40, 360 / Math.max(1, text.length)));

/** One gate: four upright marks, and the fifth across them. */
function gate(x: number, y: number, sp: number, mh: number, marks: number): Node[] {
  const out: Node[] = [];
  const sw = Math.max(6, mh * 0.06);
  for (let i = 0; i < Math.min(4, marks); i++) {
    out.push(ink([[x + i * sp, y], [x + i * sp + sp * 0.04, y + mh]], { width: sw, color: C.ink, wobble: 0.7 }));
  }
  if (marks >= 5) out.push(ink([[x - sp * 0.45, y + mh * 0.8], [x + 3 * sp + sp * 0.45, y + mh * 0.2]], { width: sw, color: C.red, wobble: 0.7 }));
  return out;
}

function tallyRow(row: Row, x0: number, x1: number, cy: number, rh: number, counts: boolean): Node[] {
  const out: Node[] = [];
  const gates = Math.floor(row.count / 5);
  const rem = row.count % 5;
  const mh = Math.min(rh * (counts ? 0.62 : 0.72), 170);
  // Width in units of one mark's spacing: a gate is 3 + its gap, loose marks 1 each.
  const gap = 1.7;
  const units = gates * (3 + gap) + (rem ? (rem - 1) + gap : 0) - (rem ? 0 : gap);
  const sp = Math.min(mh * 0.28, (x1 - x0 - 12) / Math.max(1, units));
  const width = units * sp;
  let x = x0 + (x1 - x0 - width) / 2;
  const top = cy - mh / 2 - (counts ? rh * 0.08 : 0);
  let running = 0;
  for (let g = 0; g < gates; g++) {
    out.push(...gate(x, top, sp, mh, 5));
    running += 5;
    if (counts) out.push(label(x + 1.5 * sp, top + mh + rh * 0.17, String(running), Math.max(24, Math.min(36, rh * 0.22)), C.blueDark));
    x += (3 + gap) * sp;
  }
  if (rem) {
    out.push(...gate(x, top, sp, mh, rem));
    if (counts) out.push(label(x + ((rem - 1) * sp) / 2, top + mh + rh * 0.17, String(row.count), Math.max(24, Math.min(36, rh * 0.22)), C.blueDark));
  }
  return out;
}

function pictureRow(row: Row, per: number, x0: number, x1: number, cy: number, size: number, counts: boolean): Node[] {
  const out: Node[] = [];
  const n = Math.round(row.count / per);
  const prop = row.prop ?? 'star';
  const used = n * size;
  const x = x0 + Math.min(12, Math.max(0, x1 - x0 - used));
  for (let i = 0; i < n; i++) {
    const px = x + i * size;
    out.push(propAt(prop, px + size * 0.04, cy - size / 2, size * 0.92));
    if (counts) {
      out.push(piece(circle(px + size * 0.5, cy + size * 0.5 - 2, size * 0.24), C.cream, { edge: 'clean', shadow: false }));
      out.push(label(px + size * 0.5, cy + size * 0.5 - 1, String((i + 1) * per), size * 0.3, C.blueDark));
    }
  }
  return out;
}

export function tallyNodes(v: TallyVisual, w: number, hgt: number, o: TallyOpts = {}): Node[] {
  const per = v.per && v.per > 1 ? v.per : 1;
  const pictogram = v.style === 'pictogram';
  const rows = v.rows;
  const counts = !!o.counts;
  const showKey = pictogram && per > 1;
  const keyH = showKey ? 70 : 0;
  const pad = 14;
  const nodes: Node[] = [piece(rect(pad / 2, pad / 2, w - pad, hgt - pad, 14), C.cream, { edge: 'torn', rough: 0.6 })];

  const hasLabels = rows.some((r) => r.label);
  const fonts = rows.map((r) => labelFont(r.label));
  const labelW = hasLabels ? Math.min(250, Math.max(...rows.map((r, i) => r.label.length * fonts[i] * 0.6)) + 36) : 0;
  const top = pad + 6;
  const bodyH = hgt - 2 * pad - keyH - 6;
  const rh = bodyH / Math.max(1, rows.length);
  const x0 = pad + 14 + labelW;
  const x1 = w - pad - 18;

  // Ruled lines between rows, and a line down beside the labels.
  for (let i = 1; i < rows.length; i++) {
    const y = top + i * rh;
    nodes.push(raw(`<line x1="${pad + 12}" y1="${y.toFixed(1)}" x2="${w - pad - 12}" y2="${y.toFixed(1)}" stroke="${C.sand}" stroke-width="4" stroke-linecap="round"/>`));
  }
  if (hasLabels) nodes.push(raw(`<line x1="${x0 - 8}" y1="${top + 6}" x2="${x0 - 8}" y2="${top + bodyH - 6}" stroke="${C.sand}" stroke-width="4" stroke-linecap="round"/>`));

  const maxPics = Math.max(1, ...rows.map((r) => Math.round(r.count / per)));
  const size = Math.min(92, rh - 16, (x1 - x0 - 14) / maxPics);
  rows.forEach((row, i) => {
    const cy = top + rh * (i + 0.5);
    if (row.label) nodes.push(label(pad + 22, cy, row.label, fonts[i], C.ink, { anchor: 'start' }));
    nodes.push(...(pictogram ? pictureRow(row, per, x0, x1, cy, size, counts) : tallyRow(row, x0, x1, cy, rh, counts)));
  });

  if (showKey) {
    // The key: "[each picture] = 5".
    const props = [...new Set(rows.map((r) => r.prop ?? 'star'))];
    const ky = hgt - pad - keyH / 2 - 2;
    const kw = 150 + props.length * 56 + String(per).length * 34;
    const kx = (w - kw) / 2;
    nodes.push(piece(rect(kx, ky - 31, kw, 62, 10), C.white, { edge: 'cut' }));
    props.forEach((pr, i) => nodes.push(propAt(pr, kx + 18 + i * 56, ky - 26, 52)));
    const ex = kx + 30 + props.length * 56;
    nodes.push(label(ex + 22, ky + 1, '=', 42, C.ink));
    nodes.push(label(ex + 60, ky + 2, String(per), 56, C.red, { anchor: 'start' }));
  }
  return nodes;
}
