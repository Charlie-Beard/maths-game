/**
 * Rules for land 12's generators (core/generators/l12.ts): `count-3s`
 * (oom-pah-pah) and `time-5`. The generic checks are in generators.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { generate } from '../../src/core/generators';
import { L12 } from '../../src/core/generators/l12';
import { timeWords } from '../../src/core/generators/more';
import { speechText, type Problem } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';

const SEEDS = 2000;

function all(skill: SkillId, tier: number): Problem[] {
  return Array.from({ length: SEEDS }, (_, i) => generate(skill, tier, makeRand(i * 104729 + tier * 13 + 1)));
}

const fixedWords = (text: string): string => text.replace(/\{\w+\}/g, '');

/** Reads "20 past 3", "25 to 4", "half past 3" … into the clock's own hour and minute. */
function parse(a: string): { hour: number; minute: number } {
  const s = a.replace(/’/g, "'");
  let m: RegExpExecArray | null;
  if ((m = /^(\d+) o'clock$/.exec(s))) return { hour: Number(m[1]), minute: 0 };
  if ((m = /^half past (\d+)$/.exec(s))) return { hour: Number(m[1]), minute: 30 };
  if ((m = /^quarter past (\d+)$/.exec(s))) return { hour: Number(m[1]), minute: 15 };
  if ((m = /^quarter to (\d+)$/.exec(s))) return { hour: ((Number(m[1]) + 10) % 12) + 1, minute: 45 };
  if ((m = /^(\d+) past (\d+)$/.exec(s))) return { hour: Number(m[2]), minute: Number(m[1]) };
  if ((m = /^(\d+) to (\d+)$/.exec(s))) return { hour: ((Number(m[2]) + 10) % 12) + 1, minute: 60 - Number(m[1]) };
  throw new Error('Unknown time ' + a);
}

describe('land 12 generators', () => {
  it('cover both skills, every tier, with real problems', () => {
    expect(Object.keys(L12).sort()).toEqual(['count-3s', 'time-5']);
    for (const skill of ['count-3s', 'time-5'] as const) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of all(skill, tier)) {
          expect(p.placeholder).toBeUndefined();
          expect(p.skill).toBe(skill);
          expect(p.tier).toBe(tier);
          expect(p.key.startsWith(`${skill}:`)).toBe(true);
          // Numbers go in {slots}; every slot has a value.
          expect(fixedWords(p.say.text), p.key).not.toMatch(/\d/);
          expect(fixedWords(p.explain.text), p.key).not.toMatch(/\d/);
          expect(speechText(p.say), p.key).not.toMatch(/\{\w+\}/);
          expect(speechText(p.explain), p.key).not.toMatch(/\{\w+\}/);
          // Choices: 3–4 different, including the answer (set-the-hands has none).
          if (p.choices) {
            expect(p.choices.length, p.key).toBeGreaterThanOrEqual(3);
            expect(p.choices.length, p.key).toBeLessThanOrEqual(4);
            expect(p.choices).toContain(p.answer);
            expect(new Set(p.choices.map(String)).size).toBe(p.choices.length);
          }
        }
      }
    }
  }, 60_000);

  describe('count-3s', () => {
    it('always answers a multiple of 3, from 3 to 30', () => {
      for (let tier = 1; tier <= 4; tier++) {
        for (const p of all('count-3s', tier)) {
          const a = p.answer as number;
          expect(a % 3, p.key).toBe(0);
          expect(a, p.key).toBeGreaterThanOrEqual(0);
          expect(a, p.key).toBeLessThanOrEqual(30);
        }
      }
    });

    it('tier 1 shows groups of 3 and answers their total', () => {
      for (const p of all('count-3s', 1)) {
        expect(p.activity).toBe('groups');
        expect(p.visual.type).toBe('groups');
        if (p.visual.type === 'groups') {
          expect(p.visual.each).toBe(3);
          expect(p.answer).toBe(p.visual.groups * 3);
        }
      }
    });

    it('tier 2 hops along a number line in threes, landing on the answer', () => {
      for (const p of all('count-3s', 2)) {
        expect(p.activity).toBe('numberLine');
        expect(p.visual.type).toBe('numberLine');
        if (p.visual.type === 'numberLine') {
          const v = p.visual;
          expect(Math.abs(v.step ?? 0)).toBe(3);
          expect(v.start % 3).toBe(0);
          expect(v.start).toBeGreaterThanOrEqual(v.from);
          const k = p.say.vals?.k as number;
          expect(p.answer, p.key).toBe(v.start + (v.step ?? 0) * k);
          expect(p.answer as number).toBeGreaterThanOrEqual(v.from);
          expect(p.answer as number).toBeLessThanOrEqual(v.to);
          // Every card sits on a rung, so it can be tapped on the line.
          for (const c of p.choices ?? []) expect((c as number) % 3, p.key).toBe(0);
        }
      }
    });

    it('tiers 3 and 4 are n threes, and tier 4 is typed', () => {
      for (const p of all('count-3s', 3)) {
        expect(p.activity).toBe('choose');
        expect(p.answer).toBe((p.say.vals?.n as number) * 3);
      }
      for (const p of all('count-3s', 4)) {
        expect(p.activity).toBe('numberPad');
        if (p.say.vals?.n !== undefined) expect(p.answer).toBe((p.say.vals.n as number) * 3);
      }
    });

    it('reads the working back', () => {
      for (const p of all('count-3s', 3).slice(0, 200)) {
        const n = p.say.vals?.n as number;
        const said = speechText(p.explain);
        expect(said.startsWith(Array.from({ length: n }, (_, i) => 3 * (i + 1)).join(', ')), said).toBe(true);
        expect(said.endsWith(`${p.answer}!`)).toBe(true);
      }
    });
  });

  describe('time-5', () => {
    it('only uses 5-minute times, and the answer matches the clock', () => {
      for (let tier = 1; tier <= 5; tier++) {
        for (const p of all('time-5', tier)) {
          expect(p.activity).toBe('clock');
          expect(p.visual.type).toBe('clock');
          if (p.visual.type !== 'clock') continue;
          expect(p.visual.minute % 5, p.key).toBe(0);
          expect(p.visual.hour).toBeGreaterThanOrEqual(1);
          expect(p.visual.hour).toBeLessThanOrEqual(12);
          if (tier !== 4 && tier !== 5) expect(p.answer, p.key).toBe(timeWords(p.visual.hour, p.visual.minute));
          const t = parse(p.answer as string);
          expect(t.minute % 5, p.key).toBe(0);
          for (const c of p.choices ?? []) expect(parse(c as string).minute % 5, p.key).toBe(0);
        }
      }
    });

    it('tier 1 is only "past", with 5, 10, 20 and 25', () => {
      const minutes = new Set<number>();
      for (const p of all('time-5', 1)) {
        expect(p.answer as string, p.key).toMatch(/^(5|10|20|25) past \d+$/);
        if (p.visual.type === 'clock') minutes.add(p.visual.minute);
      }
      expect([...minutes].sort((a, b) => a - b)).toEqual([5, 10, 20, 25]);
    });

    it('tier 2 is mostly "to", with 5, 10, 20 and 25', () => {
      let to = 0;
      for (const p of all('time-5', 2)) {
        expect(p.answer as string, p.key).toMatch(/^(5|10|20|25) (past|to) \d+$/);
        if ((p.answer as string).includes(' to ')) to++;
      }
      expect(to).toBeGreaterThan(SEEDS * 0.6);
    });

    it('tier 3 covers every 5-minute time, including quarters and halves', () => {
      const seen = new Set<number>();
      for (const p of all('time-5', 3)) if (p.visual.type === 'clock') seen.add(p.visual.minute);
      expect([...seen].sort((a, b) => a - b)).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    });

    it('tier 4 sets the hands: no choices, never a step of 15, the target is shown', () => {
      for (const p of all('time-5', 4)) {
        expect(p.choices).toBeUndefined();
        const t = parse(p.answer as string);
        expect(t.minute % 15, p.key).not.toBe(0);
        expect(p.text).toBe(p.answer);
        expect(p.visual).toEqual({ type: 'clock', hour: 12, minute: 0 });
      }
    });

    it('tier 5 goes later or earlier by 5 to 30 minutes', () => {
      for (const p of all('time-5', 5)) {
        if (p.visual.type !== 'clock') throw new Error('clock expected');
        const d = p.say.vals?.d as number;
        expect(d % 5).toBe(0);
        expect(d).toBeGreaterThanOrEqual(5);
        expect(d).toBeLessThanOrEqual(30);
        const later = speechText(p.say).includes('will it be');
        const now = (p.visual.hour % 12) * 60 + p.visual.minute;
        const t = parse(p.answer as string);
        const got = (t.hour % 12) * 60 + t.minute;
        expect((((got - now - (later ? d : -d)) % 720) + 720) % 720, p.key).toBe(0);
      }
    });

    it('gives plausible wrong cards: past/to swapped and the hour out by one', () => {
      let flipped = 0;
      let hourOff = 0;
      let n = 0;
      for (const p of all('time-5', 1)) {
        if (p.visual.type !== 'clock') continue;
        n++;
        const { hour, minute } = p.visual;
        const cards = p.choices as string[];
        if (cards.includes(timeWords(hour - 1, 60 - minute))) flipped++;
        if (cards.includes(timeWords(hour + 1, minute)) || cards.includes(timeWords(hour - 1, minute))) hourOff++;
      }
      expect(flipped).toBe(n);
      expect(hourOff).toBeGreaterThan(n * 0.7);
    });
  });
});
