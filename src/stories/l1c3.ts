/**
 * Land 1, chapter 3: The Angry Pixie's Window.
 *
 * A little round window in the trunk, shutters closed, three plant pots on
 * the sill. He tiptoes up for a peep… BANG! The shutters fly open and the
 * Angry Pixie shouts "STOP PEEPING!" (the gentle jump-scare: a jolt of the
 * camera, the hero leaps back, the pixie's cross lines puff). Then: oh,
 * it's you. He counts his three pots and wants one more: three and one
 * more makes four, and the hero lifts the fourth pot up onto the sill. The
 * pixie grumbles a thank-you and throws down his spare cap (the keepsake).
 * Then drip… drip… SPLASH: water pours down the trunk from above. The
 * pixie slams his shutters. Next: Dame Washalot's Washing.
 */
import { gsap } from 'gsap';
import { C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, raw, rect, rng, svg, tone, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** Tiptoe steps: tiny soft taps. */
function tiptoe(steps = 4): void {
  const t = now();
  for (let i = 0; i < steps; i++) tone(i % 2 ? 900 : 760, t + i * 0.28, { wave: 'triangle', peak: 0.035, decay: 0.05 });
}

/** The shutters banging open: a wooden crack and a rattle. */
function bang(): void {
  const t = now();
  noiseBurst(t, { freq: 900, q: 0.8, peak: 0.25, decay: 0.18, sweepTo: 300 });
  tone(140, t, { peak: 0.22, decay: 0.25, glideTo: 70 });
  for (let i = 1; i < 4; i++) noiseBurst(t + i * 0.07, { freq: 1500, q: 3, peak: 0.06, decay: 0.05 });
}

/** A pot landing on the sill: a hollow clay clonk. */
function clonk(): void {
  const t = now();
  tone(320, t, { wave: 'triangle', peak: 0.14, decay: 0.16, glideTo: 240 });
  noiseBurst(t, { freq: 700, q: 2, peak: 0.05, decay: 0.06 });
}

/** A counting pip, higher for each pot; the "one more" pip is a little chord. */
function pip(n: number, more = false): void {
  const t = now();
  const f = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6][Math.min(n, 3)];
  tone(f, t, { wave: 'triangle', peak: 0.07, decay: 0.25 });
  if (more) [NOTE.E6, NOTE.G6].forEach((g, i) => tone(g, t + 0.08 + i * 0.08, { peak: 0.05, decay: 0.6 }));
}

/** A grumpy "hmph": a short low buzz. */
function hmph(): void {
  const t = now();
  tone(170, t, { wave: 'sawtooth', peak: 0.06, attack: 0.02, decay: 0.18, glideTo: 120, lowpass: 600 });
}

/** Water dripping, then a splash. */
function drip(): void {
  const t = now();
  tone(1200, t, { peak: 0.06, decay: 0.08, glideTo: 1800 });
  tone(1100, t + 0.5, { peak: 0.06, decay: 0.08, glideTo: 1700 });
}

// --------------------------------------------------------------------- art

const WIN = { cx: 760, cy: 300, r: 150 };

