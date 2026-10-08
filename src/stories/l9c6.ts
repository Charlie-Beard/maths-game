/**
 * Land 9, chapter 6: Quarter Past Snow.
 *
 * Beth (or Joe, if he climbs with Beth) shows {name} the thawed clock: the
 * big hand sweeps from the twelve to the three, a quarter of the way round,
 * so it is quarter past six (the chapter's quarter past). Beside it an
 * ice-pie is cut into four equal parts, and one quarter is lifted out: the
 * same quarter that the clock has just shaded. Why does quarter past six
 * matter? Dame Snap's land arrives at six, and a quarter of an hour later
 * she will be busy settling in: that is when they creep in. The sixth piece
 * goes on the map. Mr Snowman calls them over to count his icicles.
 * Next: Icicles to Count.
 */
import { C, defineStory, piece, poly, svg, type Kit, type Pt } from './kit';
import { clockFace, dewdrop, mapBoard, pieWedges } from './snow';

/** The shaded quarter of a clock, between the twelve and the three (200 × 200). */
function quarterShade(): string {
  const pts: Pt[] = [[100, 100]];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2);
    pts.push([100 + Math.sin(a) * 80, 100 - Math.cos(a) * 80]);
  }
  return svg({ w: 200, h: 200, name: 'l9c6-shade', boil: false }, [piece(poly(pts), C.sky, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 })]);
}

export default defineStory({
  lines: {
    clock_beth: { who: 'beth', text: 'The clock is working! The big hand is on the three. Quarter past six!' },
    clock_joe: { who: 'joe', text: 'The clock is working! The big hand is on the three. Quarter past six!' },
    quarter: { who: 'narrator', text: 'A quarter of the way round. Like one quarter of a pie: one of four equal parts.' },
    plan_beth: { who: 'beth', text: 'She comes at six. At quarter past she will be busy settling in. That is when we creep in!' },
    plan_joe: { who: 'joe', text: 'She comes at six. At quarter past she will be busy settling in. That is when we creep in!' },
    hero: { who: 'hero', text: 'Quarter past six. I will not forget.' },
    next: { who: 'snowman', text: 'Brr! Come and see my icicles. There are lots to count!' },
  },

  async play(k: Kit) {
    // Beth hosts, unless the hero is Beth: then Joe does.
    const host = k.hero === 'beth' ? 'joe' : 'beth';
    k.landScene();
    k.ambient('snow', { count: 20, z: 40 });
    k.music('dreamy');

    const hostEl = k.character(host, { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'right'));
    const drop = dewdrop(k);

    // ---- The clock at six o'clock, and an ice-pie in four.
    const clock = k.add(clockFace('l9c6-clock', 6, 0), { x: 300, y: 110, w: 270, z: 12 });
    const shade = k.add(quarterShade(), { x: 300, y: 110, w: 270, z: 13 });
    const wedges = pieWedges(4, 'l9c6-pie').map((art) => k.add(art, { x: 620, y: 110, w: 270, z: 12 }));
    k.set(shade, { opacity: 0 });
    [clock, ...wedges].forEach((e) => k.set(e, { opacity: 0 }));
    await k.all(k.fade(clock, 1, 0.5), ...wedges.map((w) => k.fade(w, 1, 0.5)));

    // ---- The big hand sweeps to the three: a quarter of the way round.
    const minute = k.pivot(k.part(clock, 'minHand'));
    const sweep = async () => {
      await k.wait(700);
      await k.to(minute, 2, { rotation: '+=90', ease: 'power2.inOut' });
    };
    await k.all(k.say(`clock_${host}`, hostEl), sweep());

    // The quarter of the clock is shaded, and one quarter of the pie lifts out.
    const matching = async () => {
      await k.wait(300);
      await k.fade(shade, 1, 0.5);
      await k.to(wedges[0], 0.7, { x: 36, y: -36, rotation: 5, ease: 'back.out(1.6)' });
      await drop.glow();
    };
    await k.all(k.say('quarter'), matching());

    // ---- Why quarter past six? The plan.
    await k.all(k.fade(clock, 0, 0.4), k.fade(shade, 0, 0.4), ...wedges.map((w) => k.fade(w, 0, 0.4)));
    const plan = mapBoard(k, 6);
    k.set(plan.board, { opacity: 0 });
    Object.values(plan.pieces).forEach((el) => k.set(el!, { opacity: 0 }));
    await k.fade(plan.board, 1, 0.5);
    await k.all(...Object.entries(plan.pieces).filter(([kind]) => kind !== 'quarter').map(([, el]) => k.fade(el!, 1, 0.4)));
    const drawing = async () => {
      await k.wait(1800);
      await plan.reveal();
    };
    await k.all(k.say(`plan_${host}`, hostEl), drawing());
    await k.all(k.say('hero', hero), drop.glow());

    // ---- Mr Snowman waves them over.
    const snowman = k.character('snowman', { x: 470, y: 380, z: 40 });
    k.fx.patter(5, 0.1);
    await k.enter(snowman, 'right', 0.8);
    await k.all(k.say('next', snowman), k.hop(hostEl, 24, 2));
    await k.wait(500);
  },
});
