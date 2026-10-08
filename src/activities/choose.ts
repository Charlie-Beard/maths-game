/**
 * `choose` (and `count`): the picture, the written sum, and 3–4 big number
 * cards to choose from. Can show any problem, so it is the fallback for
 * activities that aren't built yet.
 *
 * In `count` problems the objects can be tapped: each one gets the next
 * number, said aloud, so he can count them before choosing.
 */
import { C } from '../art/palette';
import { tileCard } from '../art/ui';
import { hashString } from '../art/paper';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, wobble } from '../ui/anim';
import { h, onTap, place } from '../ui/dom';
import type { Activity, ActivityContext } from './types';
import { renderVisual } from './visual';

export function choose(p: Problem, ctx: ActivityContext): Activity {
  const el = h('div', { class: 'activity activity-choose' });
  const cleanups: (() => void)[] = [];
  let locked = false;

  const picture = place(renderVisual(p.visual, 860, 360), 160, 110, 860, 360);
  el.append(picture);
  if (p.text) el.append(place(h('div', { class: 'sum-text' }, p.text), 160, 470, 860, 90));

  // Count by tapping: each object gets the next number.
  let counted = 0;
  if (p.activity === 'count') {
    picture.querySelectorAll<HTMLElement>('.obj:not(.gone)').forEach((obj) => {
      cleanups.push(
        onTap(obj, () => {
          if (locked || obj.dataset.n) return;
          counted += 1;
          obj.dataset.n = String(counted);
          obj.append(h('span', { class: 'obj-count' }, String(counted)));
          ctx.sfx('tap');
          ctx.say({ text: '{n}', vals: { n: counted } });
          void pop(obj, 1.15);
        }),
      );
    });
  }

  const choices = p.choices ?? [p.answer];
  const cards = new Map<string, HTMLElement>();
  // Word answers ("the same", "half past 3") need wider cards and smaller type.
  const longest = Math.max(...choices.map((c) => String(c).length));
  const cw = longest <= 3 ? 150 : Math.min(240, Math.floor((860 - (choices.length - 1) * 24) / choices.length));
  const gap = longest <= 3 ? 40 : 24;
  const fontSize = longest <= 3 ? undefined : longest <= 5 ? 48 : longest <= 8 ? 36 : 28;
  const x0 = 590 - (choices.length * cw + (choices.length - 1) * gap) / 2;
  choices.forEach((c, i) => {
    const card = h('button', { class: 'choice', 'aria-label': String(c), 'data-value': String(c), html: tileCard(cw, cw, hashString('choice' + i + String(c)), C.cream) });
    card.append(h('span', { class: 'choice-text', style: fontSize ? `font-size:${fontSize}px;padding:0 10px;text-align:center;line-height:1.1` : undefined }, String(c)));
    place(card, x0 + i * (cw + gap), 600, cw, cw);
    cleanups.push(
      onTap(card, () => {
        if (locked) return;
        ctx.sfx('tap');
        ctx.answer(c);
      }),
    );
    cards.set(String(c), card);
    el.append(card);
  });

  const wrongOnes = () => choices.filter((c) => String(c) !== String(p.answer) && cards.get(String(c))?.isConnected);

  return {
    el,
    show() {
      if (ctx.calm) return;
      gsap.from([...cards.values()], { y: 60, opacity: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' });
    },
    wrong(value: Answer) {
      const card = cards.get(String(value));
      if (card) void wobble(card);
    },
    async right() {
      const card = cards.get(String(p.answer));
      card?.classList.add('is-right');
      if (card) await pop(card, 1.2);
    },
    help(level) {
      if (level === 1) {
        picture.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        const extra = wrongOnes();
        if (extra.length > 1) {
          const gone = cards.get(String(extra[0]));
          if (gone) gsap.to(gone, { opacity: 0, scale: 0.6, duration: 0.25, onComplete: () => gone.remove() });
        }
        return;
      }
      cards.get(String(p.answer))?.classList.add('hint-answer');
    },
    lock(on) {
      locked = on;
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf(el.querySelectorAll('*'));
      el.remove();
    },
  };
}
