/**
 * Land 3, chapter 8 (the land's finale): The Jelly Goblin.
 *
 * Plays straight after the escape: he has just answered his way back to
 * the ladder. Five scenes, funny-scary:
 *
 *   1. Munching in the Land of Goodies, until the ground wobbles and the
 *      Jelly Goblin rises up, enormous and furious: "Who's been eating MY
 *      goodies?!" Run! (The Saucepan Man hears "fun".)
 *   2. The chase through the toffee trees (the world scrolls past), the
 *      goblin wobbling after them, gaining… until he slips on his own
 *      jelly. Splat!
 *   3. The edge of the land: Moon-Face calls from the top of the ladder.
 *      Down they go just as the land moves on, rising away with the goblin
 *      stuck on it, shaking his spoon. He shakes it so hard it flies out of
 *      his jelly fingers, and the Saucepan Man catches it. Clang!
 *   4. Home in Moon-Face's room: the spoon (the keepsake) and the seal.
 *   5. Dusk at the top of the tree. A new land settles into the cloud: a
 *      grey building with a bell tower. A school? The bell tolls once.
 */
import { gsap } from 'gsap';
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree } from '../art/scenery';
import { bell, C, circle, curve, defineStory, ellipse, ink, noiseBurst, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { blackSheet, flump, sting, together, wave } from './bits';

// ------------------------------------------------------------------ sounds

/** The Saucepan Man running: pots and pans clanking together. */
function clank(times = 4, gap = 0.18): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    const at = t + i * gap;
    const f = i % 2 ? 620 : 470;
    // Inharmonic partials make it sound like tin, not a bell.
    tone(f, at, { wave: 'triangle', peak: 0.07, attack: 0.002, decay: 0.18 });
    tone(f * 2.76, at, { wave: 'sine', peak: 0.04, attack: 0.002, decay: 0.12 });
    tone(f * 5.4, at, { wave: 'sine', peak: 0.02, attack: 0.002, decay: 0.08 });
    noiseBurst(at, { freq: 4200, q: 3, peak: 0.05, decay: 0.05 });
  }
}

/** The goblin's wobble: a low, gloopy blubber. */
function wobble(seconds = 0.8): void {
  const t = now();
  tone(110, t, { wave: 'sine', peak: 0.16, attack: 0.03, decay: seconds, vibrato: [9, 30], glideTo: 80 });
  tone(55, t, { wave: 'triangle', peak: 0.08, attack: 0.03, decay: seconds, vibrato: [9, 10], lowpass: 400 });
}

/** A big angry jelly rising up out of the ground. */
function rise(): void {
  const t = now();
  tone(60, t, { wave: 'sawtooth', peak: 0.08, attack: 0.4, decay: 1.4, glideTo: 140, vibrato: [7, 12], lowpass: 500 });
  noiseBurst(t, { freq: 250, type: 'lowpass', peak: 0.16, attack: 0.3, decay: 1.2 });
}

/** Slipping, then landing flat on wet jelly: a squelchy splat. */
function splat(): void {
  const t = now();
  tone(900, t, { wave: 'sine', peak: 0.08, attack: 0.01, decay: 0.45, glideTo: 200 });
  noiseBurst(t + 0.5, { freq: 700, q: 0.7, peak: 0.26, attack: 0.005, decay: 0.3, sweepTo: 200 });
  tone(90, t + 0.5, { peak: 0.2, decay: 0.3, glideTo: 45 });
  for (let i = 0; i < 4; i++) tone(300 + i * 90, t + 0.6 + i * 0.07, { peak: 0.04, decay: 0.07, glideTo: 700 });
}

/** Munching: crunchy little bites. */
function munch(times = 4): void {
  const t = now();
  for (let i = 0; i < times; i++) noiseBurst(t + i * 0.24, { freq: 1800, q: 1.4, peak: 0.08, decay: 0.08 });
}

/** A school bell tolling, far off: deep, slow and heavy. */
function toll(): void {
  const t = now();
  bell(196, t, 0.16, 3.4);
  tone(98, t, { peak: 0.1, attack: 0.01, decay: 3.4 });
  bell(196 * 1.19, t + 0.01, 0.04, 2.4);
}

