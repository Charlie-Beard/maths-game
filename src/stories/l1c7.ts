/**
 * Land 1, chapter 7: Silky's Pop Biscuits.
 *
 * Silky's little yellow door stands open, warm light spilling out onto her
 * branch, where a plate of pop biscuits waits on a toadstool table. Six on
 * the plate… and two more float out of the oven on a sparkle of her wand.
 * Six and two make eight. He takes a bite: POP! A puff of honey-gold
 * sparkle (the comic beat), and Silky gives him a pop biscuit to keep (the
 * keepsake). Then a paper wipe to the whole Faraway Tree at dusk, and the
 * camera climbs up and up to Moon-Face's round room glowing at the very
 * top: ready for the finale climb (Up to Moon-Face's Room).
 */
import { tree } from '../art/scenery';
import { C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, rect, rng, svg, tone, type Kit, type Node } from './kit';
import { roundTag, sumStrip } from './bits';

// ------------------------------------------------------------------ sounds

/** Silky's wand: a soft rising twinkle. */
function wand(): void {
  const t = now();
  [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7].forEach((f, i) => tone(f, t + i * 0.06, { peak: 0.04, attack: 0.005, decay: 0.5 }));
}

/** A biscuit landing on the plate: a little china clink, pitched by count. */
function clink(n: number): void {
  const t = now();
  const f = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6][n % 8];
  tone(f * 2, t, { peak: 0.05, attack: 0.002, decay: 0.3 });
}

/** The POP of a pop biscuit: a cork-pop, then fizzing sherbet. */
function popBite(): void {
  const t = now();
  tone(500, t, { wave: 'triangle', peak: 0.18, attack: 0.003, decay: 0.08, glideTo: 1400 });
  noiseBurst(t, { freq: 1500, q: 1, peak: 0.12, decay: 0.06 });
  for (let i = 0; i < 10; i++) noiseBurst(t + 0.1 + i * 0.05, { freq: 5000 + Math.random() * 2000, q: 4, peak: 0.025, decay: 0.04 });
}

/** A happy giggle: quick bouncing notes. */
function giggle(): void {
  const t = now();
  [NOTE.E5, NOTE.G5, NOTE.E5, NOTE.A5, NOTE.G5].forEach((f, i) => tone(f, t + i * 0.09, { wave: 'triangle', peak: 0.05, decay: 0.1 }));
}

/** The climb ahead: a rising little fanfare of bells. */
function upward(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6].forEach((f, i) => tone(f, t + i * 0.16, { peak: 0.06, attack: 0.01, decay: 1 }));
}

// --------------------------------------------------------------------- art

