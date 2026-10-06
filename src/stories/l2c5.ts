/**
 * Land 2, chapter 5: The Wobbly Windows.
 *
 * A tall house balances on the point of its roof, rocking gently with a
 * creak, and every window in it is the wrong way up: triangles pointing
 * down, squares tipped onto a corner, the round window's bars askew. Beth
 * (or Joe, when he climbs with Beth) names the shapes as each one jiggles;
 * the hero counts three triangles and two squares (more triangles, fewer
 * squares). Then {name} turns every window the right way up, click, click,
 * click, and the house settles. The keepsake is a wobbly window. Next:
 * Walking on Ceilings.
 */
import { C, circle, curve, defineStory, ellipse, ink, noiseBurst, now, piece, poly, raw, rect, svg, tone, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The house rocking on its point: a long, wobbly wooden creak. */
function creak(seconds = 1.4): void {
  const t = now();
  tone(140, t, { wave: 'sawtooth', peak: 0.045, attack: 0.15, decay: seconds, glideTo: 190, vibrato: [5, 14], lowpass: 800 });
}

/** A window clicking into place, with a tiny glassy ting. */
function click(i: number): void {
  const t = now();
  noiseBurst(t, { freq: 2600, q: 3, peak: 0.12, decay: 0.03 });
  tone(1800 + i * 160, t + 0.03, { peak: 0.05, attack: 0.002, decay: 0.35 });
  tone((1800 + i * 160) * 2.4, t + 0.03, { peak: 0.02, attack: 0.002, decay: 0.2 });
}

/** A counting tick, rising with each window counted. */
function tick(i: number): void {
  tone(560 * Math.pow(2, i / 6), now(), { wave: 'triangle', peak: 0.08, attack: 0.004, decay: 0.14 });
}

/** A jiggle: a little springy wobble when a shape is named. */
function jiggle(): void {
  tone(500, now(), { wave: 'triangle', peak: 0.07, attack: 0.01, decay: 0.25, vibrato: [16, 40] });
}

// --------------------------------------------------------------------- art

type Shape = 'triangle' | 'square' | 'circle';

/** The house balancing on its roof's point, without its windows (they're separate actors). */
function house(): string {
  return svg({ w: 520, h: 640, name: 'l2c5-house' }, [
    // The roof, upside down, a point at the bottom.
    piece(poly([[0, 470], [520, 470], [260, 636]]), C.purple, { rough: 1.2 }),
    ...[0, 1, 2].map((i) => ink([[60 + i * 40, 500 + i * 30], [460 - i * 40, 500 + i * 30]], { width: 4, color: C.plum, opacity: 0.6 })),
    // The wall.
    piece(rect(30, 40, 460, 440, 6), C.topsyPink, { rough: 1.2 }),
    ...[0, 1, 2, 3, 4].map((i) => ink([[30, 120 + i * 80], [490, 122 + i * 80]], { width: 2, color: C.rose, opacity: 0.5 })),
    // The chimney points down… no: up! The door is at the top, upside down.
    piece(rect(210, 40, 100, 120, 40), C.plum),
    piece(circle(232, 140, 6), C.goldLight, { edge: 'cut', fibre: false }),
    piece(rect(200, 26, 120, 20, 4), C.cream),
    // The garden path goes up into the sky.
    ...[0, 1, 2].map((i) => piece(rect(240 - i * 2, -18 - i * 30, 40 + i * 4, 20, 4), C.cream, { edge: 'cut' })),
  ]);
}

/** One window, drawn the right way up (it starts the wrong way round). */
function windowArt(shape: Shape, seed: number): string {
  const glass = C.sky;
  const frame = C.cream;
  const outline: Pt[] =
    shape === 'triangle' ? poly([[60, 8], [112, 104], [8, 104]]) : shape === 'square' ? rect(10, 10, 100, 100, 4) : circle(60, 60, 52);
  const inner: Pt[] =
    shape === 'triangle' ? poly([[60, 30], [94, 94], [26, 94]]) : shape === 'square' ? rect(22, 22, 76, 76, 2) : circle(60, 60, 40);
  const bars =
    shape === 'triangle'
      ? [ink([[60, 34], [60, 94]], { width: 6, color: frame })]
      : [ink([[60, 22], [60, 98]], { width: 6, color: frame }), ink([[22, 60], [98, 60]], { width: 6, color: frame })];
  return svg({ w: 120, h: 120, name: `l2c5-win-${shape}-${seed}` }, [
    piece(outline, frame),
    piece(inner, glass, { edge: 'cut', fibre: false }),
    // A pink curtain peeping in one corner, to show which way is up.
    piece(curve(shape === 'triangle' ? [[48, 46], [60, 34], [64, 62], [52, 80]] : [[30, 26], [56, 26], [44, 60], [30, 70]], 2), C.candyPink, { edge: 'cut', fibre: false, shadow: false }),
    ...bars,
    piece(rect(shape === 'circle' ? 30 : 6, shape === 'triangle' ? 104 : 106, shape === 'circle' ? 60 : 108, 10, 3), C.wood, { edge: 'cut' }),
  ]);
}

/** A torn card with a number or a word. */
function card(text: string, color: string, size = 92, w = 160, h = 160): string {
  return svg({ w, h, name: `l2c5-card-${text}`, boil: false }, [
    piece(w === h ? ellipse(w / 2, h / 2, w / 2 - 8, h / 2 - 8) : rect(8, 10, w - 16, h - 20, 14), color, { rough: 1.2 }),
    raw(`<text x="${w / 2}" y="${h / 2 + size * 0.34}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------- story

const HOUSE = { x: 355, y: 64, w: 470 };
/** The roof's point, which the house balances on (stage coordinates). */
const POINT: Pt = [HOUSE.x + 260, HOUSE.y + 636];
const WIN = 104;
/** The six windows: where (house coordinates) and how wrong they start. */
const WINDOWS: Array<{ shape: Shape; x: number; y: number; wrong: number }> = [
  { shape: 'triangle', x: 70, y: 200, wrong: 180 },
  { shape: 'circle', x: 210, y: 200, wrong: 35 },
  { shape: 'triangle', x: 350, y: 200, wrong: 160 },
  { shape: 'square', x: 70, y: 330, wrong: 45 },
  { shape: 'triangle', x: 210, y: 330, wrong: 200 },
  { shape: 'square', x: 350, y: 330, wrong: -40 },
];

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'On the upside-down house, every window wobbled. They were all the wrong way up!' },
    shapesBeth: { who: 'beth', text: 'What shapes are they? That one’s a circle. Those are triangles and squares!' },
    shapesJoe: { who: 'joe', text: 'What shapes are they? That one’s a circle. Those are triangles and squares!' },
    more: { who: 'hero', text: 'Three triangles and two squares. There are more triangles!' },
    fix: { who: 'narrator', text: '{name} turned every window the right way up. Click, click, click!' },
    nextBeth: { who: 'beth', text: 'A wobbly window, just for you! Look up. People are walking on the ceiling!' },
    nextJoe: { who: 'joe', text: 'A wobbly window, just for you! Look up. People are walking on the ceiling!' },
  },

  async play(k) {
    // Beth hosts; if he climbs with Beth, Joe hosts instead.
    const hostId = k.hero === 'beth' ? 'joe' : 'beth';
    const H = hostId === 'beth' ? { shapes: 'shapesBeth', next: 'nextBeth' } as const : { shapes: 'shapesJoe', next: 'nextJoe' } as const;

    k.landScene();
    k.music('dreamy');
    k.ambient('dust', { count: 12 });

    const houseEl = k.add(house(), { ...HOUSE, z: 5 });
    k.set(houseEl, { transformOrigin: `${POINT[0] - HOUSE.x}px ${POINT[1] - HOUSE.y}px` });
    const s = HOUSE.w / 520;
    const wins = WINDOWS.map((w, i) => {
      // Inside the house's own box, so they rock with it.
      const el = k.add(windowArt(w.shape, i), { x: w.x * s, y: w.y * s, w: WIN, z: 6 });
      houseEl.append(el);
      k.set(el, { rotation: w.wrong });
      return el;
    });
    const host = k.character(hostId, { x: 30, y: 400, w: 240, z: 12 });
    const hero = k.character('hero', { x: 910, y: 400, w: 240, z: 12 });
    k.set([host, hero], { opacity: 0 });

    /** Rocks the whole house (its windows ride along inside it) on its point, ending upright. */
    const rock = async (deg: number, times: number, each = 0.5) => {
      for (let i = 0; i < times; i++) await k.to(houseEl, each, { rotation: i % 2 ? -deg : deg, ease: 'sine.inOut' });
      await k.to(houseEl, each / 2, { rotation: 0, ease: 'sine.out' });
    };

    // ---- The wobbly house.
    const arrive = async () => {
      k.fx.patter(4);
      await k.all(k.enter(host, 'left', 0.6), k.enter(hero, 'right', 0.6));
      creak(1.6);
      await rock(3, 3, 0.5);
    };
    await k.all(k.say('intro'), arrive());

    // ---- Name the shapes: each kind jiggles in turn.
    const naming = async () => {
      await k.wait(1300);
      for (const kind of ['circle', 'triangle', 'square'] as Shape[]) {
        jiggle();
        const these = wins.filter((_, i) => WINDOWS[i].shape === kind);
        await k.all(...these.map((w) => k.pop(w, 1.25)));
        await k.wait(kind === 'circle' ? 900 : 500);
      }
    };
    await k.all(k.say(H.shapes, host), naming());

    // ---- Count them: three triangles, two squares.
    const cardT = k.add(card('3', C.lemonade), { x: 70, y: 124, w: 120, z: 20 });
    const cardS = k.add(card('2', C.cream), { x: 214, y: 140, w: 104, z: 20 });
    const iconT = k.add(windowArt('triangle', 9), { x: 95, y: 240, w: 70, z: 20 });
    const iconS = k.add(windowArt('square', 9), { x: 231, y: 240, w: 70, z: 20 });
    const tagMore = k.add(card('more', C.lemonade, 36, 150, 66), { x: 55, y: 314, w: 150, z: 21 });
    k.set([cardT, cardS, iconT, iconS, tagMore], { opacity: 0 });
    const counting = async () => {
      let n = 0;
      for (const kind of ['triangle', 'square'] as Shape[]) {
        for (const [i, w] of wins.entries()) {
          if (WINDOWS[i].shape !== kind) continue;
          tick(n++);
          await k.pop(w, 1.2);
          await k.wait(120);
        }
        if (kind === 'triangle') await k.all(k.appear(cardT, 0.3), k.appear(iconT, 0.3));
        else await k.all(k.appear(cardS, 0.3), k.appear(iconS, 0.3));
      }
      k.fx.twinkle();
      await k.all(k.to(cardT, 0.35, { scale: 1.2, ease: 'back.out(2)' }), k.appear(tagMore, 0.35));
    };
    await k.all(k.say('more', hero), counting());

    // ---- Click, click, click: every window the right way up, and the house settles.
    const fixing = async () => {
      await k.wait(500);
      for (const [i, w] of wins.entries()) {
        click(i);
        await k.to(w, 0.25, { rotation: 0, ease: 'back.out(2.4)' });
        k.sparkle(HOUSE.x + parseFloat(w.style.left) + WIN / 2, HOUSE.y + parseFloat(w.style.top) + WIN / 2, 5, 50);
        await k.wait(90);
      }
      k.sfx.success();
    };
    void k.vanish(tagMore);
    void k.fade(cardT, 0, 0.3);
    void k.fade(cardS, 0, 0.3);
    void k.fade(iconT, 0, 0.3);
    void k.fade(iconS, 0, 0.3);
    await k.all(k.say('fix'), fixing(), k.hop(hero, 30, 1));

    // ---- A window to keep; and people up on the ceiling.
    const keep = k.keepsake(k.chapter!.keepsake, { x: 870, y: 250, w: 150, z: 22 });
    k.set(keep, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(keep, 0.4);
    k.sparkle(945, 320, 12);
    k.float(keep, 8, 1.8);
    // Two little upside-down walkers far off along the hanging grass.
    const walkers = [0, 1].map((i) => k.add(walker(i), { x: 1180 + i * 70, y: 88, w: 50, z: 4 }));
    void k.to(walkers, 4, { x: -700, ease: 'none' });
    await k.all(k.say(H.next, host), k.to(host, 0.4, { rotation: -6, ease: 'power2.out' }));
    await k.wait(500);
  },
});

/** A tiny figure walking upside down along the grass that hangs from the sky. */
function walker(i: number): string {
  const c = i ? C.purple : C.blue;
  return svg({ w: 40, h: 80, name: `l2c5-walker-${i}`, boil: false }, [
    piece(rect(12, 0, 6, 26), C.plum, { edge: 'cut', fibre: false }),
    piece(rect(22, 0, 6, 26), C.plum, { edge: 'cut', fibre: false }),
    piece(rect(8, 24, 24, 30, 6), c, { edge: 'cut', fibre: false }),
    piece(circle(20, 64, 12), C.skin, { edge: 'cut', fibre: false }),
  ]);
}
