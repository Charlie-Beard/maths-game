/**
 * Land 10, chapter 4: Lock after Lock.
 *
 * Further along the corridor, a cage hangs from the ceiling, and in it the
 * crossest pixie in the world. He shouts at them for peeping, then sees
 * who it is and helps: every lock here is a sum. The two big doors ahead
 * say 56 − 24 and 35 + 42 (the chapter's adding and taking away two-digit
 * numbers). {name} works them out, 32 and 77; click, CLUNK, and the doors
 * swing open on the dark. But the Pixie's own cage has her special lock,
 * and it won't budge (the cages open only in the finale). He's furious,
 * and brave: go and find the others! They promise to come back. Next: The
 * Folk in Cages.
 */
import { defineStory, type Kit } from './kit';
import { answerTag, caged, cellDoor, corridor, doorway, prisonSound, slateSum } from './snapPrison';

const DOORS = [
  { x: 60, sum: '56 − 24', answer: '32' },
  { x: 380, sum: '35 + 42', answer: '77' },
];
const DOOR_Y = 120;
const DOOR_W = 260;
const CAGE = { x: 800, y: 20, w: 290 };

export default defineStory({
  lines: {
    cage: { who: 'narrator', text: 'A cage hung from the ceiling. In it was the crossest pixie in the world.' },
    peep: { who: 'pixie', text: 'Stop PEEPING at me! Oh… it’s you. Listen. Every lock in here is a sum.' },
    sums: { who: 'pixie', text: 'That door is 56 take away 24. That one is 35 add 42!' },
    open: { who: 'narrator', text: '{name} worked them out. 32! 77! Click… CLUNK. The doors swung open.' },
    stuck: { who: 'pixie', text: 'Now MINE! Bah! Her cage locks won’t budge. Go and find the others!' },
    promise: { who: 'hero', text: 'We’ll come back for you, Pixie. We promise.' },
  },

  async play(k: Kit) {
    k.backdrop(corridor('l10c4-corridor'));
    k.music('sneaky');
    k.dim(0.25, '#0b0a14');
    k.light(80, 140, 130, { color: '#d9e2cf', strength: 0.3, flicker: true });
    k.light(670, 140, 130, { color: '#d9e2cf', strength: 0.3, flicker: true });
    k.ambient('dust', { count: 8, area: [0, 80, 1180, 500] });

    // The two doors, a sum on each, and the dark behind them.
    const doors = DOORS.map((d, i) => {
      k.add(doorway(`c4-${i}`), { x: d.x, y: DOOR_Y, w: DOOR_W, z: 5 });
      const door = k.add(cellDoor(`c4-${i}`), { x: d.x, y: DOOR_Y, w: DOOR_W, z: 6 });
      k.set(door, { transformOrigin: '0% 50%' });
      const lock = k.add(slateSum(d.sum, 240, `c4-${i}`), { x: d.x + 10, y: DOOR_Y + 120, w: 240, z: 7 });
      return { door, lock };
    });

    // The Pixie's cage, swaying a little on its chain.
    const cage = caged(k, 'pixie', { ...CAGE, z: 34, lock: '? ? ?', flip: true });
    k.set(cage.all, { transformOrigin: '50% 0%' });

    const hero = k.character('hero', { x: 40, y: 480, w: 220, z: 20 });
    const mf = k.character('moonface', { x: 560, y: 470, w: 220, z: 20 });
    k.set([hero, mf], { opacity: 0 });
    await k.all(k.enter(hero, 'left', 0.8), k.enter(mf, 'left', 1.0));
    prisonSound.rattle(3);
    await k.say('cage');

    // He rattles his bars and shouts, then sees who it is.
    prisonSound.rattle(7);
    void k.all(...cage.all.map((el) => k.shake(el, 6, 2)));
    void k.to(k.part(cage.who, 'puff'), 0.2, { scale: 1.2, yoyo: true, repeat: 3 });
    await k.say('peep', cage.who);
    await k.all(k.say('sums', cage.who), ...doors.map((d, i) => k.wait(600 + i * 1200).then(() => k.pop(d.lock, 1.1))));

    // The answers, and the doors open.
    const opening = async () => {
      for (const [i, d] of DOORS.entries()) {
        const tag = k.add(answerTag(d.answer), { x: d.x + 75, y: DOOR_Y + 250, w: 110, z: 8 });
        k.set(tag, { opacity: 0 });
        prisonSound.chalk(0.4);
        await k.appear(tag, 0.3);
        prisonSound.unlock();
        k.sparkle(d.x + 130, DOOR_Y + 280, 10, 110);
        await k.wait(300);
        k.fx.creak();
        await k.all(k.to(doors[i].door, 0.9, { scaleX: 0.12, ease: 'power2.inOut' }), k.fade(doors[i].lock, 0, 0.4), k.fade(tag, 0, 0.4));
      }
    };
    await k.all(k.say('open'), opening());
    k.sfx.success();
    await k.all(k.hop(hero, 30), k.hop(mf, 24));

    // His own lock: her special one. It won't budge.
    prisonSound.stuck();
    await k.all(...cage.all.map((el) => k.shake(el, 5, 1)));
    prisonSound.stuck();
    await k.all(k.say('stuck', cage.who), ...cage.all.map((el) => k.shake(el, 4, 2)));

    // A promise.
    k.music('adventure');
    await k.all(k.say('promise', hero), k.hop(hero, 20));
    await k.all(k.to(hero, 0.8, { x: 120 }), k.to(mf, 0.8, { x: -360 }));
    await k.all(k.fade(hero, 0, 0.5), k.fade(mf, 0, 0.5));
    prisonSound.caw(1);
    await k.wait(500);
  },
});
