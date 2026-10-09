/**
 * `coins`: the toy shop (docs/PLAN.md §5), with real UK coins, 1p to £2.
 *
 * Three ways to play, chosen by the problem:
 *
 *   - **Count** (`choices`, and coins to count in the visual): the coins
 *     are shown and he chooses how much they make. Number choices are
 *     amounts in pence, shown as money ("12p", "£1").
 *   - **Know the coins** (`choices` that are all coin values and are the
 *     coins in the visual, or no coins in the visual): the choices are
 *     drawn as coins, and he taps the one asked for ("Find the 50p").
 *   - **Pay** (`visual.target`; any `choices` are ignored): a price tag, an
 *     empty shop counter and a purse holding the coins in `visual.coins`.
 *     He taps purse coins onto the counter, taps a coin on the counter to
 *     put it back in the purse, then taps OK. (With no coins given, the
 *     purse has one of each kind up to the price, as many as he likes.)
 *     The amount is answered
 *     in the same form as the problem's answer (15 or "15p").
 *
 * Help: 1 the coins (or the price) glow; 2 the coins line up biggest first
 * with a running total under them (or the counter shows its total) and a
 * wrong card goes; 3 the right card glows, or faint coins on the counter
 * show which to pay with.
 */
import { C } from '../art/palette';
import { piece, rect, svg } from '../art/paper';
import type { Answer, Problem } from '../core/problem';
import { h, place } from '../ui/dom';
import { Kit, answerCard, enter, okButton, pop, removeCard, rowX, wobble } from './c-kit';
import type { Activity, ActivityContext } from './types';
import { COIN_VALUES, coinMm, coinNodes, drawCoin, label, moneyText, priceTag, renderVisual } from './visual';

const isCoin = (a: Answer): boolean => typeof a === 'number' && (COIN_VALUES as readonly number[]).includes(a);
/** The choices are the coins on the table: "find the 50p". */
const sameCoins = (a: number[], b: number[]): boolean => a.length === b.length && [...a].sort().join() === [...b].sort().join();
const moneyLabel = (a: Answer): string => (typeof a === 'number' ? moneyText(a) : a);

/**
 * Biggest coins first: the fewest coins that make the amount. With
 * `limited`, only the coins in it can be used (each once); with a search
 * when greedy gets stuck (e.g. 6p from 5p, 2p, 2p, 2p).
 */
export function payWith(amount: number, kinds: number[], limited?: number[]): number[] {
  if (!limited) {
    const out: number[] = [];
    let left = amount;
    for (const c of [...kinds].sort((a, b) => b - a)) {
      while (c <= left) {
        out.push(c);
        left -= c;
      }
    }
    return left === 0 ? out : [];
  }
  const coins = [...limited].sort((a, b) => b - a);
  const search = (i: number, left: number): number[] | null => {
    if (left === 0) return [];
    if (i >= coins.length || left < 0) return null;
    const take = search(i + 1, left - coins[i]);
    if (take) return [coins[i], ...take];
    return search(i + 1, left);
  };
  return search(0, amount) ?? [];
}

/** The coins in a row, biggest first, with the running total under each. */
function countingOn(coins: number[], w: number, hgt: number): string {
  const sorted = [...coins].sort((a, b) => b - a);
  const cell = Math.min(140, (w - 40) / Math.max(1, sorted.length));
  const x0 = (w - sorted.length * cell) / 2;
  const nodes = [];
  let total = 0;
  for (let i = 0; i < sorted.length; i++) {
    total += sorted[i];
    const cx = x0 + i * cell + cell / 2;
    nodes.push(...coinNodes(sorted[i], cx, hgt * 0.4, (cell * 0.92 * coinMm(sorted[i])) / 28.4));
    nodes.push(label(cx, hgt * 0.84, moneyText(total), Math.min(44, cell * 0.36), C.ink));
  }
  return svg({ w, h: hgt, name: 'counting-on', boil: false }, nodes);
}

