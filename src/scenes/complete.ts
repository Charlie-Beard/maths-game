/**
 * Chapter complete: a calm, predictable reward. The keepsake (and a Folk
 * card or a land seal, if new) is shown, then one obvious next step.
 *
 * SCAFFOLD: keepsakes show as a named seal. W3 draws each keepsake
 * (art/keepsakes.ts) and W4 polishes this screen.
 */
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { glowBlob } from '../art/ui';
import type { Chapter, Land } from '../core/curriculum';
import { CHARACTER_NAMES } from '../core/names';
import { PHRASES } from '../core/phrases';
import { breathe, sm } from '../ui/anim';
import { folkCard, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

export interface CompleteOptions {
  land: Land;
  chapter: Chapter;
  news: { keepsake: boolean; card: boolean; seal: boolean };
  onNext: () => void;
}

/** "googleBun" → "Google Bun". */
export const keepsakeName = (id: string): string => id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export class CompleteScene extends Scene {
  private o: CompleteOptions;
  private reward!: HTMLElement;
  private next!: HTMLButtonElement;

  constructor(app: App, o: CompleteOptions) {
    super(app, 'complete');
    this.o = o;
  }

  build(): void {
    const r = this.root;
    const { chapter: c, news } = this.o;
    r.style.background = this.o.land.color;
    r.append(place(h('div', { class: 'big-title', style: 'font-size:64px' }, news.seal ? `You finished ${this.o.land.title}!` : 'Well done!'), 0, 30));
    r.append(place(h('div', { class: 'reward-glow', html: glowBlob() }), 120, 120, 500, 560));

    this.reward = place(h('div', { class: 'keepsake' }), 220, 200, 300, 380);
    this.reward.append(
      h('div', { class: 'keepsake-art', html: sealButtonArt(news.seal ? C.gold : C.red) }),
      h('div', { class: 'keepsake-name' }, keepsakeName(c.keepsake)),
    );
    r.append(this.reward);

    if (news.card) {
      const card = folkCard(characterArt(c.host), CHARACTER_NAMES[c.host] ?? c.host, { w: 260 });
      place(card, 680, 170, 260, 364);
      r.append(card);
    }

    this.next = sealButton('next', { x: 900, y: 600, size: 150, color: C.red, aria: 'Next', name: 'complete-next' });
    this.tap(this.next, () => {
      sfx.tap();
      voice.stop();
      this.o.onNext();
    });
    r.append(this.next);
  }

  async enter(): Promise<void> {
    sfx.reveal();
    await sm(this.reward, 0.5, { startAt: { scale: 0.2, rotation: -20, opacity: 0 }, scale: 1, rotation: 0, opacity: 1, ease: 'back.out(1.6)' });
    this.onCleanup(breathe(this.next, 0.06, 1.6));
    const { news } = this.o;
    await voice.say(PHRASES.chapterDone);
    if (news.seal) await voice.say(PHRASES.newSeal);
    else if (news.keepsake) await voice.say(PHRASES.newKeepsake);
    if (news.card) await voice.say(PHRASES.newCard);
  }

  leave(): void {
    voice.stop();
  }
}

function sealButtonArt(color: string): string {
  return `<svg viewBox="-60 -60 120 120" width="220" height="220" aria-hidden="true"><circle r="54" fill="${color}"/><circle r="38" fill="none" stroke="rgba(255,240,220,.5)" stroke-width="4"/></svg>`;
}