// --------------------------------------------------------------------- art

/** A toffee wrapped in twisted paper. */
function toffee(x: number, y: number, s: number, col: string): Node[] {
  return [
    piece(poly([[x - 26 * s, y - 10 * s], [x - 14 * s, y], [x - 26 * s, y + 10 * s]]), C.cream, { edge: 'cut', fibre: false }),
    piece(poly([[x + 26 * s, y - 10 * s], [x + 14 * s, y], [x + 26 * s, y + 10 * s]]), C.cream, { edge: 'cut', fibre: false }),
    piece(ellipse(x, y, 16 * s, 11 * s), col, { edge: 'cut' }),
  ];
}

/** A toffee-shock tree: a twisty barley-sugar trunk and a round crown hung with toffees. */
function toffeeTree(x: number, base: number, h: number, seed: number): Node[] {
  const r = rng(seed);
  const crown = C.leafLight;
  const out: Node[] = [
    piece(curve([[x - 18, base], [x - 12, base - h * 0.5], [x - 8, base - h * 0.8], [x + 8, base - h * 0.8], [x + 12, base - h * 0.5], [x + 18, base]], 2), C.toffee),
    ...[0.2, 0.4, 0.6].map((k) => ink([[x - 14, base - h * k], [x + 14, base - h * k - 16]], { width: 4, color: C.cream, opacity: 0.7 })),
    piece(circle(x, base - h * 0.85, h * 0.32), crown),
    piece(circle(x - h * 0.22, base - h * 0.78, h * 0.2), C.mint, { shadow: false }),
    piece(circle(x + h * 0.22, base - h * 0.8, h * 0.2), crown, { shadow: false }),
  ];
  const cols = [C.toffee, C.jellyRed, C.purple, C.yellow];
  for (let i = 0; i < 5; i++) out.push(...toffee(x + (r() - 0.5) * h * 0.5, base - h * (0.7 + r() * 0.3), 0.7 + r() * 0.3, cols[i % cols.length]));
  return out;
}

const CHASE_W = 3400;

/** The long chase: a candy-striped land of toffee-shock trees, lollies and ice-cream hills. */
function chaseStrip(): string {
  const r = rng(301);
  const nodes: Node[] = [
    piece(rect(-20, -20, CHASE_W + 40, 520), '#d9eee4', { edge: 'clean', shadow: false }),
    piece(rect(-20, 300, CHASE_W + 40, 300), '#f6e6e6', { edge: 'torn', shadow: false, fibre: false }),
  ];
  for (let i = 0; i < 10; i++) nodes.push(piece(ellipse(i * 360 + r() * 100, 80 + r() * 100, 110, 30), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.8 }));
  // Ice-cream hills.
  const hill = (y: number, amp: number, col: string, seed: number) => {
    const rr = rng(seed);
    const pts: Pt[] = [[-20, 840]];
    for (let x = -20; x <= CHASE_W + 20; x += 140) pts.push([x, y - rr() * amp]);
    pts.push([CHASE_W + 20, 840]);
    return piece(curve(pts, 2), col, { rough: 1.2 });
  };
  nodes.push(hill(470, 60, '#c4e4d2', 1), hill(520, 50, '#f2c6cf', 2));
  // Back row of toffee trees, then the ground, then the front row.
  for (let i = 0; i < 12; i++) nodes.push(...toffeeTree(140 + i * 290 + r() * 60, 560, 200 + r() * 60, 10 + i));
  nodes.push(piece(curve([[-20, 600], [CHASE_W / 2, 580], [CHASE_W + 20, 600], [CHASE_W + 20, 840], [-20, 840]], 2), '#f3d2d8', { rough: 1.2 }));
  // A candy-striped path all along.
  for (let x = -20; x < CHASE_W; x += 90) nodes.push(piece(poly([[x, 660], [x + 50, 660], [x + 30, 720], [x - 20, 720]]), C.candyPink, { edge: 'cut', fibre: false, shadow: false }));
  for (let i = 0; i < 60; i++) nodes.push(piece(rect(r() * CHASE_W, 730 + r() * 80, 14, 5, 2), [C.jellyRed, C.mint, C.yellow, C.blue][i % 4], { edge: 'cut', fibre: false, shadow: false }));
  // Lollies along the path.
  for (let i = 0; i < 9; i++) {
    const x = 200 + i * 380 + r() * 80;
    nodes.push(ink([[x, 660], [x, 560]], { width: 5, color: C.white }), piece(circle(x, 540, 30), [C.mint, C.jellyRed, C.yellow][i % 3]), ink(Array.from({ length: 14 }, (_, k) => [x + Math.cos(k / 2) * k * 1.8, 540 + Math.sin(k / 2) * k * 1.8] as Pt), { width: 3, color: C.white, opacity: 0.7 }));
  }
  return svg({ w: CHASE_W, h: 820, name: 'l3c8-chase', boil: false }, nodes);
}

