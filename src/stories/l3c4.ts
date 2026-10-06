/**
 * Land 3, chapter 4: Google Buns.
 *
 * Moon-Face has baked a tray of ten Google Buns, with sherbet inside. But
 * he counts only six: four gaps in the tray. Six and four make ten, so four
 * are missing! "Google-google!" Four giggling buns pop up from behind
 * Moon-Face, where they were hiding all along, and hop back into their
 * places. He takes a bite and the sherbet froths out everywhere. Then
 * something big wobbles in the distance: the Jelly Hill. Next: The Jelly Hill.
 */
import { gsap } from 'gsap';
import { C, cloud, defineStory, ellipse, noiseBurst, NOTE, now, piece, raw, rect, svg, tone, tune, type Kit } from './kit';

// ------------------------------------------------------------------ sounds

/** A tin tray set down: a warm metal clunk. */
function clunk(): void {
  const t = now();
  tone(210, t, { wave: 'triangle', peak: 0.12, decay: 0.25, glideTo: 180 });
  tone(631, t + 0.005, { wave: 'sine', peak: 0.04, decay: 0.4 });
}

/** A Google Bun giggling: "goo-gle!", two bubbly notes that wobble. */
function google(pitch = 1): void {
  const t = now();
  tone(520 * pitch, t, { wave: 'triangle', peak: 0.08, attack: 0.01, decay: 0.1, glideTo: 700 * pitch, vibrato: [22, 30], lowpass: 2400 });
  tone(640 * pitch, t + 0.14, { wave: 'triangle', peak: 0.08, attack: 0.01, decay: 0.13, glideTo: 460 * pitch, vibrato: [22, 30], lowpass: 2400 });
}

/** A bun landing back in its dimple. */
function plop(n: number): void {
  const t = now();
  tone(300 + n * 40, t, { peak: 0.1, attack: 0.004, decay: 0.12, glideTo: 160 });
}

/** Sherbet frothing: a crackly fizz that swells and fades. */
function sherbet(): void {
  const t = now();
  noiseBurst(t, { freq: 5000, q: 0.8, peak: 0.08, attack: 0.15, decay: 1.2, sweepTo: 2500 });
  for (let i = 0; i < 18; i++) tone(1800 + Math.random() * 2500, t + Math.random() * 1.2, { peak: 0.025, attack: 0.002, decay: 0.04 });
}

/** A far-off jelly wobble: a low boing that wibbles. */
function wobble(): void {
  const t = now();
  tone(90, t, { wave: 'sine', peak: 0.18, attack: 0.05, decay: 1.1, vibrato: [6, 18] });
  tone(180, t, { wave: 'triangle', peak: 0.05, attack: 0.05, decay: 0.9, vibrato: [6, 30], lowpass: 600 });
}

// --------------------------------------------------------------------- art

/** Spots in the tray (top-left corners for 80 px buns): a ten frame, 2 rows of 5. */
const CELL: [number, number][] = [0, 1].flatMap((r) => [0, 1, 2, 3, 4].map((c) => [394 + c * 84, 470 + r * 76] as [number, number]));

/** A baking tray with ten round dimples (480 × 190): a ten frame. */
function tray(): string {
  return svg({ w: 480, h: 190, name: 'l3c4-tray' }, [
    piece(ellipse(240, 182, 230, 10), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(6, 12, 468, 166, 18), C.steelDark),
    piece(rect(18, 22, 444, 146, 12), C.steelLight, { edge: 'cut', fibre: false }),
    ...[0, 1].flatMap((r) => [0, 1, 2, 3, 4].map((c) => piece(ellipse(66 + c * 84, 66 + r * 76, 34, 26), C.steel, { edge: 'cut', fibre: false, shadow: false }))),
  ]);
}

