/**
 * Land 5, chapter 3: Pass the Parcel.
 *
 * Out on the party lawn, four in a row: Joe (or Fran, if he climbs with
 * Joe), Moon-Face, the Saucepan Man (who hears "pass the castle") and the
 * hero. The parcel hops from hand to hand while the music plays; when it
 * stops, a layer of paper flies off. Then faster and faster, counting the
 * layers up to seventeen (the chapter's counting to 20). Inside the last
 * layer is a card: Happy birthday, {name}! It's HIS birthday. Next: Party
 * Bags.
 */
import { band, bell, C, defineStory, NOTE, noiseBurst, now, piece, raw, rect, rng, svg, tone, type Kit, type Pt } from './kit';
import { bunting, hills, sceneSvg, sky, balloon } from '../art/lands/common';

// ------------------------------------------------------------------ sounds

/** The pass-the-parcel tune on a tinny toy organ: `notes` notes, then it just stops. */
function tune(notes: number, gap = 0.2): void {
  const t = now();
  const melody = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.F5, NOTE.A5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.G5, NOTE.C6, NOTE.G5];
  for (let i = 0; i < notes; i++) {
    tone(melody[i % melody.length], t + i * gap, { wave: 'square', peak: 0.035, decay: gap * 0.8, lowpass: 2000 });
    if (i % 2 === 0) tone(NOTE.C3 * (i % 4 ? 1.5 : 1), t + i * gap, { wave: 'triangle', peak: 0.05, decay: gap * 1.5 });
  }
}

/** Wrapping paper tearing off: a quick papery rip. */
function rip(soft = 1): void {
  const t = now();
  noiseBurst(t, { freq: 2400, q: 0.9, peak: 0.1 * soft, attack: 0.005, decay: 0.18, sweepTo: 5200 });
  noiseBurst(t + 0.05, { freq: 3800, q: 1.5, peak: 0.05 * soft, decay: 0.1 });
}

/** The Saucepan Man's pots and pans clanking. */
function clank(): void {
  const t = now();
  bell(620, t, 0.05, 0.35);
  bell(870, t + 0.07, 0.04, 0.3);
  bell(540, t + 0.15, 0.04, 0.4);
  noiseBurst(t, { freq: 4000, q: 4, peak: 0.04, decay: 0.08 });
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];
const WRAPS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple, C.orange, C.teal];

/** The party lawn: warm sky, bunting, balloons and soft hills. */
function lawn(): string {
  return sceneSvg('l5c3-lawn', [
    ...sky([
      ['#f3d79a', 0],
      ['#f6e3b6', 260],
      ['#f8ead0', 420],
    ]),
    hills(470, 40, '#e9c98a', 531),
    hills(520, 30, '#c9b06a', 532),
    ...bunting([-20, 70], [600, 60], 70, FLAGS, 30),
    ...bunting([580, 60], [1200, 74], 70, FLAGS, 30),
    ...balloon(290, 170, 36, C.red, 150),
    ...balloon(880, 160, 38, C.blue, 160),
    hills(600, 20, '#9cbf6a', 533, { step: 80 }),
  ]);
}