/** The trunk close up, with the round window (its dark inside) and the sill. */
function trunkBackdrop(): string {
  const r = rng(303);
  const grooves: Node[] = [];
  for (let i = 0; i < 14; i++) {
    const x = 20 + i * 86 + r() * 20;
    grooves.push(ink([[x, 840], [x + (r() - 0.5) * 30, 400], [x + (r() - 0.5) * 30, -20]], { width: 4, color: C.barkDark, opacity: 0.35, wobble: 2 }));
  }
  return svg({ w: 1180, h: 820, name: 'l1c3-trunk', boil: false }, [
    piece(rect(-20, -20, 1220, 860), C.bark, { edge: 'clean', shadow: false }),
    // A slice of leafy sky on the far left, round the side of the trunk.
    piece(curve([[-20, -20], [120, -20], [90, 300], [130, 560], [80, 860], [-20, 860]], 2), '#a9c48c', { rough: 1.4, shadow: false }),
    piece(circle(20, 120, 90), C.leafDark, { rough: 1.4 }),
    piece(circle(40, 520, 80), C.greenDark, { rough: 1.4 }),
    piece(curve([[100, -90], [140, 300], [110, 560], [150, 910], [1320, 910], [1320, -90]], 2), C.bark, { rough: 1.2 }),
    ...grooves,
    // A knot or two, and some moss.
    piece(ellipse(330, 180, 30, 44), C.barkDark, { rough: 0.8 }),
    piece(ellipse(1060, 600, 26, 36), C.barkDark, { rough: 0.8 }),
    piece(curve([[140, 700], [260, 660], [380, 690], [420, 760], [140, 780]], 2), C.moss, { rough: 1.4 }),
    // The window's dark inside: a cosy little room with a candle glow.
    piece(circle(WIN.cx, WIN.cy, WIN.r), '#3a2a22', { edge: 'cut' }),
    piece(circle(WIN.cx + 40, WIN.cy - 30, 70), '#5a4030', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    // The sill.
    piece(rect(WIN.cx - 220, WIN.cy + WIN.r - 6, 440, 34, 8), C.wood),
    piece(rect(WIN.cx - 200, WIN.cy + WIN.r + 26, 400, 14, 6), C.brownDark, { edge: 'cut' }),
    // A little brass bell by the window (nobody rings it).
    ink([[WIN.cx + 200, WIN.cy - 140], [WIN.cx + 200, WIN.cy - 100]], { width: 3, color: C.ink }),
    piece(curve([[WIN.cx + 186, WIN.cy - 72], [WIN.cx + 188, WIN.cy - 100], [WIN.cx + 212, WIN.cy - 100], [WIN.cx + 214, WIN.cy - 72]], 2), C.gold),
  ]);
}

/** The window's frame (a thick wooden ring, 360 × 360), drawn over the pixie. */
function frame(): string {
  const ring = circle(180, 180, WIN.r + 8);
  return svg({ w: 360, h: 360, name: 'l1c3-frame', boil: false }, [
    ink([...ring], { width: 30, color: C.wood, closed: true, wobble: 1 }),
    ink([...circle(180, 180, WIN.r + 22)], { width: 4, color: C.brownDark, closed: true, opacity: 0.6 }),
  ]);
}

/** One shutter (150 × 300), a half-disc of green planks. */
function shutter(left: boolean): string {
  const r = WIN.r;
  const pts = left
    ? curve([[150, 0], [60, 20], [4, 150], [60, 280], [150, 300]], 2)
    : curve([[0, 0], [90, 20], [146, 150], [90, 280], [0, 300]], 2);
  return svg({ w: 150, h: 300, name: `l1c3-shutter${left ? 'L' : 'R'}`, boil: false }, [
    piece(pts, C.greenDark, { rough: 0.8 }),
    ...[0.3, 0.6].map((f) => ink([[left ? 150 - r * f : r * f, 14], [left ? 150 - r * f : r * f, 286]], { width: 3, color: C.greenDeep, opacity: 0.7 })),
    dot(left ? 136 : 14, 150, 7, C.gold),
  ]);
}

/** A terracotta plant pot with a little red flower (120 × 150). */
function pot(i: number): string {
  const flower = [C.red, C.pink, C.yellow, C.purple][i % 4];
  return svg({ w: 120, h: 150, name: `l1c3-pot${i % 4}`, boil: false }, [
    piece(ellipse(60, 146, 44, 5), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    ink([[60, 84], [58, 50], [62, 30]], { width: 4, color: C.leafDark }),
    piece(ellipse(44, 62, 14, 7, -30), C.leaf, { edge: 'cut' }),
    piece(ellipse(76, 52, 14, 7, 30), C.leaf, { edge: 'cut' }),
    ...[0, 1, 2, 3, 4].map((p) => piece(circle(62 + Math.cos((p / 5) * Math.PI * 2) * 12, 26 + Math.sin((p / 5) * Math.PI * 2) * 12, 9), flower, { edge: 'cut' })),
    dot(62, 26, 7, C.goldLight),
    piece(poly([[26, 92], [94, 92], [84, 144], [36, 144]]), C.rust),
    piece(rect(20, 80, 80, 18, 4), '#c86a48'),
  ]);
}

/** A number on a round paper tag (100 × 100). */
function tag(n: number, color: string = C.cream): string {
  return svg({ w: 100, h: 100, name: `l1c3-tag${n}${color}`, boil: false }, [
    piece(circle(50, 50, 40), color, { rough: 0.8 }),
    raw(`<text x="50" y="68" text-anchor="middle" font-family="Andika, sans-serif" font-size="54" font-weight="700" fill="${C.ink}">${n}</text>`),
  ]);
}

/** A falling drop of water (40 × 60). */
function drop(): string {
  return svg({ w: 40, h: 60, name: 'l1c3-drop', boil: false }, [piece(curve([[20, 2], [34, 34], [28, 54], [12, 54], [6, 34]], 2), '#bcd9e6', { rough: 0.5 })]);
}

/** The washing water pouring down the trunk (160 × 820). */
function stream(): string {
  return svg({ w: 160, h: 820, name: 'l1c3-stream', boil: false }, [
    piece(curve([[50, -20], [110, -20], [120, 400], [140, 840], [20, 840], [40, 400]], 2), '#bcd9e6', { rough: 1.2, opacity: 0.9 }),
    ink([[72, 0], [76, 300], [70, 600], [80, 820]], { width: 6, color: '#e6f2f4', opacity: 0.8, wobble: 3 }),
    ...[120, 300, 520, 700].map((y) => dot(50 + (y % 60), y, 8, C.white, 0.8)),
  ]);
}

// ---------------------------------------------------------------- helpers

const POTS = [600, 690, 830];
const MORE = 920;
const POT_W = 96;
/** Pots stand on the sill: their bottoms at its top. */
const SILL_Y = WIN.cy + WIN.r - 2 - POT_W * 1.25;

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    peep: { who: 'narrator', text: 'Up the tree was a little round window. {name} just had to peep in…' },
    shout: { who: 'pixie', text: 'STOP PEEPING! Who’s that at my window?' },
    pots: { who: 'pixie', text: 'Oh, it’s you. Hmph. I’ve got three plant pots. But I want one more!' },
    four: { who: 'hero', text: 'Three… and one more makes four!' },
    cap: { who: 'pixie', text: 'Four! Hmm. Not bad. Here, have my spare cap.' },
    splash: { who: 'narrator', text: 'Then drip… drip… SPLASH! Water came pouring down the tree!' },
  },

  async play(k) {
    k.backdrop(trunkBackdrop());
    const pixie = k.character('pixie', { x: WIN.cx - 150, y: WIN.cy - 190, w: 300, z: 6 });
    // He lives inside the window: clip him to its round opening.
    pixie.style.clipPath = `circle(${WIN.r}px at 150px 190px)`;
    k.add(frame(), { x: WIN.cx - 180, y: WIN.cy - 180, w: 360, z: 8, still: true });
    const sL = k.add(shutter(true), { x: WIN.cx - 150, y: WIN.cy - 150, w: 150, z: 7 });
    const sR = k.add(shutter(false), { x: WIN.cx, y: WIN.cy - 150, w: 150, z: 7 });
    gsap.set(sL, { transformOrigin: '0% 50%' });
    gsap.set(sR, { transformOrigin: '100% 50%' });
    const pots = POTS.map((x, i) => k.add(pot(i), { x: x - POT_W / 2, y: SILL_Y, w: POT_W, z: 9 }));
    const lamp = k.light(WIN.cx, WIN.cy, 200, { color: C.candle, strength: 0, flicker: true, z: 5 });
    k.ambient('dust', { count: 12 });
    k.music('sneaky');

    // ---- He tiptoes up for a peep.
    const hero = k.character('hero', { x: 90, y: 380, w: 260, z: 20 });
    await k.enter(hero, 'left', 0.9);
    const sneak = async () => {
      tiptoe(4);
      await k.walk(hero, 120, 1.4, 4);
      await k.to(hero, 0.5, { rotation: 6, ease: 'sine.inOut' });
      await k.camera({ zoom: 1.2, x: 640, y: 380 }, 1.2);
    };
    await k.all(k.say('peep'), sneak());
    await k.wait(300);

    // ---- BANG! The shutters fly open.
    k.silence();
    bang();
    void k.quake(10);
    void k.camera({ zoom: 1.35, x: WIN.cx, y: WIN.cy + 20 }, 0.25);
    void k.fade(lamp, 0.5, 0.2);
    await k.all(k.to(sL, 0.18, { scaleX: 0.15, ease: 'power3.out' }), k.to(sR, 0.18, { scaleX: 0.15, ease: 'power3.out' }));
    void k.all(k.to(hero, 0.3, { x: '-=90', rotation: -8, ease: 'power2.out' }));
    const puff = k.part(pixie, 'puff');
    void (async () => {
      for (let i = 0; i < 4; i++) {
        await k.to(puff, 0.12, { scale: 1.3 });
        await k.to(puff, 0.12, { scale: 1 });
      }
    })();
    k.music('spooky');
    await k.all(k.say('shout', pixie), k.shake(pixie, 6, 2));

    // ---- Oh, it's you. Three pots… and he wants one more.
    k.music('cosy');
    void k.camera({}, 1);
    void k.to(hero, 0.4, { rotation: 0 });
    hmph();
    void k.blink(pixie);
    const tags: HTMLElement[] = [];
    const countPots = async () => {
      await k.wait(1600);
      for (const [i, p] of pots.entries()) {
        pip(i);
        void k.pop(p, 1.12);
        const t = k.add(tag(i + 1), { x: POTS[i] - 28, y: SILL_Y - 60, w: 56, z: 12 });
        tags.push(t);
        void k.appear(t, 0.25);
        await k.wait(450);
      }
    };
    await k.all(k.say('pots', pixie), countPots());

    // ---- The hero lifts the fourth pot up onto the sill.
    const extra = k.add(pot(3), { x: MORE - POT_W / 2, y: SILL_Y, w: POT_W, z: 22 });
    k.set(extra, { x: -560, y: 260, opacity: 0 });
    const lift = async () => {
      void k.walk(hero, 60, 0.6, 2);
      k.set(extra, { opacity: 1 });
      k.fx.whizz();
      await k.to(extra, 0.5, { x: -300, y: -60, rotation: -10, ease: 'power1.out' });
      await k.to(extra, 0.5, { x: 0, y: 0, rotation: 0, ease: 'power1.in' });
      clonk();
      await k.pop(extra, 1.12);
      pip(3, true);
      const t = k.add(tag(4, C.goldLight), { x: MORE - 32, y: SILL_Y - 66, w: 64, z: 12 });
      await k.appear(t, 0.3);
      k.sparkle(MORE, SILL_Y + 40, 10, 90);
      tags.push(t);
    };
    await k.all(k.say('four', hero), lift());

    // ---- A grumpy thank-you, and his spare cap.
    const cap = k.keepsake(k.chapter!.keepsake, { x: 420, y: 230, w: 140, z: 24 });
    k.set(cap, { opacity: 0 });
    const throwCap = async () => {
      await k.wait(1800);
      k.set(cap, { opacity: 1, x: 300, y: 40, rotation: -60, scale: 0.5 });
      k.fx.whizz();
      await k.to(cap, 0.7, { x: 0, y: 0, rotation: 0, scale: 1, ease: 'power2.out' });
      k.sfx.sparkle();
      k.sparkle(490, 300, 14, 120);
      k.float(cap, 5, 2);
    };
    hmph();
    await k.all(k.say('cap', pixie), throwCap(), k.to(puff, 0.4, { opacity: 0 }));
    await k.hop(hero, 40, 1);

    // ---- Drip… drip… SPLASH! Water from above, and the shutters slam.
    k.music('adventure');
    const water = k.add(stream(), { x: 960, y: -20, w: 160, h: 860, z: 15 });
    k.set(water, { y: -880 });
    const pour = async () => {
      for (const x of [990, 1030]) {
        drip();
        const d = k.add(drop(), { x, y: -60, w: 30, z: 16 });
        await k.to(d, 0.5, { y: 900, ease: 'power2.in' });
        k.remove(d);
      }
      k.fx.splash();
      void k.to(water, 0.6, { y: 0, ease: 'power2.in' });
      bang();
      tags.forEach((t) => void k.fade(t, 0, 0.3));
      await k.all(k.to(sL, 0.15, { scaleX: 1 }), k.to(sR, 0.15, { scaleX: 1 }), k.fade(lamp, 0, 0.2));
      k.fx.splash();
      await k.all(k.shake(hero, 6, 2), k.camera({ zoom: 1.25, x: 900, y: 200 }, 1.2));
    };
    await k.all(k.say('splash'), pour());
    k.fx.bubbles(6);
    await k.wait(900);
  },
});
