/**
 * Land 10, chapter 7: Silky's Cell.
 *
 * The top of the tallest tower. Fran hears singing: Silky is behind the
 * bars of the last cell! She's thrilled to see {name}. The dewdrop she
 * dropped in the Land of Spells glows when it comes near her, and glows
 * brighter with every right answer, so {name} does four quick sums (the
 * chapter's mix: 26 + 24, 75 − 25, 10 fives, half of 100), and every answer
 * is 50. The drop shines like a little moon. Her cell lock is still shut
 * (it opens only in the finale). Then, up the stairs: clack. Clack. CLACK.
 * Her shadow fills the doorway and she shrieks: who is in her tower?
 * Moon-Face gathers everyone together. Next: The Last Snap.
 *
 * Fran is the host. If Fran is the child he climbs with, Beth says her lines.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, together } from './bits';
import { answerTag, cellBars, dewdrop, prisonSound, slateSum, snapShadow, towerTop } from './snapPrison';

const BARS = { x: 100, y: 120, w: 440 };
const SLATE = { x: 540, y: 40, w: 330 };
const DROP = { x: 460, y: 320, w: 100 };
const SUMS = ['26 + 24', '75 − 25', '10 × 5', 'half of 100'];

export default defineStory({
  lines: {
    hear_fran: { who: 'fran', text: 'Listen! Singing! It’s Silky, behind those bars!' },
    hear_beth: { who: 'beth', text: 'Listen! Singing! It’s Silky, behind those bars!' },
    silky: { who: 'silky', text: '{name}! You came! Oh, my dewdrop! Is it glowing?' },
    sums: { who: 'narrator', text: '{name} did four sums, and every answer was 50. The dewdrop shone like a little moon!' },
    clack: { who: 'narrator', text: 'Then, up the stairs… clack. Clack. CLACK.' },
    who: { who: 'dameSnap', text: 'WHO is up in MY tower?' },
    together: { who: 'moonface', text: 'She’s coming. Everyone, stand together. This is it.' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'fran', 'beth');
    k.backdrop(towerTop('l10c7-tower'));
    const gloom = k.dim(0.3, '#0b0a14');
    k.light(330, 110, 90, { color: C.moonPale, strength: 0.3 });
    k.light(800, 220, 120, { color: '#d9e2cf', strength: 0.25, flicker: true });
    k.ambient('dust', { count: 8, area: [0, 80, 1180, 500] });

    // Silky, behind the bars, with a soft glow of her own.
    const glow = k.light(320, 300, 170, { color: C.goldLight, strength: 0.3, z: 34 });
    const silky = k.character('silky', { x: 190, y: 170, w: 260, z: 35 });
    k.add(cellBars('l10c7', '? ? ?'), { ...BARS, z: 36 });
    k.float(silky, 6, 2.2);

    const mf = k.character('moonface', { x: 0, y: 520, w: 190, z: 40 });
    const hero = k.character('hero', { x: 330, y: 450, w: 220, z: 40 });
    const hostEl = k.character(host, { x: 570, y: 460, w: 210, z: 40 });
    const gang = [mf, hero, hostEl];
    k.set(gang, { opacity: 0 });
    await k.wait(300);
    await k.all(...gang.map((el, i) => k.wait(i * 160).then(() => k.enter(el, 'right', 0.9))));

    // Singing, up here at the top.
    k.music('dreamy');
    prisonSound.song();
    await k.all(k.say(`hear_${host}`, hostEl), k.hop(hostEl, 24));

    // Silky sees him. The dewdrop glows near her.
    const drop = k.add(dewdrop('l10c7-drop'), { ...DROP, z: 38 });
    const shine = k.light(DROP.x + 50, DROP.y + 60, 70, { color: C.dew, strength: 0.2, z: 37 });
    k.set(drop, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(drop, 0.4);
    k.float(drop, 5, 1.6);
    void k.fade(glow, 0.45, 0.6);
    await k.all(k.say('silky', silky), k.to(k.part(silky, 'wingL'), 0.3, { rotation: 10, yoyo: true, repeat: 3 }));

    // Four sums. Every answer is 50, and the drop shines brighter each time.
    const sl = k.add(slateSum(SUMS[0], SLATE.w, 'c7'), { ...SLATE, z: 25 });
    k.set(sl, { opacity: 0 });
    const summing = async () => {
      let cur = sl;
      for (const [i, s] of SUMS.entries()) {
        if (i > 0) {
          k.remove(cur);
          cur = k.add(slateSum(s, SLATE.w, 'c7'), { ...SLATE, z: 25 });
        }
        k.set(cur, { opacity: 0 });
        prisonSound.chalk(0.4);
        await k.appear(cur, 0.25);
        const tag = k.add(answerTag('50'), { x: SLATE.x + 110, y: SLATE.y + 110, w: 110, z: 26 });
        k.set(tag, { opacity: 0 });
        await k.wait(350);
        await k.appear(tag, 0.25);
        k.fx.pop();
        void k.fade(shine, 0.3 + i * 0.15, 0.4);
        void k.pop(drop, 1.15);
        await k.wait(600);
        k.remove(tag);
      }
      k.remove(cur);
      k.sfx.sparkle();
      k.sparkle(DROP.x + 50, DROP.y + 60, 14, 140);
    };
    await k.all(k.say('sums'), summing());
    await k.all(k.hop(hero, 30), k.hop(hostEl, 24), k.hop(mf, 20));

    // Clack. Clack. CLACK. Her shadow fills the stair doorway.
    k.silence();
    void k.fade(glow, 0.15, 0.8);
    void k.fade(shine, 0.25, 0.8);
    const shade = k.add(snapShadow('l10c7-shadow'), { x: 900, y: 200, w: 230, z: 5 });
    const lamp = k.light(1010, 460, 220, { color: C.candle, strength: 0, z: 4 });
    k.set(shade, { opacity: 0, scale: 0.4, transformOrigin: '50% 100%' });
    const clacks = k.say('clack');
    for (const [i, loud] of [0.4, 0.7, 1].entries()) {
      prisonSound.heels(1, 0.3, loud);
      void k.to(shade, 0.5, { opacity: 0.45 + i * 0.25, scale: 0.6 + i * 0.2 });
      void k.fade(lamp, 0.15 + i * 0.12, 0.5);
      await k.wait(800);
    }
    await clacks;
    k.music('spooky');
    prisonSound.ruler();
    void k.fade(gloom, 0.42, 0.4);
    void k.quake(6);
    void k.camera({ zoom: 1.4, x: 1000, y: 380 }, 0.6);
    await k.all(k.say('who'), k.shake(shade, 4, 2), k.shake(silky, 4, 2));

    // Cut back to the heroes: close together, brave.
    void k.camera({}, 0.7);
    k.face(mf, true);
    await k.all(k.say('together', mf), together(k, gang, 0.8, { x: '+=40', ease: 'sine.inOut' }));
    k.fx.twinkle();
    void k.pop(drop, 1.2);
    prisonSound.heels(2, 0.3, 1);
    await k.wait(900);
  },
});
