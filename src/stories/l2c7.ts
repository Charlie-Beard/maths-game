/**
 * Land 2, chapter 7: The Topsy-Turvy Tea Party.
 *
 * A long table in Topsy-Turvy Land, set for tea. Silky pours, but here the
 * tea goes the wrong way: up out of the cups and back into the pot. Five
 * cups; two pour back (and turn upside down, empty): 5 − 2 = 3. Then the
 * Topsy-Turvy Man kicks one more cup onto the table with his foot:
 * 3 + 1 = 4. Silky gives {name} the teapot (the keepsake)… and then a deep
 * rumble. The cups rattle, the green spiral sun starts to turn, the light
 * dims, the music goes spooky and the camera pushes in on the spinning sky,
 * then cuts back to the heroes: the land is starting to spin! Next: the
 * finale, the Land Starts to Spin.
 */
import { topsyTall } from '../art/characters';
import { band, C, circle, defineStory, ink, type Kit, noiseBurst, now, piece, raw, rect, svg, tone, type Pt } from './kit';
import { tick } from './bits';

// ------------------------------------------------------------------ sounds

/** Tea pouring backwards: a gurgle that rises, swelling in and stopping dead. */
function upPour(): void {
  const t = now();
  for (let i = 0; i < 6; i++) tone(300 + i * 70, t + i * 0.08, { wave: 'sine', peak: 0.06, attack: 0.06, decay: 0.03, glideTo: 420 + i * 70 });
  noiseBurst(t, { freq: 900, q: 1.5, peak: 0.05, attack: 0.4, decay: 0.05, sweepTo: 2000 });
}

/** A cup kicked up: a boot thwack and a spinning whizz. */
function kick(): void {
  const t = now();
  tone(180, t, { peak: 0.16, decay: 0.08, glideTo: 110 });
  noiseBurst(t + 0.05, { freq: 1500, q: 2, peak: 0.07, attack: 0.05, decay: 0.3, sweepTo: 3500 });
}

/** A cup set down: a china clink. */
function clink(): void {
  const t = now();
  tone(2600, t, { peak: 0.07, attack: 0.002, decay: 0.3 });
  tone(3900, t, { peak: 0.03, attack: 0.002, decay: 0.18 });
}

/** The first rumble of the land beginning to turn: deep, slow, growing, and a whirr on top. */
function spinUp(seconds = 3): void {
  const t = now();
  noiseBurst(t, { freq: 140, type: 'lowpass', peak: 0.2, attack: seconds * 0.5, decay: seconds * 0.6 });
  tone(48, t, { peak: 0.14, attack: seconds * 0.4, decay: seconds * 0.7, glideTo: 62 });
  tone(220, t + 0.4, { wave: 'triangle', peak: 0.035, attack: seconds * 0.5, decay: seconds * 0.5, glideTo: 520, vibrato: [9, 20], lowpass: 1400 });
}

/** Cups rattling on their saucers. */
function rattle(seconds = 1.2): void {
  const t = now();
  for (let s = 0; s < seconds; s += 0.06) tone(2200 + Math.random() * 900, t + s, { peak: 0.03, attack: 0.002, decay: 0.05 });
}

// --------------------------------------------------------------------- art

/** The tea table: a long cloth with pink scallops, legs on the grass. */
function table(): string {
  const scallops = Array.from({ length: 14 }, (_, i) => piece(circle(20 + i * 50, 92, 26), i % 2 ? C.topsyPink : C.candyPink, { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 700, h: 260, name: 'l2c7-table' }, [
    piece(band([[60, 90], [56, 250]], 20), C.bark),
    piece(band([[640, 90], [644, 250]], 20), C.bark),
    ...scallops,
    piece(rect(0, 26, 700, 70, 6), C.cream, { rough: 1 }),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => ink([[40 + i * 100, 40], [70 + i * 100, 80]], { width: 5, color: C.topsyGreen, opacity: 0.6 })),
  ]);
}

/** The green spiral sun, as an actor, so it can start to spin. */
function spiral(): string {
  const pts: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 5;
    const rr = (i / 60) * 62;
    pts.push([80 + Math.cos(a) * rr, 80 + Math.sin(a) * rr]);
  }
  return svg({ w: 160, h: 160, name: 'l2c7-spiral', boil: false }, [piece(circle(80, 80, 72), C.topsyGreen, { rough: 0.8 }), ink(pts, { width: 7, color: C.topsyPink })]);
}

