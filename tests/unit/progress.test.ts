import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { DAY } from '../../src/core/mastery';
import { currentIndex, defaultProgress, finishChapter, isOpen, recordOutcome, restore } from '../../src/core/progress';
import { makeRand } from '../../src/core/random';
import { buildPractice, buildRound } from '../../src/core/round';
import { tierCount, type SkillId } from '../../src/core/skills';

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

describe('older saves', () => {
  it('drop the calm-mode setting the game no longer has', () => {
    const old = { ...defaultProgress(), settings: { volume: 0.5, calm: true, idleHintSeconds: 12, newPerDay: 2 } };
    const p = restore(JSON.parse(JSON.stringify(old)));
    expect(p.settings).not.toHaveProperty('calm');
    expect(p.settings.volume).toBe(0.5);
  });
});

describe('saves that went wrong', () => {
  // Every shape of damage a save could come back with: half-written, from
  // an older game, edited by hand, or from a newer one.
  const junk: unknown[] = [
    null,
    'not a save',
    42,
    [],
    { v: 1 },
    { v: 2, future: { stuff: true }, chapters: { l1c1: { plays: 1, done: true } } },
    { chapters: 'oops', skills: [], keepsakes: 'acorn', cards: null, seals: {}, settings: 'loud' },
    { chapters: { l1c1: null, l1c2: { done: true }, l1c3: { plays: 'two', done: 'yes', firstDone: 'monday' }, nope: { plays: 3, done: true } } },
    {
      skills: {
        'add-10': { tier: 99, score: 'high', seen: -4, recent: null, mastered: 'no', box: 7, last: null, due: 'soon' },
        'count-10': { tier: 0 },
        'one-more': { tier: 2.5, recent: [1, 'x', 9] },
        bogus: { tier: 1 },
      },
    },
    { toffees: -3, unlockedTo: 2.5, unlockAll: 'yes', lastPlayed: 'never', seenOpening: 1, name: 7, avatar: 'ron' },
    { settings: { volume: 'loud', idleHintSeconds: -1, newPerDay: null } },
    { settings: { volume: 9, idleHintSeconds: 1e9, newPerDay: -2 } },
    { keepsakes: ['acorn', 5, null, 'acorn'], cards: [{}], seals: ['1', 2, 2, 99] },
  ];

  it('load without throwing, as something every scene can use', () => {
    for (const raw of junk) {
      const p = restore(raw);
      expect(p.v).toBe(1);
      expect(p).not.toHaveProperty('future');
      expect(typeof p.name).toBe('string');
      expect(p.settings.volume).toBeGreaterThanOrEqual(0);
      expect(p.settings.volume).toBeLessThanOrEqual(1);
      expect(Number.isFinite(p.settings.idleHintSeconds) && p.settings.idleHintSeconds >= 0 && p.settings.idleHintSeconds <= 60).toBe(true);
      expect(Number.isInteger(p.settings.newPerDay) && p.settings.newPerDay >= 0).toBe(true);
      expect(Number.isInteger(p.unlockedTo) && p.unlockedTo >= -1 && p.unlockedTo < ALL_CHAPTERS.length).toBe(true);
      expect(typeof p.unlockAll).toBe('boolean');
      expect(typeof p.seenOpening).toBe('boolean');
      expect(Number.isInteger(p.toffees) && p.toffees >= 0).toBe(true);
      expect(Number.isFinite(p.lastPlayed)).toBe(true);
      expect(p.keepsakes.every((k) => typeof k === 'string')).toBe(true);
      expect(new Set(p.keepsakes).size).toBe(p.keepsakes.length);
      expect(p.cards.every((k) => typeof k === 'string')).toBe(true);
      expect(p.seals.every((k) => Number.isInteger(k))).toBe(true);
      expect(new Set(p.seals).size).toBe(p.seals.length);
      for (const c of Object.values(p.chapters)) {
        expect(Number.isInteger(c.plays) && c.plays >= 0).toBe(true);
        expect(typeof c.done).toBe('boolean');
        if ('firstDone' in c) expect(Number.isFinite(c.firstDone)).toBe(true);
      }
      for (const [id, st] of Object.entries(p.skills)) {
        expect(Number.isInteger(st!.tier) && st!.tier >= 1 && st!.tier <= tierCount(id as SkillId)).toBe(true);
        expect(Array.isArray(st!.recent)).toBe(true);
        expect(typeof st!.mastered).toBe('boolean');
        for (const k of ['score', 'seen', 'streak', 'box', 'last', 'due'] as const) expect(Number.isFinite(st![k])).toBe(true);
      }
      // And the game can play on from it.
      const rand = makeRand(7);
      for (const c of [ALL_CHAPTERS[0], ALL_CHAPTERS[2], ALL_CHAPTERS[20]]) {
        isOpen(p, ALL_CHAPTERS.indexOf(c), now);
        buildRound(c, p, rand, now);
      }
      buildPractice(p, rand, now);
      for (const id of Object.keys(p.skills) as SkillId[]) recordOutcome(p, { skill: id, tier: 1, wrong: 0, at: now });
      finishChapter(p, ALL_CHAPTERS[1], now);
      expect(p.chapters[ALL_CHAPTERS[1].id].plays).toBeGreaterThanOrEqual(1);
    }
  });

  it('keep what was won in a damaged save', () => {
    const p = restore({
      chapters: { l1c2: { done: true }, l1c1: { plays: 3, done: true, firstDone: 5 } },
      skills: { 'add-10': { tier: 99, seen: 12, mastered: true, box: 2 } },
      toffees: 4.6,
    });
    expect(p.chapters.l1c2).toEqual({ plays: 1, done: true });
    expect(p.chapters.l1c1).toEqual({ plays: 3, done: true, firstDone: 5 });
    expect(p.skills['add-10']).toMatchObject({ tier: tierCount('add-10'), seen: 12, mastered: true, box: 2 });
    expect(p.toffees).toBe(4);
  });
});
