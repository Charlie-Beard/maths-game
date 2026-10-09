/**
 * `measure`: heavier, fuller or hotter? He taps the thing itself (the
 * heavier sack, the fuller jug, the hotter thermometer), so he never has to
 * read a word card.
 *
 * Two ways to play, chosen by how many things the picture holds:
 *
 *   - **Two things** (the answer is 'left' or 'right'): tap one.
 *   - **Three things** (the answer is their order, '1,0,2'): tap them one at
 *     a time, first to last. Each gets a number badge as he taps it; tapping
 *     a badged one takes it (and the later ones) back. When the third is
 *     tapped the order is given.
 *
 * The picture holds still while he thinks (visuals/measure.ts); the tap
 * targets are invisible buttons over each thing, with a dashed frame that
 * shows when it is wrong, glowing or right.
 *
 * Help: 1 every thing is framed; 2 a wrong thing is washed out (in an order,
 * the first one is put in place for him); 3 the right thing glows (in an
 * order, faint numbers show the whole order and the next one glows).
 */
import type { Answer, Problem } from '../core/problem';
import { pop, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { kit } from './b-kit';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';
import { renderVisual } from './visual';
import { measureItems } from './visuals/measure';

const BOX = { x: 160, y: 110, w: 860, h: 360 };

export function measure(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type !== 'measure' || v.values.length < 2) return choose(p, ctx);
  const k = kit('measure', ctx);
  const { el } = k;
  const timers: number[] = [];
  const n = v.values.length;
  const ordering = n > 2;
  const answer = String(p.answer);
  const truth = ordering ? answer.split(',') : [answer];

  const picture = place(renderVisual(v, BOX.w, BOX.h), BOX.x, BOX.y, BOX.w, BOX.h);
  el.append(picture);
  // The question is spoken, but he is only just reading: it is written big
  // underneath too, so the words can be matched to what he hears.
  el.append(place(h('div', { class: 'm-caption' }, p.say.text.replace(/\s*Tap it\.$/, '')), BOX.x, BOX.y + BOX.h + 40, BOX.w, 80));

  const thing = v.gauge === 'balance' ? 'sack' : v.gauge === 'jug' ? 'jug' : 'thermometer';
  const boxes = measureItems(v, BOX.w, BOX.h);
  const targets = boxes.map((b, i) => {
    const value = ordering ? String(i) : i ? 'right' : 'left';
    const t = h('button', { class: 'm-item', 'data-value': value, 'aria-label': ordering ? `${thing} ${i + 1}` : `the ${thing} on the ${i ? 'right' : 'left'}` }, [h('span', { class: 'm-frame' })]);
    place(t, BOX.x + b.x, BOX.y + b.y, b.w, b.h);
    el.append(t);
    return t;
  });
  const byValue = (value: string) => targets.find((t) => t.dataset.value === value);

  // --- Picking in order ---
  let picks: number[] = [];
  let fixed = 0; // picks put in place by help, which stay
  let level = 0;
  const badges = new Map<number, HTMLElement>();

  const badge = (i: number, rank: number, ghost = false): HTMLElement => {
    badges.get(i)?.remove();
    const b = boxes[i];
    const e = h('div', { class: ghost ? 'm-badge m-ghost' : 'm-badge', 'data-rank': String(rank) }, String(rank));
    place(e, BOX.x + b.x + b.w / 2 - 36, BOX.y + b.y + b.h / 2 - 36, 72, 72);
    el.append(e);
    badges.set(i, e);
    return e;
  };

  const refreshHint = () => {
    targets.forEach((t) => t.classList.remove('hint-answer'));
    if (level < 3) return;
    const next = ordering ? truth[picks.length] : truth[0];
    if (next !== undefined) byValue(next)?.classList.add('hint-answer');
  };

  /** Takes back the picks from position `at` on (their badges too). */
  const unpickFrom = (at: number) => {
    picks.slice(at).forEach((j) => {
      badges.get(j)?.remove();
      badges.delete(j);
    });
    picks = picks.slice(0, at);
  };

  /** Keeps only the picks that are right so far, so help never points past a wrong one. */
  const keepRightPicks = () => {
    const bad = picks.findIndex((j, k) => j !== Number(truth[k]));
    if (bad >= 0) unpickFrom(Math.max(bad, fixed));
  };

  const showGhosts = () => {
    truth.forEach((idx, rank) => {
      const i = Number(idx);
      if (!picks.includes(i)) badge(i, rank + 1, true);
    });
  };

  const pick = (i: number) => {
    ctx.sfx('tap');
    if (!ordering) {
      ctx.answer(i ? 'right' : 'left');
      return;
    }
    const at = picks.indexOf(i);
    if (at >= 0) {
      if (at < fixed) return;
      unpickFrom(at);
      if (level >= 3) showGhosts();
      refreshHint();
      return;
    }
    picks.push(i);
    const b = badge(i, picks.length);
    void pop(b, 1.2);
    if (level >= 3) refreshHint();
    if (picks.length === n) ctx.answer(picks.join(','));
  };
  targets.forEach((t, i) => k.tap(t, () => pick(i)));

  const wrongFrame = (t: HTMLElement) => {
    t.classList.add('is-wrong');
    timers.push(window.setTimeout(() => t.classList.remove('is-wrong'), 1100));
  };

  return {
    el,
    show() {
      // Nothing moves in: the picture is already there.
    },
    wrong(value: Answer) {
      if (!ordering) {
        const t = byValue(String(value));
        if (t) {
          wrongFrame(t);
          void wobble(t);
        }
        return;
      }
      // The whole order was wrong: wobble the badged ones and take them back.
      picks.slice(fixed).forEach((j) => {
        const t = targets[j];
        wrongFrame(t);
        void wobble(t);
        const b = badges.get(j);
        if (b) timers.push(window.setTimeout(() => b.remove(), 500));
        badges.delete(j);
      });
      picks = picks.slice(0, fixed);
      if (level >= 3) timers.push(window.setTimeout(() => (showGhosts(), refreshHint()), 520));
      else refreshHint();
    },
    async right() {
      if (ordering) truth.forEach((idx, rank) => badge(Number(idx), rank + 1));
      const t = byValue(truth[0]);
      targets.forEach((x) => x.classList.remove('hint-answer', 'hint-glow'));
      if (ordering) targets.forEach((x) => x.classList.add('is-right'));
      else {
        t?.classList.add('is-right');
        if (t) await pop(t, 1.06);
      }
      await new Promise((r) => setTimeout(r, 500));
    },
    help(lv) {
      level = lv;
      if (lv === 1) {
        targets.forEach((t) => t.classList.add('hint-glow'));
        return;
      }
      if (lv === 2) {
        if (ordering) {
          if (!fixed) {
            // Start again from the first one, put in place for him.
            unpickFrom(0);
            const first = Number(truth[0]);
            picks = [first];
            fixed = 1;
            badge(first, 1);
          }
        } else {
          // Wash out the wrong one.
          targets.forEach((t, i) => {
            if (t.dataset.value === truth[0]) return;
            const b = boxes[i];
            const wash = h('div', { class: 'm-wash' });
            place(wash, BOX.x + b.x, BOX.y + b.y, b.w, b.h);
            el.insertBefore(wash, t);
          });
        }
        return;
      }
      targets.forEach((t) => t.classList.remove('hint-glow'));
      if (ordering) {
        keepRightPicks();
        showGhosts();
      }
      refreshHint();
    },
    lock: k.lock,
    destroy() {
      timers.forEach((t) => window.clearTimeout(t));
      k.destroy();
    },
  };
}
