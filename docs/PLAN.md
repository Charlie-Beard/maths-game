# Up the Faraway Tree: a maths adventure

> **Status:** planned and scaffolded. See [ROADMAP.md](ROADMAP.md) for the
> build order and the agent workstreams.

A maths game for one child (Jasper, 6, autistic, possibly ADHD), set in the
world of **The Magic Faraway Tree** (the 2026 film). It uses the same
hand-torn paper, stop-motion style as his spelling game, Wizard Words
([charlie-beard/spelling-game](https://github.com/charlie-beard/spelling-game)),
and shares its engine. It is a static site on GitHub Pages, built only for
an **iPad (11th gen) held in landscape**.

> Non-commercial fan project. All artwork is original: no film images, no
> official logos, no film typeface, no likenesses of the actors.

---

## 1. What's different from Wizard Words

| | Wizard Words | Up the Faraway Tree |
|---|---|---|
| Subject | Phonics spelling | Maths, from adding within 10 to the end of Year 2 |
| Length | 30 chapters, a few weeks | **80 chapters over about 6 months** |
| Difficulty | One ladder (phonics order) plus distractor tiles | **A skill graph**: every skill has tiers (objects → pictures → numbers), the tier adapts per skill, and mastered skills come back as spaced review |
| Cutscenes | A 30-second story per chapter | The same, **plus a 1–2 minute finale for each land, an opening film and an ending** |
| Answering | Letter tiles | Several **activities**: count, choose, ten frames, number line, part-whole, tens and ones, groups, share, clock, coins, number pad … |
| Helper | Hedwig | **Silky** (hints) and **Moon-Face** (map host) |
| Villain | Voldemort (book 7) | **Dame Snap**, who comes back again and again, and the end of the game is in her prison |

Everything else is kept: the fixed 1180 × 820 stage, landscape only, touch
only, no failing, no timers, calm mode, the grown-ups' gear with a sum,
profiles and the cloud save, the voice pipeline (ElevenLabs at the end),
offline play, and GitHub Pages.

## 2. The player

- **Jasper, 6.** He can **add within 10**, sometimes on his fingers, and
  subtraction is still shaky (early Year 1).
- He loves **the scary bits**. In this film that means Dame Snap, and the
  danger of being stuck in a land when it moves on. Villains get real
  screen time and real menace, **as cartoon paper cut-outs**.
- **Never shown:** anyone being hit, slapped or hurt (the film renamed Dame
  *Slap* to Dame *Snap* for this reason, so she snaps her ruler on the
  desk, shouts and locks doors, and never touches a child). Nobody is left
  behind for good, and no parent is in real danger. Nothing is gory and
  nothing flashes.
- iPad 11th gen, landscape, touch only. Sessions of 10–15 minutes.
- The maths follows the **UK National Curriculum (Year 1 → Year 2)** in the
  small-steps order of White Rose Maths / NCETM mastery, taught
  **concrete → pictorial → abstract (CPA)**.

## 3. The story

**The family** (as in the film): Mum and Dad (Polly and Tim) and their
children **Beth, Joe and Fran** have moved to the countryside. At the start
he chooses which child he climbs with. That child stands beside him on
screen and cheers when he gets an answer right, like the avatar in Wizard
Words. He is still the hero: lines say "{name}".

**The Folk of the tree:** Moon-Face (round, beaming, lives at the top and
owns the slippery-slip), Silky (a kind fairy with pop biscuits), the
Saucepan Man (clanks, and mishears everything, which is good for comedy and
for "hear it again"), Dame Washalot (washing water cascading down the
trunk), Mr Watzisname (always asleep), the Angry Pixie (shouts at anyone
peeping in his window), and Mr Oom Boom Boom.

**Dame Snap:** a towering headmistress with a ruler, a bun, a pinched
mouth and a terrible clacking walk. Her school is really a prison, where
children have to do sums until they get them right. She **hates sums done
well**. When Jasper gets answers right, her rules crack. That gives the
whole game a spine: every correct answer is quietly a strike against her.

**The arc across the 10 lands:**

1. **The Enchanted Wood.** Moving day. He finds the tree, climbs it and
   meets the Folk. At the top, Moon-Face says a land arrives every so
   often, and it's dangerous to stay when it moves on. In the last panel, a
   clack of heels and a ruler's *SNAP* echoes through the clouds.
2. **The Land of Topsy-Turvy.** Everything is upside down and back to
   front, so here we take away. They escape just as the land starts to
   spin away.
3. **The Land of Goodies.** Toffee shocks, pop biscuits, a lemonade
   fountain, and number bonds (things come in pairs that make 10). A
   greedy jelly goblin chases them home.
4. **Dame Snap's School (first visit).** The land arrives, and it's *hers*.
   Moon-Face and Joe/Beth/Fran are caught and made to do sums at little
   desks. He frees them one correct answer at a time and they escape down
   the tree. She shouts after them: "I will SNAP you up!"
5. **The Land of Birthdays.** It's somebody's birthday, and it turns out to
   be his. Teen numbers, candles in tens, presents and wishes. His wish:
   that the Folk are always safe. (Dramatic irony: in the finale, a shadow
   of Dame Snap is seen sneaking a peek at the birthday list.)
6. **The Land of Giants.** Big numbers for big people: numbers to 100,
   tens and ones (bundles of ten sticks), measuring in giant footsteps. A
   (friendly but huge) giant chases them, and they hide in a teacup.
7. **The Land of Spells.** An Enchanter's land: bridging 10, doubles and
   halves, missing numbers. **Dame Snap is here.** She has made a deal
   with the Enchanter, and in the finale she **captures Silky** and the
   land moves on with Silky in it. A cliffhanger.
8. **The Land of Toys.** Toy soldiers march in rows (arrays and groups,
   × 2, × 5, × 10) and the toy shop takes coins. Mr Oom Boom Boom gives
   them the clue that Dame Snap's land will come back.
9. **The Land of Snow.** Sharing snowballs (division), halves and quarters
   of ice-pies, and a frozen clock tower (telling the time). They build the
   plan to rescue Silky.
10. **Dame Snap's Prison.** The big finale. Every lock and every one of her
    rules is a sum. The Folk are freed one by one, Silky last. Dame Snap
    tries a sum so hard "no child could ever do it", and he does it. Her
    ruler snaps, and her land moves on with her stuck in her own detention
    cupboard. The **ending film** is a party in the Land of Birthdays for
    the whole family and all the Folk.

The scariest moments are the land finales of 4, 7 and 10. Lands 6 and 3
have lighter menace (a giant, a goblin).

## 4. Shape of the game

- **10 lands × 8 chapters = 80 chapters.** Chapters 1–7 of each land are
  ordinary chapters. **Chapter 8 is the land's finale**, a special game
  mode (escape the land before it moves on, or rescue the Folk from Dame
  Snap) with a longer cutscene.
- A chapter is **8 problems**, about 4–5 minutes including its story.
- **New chapters per day: 2 by default** (a grown-ups' setting, 1–5 or
  unlimited). After that, the map offers **"Practice with Silky"**
  (spaced review) and replays of chapters he's done, with all their
  stories. 80 chapters at about 1.5 a day over 5 days a week is about 11
  weeks of new chapters, and with replays, review days, holidays and
  "again!" about 6 months.
- **Each land has a skill focus.** Mastered skills keep coming back in
  later lands, so nothing is forgotten (see §6).

### Lands and skills

Tier ranges are in §6. "→" means the skill carries on into later lands as
review.

| # | Land | Focus | Mixed in |
|---|---|---|---|
| 1 | The Enchanted Wood | Count to 10, subitise (dot patterns), one more, **add within 10** (counting objects, then ten frames) | — |
| 2 | Topsy-Turvy | One less, **take away within 10**, count back on a number line, compare (more, fewer, the same) | 2D shapes (upside down!) |
| 3 | Goodies | **Number bonds to 10**, part-whole, missing numbers (3 + ? = 10), fact families | add/sub within 10 |
| 4 | Dame Snap's School | **Fluency within 10** (mixed + and −), doubles to 5 + 5, odd and even | everything so far |
| 5 | Birthdays | **Teen numbers** (10 and some more), numbers to 20, **add/subtract within 20 without bridging**, bonds to 20 | bonds to 10 |
| 6 | Giants | **Numbers to 100**: tens and ones, count in 10s, compare with < > =, measuring length | teen numbers |
| 7 | Spells | **Bridging 10** (8 + 5 = 8 + 2 + 3), subtracting across 10, doubles and halves to 20, story problems | place value |
| 8 | Toys | **Equal groups, arrays, × 2, × 5, × 10**, counting in 2s and 5s, **money** (coins to 20p, then £1) | add within 20 |
| 9 | Snow | **Sharing and grouping (÷)**, **halves, quarters, thirds**, **time** (o'clock, half past, quarter past and to) | 2-digit ± 1-digit |
| 10 | Dame Snap's Prison | **2-digit ± 2-digit**, missing numbers to 100, everything mixed | everything |

The full chapter-by-chapter list is the data in
[`src/core/curriculum.ts`](../src/core/curriculum.ts), which is the source
of truth. The tests check every chapter's skills exist and come after
their prerequisites.

## 5. How a problem plays

The screen layout is the same for every problem, so he always knows where
to look:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙  ● ● ● ○ ○ ○ ○ ○  (8 problems)              [toffee jar]  │
│                                                              │
│       ┌──────────────────────────────────────────┐           │
│ (🔊)  │   the problem: objects, ten frame,       │    Silky  │
│ hear  │   number line, sum … (activity area)     │    helper │
│       └──────────────────────────────────────────┘           │
│   chosen child                                               │
│        ┌───┐   ┌───┐   ┌───┐   ┌───┐    ← answers / tools    │
│        │ 6 │   │ 7 │   │ 8 │   │ 9 │                         │
│        └───┘   └───┘   └───┘   └───┘                         │
└──────────────────────────────────────────────────────────────┘
```

1. **The question is always spoken** ("Moon-Face has 4 pop biscuits.
   Silky gives him 3 more. How many now?"), with the sum shown underneath
   once it's at the pictorial tier or above. "Hear it again" is at the left
   edge.
2. **He answers by doing something:** tapping objects to count them,
   filling a ten frame, hopping along a number line, choosing a number
   card, building with bundles of sticks, or (at the top tiers) typing on
   a number pad.
3. **A right answer:** the chosen child cheers, a toffee shock pops into
   the jar, the sum is read back ("4 add 3 makes 7!") and the next problem
   slides in.
4. **A wrong answer:** the card wobbles and a soft "hmm". There's no
   buzzer, no lives, no timer and **no way to fail**.

### Silky's help (the same in every activity)

| Trigger | What happens |
|---|---|
| "Hear it again" | Always there |
| 1st wrong answer | The question is said again, more slowly, and the key part glows |
| 2nd wrong answer | **Show me:** the activity drops one tier (numbers become counters, or a number line appears) and one wrong choice disappears |
| 3rd wrong answer | **Silky flies in** and works it out with him, counting aloud and pointing, then he taps the answer she's shown |
| ~12 s of nothing | A soft chime, and the question is said again |

A problem he needed help with comes back later in the same chapter, with
different numbers.

### Activities

Each activity is a module in `src/activities/` with the same interface
(see [`src/activities/types.ts`](../src/activities/types.ts)), so the play
scene doesn't care which one is showing.

| Activity | Used for | Faraway props |
|---|---|---|
| `count` | Tap each object to count it, then choose the total | pop biscuits, acorns, toffee shocks, saucepans |
| `choose` | Pick the answer from 3–4 number cards (works for any skill) | torn-paper cards |
| `tenFrame` | Fill or read one or two ten frames | Silky's biscuit tins |
| `numberLine` | Hop forwards or back to the answer | the ladder up the tree, rung by rung |
| `partWhole` | Find the missing part (cherry or bar model) | Dame Washalot's washing baskets |
| `compare` | More or fewer; < > = | weighing on the Saucepan Man's scales |
| `tensOnes` | Build or read a number with tens and ones | bundles of 10 sticks tied with ribbon, and single sticks |
| `groups` | Make equal groups or rows; repeated addition | toy soldiers, cushions on the slippery-slip |
| `share` | Share items fairly between characters | snowballs between the Folk |
| `fraction` | Shade or choose a half, quarter or third | ice-pies, birthday cakes |
| `clock` | Read the clock or set its hands | the frozen clock tower |
| `coins` | Choose coins to pay, or count coins | the toy shop |
| `shape` | Name or find a 2D shape | topsy-turvy windows |
| `numberPad` | Type the answer (top tiers only) | a paper keypad |

### Land finales (chapter 8)

These are special scenes like Wizard Words' Battle of Hogwarts. They use
the same problem engine and activities, inside a set piece.

- **Escape the land** (lands 1, 2, 3, 5, 6, 8, 9): the land is starting to
  move on, and every right answer gets them one rung further down the
  ladder. The clouds swirl closer for drama, but **they never actually
  catch him.** There is no timer.
- **Dame Snap** (lands 4, 7, 10): every right answer cracks one of her
  rules on the blackboard, unlocks a cage, or snaps one of her rulers. She
  stomps, shouts and gets crosser. Land 10 is the longest (12 problems,
  in three waves).

## 6. Difficulty over six months

This is what makes the game last. It is the main difference from Wizard
Words' single ladder.

### Skills and tiers

- A **skill** is one small step (`add-10`, `bonds-10`, `bridge-add`,
  `times-5` …). The catalogue is in
  [`src/core/skills.ts`](../src/core/skills.ts), with prerequisites.
- Each skill has **3–5 tiers**, which follow CPA and grow the numbers. For
  `add-10`, for example:
  1. both groups shown as objects to count (totals up to 5)
  2. objects, totals up to 10
  3. ten frames, with the sum written underneath
  4. sum only, with a number line on request
  5. sum only, typed on the number pad
- Each skill also has a **generator** (`src/core/generators/`). Given a
  tier and a seeded random source, it makes a problem: the spoken
  question, the sum as text, the right answer, sensible wrong choices (one
  out, the parts swapped, adding instead of subtracting), which activity to
  use, and the data for its picture.

### Per-skill mastery ([`src/core/mastery.ts`](../src/core/mastery.ts))

Each skill keeps a small record: its current tier, a rolling score
(exponentially weighted: first-try right = 1, after one wrong = 0.6, after
"show me" = 0.3, after Silky's help = 0), how many problems he's seen, and
when he last saw one.

- **Step up a tier** after 3 first-try rights in a row at the current tier,
  if the score is ≥ 0.8.
- **Step down a tier** after Silky had to help twice in the skill's last 4
  problems.
- A skill is **mastered** when it reaches its chapter's top tier with a
  score ≥ 0.85 over at least 8 problems.
- **Spaced review (Leitner boxes):** each mastered skill is in box 1–5,
  due for review after 1, 3, 7, 14 and then 30 days. A first-try right
  moves it up a box; a wrong answer moves it back to box 1 and drops its
  tier by one.

### Building a chapter ([`src/core/round.ts`](../src/core/round.ts))

Each chapter lists its **focus skills** and a **tier range** (a floor and a
ceiling). Its 8 problems are:

- **5 focus problems** at each skill's current tier, clamped to the
  chapter's range (early chapters of a land have a low ceiling; later ones
  open it up),
- **2 recent problems** from the land's earlier chapters,
- **1 spaced review problem** from the most overdue mastered skill
  (before he has any mastered skills, this is another focus problem).

Problems are mixed so two of the same skill never come one after another,
except in the first chapter of a land, where the new idea is introduced
gently. **Progress never stops:** chapters unlock in order whatever the
score. Only the tiers move, so the next chapter is never too hard, and a
skill he finds hard simply stays concrete for longer. The grown-ups'
corner shows each skill's tier and score, so a parent can see what to
practise.

**"Practice with Silky"** (on the map, any time) is a chapter made of 8
spaced review problems, with no new story, a short "Silky's practice"
sting at the end, and toffee shocks.

## 7. Cutscenes

The kit is ported from Wizard Words
([`src/stories/kit.ts`](../src/stories/kit.ts)): paper puppets, captions with
speaker tags, a voice for every line, synthesised sound effects, music
beds, camera moves, atmosphere (fireflies, snow, embers) and scene cuts
with a paper wipe. Every story is a script in its own file.

| Kind | How many | Length | Where it plays |
|---|---|---|---|
| Opening film | 1 (`opening`) | ~90 s | The first time, after choosing a child: moving day, finding the tree, meeting the Folk |
| Chapter story | 70 (`l1c1` … `l10c7`) | ~30 s | After every ordinary chapter |
| Land finale | 10 (`l1c8` … `l10c8`) | 60–120 s, several scenes | After each land's finale chapter: the land moves on |
| Ending film | 1 (`ending`) | ~2 min | After Dame Snap's Prison: the birthday party |

- **He is the hero of every one**, and the chapter's maths shows up in it
  (Moon-Face counts the pop biscuits he won, or the giant's footsteps are
  measured).
- Every chapter story ends by **pointing at the next chapter**, so there's
  always a reason to go on.
- Scary scenes follow the rules in §2: Dame Snap looms, stomps, shouts,
  and snaps rulers. The camera pushes in on her, then always cuts back to
  the heroes before it's too much.
- A small skip button is always there. **The album** ("Moon-Face's
  Treasure Room") plays any story he has unlocked again.
- Finales and the opening/ending films use **several kit `cut()`s** and
  may reuse the land's backdrop art.

## 8. Rewards

- **Toffee shocks:** one per right answer, into a jar in the corner.
- **Keepsakes:** every chapter gives a keepsake from its land (a pop
  biscuit, a topsy-turvy hat, a giant's button …), shown in the Treasure
  Room.
- **Land seals:** each land finale gives a big round seal for the land,
  hung on the tree on the map.
- **Folk cards:** the first time each character hosts a chapter, he gets
  their card (portrait and name, as in Wizard Words' Chocolate Frog cards).

## 9. Screens

`title → (choose child + opening film, first time) → map → intro → play → story → complete → map`

- **Title:** the Faraway Tree at dusk with its little lit windows and the
  clouds above. One big wax-seal "play" button.
- **Choose:** Beth, Joe or Fran.
- **Map: the tree.** One tall tree, the same every time. Chapter stops are
  doors, branches and windows on the way up (Dame Washalot's tub, the
  Angry Pixie's window, Moon-Face's room) and the **current land sits in
  the cloud at the top**. It changes art when the land changes, and the
  tree gets a new seal for each finished land. There's a single glowing
  "next" stop, plus Practice with Silky, the Treasure Room, and the
  slippery-slip (back down to the bottom of the tree).
- **Intro:** the chapter's host says what they need ("Help me count my
  saucepans!").
- **Play:** §5.
- **Complete:** the keepsake (and card or seal), then back to the map.
- **Grown-ups' corner** (gear + sum, as in Wizard Words): profiles, cloud
  status, progress by skill (tier and score), levels (unlock, lock), new
  chapters per day, volume, calm mode, idle hint, the player's name, start
  again.

## 10. Visual style

The same as Wizard Words: layered hand-torn paper on parchment, flat muted
colours, soft shadows, smooth gentle movement (each paper piece is drawn
once and held still: an earlier stop-motion "boil" made characters flicker
on the iPad), and **Andika** lettering (single-storey a and g). **Numbers are
big and clear**: Andika's digits, never handwriting-style, at 64 px or more
for answers.

**Palette shift:** Wizard Words is night blues and candlelight. This game is
**forest greens, bark browns, dusk golds and cloud whites**, with each land
having its own accent colour (Topsy-Turvy is a lurid green and pink; Dame
Snap is ink-black, chalk-white and ruler-red; Snow is blue-white).

## 11. Sound and voice

- **Effects and music:** synthesised in the browser (ported `sfx.ts` and
  `synth.ts`), with new sounds for the Saucepan Man's clanks, the
  slippery-slip, toffee shocks and Dame Snap's ruler and heels.
- **Voice:** everything is written with a **voice per character** (the
  `who` on every line), and the iPad's own British voice reads it until
  recordings exist. **ElevenLabs recordings come last** (see ROADMAP).
- **Questions with numbers in them** are built from short recorded pieces:
  the template phrase ("Moon-Face has …", "… more. How many now?") plus
  number clips 0–100 recorded in two intonations, mid-sentence and
  sentence-final. The pieces are played back to back with tight gaps
  ([`src/audio/voice.ts`](../src/audio/voice.ts) `voice.parts`). Story lines
  are recorded whole.
- The voice scripts (`scripts/voice/`) are ported from Wizard Words: export
  every line, generate with ElevenLabs (per-character voices in
  `elevenlabs.json`), check with Whisper, and review on `/review.html`.

## 12. Technical setup

As Wizard Words: **Vite + TypeScript + GSAP**, no framework.

- `src/core/` is **pure and unit-tested**: skills, generators, mastery,
  round building, curriculum, progress, merging saves.
- **Saves:** on the device now (`src/save/local.ts`), with the same
  `Profile` interface the cloud version will use. **The cloud save** is a
  port of Wizard Words' Worker + D1 (`api/`). It's a separate Worker and
  database (`faraway-api`, `faraway`) with the same password secret, so
  the two games can never break each other.
- **Offline:** the same build-time service worker.
- **Publishing:** GitHub Actions to GitHub Pages at
  `charlie-beard.github.io/maths-game/`.
- **Tests:** Vitest for `core` (including thousands of seeded generator runs
  checking every answer is right and every set of choices is valid), and
  Playwright at 1180 × 820 and 1180 × 760 for a play-through.
- **Dev shortcuts:** `?scene=map|play|story|album|parent&id=l1c1`,
  `?seed=…` for repeatable problems, and `/lab.html` for an art gallery
  (characters, props, backdrops, every activity at every tier).

## 13. Designing for ADHD and autism

The rules from Wizard Words, unchanged:

- One task on screen at a time, in the same layout every time.
- No movement in the background while he's thinking.
- One obvious next step (a single glowing stop on the map).
- Big targets (72 pt or more) and soft sounds with a capped volume.
- No flashing. Calm mode follows the iPad's Reduce Motion setting and has
  its own switch.
- Predictable rituals: every chapter is intro, 8 problems, story, keepsake.
  Every land is 7 chapters, then the finale.
- The scary parts are **only in cutscenes and finales, never during
  problems.** Dame Snap never appears on the problem screen in an ordinary
  chapter.
