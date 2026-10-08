/**
 * Chapter complete: a calm, predictable reward, the same shape every time.
 *
 *   the keepsake rises into the light, and its name is said;
 *   a Folk card flips over, the first time that character hosts;
 *   after a land's finale, the land's seal is stamped down;
 *
 * then one big Next button back to the tree. Next is there from the start
 * (he never has to wait for the show to finish to move on).
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { KEEPSAKE_NAMES, keepsakeArt, landSeal } from '../art/keepsakes';
import { LAND_ART } from '../art/lands';
import { C } from '../art/palette';
import { glowBlob } from '../art/ui';
import type { Chapter, Land } from '../core/curriculum';
import { CHARACTER_NAMES } from '../core/names';
import { PHRASES } from '../core/phrases';
import { breathe, isCalm, pop, sm, stepped } from '../ui/anim';
import { flipCard, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

export interface CompleteOptions {
  land: Land;
  chapter: Chapter;
  news: { keepsake: boolean; card: boolean; seal: boolean };
  onNext: () => void;
}

/** A keepsake's name for showing and saying ("googleBun" → "Google Bun" if it has no name yet). */
export const keepsakeName = (id: string): string => KEEPSAKE_NAMES[id] ?? id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

/** Where the rewards stand, centred in a row: 1, 2 or 3 of them (keepsake, card, seal). */
const SLOTS: Record<number, number[]> = { 1: [590], 2: [400, 780], 3: [270, 590, 910] };

export class CompleteScene extends Scene {
  private o: CompleteOptions;
  private keepsake!: HTMLElement;
  private glow!: HTMLElement;
  private card: HTMLElement | null = null;
  private seal: HTMLElement | null = null;
  private next!: HTMLButtonElement;

  constructor(app: App, o: CompleteOptions) {
    super(app, 'complete');
    this.o = o;
  }

  build(): void {
    const r = this.root;
    const { chapter: c, land, news } = this.o;
    r.style.background = land.color;
    const art = LAND_ART[land.n];
    if (art) r.append(h('div', { class: 'backdrop-wrap complete-scene', html: art.scene('complete-' + land.id) }));
    r.append(h('div', { class: 'complete-veil' }));
    const heading = news.seal ? `You finished ${land.title}!` : 'Well done!';
    r.append(place(h('div', { class: 'big-title', style: `font-size:${heading.length > 26 ? 50 : 62}px` }, heading), 0, 34));

    const count = 1 + (news.card ? 1 : 0) + (news.seal ? 1 : 0);
    const xs = SLOTS[count];
    let slot = 0;

    // The keepsake, always: the thing he found in this chapter.
    const kx = xs[slot++];
    this.glow = place(h('div', { class: 'reward-glow', html: glowBlob() }), kx - 210, 140, 420, 440);
    r.append(this.glow);
    this.keepsake = place(h('button', { class: 'complete-keepsake', 'aria-label': keepsakeName(c.keepsake) }), kx - 130, 190, 260, 260);
    this.keepsake.innerHTML = keepsakeArt(c.keepsake);
    this.tap(this.keepsake, () => {
      void pop(this.keepsake, 1.06);
      void voice.say(keepsakeName(c.keepsake));
    });
    r.append(this.keepsake);
    r.append(place(h('div', { class: 'reward-name' }, keepsakeName(c.keepsake)), kx - 200, 470, 400));

    // A new Folk card.
    if (news.card) {
      const x = xs[slot++];
      this.card = flipCard(characterArt(c.host), CHARACTER_NAMES[c.host] ?? c.host, 220);
      this.card.classList.add('complete-card');
      place(this.card, x - 110, 160, 220, 308);
      r.append(this.card);
      r.append(place(h('div', { class: 'reward-caption' }, 'A new card!'), x - 160, 486, 320));
    }

    // The land's seal, after a finale.
    if (news.seal) {
      const x = xs[slot++];
      this.seal = place(h('div', { class: 'complete-seal', html: landSeal(land.n) }), x - 130, 170, 260, 260);
      r.append(this.seal);
      r.append(place(h('div', { class: 'reward-caption' }, `${land.short} seal`), x - 160, 486, 320));
    }

    this.next = sealButton('next', { x: 900, y: 610, size: 150, color: C.red, aria: 'Next', name: 'complete-next' });
    this.tap(this.next, () => {
      sfx.tap();
      voice.stop();
      this.o.onNext();
    });
    r.append(this.next);

    // Start hidden: enter() brings each in turn.
    gsap.set(this.keepsake, { opacity: 0 });
    if (this.card) gsap.set(this.card.querySelector('.card-inner'), { rotationY: 180 });
    if (this.card) gsap.set(this.card, { opacity: 0 });
    if (this.seal) gsap.set(this.seal, { opacity: 0 });
  }

