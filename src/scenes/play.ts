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
import type { Chapter, Land } from '../core/curriculum';
import { generate } from '../core/generators';
import { PHRASES, PRAISE } from '../core/phrases';
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
}

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

  constructor(app: App, o: PlayOptions) {
    super(app, 'play');
    this.o = o;
    this.rand = o.rand ?? makeRand(randomSeed());
    this.round = new Round(o.problems, (p) => generate(p.skill, Math.max(1, p.tier - 1), this.rand));
    this.desk = h('div', { class: 'play-desk' });
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
    activity.lock(false);
    activity.show();
    this.sayQuestion();
  }

  private sayQuestion(): void {
    this.restartIdle();
    void voice.speech(this.round.current.say);
  }

  private restartIdle(): void {
    this.stopIdle();
    const secs = this.app.progress.settings.idleHintSeconds;
    if (!secs) return;
    this.idle = setTimeout(() => {
      if (!this.alive || this.busy) return;
      sfx.rustle();
      this.sayQuestion();
    }, secs * 1000);
  }

  private stopIdle(): void {
    if (this.idle) clearTimeout(this.idle);
    this.idle = null;
  }

  private async onAnswer(value: Answer): Promise<void> {
    if (this.busy || this.round.done) return;
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
    if (outcome.wrong === 0 && this.rand.chance(0.35)) await voice.say(this.rand.pick(PRAISE));
    await this.sleep(300);
    await this.afterRight(this.round.index, this.round.index + 1 >= this.round.total);
    if (!this.alive) return;
    this.dots[this.round.index]?.classList.add('done');

    if (!this.round.advance()) {
      this.o.onDone(this.round);
      return;
    }
    void this.showProblem();
  }

  private stepHelp(): void {
    const level = this.round.help;
    if (level === 0 || !this.activity) return;
    this.activity.help(level);
    if (level === 1) {
      void voice.say(PHRASES.tryAgain).then(() => this.alive && this.sayQuestion());
    } else if (level === 2) {
      void voice.say(PHRASES.showMe);
    } else {
      void this.silkyHelps();
    }
  }

  private askSilky(): void {
    if (this.busy) return;
    sfx.tap();
    this.round.askHelp();
    this.stepHelp();
  }

  /** Silky flies to the middle, says the working, and settles back. */
  private async silkyHelps(): Promise<void> {
    sfx.sparkle();
    if (!isCalm()) {
      await sm(this.silky, 0.6, { x: -440, y: -160, scale: 1.3, ease: 'power2.inOut' });
    }
    await voice.say(PHRASES.silkyHere);
    if (!this.alive) return;
    await voice.speech(this.round.current.explain);
    if (!isCalm()) gsap.to(this.silky, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
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
