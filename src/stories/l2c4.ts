/**
 * Land 2, chapter 4: The Back-to-Front Bakery.
 *
 * A warm, floury bakery where the oven runs backwards: its dial spins the
 * wrong way and buns un-bake. The Saucepan Man mishears ("CAKE away?") with
 * a great clank. Eight buns sit on a tray; one, two, three of them shrink
 * back into pale dough balls and hop back into the oven. Eight take away
 * three is five (the card shows 8 − 3 = 5), and the shapes are named: round
 * buns (circles) on a rectangle tray, with the tray's outline traced. The
 * keepsake is a bun. Next: the Wobbly Windows.
 */
import { C, circle, curve, defineStory, ellipse, group, ink, type Kit, noiseBurst, now, piece, poly, raw, rect, svg, tone } from './kit';

// ------------------------------------------------------------------ sounds

/** The oven dial ticking round the wrong way: clicks that slow down. */
function backTicks(n = 8): void {
  const t = now();
  let s = 0;
  for (let i = 0; i < n; i++) {
    noiseBurst(t + s, { freq: 3000, q: 4, peak: 0.07, decay: 0.03 });
    tone(1200 - i * 60, t + s, { peak: 0.03, decay: 0.03 });
    s += 0.08 + i * 0.02;
  }
}

/** The Saucepan Man jumping: every pot and pan clanks. */
function clank(): void {
  const t = now();
  [0, 0.09, 0.2, 0.27].forEach((d, i) => {
    tone(420 + i * 170, t + d, { wave: 'square', peak: 0.04, attack: 0.002, decay: 0.22, lowpass: 2600 });
    tone((420 + i * 170) * 2.7, t + d, { peak: 0.03, attack: 0.002, decay: 0.3 });
    noiseBurst(t + d, { freq: 4000, type: 'highpass', peak: 0.04, decay: 0.08 });
  });
}

/** A bun un-baking: a squidgy reverse "sproing", pitch sinking. */
function unbake(i: number): void {
  const t = now();
  tone(700 - i * 80, t, { wave: 'triangle', peak: 0.1, attack: 0.12, decay: 0.08, glideTo: 220 - i * 20, vibrato: [14, 20] });
}

/** The oven door: a creak open and a warm thunk shut. */
function door(open: boolean): void {
  const t = now();
  if (open) tone(200, t, { wave: 'sawtooth', peak: 0.04, attack: 0.05, decay: 0.4, glideTo: 280, lowpass: 900 });
  else {
    tone(120, t, { peak: 0.18, decay: 0.18, glideTo: 70 });
    noiseBurst(t, { freq: 600, type: 'lowpass', peak: 0.1, decay: 0.1 });
  }
}

/** A counting tick, rising with each bun counted. */
function tick(i: number): void {
  tone(560 * Math.pow(2, i / 6), now(), { wave: 'triangle', peak: 0.08, attack: 0.004, decay: 0.14 });
}

// --------------------------------------------------------------------- art

/** The bakery: honey walls, shelves of loaves, a brick oven at the back, a flour-dusted counter. */
function bakery(): string {
  const loaf = (x: number, y: number, c: string) => [
    piece(curve([[x - 34, y], [x - 30, y - 26], [x, y - 34], [x + 30, y - 26], [x + 34, y]], 2), c),
    ...[-14, 0, 14].map((d) => ink([[x + d - 5, y - 26], [x + d + 5, y - 14]], { width: 3, color: C.bunDark })),
  ];
  const bricks = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) bricks.push(piece(rect(420 + c * 56 + (r % 2) * 28, 120 + r * 40, 52, 36, 3), r % 2 ? C.rust : C.redDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }));
  return svg({ w: 1180, h: 820, name: 'l2c4-bakery', boil: false }, [
    piece(rect(-20, -20, 1220, 860), C.honey, { edge: 'clean', shadow: false }),
    // Pink and cream bunting, hung upside down (the flags point up).
    ink([[0, 60], [300, 90], [600, 60], [900, 90], [1180, 60]], { width: 3, color: C.brown }),
    ...Array.from({ length: 12 }, (_, i) => {
      const x = 40 + i * 98;
      const y = 60 + Math.abs(Math.sin((x / 300) * Math.PI)) * 28;
      return piece(poly([[x - 20, y], [x + 20, y], [x, y - 34]]), i % 2 ? C.topsyPink : C.cream, { edge: 'cut' });
    }),
    // Shelves of loaves on both sides.
    ...[200, 340].flatMap((y) => [
      piece(rect(30, y, 320, 16, 3), C.wood),
      ...loaf(90, y, C.bun),
      ...loaf(190, y, C.caramel),
      ...loaf(290, y, C.bun),
      piece(rect(850, y, 310, 16, 3), C.wood),
      ...loaf(910, y, C.caramel),
      ...loaf(1010, y, C.bun),
      ...loaf(1110, y, C.caramel),
    ]),
    // The oven: a brick dome with a dark mouth.
    piece(curve([[400, 420], [400, 150], [590, 90], [780, 150], [780, 420]], 2), C.redDark, { rough: 1.2 }),
    ...bricks,
    piece(rect(470, 270, 240, 150, 30), C.charcoal, { rough: 1 }),
    piece(ellipse(590, 400, 100, 18), C.orange, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    // The counter.
    piece(rect(-20, 560, 1220, 280), C.bark, { rough: 1.2 }),
    piece(rect(-20, 540, 1220, 34, 6), C.wood, { rough: 1 }),
    // Flour dusted about.
    ...[[150, 600], [300, 640], [880, 620], [1040, 650], [700, 610]].map(([x, y]) => piece(ellipse(x, y, 40, 9), C.cream, { edge: 'torn', fibre: false, shadow: false, opacity: 0.6 })),
  ]);
}

