/**
 * Land 6, chapter 8 (the land's finale): Hide in the Teacup!
 *
 * Plays straight after the escape. Giant Rumbletum is friendly-ish but
 * HUGE, so this one is funny-scary, and turns out kind. Five scenes:
 *
 *   1. At the foot of the giant's table: STOMP, STOMP. "WHERE have those
 *      little people gone?" Moon-Face: into the teacup! (The Saucepan Man
 *      hears "hiccup".) In they jump, and duck down out of sight.
 *   2. Close up, inside the teacup: the giant's face fills the whole sky as
 *      he peers in. He thinks they're crumbs… but no, little people! He
 *      only wanted to give them a biscuit, as big as a cartwheel, with five
 *      rows of ten chocolate chips: ten, twenty, thirty, forty, fifty (the
 *      land's counting in tens to 100). Then the ground rumbles: the land
 *      is moving on.
 *   3. Down the ladder, the giant peering over the far side of his land as
 *      it rises away, waving goodbye.
 *   4. Home in Moon-Face's room with the giant biscuit, his littlest teacup
 *      (the keepsake) and the seal.
 *   5. Dusk at the top of the tree: a tall, twisty tower in purple mist
 *      settles into the cloud (the Land of Spells). And far off in the
 *      mist, faintly: clack. Clack. Clack. Moon-Face knows those heels.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree } from '../art/scenery';
import { BRANCH, escapeBackdrop, LADDER, ladderArt } from '../scenes/finale-art';
import { C, circle, curve, defineStory, ellipse, noiseBurst, now, piece, rect, svg, tone, type Kit, type Node } from './kit';
import { at, blackSheet, flump, jump, numberTag, sting, tick, together, wave } from './bits';
import { snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** A giant's footstep: deep and slow, and it shakes everything. */
function thump(): void {
  const t = now();
  tone(48, t, { peak: 0.3, attack: 0.01, decay: 0.6, glideTo: 30 });
  noiseBurst(t, { freq: 180, type: 'lowpass', peak: 0.2, decay: 0.45 });
}

/** A giant sniff: a long, rushing breath in. */
function sniff(): void {
  const t = now();
  for (let i = 0; i < 2; i++) noiseBurst(t + i * 0.5, { freq: 700, q: 0.8, peak: 0.14, attack: 0.25, decay: 0.2, sweepTo: 1400 });
}

/** China clinking: a teacup rattling on its saucer. */
function rattle(times = 4): void {
  const t = now();
  for (let i = 0; i < times; i++) tone(2200 + (i % 2) * 300, t + i * 0.07, { peak: 0.04, attack: 0.002, decay: 0.08 });
}

/** A hand on a ladder rung: a small wooden clonk. */
function rung(i: number): void {
  tone(i % 2 ? 300 : 260, now(), { wave: 'triangle', peak: 0.08, attack: 0.003, decay: 0.08, glideTo: 180, lowpass: 1500 });
}

/** Munching a very big biscuit. */
function munch(times = 4): void {
  const t = now();
  for (let i = 0; i < times; i++) noiseBurst(t + i * 0.24, { freq: 1800, q: 1.4, peak: 0.08, decay: 0.08 });
}

/** The Land of Spells' purple mist: a soft, wavering shimmer. */
function mist(): void {
  const t = now();
  tone(220, t, { wave: 'sine', peak: 0.05, attack: 1, decay: 2.5, vibrato: [4, 6] });
  tone(330 * 1.06, t + 0.3, { wave: 'triangle', peak: 0.03, attack: 1, decay: 2.2, vibrato: [5, 8], lowpass: 1200 });
}

// --------------------------------------------------------------------- art

/**
 * The front of the giant teacup (its body, handle and band of flowers),
 * on a full 1180 × 820 sheet, matching the cup in the land's backdrop when
 * drawn with the same centre, base and size. The rim and the tea are left
 * out: anyone behind this sheet is *inside* the cup, peeping over the rim.
 */
