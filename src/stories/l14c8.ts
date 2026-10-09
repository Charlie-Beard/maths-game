/**
 * Land 14, chapter 8 (the land's finale, and the end of the whole game):
 * Run from the Red Goblins!
 *
 * Plays straight after the escape game. The second adventure comes home.
 * Four scenes:
 *
 *   1. The goblin caves. The goblins are awake! {name}, Moon-Face and the
 *      Saucepan Man run for the rope ladder with the big drum between them,
 *      and a crowd of red goblins comes scurrying out of the tunnels after
 *      them, shouting. The Saucepan Man clanks so loudly nobody could hide,
 *      but this time it doesn't matter: up the ladder they go, into the
 *      daylight. The goblins are too short to reach the bottom rung.
 *   2. The top of the Faraway Tree, in the cloud. Down the ladder they go,
 *      drum and all. The goblins crowd the edge of their land, shaking
 *      their fists, but the land is moving on: it rumbles and rises away
 *      with every goblin in it, still shouting, smaller and smaller, gone.
 *      Something red comes floating down: the Red Goblin's cap.
 *   3. Moon-Face's room: a feast for everyone. The Folk are all there,
 *      Mr Oom Boom Boom gets his big drum back, the Saucepan Man mishears
 *      "three cheers" (as "three chairs"), and the land's seal and the
 *      goblin cap go in the treasure room.
 *   4. The tree at dusk, every window lit, and the big drum booming at the
 *      top of the tree, slow and happy: Oom… BOOM… BOOM. The End.
 *
 * Scary, never cruel (PLAN.md §2): the goblins shout and chase, and they
 * never touch anyone. Nobody is hurt and nobody is left behind: the goblins
 * simply go off with their land, as lands do, cross but quite all right.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree } from '../art/scenery';
import { bell, C, circle, defineStory, ellipse, noiseBurst, NOTE, now, piece, raw, rect, rng, svg, tone, type Kit, type Node } from './kit';
import { at, together, wave } from './bits';
import { cave, cloudBank, drumArt, goblin, goblinSound, homeSky, scurry } from './goblinCave';

// ------------------------------------------------------------------ sounds

/** A land lifting away: a deep rumble and a long whoosh, then a little falling tune. */
function landLeaves(): void {
  const t = now();
  noiseBurst(t, { freq: 260, type: 'lowpass', peak: 0.16, attack: 0.4, decay: 2.2 });
  noiseBurst(t + 0.6, { freq: 2400, q: 0.7, peak: 0.07, attack: 0.3, decay: 1.6, sweepTo: 500 });
  [NOTE.G5, NOTE.E5, NOTE.C5].forEach((f, i) => bell(f, t + 1.4 + i * 0.16, 0.05, 0.8));
}

/** Three cheers: three rising, happy chords. */
function cheers(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5].forEach((f, i) => {
    bell(f, t + i * 0.7, 0.07, 0.6);
    bell(f * 1.25, t + i * 0.7, 0.05, 0.6);
  });
}

/** The big drum, slow and happy: oom… BOOM… BOOM, then a little roll. */
function drumSong(): void {
  const t = now();
  [0, 0.7, 1.4].forEach((dt, i) => {
    tone(i ? 92 : 120, t + dt, { peak: i ? 0.3 : 0.18, attack: 0.005, decay: 0.7, glideTo: 48 });
    noiseBurst(t + dt, { freq: 200, type: 'lowpass', peak: 0.14, decay: 0.3 });
  });
  for (let i = 0; i < 6; i++) tone(140, t + 2.2 + i * 0.07, { peak: 0.08, attack: 0.003, decay: 0.1, glideTo: 90 });
}

// --------------------------------------------------------------------- art