/** The oven dial (a separate actor, so it can spin backwards). */
function dial(): string {
  return svg({ w: 100, h: 100, name: 'l2c4-dial', boil: false }, [
    piece(circle(50, 50, 42), C.steel),
    piece(circle(50, 50, 32), C.steelLight, { edge: 'cut', fibre: false }),
    piece(rect(44, 14, 12, 40, 4), C.redDark, { edge: 'cut', fibre: false }),
  ]);
}

/** The oven door, which drops open from the bottom. */
function ovenDoor(): string {
  return svg({ w: 240, h: 150, name: 'l2c4-door', boil: false }, [
    piece(rect(4, 4, 232, 142, 24), C.steelDark),
    piece(rect(40, 30, 160, 70, 14), C.orange, { edge: 'cut', fibre: false, opacity: 0.8 }),
    piece(rect(80, 112, 80, 14, 6), C.steel, { edge: 'cut' }),
  ]);
}

/** The baking tray: a silver rectangle (its outline is what we trace). */
function tray(): string {
  return svg({ w: 480, h: 200, name: 'l2c4-tray', boil: false }, [
    piece(rect(10, 30, 460, 150, 6), C.steelDark),
    piece(rect(22, 40, 436, 128, 4), C.steelLight, { edge: 'cut', fibre: false }),
  ]);
}

/** A rectangle outline, drawn over the tray to show its shape. */
function outline(w: number, h: number, color: string): string {
  return svg({ w, h, name: `l2c4-outline-${w}`, boil: false }, [raw(`<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="6" fill="none" stroke="${color}" stroke-width="9" stroke-dasharray="26 12"/>`)]);
}

/** A ball of pale dough (a bun that has un-baked). */
function dough(): string {
  return svg({ w: 120, h: 120, name: 'l2c4-dough', boil: false }, [
    piece(ellipse(60, 92, 40, 8), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[24, 90], [26, 60], [60, 46], [94, 60], [96, 90]], 2), C.cream),
    group({}, [piece(ellipse(46, 64, 8, 4), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 })]),
  ]);
}

