/**
 * `compare`: two groups or numbers on the Saucepan Man's scales.
 *
 * What he does depends on the answer the problem wants:
 *   - a side (the bigger or smaller number, or "left" / "right"): he taps
 *     that pan of the scales,
 *   - "<", ">" or "=": he chooses a crocodile card (the crocodile's jaws are
 *     the symbol, and it always wants to eat the bigger number); it drops
 *     into the gap in the written sum,
 *   - anything else (more / fewer / the same, the biggest of three …): big
 *     cards from the problem's choices.
 *
 * The scales hang level while he thinks, so they don't give the answer
 * away. "Show me" (help 2) tips them: the heavier side goes down, and
 * groups get their counts written under them.
 */
import { prop } from '../art/props';
import type { Answer, Problem, PropId } from '../core/problem';
import { pop, sm } from '../ui/anim';
import { h, place } from '../ui/dom';
import { beamArt, bundleArt, panArt, scalesStandArt, stickArt } from './b-art';
import { answerCards, cardRight, cardsIn, countTag, hintAnswer, isSymbol, kit, labelHtml, removeOneWrong, SYMBOLS, wobbleValue } from './b-kit';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

const PIVOT = { x: 590, y: 170 };
const ARM = 270;
const PAN = { w: 330, h: 250 };
const TILT = 7;

