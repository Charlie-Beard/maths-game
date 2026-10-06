/**
 * `fraction`: halves, quarters and thirds of ice-pies and birthday cakes.
 *
 * What he does depends on the problem:
 *   - shade: the picture is cut but nothing is coloured yet (visual
 *     shaded = 0). He taps parts to colour them in (tap again to undo),
 *     then OK. The answer is a word ("half", "quarter", "third", "whole"),
 *     a fraction ("1/2") or a number of parts; any equal fraction counts
 *     (2 of 4 shaded is a half).
 *   - which picture: the choices are picture codes like "circle:2:1" or
 *     "rect:2:1:u" (u = cut unequally; see parsePictureCode), shown as
 *     little pies and cakes on the cards.
 *   - read: the picture is shaded and the cards say half / quarter / third
 *     (or yes / no: "is the shaded piece a half?", or ½ ¼ as fractions).
 *   - of an amount: with a `share` visual ("half of 8 apples") he deals the
 *     objects onto plates, as in `share`, and chooses how many on one. (The
 *     generators send these to `share` itself; both work.)
 *
 * "Show me" numbers the parts, so he can count how many there are and how
 * many are coloured; in shade mode it outlines the parts to colour.
 */
import type { Answer, Problem } from '../core/problem';
import { pop, wobble } from '../ui/anim';
import { h, place } from '../ui/dom';
import { fractionArt, parsePictureCode, partCentres } from './b-art';
import { answerCards, cardRight, cardsIn, countTag, fallbackChoices, hintAnswer, isFraction, kit, okSeal, removeOneWrong, sumText, wobbleValue } from './b-kit';
import { choose } from './choose';
import { sharePlates } from './share';
import type { Activity, ActivityContext } from './types';

const SIZE = 340;
/** Fractions as words, as the generators write them. */
const WORDS: Record<string, number> = { whole: 1, half: 1 / 2, third: 1 / 3, quarter: 1 / 4 };
const PIC = { x: 590 - SIZE / 2, y: 112 };

export function fraction(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual;
  if (v.type === 'share') return sharePlates(p, ctx);
  const choices = p.choices ?? [];
  if (choices.length && choices.every((c) => parsePictureCode(String(c)))) return pictureMode(p, ctx);
  if (v.type !== 'fraction') return choose(p, ctx);
  return v.shaded === 0 && v.parts > 0 ? shadeMode(p, ctx) : readMode(p, ctx);
}

/** The big pie or cake in the middle of the picture box. */
function bigShape(p: Problem, el: HTMLElement): { box: HTMLElement; parts: SVGGElement[]; tagAll: () => void } {
  const v = p.visual as Extract<Problem['visual'], { type: 'fraction' }>;
  const box = place(h('div', { class: 'b-fraction-shape', html: fractionArt(v.shape, v.parts, v.shaded, { size: SIZE, equal: v.equal, name: 'b-frac-' + p.key }) }), PIC.x, PIC.y, SIZE, SIZE);
  el.append(box);
  const parts = [...box.querySelectorAll<SVGGElement>('.b-part')];
  let tagged = false;
  const tagAll = () => {
    if (tagged) return;
    tagged = true;
    partCentres(v.shape, v.parts, { size: SIZE, equal: v.equal }).forEach(([x, y], i) => {
      const tag = countTag(i + 1, PIC.x + x, PIC.y + y - 24, 56);
      tag.classList.add('b-part-tag');
      el.append(tag);
    });
  };
  return { box, parts, tagAll };
}

// ---------------------------------------------------------------------------
// Shade: colour in a half, a quarter, a third
// ---------------------------------------------------------------------------

