/**
 * Shared bits for W2c's activities (clock, coins, shape): the tap guard
 * and clean-up, torn-paper answer cards, step buttons and the OK seal.
 */
import { C } from '../art/palette';
import { hashString } from '../art/paper';
import { tileCard } from '../art/ui';
import type { Answer } from '../core/problem';
import { gsap, pop, wobble } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, onTap, place } from '../ui/dom';

/** Holds an activity's layer, its tap handlers and its lock. */
export class Kit {
  readonly el: HTMLElement;
  locked = false;
  private cleanups: (() => void)[] = [];

  constructor(kind: string) {
    this.el = h('div', { class: `activity c-activity activity-${kind}` });
  }

  /** A tap handler that is ignored while locked, removed on destroy. */
  tap(target: Element, fn: () => void): void {
    this.cleanups.push(
      onTap(target as HTMLElement, () => {
        if (!this.locked) fn();
      }),
    );
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    gsap.killTweensOf(this.el.querySelectorAll('*'));
    this.el.remove();
  }
}

/** Splits text so the numbers in it can be drawn big ("half past <3>"). */
function bigNumbers(text: string, numSize: number): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return esc.replace(/(£?\d+(?::\d\d|\.\d\d)?p?)/g, `<span class="c-num" style="font-size:${numSize}px">$1</span>`);
}

/**
 * A torn-paper answer card (like choose's), for words as well as numbers:
 * the numbers in it stay 64 px or more, the words around them smaller.
 */
export function answerCard(text: string, value: Answer, x: number, y: number, w: number, hgt: number, o: { size?: number; fill?: string } = {}): HTMLElement {
  const card = h('button', {
    class: 'choice c-card',
    'aria-label': text,
    'data-value': String(value),
    html: tileCard(w, hgt, hashString('c-card' + text), o.fill ?? C.cream),
  });
  const size = o.size ?? (text.length <= 3 ? 72 : text.length <= 6 ? 60 : 40);
  card.append(h('span', { class: 'choice-text c-card-text', style: `font-size:${size}px`, html: bigNumbers(text, Math.max(64, size)) }));
  return place(card, x, y, w, hgt);
}

/** x positions to centre n items of width w with a gap, on the stage. */
export function rowX(n: number, w: number, gap: number, centre = 590): number[] {
  const x0 = centre - (n * w + (n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => x0 + i * (w + gap));
}

/** A big + or − button, tinted to match what it changes. */
export function stepButton(sign: '+' | '−', aria: string, x: number, y: number, fill: string, step: string): HTMLElement {
  const b = h('button', { class: 'choice c-step', 'aria-label': aria, 'data-step': step, html: tileCard(100, 100, hashString('step' + step), fill) });
  b.append(h('span', { class: 'choice-text', style: 'font-size:72px' }, sign));
  return place(b, x, y, 100, 100);
}

/** The green wax seal with a tick that says "I'm done". */
export function okButton(x: number, y: number, size = 120): HTMLButtonElement {
  const b = sealButton('tick', { x, y, size, color: C.greenDark, aria: 'OK', name: 'c-ok' });
  b.classList.add('c-ok');
  b.dataset.ok = '';
  return b;
}

/** Fades a card away (help level 2 takes away one wrong choice). */
export function removeCard(card: HTMLElement, calm: boolean): void {
  card.setAttribute('disabled', '');
  if (calm) {
    card.remove();
    return;
  }
  gsap.to(card, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in', onComplete: () => card.remove() });
}

/** Cards slide up into place when the problem appears. */
export function enter(els: Element[], calm: boolean): void {
  if (calm || !els.length) return;
  gsap.from(els, { y: 60, opacity: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' });
}

export { pop, wobble };