function cupFront(name: string, cx: number, baseY: number, s: number): string {
  const rimY = baseY - 240 * s;
  const nodes: Node[] = [
    piece(ellipse(cx, baseY, 260 * s, 50 * s), C.white),
    piece(ellipse(cx, baseY - 6 * s, 190 * s, 32 * s), '#e8e2d4', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[cx - 170 * s, rimY], [cx - 160 * s, baseY - 60 * s], [cx - 90 * s, baseY - 16 * s], [cx + 90 * s, baseY - 16 * s], [cx + 160 * s, baseY - 60 * s], [cx + 170 * s, rimY]], 2), C.white, { rough: 0.8 }),
    // The front lip of the rim.
    piece(curve([[cx - 172 * s, rimY - 2 * s], [cx, rimY + 30 * s], [cx + 172 * s, rimY - 2 * s], [cx + 168 * s, rimY + 10 * s], [cx, rimY + 40 * s], [cx - 168 * s, rimY + 10 * s]], 2), '#ece6d8', { edge: 'cut', fibre: false }),
    piece(ellipse(cx + 190 * s, baseY - 150 * s, 50 * s, 66 * s), C.white),
    piece(ellipse(cx + 190 * s, baseY - 150 * s, 26 * s, 40 * s), C.giantSky, { edge: 'cut', fibre: false, shadow: false }),
    ...[-120, -60, 0, 60, 120].map((dx) => piece(circle(cx + dx * s, baseY - 150 * s + Math.abs(dx) * 0.2 * s, 16 * s), C.blue, { edge: 'cut', fibre: false })),
    ...[-120, -60, 0, 60, 120].map((dx) => piece(circle(cx + dx * s, baseY - 150 * s + Math.abs(dx) * 0.2 * s, 6 * s), C.goldLight, { edge: 'clean', shadow: false })),
    piece(rect(cx - 160 * s, baseY - 214 * s, 320 * s, 8 * s), C.blue, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
  ];
  return svg({ w: 1180, h: 820, name, boil: false }, nodes);
}

