/**
 * Story problems (land 7): short, spoken stories about the Folk of the
 * Faraway Tree. The skill is hearing whether it's adding or taking away,
 * so the sum is not written on screen (it would give that away); the
 * read-back says the sum afterwards.
 *
 * Names and prop words are fixed pieces of each line; only the numbers go
 * in {slots}, so the voice can record each line once and drop numbers in.
 */
import type { Problem, PropId, Speech } from '../../problem';
import type { Rand } from '../../random';
import { choicesFor, propWord } from '../helpers';
import { cap, explainSum, FOOD_PROPS, he, him, STORY_PROPS, twoFolk } from './shared';

/** An adding story: someone has a, then b more arrive. */
function addStory(a: number, b: number, prop: PropId, r: Rand): Speech {
  const [who, other] = twoFolk(r);
  const Who = cap(who);
  const many = propWord(prop, 2);
  const lines = [
    `${Who} has {a} ${propWord(prop, a)}. ${cap(other)} gives ${him(who)} {b} more. How many ${many} does ${he(who)} have now?`,
    `${Who} finds {a} ${propWord(prop, a)}. Then ${he(who)} finds {b} more. How many ${many} altogether?`,
    `There ${a === 1 ? 'is' : 'are'} {a} ${propWord(prop, a)} at the top of the Faraway Tree. ${cap(other)} brings {b} more. How many ${many} now?`,
  ];
  return { text: r.pick(lines), vals: { a, b } };
}

/** A taking-away story: someone has a, then b go. */
function subStory(a: number, b: number, prop: PropId, r: Rand): Speech {
  const [who, other] = twoFolk(r);
  const Who = cap(who);
  const He = cap(he(who));
  const lines = [
    `${Who} has {a} ${propWord(prop, a)}. ${He} gives {b} to ${other}. How many are left?`,
    `${Who} has {a} ${propWord(prop, a)}. The wind blows {b} away. How many are left?`,
    `${Who} has {a} ${propWord(prop, a)}. ${He} drops {b} down the slippery-slip. How many are left?`,
  ];
  if (FOOD_PROPS.includes(prop)) lines.push(`${Who} has {a} ${propWord(prop, a)}. ${cap(other)} eats {b}. How many are left?`);
  return { text: r.pick(lines), vals: { a, b } };
}

export function wordProblems(tier: number, r: Rand): Problem {
  const prop = r.pick(STORY_PROPS);
  const base = { skill: 'word-problems', tier, activity: 'choose' } as const;

  if (tier === 4) {
    // Two steps: some come, then some go (or the other way round), within 20.
    const addFirst = r.chance(0.5);
    let a: number, b: number, d: number, mid: number, c: number;
    if (addFirst) {
      a = r.int(2, 12);
      b = r.int(1, Math.min(9, 20 - a));
      mid = a + b;
      d = r.int(1, Math.min(9, mid - 1));
      c = mid - d;
    } else {
      a = r.int(4, 20);
      b = r.int(1, Math.min(9, a - 1));
      mid = a - b;
      d = r.int(1, Math.min(9, 20 - mid));
      c = mid + d;
    }
    const [who, other] = twoFolk(r);
    const Who = cap(who);
    const He = cap(he(who));
    const things = propWord(prop, a);
    const say = addFirst
      ? { text: `${Who} has {a} ${things}. ${cap(other)} gives ${him(who)} {b} more. Then ${he(who)} gives {d} away. How many ${propWord(prop, 2)} now?`, vals: { a, b, d } }
      : { text: `${Who} has {a} ${things}. ${He} gives {b} away. Then ${other} gives ${him(who)} {d} more. How many ${propWord(prop, 2)} now?`, vals: { a, b, d } };
    const explain = addFirst
      ? { text: '{a} add {b} makes {mid}. {mid} take away {d} leaves {c}!', vals: { a, b, mid, d, c } }
      : { text: '{a} take away {b} leaves {mid}. {mid} add {d} makes {c}!', vals: { a, b, mid, d, c } };
    return {
      ...base,
      say,
      answer: c,
      // Slips: stopped after the first step, or did both steps the same way.
      choices: choicesFor(c, r, { min: 0, max: 30, likely: [mid, addFirst ? mid + d : Math.max(0, mid - d), c + 1, c - 1] }),
      visual: { type: 'none' },
      explain,
      key: `word-problems:${a}${addFirst ? '+' : '-'}${b}${addFirst ? '-' : '+'}${d}`,
    };
  }

  // Tier 1 adds within 10; tier 2 takes away within 20; tier 3 is either.
  const adding = tier === 1 || (tier === 3 && r.chance(0.5));
  if (adding) {
    const max = tier === 1 ? 10 : 20;
    const c = r.int(tier === 1 ? 3 : 6, max);
    const a = r.int(Math.max(1, c - 9), Math.min(c - 1, 15));
    const b = c - a;
    const choices = choicesFor(c, r, { min: 0, max: max + 2, likely: [c + 1, c - 1, Math.abs(a - b)] });
    const common = { ...base, say: addStory(a, b, prop, r), answer: c, choices, explain: explainSum(a, '+', b, c), key: `word-problems:${a}+${b}` };
    if (tier === 1) {
      // The story's things, as pictures to count.
      return { ...common, activity: 'count', visual: { type: 'objects', groups: [{ prop, count: a }, { prop, count: b }], op: '+' } };
    }
    return { ...common, visual: { type: 'none' } };
  }
  const a = r.int(5, 20);
  const b = r.int(1, Math.min(9, a - 1));
  const c = a - b;
  return {
    ...base,
    say: subStory(a, b, prop, r),
    answer: c,
    // The add-instead slip is the one this skill is about.
    choices: choicesFor(c, r, { min: 0, max: 30, likely: [a + b, c + 1, c - 1] }),
    visual: { type: 'none' },
    explain: explainSum(a, '−', b, c),
    key: `word-problems:${a}-${b}`,
  };
}