export function compare(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type !== 'compare') return choose(p, ctx);
  const k = kit('compare', ctx);
  const { el } = k;
  const answer = String(p.answer);
  const choices = p.choices ?? [];

  // Which way he answers.
  const bySide = answer === 'left' || answer === 'right';
  const sideNumbers = [String(v.left), String(v.right)];
  const byPan = bySide || (sideNumbers.includes(answer) && choices.every((c) => sideNumbers.includes(String(c))));
  const bySymbol = !byPan && isSymbol(answer);

  // --- The scales ---
  el.append(place(h('div', { class: 'b-scales-stand', html: scalesStandArt() }), 160, 110, 860, 360));
  const beam = place(h('div', { class: 'b-beam', html: beamArt() }), PIVOT.x - 300, PIVOT.y - 20, 600, 40);
  const pans = [v.left, v.right].map((n, i) => {
    const value = bySide ? (i ? 'right' : 'left') : String(n);
    const pan = h(byPan ? 'button' : 'div', { class: 'b-pan', html: panArt(PAN.w, PAN.h) });
    if (byPan) {
      pan.dataset.value = value;
      pan.setAttribute('aria-label', String(n));
      k.tap(pan, () => {
        ctx.sfx('tap');
        ctx.answer(value);
      });
    }
    pan.append(panContents(n, i ? v.left : v.right, v.asObjects));
    el.append(pan);
    return pan;
  });
  el.append(beam);

  // Hangs each pan from its end of the beam at the given tilt (degrees).
  const hang = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a) * ARM;
    const dy = Math.sin(a) * ARM;
    place(pans[0], PIVOT.x - dx - PAN.w / 2, PIVOT.y - dy + 6);
    place(pans[1], PIVOT.x + dx - PAN.w / 2, PIVOT.y + dy + 6);
  };
  hang(0);
  let tilt = 0;
  const tiltTo = (deg: number) => {
    if (deg === tilt) return Promise.resolve();
    const state = { a: tilt };
    tilt = deg;
    return new Promise<void>((resolve) => {
      void sm(state, 0.8, {
        a: deg,
        ease: 'back.out(1.6)',
        onUpdate: () => {
          beam.style.transform = `rotate(${state.a}deg)`;
          hang(state.a);
        },
        onComplete: () => resolve(),
      });
    });
  };
  const truth = Math.sign(v.right - v.left) * TILT;

  // --- The written sum, with a gap for the symbol ---
  let gap: HTMLElement | null = null;
  if (bySymbol) {
    gap = h('span', { class: 'b-gap' }, '?');
    const line = place(h('div', { class: 'sum-text b-sum b-compare-sum' }, [h('span', {}, String(v.left)), gap, h('span', {}, String(v.right))]), 160, 470, 860, 100);
    el.append(line);
  } else if (p.text) {
    el.append(place(h('div', { class: 'sum-text b-sum' }, p.text), 160, 470, 860, 90));
  }

  // --- Cards ---
  let cards = new Map<string, HTMLElement>();
  if (!byPan) {
    const opts = bySymbol ? (choices.length && choices.every(isSymbol) ? choices : [...SYMBOLS]) : choices.length ? choices : [p.answer];
    cards = answerCards(k, opts, {
      y: 600,
      size: bySymbol ? 160 : 150,
      onPick: (c) => {
        if (gap && String(c) === answer) gap.innerHTML = labelHtml(c);
      },
    });
  }

  const countsShown: HTMLElement[] = [];
  const showCounts = () => {
    if (countsShown.length || !v.asObjects) return;
    pans.forEach((pan, i) => {
      const tag = countTag(i ? v.right : v.left, 0, 0, 80);
      tag.classList.add('b-pan-count');
      place(tag, PAN.w / 2 - 40, PAN.h + 2, 80, 48);
      pan.append(tag);
      countsShown.push(tag);
    });
  };

  return {
    el,
    show() {
      cardsIn(cards.values());
    },
    wrong(value: Answer) {
      wobbleValue(k, value);
    },
    async right() {
      const target = el.querySelector<HTMLElement>(`[data-value="${CSS.escape(answer)}"]`);
      if (gap) gap.innerHTML = labelHtml(answer);
      showCounts();
      void tiltTo(truth);
      if (byPan && target) {
        target.classList.add('is-right');
        await pop(target, 1.08);
      } else {
        await cardRight(target ?? undefined);
      }
      await new Promise((r) => setTimeout(r, 500));
    },
    help(level) {
      if (level === 1) {
        el.querySelector('.b-scales-stand')?.classList.add('hint-glow');
        pans.forEach((pan) => pan.classList.add('hint-glow'));
        return;
      }
      if (level === 2) {
        void tiltTo(truth);
        showCounts();
        removeOneWrong(cards, p.answer);
        return;
      }
      void tiltTo(truth);
      showCounts();
      el.querySelectorAll('.hint-glow').forEach((g) => g.classList.remove('hint-glow'));
      hintAnswer(k, p.answer);
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}

/** What sits in a pan: a big number, a group of objects, or bundles and sticks. Both pans share one scale. */
function panContents(n: number, other: number, asObjects: PropId | undefined): HTMLElement {
  const W = PAN.w - 32;
  const H = 172;
  const box = place(h('div', { class: 'b-pan-load' }), 16, 40, W, H);
  if (asObjects === 'stick') {
    const fit = Math.min(fitStick(Math.floor(n / 10), n % 10, W, H), fitStick(Math.floor(other / 10), other % 10, W, H));
    box.append(bundleRow(Math.floor(n / 10), n % 10, W, H, fit));
  } else if (asObjects) {
    const most = Math.max(n, other, 1);
    const cols = Math.min(most, most <= 10 ? 5 : most <= 20 ? 7 : 10);
    const rows = Math.ceil(most / cols);
    const size = Math.floor(Math.min(64, (W - 8) / cols - 4, (H - 8) / rows - 4));
    const grid = h('div', { class: 'b-obj-grid', style: `grid-template-columns:repeat(${Math.min(cols, Math.max(n, 1))},${size}px);grid-auto-rows:${size}px` });
    for (let i = 0; i < n; i++) grid.append(h('div', { class: 'b-obj', html: prop(asObjects) }));
    box.append(grid);
  } else {
    box.append(h('div', { class: 'b-pan-num' }, String(n)));
  }
  return box;
}

/** The tallest stick (px) at which bundles and sticks fit a box, on at most two lines. */
export function fitStick(tens: number, ones: number, maxW: number, maxH: number): number {
  let stickH = Math.min(160, maxH);
  for (; stickH > 40; stickH -= 4) {
    const bw = stickH * 0.4 + 4;
    const sw = stickH * 0.15 + 2;
    const width = tens * bw + (ones ? 12 : 0) + ones * sw;
    if (width <= maxW) break;
    if (width <= maxW * 2 && stickH * 2 + 8 <= maxH) break;
  }
  return stickH;
}

/**
 * Bundles and loose sticks, sized to fit a box: the bundles in one row
 * and the sticks beside them (or wrapped underneath when there are many).
 */
export function bundleRow(tens: number, ones: number, maxW: number, maxH: number, stickH = fitStick(tens, ones, maxW, maxH)): HTMLElement {
  const row = h('div', { class: 'b-bundle-row' });
  row.style.setProperty('--stick-h', `${stickH}px`);
  for (let i = 0; i < tens; i++) row.append(h('div', { class: 'b-bundle', html: bundleArt() }));
  if (ones) {
    const loose = h('div', { class: 'b-loose' });
    for (let i = 0; i < ones; i++) loose.append(h('div', { class: 'b-stick', html: stickArt() }));
    row.append(loose);
  }
  return row;
}
