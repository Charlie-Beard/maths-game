/**
 * `clock`: the frozen clock tower (docs/PLAN.md §5).
 *
 * Two ways to play, chosen by the problem:
 *
 *   - **Read it** (the problem has `choices`): a big clock showing the
 *     visual's time, and time cards to choose from ("half past 3").
 *   - **Set it** (no `choices`): the hands start somewhere else and he
 *     turns them, a step at a time, with + and − buttons for each hand (or
 *     by tapping a hand, which moves it on one step), then taps OK. The
 *     hour hand moves with the minutes, as on a real clock, so "quarter to
 *     4" has it nearly at 4.
 *
 * The time to set is the problem's answer, as words ("quarter to 4") or
 * "H:MM"; whatever he sets is answered back in the same form.
 *
 * Help: 1 the clock glows; 2 the face shows its "past" and "to" halves
 * (and a wrong card goes, or a hand that is already right is marked done);
 * 3 faint hands show where the real ones go, or the right card glows.
 */
import { C } from '../art/palette';
import type { Answer, Problem } from '../core/problem';
import { h, place } from '../ui/dom';
import { Kit, answerCard, enter, okButton, pop, removeCard, rowX, stepButton, wobble } from './c-kit';
import type { Activity, ActivityContext } from './types';
import { drawClock, setClockHands, timeWords } from './visual';

const SIZE = 380;

interface Time {
  hour: number;
  minute: number;
}

