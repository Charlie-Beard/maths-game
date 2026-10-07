/**
 * Land 2, chapter 1: Upside-Down Land.
 *
 * A new land has come to the top of the tree. {name} and the hero climb off
 * the ladder into pink and green nonsense: houses on their roofs, grass in
 * the sky. The hero tries standing on their head (boing, and back). The
 * Topsy-Turvy Man hand-walks in, talking backwards, with five hats balanced
 * on his foot. Counting backwards is how it's done here: the hats fly off
 * one less at a time, 5, 4, 3, 2, 1, none, and each pop is a note lower.
 * The last hat comes down upside down (the keepsake). Next: Hats on Feet.
 */
import { topsyTall } from '../art/characters';
import { C, defineStory, noiseBurst, now, tone, type Pt } from './kit';
import { numberCard } from './bits';

// ------------------------------------------------------------------ sounds

/** Hands slapping the grass as he walks on them. */
function slaps(times = 4, gap = 0.16): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    noiseBurst(t + i * gap, { freq: 700 + (i % 2) * 200, q: 0.9, peak: 0.12, attack: 0.004, decay: 0.06 });
    tone(150, t + i * gap, { peak: 0.06, decay: 0.07, glideTo: 90 });
  }
}

/** A slide whistle going up and over: turning upside down. */
function whoop(down = false): void {
  const t = now();
  tone(down ? 1100 : 320, t, { wave: 'sine', peak: 0.1, attack: 0.03, decay: 0.45, glideTo: down ? 320 : 1100, vibrato: [7, 12] });
}

/**
 * A backwards chime: each note swells in and stops dead, like a bell
 * played in reverse (for words said back to front).
 */
function backwards(): void {
  const t = now();
  [784, 659, 523].forEach((f, i) => tone(f, t + i * 0.22, { wave: 'triangle', peak: 0.07, attack: 0.2, decay: 0.03, lowpass: 3000 }));
}

/** A hat popping off. Counting back, so every pop is a little lower. */
function hatPop(left: number): void {
  const f = 380 + left * 90;
  tone(f, now(), { wave: 'triangle', peak: 0.1, attack: 0.005, decay: 0.16, glideTo: f * 0.7 });
  noiseBurst(now(), { freq: 1800, q: 1, peak: 0.05, decay: 0.08 });
}

// --------------------------------------------------------------------- art

/** Changes what a number card says. */
function setCard(el: HTMLElement, text: string, color?: string): void {
  const inner = el.querySelector<HTMLElement>(':scope > .story-flip');
  if (inner) inner.innerHTML = numberCard(text, color);
}

// ------------------------------------------------------------------- story

