# Up the Faraway Tree 🌳

A **Magic Faraway Tree** maths adventure for iPad, in the same hand-torn
paper, stop-motion style as [Wizard Words](https://github.com/charlie-beard/spelling-game).
It's built for one child (aged 6) who can add within 10 and loves the
scary bits, and it runs from there to the end of Year 2 maths over about
six months.

> Non-commercial fan project. All artwork is original: no film images, no
> official logos, no film typeface.

**Status: planned and scaffolded.** A first chapter is playable end to end
with stand-in art. See:

- [docs/PLAN.md](docs/PLAN.md): the full design (story, lands, maths,
  difficulty, cutscenes, rewards and screens)
- [docs/ROADMAP.md](docs/ROADMAP.md): build sessions, workstreams and
  agent briefs
- [CLAUDE.md](CLAUDE.md): conventions for whoever (or whatever) works on
  the code

## The game in one paragraph

He climbs the Faraway Tree with Beth, Joe or Fran. Ten lands come to the
top of the tree one after another (the Enchanted Wood, Topsy-Turvy,
Goodies, Dame Snap's School, Birthdays, Giants, Spells, Toys, Snow, and
Dame Snap's Prison), each with 7 chapters and a finale. Every chapter is 8
spoken maths problems answered by counting, ten frames, number lines,
bundles of sticks, clocks or coins, followed by a paper-puppet story. Each
land ends with a longer finale story, as the land moves on. Difficulty
adapts **per skill** (objects → pictures → numbers), and mastered skills
come back as spaced review. There's no failing, no timer, and Silky the
fairy helps whenever he's stuck.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 (?scene=map, ?scene=chapter&id=l1c6, ?scene=story&id=l1c1, &seed=7)
npm test             # unit tests (skills, generators, mastery, rounds, curriculum, progress)
npm run test:e2e     # Playwright: a full chapter at iPad sizes
npm run build        # production build to dist/ (with offline service worker)
```

## Playing it (once it's built)

The same as Wizard Words: open it in Safari on the iPad, **Share → Add to
Home Screen**, and always play from that icon (full-screen and offline).
The first time, Moon-Face asks "What's the password?": type Jasper's
password (the same one as Wizard Words, once the cloud save below is set
up). The iPad remembers it after that. The gear in the top-left corner
(answer a sum) opens the grown-ups' corner.

### Saved in the cloud

His progress and settings (chapters, skills, keepsakes, cards, seals,
toffees, volume, calm mode, new chapters per day and so on) are saved on
the device **and** in the cloud, so they follow him to any device he signs
in on.

- It still works offline. Changes are kept on the iPad and sent when it is
  back online.
- If two devices change things at the same time, both are kept: chapters
  keep the most plays, each skill keeps the record that has seen the most
  problems, rewards won on either side are all kept, and a setting takes
  whichever side changed it.
- Progress saved on the iPad before sign-in was added moves into Jasper's
  cloud save the first time he signs in there.
- There's also a **demo** profile (every chapter open, no name) for
  showing the game to people without touching his progress.

## The cloud save (Cloudflare)

Sign-in and saves are handled by a small Cloudflare Worker with a D1
database, in [`api/`](api/), ported from Wizard Words. It is a **separate**
Worker and database from Wizard Words' (`faraway-api` and `faraway`), so
the two games can never break each other, but it uses the same secret
names, so it can share Jasper's password. The game itself stays on GitHub
Pages.

- Will live at `https://faraway-api.charlesjohnbeard.workers.dev` (the game
  calls this address unless it's built with `VITE_API_URL` set)
- D1 database `faraway`, with one row per profile (`jasper`, `demo`, …)
  holding its name and whole save as JSON
- Jasper's password is a Worker **secret**, never in this (public) repo

### Setting it up (one time)

Run these from the repo, on a computer with Node:

```bash
cd api
npm install
npx wrangler login                          # opens the browser: sign in to Cloudflare
npx wrangler d1 create faraway              # prints a database_id
```

Paste that `database_id` into [`api/wrangler.jsonc`](api/wrangler.jsonc), in
place of `PASTE-THE-FARAWAY-DATABASE-ID-HERE`, and commit it (the id isn't
a secret). Then:

```bash
npm run migrate:remote                      # makes the profiles table, with Jasper's and the demo profile
npx wrangler secret put JASPER_PASSWORD     # type Jasper's password (the same as Wizard Words' if you like)
npx wrangler secret put AUTH_SECRET         # any long random string, e.g. from: openssl rand -base64 32
npm run deploy                              # publishes faraway-api
```

Check it's up: `curl -X POST https://faraway-api.charlesjohnbeard.workers.dev/login -d '{"password":"wrong"}'`
should answer `{"error":"Wrong password"}`. If `deploy` prints a different
`workers.dev` address (a different account subdomain), put that address
in `API_URL` in [`src/cloud/api.ts`](src/cloud/api.ts) and push.

### Afterwards

Unlike the game, the Worker doesn't deploy on push. From `api/`:

```bash
npm run deploy                              # after changing api/src
npm run migrate:remote                      # after adding a migration
npx wrangler secret put JASPER_PASSWORD     # change Jasper's password (devices stay signed in)
npx wrangler secret put AUTH_SECRET         # changing it signs every device out
```

If the game moves to a different address, add it to `ALLOWED_ORIGINS` in
[`api/wrangler.jsonc`](api/wrangler.jsonc) and redeploy.

For local development, copy `api/.dev.vars.example` to `api/.dev.vars`,
then run `npm run migrate:local && npm run dev` in `api/`, and start the
game with `VITE_API_URL=http://localhost:8787 npm run dev`. (The e2e tests
never need the Worker: they fake it, in `tests/e2e/cloud.ts`.)

## Switching on GitHub Pages (one time)

1. Merge into `main`.
2. Go to repo **Settings → Pages → Source: GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow publishes every push to `main`,
   at `https://charlie-beard.github.io/maths-game/`.
