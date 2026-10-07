import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { canonical, mergeProgress, same } from '../../src/core/merge';
import { newSkillState } from '../../src/core/mastery';
import { defaultProgress, finishChapter, recordOutcome, type Progress } from '../../src/core/progress';

let clock = Date.parse('2026-10-06T09:00:00Z');

/** Plays chapter `i`: 8 problems on its first skill (`wrong` wrong answers each), then the reward. */
const play = (p: Progress, i: number, wrong = 0): Progress => {
  const c = ALL_CHAPTERS[i];
  for (let k = 0; k < 8; k++) recordOutcome(p, { skill: c.skills[0], tier: c.tiers[0], wrong, at: (clock += 1000) });
  finishChapter(p, c, (clock += 1000));
  return p;
};
const copy = (p: Progress): Progress => structuredClone(p);

describe('mergeProgress', () => {
  it('changes nothing when neither side changed', () => {
    const base = play(defaultProgress(), 0);
    expect(canonical(mergeProgress(base, copy(base), copy(base)))).toBe(canonical(base));
  });

  it('takes the only side that changed', () => {
    const base = play(defaultProgress(), 0);
    const local = play(copy(base), 1);
    expect(same(mergeProgress(base, local, copy(base)), local)).toBe(true);
    const remote = copy(base);
    remote.settings.newPerDay = 5;
    remote.unlockedTo = 12;
    expect(same(mergeProgress(base, copy(base), remote), remote)).toBe(true);
  });

  it('keeps play on this device and a grown-up’s edits made elsewhere', () => {
    const base = play(defaultProgress(), 0);
    const local = play(copy(base), 1); // Jasper plays chapter 2 offline
    const remote = copy(base);
    remote.settings.idleHintSeconds = 20; // a grown-up changes a setting on a phone
    remote.name = 'Jas';

    const m = mergeProgress(base, local, remote);
    expect(m.chapters[ALL_CHAPTERS[1].id]).toMatchObject({ plays: 1, done: true });
    expect(m.cards).toEqual(local.cards);
    expect(m.keepsakes).toEqual(local.keepsakes);
    expect(m.toffees).toBe(local.toffees);
    expect(m.skills).toEqual(local.skills);
    expect(m.name).toBe('Jas');
    expect(m.settings.idleHintSeconds).toBe(20);
    expect(m.settings.volume).toBe(base.settings.volume);
  });

  it('takes the chapter record with more plays, done if either side finished it', () => {
    const base = defaultProgress();
    const local = copy(base);
    const remote = copy(base);
    local.chapters.l1c1 = { plays: 3, done: true, firstDone: 200 };
    remote.chapters.l1c1 = { plays: 1, done: true, firstDone: 100 };
    remote.chapters.l1c2 = { plays: 1, done: false };
    local.chapters.l1c2 = { plays: 0, done: true };
    const m = mergeProgress(base, local, remote);
    expect(m.chapters.l1c1).toEqual({ plays: 3, done: true, firstDone: 100 });
    expect(m.chapters.l1c2).toEqual({ plays: 1, done: true });
  });

  it('keeps each skill’s record that has seen more problems, or the later one on a tie', () => {
    const base = defaultProgress();
    const local = copy(base);
    const remote = copy(base);
    local.skills['count-10'] = { ...newSkillState(2), seen: 12, last: 10 };
    remote.skills['count-10'] = { ...newSkillState(1), seen: 5, last: 99 };
    local.skills['add-10'] = { ...newSkillState(1), seen: 4, last: 50 };
    remote.skills['add-10'] = { ...newSkillState(3), seen: 4, last: 60 };
    remote.skills['sub-10'] = { ...newSkillState(1), seen: 1, last: 1 };
    const m = mergeProgress(base, local, remote);
    expect(m.skills['count-10']).toEqual(local.skills['count-10']);
    expect(m.skills['add-10']).toEqual(remote.skills['add-10']);
    expect(m.skills['sub-10']).toEqual(remote.skills['sub-10']);
    // A copy, not the same object.
    expect(m.skills['sub-10']).not.toBe(remote.skills['sub-10']);
  });

  it('keeps every keepsake, card and seal won on either side, and the larger toffee count', () => {
    const base = defaultProgress();
    const local = copy(base);
    const remote = copy(base);
    local.keepsakes = ['acorn', 'shell'];
    remote.keepsakes = ['shell', 'feather'];
    local.cards = ['moonface'];
    remote.cards = ['silky'];
    local.seals = [1];
    remote.seals = [1, 2];
    local.toffees = 30;
    remote.toffees = 24;
    const m = mergeProgress(base, local, remote);
    expect(m.keepsakes.sort()).toEqual(['acorn', 'feather', 'shell']);
    expect(m.cards.sort()).toEqual(['moonface', 'silky']);
    expect(m.seals.sort()).toEqual([1, 2]);
    expect(m.toffees).toBe(30);
  });

  it('takes this device’s setting when both sides changed the same one', () => {
    const base = defaultProgress();
    const local = copy(base);
    const remote = copy(base);
    local.settings.volume = 0.3;
    remote.settings.volume = 0.6;
    remote.settings.calm = true;
    local.avatar = 'beth';
    remote.avatar = 'joe';
    remote.unlockAll = true;
    const m = mergeProgress(base, local, remote);
    expect(m.settings.volume).toBe(0.3);
    expect(m.settings.calm).toBe(true);
    expect(m.avatar).toBe('beth');
    expect(m.unlockAll).toBe(true);
  });

  it('remembers the opening was seen on either side, and the latest play', () => {
    const base = defaultProgress();
    const local = copy(base);
    const remote = copy(base);
    remote.seenOpening = true;
    local.lastPlayed = 500;
    remote.lastPlayed = 400;
    const m = mergeProgress(base, local, remote);
    expect(m.seenOpening).toBe(true);
    expect(m.lastPlayed).toBe(500);
  });

  it('gives the same result whichever way round two played copies are merged, apart from clashing settings', () => {
    const base = play(defaultProgress(), 0);
    const a = play(play(copy(base), 1), 0, 1);
    const b = play(copy(base), 2);
    expect(canonical({ ...mergeProgress(base, a, b), keepsakes: [], cards: [], seals: [] })).toBe(
      canonical({ ...mergeProgress(base, b, a), keepsakes: [], cards: [], seals: [] }),
    );
  });
});
