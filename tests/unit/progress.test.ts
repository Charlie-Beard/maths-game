import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { DAY } from '../../src/core/mastery';
import { currentIndex, defaultProgress, finishChapter, isOpen, recordOutcome, restore } from '../../src/core/progress';

const now = new Date('2026-10-06T10:00:00').getTime();

describe('progress', () => {
  it('restores junk and partial saves with defaults', () => {
    expect(restore(null).settings.newPerDay).toBe(2);
    const p = restore({ name: 'Jasper', avatar: 'ron', skills: { 'add-10': { tier: 3 }, bogus: {} }, settings: { volume: 0.2 } });
    expect(p.avatar).toBeNull();
    expect(p.skills['add-10']!.tier).toBe(3);
    expect(p.skills['add-10']!.seen).toBe(0);
    expect(Object.keys(p.skills)).toEqual(['add-10']);
    expect(p.settings.volume).toBe(0.2);
    expect(p.settings.idleHintSeconds).toBe(12);
  });

  it('opens chapters in order, up to the daily limit of new ones', () => {
    const p = defaultProgress();
    expect(isOpen(p, 0, now)).toBe(true);
    expect(isOpen(p, 1, now)).toBe(false);
    finishChapter(p, ALL_CHAPTERS[0], now);
    finishChapter(p, ALL_CHAPTERS[1], now);
    expect(currentIndex(p)).toBe(2);
    expect(isOpen(p, 2, now)).toBe(false); // two new today already
    expect(isOpen(p, 0, now)).toBe(true); // replays are fine
    expect(isOpen(p, 2, now + DAY)).toBe(true); // tomorrow
    p.settings.newPerDay = 0;
    expect(isOpen(p, 2, now)).toBe(true); // no limit
  });

  it('honours grown-up unlocks', () => {
    const p = defaultProgress();
    p.unlockedTo = 10;
    expect(isOpen(p, 10, now)).toBe(true);
    expect(isOpen(p, 11, now)).toBe(false);
    p.unlockAll = true;
    expect(isOpen(p, 79, now)).toBe(true);
  });

  it('hands out rewards once', () => {
    const p = defaultProgress();
    const finale = ALL_CHAPTERS[7];
    expect(finishChapter(p, finale, now)).toEqual({ keepsake: true, card: true, seal: true });
    expect(finishChapter(p, finale, now)).toEqual({ keepsake: false, card: false, seal: false });
    expect(p.chapters[finale.id].plays).toBe(2);
    expect(p.seals).toEqual([1]);
  });

  it('records outcomes into skills and toffees', () => {
    const p = defaultProgress();
    recordOutcome(p, { skill: 'add-10', tier: 2, wrong: 0, at: now });
    recordOutcome(p, { skill: 'add-10', tier: 2, wrong: 3, at: now });
    expect(p.skills['add-10']!.seen).toBe(2);
    expect(p.toffees).toBe(1);
  });
});