export function coins(p: Problem, ctx: ActivityContext): Activity {
  const kit = new Kit('coins');
  const el = kit.el;
  const v = p.visual.type === 'coins' ? p.visual : { type: 'coins' as const, coins: [] as number[], target: undefined };
  const choices = p.choices ?? [];
  const mode: 'count' | 'know' | 'pay' = v.target !== undefined ? 'pay' : choices.length && choices.every(isCoin) && (!v.coins.length || sameCoins(choices as number[], v.coins)) ? 'know' : 'count';

  const cards = new Map<string, HTMLElement>();
  let picture: HTMLElement | null = null;
  const enterEls: Element[] = [];

  if (mode !== 'pay' && p.text) el.append(place(h('div', { class: 'sum-text c-sum' }, p.text), 160, 476, 860, 90));

  if (mode === 'count') {
    picture = place(renderVisual(v, 860, 360), 160, 110, 860, 360);
    el.append(picture);
    const long = choices.some((c) => moneyLabel(c).length > 3);
    const w = long ? (choices.length > 3 ? 200 : 220) : choices.length > 3 ? 180 : 200;
    const xs = rowX(choices.length, w, long ? 20 : 30);
    choices.forEach((c, i) => {
      const card = answerCard(moneyLabel(c), c, xs[i], 600, w, 150);
      kit.tap(card, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(String(c), card);
      el.append(card);
    });
    enterEls.push(...cards.values());
  }

  if (mode === 'know') {
    // The coin asked for, written on a torn card, to match with a coin.
    if (!p.text && isCoin(p.answer)) {
      picture = place(h('div', { class: 'c-sign', html: svg({ w: 300, h: 200, name: 'coin-sign', boil: false }, [piece(rect(10, 10, 280, 180, 12), C.cream), label(150, 102, moneyText(Number(p.answer)), 110, C.ink)]) }), 440, 170, 300, 200);
      el.append(picture);
    }
    const size = 170;
    const xs = rowX(choices.length, size, 36);
    choices.forEach((c, i) => {
      const btn = h('button', { class: 'choice c-coin c-coin-choice', 'aria-label': moneyText(Number(c)), 'data-value': String(c), html: drawCoin(Number(c), size) });
      place(btn, xs[i], 590, size, size);
      kit.tap(btn, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(String(c), btn);
      el.append(btn);
    });
    enterEls.push(...cards.values());
  }

  // ---- Pay ----
  // The purse is the coins in visual.coins, each a real coin that moves to
  // the counter and back. With no coins given, it holds one of each kind
  // up to the price, as many as he likes.
  const target = v.target ?? 0;
  const unlimited = !v.coins.length;
  const purse = unlimited ? COIN_VALUES.filter((c) => c <= Math.max(1, target)).slice(-6) : [...v.coins].sort((a, b) => b - a);
  /** Purse indexes on the counter, in the order he put them there. */
  const onCounter: number[] = [];
  const CELL = 104;
  const COUNTER = { x: 470, y: 108, w: 550, h: 360 };
  const MAX_ON_COUNTER = 15;
  let counterBox: HTMLElement | null = null;
  let totalTag: HTMLElement | null = null;
  let ghostBox: HTMLElement | null = null;
  let priceEl: HTMLElement | null = null;
  const purseBtns: HTMLElement[] = [];
  let ok: HTMLElement | null = null;

  const total = () => onCounter.reduce((a, i) => a + purse[i], 0);
  const slot = (i: number) => ({ x: 22 + (i % 5) * CELL, y: 52 + Math.floor(i / 5) * CELL });

  const drawCounter = () => {
    if (!counterBox) return;
    counterBox.querySelectorAll('.c-counter-coin').forEach((c) => c.remove());
    onCounter.forEach((pi, k) => {
      const c = purse[pi];
      const s = slot(k);
      const btn = h('button', { class: 'c-coin c-counter-coin', 'aria-label': `Take back ${moneyText(c)}`, 'data-coin': String(c), html: drawCoin(c, CELL) });
      place(btn, s.x, s.y, CELL, CELL);
      kit.tap(btn, () => {
        onCounter.splice(k, 1);
        ctx.sfx('lift');
        drawCounter();
      });
      counterBox?.append(btn);
    });
    // A coin on the counter has left the purse (unless the purse never runs out).
    purseBtns.forEach((btn, i) => btn.classList.toggle('c-spent', !unlimited && onCounter.includes(i)));
    counterBox.dataset.total = String(total());
    if (totalTag) totalTag.textContent = moneyText(total());
  };

  if (mode === 'pay') {
    priceEl = place(h('div', { class: 'c-price', html: svg({ w: 280, h: 220, name: 'price', boil: false }, priceTag(16, 50, 250, 150, target)) }), 168, 150, 280, 220);
    el.append(priceEl);
    counterBox = place(
      h('div', {
        class: 'c-counter',
        html: svg({ w: COUNTER.w, h: COUNTER.h, name: 'counter', boil: false }, [
          piece(rect(4, 30, COUNTER.w - 8, COUNTER.h - 34, 8), C.wood),
          piece(rect(4, 18, COUNTER.w - 8, 28, 6), C.barkLight, { edge: 'cut' }),
          piece(rect(16, 50, COUNTER.w - 32, COUNTER.h - 66, 6), C.sand, { edge: 'cut', shadow: false }),
        ]),
      }),
      COUNTER.x,
      COUNTER.y,
      COUNTER.w,
      COUNTER.h,
    );
    el.append(counterBox);

    const pw = Math.min(124, 640 / purse.length);
    const bs = Math.max(76, pw - 6);
    const purseW = purse.length * pw + 40;
    const purseX = Math.max(160, 520 - purseW / 2);
    el.append(
      place(
        h('div', { class: 'c-purse', html: svg({ w: purseW, h: 180, name: 'purse', boil: false }, [piece(rect(6, 14, purseW - 12, 160, 30), C.plum), piece(rect(26, 4, purseW - 52, 26, 12), C.purple, { edge: 'cut' })]) }),
        purseX,
        584,
        purseW,
        180,
      ),
    );
    purse.forEach((c, i) => {
      const btn = h('button', { class: 'c-coin c-purse-coin', 'aria-label': moneyText(c), 'data-value': String(c), html: drawCoin(c, bs) });
      place(btn, purseX + 20 + i * pw + (pw - bs) / 2, 674 - bs / 2, bs, bs);
      kit.tap(btn, () => {
        if (onCounter.length >= MAX_ON_COUNTER || (!unlimited && onCounter.includes(i))) {
          void wobble(btn);
          return;
        }
        onCounter.push(i);
        ctx.sfx('place');
        drawCounter();
        const placed = counterBox?.querySelectorAll<HTMLElement>('.c-counter-coin');
        const last = placed?.[placed.length - 1];
        if (last && !ctx.calm) void pop(last, 1.15);
      });
      purseBtns.push(btn);
      el.append(btn);
    });
    ok = okButton(890, 620, 120);
    kit.tap(ok, () => {
      if (!onCounter.length) {
        if (ok) void wobble(ok);
        return;
      }
      ctx.sfx('tap');
      const t = total();
      ctx.answer(typeof p.answer === 'number' ? t : moneyText(t));
    });
    el.append(ok);
    enterEls.push(...purseBtns, ok);
    drawCounter();
  }

  const wrongCards = () => [...cards.entries()].filter(([k, c]) => k !== String(p.answer) && c.isConnected && !c.hasAttribute('disabled'));

  return {
    el,
    show() {
      enter(enterEls, ctx.calm);
    },
    wrong(value: Answer) {
      const card = cards.get(String(value));
      void wobble(card ?? counterBox ?? el);
    },
    async right() {
      const card = cards.get(String(p.answer));
      card?.classList.add('is-right');
      await pop(card ?? counterBox ?? el, 1.08);
    },
    help(level) {
      if (level === 1) {
        (picture ?? priceEl)?.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        if (mode === 'count' && picture && v.coins.length) picture.innerHTML = countingOn(v.coins, 860, 360);
        if (mode === 'pay' && counterBox && !totalTag) {
          totalTag = place(h('div', { class: 'c-total' }, moneyText(total())), COUNTER.w - 150, COUNTER.h - 74, 130, 64);
          counterBox.append(totalTag);
        }
        const wrong = wrongCards();
        if (wrong.length > 1) removeCard(wrong[0][1], ctx.calm);
        return;
      }
      if (mode !== 'pay') {
        cards.get(String(p.answer))?.classList.add('hint-answer');
        return;
      }
      // Faint coins on the counter show what to pay with; he taps them in.
      // Asked again: they're already there, so leave what he has put down.
      if (ghostBox) return;
      const amount = typeof p.answer === 'number' ? p.answer : target;
      const plan = payWith(amount, unlimited ? purse : [...new Set(purse)], unlimited ? undefined : purse);
      onCounter.length = 0;
      drawCounter();
      ghostBox = h('div', { class: 'c-ghosts' });
      const used = new Set<number>();
      plan.forEach((c, k) => {
        const s = slot(k);
        ghostBox?.append(place(h('div', { class: 'c-ghost', html: drawCoin(c, CELL) }), s.x, s.y, CELL, CELL));
        const i = purse.findIndex((pc, j) => pc === c && !used.has(j));
        if (i >= 0) {
          if (!unlimited) used.add(i);
          purseBtns[i]?.classList.add('hint-answer');
        }
      });
      counterBox?.insertBefore(ghostBox, counterBox.querySelector('.c-counter-coin'));
    },
    lock(on) {
      kit.locked = on;
    },
    destroy() {
      kit.destroy();
    },
  };
}
