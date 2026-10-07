/**
 * The contract every activity follows, so the play scene doesn't care
 * which one is showing (docs/PLAN.md §5).
 *
 * An activity draws one problem and takes his answer. It owns a layer the
 * size of the stage (1180 × 820) but must keep clear of:
 *
 *   - the top bar:          y < 96 (gear, progress dots, toffee jar)
 *   - "hear it again":      x < 150, 300 < y < 470 (left thumb)
 *   - Silky the helper:     x > 1030, 300 < y < 470 (right thumb)
 *   - the chosen child:     x < 150, y > 520
 *
 * The usual layout is the picture in the box (160, 110, 860, 360), the
 * written sum just under it (y ≈ 480) and answers along the bottom
 * (y 590–760, tap targets ≥ 96 px).
 *
 * The play scene handles everything around the activity: speech, praise,
 * toffees, Silky flying in, and moving on.
 */
import type { Answer, Problem, Speech } from '../core/problem';
import type { HelpLevel } from '../core/round';

export interface ActivityContext {
  /** Gives an answer; the scene checks it and calls right() or wrong(). */
  answer(value: Answer): void;
  /** Says something (e.g. counting aloud as objects are tapped). */
  say(s: Speech): void;
  /** Plays a small sound effect by name (see audio/sfx.ts). */
  sfx(name: 'tap' | 'lift' | 'place' | 'rustle' | 'sparkle'): void;
  /** Calm mode is on: minimal movement. */
  calm: boolean;
}

export interface Activity {
  /** The activity's layer, added to the scene by the play scene. */
  readonly el: HTMLElement;
  /** Called once it is on stage (for entrance animations). */
  show(): void;
  /** The answer was wrong: wobble what he chose and put it back. */
  wrong(value: Answer): void;
  /** The answer was right: a short celebration of the picture. Resolves when done. */
  right(): Promise<void>;
  /**
   * Steps up help after a wrong answer:
   *   1: the key part glows (the question is also said again by the scene)
   *   2: show me: a simpler picture (counters, a number line) and one wrong choice goes
   *   3: Silky is here: the answer is shown, and he taps it
   */
  help(level: Exclude<HelpLevel, 0>): void;
  /** Ignores taps while true (during transitions and speech). */
  lock(on: boolean): void;
  destroy(): void;
}

export type ActivityFactory = (p: Problem, ctx: ActivityContext) => Activity;
