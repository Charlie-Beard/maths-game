/**
 * Land 5, chapter 6: The Biggest Cake.
 *
 * Moon-Face has baked the biggest birthday cake ever: tier after tier
 * thumps down on the table until it's taller than the sky. Cut into
 * twenty slices: twelve are on plates already, and eight more make twenty,
 * two whole rows of ten (the chapter's number bonds to 20).
 *
 * The one dark thread in this happiest of lands: while everyone looks at
 * the cake, the camera slips over to the birthday list on its post, and a
 * thin, ink-black shadow with a ruler leans in to read it… and is gone.
 * Nobody saw. (Dame Snap: she will come back for Silky in land 7.) Then,
 * the best bit of any birthday: making a wish. Next: Make a Wish.
 */
import { balloon, bunting, hills, sceneSvg, sky } from '../art/lands/common';
import { C, circle, curve, defineStory, ink, NOTE, noiseBurst, now, piece, raw, rect, svg, tone, type Kit } from './kit';
import { numberTag } from './bits';

// ------------------------------------------------------------------ sounds

/** A cake tier landing: a soft, squashy thump. */
function thump(n: number): void {
  const t = now();
  tone(140 - n * 8, t, { peak: 0.18, decay: 0.2, glideTo: 60 });
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.1, decay: 0.12 });
}

/** A slice landing on its plate: a little china clink. */
function clink(n: number): void {
  const t = now();
  const f = [NOTE.C6, NOTE.D6, NOTE.E6, NOTE.G6][n % 4];
  tone(f, t, { peak: 0.05, attack: 0.003, decay: 0.25 });
  tone(f * 2.7, t, { peak: 0.015, attack: 0.003, decay: 0.12 });
}

/** The shadow: two low, creeping notes and a breath of air. Quiet: it mustn't be heard by the heroes. */
function creep(): void {
  const t = now();
  tone(NOTE.E3, t, { wave: 'triangle', peak: 0.07, attack: 0.08, decay: 0.5, lowpass: 900 });
  tone(NOTE.D3 * 1.06, t + 0.5, { wave: 'triangle', peak: 0.07, attack: 0.08, decay: 0.8, lowpass: 900 });
  noiseBurst(t, { freq: 600, q: 2, peak: 0.03, attack: 0.4, decay: 0.9, sweepTo: 300 });
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];

/** Where the cherries go along a tier's top edge. */
function cherries(w: number): number[] {
  const n = Math.max(3, Math.round(w / 70));
  return Array.from({ length: n }, (_, i) => 20 + (i / (n - 1)) * (w - 40));
}

/** One tier of the enormous cake. */
function tier(w: number, n: number): string {
  const h = 110;
  const drips: [number, number][] = [[4, 14]];
  for (let k = 0; k <= 8; k++) drips.push([4 + (k / 8) * (w - 8), 30 + (k % 2 ? 22 : 6)]);
  drips.push([w - 4, 14]);
  const icing = n % 2 ? C.icing : C.pink;
  return svg({ w, h: h + 10, name: `l5c6-tier-${n}` }, [
    piece(rect(4, 12, w - 8, h - 4, 10), n % 3 === 2 ? C.caramel : C.cakeSponge, { rough: 0.7 }),
    piece(rect(4, 70, w - 8, 10), n % 2 ? C.pink : C.white, { edge: 'cut', fibre: false, shadow: false }),
    piece(curve(drips, 1), icing, { rough: 0.6 }),
    ...cherries(w).map((x) => piece(circle(x, 14, 8), C.cherry, { edge: 'cut' })),
  ]);
}

/** Back at the party table, with the birthday list's post at the back. */
function tableScene(): string {
  return sceneSvg('l5c6-table', [
    ...sky([
      ['#f3d79a', 0],
      ['#f6e3b6', 260],
      ['#f8ead0', 420],
    ]),
    hills(470, 40, '#e9c98a', 561),
    ...bunting([-20, 60], [600, 50], 60, FLAGS, 28),
    ...bunting([580, 50], [760, 56], 20, FLAGS, 28),
    ...balloon(110, 190, 40, C.blue, 170),
    hills(560, 24, '#9cbf6a', 562, { step: 80 }),
    // The post the birthday list is pinned to.
    piece(rect(956, 40, 18, 560, 4), C.wood, { edge: 'cut' }),
    piece(circle(965, 36, 13), C.gold, { edge: 'cut' }),
    piece(rect(-20, 600, 1220, 240), C.white, { rough: 0.6 }),
    ...Array.from({ length: 15 }, (_, i) => piece(rect(-20 + i * 85, 600, 42, 240), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 })),
  ]);
}

