/**
 * Land 11, chapter 6: Bedtime in the Toe.
 *
 * Night in the meadow, the shoe's windows lit. Twelve sleepy children and
 * three little beds in the toe: Fran shares them out fairly, one into
 * each bed in turn, again and again, until there are four in each (the
 * chapter's sharing), and the Old Woman marks it on the bedtime chart,
 * four tally marks over every bed (the chapter's tally). The bedtime
 * candle is lit. Then, in the hush, a rustle and a tiny jingle up in the
 * laces… Next: A Red Cap in the Laces.
 *
 * Fran is the host. If Fran is the child he climbs with, Beth says her lines.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { bed, jingle, SHOE, showMark, sleepyHead, tallyMarks } from './shoe';

const BEDS = [230, 465, 700];
const BED_Y = 450;
const QUILTS = [C.blue, C.rose, C.green];

export default defineStory({
  lines: {
    share_fran: { who: 'fran', text: 'Twelve sleepy children, and three beds. Let’s share them out fairly!' },
    share_beth: { who: 'beth', text: 'Twelve sleepy children, and three beds. Let’s share them out fairly!' },
    count: { who: 'narrator', text: 'One in each bed, again and again. Four, four and four!' },
    chart: { who: 'oldWoman', text: 'Four in every bed. I’ll mark it on the bedtime chart. Night night, my dears!' },
    rustle_fran: { who: 'fran', text: 'Shh, they’re all asleep. Wait… what was that rustle, up in the laces?' },
    rustle_beth: { who: 'beth', text: 'Shh, they’re all asleep. Wait… what was that rustle, up in the laces?' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'fran', 'beth');
    k.landScene();
    k.dim(0.55, '#101632');
    k.light(110, 90, 70, { color: C.moonPale, strength: 0.5 });
    for (const [x, y] of SHOE.windows) k.light(x, y, 70, { color: C.candle, strength: 0.55, flicker: true });
    k.ambient('stars', { count: 18, area: [0, 0, 1180, 260] });
    k.music('dreamy');

    const ow = k.character('oldWoman', { x: -10, y: 380, w: 220, z: 20 });
    const hostEl = k.character(host, { x: 930, y: 390, w: 220, z: 20, flip: true });
    k.set([ow, hostEl], { opacity: 0 });
    const beds = BEDS.map((x, i) => k.add(bed(QUILTS[i], `l11c6-bed-${i}`), { x, y: BED_Y, w: 220, z: 16 }));
    k.set(beds, { opacity: 0 });
    await k.all(k.enter(ow, 'left'), k.enter(hostEl, 'right'), ...beds.map((b, i) => k.wait(i * 150).then(() => k.appear(b, 0.35))));

    // ---- Twelve sleepy heads in a row, waiting for a bed.
    const ROW_X = (i: number): number => 240 + i * 58;
    const heads = Array.from({ length: 12 }, (_, i) => {
      const el = k.add(sleepyHead(i), { x: ROW_X(i), y: 180, w: 60, z: 18 });
      k.set(el, { opacity: 0 });
      return el;
    });
    const lining = async () => {
      for (const el of heads) {
        void k.appear(el, 0.25);
        await k.wait(90);
      }
    };
    await k.all(k.say(`share_${host}`, hostEl), lining());

    // ---- Dealt out one at a time: one into each bed, again and again.
    const dealing = async () => {
      await k.wait(300);
      for (let i = 0; i < 12; i++) {
        const b = i % 3;
        const slot = Math.floor(i / 3);
        const tx = BEDS[b] + 26 + slot * 40;
        const ty = BED_Y + 4;
        await k.to(heads[i], 0.32, { x: tx - ROW_X(i), y: ty - 180, ease: 'power2.inOut' });
        k.fx.pop();
        await k.wait(70);
      }
    };
    await k.all(k.say('count'), dealing());

    // ---- The bedtime chart: four marks over every bed.
    const marks = BEDS.map((x, i) => tallyMarks(k, x + 30, 330, 4, { scale: 0.8, z: 24, name: `l11c6-t${i}` }));
    const tags = BEDS.map((x, i) => {
      const t = k.add(roundTag(4, C.goldLight, `l11c6-four-${i}`), { x: x + 130, y: 340, w: 72, z: 26 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const charting = async () => {
      for (let b = 0; b < 3; b++) {
        for (const m of marks[b]) await showMark(k, m, false);
        await k.appear(tags[b], 0.25);
      }
      k.sfx.success();
    };
    await k.all(k.say('chart', ow), charting());

    // The bedtime candle, and sleep.
    const candle = k.keepsake('nightlight', { x: 900, y: 560, w: 100, z: 26 });
    k.set(candle, { opacity: 0 });
    await k.appear(candle, 0.35);
    k.light(950, 600, 120, { color: C.candle, strength: 0.4, flicker: true, z: 43 });
    await k.all(k.exit(ow, 'left', 0.8), ...[...marks.flat(), ...tags].map((m) => k.fade(m, 0, 0.6)));

    // ---- A rustle and a tiny jingle, up in the laces.
    k.silence();
    jingle();
    const glint = k.light(SHOE.laces.x, SHOE.laces.y, 40, { color: '#f2d43a', strength: 0, z: 39 });
    const rustle = k.say(`rustle_${host}`, hostEl);
    await k.wait(900);
    void k.to(glint, 0.4, { opacity: 0.8, ease: 'sine.out' });
    await k.camera({ zoom: 1.4, x: SHOE.laces.x - 60, y: SHOE.laces.y + 80 }, 1.2);
    jingle();
    await k.to(glint, 0.6, { opacity: 0, ease: 'sine.in' });
    await rustle;
    await k.camera({}, 0.8);
    await k.wait(400);
  },
});
