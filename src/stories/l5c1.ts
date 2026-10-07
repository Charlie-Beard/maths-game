/**
 * Land 5, chapter 1: Whose Birthday?
 *
 * Relief after Dame Snap's school: the Land of Birthdays, all bunting and
 * cake. Mr Oom Boom Boom marches in drumming, the hero toots a party
 * blower, and the balloons float up out of the grass: ten in a row… and
 * three more, thirteen (the chapter's teen numbers). A party hat drops out
 * of the sky for him. But whose birthday is it? Silky is lighting the
 * candles: maybe they will tell. Next: Candles in Tens.
 */
import { C, defineStory, noiseBurst, now, piece, rect, svg, tone, type Kit } from './kit';
import { numberTag } from './bits';

// ------------------------------------------------------------------ sounds

/** One beat of Mr Oom Boom Boom's big drum: a deep boom and a stick click. */
function boom(at = now(), loud = 1): void {
  tone(88, at, { peak: 0.24 * loud, attack: 0.005, decay: 0.32, glideTo: 50 });
  noiseBurst(at, { freq: 260, type: 'lowpass', peak: 0.12 * loud, decay: 0.14 });
  noiseBurst(at, { freq: 3200, q: 3, peak: 0.03 * loud, decay: 0.03 });
}

/** A party blower: a buzzy, wobbling paper toot that rises as it unrolls. */
function blower(): void {
  const t = now();
  tone(330, t, { wave: 'sawtooth', peak: 0.06, attack: 0.04, decay: 0.55, glideTo: 470, vibrato: [24, 16], lowpass: 1500 });
  tone(331, t, { wave: 'square', peak: 0.025, attack: 0.04, decay: 0.55, glideTo: 472, lowpass: 900 });
  noiseBurst(t, { freq: 1800, q: 1, peak: 0.03, attack: 0.04, decay: 0.5 });
}

/** A balloon floating up: a soft rising squeak, a little higher each time. */
function floatUp(n: number): void {
  const f = 420 + n * 38;
  tone(f, now(), { wave: 'triangle', peak: 0.06, attack: 0.01, decay: 0.16, glideTo: f * 1.4 });
}

// --------------------------------------------------------------------- art

