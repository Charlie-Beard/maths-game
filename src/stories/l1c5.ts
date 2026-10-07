/**
 * Land 1, chapter 5: Mr Watzisname Snores.
 *
 * Dusk on Mr Watzisname's branch: fireflies, the first stars, and the old
 * man fast asleep in his hammock under a twig hung with acorns. Every snore
 * shakes acorns down. SNORE: four acorns fall in a row. SNORE: three more.
 * The hero counts on: four… five, six, seven! Then an ENORMOUS snore (the
 * whole branch shakes; the gentle tension) blows off his nightcap and he
 * wakes with a start, and can't remember his own name. He gives the hero
 * his nightcap (the keepsake) and drops straight back to sleep. Then CLANK!
 * CLATTER! A saucepan tumbles past from above. Next: The Saucepan Man.
 */
import { band, C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A snore: a rumbling saw going in, a whistle going out. Bigger = louder and longer. */
function snore(big = 1): void {
  const t = now();
  tone(62, t, { wave: 'sawtooth', peak: 0.1 * big, attack: 0.35, decay: 0.5 * big, glideTo: 90, vibrato: [20, 8], lowpass: 520 });
  noiseBurst(t, { freq: 260, q: 1, peak: 0.06 * big, attack: 0.35, decay: 0.5 * big });
  tone(820, t + 0.9 * big, { peak: 0.04, attack: 0.12, decay: 0.45, glideTo: 1500 });
}

/** An acorn landing on the branch: a little wooden tock, pitched by count. */
function tock(n: number): void {
  const t = now();
  const f = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.B5][n % 7];
  noiseBurst(t, { freq: 2200, q: 5, peak: 0.06, decay: 0.04 });
  tone(f, t + 0.01, { wave: 'triangle', peak: 0.07, decay: 0.22 });
}

/** Waking with a start: a boing that slides up. */
function startle(): void {
  const t = now();
  tone(220, t, { wave: 'triangle', peak: 0.12, attack: 0.01, decay: 0.3, glideTo: 880, vibrato: [14, 20] });
}

/** A lullaby: three slow falling bell notes as he drops off again. */
function lullaby(): void {
  const t = now();
  [NOTE.G5, NOTE.E5, NOTE.C5].forEach((f, i) => tone(f, t + i * 0.4, { peak: 0.05, attack: 0.02, decay: 1 }));
}

/** A saucepan clattering down through the branches. */
function clatter(): void {
  const t = now();
  for (let i = 0; i < 5; i++) {
    const d = i * 0.16 + Math.random() * 0.04;
    tone(520 + Math.random() * 400, t + d, { peak: 0.06, decay: 0.4 });
    tone(1300 + Math.random() * 500, t + d, { peak: 0.03, decay: 0.25 });
    noiseBurst(t + d, { freq: 3000, q: 3, peak: 0.05, decay: 0.05 });
  }
}

// --------------------------------------------------------------------- art

/** Dusk in the tree: a deep blue sky, a crescent moon, the branch and the acorn twig. */
function duskBackdrop(): string {
  const r = rng(505);
  const stars: Node[] = [];
  for (let i = 0; i < 26; i++) stars.push(dot(r() * 1180, r() * 340, 1.5 + r() * 2, r() > 0.6 ? C.goldLight : C.cream, 0.5 + r() * 0.5));
  const leaves: Node[] = [];
  for (let i = 0; i < 16; i++) leaves.push(piece(circle(r() * 1180, r() < 0.5 ? r() * 60 - 20 : 420 + r() * 120, 50 + r() * 40), i % 2 ? C.greenDeep : '#26402f', { rough: 1.4, shadow: i % 3 === 0 }));
  return svg({ w: 1180, h: 820, name: 'l1c5-dusk', boil: false }, [
    piece(rect(-20, -20, 1220, 860), C.nightLight, { edge: 'clean', shadow: false }),
    piece(rect(-20, 260, 1220, 600), '#5a5a86', { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 420, 1220, 440), '#8a6f8a', { rough: 2, shadow: false, fibre: false }),
    ...stars,
    piece(circle(980, 130, 54), C.cream, { rough: 0.6 }),
    piece(circle(1004, 116, 48), C.nightLight, { edge: 'cut', fibre: false, shadow: false }),
    ...leaves,
    // The trunk on the right, behind the moon's glow.
    piece(curve([[1080, 900], [1100, 400], [1110, -40], [1240, -40], [1240, 900]], 2), C.barkDark, { rough: 1.2 }),
    // The acorn twig reaching out over the hammock.
    piece(band([[1100, 90], [900, 110], [700, 96], [480, 120], [120, 100]], 18), C.bark),
    piece(band([[760, 100], [720, 60], [680, 44]], 8), C.bark),
    ...[[500, 96], [640, 80], [820, 96], [700, 40]].map(([x, y]) => piece(ellipse(x, y, 34, 16, -20), C.leafDark, { rough: 0.8 })),
    // The branch along the bottom.
    piece(curve([[-30, 620], [400, 600], [800, 610], [1100, 590], [1220, 600], [1220, 720], [800, 700], [400, 706], [-30, 720]], 2), C.bark, { rough: 1.3 }),
    ink([[40, 650], [400, 640], [800, 650], [1100, 634]], { width: 3, color: C.barkDark, opacity: 0.6, wobble: 2 }),
    piece(rect(-20, 700, 1220, 140), '#1f3328', { rough: 2 }),
  ]);
}

