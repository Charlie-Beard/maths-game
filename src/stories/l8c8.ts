/**
 * Land 8, chapter 8 (the land's finale): The Toy Train Home.
 *
 * Plays straight after the escape game. Everyone is still missing Silky,
 * but the toys see them safely home. Five scenes:
 *
 *   1. The Land of Toys is winding down like a clockwork toy: everything
 *      slows, and Captain Tin's key turns slower and slower. All aboard the
 *      toy train! Three tickets at five pence each: five, ten, fifteen.
 *   2. The ride: the toy town streams past, the soldiers on the fort wall
 *      stand in two rows of five (ten!), Mr Oom Boom Boom drums in the
 *      wagon. Then the engine runs down… so they wind her up, counting the
 *      turns in twos, and off she chuffs again.
 *   3. The edge of the land and the top of the ladder: everybody off and
 *      down, and the Land of Toys rises away with Captain Tin saluting.
 *   4. Home in Moon-Face's room: the ticket and the seal. Silky's dewdrop
 *      (land 7's finale) glows: every right answer makes it shine a little
 *      more.
 *   5. Dusk at the top of the tree: snow, and a clock tower settling into
 *      the cloud. Mr Oom Boom Boom's clue (chapter 4): her land comes back
 *      when it's coldest, after the snow. So: a plan.
 */
import { keepsakeArt, landSeal } from '../art/keepsakes';
import { moonRoom, tree, TREE_SPOTS } from '../art/scenery';
import { band, bell, C, circle, curve, defineStory, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { blackSheet, flump, numberTag, roundTag, together, wave } from './bits';

// ------------------------------------------------------------------ sounds

/** A clockwork toy running down: ticks that slow, and a whirr sinking lower. */
function windDown(seconds = 2.4): void {
  const t = now();
  tone(420, t, { wave: 'triangle', peak: 0.05, attack: 0.05, decay: seconds, glideTo: 90, vibrato: [9, 10], lowpass: 1400 });
  let at = 0;
  for (let i = 0; i < 9; i++) {
    noiseBurst(t + at, { freq: 3400, q: 6, peak: 0.06, decay: 0.03 });
    at += 0.12 + i * 0.04;
  }
}

/** Winding a key: one ratchet click. */
function ratchet(): void {
  const t = now();
  for (let i = 0; i < 3; i++) noiseBurst(t + i * 0.05, { freq: 3000 + i * 300, q: 5, peak: 0.07, decay: 0.025 });
}

/** The toy train going: soft chuffs, `times` of them. */
function chuff(times = 8, gap = 0.3): void {
  const t = now();
  for (let i = 0; i < times; i++) noiseBurst(t + i * gap, { freq: 900, q: 0.8, peak: i % 2 ? 0.05 : 0.08, attack: 0.01, decay: 0.16, sweepTo: 500 });
}

/** The train's whistle: a toot-toot. */
function toot(): void {
  const t = now();
  for (const d of [0, 0.45]) {
    tone(NOTE.E5, t + d, { wave: 'sine', peak: 0.07, attack: 0.03, decay: 0.34, vibrato: [7, 6] });
    tone(NOTE.G5, t + d, { wave: 'sine', peak: 0.05, attack: 0.03, decay: 0.34, vibrato: [7, 6] });
  }
}

/** Mr Oom Boom Boom's drum: boom, boom. */
function boom(times = 2): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    tone(110, t + i * 0.35, { peak: 0.2, attack: 0.005, decay: 0.35, glideTo: 60 });
    noiseBurst(t + i * 0.35, { freq: 300, type: 'lowpass', peak: 0.1, decay: 0.15 });
  }
}

/** Coins dropped in a hand: a little chink. */
function chink(): void {
  bell(NOTE.E6 * 1.04, now(), 0.05, 0.4);
}

/** A clock tower far off, striking: slow, soft bells. */
function chime(): void {
  const t = now();
  [NOTE.E5, NOTE.C5, NOTE.D5, NOTE.G4].forEach((f, i) => bell(f, t + i * 0.5, 0.06, 1.8));
}

// --------------------------------------------------------------------- art

