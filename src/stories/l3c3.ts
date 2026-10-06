/**
 * Land 3, chapter 3: Pop Biscuit Pairs.
 *
 * A picnic blanket by the candy path, and a tin of ten pop biscuits. The
 * biscuits hop out onto two plates: eight and two make ten. Shuffle three
 * across: five and five make ten too. Then everyone takes a bite and POP!
 * Honey squirts everywhere, mostly over {name}'s friend. A sweet smell of
 * baking drifts in: Moon-Face's Google Buns. Next: Google Buns.
 *
 * The chapter's host is Fran. If he climbs with Fran, the friend on the
 * blanket is Joe instead (the hero speaks the lines either way).
 */
import { gsap } from 'gsap';
import { C, circle, defineStory, ellipse, group, ink, noiseBurst, NOTE, now, piece, raw, rect, svg, tone, tune, type Kit, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** A biscuit hopping onto a plate: a little rising plip and a china tick. */
function plip(n: number): void {
  const t = now();
  const f = 420 + n * 45;
  tone(f, t, { wave: 'triangle', peak: 0.08, attack: 0.005, decay: 0.1, glideTo: f * 1.6 });
  tone(2400, t + 0.12, { peak: 0.03, attack: 0.002, decay: 0.08 });
}

/** The tin lid coming off: a metal scrape and a clonk. */
function lid(): void {
  const t = now();
  noiseBurst(t, { freq: 3500, q: 4, peak: 0.05, attack: 0.05, decay: 0.2, sweepTo: 5000 });
  tone(330, t + 0.25, { wave: 'triangle', peak: 0.08, decay: 0.3 });
  tone(495, t + 0.26, { wave: 'triangle', peak: 0.04, decay: 0.25 });
}

/** A pop biscuit bursting: a crunch, a POP and a gloopy honey squelch. */
function honeyPop(): void {
  const t = now();
  noiseBurst(t, { freq: 2200, q: 1.2, peak: 0.08, decay: 0.08 });
  tone(260, t + 0.08, { wave: 'triangle', peak: 0.13, attack: 0.004, decay: 0.12, glideTo: 900 });
  tone(180, t + 0.22, { wave: 'sine', peak: 0.12, attack: 0.02, decay: 0.3, glideTo: 90, vibrato: [14, 20] });
}

/** A long happy "mmm", hummed. */
function mmm(): void {
  const t = now();
  tone(220, t, { wave: 'triangle', peak: 0.06, attack: 0.08, decay: 0.7, glideTo: 260, vibrato: [5, 4], lowpass: 900 });
}

/** A sniff, sniff of something nice. */
function sniff(): void {
  const t = now();
  for (let i = 0; i < 2; i++) noiseBurst(t + i * 0.25, { freq: 3000, q: 1, peak: 0.05, attack: 0.04, decay: 0.12, sweepTo: 4500 });
}

// --------------------------------------------------------------------- art

/** A red-and-white gingham picnic blanket (800 × 200), seen in perspective. */
function blanket(): string {
  const checks: Node[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 12; c++) {
      if ((r + c) % 2) continue;
      const y0 = 30 + r * 40;
      const x0 = 40 + c * 60 - r * 10;
      checks.push(piece(rect(x0, y0, 56 + r * 2, 38), C.raspberry, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
    }
  }
  return svg({ w: 800, h: 200, name: 'l3c3-blanket', boil: false }, [
    piece([[60, 24], [740, 24], [790, 196], [10, 196]], C.white, { rough: 1.4 }),
    group({}, checks),
  ]);
}

/** A china plate (260 × 90). */
function plate(name: string): string {
  return svg({ w: 260, h: 90, name: `l3c3-${name}`, boil: false }, [
    piece(ellipse(130, 50, 124, 36), C.china),
    piece(ellipse(130, 48, 96, 26), C.white, { edge: 'cut', fibre: false, shadow: false }),
    ink(ellipse(130, 50, 112, 31), { width: 3, color: C.chinaBlue, closed: true, opacity: 0.7 }),
  ]);
}

/** A blob of honey (60 × 60) stuck on someone's face. */
function honeyBlob(): string {
  return svg({ w: 60, h: 60, name: 'l3c3-honey' }, [
    piece([[10, 20], [30, 8], [52, 18], [50, 36], [40, 40], [38, 56], [30, 58], [28, 42], [12, 36]], C.honey, { edge: 'cut' }),
    piece(circle(24, 20, 5), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
  ]);
}

/** Wavy smell lines (120 × 200), drifting up. */
function smell(): string {
  const wave = (x: number) => ink(Array.from({ length: 9 }, (_, i) => [x + Math.sin(i * 1.1) * 12, 190 - i * 22] as [number, number]), { width: 5, color: C.cream, opacity: 0.9 });
  return svg({ w: 120, h: 200, name: 'l3c3-smell' }, [wave(30), wave(60), wave(90)]);
}

/** A torn paper card with a sum on it, in big Andika (420 × 130). */
function sumCard(text: string, name: string): string {
  return svg({ w: 420, h: 130, name }, [
    piece(rect(10, 10, 400, 110, 10), C.cream, { rough: 1.2 }),
    raw(`<text x="210" y="92" font-family="Andika, sans-serif" font-weight="700" font-size="76" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------ helpers

/** The chapter's host, or another child if the host is the one he climbs with. */
const buddy = (k: Kit, host: string, instead: string): string => (host === k.hero ? instead : host);

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

/** Spots on the plates for the biscuits (top-left corners, 70 px biscuits). */
const LEFT = [0, 1, 2, 3].flatMap((i) => [[300 + i * 64, 528], [316 + i * 64, 566]] as [number, number][]);
const RIGHT = [0, 1, 2, 3, 4].map((i) => [652 + (i % 3) * 64 + (i > 2 ? 32 : 0), i > 2 ? 566 : 528] as [number, number]);

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    tin: { who: 'narrator', text: 'Someone had left a tin of pop biscuits by the path. Ten inside!' },
    pairs: { who: 'hero', text: 'Let’s share them. Eight on this plate, two on that one. Ten!' },
    five: { who: 'hero', text: 'Or five and five! That makes ten too!' },
    bite: { who: 'narrator', text: 'Then everyone took a bite. POP! Honey everywhere!' },
    next: { who: 'hero', text: 'Mmm… can you smell baking? Moon-Face is making Google Buns!' },
  },

  async play(k) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 14 });

    k.add(blanket(), { x: 190, y: 500, w: 800, h: 200, z: 4 });
    const hero = k.character('hero', { x: 20, y: 380, z: 20 });
    const pal = k.character(buddy(k, k.chapter!.host, 'joe'), { x: 900, y: 384, z: 20 });
    const plateL = k.add(plate('l'), { x: 290, y: 540, w: 300, h: 104, z: 6 });
    const plateR = k.add(plate('r'), { x: 630, y: 540, w: 300, h: 104, z: 6 });
    const tin = k.keepsake(k.chapter!.keepsake, { x: 500, y: 330, w: 180, z: 7 });
    k.set([hero, pal, plateL, plateR], { opacity: 0 });

    await k.camera({ zoom: 1.3, x: 590, y: 460 }, 0.01);
    lid();
    void k.shake(tin, 4, 2);
    await k.say('tin');
    void k.camera({}, 1.2);
    await k.all(k.enter(hero, 'left'), k.enter(pal, 'right'), k.appear(plateL, 0.4), k.appear(plateR, 0.4));

    // Ten biscuits hop out: eight to the left plate, two to the right.
    const bis = Array.from({ length: 10 }, (_, i) => k.prop('popBiscuit', { x: 555, y: 360, w: 70, z: 10 + i }));
    k.set(bis, { opacity: 0 });
    const spots = [...LEFT, RIGHT[0], RIGHT[1]];
    const hopOut = (async () => {
      for (let i = 0; i < 10; i++) {
        plip(i);
        k.set(bis[i], { opacity: 1 });
        void jump(k, bis[i], spots[i][0], spots[i][1], 90, 0.4);
        await k.wait(170);
      }
      await k.wait(300);
    })();
    await k.all(k.say('pairs', hero), hopOut);
    const card = k.add(sumCard('8 + 2 = 10', 'l3c3-sum1'), { x: 380, y: 40, w: 420, h: 130, z: 40 });
    k.set(card, { opacity: 0 });
    tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24]], 0.1);
    await k.appear(card, 0.4);
    await k.wait(700);

    // Three hop across: five and five.
    const across = (async () => {
      for (const [n, i] of [6, 7, 5].entries()) {
        plip(7 + n);
        await jump(k, bis[i], RIGHT[2 + n][0], RIGHT[2 + n][1], 110, 0.4);
      }
    })();
    void k.vanish(card, 0.25);
    const card2 = k.add(sumCard('5 + 5 = 10', 'l3c3-sum2'), { x: 380, y: 40, w: 420, h: 130, z: 40 });
    k.set(card2, { opacity: 0 });
    await across;
    tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24], [NOTE.C6, 0.4]], 0.1);
    void k.appear(card2, 0.4);
    await k.all(k.say('five', hero), k.hop(hero, 30, 2));

    // A bite each… POP! Honey all over the friend.
    void k.fade(card2, 0, 0.3);
    const bh = k.prop('popBiscuit', { x: 200, y: 520, w: 60, z: 30 });
    const bp = k.prop('popBiscuit', { x: 920, y: 520, w: 60, z: 30 });
    await k.all(k.to(bh, 0.35, { x: -40, y: -50, scale: 0.7 }), k.to(bp, 0.35, { x: 70, y: -50, scale: 0.7 }));
    k.remove(bh);
    k.remove(bp);
    const pop = (async () => {
      await k.wait(1500);
      honeyPop();
      k.puff(1030, 480, 200, C.honey);
      k.puff(160, 480, 120, C.honey);
      const blobs = [k.add(honeyBlob(), { x: 990, y: 440, w: 56, z: 22 }), k.add(honeyBlob(), { x: 1060, y: 500, w: 44, z: 22 }), k.add(honeyBlob(), { x: 940, y: 520, w: 40, z: 22 })];
      // The blobs stick to the friend and go where he goes.
      blobs.forEach((b) => void k.appear(b, 0.2));
      await k.all(k.shake(pal, 8, 2), k.hop(hero, 20, 1));
      void k.blink(pal);
    })();
    await k.all(k.say('bite'), pop);
    mmm();
    await k.wait(400);

    // A smell of baking drifts in from the right.
    const waft = k.add(smell(), { x: 1040, y: 160, w: 120, h: 200, z: 30 });
    k.set(waft, { opacity: 0 });
    void k.to(waft, 2.4, { opacity: 0.9, x: -600, y: -40, ease: 'sine.inOut' }).then(() => k.fade(waft, 0, 0.4));
    sniff();
    void k.to(k.part(hero, 'head'), 0.4, { rotation: 8 });
    // The tin, his keepsake, glows.
    k.light(590, 410, 120, { color: C.goldLight, strength: 0.5, z: 6 });
    k.sfx.sparkle();
    void k.pop(tin, 1.15);
    k.sparkle(590, 400, 12, 120);
    await k.say('next', hero);
    await k.all(k.camera({ zoom: 1.15, x: 760, y: 360 }, 1.2), k.walk(hero, 40, 0.6, 2));
    await k.wait(300);
  },
});
