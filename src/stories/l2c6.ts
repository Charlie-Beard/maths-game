/**
 * Land 2, chapter 6: Walking on Ceilings.
 *
 * A long hall where the ceiling is the floor. Joe (or Fran, when he climbs
 * with Joe) and the hero flip up onto it with a slide whistle and hang
 * there upside down, hair dangling. The ceiling tiles are numbered
 * 10, 9, 8 … and they walk along counting back: nine, eight, seven, six
 * (each step knocks, each number lights up, a big card follows along).
 * Three steps back from nine is six: 9 − 3 = 6. A boot drops off the
 * ceiling and bounces on the floor (the keepsake). Cups clink: Silky's tea
 * party. Next: the Topsy-Turvy Tea Party.
 */
import { C, circle, defineStory, ellipse, ink, noiseBurst, now, piece, poly, raw, rect, svg, tone } from './kit';

// ------------------------------------------------------------------ sounds

/** A slide whistle up and over: flipping onto the ceiling. */
function whoop(): void {
  tone(300, now(), { wave: 'sine', peak: 0.1, attack: 0.03, decay: 0.5, glideTo: 1200, vibrato: [7, 12] });
}

/** A footstep on the ceiling: a hollow knock from above. */
function knock(i: number): void {
  const t = now();
  tone(260 - i * 18, t, { peak: 0.18, decay: 0.1, glideTo: 150 });
  noiseBurst(t, { freq: 1100, q: 1.2, peak: 0.08, decay: 0.05 });
}

/** A tummy gurgle (it's funny being upside down). */
function gurgle(): void {
  const t = now();
  tone(110, t, { wave: 'triangle', peak: 0.12, attack: 0.05, decay: 0.7, vibrato: [11, 30], glideTo: 80, lowpass: 600 });
  tone(160, t + 0.4, { wave: 'triangle', peak: 0.08, attack: 0.04, decay: 0.4, vibrato: [14, 30], glideTo: 120, lowpass: 600 });
}

/** A boot falling: a whistle down, then a rubbery boing on the floor. */
function bootDrop(): void {
  tone(1300, now(), { wave: 'sine', peak: 0.07, attack: 0.02, decay: 0.5, glideTo: 380 });
}

/** China clinking somewhere close. */
function clink(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    const f = 2400 + (i % 2) * 380;
    tone(f, t + i * 0.26, { peak: 0.06, attack: 0.002, decay: 0.25 });
    tone(f * 1.51, t + i * 0.26, { peak: 0.025, attack: 0.002, decay: 0.15 });
  }
}

// --------------------------------------------------------------------- art

/** Tile centres along the ceiling, and the number on each (counting back left to right). */
const TILE_X = [140, 290, 440, 590, 740, 890, 1040];
const TILE_N = [10, 9, 8, 7, 6, 5, 4];
const CEIL = 150;

/**
 * The hall: the ceiling is a chequered floor with numbered tiles, the real
 * floor far below has a rug and a lamp that hangs upward, and the portraits
 * on the walls are all upside down.
 */
function hall(): string {
  return svg({ w: 1180, h: 820, name: 'l2c6-hall', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#cdb7e0', { edge: 'clean', shadow: false }),
    // Wallpaper of pink dots.
    ...Array.from({ length: 40 }, (_, i) => piece(circle(40 + (i % 10) * 120 + (Math.floor(i / 10) % 2) * 60, 210 + Math.floor(i / 10) * 100, 9), C.candyPink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 })),
    // The ceiling, which here is the floor: wooden boards with numbered tiles.
    piece(rect(-20, -20, 1220, CEIL + 20), C.wood, { rough: 1.1 }),
    ...TILE_X.map((x, i) => piece(rect(x - 66, 24, 132, 112, 8), i % 2 ? C.cream : C.lemonade, { edge: 'cut' })),
    ...TILE_X.map((x, i) =>
      raw(`<text x="${x}" y="108" font-family="Andika, sans-serif" font-weight="700" font-size="72" fill="${C.plum}" text-anchor="middle">${TILE_N[i]}</text>`),
    ),
    piece(rect(-20, CEIL - 10, 1220, 14, 3), C.barkDark, { edge: 'cut', fibre: false }),
    // Pictures on the wall, hung upside down.
    piece(rect(70, 330, 120, 90, 4), C.wood),
    piece(rect(82, 342, 96, 66), C.topsySky, { edge: 'cut', fibre: false }),
    piece(poly([[90, 346], [170, 346], [130, 396]]), C.topsyGreen, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(990, 320, 110, 110, 4), C.wood),
    piece(circle(1045, 375, 40), C.lemonade, { edge: 'cut', fibre: false }),
    // The real floor, a long way down, with a rug and a lamp that hangs up.
    piece(rect(-20, 600, 1220, 240), C.plum, { rough: 1.1 }),
    piece(ellipse(590, 650, 380, 34), C.topsyPink, { rough: 1.3 }),
    piece(ellipse(590, 650, 300, 22), C.lemonade, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    ink([[1120, 600], [1120, 470]], { width: 4, color: C.charcoal }),
    piece(poly([[1090, 470], [1150, 470], [1136, 430], [1104, 430]]), C.topsyGreen),
  ]);
}