/** The front of the hammock (420 × 200), drawn over his pyjamas; ropes up to the twig. */
function hammockFront(): string {
  return svg({ w: 420, h: 200, name: 'l1c5-hammock' }, [
    piece(curve([[0, 40], [210, 150], [420, 40], [400, 110], [210, 200], [20, 110]], 2), C.purple),
    ...[80, 140, 210, 280, 340].map((x) => ink([[x, 70 + Math.sin((x / 420) * Math.PI) * 70], [x, 110 + Math.sin((x / 420) * Math.PI) * 70]], { width: 3, color: C.plum, opacity: 0.7 })),
  ]);
}

/** A hammock rope (20 × 500). */
function rope(): string {
  return svg({ w: 20, h: 500, name: 'l1c5-rope', boil: false }, [ink([[10, 0], [10, 500]], { width: 4, color: C.cream })]);
}

/** A number on a round paper tag (100 × 100). */
function tag(n: number, color: string = C.cream): string {
  return svg({ w: 100, h: 100, name: `l1c5-tag${n}${color}`, boil: false }, [
    piece(circle(50, 50, 40), color, { rough: 0.8 }),
    raw(`<text x="50" y="68" text-anchor="middle" font-family="Andika, sans-serif" font-size="54" font-weight="700" fill="${C.ink}">${n}</text>`),
  ]);
}

/** A "Z" (60 × 60) that floats up from a snore. */
function zed(): string {
  return svg({ w: 60, h: 60, name: 'l1c5-zed', boil: false }, [ink([[10, 10], [50, 10], [10, 50], [50, 50]], { width: 7, color: C.cream, wobble: 0.6 })]);
}

// ---------------------------------------------------------------- helpers

/** Where the acorns land: a row of seven along the branch. */
const ROW = [590, 645, 700, 755, 825, 880, 935];
const ROW_Y = 560;
/** Where each acorn hangs on the twig before it falls. */
const HANG: Pt[] = [[560, 116], [620, 120], [680, 104], [710, 66], [800, 112], [860, 114], [920, 108]];

/** A snore: the zzz swells, a Z drifts up, the hammock swings. */
async function snoreAnim(k: Kit, man: HTMLElement, sway: HTMLElement[], big = 1): Promise<void> {
  snore(big);
  const zzz = k.part(man, 'zzz');
  const z = k.add(zed(), { x: 170, y: 260, w: 40 + big * 20, z: 30 });
  void k.to(z, 1.6, { x: -60, y: -160, opacity: 0, rotation: -20, ease: 'sine.out' }).then(() => k.remove(z));
  await k.all(k.to(zzz, 0.4, { scale: 1 + 0.25 * big }), k.to(man, 0.4, { y: -6 * big }));
  await k.all(k.to(zzz, 0.4, { scale: 1 }), k.to(man, 0.4, { y: 0 }), ...sway.map((s) => k.to(s, 0.4, { rotation: 2 * big, yoyo: true, repeat: 1 })));
}

