/**
 * Land 1, chapter 4: Dame Washalot's Washing.
 *
 * Dame Washalot's branch: her big tub full of suds, a washing line strung
 * out along the branch, and her washing water spilling off the end in a
 * waterfall all the way down the tree. She flings her washing up onto the
 * line: two red socks… and three spotty vests. Two and three make five,
 * and a little paper sum card says so. Then a gust snatches a vest (the
 * gentle tension); the hero leaps and catches it before it goes over the
 * edge. She gives him a peg to keep (the keepsake). From the branch above
 * comes an enormous SNORE. Next: Mr Watzisname Snores.
 */
import { C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** Sloshing water in the tub. */
function slosh(): void {
  const t = now();
  noiseBurst(t, { freq: 700, q: 1.2, peak: 0.1, attack: 0.05, decay: 0.3, sweepTo: 400 });
  noiseBurst(t + 0.25, { freq: 900, q: 1.2, peak: 0.07, attack: 0.05, decay: 0.25, sweepTo: 500 });
}

/** A wet thing flapping up through the air: flup! */
function flup(): void {
  const t = now();
  noiseBurst(t, { freq: 1200, q: 1.5, peak: 0.09, decay: 0.12, sweepTo: 2400 });
}

/** A clothes peg snapping shut: a little wooden click, pitched by count. */
function peg(n: number): void {
  const t = now();
  const f = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5][n % 5];
  noiseBurst(t, { freq: 3000, q: 6, peak: 0.08, decay: 0.03 });
  tone(f, t + 0.02, { wave: 'triangle', peak: 0.07, decay: 0.3 });
}

/** The waterfall's steady patter (a few soft bursts). */
function falls(): void {
  const t = now();
  for (let i = 0; i < 4; i++) noiseBurst(t + i * 0.4, { freq: 1800, q: 0.5, peak: 0.03, attack: 0.15, decay: 0.3 });
}

/** A whistling gust. */
function gust(): void {
  const t = now();
  noiseBurst(t, { freq: 600, q: 0.7, peak: 0.12, attack: 0.3, decay: 1, sweepTo: 1800 });
  tone(900, t + 0.1, { peak: 0.025, attack: 0.3, decay: 0.7, glideTo: 1400, vibrato: [6, 30] });
}

/** A distant enormous snore: a rumbling saw going in, a whistle going out. */
function snore(): void {
  const t = now();
  tone(70, t, { wave: 'sawtooth', peak: 0.12, attack: 0.3, decay: 0.6, glideTo: 95, vibrato: [22, 10], lowpass: 500 });
  noiseBurst(t, { freq: 300, q: 1, peak: 0.08, attack: 0.3, decay: 0.6 });
  tone(900, t + 1, { peak: 0.04, attack: 0.1, decay: 0.5, glideTo: 1400 });
}

// --------------------------------------------------------------------- art

/** Line y at a given x: the washing line sags between its two posts. */
const LINE: [Pt, Pt] = [[360, 210], [1060, 200]];
function lineY(x: number): number {
  const [[x0, y0], [x1, y1]] = LINE;
  const f = (x - x0) / (x1 - x0);
  return y0 + (y1 - y0) * f + Math.sin(f * Math.PI) * 50;
}

/** Dame Washalot's branch: leafy light, the trunk, the washing line and the branch running off to the right. */
function branchBackdrop(): string {
  const r = rng(404);
  const leaves: Node[] = [];
  for (let i = 0; i < 18; i++) leaves.push(piece(circle(r() * 1180, r() * 90 - 20, 50 + r() * 40), [C.leafDark, C.greenDark, C.leaf][i % 3], { rough: 1.4, shadow: i % 3 === 0 }));
  const sag: Pt[] = [];
  for (let x = LINE[0][0]; x <= LINE[1][0]; x += 35) sag.push([x, lineY(x)]);
  return svg({ w: 1180, h: 820, name: 'l1c4-branch', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#f0d9a2', { edge: 'clean', shadow: false }),
    piece(rect(-20, 300, 1220, 560), '#e6c98e', { rough: 2, shadow: false, fibre: false }),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(circle(80 + i * 180, 560 + (i % 2) * 30, 120), i % 2 ? '#9db58a' : '#b4c79a', { shadow: false, fibre: false })),
    ...leaves,
    // The trunk on the left.
    piece(curve([[-40, 900], [-20, 400], [-10, -40], [230, -40], [220, 400], [260, 900]], 2), C.bark, { rough: 1.2 }),
    ...[40, 110, 170].map((x) => ink([[x, 820], [x + 6, 400], [x - 4, 0]], { width: 4, color: C.barkDark, opacity: 0.4, wobble: 1.5 })),
    // The washing-line posts (two twigs) and the line.
    piece(rect(LINE[0][0] - 8, LINE[0][1] - 10, 16, 520, 4), C.barkLight),
    piece(rect(LINE[1][0] - 8, LINE[1][1] - 10, 16, 520, 4), C.barkLight),
    ink(sag, { width: 3, color: C.cream }),
    // The broad branch, ending at a stump on the right where the water spills.
    piece(curve([[100, 560], [500, 540], [900, 556], [1110, 560], [1130, 660], [900, 690], [500, 680], [100, 700]], 2), C.barkLight, { rough: 1.3 }),
    ink([[160, 610], [500, 596], [900, 610], [1080, 612]], { width: 3, color: C.bark, opacity: 0.5, wobble: 2 }),
    piece(rect(-20, 700, 1220, 140), C.greenDeep, { rough: 2 }),
  ]);
}

