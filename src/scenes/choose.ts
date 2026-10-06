/** Choose who to climb with: Beth, Joe or Fran. Then the opening film, the first time. */
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { parchment } from '../art/ui';
import { AVATARS, type Avatar } from '../core/curriculum';
import { PHRASES } from '../core/phrases';
import { pop, sm } from '../ui/anim';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

export const AVATAR_NAMES: Record<Avatar, string> = { beth: 'Beth', joe: 'Joe', fran: 'Fran' };

export class ChooseScene extends Scene {
  private cards: HTMLElement[] = [];
  private chosen = false;

  build(): void {
    const r = this.root;
    r.classList.add('choose');
    r.append(place(h('div', { class: 'big-title', style: 'font-size:60px' }, 'Who will you climb with?'), 0, 50));
    AVATARS.forEach((a, i) => {
      const card = h('button', { class: 'choose-card', 'aria-label': AVATAR_NAMES[a], html: parchment(300, 460, 'choose-' + a, C.cream, 1.2) });
      card.append(h('div', { class: 'choose-portrait', html: characterArt(a) }), h('div', { class: 'choose-name' }, AVATAR_NAMES[a]));
      place(card, 110 + i * 340, 190, 300, 460);
      this.tap(card, () => void this.pick(a, card));
      this.cards.push(card);
      r.append(card);
    });
  }

  enter(): void {
    void sm(this.cards, 0.4, { startAt: { y: 200, opacity: 0 }, y: 0, opacity: 1, stagger: 0.1, ease: 'back.out(1.4)' });
    void voice.say(PHRASES.choose);
  }

  private async pick(a: Avatar, card: HTMLElement): Promise<void> {
    if (this.chosen) return;
    this.chosen = true;
    sfx.sparkle();
    void pop(card, 1.08);
    await voice.say(PHRASES[a]);
    this.app.progress.avatar = a;
    this.app.save();
    if (!this.app.progress.seenOpening) {
      this.app.nav.story('opening', () => {
        this.app.progress.seenOpening = true;
        this.app.save();
        this.app.nav.map();
      });
    } else this.app.nav.map();
  }
}
