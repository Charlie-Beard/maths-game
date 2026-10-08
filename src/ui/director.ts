/**
 * Switches scenes with a stop-motion page wipe: a torn parchment sheet
 * slides across, the scene changes underneath, and the sheet slides away.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { parchment } from '../art/ui';
import { C } from '../art/palette';
import { isCalm, stepped } from './anim';
import { h } from './dom';
import type { Scene } from './scene';

/**
 * Smooth frames over catching up. After a slow frame (a busy page, a
 * throttled tab) GSAP's default jumps the animation forward to make up the
 * lost time, which shows as a lurch. Give up after 500 ms and carry on from
 * where we were, and let a late frame count as at most 33 ms.
 */
gsap.ticker.lagSmoothing(500, 33);
/** Let GSAP use 3D transforms (translate3d) so moving pieces get their own GPU layer. */
gsap.config({ force3D: true });

/**
 * Turns the grain texture (light grey, opaque) into the see-through dark
 * version the .grain overlay uses, as --grain-alpha-url. A multiply of
 * grey g at opacity 0.32 darkens exactly like black at alpha 0.32 × (1 − g),
 * so this looks the same without any blend mode.
 */
function bakeGrain(): void {
  const src = /url\(["']?(.*?)["']?\)/.exec(document.documentElement.style.getPropertyValue('--grain-url'))?.[1];
  if (!src) return;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    if (!g) return;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const lum = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3;
      d.data[i] = 24; // a warm near-black: paper loses a little more blue than red
      d.data[i + 1] = 16;
      d.data[i + 2] = 0;
      d.data[i + 3] = Math.round(0.32 * (255 - lum));
    }
    g.putImageData(d, 0, 0);
    document.documentElement.style.setProperty('--grain-alpha-url', `url(${c.toDataURL('image/png')})`);
  };
  img.src = src;
}

export class Director {
  private stage: HTMLElement;
  private current: Scene | null = null;
  private sheet: HTMLElement;
  private busy = false;
  private pending: { scene: Scene; transition: 'page' | 'fade' | 'none' } | null = null;

  constructor(stage: HTMLElement) {
    this.stage = stage;
    this.sheet = h('div', {
      class: 'wipe',
      html: parchment(1500, 1000, 'wipe-sheet', C.sand, 3),
    });
    this.stage.append(this.sheet);
    bakeGrain();
  }

  /** Puts the wipe sheet on its own GPU layer for the slide, and drops it after. */
  private lift(on: boolean): void {
    this.sheet.style.willChange = on ? 'transform' : '';
  }

  get scene(): Scene | null {
    return this.current;
  }

  async go(next: Scene, transition: 'page' | 'fade' | 'none' = 'page'): Promise<void> {
    if (this.busy) {
      // Keep only the latest request; it runs when the current change ends.
      this.pending = { scene: next, transition };
      return;
    }
    this.busy = true;
    this.stage.classList.toggle('no-gear', next.hidesGear);
    try {
      next.build();
      const prev = this.current;
      prev?.leave();

      if (!prev || transition === 'none') {
        this.stage.insertBefore(next.root, this.sheet);
        prev?.destroy();
      } else if (transition === 'fade' || isCalm()) {
        next.root.style.opacity = '0';
        this.stage.insertBefore(next.root, this.sheet);
        await gsap.to(next.root, { opacity: 1, duration: 0.35, ease: 'none' });
        prev.destroy();
      } else {
        sfx.page();
        this.lift(true);
        gsap.set(this.sheet, { display: 'block', x: 1240, rotation: 3 });
        await gsap.to(this.sheet, { x: -160, rotation: -1, duration: 0.42, ease: stepped(0.42, 'power2.in') });
        prev.destroy();
        this.stage.insertBefore(next.root, this.sheet);
        await gsap.to(this.sheet, { x: -1700, rotation: -4, duration: 0.42, ease: stepped(0.42, 'power2.out') });
        gsap.set(this.sheet, { display: 'none' });
        this.lift(false);
      }
      this.current = next;
    } finally {
      this.busy = false;
    }
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      return this.go(p.scene, p.transition);
    }
    // Scenes may run long sequences in enter(); don't block navigation on it.
    void next.enter();
  }
}
