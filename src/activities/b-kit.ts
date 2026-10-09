/**
 * Shared pieces for workstream W2b's activities (compare, tensOnes, groups,
 * share, fraction): the activity layer with tap handling and locking, big
 * answer cards, the OK seal for "build it" answers, and small helpers for
 * help steps and smooth movement.
 *
 * Every answer target carries `data-value` (what tapping it would answer),
 * so the e2e tests can find it. The OK seal's `data-value` follows what he
 * has built, so after Silky builds the answer (help 3) it matches too.
 */
import { C } from '../art/palette';
import { hashString } from '../art/paper';
import { tileCard } from '../art/ui';
import type { Answer } from '../core/problem';
import { sealButton } from '../ui/components';
import { gsap, pop, sm, smFrom, wobble } from '../ui/anim';
import { h, onTap, place } from '../ui/dom';
import type { ActivityContext } from './types';
import { crocSymbol } from './b-art';

export interface Kit {
  el: HTMLElement;
  ctx: ActivityContext;
  /** Taps are ignored while locked (transitions, after a right answer). */
  locked: () => boolean;
  lock: (on: boolean) => void;
  /** Calls fn on a tap, unless locked. */
  tap: (target: Element, fn: () => void) => void;
  destroy: () => void;
}

export function kit(kind: string, ctx: ActivityContext): Kit {
  const el = h('div', { class: `activity activity-${kind} b-activity` });
  const cleanups: (() => void)[] = [];
  let locked = false;
  return {
    el,
    ctx,
    locked: () => locked,
    lock: (on) => {
      locked = on;
    },
    tap: (target, fn) => {
      // onTap only needs what SVG elements have too (classList, listeners, a box).
      cleanups.push(onTap(target as HTMLElement, () => !locked && fn()));
    },
    destroy: () => {
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf(el.querySelectorAll('*'));
      el.remove();
    },
  };
}

// ---------------------------------------------------------------------------
// Answer labels and cards
// ---------------------------------------------------------------------------

export const SYMBOLS = ['<', '>', '='] as const;
export const isSymbol = (a: Answer): boolean => (SYMBOLS as readonly string[]).includes(String(a));
export const isFraction = (a: Answer): boolean => /^\d+\/\d+$/.test(String(a));

/** What a card shows for an answer: a numeral, a stacked fraction, a crocodile symbol or a word. */
export function labelHtml(a: Answer): string {
  const s = String(a);
  if (isSymbol(s)) return `<span class="b-symbol">${crocSymbol(s as '<' | '>' | '=')}</span>`;
  if (isFraction(s)) {
    const [n, d] = s.split('/');
    return `<span class="b-frac"><span>${n}</span><span class="b-frac-bar"></span><span>${d}</span></span>`;
  }
  if (typeof a === 'number' || /^\d+$/.test(s)) return `<span class="choice-text">${s}</span>`;
  return `<span class="choice-text b-word">${s}</span>`;
}

const cardWidth = (a: Answer): number => {
  const s = String(a);
  if (isSymbol(s) || isFraction(s) || /^\d+$/.test(s)) return 150;
  return Math.max(170, Math.min(300, s.length * 30 + 60));
};

export interface CardOpts {
  y?: number;
  size?: number;
  /** Custom card face and width (fraction pictures). */
  face?: (a: Answer) => string;
  width?: (a: Answer) => number;
  /** Called after the answer is given (e.g. to show it in the sum). */
  onPick?: (a: Answer) => void;
}

/** A row of big torn-paper answer cards along the bottom. Returns them by value. */
export function answerCards(k: Kit, choices: Answer[], o: CardOpts = {}): Map<string, HTMLElement> {
  const size = o.size ?? 150;
  let widths = choices.map((c) => (o.width ? o.width(c) : cardWidth(c)) * (size / 150));
  // The row stays between the child's portrait (x 150) and the finale's
  // desk edge (x 1035): closer gaps first, then narrower cards.
  const [left, right] = [160, 1030];
  const sum = () => widths.reduce((s, w) => s + w, 0);
  let gap = 40;
  if (sum() + gap * (choices.length - 1) > right - left) gap = 16;
  const room = right - left - gap * (choices.length - 1);
  if (sum() > room) widths = widths.map((w) => (w * room) / sum());
  const total = sum() + gap * (choices.length - 1);
  let x = Math.min(right - total, Math.max(left, 590 - total / 2));
  const cards = new Map<string, HTMLElement>();
  choices.forEach((c, i) => {
    const w = widths[i];
    const card = h('button', {
      class: 'choice b-choice',
      'aria-label': String(c),
      'data-value': String(c),
      html: tileCard(w, size, hashString('b-choice' + i + String(c)), C.cream) + (o.face ? o.face(c) : labelHtml(c)),
    });
    place(card, x, o.y ?? 600, w, size);
    x += w + gap;
    k.tap(card, () => {
      k.ctx.sfx('tap');
      k.ctx.answer(c);
      o.onPick?.(c);
    });
    cards.set(String(c), card);
    k.el.append(card);
  });
  return cards;
}

