/**
 * A land's finale (docs/PLAN.md §4 "Land finales"): the chapter's problems
 * on the same problem screen, inside a set piece, like Wizard Words'
 * Battle of Hogwarts.
 *
 * The rule: nothing moves while he's thinking. The problem screen (the
 * desk, a torn parchment sheet) covers the middle of the stage; the set
 * piece frames it, still, at the edges, with a strip at the right showing
 * how far he's got. After each right answer the desk slides away, the set
 * piece plays one beat of drama, and the desk comes back with the next
 * problem. The opening and the climax play the same way.
 *
 *   climb   the hero and the Folk climb the trunk, a stage per answer, and
 *           at the top Moon-Face's door opens
 *   escape  down the ladder one rung per answer while the clouds swirl
 *           closer (never catching them); the last answer is a leap onto
 *           the tree as the land drifts away
 *   snap    Dame Snap at her board: each answer cracks a rule, unlocks a
 *           cage or snaps a ruler, and she gets crosser, until she storms
 *           off (lands 4, 7) or is beaten for good (land 10)
 *
 * Wrong answers never make anything worse: the drama only follows right
 * answers, and there is no timer. Each land's look and lines are in
 * finale-lands.ts.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { fx, musicBed, type MusicBed } from '../audio/synth';
import { voice } from '../audio/voice';
import { characterArt, dameSnapPose, type SnapPose } from '../art/characters';
import { LAND_ART } from '../art/lands';
import { C } from '../art/palette';
import { tree, TREE_PLACES } from '../art/scenery';
import { parchment } from '../art/ui';
import { isCalm, sm, stepped } from '../ui/anim';
import { h, place, wait } from '../ui/dom';
import type { App } from '../ui/scene';
import {
  balloonArt,
  BRANCH,
  boardArt,
  cageBars,
  crackArt,
  cupboardArt,
  cupboardDoor,
  doorArt,
  dripArt,
  escapeBackdrop,
  LADDER,
  ladderArt,
  padlockArt,
  rulerHalf,
  STRIP,
  stripArt,
  stripStops,
  swirlCloud,
} from './finale-art';
import { finaleFor, FINALE_LINES, waveLine, type FinaleLand, type SnapWave } from './finale-lands';
import { PlayScene, type PlayOptions } from './play';

/** Races a voice line against a timeout, so a stuck clip never stalls the show. */
const capped = (p: Promise<void>, ms: number): Promise<void> => Promise.race([p, wait(ms)]);

/** Where a puppet stands (gsap transform values). */
interface Spot {
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  opacity?: number;
  rotation?: number;
  delay?: number;
}

/** A character portrait (300 × 340) in a box. */
function puppet(id: string, cls: string, x: number, y: number, w: number): HTMLElement {
  return place(h('div', { class: `finale-puppet ${cls}`, html: characterArt(id) }), x, y, w, Math.round((w * 340) / 300));
}

/** One item on Dame Snap's board. */
interface BoardItem {
  el: HTMLElement;
  wave: SnapWave;
  /** Plays it breaking (cracked, unlocked or snapped). */
  breakIt: () => Promise<void>;
}

export class FinaleScene extends PlayScene {
  private cfg: FinaleLand;
  /** Stages in the set piece: one per planned problem. */
  private steps: number;
  /** How far they've got (0 … steps). */
  private stage = 0;
  private beatNo = 0;
  private set!: HTMLElement;
  private strip!: HTMLElement;
  private stripToken: HTMLElement | null = null;
  private pips: HTMLElement[] = [];
  private deskDown = false;
  private bed: MusicBed | null = null;
  private heroId: string;

  // climb and escape
  private climbers: HTMLElement[] = [];
  // climb
  private door!: HTMLElement;
  private moon!: HTMLElement;
  // escape
  private land!: HTMLElement;
  private clouds: HTMLElement[] = [];
  private chaser: HTMLElement[] = [];
  // snap
  private board!: HTMLElement;
  private boardHead!: HTMLElement;
  private boardItems!: HTMLElement;
  private items: BoardItem[] = [];
  private snap!: HTMLElement;
  private cupboard: HTMLElement | null = null;
  private cupDoor: HTMLElement | null = null;

  constructor(app: App, o: PlayOptions) {
    super(app, o);
    this.cfg = finaleFor(o.land.n);
    this.steps = Math.max(1, o.chapter?.problems ?? o.problems.length);
    this.heroId = app.progress.avatar ?? 'joe';
    this.root.classList.add('finale', `finale-${this.cfg.mode}`);
    this.root.dataset.finale = this.cfg.mode;
  }

