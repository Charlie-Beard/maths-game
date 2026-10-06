/**
 * `groups`: equal groups on plates, or an array of toy soldiers on shelves
 * (visual groups, each, layout, prop).
 *
 * Two ways to play:
 *   - read: the groups are full, and he answers from the cards (how many
 *     groups, how many in each, or how many altogether),
 *   - build: the plates or shelves start empty (visual each = 0) and the
 *     answer is how many go in each. Tapping a plate (or a shelf) puts one
 *     more on it; the "take one back" seal lifts off the last one; OK hands
 *     in the number on each plate (or "unequal" if they differ).
 *
 * "Show me" counts along: running totals under each group (2, 4, 6 …) when
 * the question is how many altogether, or 1, 2, 3 when it is how many groups.
 */
import { prop } from '../art/props';
import type { Answer, Problem, PropId } from '../core/problem';
import { pop, smFrom, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { plateArt, shelfArt } from './b-art';
import {
  answerCards,
  backSeal,
  cardRight,
  cardsIn,
  countTag,
  fallbackChoices,
  hintAnswer,
  kit,
  liftOff,
  okSeal,
  removeOneWrong,
  sumText,
  wobbleValue,
} from './b-kit';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

const BOX = { x: 160, y: 110, w: 860, h: 360 };

/** One group: a plate or a shelf, where its items sit, and its items. */
interface Holder {
  el: HTMLElement;
  items: HTMLElement[];
  /** Top-left of item i inside the holder, and the item size. */
  pos: (i: number) => [number, number];
  size: number;
  cap: number;
  /** Where its counting tag goes, in stage coordinates. */
  tagAt: [number, number];
}

export function groups(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type !== 'groups') return choose(p, ctx);
  const k = kit('groups', ctx);
  const { el } = k;
  const build = v.each === 0;
  const target = build ? Number(p.answer) : v.each;
  const cap = build ? Math.min(10, Math.max(target + 2, 6)) : v.each;

  const holders = v.layout === 'array' ? shelves(v.groups, cap, build) : plates(v.groups, cap, build);
  holders.forEach((hd) => el.append(hd.el));

  const addItem = (hd: Holder, quiet = false) => {
    const i = hd.items.length;
    if (i >= hd.cap) {
      void wobble(hd.el);
      return;
    }
    const [x, y] = hd.pos(i);
    const it = place(h('div', { class: 'b-obj', html: prop(v.prop as PropId) }), x, y, hd.size, hd.size);
    hd.items.push(it);
    hd.el.append(it);
    if (!quiet && !ctx.calm) void smFrom(it, 0.25, { scale: 0.3, y: -30, ease: 'back.out(2)' });
  };

  if (!build) holders.forEach((hd) => Array.from({ length: v.each }, () => addItem(hd, true)));
  sumText(k, p.text);

  // --- Read: cards ---
  let cards = new Map<string, HTMLElement>();
  // --- Build: OK and take-one-back ---
  let ok: HTMLButtonElement | null = null;
  const placedOrder: Holder[] = [];
  const value = (): Answer => {
    const counts = holders.map((hd) => hd.items.length);
    return counts.every((c) => c === counts[0]) ? counts[0] : 'unequal';
  };
  const refresh = () => {
    if (ok) ok.dataset.value = String(value());
  };

  if (build) {
    holders.forEach((hd) => {
      hd.el.dataset.role = 'plate';
      k.tap(hd.el, () => {
        if (hd.items.length >= hd.cap) return void wobble(hd.el);
        addItem(hd);
        placedOrder.push(hd);
        ctx.sfx('place');
        ctx.say({ text: '{n}', vals: { n: hd.items.length } });
        refresh();
      });
    });
    backSeal(k, 440, 620, () => {
      const hd = placedOrder.pop();
      const it = hd?.items.pop();
      if (it) liftOff(it, ctx);
      refresh();
    });
    ok = okSeal(k, 640, 608, () => ctx.answer(value()));
    refresh();
  } else {
    cards = answerCards(k, p.choices ?? fallbackChoices(p.answer));
  }

  // Show me: count along the groups.
  let counted = false;
  const countAlong = () => {
    if (counted) return;
    counted = true;
    const total = v.groups * target;
    const answer = Number(p.answer);
    if (!build && answer !== total && answer !== v.groups) {
      // How many in each: number the items in the first group.
      holders[0].items.forEach((it, i) => it.append(h('span', { class: 'obj-count' }, String(i + 1))));
      return;
    }
    holders.forEach((hd, i) => {
      const label = !build && answer === v.groups ? i + 1 : (i + 1) * target;
      el.append(countTag(label, hd.tagAt[0], hd.tagAt[1], 72));
    });
  };

  const ghosts = () => {
    holders.forEach((hd) => {
      for (let i = 0; i < Math.min(target, hd.cap); i++) {
        const [x, y] = hd.pos(i);
        hd.el.insertBefore(place(h('div', { class: 'b-ghost-slot' }), x, y, hd.size, hd.size), hd.el.children[1] ?? null);
      }
    });
  };

  const fillAll = () => {
    holders.forEach((hd) => {
      while (hd.items.length > target) hd.items.pop()?.remove();
      while (hd.items.length < target) addItem(hd);
    });
    placedOrder.length = 0;
    refresh();
  };

  return {
    el,
    show() {
      cardsIn(cards.values(), ctx);
    },
    wrong(value: Answer) {
      if (ok) void wobble(ok);
      else wobbleValue(k, value);
    },
    async right() {
      if (ok) {
        ok.classList.add('is-right');
        await pop(ok, 1.2);
      } else await cardRight(cards.get(String(p.answer)));
    },
    help(level) {
      if (level === 1) {
        holders.forEach((hd) => hd.el.classList.add('hint-glow'));
        return;
      }
      if (level === 2) {
        if (build) ghosts();
        else {
          countAlong();
          removeOneWrong(cards, p.answer);
        }
        return;
      }
      if (build) {
        fillAll();
        hintAnswer(k, p.answer);
      } else {
        countAlong();
        hintAnswer(k, p.answer);
      }
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}

/** Plates in one row (up to 5) or two rows. */
function plates(n: number, cap: number, build: boolean): Holder[] {
  const perRow = n <= 5 ? n : Math.ceil(n / 2);
  const rows = Math.ceil(n / perRow);
  const gap = 20;
  const tagRoom = 52;
  const pw = Math.min(230, (BOX.w - (perRow - 1) * gap) / perRow);
  const ph = Math.min(220, pw * 0.85, (BOX.h - (rows - 1) * gap - rows * tagRoom) / rows);
  const cols = Math.ceil(Math.sqrt(cap * (pw / ph)));
  const itemRows = Math.ceil(cap / cols);
  const size = Math.floor(Math.min(72, (pw * 0.78) / cols, (ph * 0.7) / itemRows));
  const totalH = rows * ph + (rows - 1) * (gap + tagRoom) + tagRoom;
  const y0 = BOX.y + Math.max(0, (BOX.h - totalH) / 2);
  const out: Holder[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / perRow);
    const inRow = Math.min(perRow, n - r * perRow);
    const rowW = inRow * pw + (inRow - 1) * gap;
    const x = BOX.x + (BOX.w - rowW) / 2 + (i % perRow) * (pw + gap);
    const y = y0 + r * (ph + gap + tagRoom);
    const el = place(h(build ? 'button' : 'div', { class: 'b-plate', html: plateArt(Math.round(pw), Math.round(ph)), 'aria-label': build ? 'Put one on this plate' : undefined }), x, y, pw, ph);
    const gx = (pw - cols * size) / 2;
    const gy = (ph - itemRows * size) / 2;
    out.push({
      el,
      items: [],
      size,
      cap,
      pos: (j) => [gx + (j % cols) * size, gy + Math.floor(j / cols) * size],
      tagAt: [x + pw / 2, y + ph + 2],
    });
  }
  return out;
}

/** An array: one shelf per row, items standing on it from the left. */
function shelves(n: number, cap: number, build: boolean): Holder[] {
  const tagW = 90;
  const rowH = Math.min(96, BOX.h / n);
  const size = Math.floor(Math.min(rowH - 12, (BOX.w - tagW - 40) / cap - 6));
  const rowW = Math.min(BOX.w - tagW, cap * (size + 6) + 40);
  const x = BOX.x + (BOX.w - tagW - rowW) / 2;
  const y0 = BOX.y + (BOX.h - n * rowH) / 2;
  const out: Holder[] = [];
  for (let i = 0; i < n; i++) {
    const y = y0 + i * rowH;
    const el = place(h(build ? 'button' : 'div', { class: 'b-shelf', html: shelfArt(Math.round(rowW), Math.round(rowH)), 'aria-label': build ? 'Put one on this shelf' : undefined }), x, y, rowW, rowH);
    out.push({
      el,
      items: [],
      size,
      cap,
      pos: (j) => [20 + j * (size + 6), rowH - 18 - size],
      tagAt: [x + rowW + tagW / 2 + 4, y + (rowH - 48) / 2],
    });
  }
  return out;
}
