/**
 * The ending film: The Biggest Birthday.
 *
 * Plays once, straight after The Last Snap (and is kept in Moon-Face's
 * Treasure Room afterwards). About two minutes, six scenes, and it rhymes
 * with the opening film all the way through:
 *
 *   1. The Enchanted Wood, one summer evening. This time the children bring
 *      Mum and Dad. The trees whisper "wisha-wisha" again, and an invitation
 *      floats down on a balloon: a party at the top of the Faraway Tree.
 *   2. The climb. The whole family goes up the trunk, past Dame Washalot's
 *      tub and the Angry Pixie's window (he waves this time, no slamming),
 *      and into the cloud, where the Land of Birthdays is waiting.
 *   3. The party. Everyone they ever met: the Folk, the Topsy-Turvy Man, the
 *      Jelly Goblin, Giant Rumbletum peering in, the Enchanter, Captain Tin
 *      and Mr Snowman. A treasure from each of the ten lands hangs over the
 *      cake and they count them, one to ten. The Saucepan Man mishears
 *      "toast" (as he once heard "glue"), then Moon-Face's toast for {name}.
 *   4. The slippery-slip. Round and round the trunk on cushions, all the way
 *      down. Dad wants another go.
 *   5. Fireworks over the tree: soft, slow blooms of paper stars, never a
 *      flash. Mum says it's long past tea time (she said "be back in time
 *      for tea" on moving day).
 *   6. The tree at dusk, every little window lit, the trees whispering.
 *      Moon-Face beams down from the cloud, as he did at the end of the
 *      opening, and says goodnight. The End.
 *
 * No menace at all: the first story in the game where nobody is in danger.
 * Fireworks are slow fades and grow from nothing; in calm mode they simply
 * hang still in the sky. The invitation, fireworks, cushions and the end
 * card are drawn here.
 */
