# Roadmap: sessions and workstreams

How the game gets built across several 5-hour sessions, with agents working
in parallel. The design is [PLAN.md](PLAN.md); the conventions every agent
follows are in [CLAUDE.md](../CLAUDE.md).

## Where things stand (session 1: done)

- **Plan:** [PLAN.md](PLAN.md).
- **Engine ported from Wizard Words:** stage, scenes and director, paper
  art engine, audio engine, sfx and synth, voice (now with question pieces
  and numbers), the grown-ups' gate, the story kit, CI and Pages deploy,
  and the offline service worker.
- **Maths core (pure, tested):** the skill catalogue (48 skills with tiers),
  problem types, generators for 5 skills (others use a stand-in),
  mastery and spaced review, round building, all 80 chapters, and progress.
- **Playable skeleton:** title → choose → map → intro → play → story →
  reward, Practice with Silky, the Treasure Room list, and a simple
  grown-ups' corner. All problems use the `choose` activity, and the art
  is stand-in. One example story (`l1c1`).
- **Tests:** 42 unit tests, plus 124 todos (one per unbuilt generator and
  one per unwritten story) that turn into real tests as the work lands, and
  4 Playwright tests (a full chapter, help steps, stage, portrait), run at
  both iPad sizes.

Every **SCAFFOLD** comment in `src/` marks something a workstream below
replaces.

## The workstreams

Each workstream owns a set of files, so agents running in parallel in
separate worktrees don't conflict. Each W1 group registers its generators
in its own file (`NUMBER` / `ADDSUB` / `MORE`). Each W2 group registers its
activities in `src/activities/set-{a,b,c}.ts`, keeps hand-made example
problems in `fixtures-{a,b,c}.ts` (shown by `?scene=fixtures&kind=…`), and
puts its styles in `src/styles/activities-{a,b,c}.css`. W7's styles go in
`login.css`. Agents running e2e tests at the same time each set their own
`PW_PORT`. **Shared files** (registries such as
`src/activities/index.ts`, `src/stories/index.ts`, `src/core/generators/index.ts`
and `src/styles/faraway.css`) get small, append-only edits: add your line
and leave the rest. Rebase on main before opening a PR.

| ID | Workstream | Owns | Needs | Size |
|---|---|---|---|---|
| **W1a** | Generators: number and place value | `src/core/generators/number.ts` | — | M |
| **W1b** | Generators: adding and taking away | `src/core/generators/addsub.ts` | — | L |
| **W1c** | Generators: × ÷, fractions, measures, shapes | `src/core/generators/more.ts` | — | M |
| **W2a** | Activities: count, tenFrame, numberLine, partWhole, numberPad | `src/activities/{count,tenFrame,numberLine,partWhole,numberPad}.ts` | — | L |
| **W2b** | Activities: compare, tensOnes, groups, share, fraction | `src/activities/{compare,tensOnes,groups,share,fraction}.ts` | — | L |
| **W2c** | Activities: clock, coins, shape, plus visuals for all kinds | `src/activities/{clock,coins,shape}.ts`, `visual.ts` | — | M |
| **W3a** | Characters: the Folk, the family, Dame Snap and the land hosts | `src/art/characters/*` | — | L |
| **W3b** | Props and keepsakes | `src/art/props.ts`, `src/art/keepsakes.ts` | — | M |
| **W3c** | Land backdrops, the tree map art, `lab.html` gallery | `src/art/lands/*`, `src/art/scenery.ts`, `lab.html`, `src/lab.ts` | — | L |
| **W4** | Screens: map, title, complete, Treasure Room, grown-ups' corner | `src/scenes/{map,title,complete,album,parent}.ts` | W3 helps | L |
| **W5-n** | Chapter stories for land n (7 per land) | `src/stories/l{n}c{1-7}.ts` | W3a | L each |
| **W6-n** | Finale for land n: the set piece and its long story | `src/scenes/finale*.ts`, `src/stories/l{n}c8.ts` | W2, W3 | L each |
| **W6-film** | Opening and ending films | `src/stories/{opening,ending}.ts` | W3 | L |
| **W7** | Cloud save and sign-in (port from Wizard Words) | `src/cloud/*`, `src/scenes/login.ts`, `api/*` | — | M |
| **W8** | Voice: ElevenLabs export, generate, check, review | `scripts/voice/*`, `public/audio/*` | everything written | L |
| **W9** | Icons, offline, accessibility, a full play-through and polish | — | everything | M |

### Session plan

| Session | Fan out | Why this order |
|---|---|---|
| **2** | W1a, W1b, W1c, W2a, W2b, W2c, W3a, W3b, W3c, W7 (10 agents) | Independent foundations. At the end, every skill makes real problems, every activity works, and the art exists |
| **3** | W4, W5-1 … W5-5, W6-1, W6-2, W6-3, W6-film (opening) | Stories need the characters; finales need the activities |
| **4** | W5-6 … W5-10, W6-4 … W6-10, W6-film (ending) | The second half of the game |
| **5** | W8 (voice, with the parent: choosing ElevenLabs voices and listening), W9 | Voice comes last, once every line is final |