/** A torn paper card with a sum on it, in big Andika (420 × 130). */
function sumCard(text: string, name: string): string {
  return svg({ w: 420, h: 130, name }, [
    piece(rect(10, 10, 400, 110, 10), C.cream, { rough: 1.2 }),
    raw(`<text x="210" y="92" font-family="Andika, sans-serif" font-weight="700" font-size="76" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

/** A puff of sherbet froth (pink-white). */
function froth(k: Kit, x: number, y: number): void {
  k.puff(x, y, 120 + Math.random() * 60, Math.random() > 0.5 ? C.white : C.sherbet);
}

// ------------------------------------------------------------------ helpers

/** Where an actor really is now (its placed corner plus its tween offset). */
function at(el: HTMLElement): [number, number] {
  return [(parseFloat(el.style.left) || 0) + Number(gsap.getProperty(el, 'x')), (parseFloat(el.style.top) || 0) + Number(gsap.getProperty(el, 'y'))];
}

/** A hop along an arc to an absolute stage spot (the actor's top-left). */
function jump(k: Kit, el: HTMLElement, x: number, y: number, height: number, seconds: number): Promise<void> {
  const bx = parseFloat(el.style.left) || 0;
  const by = parseFloat(el.style.top) || 0;
  const peak = Math.min(at(el)[1], y) - height;
  return k.all(
    k.to(el, seconds, { x: x - bx, ease: 'none' }),
    k.to(el, seconds / 2, { y: peak - by, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y: y - by, ease: 'power2.in' })),
  );
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hello: { who: 'moonface', text: 'Google Buns, fresh from the oven! Ten of them, with sherbet inside!' },
    count: { who: 'moonface', text: 'One, two, three, four, five, six… only six! Where are the rest?' },
    four: { who: 'hero', text: 'Six and four make ten. Four are missing!' },
    bite: { who: 'narrator', text: 'Moon-Face took a bite. Fizz! Sherbet frothed out everywhere!' },
    next: { who: 'moonface', text: 'Ooh, tickly! Now… what’s that wobbling over there? The Jelly Hill!' },
  },

  async play(k) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 16 });

    // The four runaways hide behind Moon-Face, peeping out later.
    const hiders = [[60, 330], [150, 300], [220, 330], [110, 350]].map(([x, y]) => k.prop('googleBun', { x, y, w: 80, z: 15 }));
    const mf = k.character('moonface', { x: 30, y: 370, z: 20 });
    const glow = k.light(160, 480, 200, { color: '#fff3c0', strength: 0.3, z: 19 });
    const hero = k.character('hero', { x: 900, y: 384, z: 20 });
    const tr = k.add(tray(), { x: 350, y: 440, w: 480, h: 190, z: 8 });
    // Six buns in the first six dimples; four gaps.
    const buns = CELL.slice(0, 6).map(([x, y]) => k.prop('googleBun', { x, y, w: 80, z: 9 }));
    k.set([mf, hero, tr, ...buns, glow], { opacity: 0 });
    hiders.forEach((b) => k.set(b, { y: 90, opacity: 0 }));

    await k.all(k.enter(mf, 'left'), k.enter(hero, 'right'));
    void k.fade(glow, 0.3, 0.4);
    clunk();
    await k.appear(tr, 0.3);
    for (const b of buns) {
      k.set(b, { opacity: 1 });
      void k.pop(b, 1.1);
    }
    k.float(mf, 5, 2.6);
    await k.say('hello', mf);

    // He counts them, a bun at a time, and stops at the gaps.
    void k.camera({ zoom: 1.3, x: 600, y: 470 }, 1.2);
    const counting = (async () => {
      for (const b of buns) {
        tone(500, now(), { wave: 'triangle', peak: 0.04, decay: 0.08 });
        await k.pop(b, 1.15);
        await k.wait(100);
      }
    })();
    await k.all(k.say('count', mf), counting);
    void k.camera({}, 1.0);
    void k.shake(mf, 6, 2);
    const card = k.add(sumCard('6 + ? = 10', 'l3c4-sum1'), { x: 380, y: 40, w: 420, h: 130, z: 40 });
    k.set(card, { opacity: 0 });
    void k.appear(card, 0.4);
    await k.say('four', hero);

    // Google-google! They were behind Moon-Face all along.
    for (const [i, b] of hiders.entries()) {
      google(1 + i * 0.08);
      void k.to(b, 0.25, { y: 0, opacity: 1, ease: 'back.out(2)' });
      await k.wait(260);
    }
    await k.shake(mf, 5, 1);
    for (const [i, b] of hiders.entries()) {
      b.style.zIndex = '30';
      google(1.2 + i * 0.05);
      await jump(k, b, CELL[6 + i][0], CELL[6 + i][1], 150, 0.5);
      plop(i);
      b.style.zIndex = '9';
    }
    void k.vanish(card, 0.2);
    const card2 = k.add(sumCard('6 + 4 = 10', 'l3c4-sum2'), { x: 380, y: 40, w: 420, h: 130, z: 40 });
    k.set(card2, { opacity: 0 });
    tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24], [NOTE.C6, 0.4]], 0.1);
    void k.appear(card2, 0.4);
    await k.hop(hero, 30, 2);
    await k.wait(500);

    // A bite… and the sherbet froths out everywhere.
    void k.fade(card2, 0, 0.3);
    const mine = buns[0];
    mine.style.zIndex = '30';
    await jump(k, mine, 120, 470, 60, 0.45);
    k.remove(mine);
    const fizz = (async () => {
      await k.wait(900);
      sherbet();
      // A frothy sherbet beard that hangs about for a moment.
      const beard = [[100, 556, 110], [160, 572, 120], [222, 552, 100]].map(([x, y, sz]) => k.add(cloud(x > 150 ? C.white : C.sherbet, 'froth' + x), { x: x - sz / 2, y: y - sz / 2, w: sz, h: sz, z: 26 }));
      beard.forEach((b) => void k.appear(b, 0.3));
      void k.wait(1700).then(() => beard.forEach((b) => void k.vanish(b, 0.3)));
      for (let i = 0; i < 6; i++) {
        froth(k, 80 + Math.random() * 180, 380 + Math.random() * 60);
        if (i === 2) void k.shake(mf, 6, 2);
        await k.wait(160);
      }
      void k.blink(mf);
    })();
    await k.all(k.say('bite'), fizz);

    // The keepsake: a Google Bun of his own.
    const keep = k.keepsake(k.chapter!.keepsake, { x: 500, y: 200, w: 180, z: 42 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(keep, 0.4);
    k.sparkle(590, 290, 14, 150);
    k.float(keep, 6, 1.6);
    await k.wait(1000);

    // Far off, the jelly hill wobbles.
    void k.fade(keep, 0, 0.4);
    wobble();
    void k.to(k.part(mf, 'armL'), 0.4, { rotation: 100 });
    await k.all(k.say('next', mf), k.wait(1200).then(() => {
      wobble();
      return k.camera({ zoom: 1.35, x: 300, y: 380 }, 1.6);
    }));
    await k.quake(4);
    await k.wait(400);
  },
});
