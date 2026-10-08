/**
 * Land 10, chapter 8 (the game's climax): The Last Snap.
 *
 * Plays straight after the last finale: he has broken her rules, opened
 * every cage and snapped her rulers. Five scenes:
 *
 *   1. Her classroom at the very top of the prison. Clack, clack, CLACK:
 *      Dame Snap sweeps in and chalks the hardest sum in the world, one "no
 *      child could EVER do": 47 + 38. Silky whispers "Tens first", and the
 *      working goes up on the board in coloured chalk (40 + 30 = 70,
 *      7 + 8 = 15, 70 + 15 = 85). The ? turns into a golden 85.
 *   2. The last snap. She brings her ruler down so hard it breaks in two,
 *      stumbles back, back, back… into her own detention cupboard. The door
 *      swings shut and the lock clicks. She bangs and shouts (cross, not
 *      hurt), and the ground begins to rumble.
 *   3. Outside, on the cloud. The Folk hurry out and down the ladder, one
 *      after another, Silky last. The prison rises away into the night
 *      with her still shouting inside, smaller and smaller, gone.
 *   4. Home in Moon-Face's room. Moon-Face says she isn't hurt, just very
 *      cross and very far away. He gives Silky back her dewdrop (kept safe
 *      since land 7), Silky hugs him, and a golden crown and the last seal.
 *   5. Dusk at the top of the tree: balloons and bunting settle into the
 *      cloud. The Land of Birthdays is back, for a party (the ending film).
 *
 * The scary rules (PLAN §2): she looms, shrieks and snaps her own ruler, and
 * nobody touches anyone. She steps back into the cupboard by herself, and
 * the story says plainly that she isn't hurt. The camera goes back to the
 * heroes after every push-in on her.
 *
 * All the art here (the cupboard, the ladder in the cloud, the dewdrop) is
 * drawn in this file, so the story stands on its own.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree } from '../art/scenery';
import { bell, C, circle, curve, defineStory, ellipse, noiseBurst, NOTE, now, piece, raw, rect, rng, svg, tone, type Kit, type Node } from './kit';
import { at, together, wave } from './bits';
import { chalkText, slate, snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** A key turning in a lock: two small metal clicks. */
function click(): void {
  const t = now();
  for (const dt of [0, 0.12]) {
    noiseBurst(t + dt, { freq: 3800, q: 6, peak: 0.09, decay: 0.03 });
    tone(1900, t + dt, { wave: 'triangle', peak: 0.04, attack: 0.002, decay: 0.04 });
  }
}

/** Muffled banging from inside a cupboard: soft, low thumps. */
function thumps(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    tone(85, t + i * 0.22, { peak: 0.14, attack: 0.004, decay: 0.14, glideTo: 60 });
    noiseBurst(t + i * 0.22, { freq: 300, type: 'lowpass', peak: 0.08, decay: 0.1 });
  }
}

/** A land lifting away: a deep rumble and a long whoosh, then a little falling tune. */
function landLeaves(): void {
  const t = now();
  noiseBurst(t, { freq: 260, type: 'lowpass', peak: 0.16, attack: 0.4, decay: 2.2 });
  noiseBurst(t + 0.6, { freq: 2400, q: 0.7, peak: 0.07, attack: 0.3, decay: 1.6, sweepTo: 500 });
  [NOTE.G5, NOTE.E5, NOTE.C5].forEach((f, i) => bell(f, t + 1.4 + i * 0.16, 0.05, 0.8));
}

/** A land arriving in the cloud: a soft rising shimmer. */
function landArrives(): void {
  const t = now();
  noiseBurst(t, { freq: 600, q: 0.7, peak: 0.07, attack: 0.3, decay: 0.6, sweepTo: 3000 });
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => bell(f, t + 0.2 + i * 0.1, 0.06, 0.9));
}

/** The working-out going right: three rising chimes. */
function chime(i: number): void {
  bell([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6][i % 4], now(), 0.07, 0.9);
}

// --------------------------------------------------------------------- art

