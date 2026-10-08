/**
 * Land 7, chapter 8 (the land's finale): Silky is Taken!
 *
 * Plays straight after the finale game, where every right answer snapped
 * one of Dame Snap's rulers and she stormed off into the mist ("I'll take
 * something you love!"). The biggest cliffhanger in the game. Four scenes:
 *
 *   1. Broken rulers on the violet moss. Silky flutters down to cheer him,
 *      and the Enchanter grumbles that he made Dame Snap a magic lantern as
 *      his side of their deal, and wishes he hadn't. Then clack, clack,
 *      CLACK: she looms out of the mist holding that lantern up. It glows,
 *      and Silky is drawn inside (nobody touches her), and its little door
 *      drops shut. Silky is scared but brave: "Keep counting!" Through the
 *      bars falls her ribbon, with one glowing dewdrop tied in it. Dame
 *      Snap shrieks and stalks off into the mist with the lantern, and the
 *      ground rumbles: the land is moving on. They must go, and they promise
 *      to come back for her.
 *   2. From the top of the ladder: the Land of Spells rises away into the
 *      night, one tiny gold light in it.
 *   3. Moon-Face's room, quiet: the ribbon, and Silky's dewdrop still
 *      glowing. Her magic lives in it (which is why her help still works on
 *      the problem screen in lands 8 and 9). The seal of the Land of Spells.
 *   4. Dusk at the top of the tree: a tin drum and a toy train's whistle,
 *      and the Land of Toys settles into the cloud.
 *
 * Scary, never cruel (PLAN.md §2): she looms and shrieks; the lantern does
 * the catching, and Silky is shut in, not hurt.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree, TREE_SPOTS } from '../art/scenery';
import { band, bell, C, circle, curve, defineStory, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { blackSheet, flump, together } from './bits';
import { snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** The lantern waking: a low magic hum that swells, with a shimmer on top. */
function lanternHum(seconds = 2): void {
  const t = now();
  tone(NOTE.C3, t, { wave: 'sawtooth', peak: 0.05, attack: seconds * 0.5, decay: seconds, vibrato: [5, 4], lowpass: 700 });
  tone(NOTE.G3 * 1.03, t, { wave: 'triangle', peak: 0.04, attack: seconds * 0.5, decay: seconds, vibrato: [6, 6] });
  [NOTE.E6, NOTE.C6, NOTE.A5].forEach((f, i) => bell(f, t + 0.3 + i * 0.25, 0.03, 1));
}

/** Silky being drawn in: a falling, fluttering whistle. */
function drawnIn(): void {
  const t = now();
  tone(1500, t, { wave: 'sine', peak: 0.06, attack: 0.05, decay: 1.1, glideTo: 700, vibrato: [14, 40] });
  noiseBurst(t, { freq: 2600, q: 2, peak: 0.04, attack: 0.2, decay: 0.8, sweepTo: 1200 });
}

/** The lantern's little door dropping shut: a small, sharp metal click. */
function click(): void {
  const t = now();
  noiseBurst(t, { freq: 3800, q: 6, peak: 0.12, decay: 0.03 });
  tone(1900, t, { wave: 'triangle', peak: 0.06, attack: 0.002, decay: 0.08, glideTo: 1400 });
  bell(NOTE.A5 * 1.05, t + 0.02, 0.03, 0.5);
}

/** A tin drum, far off: a quick rat-a-tat-tat. */
function tinDrum(): void {
  const t = now();
  [0, 0.12, 0.24, 0.48].forEach((d, i) => {
    noiseBurst(t + d, { freq: 1800, q: 1.2, peak: i === 3 ? 0.08 : 0.05, decay: 0.07 });
    tone(220, t + d, { wave: 'triangle', peak: 0.04, attack: 0.002, decay: 0.08, glideTo: 160 });
  });
}