/** Silky's doorstep: her open yellow door in the trunk, flowers, golden evening light. */
function doorBackdrop(): string {
  const r = rng(707);
  const leaves: Node[] = [];
  for (let i = 0; i < 18; i++) leaves.push(piece(circle(r() * 1180, r() * 80 - 20, 50 + r() * 40), [C.leafDark, C.greenDark, C.moss][i % 3], { rough: 1.4, shadow: i % 3 === 0 }));
  const flowers: Node[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 13) * Math.PI;
    flowers.push(piece(circle(260 - Math.cos(a) * 170, 380 - Math.sin(a) * 250, 14), [C.pink, C.white, C.raspberry, C.goldLight][i % 4], { edge: 'cut' }));
  }
  return svg({ w: 1180, h: 820, name: 'l1c7-door', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#f2c88c', { edge: 'clean', shadow: false }),
    piece(rect(-20, 380, 1220, 480), '#e8a86a', { rough: 2, shadow: false, fibre: false }),
    piece(circle(900, 420, 70), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(560 + i * 130, 560 + (i % 2) * 30, 110), i % 2 ? '#a8a070' : '#b9ad7a', { shadow: false, fibre: false })),
    ...leaves,
    // The trunk on the left, with Silky's door, open.
    piece(curve([[-40, 900], [-20, 400], [-10, -40], [470, -40], [450, 400], [500, 900]], 2), C.bark, { rough: 1.2 }),
    ...[60, 160, 380, 420].map((x) => ink([[x, 820], [x + 6, 400], [x - 4, 0]], { width: 4, color: C.barkDark, opacity: 0.4, wobble: 1.5 })),
    piece(curve([[140, 640], [140, 300], [260, 200], [380, 300], [380, 640]], 2), C.candle),
    piece(curve([[160, 640], [160, 320], [260, 230], [360, 320], [360, 640]], 2), '#fbe3a2', { edge: 'cut', fibre: false, shadow: false }),
    // Inside: a little oven glowing, and a shelf of jars.
    piece(rect(200, 470, 120, 110, 10), C.charcoal),
    piece(rect(220, 500, 80, 50, 8), C.orange, { edge: 'cut' }),
    piece(rect(190, 380, 140, 10, 3), C.wood, { edge: 'cut' }),
    ...[210, 250, 290].map((x, i) => piece(rect(x, 346, 26, 34, 6), [C.raspberry, C.goldLight, C.appleGreen][i], { edge: 'cut' })),
    // The door itself, swung open against the trunk.
    piece(curve([[384, 640], [384, 320], [420, 290], [450, 320], [450, 640]], 2), C.yellow),
    dot(436, 470, 6, C.brown),
    ...flowers,
    // The branch along the bottom, and her toadstool table.
    piece(curve([[-30, 640], [400, 624], [800, 632], [1220, 612], [1220, 730], [800, 714], [400, 722], [-30, 740]], 2), C.barkLight, { rough: 1.3 }),
    piece(rect(-20, 720, 1220, 120), C.greenDeep, { rough: 2 }),
    piece(curve([[580, 640], [586, 520], [654, 520], [660, 640]], 1), C.cream, { rough: 0.6 }),
    piece(curve([[480, 540], [500, 470], [620, 440], [740, 470], [760, 540], [620, 530]], 2), C.toadCap, { rough: 0.7 }),
    ...[[540, 490], [610, 470], [690, 486], [650, 512]].map(([x, y]) => dot(x, y, 9, C.white)),
  ]);
}

/** A long china tray (400 × 80). */
function plate(): string {
  return svg({ w: 400, h: 80, name: 'l1c7-plate', boil: false }, [
    piece(ellipse(200, 44, 194, 28), C.china, { rough: 0.6 }),
    ink([...ellipse(200, 42, 160, 18)], { width: 3, color: C.chinaBlue, closed: true, opacity: 0.6 }),
  ]);
}

/** A number on a round paper tag (100 × 100). The name keeps this story's own torn edges. */
const tag = (n: number, color: string = C.cream): string => roundTag(n, color, `l1c7-tag${n}${color}`);

// ---------------------------------------------------------------- helpers

/** Where the eight biscuits sit: six in a row on the tray, then two more beside it. */
const SPOTS: Array<[number, number]> = [
  [470, 424], [528, 424], [586, 424], [644, 424], [702, 424], [760, 424],
  [836, 424], [892, 424],
];