/** Andika lettering. */
const text = (x: number, y: number, s: string, size: number, fill: string): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="middle">${s}</text>`);

const CUP = { x: 980, y: 210, w: 180, h: 360 };

/** Her detention cupboard (180 × 360): a tall dark cupboard with DETENTION on a card above. */
function cupboard(): string {
  return svg({ w: 180, h: 360, name: 'l10c8-cupboard', boil: false }, [
    piece(rect(0, 30, 180, 330, 6), C.brownDark, { rough: 1 }),
    piece(rect(14, 44, 152, 304, 4), C.snapInk, { edge: 'cut', fibre: false }),
    piece(rect(8, 4, 164, 40, 4), C.chalk, { rough: 0.6 }),
    text(90, 33, 'DETENTION', 25, C.ruler),
  ]);
}

/** The cupboard's door (152 × 304), hinged on its right edge. */
function cupboardDoor(): string {
  return svg({ w: 152, h: 304, name: 'l10c8-cupdoor', boil: false }, [
    piece(rect(0, 0, 152, 304, 4), C.brown, { edge: 'cut' }),
    piece(rect(16, 18, 120, 118, 4), C.brownDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(rect(16, 162, 120, 120, 4), C.brownDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(circle(22, 150, 7), C.brass, { edge: 'cut' }),
  ]);
}

/** A little iron lock for the cupboard door (60 × 70). */
function lockArt(): string {
  return svg({ w: 60, h: 70, name: 'l10c8-lock', boil: false }, [
    piece(curve([[16, 34], [16, 14], [30, 6], [44, 14], [44, 34], [38, 34], [38, 16], [30, 12], [22, 16], [22, 34]], 1), C.ironLight, { edge: 'cut' }),
    piece(rect(6, 30, 48, 36, 6), C.iron, { edge: 'cut' }),
    piece(circle(30, 46, 5), C.goldLight, { edge: 'cut', fibre: false }),
  ]);
}

/** Silky's dewdrop: a glowing drop of fairy light (60 × 80). */
function dewdrop(): string {
  return svg({ w: 60, h: 80, name: 'l10c8-dew', boil: false }, [
    piece(curve([[30, 4], [50, 40], [48, 62], [30, 74], [12, 62], [10, 40]], 2), C.dew, { edge: 'cut' }),
    piece(curve([[30, 18], [42, 44], [40, 58], [30, 64], [20, 58], [18, 44]], 2), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(ellipse(22, 46, 4, 8, -20), C.white, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** Night over the cloud, with the moon: the sky the prison sails away into. */
function nightSky(): string {
  const r = rng(1010);
  const stars: Node[] = [];
  for (let i = 0; i < 40; i++) stars.push(piece(circle(r() * 1180, r() * 420, 1.5 + r() * 2), i % 3 ? C.cream : C.goldLight, { edge: 'clean', fibre: false, shadow: false, opacity: 0.5 + r() * 0.4 }));
  return svg({ w: 1180, h: 820, name: 'l10c8-night', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 320), C.prisonNight, { edge: 'clean', shadow: false }),
    piece(rect(-20, 240, 1220, 260), '#2a2744', { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 440, 1220, 420), '#3d3a5c', { rough: 2, shadow: false, fibre: false }),
    ...stars,
    piece(circle(1010, 120, 70), C.moonPale, { edge: 'cut', fibre: false, shadow: false, opacity: 0.25 }),
    piece(circle(1010, 120, 48), C.moonPale, { edge: 'cut' }),
    piece(circle(994, 108, 8), '#d6d2b8', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(1024, 132, 6), '#d6d2b8', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The top of the ladder poking up out of the cloud, the rails running down out of sight (220 × 520). */
function ladderArt(): string {
  return svg({ w: 220, h: 520, name: 'l10c8-ladder', boil: false }, [
    piece(rect(48, 0, 14, 520, 4), C.wood, { edge: 'cut' }),
    piece(rect(158, 0, 14, 520, 4), C.wood, { edge: 'cut' }),
    ...[30, 90, 150, 210, 270, 330, 390, 450].map((y) => piece(rect(60, y, 100, 10, 3), C.tan, { edge: 'cut', fibre: false })),
  ]);
}

/** A soft bank of night cloud to hide the bottom of the ladder (1300 × 260). */
function cloudFront(seed: number, color: string, shade: string): string {
  const r = rng(seed);
  const puffs: Node[] = [];
  for (let i = 0; i < 12; i++) puffs.push(piece(circle(20 + i * 112, 90 + r() * 20, 70 + r() * 20), shade, { shadow: false }));
  for (let i = 0; i < 13; i++) puffs.push(piece(circle(i * 104, 140 + (i % 2) * 14, 76 + r() * 18), color, { shadow: i % 3 === 0 }));
  puffs.push(piece(rect(-20, 170, 1340, 120), color, { edge: 'torn', shadow: false }));
  return svg({ w: 1300, h: 260, name: `l10c8-cloud${seed}`, boil: false }, puffs);
}

// -------------------------------------------------------------------- moves

/** Leans two actors in towards each other (a hug), then back. */
async function hug(k: Kit, a: HTMLElement, b: HTMLElement, seconds = 1.6): Promise<void> {
  await k.all(k.to(a, 0.4, { rotation: 7, x: '+=16' }), k.to(b, 0.4, { rotation: -9, x: '-=16' }));
  await k.wait(seconds * 1000);
  await k.all(k.to(a, 0.4, { rotation: 0, x: '-=16' }), k.to(b, 0.4, { rotation: 0, x: '+=16' }));
}

// -------------------------------------------------------------------- story

const BOARD = { x: 230, y: 64, w: 520, h: 330 };

export default defineStory({
  lines: {
    clack: { who: 'narrator', text: 'Clack. Clack. CLACK. Dame Snap swept into her classroom, at the very top of her prison.' },
    never: { who: 'dameSnap', text: 'So! You broke my rules. You opened my cages. But you will NEVER do THIS!' },
    hardest: { who: 'dameSnap', text: 'The hardest sum in the world. No child could EVER do it!' },
    tens: { who: 'silky', text: 'Tens first, {name}. Then the ones. You can do it!' },
    working: { who: 'narrator', text: 'Forty and thirty make seventy. Seven and eight make fifteen. Seventy and fifteen make… eighty-five!' },
    no: { who: 'dameSnap', text: 'Eighty-five? That is… RIGHT? No. No! NOOO!' },
    snap: { who: 'narrator', text: 'She brought her ruler down so hard that it snapped clean in two. SNAP!' },
    back: { who: 'narrator', text: 'Back she stumbled, back, back… right into her own detention cupboard. Click!' },
    out: { who: 'dameSnap', text: 'Let me OUT! I am in DETENTION! In my OWN cupboard!' },
    quick: { who: 'moonface', text: 'Her land is moving on! Quick, everybody, down the ladder!' },
    down: { who: 'narrator', text: 'Out they all ran, and down the ladder, one after another. Silky came last.' },
    away: { who: 'narrator', text: 'Away sailed her prison into the night, with Dame Snap shut inside. Far, far away.' },
    cross: { who: 'moonface', text: 'Don’t worry. She isn’t hurt. Just very cross, and very far away!' },
    dewdrop: { who: 'silky', text: 'My dewdrop! You kept it safe. And you kept counting, just like I asked.' },
    thanks: { who: 'silky', text: 'Thank you, {name}. You saved us all.' },
    crown: { who: 'narrator', text: 'A golden crown for the bravest climber, and the very last seal!' },
    party: { who: 'moonface', text: 'And now, after all that, do you know what we need? A PARTY!' },
    look: { who: 'hero', text: 'Look! Balloons and bunting in the cloud. The Land of Birthdays is back!' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: the hardest sum
    k.landScene(10);
    k.dim(0.3, '#0b0a14');
    k.music('spooky');
    k.light(470, 230, 300, { color: '#c9d6c2', strength: 0.18 });
    const board = k.add(slate(BOARD.w, BOARD.h, 'last'), { ...BOARD, z: 8 });
    const cup = k.add(cupboard(), { ...CUP, z: 8 });
    const door = k.add(cupboardDoor(), { x: CUP.x + 14, y: CUP.y + 44, w: 152, h: 304, z: 16 });
    k.set(door, { scaleX: 0.06, transformOrigin: '100% 50%' });
    const mf = k.character('moonface', { x: 0, y: 400, w: 200, z: 18 });
    const hero = k.character('hero', { x: 150, y: 430, w: 220, z: 20 });
    const silky = k.character('silky', { x: 20, y: 190, w: 180, z: 22 });
    k.float(silky, 8, 2.2);
    const snap = k.snap('loom', { x: 720, y: 220, w: 300, z: 12 });
    k.set(snap, { transformOrigin: '50% 100%' });
    k.set([board, cup], { opacity: 0.95 });

    // Clack… clack… CLACK. She sweeps in from the right.
    k.set(snap, { x: 520 });
    const told = k.say('clack');
    for (let i = 0; i < 3; i++) {
      snapSound.heels(1, 0.3, 0.5 + i * 0.25);
      await k.to(snap, 0.6, { x: 520 - ((i + 1) * 520) / 3, ease: 'power1.out' });
    }
    await told;
    void k.all(k.shake(hero, 4, 2), k.shake(mf, 4, 2));
    // A push in on her, then back to the heroes.
    k.pose(snap, 'point');
    snapSound.ruler();
    await k.camera({ zoom: 1.3, x: 820, y: 360 }, 0.7);
    await k.say('never', snap);
    await k.camera({}, 0.6);

    // The hardest sum, chalked up with a squeak.
    const sum = k.add(chalkText('47 + 38 =', { w: 340, size: 64 }), { x: BOARD.x + 40, y: BOARD.y + 24, w: 340, z: 9 });
    const q = k.add(chalkText('?', { w: 100, size: 64 }), { x: BOARD.x + 360, y: BOARD.y + 24, w: 100, z: 9 });
    k.set([sum, q], { opacity: 0 });
    snapSound.chalk(0.6);
    await k.fade(sum, 1, 0.6);
    snapSound.chalk(0.3);
    await k.fade(q, 1, 0.3);
    k.pose(snap, 'loom');
    await k.say('hardest', snap);

    // Silky whispers the trick, and the working goes up in coloured chalk.
    await k.all(k.say('tens', silky), k.hop(hero, 20));
    const steps: [string, string][] = [['40 + 30 = 70', '#bfe3f0'], ['7 + 8 = 15', C.sherbet], ['70 + 15 = 85', C.goldLight]];
    const working = k.say('working');
    for (const [i, [s, col]] of steps.entries()) {
      const el = k.add(chalkText(s, { w: 360, size: 46, color: col }), { x: BOARD.x + 80, y: BOARD.y + 108 + i * 64, w: 360, z: 9 });
      k.set(el, { opacity: 0 });
      snapSound.chalk(0.35);
      await k.fade(el, 1, 0.4);
      chime(i);
      await k.wait(1500);
    }
    await working;
    // The ? becomes a golden 85.
    const ans = k.add(chalkText('85', { w: 100, size: 64, color: C.goldLight }), { x: BOARD.x + 360, y: BOARD.y + 24, w: 100, z: 9 });
    k.set(ans, { opacity: 0 });
    void k.fade(q, 0, 0.25);
    await k.fade(ans, 1, 0.3);
    k.sfx.success();
    k.sparkle(BOARD.x + 410, BOARD.y + 64, 16, 140);
    void k.pop(ans, 1.3);
    await k.all(k.hop(hero, 36, 2), k.wait(150).then(() => k.hop(mf, 28, 2)));

    // ------------------------------------------- scene 2: the last snap
    k.pose(snap, 'shriek');
    k.sfx.ominous();
    void k.quake(4);
    await k.all(k.say('no', snap), k.shake(snap, 6, 3));
    // Her ruler comes down… and breaks.
    k.pose(snap, 'stomp');
    k.fx.stomp(2, 0.3);
    await k.to(snap, 0.25, { y: -20, ease: 'power2.out' });
    await k.to(snap, 0.12, { y: 0, ease: 'power3.in' });
    snapSound.ruler();
    snapSound.crack();
    k.pose(snap, 'defeated');
    void k.quake(6);
    k.puff(870, 470, 140, C.chalk);
    await k.say('snap');

    // She stumbles back, step by step, into her own cupboard.
    const told2 = k.say('back');
    k.fx.patter(5, 0.18);
    for (let i = 0; i < 3; i++) {
      await k.to(snap, 0.35, { x: `+=${70 + i * 10}`, rotation: i % 2 ? -5 : 5, ease: 'power1.out' });
      await k.wait(120);
    }
    k.fx.creak();
    await k.to(snap, 0.5, { x: CUP.x + 90 - (720 + 150), y: -20, scale: 0.75, rotation: 0, ease: 'power1.in' });
    await k.to(door, 0.4, { scaleX: 1, ease: 'power2.in' });
    k.fx.thud();
    void k.quake(4);
    k.set(snap, { opacity: 0 });
    const lock = k.add(lockArt(), { x: CUP.x + 20, y: CUP.y + 170, w: 54, z: 18 });
    k.set(lock, { opacity: 0 });
    click();
    await k.appear(lock, 0.3);
    await told2;
    // Bang, bang, bang: cross, not hurt.
    thumps(4);
    void k.shake(door, 3, 3);
    void k.shake(cup, 2, 3);
    await k.say('out');
    await k.all(k.hop(hero, 30), k.wait(120).then(() => k.hop(mf, 24)));
    // The ground begins to rumble.
    k.fx.rumble(2.5);
    void k.quake(5);
    await k.all(k.say('quick', mf), wave(k, mf, 'armL', 2));

    // ------------------------------------------- scene 3: down the ladder
    let land!: HTMLElement;
    let ladder!: HTMLElement;
    const LADDER = { x: 820, y: 330 };
    await k.cut(() => {
      k.backdrop(nightSky());
      k.music('adventure');
      k.ambient('stars', { count: 16, area: [0, 0, 1180, 300], z: 3 });
      land = k.landFar(10, { x: 40, y: 150, w: 720, z: 6 });
      ladder = k.add(ladderArt(), { x: LADDER.x, y: LADDER.y, w: 220, z: 8, still: true });
      k.add(cloudFront(3, '#8e8a9e', '#5f5b72'), { x: -60, y: 600, w: 1300, z: 30, still: true });
    });
    // The Folk hurry out, one after another, and down the ladder.
    const folk = ['washalot', 'watzisname', 'pixie', 'saucepan', 'moonface', 'hero'];
    const climbers = folk.map((id) => k.character(id, { x: 400, y: 230, w: 120, z: 20 }));
    k.set(climbers, { opacity: 0 });
    const down = async (el: HTMLElement): Promise<void> => {
      k.set(el, { opacity: 1, scale: 0.6 });
      k.fx.patter(3, 0.1);
      // Across the land's edge to the top of the ladder, then down into the cloud.
      await k.all(k.to(el, 0.7, { x: LADDER.x + 50 - 400, scale: 1, ease: 'power1.inOut' }), k.to(el, 0.35, { y: 40, ease: 'power1.out' }).then(() => k.to(el, 0.35, { y: 110, ease: 'power1.in' })));
      await k.to(el, 0.9, { y: 560, ease: 'power1.in' });
    };
    const telling = k.say('down');
    await k.all(...climbers.map((el, i) => k.wait(i * 650).then(() => down(el))));
    await telling;
    // Silky last: she looks back once, then flutters down after them.
    const s3 = k.character('silky', { x: 400, y: 200, w: 140, z: 22 });
    k.set(s3, { opacity: 0, scale: 0.6 });
    k.fx.twinkle();
    await k.all(k.fade(s3, 1, 0.4), k.to(s3, 1, { x: LADDER.x + 40 - 400, y: 60, scale: 1, ease: 'sine.inOut' }));
    k.face(s3, true);
    await k.wait(500);
    k.face(s3, false);
    await k.to(s3, 1, { y: 560, ease: 'sine.in' });

    // The prison lifts away with her inside, shouting.
    landLeaves();
    void k.quake(3);
    const going = k.to(land, 6, { y: -520, x: -120, scale: 0.6, ease: 'power1.in' });
    thumps(3);
    await k.wait(600);
    await k.say('out');
    void k.fade(ladder, 0.85, 1);
    await k.say('away');
    await going;
    k.sparkle(590, 140, 14, 220);
    k.fx.twinkle();
    await k.wait(600);

    // ------------------------------------------- scene 4: home
    let h4!: HTMLElement;
    let s4!: HTMLElement;
    let m4!: HTMLElement;
    let sauce!: HTMLElement;
    let back!: HTMLElement[];
    await k.cut(() => {
      k.backdrop(moonRoom('l10c8-room'));
      k.music('cosy');
      k.light(590, 236, 230, { color: '#fff3c0', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      back = [
        k.character('washalot', { x: 70, y: 300, w: 170, z: 14 }),
        k.character('pixie', { x: 230, y: 296, w: 160, z: 14 }),
        k.character('watzisname', { x: 860, y: 300, w: 170, z: 14, flip: true }),
      ];
      sauce = k.character('saucepan', { x: 60, y: 380, w: 230, z: 20 });
      h4 = k.character('hero', { x: 380, y: 380, w: 230, z: 21 });
      s4 = k.character('silky', { x: 610, y: 360, w: 220, z: 20 });
      m4 = k.character('moonface', { x: 860, y: 380, w: 240, z: 20, flip: true });
    });
    k.fx.boing();
    await k.all(...[...back, sauce, h4, s4, m4].map((el, i) => k.wait(i * 70).then(() => k.hop(el, 20))));
    await k.say('cross', m4);
    void k.all(...back.map((el) => k.hop(el, 16)));

    // The dewdrop goes home to Silky.
    const [hx, hy] = at(h4);
    const dew = k.add(dewdrop(), { x: hx + 160, y: hy + 160, w: 50, z: 26 });
    const dewGlow = k.light(hx + 185, hy + 195, 70, { color: C.dew, strength: 0.5, z: 25 });
    k.set([dew, dewGlow], { opacity: 0 });
    k.sfx.sparkle();
    await k.all(k.appear(dew, 0.4), k.fade(dewGlow, 0.5, 0.4));
    await k.all(k.to([dew, dewGlow], 1.1, { x: 120, y: -80, ease: 'sine.inOut' }));
    k.fx.twinkle();
    k.sparkle(hx + 305, hy + 120, 16, 160);
    void k.vanish(dew, 0.3);
    void k.fade(dewGlow, 0, 0.8);
    const glow = k.light(720, 470, 160, { color: C.goldLight, strength: 0.35, z: 18 });
    await k.say('dewdrop', s4);
    // Silky's hug.
    k.fx.jingle();
    await k.all(k.say('thanks', s4), hug(k, h4, s4, 1.6));
    void k.fade(glow, 0, 1);

    // A crown drops onto his head, and the last seal.
    const crown = k.keepsake('crown', { x: 435, y: 300, w: 120, z: 30 });
    const seal = k.add(landSeal(10), { x: 480, y: 50, w: 200, z: 30 });
    k.set([crown, seal], { opacity: 0 });
    k.set(crown, { y: -400, opacity: 1 });
    k.fx.whizz();
    await k.to(crown, 0.7, { y: 0, ease: 'bounce.out' });
    k.sparkle(495, 330, 14, 140);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.float(seal, 6, 2);
    snapSound.clank(3);
    await k.all(k.say('crown'), k.hop(sauce, 24, 2), k.wait(200).then(() => k.hop(m4, 24, 2)));
    await k.all(k.say('party', m4), k.hop(m4, 40), wave(k, m4, 'armL', 2));
    k.sfx.fanfare();
    await together(k, [...back, sauce, h4, crown, s4, m4], 0.25, { y: '-=30' });
    await together(k, [...back, sauce, h4, crown, s4, m4], 0.25, { y: '+=30' });

    // ------------------------------------------- scene 5: the party is coming
    let h5!: HTMLElement;
    let m5!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l10c8-tree', { landN: 5 }));
      k.dim(0.1, '#2a2236');
      k.ambient('fireflies', { count: 12, area: [0, 300, 1180, 400] });
      for (const [x, y, rr] of [[560, 640, 46], [650, 470, 40], [610, 300, 40], [596, 224, 80]]) k.light(x, y, rr, { strength: 0.5, flicker: true });
      h5 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      m5 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
    });
    k.music('triumph');
    landArrives();
    k.sparkle(590, 80, 18, 260);
    await k.say('look', h5);
    void k.all(k.fade(h5, 0, 1), k.fade(m5, 0, 1.2));
    await k.camera({ zoom: 1.8, x: 590, y: 110 }, 3);
    k.fx.twinkle();
    k.confetti(30);
    k.sparkle(590, 110, 18, 240);
    await k.wait(2400);
  },
});
