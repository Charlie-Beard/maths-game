/**
 * Land 3, chapter 5: The Jelly Hill.
 *
 * A hill made of jelly: every hop goes wibble-wobble. Ten little jellies
 * sat round its foot, but now there are only seven, with three empty
 * dishes and green, sticky drips. Seven and three make ten, so three are
 * missing. Then a SLURP: a big, wobbly shadow slides along behind the hill
 * and away. Nobody sees what it is (the Jelly Goblin is only hinted at
 * until the land's finale). Next: Sugar Mice.
 *
 * The chapter's host is Joe. If he climbs with Joe, Beth comes instead
 * (the hero speaks the lines either way).
 */
import { band, C, circle, curve, defineStory, ellipse, ink, noiseBurst, now, piece, poly, raw, rect, rng, svg, tone, type Node, type Pt } from './kit';
import { buddy } from './bits';

// ------------------------------------------------------------------ sounds

/** A jelly wobble: a soft boing that wibbles. */
function wibble(pitch = 1): void {
  const t = now();
  tone(140 * pitch, t, { wave: 'sine', peak: 0.14, attack: 0.02, decay: 0.45, glideTo: 110 * pitch, vibrato: [9, 22] });
  tone(280 * pitch, t, { wave: 'triangle', peak: 0.04, attack: 0.02, decay: 0.3, vibrato: [9, 40], lowpass: 900 });
}

/** A long, greedy slurp from somewhere out of sight. */
function slurp(): void {
  const t = now();
  noiseBurst(t, { freq: 2600, q: 2.5, peak: 0.1, attack: 0.08, decay: 0.7, sweepTo: 350 });
  tone(500, t, { wave: 'sawtooth', peak: 0.04, attack: 0.05, decay: 0.7, glideTo: 120, vibrato: [18, 40], lowpass: 900 });
}

/** A sticky drip. */
function drip(): void {
  const t = now();
  tone(700, t, { peak: 0.07, attack: 0.003, decay: 0.12, glideTo: 1300 });
}

/** A low wobbly hum as the shadow passes. */
function lurk(): void {
  const t = now();
  tone(70, t, { wave: 'sine', peak: 0.16, attack: 0.4, decay: 1.6, vibrato: [4, 10] });
  tone(104, t + 0.2, { wave: 'triangle', peak: 0.05, attack: 0.4, decay: 1.4, vibrato: [4, 8], lowpass: 500 });
}

// --------------------------------------------------------------------- art

/** The sky, far toffee trees and the pink sugar ground (1180 × 820). */
function meadow(): string {
  const r = rng(53);
  const far: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 140 + r() * 40;
    far.push(piece(rect(x - 6, 420, 12, 120), C.toffee, { shadow: false }));
    far.push(piece(circle(x, 410, 46 + r() * 16), i % 2 ? '#bfe0cc' : '#f2c6cf', { shadow: false }));
  }
  const sprinkles: Node[] = [];
  const cols = [C.jellyRed, C.mint, C.yellow, C.blue, C.white];
  for (let i = 0; i < 46; i++) sprinkles.push(piece(rect(r() * 1180, 640 + r() * 180, 14, 5, 2), cols[i % 5], { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 1180, h: 820, name: 'l3c5-meadow', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#d9eee4', { edge: 'clean', shadow: false }),
    piece(rect(-20, 250, 1220, 300), '#f6e6e6', { rough: 2, shadow: false }),
    piece(ellipse(220, 110, 130, 34), C.white, { rough: 1.4, shadow: false, opacity: 0.9 }),
    piece(ellipse(960, 150, 110, 28), C.candyPink, { rough: 1.4, shadow: false, opacity: 0.8 }),
    ...far,
    piece(curve([[-40, 560], [300, 530], [600, 556], [900, 528], [1220, 552], [1220, 860], [-40, 860]], 2), '#f3d2d8', { rough: 1.2 }),
    ...sprinkles,
  ]);
}

/** The jelly hill, close up (760 × 470): three fluted red tiers, shiny, with cream and a cherry. */
function hill(): string {
  const tier = (y0: number, y1: number, w0: number, w1: number): Node =>
    piece(curve([[380 - w0 / 2, y0], [380 - w1 / 2 - 14, y1 + 18], [380 - w1 / 2 + 20, y1], [380 + w1 / 2 - 20, y1], [380 + w1 / 2 + 14, y1 + 18], [380 + w0 / 2, y0]], 2), C.jellyRed, { rough: 0.8 });
  const flutes = (y0: number, y1: number, w0: number, w1: number): Node[] =>
    [-0.32, -0.12, 0.08, 0.28].map((k) => piece(band([[380 + w0 * k, y0 - 4], [380 + w1 * k, y1 + 8]], 22), '#e5707f', { edge: 'cut', fibre: false, shadow: false }));
  const shine = (x: number, y: number, h: number) => piece(ellipse(x, y, 10, h, 8), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 });
  return svg({ w: 760, h: 470, name: 'l3c5-hill' }, [
    piece(ellipse(380, 462, 400, 14), 'rgba(120,30,40,0.2)', { edge: 'cut', fibre: false, shadow: false }),
    tier(460, 270, 760, 620),
    ...flutes(460, 270, 760, 620),
    tier(286, 130, 540, 420),
    ...flutes(286, 130, 540, 420),
    tier(146, 40, 360, 250),
    ...flutes(146, 40, 360, 250),
    shine(110, 380, 50),
    shine(220, 210, 36),
    shine(300, 90, 22),
    piece(curve([[300, 46], [320, 6], [380, -14], [440, 6], [460, 46]], 2), C.white),
    piece(circle(386, -26, 18), C.red, { edge: 'cut' }),
    ink([[386, -40], [400, -74]], { width: 3, color: C.greenDark }),
  ]);
}

