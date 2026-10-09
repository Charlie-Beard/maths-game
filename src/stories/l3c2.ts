/**
 * Land 3, chapter 2: The Lemonade Fountain.
 *
 * The Saucepan Man clanks up to the lemonade fountain with two jugs: six
 * cups in one, four in the other. Glug, glug: they pour into one big jug,
 * and it fills right to the top. Six and four make ten! "Ten LEMONS?" he
 * shouts, and the fountain answers with a great fizzy gush, all over him.
 * Dripping, he hands over a jug to keep, and {name}'s friend spots a tin of
 * pop biscuits by the path. Next: Pop Biscuit Pairs.
 */
import { gsap } from 'gsap';
import { band, bell, C, defineStory, ellipse, group, noiseBurst, NOTE, now, piece, poly, raw, rect, svg, tone, tune, type Kit } from './kit';
import { sumCard } from './bits';

// ------------------------------------------------------------------ sounds

/** The Saucepan Man's pots and pans: clinks and clanks that don't quite agree. */
function clank(hits = 4): void {
  const t = now();
  for (let i = 0; i < hits; i++) {
    const d = i * 0.13 + Math.random() * 0.03;
    bell(300 + Math.random() * 260, t + d, 0.06, 0.4);
    bell(713 + Math.random() * 300, t + d + 0.01, 0.03, 0.25);
    noiseBurst(t + d, { freq: 2600, q: 3, peak: 0.04, decay: 0.05 });
  }
}

/** Lemonade pouring: a steady fizzy stream with glugs in it. */
function pour(seconds = 1): void {
  const t = now();
  noiseBurst(t, { freq: 1600, q: 0.7, peak: 0.06, attack: 0.08, decay: seconds, sweepTo: 900 });
  for (let i = 0; i < Math.round(seconds * 4); i++) tone(220 + i * 26, t + 0.1 + i * 0.24, { peak: 0.09, attack: 0.01, decay: 0.12, glideTo: 380 + i * 26 });
}

/** Fizz rising in a full jug. */
function fizz(): void {
  const t = now();
  for (let i = 0; i < 10; i++) tone(1400 + Math.random() * 1600, t + Math.random() * 0.6, { peak: 0.02, attack: 0.002, decay: 0.05 });
}

/** The fountain gushing: a big whoosh up and a splashy fall. */
function gush(): void {
  const t = now();
  noiseBurst(t, { freq: 400, q: 0.6, peak: 0.16, attack: 0.15, decay: 0.4, sweepTo: 2600 });
  noiseBurst(t + 0.45, { freq: 2000, q: 0.6, peak: 0.12, attack: 0.02, decay: 0.7, sweepTo: 600 });
  for (let i = 0; i < 6; i++) tone(500 + Math.random() * 500, t + 0.5 + i * 0.08, { peak: 0.04, decay: 0.08, glideTo: 1200 });
}

/** Drips off a dripping Saucepan Man. */
function drips(n = 4): void {
  const t = now();
  for (let i = 0; i < n; i++) tone(900 + Math.random() * 300, t + i * 0.28, { peak: 0.06, attack: 0.003, decay: 0.1, glideTo: 1500 });
}

// --------------------------------------------------------------------- art

/**
 * A glass jug (160 × 200) holding lemonade, with a number tag. The lemonade
 * is the `level` part: scale it from the bottom to fill or empty the jug.
 */
