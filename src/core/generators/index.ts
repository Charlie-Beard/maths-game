/**
 * One generator per skill: (tier, rand) → Problem.
 *
 * Skills whose generator isn't written yet use `placeholder`, which makes a
 * simple addition problem flagged `placeholder: true`, so every chapter is
 * playable while the generators are being built (workstream W1 in
 * docs/ROADMAP.md). tests/unit/generators.test.ts lists the ones left.
 */
import type { Problem } from '../problem';
import type { Rand } from '../random';
import { SKILL_IDS, tierCount, type SkillId } from '../skills';
import { add10, add5, bonds10, count10, sub10 } from './early';
import { choicesFor, type Generator } from './helpers';
import { ADDSUB } from './addsub';
import { MORE } from './more';
import { NUMBER } from './number';

export type { Generator } from './helpers';

const placeholder =
  (skill: SkillId): Generator =>
  (tier, r) => {
    const a = r.int(1, 5);
    const b = r.int(1, 4);
    return {
      skill,
      tier,
      activity: 'choose',
      say: { text: 'What is {a} add {b}?', vals: { a, b } },
      text: `${a} + ${b} = ?`,
      answer: a + b,
      choices: choicesFor(a + b, r, { min: 0, max: 10 }),
      visual: { type: 'none' },
      explain: { text: '{a} add {b} makes {c}!', vals: { a, b, c: a + b } },
      key: `${skill}:placeholder:${a}+${b}`,
      placeholder: true,
    };
  };

const BUILT: Partial<Record<SkillId, Generator>> = {
  'count-10': count10,
  'add-5': add5,
  'add-10': add10,
  'sub-10': sub10,
  'bonds-10': bonds10,
  ...NUMBER,
  ...ADDSUB,
  ...MORE,
};

export const GENERATORS: Record<SkillId, Generator> = Object.fromEntries(
  SKILL_IDS.map((id) => [id, BUILT[id] ?? placeholder(id)]),
) as Record<SkillId, Generator>;

/** Makes a problem for a skill, with the tier clamped to the skill's range. */
export function generate(skill: SkillId, tier: number, r: Rand): Problem {
  const t = Math.max(1, Math.min(tierCount(skill), Math.round(tier)));
  return GENERATORS[skill](t, r);
}

/** Skills that still use the stand-in generator. */
export const unbuiltSkills = (): SkillId[] => SKILL_IDS.filter((id) => !BUILT[id]);
