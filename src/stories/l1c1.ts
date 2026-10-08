/**
 * Land 1, chapter 1: Into the Enchanted Wood.
 *
 * The old trees whisper "wisha-wisha", and little curls of breath drift out
 * of their knot-mouths. Five toadstools pop up along the path, counted
 * aloud one by one, leading to the great Faraway Tree. Then something
 * rustles in the bushes… two eyes! It's only a rabbit, who hops out and
 * leaves a glowing magic toadstool (the keepsake) at the hero's feet. The
 * trees whisper again and the camera tilts up the great trunk. Next:
 * Wisha-Wisha.
 *
 * The chapter's host is Fran; if he climbs with Fran, Beth plays her part
 * (counting along on her fingers), so nobody appears twice.
 */
import { C, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, rect, svg, tone, type Kit } from './kit';
import { roundTag } from './bits';

// ------------------------------------------------------------------ sounds

/** The trees whispering: soft breathy swells, "wisha… wisha…". */
function wisha(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) noiseBurst(t + i * 0.55, { freq: 2200, q: 0.8, peak: 0.06, attack: 0.18, decay: 0.32, sweepTo: 1100 });
}

/** A toadstool popping up out of the moss: a little rising plip, higher each time. */
function plip(n: number): void {
  const f = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5][n % 5];
  const t = now();
  tone(f * 0.5, t, { wave: 'triangle', peak: 0.1, attack: 0.004, decay: 0.1, glideTo: f });
  tone(f, t + 0.05, { wave: 'sine', peak: 0.06, decay: 0.3 });
}

/** Leaves rustling in the bush. */
function rustle(): void {
  const t = now();
  for (let i = 0; i < 6; i++) noiseBurst(t + i * 0.07 + Math.random() * 0.03, { freq: 3200 + Math.random() * 1200, q: 2, peak: 0.05, decay: 0.06 });
}

/** A rabbit's soft hop: a padded thump. */
function thump(): void {
  const t = now();
  tone(150, t, { peak: 0.14, decay: 0.12, glideTo: 80 });
  noiseBurst(t, { freq: 400, q: 1, peak: 0.04, decay: 0.08 });
}

/** The magic toadstool glowing: a soft shimmer of bells going up. */
function shimmer(): void {
  const t = now();
  [NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6].forEach((f, i) => tone(f, t + i * 0.08, { peak: 0.05, attack: 0.01, decay: 0.8 }));
}

// --------------------------------------------------------------------- art

/** The great Faraway Tree at the end of the path (300 × 700), rising off the top. */
function greatTrunk(): string {
  return svg({ w: 300, h: 700, name: 'l1c1-trunk', boil: false }, [
    piece(curve([[-10, 700], [50, 640], [70, 400], [80, -40], [220, -40], [230, 400], [250, 640], [310, 700]], 2), C.bark, { rough: 1.2 }),
    ...[110, 150, 190].map((x, i) => ink([[x, 660], [x + (i - 1) * 4, 400], [x + (i - 1) * 8, 40]], { width: 4, color: C.barkDark, opacity: 0.45, wobble: 1.5 })),
    // The little door in the roots, and its lantern.
    piece(curve([[118, 650], [116, 590], [150, 566], [184, 590], [182, 650]], 2), C.wood),
    dot(172, 612, 5, C.gold),
    piece(rect(198, 560, 22, 30, 4), C.goldLight, { edge: 'cut' }),
    // A window high up, warmly lit.
    piece(circle(150, 300, 22), C.candle, { edge: 'cut' }),
    ink([[150, 280], [150, 320]], { width: 3, color: C.barkDark }),
    // Leaves high up, so it climbs into the canopy.
    piece(circle(60, 40, 70), C.greenDeep, { rough: 1.4 }),
    piece(circle(240, 20, 80), C.woodShade, { rough: 1.4 }),
    piece(circle(150, -10, 70), C.leafDark, { rough: 1.4, shadow: false }),
  ]);
}

/** A curl of whispered breath (160 × 60). */
function curl(): string {
  return svg({ w: 160, h: 60, name: 'l1c1-curl', boil: false }, [
    ink([[6, 34], [30, 14], [52, 30], [42, 44], [30, 34], [60, 20], [96, 36], [128, 18], [154, 26]], { width: 4, color: C.cream, opacity: 0.85, wobble: 1 }),
  ]);
}

