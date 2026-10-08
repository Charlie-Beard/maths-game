/**
 * Land 3, chapter 1: Toffee Shock Trees.
 *
 * Up the ladder and into the Land of Goodies. Silky shows them a toffee-
 * shock tree hung with ten wrapped toffees. Fizz… bang… POP! Three shoot
 * off into the hero's paper bag: seven on the tree and three in the bag
 * make ten. {name} tries one, it fizzes and fizzes, and POP, up he goes
 * like a cork. Silky laughs, and a splashing sound leads them on to the
 * lemonade fountain. Next: The Lemonade Fountain.
 */
import { gsap } from 'gsap';
import { band, C, circle, defineStory, ellipse, ink, noiseBurst, NOTE, now, piece, poly, svg, tone, tune, type Kit, type Node, type Pt } from './kit';
import { at, sumCard } from './bits';

// ------------------------------------------------------------------ sounds

/** A toffee shock going off: a fizz that rises, a soft bang, a bright pop. */
function fizzBangPop(big = false): void {
  const t = now();
  noiseBurst(t, { freq: 2500, q: 1.2, peak: big ? 0.09 : 0.06, attack: 0.25, decay: 0.2, sweepTo: 7000 });
  tone(90, t + 0.45, { peak: big ? 0.22 : 0.15, decay: 0.18, glideTo: 50 });
  noiseBurst(t + 0.45, { freq: 500, q: 0.8, peak: 0.1, decay: 0.12 });
  tone(600, t + 0.62, { wave: 'triangle', peak: 0.1, attack: 0.004, decay: 0.12, glideTo: 1500 });
}

/** A toffee dropping into a paper bag: a papery rustle and a soft tick. */
function rustle(): void {
  const t = now();
  noiseBurst(t, { freq: 3200, q: 0.9, peak: 0.06, decay: 0.12 });
  tone(380, t + 0.02, { wave: 'triangle', peak: 0.05, decay: 0.08 });
}

/** The toffee shock growing in his mouth: a bubbling fizz that climbs. */
function fizzing(): void {
  const t = now();
  for (let i = 0; i < 8; i++) tone(500 + i * 90 + Math.random() * 60, t + i * 0.09, { wave: 'sine', peak: 0.05, attack: 0.005, decay: 0.07, glideTo: 900 + i * 120 });
  noiseBurst(t, { freq: 4000, q: 1, peak: 0.04, attack: 0.5, decay: 0.3, sweepTo: 8000 });
}

/** Up like a cork… and down again: a slide whistle up and a soft bump. */
function corkUp(): void {
  const t = now();
  tone(300, t, { wave: 'triangle', peak: 0.1, attack: 0.02, decay: 0.55, glideTo: 1400, vibrato: [7, 12] });
}
function corkDown(): void {
  const t = now();
  tone(1300, t, { wave: 'triangle', peak: 0.08, attack: 0.02, decay: 0.5, glideTo: 260 });
  tone(110, t + 0.55, { peak: 0.2, decay: 0.2, glideTo: 60 });
}

/** Distant splashing (the fountain round the corner). */
function splashing(): void {
  const t = now();
  for (let i = 0; i < 4; i++) noiseBurst(t + i * 0.22, { freq: 1300 + i * 200, q: 0.8, peak: 0.05, attack: 0.02, decay: 0.25, sweepTo: 500 });
}

// --------------------------------------------------------------------- art

/** Where the ten toffees hang on the tree (in the tree's own 440 × 560 box). */
const HANGS: Pt[] = [0, 1, 2, 3, 4].flatMap((i) => [
  [86 + i * 68, 236 + (i % 2) * 14] as Pt,
  [100 + i * 62, 318 + ((i + 1) % 2) * 12] as Pt,
]);

