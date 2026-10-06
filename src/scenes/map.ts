/**
 * The map: the Faraway Tree, the same every time, with the current land in
 * the cloud at the top and this land's 8 chapter stops up the trunk. One
 * stop glows: the next one to play.
 *
 * SCAFFOLD: stops are simple numbered seals on the shared tree backdrop.
 * W4 builds the full map: doors and windows as stops (Dame Washalot's tub,
 * the Angry Pixie's window, Moon-Face's room), land seals hung on the
 * branches, the land's own art in the cloud, Practice with Silky, the
 * Treasure Room and the slippery-slip back down.
 */
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { C } from '../art/palette';
import { treeDusk } from '../art/scenery';
import { ALL_CHAPTERS, LANDS } from '../core/curriculum';
import { landLine, PHRASES } from '../core/phrases';
import { currentIndex, isOpen } from '../core/progress';
import { breathe, wobble } from '../ui/anim';
import { banner, sealButton } from '../ui/components';
import { h } from '../ui/dom';
import { Scene } from '../ui/scene';

/** Where the 8 stops sit on the tree (bottom to top). */
const STOPS: [number, number][] = [
  [560, 690],
  [430, 600],
  [640, 540],
  [330, 440],
  [700, 400],
  [460, 320],
  [820, 260],
  [560, 170],
];

export class MapScene extends Scene {
  private landN: number;

  constructor(app: ConstructorParameters<typeof Scene>[0], landN?: number) {
    super(app, 'map');
    const p = app.progress;
    this.landN = landN ?? ALL_CHAPTERS[currentIndex(p)].land;
  }

  build(): void {
    const r = this.root;
    const p = this.app.progress;
    const land = LANDS[this.landN - 1];
    const now = Date.now();
    const next = currentIndex(p);
    r.append(h('div', { class: 'backdrop-wrap', html: treeDusk('map-tree', { landColor: land.color }) }));
    r.append(banner(land.title, { x: 330, y: 20, w: 520, h: 84, size: 38, fill: C.cream }));

    land.chapters.forEach((c, i) => {
      const index = ALL_CHAPTERS.indexOf(c);
      const done = !!p.chapters[c.id]?.done;
      const open = isOpen(p, index, now);
      const [x, y] = STOPS[i];
      const size = c.kind === 'finale' ? 120 : 96;
      const color = done ? C.gold : open ? C.red : C.slate;
      const stop = sealButton(done ? 'tick' : c.kind === 'finale' ? 'treasure' : 'play', {
        x: x - size / 2,
        y: y - size / 2,
        size,
        color,
        aria: `${c.title}${open ? '' : ' (locked)'}`,
        name: 'stop-' + c.id,
      });
      stop.dataset.chapter = c.id;
      stop.classList.add('map-stop');
      if (!open) stop.classList.add('locked');
      stop.append(h('span', { class: 'stop-n' }, String(c.n)));
      this.tap(stop, () => {
        if (!open) {
          sfx.wrong();
          void wobble(stop);
          if (index === next) void voice.say(PHRASES.comeBackTomorrow);
          return;
        }
        sfx.tap();
        voice.stop();
        this.app.nav.chapter(c.id);
      });
      if (index === next && open) {
        stop.classList.add('is-next');
        this.onCleanup(breathe(stop, 0.07, 1.4));
      }
      r.append(stop);
    });

    // Lands either side (only ones he has reached).
    const reached = ALL_CHAPTERS[next].land;
    if (this.landN > 1) {
      const prev = sealButton('back', { x: 30, y: 700, size: 84, color: C.slate, aria: 'Previous land', name: 'map-prev' });
      this.tap(prev, () => this.app.go(new MapScene(this.app, this.landN - 1), 'fade'));
      r.append(prev);
    }
    if (this.landN < reached || p.unlockAll) {
      if (this.landN < LANDS.length) {
        const nxt = sealButton('next', { x: 1066, y: 700, size: 84, color: C.slate, aria: 'Next land', name: 'map-next' });
        this.tap(nxt, () => this.app.go(new MapScene(this.app, this.landN + 1), 'fade'));
        r.append(nxt);
      }
    }

    const practice = sealButton('again', { x: 1060, y: 140, size: 96, color: C.teal, aria: 'Practice with Silky', name: 'map-practice', label: 'Practice' });
    this.tap(practice, () => {
      sfx.tap();
      this.app.nav.practice();
    });
    const album = sealButton('cards', { x: 1060, y: 280, size: 96, color: C.plum, aria: 'Treasure Room', name: 'map-album', label: 'Treasures' });
    this.tap(album, () => {
      sfx.tap();
      this.app.nav.album();
    });
    r.append(practice, album);
  }

  enter(): void {
    const land = LANDS[this.landN - 1];
    const firstVisit = land.chapters.every((c) => !this.app.progress.chapters[c.id]?.done);
    if (firstVisit && this.landN === ALL_CHAPTERS[currentIndex(this.app.progress)].land) void voice.say(landLine(land.title));
  }

  leave(): void {
    voice.stop();
  }
}
