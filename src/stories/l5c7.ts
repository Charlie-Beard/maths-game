/**
 * Land 5, chapter 7: Make a Wish.
 *
 * Evening in the party tent, and his birthday cake glows: sixteen candles,
 * a row of ten and six more on top. Fran (or Beth, if he climbs with Fran)
 * says take a big breath: whoosh, the row of ten goes out, and sixteen take
 * away ten leaves six; whoosh, all out (the chapter's adding and taking
 * away within 20). Eyes shut, and a wishing star rises from the smoke:
 * {name} wishes that the Folk of the Faraway Tree will always be safe.
 * Moon-Face says what a kind wish… and then the ground starts to rumble.
 * The land is moving on! Next: The Birthday Wish (the land's finale).
 */
import { balloon, bunting, sceneSvg, sky } from '../art/lands/common';
import { bell, C, circle, curve, defineStory, ellipse, group, ink, NOTE, noiseBurst, now, piece, rect, svg, tone, type Kit } from './kit';
import { numberTag } from './bits';

// ------------------------------------------------------------------ sounds

/** A big birthday breath: a whoosh of air. */
function whoosh(): void {
  const t = now();
  noiseBurst(t, { freq: 900, q: 0.8, peak: 0.16, attack: 0.08, decay: 0.55, sweepTo: 2400 });
  noiseBurst(t + 0.05, { freq: 400, type: 'lowpass', peak: 0.08, attack: 0.05, decay: 0.4 });
}

/** The wish: a slow, rising chime. */
function wishChime(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6].forEach((f, i) => bell(f, t + i * 0.28, 0.07, 1.4));
}

/** A party blower (one, soft). */
function blower(): void {
  const t = now();
  tone(340, t, { wave: 'sawtooth', peak: 0.05, attack: 0.04, decay: 0.5, glideTo: 490, vibrato: [24, 16], lowpass: 1500 });
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];

/** The party tent in the evening: dusky canvas, garlands, a strip of starry sky. */
function eveningTent(): string {
  return sceneSvg('l5c7-tent', [
    ...sky([
      [C.duskHigh, 0],
      ['#c99a6a', 220],
      ['#d9b47f', 460],
    ]),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(rect(i * 180 - 40, 200, 80, 500), '#e7c693', { edge: 'cut', fibre: false, shadow: false, opacity: 0.4 })),
    ...[[120, 60], [300, 110], [520, 40], [760, 90], [980, 50], [1100, 130]].map(([x, y]) => piece(circle(x, y, 4), C.cream, { edge: 'clean', shadow: false })),
    ...bunting([-20, 200], [600, 190], 50, FLAGS, 28),
    ...bunting([580, 190], [1200, 204], 50, FLAGS, 28),
    ...balloon(110, 290, 38, C.gold, 140),
    ...balloon(1070, 280, 38, C.pink, 150),
    piece(rect(-20, 600, 1220, 240), '#efe2cc', { rough: 0.6 }),
    ...Array.from({ length: 15 }, (_, i) => piece(rect(-20 + i * 85, 600, 42, 240), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.45 })),
  ]);
}

/** The birthday cake: a big round bottom tier. */
function cake(): string {
  const drips: [number, number][] = [[20, 64]];
  for (let k = 0; k <= 12; k++) drips.push([20 + (k / 12) * 600, 92 + (k % 2 ? 26 : 6)]);
  drips.push([620, 64]);
  return svg({ w: 640, h: 300, name: 'l5c7-cake' }, [
    piece(ellipse(320, 262, 318, 34), C.china),
    piece(rect(20, 60, 600, 200, 18), C.cakeSponge, { rough: 0.7 }),
    piece(rect(20, 170, 600, 18), C.giftBlue, { edge: 'cut', fibre: false, shadow: false }),
    piece(curve(drips, 1), C.icing, { rough: 0.6 }),
    piece(ellipse(320, 62, 300, 44), C.icing, { rough: 0.5 }),
  ]);
}