  build(): void {
    super.build();
    this.set = h('div', { class: 'finale-set' });
    this.root.insertBefore(this.set, this.desk);

    // The desk: a parchment sheet over the middle, leaving the edges to the set piece.
    const panel = place(h('div', { class: 'finale-panel', html: parchment(910, 860, 'finale-desk-' + this.cfg.n) }), 135, -20, 910, 860);
    this.strip = place(h('div', { class: 'finale-strip' }), STRIP.x, STRIP.y, STRIP.w, STRIP.h);
    this.desk.prepend(panel, this.strip);

    if (this.cfg.mode === 'climb') this.buildClimb();
    else if (this.cfg.mode === 'escape') this.buildEscape();
    else this.buildSnap();
    this.placeStrip();

    // The desk starts away: the set piece opens the show.
    this.deskDown = true;
    gsap.set(this.desk, isCalm() ? { opacity: 0 } : { y: 880 });
  }

  async enter(): Promise<void> {
    void voice.preload({ lines: FINALE_LINES });
    try {
      this.bed = musicBed(this.cfg.mood);
    } catch {
      this.bed = null;
    }
    this.set.classList.remove('still');
    if (this.cfg.mode === 'climb') await this.openClimb();
    else if (this.cfg.mode === 'escape') await this.openEscape();
    else await this.openSnap();
    if (!this.alive) return;
    await this.say(this.cfg.lines.start, 5000);
    await this.sleep(300);
    if (!this.alive) return;
    void super.enter();
  }

  leave(): void {
    this.bed?.stop();
    super.leave();
  }

  destroy(): void {
    this.bed?.stop();
    super.destroy();
  }

  /** Brings the desk back (and stills the set piece) before every problem. */
  protected async beforeProblem(): Promise<void> {
    this.bed?.stop();
    this.bed = null;
    this.placeStrip();
    this.set.classList.add('still');
    if (!this.deskDown) return;
    this.deskDown = false;
    if (isCalm()) await sm(this.desk, 0.25, { opacity: 1 });
    else await sm(this.desk, 0.55, { y: 0, ease: 'power2.out' });
  }

  /** One beat of drama after a right answer; the climax after the last. */
  protected async afterRight(i: number, last: boolean): Promise<void> {
    const s = last ? this.steps : Math.min(i + 1, this.steps - 1);
    const moved = s > this.stage;
    await this.deskAway();
    if (!this.alive) return;
    this.set.classList.remove('still');
    const prev = this.stage;
    this.stage = s;
    if (last) {
      if (this.cfg.mode === 'climb') await this.endClimb();
      else if (this.cfg.mode === 'escape') await this.endEscape();
      else await this.endSnap(prev);
      return;
    }
    if (!moved) {
      // An extra problem (one Silky helped with, coming back): a pause, no step.
      await this.say('One more, {name}!', 2200);
      return;
    }
    const line = this.cfg.lines.beats[this.beatNo++ % this.cfg.lines.beats.length];
    if (this.cfg.mode === 'climb') await this.beatClimb(s, line);
    else if (this.cfg.mode === 'escape') await this.beatEscape(s, line);
    else await this.beatSnap(prev, s, line);
    await this.sleep(isCalm() ? 150 : 350);
  }

  private async deskAway(): Promise<void> {
    if (this.deskDown) return;
    this.deskDown = true;
    if (isCalm()) await sm(this.desk, 0.25, { opacity: 0 });
    else await sm(this.desk, 0.5, { y: 880, ease: 'power2.in' });
  }

  /**
   * Says a line, waiting at most `ms` for it, and at least long enough to
   * read the moment (the iPad's voice can finish early, or not speak at all).
   */
  private say(line: string, ms = 3000): Promise<void> {
    const least = Math.min(ms, isCalm() ? 900 : 1500);
    return Promise.all([capped(voice.say(line), ms), wait(least)]).then(() => undefined);
  }

  // -------------------------------------------------------------------------
  // The strip at the right edge
  // -------------------------------------------------------------------------

  /** Moves the strip's token or pips to the current stage, instantly (the desk is away). */
  private placeStrip(): void {
    if (this.cfg.mode === 'snap') {
      this.pips.forEach((p, k) => p.classList.toggle('done', k < this.stage));
      return;
    }
    if (!this.stripToken) return;
    const stops = stripStops(this.steps);
    const y = this.cfg.mode === 'climb' ? stops[this.stage] : stops[this.steps - this.stage];
    gsap.set(this.stripToken, { x: 0, y: y - STRIP.y - 40 });
  }

  private buildTokenStrip(kind: 'trunk' | 'ladder'): void {
    this.strip.innerHTML = stripArt('finale-strip-' + kind + this.cfg.n, kind);
    this.stripToken = h('div', { class: 'finale-token', html: characterArt(this.heroId) });
    place(this.stripToken, 38, 0, 66, 75);
    this.strip.append(this.stripToken);
  }

