/**
 * Moon-Face's Treasure Room: everything he has found, kept in Moon-Face's
 * round room at the top of the tree.
 *
 *   Keepsakes  one shelf per land, 8 keepsakes each; ones still to find
 *              are dark silhouettes, so he can see what's coming
 *   Cards      the Folk cards, a "?" for ones not met yet
 *   Seals      a seal for every land
 *   Stories    every story he has unlocked, to watch again
 *
 * Four big tabs down the left, always in the same order. Tapping a
 * treasure holds it up close and says its name.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { activeProfile, JASPER } from '../cloud/api';
import { keepsakeArt, landSeal } from '../art/keepsakes';
import { C } from '../art/palette';
import { circle, ellipse, ink, piece, rect, svg } from '../art/paper';
import { picturesReady, rasterHtml } from '../art/raster';
import { waxSeal } from '../art/ui';
import { ALL_CHAPTERS, ENDING_AFTER, findChapter, LANDS, type Chapter } from '../core/curriculum';
import { CHARACTER_NAMES } from '../core/names';
import { pop, sm } from '../ui/anim';
import { banner, crop, folkCard, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';
import { keepsakeName } from './complete';
import { currentLand } from './map';
import { hasStory } from './story';

type Tab = 'keepsakes' | 'cards' | 'seals' | 'stories';
const TABS: { id: Tab; label: string }[] = [
  { id: 'keepsakes', label: 'Keepsakes' },
  { id: 'cards', label: 'Cards' },
  { id: 'seals', label: 'Seals' },
  { id: 'stories', label: 'Stories' },
];

/** Every Folk card, in the order he meets them. */
export const CARD_HOSTS: string[] = [...new Set(ALL_CHAPTERS.map((c) => c.host))];

/** The tab he was last on, so coming back from a story lands where he was. */
let lastTab: Tab = 'keepsakes';

/** Opens the Treasure Room on its Stories tab (the title's Stories button). */
export function openOnStories(): void {
  lastTab = 'stories';
}

/**
 * Keepsakes and seals on the shelves are shown as pictures, not live SVG: 80
 * of them is over a thousand paths to keep and repaint while he scrolls. A
 * tenth of margin all round keeps any paper that overhangs its box.
 */
const PAD = 0.1;

/** Moon-Face's room: warm round wooden walls, a round window on the night, a rug. */
function room(): string {
  const planks = Array.from({ length: 13 }, (_, i) => ink([[i * 96 + 20, -10], [i * 96 + 12, 840]], { width: 3, color: C.barkDark, opacity: 0.35, wobble: 1.2 }));
  return svg({ w: 1180, h: 820, name: 'treasure-room', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.barkLight, { edge: 'clean', shadow: false }),
    ...planks,
    piece(ellipse(590, -40, 760, 150), C.bark, { shadow: true, opacity: 0.6 }),
    // The round window, with the moon and stars outside.
    piece(circle(1090, 92, 70), C.barkDark),
    piece(circle(1090, 92, 58), C.night, { edge: 'cut', fibre: false }),
    piece(circle(1108, 76, 18), C.goldLight, { edge: 'cut', fibre: false }),
    piece(circle(1116, 70, 15), C.night, { edge: 'cut', fibre: false, shadow: false }),
    ...[[1060, 60], [1070, 120], [1112, 126]].map(([x, y]) => piece(circle(x, y, 2.5), C.cream, { edge: 'clean', shadow: false })),
    ink([[1032, 92], [1148, 92]], { width: 6, color: C.barkDark }),
    ink([[1090, 34], [1090, 150]], { width: 6, color: C.barkDark }),
    // A round rug on the floor.
    piece(ellipse(620, 840, 520, 70), C.rose, { opacity: 0.8 }),
    piece(ellipse(620, 840, 440, 50), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
  ]);
}

export class AlbumScene extends Scene {
  private body!: HTMLElement;
  private tabs = new Map<Tab, HTMLButtonElement>();
  private zoom: HTMLElement | null = null;

  build(): void {
    const r = this.root;
    r.classList.add('album');
    r.append(h('div', { class: 'backdrop-wrap', html: rasterHtml(room()) }));
    r.append(banner('Moon-Face’s Treasure Room', { x: 290, y: 14, w: 640, h: 92, size: 40 }));

    const back = sealButton('map', { x: 92, y: 16, size: 76, color: C.slate, aria: 'Back to the map', name: 'album-back' });
    this.tap(back, () => {
      sfx.tap();
      voice.stop();
      this.app.nav.map();
    });
    r.append(back);

    // The four tabs, down the left.
    TABS.forEach((t, i) => {
      const b = h('button', { class: 'treasure-tab', 'aria-label': t.label, 'data-tab': t.id }) as HTMLButtonElement;
      b.innerHTML = `<div class="tab-icon">${this.tabIcon(t.id)}</div><span>${t.label}</span>`;
      place(b, 18, 140 + i * 162, 128, 144);
      this.tap(b, () => {
        if (lastTab === t.id) return;
        sfx.page();
        this.show(t.id);
      });
      r.append(b);
      this.tabs.set(t.id, b);
    });

    this.body = place(h('div', { class: 'treasure-body' }), 162, 124, 1010, 690);
    r.append(this.body);
    this.show(lastTab);
  }

