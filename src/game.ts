/**
 * Game flow:
 *
 *   title → (choose + opening film, first time) → map → intro → play → story → complete
 *                                                  ↑______________________________________|
 *
 * plus Practice with Silky, the Treasure Room and the grown-ups' corner.
 * After the last finale, the ending film plays before the reward.
 */
import { ALL_CHAPTERS, findChapter, LANDS, type Chapter, type Land } from './core/curriculum';
import { finishChapter } from './core/progress';
import { makeRand, randomSeed } from './core/random';
import { buildPractice, buildRound } from './core/round';
import { AlbumScene } from './scenes/album';
import { ChooseScene } from './scenes/choose';
import { CompleteScene } from './scenes/complete';
import { IntroScene } from './scenes/intro';
import { MapScene } from './scenes/map';
import { ParentScene } from './scenes/parent';
import { PlayScene } from './scenes/play';
import { hasStory, StoryScene } from './scenes/story';
import { TitleScene } from './scenes/title';
import type { App, Nav } from './ui/scene';

/** `?seed=123` makes every problem repeatable (dev and tests). */
const seedParam = (): number => Number(new URLSearchParams(location.search).get('seed')) || randomSeed();

export class Game implements Nav {
  private app!: App;

  attach(app: App): void {
    this.app = app;
  }

  title(): void {
    void this.app.go(new TitleScene(this.app));
  }

  choose(): void {
    void this.app.go(new ChooseScene(this.app));
  }

  map(): void {
    void this.app.go(new MapScene(this.app));
  }

  album(): void {
    void this.app.go(new AlbumScene(this.app));
  }

  parent(): void {
    void this.app.go(new ParentScene(this.app), 'fade');
  }

  chapter(id: string): void {
    const found = findChapter(id);
    if (!found) return this.map();
    const { land, chapter } = found;
    void this.app.go(new IntroScene(this.app, land, chapter, () => this.play(land, chapter)));
  }

  practice(): void {
    const rand = makeRand(seedParam());
    const problems = buildPractice(this.app.progress, rand, Date.now());
    const land = LANDS[0];
    void this.app.go(
      new PlayScene(this.app, {
        land,
        chapter: null,
        problems,
        rand,
        onDone: () => this.map(),
      }),
    );
  }

  story(id: string, back: () => void): void {
    const found = findChapter(id);
    const land = found?.land ?? (id === 'ending' ? LANDS[LANDS.length - 1] : LANDS[0]);
    const title = found?.chapter.title ?? (id === 'opening' ? 'Up the Faraway Tree' : id === 'ending' ? 'The Biggest Birthday' : id);
    if (!hasStory(id)) return back();
    void this.app.go(new StoryScene(this.app, { id, title, land, chapter: found?.chapter ?? null, onDone: back }));
  }

  private play(land: Land, chapter: Chapter): void {
    const rand = makeRand(seedParam());
    const problems = buildRound(chapter, this.app.progress, rand, Date.now());
    void this.app.go(
      new PlayScene(this.app, {
        land,
        chapter,
        problems,
        rand,
        onDone: () => this.finish(land, chapter),
      }),
    );
  }

  private finish(land: Land, chapter: Chapter): void {
    const news = finishChapter(this.app.progress, chapter, Date.now());
    this.app.save();
    const reward = () => void this.app.go(new CompleteScene(this.app, { land, chapter, news, onNext: () => this.map() }));
    const last = chapter.id === ALL_CHAPTERS[ALL_CHAPTERS.length - 1].id;
    this.story(chapter.id, last ? () => this.story('ending', reward) : reward);
  }
}
