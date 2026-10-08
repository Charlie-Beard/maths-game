/**
 * Land 11's activities: `tally` and `change`. Both are "look at the
 * picture, then tap the right card"; they differ in the picture and in the
 * cards (change draws its answers as money: "35p", "£1").
 *
 * Help: 1 the picture glows; 2 the picture counts for him (running numbers
 * on the tally gates and pictures; the sum written out for change) and one
 * wrong card goes; 3 the right card glows.
 */
import { C } from '../art/palette';
import { svg } from '../art/paper';
import type { Answer, Problem } from '../core/problem';
import { h, place } from '../ui/dom';
import { Kit, answerCard, enter, pop, removeCard, rowX, wobble } from './c-kit';
import type { Activity, ActivityContext } from './types';
import { moneyText, renderVisual } from './visual';
import { tallyNodes } from './visuals/tally';

const BOX = { x: 160, y: 110, w: 860, h: 360 };

function answerCards(p: Problem, kit: Kit, ctx: ActivityContext, text: (a: Answer) => string): Map<string, HTMLElement> {
  const choices = p.choices ?? [p.answer];
  const cards = new Map<string, HTMLElement>();
  const long = choices.some((c) => text(c).length > 3);
  const w = long ? 210 : choices.length > 3 ? 180 : 200;
  const xs = rowX(choices.length, w, 30);
  choices.forEach((c, i) => {
    const card = answerCard(text(c), c, xs[i], 600, w, 150);
    kit.tap(card, () => {
      ctx.sfx('tap');
      ctx.answer(c);
    });
    cards.set(String(c), card);
    kit.el.append(card);
  });
  return cards;
}

function build(kind: 'tally' | 'change', p: Problem, ctx: ActivityContext): Activity {
  const kit = new Kit(kind);
  const picture = place(renderVisual(p.visual, BOX.w, BOX.h), BOX.x, BOX.y, BOX.w, BOX.h);
  kit.el.append(picture);
  if (p.text) kit.el.append(place(h('div', { class: 'sum-text c-sum' }, p.text), 160, 476, 860, 90));
  const cards = answerCards(p, kit, ctx, (a) => (kind === 'change' && typeof a === 'number' ? moneyText(a) : String(a)));

  const wrongCards = () => [...cards.entries()].filter(([k, c]) => k !== String(p.answer) && c.isConnected);

  return {
    el: kit.el,
    show() {
      enter([...cards.values()], ctx.calm);
    },
    wrong(value: Answer) {
      void wobble(cards.get(String(value)) ?? picture);
    },
    async right() {
      const card = cards.get(String(p.answer));
      card?.classList.add('is-right');
      await pop(card ?? picture, 1.1);
    },
    help(level) {
      if (level === 1) {
        picture.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        const v = p.visual;
        if (v.type === 'tally') {
          const name = 'tally-help-' + JSON.stringify(v);
          picture.innerHTML = svg({ w: BOX.w, h: BOX.h, name, boil: false }, tallyNodes(v, BOX.w, BOX.h, { counts: true }));
        } else if (kind === 'change' && v.type === 'coins' && v.target !== undefined && !p.text) {
          kit.el.append(place(h('div', { class: 'sum-text c-sum', style: `color:${C.ink}` }, `${moneyText(v.coins[0])} − ${moneyText(v.target)} = ?`), 160, 476, 860, 90));
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

export const tally = (p: Problem, ctx: ActivityContext): Activity => build('tally', p, ctx);
export const change = (p: Problem, ctx: ActivityContext): Activity => build('change', p, ctx);
