/**
 * Shared pieces for workstream W2a's activities: the activity's layer and
 * tap handling, the row of number cards, the written sum, and the big
 * "that's it" tick. Each activity builds its own picture on top.
 */
import { C } from '../art/palette';
import { hashString } from '../art/paper';
import { tileCard, waxSeal, type IconName } from '../art/ui';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, smFrom, wobble } from '../ui/anim';
import { h, onTap, place } from '../ui/dom';
import { cardToDrop } from './a-logic';

/** The activity's layer, its taps (ignored while locked) and cleanup. */
export class Shell {
  readonly el: HTMLElement;
  locked = false;
  private cleanups: (() => void)[] = [];

  constructor(kind: string) {
    this.el = h('div', { class: `activity activity-${kind} act-a` });
  }

  tap(target: HTMLElement, fn: () => void): void {
    this.cleanups.push(
      onTap(target, () => {
        if (!this.locked) fn();
      }),
    );
  }

  add<T extends HTMLElement>(child: T): T {
    this.el.append(child);
    return child;
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    gsap.killTweensOf(this.el.querySelectorAll('*'));
    this.el.remove();
  }
}

/** The written sum just under the picture ("4 + 3 = ?"), if this tier shows one. */
export function sumText(shell: Shell, p: Problem, y = 470): HTMLElement | null {
  if (!p.text) return null;
  return shell.add(place(h('div', { class: 'sum-text' }, p.text), 160, y, 860, 90));
}

export interface CardRow {
  cards: Map<string, HTMLElement>;
  /** Slides the cards in. */
  show(): void;
  wrong(v: Answer): void;
  /** Help level 2: one wrong card goes. */
  dropOne(): void;
  /** Help level 3: the answer card glows for him to tap. */
  showAnswer(): void;
  right(): Promise<void>;
}

/**
 * A row of big torn-paper number cards (`.choice[data-value]`), centred
 * along the bottom. Tapping one gives that answer.
 */
export function cardRow(shell: Shell, values: Answer[], answer: Answer, onPick: (v: Answer) => void, o: { y?: number; size?: number; cx?: number } = {}): CardRow {
  const size = o.size ?? 150;
  const y = o.y ?? 600;
  const gap = values.length > 4 ? 24 : 40;
  const x0 = (o.cx ?? 590) - (values.length * size + (values.length - 1) * gap) / 2;
  const cards = new Map<string, HTMLElement>();
  values.forEach((v, i) => {
    const card = h('button', { class: 'choice', 'aria-label': String(v), 'data-value': String(v), html: tileCard(size, size, hashString('choice' + i + String(v)), C.cream) });
    card.append(h('span', { class: 'choice-text' }, String(v)));
    place(card, x0 + i * (size + gap), y, size, size);
    shell.tap(card, () => onPick(v));
    cards.set(String(v), card);
    shell.add(card);
  });
  const live = () => values.filter((v) => cards.get(String(v))?.isConnected && !cards.get(String(v))?.classList.contains('going'));
  return {
    cards,
    show() {
      gsap.from([...cards.values()], { y: 60, opacity: 0, duration: 0.3, stagger: 0.06, ease: 'back.out(1.4)', clearProps: 'opacity' });
    },
    wrong(v) {
      const card = cards.get(String(v));
      if (card) void wobble(card);
    },
    dropOne() {
      const v = cardToDrop(live(), answer);
      const gone = v === null ? undefined : cards.get(String(v));
      if (!gone) return;
      gone.classList.add('going');
      gsap.to(gone, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in', onComplete: () => gone.remove() });
    },
    showAnswer() {
      cards.get(String(answer))?.classList.add('hint-answer');
    },
    async right() {
      const card = cards.get(String(answer));
      if (!card) return;
      card.classList.add('is-right');
      await pop(card, 1.2);
    },
  };
}

/** A big wax-seal button (hop, done …) with a tap target of at least 96 px. */
export function seal(shell: Shell, icon: IconName, o: { x: number; y: number; size?: number; color?: string; aria: string; cls?: string }, fn: () => void): HTMLButtonElement {
  const size = o.size ?? 120;
  const btn = h('button', { class: `seal-btn ${o.cls ?? ''}`, 'aria-label': o.aria, html: waxSeal(icon, o.color ?? C.green, size, `${icon}-${o.cls ?? o.x}`) }) as HTMLButtonElement;
  place(btn, o.x, o.y, size, size);
  shell.tap(btn, fn);
  return shell.add(btn);
}

/** Entrance for the picture: drops in a few frames. */
export function enter(els: Element[]): void {
  if (!els.length) return;
  // clearProps: leave no inline opacity behind to override classes like .faded.
  smFrom(els, 0.35, { y: -24, opacity: 0, stagger: 0.03, clearProps: 'opacity' });
}

/** A round paper counter (when the problem has no prop). */
export function counterDisc(color: string, seed: string): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="52" cy="55" r="40" fill="rgba(40,24,10,0.28)"/><path d="${discPath(seed)}" fill="${color}"/><circle cx="38" cy="36" r="10" fill="rgba(255,255,255,0.22)"/></svg>`;
}

function discPath(seed: string): string {
  // A slightly uneven circle, cut by hand.
  let s = hashString(seed);
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const r = 40 + ((s % 100) / 100 - 0.5) * 3;
    const a = (i / 16) * Math.PI * 2;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
}

/** Says a number aloud (counting as he taps). */
export const sayNumber = (say: (s: { text: string; vals: Record<string, number> }) => void, n: number): void => say({ text: '{n}', vals: { n } });