/** A big toffee-shock tree (440 × 560): a barley-sugar trunk and a sugary canopy with ten strings. */
function toffeeTree(): string {
  const stripes: Node[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 540 - i * 46;
    stripes.push(ink([[206, y], [236, y - 26]], { width: 7, color: C.cream, opacity: 0.75 }));
  }
  return svg({ w: 440, h: 560, name: 'l3c1-tree' }, [
    piece(ellipse(220, 548, 130, 14), 'rgba(80,30,40,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    piece(band([[220, 556], [232, 420], [214, 300], [222, 200]], 46), C.toffee, { rough: 0.8 }),
    ...stripes,
    piece(circle(110, 200, 110), '#7fc0a0'),
    piece(circle(330, 196, 112), C.mint),
    piece(circle(220, 130, 130), C.candyPink),
    piece(circle(150, 290, 96), C.mint, { shadow: false }),
    piece(circle(300, 290, 100), '#7fc0a0', { shadow: false }),
    piece(circle(220, 250, 110), C.candyPink, { shadow: false }),
    // sugar sparkles on the leaves
    ...[[120, 140], [300, 120], [220, 70], [360, 240], [80, 270]].map(([x, y]) => piece(circle(x, y, 6), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 })),
    // the strings the toffees hang from
    ...HANGS.map(([x, y]) => ink([[x, y - 34], [x, y]], { width: 2.5, color: C.brownDark })),
  ]);
}