  // -------------------------------------------------------------------------
  // Climb: up the trunk to Moon-Face's room
  // -------------------------------------------------------------------------

  private buildClimb(): void {
    this.set.append(place(h('div', { class: 'finale-backdrop', html: tree('finale-tree', { landN: this.cfg.n }) }), 0, 0, 1180, 820));
    const top = TREE_PLACES[TREE_PLACES.length - 1];
    this.moon = puppet('moonface', 'finale-moon', top.x - 60, top.y - 120, 120);
    gsap.set(this.moon, { opacity: 0, scale: 0.2, transformOrigin: '50% 90%' });
    this.door = place(h('div', { class: 'finale-door', html: doorArt('finale-door') }), top.x - 32, top.y - 22, 64, 64);
    gsap.set(this.door, { transformOrigin: '0% 50%' });
    this.set.append(this.moon, this.door);
    this.climbers = [this.heroId, ...this.cfg.folk.slice(0, 1)].map((id, k) => puppet(id, 'finale-climber', 0, 0, 84 - k * 6));
    this.set.append(...this.climbers.slice().reverse());
    this.climbers.forEach((el, k) => gsap.set(el, this.climbPos(0, k)));
    this.buildTokenStrip('trunk');
  }

  /** Where climber k stands at stage s: along the map's stops, from the root door to Moon-Face's. */
  private climbPos(s: number, k: number): Spot {
    const t = (s / this.steps) * (TREE_PLACES.length - 1);
    const a = TREE_PLACES[Math.floor(t)];
    const b = TREE_PLACES[Math.min(TREE_PLACES.length - 1, Math.floor(t) + 1)];
    const f = t - Math.floor(t);
    const x = a.x + (b.x - a.x) * f;
    const y = a.y + (b.y - a.y) * f;
    // Stand to the left of the place (so the door at the top stays clear), the Folk behind.
    return { x: x - 150 - k * 64, y: y - 70 + k * 6, scale: 1, opacity: 1 };
  }

  private async hopTo(el: HTMLElement, to: Spot, hop = 40): Promise<void> {
    if (isCalm()) {
      await sm(el, 0.25, to);
      return;
    }
    const x0 = gsap.getProperty(el, 'x') as number;
    const y0 = gsap.getProperty(el, 'y') as number;
    const x1 = Number(to.x);
    const y1 = Number(to.y);
    await sm(el, 0.25, { x: (x0 + x1) / 2, y: Math.min(y0, y1) - hop, ease: 'power1.out' });
    await sm(el, 0.25, { ...to, ease: 'power1.in' });
  }

  private async openClimb(): Promise<void> {
    fx.patter(4);
    if (!isCalm()) await Promise.all(this.climbers.map((el, k) => this.hopTo(el, this.climbPos(0, k), 24)));
    await this.sleep(300);
  }

  private async beatClimb(s: number, line: string): Promise<void> {
    fx.patter(6, 0.1);
    const talk = this.say(line, 2600);
    await Promise.all(this.climbers.map(async (el, k) => {
      await wait(k * 120);
      await this.hopTo(el, this.climbPos(s, k));
    }));
    await talk;
  }

  private async endClimb(): Promise<void> {
    fx.patter(6, 0.1);
    await Promise.all(this.climbers.map((el, k) => this.hopTo(el, this.climbPos(this.steps, k))));
    await this.sleep(300);
    fx.knock(3);
    await this.sleep(800);
    fx.creak();
    await sm(this.door, 0.6, { scaleX: 0.08, ease: 'power2.inOut' });
    sfx.fanfare();
    await sm(this.moon, 0.5, { opacity: 1, scale: 1, ease: 'back.out(1.8)' });
    await this.say(this.cfg.lines.end, 5000);
    // In they go.
    const top = TREE_PLACES[TREE_PLACES.length - 1];
    for (const el of this.climbers) {
      const box = { x: top.x - parseFloat(el.style.width) / 2 - parseFloat(el.style.left), y: top.y - 60 - parseFloat(el.style.top) };
      fx.pop();
      await this.hopTo(el, { x: box.x, y: box.y, scale: 0.3, opacity: 0 }, 30);
    }
    await this.sleep(600);
  }

  // -------------------------------------------------------------------------
  // Escape: down the ladder before the land moves on
  // -------------------------------------------------------------------------

