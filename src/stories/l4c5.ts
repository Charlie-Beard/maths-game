/**
 * Land 4, chapter 5: Lines on the Blackboard.
 *
 * Moon-Face at the blackboard, writing lines: "I must not smile." Dame
 * Snap looms over him, tapping her ruler, wants a hundred, and clacks off
 * (door slam). Moon-Face despairs comically ("my arm will drop off!"), so
 * {name} rubs the lines out and chalks right sums instead, odd and even
 * labelled. Crack goes the rule against helping. She clacks back and
 * shrieks at the board: those are RIGHT ANSWERS! Moon-Face just beams.
 * From down the corridor, a furious little voice. Next: Detention!
 */
import { C, defineStory, type Kit } from './kit';
import { chalkText, classroom, crackRule, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 20, y: 40, w: 250 };
/** The big blackboard on the wall. */
const BIG = { x: 290, y: 60, w: 470, h: 300 };

export default defineStory({
  lines: {
    lines: { who: 'narrator', text: 'Moon-Face had to write lines. I must not smile. I must not smile…' },
    hundred: { who: 'dameSnap', text: 'One HUNDRED lines! And I’ll be back to check them!' },
    help: { who: 'moonface', text: 'A hundred? My arm will drop off! Help, {name}!' },
    sums: { who: 'narrator', text: '{name} turned her lines into right sums. Crack went another rule!' },
    shriek: { who: 'dameSnap', text: 'Those aren’t LINES! Those are RIGHT ANSWERS!' },
    pixie: { who: 'pixie', text: 'LET ME OUT! Who put ME in detention?' },
  },

  async play(k: Kit) {
    k.backdrop(classroom());
    k.music('spooky');
    k.dim(0.15, '#14121c');
    k.ambient('dust', { count: 10, area: [0, 100, 1180, 500] });

    const board = k.add(rulesBoard([RULE_FOR[1], RULE_FOR[2], RULE_FOR[3], RULE_FOR[4]]), { ...BOARD, z: 6 });
    k.add(slate(BIG.w, BIG.h, 'big'), { ...BIG, z: 6 });
    const mf = k.character('moonface', { x: 40, y: 310, w: 260, z: 20 });
    const hero = k.character('hero', { x: 930, y: 380, w: 230, z: 20 });
    k.set(board, { opacity: 0.95 });

    // Moon-Face writes lines; she looms behind, tapping her ruler.
    const snap = k.snap('loom', { x: 760, y: 130, w: 330, z: 16 });
    const ruler = k.part(snap, 'ruler');
    void k.to(ruler, 0.3, { rotation: -10, yoyo: true, repeat: 7, ease: 'sine.inOut' });
    const chalkLines = [0, 1, 2].map((i) => {
      const el = k.add(chalkText('I must not smile.', { w: 400, size: 40 }), { x: BIG.x + 35, y: BIG.y + 30 + i * 62, w: 400, z: 8 });
      k.set(el, { opacity: 0 });
      return el;
    });
    await k.wait(300);
    const said = k.say('lines');
    for (const el of chalkLines) {
      snapSound.chalk(0.6);
      void k.to(mf, 0.3, { rotation: 3, yoyo: true, repeat: 1 });
      await k.fade(el, 1, 0.7);
      snapSound.ruler();
      await k.wait(250);
    }
    await said;
    k.pose(snap, 'point');
    await k.say('hundred', snap);

    // She clacks out. SLAM.
    snapSound.heels(5, 0.24);
    await k.exit(snap, 'right', 1.0);
    snapSound.slam();
    k.remove(snap);

    // Moon-Face despairs, comically. {name} helps.
    await k.all(k.say('help', mf), k.shake(mf, 5, 2));
    k.fx.poof();
    k.puff(BIG.x + 235, BIG.y + 110, 220, C.chalk);
    chalkLines.forEach((el) => k.remove(el));
    const told = k.say('sums');
    const sums: [string, string][] = [
      ['2 + 3 = 5', 'odd'],
      ['6 + 2 = 8', 'even'],
      ['9 − 2 = 7', 'odd'],
    ];
    for (const [i, [sum, label]] of sums.entries()) {
      const el = k.add(chalkText(sum, { w: 280, size: 52 }), { x: BIG.x + 20, y: BIG.y + 24 + i * 76, w: 280, z: 8 });
      const tag = k.add(chalkText(label, { w: 150, size: 44, color: label === 'odd' ? C.goldLight : C.sky }), { x: BIG.x + 300, y: BIG.y + 28 + i * 76, w: 150, z: 8 });
      k.set([el, tag], { opacity: 0 });
      snapSound.chalk(0.4);
      await k.fade(el, 1, 0.4);
      k.fx.pop();
      await k.appear(tag, 0.25);
      await k.wait(120);
    }
    await crackRule(k, BOARD, RULE_FOR[5]);
    k.sfx.sparkle();
    const kept = k.keepsake('blackboard', { x: 300, y: 430, w: 140, z: 22 });
    k.set(kept, { opacity: 0 });
    await k.appear(kept, 0.35);
    k.sparkle(370, 480, 10, 100);
    await k.all(k.hop(mf, 30, 2), k.hop(hero, 30), told);

    // She clacks back in and shrieks at the board. Moon-Face only beams.
    const back = k.snap('shriek', { x: 760, y: 130, w: 330, z: 16 });
    k.set(back, { x: 500 });
    snapSound.heels(4, 0.2);
    await k.to(back, 0.8, { x: 0, ease: 'power2.out' });
    snapSound.ruler();
    void k.quake(6);
    void k.camera({ zoom: 1.25, x: 760, y: 360 }, 0.6);
    await k.all(k.say('shriek', back), k.shake(back, 5, 2));
    void k.camera({}, 0.6);
    const glow = k.part(mf, 'glow');
    void k.to(glow, 0.4, { scale: 1.2, yoyo: true, repeat: 1 });
    await k.hop(mf, 16);

    // From down the corridor: someone very, very cross.
    snapSound.slam();
    void k.quake(4);
    k.pose(back, 'loom');
    await k.all(k.say('pixie'), k.shake(hero, 5, 2));
    await k.to(back, 0.3, { rotation: -6 });
    await k.wait(400);
  },
});
