/**
 * Land 4, chapter 3: Desks in Rows.
 *
 * Inside her classroom the little desks stand in rows, two by two. Dame
 * Snap clacks in and SNAPS her ruler on an empty desk: doubles all morning,
 * and not a squeak. Moon-Face is far too round for his desk (the lid keeps
 * popping up). When she stalks off, Beth whispers that everything here
 * comes in pairs, and {name} does the doubles with the inkwell's quill.
 * Crack goes Rule Four. Beth spots Rule Number One. Next: Rule Number One:
 * No Fun.
 *
 * Beth is the host. If Beth is the child he climbs with, Beth says the
 * lines and Joe sits with them.
 */
import { C, defineStory, type Kit } from './kit';
import { chalkText, classroom, crackRule, deskFront, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 410, y: 70, w: 360 };

export default defineStory({
  lines: {
    rows: { who: 'narrator', text: 'Inside, the little desks stood in rows. Two by two, all the way back.' },
    sit: { who: 'dameSnap', text: 'SIT! Doubles all morning. And not one squeak!' },
    squeak: { who: 'moonface', text: 'Ooh, this desk is rather small for a round chap like me!' },
    pairs: { who: 'beth', text: 'Psst! Everything here comes in pairs. Doubles are easy!' },
    crack: { who: 'narrator', text: '{name} did every double. Crack! Another of her rules split in two.' },
    next: { who: 'beth', text: 'Look at Rule Number One. No fun? We’ll see about that!' },
  },

  async play(k: Kit) {
    k.backdrop(classroom());
    k.music('spooky');
    k.dim(0.15, '#14121c');
    k.light(135, 240, 150, { color: '#9aa0c0', strength: 0.25 });
    k.light(1045, 240, 150, { color: '#9aa0c0', strength: 0.25 });
    k.ambient('dust', { count: 12, area: [0, 100, 1180, 500] });

    const board = k.add(rulesBoard([RULE_FOR[1], RULE_FOR[2]]), { ...BOARD, z: 6 });
    const hero = k.character('hero', { x: 20, y: 330, w: 240, z: 20 });
    const sib = k.character(k.hero === 'beth' ? 'joe' : 'beth', { x: 250, y: 335, w: 235, z: 20 });
    const mf = k.character('moonface', { x: 880, y: 315, w: 260, z: 20 });
    const beth = k.hero === 'beth' ? hero : sib;
    const desks = [
      k.add(deskFront('a'), { x: 0, y: 560, w: 270, z: 24 }),
      k.add(deskFront('b'), { x: 230, y: 560, w: 270, z: 24 }),
      k.add(deskFront('c'), { x: 870, y: 560, w: 280, z: 24 }),
    ];
    const mfDesk = desks[2];
    k.set(board, { opacity: 0.95 });

    await k.wait(300);
    snapSound.caw(1);
    await k.say('rows');

    // Heels clack in from the corridor; she snaps her ruler on an empty desk.
    const snap = k.snap('loom', { x: 470, y: 150, w: 320, z: 14 });
    k.set(snap, { opacity: 0, x: 500 });
    snapSound.heels(6, 0.3);
    k.set(snap, { opacity: 1 });
    await k.to(snap, 1.6, { x: 0, ease: 'power1.out' });
    void k.camera({ zoom: 1.3, x: 620, y: 380 }, 0.6);
    k.pose(snap, 'stomp');
    snapSound.ruler();
    void k.quake(6);
    await k.all(k.shake(hero, 5, 1), k.shake(sib, 5, 1), k.shake(mf, 5, 1));
    k.pose(snap, 'shriek');
    await k.say('sit', snap);

    // Moon-Face is too round for his desk: the lid pops up. Boing!
    void k.camera({}, 0.8);
    k.pose(snap, 'point');
    k.set(mfDesk, { transformOrigin: '90% 100%' });
    k.fx.boing();
    await k.to(mf, 0.2, { y: -24 });
    await k.to(mfDesk, 0.15, { rotation: -6 });
    const squeak = k.say('squeak', mf);
    await k.all(k.to(mf, 0.3, { y: 0, ease: 'bounce.out' }), k.to(mfDesk, 0.3, { rotation: 0, ease: 'bounce.out' }));
    k.fx.creak();
    await squeak;

    // She glares, then stalks off to the window and slams it.
    snapSound.heels(4, 0.26);
    await k.exit(snap, 'left', 1.0);
    snapSound.slam();
    k.remove(snap);

    // Beth whispers: everything comes in pairs.
    await k.say('pairs', beth);
    const sl = k.add(slate(330, 190), { x: 520, y: 430, w: 330, z: 22 });
    const well = k.keepsake('inkwell', { x: 470, y: 440, w: 120, z: 26 });
    k.set([sl, well], { opacity: 0 });
    await k.all(k.appear(sl, 0.3), k.appear(well, 0.3));
    const told = k.say('crack');
    for (const [i, s] of ['3 + 3 = 6', '4 + 4 = 8'].entries()) {
      const el = k.add(chalkText(s, { w: 290, size: 50 }), { x: 540, y: 448 + i * 70, w: 290, z: 25 });
      k.set(el, { opacity: 0 });
      snapSound.chalk(0.5);
      await k.all(k.fade(el, 1, 0.5), k.to(well, 0.25, { rotation: -12, yoyo: true, repeat: 1, ease: 'sine.inOut' }));
      k.fx.pop();
      await k.wait(200);
    }
    await crackRule(k, BOARD, RULE_FOR[3]);
    k.sparkle(680, 520, 12, 140);
    k.sfx.sparkle();
    void k.hop(hero, 30);
    void k.hop(sib, 30);
    await k.hop(mf, 30);
    await told;

    // Rule Number One glows red-hot at the top of the board.
    const glow = k.light(BOARD.x + 120, BOARD.y + 92, 110, { color: C.ruler, strength: 0.0, z: 30 });
    void k.camera({ zoom: 1.35, x: 590, y: 300 }, 1.2);
    await k.all(k.fade(glow, 0.5, 0.8), k.say('next', beth));
    snapSound.heels(3, 0.3, 0.5);
    await k.wait(700);
  },
});