const TOPSY = { x: 770, y: 206, w: 220 };
/** Where the soles of his boots are, on stage. */
const S = TOPSY.w / 300;
const FEET: Pt[] = [
  [TOPSY.x + 98 * S, TOPSY.y + 32 * S],
  [TOPSY.x + 206 * S, TOPSY.y + 30 * S],
];
/** Five hats: three on his right boot, two on his left, taken off from the top. */
const STACK: Array<[foot: number, level: number]> = [[1, 0], [0, 0], [1, 1], [0, 1], [1, 2]];

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'A new land at the top of the tree! And everything was upside down.' },
    hello: { who: 'topsy', text: 'Ereh emoclew! I mean… welcome! I’m the Topsy-Turvy Man.' },
    watch: { who: 'topsy', text: 'Here we count backwards. One less… one less… one less!' },
    none: { who: 'narrator', text: 'Five, four, three, two, one… none! {name} counted every hat.' },
    gift: { who: 'hero', text: 'Look! An upside-down hat, just for you!' },
    next: { who: 'topsy', text: 'Teef no stah! I mean… hats on feet! Come and see!' },
  },

  async play(k) {
    k.landScene();
    k.music('magic');
    k.ambient('dust', { count: 14 });

    // ---- Off the ladder, into nonsense.
    const hero = k.character('hero', { x: 110, y: 350, w: 270, z: 12 });
    const arms = k.pivot([...k.part(hero, 'armL'), ...k.part(hero, 'armR')]);
    k.set(hero, { opacity: 0 });
    k.fx.patter(4);
    await k.enter(hero, 'bottom', 0.8);
    const flip = async () => {
      await k.wait(1200);
      whoop();
      await k.to(hero, 0.5, { rotation: 180, y: -60, ease: 'back.out(1.4)' });
      await k.blink(hero);
      await k.wait(500);
      whoop(true);
      await k.to(hero, 0.5, { rotation: 360, y: 0, ease: 'back.out(1.4)' });
      k.set(hero, { rotation: 0 });
      k.fx.boing();
    };
    await k.all(k.say('intro'), flip());

    // ---- He hand-walks in, five hats wobbling on one foot.
    const topsy = k.add(topsyTall(), { ...TOPSY, z: 10 });
    const legs = k.pivot([...k.part(topsy, 'legL'), ...k.part(topsy, 'legR')]);
    const hats = STACK.map(([f, l], i) => k.prop('hat', { x: FEET[f][0] - 28 + (l % 2 ? 3 : -3), y: FEET[f][1] - 52 - l * 34, w: 56, z: 11 + i }));
    const troupe = [topsy, ...hats];
    k.set(troupe, { x: 520 });
    slaps(8);
    await k.to(troupe, 1.3, { x: 0, ease: 'power1.out' });
    void k.to(hats, 0.3, { rotation: 6, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    backwards();
    void k.camera({ zoom: 1.15, x: 820, y: 330 }, 1.2);
    await k.say('hello', topsy);
    void k.camera({}, 0.8);

    // ---- One less, one less, one less: the hats fly off from the top.
    const card = k.add(numberCard('5'), { x: 540, y: 150, w: 150, z: 20 });
    await k.appear(card, 0.3);
    const fling = async () => {
      for (let i = 4; i >= 0; i--) {
        const leg = legs[STACK[i][0]];
        if (leg) void k.to(leg, 0.12, { rotation: STACK[i][0] ? 10 : -10 }).then(() => k.to(leg, 0.18, { rotation: 0 }));
        hatPop(i);
        const hat = hats[i];
        if (i === 0) {
          // The last one sails over to the hero and stays (it becomes the keepsake).
          await k.to(hat, 0.5, { x: -520, y: 60, rotation: -540, opacity: 0, ease: 'power1.in' });
        } else {
          void k.to(hat, 0.7, { x: `+=${(STACK[i][0] ? 1 : -1) * (120 + i * 30)}`, y: -320, rotation: 300 + i * 40, opacity: 0, ease: 'power1.out' });
        }
        setCard(card, String(i), i === 0 ? C.lemonade : C.cream);
        void k.pop(card, 1.18);
        await k.wait(i === 0 ? 100 : 560);
      }
    };
    await k.all(k.say('watch', topsy), fling());
    await k.say('none');

    // ---- The keepsake drops on the hero's head, upside down of course.
    const hatKeep = k.keepsake(k.chapter!.keepsake, { x: 168, y: 268, w: 150, z: 16 });
    k.set(hatKeep, { y: -360, rotation: -20 });
    await k.to(hatKeep, 0.55, { y: 0, rotation: 0, ease: 'bounce.out' });
    k.fx.thud();
    k.sparkle(245, 330, 14);
    void k.to(arms, 0.25, { rotation: -18, yoyo: true, repeat: 1 });
    await k.say('gift', hero);

    // ---- Back to front: off to the hats on feet.
    k.remove(card);
    backwards();
    const kicks = async () => {
      for (let i = 0; i < 3; i++) {
        await k.to(legs, 0.15, { rotation: (j: number) => (j ? 14 : -14) });
        await k.to(legs, 0.15, { rotation: 0 });
      }
    };
    await k.all(k.say('next', topsy), kicks(), k.hop(hero, 40, 2));
    k.fx.twinkle();
    await k.wait(600);
  },
});