/** A round bush with hidden eyes (260 × 200). Parts: eyes (hidden), leaves. */
function bush(): string {
  const leaf = [C.leafDark, C.greenDark, C.leaf];
  return svg({ w: 260, h: 200, name: 'l1c1-bush' }, [
    piece(ellipse(130, 192, 120, 10), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    group({ part: 'leaves', origin: [130, 190] }, [
      piece(circle(70, 130, 64), leaf[1], { rough: 1.4 }),
      piece(circle(190, 128, 66), leaf[1], { rough: 1.4 }),
      piece(circle(130, 92, 78), leaf[0], { rough: 1.4 }),
      piece(circle(96, 70, 30), leaf[2], { rough: 1.2, shadow: false }),
      piece(circle(176, 96, 24), leaf[2], { rough: 1.2, shadow: false }),
      group({ part: 'eyes', opacity: 0 }, [
        piece(ellipse(108, 120, 13, 15), '#f6f0c2', { edge: 'cut', fibre: false, shadow: false }),
        piece(ellipse(152, 120, 13, 15), '#f6f0c2', { edge: 'cut', fibre: false, shadow: false }),
        dot(111, 123, 7, C.ink),
        dot(155, 123, 7, C.ink),
      ]),
    ]),
  ]);
}

/** A little brown rabbit sitting up (200 × 200), facing right. */
function rabbit(): string {
  const fur = '#a27b58';
  const pale = '#e9d8bd';
  return svg({ w: 200, h: 200, name: 'l1c1-rabbit' }, [
    piece(ellipse(100, 192, 64, 8), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(48, 156, 18), C.white, { rough: 1.6 }),
    piece(ellipse(90, 148, 56, 44), fur),
    piece(ellipse(120, 172, 26, 12), fur),
    piece(ellipse(100, 150, 22, 28), pale, { edge: 'cut', fibre: false, shadow: false }),
    group({ part: 'ears', origin: [128, 70] }, [
      piece(ellipse(112, 40, 12, 38, -14), fur),
      piece(ellipse(112, 42, 5, 26, -14), C.pink, { edge: 'cut', fibre: false, shadow: false }),
      piece(ellipse(140, 42, 12, 38, 12), fur),
      piece(ellipse(140, 44, 5, 26, 12), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    ]),
    piece(ellipse(130, 96, 36, 32), fur),
    dot(142, 90, 6, C.ink),
    dot(144, 88, 2, C.white),
    piece(ellipse(164, 102, 6, 5), C.pink, { edge: 'cut', fibre: false }),
    ink([[160, 108], [184, 104]], { width: 1.5, color: C.ink, opacity: 0.6 }),
    ink([[160, 110], [182, 116]], { width: 1.5, color: C.ink, opacity: 0.6 }),
  ]);
}

/** A number on a round paper tag (100 × 100). The name keeps this story's own torn edges. */
const tag = (n: number, color: string = C.cream): string => roundTag(n, color, `l1c1-tag${n}`);

// ---------------------------------------------------------------- helpers

/** The child playing the host's part: Fran, or Beth if he climbs with Fran. */
const sibling = (k: Kit): string => (k.hero === 'fran' ? 'beth' : 'fran');

/** A whispered curl drifting out of a tree's mouth and fading away. */
async function breathe(k: Kit, x: number, y: number, flip: boolean): Promise<void> {
  const c = k.add(curl(), { x, y, w: 160, z: 6, flip });
  k.set(c, { opacity: 0 });
  await k.to(c, 0.3, { opacity: 1 });
  await k.to(c, 1.4, { x: flip ? -120 : 120, y: -30, opacity: 0, ease: 'sine.out' });
  k.remove(c);
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    hush: { who: 'narrator', text: 'The old trees of the Enchanted Wood began to whisper…' },
    wisha: { who: 'hero', text: 'Wisha-wisha-wisha! They’re showing us the way, {name}!' },
    count: { who: 'hero', text: 'Look, toadstools! One, two, three, four, five!' },
    eyes: { who: 'hero', text: 'Wait… something’s in that bush. Who’s there?' },
    rabbit: { who: 'narrator', text: 'Only a little rabbit! And it left a magic toadstool for {name}.' },
    next: { who: 'hero', text: 'Listen! The trees are whispering again. Let’s climb up and find them!' },
  },

  async play(k) {
    // ---- The wood, with the great tree at the end of the path.
    k.landScene(1);
    k.add(greatTrunk(), { x: 470, y: -40, w: 260, h: 607, z: 2, still: true });
    const veil = k.dim(0.12, '#2a3a20');
    k.light(590, 160, 260, { color: '#f6efb8', strength: 0.35, flicker: true });
    k.ambient('dust', { count: 18 });
    k.music('dreamy');

    const hero = k.character('hero', { x: 160, y: 390, w: 250, z: 20 });
    const sib = k.character(sibling(k), { x: 330, y: 420, w: 220, z: 18 });
    const scrub = k.add(bush(), { x: 920, y: 430, w: 240, z: 12 });
    const eyes = k.part(scrub, 'eyes');
    await k.all(k.enter(hero, 'left'), k.wait(200).then(() => k.enter(sib, 'left')));
    void k.blink(sib);

    // ---- The trees whisper: curls of breath drift from their mouths.
    wisha(3);
    void breathe(k, 150, 370, false);
    void breathe(k, 900, 340, true);
    await k.say('hush');
    wisha(2);
    void breathe(k, 170, 390, false);
    void breathe(k, 880, 360, true);
    void k.blink(hero);
    await k.say('wisha', hero);

    // ---- Five toadstools pop up along the path, counted one by one.
    const spots: Array<[number, number, number]> = [
      [780, 660, 104],
      [690, 610, 86],
      [760, 570, 70],
      [680, 536, 58],
      [630, 508, 46],
    ];
    const stools = spots.map(([x, y, w]) => k.prop('toadstool', { x, y: y - w * 0.6, w, z: 15 }));
    stools.forEach((t) => k.set(t, { opacity: 0 }));
    const counting = async () => {
      await k.wait(900);
      for (const [i, t] of stools.entries()) {
        plip(i);
        void k.appear(t, 0.3);
        const [x, y, w] = spots[i];
        const n = k.add(tag(i + 1), { x: x + w / 2 - 28, y: y - w * 0.6 - 62, w: 56, z: 25 });
        void k.appear(n, 0.25).then(() => k.wait(900)).then(() => k.fade(n, 0, 0.4));
        // The sibling counts along, a little nod per toadstool.
        void k.to(sib, 0.2, { rotation: i % 2 ? -3 : 3, ease: 'sine.inOut' }).then(() => k.to(sib, 0.2, { rotation: 0, ease: 'sine.inOut' }));
        await k.wait(430);
      }
    };
    await k.all(k.say('count', hero), counting());
    void k.hop(sib, 30, 1);

    // ---- Something rustles in the bush… two eyes!
    k.music('sneaky');
    void k.fade(veil, 0.3, 0.8);
    rustle();
    await k.shake(scrub, 6, 2);
    await k.camera({ zoom: 1.35, x: 960, y: 500 }, 0.9);
    eyes.forEach((e) => (e.style.opacity = '1'));
    k.fx.sneak();
    await k.wait(500);
    eyes.forEach((e) => (e.style.opacity = '0'));
    await k.wait(140);
    eyes.forEach((e) => (e.style.opacity = '1'));
    void k.camera({ zoom: 1.1, x: 600, y: 480 }, 0.8);
    void k.shake(hero, 5, 2);
    void k.to(sib, 0.4, { x: -30, ease: 'power2.out' });
    await k.say('eyes', hero);

    // ---- Out hops a rabbit, with a glowing toadstool.
    rustle();
    eyes.forEach((e) => (e.style.opacity = '0'));
    const bun = k.add(rabbit(), { x: 960, y: 480, w: 180, z: 14, flip: true });
    const gift = k.keepsake(k.chapter!.keepsake, { x: 520, y: 330, w: 150, z: 22 });
    k.set(gift, { opacity: 0 });
    k.music('magic');
    void k.fade(veil, 0.1, 0.8);
    void k.camera({}, 0.9);
    const hopIn = async () => {
      k.set(bun, { opacity: 1 });
      for (let i = 0; i < 3; i++) {
        thump();
        await k.all(k.to(bun, 0.32, { x: '-=110', ease: 'none' }), k.to(bun, 0.16, { y: -46, ease: 'power2.out' }).then(() => k.to(bun, 0.16, { y: 0, ease: 'power2.in' })));
      }
      const ears = k.part(bun, 'ears');
      if (ears.length) void k.to(ears, 0.2, { rotation: -10, yoyo: true, repeat: 1 });
      // The toadstool rises out of the moss by the rabbit and floats up, glowing.
      shimmer();
      k.set(gift, { x: 110, y: 200 });
      await k.appear(gift, 0.4);
      await k.to(gift, 0.9, { x: 0, y: 0, ease: 'sine.out' });
      k.light(595, 405, 150, { color: '#ffe7a8', strength: 0.7, flicker: true, z: 21 });
      k.sparkle(595, 400, 14, 120);
      k.float(gift, 6, 2);
      await k.wait(500);
      thump();
      await k.all(k.to(bun, 0.5, { x: 400, y: -30, ease: 'power1.in' }), k.wait(100).then(() => k.fade(bun, 0, 0.4)));
    };
    k.music('cosy');
    await k.all(k.say('rabbit'), hopIn(), k.to(sib, 0.4, { x: 0 }));
    await k.all(k.hop(hero, 40, 1), k.pop(gift, 1.15));

    // ---- The whisper again, and the camera tilts up the great trunk.
    wisha(3);
    void breathe(k, 150, 370, false);
    void breathe(k, 900, 340, true);
    const lookUp = async () => {
      await k.wait(1200);
      await k.camera({ zoom: 1.35, x: 600, y: 260 }, 2.2);
    };
    await k.all(k.say('next', hero), lookUp());
    k.sparkle(600, 240, 12, 140);
    k.fx.twinkle();
    await k.wait(1000);
  },
});
