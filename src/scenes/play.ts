/**
 * The problem screen (docs/PLAN.md §5): one problem at a time, in the same
 * layout every time. The activity in the middle takes the answer; this
 * scene does everything around it: speaking the question, "hear it again",
 * Silky's help, praise, toffees, progress dots, and moving on.
 *
 * Everything on the problem screen lives in one layer, the desk, so a
 * finale (scenes/finale.ts) can slide it away between problems to show its
 * set piece. The hooks `afterRight` and `beforeProblem` are where the drama
 * goes: they run only between problems, never while he's thinking.
 */
import { gsap } from 'gsap';
import { makeActivity } from '../activities';
import type { Activity } from '../activities/types';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { parchment } from '../art/ui';
import type { Chapter, Land } from '../core/curriculum';
import { generate } from '../core/generators';
import { personalise, PHRASES, PRAISE } from '../core/phrases';
import type { Answer, Problem } from '../core/problem';
import { recordOutcome } from '../core/progress';
import { makeRand, randomSeed, type Rand } from '../core/random';
import { Round } from '../core/round';
import { isCalm, pop, sm } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

export interface PlayOptions {
  land: Land;
  /** The chapter (null for Practice with Silky). */
  chapter: Chapter | null;
  problems: Problem[];
  rand?: Rand;
  /** Called when every problem is answered. */
  onDone: (round: Round) => void;
  /**
   * Practice only: before `onDone`, Silky says a short well done on a card,
   * with the toffees earned, and one big button carries on.
   */
  signOff?: boolean;
}

const portrait = (): boolean => document.body.classList.contains('is-portrait');

export class PlayScene extends Scene {
  protected o: PlayOptions;
  protected round: Round;
  private rand: Rand;
  /** The layer holding the whole problem screen (finales slide it away between problems). */
  protected desk: HTMLElement;
  private activity: Activity | null = null;
  private dots: HTMLElement[] = [];
  private dotsBox!: HTMLElement;
  private jar!: HTMLElement;
  private silky!: HTMLElement;
  private hero!: HTMLElement;
  private busy = false;
  private idle: ReturnType<typeof setTimeout> | null = null;
  /** Silky is out helping: more taps on her wait until she's done. */
  private helping = false;
  /** The "back to the tree?" card is open. */
  private confirming = false;
  private backBtn!: HTMLElement;
  /** His toffees when the screen opened, so Practice can say how many it earned. */
  private toffeesAtStart: number;

  constructor(app: App, o: PlayOptions) {
    super(app, 'play');
    this.o = o;
    this.rand = o.rand ?? makeRand(randomSeed());
    this.round = new Round(o.problems, (p) => generate(p.skill, Math.max(1, p.tier - 1), this.rand));
    this.desk = h('div', { class: 'play-desk' });
    this.toffeesAtStart = app.progress.toffees;
  }

  build(): void {
    this.root.style.setProperty('--land', this.o.land.color);
    this.root.append(this.desk);
    const r = this.desk;
    r.append(place(h('div', { class: 'play-tint' }), 0, 0, 1180, 820));

    this.dotsBox = place(h('div', { class: 'progress-dots' }), 200, 26, 780, 40);
    r.append(this.dotsBox);
    this.drawDots();

    this.jar = place(h('div', { class: 'toffee-jar' }, String(this.app.progress.toffees)), 1040, 18, 120, 60);
    r.append(this.jar);

    const hear = sealButton('speaker', { x: 30, y: 330, size: 104, color: C.teal, aria: 'Hear it again', name: 'play-hear' });
    this.tap(hear, () => {
      sfx.tap();
      this.sayQuestion();
    });
    r.append(hear);

    this.silky = place(h('button', { class: 'silky-btn', 'aria-label': 'Ask Silky for help', html: characterArt('silky') }), 1040, 300, 130, 147);
    this.tap(this.silky, () => this.askSilky());
    r.append(this.silky);

    // A quiet way out for a child who has had enough, beside the grown-ups'
    // gear. It never moves or animates while he's answering.
    this.backBtn = sealButton('map', { x: 84, y: 10, size: 72, color: C.slate, aria: 'Back to the tree', name: 'play-back' });
    this.tap(this.backBtn, () => this.askLeave());
    r.append(this.backBtn);

    this.hero = place(h('div', { class: 'play-hero', html: characterArt(this.app.progress.avatar ?? 'joe') }), 10, 560, 150, 170);
    r.append(this.hero);
  }

  enter(): void | Promise<void> {
    void this.showProblem();
  }

  /**
   * After a right answer has been praised, before the next problem (or the
   * end, when `last`). Finales play their drama here. `i` is the index of
   * the problem just answered.
   */
  protected async afterRight(_i: number, _last: boolean): Promise<void> {}

