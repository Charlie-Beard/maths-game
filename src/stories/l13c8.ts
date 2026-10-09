/**
 * Land 13, chapter 8 (the land's finale): The Roundabout Spins Away.
 *
 * Plays straight after the escape game, which ends with everyone safe at
 * the bottom of the ladder… except the Saucepan Man. Four scenes:
 *
 *   1. The top of the tree at dusk, the fair spinning in the cloud above.
 *      Moon-Face counts heads: where is the Saucepan Man? Silky hears it:
 *      clank, clank. He's still up there.
 *   2. The fair, going round. The Saucepan Man is dizzy on the carousel
 *      steps and never heard them go. Mr Whirligig rings his bell: the land
 *      has turned round three whole times, run! He tiptoes, but his
 *      saucepans clank too loudly to hide, and red caps pop up. The
 *      goblins hoist him onto their shoulders (carefully: nobody is hurt)
 *      and run off with him, his saucepans clanking. "Put me DOWN!"
 *   3. Back at the top of the tree, the land spins away into the sky. His
 *      voice, far off: he's all right, follow the clanks and come and find
 *      him. A roundabout ticket floats down. {name} promises to find him,
 *      and Moon-Face says they'll go after the goblins.
 *   4. Somewhere dark: a hole in the ground, and the Red Goblin rising out
 *      of it, gloating over his two treasures. A low sting, and black.
 *
 * Scary, never cruel (PLAN.md §2): the goblins grab and run, but the
 * Saucepan Man is carried, not hurt, and he says himself he's all right.
 * He is rescued in land 14 (l14c7).
 */
import { tree, TREE_SPOTS } from '../art/scenery';
import { curve, defineStory, ellipse, ink, piece, rect, rng, svg, type Kit, type Node } from './kit';
import { blackSheet, sting, together, wave } from './bits';
import { boxes, clank, goblin, organ, peeper, ringBell, snigger, whirr } from './fair';

// --------------------------------------------------------------------- art

