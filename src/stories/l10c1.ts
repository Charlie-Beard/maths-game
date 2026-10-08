/**
 * Land 10, chapter 1: Dame Snap's Return.
 *
 * Night on the Faraway Tree, and her land is back in the cloud: a prison of
 * black stone. Heels clack down the branches. Dame Snap looms at the top
 * and snaps her ruler, once for each of the Folk: Dame Washalot, the Angry
 * Pixie and Mr Watzisname. Each time, an iron cage drops round them with a
 * CLANG (nobody is touched), and her crows carry the cages up into the
 * prison, the Pixie shouting all the way. Cut back to {name} and Moon-Face
 * at the bottom: Silky is up there too. They follow, up the long ladder,
 * thirty rungs and then twenty more (the chapter's adding tens), to the
 * prison gate. Its bars have numbers on them. Next: Through the Bars.
 */
import { tree } from '../art/scenery';
import { C, defineStory, type Kit } from './kit';
import { numberTag, together } from './bits';
import { crowFlying } from './snapSchool';
import { barRails, cageBack, cageFront, GAP, ladderArt, numberedBar, outsideWall, prisonSound, slateSum } from './snapPrison';

/** The Folk at their places on the tree (portraits 150 wide), and the cages that drop round them. */
const FOLK = [
  { id: 'watzisname', x: 245, y: 330 },
  { id: 'pixie', x: 470, y: 400 },
  { id: 'washalot', x: 730, y: 455 },
];
const CAGE_W = 190;

