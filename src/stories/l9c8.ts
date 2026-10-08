/**
 * Land 9, chapter 8 (the land's finale): The Big Thaw.
 *
 * Plays straight after the escape game. The plan to rescue Silky is
 * finished, the snow melts, and then the cliffhanger into the last land.
 * Six scenes:
 *
 *   1. The sun comes out over the Land of Snow: drip, drip, the Big Thaw.
 *      One last look at THE PLAN, drawn in the snow across the land's
 *      chapters (a key shape, the hour on the clock, the way past her
 *      gates, and Silky's cell), before it melts. The Saucepan Man mishears
 *      ("a snow-plan?"), and Mr Snowman, a little smaller already, gives
 *      them a snow globe and sends them off: he'll be back next winter.
 *   2. The melting edge of the land and the top of the ladder: down they
 *      go, and the land rises away, dripping, Mr Snowman waving.
 *   3. Home in Moon-Face's room: the snow globe, the seal, hot cocoa… and
 *      then the window goes dark and cold.
 *   4. The top of the tree under a stormy sky: a bell tolls, and a grim
 *      black prison settles into the cloud.
 *   5. Close up on its bell tower, barred like a cell: the bell swings, and
 *      Dame Snap rises up behind the bars and shrieks. Clack, clack. SNAP.
 *   6. Back to the heroes, brave: Silky is in there, and they have a plan.
 *
 * Scary, never cruel (PLAN.md §2): she shrieks from far off behind bars;
 * nobody is caught, and it ends on the children being brave.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree, TREE_SPOTS } from '../art/scenery';
import { band, bell, C, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { blackSheet, flump, sting, together, wave } from './bits';
import { snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** Melting snow: soft drips, `times` of them, never quite in time. */
function drips(times = 6): void {
  const t = now();
  const r = rng(Math.floor(t * 100));
  for (let i = 0; i < times; i++) {
    const at = t + i * 0.32 + r() * 0.12;
    const f = 900 + r() * 700;
    tone(f, at, { wave: 'sine', peak: 0.05, attack: 0.003, decay: 0.12, glideTo: f * 1.6 });
  }
}

/** The sun coming out: a warm, rising shimmer. */
function sunrise(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => bell(f, t + i * 0.22, 0.05, 1.4));
  tone(NOTE.C4, t, { peak: 0.04, attack: 0.8, decay: 2 });
}

/** A prison bell tolling, far off: deep, slow and heavy. */
function toll(): void {
  const t = now();
  bell(174.6, t, 0.16, 3.6);
  tone(87.3, t, { peak: 0.1, attack: 0.01, decay: 3.6 });
  bell(174.6 * 1.19, t + 0.01, 0.04, 2.4);
}

/** Hot cocoa poured into mugs: a warm glug and a clink. */
function pour(): void {
  const t = now();
  for (let i = 0; i < 4; i++) tone(240 + i * 30, t + i * 0.12, { wave: 'sine', peak: 0.05, attack: 0.01, decay: 0.12, glideTo: 380 + i * 30 });
  bell(NOTE.E6, t + 0.6, 0.04, 0.5);
}

// --------------------------------------------------------------------- art

/** The trench colour of lines drawn in the snow with a stick. */
const SNOWLINE = '#7f9bb4';

/**
 * THE PLAN, drawn in the snow (520 × 260): the key shape, the clock with
 * its hands at the hour, the gates with a path slipping round them, and
 * Silky's cell with a little star in it, joined by a dotted path.
 */
