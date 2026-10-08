/**
 * Land 11, chapter 8 (the land's finale): The Shoe Walks Away!
 *
 * Plays straight after the escape game, where the Old Woman came down the
 * ladder after them, calling them back for supper. Five scenes:
 *
 *   1. The top of the Faraway Tree, everyone safe. The Old Woman leans
 *      over the edge of the cloud: they forgot their supper! The Saucepan
 *      Man hears "slipper", of course. Down comes a basket of buns on a
 *      long bootlace: eight buns, two each for four friends, 2, 4, 6, 8
 *      (the land's counting and the ×2 it mixes in).
 *   2. The land moves on: the great shoe gets up and walks away across the
 *      clouds, step, creak, step, with the children waving from its
 *      windows and the Old Woman waving from the toe.
 *   3. Moon-Face's room: supper, the shiny shoe buckle and the seal of the
 *      Old Woman's Shoe. But the Saucepan Man counts the buns: there were
 *      eight, and now there are SEVEN.
 *   4. That night, the basket in the dark room. The cloth lifts: a little
 *      red cap and two yellow eyes. Somebody small rode down in the
 *      basket, and creeps off with a bun.
 *   5. The top of the tree at night: a new land is coming, booming with
 *      drums and trumpets (the Land of Music), and something small and red
 *      is climbing up towards it. A soft, uneasy sting.
 *
 * Scary is fine, cruel isn't (PLAN.md §2): the goblin only sneaks and
 * takes a bun; it never comes near anyone. Next land: The Land of Music,
 * where the Red Goblins steal Mr Oom Boom Boom's big drum.
 */
import { landSeal } from '../art/keepsakes';
import { goblinFigure } from '../art/characters/l14';
import { moonRoom, tree, TREE_SPOTS } from '../art/scenery';
import { C, circle, defineStory, ellipse, ink, piece, rect, svg, tone, now, NOTE, bell, type Kit } from './kit';
import { blackSheet, flump, roundTag, sting, together, wave } from './bits';
import { snapSound } from './snapSchool';
import { bootStep, bunBasket, creak, giggle, jingle, kid, redPeek, shoeHouse } from './shoe';

// ------------------------------------------------------------------ sounds

/** Far-off music from a land on its way: a deep drum and a little oom-pah. */
function farBand(): void {
  const t = now();
  for (let i = 0; i < 3; i++) tone(70, t + i * 0.5, { peak: 0.14, decay: 0.35, glideTo: 50 });
  [NOTE.C4, NOTE.G3, NOTE.C4].forEach((f, i) => tone(f, t + 0.25 + i * 0.5, { wave: 'triangle', peak: 0.04, attack: 0.02, decay: 0.2, lowpass: 900 }));
  bell(NOTE.G5, t + 1.6, 0.03, 0.8);
}

// --------------------------------------------------------------------- art

/** A long bootlace hanging straight down (20 × 400), stretched to its length on stage. */
const lace = (): string => svg({ w: 20, h: 400, name: 'l11c8-lace', boil: false }, [ink([[10, 0], [11, 400]], { width: 6, color: '#f4ead0', wobble: 0.6 })]);

/** One warm bun (80 × 80). */
const bun = (): string =>
  svg({ w: 80, h: 80, name: 'l11c8-bun', boil: false }, [
    piece(circle(40, 44, 30), '#d9a056', { rough: 0.5 }),
    piece(ellipse(32, 34, 11, 6, -20), '#f3d29a', { edge: 'clean', fibre: false, shadow: false }),
  ]);

/** A bank of soft clouds across the bottom of the sky (1180 × 360), for the shoe to walk on. */
function cloudBank(): string {
  const puffs = Array.from({ length: 12 }, (_, i) => piece(circle(i * 108 - 20 + (i % 3) * 14, 150 + (i % 2) * 34, 110 + (i % 3) * 16), i % 2 ? C.cloud : '#f6f2e8', { rough: 0.8 }));
  return svg({ w: 1180, h: 360, name: 'l11c8-clouds', boil: false }, [...puffs, piece(rect(-20, 200, 1220, 200), C.cloud, { edge: 'torn', fibre: false, shadow: false })]);
}