  private buildEscape(): void {
    const cfg = this.cfg;
    const n = cfg.n;
    this.set.append(place(h('div', { class: 'finale-backdrop', html: escapeBackdrop('finale-sky-' + n, cfg.sky ?? [C.duskHigh, C.duskSky, C.dusk]) }), 0, 0, 1180, 820));
    const rungs = this.steps - 1;
    const lh = LADDER.rung0 - LADDER.top + rungs * LADDER.gap + 40;
    this.set.append(place(h('div', { class: 'finale-ladder', html: ladderArt('finale-ladder-' + n, rungs) }), LADDER.x - 60, LADDER.top, 120, lh));
    // The land, on its cloud at the top of the ladder.
    this.land = place(h('div', { class: 'finale-land', html: LAND_ART[n]?.far('finale-far-' + n) ?? '' }), 290, 18, 600, 180);
    gsap.set(this.land, { transformOrigin: '50% 60%' });
    this.set.append(this.land);
    // Whoever is after them.
    if (cfg.chaser && cfg.hazard === 'stomp') {
      const g = puppet(cfg.chaser, 'finale-chaser finale-giant', 800, -70, 260);
      this.set.insertBefore(g, this.land);
      this.chaser = [g];
    } else if (cfg.chaser && cfg.hazard === 'march') {
      this.chaser = [0, 1, 2].map((k) => puppet(cfg.chaser!, 'finale-chaser', 330 + k * 90, 70, 64));
      this.set.append(...this.chaser);
    } else if (cfg.chaser && cfg.hazard === 'melt') {
      const m = puppet(cfg.chaser, 'finale-chaser', 780, 40, 100);
      gsap.set(m, { transformOrigin: '50% 100%' });
      this.set.append(m);
      this.chaser = [m];
    } else if (cfg.chaser) {
      const c = puppet(cfg.chaser, 'finale-chaser', LADDER.x - 45, 0, 90);
      gsap.set(c, { opacity: 0, y: this.rungY(-3) - 90 });
      this.set.append(c);
      this.chaser = [c];
    }
    // The hero and the Folk, on the ladder.
    this.climbers = [this.heroId, ...cfg.folk.slice(0, 2)].map((id) => puppet(id, 'finale-climber', LADDER.x - 42, 0, 84));
    this.set.append(...this.climbers.slice().reverse());
    this.climbers.forEach((el, k) => gsap.set(el, this.rungPos(0, k)));
    // The clouds, waiting at the edges.
    const col = cfg.clouds ?? C.cloud;
    this.clouds = (['l', 'r'] as const).map((side) => place(h('div', { class: 'finale-cloud', html: swirlCloud(`finale-cloud-${side}${n}`, col, side) }), side === 'l' ? -560 : 1180, -40, 560, 900));
    this.set.append(...this.clouds);
    this.clouds.forEach((c, k) => gsap.set(c, { x: this.cloudX(0, k) - (k ? -200 : 200) }));
    this.buildTokenStrip('ladder');
  }

  private rungY(k: number): number {
    return LADDER.rung0 + k * LADDER.gap;
  }

  /** Climber k's place at stage s: the hero on rung s, the Folk a little above. */
  private rungPos(s: number, k: number): Spot {
    const off = [0, 1.7, 3.4][k] ?? 0;
    const side = [0, 34, -34][k] ?? 0;
    return { x: side, y: this.rungY(s - off) - 84, scale: 1, rotation: 0, opacity: 1 };
  }

  /**
   * How far in the clouds have come at stage s (as an x offset). They creep
   * closer every rung but always leave the ladder clear.
   */
  private cloudX(s: number, k: number): number {
    const reach = 40 + (s / this.steps) * 300;
    return k ? -reach - 40 : reach;
  }

  private async openEscape(): Promise<void> {
    fx.rumble(1.6);
    const calm = isCalm();
    if (!calm) gsap.to(this.land, { rotation: 3, duration: 0.2, yoyo: true, repeat: 5, ease: stepped(0.2, 'sine.inOut') });
    sfx.whoosh();
    await Promise.all(this.clouds.map((c, k) => sm(c, 0.9, { x: this.cloudX(0, k), ease: 'power2.out' })));
    gsap.set(this.land, { rotation: this.landTilt(0) });
  }

  private landTilt(s: number): number {
    // Topsy-Turvy rocks one way, then the other, a little further each rung.
    return this.cfg.hazard === 'spin' ? (s % 2 ? 1 : -1) * (4 + (s / this.steps) * 10) : 0;
  }

  private async beatEscape(s: number, line: string): Promise<void> {
    const calm = isCalm();
    fx.creak();
    const talk = this.say(line, 2600);
    // Down a rung.
    const climb = Promise.all(this.climbers.map(async (el, k) => {
      await wait(k * 140);
      await sm(el, 0.45, { ...this.rungPos(s, k), ease: 'power1.inOut' });
    }));
    // The clouds swirl in a little closer.
    fx.wind(1.4);
    const swirl = Promise.all(this.clouds.map(async (c, k) => {
      if (!calm) {
        await sm(c, 0.5, { rotation: k ? -5 : 5, y: -20, ease: 'sine.inOut' });
        await sm(c, 0.6, { x: this.cloudX(s, k), rotation: 0, y: 0, ease: 'sine.inOut' });
      } else await sm(c, 0.25, { x: this.cloudX(s, k) });
    }));
    // The land moves on, and its hazard.
    const spins = this.cfg.hazard === 'spin' && !calm;
    const drift = sm(this.land, 0.8, { x: s * 6, y: -s * 3, ...(spins ? {} : { rotation: this.landTilt(s) }), ease: 'power1.inOut' });
    await Promise.all([climb, swirl, drift, this.hazard(s), talk]);
  }

