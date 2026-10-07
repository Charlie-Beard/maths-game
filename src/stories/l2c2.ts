/**
 * Land 2, chapter 2: Hats on Feet.
 *
 * In Topsy-Turvy Land hats go on feet. The Topsy-Turvy Man stands on his
 * hands with four hats stacked on one boot and two on the other. Which foot
 * has more? {name} and the hero count them: four is more, two is fewer (the
 * bigger card swells with a star, the smaller one shrinks). Then he wobbles,
 * and every hat comes tumbling down, all but one boot with a hat on it (the
 * keepsake). Clink, clink: teacups up on the ceiling. Next: Take Away Teacups.
 */
import { topsyTall } from '../art/characters';
import { C, defineStory, noiseBurst, now, piece, raw, rect, svg, tone, type Pt } from './kit';
import { numberCard, tick } from './bits';

// ------------------------------------------------------------------ sounds

/** A wobble: a long, bendy "wah-wah-wah". */
function wobble(seconds = 1.2): void {
  const t = now();
  tone(260, t, { wave: 'triangle', peak: 0.09, attack: 0.05, decay: seconds, vibrato: [6, 40], glideTo: 200, lowpass: 1600 });
}

/** Hats landing on the grass, one after another, soft and floppy. */
function flumps(n: number, gap = 0.14): void {
  const t = now();
  for (let i = 0; i < n; i++) {
    noiseBurst(t + i * gap, { freq: 320, type: 'lowpass', peak: 0.12, attack: 0.005, decay: 0.12 });
    tone(140 - i * 8, t + i * gap, { peak: 0.06, decay: 0.1, glideTo: 80 });
  }
}

/** China clinking far above. */
function clink(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    const f = 2400 + (i % 2) * 380;
    tone(f, t + i * 0.28, { peak: 0.06, attack: 0.002, decay: 0.25 });
    tone(f * 1.51, t + i * 0.28, { peak: 0.025, attack: 0.002, decay: 0.15 });
  }
}

// --------------------------------------------------------------------- art

