/**
 * Land 2, chapter 8 (the land's finale): The Land Starts to Spin!
 *
 * Plays straight after the escape: he has just answered his way back to
 * the ladder. Four scenes:
 *
 *   1. Topsy-Turvy is spinning, faster and faster: the whole land sways,
 *      upside-down houses, teacups and trees whirl through the sky, and
 *      the Topsy-Turvy Man (standing on his head, of course) is in a flap.
 *      Moon-Face: down the ladder, quick!
 *   2. The ladder through the cloud: hand over hand, down and down, then a
 *      lurch (quake) and they tumble, spinning, through the mist, and grab
 *      on again just in time.
 *   3. Looking up from the top of the tree: the land spins away like a top
 *      into the sky, and the Topsy-Turvy Man waves goodbye, upside down.
 *   4. Home in Moon-Face's room: relief and laughter (the hero stands on
 *      their head), the spinning top and the seal of Topsy-Turvy. Then a
 *      sweet smell drifts in from the cloud: toffee, jelly, lemonade… the
 *      Land of Goodies is coming.
 */
import { landSeal } from '../art/keepsakes';
import { house } from '../art/lands/common';
import { band, bell, C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { flump, moonRoom, together, wave } from './l1c8';

// ------------------------------------------------------------------ sounds

/** The land turning: a whirring hum that winds up higher and higher. */
function windUp(seconds: number, from = 90, to = 260): void {
  const t = now();
  tone(from, t, { wave: 'sawtooth', peak: 0.05, attack: 0.3, decay: seconds, glideTo: to, vibrato: [6, 8], lowpass: 900 });
  noiseBurst(t, { freq: 400, q: 2, peak: 0.06, attack: seconds * 0.6, decay: seconds * 0.4, sweepTo: 1600 });
}

/** Something big whirling past overhead: a deep swoosh. */
function whirl(): void {
  const t = now();
  noiseBurst(t, { freq: 300, q: 1.2, peak: 0.14, attack: 0.15, decay: 0.5, sweepTo: 1200 });
  tone(180, t, { wave: 'triangle', peak: 0.05, attack: 0.1, decay: 0.5, glideTo: 90 });
}

/** A hand on a ladder rung: a small wooden clonk. */
function rung(i: number): void {
  const t = now();
  tone(i % 2 ? 300 : 260, t, { wave: 'triangle', peak: 0.1, attack: 0.003, decay: 0.08, glideTo: 180, lowpass: 1500 });
}

/** Tumbling: a falling slide whistle. */
function tumble(): void {
  const t = now();
  tone(1200, t, { wave: 'sine', peak: 0.08, attack: 0.02, decay: 1.1, glideTo: 260, vibrato: [7, 20] });
  noiseBurst(t, { freq: 900, q: 0.8, peak: 0.1, attack: 0.1, decay: 0.9, sweepTo: 300 });
}

/** The spinning top's hum, wobbling. */
function topHum(): void {
  const t = now();
  tone(330, t, { wave: 'triangle', peak: 0.06, attack: 0.1, decay: 2, vibrato: [5, 12], lowpass: 1600 });
  tone(495, t, { wave: 'sine', peak: 0.03, attack: 0.1, decay: 2, vibrato: [5, 16] });
}

/** Giggles: little bouncing "ha-ha-ha" chirps, going down. */
function giggle(base = 520): void {
  const t = now();
  for (let i = 0; i < 5; i++) tone(base - i * 30, t + i * 0.13, { wave: 'triangle', peak: 0.06, attack: 0.01, decay: 0.09, glideTo: base - i * 30 - 80, lowpass: 2200 });
}

/** A sweet, sugary shimmer (the smell of the Land of Goodies). */
function sweetSmell(): void {
  const t = now();
  [NOTE.E6, NOTE.C6, NOTE.G5, NOTE.A5, NOTE.E6].forEach((f, i) => bell(f, t + i * 0.18, 0.05, 1));
  tone(NOTE.C5, t, { peak: 0.03, attack: 0.6, decay: 1.6, vibrato: [4, 4] });
}

// --------------------------------------------------------------------- art

/** An upside-down house on its own, to whirl through the sky. */
function flyingHouse(i: number): string {
  const looks = [
    { wall: C.topsyPink, roof: C.topsyGreen, window: C.lemonade },
    { wall: C.lemonade, roof: C.purple, window: C.topsyPink },
    { wall: C.cream, roof: C.topsyPink, window: C.topsyGreen },
  ][i % 3];
  return svg({ w: 200, h: 200, name: 'l2c8-house' + i, boil: false }, [house(100, 120, 120, 96, { ...looks, flip: true, chimney: i % 2 === 0 })]);
}

/** A tree with its roots in the air, on its own. */
function flyingTree(i: number): string {
  const leaves = [C.topsyPink, C.leafDark, C.purple][i % 3];
  return svg({ w: 160, h: 220, name: 'l2c8-tree' + i, boil: false }, [
    piece(curve([[60, 220], [70, 140], [74, 60], [86, 60], [90, 140], [100, 220]], 2), C.bark),
    ...[[50, 40, 10], [80, 20, 0], [112, 40, -10]].map(([x, y, a]) => ink([[80, 70], [x, y]], { width: 6, color: C.bark, wobble: 1 + a * 0 })),
    piece(circle(80, 196, 54), leaves),
    piece(circle(44, 176, 30), leaves, { shadow: false }),
    piece(circle(118, 178, 32), leaves, { shadow: false }),
  ]);
}

/** A teacup flying upside down (it fell off the ceiling). */
function flyingCup(): string {
  return svg({ w: 120, h: 100, name: 'l2c8-cup', boil: false }, [
    piece(poly([[24, 20], [96, 20], [84, 80], [36, 80]]), C.white, { edge: 'cut' }),
    piece(ellipse(60, 84, 40, 9), C.white, { edge: 'cut' }),
    piece(circle(102, 46, 13), C.white, { edge: 'cut' }),
    piece(rect(26, 34, 68, 8), C.topsyPink, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** Swirly speed lines (the wind of the spin), drawn as a curl. */
function swirlArt(seed: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 40; i++) pts.push([100 + Math.cos(i / 5) * (i * 2.2), 100 + Math.sin(i / 5) * (i * 2.2)]);
  return svg({ w: 200, h: 200, name: 'l2c8-swirl' + seed, boil: false }, [ink(pts, { width: 5, color: C.white, opacity: 0.7 })]);
}

/** Length of the ladder picture, and where its rails stand. */
const LADDER_H = 2400;
const RAIL_L = 520;
const RAIL_R = 660;

/** The ladder through the cloud, very tall: sky going from Topsy pink to dusk blue, swirls of cloud, rungs. */
function ladderSky(): string {
  const r = rng(91);
  const nodes: Node[] = [
    piece(rect(-20, -20, 1220, LADDER_H * 0.4), C.topsySky, { edge: 'clean', shadow: false }),
    piece(rect(-20, LADDER_H * 0.3, 1220, LADDER_H * 0.4), '#e9e0e8', { edge: 'torn', shadow: false }),
    piece(rect(-20, LADDER_H * 0.6, 1220, LADDER_H * 0.42), C.duskHigh, { edge: 'torn', shadow: false }),
  ];
  // Puffs of cloud all the way down, thicker in the middle.
  for (let i = 0; i < 46; i++) {
    const y = r() * LADDER_H;
    const mid = 1 - Math.abs(y / LADDER_H - 0.5) * 2;
    const x = r() * 1180;
    if (Math.abs(x - 590) < 110 && r() < 0.6) continue;
    nodes.push(piece(circle(x, y, 60 + r() * 80 * (0.5 + mid)), i % 3 ? C.cloud : C.cloudShade, { shadow: i % 4 === 0, opacity: 0.75 + r() * 0.25 }));
  }
  // The ladder.
  nodes.push(piece(band([[RAIL_L, -20], [RAIL_L - 6, LADDER_H + 20]], 14), C.wood, { edge: 'cut' }));
  nodes.push(piece(band([[RAIL_R, -20], [RAIL_R + 6, LADDER_H + 20]], 14), C.wood, { edge: 'cut' }));
  for (let y = 40; y < LADDER_H; y += 70) nodes.push(piece(rect(RAIL_L - 2, y, RAIL_R - RAIL_L + 4, 10, 3), C.tan, { edge: 'cut', fibre: false }));
  // Wisps of cloud in front of the ladder here and there.
  for (let i = 0; i < 8; i++) nodes.push(piece(ellipse(590 + (r() - 0.5) * 300, 200 + i * 290, 140, 30), C.cloud, { edge: 'torn', fibre: false, shadow: false, opacity: 0.6 }));
  // The top of the tree at the very bottom: leaves and Moon-Face's branch.
  for (let i = 0; i < 12; i++) nodes.push(piece(circle(40 + i * 100, LADDER_H - 40 + (i % 2) * 30, 90), i % 2 ? C.leafDark : C.greenDeep));
  return svg({ w: 1180, h: LADDER_H, name: 'l2c8-ladder', boil: false }, nodes);
}

/** Looking up from the top of the tree: the sky, a ring of cloud, leaves at the bottom. */
function lookingUp(): string {
  const r = rng(92);
  const leaves: Node[] = [];
  for (let i = 0; i < 16; i++) leaves.push(piece(circle(r() * 1180, 720 + r() * 120, 70 + r() * 40), i % 2 ? C.leafDark : C.greenDeep));
  return svg({ w: 1180, h: 820, name: 'l2c8-up', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 320), '#c9b8d6', { edge: 'clean', shadow: false }),
    piece(rect(-20, 260, 1220, 300), C.duskHigh, { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 500, 1220, 340), C.duskSky, { edge: 'torn', shadow: false, fibre: false }),
    ...[[160, 120, 140], [1020, 90, 160], [300, 330, 120], [900, 360, 140]].map(([x, y, s]) => piece(ellipse(x, y, s, s * 0.3), C.cloud, { edge: 'torn', fibre: false, shadow: false, opacity: 0.7 })),
    // The cloud the ladder comes down through.
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => piece(circle(80 + i * 128, 560 + (i % 2) * 24, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 3 === 0 })),
    piece(band([[540, 840], [552, 420]], 12), C.wood, { edge: 'cut' }),
    piece(band([[640, 840], [628, 420]], 12), C.wood, { edge: 'cut' }),
    ...[460, 520, 580, 640, 700, 760].map((y) => piece(rect(546, y, 88, 8, 2), C.tan, { edge: 'cut', fibre: false })),
    ...leaves,
  ]);
}

/** A curl of sweet smell: a pink wavy ribbon. */
function scentArt(seed: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i <= 30; i++) pts.push([10 + i * 10, 40 + Math.sin(i / 3 + seed) * 22]);
  return svg({ w: 320, h: 80, name: 'l2c8-scent' + seed, boil: false }, [
    ink(pts, { width: 9, color: C.candyPink, opacity: 0.85 }),
    ink(pts.map(([x, y]) => [x, y + 3] as Pt), { width: 3, color: C.white, opacity: 0.6 }),
    dot(320 - 10, 40 + Math.sin(30 / 3 + seed) * 22, 6, C.jellyRed),
  ]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    spin: { who: 'topsy', text: 'Oh my hat! The land is spinning! Round and round and round it goes!' },
    quick: { who: 'moonface', text: 'It’s moving on! Quick, {name}! Back down the ladder, before it spins away!' },
    look: { who: 'hero', text: 'Look out! Here comes a house, upside down!' },
    down: { who: 'narrator', text: 'Down, down, down the ladder they went, into the swirling cloud.' },
    hold: { who: 'hero', text: 'Whoa! Hold on tight, Moon-Face!' },
    bye: { who: 'topsy', text: 'Eyb-doog! I mean… goodbye! Come back soon and stand on your heads!' },
    away: { who: 'narrator', text: 'And the Land of Topsy-Turvy spun away, up and up, into the sky.' },
    phew: { who: 'moonface', text: 'Phew! Safe and sound. Did you see him waving, upside down?' },
    me: { who: 'hero', text: 'Look, Moon-Face! I’m the Topsy-Turvy Man now!' },
    prize: { who: 'narrator', text: '{name} won a spinning top, and the seal of the Land of Topsy-Turvy!' },
    sniff: { who: 'hero', text: 'Sniff, sniff. Mmm! What’s that sweet smell?' },
    next: { who: 'moonface', text: 'Toffee… and jelly… and lemonade! I think a new land is coming.' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: the land spins
    const land = k.landScene(2);
    // Bigger than the stage, so its swaying never shows an edge.
    k.set(land, { scale: 1.3, transformOrigin: '50% 60%' });
    k.music('adventure');
    const topsy = k.character('topsy', { x: 470, y: 330, w: 250, z: 20 });
    const mf = k.character('moonface', { x: 860, y: 340, w: 240, z: 20, flip: true });
    const hero = k.character('hero', { x: 90, y: 350, w: 240, z: 20 });
    k.set([topsy, mf, hero], { opacity: 0 });
    await k.all(k.enter(hero, 'left'), k.enter(mf, 'right'), k.wait(300).then(() => k.appear(topsy, 0.5)));

    // The ground starts to turn: it sways further each time, and the whirring winds up.
    windUp(9);
    const sway = (async () => {
      for (const a of [3, -4, 5, -6, 7, -8, 9, -10]) await k.to(land, 0.9, { rotation: a, ease: 'sine.inOut' });
    })();
    void k.shake(topsy, 6, 3);
    await k.say('spin', topsy);
    void k.quake(5);
    void k.shake(hero, 6, 2);
    await k.say('quick', mf);

    // Upside-down houses, trees and teacups whirl past through the sky.
    const flyers = [flyingHouse(0), flyingTree(0), flyingCup(), flyingHouse(1), flyingTree(1), flyingHouse(2), flyingCup()];
    const lookLine = k.say('look', hero);
    for (const [i, art] of flyers.entries()) {
      const fromLeft = i % 2 === 0;
      const y = 30 + (i % 3) * 70;
      const el = k.add(art, { x: fromLeft ? -260 : 1200, y, w: i % 3 === 2 ? 110 : 190, z: 12 });
      whirl();
      void k.to(el, 1.6, { x: fromLeft ? 1500 : -1500, y: 60 + (i % 2) * 40, rotation: fromLeft ? 540 : -540, ease: 'none' }).then(() => k.remove(el));
      if (i === 2) void k.hop(hero, 30, 1);
      await k.wait(520);
    }
    await lookLine;
    await sway;
    // One great turn of the whole land, and they run for the ladder.
    windUp(2, 200, 420);
    void k.to(land, 2, { rotation: 370, scale: 1.9, ease: 'power2.in' });
    for (let i = 0; i < 3; i++) {
      const s = k.add(swirlArt(i), { x: 200 + i * 300, y: 120 + (i % 2) * 140, w: 200, z: 14 });
      k.set(s, { opacity: 0 });
      void k.appear(s, 0.3).then(() => k.spin(s, 1, 1.2)).then(() => k.vanish(s));
    }
    void k.spin(topsy, 1, 1.4);
    k.fx.whizz();
    await k.all(k.exit(hero, 'bottom', 0.9), k.wait(150).then(() => k.exit(mf, 'bottom', 0.9)));
    await k.wait(600);

    // ------------------------------------------- scene 2: down the ladder
    let strip!: HTMLElement;
    let h2!: HTMLElement;
    let m2!: HTMLElement;
    await k.cut(() => {
      strip = k.add(ladderSky(), { x: 0, y: 0, w: 1180, h: LADDER_H, z: 2, still: true });
      h2 = k.character('hero', { x: RAIL_L - 200, y: 120, w: 210, z: 20 });
      m2 = k.character('moonface', { x: RAIL_R - 20, y: -20, w: 210, z: 20, flip: true });
      k.ambient('dust', { count: 10 });
    });
    k.music('adventure');
    // Hand over hand: the sky scrolls up one rung at a time, with a little dip.
    const scrollTo = (y: number, s: number, ease = 'power1.inOut') => k.to(strip, s, { y: -y, ease });
    void k.say('down');
    let at = 0;
    for (let i = 0; i < 9; i++) {
      at += 70;
      rung(i);
      await k.all(scrollTo(at, 0.32), k.to(i % 2 ? h2 : m2, 0.16, { y: '+=8', ease: 'power1.out' }).then(() => k.to(i % 2 ? h2 : m2, 0.16, { y: '-=8' })));
    }
    // A lurch: the ladder shakes and they tumble down through the cloud.
    k.fx.rumble(1.2);
    await k.quake(10);
    tumble();
    void k.camera({ zoom: 1.15, x: 590, y: 380 }, 0.6);
    await k.all(
      scrollTo(at + 900, 1.4, 'power2.in'),
      k.spin(h2, 1, 1.3),
      k.spin(m2, -1, 1.3),
      k.to(h2, 0.7, { x: -40, ease: 'sine.inOut' }).then(() => k.to(h2, 0.6, { x: 0, ease: 'sine.inOut' })),
      k.to(m2, 0.7, { x: 40, ease: 'sine.inOut' }).then(() => k.to(m2, 0.6, { x: 0, ease: 'sine.inOut' })),
    );
    at += 900;
    // Grab! And they hang on.
    k.fx.thud();
    k.puff(RAIL_L - 60, 260, 140, C.cloud);
    k.puff(RAIL_R + 80, 140, 140, C.cloud);
    void k.quake(4);
    await k.say('hold', h2);
    for (let i = 0; i < 6; i++) {
      at += 120;
      rung(i);
      await scrollTo(at, 0.3);
    }
    void k.camera({}, 0.6);
    await scrollTo(LADDER_H - 820, 1.2, 'power2.out');
    k.fx.thud();
    await k.wait(300);

    // ------------------------------------------- scene 3: the land spins away
    let far!: HTMLElement;
    let t3!: HTMLElement;
    let h3!: HTMLElement;
    let m3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(lookingUp());
      far = k.landFar(2, { x: 290, y: 140, w: 600, z: 6 });
      t3 = k.character('topsy', { x: 680, y: 120, w: 130, z: 7 });
      h3 = k.character('hero', { x: 110, y: 420, w: 250, z: 20 });
      m3 = k.character('moonface', { x: 830, y: 420, w: 250, z: 20, flip: true });
    });
    k.music('dreamy');
    windUp(7, 260, 520);
    // The land turns like a spinning top: it squeezes thin and opens out, again and again.
    const spinning = (async () => {
      for (let i = 0; i < 7; i++) {
        await k.to(far, 0.45, { scaleX: -1, ease: 'sine.inOut' });
        await k.to(far, 0.45, { scaleX: 1, ease: 'sine.inOut' });
      }
    })();
    void wave(k, t3, 'armL', 6);
    await k.say('bye', t3);
    void wave(k, h3, 'armR', 3);
    void wave(k, m3, 'armL', 3);
    // Up and away, smaller and smaller, into the sky.
    k.fx.wind(3);
    await k.all(
      k.to(far, 3.2, { y: -300, scale: 0.3, ease: 'power1.in' }),
      k.to(t3, 3.2, { x: -150, y: -330, scale: 0.3, ease: 'power1.in' }),
      k.say('away'),
    );
    k.sparkle(590, 80, 10, 120);
    k.fx.twinkle();
    await spinning;
    await k.wait(500);

    // ------------------------------------------- scene 4: home, and a sweet smell
    let m4!: HTMLElement;
    let h4!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l2c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      m4 = k.character('moonface', { x: 650, y: 340, w: 260, z: 20, flip: true });
      h4 = k.character('hero', { x: 260, y: 360, w: 250, z: 20 });
    });
    k.music('cosy');
    flump();
    void k.quake(3);
    await k.all(k.hop(m4, 20, 1), k.hop(h4, 20, 1));
    giggle();
    await k.say('phew', m4);

    // The hero stands on their head, like the Topsy-Turvy Man.
    k.fx.boing();
    await k.to(h4, 0.5, { rotation: 180, y: -40, ease: 'back.out(1.4)' });
    void k.shake(h4, 4, 2);
    await k.say('me', h4);
    giggle(600);
    void k.shake(m4, 5, 3);
    await k.wait(500);
    await k.to(h4, 0.5, { rotation: 360, y: 0, ease: 'back.out(1.4)' });
    k.set(h4, { rotation: 0 });

    // The spinning top and the seal.
    const top = k.keepsake(k.chapter!.keepsake, { x: 470, y: 470, w: 150, z: 24 });
    const seal = k.add(landSeal(2), { x: 480, y: 70, w: 220, z: 30 });
    k.set([top, seal], { opacity: 0 });
    await k.appear(top, 0.4);
    topHum();
    const spinTop = (async () => {
      for (let i = 0; i < 6; i++) {
        await k.to(top, 0.18, { scaleX: -1, rotation: 4, ease: 'none' });
        await k.to(top, 0.18, { scaleX: 1, rotation: -4, ease: 'none' });
      }
      await k.to(top, 0.3, { rotation: 0 });
    })();
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    await k.all(k.say('prize'), spinTop, k.hop(h4, 36, 2));

    // A sweet smell curls in from the cloud outside the window.
    sweetSmell();
    void k.fade(seal, 0, 0.6);
    const scents = [0, 1, 2].map((i) => {
      const s = k.add(scentArt(i), { x: 450 + i * 20, y: 170 + i * 50, w: 300, z: 26 });
      k.set(s, { opacity: 0, scale: 0.4, x: 0 });
      return s;
    });
    await k.all(...scents.map((s, i) => k.wait(i * 300).then(() => k.to(s, 1.8, { opacity: 1, scale: 1, x: i % 2 ? 120 : -160, y: 60 + i * 20, ease: 'sine.out' }))));
    scents.forEach((s, i) => k.float(s, 10, 1.8 + i * 0.3));
    void k.camera({ zoom: 1.15, x: 590, y: 320 }, 2);
    await k.to(k.part(h4, 'head'), 0.3, { rotation: -8 });
    await k.say('sniff', h4);
    await k.to(k.part(h4, 'head'), 0.3, { rotation: 0 });
    // Little sweets drift past the window.
    const sweets = (['toffee', 'jelly', 'googleBun'] as const).map((id, i) => {
      const el = k.prop(id, { x: 470 + i * 100, y: 120 + (i % 2) * 70, w: 80, z: 27 });
      k.set(el, { opacity: 0 });
      return el;
    });
    for (const el of sweets) {
      k.fx.pop();
      void k.appear(el, 0.3).then(() => k.float(el, 8, 1.6));
      await k.wait(250);
    }
    void k.blink(m4);
    await k.say('next', m4);
    k.fx.twinkle();
    k.sparkle(590, 220, 14, 180);
    await k.all(k.hop(h4, 30, 1), k.hop(m4, 20, 1));
    await k.wait(1400);
  },
});
