/**
 * `partWhole`: Dame Washalot's washing baskets. The whole is the big basket
 * on top; the parts are the baskets below, joined to it like cherries on
 * their stalks. Or, as a bar model, a long washing line with the parts
 * pegged underneath, each as long as its number.
 *
 * One number is missing (a dashed basket with a "?"). He answers with a
 * number card; the number drops into the gap while the scene decides, and
 * lifts out again if it wasn't right.
 *
 * Help: 1 the gap glows; 2 the numbers become counters (the whole shows
 * every counter, with the known part's coloured in, so the empty ones are
 * the missing part) and one wrong card goes; 3 the answer glows.
 */
import { C } from '../art/palette';
import { hashString } from '../art/paper';
import { tileCard } from '../art/ui';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, smFrom } from '../ui/anim';
import { h, place } from '../ui/dom';
import { cardRow, enter, Shell, sumText } from './a-kit';
import { cardValues, partWholeShape } from './a-logic';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

/** Colours for the parts' counters (the whole shows them too). */
const PART_COLOURS = [C.red, C.blue, C.gold, C.green];

interface Basket {
  el: HTMLElement;
  value: HTMLElement;
  dots: HTMLElement;
}

export function partWhole(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  const shape = v.type === 'partWhole' ? partWholeShape(v.whole, v.parts, p.answer) : null;
  if (v.type !== 'partWhole' || !shape) return choose(p, ctx);
  const shell = new Shell('partWhole');
  const bar = v.model === 'bar';
  const n = shape.parts.length;

  const basket = (cls: string, x: number, y: number, w: number, hh: number, value: number, missing: boolean, seed: string): Basket => {
    const el = h('div', { class: `pw-box ${cls}${missing ? ' missing' : ''}` });
    if (!missing) el.innerHTML = tileCard(w, hh, hashString(seed), cls.includes('whole') ? C.sand : C.cream);
    const val = h('span', { class: 'pw-n' }, missing ? '?' : String(value));
    const dots = h('div', { class: 'pw-dots' });
    el.append(dots, val);
    shell.add(place(el, x, y, w, hh));
    return { el, value: val, dots };
  };

  let whole: Basket;
  const parts: Basket[] = [];
  let stalks: HTMLElement | null = null;

  if (!bar) {
    // Cherry: the whole on top, the parts below on stalks.
    const R = 150;
    const wx = 590 - R / 2;
    const wy = 112;
    const py = 316;
    const spread = n === 2 ? 340 : 260;
    const pxs = shape.parts.map((_, i) => 590 + (i - (n - 1) / 2) * spread);
    const lines = pxs.map((px) => `<line x1="590" y1="${wy + R - 10}" x2="${px}" y2="${py + 12}"/>`).join('');
    stalks = shell.add(place(h('div', { class: 'pw-stalks', html: `<svg viewBox="0 0 1180 820" aria-hidden="true">${lines}</svg>` }), 0, 0, 1180, 820));
    whole = basket('pw-whole round', wx, wy, R, R, shape.whole, shape.missing === -1, 'whole' + p.key);
    shape.parts.forEach((val, i) => parts.push(basket('pw-part round', pxs[i] - R / 2, py, R, R, val, shape.missing === i, 'part' + i + p.key)));
  } else {
    // Bar: the whole as one long bar; the parts underneath, sized by value.
    const W = 760;
    const x0 = 590 - W / 2;
    whole = basket('pw-whole bar', x0, 140, W, 130, shape.whole, shape.missing === -1, 'whole' + p.key);
    let x = x0;
    shape.parts.forEach((val, i) => {
      const w = shape.whole ? Math.max(110, (W * val) / shape.whole) : W / n;
      const ww = i === n - 1 ? x0 + W - x : Math.min(w, x0 + W - x - 110 * (n - 1 - i));
      parts.push(basket('pw-part bar', x, 290, ww, 130, val, shape.missing === i, 'part' + i + p.key));
      x += ww;
    });
  }
  const gap = shape.missing === -1 ? whole : parts[shape.missing];

  sumText(shell, p, 470);
  const cards = cardRow(shell, cardValues(p), p.answer, (val) => {
    ctx.sfx('tap');
    // The number drops into the gap while the scene decides.
    gsap.killTweensOf(gap.value);
    gsap.set(gap.value, { y: 0, opacity: 1 });
    gap.value.textContent = String(val);
    gap.el.classList.add('filled');
    if (!ctx.calm) smFrom(gap.value, 0.2, { y: -30, opacity: 0 });
    ctx.answer(val);
  });

  /** Help 2: counters in every basket. */
  const showDots = () => {
    const fill = (b: Basket, colours: string[], hollow: number) => {
      b.dots.replaceChildren();
      colours.forEach((c) => b.dots.append(h('i', { style: `background:${c}` })));
      for (let k = 0; k < hollow; k++) b.dots.append(h('i', { class: 'hollow' }));
      b.el.classList.add('with-dots');
    };
    shape.parts.forEach((val, i) => {
      if (i !== shape.missing) fill(parts[i], Array(val).fill(PART_COLOURS[i % 4]), 0);
    });
    if (shape.missing === -1) return;
    // The whole: the known parts coloured, the missing part as empty rings.
    const colours = shape.parts.flatMap((val, i) => (i === shape.missing ? [] : Array<string>(val).fill(PART_COLOURS[i % 4])));
    fill(whole, colours, shape.parts[shape.missing]);
  };

  return {
    el: shell.el,
    show() {
      enter([...(stalks ? [stalks] : []), whole.el, ...parts.map((b) => b.el)], ctx.calm);
      cards.show(ctx.calm);
    },
    wrong(val: Answer) {
      cards.wrong(val);
      // Lift the wrong number back out of the gap.
      const clear = () => {
        gap.value.textContent = '?';
        gap.el.classList.remove('filled');
        gsap.set(gap.value, { y: 0, opacity: 1 });
      };
      if (ctx.calm) clear();
      else gsap.to(gap.value, { y: -24, opacity: 0, duration: 0.25, delay: 0.3, ease: 'steps(3)', onComplete: clear });
    },
    async right() {
      gap.el.classList.add('is-right');
      await Promise.all([cards.right(), pop(gap.el, 1.1)]);
    },
    help(level) {
      if (level === 1) {
        gap.el.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        showDots();
        cards.dropOne();
        return;
      }
      showDots();
      cards.showAnswer();
    },
    lock(on) {
      shell.locked = on;
    },
    destroy() {
      shell.destroy();
    },
  };
}