/** A little word tag ("more", "fewer") on a torn strip. */
function wordTag(text: string, color: string): string {
  return svg({ w: 200, h: 80, name: `l2c2-tag-${text}`, boil: false }, [
    piece(rect(8, 10, 184, 60, 14), color, { rough: 1 }),
    raw(`<text x="100" y="54" font-family="Andika, sans-serif" font-weight="700" font-size="40" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------- story

const TOPSY = { x: 700, y: 210, w: 220 };
const S = TOPSY.w / 300;
/** The soles of his boots, on stage: [left, right]. */
const FEET: Pt[] = [
  [TOPSY.x + 98 * S, TOPSY.y + 32 * S],
  [TOPSY.x + 206 * S, TOPSY.y + 30 * S],
];
const HAT = 56;
const STEP = 38;

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'In Topsy-Turvy Land, people wear their hats on their feet!' },
    which: { who: 'topsy', text: 'Stah no teef! I mean… hats on feet! Which foot has more?' },
    count: { who: 'hero', text: 'This foot has four hats. That foot has two.' },
    more: { who: 'narrator', text: 'Four is more. Two is fewer. {name} got it!' },
    oops: { who: 'topsy', text: 'Oops-a-daisy! Never mind. Here’s a hat for your foot!' },
    next: { who: 'hero', text: 'Listen! Clink, clink! Teacups on the ceiling. Moon-Face needs us!' },
  },

  async play(k) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 12 });

    const hero = k.character('hero', { x: 90, y: 360, w: 260, z: 12 });
    const topsy = k.add(topsyTall(), { ...TOPSY, z: 10 });
    const legs = k.pivot([...k.part(topsy, 'legL'), ...k.part(topsy, 'legR')]);
    const stack = (foot: number, n: number) =>
      Array.from({ length: n }, (_, i) =>
        k.prop('hat', { x: FEET[foot][0] - HAT / 2 + (i % 2 ? 4 : -4), y: FEET[foot][1] - HAT + 4 - i * STEP, w: HAT, z: 11 + i }),
      );
    const left = stack(0, 4);
    const right = stack(1, 2);
    const hats = [...left, ...right];
    // A little tilt each, so every hat in a stack reads as its own.
    const tilt = (i: number) => (i % 2 ? 7 : -7);
    hats.forEach((h, i) => k.set(h, { rotation: tilt(i) }));
    k.set([hero, topsy, ...hats], { opacity: 0 });

    // ---- Hats on feet: he hand-walks in from the right, balancing.
    k.set([hero], { opacity: 1 });
    k.fx.patter(4);
    await k.enter(hero, 'left', 0.6);
    k.set([topsy, ...hats], { opacity: 1, x: 560 });
    const arrive = async () => {
      k.fx.patter(10, 0.13);
      await k.to([topsy, ...hats], 1.4, { x: 0, ease: 'power1.out' });
      void k.to(hats, 0.25, { rotation: (i: number) => -tilt(i), yoyo: true, repeat: 3, ease: 'sine.inOut' });
    };
    await k.all(k.say('intro'), arrive());
    void k.camera({ zoom: 1.2, x: 790, y: 300 }, 1.2);
    await k.say('which', topsy);

    // ---- Count each foot: a tick for every hat, then the cards.
    const cardL = k.add(numberCard('4'), { x: 560, y: 120, w: 120, z: 20 });
    const cardR = k.add(numberCard('2'), { x: 892, y: 110, w: 120, z: 20 });
    k.set([cardL, cardR], { opacity: 0 });
    const counting = async () => {
      for (const [i, h] of left.entries()) {
        tick(i, 520);
        void k.pop(h, 1.25);
        await k.wait(330);
      }
      await k.appear(cardL, 0.3);
      await k.wait(250);
      for (const [i, h] of right.entries()) {
        tick(i, 520);
        void k.pop(h, 1.25);
        await k.wait(330);
      }
      await k.appear(cardR, 0.3);
    };
    await k.all(k.say('count', hero), counting());
    void k.camera({}, 0.9);

    // ---- More and fewer: the four swells, the two shrinks.
    const tagMore = k.add(wordTag('more', C.lemonade), { x: 530, y: 236, w: 170, z: 21 });
    const tagFewer = k.add(wordTag('fewer', C.candyPink), { x: 868, y: 226, w: 170, z: 21 });
    k.set([tagMore, tagFewer], { opacity: 0 });
    const compare = async () => {
      k.fx.twinkle();
      await k.all(k.to(cardL, 0.4, { scale: 1.3, ease: 'back.out(2)' }), k.appear(tagMore, 0.35));
      k.sparkle(620, 180, 10, 100);
      await k.wait(500);
      k.sfx.place(0);
      await k.all(k.to(cardR, 0.4, { scale: 0.8, ease: 'back.out(2)' }), k.appear(tagFewer, 0.35));
    };
    await k.all(k.say('more'), compare(), k.hop(hero, 30, 1));

    // ---- The wobble: every hat comes down.
    wobble(1.3);
    await k.all(
      k.shake(topsy, 8, 3),
      k.to(legs, 0.18, { rotation: (i: number) => (i ? 16 : -16), yoyo: true, repeat: 3 }),
      k.to(hats, 0.18, { rotation: (i: number) => (i % 2 ? 14 : -14), yoyo: true, repeat: 3 }),
    );
    k.set(legs, { rotation: 0 });
    flumps(6);
    void k.vanish(cardL);
    void k.vanish(cardR);
    void k.vanish(tagMore);
    void k.vanish(tagFewer);
    await k.to(hats, 0.6, {
      x: (i: number) => (i < 4 ? -140 - i * 40 : 120 + i * 20),
      y: (i: number) => 400 + (i % 3) * 14 + (i < 4 ? i : i - 4) * STEP,
      rotation: (i: number) => (i % 2 ? 200 : -160),
      ease: 'bounce.out',
    });
    void k.quake(4);

    // The keepsake: a boot with a hat on it, from his own collection.
    const keep = k.keepsake(k.chapter!.keepsake, { x: 330, y: 230, w: 180, z: 22 });
    k.set(keep, { opacity: 0 });
    await k.appear(keep, 0.45);
    k.fx.twinkle();
    k.sparkle(420, 320, 14);
    k.float(keep, 8, 1.8);
    await k.say('oops', topsy);

    // ---- Clink, clink: teacups hanging upside down above.
    const cups = [0, 1, 2].map((i) => k.prop('teacup', { x: 360 + i * 150, y: -100, w: 80, z: 9 }));
    k.set(cups, { rotation: 180 });
    clink(3);
    const dangle = async () => {
      await k.to(cups, 0.6, { y: 210, ease: 'back.out(1.6)' });
      void k.to(cups, 0.3, { rotation: (i: number) => (i % 2 ? 170 : 190), yoyo: true, repeat: 5, ease: 'sine.inOut' });
      clink(2);
    };
    await k.all(k.say('next', hero), dangle(), k.to(hero, 0.4, { rotation: -6, ease: 'power2.out' }));
    await k.wait(500);
  },
});
