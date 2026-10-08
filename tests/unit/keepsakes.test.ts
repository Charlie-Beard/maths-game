import { describe, expect, it } from 'vitest';
import { KEEPSAKE_IDS, KEEPSAKE_NAMES, keepsakeArt, landSeal } from '../../src/art/keepsakes';
import { PROP_ART, prop } from '../../src/art/props';
import { ALL_CHAPTERS, LANDS } from '../../src/core/curriculum';
import { PROP_IDS } from '../../src/core/problem';

describe('props', () => {
  it('draws every prop in a 120 box, without boil', () => {
    for (const id of PROP_IDS) {
      expect(PROP_ART[id], id).toBeTypeOf('function');
      const s = prop(id);
      expect(s).toContain('viewBox="0 0 120 120"');
      expect(s).not.toContain('class="f f1"');
      expect(s.match(/<path /g)?.length ?? 0, id).toBeGreaterThan(2);
    }
  });

  it('gives each prop a drawing of its own', () => {
    const seen = new Set(PROP_IDS.map((id) => prop(id).replace(/prop-\w+/, '')));
    expect(seen.size).toBe(PROP_IDS.length);
  });
});

describe('keepsakes', () => {
  it('has art and a name for every chapter keepsake', () => {
    const ids = ALL_CHAPTERS.map((c) => c.keepsake);
    expect(new Set(ids).size).toBe(112);
    for (const id of ids) {
      expect(KEEPSAKE_IDS, id).toContain(id);
      expect(KEEPSAKE_NAMES[id], id).toBeTruthy();
      const s = keepsakeArt(id);
      expect(s).toContain('viewBox="0 0 200 200"');
      expect(s).toContain(`aria-label="${KEEPSAKE_NAMES[id]}"`);
    }
  });

  it('has no art or names left over from old keepsake ids', () => {
    const ids = new Set(ALL_CHAPTERS.map((c) => c.keepsake));
    expect(KEEPSAKE_IDS.filter((id) => !ids.has(id))).toEqual([]);
    expect(Object.keys(KEEPSAKE_NAMES).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('draws each keepsake differently', () => {
    const seen = new Set(KEEPSAKE_IDS.map((id) => keepsakeArt(id).replace(/ks-\w+|aria-label="[^"]*"/g, '')));
    expect(seen.size).toBe(KEEPSAKE_IDS.length);
  });

  it('falls back to a picture for an unknown id', () => {
    expect(keepsakeArt('nope')).toContain('<svg');
  });
});

describe('land seals', () => {
  it('draws a 240 seal for each of the 14 lands, in its colour', () => {
    expect(LANDS).toHaveLength(14);
    const seals = new Set<string>();
    for (const l of LANDS) {
      const s = landSeal(l.n);
      expect(s).toContain('viewBox="0 0 240 240"');
      expect(s).toContain(`fill="${l.color}"`);
      seals.add(s);
    }
    expect(seals.size).toBe(14);
  });
});
