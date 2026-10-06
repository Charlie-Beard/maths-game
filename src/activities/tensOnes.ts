/**
 * `tensOnes`: bundles of 10 sticks tied with ribbon, and single sticks.
 *
 * Two ways to play:
 *   - read: the picture shows bundles and sticks (visual tens, ones) and he
 *     chooses the number from the cards,
 *   - build: the mat starts empty (visual tens = ones = 0, or the problem
 *     has no choices) and he makes the answer: tapping the bundle pile puts
 *     a bundle on the mat, tapping the stick pile puts a stick, tapping a
 *     placed piece takes it back, then OK. The tenth loose stick ties
 *     itself into a bundle, which is what place value is all about.
 *
 * The ones side of the mat is a 2 × 5 grid like a ten frame, so every placed
 * piece is a big enough target and "how many more to make ten" is visible.
 */
import type { Answer, Problem } from '../core/problem';
import { pop, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { bundleArt, matArt, stickArt } from './b-art';
import {
  answerCards,
  cardRight,
  cardsIn,
  fallbackChoices,
  flyIn,
  hintAnswer,
  kit,
  liftOff,
  okSeal,
  removeOneWrong,
  stageCentre,
  sumText,
  wobbleValue,
} from './b-kit';
import { bundleRow } from './compare';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

export function tensOnes(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type !== 'tensOnes') return choose(p, ctx);
  const build = (v.tens === 0 && v.ones === 0) || !p.choices?.length;
  return build ? buildMode(p, ctx) : readMode(p, v.tens, v.ones, ctx);
}

// ---------------------------------------------------------------------------
// Read: how many sticks?
// ---------------------------------------------------------------------------

