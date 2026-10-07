import { describe, expect, it } from 'vitest';
import { BOX_DAYS, DAY, dueForReview, newSkillState, record, tierFor, type SkillState } from '../../src/core/mastery';

const at = 1_000_000_000_000;
const play = (st: SkillState, wrongs: number[], ceiling = 5, start = at) =>
  wrongs.reduce((s, wrong, i) => record(s, { skill: 'add-10', tier: s.tier, wrong, at: start + i * 1000 }, ceiling), st);

describe('mastery', () => {
  it('steps up a tier after a run of first-try rights', () => {
    const st = play(newSkillState(1), [0, 0, 0, 0, 0, 0]);
    expect(st.tier).toBeGreaterThan(1);
  });

  it('never steps above the chapter ceiling', () => {
    const st = play(newSkillState(1), Array(30).fill(0), 2);
    expect(st.tier).toBe(2);
  });

  it('steps down when Silky has to help twice', () => {
    const st = play(newSkillState(3), [3, 0, 3]);
    expect(st.tier).toBe(2);
  });

  it('never drops below tier 1', () => {
    expect(play(newSkillState(1), Array(10).fill(3)).tier).toBe(1);
  });

  it('masters a skill at the ceiling with a high score, then schedules review', () => {
    const st = play(newSkillState(1), Array(20).fill(0), 3);
    expect(st.mastered).toBe(true);
    expect(st.box).toBeGreaterThanOrEqual(1);
    expect(st.due).toBeGreaterThan(st.last);
  });

  it('moves up review boxes on rights and back to box 1 on a slip', () => {
    let st = play(newSkillState(1), Array(12).fill(0), 2);
    expect(st.mastered).toBe(true);
    const box = st.box;
    st = record(st, { skill: 'add-10', tier: st.tier, wrong: 0, at: st.due }, 2);
    expect(st.box).toBe(Math.min(5, box + 1));
    expect(st.due - st.last).toBe(BOX_DAYS[st.box - 1] * DAY);
    const tier = st.tier;
    st = record(st, { skill: 'add-10', tier: st.tier, wrong: 2, at: st.due }, 2);
    expect(st.box).toBe(1);
    expect(st.tier).toBe(Math.max(1, tier - 1));
  });

  it('clamps the tier to a chapter’s range', () => {
    expect(tierFor(undefined, 2, 4)).toBe(2);
    expect(tierFor({ ...newSkillState(), tier: 5 }, 1, 3)).toBe(3);
    expect(tierFor({ ...newSkillState(), tier: 1 }, 2, 3)).toBe(2);
  });

  it('lists due reviews most overdue first', () => {
    const a = { ...newSkillState(), mastered: true, due: at - 5 * DAY };
    const b = { ...newSkillState(), mastered: true, due: at - 1 * DAY };
    const c = { ...newSkillState(), mastered: true, due: at + 1 * DAY };
    const d = { ...newSkillState(), mastered: false, due: 0 };
    expect(dueForReview({ 'add-10': b, 'count-10': a, 'sub-10': c, 'bonds-10': d }, at)).toEqual(['count-10', 'add-10']);
  });
});
