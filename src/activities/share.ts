/**
 * `share`: share items fairly between characters (visual total, between,
 * prop). The items wait in a pile; each tap on the pile deals one to the
 * next character in turn, onto the plate in front of them, like dealing
 * cards. The answer, how many each, is chosen from the cards (he can choose
 * whenever he likes; dealing is there to help him find out).
 *
 * The same dealing, onto plain plates, is used by `fraction` for "half of
 * 8" or "a quarter of 12" (see sharePlates).
 *
 * "Show me" deals out what is left and writes each plate's count under it.
 */
import { characterArt } from '../art/characters';
import { hashString } from '../art/paper';
import { prop } from '../art/props';
import type { Answer, Problem } from '../core/problem';
import { pop, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { plateArt } from './b-art';
import { answerCards, cardRight, cardsIn, countTag, fallbackChoices, flyIn, hintAnswer, kit, removeOneWrong, sumText, wobbleValue } from './b-kit';
import { choose } from './choose';
import type { Activity, ActivityContext } from './types';

const BOX = { x: 160, y: 104, w: 860 };
const PILE = { y: 404, h: 80 };
const FOLK = ['moonface', 'saucepan', 'washalot', 'watzisname', 'pixie', 'silky'];

export function share(p: Problem, ctx: ActivityContext): Activity {
  return dealing(p, ctx, true);
}

/** Fraction of an amount: the same dealing, onto plain plates. */
export function sharePlates(p: Problem, ctx: ActivityContext): Activity {
  return dealing(p, ctx, false);
}

function dealing(p: Problem, ctx: ActivityContext, withFolk: boolean): Activity {
  const v = p.visual;
  if (v.type !== 'share' || v.between < 1) return choose(p, ctx);
  const k = kit(withFolk ? 'share' : 'fraction', ctx);
  const { el } = k;
  el.classList.add('b-dealing');
  const n = v.between;
  const cap = Math.ceil(v.total / n);

  // --- Who it's shared between, and their plates ---
  const colW = BOX.w / n;
  const plateY = withFolk ? 244 : 150;
  const plateH = withFolk ? 150 : 210;
  const plateW = Math.min(220, colW - 20);
  const cols = Math.max(1, Math.min(cap, Math.ceil(Math.sqrt(cap * (plateW / plateH) * 1.2))));
  const rows = Math.ceil(cap / cols);
  const size = Math.floor(Math.min(64, (plateW * 0.74) / cols, (plateH * 0.7) / rows));
  const start = hashString(p.key) % FOLK.length;
  const plates = Array.from({ length: n }, (_, i) => {
    const cx = BOX.x + colW * (i + 0.5);
    if (withFolk) {
      const who = FOLK[(start + i) % FOLK.length];
      el.append(place(h('div', { class: 'b-folk', html: characterArt(who) }), cx - 60, BOX.y, 120, 136));
    }
    const plate = place(h('div', { class: 'b-plate', html: plateArt(Math.round(plateW), plateH) }), cx - plateW / 2, plateY, plateW, plateH);
    el.append(plate);
    const gx = cx - (cols * size) / 2;
    const gy = plateY + (plateH - rows * size) / 2;
    return { plate, cx, items: [] as HTMLElement[], slot: (j: number): [number, number] => [gx + (j % cols) * size, gy + Math.floor(j / cols) * size] };
  });

  // --- The pile ---
  const pileSize = Math.floor(Math.min(64, (BOX.w - 60) / v.total - 4));
  const pile = place(h('button', { class: 'b-pile b-share-pile', 'aria-label': 'Share one out', 'data-role': 'pile' }), BOX.x, PILE.y, BOX.w, PILE.h);
  const pileItems: HTMLElement[] = [];
  const pileW = v.total * (pileSize + 4);
  for (let i = 0; i < v.total; i++) {
    const it = place(h('div', { class: 'b-obj', html: prop(v.prop) }), (BOX.w - pileW) / 2 + i * (pileSize + 4), (PILE.h - pileSize) / 2, pileSize, pileSize);
    pile.append(it);
    pileItems.push(it);
  }
  el.append(pile);
  sumText(k, p.text, 488);

  let dealt = 0;
  const dealOne = async (quiet = false): Promise<void> => {
    const from = pileItems.pop();
    if (!from) return;
    const target = plates[dealt % n];
    dealt += 1;
    const j = target.items.length;
    const [x, y] = target.slot(j);
    const fx = BOX.x + from.offsetLeft;
    const fy = PILE.y + from.offsetTop;
    from.remove();
    const it = place(h('div', { class: 'b-obj', html: prop(v.prop) }), x, y, size, size);
    target.items.push(it);
    el.append(it);
    if (!quiet) ctx.sfx('place');
    if (!pileItems.length) pile.classList.add('is-empty');
    await flyIn(it, fx + pileSize / 2 - (x + size / 2), fy + pileSize / 2 - (y + size / 2), ctx, 0.35);
  };

  k.tap(pile, () => {
    if (!pileItems.length) return void wobble(pile);
    void dealOne();
  });

  const dealAll = async () => {
    k.lock(true);
    while (pileItems.length) {
      void dealOne(true);
      await new Promise((r) => setTimeout(r, ctx.calm ? 20 : 120));
    }
    k.lock(false);
  };

  let tagged = false;
  const showCounts = () => {
    if (tagged) return;
    tagged = true;
    plates.forEach((pl) => el.append(countTag(pl.items.length, pl.cx, plateY + plateH - 4, 72)));
  };

  const cards = answerCards(k, p.choices ?? fallbackChoices(p.answer));

  return {
    el,
    show() {
      cardsIn(cards.values(), ctx);
    },
    wrong: (value: Answer) => wobbleValue(k, value),
    async right() {
      await cardRight(cards.get(String(p.answer)));
      plates.forEach((pl) => void pop(pl.plate, 1.05));
    },
    help(level) {
      if (level === 1) {
        pile.classList.add('hint-glow');
        return;
      }
      void dealAll().then(showCounts);
      if (level === 2) removeOneWrong(cards, p.answer);
      else hintAnswer(k, p.answer);
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}