function jug(name: string, label: string, spoutRight = false, big = false): string {
  const w = 160;
  const tag = label
    ? [
        piece(rect(44, 112, 72, 60, 8), C.cream, { edge: 'cut' }),
        raw(`<text x="80" y="160" font-family="Andika, sans-serif" font-weight="700" font-size="${big ? 44 : 50}" fill="${C.ink}" text-anchor="middle">${label}</text>`),
      ]
    : [];
  return svg({ w, h: 200, name: `l3c2-${name}` }, [
    piece(ellipse(80, 194, 60, 6), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    // (mirrored when the spout should point right; the number tag never is)
    group({ transform: spoutRight ? 'translate(160 0) scale(-1 1)' : undefined }, [
    // handle
    piece(band([[122, 60], [154, 72], [154, 130], [124, 146]], 12), C.glass, { edge: 'cut' }),
    // glass body
    piece(poly([[24, 30], [128, 30], [134, 190], [18, 190]]), C.glass),
    group({ part: 'level', origin: [80, 186] }, [piece(poly([[26, 50], [126, 50], [130, 186], [22, 186]]), C.lemonade, { edge: 'cut', fibre: false, shadow: false })]),
    // spout and rim
    piece(poly([[14, 22], [32, 30], [32, 40]]), C.glass, { edge: 'cut', fibre: false }),
    piece(rect(20, 24, 112, 10, 4), '#d9ecef', { edge: 'cut', fibre: false }),
    piece(poly([[38, 46], [48, 46], [44, 176], [34, 176]]), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.45 }),
    ]),
    ...tag,
  ]);
}

/** A stream of lemonade (40 × 160), poured from a spout above. */
function stream(): string {
  return svg({ w: 40, h: 160, name: 'l3c2-stream' }, [piece(band([[20, 0], [16, 80], [20, 160]], 16), C.lemonade, { edge: 'cut', fibre: C.white })]);
}

/** A tall fizzy gush from the fountain, arcing over to the left (420 × 480). */
function gushArt(): string {
  return svg({ w: 420, h: 480, name: 'l3c2-gush' }, [
    piece(band([[380, 480], [380, 160], [300, 40], [160, 40], [60, 160], [40, 330]], 46), C.lemonade, { edge: 'cut', fibre: C.white }),
    ...[[100, 120], [180, 60], [260, 50], [340, 110], [60, 230], [380, 220]].map(([x, y]) => piece(ellipse(x, y, 16, 14), C.white, { edge: 'cut', fibre: false, opacity: 0.85 })),
  ]);
}

// ------------------------------------------------------------------ helpers

/** The lemonade inside a jug actor. */
const level = (k: Kit, el: HTMLElement) => k.part(el, 'level');

/** Sets how full a jug is (0..1) at once. */
function fillNow(k: Kit, el: HTMLElement, f: number): void {
  k.set(level(k, el), { scaleY: Math.max(0.001, f), transformOrigin: '50% 100%' });
}

