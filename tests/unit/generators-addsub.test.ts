/**
 * The adding and taking-away generators (workstream W1b): the maths rules
 * that must never bend, on top of the generic checks in generators.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { ADDSUB } from '../../src/core/generators/addsub';
import { generate, unbuiltSkills } from '../../src/core/generators';
import { speechText, type Problem } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';

const W1B: SkillId[] = [
  'part-whole-10',
  'missing-10',
  'fact-family-10',
  'fluency-10',
  'doubles-5',
  'add-20',
  'sub-20',
  'bonds-20',
  'doubles-20',
  'bridge-add',
  'bridge-sub',
  'missing-20',
  'word-problems',
  'add-2d1d',
  'sub-2d1d',
  'add-tens',
  'add-2d2d',
  'sub-2d2d',
  'missing-100',
];

const SEEDS = 300;

/** Every problem a skill makes at a tier over many seeds. */
function many(skill: SkillId, tier: number, n = SEEDS): Problem[] {
  return Array.from({ length: n }, (_, i) => generate(skill, tier, makeRand(i * 104729 + tier * 31 + 7)));
}

/** Every problem a skill makes at every tier. */
const all = (skill: SkillId): Problem[] => Array.from({ length: tierCount(skill) }, (_, i) => many(skill, i + 1)).flat();

/**
 * Parses a written sum: `a op b = ?`, `a op ? = c` or `? op b = c`, with
 * spaces and a real minus sign. Returns the three numbers with the missing
 * one filled in by the answer, or null if it isn't that shape.
 */
function parse(p: Problem): { a: number; op: '+' | '−'; b: number; c: number } | null {
  const m = p.text?.match(/^(\d+|\?) ([+−]) (\d+|\?) = (\d+|\?)$/);
  if (!m) return null;
  const fill = (s: string) => (s === '?' ? (p.answer as number) : Number(s));
  return { a: fill(m[1]), op: m[2] as '+' | '−', b: fill(m[3]), c: fill(m[4]) };
}

const crosses = (a: number, op: '+' | '−', b: number) => (op === '+' ? (a % 10) + (b % 10) >= 10 : a % 10 < b % 10);

