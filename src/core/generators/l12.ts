/**
 * Generators for land 12, the Land of Music (Mr Oom Boom Boom's land): `count-3s`, `time-5`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * - `count-3s` ("oom-pah-pah", music in threes): 1 groups of 3 to count
 *   (`groups` activity); 2 hop along the number line in threes (`numberLine`,
 *   step ±3, so every rung is a multiple of 3); 3 "4 threes" as a number
 *   (`choose`); 4 the same typed (`numberPad`), with the odd missing number
 *   in a count of threes. Always 3 × 1…10, and every answer is a multiple of 3.
 * - `time-5`, on the `clock` activity: 1 five, ten, twenty and twenty-five
 *   past (only "past"); 2 the same "to" (a few "past" for review); 3 any
 *   five-minute time; 4 set the hands (no choices, so the clock activity
 *   starts at 12 o'clock and he turns the hands in 5-minute steps: the
 *   target is never a quarter or half hour, or it would step by 15);
 *   5 how long? Later or earlier by 5–30 minutes, from a clock face.
 *   Answers are `timeWords` strings, and `hour` in the clock visual is the
 *   hour it is now. Wrong cards are the plausible slips: past and to
 *   mixed up, the hour out by one, the two hands swapped.
 */
import type { Answer, Problem, PropId, Speech } from '../problem';
import type { Rand } from '../random';
import type { SkillId } from '../skills';
import { choicesFor, propWord, type Generator } from './helpers';
import { timeWords } from './more';

// ---------------------------------------------------------------------------
// Shared pieces

/** Joins pieces of speech into one, merging their slot values. */
function joinSpeech(...parts: (string | Speech)[]): Speech {
  let text = '';
  const vals: Record<string, number | string> = {};
  for (const p of parts) {
    if (typeof p === 'string') text += p;
    else {
      text += p.text;
      Object.assign(vals, p.vals);
    }
  }
  return Object.keys(vals).length ? { text, vals } : { text };
}

/** "3, 6, 9" as speech, each number in its own slot (`prefix` keeps slots apart). */
function saidNumbers(values: number[], prefix: string): Speech {
  const vals: Record<string, number> = {};
  const text = values
    .map((v, i) => {
      vals[`${prefix}${i}`] = v;
      return `{${prefix}${i}}`;
    })
    .join(', ');
  return { text, vals };
}

/** Choices that are all multiples of `step` (so they sit on the number line). */
function stepChoices(answer: number, step: number, r: Rand, o: { min: number; max: number; likely: number[] }): number[] {
  const out = new Set<number>([answer]);
  const ok = (n: number) => n % step === 0 && n >= o.min && n <= o.max && !out.has(n);
  for (const n of r.shuffle(o.likely)) if (out.size < 4 && ok(n)) out.add(n);
  for (let d = step; out.size < 4 && d <= o.max; d += step) {
    for (const n of r.shuffle([answer - d, answer + d])) if (out.size < 4 && ok(n)) out.add(n);
  }
  return r.shuffle([...out]);
}

// ---------------------------------------------------------------------------
// count-3s

/** Things that come in threes without looking odd (all have distinct pictures). */
const THREE_PROPS: readonly PropId[] = ['star', 'balloon', 'present', 'candle', 'hat', 'button', 'teacup'];