/** The birthday list: a scroll of names (scribbles), with one line ringed in red. */
function birthdayList(): string {
  return svg({ w: 160, h: 220, name: 'l5c6-list' }, [
    piece(rect(10, 16, 140, 196, 6), C.cream, { rough: 0.8 }),
    piece(rect(4, 6, 152, 18, 8), C.sand, { edge: 'cut' }),
    piece(rect(4, 202, 152, 16, 8), C.sand, { edge: 'cut' }),
    raw(`<text x="80" y="54" font-family="Andika, sans-serif" font-weight="700" font-size="20" fill="${C.redDark}" text-anchor="middle">Birthdays</text>`),
    ...[78, 104, 130, 156, 182].map((y, i) => ink([[30, y], [60 + (i % 3) * 14, y - 2], [90 + (i % 2) * 20, y + 1], [128, y - 1]], { width: 3, color: C.slate, wobble: 1.2 })),
    ink([[22, 128], [80, 116], [138, 126], [132, 142], [74, 146], [20, 136], [26, 124]], { width: 2.5, color: C.red }),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    tall: { who: 'moonface', text: 'Ta-da! The biggest birthday cake ever. It’s as tall as the Faraway Tree!' },
    slices: { who: 'moonface', text: 'Twenty slices, one for everyone. Twelve are on plates. How many more make twenty?' },
    twenty: { who: 'narrator', text: 'Twelve… and eight more make twenty! Two whole rows of ten.' },
    shadow: { who: 'narrator', text: 'But nobody saw a thin, dark shadow… peeking at the birthday list.' },
    wish: { who: 'hero', text: 'Mmm, cake! And now for the very best bit. Making a wish!' },
  },

  async play(k: Kit) {
    // ---- The enormous cake, tier after tier.
    k.landScene();
    k.music('cosy');
    let mf = k.character('moonface', { x: 30, y: 340, z: 20 });
    let hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    void k.enter(hero, 'right');
    await k.enter(mf, 'left');

    const widths = [500, 440, 380, 320, 260, 200, 150, 110];
    const tiers = widths.map((w, i) => k.add(tier(w, i), { x: 590 - w / 2, y: 532 - i * 110, w, z: 12 + i, still: true }));
    tiers.forEach((t) => k.set(t, { opacity: 0 }));
    const stack = async () => {
      for (const [i, t] of tiers.entries()) {
        k.set(t, { opacity: 1, y: -700 });
        await k.to(t, 0.3, { y: 0, ease: 'power2.in' });
        thump(i);
        void k.to(t, 0.08, { scaleY: 0.92, transformOrigin: '50% 100%' }).then(() => k.to(t, 0.15, { scaleY: 1, ease: 'back.out(3)' }));
        if (i === 0 || i === 3) void k.quake(3);
      }
    };
    void k.camera({ zoom: 1.15, y: 200 }, 2.6);
    await k.all(k.say('tall', mf), stack());
    void k.shake(hero, 6, 2);
    await k.camera({}, 0.8);

    // ---- Cut: the slices on their plates, two rows of ten.
    let shadow!: HTMLElement;
    const slices: HTMLElement[] = [];
    await k.cut(() => {
      k.backdrop(tableScene());
      mf = k.character('moonface', { x: 20, y: 340, z: 20 });
      hero = k.character('hero', { x: 920, y: 352, z: 20, flip: true });
      k.add(birthdayList(), { x: 885, y: 90, w: 160, z: 10 });
      // Dame Snap, as nothing but a thin ink-black shadow, waiting off stage.
      shadow = k.snap('point', { x: 975, y: 70, w: 300, z: 11, flip: true });
      shadow.style.filter = 'brightness(0)';
      k.set(shadow, { scaleX: 0.85, opacity: 0.9, x: 330 });
      for (let i = 0; i < 20; i++) {
        const s = k.keepsake(k.chapter!.keepsake, { x: 262 + (i % 10) * 64, y: 300 + Math.floor(i / 10) * 92, w: 78, z: 14 });
        if (i >= 12) k.set(s, { opacity: 0 });
        slices.push(s);
      }
    });
    const twelve = k.add(numberTag('12', C.goldLight, 'l5c6-tag-twelve'), { x: 420, y: 205, w: 100, z: 16 });
    const eight = k.add(numberTag('8', C.sky, 'l5c6-tag-eight'), { x: 680, y: 205, w: 100, z: 16 });
    const twenty = k.add(numberTag('20', C.pink, 'l5c6-tag-twenty'), { x: 530, y: 197, w: 120, z: 17 });
    [eight, twenty].forEach((t) => k.set(t, { opacity: 0 }));
    await k.say('slices', mf);

    const eightMore = async () => {
      for (let i = 12; i < 20; i++) {
        clink(i);
        await k.appear(slices[i], 0.2);
      }
      await k.appear(eight, 0.3);
      await k.wait(300);
      k.sfx.sparkle();
      void k.fade(twelve, 0, 0.3);
      void k.fade(eight, 0, 0.3);
      await k.appear(twenty, 0.4);
    };
    await k.all(k.say('twenty'), eightMore());
    k.fx.jingle();
    void k.hop(mf, 30, 2);
    void k.hop(hero, 30, 2);
    await k.wait(400);

    // ---- Meanwhile, by the birthday list… a shadow. Just for a moment.
    k.silence();
    const peek = async () => {
      await k.camera({ zoom: 1.3, x: 960, y: 260 }, 0.9);
      creep();
      await k.to(shadow, 0.9, { x: 0, ease: 'power1.out' });
      // She leans in to read it…
      await k.to(shadow, 0.5, { rotation: -5, transformOrigin: '50% 100%', ease: 'sine.inOut' });
      await k.wait(700);
      // …and slides away.
      await k.to(shadow, 0.6, { x: 350, rotation: 0, ease: 'power1.in' });
      k.remove(shadow);
      await k.camera({}, 0.7);
    };
    await k.all(k.say('shadow'), peek());

    // ---- Back to the party: time for a wish.
    k.music('cosy');
    k.sparkle(590, 380, 14, 200);
    await k.all(k.say('wish', hero), k.hop(hero, 30, 1));
    k.fx.twinkle();
    await k.wait(800);
  },
});