function readMode(p: Problem, tens: number, ones: number, ctx: ActivityContext): Activity {
  const k = kit('tensOnes', ctx);
  const { el } = k;
  const picture = place(h('div', { class: 'b-picture b-tens-picture' }), 160, 110, 860, 360);
  const row = bundleRow(tens, ones, 820, 300);
  picture.append(row);
  el.append(picture);
  sumText(k, p.text);
  const cards = answerCards(k, p.choices ?? fallbackChoices(p.answer));

  // Show me: count the bundles in tens, then the sticks in ones.
  let counted = false;
  const countAlong = () => {
    if (counted) return;
    counted = true;
    let n = 0;
    row.querySelectorAll<HTMLElement>('.b-bundle, .b-stick').forEach((piece, i) => {
      n += piece.classList.contains('b-bundle') ? 10 : 1;
      const tag = h('span', { class: `b-skip${piece.classList.contains('b-stick') && i % 2 ? ' is-low' : ''}` }, String(n));
      piece.append(tag);
    });
  };

  return {
    el,
    show() {
      cardsIn(cards.values(), ctx);
    },
    wrong: (value: Answer) => wobbleValue(k, value),
    async right() {
      await cardRight(cards.get(String(p.answer)));
    },
    help(level) {
      if (level === 1) picture.classList.add('hint-glow');
      else if (level === 2) {
        countAlong();
        removeOneWrong(cards, p.answer);
      } else {
        countAlong();
        hintAnswer(k, p.answer);
      }
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}

// ---------------------------------------------------------------------------
// Build: make the number on the mat
// ---------------------------------------------------------------------------

const MAT = { x: 160, y: 104, w: 860, h: 336, split: 430 };
const CELL = { w: 78, h: 124 };
const MAX_TENS = 10;

/** Top-left of cell i (0–9) in the tens (side 0) or ones (side 1) half of the mat. */
function cellAt(side: 0 | 1, i: number): [number, number] {
  const areaX = MAT.x + (side ? MAT.split + 8 : 18);
  const areaW = MAT.w / 2 - 26;
  const x0 = areaX + (areaW - 5 * CELL.w - 4 * 4) / 2;
  return [x0 + (i % 5) * (CELL.w + 4), MAT.y + 62 + Math.floor(i / 5) * (CELL.h + 6)];
}

function buildMode(p: Problem, ctx: ActivityContext): Activity {
  const k = kit('tensOnes', ctx);
  const { el } = k;
  el.classList.add('is-build');
  const target = Number(p.answer);
  const tTens = Math.floor(target / 10);
  const tOnes = target % 10;

  el.append(place(h('div', { class: 'b-mat', html: matArt(MAT.w, MAT.h, MAT.split) }), MAT.x, MAT.y, MAT.w, MAT.h));
  el.append(place(h('div', { class: 'b-mat-label' }, 'tens'), MAT.x + 18, MAT.y + 16, MAT.split - 26, 44));
  el.append(place(h('div', { class: 'b-mat-label' }, 'ones'), MAT.x + MAT.split + 8, MAT.y + 16, MAT.w - MAT.split - 26, 44));

  // Faint cell outlines, so he can see where pieces go (and the ten-frame shape).
  const cells: HTMLElement[][] = [[], []];
  for (const side of [0, 1] as const) {
    for (let i = 0; i < 10; i++) {
      const [x, y] = cellAt(side, i);
      const c = place(h('div', { class: 'b-cell' }), x, y, CELL.w, CELL.h);
      cells[side].push(c);
      el.append(c);
    }
  }

  const goal = sumText(k, p.text ?? String(target), 446);

  // The piles he takes from.
  const tenPile = place(h('button', { class: 'b-pile b-ten-pile', 'aria-label': 'Add a bundle of ten', 'data-role': 'add-ten' }), 290, 584, 230, 176);
  tenPile.innerHTML = [0, 1, 2].map((i) => `<div class="b-pile-bundle" style="left:${40 + i * 44}px;transform:rotate(${(i - 1) * 6}deg)">${bundleArt()}</div>`).join('');
  const onePile = place(h('button', { class: 'b-pile b-one-pile', 'aria-label': 'Add one stick', 'data-role': 'add-one' }), 560, 584, 200, 176);
  onePile.innerHTML = [0, 1, 2, 3, 4].map((i) => `<div class="b-pile-stick" style="left:${46 + i * 22}px;transform:rotate(${(i - 2) * 7}deg)">${stickArt()}</div>`).join('');
  el.append(tenPile, onePile);

  const placed: HTMLElement[][] = [[], []];
  const value = () => placed[0].length * 10 + placed[1].length;
  const ok = okSeal(k, 860, 608, () => ctx.answer(value()));
  const refresh = () => {
    ok.dataset.value = String(value());
  };
  refresh();

  const pieceEl = (side: 0 | 1): HTMLElement => {
    const pc = h('button', {
      class: `b-piece ${side ? 'is-one' : 'is-ten'}`,
      'data-role': 'piece',
      'aria-label': side ? 'Take back a stick' : 'Take back a bundle',
      html: side ? stickArt() : bundleArt(),
    });
    k.tap(pc, () => takeBack(side, pc));
    return pc;
  };

  /** Puts a piece in the next free cell, flying in from its pile. */
  const add = async (side: 0 | 1, quiet = false): Promise<void> => {
    const i = placed[side].length;
    const pc = pieceEl(side);
    const [x, y] = cellAt(side, i);
    place(pc, x, y, CELL.w, CELL.h);
    placed[side].push(pc);
    el.append(pc);
    refresh();
    if (!quiet) {
      ctx.sfx('place');
      ctx.say({ text: '{n}', vals: { n: value() } });
    }
    const [px, py] = stageCentre(side ? onePile : tenPile, el);
    await flyIn(pc, px - (x + CELL.w / 2), py - (y + CELL.h / 2), ctx, 0.35);
  };

  /** Ten loose sticks tie themselves into a bundle and slide over to the tens. */
  const tieBundle = async (): Promise<void> => {
    k.lock(true);
    await new Promise((r) => setTimeout(r, ctx.calm ? 50 : 350));
    const sticks = placed[1].splice(0);
    sticks.forEach((s) => liftOff(s, ctx));
    const i = placed[0].length;
    const pc = pieceEl(0);
    const [x, y] = cellAt(0, i);
    place(pc, x, y, CELL.w, CELL.h);
    placed[0].push(pc);
    el.append(pc);
    refresh();
    ctx.sfx('rustle');
    const [ox, oy] = cellAt(1, 2);
    await flyIn(pc, ox - x, oy - y, ctx, 0.5);
    k.lock(false);
  };

  const relayout = (side: 0 | 1) => {
    placed[side].forEach((pc, i) => {
      const [x, y] = cellAt(side, i);
      place(pc, x, y);
    });
  };

  const takeBack = (side: 0 | 1, pc: HTMLElement) => {
    const i = placed[side].indexOf(pc);
    if (i < 0) return;
    placed[side].splice(i, 1);
    ctx.sfx('lift');
    liftOff(pc, ctx);
    relayout(side);
    refresh();
  };

  k.tap(tenPile, () => {
    if (placed[0].length >= MAX_TENS) return void wobble(tenPile);
    void add(0);
    void pop(tenPile, 1.04);
  });
  k.tap(onePile, () => {
    if (placed[1].length >= 9 && placed[0].length >= MAX_TENS) return void wobble(onePile);
    void pop(onePile, 1.04);
    void add(1).then(() => {
      if (placed[1].length >= 10) void tieBundle();
    });
  });

  /** Silky builds the number: clears the mat and puts the right pieces down. */
  const buildTarget = async () => {
    k.lock(true);
    for (const side of [0, 1] as const) {
      placed[side].splice(0).forEach((pc) => liftOff(pc, ctx));
    }
    refresh();
    for (let i = 0; i < tTens; i++) {
      await add(0, true);
    }
    for (let i = 0; i < tOnes; i++) {
      await add(1, true);
    }
    k.lock(false);
  };

  return {
    el,
    show() {
      if (ctx.calm) return;
      [tenPile, onePile, ok].forEach((b, i) => void flyIn(b, 0, 80, ctx, 0.35 + i * 0.05));
    },
    wrong() {
      void wobble(ok);
    },
    async right() {
      ok.classList.add('is-right');
      [...placed[0], ...placed[1]].forEach((pc) => pc.classList.add('is-right'));
      await pop(ok, 1.2);
    },
    help(level) {
      if (level === 1) {
        goal?.classList.add('hint-glow');
        tenPile.classList.add('hint-glow');
        onePile.classList.add('hint-glow');
        return;
      }
      // Show me: dashed outlines where the pieces of the number go.
      cells[0].forEach((c, i) => c.classList.toggle('is-ghost-ten', i < tTens));
      cells[1].forEach((c, i) => c.classList.toggle('is-ghost-one', i < tOnes));
      if (level === 3) {
        void buildTarget().then(() => hintAnswer(k, p.answer));
        ok.classList.add('hint-answer');
      }
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}