  /** Waits for the pictures to decode, so the room never shows up bare and then fills in. */
  async enter(): Promise<void> {
    await picturesReady(this.root);
  }

  leave(): void {
    voice.stop();
  }

  private tabIcon(t: Tab): string {
    if (t === 'keepsakes') return rasterHtml(keepsakeArt(ALL_CHAPTERS[0].keepsake), PAD);
    if (t === 'cards') return folkCard(characterArt('moonface'), '', { w: 58 }).outerHTML;
    if (t === 'seals') return rasterHtml(landSeal(1), PAD);
    return waxSeal('play', C.red, 80, 'tab-stories');
  }

  private show(t: Tab): void {
    lastTab = t;
    this.tabs.forEach((b, k) => b.classList.toggle('on', k === t));
    this.body.innerHTML = '';
    this.body.scrollTop = 0;
    this.body.dataset.tab = t;
    ({ keepsakes: () => this.keepsakes(), cards: () => this.cards(), seals: () => this.seals(), stories: () => this.stories() })[t]();
  }

  // ---------------------------------------------------------------------------

  /**
   * One shelf per land, 8 keepsakes on each. Opens at the land he's in.
   *
   * There are 112 pictures, and drawing and decoding them all before the
   * room shows took seconds on an older iPad. So the shelves he can see
   * (the land he's in, and the ones beside it) are filled in at once, and
   * the rest a shelf at a time just after. The buttons are all there from
   * the start, so nothing moves when a picture arrives.
   */
  private keepsakes(): void {
    const p = this.app.progress;
    const here = currentLand(p);
    const fills: { n: number; items: [HTMLElement, string][] }[] = [];
    for (const land of LANDS) {
      const shelf = h('div', { class: 'shelf-row', 'data-land': String(land.n) });
      shelf.append(h('div', { class: 'shelf-name' }, land.title));
      const items = h('div', { class: 'shelf-items' });
      const mine: [HTMLElement, string][] = [];
      for (const c of land.chapters) {
        const have = p.keepsakes.includes(c.keepsake);
        const name = keepsakeName(c.keepsake);
        const b = h('button', { class: `keepsake-item${have ? '' : ' missing'}`, 'aria-label': have ? name : 'Not found yet', 'data-id': c.keepsake });
        this.tap(b, () => (have ? this.hold(name, keepsakeArt(c.keepsake), 'keepsake', c) : this.notYet(b)));
        items.append(b);
        mine.push([b, c.keepsake]);
      }
      fills.push({ n: land.n, items: mine });
      shelf.append(items, h('div', { class: 'shelf-plank' }));
      this.body.append(shelf);
    }
    // Nearest shelves first; the first three before the room shows.
    fills.sort((a, b) => Math.abs(a.n - here) - Math.abs(b.n - here) || a.n - b.n);
    fills.forEach((f, i) => {
      const fill = () => f.items.forEach(([b, id]) => this.body.contains(b) && (b.innerHTML = rasterHtml(keepsakeArt(id), PAD)));
      if (i < 3) fill();
      else this.later(60 * (i - 2), fill);
    });
    // Once on screen (layout is only known then), open at the shelf of the land he's in.
    const scroll = () => {
      const here = this.body.querySelector<HTMLElement>(`.shelf-row[data-land="${currentLand(p)}"]`);
      if (here && currentLand(p) > 1) this.body.scrollTop = Math.max(0, here.offsetTop - 300);
    };
    requestAnimationFrame(scroll);
  }

  private cards(): void {
    const p = this.app.progress;
    const grid = h('div', { class: 'card-grid' });
    for (const id of CARD_HOSTS) {
      const have = p.cards.includes(id);
      const name = CHARACTER_NAMES[id] ?? id;
      const b = h('button', { class: 'card-item', 'aria-label': have ? name : 'Not met yet', 'data-id': id });
      b.append(folkCard(have ? characterArt(id) : '', name, { w: 132, locked: !have }));
      this.tap(b, () => (have ? this.hold(name, characterArt(id), 'card') : this.notYet(b)));
      grid.append(b);
    }
    this.body.append(grid);
  }

  private seals(): void {
    const p = this.app.progress;
    const grid = h('div', { class: 'seal-grid' });
    for (const land of LANDS) {
      const have = p.seals.includes(land.n);
      const b = h('button', { class: `seal-item${have ? '' : ' missing'}`, 'aria-label': have ? `${land.title} seal` : 'Not won yet', 'data-land': String(land.n) });
      b.append(h('div', { class: 'seal-pic', html: rasterHtml(landSeal(land.n), PAD) }), h('span', {}, have ? land.short : '?'));
      this.tap(b, () => (have ? this.hold(land.title, landSeal(land.n), 'seal') : this.notYet(b)));
      grid.append(b);
    }
    this.body.append(grid);
  }

