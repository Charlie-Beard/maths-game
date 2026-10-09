/**
 * Land 14, chapter 7: The Saucepan Man is Free!
 *
 * The goblin cage, the goblins' clock on the wall, and a Red Goblin asleep
 * on a stool under the hook where the key hangs. Ten past three: the
 * goblins wake at twenty past (the chapter's time to five minutes). Silky
 * flies up, quiet as a moth, and lifts the key while the minute hand moves
 * on to quarter past. Click! The cage swings open and out clanks the
 * Saucepan Man, free at last; his lid pops off for the treasure room. And
 * there behind the cage is the big drum. Then the clock reaches twenty
 * past: BRRRING! The goblin wakes up. Next: Run from the Red Goblins!
 */
import { gsap } from 'gsap';
import { bell, C, defineStory, NOTE, now, tone, type Kit } from './kit';
import { numberTag, together } from './bits';
import { cageBack, cageFront, cave, clockArt, clockAt, clockTo, drumArt, goblin, goblinSound, keyArt, padlock, sleepy, snoreArt } from './goblinCave';

/** An alarm clock going off: a fast, bright bell ring (never a flash). */
function brring(): void {
  const t = now();
  for (let i = 0; i < 10; i++) bell(i % 2 ? NOTE.E6 : NOTE.C6, t + i * 0.07, 0.05, 0.15);
  tone(1400, t, { wave: 'square', peak: 0.02, attack: 0.01, decay: 0.7, lowpass: 2400 });
}

/** A key turning in a padlock: two small clicks. */
function click(): void {
  const t = now();
  for (const dt of [0, 0.14]) tone(1900, t + dt, { wave: 'triangle', peak: 0.06, attack: 0.002, decay: 0.05 });
}

const CAGE = { x: 300, y: 60, w: 260 };
const HOOK = { x: 830, y: 160 };

