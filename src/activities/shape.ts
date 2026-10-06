/**
 * `shape`: the topsy-turvy windows (docs/PLAN.md §5). 2D shapes, often
 * turned or upside down, because a triangle is still a triangle when it
 * stands on its point.
 *
 * Three ways to play, chosen by the problem:
 *
 *   - **Name it** (the visual is a shape, the choices are shape names):
 *     a big shape and name cards.
 *   - **Find it** (the visual isn't a shape, the choices are shapes): the
 *     name on a sign, and the choices drawn as shapes to tap ("Tap the
 *     triangle"). From tier 2 they're turned this way and that.
 *   - **Count the sides** (the answer is a number): a big shape whose sides
 *     he can tap to count, each one getting the next number, and number
 *     cards.
 *
 * Help: 1 the shape (or the sign) glows; 2 the shapes turn the right way
 * up, or the sides are outlined, and a wrong choice goes; 3 the answer
 * glows (and the sides are numbered).
 */
import { C } from '../art/palette';
import { hashString, piece, rect, svg, type Pt } from '../art/paper';
import type { Answer, Problem, ShapeId } from '../core/problem';
import { tileCard } from '../art/ui';
import { h, place } from '../ui/dom';
import { Kit, answerCard, enter, pop, removeCard, rowX, wobble } from './c-kit';
import type { Activity, ActivityContext } from './types';
import { SHAPE_FILLS, SHAPE_NAMES, drawShape, label, shapeFill, shapeNodes, shapeSides } from './visual';

const isShape = (a: Answer): a is ShapeId => typeof a === 'string' && a in SHAPE_NAMES;

/** Topsy-turvy turns for the "find it" shapes. */
const TURNS = [0, 25, 45, 90, 135, 180, 200, 300];