/** Reads a time from an answer: "3:30", "half past 3", "quarter to 4", "20 past 5", "3 o'clock", or an hour. */
export function parseTime(a: Answer): Time | null {
  if (typeof a === 'number') return a >= 1 && a <= 12 ? { hour: a, minute: 0 } : null;
  const s = a.trim().toLowerCase().replace(/’/g, "'");
  let m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (m) return { hour: ((Number(m[1]) + 11) % 12) + 1, minute: Number(m[2]) };
  if ((m = /^(\d{1,2}) o'clock$/.exec(s))) return { hour: Number(m[1]), minute: 0 };
  if ((m = /^half past (\d{1,2})$/.exec(s))) return { hour: Number(m[1]), minute: 30 };
  if ((m = /^quarter past (\d{1,2})$/.exec(s))) return { hour: Number(m[1]), minute: 15 };
  if ((m = /^quarter to (\d{1,2})$/.exec(s))) return { hour: ((Number(m[1]) + 10) % 12) + 1, minute: 45 };
  if ((m = /^(\d{1,2}) past (\d{1,2})$/.exec(s))) return { hour: Number(m[2]), minute: Number(m[1]) };
  if ((m = /^(\d{1,2}) to (\d{1,2})$/.exec(s))) return { hour: ((Number(m[2]) + 10) % 12) + 1, minute: 60 - Number(m[1]) };
  return null;
}

/** Writes a time in the same form as the problem's answer. */
function formatLike(answer: Answer, t: Time): Answer {
  if (typeof answer === 'number') return t.minute === 0 ? t.hour : `${t.hour}:${String(t.minute).padStart(2, '0')}`;
  if (/^\d{1,2}:\d{2}$/.test(answer.trim())) return `${t.hour}:${String(t.minute).padStart(2, '0')}`;
  const words = timeWords(t.hour, t.minute);
  return answer.includes("'") ? words.replace('’', "'") : words;
}

const same = (a: Time, b: Time | null): boolean => !!b && a.hour % 12 === b.hour % 12 && a.minute === b.minute;

export function clock(p: Problem, ctx: ActivityContext): Activity {
  const kit = new Kit('clock');
  const el = kit.el;
  const shown: Time = p.visual.type === 'clock' ? { hour: p.visual.hour, minute: p.visual.minute } : { hour: 12, minute: 0 };
  const setMode = !p.choices?.length;
  const target = setMode ? parseTime(p.answer) : null;

  // The clock face. Re-drawn when help changes it.
  const face = place(h('div', { class: 'c-clock' }), 590 - SIZE / 2, 100, SIZE, SIZE);
  el.append(face);
  let pastTo = false;
  let ghost: Time | undefined;

  if (p.text) el.append(place(h('div', { class: 'sum-text c-sum' }, p.text), 160, 486, 860, 80));

  // ---- Read it ----
  const cards = new Map<string, HTMLElement>();
  if (!setMode) {
    const choices = p.choices ?? [];
    const w = choices.length > 3 ? 196 : 230;
    const xs = rowX(choices.length, w, 24);
    choices.forEach((c, i) => {
      const card = answerCard(String(c), c, xs[i], 600, w, 150);
      kit.tap(card, () => {
        ctx.sfx('tap');
        ctx.answer(c);
      });
      cards.set(String(c), card);
      el.append(card);
    });
  }

  // ---- Set it ----
  const now: Time = { ...shown };
  if (setMode && same(now, target)) {
    now.hour = target && target.hour % 12 === 0 ? 6 : 12;
    now.minute = 0;
  }
  // Minute steps: half hours for o'clock and half past, quarters, or 5 minutes.
  const step = !target || target.minute % 30 === 0 ? 30 : target.minute % 15 === 0 ? 15 : 5;
  const buttons: Record<string, HTMLElement> = {};

  const redraw = () => {
    face.innerHTML = drawClock(now.hour, now.minute, SIZE, { pastTo, ghost, hit: setMode, name: 'activity-clock' });
    if (setMode) {
      face.querySelectorAll<SVGElement>('.hand-hit').forEach((hit) => {
        const which = hit.closest('[data-hand]')?.getAttribute('data-hand');
        kit.tap(hit, () => (which === 'hour' ? turn('hour', 1) : turn('minute', 1)));
      });
    }
  };

  const turn = (hand: 'hour' | 'minute', dir: 1 | -1) => {
    if (hand === 'hour') now.hour = ((now.hour - 1 + dir + 12) % 12) + 1;
    else now.minute = (now.minute + dir * step + 60) % 60;
    setClockHands(face, now.hour, now.minute, SIZE);
    face.dataset.time = `${now.hour}:${String(now.minute).padStart(2, '0')}`;
    for (const k of [`${hand}-`, `${hand}+`, `${hand}Icon`]) buttons[k]?.classList.remove('c-done');
    ctx.sfx('tap');
  };

  if (setMode) {
    const handIcon = (which: 'hour' | 'minute', x: number) => {
      const color = which === 'hour' ? C.barkDark : C.blueDark;
      const icon = h('button', {
        class: 'c-hand-icon',
        'aria-label': which === 'hour' ? 'Move the hour hand' : 'Move the minute hand',
        'data-step': `${which}+`,
        html: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="${which === 'hour' ? 38 : 42}" y="${which === 'hour' ? 30 : 8}" width="${which === 'hour' ? 24 : 16}" height="${which === 'hour' ? 58 : 80}" rx="8" fill="${color}"/><circle cx="50" cy="84" r="9" fill="${C.gold}"/></svg>`,
      });
      icon.append(h('span', { class: 'c-hand-label' }, which === 'hour' ? 'hour' : 'minute'));
      kit.tap(icon, () => turn(which, 1));
      return place(icon, x, 600, 100, 130);
    };
    const hourTint = '#e6d2bf';
    const minTint = '#c9d8ea';
    buttons['hour-'] = stepButton('−', 'Hour hand back', 176, 615, hourTint, 'hour-');
    buttons.hourIcon = handIcon('hour', 286);
    buttons['hour+'] = stepButton('+', 'Hour hand on', 396, 615, hourTint, 'hour+');
    buttons['minute-'] = stepButton('−', 'Minute hand back', 684, 615, minTint, 'minute-');
    buttons.minuteIcon = handIcon('minute', 794);
    buttons['minute+'] = stepButton('+', 'Minute hand on', 904, 615, minTint, 'minute+');
    kit.tap(buttons['hour-'], () => turn('hour', -1));
    kit.tap(buttons['hour+'], () => turn('hour', 1));
    kit.tap(buttons['minute-'], () => turn('minute', -1));
    kit.tap(buttons['minute+'], () => turn('minute', 1));
    const ok = okButton(530, 605, 120);
    kit.tap(ok, () => {
      ctx.sfx('place');
      ctx.answer(same(now, target) ? p.answer : formatLike(p.answer, now));
    });
    buttons.ok = ok;
    el.append(...Object.values(buttons));
  }
  redraw();
  face.dataset.time = `${now.hour}:${String(now.minute).padStart(2, '0')}`;

  const markDone = (hand: 'hour' | 'minute') => {
    for (const k of [`${hand}-`, `${hand}+`, `${hand}Icon`]) buttons[k]?.classList.add('c-done');
  };

  return {
    el,
    show() {
      enter(setMode ? Object.values(buttons) : [...cards.values()], ctx.calm);
    },
    wrong(value: Answer) {
      const card = cards.get(String(value));
      void wobble(card ?? face);
    },
    async right() {
      const card = cards.get(String(p.answer));
      card?.classList.add('is-right');
      await pop(card ?? face, 1.12);
    },
    help(level) {
      if (level === 1) {
        face.classList.add('hint-glow');
        return;
      }
      if (level === 2) {
        pastTo = true;
        redraw();
        if (!setMode) {
          const wrong = [...cards.entries()].filter(([k, c]) => k !== String(p.answer) && c.isConnected && !c.hasAttribute('disabled'));
          if (wrong.length > 1) removeCard(wrong[0][1], ctx.calm);
        } else if (target) {
          if (now.hour % 12 === target.hour % 12) markDone('hour');
          if (now.minute === target.minute) markDone('minute');
        }
        return;
      }
      if (setMode) {
        ghost = target ?? undefined;
        redraw();
        if (target) {
          if (now.hour % 12 !== target.hour % 12) buttons['hour+']?.classList.add('hint-answer');
          if (now.minute !== target.minute) buttons['minute+']?.classList.add('hint-answer');
          buttons.ok?.classList.add('hint-glow');
        }
      } else {
        cards.get(String(p.answer))?.classList.add('hint-answer');
      }
    },
    lock(on) {
      kit.locked = on;
    },
    destroy() {
      kit.destroy();
    },
  };
}
