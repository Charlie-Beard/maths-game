/**
 * Land 5, chapter 2: Candles in Tens.
 *
 * A close-up of the birthday cake, still dark. Silky flutters in and
 * touches her wand to the first candle, and the flames hop along the row
 * by themselves: one, two, three… ten, a whole row of ten. Then four more
 * at the back: ten and four make fourteen (the chapter's teen numbers, as
 * a ten and some more). Fourteen? Nobody here is fourteen! Is it the
 * cake's birthday? The music starts: pass the parcel, and maybe there's a
 * clue inside. Next: Pass the Parcel.
 */
import { balloon, bunting, sceneSvg, sky } from '../art/lands/common';
import { bell, C, circle, curve, defineStory, ellipse, group, ink, NOTE, noiseBurst, now, piece, rect, svg, tone, type Kit } from './kit';
import { numberTag } from './bits';

// ------------------------------------------------------------------ sounds

/** A candle catching: a tiny breathy fwip and a bell note, climbing the scale. */
function light(n: number): void {
  const t = now();
  const scale = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6, NOTE.D6, NOTE.E6, NOTE.G6, NOTE.C7];
  noiseBurst(t, { freq: 2600, q: 1.2, peak: 0.04, attack: 0.01, decay: 0.12, sweepTo: 1200 });
  bell(scale[n % scale.length], t + 0.02, 0.07, 0.6);
}

/** Silky's wings: a soft, quick flutter. */
function flutter(): void {
  const t = now();
  for (let i = 0; i < 5; i++) noiseBurst(t + i * 0.06, { freq: 3200, q: 2, peak: 0.025, decay: 0.04 });
}

/** A happy little "ta-da" when the sum comes out. */
function tada(): void {
  const t = now();
  tone(NOTE.G5, t, { wave: 'triangle', peak: 0.08, decay: 0.15, lowpass: 3000 });
  tone(NOTE.C6, t + 0.14, { wave: 'triangle', peak: 0.09, decay: 0.45, lowpass: 3000 });
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];

/** Inside the party tent: warm canvas walls, garlands and balloons, the table. */
function tent(): string {
  return sceneSvg('l5c2-tent', [
    ...sky([
      ['#e9c98a', 0],
      ['#f1d9a6', 300],
      ['#f5e3bd', 520],
    ]),
    // Tent stripes.
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(rect(i * 180 - 40, -20, 80, 700), '#f8ead0', { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 })),
    ...bunting([-20, 60], [600, 50], 60, FLAGS, 30),
    ...bunting([580, 50], [1200, 64], 60, FLAGS, 30),
    ...balloon(110, 150, 40, C.gold, 160),
    ...balloon(1080, 140, 42, C.blue, 170),
    ...balloon(1010, 210, 32, C.pink, 140),
    // The table.
    piece(rect(-20, 600, 1220, 240), C.white, { rough: 0.6 }),
    ...Array.from({ length: 15 }, (_, i) => piece(rect(-20 + i * 85, 600, 42, 240), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 })),
  ]);
}