Between fan-outs the orchestrating session merges PRs, runs everything,
looks at screenshots, and fixes what doesn't fit together.

## Agent briefs

Copy a brief into the agent's prompt together with "Read CLAUDE.md and
docs/PLAN.md first." Every brief ends the same way: **typecheck, unit
tests and e2e pass; screenshots checked; one PR per workstream.**

### W1a / W1b / W1c: generators

Write a generator for each skill in your group (see the tier descriptions
in `src/core/skills.ts`, which are the spec) following the patterns in
`src/core/generators/early.ts`:

- **W1a:** `subitise`, `one-more`, `one-less`, `compare-10`, `teens`,
  `count-20`, `count-10s`, `tens-ones`, `count-100`, `compare-100`,
  `odd-even`, `count-2s-5s`.
- **W1b:** `part-whole-10`, `missing-10`, `fact-family-10`, `fluency-10`,
  `doubles-5`, `add-20`, `sub-20`, `bonds-20`, `doubles-20`,
  `bridge-add`, `bridge-sub`, `missing-20`, `word-problems`, `add-2d1d`,
  `sub-2d1d`, `add-tens`, `add-2d2d`, `sub-2d2d`, `missing-100`.
- **W1c:** `shapes-2d`, `measure-length`, `groups`, `arrays`, `times-2`,
  `times-5`, `times-10`, `coins`, `share`, `group-div`, `fractions`,
  `time`.

Rules: every tier from the skill's tier list; questions spoken as `Speech`
with numbers in `{slots}` (so the voice can record pieces); `choices`
always present (3–4, from likely mistakes); `explain` reads the working
back; `key` identifies the maths; the visual and activity match the tier
(CPA). Bridging problems must actually cross 10, and no-bridging ones must
not. Register in `generators/index.ts` and delete the matching `it.todo`.
Add focused tests (e.g. `bridge-add` always crosses 10, `time` tier 1 is
always o'clock).

### W2a / W2b / W2c: activities

Implement the `Activity` interface (`src/activities/types.ts`) for each
kind in your group, register it in `activities/index.ts`, and keep within
the layout zones in `types.ts`. The interaction is in PLAN.md §5
(Activities). Every activity must:

- work with **taps only** (drags are fine too, but a tap-to-place path is
  required), with targets of 72 px or more,
- support `help(1|2|3)`: 1 highlight, 2 a simpler representation (and
  remove a wrong option), 3 show the answer for him to tap,
- give the answer through `ctx.answer()` (the scene decides right or
  wrong),
- respect calm mode, with no flashing and no background motion,
- put `data-value` on answer targets (the e2e tests use it).

Add a Playwright test per activity that plays one problem with
`?scene=chapter&id=…&seed=…`. **W2c also finishes `visual.ts`** for every
`Visual` kind. Add a `?scene=activity&kind=…&tier=…` dev page if it helps,
and screenshot each activity at each tier.

### W3a: characters

Replace the stand-ins in `src/art/characters/index.ts` with real torn-paper
portraits (300 × 340, the face in the box `78 62 144 144`), one file per
group (`folk.ts`, `family.ts`, `lands.ts`, `snap.ts`), using the paper
engine like Wizard Words' `art/characters`. Give them `data-part` groups
(arms, mouth, eyes) so stories can animate them. Be original: no actor
likenesses, nothing traced from the film.

- **Moon-Face:** a big round shining face, a kind grin, a blue coat with
  stars.
- **Silky:** a small fairy with silvery-gold hair and dewdrop wings.
- **The Saucepan Man:** hung all over with pots and kettles, with a
  saucepan for a hat.
- **Dame Washalot:** sleeves rolled up, carrying a washtub.
- **Mr Watzisname:** asleep, in a nightcap.
- **The Angry Pixie:** tiny, cross, with a red pointed cap.
- **Mr Oom Boom Boom:** tall, with a drum.
- **Beth, Joe and Fran** (oldest to youngest), plus Mum and Dad.
- **Dame Snap:** *the* villain. Tall, angular, a hair bun like a
  doorknob, a black gown, a long red ruler, eyebrows like snapped twigs.
  She should be properly menacing but cartoonish, with a pose set: looming,
  pointing, shrieking, stomping, defeated.
- **The land hosts:** the Topsy-Turvy Man (upside down), the Jelly Goblin,
  Giant Rumbletum (huge, friendly-ish), the Enchanter, Captain Tin (a toy
  soldier) and Mr Snowman.

### W3b: props and keepsakes

Redraw the 24 counting props in `src/art/props.ts` (keep each one distinct
in **colour and outline**, readable at 60 px, and countable in a crowd),
and create `src/art/keepsakes.ts` with art for every chapter's `keepsake`
id (80, listed in `curriculum.ts`; a test should check coverage) plus 10
land seals. Coins (1p–£2) for `coins` are in W2c's visual, or W3b if W2c
asks.

### W3c: lands, the tree and the lab

One backdrop per land (`src/art/lands/l1.ts` …): the land as seen from
the ladder (for the map cloud and the finales) and a ground-level scene
for stories. Make the map tree (`scenery.ts`) a richer version with named
places: Dame Washalot's tub, the Angry Pixie's window, Mr Watzisname's
branch, and Moon-Face's room with the slippery-slip. Build `lab.html` +
`src/lab.ts` (dev only, as in Wizard Words): a gallery of characters,
props, keepsakes and backdrops.

### W4: screens

The real map (PLAN.md §9): stops placed on W3c's named places, land seals
hung on the tree, the land's art in the cloud, a land-change moment when a
new land arrives, Practice with Silky, the Treasure Room, and the
slippery-slip back to the previous land. Then the title, the complete
screen (keepsake art, card flip, seal), the Treasure Room (shelves of
keepsakes, cards, seals and stories) and the full grown-ups' corner (port
from Wizard Words: profiles, cloud status, levels, idle hint, plus the
skills table).

