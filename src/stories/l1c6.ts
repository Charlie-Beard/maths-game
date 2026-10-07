/**
 * Land 1, chapter 6: The Saucepan Man.
 *
 * CLANK! CLATTER! Down the trunk on a rope comes the Saucepan Man, hung all
 * over with pots and pans. The hero asks how many saucepans he has, and he
 * mishears everything ("a CAN of BEANS?") but hangs them up on his rail
 * anyway: five big pans… and four little ones. Five and four make nine,
 * counted on in gold, and a paper sum card says so. "PINE cones? Oh,
 * NINE!" He gives the hero a saucepan to keep (the keepsake), and the jolly
 * jiggle sets every pan swinging and ringing like bells. Then a sweet smell
 * drifts down from a little yellow door above. Next: Silky's Pop Biscuits.
 */
import { C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, raw, rect, rng, svg, tone, type Kit, type Node } from './kit';
import { roundTag, sumStrip } from './bits';

// ------------------------------------------------------------------ sounds

/** Pots and pans clanking together: bright metal bonks at odd pitches. */
function clank(hits = 5): void {
  const t = now();
  for (let i = 0; i < hits; i++) {
    const d = i * 0.12 + Math.random() * 0.03;
    const f = 380 + Math.random() * 500;
    tone(f, t + d, { peak: 0.07, decay: 0.45 });
    tone(f * 2.7, t + d, { peak: 0.025, decay: 0.2 });
    noiseBurst(t + d, { freq: 3500, q: 3, peak: 0.04, decay: 0.04 });
  }
}

/** One pan hung on its hook, ringing at its own note: big pans low, little pans high. */
function ring(n: number): void {
  const t = now();
  const f = [NOTE.C4, NOTE.D4, NOTE.E4, NOTE.F4, NOTE.G4, NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5][n] * 1.5;
  tone(f, t, { peak: 0.08, attack: 0.003, decay: 0.7 });
  tone(f * 2.76, t, { peak: 0.025, attack: 0.002, decay: 0.3 });
}

/** "EH?": a puzzled rising honk. */
function eh(): void {
  const t = now();
  tone(260, t, { wave: 'square', peak: 0.04, attack: 0.01, decay: 0.25, glideTo: 420, lowpass: 1200 });
}

/** The scent drifting down: a soft rising shimmer. */
function waft(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.A5, NOTE.C6].forEach((f, i) => tone(f, t + i * 0.18, { peak: 0.04, attack: 0.08, decay: 0.9, vibrato: [5, 4] }));
}

// --------------------------------------------------------------------- art

const RAIL = { x0: 270, x1: 990, y: 290 };

/** Daylight high in the tree: the trunk on the left, the rail with its hooks, and Silky's yellow door up on the right. */
function railBackdrop(): string {
  const r = rng(606);
  const leaves: Node[] = [];
  for (let i = 0; i < 20; i++) leaves.push(piece(circle(r() * 1180, r() * 70 - 20, 50 + r() * 40), [C.leafDark, C.greenDark, C.leaf][i % 3], { rough: 1.4, shadow: i % 3 === 0 }));
  const hooks: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const x = hookX(i);
    hooks.push(ink([[x, RAIL.y + 6], [x, RAIL.y + 24], [x + 7, RAIL.y + 30], [x + 12, RAIL.y + 22]], { width: 3, color: C.greyDark }));
  }
  return svg({ w: 1180, h: 820, name: 'l1c6-rail', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#cfe0e6', { edge: 'clean', shadow: false }),
    piece(rect(-20, 340, 1220, 520), '#dfe6c4', { rough: 2, shadow: false, fibre: false }),
    piece(ellipse(300, 160, 140, 24), C.cloud, { rough: 1.4, shadow: false }),
    piece(ellipse(760, 220, 170, 26), C.cloud, { rough: 1.4, shadow: false }),
    ...leaves,
    // The trunk on the left.
    piece(curve([[-40, 900], [-20, 400], [-10, -40], [200, -40], [190, 400], [230, 900]], 2), C.bark, { rough: 1.2 }),
    ...[40, 100, 150].map((x) => ink([[x, 820], [x + 6, 400], [x - 4, 0]], { width: 4, color: C.barkDark, opacity: 0.4, wobble: 1.5 })),
    // A second trunk-limb on the right, with Silky's little yellow door up high.
    piece(curve([[1000, 900], [1030, 400], [1010, -40], [1240, -40], [1240, 900]], 2), C.barkLight, { rough: 1.2 }),
    piece(curve([[1060, 200], [1060, 120], [1100, 86], [1140, 120], [1140, 200]], 2), C.yellow),
    dot(1128, 152, 5, C.brown),
    ...[[1050, 110], [1150, 104], [1046, 160], [1154, 170], [1100, 72]].map(([x, y], i) => piece(circle(x, y, 9), [C.pink, C.white, C.raspberry][i % 3], { edge: 'cut' })),
    piece(rect(1050, 200, 100, 12, 4), C.wood),
    // The rail (a straight twig) on two posts.
    piece(rect(RAIL.x0 - 10, RAIL.y - 10, 16, 380, 4), C.barkLight),
    piece(rect(RAIL.x1 - 6, RAIL.y - 10, 16, 380, 4), C.barkLight),
    piece(rect(RAIL.x0 - 30, RAIL.y - 6, RAIL.x1 - RAIL.x0 + 60, 14, 6), C.bark),
    ...hooks,
    // The branch along the bottom.
    piece(curve([[-30, 640], [400, 620], [800, 630], [1220, 610], [1220, 730], [800, 712], [400, 720], [-30, 740]], 2), C.barkLight, { rough: 1.3 }),
    ink([[40, 670], [400, 660], [800, 668], [1150, 652]], { width: 3, color: C.bark, opacity: 0.5, wobble: 2 }),
    piece(rect(-20, 720, 1220, 120), C.greenDeep, { rough: 2 }),
  ]);
}