import { AVATARS } from '../core/curriculum';
import { cushionNodes, CUSHIONS, tree } from '../art/scenery';
import { bell, C, circle, defineStory, ink, noiseBurst, NOTE, now, piece, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';
import { at, flump, roundTag, tick, together, wave } from './bits';
import { snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** The trees whispering: soft breathy swells, "wisha… wisha… wisha". */
function wisha(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    noiseBurst(t + i * 0.62, { freq: 2200, q: 0.8, peak: 0.05, attack: 0.22, decay: 0.38, sweepTo: 900 });
    tone(330 + i * 20, t + i * 0.62, { peak: 0.016, attack: 0.25, decay: 0.4, vibrato: [5, 6] });
  }
}

/** Someone whizzing down the slippery-slip: a long sliding whistle. */
function whee(): void {
  const t = now();
  tone(900, t, { peak: 0.04, attack: 0.05, decay: 1.4, glideTo: 380, vibrato: [6, 12] });
  noiseBurst(t, { freq: 1600, q: 0.8, peak: 0.03, attack: 0.1, decay: 1.2, sweepTo: 600 });
}

/** A firework, gently: a soft whoosh up, then a muffled pop and a shimmer of little bells. */
function firework(i: number): void {
  const t = now();
  noiseBurst(t, { freq: 1400, q: 1, peak: 0.03, attack: 0.3, decay: 0.5, sweepTo: 3200 });
  tone(70, t + 0.9, { peak: 0.08, attack: 0.01, decay: 0.4, glideTo: 50 });
  noiseBurst(t + 0.9, { freq: 500, type: 'lowpass', peak: 0.06, decay: 0.3 });
  const notes = [NOTE.C6, NOTE.E5, NOTE.G5, NOTE.A5];
  for (let j = 0; j < 4; j++) bell(notes[(i + j) % 4], t + 1 + j * 0.09, 0.025, 1.2);
}

/** The giant's friendly boom (a deep, round "HELLO"). */
function boom(): void {
  const t = now();
  tone(70, t, { peak: 0.18, attack: 0.02, decay: 0.6, glideTo: 55 });
  noiseBurst(t, { freq: 200, type: 'lowpass', peak: 0.1, decay: 0.4 });
}

// --------------------------------------------------------------------- art

const text = (x: number, y: number, s: string, size: number, fill: string): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="middle">${s}</text>`);

/** Moon-Face's invitation: a card tied to a red balloon (200 × 300). */
function invitation(): string {
  return svg({ w: 200, h: 300, name: 'ending-invite', boil: false }, [
    ink([[100, 120], [96, 160], [104, 190]], { width: 2, color: C.ink, opacity: 0.7 }),
    piece(circle(100, 64, 52), C.balloon),
    piece(circle(82, 46, 10), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(rect(20, 186, 160, 108, 6), C.cream, { rough: 0.8 }),
    piece(rect(30, 196, 140, 88, 4), C.cream, { edge: 'cut', fibre: false, shadow: false }),
    ink([[30, 196], [170, 196], [170, 284], [30, 284], [30, 196]], { width: 2.5, color: C.gold, opacity: 0.9 }),
    text(100, 240, 'Party!', 38, C.raspberryDark),
    text(100, 270, 'Love, M-F', 18, C.ink),
  ]);
}

/** A cushion to ride the slippery-slip on (100 × 50). */
function cushion(color: string): string {
  return svg({ w: 100, h: 50, name: 'ending-cushion-' + color, boil: false }, cushionNodes(50, 26, 90, 40, color));
}

/** A firework: rings of paper stars bursting outwards (300 × 300). */
function burst(seed: number, colors: [string, string]): string {
  const r = rng(seed);
  const nodes: Node[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rr = 120 + r() * 14;
    const x = 150 + Math.cos(a) * rr;
    const y = 150 + Math.sin(a) * rr;
    nodes.push(ink([[150 + Math.cos(a) * rr * 0.55, 150 + Math.sin(a) * rr * 0.55], [x, y]], { width: 3, color: colors[0], opacity: 0.55 }));
    nodes.push(piece(circle(x, y, 7), colors[0], { edge: 'cut', fibre: false, shadow: false }));
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    nodes.push(piece(circle(150 + Math.cos(a) * 66, 150 + Math.sin(a) * 66, 5.5), colors[1], { edge: 'cut', fibre: false, shadow: false }));
  }
  nodes.push(piece(circle(150, 150, 9), colors[1], { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 300, h: 300, name: `ending-burst-${seed}`, boil: false }, nodes);
}

/** "The End", lettered on a torn cream card (520 × 200). */
function endCard(): string {
  return svg({ w: 520, h: 200, name: 'ending-card', boil: false }, [
    piece(rect(10, 10, 500, 180, 14), C.cream, { rough: 1.2 }),
    ink([[70, 150], [450, 150]], { width: 3, color: C.gold, opacity: 0.8, wobble: 1.5 }),
    text(260, 122, 'The End', 92, C.plum),
  ]);
}

// -------------------------------------------------------------------- moves

/** Moves an actor (by its centre) to an absolute stage point. */
function goTo(k: Kit, el: HTMLElement, x: number, y: number, seconds: number, ease = 'sine.inOut'): Promise<void> {
  const w = el.offsetWidth || parseFloat(el.style.width) || 0;
  const hh = el.offsetHeight || parseFloat(el.style.height) || 0;
  return k.to(el, seconds, { x: x - w / 2 - (parseFloat(el.style.left) || 0), y: y - hh / 2 - (parseFloat(el.style.top) || 0), ease });
}

/** Climbs an actor through a list of points (scrambling: a little wobble on each leg). */
async function climbPath(k: Kit, el: HTMLElement, pts: Pt[], each: number): Promise<void> {
  for (const [i, [x, y]] of pts.entries()) {
    await k.all(goTo(k, el, x, y, each), k.to(el, each / 2, { rotation: i % 2 ? -6 : 6 }).then(() => k.to(el, each / 2, { rotation: 0 })));
  }
}

/**
 * The slippery-slip on the map tree, as stage points: each run of the chute
 * you can see (going behind the trunk between them), down to the cushions.
 */
const SLIDE_RUNS: Pt[][] = [
  [[600, 214], [530, 258], [680, 322]],
  [[500, 412], [706, 482]],
  [[470, 574], [752, 642]],
  [[525, 700], [400, 766], [330, 776]],
];

/** One rider down the slippery-slip: visible on each run, hidden while it goes round the back. */
async function slide(k: Kit, rider: HTMLElement): Promise<void> {
  const place = (p: Pt) => goTo(k, rider, p[0], p[1] - 34, 0.01, 'none');
  await place(SLIDE_RUNS[0][0]);
  await k.fade(rider, 1, 0.2);
  whee();
  for (const [r, run] of SLIDE_RUNS.entries()) {
    if (r > 0) {
      // Round the back of the trunk, and out the other side.
      await k.fade(rider, 0, 0.12);
      await k.wait(250);
      await place(run[0]);
      await k.fade(rider, 1, 0.12);
    }
    for (const p of run.slice(1)) await k.all(goTo(k, rider, p[0], p[1] - 34, 0.55, 'power1.in'), k.to(rider, 0.55, { rotation: p[0] > at(rider)[0] ? 8 : -8 }));
  }
  await k.to(rider, 0.2, { rotation: 0 });
  flump();
}

/** Lets off one firework at (x, y): a spark climbs, then a burst blooms slowly and fades. */
async function letOff(k: Kit, x: number, y: number, i: number): Promise<void> {
  const colors: [string, string][] = [[C.goldLight, C.raspberry], [C.mint, C.goldLight], [C.sherbet, C.lilac], [C.candle, C.sky]];
  const b = k.add(burst(i, colors[i % colors.length]), { x: x - 120, y: y - 120, w: 240, z: 6 });
  if (k.calm) {
    // Calm mode: no movement, just the blooms hanging quietly in the sky.
    k.set(b, { opacity: 0.6 });
    return;
  }
  firework(i);
  const spark = k.add(svg({ w: 12, h: 12, name: 'ending-spark', boil: false }, [piece(circle(6, 6, 5), C.candle, { edge: 'cut', fibre: false, shadow: false })]), { x: x - 6, y: 560, w: 12, z: 6 });
  k.set(b, { opacity: 0, scale: 0.15 });
  await k.to(spark, 0.9, { y: y - 560, ease: 'power2.out' });
  k.remove(spark);
  void k.to(b, 2.2, { scale: 1, ease: 'power2.out' });
  await k.to(b, 0.7, { opacity: 0.85, ease: 'sine.out' });
  await k.to(b, 1.8, { opacity: 0, y: 24, ease: 'sine.in' });
  k.remove(b);
}

// -------------------------------------------------------------------- the family

/** The whole family: Mum, Dad, and the three children, the chosen one in the middle. */
function family(k: Kit, xs: number[], y: number, w: number, z = 20): HTMLElement[] {
  const [a, b] = AVATARS.filter((x) => x !== k.hero);
  return ['mum', a, 'hero', b, 'dad'].map((id, i) => k.character(id, { x: xs[i], y: y + (id === 'mum' || id === 'dad' ? -18 : 0), w: id === 'mum' || id === 'dad' ? w * 1.1 : w, z: z + (id === 'hero' ? 2 : 0) }));
}

// -------------------------------------------------------------------- story

const KEEPSAKES = ['moonLamp', 'spinningTop', 'goblinSpoon', 'snappedRuler', 'birthdayBadge', 'giantTeacup', 'silkyRibbon', 'trainTicket', 'snowGlobe', 'crown'];

export default defineStory({
  lines: {
    evening: { who: 'narrator', text: 'One summer evening, you all took Mum and Dad into the Enchanted Wood at last.' },
    wisha: { who: 'hero', text: 'Listen! The trees are whispering again. Wisha-wisha-wisha!' },
    invite: { who: 'mum', text: 'A card, on a balloon! “Come to a party at the top of the Faraway Tree.”' },
    dad: { who: 'dad', text: 'A party? Up a tree? Well, I never! Come on, then!' },
    climb: { who: 'narrator', text: 'Up they all went: past Dame Washalot’s tub, past the Pixie’s window, and into the cloud.' },
    pixie: { who: 'pixie', text: 'Hello, hello! Peep in my window all you like today. Hee hee!' },
    waiting: { who: 'narrator', text: 'And there, in the Land of Birthdays, everyone they had ever met was waiting.' },
    giant: { who: 'giant', text: 'HAPPY PARTY, little ones! Oops. Was that too loud?' },
    treasure: { who: 'moonface', text: 'Look up! A treasure from every land you visited. Let’s count them!' },
    ten: { who: 'narrator', text: 'Ten lands, and ten treasures. What an adventure!' },
    toast: { who: 'moonface', text: 'Now, everybody. Time for a toast!' },
    butter: { who: 'saucepan', text: 'TOAST? Lovely! I’ll have mine with butter, please!' },
    cheers: { who: 'moonface', text: 'Not THAT toast! To {name}, who climbed all the way to the top!' },
    hooray: { who: 'oomboom', text: 'Oom boom boom! Hip, hip, HOORAY!' },
    slip: { who: 'moonface', text: 'And now, the best bit. The slippery-slip, all the way home!' },
    again: { who: 'dad', text: 'Wheeee! That was brilliant! Again! Again!' },
    fireworks: { who: 'narrator', text: 'Then the fireworks began: soft and slow, like flowers opening in the sky.' },
    tea: { who: 'mum', text: 'Goodness me. It’s long past tea time! Home we go.' },
    windows: { who: 'narrator', text: 'And high in the Faraway Tree, the little windows glowed all through the night.' },
    night: { who: 'moonface', text: 'Goodnight, {name}. Thank you for climbing with us. Come back soon!' },
  },

  async play(k) {
    let scene = 0;
    const next = async (build: () => void): Promise<void> => {
      await k.cut(() => {
        scene++;
        build();
      });
    };

    // ================================================ 1. The wood, with Mum and Dad
    k.landScene(1);
    k.music('cosy');
    k.dim(0.12, '#4a2a10');
    k.light(590, 300, 420, { color: C.duskSky, strength: 0.3 });
    k.ambient('dust', { count: 22, area: [200, 0, 800, 600] });
    const fam = family(k, [560, 300, 420, 180, 700], 380, 200);
    k.set(fam, { opacity: 0 });
    await k.all(...fam.map((el, i) => k.wait(i * 160).then(() => k.enter(el, 'left', 1.1))));
    await k.say('evening');
    // The old trees whisper, just as they did on the very first day.
    wisha(3);
    const whL = k.light(110, 360, 100, { color: '#f4efc0', strength: 0, z: 11 });
    const whR = k.light(1070, 330, 100, { color: '#f4efc0', strength: 0, z: 11 });
    void k.all(k.fade(whL, 0.5, 0.8), k.fade(whR, 0.5, 0.8)).then(() => k.all(k.fade(whL, 0, 1), k.fade(whR, 0, 1)));
    void k.hop(fam[2], 24);
    await k.say('wisha', fam[2]);
    // Down floats the invitation, to Mum.
    const card = k.add(invitation(), { x: 520, y: 40, w: 150, z: 30 });
    k.set(card, { y: -360, rotation: -8 });
    k.fx.twinkle();
    await k.to(card, 2.4, { y: 0, rotation: 6, ease: 'sine.out' });
    k.float(card, 6, 2);
    void k.all(...fam.map((el, i) => k.wait(i * 80).then(() => k.hop(el, 20))));
    await k.say('invite', fam[0]);
    k.fx.boing();
    await k.all(k.say('dad', fam[4]), k.hop(fam[4], 30, 2));
    k.fx.patter(8, 0.12);
    await k.all(...fam.map((el, i) => k.wait(i * 100).then(() => k.walk(el, 1300, 1.6, 4))), k.to(card, 1.2, { x: 800, y: -100, ease: 'power1.in' }));

    // ================================================ 2. The climb
    let climbers!: HTMLElement[];
    let tub!: HTMLElement;
    let pixie!: HTMLElement;
    let top!: HTMLElement;
    await next(() => {
      k.backdrop(tree('ending-climb', { landN: 5 }));
      k.music('adventure');
      k.ambient('fireflies', { count: 14, area: [0, 260, 1180, 520] });
      for (const [x, y, rr] of [[560, 640, 46], [650, 470, 40], [610, 300, 40], [596, 224, 80]]) k.light(x, y, rr, { strength: 0.45, flicker: true });
      tub = k.character('washalot', { x: 760, y: 470, w: 90, z: 12 });
      pixie = k.character('pixie', { x: 470, y: 440, w: 70, z: 12 });
      top = k.character('moonface', { x: 556, y: 120, w: 80, z: 12 });
      k.set([tub, pixie, top], { opacity: 0 });
      climbers = family(k, [520, 580, 620, 660, 700], 650, 70, 30);
      if (!k.calm) k.set(k.root, { x: 590 - 600 * 1.8, y: Math.max(820 - 820 * 1.8, 410 - 700 * 1.8), scale: 1.8, transformOrigin: '0 0' });
    });
    // Up the trunk, past the Folk at their windows, the camera climbing with them.
    const path: Pt[] = [[700, 640], [640, 560], [580, 470], [640, 380], [560, 300], [470, 250], [420, 150]];
    const telling = k.say('climb');
    void (async () => {
      await k.camera({ zoom: 1.6, x: 640, y: 560 }, 2.4);
      await k.camera({ zoom: 1.5, x: 560, y: 360 }, 3);
      await k.camera({}, 2);
    })();
    void (async () => {
      await k.wait(1200);
      k.sfx.sparkle();
      await k.appear(tub, 0.4);
      void wave(k, tub, 'armL', 3);
      await k.wait(1100);
      await k.appear(pixie, 0.4);
      void wave(k, pixie, 'armR', 3);
    })();
    k.fx.patter(14, 0.25);
    await k.all(...climbers.map((el, i) => k.wait(i * 380).then(() => climbPath(k, el, path, 0.85))));
    await telling;
    await k.say('pixie', pixie);
    // Moon-Face beams down from the cloud, as on the very first day.
    k.fx.jingle();
    await k.appear(top, 0.5);
    k.sparkle(596, 160, 14, 160);
    await k.all(k.hop(top, 16, 2), ...climbers.map((el) => k.fade(el, 0, 0.6)));

    // ================================================ 3. The party
    let guests!: HTMLElement[];
    let giant!: HTMLElement;
    let party!: HTMLElement[];
    let mf!: HTMLElement;
    let sauce!: HTMLElement;
    let oom!: HTMLElement;
    let silky!: HTMLElement;
    await next(() => {
      k.landScene(5);
      k.music('triumph');
      giant = k.character('giant', { x: 860, y: -20, w: 420, z: 4, flip: true });
      k.set(giant, { x: 460 });
      guests = [
        k.character('topsy', { x: -10, y: 290, w: 130, z: 10 }),
        k.character('jellyGoblin', { x: 100, y: 290, w: 130, z: 10 }),
        k.character('enchanter', { x: 210, y: 280, w: 140, z: 10 }),
        k.character('toySoldier', { x: 830, y: 290, w: 130, z: 10, flip: true }),
        k.character('snowman', { x: 940, y: 290, w: 130, z: 10 }),
        k.character('washalot', { x: 60, y: 370, w: 150, z: 14 }),
        k.character('watzisname', { x: 230, y: 380, w: 150, z: 14 }),
        k.character('pixie', { x: 790, y: 380, w: 140, z: 14 }),
      ];
      oom = k.character('oomboom', { x: 940, y: 370, w: 160, z: 14, flip: true });
      silky = k.character('silky', { x: 1020, y: 180, w: 150, z: 16 });
      party = family(k, [-10, 160, 330, 500, 670], 480, 170, 20);
      sauce = k.character('saucepan', { x: 830, y: 470, w: 180, z: 21 });
      mf = k.character('moonface', { x: 990, y: 470, w: 190, z: 21, flip: true });
      k.set([...guests, oom, silky], { opacity: 0 });
    });
    k.sfx.fanfare();
    await k.say('waiting');
    // The guests pop up one by one, from every land.
    for (const [i, el] of [...guests, oom, silky].entries()) {
      k.fx.pop();
      void k.appear(el, 0.35);
      k.sparkle(parseFloat(el.style.left) + 70, parseFloat(el.style.top) + 60, 6, 70);
      await k.wait(i < 5 ? 260 : 200);
    }
    k.float(silky, 8, 2.2);
    // Giant Rumbletum peers in from the side.
    boom();
    void k.quake(3);
    await k.to(giant, 1.2, { x: 0, ease: 'power2.out' });
    await k.say('giant', giant);
    void k.all(...party.map((el, i) => k.wait(i * 60).then(() => k.hop(el, 18))));

    // A treasure from every land, hung over the party: count them, one to ten.
    await k.say('treasure', mf);
    for (const [i, id] of KEEPSAKES.entries()) {
      const x = 40 + i * 110;
      const y = 22 + Math.abs(i - 4.5) * 8;
      const ks = k.keepsake(id, { x, y, w: 96, z: 30 });
      const tag = k.add(roundTag(i + 1, C.cream, `ending-tag-${i}`), { x: x + 28, y: y + 88, w: 40, z: 31 });
      k.set([ks, tag], { opacity: 0 });
      tick(i);
      void k.appear(ks, 0.3);
      void k.appear(tag, 0.3);
      await k.wait(420);
    }
    k.sparkle(590, 80, 18, 300);
    await k.say('ten');

    // The toast, and the Saucepan Man's mishearing.
    await k.say('toast', mf);
    snapSound.clank(4);
    void k.to(k.part(sauce, 'armR'), 0.3, { rotation: -14 });
    await k.all(k.say('butter', sauce), k.hop(sauce, 20, 2));
    void k.to(k.part(sauce, 'armR'), 0.3, { rotation: 0 });
    k.fx.boing();
    await k.all(...[...party, ...guests].map((el, i) => k.wait((i % 6) * 60).then(() => k.shake(el, 3, 1))));
    await k.all(k.say('cheers', mf), wave(k, mf, 'armL', 2));
    k.fx.drumroll(1);
    await k.wait(900);
    k.sfx.triumph();
    k.confetti(40);
    await k.all(
      k.say('hooray', oom),
      ...[...party, sauce, mf, ...guests, oom].map((el, i) => k.wait((i % 7) * 80).then(() => k.hop(el, 30, 2))),
    );
    await k.wait(400);

    // ================================================ 4. The slippery-slip
    let riders!: HTMLElement[];
    await next(() => {
      k.backdrop(tree('ending-slip', { landN: 5 }));
      k.music('adventure');
      k.dim(0.08, '#2a2236');
      const ids = ['moonface', 'hero', ...AVATARS.filter((x) => x !== k.hero), 'mum', 'dad'];
      riders = ids.map((id, i) => {
        const ride = k.add(svg({ w: 90, h: 100, name: 'ending-ride', boil: false }, []), { x: 0, y: 0, w: 90, h: 100, z: 20 + i });
        const c = k.add(cushion(CUSHIONS[i % CUSHIONS.length]), { x: 0, y: 64, w: 90, h: 45, z: 2 });
        const who = k.character(id, { x: 8, y: 0, w: 74, z: 1 });
        ride.append(who, c);
        k.set(ride, { opacity: 0 });
        return ride;
      });
      k.light(596, 224, 80, { strength: 0.45, flicker: true });
    });
    await k.say('slip', undefined);
    await k.all(...riders.map((r, i) => k.wait(i * 1100).then(() => slide(k, r))));
    // A heap at the bottom, and Dad wants another go.
    const dad = riders[riders.length - 1];
    await k.all(k.say('again', dad), k.hop(dad, 30, 2));

    // ================================================ 5. Fireworks
    let fam5!: HTMLElement[];
    let mf5!: HTMLElement;
    await next(() => {
      k.backdrop(tree('ending-fireworks', { landN: 5 }));
      k.music('dreamy');
      k.dim(0.45, '#0b1030');
      k.ambient('stars', { count: 24, area: [0, 0, 1180, 260], z: 3 });
      for (const [x, y, rr] of [[560, 640, 46], [650, 470, 40], [610, 300, 40], [596, 224, 80]]) k.light(x, y, rr, { strength: 0.5 });
      fam5 = family(k, [30, 170, 300, 800, 940], 560, 150, 40);
      mf5 = k.character('moonface', { x: 556, y: 120, w: 80, z: 12 });
    });
    const spots: Pt[] = [[220, 150], [930, 130], [400, 90], [1050, 250], [130, 260], [780, 70]];
    const shows = k.say('fireworks');
    for (const [i, [x, y]] of spots.entries()) {
      void letOff(k, x, y, i);
      await k.wait(k.calm ? 300 : 1300);
    }
    await shows;
    void wave(k, mf5, 'armL', 2);
    await k.wait(1400);
    await k.say('tea', fam5[0]);
    k.fx.patter(8, 0.14);
    await k.all(...fam5.map((el, i) => k.wait(i * 90).then(() => k.walk(el, -1300, 2, 5))));

    // ================================================ 6. Goodnight
    let mf6!: HTMLElement;
    await next(() => {
      k.backdrop(tree('ending-night'));
      k.music('dreamy');
      k.dim(0.22, '#0b1030');
      k.ambient('fireflies', { count: 18, area: [0, 260, 1180, 520] });
      k.ambient('stars', { count: 20, area: [0, 0, 1180, 140], z: 4 });
      for (const [x, y, rr] of [[560, 640, 46], [650, 470, 40], [610, 300, 40], [548, 520, 70], [640, 386, 64], [596, 224, 90]]) k.light(x, y, rr, { strength: 0.55, flicker: true });
      mf6 = k.character('moonface', { x: 511, y: 150, w: 170, z: 11 });
      k.set(mf6, { y: 130, opacity: 0 });
    });
    wisha(3);
    await k.say('windows');
    // Up comes Moon-Face over the cloud, beaming.
    k.set(mf6, { opacity: 1 });
    await k.camera({ zoom: 1.5, x: 596, y: 260 }, 2);
    k.sfx.sparkle();
    await k.to(mf6, 1, { y: 0, ease: 'back.out(1.4)' });
    k.light(600, 215, 130, { color: '#fff3c0', strength: 0.35, z: 10 });
    void k.blink(mf6);
    await k.all(k.say('night', mf6), wave(k, mf6, 'armL', 2));
    wisha(2);
    await k.camera({}, 2.4);
    // The End, softly.
    const veil = k.dim(0, '#0b1030');
    veil.style.zIndex = '60';
    const end = k.add(endCard(), { x: 330, y: 300, w: 520, z: 70, still: true });
    k.set(end, { opacity: 0 });
    bell(NOTE.C5, now(), 0.05, 2);
    bell(NOTE.G5, now() + 0.3, 0.04, 2);
    await k.all(k.fade(veil, 0.55, 1.6), k.fade(end, 1, 1.6));
    await together(k, [end], 1.2, { y: -6 });
    await k.wait(2200);
  },
});
