import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS, LANDS } from '../../src/core/curriculum';
import { CHARACTER_NAMES } from '../../src/core/names';
import { SKILL_IDS, SKILLS, tierCount, type SkillId } from '../../src/core/skills';

describe('curriculum', () => {
  it('has 10 lands of 8 chapters, the 8th a finale', () => {
    expect(LANDS).toHaveLength(10);
    for (const l of LANDS) {
      expect(l.chapters).toHaveLength(8);
      l.chapters.forEach((c, i) => {
        expect(c.kind).toBe(i === 7 ? 'finale' : 'chapter');
        expect(c.id).toBe(`l${l.n}c${i + 1}`);
      });
    }
    expect(ALL_CHAPTERS).toHaveLength(80);
  });

  it('only uses known skills, hosts and sensible tiers', () => {
    for (const c of ALL_CHAPTERS) {
      expect(c.skills.length).toBeGreaterThan(0);
      for (const s of c.skills) expect(SKILLS[s], `${c.id}: ${s}`).toBeDefined();
      expect(CHARACTER_NAMES[c.host], `${c.id} host ${c.host}`).toBeDefined();
      const [lo, hi] = c.tiers;
      expect(lo).toBeGreaterThanOrEqual(1);
      expect(hi).toBeGreaterThanOrEqual(lo);
      // At least one focus skill can reach the floor tier.
      expect(Math.max(...c.skills.map(tierCount))).toBeGreaterThanOrEqual(lo);
    }
  });

  it('uses every skill somewhere', () => {
    const used = new Set(ALL_CHAPTERS.flatMap((c) => c.skills));
    expect(SKILL_IDS.filter((s) => !used.has(s))).toEqual([]);
  });

  it('introduces each skill after the skills it needs', () => {
    const first = new Map<SkillId, number>();
    ALL_CHAPTERS.forEach((c, i) => c.skills.forEach((s) => first.has(s) || first.set(s, i)));
    for (const s of SKILL_IDS) {
      for (const need of SKILLS[s].needs) {
        expect(first.get(need)!, `${s} needs ${need}`).toBeLessThanOrEqual(first.get(s)!);
      }
    }
  });

  it('has unique keepsakes', () => {
    const ks = ALL_CHAPTERS.map((c) => c.keepsake);
    expect(new Set(ks).size).toBe(ks.length);
  });

  it('lists skills in the catalogue in teaching order', () => {
    const order = new Map(SKILL_IDS.map((s, i) => [s, i]));
    for (const s of SKILL_IDS) for (const need of SKILLS[s].needs) expect(order.get(need)!).toBeLessThan(order.get(s)!);
  });
});
