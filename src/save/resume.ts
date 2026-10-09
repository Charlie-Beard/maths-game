/**
 * A chapter left part way through, so coming back carries on from the same
 * problem instead of starting again with new numbers (PLAN.md §13: nothing
 * he has done is lost). Kept on this device only, one chapter per profile:
 * it is a convenience, not part of the save that syncs.
 */
import type { Problem } from '../core/problem';

export interface Resume {
  chapter: string;
  problems: Problem[];
  /** The problem to carry on from. */
  index: number;
  /** How many problems the chapter set out with (its dots). */
  base: number;
}

const key = (profile: string) => `faraway-maths:resume:${profile}`;

export function saveResume(profile: string, r: Resume): void {
  try {
    localStorage.setItem(key(profile), JSON.stringify(r));
  } catch {
    // No storage: he simply starts the chapter again.
  }
}

/** The saved place in this chapter, if there is one (and forgets it). */
export function takeResume(profile: string, chapter: string): Resume | null {
  try {
    const raw = localStorage.getItem(key(profile));
    if (!raw) return null;
    const r = JSON.parse(raw) as Resume;
    if (r.chapter !== chapter) return null;
    localStorage.removeItem(key(profile));
    const ok = Array.isArray(r.problems) && Number.isInteger(r.index) && r.index > 0 && r.index < r.problems.length;
    return ok ? { ...r, base: Math.min(r.base || r.problems.length, r.problems.length) } : null;
  } catch {
    return null;
  }
}

export function clearResume(profile: string): void {
  try {
    localStorage.removeItem(key(profile));
  } catch {
    // Nothing to clear.
  }
}