/** A green puddle of jelly (the goblin's own drips). */
function puddleArt(): string {
  return svg({ w: 260, h: 70, name: 'l3c8-puddle', boil: false }, [
    piece(curve([[10, 40], [60, 14], [130, 20], [200, 10], [250, 36], [220, 60], [120, 62], [30, 58]], 2), C.jelly, { edge: 'cut' }),
    piece(ellipse(90, 30, 30, 6), C.jellyLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
  ]);
}

/** The sky beyond the edge of the land, and the cloud below it. */
function edgeSky(): string {
  return svg({ w: 1180, h: 820, name: 'l3c8-sky', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#d9eee4', { edge: 'clean', shadow: false }),
    piece(rect(-20, 280, 1220, 300), '#f6e6e6', { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 520, 1220, 340), C.duskSky, { edge: 'torn', shadow: false, fibre: false }),
    ...[[200, 120], [700, 80], [1000, 200]].map(([x, y]) => piece(ellipse(x, y, 120, 26), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.8 })),
  ]);
}

/** The edge of the Land of Goodies: sugary ground that stops, crumbling, in mid-air. */
function landEdge(): string {
  const nodes: Node[] = [
    ...toffeeTree(120, 600, 320, 41),
    ...toffeeTree(470, 580, 240, 42),
    piece(curve([[-40, 590], [300, 570], [620, 586], [760, 600], [780, 660], [740, 720], [700, 800], [600, 880], [-40, 880]], 2), '#f3d2d8', { rough: 1.4 }),
    piece(curve([[620, 640], [760, 640], [740, 720], [690, 800], [640, 820]], 2), C.candyPink, { rough: 1.6, shadow: false }),
    ...[[250, 690], [420, 740], [560, 700]].map(([x, y]) => piece(rect(x, y, 16, 6, 2), C.mint, { edge: 'cut', fibre: false, shadow: false })),
    // Crumbs of sugar falling off the edge.
    ...[[760, 760], [730, 820], [700, 870]].map(([x, y], i) => piece(circle(x, y, 8 - i * 2), '#f3d2d8', { edge: 'torn' })),
  ];
  return svg({ w: 800, h: 900, name: 'l3c8-edge', boil: false }, nodes);
}

