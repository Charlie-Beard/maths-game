import { describe, expect, it } from 'vitest';
import { LAND_ART } from '../../src/art/lands';
import { TREE_HOOKS, TREE_PLACES, TREE_SPOTS, tree, treeDusk } from '../../src/art/scenery';
import { LANDS } from '../../src/core/curriculum';

describe('land art', () => {
  it('has a far view and a scene for every land', () => {
    expect(Object.keys(LAND_ART).map(Number).sort((a, b) => a - b)).toEqual(LANDS.map((l) => l.n));
  });

  for (const land of LANDS) {
    it(`land ${land.n}: far is 600 × 180 and scene is 1180 × 820`, () => {
      const art = LAND_ART[land.n];
      const far = art.far(`t-far-${land.n}`);
      const scene = art.scene(`t-scene-${land.n}`);
      expect(far).toContain('viewBox="0 0 600 180"');
      expect(scene).toContain('viewBox="0 0 1180 820"');
      // Backdrops never boil: they must not compete with the child's attention.
      expect(scene).not.toContain('class="f f1"');
      expect(far).not.toContain('class="f f1"');
      expect(art.farNodes().length).toBeGreaterThan(5);
    });

    it(`land ${land.n}: is the same every time (seeded by name)`, () => {
      expect(LAND_ART[land.n].scene('same')).toBe(LAND_ART[land.n].scene('same'));
    });
  }
});

describe('the Faraway Tree', () => {
  it('has 8 stops, bottom to top, inside the stage', () => {
    expect(TREE_PLACES).toHaveLength(8);
    expect(new Set(TREE_PLACES.map((p) => p.id)).size).toBe(8);
    expect(TREE_PLACES[0].id).toBe('door');
    expect(TREE_PLACES[7].id).toBe('moonface');
    for (const p of TREE_PLACES) {
      expect(p.x).toBeGreaterThan(60);
      expect(p.x).toBeLessThan(1120);
      expect(p.y).toBeGreaterThan(60);
      expect(p.y).toBeLessThan(760);
    }
    // Climbing: the first stop is the lowest, the last the highest.
    expect(TREE_PLACES[0].y).toBe(Math.max(...TREE_PLACES.map((p) => p.y)));
    expect(TREE_PLACES[7].y).toBeLessThan(TREE_PLACES[0].y);
  });

  it('spaces the stops so 96 px seals never overlap', () => {
    for (let i = 0; i < TREE_PLACES.length; i++) {
      for (let j = i + 1; j < TREE_PLACES.length; j++) {
        const a = TREE_PLACES[i];
        const b = TREE_PLACES[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${a.id} / ${b.id}`).toBeGreaterThanOrEqual(110);
      }
    }
  });

  it('has a hook for every land seal, inside the stage', () => {
    expect(TREE_HOOKS).toHaveLength(LANDS.length);
    for (const h of TREE_HOOKS) {
      expect(h.x).toBeGreaterThan(20);
      expect(h.x).toBeLessThan(1160);
      expect(h.y).toBeGreaterThan(20);
      expect(h.y).toBeLessThan(800);
    }
    expect(TREE_SPOTS.cloud.w).toBe(600);
  });

  it('puts the visiting land in the cloud', () => {
    const bare = tree('t-tree');
    const withLand = tree('t-tree', { landN: 4 });
    expect(withLand).toContain('viewBox="0 0 1180 820"');
    expect(withLand.length).toBeGreaterThan(bare.length);
  });

  it('keeps treeDusk working with a land colour (the title and the old map)', () => {
    const land = LANDS[2];
    expect(treeDusk('t-dusk', { landColor: land.color })).toBe(tree('t-dusk', { landN: land.n }));
    expect(treeDusk('t-dusk', { landColor: '#123456' })).toContain('#123456');
  });
});
