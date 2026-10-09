import { gsap } from 'gsap';
import type { ProfileInfo } from '../cloud/api';
import type { Progress } from '../core/progress';
import type { Profile } from '../save/local';
import type { Stage } from '../stage';
import { h, onTap } from './dom';
import { playTimer } from './pause';

/** Where scenes can go next. */
export interface Nav {
  title(): void;
  choose(): void;
  map(): void;
  /** Opens a chapter: intro, then play, story and reward. */
  chapter(id: string): void;
  /** Practice with Silky: spaced review, no story. */
  practice(): void;
  album(): void;
  /** Plays a story (a chapter id, 'opening' or 'ending'), then calls `back`. */
  story(id: string, back: () => void): void;
  parent(): void;
}

export interface App {
  stage: Stage;
  /** The player's save. */
  readonly profile: Profile;
  /** Their progress: shorthand for `profile.progress`. */
  readonly progress: Progress;
  nav: Nav;
  save(): void;
  /** Sends any unsent progress, forgets the sign-in, and goes back to the password. */
  signOut(): Promise<void>;
  /** Plays as another profile from now on (a grown-up's choice), restarting at the title. */
  switchProfile(to: ProfileInfo): Promise<void>;
  go(scene: Scene, transition?: 'page' | 'fade' | 'none'): Promise<void>;
}

/**
 * A full-stage screen. Subclasses build DOM in `build()` and clean up
 * automatically: taps registered with `tap()`, timers via `later()`.
 */
export abstract class Scene {
  readonly root: HTMLElement;
  protected readonly app: App;
  private cleanups: (() => void)[] = [];
  /** Cancels for the pending `later` timers. */
  private timers = new Set<() => void>();
  protected alive = true;
  /** Set the moment the director starts moving away; taps are ignored from then on. */
  private leaving = false;
  /** Hides the grown-ups' gear (on the password screen and in the corner itself). */
  readonly hidesGear: boolean = false;

  constructor(app: App, className = '') {
    this.app = app;
    this.root = h('div', { class: `scene ${className}` });
  }

  /** Builds the DOM. Called once before the scene is shown. */
  abstract build(): void;

  /** Called after the transition has revealed the scene. */
  enter(): void | Promise<void> {}

  /** Called before the scene is removed. */
  leave(): void {}

  /**
   * The director calls this as soon as it starts a change of scene. The old
   * scene stays on screen for the wipe, so it must stop listening at once
   * (two quick taps on Back would build the next scene twice). `alive` goes
   * false after `leave()`, which stops pending sleeps and enter chains; the
   * real clean-up is still `destroy()`.
   */
  retire(): void {
    this.leaving = true;
  }

  /** The change of scene failed before it began, so this scene is still the one on screen. */
  resume(): void {
    this.leaving = false;
  }

  /** Runs `leave()`, then stops the scene's pending timers and chains. */
  depart(): void {
    this.leaving = true;
    this.leave();
    this.alive = false;
  }

  destroy(): void {
    this.alive = false;
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.timers.forEach((cancel) => cancel());
    this.timers.clear();
    gsap.killTweensOf(this.root.querySelectorAll('*'));
    this.root.remove();
  }

  protected tap(el: HTMLElement, fn: (e: PointerEvent) => void): void {
    this.cleanups.push(
      onTap(el, (e) => {
        if (this.leaving) return;
        fn(e);
      }),
    );
  }

  protected onCleanup(fn: () => void): void {
    this.cleanups.push(fn);
  }

  /**
   * Runs `fn` after `ms` of play: the clock stops while the game is paused
   * (ui/pause.ts), so nothing fires in a burst when he comes back.
   */
  protected later(ms: number, fn: () => void): void {
    const cancel = playTimer(ms, () => {
      this.timers.delete(cancel);
      if (this.alive) fn();
    });
    this.timers.add(cancel);
  }

  protected clearTimers(): void {
    this.timers.forEach((cancel) => cancel());
    this.timers.clear();
  }

  /** Resolves after `ms`, or never if the scene was destroyed meanwhile. */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => this.later(ms, resolve));
  }
}