/** Tips a small jug over the big one, pours, and fills the big one to `to`. */
async function pourInto(k: Kit, small: HTMLElement, big: HTMLElement, dx: number, to: number, fromLeft: boolean): Promise<void> {
  await k.to(small, 0.5, { x: dx, y: -170, ease: 'power2.inOut' });
  await k.to(small, 0.3, { rotation: fromLeft ? 70 : -70, ease: 'power2.out' });
  const s = k.add(stream(), { x: fromLeft ? 590 : 570, y: 300, w: 40, h: 130, z: 12 });
  k.set(s, { scaleY: 0, transformOrigin: '50% 0%' });
  void k.to(s, 0.2, { scaleY: 1 });
  pour(1.1);
  await k.all(
    k.to(level(k, small), 1.1, { scaleY: 0.001, transformOrigin: '50% 100%' }),
    k.to(level(k, big), 1.1, { scaleY: to, transformOrigin: '50% 100%', ease: 'none' }),
  );
  k.remove(s);
  fizz();
  await k.to(small, 0.3, { rotation: 0 });
  await k.to(small, 0.4, { x: 0, y: 0 });
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hello: { who: 'saucepan', text: 'LEMONADE! Lemonade! Six cups in this jug, four cups in that one!' },
    pour: { who: 'narrator', text: 'Glug, glug, glug! Pour them both into one big jug…' },
    ten: { who: 'hero', text: 'Right to the top! Six and four make ten!' },
    lemons: { who: 'saucepan', text: 'EH? TEN LEMONS? I only wanted lemonade!' },
    next: { who: 'hero', text: 'Look, {name}! Someone’s left a tin of pop biscuits by the path!' },
  },

  async play(k) {
    k.landScene();
    k.music('cosy');
    k.ambient('bubbles', { count: 12, area: [700, 200, 320, 460], z: 6 });
    k.light(860, 420, 260, { color: '#fff7b0', strength: 0.4, flicker: true, z: 5 });

    const sp = k.character('saucepan', { x: 30, y: 380, z: 20 });
    const hero = k.character('hero', { x: 900, y: 384, z: 20 });
    const jugA = k.add(jug('a', '6', true), { x: 330, y: 470, w: 130, h: 162, z: 14 });
    const jugB = k.add(jug('b', '4'), { x: 720, y: 470, w: 130, h: 162, z: 14 });
    const big = k.add(jug('big', '', false, true), { x: 480, y: 360, w: 220, h: 275, z: 13 });
    fillNow(k, jugA, 0.6);
    fillNow(k, jugB, 0.4);
    fillNow(k, big, 0.001);
    k.set([sp, hero, jugA, jugB, big], { opacity: 0 });

    // He clanks in, pots swinging.
    void k.camera({ zoom: 1.15, x: 500, y: 430 }, 0.01);
    clank(6);
    const pots = k.part(sp, 'pots');
    gsap.to(pots, { rotation: 4, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    await k.enter(sp, 'left', 1.0);
    void k.enter(hero, 'right');
    void k.camera({}, 1.2);
    void k.appear(jugA, 0.35).then(() => k.appear(jugB, 0.35));
    await k.say('hello', sp);
    clank(2);

    // Glug, glug: both jugs into the big one.
    await k.appear(big, 0.4);
    await k.all(
      k.say('pour'),
      (async () => {
        await pourInto(k, jugA, big, 130, 0.6, true);
        await pourInto(k, jugB, big, -130, 1, false);
      })(),
    );
    const card = k.add(sumCard('6 + 4 = 10', 'l3c2-sum'), { x: 380, y: 30, w: 420, h: 130, z: 40 });
    k.set(card, { opacity: 0 });
    tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24], [NOTE.C6, 0.4]], 0.1);
    void k.appear(card, 0.4);
    k.sparkle(590, 380, 12, 140);
    await k.all(k.say('ten', hero), k.hop(hero, 30, 2));

    // He mishears… and the fountain answers.
    void k.fade(card, 0, 0.3);
    void k.to(k.part(sp, 'brows'), 0.2, { y: -10 });
    await k.all(k.say('lemons', sp), k.shake(sp, 6, 2));
    const spray = k.add(gushArt(), { x: 90, y: 100, w: 830, h: 540, z: 25 });
    k.set(spray, { scaleY: 0, transformOrigin: '90% 100%', opacity: 0.95 });
    gush();
    await k.to(spray, 0.45, { scaleY: 1, ease: 'power2.out' });
    k.puff(170, 420, 240, C.lemonade);
    k.puff(230, 340, 170, C.white);
    clank(5);
    await k.shake(sp, 8, 3);
    gush();
    k.puff(150, 380, 200, C.lemonade);
    await k.to(spray, 0.5, { opacity: 0 });
    k.remove(spray);
    drips(5);
    void k.blink(sp);

    // Dripping, he gives a jug to keep.
    const keep = k.keepsake(k.chapter!.keepsake, { x: 500, y: 150, w: 180, z: 42 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(keep, 0.4);
    k.sparkle(590, 240, 14, 150);
    k.float(keep, 6, 1.6);
    await k.wait(1300);

    // And there by the path: a biscuit tin.
    const tin = k.keepsake('biscuitTin', { x: 730, y: 540, w: 140, z: 18 });
    k.set(tin, { opacity: 0 });
    void k.fade(keep, 0, 0.4);
    void k.fade(jugB, 0, 0.3);
    k.fx.twinkle();
    void k.appear(tin, 0.4).then(() => k.sparkle(800, 600, 10, 90));
    await k.all(k.say('next', hero), k.camera({ zoom: 1.2, x: 820, y: 480 }, 1.6));
    await k.wait(400);
  },
});