/** A torn card with words or a number sentence on it. */
function card(text: string, color: string, size = 84, w = 420, h = 150): string {
  return svg({ w, h, name: `l2c4-card-${text}`, boil: false }, [
    piece(rect(8, 12, w - 16, h - 24, 30), color, { rough: 1.2 }),
    raw(`<text x="${w / 2}" y="${h / 2 + size * 0.34}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

/** Sets SVG parts to turn about the pivot their art gave them. */
function pivot(k: Kit, gs: SVGGElement[]): SVGGElement[] {
  for (const g of gs) {
    const [x, y] = g.style.transformOrigin.split(' ').map(parseFloat);
    if (!Number.isNaN(x)) k.set(g, { svgOrigin: `${x} ${y}` });
  }
  return gs;
}

// ------------------------------------------------------------------- story

const TRAY = { x: 350, y: 440, w: 480 };
const BUN = 92;
/** Eight buns on the tray, two rows of four. */
const BUNS = Array.from({ length: 8 }, (_, i) => ({ x: TRAY.x + 34 + (i % 4) * 104, y: TRAY.y + 2 + Math.floor(i / 4) * 64 }));
/** The three that un-bake. */
const UNBAKE = [1, 6, 3];
const DOOR = { x: 470, y: 270 };

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'In the back-to-front bakery, the oven ran backwards. Buns turned back into dough!' },
    eh: { who: 'saucepan', text: 'EH? Take away? Did you say CAKE away? Oh, look!' },
    three: { who: 'narrator', text: 'Eight buns. Three turned back into dough. Pop, pop, pop!' },
    five: { who: 'hero', text: 'Eight take away three is five. Five round buns on a rectangle tray!' },
    next: { who: 'saucepan', text: 'A bun for {name}! Now, mind the windows. They wobble!' },
  },

  async play(k) {
    k.backdrop(bakery());
    k.music('cosy');
    k.ambient('dust', { count: 18 });
    k.light(590, 380, 200, { color: C.orange, strength: 0.3, flicker: true, z: 3 });

    const knob = k.add(dial(), { x: 730, y: 300, w: 60, z: 5 });
    const ovenDoorEl = k.add(ovenDoor(), { ...DOOR, w: 240, z: 4 });
    k.add(tray(), { ...TRAY, z: 6 });
    const buns = BUNS.map((b, i) => k.prop('googleBun', { x: b.x, y: b.y, w: BUN, z: 7 + Math.floor(i / 4) }));
    const hero = k.character('hero', { x: 40, y: 380, w: 250, z: 12 });
    const sp = k.character('saucepan', { x: 880, y: 330, w: 280, z: 12 });
    const pots = pivot(k, k.part(sp, 'pots'));
    k.set([hero, sp], { opacity: 0 });

    // ---- The oven runs backwards.
    const open = async () => {
      k.fx.patter(4);
      await k.enter(hero, 'left', 0.6);
      backTicks(9);
      await k.to(knob, 1.6, { rotation: -540, ease: 'power2.out' });
    };
    await k.all(k.say('intro'), open());

    // ---- EH? CAKE away?
    clank();
    await k.enter(sp, 'right', 0.5);
    void k.shake(sp, 6, 2);
    void k.to(pots, 0.1, { rotation: 8, yoyo: true, repeat: 5 });
    await k.say('eh', sp);

    // ---- Three buns un-bake, one by one, and hop back into the oven.
    const doughs: HTMLElement[] = [];
    const unbaking = async () => {
      door(true);
      await k.to(ovenDoorEl, 0.3, { scaleY: 0.15, transformOrigin: '50% 100%' });
      for (const [n, i] of UNBAKE.entries()) {
        const b = buns[i];
        unbake(n);
        await k.to(b, 0.25, { scale: 0.6, rotation: -20 });
        const d = k.add(dough(), { x: BUNS[i].x + 10, y: BUNS[i].y + 14, w: 72, z: 9 });
        doughs.push(d);
        k.remove(b);
        k.puff(BUNS[i].x + BUN / 2, BUNS[i].y + 60, 90, C.cream);
        await k.wait(200);
        // Hop, hop, into the oven's mouth.
        const dx = 590 - (BUNS[i].x + 46);
        await k.to(d, 0.45, { x: dx / 2, y: -90, ease: 'power2.out' });
        await k.to(d, 0.35, { x: dx, y: 380 - BUNS[i].y - 50, scale: 0.6, ease: 'power2.in' });
        k.set(d, { zIndex: 3 });
        void k.fade(d, 0, 0.2);
        await k.wait(120);
      }
      door(false);
      await k.to(ovenDoorEl, 0.25, { scaleY: 1, ease: 'back.out(2)' });
    };
    await k.all(k.say('three'), unbaking());

    // ---- Eight take away three is five, and the shapes.
    const sum = k.add(card('8 − 3 = 5', C.lemonade), { x: 380, y: 120, w: 400, z: 20 });
    const box = k.add(outline(470, 160, C.topsyPink), { x: TRAY.x + 5, y: TRAY.y + 25, w: 470, z: 8 });
    const tagC = k.add(card('round', C.cream, 40, 220, 80), { x: 120, y: 320, w: 190, z: 21 });
    const tagR = k.add(card('rectangle', C.candyPink, 40, 260, 80), { x: 470, y: 616, w: 230, z: 21 });
    k.set([sum, box, tagC, tagR], { opacity: 0 });
    const left = buns.filter((_, i) => !UNBAKE.includes(i));
    const show = async () => {
      await k.appear(sum, 0.4);
      for (const [i, b] of left.entries()) {
        tick(i);
        await k.pop(b, 1.25);
      }
      k.sfx.success();
      await k.appear(tagC, 0.3);
      k.sfx.place(1);
      await k.fade(box, 1, 0.3);
      await k.appear(tagR, 0.3);
      void k.to(box, 0.4, { opacity: 0.4, yoyo: true, repeat: 3 });
    };
    void k.camera({ zoom: 1.12, x: 590, y: 420 }, 1.2);
    await k.all(k.say('five', hero), show(), k.hop(hero, 30, 1));
    void k.camera({}, 0.8);

    // ---- A bun for {name}. Mind the windows!
    void k.fade(sum, 0, 0.3);
    void k.fade(tagC, 0, 0.3);
    void k.fade(tagR, 0, 0.3);
    const keep = k.keepsake(k.chapter!.keepsake, { x: 250, y: 220, w: 160, z: 22 });
    k.set(keep, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(keep, 0.4);
    k.sparkle(330, 300, 12);
    k.float(keep, 8, 1.8);
    clank();
    await k.all(k.say('next', sp), k.to(pots, 0.1, { rotation: -8, yoyo: true, repeat: 3 }), k.hop(sp, 20, 1));
    await k.wait(500);
  },
});