  /** Just before a problem appears: finales bring the desk back here. */
  protected async beforeProblem(): Promise<void> {}

  leave(): void {
    voice.stop();
    this.stopIdle();
  }

  destroy(): void {
    this.stopIdle();
    this.activity?.destroy();
    super.destroy();
  }

  private drawDots(): void {
    this.dotsBox.replaceChildren();
    this.dots = this.round.problems.map((_, i) => {
      const d = h('div', { class: `pdot${i < this.round.index ? ' done' : i === this.round.index ? ' now' : ''}` });
      this.dotsBox.append(d);
      return d;
    });
  }

  private async showProblem(): Promise<void> {
    const p = this.round.current;
    this.root.dataset.answer = String(p.answer);
    this.root.dataset.skill = p.skill;
    this.busy = true;
    this.activity?.destroy();
    this.activity = makeActivity(p, {
      answer: (v) => void this.onAnswer(v),
      say: (s) => void voice.speech(s),
      sfx: (name) => (name === 'place' ? sfx.place(0) : sfx[name]()),
      calm: isCalm(),
    });
    this.desk.insertBefore(this.activity.el, this.silky);
    stackFractions(this.activity.el);
    this.drawDots();
    const activity = this.activity;
    activity.lock(true);
    await this.beforeProblem();
    if (!this.alive || activity !== this.activity) return;
    this.busy = false;
    if (!this.confirming) activity.lock(false);
    activity.show();
    this.sayQuestion();
  }

  private sayQuestion(): void {
    this.restartIdle();
    // Nothing is said behind the "turn the iPad" screen.
    if (portrait()) return;
    void voice.speech(this.round.current.say);
  }

  private restartIdle(): void {
    this.stopIdle();
    const secs = this.app.progress.settings.idleHintSeconds;
    if (!secs) return;
    this.idle = setTimeout(() => {
      if (!this.alive || this.busy || this.confirming) return;
      // Portrait pauses the game: hold the hint and try again later.
      if (portrait()) return this.restartIdle();
      sfx.rustle();
      this.sayQuestion();
    }, secs * 1000);
  }

  private stopIdle(): void {
    if (this.idle) clearTimeout(this.idle);
    this.idle = null;
  }

  private async onAnswer(value: Answer): Promise<void> {
    if (this.busy || this.confirming || this.round.done) return;
    this.restartIdle();
    const p = this.round.current;
    const verdict = this.round.answer(value);
    if (verdict === 'wrong') {
      sfx.wrong();
      this.activity?.wrong(value);
      this.stepHelp();
      return;
    }

    // Right!
    this.busy = true;
    this.stopIdle();
    this.activity?.lock(true);
    const outcome = this.round.outcomes[this.round.outcomes.length - 1];
    const ceiling = this.o.chapter && this.o.chapter.skills.includes(p.skill) ? this.o.chapter.tiers[1] : undefined;
    recordOutcome(this.app.progress, outcome, ceiling);
    this.app.save();
    sfx.success();
    this.jar.textContent = String(this.app.progress.toffees);
    void pop(this.jar, 1.2);
    void this.cheer();
    await this.activity?.right();
    if (!this.alive) return;
    await voice.speech(p.explain);
    // Leaving stops the voice, which ends these lines early: don't go on to the next one.
    if (!this.alive) return;
    if (outcome.wrong === 0 && this.rand.chance(0.35)) await voice.say(this.rand.pick(PRAISE));
    if (!this.alive) return;
    await this.sleep(300);
    await this.afterRight(this.round.index, this.round.index + 1 >= this.round.total);
    if (!this.alive) return;
    this.dots[this.round.index]?.classList.add('done');

    if (!this.round.advance()) {
      if (this.o.signOff) this.practiceSignOff();
      else this.o.onDone(this.round);
      return;
    }
    void this.showProblem();
  }

  private stepHelp(): void {
    const level = this.round.help;
    if (level === 0 || !this.activity) return;
    this.activity.help(level);
    if (level === 1) {
      // Only re-read the question if the line finished: a quick second wrong
      // tap cuts it off and starts the next help line instead.
      void voice.say(PHRASES.tryAgain).then((finished) => finished && this.alive && !this.busy && this.sayQuestion());
    } else if (level === 2) {
      void voice.say(PHRASES.showMe);
    } else {
      void this.silkyHelps();
    }
  }

  private askSilky(): void {
    if (this.busy || this.helping || this.confirming) return;
    sfx.tap();
    this.round.askHelp();
    this.stepHelp();
  }