  /**
   * Every story he has unlocked: the opening, each finished chapter's, the
   * finales and the ending. When a grown-up has unlocked every chapter, every
   * story is here too, so he can watch them all. Jasper has every story
   * open, whatever he has played (his grown-up asked for it).
   */
  private stories(): void {
    const p = this.app.progress;
    const all = p.unlockAll || activeProfile().id === JASPER;
    const done = (id: string): boolean => all || !!p.chapters[id]?.done;
    let any = false;
    if ((p.seenOpening || all) && hasStory('opening')) {
      this.body.append(this.storyGroup('The beginning', [this.storyTile('opening', 'Up the Faraway Tree', 'moonface', LANDS[0].color)]));
      any = true;
    }
    // The ending film sits after Dame Snap's Prison, before the second adventure.
    const end = findChapter(ENDING_AFTER)!;
    for (const land of LANDS) {
      const tiles = land.chapters.filter((c) => done(c.id) && hasStory(c.id)).map((c) => this.storyTile(c.id, c.title, c.host, land.color, c.kind === 'finale'));
      if (tiles.length) {
        this.body.append(this.storyGroup(land.title, tiles));
        any = true;
      }
      if (land === end.land && done(end.chapter.id) && hasStory('ending')) {
        this.body.append(this.storyGroup('The end', [this.storyTile('ending', 'The Biggest Birthday', 'moonface', land.color)]));
      }
    }
    if (!any) this.body.append(h('p', { class: 'treasure-empty' }, 'Finish a chapter, and its story will be kept here to watch again.'));
  }

  private storyGroup(title: string, tiles: HTMLElement[]): HTMLElement {
    return h('div', { class: 'story-group' }, [h('div', { class: 'shelf-name' }, title), h('div', { class: 'story-tiles' }, tiles)]);
  }

  private storyTile(id: string, title: string, host: string, color: string, finale = false): HTMLElement {
    const b = h('button', { class: `story-tile${finale ? ' finale' : ''}`, 'aria-label': `Watch ${title}`, 'data-story': id, style: `--land:${color}` });
    b.append(h('div', { class: 'story-face', html: crop(characterArt(host)) }), h('div', { class: 'story-title' }, title), h('div', { class: 'story-play', html: waxSeal('play', C.red, 54, 'st-' + id) }));
    this.tap(b, () => {
      sfx.tap();
      voice.stop();
      this.app.nav.story(id, () => this.app.nav.album());
    });
    return b;
  }

  // ---------------------------------------------------------------------------

  private notYet(el: HTMLElement): void {
    sfx.tap();
    void pop(el, 0.94);
  }

  /** Holds a treasure up close and says its name. Tap anywhere to put it back. */
  private hold(name: string, art: string, kind: 'keepsake' | 'card' | 'seal', chapter?: Chapter): void {
    if (this.zoom) return;
    sfx.reveal();
    void voice.say(name);
    const veil = h('div', { class: 'veil treasure-zoom' });
    const big = kind === 'card' ? folkCard(art, name, { w: 300 }) : h('div', { class: 'zoom-art', html: art });
    const [w, hh] = kind === 'card' ? [300, 420] : [340, 340];
    const holder = place(h('div', { class: 'zoom' }), 590 - w / 2, kind === 'card' ? 110 : 150, w, hh);
    holder.append(big);
    veil.append(holder);
    if (kind !== 'card') veil.append(place(h('div', { class: 'reward-name zoom-name' }, name), 190, 520, 800));
    veil.append(sealButton('close', { x: 1060, y: 30, size: 90, color: C.slate, aria: 'Close', name: 'album-close' }));
    // A keepsake's chapter story can be watched again from here.
    let watch: HTMLElement | null = null;
    if (chapter && hasStory(chapter.id)) {
      watch = sealButton('play', { x: 900, y: 360, size: 130, color: C.red, aria: 'Watch the story', name: 'album-watch' });
      veil.append(watch);
      this.tap(watch, () => {
        sfx.tap();
        voice.stop();
        this.app.nav.story(chapter.id, () => this.app.nav.album());
      });
    }
    this.root.append(veil);
    this.zoom = veil;
    gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    void sm(holder, 0.4, { startAt: { scale: 0.3, rotation: -10 }, scale: 1, rotation: 0, ease: 'back.out(1.7)' });
    this.tap(veil, (e) => {
      if (watch && e.target instanceof Node && watch.contains(e.target)) return;
      sfx.tap();
      voice.stop();
      veil.remove();
      this.zoom = null;
    });
  }
}