describe('W1b generators: adding and taking away', () => {
  it('are all registered and none is a stand-in', () => {
    expect(Object.keys(ADDSUB).sort()).toEqual([...W1B].sort());
    for (const skill of W1B) {
      expect(unbuiltSkills()).not.toContain(skill);
      for (let t = 1; t <= tierCount(skill); t++) expect(generate(skill, t, makeRand(1)).placeholder).toBeUndefined();
    }
  });

  it('write every sum in the exact shape, and it works out to the answer', () => {
    for (const skill of W1B) {
      for (const p of all(skill)) {
        if (!p.text) continue;
        if (p.text.startsWith('half of ')) {
          expect(Number(p.text.match(/^half of (\d+) = \?$/)?.[1]) / 2).toBe(p.answer);
          continue;
        }
        const s = parse(p);
        expect(s, `${skill}: ${p.text}`).not.toBeNull();
        if (!s) continue;
        expect(s.op === '+' ? s.a + s.b : s.a - s.b, `${skill}: ${p.text}`).toBe(s.c);
        expect(p.text).not.toContain('-'); // the real minus sign, −
      }
    }
  });

  it('never give a negative number, in answers, choices or sums', () => {
    for (const skill of W1B) {
      for (const p of all(skill)) {
        for (const c of p.choices ?? []) if (typeof c === 'number') expect(c, skill).toBeGreaterThanOrEqual(0);
        const s = parse(p);
        if (s) for (const n of [s.a, s.b, s.c]) expect(n, `${skill}: ${p.text}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('always offer 3 or 4 choices including the answer', () => {
    for (const skill of W1B) {
      for (const p of all(skill)) {
        expect(p.choices?.length, skill).toBeGreaterThanOrEqual(3);
        expect(p.choices?.length, skill).toBeLessThanOrEqual(4);
        expect(p.choices).toContain(p.answer);
      }
    }
  });

  it('put every number of the spoken question in a slot', () => {
    for (const skill of W1B) {
      for (const p of all(skill)) {
        // Fixed numbers are fine (10 in "makes 10", 20, 100); others must be slots.
        const fixed = p.say.text.replace(/\{\w+\}/g, '').match(/\d+/g) ?? [];
        for (const n of fixed) expect(['10', '20', '100'], `${skill}: ${p.say.text}`).toContain(n);
        const back = p.explain.text.replace(/\{\w+\}/g, '').match(/\d+/g) ?? [];
        for (const n of back) expect(['10', '20', '100'], `${skill}: ${p.explain.text}`).toContain(n);
      }
    }
  });

  it('match the picture to the activity', () => {
    const pairs: Record<string, string[]> = {
      count: ['objects'],
      tenFrame: ['tenFrame'],
      numberLine: ['numberLine'],
      partWhole: ['partWhole'],
      tensOnes: ['tensOnes'],
    };
    for (const skill of W1B) {
      for (const p of all(skill)) {
        if (pairs[p.activity]) expect(pairs[p.activity], `${skill} t${p.tier}`).toContain(p.visual.type);
        if (p.visual.type === 'numberLine') {
          expect(p.visual.start).toBeGreaterThanOrEqual(p.visual.from);
          expect(p.visual.start).toBeLessThanOrEqual(p.visual.to);
          expect(p.answer as number).toBeGreaterThanOrEqual(p.visual.from);
          expect(p.answer as number).toBeLessThanOrEqual(p.visual.to);
          for (const m of p.visual.marks ?? []) expect(m > p.visual.from && m < p.visual.to, `${skill} mark ${m}`).toBe(true);
          expect(p.visual.to - p.visual.from).toBeLessThanOrEqual(20);
        }
        if (p.visual.type === 'tenFrame') for (const f of p.visual.frames) expect(f).toBeLessThanOrEqual(10);
        if (p.visual.type === 'tensOnes' && skill !== 'missing-100') {
          // Bundles show the first number of the sum.
          expect(p.visual.tens * 10 + p.visual.ones).toBe(parse(p)?.a);
        }
      }
    }
  });

  it('only type answers at the top tiers', () => {
    for (const skill of W1B) {
      for (let t = 1; t < tierCount(skill) - 1; t++) for (const p of many(skill, t, 40)) expect(p.activity, `${skill} t${t}`).not.toBe('numberPad');
    }
  });

  it('bridge-add always crosses 10, from two 1-digit numbers', () => {
    for (let t = 1; t <= 4; t++) {
      for (const p of many('bridge-add', t)) {
        const s = parse(p)!;
        expect(s.a).toBeLessThan(10);
        expect(s.b).toBeLessThan(10);
        expect(s.c).toBeGreaterThan(10);
        expect(speechText(p.explain)).toBe(`${s.a} add ${10 - s.a} makes 10, and ${s.b - (10 - s.a)} more makes ${s.c}!`);
      }
    }
  });

  it('bridge-sub always goes back past 10', () => {
    for (let t = 1; t <= 4; t++) {
      for (const p of many('bridge-sub', t)) {
        const s = parse(p)!;
        expect(s.a).toBeGreaterThan(10);
        expect(s.a).toBeLessThanOrEqual(20);
        expect(s.b).toBeLessThan(10);
        expect(s.c).toBeLessThan(10);
        expect(speechText(p.explain)).toContain('makes 10');
      }
    }
  });

  it('add-20 and sub-20 never cross 10', () => {
    for (let t = 1; t <= 4; t++) {
      for (const p of [...many('add-20', t), ...many('sub-20', t)]) {
        const s = parse(p)!;
        expect(crosses(s.a, s.op, s.b), p.text).toBe(false);
        expect(s.a).toBeGreaterThanOrEqual(10);
        expect(s.c).toBeGreaterThanOrEqual(10);
        expect(s.c).toBeLessThanOrEqual(20);
      }
    }
  });

  it('2-digit skills: the no-crossing tiers never cross a ten, the crossing tier always does, typed mixes both', () => {
    for (const skill of ['add-2d1d', 'sub-2d1d', 'add-2d2d', 'sub-2d2d'] as const) {
      for (const t of [1, 2]) for (const p of many(skill, t)) expect(crosses(parse(p)!.a, parse(p)!.op, parse(p)!.b), `${skill} ${p.text}`).toBe(false);
      for (const p of many(skill, 3)) expect(crosses(parse(p)!.a, parse(p)!.op, parse(p)!.b), `${skill} ${p.text}`).toBe(true);
      const typed = many(skill, 4).map((p) => parse(p)!);
      expect(typed.some((s) => crosses(s.a, s.op, s.b))).toBe(true);
      expect(typed.some((s) => !crosses(s.a, s.op, s.b))).toBe(true);
      for (let t = 1; t <= 4; t++) {
        for (const p of many(skill, t)) {
          const s = parse(p)!;
          expect(s.a).toBeGreaterThanOrEqual(10);
          expect(s.c).toBeLessThan(100);
          if (skill.endsWith('2d2d')) expect(s.b).toBeGreaterThanOrEqual(10);
          else expect(s.b).toBeLessThan(10);
        }
      }
    }
  });

  it('add-tens adds or takes away whole tens and stays under 100', () => {
    for (let t = 1; t <= 3; t++) {
      for (const p of many('add-tens', t)) {
        const s = parse(p)!;
        expect(s.b % 10).toBe(0);
        expect(s.op).toBe(t === 3 ? '−' : '+');
        expect(s.c).toBeLessThan(100);
        expect(s.c % 10).toBe(s.a % 10);
      }
    }
  });

  it('missing-100 follows its tiers: tens to 100, up to the next ten, then ? − tens', () => {
    for (const p of many('missing-100', 1)) expect(p.text).toMatch(/^\d0 \+ \? = 100$/);
    for (const p of many('missing-100', 2)) {
      const s = parse(p)!;
      expect(s.c % 10).toBe(0);
      expect(s.c - s.a).toBeLessThan(10);
    }
    for (const p of many('missing-100', 3)) expect(p.text).toMatch(/^\? − \d0 = \d+$/);
  });

  it('keeps within-10 skills within 10 and within-20 skills within 20', () => {
    const top: [SkillId, number][] = [
      ['part-whole-10', 10],
      ['missing-10', 10],
      ['fact-family-10', 10],
      ['fluency-10', 10],
      ['doubles-5', 10],
      ['bonds-20', 20],
      ['doubles-20', 20],
      ['missing-20', 20],
      ['word-problems', 20],
    ];
    for (const [skill, max] of top) {
      for (const p of all(skill)) {
        if (typeof p.answer === 'number') expect(p.answer, skill).toBeLessThanOrEqual(max);
        const s = parse(p);
        if (s) for (const n of [s.a, s.b, s.c]) expect(n, `${skill}: ${p.text}`).toBeLessThanOrEqual(max);
      }
    }
    for (const p of many('word-problems', 1)) expect(p.answer as number).toBeLessThanOrEqual(10);
  });

  it('missing-20 usually crosses 10, as in 8 + ? = 15', () => {
    const ps = many('missing-20', 1).map((p) => parse(p)!);
    expect(ps.filter((s) => s.a < 10 && s.c > 10).length).toBeGreaterThan(ps.length / 2);
  });

  it('bonds-20 always make 20', () => {
    for (let t = 1; t <= 3; t++) for (const p of many('bonds-20', t)) expect(speechText(p.explain)).toMatch(new RegExp(`and ${p.answer} make 20!$`));
  });

  it('doubles are doubles, and halves halve even numbers', () => {
    for (const skill of ['doubles-5', 'doubles-20'] as const) {
      for (let t = 1; t <= 3; t++) {
        for (const p of many(skill, t)) {
          if (skill === 'doubles-20' && t === 3) {
            expect(p.text).toBe(`half of ${(p.answer as number) * 2} = ?`);
          } else {
            expect((p.answer as number) % 2).toBe(0);
            expect(p.answer as number).toBeLessThanOrEqual(skill === 'doubles-5' ? 10 : 20);
          }
        }
      }
    }
  });

  it('fact-family-10 tier 2 finishes a family fact, with the other family numbers as the choices', () => {
    for (const p of many('fact-family-10', 2)) {
      const { a, b, w } = p.say.vals as Record<string, number>;
      const s = parse(p)!;
      expect([s.a, s.b, s.c].sort()).toEqual([a, b, w].sort());
      expect(p.choices).toEqual(expect.arrayContaining([a, b, w]));
      expect(p.choices!.length).toBe(4);
    }
  });

  it('word problems are short stories, spoken sensibly, with no sum on screen', () => {
    for (let t = 1; t <= 4; t++) {
      for (const p of many('word-problems', t)) {
        const said = speechText(p.say);
        expect(p.text).toBeUndefined();
        expect(said).toMatch(/^[A-Z]/);
        expect(said).toMatch(/\?$/);
        expect(said).not.toMatch(/\{|undefined|  /);
        expect(said.split(/\s+/).length, said).toBeLessThanOrEqual(t === 4 ? 30 : 24);
        expect(said).not.toMatch(/\b1 (pop biscuits|acorns|apples|teacups|stars|buttons)\b/);
        // Someone from the Faraway Tree is in every story.
        expect(said).toMatch(/Moon-Face|Silky|Saucepan Man|Dame Washalot|Mr Watzisname|Angry Pixie/);
        if (t === 4) expect(speechText(p.explain).split('. ').length).toBe(2);
      }
    }
    // Tier 3 mixes adding and taking away.
    const kinds = new Set(many('word-problems', 3).map((p) => (speechText(p.explain).includes('add') ? '+' : '−')));
    expect(kinds.size).toBe(2);
  });

  it('give each problem a key for its maths, with plenty of variety', () => {
    for (const skill of W1B) {
      for (let t = 1; t <= tierCount(skill); t++) {
        const keys = new Set(many(skill, t, 80).map((p) => p.key));
        expect(keys.size, `${skill} t${t}`).toBeGreaterThanOrEqual(5);
        for (const k of keys) expect(k.startsWith(`${skill}:`)).toBe(true);
      }
    }
  });
});
