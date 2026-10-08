/**
 * Land 10, chapter 6: The Hardest Sum.
 *
 * Her prison classroom, by lamplight. Moon-Face whispers "Hide!", the
 * Saucepan Man hears "Slide!", and he skids in across the floor with a
 * clatter, right in front of Dame Snap at her blackboard. She looms and
 * shrieks; he mishears again (jam? strawberry, please!). While she shouts
 * at him, {name} creeps up and chalks the answer to her sum: 47 add 53
 * makes 100 (the chapter's missing numbers to 100). She sees it and
 * shrieks louder: then she'll write her HARDEST sum, one no child could
 * ever do (the finale's sum, foreshadowed). Cut back to the heroes, hiding
 * under the desks until her heels clack away. Then, from up the tower
 * stairs, somebody singing. Next: Silky's Cell.
 */
import { C, defineStory, type Kit } from './kit';
import { together } from './bits';
import { chalkText, classroom, deskFront, slate } from './snapSchool';
import { prisonSound } from './snapPrison';

const BOARD = { x: 330, y: 60, w: 480, h: 250 };

export default defineStory({
  lines: {
    slide: { who: 'narrator', text: 'Moon-Face whispered, “Hide!” But the Saucepan Man heard “Slide!”' },
    who: { who: 'dameSnap', text: 'WHO is clanking in MY classroom?' },
    jam: { who: 'saucepan', text: 'Jam in your classroom? Ooh, yes please! Strawberry!' },
    answer: { who: 'narrator', text: 'While she shouted, {name} crept up and chalked the answer. 47 add 53 makes 100!' },
    hardest: { who: 'dameSnap', text: 'A RIGHT answer? Then I’ll write my HARDEST sum. No child could EVER do it!' },
    hide: { who: 'narrator', text: 'Everyone hid under the desks. Clack, clack, clack… and she was gone.' },
    singing: { who: 'saucepan', text: 'Hear that? Up the tower stairs! Somebody’s singing!' },
  },

  async play(k: Kit) {
    k.backdrop(classroom({ rows: false, name: 'l10c6-classroom' }));
    k.music('sneaky');
    const gloom = k.dim(0.35, '#0b0a14');
    k.light(570, 180, 260, { color: C.candle, strength: 0.25, flicker: true });
    k.ambient('dust', { count: 8, area: [0, 100, 1180, 500] });

    k.add(slate(BOARD.w, BOARD.h, 'l10c6'), { ...BOARD, z: 6 });
    const sum = k.add(chalkText('47 + ? = 100', { w: 440, size: 64 }), { x: BOARD.x + 20, y: BOARD.y + 50, w: 440, z: 7 });
    const ans = k.add(chalkText('53', { w: 120, size: 64, color: C.goldLight }), { x: BOARD.x + 140, y: BOARD.y + 140, w: 120, z: 7 });
    k.set(ans, { opacity: 0 });

    const snap = k.snap('loom', { x: 800, y: 140, w: 340, z: 36 });
    const hero = k.character('hero', { x: 10, y: 380, w: 220, z: 20 });
    const mf = k.character('moonface', { x: 200, y: 390, w: 210, z: 20 });
    const pan = k.character('saucepan', { x: 420, y: 370, w: 260, z: 22 });
    k.add(deskFront('l10c6-a'), { x: -10, y: 600, w: 420, z: 24 });
    k.add(deskFront('l10c6-b'), { x: 400, y: 610, w: 340, z: 24 });
    k.set([hero, mf], { opacity: 0 });
    k.set(pan, { x: -700 });

    // Peeping in at the door. Then the Saucepan Man mishears, and SLIDES.
    prisonSound.chalk(0.6);
    await k.all(k.enter(hero, 'left', 0.8), k.enter(mf, 'left', 0.9));
    const told = k.say('slide');
    await k.wait(1600);
    prisonSound.clank(6);
    k.fx.whizz();
    await k.to(pan, 1.0, { x: 0, rotation: -8, ease: 'power2.out' });
    prisonSound.clank(3);
    k.fx.crash();
    void k.to(pan, 0.3, { rotation: 0, ease: 'back.out(3)' });
    await told;

    // She whirls round and looms.
    k.music('spooky');
    prisonSound.ruler();
    k.pose(snap, 'shriek');
    void k.quake(6);
    void k.fade(gloom, 0.45, 0.4);
    void k.camera({ zoom: 1.35, x: 900, y: 330 }, 0.6);
    await k.all(k.say('who', snap), k.shake(snap, 4, 2));
    k.pose(snap, 'point');

    // Back to the Saucepan Man, who has heard "jam".
    void k.camera({ zoom: 1.15, x: 500, y: 450 }, 0.6);
    prisonSound.clank(3);
    void k.to(k.part(pan, 'pots'), 0.12, { rotation: 6, yoyo: true, repeat: 5, ease: 'sine.inOut' });
    await k.all(k.say('jam', pan), k.hop(pan, 24, 2));

    // While she shouts at him, {name} chalks the answer.
    void k.camera({}, 0.6);
    const chalking = async () => {
      hero.style.zIndex = '25';
      await k.to(hero, 0.9, { x: 380, y: -90, ease: 'sine.inOut' });
      prisonSound.chalk(0.6);
      await k.fade(ans, 1, 0.6);
      k.sparkle(BOARD.x + 200, BOARD.y + 180, 12, 120);
      k.sfx.sparkle();
      await k.wait(1400);
      await k.to(hero, 0.9, { x: 0, y: 0, ease: 'sine.inOut' });
      hero.style.zIndex = '20';
    };
    const shouting = async () => {
      for (let i = 0; i < 3; i++) {
        prisonSound.ruler();
        await k.to(snap, 0.15, { rotation: -3 }).then(() => k.to(snap, 0.3, { rotation: 0 }));
        await k.wait(500);
      }
    };
    await k.all(k.say('answer'), chalking(), shouting());

    // She sees it. A RIGHT answer!
    k.pose(snap, 'shriek');
    prisonSound.ruler();
    void k.quake(8);
    void k.camera({ zoom: 1.4, x: 880, y: 320 }, 0.5);
    await k.all(k.say('hardest', snap), k.shake(snap, 5, 3), k.pop(sum, 1.05));

    // Cut back to the heroes: under the desks, quiet as mice.
    k.pose(snap, 'loom');
    void k.camera({}, 0.6);
    k.music('sneaky');
    await together(k, [hero, mf, pan], 0.4, { y: '+=170', ease: 'power2.in' });
    const leaving = async () => {
      prisonSound.heels(6, 0.32, 0.8);
      await k.to(snap, 1.8, { x: 500, opacity: 0, ease: 'power1.in' });
      prisonSound.slam();
    };
    await k.all(k.say('hide'), leaving());
    void k.fade(gloom, 0.3, 0.6);

    // Up they pop. And from the tower stairs: singing.
    await together(k, [hero, mf, pan], 0.5, { y: '-=170', ease: 'back.out(1.4)' });
    prisonSound.song();
    k.music('magic');
    await k.all(k.say('singing', pan), k.hop(pan, 24), k.hop(hero, 30));
    await k.wait(600);
  },
});