  /** Silky flies to the middle, says the working, and settles back. */
  private async silkyHelps(): Promise<void> {
    // One visit at a time: more taps or wrong answers meanwhile would cut her
    // lines off and tween her twice.
    if (this.helping) return;
    this.helping = true;
    try {
      sfx.sparkle();
      if (!isCalm()) {
        await sm(this.silky, 0.6, { x: -440, y: -160, scale: 1.3, ease: 'power2.inOut' });
      }
      if (!this.alive) return;
      // Skip the working if something interrupted her opening line.
      if (await voice.say(PHRASES.silkyHere)) {
        if (!this.alive) return;
        await voice.speech(this.round.current.explain);
      }
    } finally {
      this.helping = false;
      if (this.alive && !isCalm()) gsap.to(this.silky, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
    }
  }

  /** A calm question on a parchment card: nothing is lost either way. */
  private askLeave(): void {
    if (this.confirming) return;
    sfx.tap();
    this.confirming = true;
    this.stopIdle();
    this.activity?.lock(true);
    const veil = h('div', { class: 'play-veil' });
    const card = place(h('div', { class: 'play-card', html: parchment(600, 400, 'play-leave') }), 290, 190, 600, 400);
    card.append(place(h('div', { class: 'play-card-title' }, PHRASES.leaveAsk), 40, 50, 520, 80));
    const yes = sealButton('tick', { x: 90, y: 170, size: 140, color: C.green, label: 'Yes', aria: 'Yes, back to the tree', name: 'leave-yes' });
    const keep = sealButton('play', { x: 370, y: 170, size: 140, color: C.red, label: 'Keep playing', aria: 'Keep playing', name: 'leave-keep' });
    card.append(yes, keep);
    veil.append(card);
    this.root.append(veil);
    if (!isCalm()) void sm(card, 0.25, { startAt: { scale: 0.92, opacity: 0 }, scale: 1, opacity: 1, ease: 'power2.out' });
    const close = () => {
      veil.remove();
      this.confirming = false;
      voice.stop();
      if (!this.busy) this.activity?.lock(false);
      if (!this.busy) this.restartIdle();
    };
    this.tap(yes, () => {
      sfx.tap();
      voice.stop();
      this.app.nav.map();
    });
    this.tap(keep, () => {
      sfx.tap();
      close();
    });
    void voice.say(PHRASES.leaveAsk);
  }

  /** Practice ends with Silky's well done and the toffees earned, then one big button. */
  private practiceSignOff(): void {
    const earned = Math.max(0, this.app.progress.toffees - this.toffeesAtStart);
    if (this.activity) this.activity.el.style.visibility = 'hidden';
    this.silky.style.visibility = 'hidden';
    this.backBtn.style.visibility = 'hidden';
    const veil = h('div', { class: 'play-veil' });
    const card = place(h('div', { class: 'play-card', html: parchment(760, 440, 'practice-done') }), 210, 190, 760, 440);
    card.append(place(h('div', { class: 'play-card-art', html: characterArt('silky') }), 50, 70, 200, 226));
    card.append(place(h('div', { class: 'play-card-title small' }, personalise(PHRASES.practiceDone, this.app.progress.name)), 270, 50, 440, 150));
    if (earned > 0) card.append(place(h('div', { class: 'play-card-toffees' }, `${earned} ${earned === 1 ? 'toffee' : 'toffees'}`), 270, 225, 440, 70));
    const on = sealButton('next', { x: 560, y: 290, size: 130, color: C.red, aria: 'Back to the tree', name: 'practice-done' });
    card.append(on);
    veil.append(card);
    this.root.append(veil);
    if (!isCalm()) void pop(card, 1.05);
    this.tap(on, () => {
      sfx.tap();
      voice.stop();
      this.o.onDone(this.round);
    });
    sfx.success();
    void voice.say(PHRASES.practiceDone);
  }

  private async cheer(): Promise<void> {
    if (isCalm()) return;
    await sm(this.hero, 0.2, { y: -40, ease: 'power2.out' });
    await sm(this.hero, 0.2, { y: 0, ease: 'power2.in' });
  }
}

const FRACTIONS: Record<string, [number, number]> = { '½': [1, 2], '¼': [1, 4], '¾': [3, 4], '⅓': [1, 3], '⅔': [2, 3] };

/**
 * Andika has no ⅓ (and ½ and ¼ look tiny), so written fractions in any
 * activity become stacked numerals, the way he sees them at school.
 */
function stackFractions(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (/[½¼¾⅓⅔]/.test(n.nodeValue ?? '')) hits.push(n as Text);
  for (const t of hits) {
    const span = document.createElement('span');
    span.innerHTML = (t.nodeValue ?? '')
      .replace(/[&<>]/g, (c) => `&#${c.charCodeAt(0)};`)
      .replace(/[½¼¾⅓⅔]/g, (c) => {
        const [n, d] = FRACTIONS[c];
        return `<span class="c-frac" style="font-size:1em"><span>${n}</span><span>${d}</span></span>`;
      });
    t.replaceWith(span);
  }
}
