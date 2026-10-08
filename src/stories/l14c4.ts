/**
 * Land 14, chapter 4: Hot Caves, Cold Caves.
 *
 * Two tunnels, and a goblin thermometer beside each. Joe (or Beth, if he
 * climbs with Joe) asks which is hotter, and the red line climbs: thirty
 * in the left one, ten in the right (the chapter's reading a thermometer in
 * tens). Thirty is hotter! In the warm cave, goblins are snoring (zzz), so
 * the children tiptoe off through the cold one, brr. The thermometer is the
 * keepsake. At the far end, something big glints in the lamplight: the
 * goblins' great scales. Next: The Goblins' Scales.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, numberTag } from './bits';
import { cave, dialArt, dialAt, goblin, goblinSound, scalePan, sleepy, snoreArt, thermoArt, tunnelArt } from './goblinCave';

const HOT = { x: 250, therm: 460 };
const COLD = { x: 600, therm: 810 };

export default defineStory({
  lines: {
    ask_joe: { who: 'joe', text: 'Two caves. Which one is hotter? Let’s read the thermometers.' },
    ask_beth: { who: 'beth', text: 'Two caves. Which one is hotter? Let’s read the thermometers.' },
    read: { who: 'narrator', text: 'This one says thirty. That one says ten.' },
    hotter: { who: 'hero', text: 'Thirty is hotter! Ten is cold. Brrr!' },
    snore: { who: 'narrator', text: 'And in the warm cave, the goblins were fast asleep. Snore… snore…' },
    tiptoe_joe: { who: 'joe', text: 'Then we tiptoe through the cold cave. Shh!' },
    tiptoe_beth: { who: 'beth', text: 'Then we tiptoe through the cold cave. Shh!' },
    scales: { who: 'hero', text: 'Look, at the end! Great big goblin scales!' },
  },

  async play(k: Kit) {
    cave(k);
    k.music('sneaky');

    // Two tunnels: a warm orange glow from one, a cold blue one from the other.
    k.add(tunnelArt('l14c4-hot'), { x: HOT.x - 100, y: 270, w: 200, z: 8 });
    k.add(tunnelArt('l14c4-cold'), { x: COLD.x - 100, y: 270, w: 200, z: 8 });
    k.light(HOT.x, 420, 150, { color: '#ff8a3a', strength: 0.45, flicker: true, z: 9 });
    k.light(COLD.x, 420, 150, { color: '#8ec8ff', strength: 0.45, z: 9 });
    k.ambient('embers', { count: 8, area: [HOT.x - 80, 320, 160, 180], z: 9 });
    k.ambient('snow', { count: 8, area: [COLD.x - 80, 320, 160, 180], z: 9 });

    // Thermometers, empty to start with: the red line climbs into each.
    const empty = [
      k.add(thermoArt('l14c4-t0a', 0, true), { x: HOT.therm - 55, y: 190, w: 110, z: 12 }),
      k.add(thermoArt('l14c4-t0b', 0, false), { x: COLD.therm - 55, y: 190, w: 110, z: 12 }),
    ];
    const hot = k.add(thermoArt('l14c4-t30', 30, true), { x: HOT.therm - 55, y: 190, w: 110, z: 13 });
    const cold = k.add(thermoArt('l14c4-t10', 10, false), { x: COLD.therm - 55, y: 190, w: 110, z: 13 });
    k.set([hot, cold], { opacity: 0 });

    const who = buddy(k, 'joe', 'beth');
    const b = k.character(who, { x: -10, y: 400, w: 220, z: 20 });
    const hero = k.character('hero', { x: 930, y: 400, w: 230, z: 20, flip: true });
    await k.all(k.enter(b, 'left'), k.enter(hero, 'right'));
    await k.say(`ask_${who}` as 'ask_joe', b);

    // Thirty, and ten.
    const t30 = k.add(numberTag('30', C.goldLight, 'l14c4-30'), { x: HOT.therm - 160, y: 150, w: 110, z: 22 });
    const t10 = k.add(numberTag('10', '#cfe6f6', 'l14c4-10'), { x: COLD.therm + 60, y: 150, w: 110, z: 22 });
    k.set([t30, t10], { opacity: 0 });
    const reading = async () => {
      await k.fade(hot, 1, 1.2);
      goblinSound.ding(2);
      await k.appear(t30, 0.3);
      await k.wait(500);
      await k.fade(cold, 1, 0.8);
      goblinSound.ding(0);
      await k.appear(t10, 0.3);
    };
    await k.all(k.say('read'), reading());
    void k.all(...empty.map((e) => k.fade(e, 0, 0.2)));
    void k.pop(t30, 1.25);
    k.sparkle(HOT.therm, 260, 12, 110);
    await k.all(k.say('hotter', hero), k.shake(hero, 4, 2));

    // Goblins asleep in the warm cave: two red caps, eyes shut, and zzz.
    const sleepers = [goblin(k, 'l14c4-g1', HOT.x - 95, 330, { w: 110, z: 10 }), goblin(k, 'l14c4-g2', HOT.x - 5, 336, { w: 104, z: 10, flip: true })];
    sleepers.forEach((g) => sleepy(k, g, true));
    const zzz = k.add(snoreArt('l14c4-z'), { x: HOT.x + 10, y: 260, w: 80, z: 11 });
    k.set([...sleepers, zzz], { opacity: 0 });
    void k.all(...sleepers.map((g) => k.fade(g, 1, 0.6)));
    void k.fade(zzz, 1, 0.6);
    k.float(zzz, 10, 2.4);
    goblinSound.grumble();
    await k.say('snore');

    // The thermometer for the treasure room, and off through the cold cave.
    const keep = k.keepsake(k.chapter?.keepsake ?? 'thermometer', { x: 510, y: 520, w: 130, z: 24 });
    k.set(keep, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(keep, 0.4);
    await k.all(k.say(`tiptoe_${who}` as 'tiptoe_joe', b), k.wait(1200).then(() => k.fade(keep, 0, 0.4)));
    goblinSound.creep(5);
    await k.all(k.to(b, 1.4, { x: COLD.x - 60, scale: 0.5, y: -100, opacity: 0, ease: 'power1.in' }), k.wait(300).then(() => k.to(hero, 1.4, { x: COLD.x - 950, scale: 0.5, y: -100, opacity: 0, ease: 'power1.in' })));

    // Out the other side, and there in the lamplight: the goblins' great scales.
    const scene = [...k.root.querySelectorAll<HTMLElement>(':scope > .story-actor, :scope > .story-light, :scope > .story-mote')];
    await k.all(...scene.map((el) => k.fade(el, 0, 0.6)));
    const pan = k.add(scalePan('l14c4-pan'), { x: 460, y: 190, w: 260, z: 12 });
    const dial = k.add(dialArt('l14c4-dial', { max: 20, step: 5, minor: 1, unit: 'kg' }), { x: 460, y: 300, w: 260, z: 12 });
    dialAt(k, dial, 20, 0);
    k.set([pan, dial], { opacity: 0 });
    k.sfx.sparkle();
    await k.all(k.fade(pan, 1, 0.6), k.fade(dial, 1, 0.6));
    await k.say('scales');
    await k.wait(700);
  },
});