/** The top tier, behind the front row of candles. */
function topTier(): string {
  const drips: [number, number][] = [[10, 34]];
  for (let k = 0; k <= 6; k++) drips.push([10 + (k / 6) * 340, 52 + (k % 2 ? 18 : 4)]);
  drips.push([350, 34]);
  return svg({ w: 360, h: 140, name: 'l5c7-top' }, [
    piece(rect(10, 30, 340, 110, 12), C.cakeSponge, { rough: 0.7 }),
    piece(curve(drips, 1), C.pink, { rough: 0.6 }),
    piece(ellipse(180, 32, 170, 24), C.pink, { rough: 0.5 }),
  ]);
}

/** A lit candle; its `flame` part goes out. */
function candle(color: string, stripe: string, n: number): string {
  return svg({ w: 50, h: 140, name: `l5c7-candle-${n}` }, [
    piece(rect(15, 50, 20, 88, 4), color, { edge: 'cut' }),
    ...[64, 88, 112].map((y) => piece(curve([[15, y + 8], [35, y - 4], [35, y + 2], [15, y + 14]], 1), stripe, { edge: 'cut', fibre: false, shadow: false })),
    ink([[25, 50], [25, 40]], { width: 2.5, color: C.ink }),
    group({ part: 'flame' }, [
      piece(curve([[25, 4], [36, 24], [33, 40], [17, 40], [14, 24]], 2), C.flame, { edge: 'cut' }),
      piece(curve([[25, 18], [30, 28], [29, 38], [21, 38], [20, 28]], 2), C.lemon, { edge: 'cut', fibre: false, shadow: false }),
    ]),
  ]);
}