/** The sky above the tree, late afternoon. */
function sky(): string {
  return svg({ w: 1180, h: 820, name: 'l11c8-sky', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#efd9bf', { edge: 'clean', shadow: false }),
    piece(rect(-20, 260, 1220, 600), '#d9b48c', { edge: 'torn', shadow: false, fibre: false }),
    piece(circle(980, 150, 60), '#fbe38a', { edge: 'cut', fibre: false, opacity: 0.9 }),
  ]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    supper: { who: 'oldWoman', text: 'Yoo-hoo! Wait, my dears! You forgot your supper!' },
    slipper: { who: 'saucepan', text: 'EH? A SLIPPER? No thank you. I’ve got two slippers already!' },
    down: { who: 'silky', text: 'Supper, not slipper! Look, she’s sending it down on a bootlace.' },
    buns: { who: 'narrator', text: 'Eight warm buns. Two each for four friends. Two, four, six, eight!' },
    walking: { who: 'hero', text: 'Look! The shoe is walking away, with everyone inside!' },
    bye: { who: 'oldWoman', text: 'Goodbye, goodbye! Come and visit us again, my dears!' },
    prize: { who: 'narrator', text: 'A shiny shoe buckle, and the seal of the Old Woman’s Shoe.' },
    seven: { who: 'saucepan', text: 'Wait! There were eight buns. Now there are SEVEN! Who ate one?' },
    night: { who: 'narrator', text: 'That night, somebody small crept out of the basket. Somebody with a red cap.' },
    listen: { who: 'moonface', text: 'Listen, {name}. Drums and trumpets! A new land is coming.' },
    up: { who: 'hero', text: 'And that little red cap is going up there too…' },
  },

  async play(k: Kit) {
    // ------------------------------------------- scene 1: supper on a bootlace
    k.backdrop(tree('l11c8-tree', { landN: 11 }));
    k.music('cosy');
    const box = TREE_SPOTS.cloud;
    const ow = k.character('oldWoman', { x: box.x + 150, y: 30, w: 120, z: 6 });
    k.set(ow, { y: 80, opacity: 0 });
    const hero = k.character('hero', { x: 40, y: 420, w: 220, z: 20 });
    const silky = k.character('silky', { x: 250, y: 390, w: 210, z: 19 });
    const sauce = k.character('saucepan', { x: 700, y: 410, w: 220, z: 20, flip: true });
    const mf = k.character('moonface', { x: 920, y: 400, w: 230, z: 20, flip: true });
    k.set([hero, silky, sauce, mf], { opacity: 0 });
    flump();
    await k.all(k.enter(hero, 'left'), k.enter(silky, 'left'), k.enter(sauce, 'right'), k.enter(mf, 'right'));
    k.float(silky, 6, 2.4);

    // The Old Woman leans over the edge of the cloud.
    await k.to(ow, 0.6, { y: 0, opacity: 1, ease: 'back.out(1.4)' });
    await k.all(k.say('supper', ow), wave(k, ow, 'armR', 2));
    snapSound.clank(3);
    await k.all(k.say('slipper', sauce), k.hop(sauce, 20, 2));

    // Down comes the basket on a long bootlace.
    const BASKET = { x: 490, y: 330, w: 190 };
    const string = k.add(lace(), { x: BASKET.x + 85, y: 150, w: 20, h: 200, z: 7 });
    const basket = k.add(bunBasket(8, 'l11c8-basket8'), { x: BASKET.x, y: BASKET.y, w: BASKET.w, z: 8 });
    k.set(string, { scaleY: 0, transformOrigin: '50% 0%' });
    k.set(basket, { y: -200 });
    const lowering = async () => {
      await k.wait(800);
      k.fx.creak();
      await k.all(k.to(string, 2.2, { scaleY: 1, ease: 'sine.inOut' }), k.to(basket, 2.2, { y: 0, ease: 'sine.inOut' }));
      k.fx.pop();
    };
    await k.all(k.say('down', silky), lowering());

    // Eight buns: two each for four friends.
    const friends = [hero, silky, sauce, mf];
    const SPOT = [150, 355, 810, 1035];
    const buns = Array.from({ length: 8 }, () => {
      const b = k.add(bun(), { x: BASKET.x + 60, y: BASKET.y + 10, w: 64, z: 30 });
      k.set(b, { opacity: 0 });
      return b;
    });
    const tags = [2, 4, 6, 8].map((n, i) => {
      const t = k.add(roundTag(n, n === 8 ? C.goldLight : C.cream, `l11c8-tag-${n}`), { x: SPOT[i] - 40, y: 230, w: 80, z: 31 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const empty = k.add(bunBasket(0, 'l11c8-basket0'), { x: BASKET.x, y: BASKET.y, w: BASKET.w, z: 8 });
    k.set(empty, { opacity: 0 });
    const sharing = async () => {
      await k.wait(1200);
      k.set(empty, { opacity: 1 });
      k.set(basket, { opacity: 0 });
      for (let f = 0; f < 4; f++) {
        for (let j = 0; j < 2; j++) {
          const b = buns[f * 2 + j];
          k.set(b, { opacity: 1 });
          k.fx.pop();
          await k.to(b, 0.4, { x: SPOT[f] - 64 + j * 64 - (BASKET.x + 60), y: 320 - (BASKET.y + 10), ease: 'power2.out' });
        }
        await k.appear(tags[f], 0.25);
        void k.hop(friends[f], 14, 1);
        await k.wait(250);
      }
      k.sfx.success();
    };
    await k.all(k.say('buns'), sharing());
    await k.wait(400);

    // ------------------------------------------- scene 2: the shoe walks away
    let shoe!: HTMLElement;
    let riders: HTMLElement[] = [];
    let ow2!: HTMLElement;
    let h2!: HTMLElement;
    await k.cut(() => {
      k.backdrop(sky());
      k.add(cloudBank(), { x: 0, y: 470, w: 1180, h: 360, z: 4, still: true });
      shoe = k.add(shoeHouse('l11c8-shoe'), { x: 560, y: 110, w: 560, z: 6 });
      // Children waving from the windows (the shoe's windows, at this size).
      riders = [
        [969, 196],
        [1047, 196],
        [1008, 301],
        [777, 425],
      ].map(([x, y], i) => k.add(kid(i + 2, 'wave'), { x: x - 20, y: y - 34, w: 40, z: 7 }));
      ow2 = k.character('oldWoman', { x: 584, y: 340, w: 140, z: 8 });
      h2 = k.character('hero', { x: 40, y: 430, w: 230, z: 20 });
    });
    k.music('adventure');
    const walkers = [shoe, ...riders, ow2];
    // Step, creak, step: the toe lifts, the shoe stomps forward and away.
    const walking = async () => {
      for (let i = 0; i < 3; i++) {
        await together(k, walkers, 0.35, { y: '-=24', x: '-=20' });
        bootStep();
        giggle(1);
        await together(k, walkers, 0.3, { y: '+=24', x: '-=40' });
        void k.quake(3);
        await k.wait(250);
      }
    };
    await k.all(k.say('walking', h2), walking());
    await k.all(k.say('bye', ow2), wave(k, ow2, 'armR', 3), ...riders.map((r) => k.hop(r, 12, 2)));
    k.fx.rumble(2.5);
    creak(1.2);
    await together(k, walkers, 3, { y: '-=640', x: '-=120', scale: 0.5, opacity: 0, ease: 'power1.in' });

    // ------------------------------------------- scene 3: supper in Moon-Face's room
    let h3!: HTMLElement;
    let p3!: HTMLElement;
    let m3!: HTMLElement;
    let basket3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l11c8-room'));
      k.light(590, 236, 230, { color: C.candle, strength: 0.25 });
      k.ambient('dust', { count: 10 });
      h3 = k.character('hero', { x: 90, y: 370, w: 230, z: 20 });
      p3 = k.character('saucepan', { x: 330, y: 360, w: 230, z: 19 });
      m3 = k.character('moonface', { x: 880, y: 360, w: 240, z: 20, flip: true });
      basket3 = k.add(bunBasket(7, 'l11c8-basket7'), { x: 600, y: 520, w: 190, z: 22 });
    });
    k.music('cosy');
    flump();
    await together(k, [h3, p3, m3], 0.3, { y: '+=10' });
    await together(k, [h3, p3, m3], 0.3, { y: '-=10' });
    const keep = k.keepsake(k.chapter?.keepsake ?? 'shoeBuckle', { x: 610, y: 330, w: 150, z: 24 });
    const seal = k.add(landSeal(11), { x: 480, y: 60, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 170, 16, 200);
    k.float(seal, 6, 2);
    await k.all(k.say('prize'), k.hop(h3, 30, 2));
    await k.all(k.fade(keep, 0, 0.4), k.fade(seal, 0, 0.4));
    snapSound.clank(3);
    await k.all(k.say('seven', p3), k.shake(p3, 6, 2), k.pop(basket3, 1.1));

    // ------------------------------------------- scene 4: night, and the basket
    let peek!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l11c8-room-night'));
      k.dim(0.55, '#101632');
      k.light(590, 236, 200, { color: C.moonPale, strength: 0.3 });
      k.add(bunBasket(7, 'l11c8-basket7'), { x: 500, y: 470, w: 220, z: 40 });
      peek = k.add(redPeek('l11c8-peek'), { x: 545, y: 430, w: 130, z: 39 });
      k.set(peek, { y: 60, opacity: 0 });
    });
    k.music('sneaky');
    await k.camera({ zoom: 1.3, x: 610, y: 500 }, 1.2);
    const creeping = async () => {
      await k.wait(1200);
      jingle();
      await k.to(peek, 0.6, { y: 0, opacity: 1, ease: 'power2.out' });
      const eyes = k.part(peek, 'eyes');
      await k.to(eyes, 0.3, { x: -6 });
      await k.to(eyes, 0.3, { x: 6 });
      await k.to(eyes, 0.2, { x: 0 });
      await k.to(peek, 0.3, { y: 60, opacity: 0, ease: 'power2.in' });
      // Out he creeps, with a bun, and off to the trapdoor.
      const carry = [piece(circle(212, 128, 24), '#d9a056', { rough: 0.5 }), piece(ellipse(204, 120, 9, 5, -20), '#f3d29a', { edge: 'clean', fibre: false, shadow: false })];
      const gob = k.add(goblinFigure('l11c8-goblin', { pose: 'sneak', flip: true, carry }), { x: 390, y: 440, w: 110, z: 41 });
      k.set(gob, { opacity: 0 });
      jingle();
      await k.fade(gob, 1, 0.4);
      await k.walk(gob, -380, 2.2, 6);
      jingle();
    };
    await k.all(k.say('night'), creeping());

    // ------------------------------------------- scene 5: a new land, and a red cap climbing
    let m5!: HTMLElement;
    let h5!: HTMLElement;
    let climber!: HTMLElement;
    let music!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l11c8-tree-night'));
      k.dim(0.45, '#101632');
      music = k.landFar(12, { x: box.x, y: box.y, w: box.w, z: 34 });
      k.set(music, { y: -200, opacity: 0 });
      climber = k.add(goblinFigure('l11c8-climber', { pose: 'sneak' }), { x: 388, y: 250, w: 50, z: 34 });
      m5 = k.character('moonface', { x: 870, y: 420, w: 240, z: 40, flip: true });
      h5 = k.character('hero', { x: 60, y: 430, w: 230, z: 40 });
      k.light(590, 560, 380, { color: C.candle, strength: 0.2, z: 38 });
    });
    k.music('dreamy');
    farBand();
    await k.all(k.to(music, 2.6, { y: 0, opacity: 1, ease: 'sine.out' }), k.to(climber, 4, { y: -110, ease: 'none' }));
    farBand();
    await k.all(k.say('listen', m5), k.hop(m5, 16, 1));
    jingle();
    await k.all(k.say('up', h5), k.to(climber, 2, { y: '-=60', opacity: 0, ease: 'none' }), k.camera({ zoom: 1.4, x: 560, y: 200 }, 2));
    k.silence();
    sting();
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(1000);
  },
});
