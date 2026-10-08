/**
 * `numberPad` (top tiers only): the written sum with an empty box for the
 * answer, and a big paper keypad (0–9, rub out, OK) to type it.
 *
 * Keys are at least 104 px. The digits he types appear in the box in the
 * sum; OK gives the answer. A wrong answer wobbles the box and empties it.
 *
 * Help: 1 the box glows; 2 the keypad is put away and number cards come
 * instead, with one wrong card already gone; 3 the answer card glows.
 */
import { C } from '../art/palette';
import { hashString } from '../art/paper';
import { tileCard } from '../art/ui';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, smFrom, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { cardRow, Shell, type CardRow } from './a-kit';
import { cardToDrop, cardValues, splitSum, typeDigit } from './a-logic';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';
import { renderVisual } from './visual';

const KEY = 104;
const KGAP = 14;
const SIDE = 140;
const KX0 = 590 - (5 * KEY + 4 * KGAP + 24 + SIDE) / 2;
const KY = [560, 560 + KEY + KGAP];

const RUB_OUT =
  '<svg class="np-icon" viewBox="-40 -30 80 60" aria-hidden="true"><path d="M-34 0L-14 -22H32V22H-14Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M-2 -10L18 10M18 -10L-2 10" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>';

export function numberPad(p: Problem, ctx: ActivityContext): Activity {
  if (!Number.isFinite(Number(p.answer))) return choose(p, ctx);
  const shell = new Shell('numberPad');
  const answerLen = String(p.answer).length;
  const max = Math.max(2, answerLen);
  let typed = '';

  // ---- The picture (if any) and the written sum with its answer box ----
  const hasPicture = p.visual.type !== 'none';
  const picture = hasPicture ? shell.add(place(renderVisual(p.visual, 860, 240), 160, 106, 860, 240)) : null;
  const { before, after } = splitSum(p.text);
  const box = h('span', { class: 'np-box', 'aria-label': 'your answer', 'aria-live': 'polite' });
  const row = h('div', { class: `np-sum${hasPicture ? '' : ' big'}` }, [h('span', {}, before), box, h('span', {}, after)]);
  shell.add(place(row, 160, hasPicture ? 356 : 180, 860, hasPicture ? 130 : 180));

  const show = () => {
    box.textContent = typed;
    box.classList.toggle('typed', typed.length > 0);
  };

  // ---- The keypad ----
  const pad = shell.add(place(h('div', { class: 'np-pad' }), 0, 0, 1180, 820));
  const keys: HTMLButtonElement[] = [];
  const key = (label: string | null, value: string, x: number, y: number, w: number, fill: string, fn: () => void, html = '') => {
    const k = h('button', { class: `np-key${label === null ? ' icon' : ''}`, 'data-value': value, 'aria-label': value, html: tileCard(w, KEY, hashString('key' + value), fill) + html }) as HTMLButtonElement;
    if (label !== null) k.append(h('span', { class: 'np-key-text' }, label));
    place(k, x, y, w, KEY);
    shell.tap(k, fn);
    keys.push(k);
    pad.append(k);
    return k;
  };
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach((d, i) => {
    key(d, d, KX0 + (i % 5) * (KEY + KGAP), KY[Math.floor(i / 5)], KEY, C.cream, () => {
      ctx.sfx('tap');
      typed = typeDigit(typed, d, max);
      show();
      if (!ctx.calm) void pop(box, 1.06);
    });
  });
  const sideX = KX0 + 5 * (KEY + KGAP) + 10;
  key(null, 'delete', sideX, KY[0], SIDE, C.sand, () => {
    ctx.sfx('tap');
    typed = typed.slice(0, -1);
    show();
  }, RUB_OUT);
  const ok = key('OK', 'ok', sideX, KY[1], SIDE, C.goldLight, () => {
    if (!typed) {
      void wobble(box);
      return;
    }
    ctx.sfx('tap');
    ctx.answer(Number(typed));
  });
  ok.classList.add('np-ok');

  // ---- Help 2: number cards instead ----
  let cards: CardRow | null = null;
  const useCards = () => {
    if (cards) return;
    keys.forEach((k) => (k.disabled = true));
    const goPad = () => pad.remove();
    if (ctx.calm) goPad();
    else gsap.to(pad, { opacity: 0, y: 40, duration: 0.25, ease: 'power2.in', onComplete: goPad });
    typed = '';
    show();
    // One wrong card is gone already.
    const values = cardValues(p);
    const drop = cardToDrop(values, p.answer);
    cards = cardRow(shell, values.filter((v) => v !== drop), p.answer, (val) => {
      ctx.sfx('tap');
      typed = String(val);
      show();
      ctx.answer(val);
    });
    if (!ctx.calm) smFrom([...cards.cards.values()], 0.3, { y: 60, opacity: 0, delay: 0.2 });
  };

  return {
    el: shell.el,
    show() {
      if (ctx.calm) return;
      gsap.from(keys, { y: 50, opacity: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out' });
    },
    wrong(val: Answer) {
      cards?.wrong(val);
      void wobble(box).then(() => {
        typed = '';
        show();
      });
    },
    async right() {
      box.classList.add('is-right');
      await Promise.all([pop(box, 1.2), cards?.right()]);
    },
    help(level) {
      if (level === 1) {
        box.classList.add('hint-glow');
        picture?.classList.add('hint-glow');
        return;
      }
      useCards();
      if (level === 3) cards?.showAnswer();
    },
    lock(on) {
      shell.locked = on;
    },
    destroy() {
      shell.destroy();
    },
  };
}