/** Silky's wings flutter, softly, until the story ends. */
function flutter(k: Kit, silky: HTMLElement): void {
  if (k.calm) return;
  for (const [part, dir] of [['wingL', -1], ['wingR', 1]] as const) {
    const w = k.part(silky, part);
    if (w.length) void k.to(w, 0.25, { rotation: dir * 8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    hello: { who: 'silky', text: 'Hello, {name}! I’ve baked pop biscuits. They go POP in your mouth!' },
    oven: { who: 'silky', text: 'Six on the plate… and two more, fresh from the oven!' },
    eight: { who: 'hero', text: 'Six and two make eight! Eight pop biscuits!' },
    bite: { who: 'narrator', text: '{name} took a bite… POP! Honey and sherbet fizzed everywhere!' },
    look: { who: 'silky', text: 'Now look up, right to the very top. That’s Moon-Face’s room!' },
    climb: { who: 'hero', text: 'Come on! Let’s climb all the way up!' },
  },

  async play(k) {
    k.backdrop(doorBackdrop());
    k.light(260, 450, 220, { color: C.candle, strength: 0.45, flicker: true });
    k.light(900, 420, 200, { color: C.goldLight, strength: 0.3 });
    k.ambient('dust', { count: 16 });
    k.music('cosy');

    const silky = k.character('silky', { x: 60, y: 380, w: 270, z: 20 });
    const hero = k.character('hero', { x: 950, y: 400, w: 220, z: 20, flip: true });
    k.add(plate(), { x: 415, y: 420, w: 400, z: 14 });
    const biscuits = SPOTS.map(([x, y], i) => {
      const b = k.prop('popBiscuit', { x: x - 28, y: y - 4, w: 56, z: 15 });
      if (i >= 6) k.set(b, { opacity: 0 });
      return b;
    });
    flutter(k, silky);
    k.float(silky, 8, 2.4);
    await k.enter(hero, 'right');
    await k.say('hello', silky);

    // ---- Six on the plate… and two more float out of the oven.
    const tags: HTMLElement[] = [];
    const showTag = (i: number, gold: boolean) => {
      const [x, y] = SPOTS[i];
      const t = k.add(tag(i + 1, gold ? C.goldLight : C.cream), { x: x - 22, y: y - 52, w: 44, z: 22 });
      tags.push(t);
      void k.appear(t, 0.2);
    };
    const bake = async () => {
      for (let i = 0; i < 6; i++) {
        clink(i);
        void k.pop(biscuits[i], 1.15);
        showTag(i, false);
        await k.wait(230);
      }
      await k.wait(300);
      const armR = k.part(silky, 'armR');
      void k.to(armR, 0.25, { rotation: -20, yoyo: true, repeat: 1 });
      for (const i of [6, 7]) {
        wand();
        const b = biscuits[i];
        k.set(b, { opacity: 1, x: 260 - SPOTS[i][0], y: 520 - SPOTS[i][1], scale: 0.4 });
        await k.to(b, 0.6, { x: 0, y: 0, scale: 1, ease: 'sine.inOut' });
        clink(i);
        k.sparkle(SPOTS[i][0], SPOTS[i][1] + 20, 6, 60);
        showTag(i, true);
      }
    };
    await k.all(k.say('oven', silky), bake());

    // ---- Six and two make eight.
    const card = k.add(sumStrip('6 + 2 = 8', 'l1c7-sum'), { x: 470, y: 170, w: 300, z: 26 });
    k.set(card, { opacity: 0 });
    const sum = async () => {
      await k.wait(900);
      k.set(card, { opacity: 1 });
      k.sfx.sparkle();
      await k.appear(card, 0.35);
    };
    await k.all(k.say('eight', hero), sum(), k.hop(hero, 30, 1));

    // ---- A bite… POP! And a pop biscuit to keep.
    tags.forEach((t) => void k.fade(t, 0, 0.3));
    void k.fade(card, 0, 0.3);
    const gift = k.keepsake(k.chapter!.keepsake, { x: 520, y: 170, w: 150, z: 26 });
    k.set(gift, { opacity: 0 });
    const bite = async () => {
      const b = biscuits[7];
      await k.to(b, 0.5, { x: 1000 - 28 - SPOTS[7][0] + 28, y: 520 - SPOTS[7][1], ease: 'sine.inOut' });
      popBite();
      k.remove(b);
      k.puff(1000, 540, 160, C.goldLight);
      k.sparkle(1000, 520, 18, 180);
      void k.glow(C.goldLight, 0.25, 0.6);
      await k.all(k.shake(hero, 8, 2), k.to(hero, 0.2, { scale: 1.06, yoyo: true, repeat: 1 }));
      giggle();
      void k.to(k.part(silky, 'armR'), 0.25, { rotation: -20, yoyo: true, repeat: 1 });
      wand();
      k.set(gift, { opacity: 1, x: -300, y: 200, scale: 0.4 });
      await k.to(gift, 0.7, { x: 0, y: 0, scale: 1, ease: 'back.out(1.4)' });
      k.sparkle(595, 245, 14, 120);
      k.float(gift, 5, 2);
    };
    await k.all(k.say('bite'), bite());
    k.music('magic');
    await k.say('look', silky);

    // ---- Cut to the whole tree: up and up to Moon-Face's room.
    await k.cut(() => {
      k.backdrop(tree('l1c7-tree'));
      k.light(596, 214, 150, { color: '#fff3c0', strength: 0.55, flicker: true });
      k.ambient('stars', { count: 20, area: [0, 0, 1180, 300] });
    });
    upward();
    const climb = async () => {
      await k.camera({ zoom: 1.2, x: 600, y: 560 }, 0.8);
      await k.camera({ zoom: 1.9, x: 596, y: 240 }, 2.4);
      k.sparkle(596, 214, 16, 140);
      k.fx.twinkle();
    };
    await k.all(k.say('climb', hero), climb());
    await k.wait(700);
  },
});