/** Where hook i is: five big pans, a gap, four little ones. */
function hookX(i: number): number {
  return i < 5 ? RAIL.x0 + 50 + i * 86 : RAIL.x0 + 50 + 5 * 86 + 16 + (i - 5) * 62;
}

/** The rope he slides down on (20 × 400). */
function rope(): string {
  return svg({ w: 20, h: 400, name: 'l1c6-rope', boil: false }, [ink([[10, 0], [12, 200], [10, 400]], { width: 5, color: C.tan })]);
}

/** A number on a round paper tag (100 × 100). The name keeps this story's own torn edges. */
const tag = (n: number, color: string = C.cream): string => roundTag(n, color, `l1c6-tag${n}${color}`);

/** A big "?" on a scrap of paper (80 × 100), for a mishearing. */
function huh(): string {
  return svg({ w: 80, h: 100, name: 'l1c6-huh', boil: false }, [
    piece(circle(40, 50, 36), C.white, { rough: 1 }),
    raw(`<text x="40" y="72" text-anchor="middle" font-family="Andika, sans-serif" font-size="60" font-weight="700" fill="${C.rust}">?</text>`),
  ]);
}

/** A wavy ribbon of sweet smell (200 × 80). */
function scent(): string {
  return svg({ w: 200, h: 80, name: 'l1c6-scent', boil: false }, [
    ink([[6, 40], [40, 14], [80, 44], [120, 16], [160, 46], [194, 22]], { width: 5, color: C.raspberry, opacity: 0.8, wobble: 1 }),
    ink([[20, 62], [60, 40], [100, 66], [140, 42], [180, 64]], { width: 3, color: C.pink, opacity: 0.7, wobble: 1 }),
  ]);
}

// ---------------------------------------------------------------- helpers