/** Somewhere dark under the ground: earth walls, roots, and a round hole (the backdrop). */
function goblinHole(): string {
  const r = rng(1313);
  const roots: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 130 + r() * 40;
    roots.push(ink([[x, -10], [x + (r() - 0.5) * 60, 80 + r() * 60], [x + (r() - 0.5) * 90, 150 + r() * 80]], { width: 5 + r() * 4, color: '#3b2618', opacity: 0.9 }));
  }
  return svg({ w: 1180, h: 820, name: 'l13c8-hole', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#1d1414', { edge: 'clean', shadow: false }),
    piece(curve([[-40, 300], [300, 260], [700, 290], [1220, 250], [1220, 860], [-40, 860]], 2), '#2c1d16', { edge: 'torn', shadow: false, fibre: false }),
    ...roots,
    piece(ellipse(590, 560, 300, 90), '#3d2a1e', { rough: 1.2 }),
    piece(ellipse(590, 556, 230, 62), '#0b0707', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The near rim of the hole, in front of anything rising out of it (1180 × 820). */
function holeLip(): string {
  return svg({ w: 1180, h: 820, name: 'l13c8-lip', boil: false }, [
    piece(curve([[340, 560], [450, 610], [590, 624], [730, 610], [840, 560], [890, 600], [860, 700], [590, 760], [320, 700], [290, 600]], 2), '#3d2a1e', { rough: 1 }),
    piece(rect(-20, 680, 1220, 160), '#2c1d16', { edge: 'torn', shadow: false, fibre: false }),
  ]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    where: { who: 'moonface', text: 'Phew! Everybody is down. But wait… where is the Saucepan Man?' },
    listen: { who: 'silky', text: 'Listen! Clank, clank. He’s still up there, at the fair!' },
    dizzy: { who: 'saucepan', text: 'Wheee! Round and round! EH? Where has everybody gone?' },
    run: { who: 'whirligig', text: 'The land has turned round three whole times! Run to the ladder, quick!' },
    hear: { who: 'redGoblin', text: 'Hee hee! We can HEAR you, clanky man. You’re coming with US!' },
    down: { who: 'saucepan', text: 'EH? A RIDE? No, thank you! Put me DOWN, you rascals!' },
    fine: { who: 'saucepan', text: 'I’m all right! Follow the clanks, and come and find me!' },
    promise: { who: 'hero', text: 'We will! We’ll find you, Saucepan Man!' },
    after: { who: 'moonface', text: 'First the big drum, and now our friend. We’re going after those goblins, {name}.' },
    gloat: { who: 'redGoblin', text: 'A big drum, AND a clanky man. Hee hee! Nobody finds the goblin caves…' },
  },

  async play(k: Kit) {
    // ------------------------------------------- scene 1: the top of the tree
    const box = TREE_SPOTS.cloud;
    k.backdrop(tree('l13c8-tree'));
    // The fair, in the cloud at the top, already going round.
    const fair = k.landFar(13, { x: box.x, y: box.y, w: box.w, z: 4 });
    k.dim(0.3, '#2a1838');
    k.music('sneaky');
    k.fx.wind(2);
    const rocking = (async () => {
      for (let i = 0; i < 3; i++) {
        await k.to(fair, 1.2, { rotation: 2.5, ease: 'sine.inOut' });
        await k.to(fair, 1.2, { rotation: -2.5, ease: 'sine.inOut' });
      }
      await k.to(fair, 0.6, { rotation: 0 });
    })();

    const hero = k.character('hero', { x: 30, y: 500, w: 230, z: 40 });
    const silky = k.character('silky', { x: 470, y: 470, w: 230, z: 40 });
    const mf = k.character('moonface', { x: 920, y: 500, w: 230, z: 40, flip: true });
    k.set([hero, silky, mf], { opacity: 0 });
    await k.all(k.enter(hero, 'bottom', 0.6), k.wait(150).then(() => k.enter(silky, 'bottom', 0.6)), k.wait(300).then(() => k.enter(mf, 'bottom', 0.6)));
    k.float(silky, 6, 2.4);
    await k.say('where', mf);
    // Far off, up in the cloud: clank, clank.
    clank(3, 0.5);
    await k.all(k.say('listen', silky), k.camera({ zoom: 1.9, x: 590, y: 110 }, 2.2), k.wait(1200).then(() => clank(3, 0.5)));
    await rocking;

    // ------------------------------------------- scene 2: the fair, going round
    let sauce!: HTMLElement;
    let wg!: HTMLElement;
    let caps!: HTMLElement[];
    await k.cut(() => {
      k.landScene();
      k.dim(0.18, '#3a1f40');
      k.add(boxes('l13c8-boxes'), { x: 60, y: 440, w: 200, z: 16 });
      caps = [peeper(k, { x: 80, y: 420, w: 84, z: 15 }), peeper(k, { x: 160, y: 412, w: 84, z: 15, flip: true })];
      k.set(caps, { y: 110, opacity: 0 });
      sauce = k.character('saucepan', { x: 820, y: 370, w: 240, z: 20, flip: true });
      wg = k.character('whirligig', { x: 420, y: 370, w: 240, z: 19 });
      k.set(wg, { opacity: 0 });
    });
    k.music('adventure');
    organ();
    whirr(2);
    // The whole land sways as it goes round (a little).
    const sway = k.to(k.root, 1.6, { rotation: 1.5, ease: 'sine.inOut' }).then(() => k.to(k.root, 1.6, { rotation: 0, ease: 'sine.inOut' }));
    await k.all(k.say('dizzy', sauce), k.shake(sauce, 8, 3), sway);

    // Mr Whirligig rushes in, ringing his bell.
    await k.enter(wg, 'left', 0.6);
    await k.all(k.say('run', wg), ringBell(k, wg, 4));
    void k.exit(wg, 'right', 0.8);

    // He tiptoes off… but his saucepans clank too loudly to hide.
    k.fx.sneak();
    const tiptoe = (async () => {
      for (let i = 0; i < 3; i++) {
        clank(3, 1.5);
        await k.walk(sauce, -70, 0.6, 2);
      }
    })();
    await tiptoe;
    snigger();
    await k.all(...caps.map((c, i) => k.wait(i * 200).then(() => k.to(c, 0.5, { y: 0, opacity: 1, ease: 'power2.out' }))));
    // Out they come: three red goblins, sneaking up.
    const gobs = [
      goblin(k, 'g1', { x: 120, y: 360, w: 170, z: 22 }),
      goblin(k, 'g2', { x: 250, y: 380, w: 160, z: 23 }),
      goblin(k, 'g3', { x: 1000, y: 370, w: 160, z: 21, flip: true }),
    ];
    k.set(gobs, { opacity: 0 });
    void k.all(...caps.map((c) => k.to(c, 0.3, { y: 110, opacity: 0, ease: 'power2.in' })));
    await k.all(k.enter(gobs[0], 'left', 0.6), k.enter(gobs[1], 'left', 0.7), k.enter(gobs[2], 'right', 0.7));
    await k.all(k.say('hear', gobs[0]), k.hop(gobs[1], 20, 2));

    // They hoist him up onto their shoulders, and run off with him, clanking.
    // Nobody is hurt: he is carried, and he complains all the way.
    k.fx.patter(6, 0.1);
    await k.all(k.to(gobs[0], 0.5, { x: 480, ease: 'power2.inOut' }), k.to(gobs[1], 0.5, { x: 400, ease: 'power2.inOut' }), k.to(gobs[2], 0.5, { x: -260, ease: 'power2.inOut' }));
    clank(6, 1.5);
    await k.to(sauce, 0.4, { y: -130, ease: 'back.out(1.6)' });
    const cart = k.all(
      together(k, gobs, 2.2, { x: '-=1300', ease: 'power1.in' }),
      k.to(sauce, 2.2, { x: '-=1300', ease: 'power1.in' }),
      k.wait(300).then(() => clank(8, 1.2)),
    );
    await k.all(k.say('down', sauce), cart);

    // ------------------------------------------- scene 3: the land spins away
    let h3!: HTMLElement;
    let s3!: HTMLElement;
    let m3!: HTMLElement;
    let land!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l13c8-tree2'));
      land = k.landFar(13, { x: box.x, y: box.y, w: box.w, z: 4 });
      k.dim(0.32, '#2a1838');
      h3 = k.character('hero', { x: 30, y: 500, w: 230, z: 40 });
      s3 = k.character('silky', { x: 470, y: 470, w: 230, z: 40 });
      m3 = k.character('moonface', { x: 920, y: 500, w: 230, z: 40, flip: true });
    });
    k.music('dreamy');
    k.float(s3, 6, 2.4);
    // Round and round, up and away into the sky.
    k.fx.rumble(3);
    whirr(3);
    const away = k.to(land, 5.5, { rotation: 720, y: -260, scale: 0.4, opacity: 0, ease: 'power1.in' });
    await k.wait(1200);
    // His voice, far off, and the clanks getting fainter.
    clank(3, 0.6);
    await k.all(k.say('fine'), k.wait(1800).then(() => clank(3, 0.3)));
    await away;
    // A roundabout ticket floats down, and Silky catches it.
    // It flutters down (side to side) into Silky's hands, by her wand.
    const ticket = k.keepsake(k.chapter?.keepsake ?? 'roundaboutTicket', { x: 600, y: 560, w: 110, z: 45 });
    k.set(ticket, { x: -60, y: -720 });
    k.fx.twinkle();
    const flutter = async () => {
      for (const x of [60, -40, 0]) await k.to(ticket, 0.8, { x, rotation: x / 3, ease: 'sine.inOut' });
    };
    await k.all(k.to(ticket, 2.4, { y: 0, ease: 'sine.out' }), flutter());
    k.sparkle(655, 610, 10, 90);
    await k.all(k.say('promise', h3), k.hop(h3, 26, 1));
    await k.all(k.say('after', m3), wave(k, m3, 'armL', 2));

    // ------------------------------------------- scene 4: somewhere dark
    let gob!: HTMLElement;
    await k.cut(() => {
      k.backdrop(goblinHole());
      gob = k.character('redGoblin', { x: 450, y: 420, w: 280, z: 10 });
      k.add(holeLip(), { x: 0, y: 0, w: 1180, h: 820, z: 12, still: true });
      k.light(590, 520, 240, { color: '#c9573a', strength: 0.25, z: 11 });
      k.set(gob, { y: 220 });
    });
    k.music('spooky');
    // A drum, somewhere deep down: boom… boom.
    k.fx.drumroll(1);
    await k.wait(700);
    k.fx.sneak();
    await k.to(gob, 1.4, { y: 0, ease: 'power2.out' });
    snigger();
    await k.all(k.say('gloat', gob), k.camera({ zoom: 1.3, x: 590, y: 420 }, 2.4));
    k.silence();
    sting();
    await k.to(gob, 0.8, { y: 220, ease: 'power2.in' });
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(1200);
  },
});
