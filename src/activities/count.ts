/**
 * `count`: tap each object to count it, then choose the total.
 *
 * Every object is a tap target. Tapping one gives it the next number, on a
 * gold paper tag, and the number is said aloud; counted objects keep their
 * tag and a ring, so he can see what he's done. Objects never move while
 * he counts (except at "show me", below). Things taken away are crossed
 * out and can't be counted. The total is chosen from number cards.
 *
 * Help: 1 the uncounted objects glow; 2 they line up in rows of five and
 * one wrong card goes; 3 Silky numbers the rest and the answer card glows.
 */
import { prop } from '../art/props';
import { hashString } from '../art/paper';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, sm } from '../ui/anim';
import { h, place } from '../ui/dom';
import { cardRow, enter, sayNumber, Shell, sumText } from './a-kit';
import { cardValues, layoutObjects, type Spot } from './a-logic';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

const BOX = { x: 170, y: 112, w: 840, h: 350 };

export function count(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type !== 'objects' || !v.groups.length) return choose(p, ctx);
  const shell = new Shell('count');
  const seed = hashString(p.key);
  const counts = v.groups.map((g) => g.count);
  const lay = layoutObjects(counts, v.layout === 'scatter' ? 'scatter' : 'row', BOX, seed);

  interface Obj {
    el: HTMLButtonElement;
    gone: boolean;
    n: number;
  }
  const objs: Obj[] = [];
  let counted = 0;
  const timers: gsap.core.Tween[] = [];

  const place1 = (el: HTMLElement, s: Spot, size: number) => {
    place(el, s.x, s.y, size, size);
    gsap.set(el, { rotation: s.rot });
  };

  v.groups.forEach((g, gi) => {
    lay.spots[gi].forEach((spot, i) => {
      const gone = i >= g.count - (g.gone ?? 0);
      const el = h('button', {
        class: `ct-obj${gone ? ' gone' : ''}`,
        'aria-label': gone ? 'taken away' : 'count me',
        'data-group': String(gi),
        html: prop(g.prop),
      }) as HTMLButtonElement;
      if (gone) el.disabled = true;
      place1(el, spot, lay.size);
      const o: Obj = { el, gone, n: 0 };
      objs.push(o);
      shell.add(el);
      if (!gone) shell.tap(el, () => tapObj(o));
    });
  });
  lay.ops.forEach((x) => shell.add(place(h('div', { class: 'ct-op' }, v.op === '-' ? '−' : '+'), x - 32, lay.midY - 50, 64, 100)));

  const mark = (o: Obj) => {
    counted += 1;
    o.n = counted;
    o.el.classList.add('counted');
    o.el.classList.remove('hint-glow');
    o.el.setAttribute('aria-label', String(counted));
    o.el.append(h('span', { class: 'ct-tag' }, String(counted)));
  };

  function tapObj(o: Obj) {
    if (o.n) {
      // Already counted: say its number again, gently.
      sayNumber(ctx.say, o.n);
      return;
    }
    mark(o);
    ctx.sfx('tap');
    sayNumber(ctx.say, o.n);
    void pop(o.el, 1.12);
  }

  sumText(shell, p);
  const cards = cardRow(shell, cardValues(p), p.answer, (val) => {
    ctx.sfx('tap');
    ctx.answer(val);
  });

  const todo = () => objs.filter((o) => !o.gone && !o.n);

  return {
    el: shell.el,
    show() {
      enter(
        objs.map((o) => o.el),
        ctx.calm,
      );
      cards.show(ctx.calm);
    },
    wrong(val: Answer) {
      cards.wrong(val);
    },
    async right() {
      await cards.right();
    },
    help(level) {
      if (level === 1) {
        todo().forEach((o) => o.el.classList.add('hint-glow'));
        return;
      }
      if (level === 2) {
        // Line them up in rows of five: easier to see, and to count.
        const tidy = layoutObjects(counts, 'fives', BOX, seed);
        let k = 0;
        v.groups.forEach((_, gi) =>
          tidy.spots[gi].forEach((s) => {
            const o = objs[k++];
            const dx = s.x - parseFloat(o.el.style.left);
            const dy = s.y - parseFloat(o.el.style.top);
            const done = () => {
              gsap.set(o.el, { x: 0, y: 0 });
              place1(o.el, s, tidy.size);
            };
            if (ctx.calm) done();
            else sm(o.el, 0.5, { x: dx, y: dy, width: tidy.size, height: tidy.size, rotation: 0, onComplete: done });
          }),
        );
        cards.dropOne();
        return;
      }
      // Silky counts the rest, one by one.
      todo().forEach((o, i) => {
        if (ctx.calm) mark(o);
        else timers.push(gsap.delayedCall(i * 0.25, () => !o.n && mark(o)));
      });
      cards.showAnswer();
    },
    lock(on) {
      shell.locked = on;
    },
    destroy() {
      timers.forEach((t) => t.kill());
      shell.destroy();
    },
  };
}