/** The inside of the cup seen close up: its back wall and a pool of tea, 1180 × 820. */
function cupInside(): string {
  return svg({ w: 1180, h: 820, name: 'l6c8-inside', boil: false }, [
    piece(ellipse(590, 580, 340, 64), '#ece6d8'),
    piece(ellipse(590, 590, 310, 48), C.toffee, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The giant's biscuit, as big as a cartwheel (360 × 360), with no chips yet. */
function biscuit(): string {
  return svg({ w: 360, h: 360, name: 'l6c8-biscuit' }, [
    piece(circle(180, 180, 172), C.caramel, { rough: 1.4 }),
    piece(circle(180, 180, 150), C.goldLight, { edge: 'torn', fibre: false, shadow: false, opacity: 0.45 }),
    ...[[90, 80], [270, 100], [60, 240], [300, 260], [180, 320]].map(([x, y]) => piece(circle(x, y, 5), C.toffee, { edge: 'cut', fibre: false, shadow: false })),
  ]);
}

/** One chocolate chip (30 × 26). */
function chip(i: number): string {
  return svg({ w: 30, h: 26, name: `l6c8-chip${i % 4}` }, [piece(curve([[4, 22], [8, 8], [15, 3], [22, 8], [26, 22]], 2), C.brownDark, { edge: 'cut' })]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    where: { who: 'giant', text: 'WHERE have those little people gone? Come out, come out!' },
    hide: { who: 'moonface', text: 'He’s ENORMOUS! Quick, {name}! Everybody into the teacup!' },
    hiccup: { who: 'saucepan', text: 'Into the HICCUP? Hic! Oh, the TEACUP. Righto!' },
    crumbs: { who: 'giant', text: 'Sniff, sniff… What’s this? Little crumbs, in my teacup?' },
    people: { who: 'giant', text: 'Oh! Not crumbs. Little people! Don’t be scared. I only wanted to give you a biscuit!' },
    chips: { who: 'hero', text: 'Look at the chocolate chips! Ten, twenty, thirty, forty, fifty!' },
    moving: { who: 'moonface', text: 'The land is moving on! Thank you, Mr Giant, but we must go!' },
    bye: { who: 'giant', text: 'Goodbye, little people! Come back for tea one day!' },
    away: { who: 'narrator', text: 'And the Land of Giants moved on, big boots, big teacups and all.' },
    munch: { who: 'moonface', text: 'Mmm! A biscuit this big will last us a hundred years!' },
    prize: { who: 'narrator', text: '{name} won the giant’s littlest teacup, and the seal of the Land of Giants!' },
    tower: { who: 'hero', text: 'Look! A tall, twisty tower, in purple mist. Is it a magic land?' },
    clack: { who: 'narrator', text: 'And somewhere far off in the mist… clack. Clack. Clack.' },
    heels: { who: 'moonface', text: 'Those heels… Oh no. I’d know that clacking anywhere.' },
  },

  async play(k: Kit) {
    // ------------------------------------------- scene 1: into the teacup
    k.landScene(6);
    k.music('sneaky');
    const hero = k.character('hero', { x: 140, y: 470, w: 170, z: 20 });
    const mf = k.character('moonface', { x: 300, y: 460, w: 170, z: 20 });
    const pan = k.character('saucepan', { x: 450, y: 470, w: 170, z: 20, flip: true });
    k.add(cupFront('l6c8-cup', 740, 760, 1), { x: 0, y: 0, w: 1180, h: 820, z: 25, still: true });
    k.set([hero, mf, pan], { opacity: 0 });
    await k.all(k.enter(hero, 'left', 0.8), k.wait(150).then(() => k.enter(mf, 'left', 0.8)), k.wait(300).then(() => k.enter(pan, 'left', 0.8)));

    // STOMP… STOMP. The giant is coming.
    const stomps = async (n: number) => {
      for (let i = 0; i < n; i++) {
        thump();
        rattle(3);
        void k.quake(8);
        await k.all(k.shake(hero, 4, 1), k.shake(mf, 4, 1), k.shake(pan, 4, 1));
        await k.wait(500);
      }
    };
    await stomps(2);
    await k.all(k.say('where'), stomps(1));
    await k.all(k.say('hide', mf), k.hop(mf, 30, 1));
    snapSound.clank(4);
    await k.all(k.say('hiccup', pan), k.hop(pan, 24, 2));
    // In they jump, one, two, three, and peep over the rim.
    k.fx.boing();
    const spots: [HTMLElement, number][] = [[hero, 590], [mf, 680], [pan, 770]];
    for (const [el, x] of spots) {
      k.fx.whizz();
      await jump(k, el, x, 440, 140, 0.6);
      flump();
    }
    rattle(4);
    // Duck down!
    await together(k, [hero, mf, pan], 0.3, { y: '+=90', ease: 'power2.in' });
    await stomps(2);

    // ------------------------------------------- scene 2: the giant peers in
    let face!: HTMLElement;
    let heads!: HTMLElement[];
    await k.cut(() => {
      k.backdrop(cupInside());
      // So big his face fills the whole sky (his portrait's edges are all off stage).
      face = k.character('giant', { x: -60, y: -380, w: 1300, z: 2 });
      heads = (['hero', 'moonface', 'saucepan'] as const).map((id, i) => k.character(id, { x: 300 + i * 200, y: 520, w: 230, z: 20, flip: i === 2 }));
      k.add(cupFront('l6c8-big', 590, 1060, 2), { x: 0, y: 0, w: 1180, h: 820, z: 25, still: true });
    });
    k.silence();
    // He sniffs… and the heads come up, very slowly, to peep.
    sniff();
    await k.say('crumbs', face);
    await k.all(...heads.map((h, i) => k.wait(i * 250).then(() => k.to(h, 0.6, { y: -90, ease: 'sine.out' }))));
    await k.all(...heads.map((h) => k.blink(h)));
    k.music('cosy');
    void k.blink(face);
    await k.say('people', face);

    // The biscuit comes down, as big as a cartwheel.
    const bis = k.add(biscuit(), { x: 410, y: 40, w: 360, z: 15 });
    k.set(bis, { y: -500 });
    k.fx.whizz();
    await k.to(bis, 0.9, { y: 0, ease: 'back.out(1.1)' });
    k.fx.thud();
    void k.all(...heads.map((h) => k.hop(h, 20, 1)));
    // Five rows of ten chocolate chips: ten, twenty, thirty, forty, fifty.
    const tag = k.add(numberTag('10', C.goldLight, 'l6c8-tag10'), { x: 800, y: 160, w: 120, z: 26 });
    k.set(tag, { opacity: 0 });
    const counting = async () => {
      for (let row = 0; row < 5; row++) {
        const y = 40 + 120 + row * 30 - 13;
        for (let i = 0; i < 10; i++) {
          const c = k.add(chip(row * 10 + i), { x: 410 + 180 - 135 + i * 27, y, w: 26, z: 16 });
          k.set(c, { opacity: 0, scale: 0.4 });
          void k.to(c, 0.18, { opacity: 1, scale: 1, ease: 'back.out(2)' });
          await k.wait(35);
        }
        tick(row * 2, 440);
        const t = k.add(numberTag(String((row + 1) * 10), C.goldLight, `l6c8-tag${row}`), { x: 800, y: 160, w: 120, z: 27 + row });
        k.set(t, { opacity: 0 });
        await k.appear(t, 0.25);
        await k.wait(420);
        if (row < 4) void k.fade(t, 0, 0.2);
      }
    };
    await k.all(k.say('chips', heads[0]), counting());
    k.sfx.sparkle();
    k.sparkle(590, 220, 14, 200);
    k.remove(tag);

    // Then the rumble: the land is moving on!
    k.fx.rumble(2.5);
    void k.quake(6);
    rattle(6);
    k.music('adventure');
    await k.all(k.say('moving', heads[1]), k.shake(bis, 4, 2));

    // ------------------------------------------- scene 3: down the ladder, waving goodbye
    let land!: HTMLElement;
    let giant3!: HTMLElement;
    let climbers!: HTMLElement[];
    let bis3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(escapeBackdrop('l6c8-sky', [C.giantSky, '#d6dfe3', C.duskSky]));
      k.add(ladderArt('l6c8-ladder', 10), { x: LADDER.x - 60, y: LADDER.top, w: 120, z: 4, still: true });
      // Peering over the far side of his land (its cloud hides where his portrait ends).
      giant3 = k.character('giant', { x: 620, y: -95, w: 240, z: 5 });
      land = k.landFar(6, { x: 290, y: 18, w: 600, z: 6 });
      climbers = (['hero', 'moonface', 'saucepan'] as const).map((id, i) => k.character(id, { x: LADDER.x - 75, y: 200 + i * 140, w: 150, z: 20 - i }));
      // The Saucepan Man carries the biscuit, like a great big wheel.
      bis3 = k.add(biscuit(), { x: LADDER.x + 30, y: 520, w: 130, z: 21 });
    });
    k.fx.wind(2);
    for (let i = 0; i < 5; i++) {
      rung(i);
      await together(k, [...climbers, bis3], 0.3, { y: '+=36', ease: 'power1.inOut' });
    }
    // Onto the branch they hop, one after another.
    for (const [i, c] of climbers.entries()) {
      const [cx, cy] = at(c);
      rung(i);
      void k.to(c, 0.5, { x: `+=${BRANCH[0] - 40 - i * 120 - cx}`, y: `+=${BRANCH[1] - 180 - cy}`, ease: 'power1.inOut' });
      if (i === 2) {
        const [bx, by] = at(bis3);
        void k.to(bis3, 0.5, { x: `+=${BRANCH[0] - 230 - bx}`, y: `+=${BRANCH[1] - 60 - by}`, ease: 'power1.inOut' });
      }
      await k.wait(350);
    }
    void wave(k, climbers[0], 'armR', 3);
    void k.shake(giant3, 4, 3);
    await k.say('bye', giant3);
    // Up and away goes the land, and the giant with it.
    k.fx.rumble(3);
    thump();
    await k.all(
      k.to([land, giant3], 6, { y: '-=380', ease: 'power1.in' }),
      k.to([land, giant3], 6, { scale: 0.45, ease: 'power1.in' }),
      k.say('away'),
    );

    // ------------------------------------------- scene 4: home, with a very big biscuit
    let h4!: HTMLElement;
    let m4!: HTMLElement;
    let p4!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l6c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      h4 = k.character('hero', { x: 60, y: 370, w: 240, z: 20 });
      m4 = k.character('moonface', { x: 820, y: 350, w: 250, z: 20, flip: true });
      p4 = k.character('saucepan', { x: 260, y: 360, w: 230, z: 19 });
    });
    k.music('cosy');
    flump();
    const bis4 = k.add(biscuit(), { x: 580, y: 470, w: 200, z: 22 });
    k.set(bis4, { opacity: 0 });
    k.fx.thud();
    await k.appear(bis4, 0.4);
    munch(5);
    await k.all(k.say('munch', m4), k.hop(m4, 20, 1));
    const keep = k.keepsake(k.chapter?.keepsake ?? 'giantTeacup', { x: 400, y: 500, w: 150, z: 24 });
    const seal = k.add(landSeal(6), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    snapSound.clank(3);
    await k.all(k.say('prize'), k.hop(h4, 36, 2), k.wait(300).then(() => k.hop(p4, 24, 2)));
    await k.wait(500);

    // ------------------------------------------- scene 5: a tower in purple mist… and heels
    let veil!: HTMLElement;
    let h5!: HTMLElement;
    let m5!: HTMLElement;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l6c8-tree', { landN: 7 }));
      veil = k.dim(0.25, '#2a1f40');
      k.ambient('stars', { count: 18, area: [0, 0, 1180, 240] });
      h5 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      m5 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
    });
    k.music('magic');
    mist();
    await k.wait(700);
    await k.say('tower', h5);
    void k.to(veil, 3, { opacity: 0.45 });
    void k.all(k.fade(h5, 0, 1), k.fade(m5, 0, 1.6));
    await k.camera({ zoom: 1.9, x: 590, y: 110 }, 3);
    k.silence();
    // Faint, far-off heels in the mist.
    const clacks = k.say('clack');
    await k.wait(1500);
    snapSound.heels(3, 0.5, 0.35);
    await clacks;
    await k.wait(600);
    await k.say('heels', m5);
    sting();
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(1200);
  },
});
