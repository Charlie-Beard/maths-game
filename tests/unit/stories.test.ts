import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { CHARACTER_NAMES } from '../../src/core/names';
import { generic } from '../../src/core/phrases';
import { STORIES } from '../../src/stories';

/** Who may speak: the narrator, the chosen child, and every named character. */
const speakers = new Set(['narrator', 'hero', ...Object.keys(CHARACTER_NAMES)]);
const ids = new Set([...ALL_CHAPTERS.map((c) => c.id), 'opening', 'ending']);

describe('stories', () => {
  it('only exist for real chapters (and the two films)', () => {
    for (const id of Object.keys(STORIES)) expect(ids, id).toContain(id);
  });

  // Workstreams W5/W6 write these; remove from the todo list as they land.
  for (const id of ids) if (!(id in STORIES)) it.todo(`story ${id}`);

  for (const [id, load] of Object.entries(STORIES)) {
    it(`${id}: every line can be recorded`, async () => {
      const { lines } = (await load()).default;
      const all = Object.values(lines);
      expect(all.length).toBeGreaterThan(0);
      for (const l of all) {
        expect(speakers, `${id}: "${l.text}"`).toContain(l.who);
        expect(l.text.trim().length).toBeGreaterThan(0);
        expect(l.text.split(/\s+/).length, `${id}: "${l.text}" is too long`).toBeLessThanOrEqual(20);
        expect(generic(l.text)).not.toContain('{');
      }
      // Lines with the child's name are recorded twice (with and without): keep them few.
      expect(all.filter((l) => l.text.includes('{name}')).length).toBeLessThanOrEqual(2);
    });
  }
});
