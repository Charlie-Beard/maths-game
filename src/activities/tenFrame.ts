/**
 * `tenFrame`: Silky's biscuit tins, one or two ten frames.
 *
 * Four ways to play, worked out from the problem (a-logic `tenFrameMode`):
 *
 *   fill    "How many more to fill the tin?" He taps empty cells to put
 *           biscuits in (each one counted aloud: 1, 2, 3), taps one again
 *           to take it out, and taps the tick when it's full. The answer
 *           is how many he put in.
 *   add     The biscuits being added wait in a row under the tin. He taps
 *           each one (or an empty cell) and it hops into the next empty
 *           cell, counting on aloud (5, 6, 7). Then he chooses the total.
 *   remove  The biscuits to take away have a dashed ring. He taps each one
 *           and it goes down to the "gone" row, crossed out, counting back
 *           aloud (6, 5, 4). Then he chooses what's left.
 *   read    How many? He can tap each biscuit to number it, then chooses.
 *
 * Bridging fills the first tin before the second, and takes from the
 * second before the first, so "make ten" is there to see.
 *
 * Help: 1 the tin glows; 2 every biscuit is numbered (fill: dashed ghosts
 * show the empty cells) and one wrong card goes; 3 Silky finishes the
 * moves and the answer glows.
 */