/** The waterfall off the end of the branch (140 × 900). */
function waterfall(): string {
  return svg({ w: 140, h: 900, name: 'l1c4-falls' }, [
    piece(curve([[20, 0], [110, 0], [120, 300], [130, 900], [10, 900], [24, 300]], 2), '#bcd9e6', { rough: 1.2, opacity: 0.9 }),
    ink([[56, 10], [60, 320], [52, 640], [62, 900]], { width: 6, color: '#e6f2f4', opacity: 0.85, wobble: 3 }),
    ink([[90, 30], [94, 300], [100, 700]], { width: 4, color: '#e6f2f4', opacity: 0.6, wobble: 3 }),
    ...[[30, 6, 16], [70, 2, 20], [110, 8, 14]].map(([x, y, rr]) => piece(circle(x, y, rr), '#e6f2f4', { rough: 1 })),
  ]);
}

/** A red sock (90 × 120), hanging from its top edge. */
function sock(): string {
  return svg({ w: 90, h: 120, name: 'l1c4-sock' }, [
    piece(curve([[22, 4], [58, 4], [60, 70], [84, 88], [80, 112], [44, 112], [24, 86]], 2), C.red),
    piece(rect(20, 2, 40, 18, 3), C.cream, { edge: 'cut' }),
    piece(ellipse(70, 104, 14, 9), C.redDark, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A spotty vest (120 × 130), hanging from its shoulders. */
function vest(): string {
  return svg({ w: 120, h: 130, name: 'l1c4-vest' }, [
    piece(curve([[20, 4], [44, 4], [60, 24], [76, 4], [100, 4], [102, 40], [108, 126], [12, 126], [18, 40]], 1), C.white),
    ...[[40, 60], [80, 56], [60, 90], [34, 104], [86, 102], [60, 50]].map(([x, y]) => dot(x, y, 6, C.blue)),
  ]);
}

/** A clothes peg (30 × 40). */
function pegArt(): string {
  return svg({ w: 30, h: 40, name: 'l1c4-peg', boil: false }, [piece(rect(8, 2, 14, 36, 4), C.wood, { edge: 'cut' }), ink([[15, 6], [15, 34]], { width: 2, color: C.brownDark })]);
}

/** A number on a round paper tag (100 × 100). */
function tag(n: number, color: string = C.cream): string {
  return svg({ w: 100, h: 100, name: `l1c4-tag${n}${color}`, boil: false }, [
    piece(circle(50, 50, 40), color, { rough: 0.8 }),
    raw(`<text x="50" y="68" text-anchor="middle" font-family="Andika, sans-serif" font-size="54" font-weight="700" fill="${C.ink}">${n}</text>`),
  ]);
}

/** The sum on a torn paper strip (320 × 110). */
function sumCard(text: string): string {
  return svg({ w: 320, h: 110, name: 'l1c4-sum', boil: false }, [
    piece(rect(8, 8, 304, 94, 10), C.cream, { rough: 1.2 }),
    raw(`<text x="160" y="76" text-anchor="middle" font-family="Andika, sans-serif" font-size="64" font-weight="700" fill="${C.ink}">${text}</text>`),
  ]);
}

/** A soap bubble (60 × 60). */
function bubble(): string {
  return svg({ w: 60, h: 60, name: 'l1c4-bubble', boil: false }, [
    ink([...circle(30, 30, 24)], { width: 3, color: C.white, closed: true, opacity: 0.85 }),
    dot(22, 22, 5, C.white, 0.9),
  ]);
}

/** The underneath of Mr Watzisname's hammock, a slippered foot dangling (360 × 200). */
function hammock(): string {
  return svg({ w: 360, h: 200, name: 'l1c4-hammock' }, [
    ink([[0, 20], [60, 70]], { width: 4, color: C.cream }),
    ink([[360, 20], [300, 70]], { width: 4, color: C.cream }),
    piece(curve([[40, 50], [180, 130], [320, 50], [300, 90], [180, 170], [60, 90]], 2), C.purple),
    ...[100, 150, 200, 250].map((x) => ink([[x, 80 + Math.sin(((x - 40) / 280) * Math.PI) * 50], [x, 100 + Math.sin(((x - 40) / 280) * Math.PI) * 60]], { width: 2, color: C.plum, opacity: 0.7 })),
    piece(band2(), C.skinShade),
    piece(ellipse(262, 190, 30, 13), C.blue),
  ]);
}

/** The ankle dangling over the hammock's edge. */
const band2 = (): Pt[] => curve([[244, 110], [266, 106], [272, 180], [252, 184]], 1);

// ---------------------------------------------------------------- helpers

/** Where each piece of washing hangs on the line (its centre x). */
const SPOTS = [440, 550, 690, 830, 970];

/**
 * Flings a piece of washing from the tub up onto the line, and pegs it.
 * The washing is placed at its spot; it starts down in the tub.
 */
async function fling(k: Kit, el: HTMLElement, i: number, from: Pt): Promise<void> {
  const left = parseFloat(el.style.left);
  const top = parseFloat(el.style.top);
  k.set(el, { opacity: 1, x: from[0] - left, y: from[1] - top, scale: 0.4, rotation: -90 });
  flup();
  await k.to(el, 0.55, { x: 0, y: 0, scale: 1, rotation: 0, ease: 'back.out(1.3)' });
  const p = k.add(pegArt(), { x: SPOTS[i] - 12, y: top - 22, w: 24, z: 16 });
  void k.appear(p, 0.15);
  peg(i);
  void k.to(el, 0.3, { rotation: i % 2 ? 4 : -4, yoyo: true, repeat: 1 });
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    hello: { who: 'washalot', text: 'Mind the water, dears! It’s washing day, and I’m in such a muddle!' },
    washing: { who: 'washalot', text: 'Two red socks on the line… and three spotty vests!' },
    five: { who: 'hero', text: 'Two and three make five! Five things on the line!' },
    peg: { who: 'washalot', text: 'You caught it! Clever {name}. Here, have a peg to keep.' },
    snore: { who: 'narrator', text: 'Then, from the branch above, came a noise like thunder… SNOOORE!' },
  },

  async play(k) {
    k.backdrop(branchBackdrop());
    const falls1 = k.add(waterfall(), { x: 1060, y: 590, w: 120, h: 780, z: 4 });
    k.float(falls1, 3, 0.5);
    k.light(700, 40, 340, { color: '#fff1c4', strength: 0.3, flicker: true });
    k.ambient('bubbles', { count: 10, area: [80, 200, 360, 400] });
    k.music('cosy');
    const bed = k.add(hammock(), { x: 520, y: -230, w: 360, z: 3 });

    const dame = k.character('washalot', { x: 90, y: 360, w: 290, z: 20 });
    const hero = k.character('hero', { x: 820, y: 400, w: 240, z: 18, flip: true });
    const tub: Pt = [235, 640];
    await k.all(k.enter(dame, 'left'), k.wait(300).then(() => k.enter(hero, 'right')));

    // ---- Washing day: sloshing and suds.
    slosh();
    falls();
    const scrub = async () => {
      const suds = k.part(dame, 'suds');
      const tubPart = k.part(dame, 'tub');
      for (let i = 0; i < 3; i++) {
        await k.all(k.to(tubPart, 0.25, { rotation: 2 }), k.to(suds, 0.25, { y: -12 }));
        await k.all(k.to(tubPart, 0.25, { rotation: -2 }), k.to(suds, 0.25, { y: 0 }));
        const b = k.add(bubble(), { x: 140 + i * 60, y: 560, w: 40 + i * 10, z: 25 });
        void k.to(b, 2, { y: -300, x: (i - 1) * 40, opacity: 0, ease: 'sine.out' }).then(() => k.remove(b));
      }
      await k.to(tubPart, 0.2, { rotation: 0 });
    };
    await k.all(k.say('hello', dame), scrub(), k.blink(hero));

    // ---- Two red socks… and three spotty vests.
    const items = SPOTS.map((x, i) => {
      const w = i < 2 ? 100 : 128;
      const el = k.add(i < 2 ? sock() : vest(), { x: x - w / 2, y: lineY(x) - 6, w, z: 15 });
      k.set(el, { opacity: 0, transformOrigin: '50% 0%' });
      return el;
    });
    const armR = k.part(dame, 'armR');
    const hang = async () => {
      await k.wait(300);
      for (const i of [0, 1]) {
        void k.to(armR, 0.2, { rotation: -40, yoyo: true, repeat: 1 });
        await fling(k, items[i], i, tub);
        await k.wait(250);
      }
      await k.wait(500);
      for (const i of [2, 3, 4]) {
        void k.to(armR, 0.2, { rotation: -40, yoyo: true, repeat: 1 });
        slosh();
        await fling(k, items[i], i, tub);
        await k.wait(150);
      }
    };
    await k.all(k.say('washing', dame), hang());

    // ---- Two and three make five.
    const tags: HTMLElement[] = [];
    const count = async () => {
      for (const [i, x] of SPOTS.entries()) {
        const t = k.add(tag(i + 1), { x: x - 26, y: lineY(x) + (i < 2 ? 140 : 150), w: 56, z: 17 });
        tags.push(t);
        peg(i);
        void k.appear(t, 0.25);
        void k.pop(items[i], 1.08);
        await k.wait(330);
      }
      const card = k.add(sumCard('2 + 3 = 5'), { x: 470, y: 440, w: 300, z: 26 });
      k.sfx.sparkle();
      await k.appear(card, 0.35);
      tags.push(card);
    };
    await k.all(k.say('five', hero), count(), k.hop(hero, 30, 1));

    // ---- A gust snatches a vest! He leaps and catches it at the edge.
    k.music('adventure');
    gust();
    const vestEl = items[4];
    const flap = async () => {
      await k.all(...items.map((el) => k.to(el, 0.3, { rotation: 14, ease: 'sine.inOut' })));
      tags.forEach((t) => void k.fade(t, 0, 0.3));
      await k.to(vestEl, 0.5, { x: 120, y: 160, rotation: 60, ease: 'power1.out' });
      await k.to(vestEl, 0.4, { x: 150, y: 230, rotation: 20, ease: 'sine.inOut' });
    };
    const leap = async () => {
      await k.wait(500);
      await k.to(hero, 0.12, { scaleY: 0.9, transformOrigin: '50% 100%' });
      k.fx.boing();
      await k.to(hero, 0.35, { x: 70, y: -130, scaleY: 1, rotation: 8, ease: 'power2.out' });
    };
    await k.all(flap(), leap(), k.camera({ zoom: 1.2, x: 900, y: 380 }, 0.7));
    // Caught! Down they come together.
    peg(4);
    await k.all(k.to(hero, 0.35, { x: 0, y: 0, rotation: 0, ease: 'power2.in' }), k.to(vestEl, 0.35, { x: 30, y: 300, rotation: 0, ease: 'power2.in' }));
    k.fx.thud();
    void k.all(...items.slice(0, 4).map((el) => k.to(el, 0.4, { rotation: 0 })));
    // …and back up on the line it goes.
    flup();
    void k.to(vestEl, 0.6, { x: 0, y: 0, rotation: 0, ease: 'back.out(1.3)' }).then(() => peg(4));
    k.music('cosy');
    void k.camera({}, 0.9);
    await k.wait(300);

    // ---- A peg to keep.
    const gift = k.keepsake(k.chapter!.keepsake, { x: 480, y: 360, w: 190, z: 24 });
    k.set(gift, { opacity: 0 });
    const give = async () => {
      await k.wait(1200);
      void k.to(armR, 0.25, { rotation: -50, yoyo: true, repeat: 1 });
      k.set(gift, { opacity: 1, x: -280, y: 260, scale: 0.4, rotation: -40 });
      k.fx.whizz();
      await k.to(gift, 0.7, { x: 0, y: 0, scale: 1, rotation: 0, ease: 'back.out(1.4)' });
      k.sfx.sparkle();
      k.sparkle(575, 450, 14, 120);
      k.float(gift, 5, 2);
    };
    await k.all(k.say('peg', dame), give());

    // ---- From above: an enormous snore. Everyone looks up.
    snore();
    const lookUp = async () => {
      await k.wait(800);
      void k.shake(dame, 3, 2);
      void k.to(items, 0.3, { rotation: 6, yoyo: true, repeat: 3 });
      void k.to(bed, 0.6, { y: 190, ease: 'back.out(1.4)' });
      await k.quake(5);
      await k.camera({ zoom: 1.3, x: 680, y: 120 }, 1.4);
      snore();
      await k.to(bed, 0.3, { y: 180, rotation: 3, yoyo: true, repeat: 3 });
    };
    k.music('sneaky');
    await k.all(k.say('snore'), lookUp());
    await k.wait(1200);
  },
});
