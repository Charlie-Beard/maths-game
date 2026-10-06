import { describe, expect, it } from 'vitest';
import { characterArt, characters, dameSnapPose, type SnapPose } from '../../src/art/characters';
import { CHARACTER_NAMES } from '../../src/core/names';

const POSES: SnapPose[] = ['loom', 'point', 'shriek', 'stomp', 'defeated'];

describe('character portraits', () => {
  it('cover exactly the named characters', () => {
    expect(Object.keys(characters).sort()).toEqual(Object.keys(CHARACTER_NAMES).sort());
  });

  for (const id of Object.keys(CHARACTER_NAMES)) {
    it(`${id}: a 300 × 340 portrait with eyes and a mouth to animate`, () => {
      const art = characters[id]();
      expect(art.startsWith('<svg')).toBe(true);
      expect(art).toContain('viewBox="0 0 300 340"');
      expect(art).toContain('data-part="eyes"');
      expect(art).toContain('data-part="mouth"');
      // Built from a seed, so the same every time (no flicker between renders).
      expect(characters[id]()).toBe(art);
    });
  }

  it('fall back to Moon-Face for an unknown id', () => {
    expect(characterArt('nobody')).toBe(characters.moonface());
  });

  for (const pose of POSES) {
    it(`Dame Snap can ${pose}`, () => {
      const art = dameSnapPose(pose);
      expect(art).toContain('viewBox="0 0 300 340"');
      expect(art).toContain('data-part="ruler"');
      expect(art).toContain('data-part="head"');
    });
  }
});
