/**
 * The map: the Faraway Tree, the same every time, with the current land in
 * the cloud at the top and this land's 8 chapter stops up the trunk.
 *
 * The stops are the tree's own places (art/scenery.ts TREE_PLACES): the
 * door in the roots, Dame Washalot's tub, the Angry Pixie's window, Mr
 * Watzisname's branch, Silky's door, Mr Oom Boom Boom's ledge, the ladder
 * and Moon-Face's room. Each has a small wax tag: a tick when done, a play
 * seal on the one to play next (the only thing that glows), a number when
 * locked. Finished lands' seals hang from branch tips on strings.
 *
 * Around the edge: the land's name (top right, clear of the cloud), Practice
 * with Silky (bottom left), Moon-Face's Treasure Room (bottom right), and,
 * when there are other lands to visit, the slippery-slip down to the
 * previous land and the ladder up to the next.
 *
 * The first time a land arrives, the cloud parts and the new land settles
 * into it (not in calm mode, where it is simply there).
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { landSeal } from '../art/keepsakes';
import { cloudBank } from '../art/lands/common';
import { C } from '../art/palette';
import { svg } from '../art/paper';
import { picturesReady, rasterHtml } from '../art/raster';
import { tree, TREE_HOOKS, TREE_PLACES, TREE_SPOTS } from '../art/scenery';
import { waxSeal } from '../art/ui';
import { ALL_CHAPTERS, LANDS, type Chapter } from '../core/curriculum';
import { landLine, PHRASES } from '../core/phrases';
import { currentIndex, isOpen, type Progress } from '../core/progress';
import { breathe, isCalm, pop, sm, stepped, wobble } from '../ui/anim';
import { banner, portraitButton, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

/** Where each place's wax tag sits, relative to the place's centre (clear of what is drawn there). */
const TAG_AT: Record<string, [number, number]> = {
  door: [52, 34],
  tub: [10, 46],
  pixie: [48, 40],
  watzisname: [62, 26],
  silky: [42, 40],
  oomboom: [70, 30],
  ladder: [40, 52],
  moonface: [-58, 34],
};

/** The tappable area round each place (stage px): every one is well over 72 px. */
const HIT: Record<string, [number, number]> = {
  door: [120, 140],
  tub: [140, 110],
  pixie: [130, 110],
  watzisname: [150, 110],
  silky: [100, 120],
  oomboom: [150, 120],
  ladder: [96, 160],
  moonface: [150, 116],
};

/** The furthest land he can visit: where he is, or as far as a grown-up unlocked. */
export function reachedLand(p: Progress): number {
  if (p.unlockAll) return LANDS.length;
  let n = ALL_CHAPTERS[currentIndex(p)].land;
  if (p.unlockedTo >= 0) n = Math.max(n, ALL_CHAPTERS[Math.min(p.unlockedTo, ALL_CHAPTERS.length - 1)].land);
  for (const c of ALL_CHAPTERS) if (p.chapters[c.id]?.done) n = Math.max(n, c.land);
  return n;
}

/** The land he is playing now (the next chapter's). */
export const currentLand = (p: Progress): number => ALL_CHAPTERS[currentIndex(p)].land;