  /** The land's own menace, one beat's worth. */
  private async hazard(s: number): Promise<void> {
    const calm = isCalm();
    const [c] = this.chaser;
    switch (this.cfg.hazard) {
      case 'chase': {
        // A few rungs behind them, never closer.
        if (!c) return;
        fx.sneak();
        await sm(c, 0.6, { opacity: 1, y: this.rungY(Math.max(-3, s - 5.4)) - 90, ease: 'power1.inOut' });
        if (!calm) await sm(c, 0.25, { rotation: 6, yoyo: true, repeat: 1 });
        return;
      }
      case 'stomp': {
        if (!c) return;
        fx.stomp(2, 0.4);
        if (calm) return;
        await sm(c, 0.3, { y: 30, ease: 'power2.in' });
        this.shake(8);
        await sm(c, 0.4, { y: 0, ease: 'power1.out' });
        return;
      }
      case 'march': {
        fx.patter(8, 0.12);
        const dx = s % 2 ? 120 : 0;
        await Promise.all(this.chaser.map((el) => sm(el, 0.9, { x: dx, ease: 'none' })));
        return;
      }
      case 'melt': {
        if (c) void sm(c, 0.6, { scaleY: 1 - (s / this.steps) * 0.45, scaleX: 1 + (s / this.steps) * 0.12 });
        if (!calm) for (let k = 0; k < 4; k++) this.particle(dripArt(`drip${s}-${k}`), 340 + k * 150 + (s % 3) * 20, 150, 24, 36, { y: 340, opacity: 0, delay: k * 0.15 }, 1.1);
        fx.bubbles(3);
        return;
      }
      case 'balloons': {
        if (calm) return;
        fx.pop();
        const cols = [C.balloon, C.giftBlue, C.ribbon, C.raspberry];
        for (let k = 0; k < 3; k++) this.particle(balloonArt(`bal${s}-${k}`, cols[(s + k) % cols.length]), 180 + ((s * 290 + k * 330) % 820), 840, 60, 130, { y: -1000, x: k % 2 ? 40 : -40, delay: k * 0.25 }, 2.2);
        return;
      }
      case 'spin':
        // Round it goes, a whole turn, and settles at its new tilt.
        fx.whizz();
        if (!calm) {
          await sm(this.land, 0.9, { rotation: this.landTilt(s) + (s % 2 ? 360 : -360), ease: 'power1.inOut' });
          gsap.set(this.land, { rotation: this.landTilt(s) });
        }
        return;
      default:
        return;
    }
  }

  private async endEscape(): Promise<void> {
    const calm = isCalm();
    fx.creak();
    await Promise.all(this.climbers.map((el, k) => sm(el, 0.4, this.rungPos(this.steps - 1, k))));
    await this.say('Jump!', 1200);
    // The leap, one by one, onto the branch.
    for (let k = 0; k < this.climbers.length; k++) {
      const el = this.climbers[k];
      const to = { x: BRANCH[0] - LADDER.x + 10 - k * 70, y: BRANCH[1] - 70 - k * 4 };
      fx.boing();
      if (calm) await sm(el, 0.25, to);
      else {
        const y0 = gsap.getProperty(el, 'y') as number;
        await sm(el, 0.3, { x: to.x / 2, y: Math.min(y0, to.y) - 90, rotation: -10, ease: 'power1.out' });
        await sm(el, 0.3, { ...to, rotation: 0, ease: 'power1.in' });
      }
      fx.thud();
    }
    // The land drifts away, and the clouds close over where it was.
    fx.wind(2.4);
    sfx.whoosh();
    const away = { y: -320, x: 160, opacity: 0, rotation: this.cfg.hazard === 'spin' ? -200 : 0, ease: 'power1.in' };
    await Promise.all([
      sm(this.land, 1.6, away),
      ...this.chaser.map((c) => sm(c, 1.6, { ...away, rotation: 0 })),
      ...this.clouds.map((c, k) => sm(c, 1.6, { x: k ? -620 : 560, y: -560, ease: 'power1.inOut' })),
    ]);
    sfx.fanfare();
    if (!calm) this.climbers.forEach((el) => gsap.to(el, { y: '-=30', duration: 0.25, yoyo: true, repeat: 3, ease: stepped(0.25, 'power1.out') }));
    await this.say(this.cfg.lines.end, 5000);
    await this.sleep(500);
  }