/** A curl of smoke from a blown-out candle. */
function wisp(n: number): string {
  return svg({ w: 40, h: 80, name: `l5c7-wisp-${n}`, boil: false }, [ink([[20, 78], [12, 60], [26, 42], [14, 22], [22, 4]], { width: 3, color: C.stoneLight, opacity: 0.8 })]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    breath_fran: { who: 'fran', text: 'Sixteen candles: ten in a row and six more. Take a big, big breath!' },
    breath_beth: { who: 'beth', text: 'Sixteen candles: ten in a row and six more. Take a big, big breath!' },
    blow: { who: 'narrator', text: 'Whoosh! Ten out. Sixteen take away ten leaves six. Whoosh! All out!' },
    eyes_fran: { who: 'fran', text: 'Now close your eyes and make a wish.' },
    eyes_beth: { who: 'beth', text: 'Now close your eyes and make a wish.' },
    wish: { who: 'narrator', text: '{name} wished that the Folk of the Faraway Tree would always, always be safe.' },
    kind: { who: 'moonface', text: 'What a kind wish, {name}. Oh! What’s that rumbling?' },
    run: { who: 'silky', text: 'The land is moving on! Quick, run for the tree!' },
  },

  async play(k: Kit) {
    // Fran hosts, unless the hero is Fran: then Beth does.
    const host = k.hero === 'fran' ? 'beth' : 'fran';
    k.backdrop(eveningTent());
    k.music('dreamy');

    const cakeEl = k.add(cake(), { x: 270, y: 400, w: 640, z: 12 });
    const top = k.add(topTier(), { x: 410, y: 300, w: 360, z: 13 });
    const FRONT_Y = 490 - 138;
    const BACK_Y = 342 - 138;
    const back = Array.from({ length: 6 }, (_, i) => k.add(candle(C.pink, C.white, 10 + i), { x: 440 + i * 52, y: BACK_Y, w: 50, z: 14 }));
    const front = Array.from({ length: 10 }, (_, i) => k.add(candle(i % 2 ? C.giftBlue : C.white, i % 2 ? C.white : C.red, i), { x: 330 + i * 54, y: FRONT_Y, w: 50, z: 15 }));
    const all = [...front, ...back, cakeEl, top];
    const glowFront = k.light(590, 380, 300, { strength: 0.35, flicker: true, z: 11 });
    const glowBack = k.light(590, 230, 200, { strength: 0.35, flicker: true, z: 11 });

    const hostEl = k.character(host, { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'right'));

    const sixteen = k.add(numberTag('16', C.goldLight, 'l5c7-tag-sixteen'), { x: 530, y: 560, w: 120, z: 17 });
    const minus = k.add(numberTag('−10', C.sky, 'l5c7-tag-minus'), { x: 530, y: 560, w: 120, z: 17 });
    const six = k.add(numberTag('6', C.pink, 'l5c7-tag-six'), { x: 540, y: 560, w: 100, z: 17 });
    [minus, six].forEach((t) => k.set(t, { opacity: 0 }));
    void k.pop(sixteen, 1.15);
    await k.say(`breath_${host}`, hostEl);

    /** Blows out a set of candles, with curls of smoke. */
    const blowOut = (cs: HTMLElement[], offset: number) => {
      whoosh();
      cs.forEach((c, i) => {
        k.set(k.part(c, 'flame'), { opacity: 0 });
        void k.to(c, 0.1, { rotation: -6, transformOrigin: '50% 100%' }).then(() => k.to(c, 0.25, { rotation: 0, ease: 'back.out(3)' }));
        const w = k.add(wisp(offset + i), { x: parseFloat(c.style.left) + 5, y: parseFloat(c.style.top) - 60, w: 40, z: 16 });
        k.set(w, { opacity: 0 });
        void k.to(w, 0.3, { opacity: 1 }).then(() => k.to(w, 1.2, { y: -60, opacity: 0, ease: 'none' })).then(() => k.remove(w));
      });
    };
    const blowing = async () => {
      await k.wait(300);
      blowOut(front, 0);
      void k.fade(glowFront, 0, 0.4);
      void k.fade(sixteen, 0, 0.2);
      await k.appear(minus, 0.3);
      await k.wait(1100);
      void k.fade(minus, 0, 0.3);
      await k.appear(six, 0.3);
      await k.wait(900);
      blowOut(back, 10);
      void k.fade(glowBack, 0, 0.4);
      void k.vanish(six, 0.3);
      blower();
    };
    await k.all(k.say('blow'), blowing());
    void k.hop(hero, 30, 1);
    await k.say(`eyes_${host}`, hostEl);

    // ---- Eyes shut: the tent goes dark, and a wishing star rises from the cake.
    k.silence();
    const night = k.dim(0, '#0b1030');
    void k.fade(night, 0.55, 0.8);
    k.part(hero, 'lids').forEach((l) => (l.style.opacity = '1'));
    k.part(hostEl, 'lids').forEach((l) => (l.style.opacity = '1'));
    const star = k.keepsake(k.chapter!.keepsake, { x: 510, y: 240, w: 160, z: 40 });
    const halo = k.light(590, 320, 160, { color: C.goldLight, strength: 0, z: 39 });
    k.set(star, { opacity: 0 });
    const rising = async () => {
      wishChime();
      await k.appear(star, 0.6);
      void k.fade(halo, 0.6, 0.6);
      k.sparkle(590, 320, 16, 160);
      await k.all(k.to(star, 2.4, { y: -160, ease: 'sine.inOut' }), k.to(halo, 2.4, { y: -160, ease: 'sine.inOut' }));
      k.fx.twinkle();
      k.sparkle(590, 160, 14, 140);
    };
    k.music('magic');
    await k.all(k.say('wish'), rising());

    // ---- Eyes open… and Moon-Face and Silky arrive just as the ground rumbles.
    void k.fade(night, 0, 0.6);
    k.part(hero, 'lids').forEach((l) => (l.style.opacity = '0'));
    k.part(hostEl, 'lids').forEach((l) => (l.style.opacity = '0'));
    const mf = k.character('moonface', { x: 250, y: 30, w: 220, z: 22 });
    const silky = k.character('silky', { x: 720, y: 30, w: 220, z: 22, flip: true });
    k.set([mf, silky], { opacity: 0 });
    void k.enter(silky, 'top', 0.7);
    await k.enter(mf, 'top', 0.6);
    const rumble = async () => {
      await k.wait(1500);
      k.silence();
      k.fx.rumble(2.2);
      void k.quake(6);
      await k.all(...all.map((el) => k.shake(el, 3, 2)), k.shake(mf, 6, 2), k.shake(hero, 6, 2));
    };
    await k.all(k.say('kind', mf), rumble());

    // ---- The land is moving on!
    k.music('adventure');
    k.fx.rumble(2.5);
    void k.quake(8);
    void k.shake(hostEl, 8, 2);
    await k.all(k.say('run', silky), k.shake(star, 6, 3), k.hop(hero, 30, 2));
    await k.wait(600);
  },
});
