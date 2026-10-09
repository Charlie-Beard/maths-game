/**
 * `turn`: the carousel (land 13, Roundabouts). An arrow on a carousel top
 * turns, and he taps a picture to say where it ends up.
 *
 * Three ways to play, chosen by the problem (docs/PLAN.md §5):
 *
 *   - **Which way now?** (answers 'up' | 'right' | 'down' | 'left'): the
 *     arrow, a curved arrow for its turn, and arrow cards to tap.
 *   - **Clockwise or anticlockwise?** (answers 'clockwise' |
 *     'anticlockwise'): a faded arrow where it began, a bold one where it
 *     ended, and two cards, each a curved arrow round a little clock.
 *   - **Follow the cards** (the visual has a grid): a paving path, the
 *     arrow on its start square and the moves as picture cards. He taps
 *     the flag he lands on.
 *
 * Nothing is a word he has to read. Help: 1 the picture glows; 2 the turn
 * is cut into numbered quarters (or the clock that goes clockwise is
 * shown, or the route is dotted out) and a wrong choice goes; 3 the
 * answer glows.
 */
import type { Answer, Problem, Visual } from '../core/problem';
import { h, place } from '../ui/dom';
import { Kit, enter, pop, removeCard, rowX, wobble } from './c-kit';
import { pictureCard } from './l13-kit';
import type { Activity, ActivityContext } from './types';
import { drawArrow, drawTurn, drawWayIcon, gridLayout, type TurnDrawOpts } from './visuals/turn';

const DIRECTIONS = ['up', 'right', 'down', 'left'];

export function turn(p: Problem, ctx: ActivityContext): Activity {
  const kit = new Kit('turn');
  const el = kit.el;
  const v: Extract<Visual, { type: 'turn' }> = p.visual.type === 'turn' ? p.visual : { type: 'turn', facing: 0 };
  const choices = (p.choices ?? [p.answer]).map(String);
  const mode: 'path' | 'way' | 'direction' = v.grid ? 'path' : choices.every((c) => c === 'clockwise' || c === 'anticlockwise') ? 'way' : 'direction';
  const PW = 860;
  const PH = mode === 'path' ? 450 : 360;
  const cards = new Map<string, HTMLElement>();

  const picture = place(h('div', { class: 'visual l13-turn-pic', 'data-kind': 'turn' }), 160, 110, PW, PH);
  const draw = (o: TurnDrawOpts = {}) => {
    picture.innerHTML = drawTurn(v, PW, PH, o);
  };
  draw();
  el.append(picture);

  if (mode === 'path' && v.grid) {
    // The flags are on the picture; each gets a tap target over its square.
    const L = gridLayout(v.grid, PW, PH);
    for (const f of v.grid.flags) {
      const btn = h('button', { class: 'choice l13-flag', 'aria-label': `The ${f.id} flag`, 'data-value': f.id });
      place(btn, 160 + L.x0 + f.col * L.cell, 110 + L.y0 + f.row * L.cell, L.cell, L.cell);
      kit.tap(btn, () => {
        ctx.sfx('tap');
        ctx.answer(f.id);
      });
      cards.set(f.id, btn);
      el.append(btn);
    }
  } else {
    const way = mode === 'way';
    const w = way ? 260 : 170;
    const hgt = way ? 190 : 170;
    const xs = rowX(choices.length, w, way ? 60 : 36);
    choices.forEach((c, i) => {
      const drawing = way ? drawWayIcon(c === 'clockwise' ? 1 : -1, 170) : drawArrow(DIRECTIONS.indexOf(c) * 90, 140);
      const card = pictureCard(c, c, drawing, xs[i], 590, w, hgt);
      kit.tap(card, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(c, card);
      el.append(card);
    });
  }

  const wrongCards = () => [...cards.entries()].filter(([k, c]) => k !== String(p.answer) && c.isConnected && !c.hasAttribute('disabled'));

  return {
    el,
    show() {
      enter([...cards.values()]);
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
        picture.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        const wrong = wrongCards();
        if (mode === 'path') {
          const gone = wrong.length > 1 ? wrong[0][0] : undefined;
          draw({ trail: true, hideFlags: gone ? [gone] : [] });
          if (gone) removeCard(cards.get(gone)!);
          return;
        }
        draw(mode === 'way' ? { clock: true } : { steps: true });
        if (wrong.length > 1) removeCard(wrong[0][1]);
        return;
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