  // -------------------------------------------------------------------------
  // Snap: Dame Snap's board
  // -------------------------------------------------------------------------

  private buildSnap(): void {
    const n = this.cfg.n;
    this.set.append(place(h('div', { class: 'finale-backdrop', html: LAND_ART[n]?.scene('finale-scene-' + n) ?? '' }), 0, 0, 1180, 820));
    this.set.append(place(h('div', { class: 'finale-veil' }), 0, 0, 1180, 820));
    if (this.cfg.final) {
      this.cupboard = place(h('div', { class: 'finale-cupboard', html: cupboardArt('finale-cupboard') }), 990, 250, 170, 330);
      this.cupDoor = place(h('div', { class: 'finale-cupdoor', html: cupboardDoor('finale-cupdoor') }), 1004, 264, 142, 310);
      gsap.set(this.cupDoor, { scaleX: 0.06, transformOrigin: '100% 50%' });
      this.set.append(this.cupboard, this.cupDoor);
    }
    this.board = place(h('div', { class: 'finale-board' }), 165, 96, 540, 460);
    this.boardHead = h('div', { class: 'finale-board-head' });
    this.boardItems = h('div', { class: 'finale-board-items' });
    this.board.append(this.boardHead, this.boardItems);
    this.set.append(this.board);
    this.snap = place(h('div', { class: 'finale-snap', html: dameSnapPose('loom') }), 715, 180, 320, 363);
    gsap.set(this.snap, { transformOrigin: '50% 100%' });
    this.set.append(this.snap);
    this.climbers = [this.heroId, ...this.cfg.folk.slice(0, 2)].map((id, k) => puppet(id, 'finale-climber', 175 + k * 120, 600 + (k % 2) * 14, 110));
    this.set.append(...this.climbers);
    this.drawWave(0);

    // The strip: one pip per item, top to bottom, in wave colours.
    const total = this.steps;
    const stops = stripStops(Math.max(1, total - 1));
    let k = 0;
    for (const w of this.cfg.waves ?? []) {
      for (let j = 0; j < w.count && k < total; j++, k++) {
        const pip = place(h('div', { class: `finale-pip pip-${w.kind}` }), 40, stops[total - 1 - k] - STRIP.y - 18, 60, 36);
        this.strip.append(pip);
        this.pips.push(pip);
      }
    }
  }

  /** Which wave stage s is in, and the stage it starts at. */
  private waveAt(s: number): { wave: number; start: number } {
    const waves = this.cfg.waves ?? [];
    let start = 0;
    for (let w = 0; w < waves.length; w++) {
      if (s < start + waves[w].count || w === waves.length - 1) return { wave: w, start };
      start += waves[w].count;
    }
    return { wave: 0, start: 0 };
  }