// Which lands this device has already watched arrive, per profile. A small
// per-device memory: at worst a land arrives a second time on a new iPad.
const seenKey = (id: string) => `faraway-maths:land-seen:${id}`;
function landSeen(id: string): number {
  try {
    return Number(localStorage.getItem(seenKey(id))) || 0;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}
function markLandSeen(id: string, n: number): void {
  try {
    localStorage.setItem(seenKey(id), String(n));
  } catch {
    /* storage blocked: the land may arrive again, which is harmless */
  }
}

/** "Come back tomorrow" is said once a day, not on every visit to the map. */
let toldTomorrow = '';

export class MapScene extends Scene {
  private landN: number;
  private arriving = false;
  private backdrop!: HTMLElement;
  private bannerEl!: HTMLElement;
  private nextStop: HTMLElement | null = null;
  private practiceBtn!: HTMLElement;
  private limited = false;
  private puffs: HTMLElement[] = [];

  constructor(app: App, landN?: number) {
    super(app, 'map');
    this.landN = Math.max(1, Math.min(LANDS.length, landN ?? currentLand(app.progress)));
  }

  build(): void {
    const r = this.root;
    const p = this.app.progress;
    const land = LANDS[this.landN - 1];
    const now = Date.now();
    const next = currentIndex(p);
    const here = this.landN === currentLand(p);
    this.arriving = here && landSeen(this.app.profile.id) < this.landN;
    if (this.arriving) markLandSeen(this.app.profile.id, this.landN);
    const animate = this.arriving && !isCalm();

    // The tree, with the land in its cloud (or an empty cloud, for the land to arrive into).
    // Nothing in it moves, so it is one picture. Only when a land is arriving does the
    // land's group have to stay live SVG (arrive() drifts it down into the cloud).
    const art = tree('map-tree', { landN: this.landN });
    this.backdrop = h('div', { class: 'backdrop-wrap', html: animate ? art : rasterHtml(art) });
    r.append(this.backdrop);

    // Finished lands' seals, hung on strings from the branch tips (behind the stops).
    for (const n of [...p.seals].sort((a, b) => a - b)) {
      const hook = TREE_HOOKS[n - 1];
      if (hook) r.append(this.hangSeal(n, hook));
    }

    // The 8 stops.
    land.chapters.forEach((c, i) => {
      const index = ALL_CHAPTERS.indexOf(c);
      r.append(this.stop(c, i, index, next, now));
    });

    // The land's name, top right: off the land in the cloud.
    this.bannerEl = banner(land.title, { x: 900, y: 14, w: 268, h: 92, size: land.title.length > 18 ? 25 : 28, fill: C.cream });
    this.bannerEl.classList.add('map-banner');
    r.append(this.bannerEl);
    if (animate) this.closeCloud();

    // Practice with Silky and Moon-Face's Treasure Room, in the bottom corners, with their
    // labels kept above the iPad's home-indicator strip (the bottom ~20 px).
    this.practiceBtn = portraitButton(characterArt('silky'), { x: 22, y: 656, size: 108, aria: 'Practice with Silky', label: 'Practice', ring: C.teal });
    this.practiceBtn.dataset.name = 'map-practice';
    this.tap(this.practiceBtn, () => {
      sfx.tap();
      voice.stop();
      this.app.nav.practice();
    });
    const treasure = portraitButton(characterArt('moonface'), { x: 1050, y: 656, size: 108, aria: 'Treasure Room', label: 'Treasures', ring: C.gold, vb: '40 26 220 220' });
    treasure.dataset.name = 'map-album';
    this.tap(treasure, () => {
      sfx.tap();
      voice.stop();
      this.app.nav.album();
    });
    r.append(this.practiceBtn, treasure);
    if (this.limited) this.onCleanup(breathe(this.practiceBtn, 0.05, 1.8));

    // Other lands: down the slippery-slip to the one before, up the ladder to the next.
    if (this.landN > 1) {
      const slip = sealButton('back', { x: 262, y: 712, size: 88, color: C.wood, aria: 'Slide down to the land before', name: 'map-prev' });
      slip.classList.add('land-nav', 'slip');
      this.tap(slip, () => this.visit(this.landN - 1));
      r.append(slip);
    }
    if (this.landN < reachedLand(p)) {
      const up = sealButton('next', { x: 372, y: 58, size: 84, color: C.wood, aria: 'Climb up to the next land', name: 'map-next' });
      up.classList.add('land-nav', 'ladder');
      this.tap(up, () => this.visit(this.landN + 1));
      r.append(up);
    }
  }

  async enter(): Promise<void> {
    await picturesReady(this.root);
    const land = LANDS[this.landN - 1];
    if (this.arriving) {
      if (!isCalm()) await this.arrive();
      await voice.say(landLine(land.title));
    }
    if (this.limited && this.landN === currentLand(this.app.progress)) {
      const today = new Date().toDateString();
      if (toldTomorrow !== today) {
        toldTomorrow = today;
        void voice.say(PHRASES.comeBackTomorrow);
      }
    }
  }

  leave(): void {
    voice.stop();
  }

  // ---------------------------------------------------------------------------

  private stop(c: Chapter, i: number, index: number, next: number, now: number): HTMLElement {
    const p = this.app.progress;
    const placeAt = TREE_PLACES[i];
    const done = !!p.chapters[c.id]?.done;
    const open = isOpen(p, index, now);
    const isNext = index === next && !done;
    const [w, hh] = HIT[placeAt.id] ?? [120, 120];
    const label = `${c.title}${open ? '' : ' (locked)'}`;
    const el = h('button', { class: `map-stop at-${placeAt.id}${done ? ' done' : ''}`, 'aria-label': label });
    el.dataset.chapter = c.id;
    el.dataset.place = placeAt.id;
    place(el, placeAt.x - w / 2, placeAt.y - hh / 2, w, hh);

    // The glow (the next stop only) sits round the place itself.
    if (isNext && open) {
      const glow = h('div', { class: 'stop-glow' });
      el.append(glow);
      this.onCleanup(breathe(glow, 0.08, 1.8));
    }

    // The wax tag.
    const [tx, ty] = TAG_AT[placeAt.id] ?? [40, 40];
    const finale = c.kind === 'finale';
    const icon = done ? 'tick' : finale ? 'treasure' : 'play';
    const size = isNext && open ? 64 : 50;
    const colour = done ? C.gold : open ? C.red : C.slate;
    const tag = place(h('div', { class: 'stop-tag', html: waxSeal(open || done ? icon : 'play', colour, size, `tag-${c.id}-${icon}`) }), w / 2 + tx - size / 2, hh / 2 + ty - size / 2, size, size);
    if (!open && !done) tag.classList.add('shut');
    tag.append(h('span', { class: 'stop-n' }, String(c.n)));
    el.append(tag);

    if (!open) el.classList.add('locked');
    if (isNext && open) {
      el.classList.add('is-next');
      this.nextStop = el;
      this.onCleanup(breathe(tag, 0.08, 1.8));
    }
    // Today's new chapters are used up: say so on the stop he'd play next.
    const limited = index === next && !open && !done && !p.unlockAll;
    if (limited) {
      this.limited = true;
      el.classList.add('tomorrow');
      const note = h('div', { class: 'tomorrow-tag' }, [h('span', { class: 'moon', 'aria-hidden': 'true' }), h('span', {}, 'Come back tomorrow')]);
      place(note, w / 2 - 110, hh + 2, 220);
      el.append(note);
    }

    this.tap(el, () => {
      if (!open) {
        sfx.wrong();
        void wobble(el);
        if (this.limited) void voice.say(PHRASES.comeBackTomorrow);
        // Point at the one to play instead.
        else if (this.nextStop) void pop(this.nextStop, 1.08);
        return;
      }
      sfx.tap();
      voice.stop();
      this.app.nav.chapter(c.id);
    });
    return el;
  }

  /** A finished land's seal, hanging on a string from a branch tip. Tap it to hear the land. */
  private hangSeal(n: number, hook: { x: number; y: number }): HTMLElement {
    const land = LANDS[n - 1];
    const size = 80;
    const drop = 34;
    const el = h('button', { class: 'tree-seal', 'aria-label': `${land.title} seal` });
    place(el, hook.x - size / 2, hook.y, size, size + drop);
    el.append(place(h('div', { class: 'seal-string' }), size / 2 - 1.5, 0, 3, drop + 8));
    el.append(place(h('div', { class: 'seal-knot' }), size / 2 - 6, -6, 12, 12));
    el.append(place(h('div', { class: 'seal-art', html: landSeal(n) }), 0, drop, size, size));
    el.dataset.land = String(n);
    this.tap(el, () => {
      sfx.sparkle();
      void pop(el, 1.08);
      void voice.say(land.title);
    });
    return el;
  }

  /** Down the slippery-slip, or up the ladder, to another land. */
  private visit(n: number): void {
    sfx.whoosh();
    voice.stop();
    void this.app.go(new MapScene(this.app, n), 'fade');
  }

  /** The land's group inside the tree picture (so it can move without leaving the tree's layers). */
  private landGroup(): SVGGElement | null {
    const box = TREE_SPOTS.cloud;
    return this.backdrop.querySelector<SVGGElement>(`g[transform="translate(${box.x} ${box.y})"]`);
  }

  /** Before the land arrives: the cloud is closed and the land is not there yet. */
  private closeCloud(): void {
    const box = TREE_SPOTS.cloud;
    const g = this.landGroup();
    if (g) g.style.opacity = '0';
    const puff = (side: 'l' | 'r') =>
      place(
        h('div', {
          class: `arrive-cloud ${side}`,
          html: svg({ w: 440, h: 230, name: 'arrive-' + side, boil: false }, [
            ...cloudBank(220, 66, 380, side === 'l' ? 3 : 4),
            ...cloudBank(220, 124, 440, side === 'l' ? 5 : 6),
            ...cloudBank(220, 180, 400, side === 'l' ? 7 : 8),
          ]),
        }),
        side === 'l' ? box.x - 60 : box.x + box.w / 2 - 80,
        box.y - 30,
        440,
        230,
      );
    this.puffs = [puff('l'), puff('r')];
    for (const p of this.puffs) this.root.insertBefore(p, this.bannerEl);
  }

  /**
   * A new land arrives: the cloud parts, and the land drifts down into it
   * and settles. About three seconds.
   */
  private async arrive(): Promise<void> {
    const box = TREE_SPOTS.cloud;
    const g = this.landGroup();
    const [left, right] = this.puffs;
    void sm(this.bannerEl, 0.6, { startAt: { scaleX: 0.3, opacity: 0 }, scaleX: 1, opacity: 1, ease: 'back.out(1.6)' });
    await this.sleep(600);
    sfx.whoosh();
    void sm(left, 1.8, { x: -380, opacity: 0, ease: 'power1.inOut' });
    void sm(right, 1.8, { x: 380, opacity: 0, ease: 'power1.inOut' });
    await this.sleep(500);
    if (g) {
      sfx.reveal();
      const drift = { dy: -60, o: 0 };
      const draw = () => {
        g.setAttribute('transform', `translate(${box.x} ${box.y + drift.dy})`);
        g.style.opacity = String(drift.o);
      };
      draw();
      await new Promise<void>((resolve) =>
        gsap.to(drift, { dy: 0, o: 1, duration: 1.6, ease: stepped(1.6, 'back.out(1.5)'), onUpdate: draw, onComplete: resolve, onInterrupt: resolve }),
      );
    }
    await this.sleep(400);
    left.remove();
    right.remove();
  }
}
