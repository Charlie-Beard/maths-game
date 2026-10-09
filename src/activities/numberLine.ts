/**
 * `numberLine`: the ladder up the Faraway Tree, laid on its side, with a
 * number under every rung.
 *
 * Moon-Face stands on the start rung. Each tap of "hop on" or "hop back"
 * moves him one rung (a smooth hop), says the number he lands on, and
 * draws the hop as an arc with its count (1, 2, 3 …) so he can see how far
 * he's gone. Hopping back over the last arc rubs it out. He answers by
 * tapping the number he landed on, or the tick ("here!").
 *
 * When bridging, `marks` rings the ten to hop to on the way.
 *
 * Long lines (0–20, 0–100) show a window of up to 11 rungs around the start
 * and the answer, so every number stays a big tap target.
 *
 * Help: 1 the start and Moon-Face glow; 2 a row of footprints shows how
 * many hops to make (filling as he hops) and numbers far from the answer
 * fade; 3 the answer glows for him to tap.
 */
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { piece, rect, svg } from '../art/paper';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, sm, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { enter, sayNumber, seal, Shell, sumText } from './a-kit';
import { lineWindow } from './a-logic';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

const X0 = 196;
const X1 = 984;
const RAIL_Y = 292;
const TAG_Y = 350;
const SVGNS = 'http://www.w3.org/2000/svg';