  /** Draws wave w's items on the board. */
  private drawWave(w: number): void {
    const wave = (this.cfg.waves ?? [])[w];
    this.items = [];
    this.boardItems.replaceChildren();
    if (!wave) return;
    this.board.innerHTML = '';
    this.board.append(h('div', { class: 'finale-board-art', html: boardArt(`finale-board-${this.cfg.n}-${w}`, 540, 460, wave.kind) }), this.boardHead, this.boardItems);
    this.board.dataset.kind = wave.kind;
    this.boardHead.textContent = wave.title;
    const count = wave.count;
    const innerW = 500;
    const innerH = 360;
    const ox = 20;
    const oy = 78;
    if (wave.kind === 'rules') {
      const cols = count > 5 ? 2 : 1;
      const rows = Math.ceil(count / cols);
      const cw = innerW / cols;
      const ch = Math.min(80, innerH / rows);
      for (let i = 0; i < count; i++) {
        const x = ox + (i % cols) * cw;
        const y = oy + Math.floor(i / cols) * ch;
        const el = place(h('div', { class: 'finale-rule' }), x, y, cw - 10, ch - 6);
        const text = h('span', { class: 'finale-rule-text' }, (wave.rules ?? [])[i % Math.max(1, wave.rules?.length ?? 1)] ?? 'NO fun');
        const crack = h('div', { class: 'finale-crack', html: crackArt(`crack${w}-${i}`, cw - 10, ch - 6) });
        gsap.set(crack, { scaleX: 0, transformOrigin: '0% 50%' });
        el.append(text, crack);
        this.boardItems.append(el);
        this.items.push({
          el,
          wave,
          breakIt: async () => {
            fx.thud();
            await sm(crack, 0.3, { scaleX: 1, ease: 'power2.out' });
            this.dust(165 + x + cw / 2, 96 + y + ch / 2);
            await sm(text, 0.3, { opacity: 0.25, rotation: i % 2 ? 3 : -3 });
          },
        });
      }
    } else if (wave.kind === 'rulers') {
      const cols = Math.min(count, 5);
      const rows = Math.ceil(count / cols);
      const cw = innerW / cols;
      const ch = innerH / rows;
      const rh = Math.min(192, ch - 16);
      const rw = (rh * 36) / 192;
      for (let i = 0; i < count; i++) {
        const x = ox + (i % cols) * cw + (cw - rw) / 2;
        const y = oy + Math.floor(i / cols) * ch + (ch - rh) / 2;
        const el = place(h('div', { class: 'finale-ruler' }), x, y, rw, rh);
        const top = place(h('div', { html: rulerHalf(`rt${w}-${i}`, true) }), 0, 0, rw, rh / 2);
        const bot = place(h('div', { html: rulerHalf(`rb${w}-${i}`, false) }), 0, rh / 2, rw, rh / 2);
        gsap.set(top, { transformOrigin: '50% 100%' });
        gsap.set(bot, { transformOrigin: '50% 0%' });
        el.append(top, bot);
        this.boardItems.append(el);
        this.items.push({
          el,
          wave,
          breakIt: async () => {
            fx.thud();
            fx.pop();
            this.dust(165 + x + rw / 2, 96 + y + rh / 2);
            await Promise.all([
              sm(top, 0.35, { rotation: -28, x: -10, y: -8, ease: 'power2.out' }),
              sm(bot, 0.45, { rotation: 34, x: 12, y: 30, opacity: 0.7, ease: 'power2.in' }),
            ]);
          },
        });
      }
    } else {
      const cols = Math.min(count, 4) > 2 && count <= 4 ? 2 : Math.min(count, 5);
      const rows = Math.ceil(count / cols);
      const cw = innerW / cols;
      const ch = innerH / rows;
      const s = Math.min(1.2, (ch - 10) / 140, (cw - 10) / 120);
      const bw = 120 * s;
      const bh = 140 * s;
      for (let i = 0; i < count; i++) {
        const x = ox + (i % cols) * cw + (cw - bw) / 2;
        const y = oy + Math.floor(i / cols) * ch + (ch - bh) / 2;
        const el = place(h('div', { class: 'finale-cage' }), x, y, bw, bh);
        const who = (wave.captives ?? ['moonface'])[i % Math.max(1, wave.captives?.length ?? 1)];
        const captive = place(h('div', { class: 'finale-captive', html: characterArt(who) }), bw * 0.08, bh * 0.06, bw * 0.84, bh * 0.92);
        const bars = place(h('div', { class: 'finale-bars', html: cageBars(`cage${w}-${i}`) }), 0, 0, bw, bh);
        const lock = place(h('div', { class: 'finale-lock', html: padlockArt(`lock${w}-${i}`) }), bw / 2 - 20 * s, bh * 0.62, 40 * s, 47 * s);
        el.append(captive, bars, lock);
        this.boardItems.append(el);
        this.items.push({
          el,
          wave,
          breakIt: async () => {
            const shackle = lock.querySelector('[data-part="shackle"]');
            fx.knock(1);
            if (shackle) await sm(shackle, 0.2, { y: -8 });
            sfx.sparkle();
            await sm(lock, 0.35, { y: 80, rotation: 40, opacity: 0, ease: 'power2.in' });
            fx.creak();
            await sm(bars, 0.4, { y: -bh * 0.9, opacity: 0, ease: 'power2.inOut' });
            fx.boing();
            if (!isCalm()) {
              await sm(captive, 0.2, { y: -18, ease: 'power1.out' });
              await sm(captive, 0.2, { y: 0, ease: 'power1.in' });
            }
          },
        });
      }
    }
  }

  private async openSnap(): Promise<void> {
    const calm = isCalm();
    fx.stomp(3, 0.4);
    if (!calm) {
      gsap.set(this.snap, { x: 300 });
      await sm(this.snap, 1.2, { x: 0, ease: 'steps(3)' });
    }
    this.setPose('shriek');
    sfx.ominous();
    if (!calm) this.shake(6);
    await this.sleep(500);
    this.setPose('loom');
  }

  private setPose(p: SnapPose): void {
    this.snap.innerHTML = dameSnapPose(p);
  }

  /** She gets crosser: a little bigger and a little closer to the board (never to anyone). */
  private crossness(s: number): Spot {
    const k = s / this.steps;
    return { scale: 1 + k * 0.14, x: -k * 30 };
  }

