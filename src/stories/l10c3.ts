/**
 * Land 10, chapter 3: The Corridor of Rules.
 *
 * Inside the prison, her rules are nailed up all along the corridor, and
 * every rule is a sum: 24 + 13, 35 + 21, 42 + 37 (the chapter's adding two
 * two-digit numbers). Beth says answer it right and the rule breaks. {name}
 * adds the tens, then the ones: 37, 56, 79, and each rule splits in two.
 * Then her shadow climbs the far wall, heels clacking, and she shrieks:
 * who is cracking her rules? Cut back to the heroes, flat against the wall,
 * not a sound, until the shadow shrinks away. From somewhere ahead, a
 * furious little voice. Next: Lock after Lock (the Angry Pixie).
 *
 * Beth is the host. If Beth is the child he climbs with, Fran says her lines.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, together } from './bits';
import { answerTag, corridor, crackCardOn, prisonSound, ruleCard, snapShadow } from './snapPrison';

const CARDS = [
  { x: 30, y: 110, sum: '24 + 13', answer: '37' },
  { x: 360, y: 140, sum: '35 + 21', answer: '56' },
  { x: 690, y: 110, sum: '42 + 37', answer: '79' },
];
const SHADOW = { x: 960, y: 150, w: 220 };

export default defineStory({
  lines: {
    rules_beth: { who: 'beth', text: 'Every rule on the wall is a sum. Get it right, and the rule breaks!' },
    rules_fran: { who: 'fran', text: 'Every rule on the wall is a sum. Get it right, and the rule breaks!' },
    adds: { who: 'narrator', text: '{name} added the tens, then the ones. 37! 56! 79! Crack, crack, CRACK!' },
    who: { who: 'dameSnap', text: 'WHO is cracking my RULES?' },
    hide: { who: 'moonface', text: 'Flat against the wall, everyone. Not one sound…' },
    pixie: { who: 'pixie', text: 'OI! Who’s out there? Get me OUT of this cage!' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'beth', 'fran');
    k.backdrop(corridor('l10c3-corridor'));
    k.music('sneaky');
    const gloom = k.dim(0.25, '#0b0a14');
    k.light(80, 140, 130, { color: '#d9e2cf', strength: 0.3, flicker: true });
    k.light(670, 140, 130, { color: '#d9e2cf', strength: 0.3, flicker: true });
    k.ambient('dust', { count: 10, area: [0, 80, 1180, 500] });

    const cards = CARDS.map((c, i) => {
      const el = k.add(ruleCard(i + 1, c.sum), { x: c.x, y: c.y, w: 300, z: 8 });
      k.set(el, { rotation: i % 2 ? 2 : -2 });
      return el;
    });

    const hero = k.character('hero', { x: 20, y: 440, w: 220, z: 20 });
    const hostEl = k.character(host, { x: 260, y: 450, w: 210, z: 20 });
    const mf = k.character('moonface', { x: 500, y: 440, w: 220, z: 20 });
    const gang = [hero, hostEl, mf];
    k.set(gang, { opacity: 0 });
    prisonSound.drip();
    await k.all(...gang.map((el, i) => k.wait(i * 150).then(() => k.enter(el, 'left', 0.9))));
    await k.say(`rules_${host}`, hostEl);

    // Tens, then ones: each rule gets its answer, and splits.
    const answering = async () => {
      for (const [i, c] of CARDS.entries()) {
        const tag = k.add(answerTag(c.answer), { x: c.x + 95, y: c.y + 200, w: 110, z: 12 });
        k.set(tag, { opacity: 0, rotation: 6 });
        prisonSound.chalk(0.4);
        await k.appear(tag, 0.35);
        k.fx.pop();
        await crackCardOn(k, cards[i], { x: c.x, y: c.y, w: 300 }, i + 1);
        k.sparkle(c.x + 150, c.y + 100, 10, 110);
        await k.wait(150);
      }
    };
    await k.all(k.say('adds'), answering());
    k.sfx.success();
    await k.all(k.hop(hero, 30), k.hop(hostEl, 30), k.hop(mf, 20));

    // Clack… clack… her shadow climbs the far wall.
    k.silence();
    const shade = k.add(snapShadow('l10c3-shadow'), { ...SHADOW, z: 7 });
    k.set(shade, { opacity: 0, scale: 0.35, transformOrigin: '50% 100%' });
    // Her lamp, coming up the corridor, throws the shadow ahead of her.
    const lamp = k.light(1070, 420, 260, { color: C.candle, strength: 0, z: 6 });
    void k.fade(lamp, 0.45, 2.2);
    for (const [i, loud] of [0.4, 0.7, 1].entries()) {
      prisonSound.heels(1, 0.3, loud);
      void k.to(shade, 0.5, { opacity: 0.4 + i * 0.25, scale: 0.55 + i * 0.22 });
      await k.wait(700);
    }
    k.music('spooky');
    void k.fade(gloom, 0.4, 0.6);
    void k.camera({ zoom: 1.4, x: 960, y: 360 }, 0.7);
    prisonSound.ruler();
    void k.quake(5);
    await k.all(k.say('who'), k.shake(shade, 4, 2));

    // Cut back to the heroes: flat to the wall, holding their breath.
    await k.camera({ zoom: 1.15, x: 380, y: 520 }, 0.7);
    k.music('sneaky');
    const hiding = together(k, gang, 0.6, { x: '-=10', scale: 0.96, ease: 'sine.inOut' });
    await k.all(k.say('hide', mf), hiding);
    prisonSound.heels(3, 0.4, 0.5);
    void k.fade(lamp, 0, 1.2);
    await k.to(shade, 1.2, { opacity: 0, scale: 0.3, ease: 'sine.in' });
    void k.camera({}, 0.8);
    void k.fade(gloom, 0.25, 0.8);
    await together(k, gang, 0.4, { x: '+=10', scale: 1 });

    // From somewhere ahead: somebody very, very cross.
    prisonSound.rattle(6);
    await k.all(k.say('pixie'), k.shake(hero, 5, 1), k.shake(hostEl, 5, 1), k.shake(mf, 5, 1));
    k.face(mf, false);
    await k.all(...gang.map((el) => k.to(el, 0.5, { x: '+=30' })));
    await k.wait(500);
  },
});