/** A little china dish (80 × 30) for a jelly; `sticky` adds green drips (something's been here). */
function dish(sticky: boolean, seed: number): string {
  const drips: Node[] = sticky
    ? [
        piece(curve([[22, 8], [40, 4], [58, 10], [52, 16], [30, 16]], 2), C.jelly, { edge: 'cut', fibre: false }),
        piece(curve([[34, 14], [40, 14], [40, 28], [36, 30], [34, 24]], 1), C.jelly, { edge: 'cut', fibre: false }),
        piece(circle(62, 24, 4), C.jelly, { edge: 'cut', fibre: false }),
      ]
    : [];
  return svg({ w: 80, h: 30, name: `l3c5-dish${seed}` }, [piece(ellipse(40, 14, 38, 10), C.china), piece(ellipse(40, 12, 28, 6), C.white, { edge: 'cut', fibre: false, shadow: false }), ...drips]);
}

/**
 * The shadow of something big and wobbly (420 × 300): a dark, see-through
 * jelly-mould shape with pointed ears and a cherry stalk. Only ever seen
 * behind things.
 */
function shadow(): string {
  return svg({ w: 420, h: 300, name: 'l3c5-shadow', boil: false }, [
    piece(poly([[110, 120], [40, 60], [100, 170]]), '#1d3a2a', { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[310, 120], [380, 60], [320, 170]]), '#1d3a2a', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[70, 320], [100, 160], [140, 90], [210, 70], [280, 90], [320, 160], [350, 320]], 3), '#1d3a2a', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(210, 56, 18), '#1d3a2a', { edge: 'cut', fibre: false, shadow: false }),
    ink([[210, 40], [224, 10]], { width: 4, color: '#1d3a2a' }),
    // two glinting eyes
    piece(ellipse(180, 150, 9, 6), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(240, 150, 9, 6), C.gold, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/**
 * A part-whole diagram on torn paper (360 × 250): the whole (10) on top,
 * the parts (7 and ?) below. The ? is the `missing` part, the 3 the `found`
 * part (hidden): swap them when the answer is found.
 */
function partWhole(): string {
  const num = (x: number, y: number, s: string, extra = '') => `<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="64" fill="${C.ink}" text-anchor="middle"${extra}>${s}</text>`;
  return svg({ w: 360, h: 250, name: 'l3c5-pw' }, [
    piece(rect(6, 6, 348, 238, 12), C.cream, { rough: 1.2 }),
    ink([[180, 80], [96, 160]], { width: 5, color: C.brownDark }),
    ink([[180, 80], [264, 160]], { width: 5, color: C.brownDark }),
    piece(circle(180, 66, 50), C.white, { edge: 'cut' }),
    piece(circle(96, 180, 46), C.candyPink, { edge: 'cut' }),
    piece(circle(264, 180, 46), C.mint, { edge: 'cut' }),
    raw(num(180, 88, '10')),
    raw(num(96, 202, '7')),
    raw(`<g data-part="missing">${num(264, 202, '?')}</g><g data-part="found" opacity="0">${num(264, 202, '3')}</g>`),
  ]);
}

// ------------------------------------------------------------------ helpers

/** Where the ten dishes go (top-left corners), in a row at the foot of the hill. */
const DISH: Pt[] = Array.from({ length: 10 }, (_, i) => [256 + i * 68, 580] as Pt);
/** The three that are empty (and sticky). */
const GONE = [2, 5, 8];

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hill: { who: 'narrator', text: 'The Jelly Hill! Every step went wibble, wobble, wibble.' },
    count: { who: 'hero', text: 'Ten little jellies sat round the hill. But I only count seven!' },
    three: { who: 'narrator', text: 'Seven and three make ten. Three are missing. And look… green, sticky drips!' },
    slurp: { who: 'hero', text: 'Did you hear that? Something went SLURP.' },
    away: { who: 'narrator', text: 'Something big and wobbly slid away… towards the sugar mice.' },
  },

  async play(k) {
    k.backdrop(meadow());
    k.music('adventure');
    k.ambient('dust', { count: 12 });

    const sh = k.add(shadow(), { x: 610, y: 84, w: 420, h: 300, z: 3 });
    k.set(sh, { opacity: 0 });
    const jh = k.add(hill(), { x: 210, y: 150, w: 760, h: 470, z: 5 });
    const wob = (amount = 1) =>
      k.to(jh, 0.12, { scaleY: 1 - 0.04 * amount, scaleX: 1 + 0.03 * amount, transformOrigin: '50% 100%', ease: 'power1.out' })
        .then(() => k.to(jh, 0.12, { scaleY: 1 + 0.025 * amount, scaleX: 1 - 0.02 * amount, ease: 'power1.inOut' }))
        .then(() => k.to(jh, 0.14, { scaleY: 1, scaleX: 1, ease: 'power1.in' }));

    const dishes = DISH.map(([x, y], i) => k.add(dish(GONE.includes(i), i), { x, y: y + 44, w: 68, h: 26, z: 6 }));
    const jellies = DISH.map(([x, y], i) => (GONE.includes(i) ? null : k.prop('jelly', { x: x + 2, y: y - 8, w: 64, z: 7 })));
    void dishes;

    const hero = k.character('hero', { x: 10, y: 380, w: 250, z: 20 });
    const pal = k.character(buddy(k, k.chapter!.host, 'beth'), { x: 920, y: 384, w: 250, z: 20 });
    k.set([hero, pal], { opacity: 0 });

    // In they hop, and every hop wobbles the whole hill.
    await k.camera({ zoom: 1.2, x: 590, y: 360 }, 0.01);
    void k.camera({}, 2.4);
    const hops = (async () => {
      await k.all(k.enter(hero, 'left', 0.6), k.enter(pal, 'right', 0.6));
      for (let i = 0; i < 3; i++) {
        wibble(1 + i * 0.1);
        await k.all(k.hop(i % 2 ? pal : hero, 40), wob(1.2));
      }
    })();
    await k.all(k.say('hill'), hops);

    // Count the jellies: seven, and three empty dishes.
    void k.camera({ zoom: 1.4, x: 590, y: 600 }, 1.2);
    const counting = (async () => {
      await k.wait(1200);
      for (const j of jellies) {
        if (!j) continue;
        tone(520, now(), { wave: 'triangle', peak: 0.04, decay: 0.08 });
        await k.pop(j, 1.15);
      }
    })();
    await k.all(k.say('count', hero), counting);

    const pw = k.add(partWhole(), { x: 410, y: 20, w: 360, h: 250, z: 40 });
    k.set(pw, { opacity: 0 });
    void k.camera({}, 1.0);
    void k.appear(pw, 0.4);
    const sticky = (async () => {
      await k.wait(2200);
      k.set(k.part(pw, 'missing'), { opacity: 0 });
      k.set(k.part(pw, 'found'), { opacity: 1 });
      void k.pop(pw, 1.08);
      k.sfx.sparkle();
      await k.wait(800);
      for (const i of GONE) {
        drip();
        void k.pop(dishes[i], 1.3);
        await k.wait(300);
      }
    })();
    await k.all(k.say('three'), sticky);

    // A jelly of his own to keep, before anything else can slurp it.
    void k.fade(pw, 0, 0.3);
    const keep = k.keepsake(k.chapter!.keepsake, { x: 500, y: 100, w: 180, z: 42 });
    k.set(keep, { opacity: 0 });
    await k.appear(keep, 0.4);
    k.sparkle(590, 190, 14, 140);
    await k.all(k.hop(pal, 30), wob(0.6));
    await k.wait(700);
    void k.fade(keep, 0, 0.4);

    // SLURP. A shadow slides along behind the hill.
    k.music('sneaky');
    const veil = k.dim(0, '#1b2a20');
    void k.fade(veil, 0.22, 0.8);
    slurp();
    await k.shake(hero, 8, 2);
    await k.say('slurp', hero);
    lurk();
    k.face(hero, true);
    k.face(pal, true);
    // It only ever shows over the top of the hill: two glints and a pair of ears.
    void k.to(sh, 0.5, { opacity: 0.7 }).then(() => k.wait(2000)).then(() => k.to(sh, 0.5, { opacity: 0 }));
    await k.all(k.to(sh, 3, { x: -560, ease: 'sine.inOut' }), k.wait(400).then(() => wob(0.8)), k.wait(1300).then(() => wob(0.6)), k.wait(1500).then(() => slurp()));
    // Both look back: nothing there now.
    k.face(hero, false);
    k.face(pal, false);
    void k.blink(hero);
    void k.blink(pal);
    await k.all(k.say('away'), k.camera({ zoom: 1.2, x: 300, y: 400 }, 2));
    await k.wait(400);
  },
});
