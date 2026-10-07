/**
 * Land 2, chapter 3: Take Away Teacups.
 *
 * The upside-down kitchen: the table is stuck to the ceiling, legs up, and
 * seven teacups hang underneath it. They rattle and wobble (sneaky music),
 * Moon-Face holds out his arms… and three fall: plop onto a cushion, plop
 * onto another, PLONK onto Moon-Face's head, where it stays like a hat.
 * Seven take away three: the card shows 7 − 3 = 4 and the four cups left
 * are counted with a tick each. The keepsake is a teacup. Moon-Face sniffs:
 * buns baking. Next: the Back-to-Front Bakery.
 */
import { band, C, circle, defineStory, ellipse, group, ink, noiseBurst, now, piece, poly, raw, rect, svg, tone } from './kit';
import { tick } from './bits';

// ------------------------------------------------------------------ sounds

/** China rattling on the ceiling: quick, tiny, nervous clinks. */
function rattle(seconds = 1.2): void {
  const t = now();
  for (let s = 0; s < seconds; s += 0.07) {
    const f = 2200 + Math.random() * 900;
    tone(f, t + s, { peak: 0.03 + (s / seconds) * 0.03, attack: 0.002, decay: 0.05 });
  }
}

/** Something falling: a whistle sliding down. */
function fall(): void {
  tone(1500, now(), { wave: 'sine', peak: 0.07, attack: 0.02, decay: 0.45, glideTo: 500 });
}

/** A teacup plopping onto a soft cushion. */
function plop(): void {
  const t = now();
  tone(240, t, { wave: 'triangle', peak: 0.14, attack: 0.005, decay: 0.2, glideTo: 420 });
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.1, decay: 0.1 });
}

/** A teacup landing on Moon-Face's head: a hollow, round PLONK. */
function plonk(): void {
  const t = now();
  tone(330, t, { wave: 'triangle', peak: 0.18, attack: 0.003, decay: 0.28, glideTo: 300 });
  tone(660, t, { peak: 0.06, attack: 0.003, decay: 0.15 });
  tone(2500, t + 0.02, { peak: 0.04, attack: 0.002, decay: 0.2 });
}

/** Two big sniffs. */
function sniff(): void {
  const t = now();
  for (let i = 0; i < 2; i++) noiseBurst(t + i * 0.32, { freq: 3200, q: 0.8, peak: 0.07, attack: 0.08, decay: 0.12, sweepTo: 4800 });
}

// --------------------------------------------------------------------- art

/**
 * The upside-down kitchen. Lilac walls, a chequered floor, and everything
 * that should be on the floor stuck to the ceiling: a rug, the table (legs
 * up, top down) and a chair. The window is upside down, and the lamp grows
 * up out of the floor.
 */
