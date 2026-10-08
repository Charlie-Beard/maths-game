/**
 * Land 3, chapter 7: Too Many Treats.
 *
 * A picnic with Silky as the sun goes down: toffees, buns, jellies and a
 * stand of ten swirly lollies. They've eaten four (crunch, crunch), so six
 * are left: four and six make ten. Too many treats! Silky gives {name} a
 * lolly to keep. Then the sky darkens. Slurp… slurp… the treats vanish one
 * by one, a great wobbly shadow rises at the edge of the picture, a spoon
 * clinks, and a furious voice from just out of sight: "Who's been eating MY
 * goodies?" The Jelly Goblin himself is only seen in the finale.
 * Next: The Jelly Goblin.
 */
import { gsap } from 'gsap';
import { bell, C, circle, curve, defineStory, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, svg, tone, tune, type Kit, type Node, type Pt } from './kit';
import { sumCard } from './bits';

// ------------------------------------------------------------------ sounds

/** A lolly being crunched. */
function crunch(): void {
  const t = now();
  for (let i = 0; i < 3; i++) noiseBurst(t + i * 0.09, { freq: 2600 + i * 500, q: 1.4, peak: 0.08, decay: 0.06 });
}

/** A happy, full-up sigh. */
function sigh(): void {
  const t = now();
  tone(420, t, { wave: 'triangle', peak: 0.06, attack: 0.08, decay: 0.6, glideTo: 260, lowpass: 1200 });
}

/** A slurp from somewhere out of sight. */
function slurp(pitch = 1): void {
  const t = now();
  noiseBurst(t, { freq: 2400 * pitch, q: 2.5, peak: 0.1, attack: 0.05, decay: 0.45, sweepTo: 300 });
  tone(460 * pitch, t, { wave: 'sawtooth', peak: 0.035, attack: 0.04, decay: 0.45, glideTo: 110, vibrato: [18, 40], lowpass: 900 });
}

/** The evening wind getting up. */
function wind(): void {
  const t = now();
  noiseBurst(t, { freq: 500, q: 0.7, peak: 0.07, attack: 0.8, decay: 1.6, sweepTo: 900 });
}

/** A big spoon tapping on a bowl, out of sight: clink… clink. */
function spoon(): void {
  const t = now();
  bell(1180, t, 0.07, 0.6);
  bell(1180, t + 0.5, 0.07, 0.6);
}

/** Something huge and wobbly drawing itself up: a low rising wobble. */
function rise(): void {
  const t = now();
  tone(55, t, { wave: 'sine', peak: 0.2, attack: 0.6, decay: 1.6, glideTo: 82, vibrato: [5, 10] });
  tone(110, t + 0.2, { wave: 'triangle', peak: 0.05, attack: 0.6, decay: 1.4, glideTo: 164, vibrato: [5, 18], lowpass: 500 });
}

/** A heavy wobbly stomp. */
function stomp(): void {
  const t = now();
  tone(80, t, { wave: 'sine', peak: 0.22, attack: 0.01, decay: 0.35, glideTo: 45, vibrato: [18, 12] });
  noiseBurst(t, { freq: 400, q: 1, peak: 0.08, decay: 0.2 });
}

// --------------------------------------------------------------------- art

const SWIRLS = [C.candyPink, C.mint, C.yellow, C.lilac, C.jellyRed];

/** A swirly lolly on a stick (60 × 160). */
function lolly(i: number): string {
  const col = SWIRLS[i % SWIRLS.length];
  const spiral: Pt[] = Array.from({ length: 22 }, (_, j) => [30 + Math.cos(j / 2.2) * (j / 22) * 24, 34 + Math.sin(j / 2.2) * (j / 22) * 24]);
  return svg({ w: 60, h: 160, name: `l3c7-lolly${i % SWIRLS.length}` }, [
    piece(rect(26, 50, 8, 108, 3), C.white, { edge: 'cut' }),
    piece(circle(30, 34, 28), col),
    ink(spiral, { width: 4, color: C.white, opacity: 0.85 }),
  ]);
}