function shadeMode(p: Problem, ctx: ActivityContext): Activity {
  const v = p.visual as Extract<Problem['visual'], { type: 'fraction' }>;
  const k = kit('fraction', ctx);
  const { el } = k;
  el.classList.add('is-build');
  const { box, parts, tagAll } = bigShape(p, el);
  sumText(k, p.text, 466);

  // What the answer means, as a fraction of the whole: "1/2", "half", or a number of parts.
  const share = (() => {
    const s = String(p.answer);
    if (isFraction(s)) {
      const [a, b] = s.split('/').map(Number);
      return a / b;
    }
    if (s in WORDS) return WORDS[s];
    return Number(p.answer) / v.parts;
  })();
  const want = Math.round(share * v.parts);

  const shadedCount = () => parts.filter((g) => g.classList.contains('is-shaded')).length;
  /** What OK answers: the problem's own answer when it matches, so 2 of 4 counts as a half. */
  const value = (): Answer => {
    const s = shadedCount();
    if (typeof p.answer === 'number') return s;
    return Math.abs(s / v.parts - share) < 1e-9 ? p.answer : `${s}/${v.parts}`;
  };
  const ok = okSeal(k, 526, 606, () => ctx.answer(value()));
  const refresh = () => {
    ok.dataset.value = String(value());
  };
  refresh();

  parts.forEach((g) => {
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', 'Colour this part');
    g.dataset.role = 'part';
    k.tap(g, () => {
      g.classList.toggle('is-shaded');
      ctx.sfx(g.classList.contains('is-shaded') ? 'place' : 'lift');
      refresh();
    });
  });

  return {
    el,
    show() {
      if (!ctx.calm) void pop(box, 1.04);
    },
    wrong() {
      void wobble(ok);
    },
    async right() {
      ok.classList.add('is-right');
      void pop(box, 1.06);
      await pop(ok, 1.2);
    },
    help(level) {
      if (level === 1) {
        box.classList.add('hint-glow');
        return;
      }
      tagAll();
      parts.forEach((g, i) => g.classList.toggle('is-ghost', i < want));
      if (level === 3) {
        parts.forEach((g, i) => g.classList.toggle('is-shaded', i < want));
        refresh();
        hintAnswer(k, p.answer);
      }
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}

// ---------------------------------------------------------------------------
// Read: what fraction is coloured?
// ---------------------------------------------------------------------------

function readMode(p: Problem, ctx: ActivityContext): Activity {
  const k = kit('fraction', ctx);
  const { el } = k;
  const { box, tagAll } = bigShape(p, el);
  sumText(k, p.text, 466);
  const cards = answerCards(k, p.choices ?? fallbackChoices(p.answer));
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
      if (level === 1) box.classList.add('hint-glow');
      else {
        tagAll();
        if (level === 2) removeOneWrong(cards, p.answer);
        else hintAnswer(k, p.answer);
      }
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}

// ---------------------------------------------------------------------------
// Which picture shows a half?
// ---------------------------------------------------------------------------

const PIC_CARD = 200;

function pictureMode(p: Problem, ctx: ActivityContext): Activity {
  const k = kit('fraction', ctx);
  const { el } = k;
  el.classList.add('is-pictures');
  // The fraction he's looking for, big, in the picture box.
  const title = p.text ? place(h('div', { class: 'b-frac-title' }, p.text), 160, 180, 860, 200) : null;
  if (title) el.append(title);
  const choices = p.choices ?? [];
  const cards = answerCards(k, choices, {
    y: 520,
    size: PIC_CARD,
    width: () => 150,
    face: (c) => {
      const pic = parsePictureCode(String(c));
      if (!pic) return '';
      return `<span class="b-card-pic">${fractionArt(pic.shape, pic.parts, pic.shaded, { size: 170, equal: pic.equal, name: 'b-pic-' + String(c) })}</span>`;
    },
  });
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
      if (level === 1) {
        title?.classList.add('hint-glow');
        cards.forEach((c) => c.classList.add('is-counting'));
      } else if (level === 2) removeOneWrong(cards, p.answer);
      else hintAnswer(k, p.answer);
    },
    lock: k.lock,
    destroy: k.destroy,
  };
}
