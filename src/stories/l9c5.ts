/**
 * Land 9, chapter 5: The Frozen Clock Tower.
 *
 * The clock on the tower has frozen. Moon-Face reads it with {name}: the
 * little hand on the three, the big hand on the twelve, so three o'clock
 * (the chapter's o'clock times). Mr Snowman knows something important:
 * Dame Snap's land comes back at the coldest hour, SIX o'clock, before
 * sunrise. Moon-Face thaws the clock and turns the hands to six: bong,
 * bong, six bongs, counted. Six o'clock goes on the map (piece five).
 * Then a friend runs up: the big hand has started moving!
 * Next: Quarter Past Snow.
 */
import { C, circle, defineStory, piece, svg, type Kit } from './kit';
import { roundTag } from './bits';
import { bong, clockFace, dewdrop, mapBoard } from './snow';

/** Frost over the clock face (200 × 200). */
const frost = (): string => svg({ w: 200, h: 200, name: 'l9c5-frost', boil: false }, [piece(circle(100, 100, 94), C.ice, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 })]);

export default defineStory({
  lines: {
    ask: { who: 'moonface', text: 'The clock tower has frozen! Look, {name}. The little hand points to three.' },
    three: { who: 'narrator', text: 'Little hand on the three. Big hand on the twelve. It is three o’clock!' },
    hour: { who: 'snowman', text: 'Dame Snap’s land comes back at the coldest hour. That is six o’clock, before sunrise.' },
    turn: { who: 'moonface', text: 'Then let’s thaw the clock and turn the hands to six.' },
    bongs: { who: 'narrator', text: 'Bong, bong, bong, bong, bong, bong. Six o’clock!' },
    six: { who: 'hero', text: 'Six o’clock. That is when we must be ready.' },
    next_beth: { who: 'beth', text: 'Look! The big hand is moving all by itself!' },
    next_joe: { who: 'joe', text: 'Look! The big hand is moving all by itself!' },
  },

  async play(k: Kit) {
    // Beth runs up at the end, unless the hero is Beth: then Joe does.
    const sib = k.hero === 'beth' ? 'joe' : 'beth';
    k.landScene();
    k.ambient('snow', { count: 20, z: 40 });
    k.music('dreamy');

    const mf = k.character('moonface', { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    await k.all(k.enter(mf, 'left'), k.enter(hero, 'right'));
    const drop = dewdrop(k);

    // ---- The big clock, frozen at three o'clock.
    const clock = k.add(clockFace('l9c5-clock', 3, 0), { x: 450, y: 90, w: 280, z: 12 });
    const ice = k.add(frost(), { x: 450, y: 90, w: 280, z: 13 });
    [clock, ice].forEach((e) => k.set(e, { opacity: 0 }));
    await k.all(k.fade(clock, 1, 0.5), k.fade(ice, 1, 0.5));
    await k.say('ask', mf);
    // The hands, ready to turn about the middle of the clock.
    const hour = k.pivot(k.part(clock, 'hourHand'));
    await k.say('three');

    // ---- Mr Snowman knows the hour.
    const snowman = k.character('snowman', { x: 230, y: 380, w: 230, z: 20 });
    await k.enter(snowman, 'bottom', 0.7);
    await k.say('hour', snowman);

    // ---- Thaw the clock, turn the little hand to six, and count the bongs.
    const turning = async () => {
      await k.wait(600);
      await k.all(k.fade(ice, 0, 1.2), k.to(hour, 2, { rotation: '+=90', ease: 'power2.inOut' }));
    };
    await k.all(k.say('turn', mf), turning());
    const tags: HTMLElement[] = [];
    const counting = async () => {
      for (let n = 1; n <= 6; n++) {
        const t = k.add(roundTag(n, C.goldLight, `l9c5-bong-${n}`), { x: 280 + n * 84, y: 12, w: 72, z: 18 });
        tags.push(t);
        bong();
        void k.appear(t, 0.2);
        await k.pop(clock, 1.03);
        await k.wait(450);
      }
      await drop.glow();
    };
    await k.all(k.say('bongs'), counting());
    await k.all(...tags.map((t) => k.fade(t, 0, 0.4)));

    // ---- Six o'clock goes on the plan.
    await k.fade(clock, 0, 0.4);
    const plan = mapBoard(k, 5);
    k.set(plan.board, { opacity: 0 });
    Object.values(plan.pieces).forEach((el) => k.set(el!, { opacity: 0 }));
    await k.fade(plan.board, 1, 0.5);
    await k.all(...Object.entries(plan.pieces).filter(([kind]) => kind !== 'six').map(([, el]) => k.fade(el!, 1, 0.4)));
    const drawing = async () => {
      await k.wait(300);
      await plan.reveal();
    };
    await k.all(k.say('six', hero), drawing());

    // ---- A friend runs up: the big hand is moving!
    const friend = k.character(sib, { x: 560, y: 400, z: 40 });
    k.fx.patter(5, 0.1);
    await k.enter(friend, 'right', 0.8);
    await k.all(k.say(`next_${sib}`, friend), k.hop(mf, 24, 2));
    await k.wait(500);
  },
});
