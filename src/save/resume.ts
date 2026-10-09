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
  /** The problem to carry on from (the total: all answered, only the story is left). */
  index: number;
  /** How many problems the chapter set out with (its dots). */
  base: number;
  /** The build that saved it (see `BUILD`). */
  build?: string;
}

/**
 * Which build of the game this is. In a built game the code's file name
 * carries a hash of its contents, so it changes with every update. A place
 * kept by an older build is dropped (he starts that chapter again): the
 * shape of a problem may have changed since, and a problem this build can't
 * show would leave him on a broken screen.
 */
const BUILD = import.meta.url.replace(/[?#].*$/, '');

const key = (profile: string) => `faraway-maths:resume:${profile}`;

export function saveResume(profile: string, r: Resume): void {
  try {
    localStorage.setItem(key(profile), JSON.stringify({ ...r, build: BUILD }));
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
    const ok = r.build === BUILD && Array.isArray(r.problems) && Number.isInteger(r.index) && r.index > 0 && r.index <= r.problems.length;
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