/** A scrap of torn wrapping paper. */
function scrap(color: string, n: number): string {
  const r = rng(n * 31 + 7);
  const pts: Pt[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const rr = 22 + r() * 18;
    pts.push([50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr * 0.8]);
  }
  return svg({ w: 100, h: 100, name: `l5c3-scrap-${n}`, boil: false }, [
    piece(pts, color, { rough: 1.6 }),
    piece(band([[34, 40], [66, 58]], 5), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
  ]);
}

/** The layer counter: a torn tag with the number of layers. */
function counter(n: number): string {
  return svg({ w: 140, h: 96, name: `l5c3-count-${n}`, boil: false }, [
    piece(rect(6, 6, 128, 84, 10), C.goldLight, { rough: 0.7 }),
    raw(`<text x="70" y="70" font-family="Andika, sans-serif" font-weight="700" font-size="58" fill="${C.ink}" text-anchor="middle">${n}</text>`),
  ]);
}

/** Escapes a name for SVG text. */
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The birthday card from inside the parcel. */
function card(name: string): string {
  return svg({ w: 360, h: 260, name: 'l5c3-card' }, [
    piece(rect(10, 10, 340, 240, 10), C.cream, { rough: 0.6 }),
    piece(rect(26, 26, 308, 208, 8), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    ...[[50, 50], [310, 50], [50, 210], [310, 210]].map(([x, y]) => piece(rect(x - 9, y - 9, 18, 18, 3), WRAPS[(x + y) % WRAPS.length], { edge: 'cut', fibre: false })),
    raw(`<text x="180" y="${name ? 112 : 146}" font-family="Andika, sans-serif" font-weight="700" font-size="40" fill="${C.redDark}" text-anchor="middle">Happy Birthday</text>`),
    ...(name ? [raw(`<text x="180" y="180" font-family="Andika, sans-serif" font-weight="700" font-size="48" fill="${C.ink}" text-anchor="middle">${esc(name)}!</text>`)] : []),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    pass_joe: { who: 'joe', text: 'Pass the parcel! When the music stops, tear off a layer.' },
    pass_fran: { who: 'fran', text: 'Pass the parcel! When the music stops, tear off a layer.' },
    castle: { who: 'saucepan', text: 'Pass the CASTLE? Oh, the parcel! Righto!' },
    count: { who: 'narrator', text: 'Round and round it went. Layer after layer… fifteen, sixteen, seventeen layers!' },
    last_joe: { who: 'joe', text: 'The very last layer! There’s a card inside. It says…' },
    last_fran: { who: 'fran', text: 'The very last layer! There’s a card inside. It says…' },
    happy: { who: 'narrator', text: 'Happy birthday, {name}!' },
    next: { who: 'hero', text: 'It’s YOUR birthday! Hooray! Quick, let’s fill the party bags!' },
  },

  async play(k: Kit) {
    // Joe hosts, unless the hero is Joe: then Fran does.
    const host = k.hero === 'joe' ? 'fran' : 'joe';
    k.backdrop(lawn());
    k.music('cosy');

    const xs = [20, 300, 620, 900];
    const ppl = [
      k.character(host, { x: xs[0], y: 360, z: 20 }),
      k.character('moonface', { x: xs[1], y: 360, z: 20 }),
      k.character('saucepan', { x: xs[2], y: 360, z: 20 }),
      k.character('hero', { x: xs[3], y: 360, z: 20, flip: true }),
    ];
    const [hostEl, , pan, hero] = ppl;
    const pots = k.part(pan, 'pots');

    // The parcel (the chapter's keepsake) sits in the host's hands.
    const PY = 520;
    const at = (i: number) => xs[i] + 130 - 70;
    const parcel = k.keepsake(k.chapter!.keepsake, { x: at(0), y: PY, w: 140, z: 30 });
    k.set(parcel, { opacity: 0 });
    await k.all(...ppl.map((p, i) => k.enter(p, i < 2 ? 'left' : 'right', 0.6 + i * 0.1)));
    await k.appear(parcel, 0.35);

    let holder = 0;
    /** Hops the parcel along to the next person. */
    const pass = async (seconds = 0.35) => {
      const next = (holder + 1) % 4;
      void k.to(parcel, seconds / 2, { y: -70, ease: 'power2.out' }).then(() => k.to(parcel, seconds / 2, { y: 0, ease: 'power2.in' }));
      await k.to(parcel, seconds, { x: at(next) - at(0), ease: 'none' });
      holder = next;
      if (holder === 2) {
        clank();
        if (pots.length) void k.to(pots, 0.08, { rotation: 6 }).then(() => k.to(pots, 0.16, { rotation: 0, ease: 'back.out(3)' }));
      }
    };

    let layers = 0;
    let tag: HTMLElement | null = null;
    /** One layer tears off and flies away; the counter goes up. */
    const tear = async (soft = 1) => {
      layers++;
      rip(soft);
      const s = k.add(scrap(WRAPS[layers % WRAPS.length], layers), { x: at(holder) + 20, y: PY - 10, w: 100, z: 31 });
      void k.to(s, 0.7, { y: -260 - (layers % 3) * 40, x: (layers % 2 ? 1 : -1) * (60 + (layers % 4) * 25), rotation: layers % 2 ? 160 : -160, opacity: 0, ease: 'power1.out' }).then(() => k.remove(s));
      void k.pop(parcel, 1.1);
      if (tag) k.remove(tag);
      tag = k.add(counter(layers), { x: 520, y: 140, w: 140, z: 32 });
      if (soft === 1) await k.pop(tag, 1.15);
    };

    // ---- The first rounds: the music plays, the parcel goes round, the music stops.
    const firstRounds = async () => {
      tune(5);
      for (let i = 0; i < 2; i++) await pass();
      await tear();
    };
    await k.all(k.say(`pass_${host}`, hostEl), firstRounds());

    tune(3);
    await pass();
    await k.wait(250);
    await k.shake(pan, 6, 1);
    await k.all(k.say('castle', pan), tear());

    // ---- Then faster and faster: layer after layer, up to seventeen.
    const faster = async () => {
      while (layers < 17) {
        tune(2, 0.14);
        await pass(0.28);
        await tear(layers < 14 ? 0.6 : 1);
        await k.wait(layers < 14 ? 40 : 300);
      }
    };
    await k.all(k.say('count'), faster());

    // ---- The last layer: a card!
    k.silence();
    await k.say(`last_${host}`, ppl[holder]);
    k.fx.drumroll(0.8);
    await k.wait(800);
    if (tag) void k.vanish(tag, 0.3);
    const c = k.add(card(k.name), { x: 410, y: 70, w: 360, z: 40 });
    k.set(c, { opacity: 0 });
    k.sfx.reveal();
    k.fx.twinkle();
    await k.appear(c, 0.5);
    k.sparkle(590, 190, 18, 220);
    k.music('triumph');
    await k.say('happy');

    // ---- It's HIS birthday!
    k.fx.jingle();
    k.confetti(30);
    void k.all(k.hop(ppl[0], 40, 2), k.hop(ppl[1], 30, 2), k.hop(pan, 30, 2).then(clank));
    await k.all(k.say('next', hero), k.hop(hero, 40, 2));
    await k.wait(700);
  },
});