export default defineStory({
  lines: {
    back: { who: 'narrator', text: 'Her land was back. A prison of black stone, high in the cloud.' },
    cages: { who: 'dameSnap', text: 'Washalot! Pixie! Watzisname! Into my CAGES, all of you!' },
    pixie: { who: 'pixie', text: 'Put me DOWN, you crows! I’ll pull out your tail feathers!' },
    follow: { who: 'moonface', text: 'Silky is up there too. We’re going after them, {name}.' },
    rungs: { who: 'narrator', text: 'Up the ladder. Thirty rungs, then twenty more. Fifty rungs!' },
    bars: { who: 'hero', text: 'The gate is locked. But look… the bars have numbers on them!' },
  },

  async play(k: Kit) {
    // ---------------------------------------------- the tree, at night
    k.backdrop(tree('l10c1-tree', { landN: 10 }));
    k.music('spooky');
    const night = k.dim(0.5, '#0d0a1a');
    k.fx.wind(3);

    const folk = FOLK.map((f) => k.character(f.id, { x: f.x, y: f.y, w: 150, z: 20 }));
    const hero = k.character('hero', { x: 20, y: 520, w: 230, z: 40 });
    const mf = k.character('moonface', { x: 930, y: 520, w: 230, z: 40, flip: true });

    // Up into the cloud: the prison is back.
    await k.wait(300);
    const told = k.say('back');
    await k.camera({ zoom: 1.9, x: 590, y: 110 }, 2.4);
    prisonSound.toll();
    await told;

    // Clack, clack, clack: down the branches she comes, and looms.
    const snap = k.snap('loom', { x: 440, y: 40, w: 300, z: 36 });
    k.set(snap, { opacity: 0, y: -60 });
    prisonSound.heels(6, 0.26, 0.8);
    await k.to(snap, 1.4, { opacity: 1, y: 0, ease: 'power2.out' });
    void k.camera({ zoom: 1.5, x: 590, y: 220 }, 0.8);
    k.pose(snap, 'point');
    prisonSound.ruler();
    await k.say('cages', snap);

    // Wide: a snap of the ruler for each of them, and a cage drops. CLANG.
    void k.camera({}, 0.8);
    const cages: HTMLElement[][] = [];
    for (const [i, f] of FOLK.entries()) {
      const s = CAGE_W / 280;
      const cx = f.x + 75 - CAGE_W / 2;
      const cy = f.y + 170 - 372 * s;
      const back = k.add(cageBack(f.id), { x: cx, y: cy, w: CAGE_W, z: 19 });
      const front = k.add(cageFront(f.id), { x: cx, y: cy, w: CAGE_W, z: 21 });
      k.set(back, { opacity: 0 });
      k.set(front, { y: -cy - 420 });
      prisonSound.ruler();
      void k.shake(snap, 3, 1);
      await k.to(front, 0.45, { y: 0, ease: 'power2.in' });
      prisonSound.clang();
      void k.fade(back, 1, 0.2);
      void k.shake(folk[i], 6, 2);
      await k.wait(350);
      cages.push([back, folk[i], front]);
    }

    // Her crows take the cages up into the prison, the Pixie shouting.
    k.pose(snap, 'loom');
    const crows = FOLK.map((f, i) => {
      const c = k.add(crowFlying(`c1-${i}`), { x: f.x + 30, y: f.y - 130, w: 110, z: 22 });
      k.set(c, { opacity: 0, y: -200 });
      return c;
    });
    prisonSound.caw(3);
    await k.all(...crows.map((c) => k.to(c, 0.6, { opacity: 1, y: 0, ease: 'power2.out' })));
    const rising = k.all(
      ...cages.map((els, i) => together(k, [...els, crows[i]], 2.6, { y: '-=760', ease: 'power1.in' })),
      k.wait(1200).then(() => k.to(snap, 0.9, { y: -420, opacity: 0, ease: 'power2.in' })),
    );
    prisonSound.rattle(6);
    await k.all(k.say('pixie', folk[1]), rising);
    prisonSound.heels(3, 0.3, 0.5);
    prisonSound.slam();

    // Cut back to the heroes, at the bottom of the tree.
    void k.fade(night, 0.35, 0.8);
    void k.all(k.to(hero, 0.8, { x: 60 }), k.to(mf, 0.8, { x: -60 }));
    await k.camera({ zoom: 1.12, x: 590, y: 520 }, 1.0);
    k.music('adventure');
    await k.all(k.say('follow', mf), k.hop(mf, 20));
    await k.hop(hero, 30);

    // ---------------------------------------------- up the ladder, to the gate
    let h2!: HTMLElement;
    let m2!: HTMLElement;
    let ladder!: HTMLElement;
    const bars: HTMLElement[] = [];
    await k.cut(() => {
      k.backdrop(outsideWall('l10c1-outside'));
      k.dim(0.15, '#140f22');
      k.light(1010, 90, 140, { color: C.moonPale, strength: 0.25 });
      k.add(barRails(GAP.w), { x: GAP.x, y: GAP.y - 10, w: GAP.w, z: 6 });
      for (let i = 0; i < 5; i++) bars.push(k.add(numberedBar(46 + i), { x: GAP.x + 4 + i * 84, y: GAP.y - 10, w: 80, z: 7 }));
      ladder = k.add(ladderArt(320), { x: 110, y: 520, w: 150, z: 12 });
      h2 = k.character('hero', { x: 50, y: 470, w: 200, z: 14 });
      m2 = k.character('moonface', { x: 180, y: 480, w: 200, z: 13 });
      k.set([h2, m2], { y: '+=420' });
    });
    k.ambient('dust', { count: 8, area: [0, 100, 1180, 500] });

    // Climbing: thirty rungs, then twenty more.
    const t30 = k.add(numberTag('30', C.chalk, 'l10c1-30'), { x: 280, y: 560, w: 120, z: 20 });
    const t20 = k.add(numberTag('+20', C.goldLight, 'l10c1-20'), { x: 280, y: 440, w: 120, z: 20 });
    const sum = k.add(slateSum('30 + 20 = 50', 440, 'l10c1'), { x: 370, y: 24, w: 440, z: 24 });
    k.set([t30, t20, sum], { opacity: 0 });
    const climbing = async () => {
      await k.all(k.to(h2, 1.4, { y: '-=220', ease: 'sine.inOut' }), k.to(m2, 1.5, { y: '-=200', ease: 'sine.inOut' }));
      k.fx.pop();
      await k.appear(t30, 0.3);
      await k.all(k.to(h2, 1.1, { y: '-=200', ease: 'sine.inOut' }), k.to(m2, 1.2, { y: '-=220', ease: 'sine.inOut' }));
      k.fx.pop();
      await k.appear(t20, 0.3);
      k.sfx.success();
      await k.appear(sum, 0.35);
      k.sparkle(590, 84, 12, 140);
    };
    await k.all(k.say('rungs'), climbing());

    // Off the ladder, up to the gate. Locked tight.
    void k.fade(t30, 0, 0.3);
    void k.fade(t20, 0, 0.3);
    void k.fade(ladder, 0.4, 0.4);
    await k.all(k.to(h2, 0.6, { x: 170, y: '-=20' }), k.to(m2, 0.6, { x: 700, y: '-=10' }));
    k.face(m2, true);
    prisonSound.rattle(4);
    void k.all(...bars.map((b, i) => k.wait(i * 60).then(() => k.shake(b, 3, 1))));
    await k.say('bars', h2);
    await k.all(...bars.map((b, i) => k.wait(i * 120).then(() => k.pop(b, 1.06))));
    await k.wait(700);
  },
});