### W5-n: chapter stories for land n

Write the 7 chapter stories for land n (`src/stories/l{n}c{1..7}.ts`),
registered in `stories/index.ts`. Read `src/stories/kit.ts`, the example
`l1c1.ts`, and two or three of Wizard Words' polished stories for the
standard expected. Each one is about 30 s, has 4–7 lines, uses the
chapter's host and props, puts **the chapter's maths visibly in the story**,
makes "{name}" the hero, and ends pointing to the next chapter. Follow the
arc in PLAN.md §3. If the hero (the chosen child) is also the host, use
another sibling for that role (`k.hero`). Scary content follows PLAN.md
§2. Film a strip of each story with a storyshots script (port Wizard
Words' `scripts/storyshots.mjs`) and look at it.

### W6-n: land finales

Build land n's finale set piece around the shared `Round`: `escape` (the
ladder, swirling clouds, one rung per right answer, never caught),
`climb` (land 1, up to Moon-Face's room), or `snap` (Dame Snap: rules
crack, cages open, rulers snap, and she gets crosser). Lands 4, 7 and 10
are `snap`; land 10 has three waves of 4. Put the shared mechanics in
`src/scenes/finale.ts` (the first W6 agent writes it; later ones extend
it) and wire it into `game.ts` for chapters with `kind: 'finale'`. Then
write the long story `l{n}c8.ts` (60–120 s, several `cut()`s): the land
moving on, and the cliffhanger or payoff.

### W6-film: opening and ending

`opening.ts` (~90 s): moving to the countryside, the Enchanted Wood, the
whispering trees, the tree itself, meeting the Folk, Moon-Face explaining
the lands. `ending.ts` (~2 min): the party in the Land of Birthdays after
Dame Snap's defeat, with every character.

### W7: cloud save

Port Wizard Words' `src/cloud/*`, `scenes/login.ts`, `core/merge.ts` (with
merge rules for `skills`: keep the higher `seen`, and for keepsakes, cards
and seals take the union) and `api/` as a **separate** Worker `faraway-api`
with a D1 database `faraway`. Use the same `JASPER_PASSWORD` secret name
(the parent sets it), and allowed origin `https://charlie-beard.github.io`.
`CloudProfile` implements `Profile` from `src/save/local.ts`. Keep local
saves migrating in. Port the unit tests. The parent deploys it with
`wrangler` (write the README steps).

### W8: voice

Port `scripts/voice/` from Wizard Words: `export.ts` collects every story
line (by speaker), every phrase, every intro, and every **question template
piece** (from all generators at all tiers, by sampling with many seeds), plus
numbers 0–100 in `mid` and `end` intonations. Write `elevenlabs.json` with
a voice per character (the parent picks: Moon-Face warm and booming, Silky
soft and bright, the Saucepan Man loud and deaf, Dame Snap icy and
sharp). Generate, run `check.py`, review on `/review.html`, and re-record
what's wrong. Fill `public/audio/manifest.json`.

### W9: polish

App icons (from the game's own art), offline check, the 1180 × 760 Safari
case, calm mode everywhere, a long simulated play-through (e.g. a script
that plays 80 chapters with a simulated child, checking tiers rise and
review comes back), performance on an iPad, and a final pass on every
screen.

## Open questions for the parent

These can be answered any time before the session that needs them:

1. **Voices** (session 5): which ElevenLabs voices for the main
   characters.
2. **Cloud save** (session 2): run `wrangler login` and set the password
   secret when W7 is ready.
3. **Name and icon:** "Up the Faraway Tree" is a working title.
4. **New chapters per day:** the default is 2. Change it in the grown-ups'
   corner.
