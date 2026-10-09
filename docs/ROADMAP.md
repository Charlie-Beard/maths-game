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

## Session 2: done

All ten workstreams were merged into `claude/plan-and-scaffold`:

- **W1a/b/c:** every one of the 48 skills makes real problems at every
  tier. The conventions activities rely on are in each generator file's
  header comment.
- **W2a/b/c:** all 14 activities are built, and `visual.ts` draws every
  Visual kind. Written fractions are drawn stacked (Andika has no ⅓).
- **W3a:** 19 character portraits with `data-part` groups (see the
  list in the merge commit's W3a report: eyes, mouth, arms, lids,
  mouthOpen, plus extras such as Silky's wings), and `dameSnapPose()`.
- **W3b:** 24 props, 80 keepsakes (`keepsakeArt`, `KEEPSAKE_NAMES`) and
  10 land seals (`landSeal`).
- **W3c:** `LAND_ART` (far view and scene for each land), the map tree
  with `TREE_PLACES`, `TREE_HOOKS` and `TREE_SPOTS`, and `lab.html`.
- **W7:** the cloud save (`CloudProfile`), sign-in, and the `faraway-api`
  Worker. It isn't deployed yet: the parent follows the README. The dev
  server starts signed in.

**Notes for session 3:**

- **W4:** the map's title banner covers the land in the cloud, so it
  needs to move. Land seals on `TREE_HOOKS` sit among the leaves. The
  grown-ups' corner needs sign-out and profile switching (as Wizard Words
  has).
- **Stories** should use the `data-part` names. Animate with
  `rotate(n)`, not `rotate(n x y)`.
- `play.spec.ts` can time out when many agents share the machine: run e2e
  with `--workers=1` under load.

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
- have no flashing and no background motion,
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

**Done so far:** every line knows its speaker (`voice.say(text, who)`, ids
from `voiceId`), 'hero' lines are recorded for each of Beth, Joe and Fran,
and intros are said by their host. The scripts are ported: `export.ts` →
`lines.json` (about 760 lines, 1,400 pieces, 202 number clips, about
90,000 characters), `generate.py`, `check.py`, `pick-voice.py`, and
`/review.html`. `elevenlabs.json` holds stand-in voices.