/** A striped paper sweet bag (180 × 200), open at the top. */
function sweetBag(): string {
  const stripes = [0, 1, 2, 3].map((i) => piece(poly([[34 + i * 34, 60], [50 + i * 34, 60], [56 + i * 36, 196], [40 + i * 36, 196]]), C.candyPink, { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 180, h: 200, name: 'l3c1-bag' }, [
    piece(poly([[20, 56], [160, 56], [170, 196], [10, 196]]), C.white),
    ...stripes,
    piece(poly([[16, 46], [164, 46], [160, 70], [20, 70]]), C.cream, { edge: 'torn' }),
  ]);
}

// ------------------------------------------------------------------ helpers

/** A hop along an arc to an absolute stage spot (the actor's top-left). */
function arc(k: Kit, el: HTMLElement, x: number, y: number, height: number, seconds: number): Promise<void> {
  const bx = parseFloat(el.style.left) || 0;
  const by = parseFloat(el.style.top) || 0;
  const peak = Math.min(at(el)[1], y) - height;
  return k.all(
    k.to(el, seconds, { x: x - bx, rotation: '+=200', ease: 'none' }),
    k.to(el, seconds / 2, { y: peak - by, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y: y - by, ease: 'power2.in' })),
  );
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    arrive: { who: 'narrator', text: 'Into the Land of Goodies! Here, the trees grow toffees.' },
    watch: { who: 'silky', text: 'Toffee shocks! Ten on this tree. Watch… fizz, bang, POP!' },
    ten: { who: 'hero', text: 'Three in the bag, seven on the tree. Seven and three make ten!' },
    try: { who: 'narrator', text: '{name} tried one. It fizzed… and fizzed… and fizzed…' },
    next: { who: 'silky', text: 'Ha! Up like a cork! Now listen… splashing! Is that lemonade?' },
  },

  async play(k) {
    k.landScene();
    k.music('adventure');
    k.ambient('dust', { count: 18 });
    k.light(600, 120, 300, { color: '#fff3d0', strength: 0.35 });

    // A soft glow behind the big tree lifts it off the land behind.
    k.light(590, 330, 330, { color: '#fffaf0', strength: 0.55, z: 7 });
    const tree = k.add(toffeeTree(), { x: 370, y: 116, w: 440, h: 560, z: 8 });
    const tx = 370;
    const ty = 116;
    const toffees = HANGS.map(([x, y], i) => k.prop('toffee', { x: tx + x - 40, y: ty + y - 10, w: 80, z: 9 + (i % 2) }));
    // Each toffee swings a little on its string.
    if (!k.calm) toffees.forEach((t, i) => gsap.to(t, { rotation: i % 2 ? 6 : -6, transformOrigin: '50% 0%', duration: 0.9 + (i % 3) * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

    const silky = k.character('silky', { x: 50, y: 380, z: 20 });
    const hero = k.character('hero', { x: 870, y: 384, z: 20 });
    const bag = k.add(sweetBag(), { x: 800, y: 530, w: 150, z: 22 });
    k.set([silky, hero, bag], { opacity: 0 });

    await k.camera({ zoom: 1.25, x: 590, y: 300 }, 0.01);
    await k.all(k.say('arrive'), k.camera({}, 2.0));
    k.fx.twinkle();
    await k.all(k.enter(silky, 'left'), k.enter(hero, 'right').then(() => k.appear(bag, 0.3)));
    k.float(silky, 6, 2.4);

    // Silky waves her wand at the tree.
    const [wandArm] = k.part(silky, 'armR');
    if (wandArm) void k.to(k.part(silky, 'armR'), 0.4, { rotation: -70 });
    await k.all(k.say('watch', silky), k.camera({ zoom: 1.3, x: 640, y: 330 }, 1.6));
    if (wandArm) void k.to(k.part(silky, 'armR'), 0.3, { rotation: 0 });

    // Three toffees go fizz-bang-POP, one by one, into the bag.
    for (const [n, i] of [1, 6, 9].entries()) {
      const t = toffees[i];
      gsap.killTweensOf(t);
      fizzBangPop(n === 2);
      await k.shake(t, 5, 1);
      k.puff(at(t)[0] + 40, at(t)[1] + 34, 90, C.goldLight);
      t.style.zIndex = '30';
      await arc(k, t, 834 + n * 14, 536, 140, 0.5);
      rustle();
      void k.pop(bag, 1.08);
      await k.fade(t, 0, 0.15);
    }

    void k.camera({}, 0.9);
    // The sum, on a torn card above the tree.
    const card = k.add(sumCard('7 + 3 = 10', 'l3c1-sum'), { x: 380, y: 26, w: 420, h: 130, z: 40 });
    k.set(card, { opacity: 0 });
    tune([[NOTE.C5, 0], [NOTE.E5, 0.12], [NOTE.G5, 0.24], [NOTE.C6, 0.4]], 0.1);
    void k.appear(card, 0.4);
    await k.all(k.say('ten', hero), k.hop(hero, 30, 2));

    // He tries one. It fizzes and grows… and POP!
    void k.fade(card, 0, 0.4);
    const mine = k.prop('toffee', { x: 860, y: 540, w: 64, z: 30 });
    await k.to(mine, 0.4, { x: 70, y: -100, scale: 0.6, ease: 'power2.out' });
    k.remove(mine);
    const fizz = (async () => {
      for (let i = 0; i < 3; i++) {
        fizzing();
        await k.pop(hero, 1.06 + i * 0.03);
        await k.wait(180);
      }
    })();
    await k.all(k.say('try'), fizz);
    fizzBangPop(true);
    await k.wait(400);
    k.puff(1000, 440, 200, C.goldLight);
    corkUp();
    await k.to(hero, 0.5, { y: -560, rotation: 20, ease: 'power2.out' });
    k.sparkle(1000, 120, 16, 200);
    await k.wait(600);
    corkDown();
    await k.to(hero, 0.55, { y: 0, rotation: 0, ease: 'bounce.out' });

    // Silky laughs, and the toffee becomes his keepsake.
    void k.shake(silky, 6, 2);
    k.light(590, 420, 150, { color: C.goldLight, strength: 0.6, z: 41 });
    const keep = k.keepsake(k.chapter!.keepsake, { x: 490, y: 320, w: 200, z: 42 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(keep, 0.4);
    k.sparkle(590, 420, 14, 150);
    k.float(keep, 6, 1.6);

    // A splashing sound, off to the right: the fountain.
    splashing();
    void k.to(k.part(silky, 'armR'), 0.4, { rotation: -100 });
    const pan = k.wait(1600).then(() => {
      splashing();
      void k.fade(keep, 0, 0.5);
      return k.camera({ zoom: 1.2, x: 900, y: 360 }, 1.6);
    });
    await k.all(k.say('next', silky), pan);
    await k.wait(400);
    void tree;
  },
});