export function shape(p: Problem, ctx: ActivityContext): Activity {
  const kit = new Kit('shape');
  const el = kit.el;
  const v = p.visual;
  const choices = p.choices ?? [];
  const mode: 'name' | 'find' | 'sides' = typeof p.answer === 'number' ? 'sides' : v.type !== 'shape' && choices.every(isShape) ? 'find' : 'name';
  const cards = new Map<string, HTMLElement>();
  let picture: HTMLElement | null = null;
  const PW = 860;
  const PH = 360;
  const sh = v.type === 'shape' ? v : null;
  const fill = shapeFill('activity-shape' + p.key);

  if (p.text) el.append(place(h('div', { class: 'sum-text c-sum' }, p.text), 160, 476, 860, 90));

  /** The big shape in the picture box, optionally with its sides marked. */
  const drawBig = (turned: number, o: { outline?: boolean; numbers?: boolean } = {}) => {
    if (!sh || !picture) return;
    const r = PH * 0.44;
    const sides = shapeSides(sh.shape, PW / 2, PH / 2, r, turned);
    const nodes = shapeNodes(sh.shape, PW / 2, PH / 2, r, { turned, fill });
    picture.innerHTML = svg({ w: PW, h: PH, name: 'big-shape' + p.key, boil: false, label: 'A shape' }, nodes);
    const s = picture.querySelector('svg');
    if (!s) return;
    // Side outlines (help) and hit strokes (count by tapping), drawn on top.
    const NS = 'http://www.w3.org/2000/svg';
    sides.forEach(([a, b], i) => {
      const mark = document.createElementNS(NS, 'line');
      mark.setAttribute('class', 'c-side-mark');
      setLine(mark, a, b);
      mark.setAttribute('stroke', i % 2 ? C.blueDark : C.red);
      mark.setAttribute('stroke-width', '10');
      mark.setAttribute('stroke-linecap', 'round');
      mark.setAttribute('opacity', o.outline || o.numbers ? '0.85' : '0');
      s.append(mark);
      if (mode !== 'sides') return;
      const hit = document.createElementNS(NS, 'line');
      hit.setAttribute('class', 'c-side-hit');
      hit.setAttribute('data-side', String(i));
      setLine(hit, a, b);
      hit.setAttribute('stroke', 'transparent');
      hit.setAttribute('stroke-width', '72');
      hit.setAttribute('pointer-events', 'stroke');
      s.append(hit);
      kit.tap(hit, () => countSide(i, mark, a, b));
      if (o.numbers) countSide(i, mark, a, b, true);
    });
  };

  // Counting sides: each tapped side turns gold and gets the next number.
  let counted = 0;
  const countedSides = new Set<number>();
  const countSide = (i: number, mark: SVGLineElement, a: Pt, b: Pt, quiet = false) => {
    if (countedSides.has(i)) return;
    countedSides.add(i);
    counted += 1;
    mark.setAttribute('stroke', C.gold);
    mark.setAttribute('opacity', '1');
    const s = mark.ownerSVGElement;
    const cx = PW / 2;
    const cy = PH / 2;
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const d = Math.hypot(mx - cx, my - cy) || 1;
    const lx = mx + ((mx - cx) / d) * 34;
    const ly = my + ((my - cy) / d) * 34;
    if (s) {
      s.insertAdjacentHTML(
        'beforeend',
        `<g class="c-side-n"><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="24" fill="${C.goldLight}" stroke="${C.ink}" stroke-width="2"/><text x="${lx.toFixed(1)}" y="${(ly + 1).toFixed(1)}" font-size="30" font-weight="700" fill="${C.ink}" text-anchor="middle" dominant-baseline="central" class="vt">${counted}</text></g>`,
      );
    }
    if (!quiet) {
      ctx.sfx('tap');
      ctx.say({ text: '{n}', vals: { n: counted } });
    }
  };

  if (mode === 'name' || mode === 'sides') {
    picture = place(h('div', { class: 'visual c-shape-pic' }), 160, 110, PW, PH);
    el.append(picture);
    drawBig(sh?.turned ?? 0);
    const w = mode === 'sides' ? 150 : choices.length > 3 ? 200 : 230;
    const xs = rowX(choices.length, w, mode === 'sides' ? 40 : 20);
    choices.forEach((c, i) => {
      const text = isShape(c) ? SHAPE_NAMES[c] : String(c);
      const card = answerCard(text, c, xs[i], 600, w, 150, { size: isShape(c) ? (text.length > 8 ? 36 : 40) : undefined });
      kit.tap(card, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(String(c), card);
      el.append(card);
    });
  }

  const findTurns = choices.map((c) => (p.tier >= 2 ? TURNS[hashString(p.key + String(c)) % TURNS.length] : 0));
  const drawFindButtons = (upright: boolean) => {
    choices.forEach((c, i) => {
      const btn = cards.get(String(c));
      if (btn && isShape(c)) {
        // Each shape in its own topsy-turvy window, each a different colour.
        const fillCol = SHAPE_FILLS[(hashString(p.key) + i) % SHAPE_FILLS.length];
        btn.innerHTML = tileCard(180, 180, hashString('window' + p.key + i), C.cream) + `<div class="c-shape-in">${drawShape(c, 150, { turned: upright ? 0 : findTurns[i], fill: fillCol, name: `find-${p.key}-${String(c)}` })}</div>`;
      }
    });
  };
  if (mode === 'find') {
    const word = isShape(p.answer) ? SHAPE_NAMES[p.answer] : String(p.answer);
    if (!p.text) {
      picture = place(h('div', { class: 'c-sign', html: svg({ w: 460, h: 200, name: 'shape-sign', boil: false }, [piece(rect(10, 10, 440, 180, 14), C.cream), label(230, 102, word, 84, C.ink)]) }), 360, 170, 460, 200);
      el.append(picture);
    }
    const size = 180;
    const xs = rowX(choices.length, size, 40);
    choices.forEach((c, i) => {
      const btn = h('button', { class: 'choice c-shape-choice', 'aria-label': `A shape (${i + 1})`, 'data-value': String(c) });
      place(btn, xs[i], 580, size, size);
      kit.tap(btn, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(String(c), btn);
      el.append(btn);
    });
    drawFindButtons(false);
  }

  const wrongCards = () => [...cards.entries()].filter(([k, c]) => k !== String(p.answer) && c.isConnected && !c.hasAttribute('disabled'));

  return {
    el,
    show() {
      enter([...cards.values()], ctx.calm);
    },
    wrong(value: Answer) {
      const card = cards.get(String(value));
      if (card) void wobble(card);
    },
    async right() {
      const card = cards.get(String(p.answer));
      card?.classList.add('is-right');
      if (card) await pop(card, 1.15);
    },
    help(level) {
      if (level === 1) {
        picture?.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        if (mode === 'name') drawBig(0);
        if (mode === 'sides') {
          counted = 0;
          countedSides.clear();
          drawBig(sh?.turned ?? 0, { outline: true });
        }
        if (mode === 'find') drawFindButtons(true);
        const wrong = wrongCards();
        if (wrong.length > 1) removeCard(wrong[0][1], ctx.calm);
        return;
      }
      if (mode === 'sides') {
        counted = 0;
        countedSides.clear();
        drawBig(sh?.turned ?? 0, { numbers: true });
      }
      cards.get(String(p.answer))?.classList.add('hint-answer');
    },
    lock(on) {
      kit.locked = on;
    },
    destroy() {
      kit.destroy();
    },
  };
}

function setLine(l: SVGLineElement, a: Pt, b: Pt): void {
  l.setAttribute('x1', a[0].toFixed(1));
  l.setAttribute('y1', a[1].toFixed(1));
  l.setAttribute('x2', b[0].toFixed(1));
  l.setAttribute('y2', b[1].toFixed(1));
}