/**
 * The toy train with open wagons (1100 × 320): the engine on the right with
 * an open cab, a big gold wind-up key on top (part `key`), and every wheel
 * a part `wheel` that turns about its own hub. Whoever rides is placed
 * behind it, so their heads and shoulders show above the sides.
 */
function trainArt(): string {
  const wheel = (x: number, r: number): Node =>
    group({ part: 'wheel', origin: [x, 290] }, [
      piece(circle(x, 290, r), C.ink, { edge: 'cut' }),
      piece(circle(x, 290, r * 0.45), C.toyYellow, { edge: 'cut', fibre: false, shadow: false }),
      ink([[x - r * 0.8, 290], [x + r * 0.8, 290]], { width: 4, color: C.toyYellow }),
    ]);
  const wagon = (x: number, color: string): Node[] => [
    piece(rect(x, 190, 300, 92, 8), color, { rough: 0.6 }),
    piece(rect(x - 6, 182, 312, 14, 4), C.ink, { edge: 'cut' }),
    piece(rect(x + 20, 214, 260, 10, 3), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    ...[60, 150, 240].map((dx) => piece(circle(x + dx, 254, 12), C.cream, { edge: 'cut', fibre: false })),
    wheel(x + 60, 26),
    wheel(x + 240, 26),
  ];
  return svg({ w: 1100, h: 320, name: 'l8c8-train', label: 'the toy train' }, [
    // Couplings between the wagons.
    piece(rect(330, 254, 90, 10), C.ink, { edge: 'cut', fibre: false }),
    piece(rect(690, 254, 90, 10), C.ink, { edge: 'cut', fibre: false }),
    ...wagon(40, C.toyYellow),
    ...wagon(400, C.toyBlue),
    // The engine: the boiler, the chimney and the open cab.
    piece(rect(900, 170, 170, 112, 30), C.toyGreen, { rough: 0.6 }),
    piece(rect(1010, 96, 40, 80, 6), C.ink, { edge: 'cut' }),
    piece(rect(1000, 86, 60, 18, 6), C.toyRed, { edge: 'cut' }),
    piece(ellipse(950, 168, 24, 14), C.gold, { edge: 'cut' }),
    piece(poly([[1070, 250], [1096, 290], [1070, 290]]), C.toyYellow, { edge: 'cut' }),
    piece(rect(760, 160, 150, 122, 6), C.toyRed, { rough: 0.6 }),
    piece(rect(752, 150, 166, 16, 4), C.ink, { edge: 'cut' }),
    piece(rect(780, 196, 110, 12, 3), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    wheel(800, 30),
    wheel(900, 24),
    wheel(1010, 24),
    // The wind-up key, standing up from the boiler.
    group({ part: 'key', origin: [930, 130] }, [
      piece(rect(924, 100, 12, 70), C.goldLight, { edge: 'cut' }),
      piece(ellipse(906, 90, 24, 16, -10), C.gold, { edge: 'cut' }),
      piece(ellipse(954, 90, 24, 16, 10), C.gold, { edge: 'cut' }),
      piece(circle(930, 96, 9), C.goldLight, { edge: 'cut', fibre: false }),
    ]),
  ]);
}

const TOWN_W = 3800;

/** A toy block house, in strip coordinates. */
function blockHouse(x: number, base: number, w: number, wall: string, roof: string): Node[] {
  const h = w * 0.9;
  return [
    piece(rect(x, base - h, w, h, 4), wall, { rough: 0.6 }),
    piece(poly([[x - 10, base - h + 4], [x + w / 2, base - h - w * 0.55], [x + w + 10, base - h + 4]]), roof, { rough: 0.6 }),
    piece(rect(x + w * 0.38, base - h * 0.5, w * 0.24, h * 0.5, w * 0.12), C.ink, { edge: 'cut' }),
    piece(rect(x + w * 0.12, base - h * 0.82, w * 0.2, w * 0.2, 3), C.cream, { edge: 'cut', fibre: false }),
    piece(rect(x + w * 0.68, base - h * 0.82, w * 0.2, w * 0.2, 3), C.cream, { edge: 'cut', fibre: false }),
  ];
}

/** A painted wooden block with a shape on it. */
function block(x: number, base: number, s: number, color: string, seed: number): Node[] {
  const mark = [C.cream, C.toyYellow, C.white][seed % 3];
  return [piece(rect(x, base - s, s, s, 4), color, { rough: 0.5 }), piece(circle(x + s / 2, base - s / 2, s * 0.24), mark, { edge: 'cut', fibre: false })];
}

/** Where the fort wall stands in the strip (the soldiers line up on it). */
const FORT = { x: 1500, w: 520, top: 330 };

/**
 * The toy town going past the train window (TOWN_W × 820): striped
 * nursery wallpaper, block houses and stacks of blocks, a long fort wall
 * with battlements, the floor and the wooden track.
 */
function townStrip(): string {
  const r = rng(808);
  const nodes: Node[] = [piece(rect(-20, -20, TOWN_W + 40, 620), '#cfe2ef', { edge: 'clean', shadow: false })];
  for (let x = 0; x < TOWN_W; x += 90) nodes.push(piece(rect(x, -20, 40, 600), '#d9e8f1', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
  for (let i = 0; i < 6; i++) nodes.push(piece(ellipse(300 + i * 640, 110 + (i % 2) * 40, 120, 34), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.9 }));
  nodes.push(piece(rect(-20, 520, TOWN_W + 40, 60), C.cream, { rough: 0.8 }));
  nodes.push(piece(rect(-20, 570, TOWN_W + 40, 280), C.tan, { rough: 1 }));
  for (let y = 600; y < 840; y += 46) nodes.push(ink([[-10, y], [TOWN_W + 10, y + 2]], { width: 2.5, color: C.brownDark, opacity: 0.3 }));
  const cols: [string, string][] = [
    [C.toyRed, C.toyBlue],
    [C.toyYellow, C.toyRed],
    [C.toyGreen, C.toyYellow],
    [C.toyBlue, C.toyGreen],
  ];
  for (let i = 0; i < 14; i++) {
    const x = 60 + i * 270 + r() * 60;
    if (x > FORT.x - 160 && x < FORT.x + FORT.w + 40) continue;
    if (i % 3 === 2) {
      nodes.push(...block(x, 560, 80, cols[i % 4][0], i), ...block(x + 84, 560, 80, cols[(i + 1) % 4][0], i + 1), ...block(x + 42, 480, 80, cols[(i + 2) % 4][0], i + 2));
    } else {
      const [wall, roof] = cols[i % 4];
      nodes.push(...blockHouse(x, 560, 110 + r() * 40, wall, roof));
    }
  }
  // The fort wall, with battlements, for the soldiers to stand on.
  nodes.push(piece(rect(FORT.x, FORT.top, FORT.w, 230), C.toyBlue, { rough: 0.6 }));
  for (let i = 0; i < 9; i++) nodes.push(piece(rect(FORT.x + i * 60, FORT.top - 34, 36, 40), C.toyBlue, { edge: 'cut' }));
  nodes.push(piece(rect(FORT.x + 220, FORT.top + 120, 80, 110, 40), C.ink, { edge: 'cut' }));
  nodes.push(piece(rect(FORT.x + 258, FORT.top - 150, 5, 120), C.ink, { edge: 'clean', shadow: false }));
  nodes.push(piece(poly([[FORT.x + 263, FORT.top - 150], [FORT.x + 320, FORT.top - 134], [FORT.x + 263, FORT.top - 118]]), C.toyRed, { edge: 'cut' }));
  // The track.
  for (let x = -20; x < TOWN_W; x += 40) nodes.push(piece(rect(x, 672, 26, 26, 2), C.wood, { edge: 'cut', shadow: false }));
  nodes.push(piece(rect(-20, 676, TOWN_W + 40, 6), C.greyDark, { edge: 'cut', fibre: false }));
  nodes.push(piece(rect(-20, 690, TOWN_W + 40, 6), C.greyDark, { edge: 'cut', fibre: false }));
  return svg({ w: TOWN_W, h: 820, name: 'l8c8-town', boil: false }, nodes);
}

/** The sky beyond the edge of the land: warm toy-box dusk over the cloud. */
function edgeSky(): string {
  return svg({ w: 1180, h: 820, name: 'l8c8-sky', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#f2d2b8', { edge: 'clean', shadow: false }),
    piece(rect(-20, 280, 1220, 300), '#e8b48c', { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 520, 1220, 340), C.duskSky, { edge: 'torn', shadow: false, fibre: false }),
    ...[[200, 120], [700, 80], [1000, 200]].map(([x, y]) => piece(ellipse(x, y, 120, 26), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.8 })),
  ]);
}

/** The edge of the Land of Toys: the nursery floor stopping in mid-air, a tower of blocks on it. */
function landEdge(): string {
  const boards: Node[] = [];
  for (let y = 620; y < 900; y += 46) boards.push(ink([[-30, y], [700 - (y - 600) * 0.2, y]], { width: 2.5, color: C.brownDark, opacity: 0.35 }));
  const pts: Pt[] = [[-40, 590], [740, 590], [760, 640], [730, 720], [700, 800], [640, 900], [-40, 900]];
  return svg({ w: 800, h: 900, name: 'l8c8-edge', boil: false }, [
    piece(rect(-40, 520, 840, 80), C.cream, { rough: 0.8 }),
    ...block(80, 520, 110, C.toyRed, 0),
    ...block(200, 520, 110, C.toyYellow, 1),
    ...block(140, 410, 110, C.toyGreen, 2),
    piece(curve(pts, 1), C.tan, { rough: 1.2 }),
    ...boards,
    ...[[760, 760], [730, 820], [700, 870]].map(([x, y], i) => piece(rect(x, y, 14 - i * 3, 14 - i * 3, 2), C.wood, { edge: 'cut' })),
  ]);
}

/** The top of the ladder, coming up through the cloud (600 × 400). */
function ladderTop(): string {
  return svg({ w: 600, h: 400, name: 'l8c8-ladder', boil: false }, [
    piece(band([[190, 420], [196, 40]], 12), C.wood, { edge: 'cut' }),
    piece(band([[300, 420], [294, 40]], 12), C.wood, { edge: 'cut' }),
    ...[80, 140, 200, 260].map((y) => piece(rect(196, y, 98, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(30 + i * 110, 300 + (i % 2) * 30, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}

/** Silky's dewdrop (60 × 80), still glowing (it fell from her lantern in land 7). */
function dewdrop(): string {
  return svg({ w: 60, h: 80, name: 'l8c8-dew', boil: false, label: 'Silky’s dewdrop' }, [
    piece(curve([[30, 6], [40, 30], [50, 50], [44, 70], [30, 76], [16, 70], [10, 50], [20, 30]], 2), C.dew, { edge: 'cut' }),
    piece(ellipse(24, 52, 7, 12, 20), C.white, { edge: 'clean', fibre: false, shadow: false, opacity: 0.8 }),
  ]);
}

// -------------------------------------------------------------------- moves

/** Everyone in the train bobs together as it chuffs along, `beats` times. */
async function rattle(k: Kit, els: HTMLElement[], beats: number, each: number): Promise<void> {
  for (let i = 0; i < beats; i++) {
    await together(k, els, each / 2, { y: '-=5', ease: 'sine.out' });
    await together(k, els, each / 2, { y: '+=5', ease: 'sine.in' });
  }
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    slow: { who: 'moonface', text: 'Everything’s slowing down. The land is winding down… it’s about to move on!' },
    aboard: { who: 'toySoldier', text: 'All aboard the toy train! Three tickets, please! Five pence each!' },
    pay: { who: 'hero', text: 'Five, ten, fifteen pence. Three tickets! Here you are.' },
    ride: { who: 'narrator', text: 'Chuff, chuff! Past the fort, where the soldiers stood in two rows of five. Ten!' },
    rundown: { who: 'toySoldier', text: 'Oh dear, the engine’s running down! Wind her up, quick!' },
    wind: { who: 'hero', text: 'Count the turns in twos! Two, four, six, eight, ten!' },
    edge: { who: 'moonface', text: 'There’s the ladder! Everybody off, and down we go!' },
    bye: { who: 'toySoldier', text: 'Goodbye, friends! Go and find your fairy! Left, right, left, right!' },
    prize: { who: 'narrator', text: '{name} won a toy train ticket, and the seal of the Land of Toys!' },
    dewdrop: { who: 'narrator', text: 'And Silky’s dewdrop glowed. Every right answer made it shine a little more.' },
    snow: { who: 'hero', text: 'Look! Snow in the cloud. And a big clock tower.' },
    cold: { who: 'moonface', text: 'When it’s coldest, after the snow, her land comes back. Remember?' },
    plan: { who: 'oomboom', text: 'Then we need a plan to save Silky. Oom boom boom!' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: winding down
    k.landScene(8);
    k.music('cosy');
    const tin = k.character('toySoldier', { x: 20, y: 360, w: 230, z: 20 });
    const hero = k.character('hero', { x: 290, y: 380, w: 220, z: 20 });
    const mf = k.character('moonface', { x: 590, y: 370, w: 220, z: 20 });
    const oom = k.character('oomboom', { x: 880, y: 340, w: 250, z: 20, flip: true });
    k.set([tin, hero, mf, oom], { opacity: 0 });
    await k.all(k.enter(tin, 'left'), k.enter(hero, 'left'), k.enter(mf, 'right'), k.enter(oom, 'right'));

    // Running down like clockwork: Captain Tin's key turns slower and slower, and he droops.
    k.silence();
    windDown(2.6);
    const key = k.part(tin, 'key');
    const winding = (async () => {
      for (const s of [0.3, 0.45, 0.7, 1]) await k.to(key, s, { rotation: '+=180', ease: 'none' });
    })();
    await k.all(winding, k.to(tin, 2.2, { rotation: 6, ease: 'sine.out' }), k.to(oom, 2.2, { rotation: -4, ease: 'sine.out' }));
    k.music('adventure');
    k.fx.rumble(1.4);
    await k.all(k.say('slow', mf), k.shake(mf, 5, 1));
    await k.all(k.to([tin, oom], 0.3, { rotation: 0, ease: 'back.out(2)' }), k.to(key, 0.3, { rotation: '+=360' }));
    toot();
    void wave(k, tin, 'armR', 1);
    await k.say('aboard', tin);

    // Three tickets at five pence each: five, ten, fifteen.
    const coins = [0, 1, 2].map((i) => k.add(numberTag('5p', C.goldLight, `l8c8-coin-${i}`), { x: 400 + i * 140, y: 200, w: 120, z: 30 }));
    const total = k.add(numberTag('15p', C.cream, 'l8c8-total'), { x: 540, y: 90, w: 120, z: 30 });
    k.set([...coins, total], { opacity: 0 });
    const counting = (async () => {
      for (const c of coins) {
        chink();
        await k.appear(c, 0.3);
        await k.wait(500);
      }
      k.fx.pop();
      await k.appear(total, 0.35);
    })();
    await k.all(k.say('pay', hero), counting);
    const ticket = k.keepsake(k.chapter!.keepsake, { x: 520, y: 170, w: 150, z: 32 });
    k.set(ticket, { opacity: 0 });
    void Promise.all([...coins, total].map((c) => k.vanish(c, 0.3)));
    k.fx.jingle();
    await k.appear(ticket, 0.4);
    k.sparkle(595, 245, 12, 120);
    await k.all(k.hop(hero, 30, 1), k.wait(300));
    await k.to(ticket, 0.5, { x: -200, y: 160, scale: 0.3, opacity: 0, ease: 'power2.in' });

    // ------------------------------------------- scene 2: the ride
    let town!: HTMLElement;
    let train!: HTMLElement;
    let riders!: HTMLElement[];
    let h2!: HTMLElement;
    let t2!: HTMLElement;
    let o2!: HTMLElement;
    const soldiers: HTMLElement[] = [];
    const TRAIN = { x: 40, y: 380 };
    await k.cut(() => {
      town = k.add(townStrip(), { x: 0, y: 0, w: TOWN_W, h: 820, z: 2, still: true });
      // Two rows of five soldiers on the fort wall (they ride along with the town).
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 5; i++) {
          soldiers.push(k.prop('soldier', { x: FORT.x + 40 + i * 92 + row * 30, y: FORT.top - 150 + row * 74, w: 76, z: 3 + row }));
        }
      }
      const m2 = k.character('moonface', { x: TRAIN.x + 70, y: TRAIN.y + 30, w: 210, z: 20 });
      h2 = k.character('hero', { x: TRAIN.x + 400, y: TRAIN.y + 46, w: 190, z: 20 });
      o2 = k.character('oomboom', { x: TRAIN.x + 540, y: TRAIN.y + 26, w: 200, z: 19 });
      t2 = k.character('toySoldier', { x: TRAIN.x + 740, y: TRAIN.y + 6, w: 190, z: 20 });
      train = k.add(trainArt(), { x: TRAIN.x, y: TRAIN.y, w: 1100, z: 22 });
      riders = [m2, h2, o2, t2, train];
    });
    const wheels = k.pivot(k.part(train, 'wheel'));
    const tKey = k.pivot(k.part(train, 'key'));
    const movers = [town, ...soldiers];
    // The world slides by; the wheels turn as far as the train "goes".
    const go = (dx: number, s: number, ease = 'none') =>
      k.all(...movers.map((m) => k.to(m, s, { x: `-=${dx}`, ease })), k.to(wheels, s, { rotation: `+=${dx * 1.6}`, ease }));
    k.music('adventure');
    toot();
    chuff(14, 0.3);
    boom(2);
    await k.all(go(1000, 4.2, 'power1.in'), rattle(k, riders, 10, 0.4), k.wait(1500).then(() => k.say('ride')));
    // The soldiers salute as they pass.
    soldiers.forEach((s, i) => void k.wait(i * 60).then(() => k.hop(s, 14, 1)));
    boom(4);
    await k.all(go(700, 2.4), rattle(k, riders, 6, 0.4));

    // Running down: the train slows to a stop.
    windDown(2);
    await go(300, 2, 'power2.out');
    k.silence();
    void k.shake(t2, 4, 1);
    await k.say('rundown', t2);
    // Wind her up! Ten turns of the key, counted in twos.
    k.music('magic');
    const told = k.say('wind', h2);
    for (let i = 1; i <= 5; i++) {
      ratchet();
      await k.to(tKey, 0.25, { rotation: '+=180', ease: 'power1.inOut' });
      ratchet();
      await k.to(tKey, 0.25, { rotation: '+=180', ease: 'power1.inOut' });
      const tag = k.add(roundTag(i * 2, C.goldLight, `l8c8-turn-${i}`), { x: 920, y: 300, w: 90, z: 30 });
      k.set(tag, { opacity: 0 });
      void k.appear(tag, 0.25).then(() => k.wait(250)).then(() => k.to(tag, 0.4, { y: -60, opacity: 0 })).then(() => k.remove(tag));
      k.fx.pop();
    }
    await told;
    toot();
    k.music('adventure');
    chuff(10, 0.22);
    void k.hop(h2, 24, 1);
    await k.all(go(560, 2.6, 'power2.in'), rattle(k, riders, 8, 0.32));

    // ------------------------------------------- scene 3: the edge of the land
    let edge!: HTMLElement;
    let t3!: HTMLElement;
    let h3!: HTMLElement;
    let m3!: HTMLElement;
    let o3!: HTMLElement;
    const row: HTMLElement[] = [];
    await k.cut(() => {
      k.backdrop(edgeSky());
      edge = k.add(landEdge(), { x: -20, y: 0, w: 800, h: 900, z: 4, still: true });
      for (let i = 0; i < 5; i++) row.push(k.prop('soldier', { x: 20 + i * 66, y: 590, w: 80, z: 22 }));
      k.add(ladderTop(), { x: 600, y: 420, w: 600, z: 26, still: true });
      t3 = k.character('toySoldier', { x: 60, y: 330, w: 210, z: 20 });
      h3 = k.character('hero', { x: 300, y: 360, w: 200, z: 21 });
      o3 = k.character('oomboom', { x: 470, y: 330, w: 210, z: 20 });
      m3 = k.character('moonface', { x: 790, y: 320, w: 200, z: 24, flip: true });
      k.set(m3, { y: 240 });
    });
    k.fx.boing();
    await k.to(m3, 0.5, { y: 0, ease: 'back.out(1.6)' });
    k.fx.rumble(1.4);
    void k.quake(4);
    await k.all(k.say('edge', m3), wave(k, m3, 'armL', 2));
    // Down the ladder, one after another.
    k.fx.whizz();
    await k.to(m3, 0.4, { y: 300, ease: 'power2.in' });
    await k.to(h3, 0.6, { x: 340, y: -40, ease: 'power1.out' });
    await k.to(h3, 0.4, { y: 360, ease: 'power2.in' });
    boom(1);
    await k.to(o3, 0.7, { x: 260, y: -40, ease: 'power1.out' });
    await k.to(o3, 0.4, { y: 360, ease: 'power2.in' });
    // The land rises away, Captain Tin saluting and his soldiers marching.
    k.fx.rumble(3);
    const lift = [edge, t3, ...row];
    const going = k.all(...lift.map((el) => k.to(el, 6, { y: '-=780', ease: 'power1.in' })));
    void k.to(t3, 0.4, { x: 180 });
    void (async () => {
      for (let i = 0; i < 6; i++) {
        k.fx.patter(2, 0.2);
        await together(k, row, 0.25, { x: i % 2 ? '-=12' : '+=12' });
      }
    })();
    await k.say('bye', t3);
    await going;

    // ------------------------------------------- scene 4: home, with the ticket
    let h4!: HTMLElement;
    let m4!: HTMLElement;
    let o4!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l8c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      h4 = k.character('hero', { x: 110, y: 360, w: 240, z: 20 });
      o4 = k.character('oomboom', { x: 340, y: 330, w: 240, z: 19 });
      m4 = k.character('moonface', { x: 880, y: 350, w: 250, z: 20, flip: true });
    });
    k.music('cosy');
    flump();
    await together(k, [h4, o4, m4], 0.3, { y: '+=10' });
    await together(k, [h4, o4, m4], 0.3, { y: '-=10' });
    const keep = k.keepsake(k.chapter!.keepsake, { x: 560, y: 520, w: 140, z: 24 });
    const seal = k.add(landSeal(8), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    boom(2);
    await k.all(k.say('prize'), k.hop(h4, 30, 2));
    // Silky's ribbon and dewdrop, glowing a little brighter.
    const ribbon = k.add(keepsakeArt('silkyRibbon'), { x: 700, y: 530, w: 120, z: 24 });
    const dew = k.add(dewdrop(), { x: 746, y: 568, w: 28, z: 25 });
    const dewGlow = k.light(760, 588, 90, { color: C.dew, strength: 0, flicker: true, z: 23 });
    k.set([ribbon, dew], { opacity: 0 });
    k.fx.twinkle();
    await k.all(k.fade(ribbon, 1, 0.5), k.fade(dew, 1, 0.5));
    const glowing = (async () => {
      for (const s of [0.3, 0.5, 0.75]) {
        await k.fade(dewGlow, s, 0.6);
        k.sparkle(760, 580, 6, 70);
        await k.wait(500);
      }
    })();
    await k.all(k.say('dewdrop'), glowing);
    await k.wait(400);

    // ------------------------------------------- scene 5: the Land of Snow arrives
    let snowLand!: HTMLElement;
    let h5!: HTMLElement;
    let m5!: HTMLElement;
    let o5!: HTMLElement;
    const box = TREE_SPOTS.cloud;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l8c8-tree'));
      snowLand = k.landFar(9, { x: box.x, y: box.y, w: box.w, z: 4 });
      k.dim(0.25, '#2a3446');
      h5 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      o5 = k.character('oomboom', { x: 470, y: 470, w: 230, z: 40 });
      m5 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
      k.set(snowLand, { y: -220, opacity: 0 });
      k.set(o5, { opacity: 0 });
    });
    k.music('dreamy');
    k.fx.wind(3);
    k.ambient('snow', { count: 26 });
    await k.to(snowLand, 3, { y: 0, opacity: 1, ease: 'sine.out' });
    chime();
    await k.say('snow', h5);
    await k.say('cold', m5);
    await k.enter(o5, 'bottom', 0.6);
    boom(3);
    await k.say('plan', o5);
    void k.all(k.fade(h5, 0, 1.2), k.fade(o5, 0, 1.2), k.fade(m5, 0, 1.4));
    await k.camera({ zoom: 1.8, x: 590, y: 110 }, 3);
    chime();
    await k.wait(1400);
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(800);
  },
});