/** A toy train's whistle, far away: two soft toots. */
function toot(): void {
  const t = now();
  for (const d of [0, 0.5]) {
    tone(NOTE.E5, t + d, { wave: 'sine', peak: 0.05, attack: 0.04, decay: 0.38, vibrato: [7, 6] });
    tone(NOTE.G5, t + d, { wave: 'sine', peak: 0.035, attack: 0.04, decay: 0.38, vibrato: [7, 6] });
    noiseBurst(t + d, { freq: 2400, q: 3, peak: 0.02, attack: 0.04, decay: 0.3 });
  }
}

// --------------------------------------------------------------------- art

/** The lantern's size: a cage of iron bars, like a birdcage, with a ring to hold it by. */
const LANTERN = { w: 180, h: 260 };

/**
 * Dame Snap's catching lantern (the Enchanter made it as his side of their
 * deal): a domed iron cage with a brass ring on top. Between the bars it is
 * open, so whoever is shut inside shows through. The little door (part
 * `door`) slides down to shut, as a birdcage door does: it starts lifted.
 */
function lanternArt(): string {
  const bars: Node[] = [];
  for (let i = 0; i < 8; i++) {
    const x = 34 + i * 16;
    if (x > 74 && x < 110) continue; // the gap where the door drops
    bars.push(piece(rect(x - 2.5, 76, 5, 150), C.iron, { edge: 'cut', fibre: false }));
  }
  const door: Node[] = [
    piece(rect(74, 124, 34, 4), C.brass, { edge: 'cut', fibre: false }),
    ...[78, 90, 102].map((x) => piece(rect(x - 2, 124, 4, 100), C.brass, { edge: 'cut', fibre: false })),
    piece(circle(91, 172, 6), C.brassDark, { edge: 'cut' }),
  ];
  return svg({ w: LANTERN.w, h: LANTERN.h, name: 'l7c8-lantern', label: 'a lantern like a birdcage' }, [
    ink(circle(90, 18, 13), { width: 5, color: C.brass, closed: true }),
    piece(rect(84, 28, 12, 16, 3), C.brassDark, { edge: 'cut' }),
    // The domed top.
    piece(curve([[22, 80], [40, 50], [90, 38], [140, 50], [158, 80]], 2), C.charcoal),
    piece(rect(18, 72, 144, 12, 4), C.iron, { edge: 'cut' }),
    ...bars,
    piece(rect(18, 136, 144, 5, 2), C.iron, { edge: 'cut', fibre: false }),
    // The base.
    piece(rect(14, 222, 152, 22, 6), C.charcoal),
    piece(poly([[60, 244], [120, 244], [104, 258], [76, 258]]), C.iron, { edge: 'cut' }),
    group({ part: 'door', origin: [91, 174] }, door),
  ]);
}

/** One of her snapped rulers: two red halves lying on the ground (220 × 70). */
function brokenRuler(seed: number): string {
  const r = rng(seed);
  const half = (x: number, y: number, a: number, flipEnd: boolean): Node => {
    const marks: Node[] = [];
    for (let i = 1; i < 7; i++) marks.push(ink([[x + i * 12, y], [x + i * 12, y + (i % 2 ? 8 : 12)]], { width: 1.6, color: C.snapInk, opacity: 0.8 }));
    const jag: Pt[] = flipEnd ? [[x, y], [x + 6, y + 6], [x, y + 12], [x + 5, y + 18], [x, y + 22]] : [[x + 90, y], [x + 84, y + 6], [x + 90, y + 12], [x + 85, y + 18], [x + 90, y + 22]];
    const body: Pt[] = flipEnd ? [...jag, [x + 90, y + 22], [x + 90, y]] : [[x, y], ...jag, [x, y + 22]];
    return group({ transform: `rotate(${a} ${x + 45} ${y + 11})` }, [piece(poly(body), C.ruler, { edge: 'cut' }), ...marks]);
  };
  return svg({ w: 220, h: 70, name: `l7c8-ruler-${seed}`, boil: false }, [half(10, 30, -8 + r() * 6, false), half(118, 26, 10 + r() * 8, true)]);
}