export default defineStory({
  lines: {
    clock: { who: 'narrator', text: 'Ten past three. The goblins wake up at twenty past. Ten minutes!' },
    key: { who: 'silky', text: 'The key is on that hook. I’ll fly up, quiet as a moth.' },
    tick: { who: 'narrator', text: 'Tick, tock. Quarter past three…' },
    free: { who: 'saucepan', text: 'I’M FREE! Clank, clank, hooray! Thank you, {name}!' },
    drum: { who: 'hero', text: 'And look, behind the cage! The big drum! We’re taking that home too.' },
    brring: { who: 'narrator', text: 'Twenty past three. BRRRING!' },
    oi: { who: 'redGoblin', text: 'OI! Who let him OUT? And where’s my DRUM going?' },
  },

  async play(k: Kit) {
    cave(k, { dim: 0.32, color: '#0b0606' });
    k.music('sneaky');
    k.light(430, 260, 260, { color: '#d8f59a', strength: 0.25, z: 35 });

    // The big drum, tucked away behind the cage.
    const drum = k.add(drumArt('l14c7-drum'), { x: CAGE.x + 170, y: 390, w: 200, z: 12 });
    // The cage, with the Saucepan Man inside and a padlock on the bars.
    const back = k.add(cageBack('l14c7-back'), { ...CAGE, z: 14 });
    const sauce = k.character('saucepan', { x: CAGE.x + 30, y: CAGE.y + 110, w: 200, z: 15 });
    const front = k.add(cageFront('l14c7-front'), { ...CAGE, z: 16 });
    const lock = k.add(padlock('l14c7-lock'), { x: CAGE.x + 95, y: CAGE.y + 210, w: 70, z: 17 });
    k.set(front, { transformOrigin: '0% 50%' });

    // The goblins' clock, and a goblin asleep under the hook with the key on it.
    const clock = k.add(clockArt('l14c7-clock'), { x: 620, y: 40, w: 180, z: 12 });
    clockAt(k, clock, 3, 10);
    const key = k.add(keyArt('l14c7-key'), { x: HOOK.x, y: HOOK.y, w: 120, z: 18 });
    k.set(key, { rotation: 90, transformOrigin: '20% 50%' });
    const gob = goblin(k, 'l14c7-gob', 800, 300, { w: 190, z: 18, flip: true });
    sleepy(k, gob, true);
    const zzz = k.add(snoreArt('l14c7-z'), { x: 900, y: 250, w: 80, z: 19 });
    k.float(zzz, 10, 2.4);
    // Snoring: a slow breath in and out.
    const breath = gsap.to(gob, { scaleY: 1.03, transformOrigin: '50% 100%', duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    const hero = k.character('hero', { x: 20, y: 420, w: 220, z: 30 });
    const silky = k.character('silky', { x: 560, y: 400, w: 210, z: 30 });
    k.float(silky, 8, 2.2);
    await k.all(k.enter(hero, 'left'), k.fade(silky, 1, 0.5));

    // Ten past three. Twenty past, and they wake.
    const t10 = k.add(numberTag('3:10', C.cream, 'l14c7-310'), { x: 640, y: 230, w: 140, z: 22 });
    k.set(t10, { opacity: 0 });
    void k.appear(t10, 0.3);
    goblinSound.grumble();
    await k.say('clock');

    // Silky flies up for the key, while the minute hand moves on.
    await k.say('key', silky);
    void k.fade(t10, 0, 0.3);
    const t15 = k.add(numberTag('3:15', C.cream, 'l14c7-315'), { x: 640, y: 230, w: 140, z: 22 });
    k.set(t15, { opacity: 0 });
    const flying = async () => {
      k.fx.twinkle();
      await k.to(silky, 1.4, { x: HOOK.x - 600, y: HOOK.y - 430, scale: 0.75, ease: 'sine.inOut' });
      goblinSound.clink();
      await k.wait(300);
      await k.all(k.to(silky, 1.4, { x: CAGE.x - 330, y: -100, scale: 0.85, ease: 'sine.inOut' }), k.to(key, 1.4, { x: CAGE.x + 60 - HOOK.x, y: CAGE.y + 230 - HOOK.y, rotation: 0, ease: 'sine.inOut' }));
    };
    const ticking = async () => {
      await clockTo(k, clock, 3, 15, 1.2);
      await k.appear(t15, 0.3);
    };
    await k.all(k.say('tick'), flying(), ticking());

    // Click! The cage swings open.
    click();
    await k.wait(300);
    void k.vanish(lock, 0.3);
    void k.fade(key, 0, 0.3);
    k.fx.creak();
    await k.to(front, 0.7, { scaleX: 0.08, ease: 'power2.inOut' });
    goblinSound.clank(4);
    await k.to(sauce, 0.6, { x: -150, y: 260, ease: 'back.out(1.4)' });
    const lid = k.keepsake(k.chapter?.keepsake ?? 'saucepanLid', { x: CAGE.x - 20, y: 330, w: 120, z: 32 });
    k.set(lid, { opacity: 0, y: 60 });
    k.sfx.sparkle();
    void k.all(k.fade(lid, 1, 0.3), k.to(lid, 0.5, { y: -40, rotation: 20, ease: 'power2.out' }));
    await k.all(k.say('free', sauce), k.hop(sauce, 30, 2), k.hop(hero, 26, 2));
    void k.fade(lid, 0, 0.5);

    // The big drum.
    void k.all(k.fade(back, 0.4, 0.5), k.fade(front, 0.4, 0.5));
    await k.pop(drum, 1.1);
    goblinSound.boom();
    await k.all(k.say('drum', hero), k.pop(drum, 1.08));

    // Twenty past three. BRRRING!
    void k.fade(t15, 0, 0.3);
    const t20 = k.add(numberTag('3:20', C.goldLight, 'l14c7-320'), { x: 640, y: 230, w: 140, z: 22 });
    k.set(t20, { opacity: 0 });
    await clockTo(k, clock, 3, 20, 1);
    void k.appear(t20, 0.3);
    brring();
    void k.shake(clock, 5, 3);
    await k.say('brring');
    // The goblin wakes up with a start.
    k.remove(zzz);
    breath?.progress(0).kill();
    sleepy(k, gob, false);
    goblinSound.grumble();
    await k.hop(gob, 40);
    await k.all(k.say('oi', gob), k.shake(gob, 8, 3), together(k, [hero, sauce], 0.2, { y: '-=24' }).then(() => together(k, [hero, sauce], 0.2, { y: '+=24' })));
    await k.wait(400);
  },
});
