/**
 * The game holds still while he can't see it: the iPad turned to portrait
 * (ui/rotate.ts), or the app out of sight (the home button, the screen
 * locking, Mum switching apps). Animation, sound and the scenes' own
 * timers all stop, and carry on exactly where they were when he's back.
 * Nothing is said, and no story goes on, to an empty room. A line the
 * pause cut off is said again from its start (audio/voice.ts).
 *
 * Out of sight, iPad Safari stops the page's code altogether, and timers
 * that were due fire all at once on return. Waiting with `wait` (ui/dom.ts)
 * or a scene's `later` and `sleep` counts only time he could see, so
 * nothing is skipped in a burst when he comes back.
 */
import { gsap } from 'gsap';
import { setPaused } from '../audio/engine';

type Listener = (paused: boolean) => void;

let portrait = false;
let away = typeof document !== 'undefined' && document.hidden;
let held = false;
const listeners = new Set<Listener>();

/** True while the game is holding still. */
export const paused = (): boolean => held;

/** Runs `fn` each time the game pauses (true) or carries on (false). Returns a stopper. */
export function onPause(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Resolves at once while playing, else when the game carries on. */
export function whenPlaying(): Promise<void> {
  if (!held) return Promise.resolve();
  return new Promise((resolve) => {
    const off = onPause((p) => {
      if (p) return;
      off();
      resolve();
    });
  });
}

/**
 * Like setTimeout, but its clock stops while the game is paused. Returns a
 * function that cancels it.
 */
export function playTimer(ms: number, fn: () => void): () => void {
  let left = ms;
  let started = 0;
  let t: ReturnType<typeof setTimeout> | null = null;
  const run = () => {
    started = performance.now();
    t = setTimeout(() => {
      stop();
      fn();
    }, left);
  };
  const hold = () => {
    if (t === null) return;
    clearTimeout(t);
    t = null;
    left = Math.max(0, left - (performance.now() - started));
  };
  const off = onPause((p) => (p ? hold() : run()));
  const stop = () => {
    off();
    if (t !== null) clearTimeout(t);
    t = null;
  };
  if (!held) run();
  return stop;
}

/** The iPad was turned (ui/rotate.ts). */
export function setPortrait(p: boolean): void {
  portrait = p;
  update();
}

function update(): void {
  const now = portrait || away;
  if (now === held) return;
  held = now;
  document.body.classList.toggle('is-paused', held);
  if (held) {
    // The iPad's own voice too: it isn't part of the Web Audio that pauses.
    window.speechSynthesis?.cancel();
    gsap.globalTimeline.pause();
  } else {
    gsap.globalTimeline.resume();
  }
  setPaused(held);
  // A listener may stop another (a scene cancelling its timer): skip those.
  [...listeners].forEach((fn) => listeners.has(fn) && fn(held));
}

if (typeof document !== 'undefined') {
  const check = () => {
    away = document.hidden;
    update();
  };
  document.addEventListener('visibilitychange', check);
  // Leaving for another page, or coming back from the back-forward cache.
  window.addEventListener('pagehide', () => {
    away = true;
    update();
  });
  window.addEventListener('pageshow', check);
  // Opened out of sight (rare): hold from the start.
  check();
}