function snowMap(): string {
  const line = (pts: Pt[], width = 6): Node => ink(pts, { width, color: SNOWLINE, wobble: 1.2 });
  const dots: Node[] = [];
  const path: Pt[] = [[110, 190], [170, 214], [230, 200], [300, 214], [360, 196], [420, 176]];
  for (let i = 0; i < path.length - 1; i++) {
    const [[x0, y0], [x1, y1]] = [path[i], path[i + 1]];
    for (let k = 0.2; k < 1; k += 0.3) dots.push(dot(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, 4, SNOWLINE));
  }
  return svg({ w: 520, h: 260, name: 'l9c8-map', label: 'the plan, drawn in the snow' }, [
    piece(curve([[20, 60], [140, 20], [300, 30], [480, 40], [510, 140], [470, 240], [260, 250], [60, 240], [10, 160]], 2), C.snow, { rough: 1.2 }),
    piece(curve([[30, 200], [200, 236], [400, 230], [490, 190], [470, 240], [260, 250], [60, 240]], 2), C.snowShade, { edge: 'torn', fibre: false, shadow: false, opacity: 0.6 }),
    // The key.
    line(circle(80, 100, 24), 6),
    line([[104, 100], [170, 100]]),
    line([[150, 100], [150, 118]]),
    line([[164, 100], [164, 114]]),
    // The clock, its hands at the hour.
    line(circle(250, 100, 40), 6),
    ...[0, 1, 2, 3].map((q) => {
      const a = (q * Math.PI) / 2;
      return line([[250 + Math.sin(a) * 30, 100 - Math.cos(a) * 30], [250 + Math.sin(a) * 36, 100 - Math.cos(a) * 36]], 4);
    }),
    line([[250, 100], [250, 70]], 5),
    line([[250, 100], [250, 78]], 7),
    // The gates, and the way round them.
    ...[340, 356, 372, 388].map((x) => line([[x, 66], [x, 132]], 5)),
    line([[332, 66], [396, 66]], 4),
    line([[326, 150], [364, 168], [404, 150], [410, 120]], 4),
    line([[402, 128], [410, 118], [416, 130]], 4),
    // Silky's cell, with a star in it.
    line([[436, 64], [496, 64], [496, 124], [436, 124], [436, 64]], 5),
    piece(poly([[466, 76], [471, 90], [486, 90], [474, 98], [478, 112], [466, 104], [454, 112], [458, 98], [446, 90], [461, 90]]), C.goldLight, { edge: 'cut', fibre: false }),
    ...dots,
  ]);
}

/** A puddle of meltwater (400 × 90). */
function puddle(): string {
  return svg({ w: 400, h: 90, name: 'l9c8-puddle', boil: false }, [
    piece(curve([[10, 50], [80, 20], [200, 14], [330, 22], [392, 50], [320, 80], [180, 84], [50, 76]], 2), C.ice, { edge: 'cut' }),
    piece(ellipse(140, 40, 60, 8), C.white, { edge: 'clean', fibre: false, shadow: false, opacity: 0.7 }),
  ]);
}

/** A falling drop of meltwater (30 × 40). */
function drop(): string {
  return svg({ w: 30, h: 40, name: 'l9c8-drop', boil: false }, [piece(curve([[15, 2], [24, 20], [22, 34], [15, 38], [8, 34], [6, 20]], 2), C.ice, { edge: 'cut' })]);
}

/** The sky beyond the melting edge: pale, wet and bright. */
function edgeSky(): string {
  return svg({ w: 1180, h: 820, name: 'l9c8-sky', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.snowSky, { edge: 'clean', shadow: false }),
    piece(rect(-20, 280, 1220, 300), '#dce8f0', { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 520, 1220, 340), C.duskSky, { edge: 'torn', shadow: false, fibre: false }),
    piece(circle(1000, 140, 60), '#f6efc8', { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    ...[[200, 120], [640, 80]].map(([x, y]) => piece(ellipse(x, y, 120, 26), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.8 })),
  ]);
}

/** The melting edge of the Land of Snow: drifts slumping, icicles dripping off the lip. */
function landEdge(): string {
  const icicles: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 68;
    const len = 30 + ((i * 37) % 50);
    icicles.push(piece(poly([[x - 9, 640], [x + 9, 640], [x, 640 + len]]), C.ice, { edge: 'cut' }));
  }
  return svg({ w: 800, h: 900, name: 'l9c8-edge', boil: false }, [
    piece(poly([[60, 600], [140, 380], [220, 600]]), C.greenDeep, { rough: 0.6 }),
    piece(poly([[100, 470], [140, 380], [180, 470]]), C.snow, { edge: 'cut' }),
    piece(curve([[-40, 600], [300, 580], [620, 590], [760, 610], [780, 650], [700, 660], [-40, 660]], 2), C.snow, { rough: 1.2 }),
    piece(curve([[-40, 640], [760, 640], [740, 720], [690, 800], [640, 900], [-40, 900]], 2), '#b8cbd9', { rough: 1.2 }),
    ...icicles,
    piece(ellipse(420, 600, 120, 14), C.ice, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
  ]);
}

