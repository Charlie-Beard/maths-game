/**
 * `solid`: the toy stall (land 13, Roundabouts). 3D shapes cut from paper,
 * and he taps a picture. Never a word he has to read: the name is written
 * under each shape for the day he can, and Silky says it with the answer.
 *
 * Three ways to play, chosen by the problem:
 *
 *   - **Find it** (answers are solids): "Tap the cone". A row of big
 *     solid cards. The colours change from problem to problem, so a shape
 *     is never "the red one".
 *   - **Count it** (the answer is a number): a big solid, and number cards
 *     for its flat faces, edges or corners.
 *   - **Flat shape** (answers are 2D shapes): a solid with one gold face,
 *     and flat shape cards (the same drawings as the `shape` activity).
 *
 * Help: 1 the picture glows; 2 a see-through view (hidden edges dashed,
 * corners or edges numbered when that is what is counted) and a wrong
 * choice goes; 3 the answer glows.
 */
import { C } from '../art/palette';
import { hashString, svg } from '../art/paper';
import { tileCard } from '../art/ui';
import type { Answer, Problem, SolidId, Visual } from '../core/problem';
import { h, place } from '../ui/dom';
import { Kit, answerCard, enter, pop, removeCard, rowX, wobble } from './c-kit';
import { pictureCard } from './l13-kit';
import type { Activity, ActivityContext } from './types';
import { SHAPE_FILLS, SHAPE_NAMES, drawShape, label } from './visual';
import { SOLID_NAMES, drawSolid, solidNodes, type SolidOpts } from './visuals/solid';

const isSolid = (a: Answer): a is SolidId => typeof a === 'string' && a in SOLID_NAMES;

export function solid(p: Problem, ctx: ActivityContext): Activity {
  const kit = new Kit('solid');
  const el = kit.el;
  const v = p.visual;
  const choices = p.choices ?? [p.answer];
  const mode: 'find' | 'count' | 'flat' = choices.every(isSolid) ? 'find' : typeof p.answer === 'number' ? 'count' : 'flat';
  const cards = new Map<string, HTMLElement>();
  const PW = 860;
  const PH = 360;
  let picture: HTMLElement | null = null;
  const sv: Extract<Visual, { type: 'solid' }> | null = v.type === 'solid' ? v : null;

  /** The big picture, optionally see-through (help). */
  const draw = (o: SolidOpts = {}) => {
    if (!sv || !picture) return;
    picture.innerHTML = svg({ w: PW, h: PH, name: 'solid-pic' + p.key, boil: false, label: 'A 3D shape' }, solidNodes(sv, PW, PH, o));
  };

  if (mode === 'find') {
    const word = String(p.answer);
    picture = place(
      h('div', { class: 'visual l13-sign', 'data-kind': 'solid', html: svg({ w: 460, h: 100, name: 'solid-sign', boil: false, label: `Tap the ${word}` }, [label(230, 52, word, 74, C.ink)]) }),
      360,
      112,
      460,
      100,
    );
    el.append(picture);
    const w = choices.length > 3 ? 190 : 220;
    const xs = rowX(choices.length, w, 24);
    const first = hashString(p.key);
    choices.forEach((c, i) => {
      const id = c as SolidId;
      const fill = SHAPE_FILLS[(first + i * 5) % SHAPE_FILLS.length];
      const card = pictureCard(String(c), SOLID_NAMES[id], drawSolid(id, 190, { fill }), xs[i], 232, w, 300, SOLID_NAMES[id]);
      kit.tap(card, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(String(c), card);
      el.append(card);
    });
  } else {
    picture = place(h('div', { class: 'visual l13-solid-pic', 'data-kind': 'solid' }), 160, 110, PW, PH);
    el.append(picture);
    draw();
    if (p.text) el.append(place(h('div', { class: 'sum-text c-sum' }, p.text), 160, 476, 860, 90));
    if (mode === 'count') {
      const w = 150;
      const xs = rowX(choices.length, w, 40);
      choices.forEach((c, i) => {
        const card = answerCard(String(c), c, xs[i], 600, w, 150);
        kit.tap(card, () => {
          ctx.sfx('tap');
          ctx.answer(c);
        });
        cards.set(String(c), card);
        el.append(card);
      });
    } else {
      const size = 180;
      const xs = rowX(choices.length, size, 36);
      choices.forEach((c, i) => {
        const shape = String(c) as keyof typeof SHAPE_NAMES;
        const card = h('button', { class: 'choice l13-card', 'aria-label': SHAPE_NAMES[shape] ?? String(c), 'data-value': String(c), html: tileCard(size, size, hashString('l13-flat' + String(c)), C.cream) });
        card.append(h('div', { class: 'l13-pic', html: drawShape(shape, 150, { fill: SHAPE_FILLS[(hashString(p.key) + i * 3) % SHAPE_FILLS.length], name: `l13-flat-${String(c)}` }) }));
        place(card, xs[i], 580, size, size);
        kit.tap(card, () => {
          ctx.sfx('tap');
          ctx.answer(c);
        });
        cards.set(String(c), card);
        el.append(card);
      });
    }
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
        if (mode !== 'find') {
          const marks = sv?.ask === 'edges' || sv?.ask === 'corners' ? sv.ask : undefined;
          draw({ seeThrough: true, marks });
        }
        const wrong = wrongCards();
        if (wrong.length > 1) removeCard(wrong[0][1], ctx.calm);
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
