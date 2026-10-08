import { describe, expect, it } from 'vitest';
import { generate } from '../../src/core/generators';
import { speechText } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { SKILL_IDS, tierCount } from '../../src/core/skills';

/** Everything the game says for many seeded problems of every skill and tier. */
function allSpeech(): { skill: string; tier: number; line: string }[] {
  const out: { skill: string; tier: number; line: string }[] = [];
  for (const skill of SKILL_IDS) {
    for (let tier = 1; tier <= tierCount(skill); tier++) {
      for (let seed = 1; seed <= 150; seed++) {
        const p = generate(skill, tier, makeRand(seed * 104729 + tier));
        for (const s of [p.say, p.explain]) out.push({ skill, tier, line: speechText(s) });
      }
    }
  }
  return out;
}

const lines = allSpeech();
const bad = (re: RegExp) => [...new Set(lines.filter((l) => re.test(l.line)).map((l) => `${l.skill}/${l.tier}: ${l.line}`))].slice(0, 8);

describe('spoken grammar', () => {
  it('never says "1" before a plural noun', () => {
    // "1 more", "1 less", "1 pound" and the like are fine; plural nouns are not.
    expect(bad(/(?<![\d.£])\b1 (?!more\b|less\b|is\b|as\b|has\b|was\b|makes\b|leaves\b|takes\b|gives\b|equals\b|needs\b|goes\b|lands\b|comes\b|times\b|rolls\b|pass|class|glass|dress|cross|plus|minus|across|ones?\b)[A-Za-z’-]*[a-z]s\b/)).toEqual([]);
  });

  it('keeps verbs agreeing with a count of 1', () => {
    // A lone 1 as a subject takes a singular verb ("1 rolls away", "Then 1 more comes").
    expect(bad(/(?<![\d.£])\b1 (more )?(come|roll|are|were|fall|jump|hop)\b/)).toEqual([]);
    expect(bad(/\bThere are 1\b/)).toEqual([]);
    expect(bad(/(?<![\d.£])\b1 (group|pair|bundle|dot) of \d+ make\b/)).toEqual([]);
  });

  it('starts every sentence with a capital letter', () => {
    expect(bad(/(^|[.!?…] )["“‘’']?[a-z]/)).toEqual([]);
  });
});