export function count3s(tier: number, r: Rand): Problem {
  const skill: SkillId = 'count-3s';
  const threes = (n: number): Speech => saidNumbers(Array.from({ length: n }, (_, i) => 3 * (i + 1)), 'c');

  if (tier === 1) {
    const n = r.int(2, 6);
    const c = n * 3;
    const prop = r.pick(THREE_PROPS);
    return {
      skill,
      tier,
      activity: 'groups',
      say: { text: `Oom-pah-pah! Three ${propWord(prop, 2)} on every plate. Count in threes. How many altogether?` },
      text: `${n} × 3 = ?`,
      answer: c,
      // Likely slips: counting the plates, one plate out, one object out.
      choices: choicesFor(c, r, { min: 3, max: 30, likely: [n, c + 3, c - 3, c + 1, c - 1] }),
      visual: { type: 'groups', groups: n, each: 3, layout: 'groups', prop },
      explain: joinSpeech(threes(n), { text: `. {n} threes make {c}!`, vals: { n, c } }),
      key: `${skill}:groups:${n}`,
    };
  }

  if (tier === 2) {
    // Hop along 0 to 30 in threes (every rung is a multiple of 3).
    const k = r.int(2, 4);
    const back = r.chance(0.25);
    const start = back ? 3 * r.int(k, 10) : 3 * r.int(0, 10 - k);
    const step = back ? -3 : 3;
    const answer = start + step * k;
    const hops = Array.from({ length: k }, (_, i) => start + step * (i + 1));
    return {
      skill,
      tier,
      activity: 'numberLine',
      say: { text: `Oom-pah-pah! Start at {start}. Hop ${back ? 'back' : 'on'} {k} threes. Where do you land?`, vals: { start, k } },
      answer,
      // Likely slips: hopping the wrong way, one hop too many or too few, hops of 1.
      choices: stepChoices(answer, 3, r, { min: 0, max: 30, likely: [start - step * k, answer + step, answer - step, start] }),
      visual: { type: 'numberLine', from: 0, to: 30, start, step },
      explain: joinSpeech({ text: 'From {start}: ', vals: { start } }, saidNumbers(hops, 'c'), { text: '. You land on {answer}!', vals: { answer } }),
      key: `${skill}:line:${start}:${step * k}`,
    };
  }

  const n = r.int(1, 10);
  const c = n * 3;
  const explain = joinSpeech(threes(n), { text: `. {n} ${n === 1 ? 'three makes' : 'threes make'} {c}!`, vals: { n, c } });
  const likely = [c + 3, c - 3, 4 * n, 2 * n, n + 3, c + 1, c - 1];

  if (tier === 3) {
    const flipped = r.chance(0.3);
    return {
      skill,
      tier,
      activity: 'choose',
      say: flipped ? { text: 'What is {n} times three?', vals: { n } } : { text: `Oom-pah-pah! {n} ${n === 1 ? 'three' : 'threes'}. How many is that?`, vals: { n } },
      text: `${n} × 3 = ?`,
      answer: c,
      choices: choicesFor(c, r, { min: 0, max: 33, likely }),
      visual: { type: 'none' },
      explain,
      key: `${skill}:${n}x3`,
    };
  }

  // Tier 4: typed. Mostly "n threes"; sometimes a missing number in a count of threes.
  if (r.chance(0.3)) {
    const len = 4;
    const first = 3 * r.int(1, 10 - (len - 1));
    const seq = Array.from({ length: len }, (_, i) => first + 3 * i);
    const gap = r.int(1, len - 1);
    const answer = seq[gap];
    return {
      skill,
      tier,
      activity: 'numberPad',
      say: { text: 'Oom-pah-pah! Count in threes. Which number is missing?' },
      text: seq.map((v, i) => (i === gap ? '?' : String(v))).join(', '),
      answer,
      choices: stepChoices(answer, 3, r, { min: 0, max: 33, likely: [seq[gap - 1] + 1, answer + 3, answer - 3] }),
      visual: { type: 'none' },
      explain: joinSpeech(saidNumbers(seq, 'c'), { text: '. The missing number is {answer}!', vals: { answer } }),
      key: `${skill}:seq:${seq.join('-')}`,
    };
  }
  const flipped = r.chance(0.4);
  return {
    skill,
    tier,
    activity: 'numberPad',
    say: flipped ? { text: 'What is three times {n}?', vals: { n } } : { text: `{n} ${n === 1 ? 'three' : 'threes'}. How many is that?`, vals: { n } },
    text: flipped ? `3 × ${n} = ?` : `${n} × 3 = ?`,
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 33, likely }),
    visual: { type: 'none' },
    explain,
    key: `${skill}:typed:${n}x3`,
  };
}

// ---------------------------------------------------------------------------
// time-5

const nextHour = (h: number): number => (h % 12) + 1;
const prevHour = (h: number): number => ((h + 10) % 12) + 1;
const hour12 = (h: number): number => ((h - 1) % 12 + 12) % 12 + 1;

/** A time spoken with its numbers in slots: "20 past {h}", "quarter to {h}". `k` keeps slots apart. */
function timeSpeech(hour: number, minute: number, k = ''): Speech {
  const h = hour12(hour);
  const hs = `h${k}`;
  const ms = `m${k}`;
  if (minute === 0) return { text: `{${hs}} o’clock`, vals: { [hs]: h } };
  if (minute === 30) return { text: `half past {${hs}}`, vals: { [hs]: h } };
  if (minute === 15) return { text: `quarter past {${hs}}`, vals: { [hs]: h } };
  if (minute === 45) return { text: `quarter to {${hs}}`, vals: { [hs]: nextHour(h) } };
  if (minute < 30) return { text: `{${ms}} past {${hs}}`, vals: { [ms]: minute, [hs]: h } };
  return { text: `{${ms}} to {${hs}}`, vals: { [ms]: 60 - minute, [hs]: nextHour(h) } };
}

/** A clock reading from minutes since 12 o'clock. */
function reading(total: number): [number, number] {
  const t = ((total % 720) + 720) % 720;
  return [t === 0 ? 12 : Math.floor(t / 60) || 12, t % 60];
}
const minutesOf = (hour: number, minute: number): number => (hour12(hour) % 12) * 60 + minute;

/** Four time cards: the answer, then the likely slips (in order), then neighbours. */
function timeChoices(answer: string, slips: [number, number][], fill: [number, number][], r: Rand): Answer[] {
  const out: string[] = [answer];
  for (const [h, m] of [...slips, ...fill]) {
    const w = timeWords(hour12(h), m);
    if (out.length < 4 && !out.includes(w)) out.push(w);
  }
  return r.shuffle(out);
}