/** A dewdrop that glows (60 × 80): Silky's magic, kept safe. */
function dewdrop(): string {
  return svg({ w: 60, h: 80, name: 'l7c8-dew', boil: false, label: 'a glowing dewdrop' }, [
    piece(curve([[30, 6], [40, 30], [50, 50], [44, 70], [30, 76], [16, 70], [10, 50], [20, 30]], 2), C.dew, { edge: 'cut' }),
    piece(ellipse(24, 52, 7, 12, 20), C.white, { edge: 'clean', fibre: false, shadow: false, opacity: 0.8 }),
    piece(curve([[44, 46], [46, 60], [38, 70], [42, 58]], 1), C.dewShade, { edge: 'clean', fibre: false, shadow: false, opacity: 0.7 }),
  ]);
}

/** A band of violet mist (1500 × 300), to hide feet and the hem of her gown. */
function mist(seed: number): string {
  const r = rng(seed);
  const nodes: Node[] = [];
  for (let i = 0; i < 16; i++) nodes.push(piece(ellipse(r() * 1500, 90 + r() * 160, 160 + r() * 140, 40 + r() * 30), i % 2 ? '#8d7fb5' : '#b4a8d6', { edge: 'torn', fibre: false, shadow: false, opacity: 0.55 }));
  nodes.push(piece(rect(-20, 190, 1540, 140), '#7d6fa8', { edge: 'torn', fibre: false, shadow: false, opacity: 0.5 }));
  return svg({ w: 1500, h: 300, name: `l7c8-mist-${seed}`, boil: false }, nodes);
}

/** The night sky above the cloud, from the top of the ladder: deep violet, stars, a cloud floor. */
function nightSky(): string {
  const r = rng(77);
  const nodes: Node[] = [
    piece(rect(-20, -20, 1220, 520), C.spellNight, { edge: 'clean', shadow: false }),
    piece(rect(-20, 380, 1220, 300), '#3b3270', { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 560, 1220, 300), C.duskHigh, { edge: 'torn', shadow: false, fibre: false }),
  ];
  for (let i = 0; i < 60; i++) nodes.push(piece(circle(r() * 1180, r() * 520, 1.5 + r() * 2.2), i % 4 ? C.cream : C.goldLight, { edge: 'clean', fibre: false, shadow: false, opacity: 0.5 + r() * 0.5 }));
  for (let i = 0; i < 9; i++) nodes.push(piece(circle(i * 150 + r() * 40, 700 + (i % 2) * 40, 110 + r() * 40), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 3 === 0 }));
  return svg({ w: 1180, h: 820, name: 'l7c8-night', boil: false, className: 'backdrop' }, nodes);
}

