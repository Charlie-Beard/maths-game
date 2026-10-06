/**
 * Moon-Face's Treasure Room: keepsakes, Folk cards, land seals, and every
 * story he has unlocked, to watch again.
 *
 * SCAFFOLD: a simple list of unlocked stories. W4 builds the room.
 */
import { sfx } from '../audio/sfx';
import { C } from '../art/palette';
import { ALL_CHAPTERS } from '../core/curriculum';
import { banner, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';
import { hasStory } from './story';

export class AlbumScene extends Scene {
  build(): void {
    const r = this.root;
    r.classList.add('album');
    r.append(banner('Moon-Face’s Treasure Room', { x: 240, y: 24, w: 700, h: 96, size: 42 }));
    const p = this.app.progress;
    const list = place(h('div', { class: 'album-list' }), 120, 150, 940, 600);
    if (p.seenOpening && hasStory('opening')) list.append(this.storyButton('opening', 'The Opening'));
    for (const c of ALL_CHAPTERS) if (p.chapters[c.id]?.done && hasStory(c.id)) list.append(this.storyButton(c.id, c.title));
    if (!list.children.length) list.append(h('p', { class: 'album-empty' }, 'Finish a chapter to see its story here.'));
    list.append(h('p', { class: 'album-count' }, `Keepsakes: ${p.keepsakes.length} · Cards: ${p.cards.length} · Land seals: ${p.seals.length}`));
    r.append(list);

    const back = sealButton('map', { x: 30, y: 24, size: 80, color: C.slate, aria: 'Back to the map' });
    this.tap(back, () => {
      sfx.tap();
      this.app.nav.map();
    });
    r.append(back);
  }

  private storyButton(id: string, title: string): HTMLElement {
    const b = h('button', { class: 'album-story' }, title);
    this.tap(b, () => {
      sfx.tap();
      this.app.nav.story(id, () => this.app.nav.album());
    });
    return b;
  }
}
