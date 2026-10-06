/**
 * Title: the Faraway Tree at dusk, and one big wax-seal Play button.
 *
 * SCAFFOLD: W4 makes this the full title (lit windows flickering, the
 * slippery-slip, Moon-Face waving from the top).
 */
import { unlock } from '../audio/engine';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { C } from '../art/palette';
import { treeDusk } from '../art/scenery';
import { LANDS } from '../core/curriculum';
import { PHRASES } from '../core/phrases';
import { currentIndex } from '../core/progress';
import { ALL_CHAPTERS } from '../core/curriculum';
import { requestPersistence } from '../save/local';
import { breathe, sm } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

export class TitleScene extends Scene {
  private play!: HTMLButtonElement;
  private going = false;

  build(): void {
    const r = this.root;
    r.classList.add('title');
    const land = LANDS[ALL_CHAPTERS[currentIndex(this.app.progress)].land - 1];
    r.append(h('div', { class: 'backdrop-wrap', html: treeDusk('title-tree', { landColor: land.color }) }));
    r.append(place(h('div', { class: 'big-title', style: 'font-size:92px' }, 'Up the Faraway Tree'), 0, 180));
    r.append(place(h('div', { class: 'big-title sub' }, 'a maths adventure'), 0, 290));
    this.play = sealButton('play', { x: 505, y: 560, size: 170, color: C.red, aria: 'Play', name: 'title-play' });
    this.tap(this.play, () => void this.go());
    r.append(this.play);
    this.onCleanup(breathe(this.play, 0.05, 2.2));
  }

  enter(): void {
    void sm(this.play, 0.5, { startAt: { scale: 0, rotation: -40 }, scale: 1, rotation: 0, ease: 'back.out(1.8)' });
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