/** Hangs a pan on hook i: it swings up off his coat and onto the hook, ringing. */
async function hang(k: Kit, pan: HTMLElement, i: number, from: [number, number]): Promise<void> {
  const left = parseFloat(pan.style.left);
  const top = parseFloat(pan.style.top);
  k.set(pan, { opacity: 1, x: from[0] - left, y: from[1] - top, rotation: -120, scale: 0.6 });
  await k.to(pan, 0.4, { x: 0, y: 0, rotation: 0, scale: 1, ease: 'back.out(1.4)' });
  ring(i);
  void k.to(pan, 0.25, { rotation: i % 2 ? 6 : -6, yoyo: true, repeat: 1, transformOrigin: '50% 0%' });
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    clank: { who: 'narrator', text: 'Clank! Clatter! Down came the Saucepan Man, covered in pots and pans.' },
    ask: { who: 'hero', text: 'Hello! How many saucepans have you got?' },
    beans: { who: 'saucepan', text: 'EH? A CAN of BEANS? No! But I’ve got five big pans… and four little ones!' },
    nine: { who: 'hero', text: 'Five and four make nine! Nine saucepans!' },
    keep: { who: 'saucepan', text: 'PINE cones? Oh, NINE! Clever {name}! Here, have one to keep!' },
    smell: { who: 'narrator', text: 'Then a lovely smell came drifting down… from a little yellow door.' },
  },

  async play(k) {
    k.backdrop(railBackdrop());
    k.light(700, 60, 320, { color: '#fff7d6', strength: 0.3, flicker: true });
    k.ambient('dust', { count: 14 });
    k.music('adventure');

    const hero = k.character('hero', { x: 950, y: 400, w: 220, z: 20, flip: true });
    const rp = k.add(rope(), { x: 200, y: -60, w: 20, h: 460, z: 9 });
    const man = k.character('saucepan', { x: 50, y: 360, w: 290, z: 18 });
    const pots = k.part(man, 'pots');
    await k.enter(hero, 'right');

    // ---- CLANK! CLATTER! He slides down his rope.
    const arrive = async () => {
      k.set(man, { y: -720 });
      clank(6);
      await k.to(man, 1.1, { y: -40, ease: 'power1.in' });
      clank(4);
      k.fx.thud();
      void k.quake(5);
      await k.to(man, 0.3, { y: 0, ease: 'bounce.out' });
      await k.to(pots, 0.15, { rotation: 6, yoyo: true, repeat: 3 });
      void k.fade(rp, 0, 0.4);
    };
    await k.all(k.say('clank'), arrive());
    await k.say('ask', hero);

    // ---- EH? Beans? He mishears… but hangs up his pans anyway.
    eh();
    const armR = k.part(man, 'armR');
    void k.to(armR, 0.3, { rotation: -10 });
    const q = k.add(huh(), { x: 260, y: 300, w: 64, z: 26 });
    void k.appear(q, 0.3).then(() => k.wait(900)).then(() => k.vanish(q));
    const pans = Array.from({ length: 9 }, (_, i) => {
      const w = i < 5 ? 100 : 70;
      const el = k.prop('saucepan', { x: hookX(i) - w / 2 + 4, y: RAIL.y + 26, w, z: 14 });
      k.set(el, { opacity: 0 });
      return el;
    });
    const from: [number, number] = [190, 560];
    const hangAll = async () => {
      await k.wait(2000);
      void k.to(armR, 0.3, { rotation: 0 });
      for (let i = 0; i < 5; i++) {
        clank(1);
        await hang(k, pans[i], i, from);
      }
      await k.wait(400);
      for (let i = 5; i < 9; i++) {
        clank(1);
        await hang(k, pans[i], i, from);
      }
    };
    await k.all(k.say('beans', man), hangAll(), k.shake(man, 3, 2));

    // ---- Five and four make nine: count on from five, in gold.
    const tags: HTMLElement[] = [];
    const count = async () => {
      for (let i = 0; i < 9; i++) {
        const w = i < 5 ? 54 : 48;
        const t = k.add(tag(i + 1, i < 5 ? C.cream : C.goldLight), { x: hookX(i) - w / 2 + 4, y: RAIL.y + (i < 5 ? 130 : 108), w, z: 16 });
        tags.push(t);
        ring(i);
        void k.appear(t, 0.2);
        await k.wait(i < 5 ? 160 : 330);
      }
      const card = k.add(sumStrip('5 + 4 = 9', 'l1c6-sum'), { x: 460, y: 490, w: 300, z: 26 });
      tags.push(card);
      k.sfx.sparkle();
      await k.appear(card, 0.35);
    };
    await k.all(k.say('nine', hero), count(), k.hop(hero, 30, 1));

    // ---- PINE cones? Oh, NINE! A saucepan to keep, and a jolly jiggle.
    eh();
    const gift = k.keepsake(k.chapter!.keepsake, { x: 700, y: 120, w: 150, z: 26 });
    k.set(gift, { opacity: 0 });
    const give = async () => {
      await k.wait(1500);
      clank(3);
      k.set(gift, { opacity: 1, x: -460, y: 380, rotation: -200, scale: 0.4 });
      k.fx.whizz();
      await k.to(gift, 0.8, { x: 0, y: 0, rotation: 0, scale: 1, ease: 'power2.out' });
      k.sfx.sparkle();
      k.sparkle(775, 190, 14, 120);
      k.float(gift, 5, 2);
    };
    const jiggle = async () => {
      await k.wait(2600);
      // The jolly jiggle: every pan swings and rings like a peal of bells.
      tags.forEach((t) => void k.fade(t, 0, 0.3));
      void k.hop(man, 30, 2);
      for (let i = 0; i < 9; i++) {
        ring(8 - i);
        void k.to(pans[i], 0.2, { rotation: i % 2 ? 12 : -12, yoyo: true, repeat: 3, transformOrigin: '50% 0%' });
        await k.wait(70);
      }
    };
    k.music('triumph');
    await k.all(k.say('keep', man), give(), jiggle());

    // ---- A sweet smell drifts down from Silky's door.
    k.music('magic');
    const sniff = async () => {
      waft();
      for (let i = 0; i < 3; i++) {
        const s = k.add(scent(), { x: 1000, y: 160 + i * 30, w: 180, z: 28, flip: true });
        k.set(s, { opacity: 0 });
        void k.to(s, 0.4, { opacity: 1 }).then(() => k.to(s, 2.2, { x: -700 - i * 60, y: 180 + i * 50, opacity: 0, ease: 'sine.inOut' }));
        await k.wait(450);
      }
      void k.to(hero, 0.4, { rotation: -6, y: -10 });
      void k.to(man, 0.4, { rotation: 5, y: -10 });
      await k.wait(600);
      k.light(1100, 150, 120, { color: C.goldLight, strength: 0.6, flicker: true, z: 30 });
      await k.camera({ zoom: 1.5, x: 1000, y: 200 }, 1.6);
    };
    await k.all(k.say('smell'), sniff());
    k.sparkle(1100, 150, 12, 100);
    await k.wait(800);
  },
});