/** The cloud the ladder comes up through, with the top of the ladder. */
function ladderTop(): string {
  return svg({ w: 600, h: 400, name: 'l3c8-ladder', boil: false }, [
    piece(band2([[190, 420], [196, 40]], 12), C.wood, { edge: 'cut' }),
    piece(band2([[300, 420], [294, 40]], 12), C.wood, { edge: 'cut' }),
    ...[80, 140, 200, 260].map((y) => piece(rect(196, y, 98, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(30 + i * 110, 300 + (i % 2) * 30, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}

/** A straight band between two points (ladder rails). */
function band2(pts: [Pt, Pt], w: number): Pt[] {
  const [[x0, y0], [x1, y1]] = pts;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const nx = (-(y1 - y0) / len) * (w / 2);
  const ny = ((x1 - x0) / len) * (w / 2);
  return [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]];
}

// -------------------------------------------------------------------- moves

/** The goblin's jelly body squashes and stretches, a few times. */
async function jiggle(k: Kit, gob: HTMLElement, times = 3): Promise<void> {
  const jelly = k.part(gob, 'jelly');
  for (let i = 0; i < times; i++) {
    await k.to(jelly, 0.14, { scaleX: 1.08, scaleY: 0.92, ease: 'sine.out' });
    await k.to(jelly, 0.14, { scaleX: 0.95, scaleY: 1.06, ease: 'sine.inOut' });
  }
  await k.to(jelly, 0.14, { scaleX: 1, scaleY: 1 });
}

/** Shakes the goblin's spoon arm in a fury. */
async function shakeSpoon(k: Kit, gob: HTMLElement, times = 4): Promise<void> {
  const arm = k.part(gob, 'armR');
  for (let i = 0; i < times; i++) {
    await k.to(arm, 0.12, { rotation: -30 });
    await k.to(arm, 0.12, { rotation: 6 });
  }
  await k.to(arm, 0.15, { rotation: 0 });
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    munch: { who: 'narrator', text: 'Crunch, munch, slurp. Nobody saw the ground begin to wobble…' },
    who: { who: 'jellyGoblin', text: 'Who’s been eating MY goodies?!' },
    run: { who: 'hero', text: 'Uh-oh. The Jelly Goblin! Run, {name}! Run for the ladder!' },
    fun: { who: 'saucepan', text: 'EH? Fun? Did you say FUN? Clank, clank, clank!' },
    back: { who: 'jellyGoblin', text: 'Come back here! Those were MY toffee shocks!' },
    splat: { who: 'narrator', text: 'Splat! The Jelly Goblin slipped on his own wobbly jelly!' },
    quick: { who: 'moonface', text: 'The land is moving on! Down the ladder, quick, quick!' },
    bother: { who: 'jellyGoblin', text: 'Come back! Oh, wibble-wobble… bother my jelly!' },
    catch: { who: 'saucepan', text: 'Got it! A spoon for my saucepans! Clank!' },
    prize: { who: 'narrator', text: '{name} won the Jelly Goblin’s spoon, and the seal of the Land of Goodies!' },
    look: { who: 'hero', text: 'Look! Something new is in the cloud. A grey building, with a bell tower…' },
    school: { who: 'moonface', text: 'A school? At the top of the tree? Oh, I don’t like this one bit.' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: the goblin rises
    k.landScene(3);
    k.music('cosy');
    const hero = k.character('hero', { x: 560, y: 380, w: 230, z: 20 });
    const sauce = k.character('saucepan', { x: 830, y: 370, w: 240, z: 20, flip: true });
    const gob = k.character('jellyGoblin', { x: 60, y: 160, w: 420, z: 15 });
    const snack = k.prop('toffee', { x: 760, y: 470, w: 80, z: 22 });
    k.set([hero, sauce], { opacity: 0 });
    k.set(gob, { opacity: 0 });
    await k.all(k.enter(hero, 'right'), k.wait(200).then(() => k.enter(sauce, 'right')));
    munch(5);
    void k.hop(snack, 20, 2);
    await k.say('munch');

    // The ground wobbles… and up he comes, enormous.
    k.silence();
    wobble(1.2);
    void k.quake(6);
    await k.wait(700);
    rise();
    k.set(gob, { opacity: 1 });
    await k.enter(gob, 'bottom', 1.3);
    k.music('sneaky');
    void jiggle(k, gob, 2);
    await k.camera({ zoom: 1.35, x: 300, y: 330 }, 0.8);
    void k.shake(gob, 8, 3);
    void shakeSpoon(k, gob, 3);
    await k.say('who', gob);
    await k.camera({}, 0.6);
    void k.vanish(snack);
    void k.shake(hero, 6, 2);
    await k.say('run', hero);
    clank(6);
    void k.hop(sauce, 30, 2);
    await k.say('fun', sauce);
    k.fx.whizz();
    await k.all(k.exit(hero, 'right', 0.6), k.wait(150).then(() => k.exit(sauce, 'right', 0.6)));

    // ------------------------------------------- scene 2: the chase
    let strip!: HTMLElement;
    let h2!: HTMLElement;
    let s2!: HTMLElement;
    let g2!: HTMLElement;
    await k.cut(() => {
      strip = k.add(chaseStrip(), { x: 0, y: 0, w: CHASE_W, h: 820, z: 2, still: true });
      h2 = k.character('hero', { x: 820, y: 400, w: 210, z: 20, flip: false });
      s2 = k.character('saucepan', { x: 600, y: 390, w: 220, z: 20 });
      g2 = k.character('jellyGoblin', { x: 20, y: 250, w: 360, z: 18 });
    });
    k.music('adventure');
    // Running: the toffee trees stream past while everyone bobs along.
    const legs = (el: HTMLElement, steps: number, each: number) =>
      (async () => {
        for (let i = 0; i < steps; i++) {
          await k.to(el, each / 2, { y: -16, ease: 'power1.out' });
          await k.to(el, each / 2, { y: 0, ease: 'power1.in' });
        }
      })();
    const scroll = (to: number, s: number) => k.to(strip, s, { x: -to, ease: 'none' });
    clank(12, 0.25);
    wobble(2.5);
    await k.all(
      scroll(1100, 3.2),
      legs(h2, 10, 0.32),
      legs(s2, 9, 0.36),
      (async () => {
        await k.say('back', g2);
      })(),
      (async () => {
        for (let i = 0; i < 4; i++) await jiggle(k, g2, 1);
      })(),
    );
    // He's gaining on them…
    wobble(1.5);
    void k.camera({ zoom: 1.15, x: 520, y: 450 }, 1.5);
    await k.all(scroll(1800, 2.2), legs(h2, 7, 0.32), legs(s2, 6, 0.36), k.to(g2, 2.2, { x: 160, ease: 'sine.inOut' }), jiggle(k, g2, 3));
    // A puddle of his own jelly, right under his feet.
    const puddle = k.add(puddleArt(), { x: 260, y: 640, w: 260, z: 19 });
    k.set(puddle, { opacity: 0 });
    void k.appear(puddle, 0.3);
    splat();
    await k.all(
      k.to(g2, 0.5, { rotation: -25, x: 300, ease: 'power1.in' }),
      k.to(k.part(g2, 'jelly'), 0.5, { scaleY: 0.85, scaleX: 1.12 }),
    );
    await k.to(g2, 0.25, { rotation: -80, y: 180, x: 260, ease: 'power2.in' });
    void k.quake(8);
    k.puff(420, 640, 180, C.jellyLight);
    void k.camera({}, 0.8);
    void k.to(k.part(g2, 'jelly'), 0.4, { scaleY: 1, scaleX: 1 });
    void k.all(scroll(2050, 1.6), k.exit(h2, 'right', 1.4), k.exit(s2, 'right', 1.6));
    await k.say('splat');
    clank(3);
    await k.all(k.shake(g2, 5, 2), k.wait(600));

    // ------------------------------------------- scene 3: the edge of the land
    let edge!: HTMLElement;
    let h3!: HTMLElement;
    let s3!: HTMLElement;
    let g3!: HTMLElement;
    let m3!: HTMLElement;

    await k.cut(() => {
      k.backdrop(edgeSky());
      edge = k.add(landEdge(), { x: -20, y: 0, w: 800, h: 900, z: 4, still: true });
      k.add(ladderTop(), { x: 600, y: 420, w: 600, z: 26, still: true });
      m3 = k.character('moonface', { x: 790, y: 320, w: 200, z: 24, flip: true });
      h3 = k.character('hero', { x: 380, y: 360, w: 200, z: 20 });
      s3 = k.character('saucepan', { x: 160, y: 350, w: 210, z: 20 });
      g3 = k.character('jellyGoblin', { x: -400, y: 200, w: 340, z: 18 });
      k.set(m3, { y: 240 });
    });
    k.music('adventure');
    k.fx.boing();
    await k.to(m3, 0.5, { y: 0, ease: 'back.out(1.6)' });
    void wave(k, m3, 'armL', 3);
    k.fx.rumble(1.4);
    void k.quake(4);
    await k.say('quick', m3);
    // Down the ladder they go, one after another.
    k.fx.whizz();
    await k.to(m3, 0.4, { y: 300, ease: 'power2.in' });
    await k.to(h3, 0.6, { x: 450, y: -40, ease: 'power1.out' });
    await k.to(h3, 0.4, { y: 360, ease: 'power2.in' });
    clank(4);
    await k.to(s3, 0.8, { x: 660, y: -40, ease: 'power1.out' });
    await k.to(s3, 0.4, { y: 360, ease: 'power2.in' });

    // The goblin wobbles up to the edge, too late: the land rises away with him on it.
    wobble(1.2);
    await k.to(g3, 1.2, { x: 520, ease: 'power1.out' });
    void jiggle(k, g3, 2);
    k.fx.rumble(2.5);
    const going = k.all(k.to(edge, 6, { y: -760, ease: 'power1.in' }), k.to(g3, 6, { y: -760, ease: 'power1.in' }));
    void shakeSpoon(k, g3, 8);
    await k.say('bother', g3);
    // He shakes his spoon so hard it flies out of his jelly fingers…
    const spoonPart = k.part(g3, 'spoon');
    // Where his spoon is now (he is rising): the start of its fall.
    const sx = 120 + (273 * 340) / 300;
    const sy = 200 + Number(gsap.getProperty(g3, 'y')) + (106 * 340) / 300;
    const spoon = k.keepsake(k.chapter!.keepsake, { x: sx - 70, y: sy - 70, w: 140, z: 30 });
    spoonPart.forEach((p) => (p.style.opacity = '0'));
    k.fx.whizz();
    // …and the Saucepan Man pops up from the ladder to catch it. Clang!
    await k.all(
      k.to(spoon, 1.1, { x: 850 - sx, y: 430 - sy, rotation: 540, ease: 'power1.in' }),
      k.wait(400).then(() => k.to(s3, 0.4, { y: 0, x: 620, ease: 'back.out(1.6)' })),
    );
    clank(3, 0.1);
    k.sparkle(850, 430, 12, 120);
    await k.say('catch', s3);
    await going;
    k.remove(spoon);

    // ------------------------------------------- scene 4: home, with the spoon
    let m4!: HTMLElement;
    let h4!: HTMLElement;
    let s4!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l3c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      h4 = k.character('hero', { x: 250, y: 360, w: 240, z: 20 });
      s4 = k.character('saucepan', { x: 470, y: 350, w: 240, z: 19 });
      m4 = k.character('moonface', { x: 720, y: 350, w: 250, z: 20, flip: true });
    });
    k.music('cosy');
    flump();
    await together(k, [h4, s4, m4], 0.3, { y: '+=10' });
    await together(k, [h4, s4, m4], 0.3, { y: '-=10' });
    const keep = k.keepsake(k.chapter!.keepsake, { x: 515, y: 470, w: 150, z: 24 });
    const seal = k.add(landSeal(3), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    clank(4);
    await k.all(k.say('prize'), k.hop(h4, 36, 2), k.wait(300).then(() => k.hop(s4, 24, 2)));
    await k.wait(800);

    // ------------------------------------------- scene 5: the new land
    let veil!: HTMLElement;
    let h5!: HTMLElement;
    let m5!: HTMLElement;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l3c8-tree', { landN: 4 }));
      veil = k.dim(0.3, '#2a2236');
      h5 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      m5 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
    });
    k.music('spooky');
    k.fx.wind(3);
    k.fx.rumble(2);
    await k.wait(800);
    await k.say('look', h5);
    // Closer and closer to the grey school in the cloud.
    void k.to(veil, 3, { opacity: 0.45 });
    void k.all(k.fade(h5, 0, 1), k.fade(m5, 0.0, 1.6));
    await k.camera({ zoom: 1.9, x: 590, y: 100 }, 3);
    toll();
    void k.quake(3);
    await k.wait(1200);
    await k.say('school', m5);
    toll();
    await k.wait(900);
    sting();
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(1200);
  },
});