/** Andika lettering. */
const text = (x: number, y: number, s: string, size: number, fill: string): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="middle">${s}</text>`);

/** The Faraway Tree's own ladder, wooden, poking up out of the cloud (200 × 560). */
function treeLadder(): string {
  const rungs: Node[] = [];
  for (let y = 26; y < 560; y += 56) rungs.push(piece(rect(44, y, 112, 12, 3), C.tan, { edge: 'cut', fibre: false }));
  return svg({ w: 200, h: 560, name: 'l14c8-ladder', boil: false }, [
    piece(rect(32, 0, 16, 560, 4), C.wood, { edge: 'cut' }),
    piece(rect(152, 0, 16, 560, 4), C.wood, { edge: 'cut' }),
    ...rungs,
  ]);
}

/** The feast table (1060 × 230): a long cloth with scallops, and a big cake in the middle. */
function feastTable(): string {
  const r = rng(1408);
  const scallops: Node[] = [];
  for (let x = 20; x < 1060; x += 52) scallops.push(piece(circle(x + 26, 96, 26), C.pink, { edge: 'cut', shadow: false }));
  const crumbs: Node[] = [];
  for (let i = 0; i < 12; i++) crumbs.push(piece(circle(60 + r() * 940, 60 + r() * 20, 3), C.goldLight, { edge: 'clean', fibre: false, shadow: false, opacity: 0.7 }));
  return svg({ w: 1060, h: 230, name: 'l14c8-table', boil: false }, [
    piece(rect(70, 90, 26, 140, 4), C.brownDark, { edge: 'cut' }),
    piece(rect(964, 90, 26, 140, 4), C.brownDark, { edge: 'cut' }),
    piece(rect(0, 40, 1060, 70, 10), C.cream, { rough: 1 }),
    ...scallops,
    ...crumbs,
  ]);
}

/** A big birthday-ish cake (220 × 200) with three tiers and a red goblin-cap cherry on top (for fun). */
function cake(): string {
  return svg({ w: 220, h: 200, name: 'l14c8-cake', boil: false }, [
    piece(ellipse(110, 190, 104, 10), C.white, { edge: 'cut' }),
    piece(rect(14, 120, 192, 70, 12), C.pink, { edge: 'cut' }),
    piece(rect(40, 68, 140, 58, 12), C.cream, { edge: 'cut' }),
    piece(rect(66, 24, 88, 48, 12), C.pink, { edge: 'cut' }),
    ...[30, 70, 110, 150, 190].map((x) => piece(circle(x, 122, 9), C.white, { edge: 'cut', fibre: false })),
    piece(circle(110, 18, 14), C.red, { edge: 'cut' }),
  ]);
}

/** "The End", on a torn cream card (560 × 220). */
function endCard(): string {
  return svg({ w: 560, h: 220, name: 'l14c8-end', boil: false }, [
    piece(rect(10, 10, 540, 200, 18), C.cream, { rough: 1.6 }),
    piece(rect(30, 30, 500, 160, 12), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    text(280, 140, 'The End', 96, C.plum),
  ]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    run: { who: 'narrator', text: 'The goblins were awake! Everybody ran for the rope ladder, with the big drum.' },
    back: { who: 'redGoblin', text: 'Come BACK here! That’s MY drum!' },
    clank: { who: 'saucepan', text: 'YOUR drum? It’s Mr Oom Boom Boom’s drum! Clank, clank, up we go!' },
    short: { who: 'narrator', text: 'Up into the daylight they climbed. And the goblins were too short to reach the ladder!' },
    down: { who: 'narrator', text: 'Across the land, and down the ladder to the Faraway Tree. Drum and all!' },
    edge: { who: 'redGoblin', text: 'Grrr! Come BACK! Give us that drum!' },
    moving: { who: 'moonface', text: 'Too late, goblins! Your land is moving on!' },
    away: { who: 'narrator', text: 'Away went the Land of the Red Goblins, with every goblin in it, still shouting.' },
    cap: { who: 'hero', text: 'Look! Something red, floating down. A goblin cap!' },
    feast: { who: 'moonface', text: 'Welcome home, everybody! Who’s hungry? It’s time for a FEAST!' },
    drum: { who: 'oomboom', text: 'My big drum! My big, BIG drum! Thank you, {name}!' },
    hooray: { who: 'moonface', text: 'Three cheers for {name}! Hip hip, hooray!' },
    chairs: { who: 'saucepan', text: 'EH? THREE CHAIRS? I only need one. Pass the jelly!' },
    boom: { who: 'oomboom', text: 'Ready, everybody? Oom… BOOM… BOOM!' },
    night: { who: 'narrator', text: 'And the big drum boomed all night long, at the top of the Faraway Tree.' },
    end: { who: 'narrator', text: 'The End.' },
  },

  async play(k: Kit) {
    // ------------------------------------------- scene 1: the chase
    cave(k);
    k.music('adventure');
    const mf = k.character('moonface', { x: 380, y: 420, w: 210, z: 22 });
    const hero = k.character('hero', { x: 540, y: 430, w: 210, z: 23 });
    const drum = k.add(drumArt('l14c8-drum1'), { x: 470, y: 520, w: 170, z: 24 });
    const sauce = k.character('saucepan', { x: 700, y: 420, w: 210, z: 22 });
    const crew = [mf, hero, drum, sauce];

    // The goblins come scurrying out of the tunnels on the left.
    const gobs = [0, 1, 2, 3].map((i) => {
      const g = goblin(k, `l14c8-run${i}`, -260 + (i % 2) * 40, 330 + (i % 2) * 40, { pose: 'run', w: 170, z: 18 + i });
      k.set(g, { x: -160 * i });
      return g;
    });
    const stops = gobs.map((g) => scurry(k, g));
    goblinSound.grumble();
    void k.all(...gobs.map((g, i) => k.to(g, 2.2 + i * 0.2, { x: 300 - i * 70, ease: 'power1.out' })));
    goblinSound.clank(4);
    await k.all(k.say('run'), together(k, crew, 2.2, { x: '+=180', ease: 'power1.inOut' }), k.wait(400).then(() => k.shake(sauce, 4, 2)));

    // The Red Goblin himself, shouting.
    const boss = k.character('redGoblin', { x: 40, y: 360, w: 220, z: 30 });
    k.set(boss, { opacity: 0, x: -200 });
    await k.all(k.fade(boss, 1, 0.3), k.to(boss, 0.6, { x: 0, ease: 'back.out(1.4)' }));
    goblinSound.cackle();
    await k.all(k.say('back', boss), k.shake(boss, 6, 3));
    goblinSound.clank(5);
    await k.all(k.say('clank', sauce), k.hop(sauce, 24, 2));

    // Up the rope ladder into the daylight, one after another.
    const climb = (el: HTMLElement, i: number) =>
      k.wait(i * 300).then(async () => {
        const [x] = at(el);
        await k.to(el, 0.6, { x: `+=${880 - x}`, ease: 'power1.inOut' });
        await k.to(el, 1.4, { y: '-=720', ease: 'power1.in' });
      });
    goblinSound.clank(6);
    void k.all(...gobs.map((g, i) => k.to(g, 1.8, { x: 560 - i * 60, ease: 'power1.inOut' })));
    void k.to(boss, 1.8, { x: 300, ease: 'power1.inOut' });
    await k.all(k.say('short'), ...[sauce, drum, hero, mf].map(climb));
    stops.forEach((s) => s());
    // The goblins jump and jump, but they can't reach the bottom rung.
    goblinSound.grumble();
    await k.all(...gobs.map((g, i) => k.wait(i * 120).then(() => k.hop(g, 40, 2))), k.shake(boss, 6, 2));

    // ------------------------------------------- scene 2: the land moves on
    let land!: HTMLElement;
    let edge!: HTMLElement[];
    const LADDER = { x: 820, y: 300 };
    await k.cut(() => {
      k.backdrop(homeSky('l14c8-sky'));
      k.music('adventure');
      k.ambient('stars', { count: 14, area: [0, 0, 1180, 260], z: 3 });
      land = k.landFar(14, { x: 60, y: 120, w: 760, z: 6 });
      k.add(treeLadder(), { x: LADDER.x, y: LADDER.y, w: 200, z: 8, still: true });
      k.add(cloudBank(), { x: -60, y: 600, w: 1300, z: 30, still: true });
      // Goblins along the edge of their land, small, behind its rim.
      edge = [150, 290, 430, 570].map((x, i) => goblin(k, `l14c8-edge${i}`, x, 40, { w: 130, z: 5, flip: i % 2 === 1 }));
      k.set(edge, { y: 80 });
    });
    // Down the ladder they go, drum and all.
    const climbers = [k.character('saucepan', { x: 0, y: 0, w: 120 }), k.add(drumArt('l14c8-drum2'), { x: 0, y: 0, w: 100 }), k.character('hero', { x: 0, y: 0, w: 120 }), k.character('moonface', { x: 0, y: 0, w: 120 })];
    climbers.forEach((el) => {
      el.style.left = `${LADDER.x + 40}px`;
      el.style.top = `${LADDER.y - 140}px`;
      el.style.zIndex = '20';
      k.set(el, { opacity: 0 });
    });
    const goDown = async (el: HTMLElement): Promise<void> => {
      k.set(el, { opacity: 1 });
      k.fx.patter(3, 0.1);
      await k.to(el, 2, { y: 520, ease: 'power1.in' });
    };
    goblinSound.clank(4);
    await k.all(k.say('down'), ...climbers.map((el, i) => k.wait(i * 700).then(() => goDown(el))));

    // The goblins pop up along the edge, shaking their fists.
    goblinSound.grumble();
    await k.all(...edge.map((g, i) => k.wait(i * 120).then(() => k.to(g, 0.4, { y: 0, ease: 'back.out(1.6)' }))));
    void k.all(...edge.map((g) => k.shake(g, 5, 3)));
    await k.say('edge');
    // The land rumbles, and rises away with every goblin in it.
    const mfTop = k.character('moonface', { x: LADDER.x - 30, y: 560, w: 200, z: 31 });
    k.set(mfTop, { opacity: 0, y: 60 });
    await k.all(k.fade(mfTop, 1, 0.3), k.to(mfTop, 0.5, { y: 0, ease: 'back.out(1.4)' }));
    k.fx.rumble(2.5);
    void k.quake(4);
    await k.all(k.say('moving', mfTop), wave(k, mfTop, 'armL', 2));
    landLeaves();
    const going = k.to([land, ...edge], 6, { y: '-=560', x: '-=120', scale: 0.55, ease: 'power1.in' });
    goblinSound.grumble();
    await k.say('away');
    await going;
    k.fx.twinkle();
    // A red cap comes floating down.
    const cap = k.keepsake(k.chapter?.keepsake ?? 'goblinHat', { x: 420, y: -200, w: 150, z: 25 });
    void k.to(cap, 4, { y: 520, rotation: 30, ease: 'sine.inOut' });
    void k.to(cap, 1, { x: '+=60', yoyo: true, repeat: 3, ease: 'sine.inOut' });
    await k.wait(1500);
    await k.say('cap');

    // ------------------------------------------- scene 3: the feast
    let host!: HTMLElement;
    let oom!: HTMLElement;
    let s3!: HTMLElement;
    let all3!: HTMLElement[];
    let drum3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l14c8-room'));
      k.music('triumph');
      k.light(590, 236, 260, { color: '#fff3c0', strength: 0.25 });
      const back = [
        k.character('washalot', { x: 60, y: 220, w: 170, z: 10 }),
        k.character('pixie', { x: 230, y: 230, w: 160, z: 10 }),
        k.character('silky', { x: 780, y: 210, w: 170, z: 10 }),
        k.character('watzisname', { x: 950, y: 220, w: 170, z: 10, flip: true }),
      ];
      s3 = k.character('saucepan', { x: 20, y: 300, w: 220, z: 14 });
      const h3 = k.character('hero', { x: 330, y: 310, w: 210, z: 14 });
      oom = k.character('oomboom', { x: 640, y: 290, w: 230, z: 14 });
      host = k.character('moonface', { x: 920, y: 300, w: 230, z: 14, flip: true });
      k.add(feastTable(), { x: 60, y: 470, w: 1060, z: 20 });
      k.add(cake(), { x: 480, y: 330, w: 220, z: 21 });
      k.prop('popBiscuit', { x: 140, y: 430, w: 90, z: 21 });
      k.prop('jelly', { x: 260, y: 420, w: 100, z: 21 });
      k.prop('toffee', { x: 900, y: 450, w: 70, z: 21 });
      drum3 = k.add(drumArt('l14c8-drum3'), { x: 690, y: 420, w: 140, z: 22 });
      k.set(drum3, { opacity: 0 });
      all3 = [...back, s3, h3, oom, host];
    });
    k.fx.boing();
    await k.all(...all3.map((el, i) => k.wait(i * 70).then(() => k.hop(el, 20))));
    await k.all(k.say('feast', host), wave(k, host, 'armL', 2));

    // Mr Oom Boom Boom gets his big drum back.
    k.set(drum3, { opacity: 1, y: -500 });
    k.fx.whizz();
    await k.to(drum3, 0.7, { y: 0, ease: 'bounce.out' });
    goblinSound.boom();
    k.sparkle(800, 420, 16, 150);
    await k.all(k.say('drum', oom), k.hop(oom, 30, 2));

    // Three cheers (or three chairs).
    cheers();
    const cheer = async () => {
      for (let i = 0; i < 3; i++) {
        await together(k, all3, 0.22, { y: '-=26' });
        await together(k, all3, 0.24, { y: '+=26' });
        await k.wait(200);
      }
    };
    await k.all(k.say('hooray', host), cheer());
    goblinSound.clank(3);
    await k.all(k.say('chairs', s3), k.shake(s3, 4, 2));

    // The goblin cap and the land's last seal, for the treasure room.
    const hat = k.keepsake(k.chapter?.keepsake ?? 'goblinHat', { x: 380, y: 60, w: 150, z: 30 });
    const seal = k.add(landSeal(14), { x: 600, y: 40, w: 180, z: 30 });
    k.set([hat, seal], { opacity: 0 });
    k.fx.jingle();
    await k.appear(hat, 0.5);
    await k.appear(seal, 0.6);
    k.float(seal, 6, 2);
    k.sparkle(690, 130, 16, 160);
    await k.wait(1200);

    // ------------------------------------------- scene 4: goodnight
    let h4!: HTMLElement;
    let top4!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l14c8-tree'));
      k.dim(0.22, '#1a1430');
      k.music('dreamy');
      k.ambient('fireflies', { count: 12, area: [0, 300, 1180, 380] });
      for (const [x, y, rr] of [[560, 640, 46], [650, 470, 40], [610, 300, 40], [596, 224, 80]]) k.light(x, y, rr, { strength: 0.5, flicker: true });
      h4 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      // Mr Oom Boom Boom and his big drum, up by Moon-Face's door at the top of the tree.
      k.character('oomboom', { x: 690, y: 110, w: 120, z: 30 });
      top4 = k.add(drumArt('l14c8-drum4'), { x: 640, y: 190, w: 100, z: 31 });
    });
    const booming = async () => {
      for (let i = 0; i < 2; i++) {
        drumSong();
        void k.pop(top4, 1.12);
        await k.wait(700);
        void k.pop(top4, 1.15);
        await k.wait(700);
        void k.pop(top4, 1.15);
        await k.wait(1600);
      }
    };
    await k.all(k.say('boom'), booming(), k.wait(600).then(() => k.hop(h4, 24, 2)));
    void k.fade(h4, 0, 1.2);
    await k.all(k.say('night'), k.camera({ zoom: 1.5, x: 600, y: 220 }, 4));
    await k.camera({}, 2);
    const card = k.add(endCard(), { x: 310, y: 300, w: 560, z: 60 });
    k.set(card, { opacity: 0 });
    drumSong();
    await k.fade(card, 1, 1.2);
    await k.say('end');
    await k.wait(2000);
  },
});