/** The top of the ladder, coming up through the cloud (600 × 400). */
function ladderTop(): string {
  return svg({ w: 600, h: 400, name: 'l9c8-ladder', boil: false }, [
    piece(band([[190, 420], [196, 40]], 12), C.wood, { edge: 'cut' }),
    piece(band([[300, 420], [294, 40]], 12), C.wood, { edge: 'cut' }),
    ...[80, 140, 200, 260].map((y) => piece(rect(196, y, 98, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(30 + i * 110, 300 + (i % 2) * 30, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}

/** Where the bell tower's open belfry is, on the stage. */
const ARCH = { x: 470, y: 230, w: 240, h: 230 };
const STONE = '#4b4652';
const STONE_DARK = '#38343f';

/**
 * Her prison's bell tower, close up, under a stormy sky (the backdrop):
 * the upper tower, a pointed iron roof and the dark belfry with its bell
 * (part `bell`, swinging from the top). The bars and the wall below the
 * belfry are a separate actor (towerFront) so she can rise up between.
 */
function towerBack(): string {
  const r = rng(909);
  const clouds: Node[] = [];
  for (let i = 0; i < 9; i++) clouds.push(piece(ellipse(r() * 1180, 60 + r() * 260, 170 + r() * 90, 34 + r() * 20), i % 2 ? '#3b3546' : '#4a4356', { edge: 'torn', fibre: false, shadow: false, opacity: 0.9 }));
  const { x, y, w, h } = ARCH;
  return svg({ w: 1180, h: 820, name: 'l9c8-tower', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.prisonNight, { edge: 'clean', shadow: false }),
    piece(rect(-20, 420, 1220, 440), '#3a3446', { edge: 'torn', shadow: false, fibre: false }),
    piece(circle(930, 150, 54), C.moonPale, { edge: 'cut', fibre: false, opacity: 0.85 }),
    ...clouds,
    // The upper tower and its roof.
    piece(rect(x - 50, y - 60, w + 100, h + 120), STONE, { rough: 0.6 }),
    piece(poly([[x - 80, y - 50], [x + w / 2, y - 220], [x + w + 80, y - 50]]), C.iron, { rough: 0.6 }),
    piece(rect(x - 70, y - 64, w + 140, 22, 3), STONE_DARK, { edge: 'cut' }),
    piece(rect(x + w / 2 - 4, y - 280, 8, 70), C.iron, { edge: 'cut' }),
    piece(rect(x + w / 2 - 34, y - 262, 68, 12, 3), C.ruler, { edge: 'cut' }),
    // The dark belfry, and the bell inside it.
    piece(rect(x, y, w, h, w / 2), '#15121b', { edge: 'cut', fibre: false }),
    group({ part: 'bell', origin: [x + w / 2, y + 20] }, [
      ink([[x + w / 2, y + 6], [x + w / 2, y + 30]], { width: 5, color: C.iron }),
      piece(curve([[x + w / 2 - 22, y + 30], [x + w / 2 + 22, y + 30], [x + w / 2 + 34, y + 96], [x + w / 2 + 46, y + 110], [x + w / 2 - 46, y + 110], [x + w / 2 - 34, y + 96]], 1), C.brassDark),
      piece(circle(x + w / 2, y + 116, 9), C.iron, { edge: 'cut' }),
    ]),
  ]);
}

/** The front of the tower: thick bars across the belfry, and the stone wall below it. */
function towerFront(): string {
  const { x, y, w, h } = ARCH;
  const bars: Node[] = [];
  for (let i = 1; i < 7; i++) bars.push(piece(rect(x + (w * i) / 7 - 6, y - 6, 12, h + 10), C.iron, { edge: 'cut' }));
  const stones: Node[] = [];
  for (let row = 0; row < 8; row++) {
    const yy = y + h + 30 + row * 46;
    stones.push(ink([[x - 50, yy], [x + w + 50, yy]], { width: 3, color: STONE_DARK, opacity: 0.7 }));
    for (let c = 0; c < 4; c++) {
      const xx = x - 10 + c * 90 + (row % 2) * 45;
      stones.push(ink([[xx, yy], [xx, yy + 46]], { width: 3, color: STONE_DARK, opacity: 0.6 }));
    }
  }
  return svg({ w: 1180, h: 820, name: 'l9c8-front', boil: false }, [
    piece(rect(x - 30, y + 20, 24, h - 20), C.iron, { edge: 'cut', fibre: false }),
    ...bars,
    piece(rect(x - 10, y + 40, w + 20, 12, 3), C.iron, { edge: 'cut' }),
    piece(rect(x - 50, y + h, w + 100, 420), STONE, { rough: 0.6 }),
    piece(rect(x - 64, y + h - 6, w + 128, 26, 3), STONE_DARK, { edge: 'cut' }),
    ...stones,
  ]);
}

// -------------------------------------------------------------------- moves

/** Drops of meltwater fall from (x, y), one after another. */
function dripDown(k: Kit, x: number, y: number, count: number): void {
  if (k.calm) return;
  for (let i = 0; i < count; i++) {
    const d = k.add(drop(), { x: x + ((i * 53) % 240) - 120, y, w: 20, z: 30 });
    k.set(d, { opacity: 0 });
    void k
      .wait(i * 300)
      .then(() => k.fade(d, 1, 0.1))
      .then(() => k.to(d, 0.9, { y: 260, ease: 'power2.in' }))
      .then(() => k.remove(d));
  }
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    thaw: { who: 'snowman', text: 'Drip, drip! The sun is out. It’s the Big Thaw! My land is melting!' },
    look: { who: 'moonface', text: 'Quick! One last look at our plan, before the snow map melts away.' },
    recap: { who: 'hero', text: 'The key shape. The hour on the clock. And the secret way past her gates.' },
    remember: { who: 'narrator', text: '{name} looked hard at the map, and remembered every bit.' },
    eh: { who: 'saucepan', text: 'EH? A SNOW-PLAN? Don’t worry, I’ve packed some snow in my saucepan!' },
    globe: { who: 'snowman', text: 'Take this snow globe. Then you’ll always have a little snow with you.' },
    bye: { who: 'snowman', text: 'Don’t worry about me. I’ll be back next winter! Now run!' },
    down: { who: 'moonface', text: 'Down the ladder, everyone! Before it all melts away!' },
    prize: { who: 'narrator', text: 'Home, safe and warm, with a snow globe and the seal of the Land of Snow.' },
    cocoa: { who: 'saucepan', text: 'Hot cocoa for everyone! Clank, clank!' },
    dark: { who: 'hero', text: 'Moon-Face… why has it gone so dark? And so cold?' },
    bars: { who: 'moonface', text: 'Look. A bell tower, with bars on it. It’s her prison.' },
    come: { who: 'dameSnap', text: 'Ready or not, little ones… here I COME!' },
    ready: { who: 'hero', text: 'Silky is in there. And we’ve got a plan, {name}.' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: the thaw, and the plan
    k.landScene(9);
    k.music('dreamy');
    const sun = k.light(1040, 210, 260, { color: '#fff3c4', strength: 0, z: 8 });
    const map = k.add(snowMap(), { x: 380, y: 420, w: 520, z: 12 });
    const mf = k.character('moonface', { x: 20, y: 360, w: 220, z: 20 });
    const hero = k.character('hero', { x: 190, y: 420, w: 200, z: 21 });
    const snowy = k.character('snowman', { x: 890, y: 320, w: 270, z: 18, flip: true });
    k.set([mf, hero, snowy], { opacity: 0 });
    await k.all(k.enter(mf, 'left'), k.wait(150).then(() => k.enter(hero, 'left')), k.enter(snowy, 'right'));
    sunrise();
    await k.fade(sun, 0.7, 1.4);
    drips(6);
    dripDown(k, 1000, 330, 4);
    await k.all(k.say('thaw', snowy), k.to(snowy, 2, { scale: 0.95, y: 10, ease: 'sine.inOut' }));
    await k.all(k.say('look', mf), k.pop(map, 1.04));
    // Each part of the plan, pointed out in turn.
    const marks = [
      [470, 520],
      [630, 520],
      [750, 530],
      [846, 516],
    ];
    const recap = k.say('recap', hero);
    for (const [x, y] of marks) {
      k.sparkle(x, y, 8, 70);
      k.fx.twinkle();
      await k.wait(900);
    }
    await recap;
    await k.all(k.say('remember'), k.camera({ zoom: 1.3, x: 640, y: 520 }, 1.6));
    await k.camera({}, 0.8);

    // The map melts away into a puddle.
    k.music('cosy');
    drips(8);
    const pool = k.add(puddle(), { x: 440, y: 580, w: 400, z: 11 });
    k.set(pool, { opacity: 0 });
    await k.all(k.to(map, 2, { scaleY: 0.4, y: 80, opacity: 0, ease: 'power1.in' }), k.fade(pool, 1, 2));
    k.remove(map);

    // The Saucepan Man clanks in, a saucepan full of snow.
    const sauce = k.character('saucepan', { x: 560, y: 360, w: 230, z: 19 });
    k.set(sauce, { opacity: 0 });
    snapSound.clank(4);
    await k.enter(sauce, 'bottom', 0.6);
    await k.all(k.say('eh', sauce), k.hop(sauce, 24, 2));
    // Mr Snowman gives them a snow globe, and sends them off.
    const globe = k.keepsake(k.chapter!.keepsake, { x: 760, y: 250, w: 140, z: 30 });
    k.set(globe, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(globe, 0.4);
    k.sparkle(830, 320, 10, 100);
    await k.all(k.say('globe', snowy), wave(k, snowy, 'armL', 2));
    await k.to(globe, 0.8, { x: -520, y: 220, scale: 0.4, ease: 'power2.inOut' });
    k.remove(globe);
    void k.hop(hero, 24, 1);
    k.fx.rumble(1.5);
    drips(6);
    await k.all(k.say('bye', snowy), k.to(snowy, 1.5, { scale: 0.88, y: 30 }));
    k.fx.whizz();
    await k.all(k.exit(mf, 'right', 0.7), k.exit(hero, 'right', 0.7), k.wait(200).then(() => k.exit(sauce, 'right', 0.7)));

    // ------------------------------------------- scene 2: down the ladder
    let edge!: HTMLElement;
    let s2!: HTMLElement;
    let h2!: HTMLElement;
    let p2!: HTMLElement;
    let m2!: HTMLElement;
    await k.cut(() => {
      k.backdrop(edgeSky());
      edge = k.add(landEdge(), { x: -20, y: 0, w: 800, h: 900, z: 4, still: true });
      k.add(ladderTop(), { x: 600, y: 420, w: 600, z: 26, still: true });
      s2 = k.character('snowman', { x: 30, y: 330, w: 240, z: 6 });
      h2 = k.character('hero', { x: 300, y: 380, w: 200, z: 20 });
      p2 = k.character('saucepan', { x: 470, y: 370, w: 210, z: 20 });
      m2 = k.character('moonface', { x: 790, y: 320, w: 200, z: 24, flip: true });
      k.set(s2, { scale: 0.85, transformOrigin: '50% 100%' });
      k.set(m2, { y: 240 });
    });
    k.music('adventure');
    k.fx.boing();
    await k.to(m2, 0.5, { y: 0, ease: 'back.out(1.6)' });
    drips(5);
    dripDown(k, 420, 640, 5);
    await k.all(k.say('down', m2), wave(k, m2, 'armL', 2));
    k.fx.whizz();
    await k.to(m2, 0.4, { y: 300, ease: 'power2.in' });
    await k.to(h2, 0.6, { x: 340, y: -40, ease: 'power1.out' });
    await k.to(h2, 0.4, { y: 360, ease: 'power2.in' });
    snapSound.clank(3);
    await k.to(p2, 0.7, { x: 170, y: -40, ease: 'power1.out' });
    await k.to(p2, 0.4, { y: 360, ease: 'power2.in' });
    // The land rises away, dripping, Mr Snowman waving goodbye.
    k.fx.rumble(3);
    drips(10);
    void wave(k, s2, 'armR', 4);
    await k.all(k.to(edge, 5, { y: -780, ease: 'power1.in' }), k.to(s2, 5, { y: -780, ease: 'power1.in' }), k.wait(800).then(() => dripDown(k, 400, 300, 6)));

    // ------------------------------------------- scene 3: home… and dark
    let h3!: HTMLElement;
    let p3!: HTMLElement;
    let m3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l9c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      h3 = k.character('hero', { x: 110, y: 360, w: 240, z: 20 });
      p3 = k.character('saucepan', { x: 350, y: 350, w: 240, z: 19 });
      m3 = k.character('moonface', { x: 870, y: 350, w: 250, z: 20, flip: true });
    });
    k.music('cosy');
    flump();
    await together(k, [h3, p3, m3], 0.3, { y: '+=10' });
    await together(k, [h3, p3, m3], 0.3, { y: '-=10' });
    const keep = k.keepsake(k.chapter!.keepsake, { x: 600, y: 500, w: 150, z: 24 });
    const seal = k.add(landSeal(9), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    await k.all(k.say('prize'), k.hop(h3, 30, 2));
    pour();
    snapSound.clank(3);
    await k.all(k.say('cocoa', p3), k.hop(p3, 20, 2));
    // The window darkens, and a cold wind blows.
    k.silence();
    k.fx.wind(3);
    const gloom = k.dim(0, '#100c1c');
    await k.fade(gloom, 0.5, 2);
    void k.shake(h3, 4, 2);
    await k.say('dark', h3);

    // ------------------------------------------- scene 4: the prison arrives
    let prison!: HTMLElement;
    let veil!: HTMLElement;
    const box = TREE_SPOTS.cloud;
    await k.cut(() => {
      k.backdrop(tree('l9c8-tree'));
      prison = k.landFar(10, { x: box.x, y: box.y, w: box.w, z: 4 });
      veil = k.dim(0.35, '#100c1c');
      k.set(prison, { y: -220, opacity: 0 });
    });
    k.music('spooky');
    k.fx.rumble(3);
    k.fx.wind(3);
    void k.to(veil, 3, { opacity: 0.55 });
    await k.all(k.to(prison, 3.2, { y: 0, opacity: 1, ease: 'sine.out' }), k.camera({ zoom: 1.8, x: 590, y: 120 }, 3.4));
    toll();
    void k.quake(3);
    await k.wait(1400);

    // ------------------------------------------- scene 5: the bell tower, with bars
    let back!: HTMLElement;
    let snap!: HTMLElement;
    await k.cut(() => {
      back = k.backdrop(towerBack());
      snap = k.snap('shriek', { x: ARCH.x + 10, y: ARCH.y + 40, w: 220, z: 8 });
      k.add(towerFront(), { x: 0, y: 0, w: 1180, h: 820, z: 12, still: true });
      k.set(snap, { y: 260, opacity: 0 });
    });
    const bellPart = k.pivot(k.part(back, 'bell'));
    const swing = (async () => {
      for (let i = 0; i < 3; i++) {
        toll();
        await k.to(bellPart, 0.9, { rotation: 14, ease: 'sine.inOut' });
        await k.to(bellPart, 0.9, { rotation: -14, ease: 'sine.inOut' });
      }
      await k.to(bellPart, 0.6, { rotation: 0 });
    })();
    await k.say('bars');
    await swing;
    // Clack… clack… CLACK. She rises up behind the bars.
    snapSound.heels(3, 0.4, 0.7);
    await k.wait(1300);
    snapSound.caw(1);
    await k.to(snap, 1.2, { y: 0, opacity: 1, ease: 'power2.out' });
    snapSound.ruler();
    void k.camera({ zoom: 1.35, x: 590, y: 330 }, 0.8);
    void k.shake(snap, 4, 2);
    await k.say('come', snap);
    snapSound.heels(4, 0.3);
    await k.all(k.camera({}, 0.6), k.to(snap, 0.8, { y: 260, opacity: 0, ease: 'power2.in' }));

    // ------------------------------------------- scene 6: brave
    let h6!: HTMLElement;
    let m6!: HTMLElement;
    let p6!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l9c8-tree2', { landN: 10 }));
      k.dim(0.5, '#100c1c');
      h6 = k.character('hero', { x: 160, y: 430, w: 250, z: 40 });
      p6 = k.character('saucepan', { x: 430, y: 430, w: 240, z: 39 });
      m6 = k.character('moonface', { x: 760, y: 430, w: 250, z: 40, flip: true });
      k.light(590, 560, 380, { color: C.candle, strength: 0.25, z: 38 });
    });
    k.music('triumph');
    await k.all(k.say('ready', h6), k.hop(h6, 20, 1), k.wait(200).then(() => k.hop(m6, 16, 1)), k.wait(300).then(() => k.hop(p6, 16, 1)));
    await k.wait(600);
    k.silence();
    sting();
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(1200);
  },
});