import { C } from '../art/palette';
import { prop } from '../art/props';
import type { Answer, Problem } from '../core/problem';
import { gsap, pop, sm, smFrom, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { cardRow, counterDisc, enter, sayNumber, seal, Shell, sumText, type CardRow } from './a-kit';
import { cardValues, frameCount, startCells, tenFrameMode } from './a-logic';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

interface Counter {
  el: HTMLButtonElement;
  /** Put in by him (fill or add), drawn in the second colour. */
  more: boolean;
  toGo: boolean;
  n: number;
}

export function tenFrame(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  const mode = tenFrameMode(p);
  if (v.type !== 'tenFrame' || !mode || !Number.isFinite(Number(p.answer))) return choose(p, ctx);
  const nFrames = frameCount(v.frames, v.add);
  if (nFrames > 2) return choose(p, ctx);

  const removeN = v.remove ?? 0;
  const shell = new Shell('tenFrame');
  const timers: gsap.core.Tween[] = [];
  const later = (s: number, fn: () => void) => {
    if (ctx.calm) fn();
    else timers.push(gsap.delayedCall(s, fn));
  };

  // ---- Geometry (stage coordinates) ----
  const cell = nFrames === 1 ? 84 : 72;
  const gap = nFrames === 1 ? 8 : 6;
  const pad = nFrames === 1 ? 12 : 10;
  const fw = 5 * cell + 4 * gap + pad * 2;
  const fh = 2 * cell + gap + pad * 2;
  const between = 40;
  const hasTray = mode === 'add' || mode === 'remove';
  const fx0 = 590 - (nFrames * fw + (nFrames - 1) * between) / 2;
  const fy = hasTray ? 124 : 290 - fh / 2;
  const trayY = fy + fh + 30;
  // The button fills the whole cell (72 px or more to tap, even with two
  // frames); the biscuit is drawn 10 px smaller inside it by CSS padding.
  const size = cell;
  const cellXY = (i: number) => {
    const f = Math.floor(i / 10);
    const k = i % 10;
    return { x: fx0 + f * (fw + between) + pad + (k % 5) * (cell + gap), y: fy + pad + Math.floor(k / 5) * (cell + gap) };
  };

  // ---- The frames and their cells ----
  const frames: HTMLElement[] = [];
  for (let f = 0; f < nFrames; f++) frames.push(shell.add(place(h('div', { class: 'tf-frame' }), fx0 + f * (fw + between), fy, fw, fh)));
  const cells: HTMLButtonElement[] = [];
  const slots: (Counter | null)[] = [];
  for (let i = 0; i < nFrames * 10; i++) {
    const { x, y } = cellXY(i);
    const c = h('button', { class: 'tf-cell', 'aria-label': 'empty', 'data-cell': String(i) }) as HTMLButtonElement;
    cells.push(shell.add(place(c, x, y, cell, cell) as HTMLButtonElement));
    slots.push(null);
    shell.tap(c, () => tapCell(i));
  }

  const art = (more: boolean, seed: string) => (v.prop ? prop(v.prop) : counterDisc(more ? C.blue : C.red, seed));
  const makeCounter = (more: boolean, x: number, y: number, seed: string): Counter => {
    const el = h('button', { class: `tf-counter${more ? ' more' : ''}`, 'aria-label': 'biscuit', html: art(more, seed) }) as HTMLButtonElement;
    place(el, x + (cell - size) / 2, y + (cell - size) / 2, size, size);
    const c: Counter = { el, more, toGo: false, n: 0 };
    shell.add(el);
    shell.tap(el, () => tapCounter(c));
    return c;
  };

  // Counters at the start.
  startCells(v.frames).forEach((i) => {
    const { x, y } = cellXY(i);
    slots[i] = makeCounter(false, x, y, 'start' + i);
  });

  // add: a row of counters waiting under the tin.
  const tray: Counter[] = [];
  const trayStep = Math.min(cell + 8, Math.floor(880 / Math.max(1, v.add ?? v.remove ?? 1)));
  const trayX = (k: number, n: number) => 590 - (n * trayStep - 8) / 2 + k * trayStep;
  if (mode === 'add') {
    const n = v.add ?? 0;
    for (let k = 0; k < n; k++) tray.push(makeCounter(true, trayX(k, n), trayY, 'tray' + k));
    tray.forEach((c) => c.el.classList.add('in-tray'));
  }
  // remove: ring the ones to take away (from the end, so the last tin empties first).
  let goneCount = 0;
  if (mode === 'remove') {
    const filledIdx = slots.map((s, i) => (s ? i : -1)).filter((i) => i >= 0);
    filledIdx.slice(-(v.remove ?? 0)).forEach((i) => {
      const c = slots[i];
      if (!c) return;
      c.toGo = true;
      c.el.classList.add('to-go');
      c.el.setAttribute('aria-label', 'take away');
    });
  }

  const inFrame = () => slots.filter((s): s is Counter => !!s);
  const placedCount = () => inFrame().filter((c) => c.more).length;
  let numberAll = false;
  let manual = 0;

  const setTag = (c: Counter, n: number) => {
    c.n = n;
    c.el.querySelector('.ct-tag')?.remove();
    if (n) c.el.append(h('span', { class: 'ct-tag small' }, String(n)));
    c.el.classList.toggle('counted', n > 0);
  };
  /** Help 2: every counter in the frames numbered in reading order. */
  const renumber = () => {
    if (!numberAll) return;
    let k = 0;
    slots.forEach((c) => c && setTag(c, ++k));
  };

  const moveTo = (c: Counter, x: number, y: number, done?: () => void) => {
    const tx = x + (cell - size) / 2;
    const ty = y + (cell - size) / 2;
    const finish = () => {
      gsap.set(c.el, { x: 0, y: 0 });
      place(c.el, tx, ty);
      done?.();
    };
    if (ctx.calm) return finish();
    const dx = tx - parseFloat(c.el.style.left);
    const dy = ty - parseFloat(c.el.style.top);
    gsap
      .timeline({ onComplete: finish })
      .add(sm(c.el, 0.42, { x: dx, ease: 'power1.inOut' }), 0)
      .add(sm(c.el, 0.21, { y: Math.min(dy, 0) - 40, ease: 'power2.out' }), 0)
      .add(sm(c.el, 0.21, { y: dy, ease: 'power2.in' }), 0.21);
  };

  // ---- Taps ----
  const nextEmpty = () => slots.findIndex((s) => !s);

  // `quiet`: when Silky makes the moves, she is talking, so don't count over her.
  function addFromTray(quiet = false) {
    const c = tray.shift();
    const i = nextEmpty();
    if (!c || i < 0) return;
    slots[i] = c;
    c.el.classList.remove('in-tray');
    ctx.sfx('place');
    const { x, y } = cellXY(i);
    moveTo(c, x, y);
    renumber();
    if (!quiet) sayNumber(ctx.say, inFrame().length);
    if (!tray.length) frames.forEach((f) => f.classList.remove('hint-glow'));
  }

  function takeAway(c: Counter, quiet = false) {
    const i = slots.indexOf(c);
    if (i < 0) return;
    slots[i] = null;
    c.toGo = false;
    c.el.classList.remove('to-go', 'hint-glow');
    c.el.classList.add('taken');
    c.el.disabled = true;
    setTag(c, 0);
    ctx.sfx('lift');
    moveTo(c, trayX(goneCount++, removeN), trayY);
    renumber();
    if (!quiet) sayNumber(ctx.say, inFrame().length);
  }

  function tapCell(i: number, quiet = false) {
    if (slots[i]) return;
    if (mode === 'fill') {
      const { x, y } = cellXY(i);
      const c = makeCounter(true, x, y, 'fill' + i + '-' + placedCount());
      slots[i] = c;
      c.el.classList.remove('hint-glow');
      cells[i].classList.remove('ghost');
      ctx.sfx('place');
      if (!ctx.calm) smFrom(c.el, 0.25, { scale: 0.4, y: -20 });
      afterFill(quiet);
    } else if (mode === 'add') addFromTray();
  }

  function tapCounter(c: Counter) {
    if (tray.includes(c)) return addFromTray();
    if (c.toGo) return takeAway(c);
    const i = slots.indexOf(c);
    if (i < 0) return;
    if (mode === 'fill') {
      if (!c.more) return;
      // Take it back out.
      slots[i] = null;
      ctx.sfx('lift');
      if (numberAll) cells[i].classList.add('ghost');
      const el = c.el;
      if (ctx.calm) el.remove();
      else gsap.to(el, { scale: 0.4, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => el.remove() });
      afterFill();
      return;
    }
    // Count it.
    if (c.n) return sayNumber(ctx.say, c.n);
    if (numberAll) return;
    setTag(c, ++manual);
    ctx.sfx('tap');
    sayNumber(ctx.say, c.n);
    void pop(c.el, 1.12);
  }

  // ---- Answering ----
  let cards: CardRow | null = null;
  let countBox: HTMLElement | null = null;
  let tick: HTMLButtonElement | null = null;

  function afterFill(quiet = false) {
    const n = placedCount();
    if (countBox) countBox.querySelector('.tf-count-n')!.textContent = n ? String(n) : '';
    tick?.setAttribute('data-value', String(n));
    if (n && !quiet) sayNumber(ctx.say, n);
    tick?.classList.toggle('ready', !nextEmptyCell());
  }
  const nextEmptyCell = () => slots.some((s) => !s);

  if (mode === 'fill') {
    countBox = shell.add(place(h('div', { class: 'tf-count', 'aria-live': 'polite' }, [h('span', { class: 'tf-count-n' })]), 410, 604, 150, 150));
    tick = seal(shell, 'tick', { x: 610, y: 600, size: 150, aria: 'Done', cls: 'tf-done', color: C.green }, () => {
      ctx.sfx('tap');
      ctx.answer(placedCount());
    });
    tick.setAttribute('data-value', '0');
    sumText(shell, p, 470);
  } else {
    // The sum sits under the tray when there is one, clear of the cards.
    sumText(shell, p, hasTray ? Math.min(trayY + cell + 2, 500) : 470);
    cards = cardRow(shell, cardValues(p), p.answer, (val) => {
      ctx.sfx('tap');
      ctx.answer(val);
    });
  }

  return {
    el: shell.el,
    show() {
      enter([...frames, ...shell.el.querySelectorAll('.tf-counter')], ctx.calm);
      cards?.show(ctx.calm);
    },
    wrong(val: Answer) {
      if (cards) cards.wrong(val);
      else {
        if (countBox) void wobble(countBox);
        if (tick) void wobble(tick);
      }
    },
    async right() {
      if (cards) return cards.right();
      countBox?.classList.add('is-right');
      if (countBox) await pop(countBox, 1.2);
    },
    help(level) {
      if (level === 1) {
        frames.forEach((f) => f.classList.add('hint-glow'));
        tray.forEach((c) => c.el.classList.add('hint-glow'));
        return;
      }
      if (level === 2) {
        if (mode === 'fill') {
          cells.forEach((c, i) => !slots[i] && c.classList.add('ghost'));
          numberAll = true;
        } else {
          numberAll = true;
          renumber();
          cards?.dropOne();
        }
        return;
      }
      // Silky finishes the moves, one by one, then the answer glows.
      if (mode === 'fill') {
        const empty = cells.map((_, i) => i).filter((i) => !slots[i]);
        empty.forEach((i, k) => later(k * 0.2, () => tapCell(i, true)));
        later(empty.length * 0.2, () => tick?.classList.add('hint-answer'));
        return;
      }
      if (mode === 'add') tray.slice().forEach((_, k) => later(k * 0.45, () => addFromTray(true)));
      if (mode === 'remove') inFrame().filter((c) => c.toGo).forEach((c, k) => later(k * 0.45, () => takeAway(c, true)));
      numberAll = true;
      renumber();
      cards?.showAnswer();
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