/** Acorns fall from the twig into their places in the row, each counted with a tag. */
async function drop(k: Kit, acorns: HTMLElement[], from: number, to: number, tagColor: string): Promise<void> {
  for (let i = from; i < to; i++) {
    const a = acorns[i];
    void k.to(a, 0.5, { x: 0, y: 0, rotation: 360, ease: 'bounce.out' }).then(() => {
      tock(i);
      const t = k.add(tag(i + 1, tagColor), { x: ROW[i] - 24, y: ROW_Y - 54, w: 48, z: 22 });
      void k.appear(t, 0.2);
    });
    await k.wait(320);
  }
  await k.wait(400);
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    asleep: { who: 'narrator', text: 'Mr Watzisname was fast asleep. And every snore shook down some acorns!' },
    seven: { who: 'hero', text: 'Four… and three more. Five, six, seven! Seven acorns!' },
    wake: { who: 'watzisname', text: 'Wha? Who? I’m Mr… Mr… oh dear. I’ve forgotten my name again!' },
    cap: { who: 'watzisname', text: 'Never mind. Keep my nightcap, {name}. I’ll just have a little… zzz…' },
    clank: { who: 'narrator', text: 'Then CLANK! CLATTER! Something very noisy was coming down the tree…' },
  },

  async play(k) {
    k.backdrop(duskBackdrop());
    k.light(980, 130, 160, { color: C.cream, strength: 0.3 });
    k.ambient('fireflies', { count: 12 });
    k.music('dreamy');

    k.add(rope(), { x: 155, y: 110, w: 20, h: 440, z: 8 });
    k.add(rope(), { x: 525, y: 110, w: 20, h: 440, z: 8 });
    const man = k.character('watzisname', { x: 200, y: 250, w: 290, z: 10 });
    const hammock = k.add(hammockFront(), { x: 140, y: 470, w: 420, z: 12 });
    const swing = [man, hammock];
    swing.forEach((el) => k.set(el, { transformOrigin: '50% -150px' }));
    const hero = k.character('hero', { x: 960, y: 400, w: 220, z: 20, flip: true });
    const acorns = HANG.map(([x, y], i) => {
      const el = k.prop('acorn', { x: ROW[i] - 30, y: ROW_Y, w: 60, z: 18 });
      k.set(el, { x: x - ROW[i], y: y - ROW_Y });
      return el;
    });
    await k.enter(hero, 'right');

    // ---- Fast asleep. SNORE: four acorns fall.
    void (async () => {
      await k.wait(400);
      await snoreAnim(k, man, swing, 1);
    })();
    await k.say('asleep');
    await k.all(snoreAnim(k, man, swing, 1.2), k.wait(500).then(() => drop(k, acorns, 0, 4, C.cream)));
    void k.blink(hero);

    // ---- SNORE: three more. He counts on.
    await k.all(snoreAnim(k, man, swing, 1.2), k.wait(500).then(() => drop(k, acorns, 4, 7, C.goldLight)));
    await k.all(k.say('seven', hero), k.wait(1600).then(() => k.hop(hero, 30, 1)));

    // ---- An ENORMOUS snore: the cap flies off and he wakes with a start.
    k.music('sneaky');
    await k.camera({ zoom: 1.3, x: 420, y: 330 }, 0.8);
    snore(1.8);
    const cap = k.part(man, 'cap');
    await k.all(k.to(k.part(man, 'zzz'), 0.6, { scale: 1.6 }), k.quake(6));
    k.fx.whizz();
    void k.to(cap, 0.5, { x: 120, y: -120, rotation: 50, opacity: 0, ease: 'power2.out' });
    startle();
    k.part(man, 'zzz').forEach((z) => (z.style.opacity = '0'));
    k.part(man, 'eyes').forEach((e) => (e.style.opacity = '0'));
    k.part(man, 'eyesOpen').forEach((e) => (e.style.opacity = '1'));
    await k.all(k.to(man, 0.2, { y: -40, ease: 'power2.out' }).then(() => k.to(man, 0.3, { y: 0, ease: 'bounce.out' })), k.shake(hero, 6, 1));
    k.music('cosy');
    await k.all(k.say('wake', man), k.shake(man, 4, 2));

    // ---- Keep my nightcap… and he's asleep again.
    const gift = k.keepsake(k.chapter!.keepsake, { x: 760, y: 200, w: 150, z: 26 });
    k.set(gift, { opacity: 0 });
    const give = async () => {
      await k.wait(500);
      k.set(gift, { opacity: 1, x: -200, y: -60, rotation: -60, scale: 0.5 });
      k.sfx.sparkle();
      await k.to(gift, 0.8, { x: 0, y: 0, rotation: 0, scale: 1, ease: 'sine.out' });
      k.sparkle(835, 270, 14, 120);
      k.float(gift, 5, 2);
      await k.wait(1400);
      // His eyes close; the zzz come back.
      lullaby();
      k.part(man, 'eyesOpen').forEach((e) => (e.style.opacity = '0'));
      k.part(man, 'eyes').forEach((e) => (e.style.opacity = '1'));
      k.part(man, 'zzz').forEach((z) => (z.style.opacity = '1'));
      await k.to(man, 0.6, { rotation: -4, ease: 'sine.inOut' });
    };
    void k.camera({}, 1);
    await k.all(k.say('cap', man), give());
    await snoreAnim(k, man, swing, 0.8);

    // ---- CLANK! CLATTER! A saucepan tumbles past from above.
    k.music('adventure');
    const pan = k.prop('saucepan', { x: 640, y: -140, w: 110, z: 28 });
    const tumble = async () => {
      await k.wait(300);
      clatter();
      await k.all(k.to(pan, 1.2, { y: 980, x: -80, rotation: 540, ease: 'power1.in' }), k.wait(400).then(() => k.shake(hero, 6, 2)));
      void k.camera({ zoom: 1.25, x: 640, y: 160 }, 1.2);
      clatter();
    };
    await k.all(k.say('clank'), tumble());
    await k.wait(500);
  },
});
