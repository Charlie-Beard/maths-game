/**
 * Title: the Faraway Tree at dusk with whichever land is visiting in the
 * cloud, its little windows lit and gently flickering (candles, not
 * flashes; still in calm mode), Moon-Face leaning out over his branch to
 * wave, and one big wax-seal Play button.
 */
import { gsap } from 'gsap';
import { unlock } from '../audio/engine';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { circle, ellipse, piece, rng, svg } from '../art/paper';
import { tree } from '../art/scenery';
import { PHRASES } from '../core/phrases';
import { requestPersistence } from '../save/local';
import { breathe, isCalm, sm, stepped } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';
import { currentLand } from './map';

/** The tree's lit windows (art/scenery.ts), as glows that can flicker: x, y, radius. */
const WINDOWS: [number, number, number][] = [
  [560, 640, 30],
  [650, 470, 24],
  [610, 300, 24],
  [546, 208, 20],
  [646, 208, 20],
  [596, 224, 36],
  [548, 516, 46],
  [640, 390, 40],
];

export class TitleScene extends Scene {
  private play!: HTMLButtonElement;
  private moon!: HTMLElement;
  private going = false;

  build(): void {
    const r = this.root;
    r.classList.add('title');
    r.append(h('div', { class: 'backdrop-wrap', html: tree('title-tree', { landN: currentLand(this.app.progress) }) }));
    // Dusk deepening at the edges, so the title and the windows glow.
    r.append(h('div', { class: 'title-dusk' }));

    for (const [x, y, rad] of WINDOWS) {
      const glow = place(h('div', { class: 'window-glow' }), x - rad * 1.6, y - rad * 1.6, rad * 3.2, rad * 3.2);
      r.append(glow);
      if (!isCalm()) this.flicker(glow);
    }

    // Moon-Face, leaning out of the cloud by his round room, waving.
    this.moon = place(h('div', { class: 'title-moon', html: characterArt('moonface') }), 850, 60, 200, 227);
    r.append(this.moon);
    r.append(place(h('div', { class: 'title-moon-cloud', html: puff(320, 110, 'title-moon') }), 790, 214, 320, 110));

    r.append(place(h('div', { class: 'big-title', style: 'font-size:88px' }, 'Up the Faraway Tree'), 0, 300));
    r.append(place(h('div', { class: 'big-title sub' }, 'a maths adventure'), 0, 410));
    this.play = sealButton('play', { x: 505, y: 540, size: 170, color: C.red, aria: 'Play', name: 'title-play' });
    this.tap(this.play, () => void this.go());
    r.append(this.play);
  }

  enter(): void {
    void sm(this.play, 0.5, { startAt: { scale: 0, rotation: -40 }, scale: 1, rotation: 0, ease: 'back.out(1.8)' }).then(() => {
      if (this.alive && !this.going) this.onCleanup(breathe(this.play, 0.05, 2.2));
    });
    this.wave();
  }

  /** Moon-Face waves now and then (once, and only a little, in calm mode). */
  private wave(): void {
    const arm = this.moon.querySelector('[data-part="armR"]');
    if (!arm || !this.alive) return;
    const swings = isCalm() ? 1 : 3;
    const tl = gsap.timeline();
    for (let i = 0; i < swings; i++) {
      tl.to(arm, { rotation: -16, duration: 0.25, ease: stepped(0.25, 'sine.inOut') });
      tl.to(arm, { rotation: 8, duration: 0.25, ease: stepped(0.25, 'sine.inOut') });
    }
    tl.to(arm, { rotation: 0, duration: 0.2, ease: stepped(0.2, 'sine.out') });
    this.onCleanup(() => tl.kill());
    if (!isCalm()) this.later(7000, () => this.wave());
  }

  /** A candle's slow, small flicker: brightness drifts, never blinks. */
  private flicker(el: HTMLElement): void {
    const step = () => {
      if (!this.alive) return;
      const d = 0.5 + Math.random() * 0.9;
      gsap.to(el, { opacity: 0.55 + Math.random() * 0.4, scale: 0.94 + Math.random() * 0.1, duration: d, ease: stepped(d, 'sine.inOut'), onComplete: step });
    };
    gsap.set(el, { opacity: 0.8 });
    step();
  }

  private async go(): Promise<void> {
    if (this.going) return;
    this.going = true;
    await unlock();
    requestPersistence();
    sfx.reveal();
    void voice.say(PHRASES.welcome);
    await sm(this.play, 0.3, { scale: 1.2, ease: 'power2.out' });
    await this.sleep(700);
    const p = this.app.progress;
    if (!p.avatar) this.app.nav.choose();
    else this.app.nav.map();
  }
}

/** A small heap of paper cloud, w × h: overlapping puffs on a shaded base. */
function puff(w: number, hh: number, name: string): string {
  const r = rng(w * 7 + hh);
  const n = Math.max(3, Math.round(w / 60));
  const puffs = Array.from({ length: n }, (_, i) => {
    const x = w * 0.12 + (i / (n - 1)) * w * 0.76;
    const rad = hh * (0.32 + r() * 0.16) * (i === 0 || i === n - 1 ? 0.8 : 1);
    return piece(circle(x, hh * 0.55 - r() * hh * 0.12, rad), C.cloud, { shadow: i === 0 });
  });
  return svg({ w, h: hh, name, boil: false }, [
    piece(ellipse(w / 2, hh * 0.74, w * 0.46, hh * 0.22), C.cloudShade, { shadow: true, fibre: false }),
    ...puffs,
    piece(ellipse(w / 2, hh * 0.66, w * 0.42, hh * 0.2), C.cloud, { shadow: false }),
  ]);
}