export function numberLine(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  const answer = Number(p.answer);
  const win = v.type === 'numberLine' ? lineWindow(v.from, v.to, v.start, answer, v.step) : null;
  if (v.type !== 'numberLine' || !win) return choose(p, ctx);
  const { marks, unit } = win;
  const start = v.start;
  const shell = new Shell('numberLine');
  const spacing = (X1 - X0) / (marks.length - 1);
  const xOf = (n: number) => X0 + ((n - marks[0]) / unit) * spacing;

  // ---- The ladder: two rails and a rung at every number ----
  const ladderW = X1 - X0 + 80;
  const ladder = svg({ w: ladderW, h: 70, name: 'nl-ladder-' + marks.length, boil: false }, [
    ...marks.map((_, i) => piece(rect(40 + i * spacing - 6, 6, 12, 56, 3), C.barkLight, { edge: 'cut' })),
    piece(rect(0, 4, ladderW, 14, 5), C.bark, { edge: 'cut' }),
    piece(rect(0, 48, ladderW, 14, 5), C.bark, { edge: 'cut' }),
  ]);
  const ladderEl = shell.add(place(h('div', { class: 'nl-ladder', html: ladder }), X0 - 40, RAIL_Y - 6, ladderW, 70));

  // Arcs for the hops he's made, above the ladder.
  const arcs = document.createElementNS(SVGNS, 'svg');
  arcs.setAttribute('class', 'nl-arcs');
  arcs.setAttribute('viewBox', '0 0 1180 820');
  const arcLayer = shell.add(place(h('div', { class: 'nl-arc-layer' }), 0, 0, 1180, 820));
  arcLayer.append(arcs);

  // ---- The numbers (answer targets) ----
  const tagW = Math.min(116, spacing - 4);
  const tags = new Map<number, HTMLButtonElement>();
  marks.forEach((n) => {
    // `marks`: the ten to hop to on the way when bridging, ringed in gold.
    const marked = v.marks?.includes(n) ? ' marked' : '';
    const t = h('button', { class: `nl-num${n === start ? ' start' : ''}${marked}`, 'data-value': String(n), 'aria-label': String(n) }, String(n)) as HTMLButtonElement;
    place(t, xOf(n) - tagW / 2, TAG_Y, tagW, 88);
    shell.tap(t, () => pick(n, t));
    tags.set(n, shell.add(t));
  });

  // ---- Moon-Face ----
  const HW = 84;
  const HH = 95;
  const hopper = shell.add(place(h('div', { class: 'nl-hopper', html: characterArt('moonface') }), xOf(start) - HW / 2, RAIL_Y - HH + 6, HW, HH));

  let pos = start;
  let lastPick: HTMLElement | null = null;
  const hops: { from: number; to: number; el: SVGGElement }[] = [];
  let chain: Promise<void> = Promise.resolve();
  let dots: HTMLElement[] = [];
  let need = 0;
  let alive = true;

  const markHere = () => tags.forEach((t, n) => t.classList.toggle('here', n === pos));
  markHere();

  const drawArc = (from: number, to: number): SVGGElement => {
    const x1 = xOf(from);
    const x2 = xOf(to);
    const mid = (x1 + x2) / 2;
    const top = RAIL_Y - 4 - Math.min(110, spacing * 1.2);
    const g = document.createElementNS(SVGNS, 'g');
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', `M${x1} ${RAIL_Y}Q${mid} ${top} ${x2} ${RAIL_Y}`);
    path.setAttribute('class', 'nl-arc');
    const dir = Math.sign(x2 - x1);
    const head = document.createElementNS(SVGNS, 'path');
    head.setAttribute('d', `M${x2 - dir * 14} ${RAIL_Y - 14}L${x2} ${RAIL_Y}L${x2 - dir * 2} ${RAIL_Y - 20}`);
    head.setAttribute('class', 'nl-arc');
    const peakY = (RAIL_Y + top) / 2;
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('cx', String(mid));
    c.setAttribute('cy', String(peakY - 2));
    c.setAttribute('r', '17');
    c.setAttribute('class', 'nl-arc-dot');
    const label = document.createElementNS(SVGNS, 'text');
    label.setAttribute('x', String(mid));
    label.setAttribute('y', String(peakY + 6));
    label.setAttribute('class', 'nl-arc-n');
    label.textContent = String(hops.length + 1);
    g.append(path, head, c, label);
    arcs.append(g);
    return g;
  };

  const animateHop = (to: number): Promise<void> =>
    new Promise((resolve) => {
      const tx = xOf(to) - HW / 2;
      const finish = () => {
        if (!alive) return resolve();
        gsap.set(hopper, { x: 0, y: 0 });
        hopper.style.left = `${tx}px`;
        resolve();
      };
      const dx = tx - parseFloat(hopper.style.left);
      gsap
        .timeline({ onComplete: finish })
        .add(sm(hopper, 0.4, { x: dx, ease: 'none' }), 0)
        .add(sm(hopper, 0.2, { y: -46, ease: 'power2.out' }), 0)
        .add(sm(hopper, 0.2, { y: 0, ease: 'power2.in' }), 0.2);
    });

  const updateDots = () => {
    const dir = Math.sign(answer - start);
    const good = hops.filter((hp) => Math.sign(hp.to - hp.from) === dir).length;
    dots.forEach((d, i) => d.classList.toggle('done', i < good));
  };

  function hop(dir: 1 | -1, quiet = false) {
    const to = pos + dir * unit;
    if (!tags.has(to)) {
      void wobble(hopper);
      return;
    }
    const from = pos;
    pos = to;
    const last = hops[hops.length - 1];
    if (last && last.to === from && last.from === to) {
      // Hopping back over the last hop rubs it out.
      last.el.remove();
      hops.pop();
    } else {
      hops.push({ from, to, el: drawArc(from, to) });
    }
    tick.setAttribute('data-value', String(pos));
    updateDots();
    ctx.sfx('place');
    chain = chain.then(() => animateHop(to)).then(() => {
      if (!alive) return;
      markHere();
      if (!quiet) sayNumber(ctx.say, to);
    });
  }

  function pick(n: number, from: HTMLElement) {
    lastPick = from;
    ctx.sfx('tap');
    ctx.answer(n);
  }

  // ---- Controls: hop back, here!, hop on ----
  const back = seal(shell, 'back', { x: 332, y: 604, size: 130, aria: 'Hop back', cls: 'nl-back', color: C.teal }, () => hop(-1));
  const tick = seal(shell, 'tick', { x: 525, y: 604, size: 130, aria: 'Here', cls: 'nl-here', color: C.green }, () => pick(pos, tick));
  const on = seal(shell, 'next', { x: 718, y: 604, size: 130, aria: 'Hop on', cls: 'nl-on', color: C.teal }, () => hop(1));
  tick.setAttribute('data-value', String(pos));
  sumText(shell, p, 470);

  return {
    el: shell.el,
    show() {
      enter([ladderEl, hopper, ...tags.values()]);
      gsap.from([back, tick, on], { y: 60, opacity: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' });
    },
    wrong(val: Answer) {
      const t = lastPick ?? tags.get(Number(val));
      if (t) void wobble(t);
    },
    async right() {
      const t = tags.get(answer);
      t?.classList.add('is-right');
      if (pos !== answer) {
        // He knew it without hopping: Moon-Face goes there anyway.
        pos = answer;
        await chain;
        await animateHop(answer);
        markHere();
      }
      await chain;
      if (t) await pop(t, 1.2);
      if (alive) await pop(hopper, 1.15);
    },
    help(level) {
      if (level === 1) {
        tags.get(start)?.classList.add('hint-glow');
        hopper.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        need = Math.abs(answer - start) / unit;
        if (need && !dots.length) {
          const step = Math.min(54, 760 / need);
          dots = Array.from({ length: need }, (_, i) => shell.add(place(h('div', { class: 'nl-step' }), 590 - (need * step) / 2 + i * step + (step - 40) / 2, 116, 40, 40)));
          updateDots();
        }
        const lo = Math.min(start, answer) - unit;
        const hi = Math.max(start, answer) + unit;
        tags.forEach((t, n) => (n < lo || n > hi) && t.classList.add('faded'));
        return;
      }
      tags.get(answer)?.classList.add('hint-answer');
    },
    lock(on) {
      shell.locked = on;
    },
    destroy() {
      alive = false;
      gsap.killTweensOf(hopper);
      shell.destroy();
    },
  };
}