/** The top of the ladder, coming up through the cloud (600 × 400). */
function ladderTop(): string {
  return svg({ w: 600, h: 400, name: 'l7c8-ladder', boil: false }, [
    piece(band([[230, 420], [236, 30]], 12), C.wood, { edge: 'cut' }),
    piece(band([[350, 420], [344, 30]], 12), C.wood, { edge: 'cut' }),
    ...[70, 130, 190, 250].map((y) => piece(rect(236, y, 108, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(30 + i * 110, 310 + (i % 2) * 30, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}

// -------------------------------------------------------------------- moves

/** Silky's wings flutter, `times` beats. */
async function flutter(k: Kit, el: HTMLElement, times = 4): Promise<void> {
  const wings = [...k.part(el, 'wingL'), ...k.part(el, 'wingR')];
  if (!wings.length) return;
  for (let i = 0; i < times; i++) {
    await k.to(wings, 0.09, { scaleX: 0.75, ease: 'sine.inOut' });
    await k.to(wings, 0.09, { scaleX: 1, ease: 'sine.inOut' });
  }
}

/** A light, drifting fall from side to side, to (x, y) relative to where it was placed. */
async function drift(k: Kit, els: HTMLElement[], dx: number, dy: number, seconds: number): Promise<void> {
  const swings = 4;
  const each = seconds / swings;
  for (let i = 1; i <= swings; i++) {
    const sway = i === swings ? 0 : (i % 2 ? 1 : -1) * 40;
    await k.all(...els.map((e) => k.to(e, each, { x: (dx * i) / swings + sway, y: (dy * i) / swings, rotation: sway / 4, ease: 'sine.inOut' })));
  }
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    snapped: { who: 'narrator', text: 'Snap, snap, snap! Every one of Dame Snap’s rulers lay broken on the ground.' },
    cheer: { who: 'silky', text: 'You did it, {name}! I watched the whole thing!' },
    deal: { who: 'enchanter', text: 'Hmph. I wrote her a deal. One lantern, one fairy. Oh, I wish I hadn’t.' },
    clack: { who: 'narrator', text: 'Then, out of the purple mist… clack. Clack. CLACK.' },
    take: { who: 'dameSnap', text: 'You snapped my rulers. So now I shall take something YOU love!' },
    lantern: { who: 'enchanter', text: 'No! That lantern catches anything with wings! Silky, fly!' },
    pulled: { who: 'narrator', text: 'The lantern glowed. Silky was pulled inside, and its little door clicked shut.' },
    brave: { who: 'silky', text: 'Don’t be scared! Keep counting, {name}! Keep getting them right!' },
    mine: { who: 'dameSnap', text: 'Mine now! Off to my prison, little fairy. Ha!' },
    rumble: { who: 'moonface', text: 'The land is moving on! We must go, or we’ll be stuck here for ever!' },
    promise: { who: 'hero', text: 'We’ll come back for you, Silky. We promise!' },
    away: { who: 'narrator', text: 'And the Land of Spells moved on, with Silky inside it.' },
    dewdrop: { who: 'moonface', text: 'Look. Silky’s ribbon, with a dewdrop tied in it. It’s still glowing.' },
    magic: { who: 'hero', text: 'Her magic is in it. So Silky can still help us count.' },
    hope: { who: 'moonface', text: 'And we will find her. Whatever it takes.' },
    listen: { who: 'hero', text: 'Listen! A drum. And a train whistle. A new land is coming.' },
    toys: { who: 'moonface', text: 'The Land of Toys. Be brave, everyone. Silky would want us to be.' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: the lantern
    k.landScene(7);
    k.music('magic');
    const rulers = [
      k.add(brokenRuler(1), { x: 250, y: 630, w: 200, z: 14 }),
      k.add(brokenRuler(2), { x: 560, y: 600, w: 180, z: 13 }),
      k.add(brokenRuler(3), { x: 760, y: 640, w: 210, z: 14 }),
    ];
    const hero = k.character('hero', { x: 30, y: 400, w: 230, z: 20 });
    const mf = k.character('moonface', { x: 290, y: 390, w: 230, z: 19 });
    const ench = k.character('enchanter', { x: 900, y: 370, w: 250, z: 19, flip: true });
    const fog = k.add(mist(5), { x: -160, y: 560, w: 1500, z: 25, still: true });
    k.set(fog, { opacity: 0.5 });
    k.ambient('fireflies', { count: 10, z: 12, area: [0, 380, 1180, 260] });
    k.set([hero, mf, ench], { opacity: 0 });
    await k.all(k.enter(hero, 'left'), k.wait(150).then(() => k.enter(mf, 'left')), k.enter(ench, 'right'));
    rulers.forEach((r, i) => void k.wait(i * 250).then(() => k.pop(r, 1.1)));
    await k.say('snapped');

    // Silky flutters down to cheer him.
    const silky = k.character('silky', { x: 560, y: 150, w: 190, z: 26 });
    const halo = k.light(655, 260, 130, { color: C.goldLight, strength: 0, z: 25 });
    k.set(silky, { opacity: 0 });
    k.fx.twinkle();
    void flutter(k, silky, 8);
    await k.enter(silky, 'top', 1);
    void k.fade(halo, 0.35, 0.5);
    k.sparkle(655, 240, 12, 140);
    await k.all(k.say('cheer', silky), k.hop(hero, 30, 2), k.wait(200).then(() => k.hop(mf, 24, 1)));
    void k.shake(ench, 4, 1);
    await k.say('deal', ench);

    // Clack… clack… CLACK. The mist darkens, and she looms out of it.
    k.silence();
    const gloom = k.dim(0, '#1a1236');
    void k.fade(gloom, 0.4, 2);
    void k.fade(fog, 0.95, 2);
    const clacks = k.say('clack');
    for (const loud of [0.4, 0.7, 1]) {
      snapSound.heels(1, 0.3, loud);
      await k.wait(750);
    }
    await clacks;
    k.music('spooky');
    // The Enchanter shrinks back out of her way.
    void k.to(ench, 0.7, { x: -330, ease: 'power2.out' });
    const snap = k.snap('loom', { x: 790, y: 170, w: 380, z: 18, flip: true });
    k.set(snap, { opacity: 0, y: 80 });
    k.fx.rumble(1.2);
    await k.all(k.to(snap, 1.2, { opacity: 1, y: 0, ease: 'power2.out' }), k.shake(silky, 4, 2), k.shake(hero, 5, 2));
    snapSound.ruler();
    void k.camera({ zoom: 1.3, x: 860, y: 380 }, 0.9);
    await k.say('take', snap);

    // She holds up the lantern, and it wakes.
    const lan = k.add(lanternArt(), { x: 728, y: 270, w: 160, z: 28 });
    const door = k.part(lan, 'door');
    k.set(door, { y: -96 });
    const lanGlow = k.light(808, 410, 150, { color: C.goldLight, strength: 0, z: 17 });
    k.set(lan, { opacity: 0 });
    void k.camera({}, 0.7);
    k.pose(snap, 'point');
    await k.appear(lan, 0.45);
    lanternHum(2.4);
    void k.fade(lanGlow, 0.55, 1);
    void k.shake(ench, 6, 2);
    await k.say('lantern', ench);

    // A beam of light, and Silky is drawn in, fluttering. Nobody touches her.
    void k.beam([808, 410], [655, 258], C.goldLight, 0.5);
    drawnIn();
    void k.fade(halo, 0, 0.6);
    void flutter(k, silky, 6);
    const told = k.say('pulled');
    await k.to(silky, 1.2, { x: 153, y: 146, scale: 0.6, ease: 'power2.in' });
    await k.to(door, 0.2, { y: 0, ease: 'power2.in' });
    click();
    void k.pop(lan, 1.06);
    await told;
    await k.all(k.say('brave', silky), flutter(k, silky, 6));

    // Her ribbon, with one glowing dewdrop tied in it, falls through the bars.
    const ribbon = k.keepsake(k.chapter!.keepsake, { x: 760, y: 450, w: 90, z: 29 });
    const drop = k.add(dewdrop(), { x: 793, y: 474, w: 24, z: 30 });
    const dropGlow = k.light(805, 490, 50, { color: C.dew, strength: 0.6, z: 29 });
    k.set([ribbon, drop, dropGlow], { opacity: 0 });
    void k.all(k.fade(ribbon, 1, 0.3), k.fade(drop, 1, 0.3), k.fade(dropGlow, 0.6, 0.3));
    k.fx.twinkle();
    const falling = drift(k, [ribbon, drop, dropGlow], -620, 90, 3.2);

    // She shrieks, and stalks off into the mist with the lantern.
    k.pose(snap, 'shriek');
    void k.camera({ zoom: 1.2, x: 860, y: 400 }, 0.6);
    void k.shake(snap, 5, 2);
    await k.say('mine', snap);
    void k.camera({}, 0.8);
    snapSound.heels(5, 0.3);
    await k.all(
      together(k, [snap, lan, silky, lanGlow], 1.8, { x: '+=520', opacity: 0, ease: 'power1.in' }),
      falling,
    );
    k.sparkle(170, 560, 10, 90);
    void k.hop(hero, 20, 1);

    // The ground rumbles: the land is moving on.
    k.music('adventure');
    k.fx.rumble(2.5);
    void k.quake(6);
    void k.fade(gloom, 0.2, 1);
    await k.all(k.say('rumble', mf), k.shake(mf, 6, 2));
    await k.all(k.say('promise', hero), k.to(hero, 0.6, { x: '+=60' }));
    k.fx.whizz();
    await k.all(k.exit(mf, 'left', 0.6), k.wait(300).then(() => k.exit(hero, 'left', 0.6)));

    // ------------------------------------------- scene 2: the land goes
    let land!: HTMLElement;
    let spark!: HTMLElement;
    let h2!: HTMLElement;
    let m2!: HTMLElement;
    await k.cut(() => {
      k.backdrop(nightSky());
      land = k.landFar(7, { x: 290, y: 190, w: 600, z: 5 });
      spark = k.light(560, 250, 34, { color: C.goldLight, strength: 0.9, z: 6 });
      k.add(ladderTop(), { x: 290, y: 450, w: 600, z: 22, still: true });
      h2 = k.character('hero', { x: 330, y: 400, w: 200, z: 20 });
      m2 = k.character('moonface', { x: 650, y: 410, w: 200, z: 20, flip: true });
    });
    k.music('dreamy');
    k.fx.rumble(3);
    // Up and away into the night, smaller and smaller, the one gold light with it.
    const going = k.all(
      k.to(land, 7, { y: -200, scale: 0.3, ease: 'power1.in' }),
      k.to(spark, 7, { x: 30 * 0.7, y: -200 + 30 * 0.7, scale: 0.5, ease: 'power1.in' }),
    );
    await k.wait(900);
    await k.say('away');
    void k.shake(h2, 3, 1);
    await going;
    await k.fade(spark, 0, 1);
    await k.all(k.to(h2, 0.5, { y: 30 }), k.to(m2, 0.5, { y: 30 }));

    // ------------------------------------------- scene 3: the dewdrop
    let h3!: HTMLElement;
    let m3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l7c8-room'));
      k.dim(0.25, '#1a1236');
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.2 });
      h3 = k.character('hero', { x: 150, y: 360, w: 250, z: 20 });
      m3 = k.character('moonface', { x: 780, y: 350, w: 250, z: 20, flip: true });
    });
    flump();
    const keep = k.keepsake(k.chapter!.keepsake, { x: 500, y: 420, w: 180, z: 36 });
    const dew = k.add(dewdrop(), { x: 568, y: 474, w: 44, z: 37 });
    const dewGlow = k.light(590, 500, 110, { color: C.dew, strength: 0, flicker: true, z: 35 });
    k.set([keep, dew], { opacity: 0 });
    await k.wait(500);
    k.fx.twinkle();
    await k.all(k.appear(keep, 0.5), k.wait(200).then(() => k.appear(dew, 0.4)), k.fade(dewGlow, 0.7, 1.2));
    k.float(dew, 4, 2.4);
    await k.say('dewdrop', m3);
    k.sparkle(590, 490, 10, 100);
    await k.all(k.say('magic', h3), k.hop(h3, 16, 1));
    const seal = k.add(landSeal(7), { x: 480, y: 50, w: 220, z: 40 });
    k.set(seal, { opacity: 0 });
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.float(seal, 6, 2);
    await k.say('hope', m3);
    await k.wait(500);

    // ------------------------------------------- scene 4: the Land of Toys arrives
    let veil!: HTMLElement;
    let toys!: HTMLElement;
    let h4!: HTMLElement;
    let m4!: HTMLElement;
    const box = TREE_SPOTS.cloud;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l7c8-tree'));
      toys = k.landFar(8, { x: box.x, y: box.y, w: box.w, z: 4 });
      veil = k.dim(0.3, '#2a2236');
      h4 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      m4 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
      k.set(toys, { y: -220, opacity: 0 });
    });
    k.fx.wind(2);
    await k.wait(600);
    tinDrum();
    await k.wait(500);
    toot();
    await k.say('listen', h4);
    // The Land of Toys floats down and settles into the cloud.
    k.music('cosy');
    void k.to(veil, 3, { opacity: 0.15 });
    void k.all(k.fade(h4, 0, 1.2), k.fade(m4, 0, 1.6));
    await k.all(k.to(toys, 3, { y: 0, opacity: 1, ease: 'sine.out' }), k.camera({ zoom: 1.8, x: 590, y: 120 }, 3.4));
    tinDrum();
    k.sparkle(590, 110, 12, 160);
    await k.say('toys');
    toot();
    await k.wait(1200);
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(800);
  },
});
