/**
 * Land 4, chapter 6: Detention!
 *
 * A gloomy detention room with one high window and the school bell on the
 * wall. The Angry Pixie is in detention and FURIOUS. Dame Snap looms in
 * the doorway: stay until the bell rings, and not one squeak. He gives her
 * a squeak all right (a long, rude SQUEEEAK), and she slams the door. The
 * bell only rings when the sums are done, so {name} does them; the bell
 * wobbles, wobbles and DINGS, and the rule against shouting cracks. Then
 * something taps at the window: Silky. Next: The Secret Key.
 */
import { bell, C, defineStory, NOTE, now, tone, type Kit } from './kit';
import { chalkText, classroom, crackRule, deskFront, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 380, y: 40, w: 300 };
const SLATE = { x: 330, y: 360, w: 400, h: 230 };

/** The Pixie's long, rude squeak. */
function squeak(): void {
  const t = now();
  tone(900, t, { wave: 'square', peak: 0.04, attack: 0.03, decay: 0.9, glideTo: 1600, vibrato: [12, 40], lowpass: 2600 });
}

/** The school bell ringing at last. */
function ding(): void {
  const t = now();
  for (let i = 0; i < 3; i++) bell(NOTE.E5, t + i * 0.32, 0.12, 1.2);
}

/** Tapping on glass. */
function tap(): void {
  const t = now();
  for (let i = 0; i < 3; i++) tone(2400, t + i * 0.16, { wave: 'triangle', peak: 0.06, attack: 0.002, decay: 0.05 });
}

export default defineStory({
  lines: {
    furious: { who: 'narrator', text: 'The Angry Pixie was in detention. And he was FURIOUS.' },
    stay: { who: 'dameSnap', text: 'You stay there until that bell rings. Not one squeak!' },
    squeak: { who: 'pixie', text: 'Not one squeak? I’ll give her a squeak! SQUEEEAK!' },
    sums: { who: 'hero', text: 'Shh! The bell rings when the sums are done. Let’s do them, {name}!' },
    ding: { who: 'narrator', text: '{name} got every sum right. DING! And her shouting rule cracked!' },
    tap: { who: 'pixie', text: 'Ha! Now, who’s that tapping at the window?' },
  },

  async play(k: Kit) {
    k.backdrop(classroom({ rows: false, name: 'l4c6-detention' }));
    k.music('spooky');
    const dim = k.dim(0.3, '#14121c');
    k.light(135, 240, 160, { color: '#9aa0c0', strength: 0.3 });
    k.light(530, 640, 280, { color: C.candle, strength: 0.18 });
    k.ambient('dust', { count: 8, area: [0, 100, 1180, 500] });

    const board = k.add(rulesBoard([1, 2, 3, 4, 5].map((n) => RULE_FOR[n])), { ...BOARD, z: 6 });
    const theBell = k.keepsake('bell', { x: 750, y: 50, w: 170, z: 8 });
    const pixie = k.character('pixie', { x: 40, y: 330, w: 260, z: 20 });
    const hero = k.character('hero', { x: 820, y: 340, w: 250, z: 20 });
    k.add(deskFront('pixie'), { x: 20, y: 560, w: 280, z: 24 });
    k.add(deskFront('hero'), { x: 800, y: 560, w: 280, z: 24 });
    k.set(board, { opacity: 0.95 });
    k.set(theBell, { transformOrigin: '50% 10%' });

    // The Pixie, furious, steaming.
    const puff = k.part(pixie, 'puff');
    if (!k.calm) void k.to(puff, 0.35, { scale: 1.25, yoyo: true, repeat: 6, ease: 'sine.inOut' });
    await k.wait(300);
    await k.all(k.say('furious'), k.shake(pixie, 5, 3));

    // She looms in the doorway.
    const snap = k.snap('loom', { x: 440, y: 160, w: 330, z: 14 });
    k.set(snap, { opacity: 0, scale: 0.85, transformOrigin: '50% 100%' });
    snapSound.heels(4, 0.28);
    await k.to(snap, 0.5, { opacity: 1, scale: 1, ease: 'back.out(1.3)' });
    void k.camera({ zoom: 1.25, x: 600, y: 360 }, 0.7);
    k.pose(snap, 'point');
    snapSound.ruler();
    await k.say('stay', snap);

    // He gives her a squeak. She slams the door.
    void k.camera({}, 0.5);
    squeak();
    await k.all(k.say('squeak', pixie), k.hop(pixie, 36, 2));
    k.pose(snap, 'shriek');
    await k.shake(snap, 6, 2);
    snapSound.heels(3, 0.2);
    await k.to(snap, 0.35, { opacity: 0, scale: 0.85 });
    k.remove(snap);
    snapSound.slam();
    void k.quake(7);
    void k.shake(theBell, 4, 2);
    await k.wait(300);

    // The sums that ring the bell.
    await k.say('sums', hero);
    const sl = k.add(slate(SLATE.w, SLATE.h, 'det'), { ...SLATE, z: 18 });
    k.set(sl, { opacity: 0 });
    await k.appear(sl, 0.3);
    const told = k.say('ding');
    for (const [i, s] of ['7 − 3 = 4', '5 + 4 = 9', '10 − 6 = 4'].entries()) {
      const el = k.add(chalkText(s, { w: 340, size: 50 }), { x: SLATE.x + 30, y: SLATE.y + 16 + i * 64, w: 340, z: 19 });
      k.set(el, { opacity: 0 });
      snapSound.chalk(0.4);
      await k.fade(el, 1, 0.4);
      await k.to(theBell, 0.12, { rotation: 10, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    }
    ding();
    void k.to(theBell, 0.2, { rotation: 18, yoyo: true, repeat: 5, ease: 'sine.inOut' });
    k.light(835, 140, 130, { color: C.goldLight, strength: 0.45 });
    void k.fade(dim, 0.18, 0.6);
    await crackRule(k, BOARD, RULE_FOR[6]);
    k.sparkle(830, 140, 14, 160);
    k.sfx.sparkle();
    await k.all(k.hop(pixie, 40, 2), k.hop(hero, 30), told);

    // Tap, tap, tap at the window: a little face with wings.
    tap();
    const silky = k.character('silky', { x: 70, y: 100, w: 150, z: 9 });
    k.set(silky, { opacity: 0, y: 30 });
    await k.all(k.fade(silky, 1, 0.5), k.to(silky, 0.5, { y: 0 }));
    k.float(silky, 6, 1.6);
    k.light(145, 190, 90, { color: C.goldLight, strength: 0.4 });
    tap();
    await k.say('tap', pixie);
    k.fx.twinkle();
    await k.wait(700);
  },
});
