/**
 * Land 14, chapter 5: The Goblins' Scales.
 *
 * Beth (or Fran, if he climbs with Beth) and {name} peep out at the
 * goblins' great scales. A Red Goblin heaves something onto the pan: Mr
 * Oom Boom Boom's big drum! "How heavy is MY drum?" The needle stops two
 * little marks past ten. Eleven, twelve: twelve kilograms (the chapter's
 * reading the marks between the numbers). Too heavy to bang, grumbles the
 * goblin, and off he stomps to bed. The scales are the keepsake. Then,
 * far off in the dark: clank… clank. A soft light comes bobbing down the
 * tunnel. It's Silky, with a glow-worm in a jar. Next: Clank! Clank!
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, numberTag } from './bits';
import { cave, dialArt, dialAt, dialTo, drumArt, goblinSound, scalePan } from './goblinCave';

const DIAL = { x: 450, y: 300 };

export default defineStory({
  lines: {
    drum_beth: { who: 'beth', text: 'Look! Mr Oom Boom Boom’s big drum! The goblins are weighing it.' },
    drum_fran: { who: 'fran', text: 'Look! Mr Oom Boom Boom’s big drum! The goblins are weighing it.' },
    mine: { who: 'redGoblin', text: 'MY drum now! How heavy is my big drum?' },
    read: { who: 'narrator', text: 'The needle stopped two marks past ten. Eleven, twelve. Twelve kilograms!' },
    bed: { who: 'redGoblin', text: 'Twelve kilograms? Too heavy to bang! Hmph. I’m off to bed.' },
    clank: { who: 'narrator', text: 'Then, far away in the dark… clank. Clank!' },
    silky: { who: 'silky', text: 'I followed my glow-worm all the way down. Did you hear that clanking?' },
  },

  async play(k: Kit) {
    cave(k);
    k.music('sneaky');

    // The goblins' big scale: 0 to 20 kilograms, a number every 5 and a mark for every 1.
    k.add(scalePan('l14c5-pan'), { x: DIAL.x, y: DIAL.y - 110, w: 260, z: 12 });
    const dial = k.add(dialArt('l14c5-dial', { max: 20, step: 5, minor: 1, unit: 'kg' }), { x: DIAL.x, y: DIAL.y, w: 260, z: 12 });
    dialAt(k, dial, 20, 0);

    // The children peep out from the left.
    const who = buddy(k, 'beth', 'fran');
    const b = k.character(who, { x: -20, y: 420, w: 210, z: 20 });
    const hero = k.character('hero', { x: 150, y: 440, w: 210, z: 21 });
    await k.all(k.enter(b, 'left'), k.enter(hero, 'left'));

    // A Red Goblin heaves the drum onto the pan.
    const gob = k.character('redGoblin', { x: 820, y: 380, w: 250, z: 20, flip: true });
    k.set(gob, { opacity: 0 });
    const drum = k.add(drumArt('l14c5-drum'), { x: DIAL.x + 20, y: DIAL.y - 252, w: 220, z: 13 });
    k.set(drum, { y: -500 });
    goblinSound.creep(4);
    await k.all(k.fade(gob, 1, 0.3), k.enter(gob, 'right', 0.8));
    await k.to(drum, 0.6, { y: 0, ease: 'power2.in' });
    goblinSound.boom();
    void k.quake(4);
    void k.shake(dial, 3, 1);
    await k.all(k.say(`drum_${who}` as 'drum_beth', b), k.shake(hero, 4, 2));
    goblinSound.grumble();
    await k.all(k.say('mine', gob), k.shake(gob, 5, 2));

    // The needle swings round, and stops two marks past ten.
    const tag = k.add(numberTag('12 kg', C.goldLight, 'l14c5-12'), { x: DIAL.x + 270, y: 170, w: 170, z: 22 });
    k.set(tag, { opacity: 0 });
    const reading = async () => {
      await dialTo(k, dial, 20, 10, 1.2);
      await k.wait(700);
      goblinSound.ding(0);
      await dialTo(k, dial, 20, 11, 0.5);
      await k.wait(400);
      goblinSound.ding(1);
      await dialTo(k, dial, 20, 12, 0.5);
      goblinSound.ding(2);
      await k.appear(tag, 0.3);
    };
    await k.all(k.say('read'), reading());
    k.sparkle(DIAL.x + 130, DIAL.y + 80, 12, 110);
    void k.hop(hero, 20);

    // Too heavy to bang: off he stomps to bed.
    await k.all(k.say('bed', gob), k.shake(gob, 3, 2));
    k.fx.stomp(3, 0.3);
    await k.exit(gob, 'right', 0.9);

    // The goblins' scales for the treasure room.
    const keep = k.keepsake(k.chapter?.keepsake ?? 'goblinScales', { x: 860, y: 330, w: 170, z: 24 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(keep, 0.4);
    await k.wait(900);
    void k.fade(keep, 0, 0.4);
    void k.fade(tag, 0, 0.4);

    // Clank… clank, far off. A soft light comes bobbing down the tunnel.
    const dark = k.dim(0, '#0b0606');
    await k.fade(dark, 0.35, 0.8);
    goblinSound.clank(2);
    await k.all(k.say('clank'), k.shake(b, 3, 2));
    const silky = k.character('silky', { x: 860, y: 330, w: 230, z: 36 });
    const jar = k.keepsake('glowWorm', { x: 840, y: 470, w: 100, z: 37 });
    const glow = k.light(890, 510, 160, { color: '#d8f59a', strength: 0.55, z: 35 });
    k.set([silky, jar, glow], { opacity: 0 });
    k.fx.twinkle();
    await k.all(k.fade(silky, 1, 0.8), k.fade(jar, 1, 0.8), k.fade(glow, 0.55, 0.8));
    k.float(silky, 8, 2.2);
    await k.say('silky', silky);
    await k.wait(500);
  },
});
