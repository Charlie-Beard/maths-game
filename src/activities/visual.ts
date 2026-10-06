/**
 * Draws a problem's picture (its `visual`) as plain, static paper art.
 *
 * Used by `choose` (the fallback activity that can show any problem) and
 * as a starting point by the richer activities, which add interaction.
 *
 * SCAFFOLD: objects, dots, ten frames, number lines and part-whole are
 * drawn; the other kinds show a simple text stand-in until workstream W2
 * draws them.
 */
import { C } from '../art/palette';
import { prop } from '../art/props';
import type { Visual } from '../core/problem';
import { h } from '../ui/dom';

/** Renders a visual into a box of the given size. Returns the element. */
export function renderVisual(v: Visual, w: number, hgt: number): HTMLElement {
  const el = h('div', { class: `visual visual-${v.type}`, style: `width:${w}px;height:${hgt}px` });
  switch (v.type) {
    case 'none':
      break;
    case 'objects': {
      const groups = v.groups.map((g, gi) => {
        const box = h('div', { class: 'obj-group' });
        for (let i = 0; i < g.count; i++) {
          const gone = i >= g.count - (g.gone ?? 0);
          box.append(h('div', { class: `obj${gone ? ' gone' : ''}`, 'data-group': String(gi), html: prop(g.prop) }));
        }
        return box;
      });
      groups.forEach((g, i) => {
        if (i) el.append(h('div', { class: 'obj-op' }, v.op === '-' ? '−' : '+'));
        el.append(g);
      });
      break;
    }
    case 'dots': {
      const box = h('div', { class: 'dots-card' });
      for (let i = 0; i < v.count; i++) box.append(h('div', { class: 'dot' }));
      el.append(box);
      break;
    }
    case 'tenFrame': {
      v.frames.forEach((filled, fi) => {
        const frame = h('div', { class: 'ten-frame' });
        for (let i = 0; i < 10; i++) {
          const cell = h('div', { class: 'cell' });
          const isLast = fi === v.frames.length - 1;
          if (i < filled) {
            const removing = isLast && v.remove !== undefined && i >= filled - v.remove;
            cell.append(h('div', { class: `counter${removing ? ' gone' : ''}`, html: v.prop ? prop(v.prop) : '' }));
          } else if (isLast && v.add !== undefined && i < filled + v.add) {
            cell.append(h('div', { class: 'counter adding', html: v.prop ? prop(v.prop) : '' }));
          }
          frame.append(cell);
        }
        el.append(frame);
      });
      break;
    }
    case 'numberLine': {
      const line = h('div', { class: 'number-line' });
      const n = v.to - v.from;
      for (let i = 0; i <= n; i++) {
        const value = v.from + i;
        const mark = h('div', { class: `nl-mark${value === v.start ? ' start' : ''}`, style: `left:${(i / n) * 100}%` });
        mark.append(h('span', {}, String(value)));
        line.append(mark);
      }
      el.append(line);
      break;
    }
    case 'partWhole': {
      const circle = (value: number | null, cls: string) => h('div', { class: `pw-circle ${cls}${value === null ? ' missing' : ''}` }, value === null ? '?' : String(value));
      el.append(circle(v.whole, 'whole'), h('div', { class: 'pw-parts' }, v.parts.map((p) => circle(p, 'part'))));
      break;
    }
    default:
      el.append(h('div', { class: 'visual-todo', style: `color:${C.slate}` }, `(${v.type} picture)`));
  }
  return el;
}
