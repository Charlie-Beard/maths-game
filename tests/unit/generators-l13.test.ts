/**
 * Rules for land 13's generators (core/generators/l13.ts): `turns` and
 * `shapes-3d`. The generic checks are in generators.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { generate } from '../../src/core/generators';
import { angleOf, dirAt, turnedTo, SOLID_FACTS, type Dir } from '../../src/core/generators/l13';
import { speechText, type Problem, type Visual } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';

const RUNS = 2000;
const all = (skill: SkillId, tier: number): Problem[] => Array.from({ length: RUNS }, (_, i) => generate(skill, tier, makeRand(i * 7727 + tier * 31 + 5)));
const vis = <T extends Visual['type']>(p: Problem, type: T): Extract<Visual, { type: T }> => {
  expect(p.visual.type, p.key).toBe(type);
  return p.visual as Extract<Visual, { type: T }>;
};

const DIRS: Dir[] = ['up', 'right', 'down', 'left'];
const dirOf = (deg: number): Dir => DIRS[(((deg / 90) % 4) + 4) % 4];

describe('land 13 generators', () => {
  it('are real, not placeholders, with valid choices', () => {
    for (const skill of ['turns', 'shapes-3d'] as SkillId[]) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of all(skill, tier)) {
          expect(p.placeholder).toBeUndefined();
          expect(p.key.startsWith(`${skill}:`)).toBe(true);
          expect(p.choices).toContain(p.answer);
          expect(new Set(p.choices!.map(String)).size).toBe(p.choices!.length);
          expect(p.choices!.length).toBeGreaterThanOrEqual(2);
          expect(p.choices!.length).toBeLessThanOrEqual(4);
          expect(speechText(p.say)).not.toMatch(/[{}]/);
          expect(speechText(p.explain)).not.toMatch(/[{}]/);
          // Numbers in questions go in {slots}, never in the words.
          expect(p.say.text.replace(/\{\w+\}/g, '')).not.toMatch(/\d/);
        }
      }
    }
  });

  it('knows its direction helpers', () => {
    expect(turnedTo('up', 90, 'cw')).toBe('right');
    expect(turnedTo('up', 90, 'acw')).toBe('left');
    expect(turnedTo('left', 180, 'cw')).toBe('right');
    expect(turnedTo('up', 270, 'cw')).toBe('left');
    expect(dirAt(angleOf('down') + 450)).toBe('left');
  });

  it('turns tier 1: quarter and half turns clockwise end the right way', () => {
    for (const p of all('turns', 1)) {
      const v = vis(p, 'turn');
      expect(v.dir).toBe('cw');
      expect([90, 180]).toContain(v.turn);
      expect(p.answer).toBe(dirOf(v.facing + v.turn!));
      expect(p.choices).toHaveLength(3);
    }
    // A quarter turn clockwise from up is right.
    const ups = all('turns', 1).filter((p) => (p.visual as { facing: number }).facing === 0 && (p.visual as { turn: number }).turn === 90);
    expect(ups.length).toBeGreaterThan(10);
    for (const p of ups) expect(p.answer).toBe('right');
  });

  it('turns tier 2: either which way did it turn, or turn a quarter either way', () => {
    const kinds = new Set<string>();
    for (const p of all('turns', 2)) {
      const v = vis(p, 'turn');
      expect(v.turn).toBe(90);
      if (v.show === 'before-after') {
        kinds.add('which');
        expect(p.answer).toBe(v.dir === 'cw' ? 'clockwise' : 'anticlockwise');
        expect([...p.choices!].sort()).toEqual(['anticlockwise', 'clockwise']);
        // The faded arrow plus the turn lands on the bold one.
        expect(['up', 'right', 'down', 'left']).toContain(dirOf(v.facing + (v.dir === 'cw' ? 90 : -90)));
      } else {
        kinds.add('where');
        expect(p.answer).toBe(dirOf(v.facing + (v.dir === 'cw' ? 90 : -90)));
        expect(p.choices).toHaveLength(4);
      }
    }
    expect(kinds.size).toBe(2);
  });

  it('turns tier 3: three-quarter turns are the other way round the circle', () => {
    let three = 0;
    for (const p of all('turns', 3)) {
      const v = vis(p, 'turn');
      const sign = v.dir === 'cw' ? 1 : -1;
      expect(p.answer).toBe(dirOf(v.facing + sign * v.turn!));
      if (v.turn === 270) {
        three++;
        expect(p.answer).toBe(dirOf(v.facing - sign * 90));
      }
    }
    expect(three).toBeGreaterThan(RUNS / 3);
  });

  it('turns tier 4: following the moves lands on the answer flag, inside the grid', () => {
    for (const p of all('turns', 4)) {
      const v = vis(p, 'turn');
      const g = v.grid!;
      let col = g.col;
      let row = g.row;
      let f = v.facing;
      for (const m of v.moves!) {
        if (m === 'left') f -= 90;
        if (m === 'right') f += 90;
        const d = dirOf(((f % 360) + 360) % 360);
        col += d === 'right' ? 1 : d === 'left' ? -1 : 0;
        row += d === 'down' ? 1 : d === 'up' ? -1 : 0;
        expect(col).toBeGreaterThanOrEqual(0);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(g.cols);
        expect(row).toBeLessThan(g.rows);
      }
      expect(v.moves!.length).toBeGreaterThanOrEqual(2);
      expect(v.moves!.some((m) => m !== 'forward')).toBe(true);
      const hit = g.flags.filter((fl) => fl.col === col && fl.row === row);
      expect(hit).toHaveLength(1);
      expect(hit[0].id).toBe(p.answer);
      expect(g.flags.map((fl) => fl.id).sort()).toEqual([...p.choices!].map(String).sort());
      // Flags on different squares, none on the start.
      expect(new Set(g.flags.map((fl) => `${fl.col},${fl.row}`)).size).toBe(g.flags.length);
      expect(g.flags.some((fl) => fl.col === g.col && fl.row === g.row)).toBe(false);
    }
  });

  it('shapes-3d tiers 1 and 2: tap the named solid', () => {
    const basic = ['cube', 'sphere', 'cylinder', 'cone'];
    const seen = new Set<string>();
    for (const p of all('shapes-3d', 1)) {
      expect(basic).toContain(p.answer);
      for (const c of p.choices!) expect(basic).toContain(c);
      expect(p.say.text).toBe(`Tap the ${p.answer}.`);
      expect(p.choices).toHaveLength(3);
      expect(p.visual.type).toBe('none');
    }
    for (const p of all('shapes-3d', 2)) {
      seen.add(String(p.answer));
      expect(p.choices).toHaveLength(4);
      expect(p.say.text).toBe(`Tap the ${p.answer}.`);
    }
    expect(seen.has('cuboid')).toBe(true);
    expect(seen.has('pyramid')).toBe(true);
  });

  it('knows the facts: a cube has 6 faces, 12 edges and 8 vertices', () => {
    expect(SOLID_FACTS.cube).toEqual({ faces: 6, edges: 12, corners: 8 });
    expect(SOLID_FACTS.cuboid).toEqual({ faces: 6, edges: 12, corners: 8 });
    expect(SOLID_FACTS.pyramid).toEqual({ faces: 5, edges: 8, corners: 5 });
    expect(SOLID_FACTS.cylinder.faces).toBe(2);
    expect(SOLID_FACTS.cone.faces).toBe(1);
  });

  it('shapes-3d tier 3: flat faces', () => {
    const expected: Record<string, number> = { cube: 6, cuboid: 6, pyramid: 5, cylinder: 2, cone: 1 };
    for (const p of all('shapes-3d', 3)) {
      const s = vis(p, 'solid').solids[0];
      expect(p.answer).toBe(expected[s]);
      expect(p.say.text).toContain(s);
      expect(p.explain.vals).toEqual({ n: p.answer });
    }
  });

  it('shapes-3d tier 4: edges and corners', () => {
    const edges: Record<string, number> = { cube: 12, cuboid: 12, pyramid: 8 };
    const corners: Record<string, number> = { cube: 8, cuboid: 8, pyramid: 5 };
    const asked = new Set<string>();
    for (const p of all('shapes-3d', 4)) {
      const v = vis(p, 'solid');
      const s = v.solids[0];
      asked.add(v.ask!);
      expect(p.answer).toBe(v.ask === 'edges' ? edges[s] : corners[s]);
    }
    expect([...asked].sort()).toEqual(['corners', 'edges']);
  });

  it('shapes-3d tier 5: the gold face is the right flat shape', () => {
    const expected: Record<string, string> = { cube: 'square', cuboid: 'rectangle', pyramid: 'triangle', cylinder: 'circle', cone: 'circle' };
    for (const p of all('shapes-3d', 5)) {
      const v = vis(p, 'solid');
      expect(v.face).toBe(true);
      expect(p.answer).toBe(expected[v.solids[0]]);
      if (v.solids[0] === 'cylinder' || v.solids[0] === 'cone') expect(v.lying).toBe(true);
    }
  });
});