**Still to do**, once the stories are final (a changed line gets a new id
and drops back to the iPad's voice):

```bash
python scripts/voice/pick-voice.py moonface --list                 # 1. the parent listens and picks
python scripts/voice/pick-voice.py moonface --pick 2
python scripts/voice/generate.py --speaker moonface --limit 5 --force   #    hear a few of his lines
npx tsx scripts/voice/export.ts                                    # 2. hear the risky lines first
python scripts/voice/generate.py --risky                           #    (~5,000 chars: "Zzz", "Hmph", CAPITALS)
#    respell what's wrong with say_as in elevenlabs.json, then --risky --force
python scripts/voice/generate.py --dry-run --quiet                 # 3. record everything
python scripts/voice/generate.py                                   #    (checks the quota first; rerun to resume)
python scripts/voice/check.py                                      # 4. check, review, redo
npm run dev   # then /review.html
python scripts/voice/generate.py --redo
```

All of it is precached by the service worker (an estimated 30 MB at
64 kbps mono), so check the first load on the iPad.

### W9: polish

App icons (from the game's own art), offline check, the 1180 × 760 Safari
case, a long simulated play-through (e.g. a script
that plays 80 chapters with a simulated child, checking tiers rise and
review comes back), performance on an iPad, and a final pass on every
screen.

## Session 6: the second adventure (lands 11–14)

**Done.** The maths, the art, the 32 stories (with helpers `shoe.ts`,
`music.ts`, `fair.ts` and `goblinCave.ts`) and the four finales are in,
and every test passes. Only the voices remain (W8 above).

Jasper asked for more lands. Four new ones come **after** Dame Snap is
beaten and the ending film plays (`ENDING_AFTER = 'l10c8'` in
`curriculum.ts`), so no existing chapter id or save moves. They finish off
Year 2. Each land teaches two new skills (tiers in `core/skills.ts`) and
mixes in review.

| # | Land | Host | New skills | New picture (`Visual`) |
|---|---|---|---|---|
| 11 | The Old Woman's Shoe | `oldWoman` (new) | `tally` (tally charts, pictograms), `change` | `tally` |
| 12 | The Land of Music (Mr Oom Boom Boom's) | `oomboom` | `count-3s` (oom-pah-pah), `time-5` | none: `groups`, `clock` |
| 13 | The Land of Roundabouts | `whirligig` (new, Mr Whirligig) | `turns`, `shapes-3d` | `turn`, `solid` |
| 14 | The Land of the Red Goblins | `redGoblin` (new) | `compare-measures`, `read-scales` | `measure` |

**The arc.** After the party, lands keep coming to the top of the tree.
In land 11 a little red cap is seen hiding in the Shoe's laces (c7). In
land 12 the Red Goblins steal Mr Oom Boom Boom's big drum (c6). The band
follows their little red footprints (c7), and in the finale the goblins
march off with it. At the fair in land 13 the goblins are about (c7), and
as the land spins away they carry off the Saucepan Man, who clanks too
loudly to hide. That is the cliffhanger. In land 14 everyone goes down the
goblin hole, follows the clanking, frees the Saucepan Man (c7), gets the
big drum back, and escapes with the goblins chasing (finale). It ends
home at the tree with a feast, and the drum booming. **Red goblins are
cartoon-menacing** (they grab, sneak, shout and chase; PLAN.md §2), and
nobody is hurt or lost for good.

All four finales are `escape` (configs in `scenes/finale-lands.ts`,
entries 11–14): 11 `chase` (the Old Woman calling them back for supper),
12 `march` (goblins with the drum), 13 `spin`, and 14 `chase` (the Red
Goblin).

### Who owns what

The foundation commit made a stub for everything and registered each one,
so **no workstream needs to edit a registry**. Search for `SCAFFOLD`.

| ID | Owns (land n) |
|---|---|
| **M-n** maths | `core/generators/l{n}.ts`; `activities/visuals/{its kinds}.ts`; `activities/set-l{n}.ts`, `fixtures-l{n}.ts` and any new activity module it adds (`activities/{kind}.ts`, styles in `styles/activities-l{n}.css` plus one import line in `main.ts`); `tests/unit/generators-l{n}.test.ts`; `tests/e2e/activities-l{n}.spec.ts`. It may change only its own kinds' lines in `core/problem.ts` (the `Visual` union) |
| **A-n** art | `art/characters/l{n}.ts` (the new host, if any); `art/lands/l{n}.ts`; `art/keepsakes-l{n}.ts` (8 keepsakes, their names and the seal emblem) |
| **S-n** stories | `stories/l{n}c1.ts` … `l{n}c8.ts`, `stories/registry/l{n}.ts`, any shared helpers for the land (`stories/{land}.ts`, as `snow.ts`), finale entry n in `scenes/finale-lands.ts`, and land n's block in `curriculum.ts` (titles and intros only: ids, skills, tiers and keepsake ids stay) |

Phase 1 runs M-11…14 and A-11…14 in parallel. Phase 2 (S-11…14) starts
after they are merged, because stories need the hosts, the backdrops and
the keepsakes.

### Notes for every agent

- Read CLAUDE.md, PLAN.md (§2, §5, §7 and §13 above all), this section,
  and the files you own (the stubs say what they're for).
- Non-numeric answers are strings, as in `generators/more.ts`. **He is
  6 and only just reading.** Choices he would have to read (`'cylinder'`,
  `'clockwise'`) must also be pictures he can tap, or be said aloud as in
  `shape`. Prefer a picture-card activity over word cards.
- Run e2e with your own `PW_PORT` (M-n: 43n1, A-n: 43n2, S-n: 43n3, so
  land 12's maths agent uses 4321) and `--workers=2 --fully-parallel`:
  up to eight agents share one 16-thread PC. Run the specs your work
  touches, plus `smoke`, `play` and `screens`. The orchestrator runs
  the full suite after merging (`finale.spec.ts` alone is slow).
- Commit in your worktree branch: one or more commits, each ending with
  the `Co-Authored-By` line, made with `git -c user.name=Claude -c
  user.email=noreply@anthropic.com commit …`. Don't push, merge or open a
  PR. The orchestrator merges.
- Before you finish, `npm run typecheck`, `npm test` and those e2e specs
  must all pass, and you must have looked at screenshots of everything
  you drew at 1180 × 820.

## Open questions for the parent

These can be answered any time before the session that needs them:

1. **Voices** (session 5): which ElevenLabs voices for the main
   characters.
2. **Cloud save** (session 2): run `wrangler login` and set the password
   secret when W7 is ready.
3. **Name and icon:** "Up the Faraway Tree" is a working title.
4. **New chapters per day:** the default is 2. Change it in the grown-ups'
   corner.