/** Help 2: one wrong card folds away (only while two or more wrong ones are left). */
export function removeOneWrong(cards: Map<string, HTMLElement>, answer: Answer): void {
  const wrong = [...cards.entries()].filter(([v, c]) => v !== String(answer) && c.isConnected && !c.classList.contains('is-gone'));
  if (wrong.length < 2) return;
  const [, gone] = wrong[0];
  gone.classList.add('is-gone');
  void sm(gone, 0.3, { opacity: 0, scale: 0.6, rotation: -8, onComplete: () => gone.remove() });
}

/** The cards rise into place, a frame at a time. */
export function cardsIn(cards: Iterable<HTMLElement>): void {
  [...cards].forEach((c, i) => void smFrom(c, 0.35, { y: 60, opacity: 0, delay: 0.1 + i * 0.06 }));
}

/** Celebrates the right card. */
export async function cardRight(card: HTMLElement | undefined): Promise<void> {
  if (!card) return;
  card.classList.add('is-right');
  await pop(card, 1.2);
}

export function wobbleValue(k: Kit, value: Answer): void {
  const t = k.el.querySelector<HTMLElement>(`[data-value="${CSS.escape(String(value))}"]`);
  if (t) void wobble(t);
}

export function hintAnswer(k: Kit, answer: Answer): void {
  k.el.querySelectorAll('.hint-answer').forEach((e) => e.classList.remove('hint-answer'));
  k.el.querySelector(`[data-value="${CSS.escape(String(answer))}"]`)?.classList.add('hint-answer');
}

// ---------------------------------------------------------------------------
// Building: the OK seal and the "take one back" seal
// ---------------------------------------------------------------------------

/** The tick seal that hands in what he has built. Its data-value is kept up to date by the activity. */
export function okSeal(k: Kit, x: number, y: number, onOk: () => void, size = 128): HTMLButtonElement {
  const ok = sealButton('tick', { x, y, size, color: C.green, aria: 'Done', name: 'b-ok' });
  ok.classList.add('b-ok');
  ok.dataset.role = 'ok';
  k.tap(ok, () => {
    k.ctx.sfx('tap');
    void pop(ok, 1.1);
    onOk();
  });
  k.el.append(ok);
  return ok;
}

/** A seal that takes back the last piece he placed (for pieces too small to tap one by one). */
export function backSeal(k: Kit, x: number, y: number, onBack: () => void): HTMLButtonElement {
  const btn = sealButton('again', { x, y, size: 104, color: C.slate, aria: 'Take one back', name: 'b-back' });
  btn.classList.add('b-back');
  btn.dataset.role = 'back';
  k.tap(btn, () => {
    k.ctx.sfx('lift');
    onBack();
  });
  k.el.append(btn);
  return btn;
}

/** Written sum or question under the picture, if the problem has one. */
export function sumText(k: Kit, text: string | undefined, y = 470): HTMLElement | null {
  if (!text) return null;
  const el = place(h('div', { class: 'sum-text b-sum' }, text), 160, y, 860, 90);
  k.el.append(el);
  return el;
}

// ---------------------------------------------------------------------------
// Movement
// ---------------------------------------------------------------------------

/**
 * Moves an element (already in its final place) in from a point, smoothly:
 * dx, dy is where it starts relative to where it ends.
 */
export function flyIn(el: HTMLElement, dx: number, dy: number, duration = 0.4): Promise<void> {
  return new Promise((resolve) => {
    void sm(el, duration, {
      startAt: { x: dx, y: dy, rotation: dx > 0 ? 12 : -12, scale: 0.9 },
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      ease: 'power2.out',
      onComplete: () => resolve(),
    });
  });
}

/** Lifts an element off and removes it. */
export function liftOff(el: HTMLElement): void {
  void sm(el, 0.25, { y: -30, opacity: 0, scale: 0.8, ease: 'power2.in', onComplete: () => el.remove() });
}

/** Centre of an element in stage coordinates (the activity layer is the stage). */
export function stageCentre(el: HTMLElement, layer: HTMLElement): [number, number] {
  const r = el.getBoundingClientRect();
  const s = layer.getBoundingClientRect();
  const scale = s.width / 1180 || 1;
  return [(r.left + r.width / 2 - s.left) / scale, (r.top + r.height / 2 - s.top) / scale];
}

/** A small numbered tag (counting help: "4", "8", "12"). */
export function countTag(text: string | number, x: number, y: number, w = 64): HTMLElement {
  return place(h('div', { class: 'b-tag' }, String(text)), x - w / 2, y, w, 48);
}

/** Fallback choices when a problem has none: the answer and its neighbours. */
export function fallbackChoices(answer: Answer): Answer[] {
  const n = Number(answer);
  if (!Number.isFinite(n)) return [answer];
  return [n - 1, n, n + 1].filter((v) => v >= 0);
}