/** How the big hand points, read back: "The big hand is on 2. That's 10 minutes past 3. It's 10 past 3!" */
function readExplain(h: number, minute: number): Speech {
  const big = minute / 5 || 12;
  const nx = nextHour(h);
  if (minute === 0) return { text: 'The big hand is on {b}. The little hand is on {h}. It’s {h} o’clock!', vals: { b: big, h } };
  if (minute === 30) return { text: 'The big hand is on {b}, half way round. It’s half past {h}!', vals: { b: big, h } };
  if (minute === 15) return { text: 'The big hand is on {b}, a quarter of the way round. It’s quarter past {h}!', vals: { b: big, h } };
  if (minute === 45) return { text: 'The big hand is on {b}. Nearly {n} o’clock! It’s quarter to {n}!', vals: { b: big, n: nx } };
  if (minute < 30) return { text: 'The big hand is on {b}. That’s {m} minutes past {h}. It’s {m} past {h}!', vals: { b: big, m: minute, h } };
  return { text: 'The big hand is on {b}. That’s {m} minutes to {n}. It’s {m} to {n}!', vals: { b: big, m: 60 - minute, n: nx } };
}

/** Plausible wrong readings of "hour h, minute": past and to mixed up, the hour out by one, the hands swapped. */
function readingSlips(h: number, minute: number): [number, number][] {
  const flip: [number, number] = minute < 30 ? [prevHour(h), 60 - minute] : [nextHour(h), 60 - minute];
  const swapped: [number, number] = [minute / 5 || 12, (h % 12) * 5];
  return [flip, [nextHour(h), minute], [prevHour(h), minute], swapped];
}

export function time5(tier: number, r: Rand): Problem {
  const skill: SkillId = 'time-5';
  const band = ['The band’s clock has stopped!', 'The bandstand clock is stuck!', 'Mr Oom Boom Boom’s clock has stopped!'];

  if (tier === 4) {
    // Set the hands. Never a quarter or half hour: those step by 15.
    const minute = r.pick([5, 10, 20, 25, 35, 40, 50, 55]);
    const h = r.int(1, 12);
    const answer = timeWords(h, minute);
    const sp = timeSpeech(h, minute);
    return {
      skill,
      tier,
      activity: 'clock',
      say: joinSpeech('Time for the band! Set the clock to ', sp, '.'),
      text: answer,
      answer,
      visual: { type: 'clock', hour: 12, minute: 0 },
      explain: readExplain(h, minute),
      key: `${skill}:set:${h}:${minute}`,
    };
  }

  if (tier === 5) {
    // How long? Later or earlier by 5 to 30 minutes.
    const h = r.int(1, 12);
    const minute = r.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const delta = 5 * r.int(1, 6);
    const later = r.chance(0.65);
    const now = minutesOf(h, minute);
    const target = now + (later ? delta : -delta);
    const [th, tm] = reading(target);
    const answer = timeWords(th, tm);
    const slips = [later ? now - delta : now + delta, target + 60, target - 60, target + 5, target - 5, target + 10, target - 10].map(reading);
    return {
      skill,
      tier,
      activity: 'clock',
      say: joinSpeech('It is ', timeSpeech(h, minute, 'a'), { text: later ? '. What time will it be in {d} minutes?' : '. What time was it {d} minutes ago?', vals: { d: delta } }),
      answer,
      choices: timeChoices(answer, slips, [], r),
      visual: { type: 'clock', hour: h, minute },
      explain: joinSpeech({ text: `{d} minutes ${later ? 'on' : 'back'} from `, vals: { d: delta } }, timeSpeech(h, minute, 'a'), ' is ', timeSpeech(th, tm, 'b'), '!'),
      key: `${skill}:long:${h}:${minute}:${later ? '+' : '-'}${delta}`,
    };
  }

  const h = r.int(1, 12);
  const minute =
    tier === 1
      ? r.pick([5, 10, 20, 25])
      : tier === 2
        ? r.chance(0.2)
          ? r.pick([5, 10, 20, 25])
          : r.pick([35, 40, 50, 55])
        : r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const answer = timeWords(h, minute);
  const others: [number, number][] = [5, 10, 20, 25, 35, 40, 50, 55].filter((m) => m !== minute).map((m) => [h, m]);
  return {
    skill,
    tier,
    activity: 'clock',
    say: { text: `${r.pick(band)} What time does it say?` },
    answer,
    choices: timeChoices(answer, readingSlips(h, minute), r.shuffle(others), r),
    visual: { type: 'clock', hour: h, minute },
    explain: readExplain(h, minute),
    key: `${skill}:${h}:${minute}`,
  };
}

export const L12: Partial<Record<SkillId, Generator>> = {
  'count-3s': count3s,
  'time-5': time5,
};