/** A torn paper disc with a number on it, or a wide card for a number sentence. */
function card(text: string, color: string = C.cream): string {
  const w = text.length > 2 ? 400 : 160;
  return svg({ w, h: 160, name: `l2c6-card-${text}-${color}`, boil: false }, [
    piece(text.length > 2 ? rect(8, 14, w - 16, 132, 30) : ellipse(80, 80, 72, 72), color, { rough: 1.2 }),
    raw(`<text x="${w / 2}" y="112" font-family="Andika, sans-serif" font-weight="700" font-size="88" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

/** A soft glow ring that sits over the tile you're standing under. */
function ring(): string {
  return svg({ w: 160, h: 140, name: 'l2c6-ring', boil: false }, [raw(`<rect x="8" y="8" width="144" height="124" rx="12" fill="none" stroke="${C.topsyPink}" stroke-width="10"/>`)]);
}

// ------------------------------------------------------------------- story

const W = 270;
/** Portrait height at this width. */
const PH = (W * 340) / 300;

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'In Topsy-Turvy Land, you can walk on the ceiling. {name} gave it a go!' },
    tummyJoe: { who: 'joe', text: 'Whoa! My tummy feels funny. Let’s count back along the tiles!' },
    tummyFran: { who: 'fran', text: 'Whoa! My tummy feels funny. Let’s count back along the tiles!' },
    count: { who: 'narrator', text: 'Nine… eight… seven… six! Three steps back from nine is six.' },
    boot: { who: 'hero', text: 'Look! A boot fell off the ceiling. It’s for you, {name}!' },
    nextJoe: { who: 'joe', text: 'Can you hear that? Clinking cups. It’s Silky’s tea party!' },
    nextFran: { who: 'fran', text: 'Can you hear that? Clinking cups. It’s Silky’s tea party!' },
  },

  async play(k) {
    // Joe hosts; if he climbs with Joe, Fran hosts instead.
    const hostId = k.hero === 'joe' ? 'fran' : 'joe';
    const L = hostId === 'joe' ? ({ tummy: 'tummyJoe', next: 'nextJoe' } as const) : ({ tummy: 'tummyFran', next: 'nextFran' } as const);

    k.backdrop(hall());
    k.music('adventure');
    k.ambient('dust', { count: 12 });

    // They start on the real floor, the right way up, under tiles 10 and 9.
    const floorY = 600 - PH + 40;
    const hero = k.character('hero', { x: TILE_X[1] - W / 2, y: floorY, w: W, z: 12 });
    const host = k.character(hostId, { x: TILE_X[0] - W / 2 - 90, y: floorY, w: W, z: 11 });
    const hair = k.pivot([...k.part(hero, 'hair'), ...k.part(host, 'hair')]);
    k.set([hero, host], { opacity: 0 });
    const glow = k.add(ring(), { x: TILE_X[1] - 80, y: 10, w: 160, z: 3 });
    k.set(glow, { opacity: 0 });

    // ---- Flip! Up onto the ceiling.
    const flipUp = async () => {
      k.fx.patter(4);
      await k.all(k.enter(hero, 'left', 0.6), k.enter(host, 'left', 0.6));
      await k.wait(1100);
      whoop();
      await k.all(
        k.to(hero, 0.6, { y: CEIL - floorY, rotation: 180, ease: 'back.out(1.3)' }),
        k.to(host, 0.6, { y: CEIL - floorY, rotation: 180, ease: 'back.out(1.3)', delay: 0.15 }),
      );
      k.fx.thud();
      // Hair dangles the other way now.
      if (!k.calm) void k.to(hair, 0.4, { rotation: 10, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    };
    await k.all(k.say('intro'), flipUp());

    gurgle();
    await k.all(k.say(L.tummy, host), k.shake(host, 4, 2));

    // ---- Count back along the tiles: 9, 8, 7, 6.
    const big = k.add(card('9'), { x: 510, y: 450, w: 160, z: 20 });
    k.set(big, { opacity: 0 });
    const walking = async () => {
      void k.camera({ zoom: 1.25, x: 560, y: 330 }, 1);
      await k.all(k.appear(big, 0.3), k.fade(glow, 1, 0.3));
      knock(0);
      await k.wait(500);
      for (let step = 1; step <= 3; step++) {
        const i = 1 + step;
        // A step along the ceiling: a little dip down (away from it) and back.
        await k.all(
          k.to([hero, host], 0.5, { x: `+=150`, ease: 'power1.inOut' }),
          k.to([hero, host], 0.25, { y: `+=12`, ease: 'power1.out' }).then(() => k.to([hero, host], 0.25, { y: `-=12`, ease: 'power1.in' })),
          k.to(glow, 0.5, { x: `+=150`, ease: 'power1.inOut' }),
        );
        knock(step);
        const inner = big.querySelector<HTMLElement>(':scope > .story-flip');
        if (inner) inner.innerHTML = card(String(TILE_N[i]), step === 3 ? C.lemonade : C.cream);
        void k.pop(big, 1.2);
        await k.wait(450);
      }
      const sum = k.add(card('9 − 3 = 6', C.lemonade), { x: 390, y: 450, w: 400, z: 21 });
      k.set(sum, { opacity: 0 });
      k.sfx.success();
      void k.fade(big, 0, 0.2);
      await k.appear(sum, 0.35);
      k.sparkle(590, 500, 12);
      await k.wait(1300);
      return sum;
    };
    const [, sum] = await Promise.all([k.say('count'), walking()]);

    // ---- A boot drops off the ceiling: the keepsake.
    const keep = k.keepsake(k.chapter!.keepsake, { x: 880, y: 472, w: 150, z: 22 });
    k.set(keep, { y: -472 + CEIL - 40, rotation: 180 });
    bootDrop();
    void k.fade(sum, 0, 0.4);
    void k.camera({}, 0.5);
    await k.to(keep, 0.6, { y: 0, rotation: 360, ease: 'bounce.out' });
    k.fx.boing();
    k.sparkle(955, 550, 12);
    await k.say('boot', hero);

    // ---- Clink, clink: tea!
    clink(3);
    await k.all(k.say(L.next, host), k.shake(hero, 4, 1));
    k.fx.twinkle();
    await k.wait(500);
  },
});