/** A big round cake seen from the front: plate, sponge, icing with drips. */
function cake(): string {
  const drips: [number, number][] = [[20, 64]];
  for (let k = 0; k <= 12; k++) drips.push([20 + (k / 12) * 600, 92 + (k % 2 ? 26 : 6)]);
  drips.push([620, 64]);
  return svg({ w: 640, h: 300, name: 'l5c2-cake' }, [
    piece(ellipse(320, 262, 318, 34), C.china),
    piece(rect(20, 60, 600, 200, 18), C.cakeSponge, { rough: 0.7 }),
    piece(rect(20, 170, 600, 18), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(curve(drips, 1), C.icing, { rough: 0.6 }),
    piece(ellipse(320, 62, 300, 44), C.icing, { rough: 0.5 }),
    ...[60, 150, 240, 400, 490, 580].map((x, i) => piece(circle(x, 228 - (i % 2) * 6, 7), C.cherry, { edge: 'cut' })),
  ]);
}

/** The little top tier, which sits behind the front row of candles. */
function topTier(): string {
  const drips: [number, number][] = [[10, 34]];
  for (let k = 0; k <= 6; k++) drips.push([10 + (k / 6) * 300, 52 + (k % 2 ? 18 : 4)]);
  drips.push([310, 34]);
  return svg({ w: 320, h: 140, name: 'l5c2-top' }, [
    piece(rect(10, 30, 300, 110, 12), C.cakeSponge, { rough: 0.7 }),
    piece(rect(10, 96, 300, 12), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(curve(drips, 1), C.icing, { rough: 0.6 }),
    piece(ellipse(160, 32, 150, 24), C.icing, { rough: 0.5 }),
  ]);
}

/** One birthday candle with its flame hidden (the `flame` part): light it with opacity. */
function candle(color: string, stripe: string, n: number): string {
  return svg({ w: 50, h: 140, name: `l5c2-candle-${n}` }, [
    piece(rect(15, 50, 20, 88, 4), color, { edge: 'cut' }),
    ...[64, 88, 112].map((y) => piece(curve([[15, y + 8], [35, y - 4], [35, y + 2], [15, y + 14]], 1), stripe, { edge: 'cut', fibre: false, shadow: false })),
    ink([[25, 50], [25, 40]], { width: 2.5, color: C.ink }),
    group({ part: 'flame', opacity: 0 }, [
      piece(curve([[25, 4], [36, 24], [33, 40], [17, 40], [14, 24]], 2), C.flame, { edge: 'cut' }),
      piece(curve([[25, 18], [30, 28], [29, 38], [21, 38], [20, 28]], 2), C.lemon, { edge: 'cut', fibre: false, shadow: false }),
    ]),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    wand: { who: 'silky', text: 'Every birthday cake needs candles. Watch my wand!' },
    ten: { who: 'narrator', text: 'One, two, three… all the way to ten. A whole row of ten!' },
    more: { who: 'silky', text: 'And some more. Four more! Ten and four make fourteen.' },
    who: { who: 'hero', text: 'Fourteen candles? But nobody here is fourteen! Is it the cake’s birthday?' },
    next: { who: 'silky', text: 'Listen, the music’s starting! Pass the parcel. Maybe there’s a clue inside!' },
  },

  async play(k: Kit) {
    k.backdrop(tent());
    k.music('magic');
    k.ambient('dust', { count: 14 });

    k.add(cake(), { x: 270, y: 400, w: 640, z: 12 });
    k.add(topTier(), { x: 430, y: 300, w: 320, z: 13 });
    // A row of ten along the front, and four more up on the top tier.
    const FRONT_Y = 490 - 138;
    const BACK_Y = 342 - 138;
    const back = [0, 1, 2, 3].map((i) => k.add(candle(C.pink, C.white, 10 + i), { x: 475 + i * 60, y: BACK_Y, w: 50, z: 14 }));
    const front = Array.from({ length: 10 }, (_, i) => k.add(candle(i % 2 ? C.blue : C.white, i % 2 ? C.white : C.red, i), { x: 330 + i * 54, y: FRONT_Y, w: 50, z: 15 }));
    const flame = (el: HTMLElement) => k.part(el, 'flame');

    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const silky = k.character('silky', { x: 10, y: 190, z: 22 });
    const wings = [...k.part(silky, 'wingL'), ...k.part(silky, 'wingR')];
    const flap = () => {
      if (!wings.length) return;
      for (const w of wings) void k.to(w, 0.12, { scaleX: 0.7, ease: 'power1.inOut' }).then(() => k.to(w, 0.12, { scaleX: 1 }));
    };

    // ---- Silky flutters in.
    void k.enter(hero, 'right');
    flutter();
    flap();
    await k.enter(silky, 'left', 0.9);
    k.float(silky, 10, 2.2);
    await k.say('wand', silky);

    // ---- Her wand lights the first candle, and the flames hop along the row.
    const tip: [number, number] = [10 + 228, 190 + 114];
    const lightCandle = async (el: HTMLElement, n: number) => {
      light(n);
      k.set(flame(el), { opacity: 1, scale: 0.2, transformOrigin: '50% 100%' });
      await k.to(flame(el), 0.2, { scale: 1, ease: 'back.out(3)' });
    };
    const tenTag = k.add(numberTag('10', C.goldLight, 'l5c2-tag-ten'), { x: 540, y: 560, w: 100, z: 16 });
    const fourTag = k.add(numberTag('4', C.sky, 'l5c2-tag-four'), { x: 765, y: 240, w: 90, z: 16 });
    const sumTag = k.add(numberTag('14', C.pink, 'l5c2-tag-fourteen'), { x: 530, y: 552, w: 120, z: 17 });
    [tenTag, fourTag, sumTag].forEach((t) => k.set(t, { opacity: 0 }));
    const tenRow = async () => {
      flap();
      k.fx.spell();
      await k.beam(tip, [355, FRONT_Y + 20], C.goldLight, 0.35);
      for (const [i, c] of front.entries()) {
        void lightCandle(c, i);
        void k.hop(c, 6, 1);
        await k.wait(230);
      }
      k.light(590, 340, 300, { strength: 0.35, flicker: true, z: 11 });
      await k.appear(tenTag, 0.3);
    };
    await k.all(k.say('ten'), tenRow());

    // ---- And four more at the back.
    const fourMore = async () => {
      flap();
      k.fx.spell();
      await k.beam(tip, [495, BACK_Y + 20], C.goldLight, 0.3);
      for (const [i, c] of back.entries()) {
        void lightCandle(c, 10 + i);
        await k.wait(300);
      }
      await k.appear(fourTag, 0.3);
      await k.wait(300);
      tada();
      void k.fade(tenTag, 0, 0.3);
      void k.fade(fourTag, 0, 0.3);
      await k.appear(sumTag, 0.4);
      k.sparkle(590, 590, 12, 120);
    };
    await k.all(k.say('more', silky), fourMore());

    // ---- Fourteen? Nobody's fourteen!
    void k.shake(hero, 8, 2);
    await k.say('who', hero);

    // ---- A spare candle for the treasure room, and off to pass the parcel.
    await k.vanish(sumTag, 0.3);
    const keep = k.keepsake(k.chapter!.keepsake, { x: 520, y: 520, w: 140, z: 18 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(keep, 0.45);
    k.sparkle(590, 580, 14, 140);
    // The pass-the-parcel music, faintly, from next door.
    const t = now() + 0.4;
    [NOTE.E5, NOTE.G5, NOTE.E5, NOTE.C5, NOTE.D5, NOTE.E5].forEach((f, i) => tone(f, t + i * 0.22, { wave: 'square', peak: 0.025, decay: 0.16, lowpass: 1800 }));
    await k.all(k.say('next', silky), k.hop(hero, 30, 2));
    k.fx.jingle();
    k.confetti(16);
    flap();
    await k.wait(900);
  },
});