/** A wide torn card with a number sentence. */
function sumCard(text: string): string {
  return svg({ w: 400, h: 140, name: `l2c7-sum-${text}`, boil: false }, [
    piece(rect(8, 12, 384, 116, 28), C.lemonade, { rough: 1.2 }),
    raw(`<text x="200" y="98" font-family="Andika, sans-serif" font-weight="700" font-size="80" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------- story

const CUP = 78;
const CUPS_X = [338, 420, 735, 812, 889];
const CUP_Y = 404;
/** The two cups whose tea pours back up into the pot. */
const POURED = [1, 3];
const POT = { x: 548, y: 286, w: 170 };
/** Where the tea goes in: the top of the pot. */
const LID: Pt = [POT.x + 92, POT.y + 70];
const TOPSY = { x: 975, y: 250, w: 200 };
/** Where the kicked cup lands, in front of the pot. */
const NEW_CUP: Pt = [600, 452];

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'At the topsy-turvy tea party, the tea poured up out of the cups and into the pot!' },
    ask: { who: 'silky', text: 'Five cups of tea. Two pour back into the pot. How many are left?' },
    four: { who: 'hero', text: 'Three! And the Topsy-Turvy Man adds one more. Four!' },
    gift: { who: 'silky', text: 'A teapot for you, {name}! Oh… what’s that rumble?' },
    spin: { who: 'topsy', text: 'Uh-oh. Nips! I mean… spin! The land is starting to spin!' },
    end: { who: 'narrator', text: 'Everything began to turn. Quick! Back to the Faraway Tree!' },
  },

  async play(k) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 12 });

    const sun = k.add(spiral(), { x: 940, y: 120, w: 160, z: 2 });
    const silky = k.character('silky', { x: 320, y: 214, w: 240, z: 5 });
    const wings = k.pivot([...k.part(silky, 'wingL'), ...k.part(silky, 'wingR')]);
    const topsy = k.add(topsyTall(), { ...TOPSY, z: 5 });
    const legs = k.pivot([...k.part(topsy, 'legL'), ...k.part(topsy, 'legR')]);
    k.add(table(), { x: 290, y: 440, w: 700, z: 6 });
    const pot = k.keepsake(k.chapter!.keepsake, { ...POT, z: 8 });
    const cups = CUPS_X.map((x, i) => k.prop('teacup', { x, y: CUP_Y, w: CUP, z: 9 + i }));
    const hero = k.character('hero', { x: 10, y: 400, w: 250, z: 12 });
    k.set(hero, { opacity: 0 });
    if (!k.calm) flutter(k, wings);

    // ---- Tea pours the wrong way: up out of two cups, into the pot.
    const pour = async () => {
      k.fx.patter(4);
      await k.enter(hero, 'left', 0.6);
      await k.wait(1200);
      for (const i of POURED) {
        upPour();
        const from: Pt = [CUPS_X[i] + CUP / 2, CUP_Y + 30];
        await k.beam(from, LID, C.caramel, 0.6);
        // An empty cup, turned upside down (of course).
        await k.to(cups[i], 0.3, { rotation: 180, ease: 'back.out(2)' });
        clink();
        void k.pop(pot, 1.08);
        await k.wait(200);
      }
    };
    await k.all(k.say('intro'), pour());

    // ---- Five take away two; then one more.
    const card = k.add(sumCard('5 − 2 = 3'), { x: 390, y: 120, w: 400, z: 20 });
    k.set(card, { opacity: 0 });
    const count = async () => {
      await k.wait(600);
      await k.appear(card, 0.35);
    };
    await k.all(k.say('ask', silky), count());

    const extra = k.prop('teacup', { x: TOPSY.x + 140, y: TOPSY.y - 20, w: CUP, z: 13 });
    k.set(extra, { opacity: 0 });
    const adding = async () => {
      // Count the three full cups.
      const full = cups.filter((_, i) => !POURED.includes(i));
      for (const [n, c] of full.entries()) {
        tick(n);
        await k.pop(c, 1.25);
      }
      await k.wait(300);
      // He kicks one more up off his boot…
      k.set(extra, { opacity: 1 });
      kick();
      void k.to(legs[1] ?? [], 0.12, { rotation: 18 }).then(() => k.to(legs[1] ?? [], 0.2, { rotation: 0 }));
      const dx = NEW_CUP[0] - (TOPSY.x + 140);
      const dy = NEW_CUP[1] - (TOPSY.y - 20);
      await k.to(extra, 0.4, { x: dx / 2, y: -80, rotation: -360, ease: 'power2.out' });
      await k.to(extra, 0.35, { x: dx, y: dy, rotation: -720, ease: 'power2.in' });
      clink();
      tick(3);
      const inner = card.querySelector<HTMLElement>(':scope > .story-flip');
      if (inner) inner.innerHTML = sumCard('3 + 1 = 4');
      k.sfx.success();
      void k.pop(card, 1.1);
    };
    await k.all(k.say('four', hero), adding(), k.hop(hero, 30, 1));

    // ---- The teapot, and then… a rumble.
    void k.fade(card, 0, 0.4);
    k.fx.twinkle();
    const lift = async () => {
      k.set(pot, { zIndex: 22 });
      await k.to(pot, 0.6, { x: 260 - POT.x, y: 210 - POT.y, scale: 0.9, ease: 'power2.inOut' });
      k.sparkle(330, 290, 12);
      k.float(pot, 6, 1.8);
      await k.wait(900);
      k.silence();
      spinUp(3.2);
    };
    await k.all(k.say('gift', silky), lift());

    // ---- The land begins to turn.
    k.music('spooky');
    const dark = k.dim(0, '#2a1440');
    void k.fade(dark, 0.3, 2);
    rattle(1.6);
    void k.to([...cups, extra], 0.08, { x: '+=3', yoyo: true, repeat: 15, ease: 'none' });
    void k.to(sun, 6, { rotation: -720, ease: 'power1.in' });
    void k.camera({ zoom: 1.3, x: 920, y: 400 }, 1.2);
    await k.all(k.say('spin', topsy), k.shake(topsy, 5, 3));
    // Back to the heroes before it's too much.
    void k.camera({}, 0.7);
    k.fx.wind(2.5);
    spinUp(2.5);
    void k.to([hero, silky], 0.3, { rotation: (i: number) => (i ? 4 : -4), yoyo: true, repeat: 3, ease: 'sine.inOut' });
    await k.say('end');
    await k.wait(600);
  },
});

/** Silky's wings flutter gently all through tea. */
function flutter(k: Kit, wings: SVGGElement[]): void {
  void k.to(wings, 0.3, { scaleX: 0.85, yoyo: true, repeat: 40, ease: 'sine.inOut' });
}