function kitchen(): string {
  const tiles = [];
  for (let i = 0; i < 14; i++) for (let j = 0; j < 3; j++) tiles.push(piece(rect(i * 90 - 20 + (j % 2) * 45, 630 + j * 64, 45, 64), (i + j) % 2 ? C.cream : C.topsyPink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }));
  return svg({ w: 1180, h: 820, name: 'l2c3-kitchen', boil: false }, [
    piece(rect(-20, -20, 1220, 860), C.lilac, { edge: 'clean', shadow: false }),
    // Stripy wallpaper.
    ...Array.from({ length: 13 }, (_, i) => piece(rect(i * 96 - 10, 60, 30, 580), '#d9c6e6', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 })),
    // The floor (way down) and the ceiling (with a rug stuck to it).
    piece(rect(-20, 620, 1220, 220), C.woodShade, { rough: 1.2 }),
    ...tiles,
    piece(rect(-20, -20, 1220, 84), C.wood, { rough: 1.2 }),
    piece(rect(150, 50, 880, 26, 8), C.topsyGreen, { rough: 1.4 }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ink([[170 + i * 110, 76], [175 + i * 110, 92]], { width: 4, color: C.topsyGreen })),
    // The table, stuck to the ceiling: legs up into it, top facing down.
    ...[270, 900].map((x) => piece(band([[x, 64], [x + 4, 176]], 22), C.bark)),
    piece(rect(240, 168, 700, 30, 6), C.barkLight, { rough: 1 }),
    piece(rect(240, 194, 700, 10, 3), C.bark, { edge: 'cut', fibre: false }),
    // A chair, also on the ceiling, also upside down.
    piece(band([[1010, 64], [1010, 150]], 12), C.bark),
    piece(band([[1080, 64], [1080, 150]], 12), C.bark),
    piece(rect(996, 144, 98, 18, 4), C.barkLight),
    piece(rect(1080, 150, 14, 120, 4), C.barkLight),
    // The window, upside down: the sill is at the top.
    piece(rect(60, 230, 150, 170, 6), C.white),
    piece(rect(72, 242, 126, 146), C.topsySky, { edge: 'cut', fibre: false }),
    // Inside the window the land is upside down too: grass at the top.
    piece(rect(72, 242, 126, 36), C.topsyGreen, { edge: 'cut', fibre: false, shadow: false }),
    ink([[135, 242], [135, 388]], { width: 6, color: C.white }),
    ink([[72, 315], [198, 315]], { width: 6, color: C.white }),
    piece(rect(48, 216, 174, 18, 4), C.bark),
    // A lamp growing up out of the floor, shade the wrong way up.
    piece(band([[1120, 640], [1120, 420]], 10), C.steelDark),
    piece(poly([[1080, 420], [1160, 420], [1140, 360], [1100, 360]]), C.lemonade),
    piece(ellipse(1120, 644, 34, 8), C.steelDark, { edge: 'cut' }),
    // A clock with its numbers going the other way round.
    piece(circle(640, 300, 46), C.cream),
    piece(circle(640, 300, 40), C.white, { edge: 'cut', fibre: false }),
    raw(`<text x="640" y="276" font-family="Andika, sans-serif" font-size="18" fill="${C.plum}" text-anchor="middle" transform="rotate(180 640 270)">12</text>`),
    ink([[640, 300], [624, 280]], { width: 4, color: C.plum }),
    ink([[640, 300], [662, 306]], { width: 3, color: C.plum }),
    group({}, [piece(circle(640, 300, 5), C.plum, { edge: 'cut', fibre: false })]),
  ]);
}