  async enter(): Promise<void> {
    const { chapter: c, news } = this.o;
    const calm = isCalm();
    if (!this.alive) return;
    sfx.fanfare();
    // Next pops in straight away, then breathes (once it has arrived, so the two never fight).
    void sm(this.next, 0.4, { startAt: { scale: 0 }, scale: 1, ease: 'back.out(2)' }).then(() => {
      if (this.alive) this.onCleanup(breathe(this.next, 0.06, 1.6));
    });

    // The keepsake rises out of the glow.
    await sm(this.keepsake, 0.6, { startAt: { y: 60, scale: 0.4, rotation: -14 }, opacity: 1, y: 0, scale: 1, rotation: 0, ease: 'back.out(1.6)' });
    // After each line, check the scene is still here: leaving it stops the
    // voice, which ends the pending line, and the rest must not play over the map.
    if (!this.alive) return;
    sfx.reveal();
    this.onCleanup(breathe(this.glow, 0.05, 2.4));
    await voice.say(PHRASES.chapterDone);
    if (!this.alive) return;
    if (news.keepsake) await voice.say(PHRASES.newKeepsake);
    if (!this.alive) return;
    void pop(this.keepsake, 1.06);
    await voice.say(keepsakeName(c.keepsake));
    if (!this.alive) return;

    if (this.card) {
      const inner = this.card.querySelector('.card-inner')!;
      gsap.set(this.card, { opacity: 1 });
      if (calm) {
        gsap.set(inner, { rotationY: 0 });
        void sm(this.card, 0.25, { startAt: { opacity: 0 }, opacity: 1 });
      } else {
        await sm(this.card, 0.4, { startAt: { y: -260, rotation: -8 }, y: 0, rotation: 0, ease: 'back.out(1.3)' });
        sfx.whoosh();
        await sm(inner, 0.8, { rotationY: 0, ease: 'power2.inOut' });
      }
      if (!this.alive) return;
      sfx.sparkle();
      void pop(this.card, 1.05);
      await voice.say(PHRASES.newCard);
      if (!this.alive) return;
      const name = CHARACTER_NAMES[c.host];
      if (name) await voice.say(name);
      if (!this.alive) return;
    }

    if (this.seal) await this.stamp(this.seal, calm);
  }

  /** The land seal comes down like a stamp: a thump, a little shake, a puff of dust. */
  private async stamp(seal: HTMLElement, calm: boolean): Promise<void> {
    if (calm) {
      await sm(seal, 0.25, { startAt: { opacity: 0 }, opacity: 1 });
    } else {
      await sm(seal, 0.35, { startAt: { scale: 2.4, rotation: -18, opacity: 0 }, opacity: 1, scale: 1, rotation: 0, ease: 'power3.in' });
      sfx.boom();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const dust = place(h('div', { class: 'stamp-dust' }), parseFloat(seal.style.left) + 130 + Math.cos(a) * 100 - 14, parseFloat(seal.style.top) + 130 + Math.sin(a) * 100 - 14, 28, 28);
        this.root.append(dust);
        gsap.to(dust, { x: Math.cos(a) * 50, y: Math.sin(a) * 50, opacity: 0, scale: 1.6, duration: 0.6, ease: stepped(0.6, 'power2.out'), onComplete: () => dust.remove() });
      }
      gsap.fromTo(this.root, { y: 6 }, { y: 0, duration: 0.3, ease: stepped(0.3, 'elastic.out(1, 0.4)') });
    }
    if (!this.alive) return;
    sfx.triumph();
    await voice.say(PHRASES.newSeal);
  }

  leave(): void {
    voice.stop();
  }
}