  private async beatSnap(prev: number, s: number, line: string): Promise<void> {
    const calm = isCalm();
    const { wave, start } = this.waveAt(prev);
    // Break the item for the answer just given.
    const item = this.items[prev - start];
    if (item) await item.breakIt();
    if (!this.alive) return;
    this.hooray();
    // Dame Snap's reaction.
    const pose = (['point', 'shriek', 'stomp', 'loom'] as SnapPose[])[(s - 1) % 4];
    this.setPose(pose);
    if (pose === 'shriek') sfx.ominous();
    else if (pose === 'stomp') {
      fx.stomp(2, 0.35);
      if (!calm) this.shake(7);
    } else if (pose === 'point') fx.knock(2);
    else fx.rumble(1);
    const talk = this.say(line, 2400);
    await Promise.all([sm(this.snap, 0.4, { ...this.crossness(s), ease: 'back.out(2)' }), talk]);
    // A new wave (land 10): wipe the board and chalk up the next.
    const next = this.waveAt(s);
    if (next.wave !== wave) {
      await this.sleep(300);
      sfx.whoosh();
      await sm(this.board, 0.4, { opacity: 0, y: 20 });
      this.drawWave(next.wave);
      fx.stomp(2, 0.3);
      await sm(this.board, 0.4, { opacity: 1, y: 0, ease: 'power2.out' });
      await this.say(waveLine((this.cfg.waves ?? [])[next.wave]), 3000);
    }
  }

  private async endSnap(prev: number): Promise<void> {
    const calm = isCalm();
    const { start } = this.waveAt(prev);
    // Everything left on the board breaks (an extra problem may have held the last one back).
    for (const item of this.items.slice(prev - start)) await item.breakIt();
    this.hooray();
    this.setPose('defeated');
    fx.uhoh();
    await sm(this.snap, 0.4, { scale: 0.95, x: 0, ease: 'power1.out' });
    await this.sleep(400);
    await this.say(this.cfg.lines.exit ?? 'SNAP!', 3600);
    if (this.cfg.final && this.cupboard && this.cupDoor) {
      // Into her own detention cupboard she goes, and the door swings shut.
      fx.patter(5, 0.15);
      await sm(this.snap, 0.9, { x: 330, scale: 0.75, opacity: 0, ease: 'power1.in' });
      fx.creak();
      await sm(this.cupDoor, 0.35, { scaleX: 1, ease: 'power2.in' });
      fx.thud();
      if (!calm) this.shake(6);
      await this.sleep(400);
      fx.knock(3);
    } else {
      // She storms off, vowing revenge.
      this.setPose('stomp');
      fx.stomp(4, 0.3);
      await sm(this.snap, calm ? 0.25 : 1.2, { x: 520, ease: 'steps(4)' });
      gsap.set(this.snap, { opacity: 0 });
    }
    sfx.fanfare();
    if (!calm) this.climbers.forEach((el) => gsap.to(el, { y: '-=30', duration: 0.25, yoyo: true, repeat: 3, ease: stepped(0.25, 'power1.out') }));
    await this.say(this.cfg.lines.end, 5000);
    await this.sleep(500);
  }

  /** The hero and Folk hop for joy. */
  private hooray(): void {
    if (isCalm()) return;
    this.climbers.forEach((el, k) => gsap.timeline({ delay: k * 0.08 }).to(el, { y: '-=26', duration: 0.18, ease: stepped(0.18, 'power1.out') }).to(el, { y: '+=26', duration: 0.18, ease: stepped(0.18, 'power1.in') }));
  }

  // -------------------------------------------------------------------------
  // Little effects (none in calm mode)
  // -------------------------------------------------------------------------

  /** The set piece jolts (a stomp). */
  private shake(px: number): void {
    const tl = gsap.timeline();
    for (let k = 0; k < 4; k++) tl.set(this.set, { x: (k % 2 ? -1 : 1) * px * (1 - k / 4), y: (k % 2 ? 1 : -1) * px * 0.5 * (1 - k / 4) }, k / 12);
    tl.set(this.set, { x: 0, y: 0 }, 4 / 12);
  }

  /** A puff of chalk dust. */
  private dust(x: number, y: number): void {
    if (isCalm()) return;
    for (let k = 0; k < 8; k++) {
      const p = place(h('div', { class: 'finale-dust' }), x - 5, y - 5, 10, 10);
      this.set.append(p);
      const a = (k / 8) * Math.PI * 2;
      gsap.to(p, { x: Math.cos(a) * 50, y: Math.sin(a) * 36 + 20, opacity: 0, duration: 0.6, ease: stepped(0.6, 'power2.out'), onComplete: () => p.remove() });
    }
  }

  /** A one-off moving piece (a balloon, a drip) that removes itself. */
  private particle(html: string, x: number, y: number, w: number, hgt: number, to: Spot, secs: number): void {
    const p = place(h('div', { class: 'finale-particle', html }), x, y, w, hgt);
    this.set.append(p);
    gsap.to(p, { ...to, duration: secs, ease: stepped(secs, 'none'), onComplete: () => p.remove() });
  }
}
