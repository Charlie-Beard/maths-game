/**
 * `groups`: equal groups on plates, or an array of toy soldiers on shelves
 * (visual groups, each, layout, prop). He always answers from the cards;
 * what he can do with the picture first depends on the skill and tier, as
 * the generators set them (see the header of core/generators/more.ts):
 *
 *   - see (groups tier 2, times-* tier 1, count-2s-5s): the groups are full,
 *     to count altogether (or count the groups, or the rows),
 *   - build (groups tier 3, arrays tier 3): the plates or shelves start
 *     empty. Tapping a plate puts one more on it, up to `each`; the "take
 *     one back" seal lifts off the last one. Then he says how many altogether,
 *   - make groups (group-div): the items start loose in a pile. Each tap on
 *     the pile scoops `each` of them onto a new plate, until none are left;
 *     the answer is how many groups.
 *
 * "Show me" finishes the picture and counts along: running totals under
 * each group (2, 4, 6 …) when the question is how many altogether, or 1, 2,
 * 3 when it is how many groups.
 */
import { prop } from '../art/props';
import type { Answer, Problem } from '../core/problem';
import { pop, smFrom, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { bundleArt, plateArt, shelfArt } from './b-art';
import { answerCards, backSeal, cardRight, cardsIn, countTag, fallbackChoices, flyIn, hintAnswer, kit, liftOff, removeOneWrong, sumText, wobbleValue } from './b-kit';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
const BOX: Box = { x: 160, y: 110, w: 860, h: 360 };

/** One group: a plate or a shelf, where its items sit, and its items. */
interface Holder {
  el: HTMLElement;
  items: HTMLElement[];
  /** Top-left of item i inside the holder. */
  pos: (i: number) => [number, number];
  size: number;
  /** Where its counting tag goes, in stage coordinates. */
  tagAt: [number, number];
}

type Mode = 'see' | 'build' | 'loose';

function modeOf(p: Problem): Mode {
  if (p.skill === 'group-div') return 'loose';
  if ((p.skill === 'groups' || p.skill === 'arrays') && p.tier >= 3) return 'build';
  return 'see';
}

export function groups(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type !== 'groups' || v.groups < 1 || v.each < 1) return choose(p, ctx);
  const k = kit('groups', ctx);
  const { el } = k;
  const mode = modeOf(p);
  const total = v.groups * v.each;
  // Ten sticks on a plate are drawn as one bundle of ten (times-10).
  const asBundle = v.prop === 'stick' && v.each === 10 && v.layout === 'groups';

  // The loose pile sits under the plates, where the sum would go.
  const box = mode === 'loose' ? { ...BOX, h: 280 } : BOX;
  const holders = v.layout === 'array' ? shelves(v.groups, v.each, mode === 'build', box) : plates(v.groups, asBundle ? 1 : v.each, mode === 'build', box);
  if (mode !== 'loose') holders.forEach((hd) => el.append(hd.el));

  const addItem = (hd: Holder, animate: boolean) => {
    const i = hd.items.length;
    const [x, y] = hd.pos(i);
    const it = place(h('div', { class: 'b-obj', html: prop(v.prop) }), x, y, hd.size, hd.size);
    hd.items.push(it);
    hd.el.append(it);
    if (animate && !ctx.calm) void smFrom(it, 0.25, { scale: 0.3, y: -30, ease: 'back.out(2)' });
  };
  const fill = (hd: Holder) => {
    if (asBundle) {
      if (!hd.items.length) {
        const b = place(h('div', { class: 'b-plate-bundle', html: bundleArt() }), 0, 0);
        hd.items.push(b);
        hd.el.append(b);
      }
      return;
    }
    while (hd.items.length < v.each) addItem(hd, false);
  };
  if (mode === 'see') holders.forEach(fill);

  // --- Build: tap a plate to put one on it ---
  const placedOrder: Holder[] = [];
  if (mode === 'build') {
    holders.forEach((hd) => {
      hd.el.dataset.role = 'plate';
      k.tap(hd.el, () => {
        if (hd.items.length >= v.each) return void wobble(hd.el);
        addItem(hd, true);
        placedOrder.push(hd);
        ctx.sfx('place');
        ctx.say({ text: '{n}', vals: { n: hd.items.length } });
      });
    });
    backSeal(k, 32, 196, () => {
      const hd = placedOrder.pop();
      const it = hd?.items.pop();
      if (it) liftOff(it, ctx);
    });
  }

  // --- Make groups: scoop from the loose pile ---
  let made = 0;
  let pile: HTMLElement | null = null;
  const pileItems: HTMLElement[] = [];
  if (mode === 'loose') {
    pile = place(h('button', { class: 'b-pile b-share-pile', 'aria-label': `Make a group of ${v.each}`, 'data-role': 'pile' }), BOX.x, 396, BOX.w, 84);
    const perRow = total > 16 ? Math.ceil(total / 2) : total;
    const rows = Math.ceil(total / perRow);
    const size = Math.floor(Math.min(60, (BOX.w - 40) / perRow - 4, 76 / rows - 2));
    const rowW = perRow * (size + 4);
    for (let i = 0; i < total; i++) {
      const it = place(h('div', { class: 'b-obj', html: prop(v.prop) }), (BOX.w - rowW) / 2 + (i % perRow) * (size + 4), (84 - rows * (size + 2)) / 2 + Math.floor(i / perRow) * (size + 2), size, size);
      pile.append(it);
      pileItems.push(it);
    }
    el.append(pile);
  }
  const makeGroup = async (quiet = false) => {
    if (!pile || made >= holders.length) return;
    const hd = holders[made];
    made += 1;
    el.append(hd.el);
    if (!quiet) ctx.sfx('place');
    const scoop = pileItems.splice(-v.each);
    const from = scoop[0];
    const fx = from ? BOX.x + from.offsetLeft : 590;
    scoop.forEach((s) => s.remove());
    if (!pileItems.length) pile.classList.add('is-empty');
    fill(hd);
    await flyIn(hd.el, fx - parseFloat(hd.el.style.left), 396 - parseFloat(hd.el.style.top), ctx, 0.4);
  };
  if (pile) {
    const p0 = pile;
    k.tap(p0, () => {
      if (finishing) return;
      if (made >= holders.length) return void wobble(p0);
      void makeGroup();
    });
  }

  sumText(k, p.text, mode === 'loose' ? 488 : 470);
  const cards = answerCards(k, p.choices ?? fallbackChoices(p.answer));

  let finishing = false;
  /** Finishes the picture: every plate full, every group made. */
  const finish = async () => {
    if (mode === 'build') {
      holders.forEach(fill);
      placedOrder.length = 0;
    }
    if (mode === 'loose' && !finishing) {
      finishing = true;
      while (made < holders.length) {
        void makeGroup(true);
        await new Promise((r) => setTimeout(r, ctx.calm ? 20 : 150));
      }
    }
  };

  let counted = false;
  const countAlong = () => {
    if (counted) return;
    counted = true;
    const answer = Number(p.answer);
    holders.forEach((hd, i) => {
      const label = answer === v.groups && answer !== total ? i + 1 : (i + 1) * v.each;
      el.append(countTag(label, hd.tagAt[0], hd.tagAt[1], 72));
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
      holders.forEach((hd) => hd.el.isConnected && void pop(hd.el, 1.04));
    },
    help(level) {
      if (level === 1) {
        (mode === 'loose' && pile ? [pile] : holders.map((hd) => hd.el)).forEach((e) => e.classList.add('hint-glow'));
        return;
      }
      void finish().then(countAlong);
      if (level === 2) removeOneWrong(cards, p.answer);
      else hintAnswer(k, p.answer);
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}

/** Plates in one row (up to 5) or two rows, each with room for `cap` items. */
function plates(n: number, cap: number, build: boolean, box: Box): Holder[] {
  const perRow = n <= 5 ? n : Math.ceil(n / 2);
  const rows = Math.ceil(n / perRow);
  const gap = 20;
  const tagRoom = 52;
  const pw = Math.min(230, (box.w - (perRow - 1) * gap) / perRow);
  const ph = Math.min(220, pw * 0.85, (box.h - (rows - 1) * gap - rows * tagRoom) / rows);
  const cols = Math.ceil(Math.sqrt(cap * (pw / ph)));
  const itemRows = Math.ceil(cap / cols);
  const size = Math.floor(Math.min(72, (pw * 0.78) / cols, (ph * 0.7) / itemRows));
  const totalH = rows * ph + (rows - 1) * (gap + tagRoom) + tagRoom;
  const y0 = box.y + Math.max(0, (box.h - totalH) / 2);
  const out: Holder[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / perRow);
    const inRow = Math.min(perRow, n - r * perRow);
    const rowW = inRow * pw + (inRow - 1) * gap;
    const x = box.x + (box.w - rowW) / 2 + (i % perRow) * (pw + gap);
    const y = y0 + r * (ph + gap + tagRoom);
    const el = place(h(build ? 'button' : 'div', { class: 'b-plate', html: plateArt(Math.round(pw), Math.round(ph)), 'aria-label': build ? 'Put one on this plate' : undefined }), x, y, pw, ph);
    el.style.setProperty('--plate-h', `${ph}px`);
    const gx = (pw - cols * size) / 2;
    const gy = (ph - itemRows * size) / 2;
    out.push({
      el,
      items: [],
      size,
      pos: (j) => [gx + (j % cols) * size, gy + Math.floor(j / cols) * size],
      tagAt: [x + pw / 2, y + ph + 2],
    });
  }
  return out;
}

/** An array: one shelf per row, items standing on it from the left. */
function shelves(n: number, cap: number, build: boolean, box: Box): Holder[] {
  const tagW = 90;
  const rowH = Math.min(96, box.h / n);
  const size = Math.floor(Math.min(rowH - 12, (box.w - tagW - 40) / cap - 6));
  const rowW = Math.min(box.w - tagW, cap * (size + 6) + 40);
  const x = box.x + (box.w - tagW - rowW) / 2;
  const y0 = box.y + (box.h - n * rowH) / 2;
  const out: Holder[] = [];
  for (let i = 0; i < n; i++) {
    const y = y0 + i * rowH;
    const el = place(h(build ? 'button' : 'div', { class: 'b-shelf', html: shelfArt(Math.round(rowW), Math.round(rowH)), 'aria-label': build ? 'Put one on this shelf' : undefined }), x, y, rowW, rowH);
    out.push({
      el,
      items: [],
      size,
      pos: (j) => [20 + j * (size + 6), rowH - 18 - size],
      tagAt: [x + rowW + tagW / 2 + 4, y + (rowH - 48) / 2],
    });
  }
  return out;
}