/** A wide torn card with a number sentence on it. */
function sumCard(text: string): string {
  const w = 420;
  return svg({ w, h: 150, name: `l2c3-sum-${text}`, boil: false }, [
    piece(rect(8, 12, w - 16, 126, 30), C.lemonade, { rough: 1.2 }),
    raw(`<text x="${w / 2}" y="104" font-family="Andika, sans-serif" font-weight="700" font-size="84" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------- story

const CUP = 80;
/** Where the seven cups hang under the table: x of each. */
const CUPS = [270, 360, 450, 540, 630, 720, 810];
const CUP_Y = 196;
/** Which cups fall (by index) and where each lands: two cushions and a head. */
const FALLERS = [1, 3, 6];
const MF = { x: 860, y: 350, w: 270 };

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'In the upside-down kitchen, seven teacups hung from the ceiling.' },
    wobble: { who: 'moonface', text: 'Uh-oh. They’re wobbling! Get ready to catch!' },
    fall: { who: 'narrator', text: 'Plop! Plop! PLONK! Three teacups fell down.' },
    ask: { who: 'moonface', text: 'Seven take away three. How many are left up there, {name}?' },
    four: { who: 'hero', text: 'Four! There are four teacups left!' },
    next: { who: 'moonface', text: 'Clever you! Keep a teacup. Now… can you smell buns baking?' },
  },

  async play(k) {
    k.backdrop(kitchen());
    k.music('sneaky');
    k.ambient('dust', { count: 10 });

    const cups = CUPS.map((x, i) => k.prop('teacup', { x: x - CUP / 2 + 30, y: CUP_Y - 12, w: CUP, z: 8 + i }));
    k.set(cups, { rotation: 180 });
    const cushions = [430, 600].map((x) => k.prop('cushion', { x, y: 560, w: 110, z: 6 }));
    const hero = k.character('hero', { x: 70, y: 390, w: 250, z: 12 });
    const mf = k.character('moonface', { ...MF, z: 12 });
    const mfArms = k.pivot([...k.part(mf, 'armL'), ...k.part(mf, 'armR')]);
    k.set([hero, mf], { opacity: 0 });

    // ---- The kitchen, and seven cups on the ceiling.
    const arrive = async () => {
      k.fx.patter(4);
      await k.enter(hero, 'left', 0.6);
      await k.enter(mf, 'right', 0.6);
      for (const [i, c] of cups.entries()) {
        tick(i);
        void k.pop(c, 1.15);
        await k.wait(200);
      }
    };
    await k.all(k.say('intro'), arrive());

    // ---- They wobble. Moon-Face gets ready.
    rattle(1.6);
    void k.to(cups, 0.12, { rotation: (i: number) => (i % 2 ? 172 : 188), yoyo: true, repeat: 11, ease: 'sine.inOut' });
    void k.to(mfArms, 0.4, { rotation: (i: number) => (i ? -30 : 30), ease: 'back.out(2)' });
    void k.camera({ zoom: 1.25, x: 560, y: 260 }, 1.2);
    await k.say('wobble', mf);
    k.set(cups, { rotation: 180 });

    // ---- Plop, plop, PLONK.
    const drop = async () => {
      await k.camera({}, 0.6);
      for (const [n, i] of FALLERS.entries()) {
        const cup = cups[i];
        fall();
        await k.wait(250);
        if (n < 2) {
          // Onto a cushion, landing the right way up.
          const cx = parseFloat(cushions[n].style.left) + 15 - parseFloat(cup.style.left);
          await k.to(cup, 0.5, { x: cx, y: 560 - 60 - CUP_Y + 12, rotation: 360, ease: 'power2.in' });
          plop();
          void k.pop(cushions[n], 1.12);
          k.set(cup, { rotation: 0 });
        } else {
          // Onto Moon-Face's head, where it stays (still upside down).
          const hx = MF.x + 150 * (MF.w / 300) - CUP / 2 - parseFloat(cup.style.left);
          const hy = MF.y + 78 * (MF.w / 300) - 52 - parseFloat(cup.style.top);
          await k.to(cup, 0.5, { x: hx, y: hy, rotation: 180, ease: 'power2.in' });
          plonk();
          k.set(cup, { zIndex: 14 });
          void k.to(mf, 0.12, { scaleY: 0.94, transformOrigin: '50% 100%', yoyo: true, repeat: 1 });
          void k.blink(mf);
        }
        await k.wait(220);
      }
    };
    await k.all(k.say('fall'), drop());
    k.music('cosy');
    void k.to(mfArms, 0.3, { rotation: 0 });

    // ---- Seven take away three.
    const card = k.add(sumCard('7 − 3 = 4'), { x: 380, y: 300, w: 400, z: 20 });
    k.set(card, { opacity: 0 });
    await k.say('ask', mf);
    const left = cups.filter((_, i) => !FALLERS.includes(i));
    const count = async () => {
      for (const [i, c] of left.entries()) {
        tick(i);
        k.sparkle(parseFloat(c.style.left) + CUP / 2, CUP_Y + 40, 5, 50);
        await k.pop(c, 1.3);
        await k.wait(120);
      }
      k.sfx.success();
      await k.appear(card, 0.4);
    };
    await k.all(k.say('four', hero), count(), k.hop(hero, 30, 1));

    // ---- The keepsake, and a smell of buns.
    const keep = k.keepsake(k.chapter!.keepsake, { x: 728, y: 470, w: 140, z: 22 });
    k.set(keep, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(keep, 0.4);
    k.sparkle(798, 530, 12);
    void k.fade(card, 0, 0.5);
    sniff();
    await k.all(k.say('next', mf), k.to(mf, 0.4, { rotation: -5, ease: 'power2.out' }));
    await k.wait(500);
  },
});
