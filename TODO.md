# TODO

All 14 lands are finished: the curriculum, the maths, the art, every
chapter story and every land finale, from the opening film to the feast at
the end of land 14. Typecheck, the unit tests and the full Playwright suite
pass. The voice script (`scripts/voice/lines.json`) has been exported with
every line in the game.

## Still to do: the voices (with a grown-up)

The game speaks with the iPad's own voice until the recordings exist. The
steps are under "W8: voice" in [docs/ROADMAP.md](docs/ROADMAP.md):

1. Choose an ElevenLabs voice for each character (`pick-voice.py`). The
   three new hosts (`oldWoman`, `whirligig`, `redGoblin`) still have
   stand-in voices in `scripts/voice/elevenlabs.json`.
2. Record the risky lines first, then everything (`generate.py`).
3. Check and review (`check.py`, `/review.html`).

If a story line changes later, run `npx tsx scripts/voice/export.ts` again.
A changed line gets a new id and drops back to the iPad's voice until it is
recorded.

## Open questions for the parent

These are in ROADMAP.md, "Open questions for the parent": the voices, the
cloud save password (`wrangler login`), the name and icon, and how many
new chapters a day.