/** A party blower: the mouthpiece and the paper tube, which unrolls (scaleX). */
function partyBlower(): string {
  return svg({ w: 200, h: 60, name: 'l5c1-blower' }, [
    piece(rect(0, 22, 34, 16, 5), C.gold, { edge: 'cut' }),
    piece(rect(30, 18, 166, 24, 12), C.raspberry, { edge: 'cut' }),
    ...[60, 100, 140, 176].map((x) => piece(rect(x, 18, 10, 24), C.lemon, { edge: 'cut', fibre: false, shadow: false })),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    boom: { who: 'oomboom', text: 'Oom boom boom! Welcome to the Land of Birthdays! It’s always somebody’s birthday here.' },
    whose: { who: 'hero', text: 'Bunting, balloons and a giant cake! But whose birthday is it today?' },
    count: { who: 'narrator', text: 'Up float the balloons. Ten in a row… and three more. Thirteen balloons!' },
    hat: { who: 'oomboom', text: 'And a party hat, just for {name}! Boom!' },
    next: { who: 'oomboom', text: 'Silky is lighting the candles. Maybe they’ll tell us whose birthday it is!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 16 });

    const hero = k.character('hero', { x: 70, y: 352, z: 20 });
    const oom = k.character('oomboom', { x: 850, y: 352, z: 20 });
    k.set(oom, { opacity: 0 });
    const drum = k.part(oom, 'drum');
    const armL = k.part(oom, 'armL');
    const armR = k.part(oom, 'armR');

    /** One drum beat: the sticks come down and the drum skin bounces. */
    const beat = async (loud = 1) => {
      boom(now(), loud);
      void k.to(armL, 0.08, { rotation: 14, ease: 'power2.in' }).then(() => k.to(armL, 0.14, { rotation: 0 }));
      void k.to(armR, 0.08, { rotation: -14, ease: 'power2.in' }).then(() => k.to(armR, 0.14, { rotation: 0 }));
      await k.to(drum, 0.08, { scaleY: 0.92, ease: 'power2.in' });
      await k.to(drum, 0.14, { scaleY: 1, ease: 'back.out(3)' });
    };

    // ---- In marches Mr Oom Boom Boom, drumming.
    void k.enter(hero, 'left');
    k.set(oom, { x: 420, opacity: 1 });
    for (let i = 0; i < 4; i++) {
      void beat();
      await k.to(oom, 0.4, { x: 420 - (i + 1) * 105, ease: 'power1.out' });
    }
    const drumming = (async () => {
      for (let i = 0; i < 6; i++) {
        await beat(0.7);
        await k.wait(260);
      }
    })();
    await k.all(k.say('boom', oom), drumming);

    // ---- The hero toots a party blower.
    const [hx, hy] = [70 + 150 * 0.867, 352 + 150 * 0.867];
    const toot = k.add(partyBlower(), { x: hx + 6, y: hy, w: 170, z: 22 });
    k.set(toot, { scaleX: 0.15, transformOrigin: '0% 50%' });
    blower();
    await k.to(toot, 0.35, { scaleX: 1, ease: 'back.out(2)' });
    await k.wait(250);
    await k.to(toot, 0.25, { scaleX: 0.15, ease: 'power2.in' });
    k.remove(toot);
    await k.say('whose', hero);

    // ---- The balloons float up: a row of ten, then three more.
    const row = Array.from({ length: 10 }, (_, i) => k.prop('balloon', { x: 120 + i * 66, y: 8, w: 70, z: 15 }));
    const more = [0, 1, 2].map((i) => k.prop('balloon', { x: 850 + i * 66, y: 8, w: 70, z: 15 }));
    [...row, ...more].forEach((b) => k.set(b, { y: 700, opacity: 0 }));
    const ten = k.add(numberTag('10', C.goldLight, 'l5c1-tag-ten'), { x: 402, y: 92, w: 100, z: 16 });
    const three = k.add(numberTag('3', C.sky, 'l5c1-tag-three'), { x: 901, y: 92, w: 100, z: 16 });
    const sum = k.add(numberTag('13', C.pink, 'l5c1-tag-thirteen'), { x: 628, y: 88, w: 124, z: 16 });
    [ten, three, sum].forEach((t) => k.set(t, { opacity: 0 }));
    const rise = async () => {
      for (const [i, b] of row.entries()) {
        floatUp(i);
        k.set(b, { opacity: 1 });
        void k.to(b, 0.6, { y: 0, ease: 'back.out(1.3)' });
        await k.wait(150);
      }
      await k.appear(ten, 0.3);
      await k.wait(350);
      for (const [i, b] of more.entries()) {
        floatUp(10 + i);
        k.set(b, { opacity: 1 });
        void k.to(b, 0.6, { y: 0, ease: 'back.out(1.3)' });
        await k.wait(260);
      }
      await k.appear(three, 0.3);
      await k.wait(500);
      k.sfx.sparkle();
      void k.fade(ten, 0, 0.3);
      void k.fade(three, 0, 0.3);
      await k.appear(sum, 0.4);
      void k.pop(sum, 1.2);
    };
    await k.all(k.say('count'), rise());
    [...row, ...more].forEach((b, i) => k.float(b, 6, 1.6 + (i % 4) * 0.25));

    // ---- A party hat drops out of the sky, just for him.
    const hat = k.keepsake(k.chapter!.keepsake, { x: 515, y: 430, w: 150, z: 25 });
    k.set(hat, { y: -620, rotation: -30 });
    k.fx.whizz();
    await k.to(hat, 0.7, { y: 0, rotation: 0, ease: 'bounce.out' });
    k.fx.pop();
    k.sparkle(590, 500, 14, 140);
    void k.hop(hero, 40, 1);
    await k.say('hat', oom);

    // ---- Off to find Silky and the candles.
    const roll = (async () => {
      k.fx.drumroll(1.2);
      for (let i = 0; i < 6; i++) await k.to(drum, 0.1, { rotation: i % 2 ? -3 : 3, ease: 'none' });
      k.set(drum, { rotation: 0 });
      await beat(1.2);
    })();
    await k.all(k.say('next', oom), roll);
    k.fx.jingle();
    k.confetti(24);
    await k.all(k.hop(hero, 30, 2), k.hop(oom, 30, 2), k.pop(hat, 1.12));
    await k.wait(600);
  },
});
