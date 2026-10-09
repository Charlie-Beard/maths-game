/**
 * Animation helpers. All movement is smooth and eased (gentle in, gentle
 * out), while press feedback stays instant.
 */
import { gsap } from 'gsap';

/**
 * Movement used to be held in 12 fps steps; it is smooth now. Kept so the
 * many callers keep working: it simply returns the plain ease.
 */
export function stepped(_duration: number, ease: string | ((t: number) => number) = 'power2.inOut'): (t: number) => number {
  return typeof ease === 'function' ? ease : gsap.parseEase(ease);
}

type Vars = gsap.TweenVars;

/** A smooth eased tween. */
export function sm(target: gsap.TweenTarget, duration: number, vars: Vars & { ease?: string }): gsap.core.Tween {
  return gsap.to(target, { ...vars, duration, ease: vars.ease ?? 'power2.inOut' });
}

export function smFrom(target: gsap.TweenTarget, duration: number, vars: Vars & { ease?: string }): gsap.core.Tween {
  return gsap.from(target, { ...vars, duration, ease: vars.ease ?? 'power2.out' });
}

/**
 * Gentle "no, not that one" wobble: a short side-to-side shake that dies
 * away, each swing slower and smaller than the last. No buzz, no jolt.
 */
export function wobble(el: Element): Promise<void> {
  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .to(el, { rotation: -7, x: -8, duration: 0.1, ease: 'sine.inOut' })
      .to(el, { rotation: 6, x: 7, duration: 0.13, ease: 'sine.inOut' })
      .to(el, { rotation: -3, x: -4, duration: 0.14, ease: 'sine.inOut' })
      .to(el, { rotation: 0, x: 0, duration: 0.16, ease: 'sine.out' });
  });
}

/** Quick squash-and-stretch pop, used when something lands. */
export function pop(el: Element, amount = 1.12): gsap.core.Timeline {
  return gsap
    .timeline()
    .to(el, { scale: amount, duration: 0.12, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' });
}

/** A paper "breathing" idle loop (smooth), returns a stopper. */
export function breathe(el: Element, amount = 0.03, period = 2.4): () => void {
  const tw = gsap.to(el, {
    scale: 1 + amount,
    duration: period / 2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
  return () => tw.kill();
}

export { gsap };
