/**
 * Generators for the first lands: counting, adding and taking away within
 * 10, and number bonds to 10. These are the reference implementations the
 * other generators follow.
 */
import type { Problem } from '../problem';
import type { Rand } from '../random';
import { capital, choicesFor, COUNTING_PROPS, FOLK, plural, propWord } from './helpers';

export function count10(tier: number, r: Rand): Problem {
  const n = tier === 1 ? r.int(1, 5) : r.int(3, 10);
  const prop = r.pick(COUNTING_PROPS);
  const say = { text: `How many ${propWord(prop, 2)} can you count?` };
  if (tier >= 4) {
    // Match a count to its numeral: the choices are numerals, read silently.
    return {
      skill: 'count-10',
      tier,
      activity: 'choose',
      say: { text: `Count the ${propWord(prop, 2)}. Which number is it?` },
      answer: n,
      choices: choicesFor(n, r, { min: 1, max: 10, likely: [n + 1, n - 1] }),
      visual: { type: 'objects', groups: [{ prop, count: n }], layout: 'scatter' },
      explain: { text: `{n} ${propWord(prop, n)}!`, vals: { n } },
      key: `count-10:${n}:${prop}`,
    };
  }
  return {
    skill: 'count-10',
    tier,
    activity: 'count',
    say,
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: 10, likely: [n + 1, n - 1] }),
    visual: { type: 'objects', groups: [{ prop, count: n }], layout: tier === 3 ? 'scatter' : 'row' },
    explain: { text: `{n} ${propWord(prop, n)}!`, vals: { n } },
    key: `count-10:${n}:${prop}`,
  };
}

/** add-5 and add-10 share one generator: totals up to `max`. */
function addWithin(skill: 'add-5' | 'add-10', max: number, tier: number, r: Rand): Problem {
  const total = r.int(2, max);
  const a = r.int(1, total - 1);
  const b = total - a;
  const prop = r.pick(COUNTING_PROPS);
  const who = r.pick(FOLK);
  const say = {
    text: `${capital(who)} has {a} ${propWord(prop, a)}. Then {b} more ${plural(b, 'comes', 'come')}. How many now?`,
    vals: { a, b },
  };
  const explain = { text: '{a} add {b} makes {c}!', vals: { a, b, c: total } };
  const choices = choicesFor(total, r, { min: 0, max: max + 2, likely: [total + 1, total - 1, Math.abs(a - b)] });
  const base = { skill, tier, say, answer: total, choices, explain, key: `${skill}:${a}+${b}` } as const;

  // Tiers by skill: add-5 has 3 (objects, objects + sum, sum); add-10 has 5.
  const stage = skill === 'add-5' ? [0, 1, 2, 4][tier] : tier;
  if (stage <= 2) {
    return {
      ...base,
      activity: 'count',
      text: stage === 2 && skill === 'add-5' ? `${a} + ${b} = ?` : undefined,
      visual: { type: 'objects', groups: [{ prop, count: a }, { prop, count: b }], op: '+' },
    };
  }
  if (stage === 3) {
    return { ...base, activity: 'tenFrame', text: `${a} + ${b} = ?`, visual: { type: 'tenFrame', frames: [a], add: b, prop } };
  }
  return {
    ...base,
    say: { text: 'What is {a} add {b}?', vals: { a, b } },
    activity: stage >= 5 ? 'numberPad' : 'choose',
    text: `${a} + ${b} = ?`,
    visual: { type: 'none' },
  };
}

export const add5 = (tier: number, r: Rand): Problem => addWithin('add-5', 5, tier, r);

export function add10(tier: number, r: Rand): Problem {
  return addWithin('add-10', tier === 1 ? 5 : 10, tier, r);
}

export function sub10(tier: number, r: Rand): Problem {
  const max = tier === 1 ? 5 : 10;
  const a = r.int(2, max);
  const b = r.int(1, a - 1);
  const c = a - b;
  const prop = r.pick(COUNTING_PROPS);
  const who = r.pick(FOLK);
  const say = { text: `${capital(who)} has {a} ${propWord(prop, a)}. {b} ${plural(b, 'rolls', 'roll')} away. How many are left?`, vals: { a, b } };
  const explain = { text: '{a} take away {b} leaves {c}!', vals: { a, b, c } };
  const choices = choicesFor(c, r, { min: 0, max: 10, likely: [c + 1, c - 1, Math.min(a + b, 10)] });
  const base = { skill: 'sub-10', tier, say, answer: c, choices, explain, key: `sub-10:${a}-${b}` } as const;
  if (tier <= 2) {
    return { ...base, activity: 'count', visual: { type: 'objects', groups: [{ prop, count: a, gone: b }], op: '-' } };
  }
  if (tier === 3) {
    return { ...base, activity: 'tenFrame', text: `${a} − ${b} = ?`, visual: { type: 'tenFrame', frames: [a], remove: b, prop } };
  }
  if (tier === 4) {
    return {
      ...base,
      say: { text: 'Start at {a}. Jump back {b}. Where do you land?', vals: { a, b } },
      activity: 'numberLine',
      text: `${a} − ${b} = ?`,
      visual: { type: 'numberLine', from: 0, to: 10, start: a, step: -1 },
    };
  }
  return { ...base, say: { text: 'What is {a} take away {b}?', vals: { a, b } }, activity: 'numberPad', text: `${a} − ${b} = ?`, visual: { type: 'none' } };
}

export function bonds10(tier: number, r: Rand): Problem {
  const a = r.int(0, 10);
  const b = 10 - a;
  const explain = { text: '{a} and {b} make 10!', vals: { a, b } };
  const choices = choicesFor(b, r, { min: 0, max: 10, likely: [a, b + 1, b - 1] });
  const base = { skill: 'bonds-10', tier, answer: b, choices, explain, key: `bonds-10:${a}` } as const;
  if (tier === 1) {
    return {
      ...base,
      say: { text: 'Silky’s tin holds 10 pop biscuits. It has {a}. How many more to fill it?', vals: { a } },
      activity: 'tenFrame',
      visual: { type: 'tenFrame', frames: [a], prop: 'popBiscuit' },
    };
  }
  if (tier === 2) {
    return {
      ...base,
      say: { text: '{a} and how many more make 10?', vals: { a } },
      activity: 'partWhole',
      visual: { type: 'partWhole', whole: 10, parts: [a, null], model: 'cherry' },
    };
  }
  return {
    ...base,
    say: { text: '{a} add what makes 10?', vals: { a } },
    activity: tier >= 4 ? 'numberPad' : 'choose',
    text: `${a} + ? = 10`,
    visual: { type: 'none' },
  };
}