/** A slab of toffee to stand the lollies in (600 × 70). */
function stand(): string {
  return svg({ w: 600, h: 70, name: 'l3c7-stand' }, [
    piece(rect(6, 10, 588, 54, 10), C.toffee),
    piece(rect(6, 10, 588, 12, 6), C.caramel, { edge: 'cut', fibre: false, shadow: false }),
    ...Array.from({ length: 10 }, (_, i) => piece(ellipse(42 + i * 57, 16, 7, 3), C.brownDark, { edge: 'cut', fibre: false, shadow: false })),
  ]);
}

/** A picnic blanket in perspective (860 × 200). */
function blanket(): string {
  const checks: Node[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) if (!((r + c) % 2)) checks.push(piece(rect(40 + c * 60 - r * 10, 30 + r * 40, 56 + r * 2, 38), C.mint, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
  return svg({ w: 860, h: 200, name: 'l3c7-blanket', boil: false }, [piece([[60, 24], [800, 24], [850, 196], [10, 196]], C.white, { rough: 1.4 }), ...checks]);
}

/**
 * The shadow of something huge (700 × 600), half out of the picture: a
 * dark, see-through jelly-mould shape with ears, a cherry and two glinting
 * eyes, holding up a big spoon.
 */
function looming(): string {
  const ink2 = '#14241b';
  const flat = { edge: 'cut' as const, fibre: false as const, shadow: false };
  return svg({ w: 700, h: 600, name: 'l3c7-looming', boil: false }, [
    piece(poly([[190, 230], [70, 120], [170, 320]]), ink2, flat),
    piece(poly([[510, 230], [630, 120], [530, 320]]), ink2, flat),
    piece(curve([[110, 640], [150, 380], [230, 190], [350, 150], [470, 190], [550, 380], [590, 640]], 3), ink2, flat),
    piece(circle(350, 128, 32), ink2, flat),
    ink([[350, 100], [376, 44]], { width: 7, color: ink2 }),
    // the spoon, held up high
    piece(curve([[600, 420], [630, 260], [640, 200]], 1), ink2, flat),
    ink([[600, 430], [640, 200]], { width: 16, color: ink2 }),
    piece(ellipse(646, 160, 34, 46), ink2, flat),
    // glinting eyes
    piece(ellipse(300, 300, 16, 10, -10), C.gold, flat),
    piece(ellipse(400, 300, 16, 10, 10), C.gold, flat),
  ]);
}

// ------------------------------------------------------------------ helpers

/**
 * Says a line from someone just out of the picture: the caption shows the
 * words but not the speaker's name tag and portrait, so nothing is seen of
 * him before the finale. (The kit's say() always shows the tag for a named
 * character; this hides it once the caption is up.)
 */
function sayOffstage<K extends string>(k: Kit<K>, key: K): Promise<void> {
  const said = k.say(key);
  const tag = k.stage.querySelector<HTMLElement>('.story-tag');
  if (tag) tag.hidden = true;
  return said;
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    feast: { who: 'silky', text: 'What a feast! But oh dear… I think we’ve eaten too many treats.' },
    four: { who: 'hero', text: 'Ten lollies, and we ate four. Six are left. Four and six make ten!' },
    keep: { who: 'silky', text: 'Six for later, then. And here, {name}: a swirly lolly to keep.' },
    dark: { who: 'narrator', text: 'Then the sun went down. Slurp… slurp… the treats began to vanish.' },
    goblin: { who: 'jellyGoblin', text: 'Who’s been eating MY goodies?' },
  },

  async play(k) {
    k.landScene();
    k.music('cosy');
    const sunset = k.dim(0.12, '#f08a5a');
    const warm = k.light(590, 300, 420, { color: '#ffd9a0', strength: 0.35, z: 34 });

    k.add(blanket(), { x: 160, y: 500, w: 860, h: 200, z: 4 });
    const treats = [
      k.prop('toffee', { x: 250, y: 580, w: 80, z: 6 }),
      k.prop('googleBun', { x: 340, y: 590, w: 84, z: 6 }),
      k.prop('jelly', { x: 760, y: 580, w: 80, z: 6 }),
      k.prop('popBiscuit', { x: 850, y: 596, w: 72, z: 6 }),
    ];
    k.add(stand(), { x: 290, y: 500, w: 600, h: 70, z: 7 });
    const lollies = Array.from({ length: 10 }, (_, i) => k.add(lolly(i), { x: 302 + i * 57, y: 380, w: 56, h: 150, z: 6 }));
    const silky = k.character('silky', { x: 30, y: 380, z: 20 });
    const hero = k.character('hero', { x: 910, y: 384, z: 20 });
    k.float(silky, 6, 2.4);

    // Four are already gone: crunch, crunch, crunch, crunch.
    await k.camera({ zoom: 1.3, x: 590, y: 460 }, 0.01);
    const munch = (async () => {
      await k.wait(900);
      for (const i of [9, 8, 7, 6]) {
        crunch();
        await k.vanish(lollies[i], 0.25);
        await k.wait(200);
      }
      sigh();
    })();
    await k.all(k.say('feast', silky), munch, k.camera({}, 2.4));
    void k.to(k.part(silky, 'armL'), 0.3, { rotation: 20 });

    const card = k.add(sumCard('4 + 6 = 10', 'l3c7-sum'), { x: 380, y: 40, w: 420, h: 130, z: 40 });
    k.set(card, { opacity: 0 });
    const count = (async () => {
      await k.wait(1800);
      for (const l of lollies.slice(0, 6)) {
        tone(560, now(), { wave: 'triangle', peak: 0.04, decay: 0.08 });
        await k.pop(l, 1.12);
      }
      tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24], [NOTE.C6, 0.4]], 0.1);
      await k.appear(card, 0.4);
    })();
    await k.all(k.say('four', hero), count, k.shake(hero, 4, 1));

    // A lolly to keep.
    void k.fade(card, 0, 0.3);
    const keep = k.keepsake(k.chapter!.keepsake, { x: 500, y: 150, w: 180, z: 42 });
    k.set(keep, { opacity: 0 });
    void k.to(k.part(silky, 'armR'), 0.4, { rotation: -60 });
    k.fx.twinkle();
    void k.appear(keep, 0.4).then(() => k.sparkle(590, 240, 14, 140));
    await k.say('keep', silky);
    void k.to(k.part(silky, 'armR'), 0.3, { rotation: 0 });
    await k.fade(keep, 0, 0.4);

    // The sun goes down. Slurp… slurp… the treats vanish.
    k.music('spooky');
    wind();
    void k.fade(warm, 0, 1.2);
    void k.fade(sunset, 0, 1.2);
    const night = k.dim(0, '#0b1030');
    void k.fade(night, 0.45, 1.6);
    k.ambient('fireflies', { count: 8, area: [200, 200, 800, 300] });
    const vanish = (async () => {
      await k.wait(1400);
      const gone = [treats[3], lollies[5], treats[2], lollies[4], lollies[3], treats[1], lollies[2], treats[0], lollies[1], lollies[0]];
      for (const [i, t] of gone.entries()) {
        slurp(1 + (i % 3) * 0.12);
        void k.to(t, 0.3, { x: '+=40', y: '-=30', scale: 0, opacity: 0, ease: 'back.in(1.6)' });
        await k.wait(330);
      }
    })();
    void k.shake(silky, 5, 2);
    // He creeps over to stand by Silky.
    await k.all(k.say('dark'), vanish, k.wait(2400).then(() => k.walk(hero, -300, 1.2, 4)));

    // Something huge draws itself up at the edge of the picture…
    const shade = k.add(looming(), { x: 830, y: 120, w: 700, h: 600, z: 34 });
    k.set(shade, { y: 520, opacity: 0.8 });
    rise();
    void k.blink(hero);
    await k.all(k.to(shade, 1.6, { y: 0, ease: 'power1.out' }), k.camera({ zoom: 1.15, x: 700, y: 400 }, 1.6));
    if (!k.calm) gsap.to(shade, { scaleY: 0.97, scaleX: 1.03, transformOrigin: '50% 100%', duration: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    spoon();
    await k.wait(900);
    // …and a furious voice from just out of sight.
    stomp();
    void k.quake(10);
    void k.shake(hero, 8, 3);
    void k.shake(silky, 8, 3);
    await sayOffstage(k, 'goblin');
    stomp();
    await k.quake(6);
    await k.wait(900);
  },
});
