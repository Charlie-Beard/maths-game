"""
Records every character's voice with ElevenLabs.

    npx tsx scripts/voice/export.ts                                  # → lines.json
    python scripts/voice/generate.py --dry-run                       # what it would send, and the cost
    ELEVENLABS_API_KEY=... python scripts/voice/generate.py          # record everything missing

Reads scripts/voice/lines.json and writes trimmed, loudness-matched mono
MP3s to public/audio/{lines,pieces,numbers}/, then public/audio/manifest.json.
Existing clips are kept unless --force. Before sending anything it checks
ffmpeg is installed and the account has enough characters left.

  lines    whole lines, each in its speaker's voice (elevenlabs.json)
  pieces   the fixed words of questions, in the narrator's voice, said with
           the words around them as unspoken context so they join up when
           played back to back with the numbers
  numbers  <n>-mid and <n>-end: said mid-sentence and sentence-final

First, hear the lines text-to-speech often gets wrong (sounds like "Zzz",
shouted CAPITALS) for a few thousand characters, and respell any that come
out wrong with say_as in elevenlabs.json:

    python scripts/voice/generate.py --risky

To audition a voice before recording everything:

    python scripts/voice/generate.py --speaker moonface --limit 5 --force

To fix clips rather than record everything, mark them wrong in /review.html
and re-record just those, after checking what would be sent:

    python scripts/voice/generate.py --redo --dry-run
    python scripts/voice/generate.py --redo

A clip that is replaced is kept in scripts/voice/takes/ (as "previous"),
to switch back to in /review.html.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "audio")
HERE = os.path.join(ROOT, "scripts", "voice")
KINDS = ("lines", "pieces", "numbers")

# Unspoken context for the number clips, so "seven" sounds like it does in
# "Moon-Face has seven pop biscuits" (mid) or "...The answer is seven." (end).
MID_CONTEXT = ("Moon-Face has", "pop biscuits.")
END_CONTEXT = ("How many altogether? It is", None)

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def number_words(n):
    """7 → "seven", 46 → "forty-six", 100 → "one hundred", 120 → "one hundred and twenty" (British)."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
    if n < 1000:
        rest = n % 100
        return ONES[n // 100] + " hundred" + (" and " + number_words(rest) if rest else "")
    return str(n)


def spoken(text, say_as=None):
    """
    What ElevenLabs is sent: respelt words from say_as, plain quotes and dots
    (it reads "’" oddly), no stray leading punctuation, and "£1" said as "1
    pound". The clip's id stays that of the written text.
    """
    if not text:
        return ""
    for written, said in (say_as or {}).items():
        text = re.sub(r"(?<![\w’'])" + re.escape(written) + r"(?![\w’'])", said, text)
    text = re.sub(r"£(\d+)", lambda m: f"{m.group(1)} pound" + ("" if m.group(1) == "1" else "s"), text)
    return text.replace("’", "'").replace("‘", "'").replace("…", "...").strip().lstrip(".,!?:; ").strip()


def encode(src, path, tail_ms=60):
    """Trims silence, matches loudness and writes a mono MP3."""
    filt = (
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
        f"apad=pad_dur={tail_ms / 1000},loudnorm=I=-18:TP=-2:LRA=7"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", filt, "-ac", "1", "-ar", "44100",
         "-codec:a", "libmp3lame", "-b:a", "64k", path],
        check=True,
    )


class ElevenLabs:
    API = "https://api.elevenlabs.io/v1"

    def __init__(self, need_key=True):
        self.key = os.environ.get("ELEVENLABS_API_KEY")
        if not self.key and need_key:
            sys.exit("Set ELEVENLABS_API_KEY (from elevenlabs.io → Profile → API keys).")
        cfg = json.load(open(os.path.join(HERE, "elevenlabs.json"), encoding="utf-8"))
        self.model = cfg["model_id"]
        self.speakers = cfg["speakers"]
        self.say_as = cfg.get("say_as", {})
        # Pieces and numbers are stitched together, so they share one steady voice.
        self.questions = {**self.speakers["narrator"], **cfg.get("questions", {})}

    def _request(self, method, path, body=None):
        req = urllib.request.Request(
            self.API + path, method=method,
            data=json.dumps(body).encode() if body is not None else None,
            headers={"xi-api-key": self.key, "Content-Type": "application/json"},
        )
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    return r.read()
            except urllib.error.HTTPError as e:
                if e.code in (429, 500, 502, 503) and attempt < 4:
                    time.sleep(2 ** (attempt + 1))
                    continue
                sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')}")

    def list_voices(self):
        for v in json.loads(self._request("GET", "/voices"))["voices"]:
            labels = ", ".join(f"{k}={x}" for k, x in (v.get("labels") or {}).items())
            print(f"{v['voice_id']}  {v['name']:<24} {labels}")

    def characters_left(self):
        """Characters left this month, or None if the key can't read the subscription."""
        try:
            s = json.loads(self._request("GET", "/user/subscription"))
            return s["character_limit"] - s["character_count"]
        except (SystemExit, KeyError, TypeError):
            return None

    def render(self, job, tmp):
        """Records one clip. Its `before` and `after` are read for intonation but not said."""
        spec = job["spec"]
        body = {
            "text": job["text"],
            "model_id": self.model,
            "language_code": "en",
            "voice_settings": {
                "stability": spec.get("stability", 0.5),
                "similarity_boost": spec.get("similarity_boost", 0.75),
                "style": spec.get("style", 0),
                "speed": spec.get("speed", 1.0),
            },
        }
        if job.get("before"):
            body["previous_text"] = job["before"]
        if job.get("after"):
            body["next_text"] = job["after"]
        audio = self._request("POST", f"/text-to-speech/{spec['voice_id']}?output_format=mp3_44100_128", body)
        with open(tmp, "wb") as f:
            f.write(audio)

    def speaker(self, who):
        return self.speakers.get(who, self.speakers["narrator"])


def clip_path(kind, cid):
    return os.path.join(OUT, kind, f"{cid}.mp3")


def write_manifest(data):
    """Lists the clips that exist and are still wanted (a line that was rewritten has a new id)."""
    have = {k: {f[:-4] for f in os.listdir(os.path.join(OUT, k)) if f.endswith(".mp3")} for k in KINDS}
    manifest = {
        "lines": sorted(l["id"] for l in data["lines"] if l["id"] in have["lines"]),
        "pieces": sorted(p["id"] for p in data["pieces"] if p["id"] in have["pieces"]),
        # The voice needs both intonations of a number to use either.
        "numbers": [n for n in data["numbers"] if f"{n}-mid" in have["numbers"] and f"{n}-end" in have["numbers"]],
    }
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"))
    print("manifest:", {k: len(v) for k, v in manifest.items()})
    wanted = {"lines": set(manifest["lines"]), "pieces": set(manifest["pieces"]),
              "numbers": {f"{n}-{e}" for n in data["numbers"] for e in ("mid", "end")}}
    stale = sum(len(have[k] - wanted[k]) for k in KINDS)
    if stale:
        print(f"{stale} clips on disk are no longer said anywhere (left in place, not in the manifest).")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=",".join(KINDS), help="comma list of lines,pieces,numbers")
    ap.add_argument("--speaker", help="only lines spoken by this speaker (e.g. moonface)")
    ap.add_argument("--risky", action="store_true", help="only the lines export.ts thinks may come out wrong")
    ap.add_argument("--limit", type=int, help="at most N clips of each kind, for auditioning voices")
    ap.add_argument("--force", action="store_true", help="redo clips that already exist")
    ap.add_argument("--list-voices", action="store_true", help="print the voice IDs on your account")
    ap.add_argument("--redo", action="store_true", help="only the clips marked wrong in /review.html")
    ap.add_argument("--clips", help="only these clips, e.g. lines/1001tlp,numbers/7-end")
    ap.add_argument("--dry-run", action="store_true", help="print what would be sent and its cost; send nothing")
    ap.add_argument("--quiet", action="store_true", help="with --dry-run: only the totals")
    ap.add_argument("--manifest", action="store_true", help="only rewrite manifest.json from the clips on disk")
    args = ap.parse_args()

    v = ElevenLabs(need_key=not (args.dry_run or args.manifest))
    if args.list_voices:
        return v.list_voices()

    # utf-8 explicitly: Windows would otherwise read ’ as "â€™" and the voice reads that out.
    data = json.load(open(os.path.join(HERE, "lines.json"), encoding="utf-8"))
    for k in KINDS:
        os.makedirs(os.path.join(OUT, k), exist_ok=True)
    if args.manifest:
        return write_manifest(data)

    unknown = sorted({l["speaker"] for l in data["lines"]} - set(v.speakers))
    if unknown:
        print(f"No voice in elevenlabs.json for {', '.join(unknown)}: they'll use the narrator's.")

    sys.path.insert(0, HERE)
    from check import file_hash, stash

    # Which clips to record: the ones asked for, else the missing ones (or all with --force).
    chosen = None
    if args.redo or args.clips:
        chosen = set(args.clips.split(",")) if args.clips else set()
        review_path = os.path.join(HERE, "review.json")
        review = json.load(open(review_path, encoding="utf-8")) if os.path.exists(review_path) else {}
        for key, r in review.items():
            kind, cid = key.split("/", 1)
            path = clip_path(kind, cid)
            # A verdict on an older recording of the clip doesn't count.
            if args.redo and r["verdict"] == "bad" and os.path.exists(path) and file_hash(path) == r["hash"]:
                chosen.add(key)
                print(f"redo {key}" + (f"  (“{r['note']}”)" if r.get("note") else ""))
        if not chosen:
            return print("Nothing marked wrong in /review.html.")

    def wanted(kind, cid):
        if chosen is not None:
            return f"{kind}/{cid}" in chosen
        return args.force or not os.path.exists(clip_path(kind, cid))

    take = lambda xs: xs[: args.limit] if args.limit else xs
    only = set(args.only.split(","))
    say = lambda t: spoken(t, v.say_as)
    narrator_too = args.speaker in (None, "narrator") and not args.risky

    # Everything to record, before anything is sent, so the cost can be checked first.
    jobs = []
    if "lines" in only:
        lines = [l for l in data["lines"]
                 if (not args.speaker or l["speaker"] == args.speaker) and (not args.risky or l.get("risky"))
                 and wanted("lines", l["id"])]
        for l in take(lines):
            jobs.append({"kind": "lines", "id": l["id"], "text": say(l["text"]), "spec": v.speaker(l["speaker"]),
                         "note": l.get("risky"), "tail": 60})
    # Stitched clips get a short tail: the gaps between them are the pauses.
    if "pieces" in only and narrator_too:
        for p in take([p for p in data["pieces"] if wanted("pieces", p["id"])]):
            jobs.append({"kind": "pieces", "id": p["id"], "text": say(p["text"]), "spec": v.questions,
                         "before": say(p["before"]), "after": say(p["after"]), "tail": 30})
    if "numbers" in only and narrator_too:
        todo = [(n, e) for n in data["numbers"] for e in ("mid", "end") if wanted("numbers", f"{n}-{e}")]
        for n, e in take(todo):
            before, after = MID_CONTEXT if e == "mid" else END_CONTEXT
            jobs.append({"kind": "numbers", "id": f"{n}-{e}", "text": number_words(n) + ("." if e == "end" else ""),
                         "spec": v.questions, "before": before, "after": after, "tail": 30})

    empty = [j for j in jobs if not j["text"]]
    for j in empty:
        print(f"skipping {j['kind']}/{j['id']}: nothing to say")
    jobs = [j for j in jobs if j["text"]]

    cost = {k: sum(len(j["text"]) for j in jobs if j["kind"] == k) for k in KINDS}
    total = sum(cost.values())
    summary = ", ".join(f"{k} {sum(1 for j in jobs if j['kind'] == k)} clips / {cost[k]:,} chars" for k in KINDS if cost[k])
    if args.dry_run:
        if not args.quiet:
            for j in jobs:
                said = (f"[{j['before']}] " if j.get("before") else "") + j["text"] + (f" [{j['after']}]" if j.get("after") else "")
                print(f"  {j['kind']}/{j['id']:<10} {len(j['text']):>3}: {said}" + (f"   ⚑ {j['note']}" if j.get("note") else ""))
        print(f"\nWould send {total:,} characters ({summary or 'nothing'}). Nothing was sent.")
        if v.key and (left := v.characters_left()) is not None:
            print(f"The account has {left:,} characters left this month.")
        return
    if not jobs:
        return print("Nothing to record.")

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg isn't installed (it trims and levels every clip). Install it first: winget install ffmpeg")
    left = v.characters_left()
    if left is not None and left < total:
        sys.exit(f"This needs {total:,} characters but the account has {left:,} left this month. "
                 "Record part of it (--only, --speaker, --limit) or top up first.")
    print(f"Recording {len(jobs)} clips, {total:,} characters ({summary})"
          + (f"; {left:,} left before" if left is not None else "") + ".", flush=True)

    sent = 0
    try:
        for i, j in enumerate(jobs, 1):
            path = clip_path(j["kind"], j["id"])
            with tempfile.TemporaryDirectory() as td:
                tmp = os.path.join(td, "raw.mp3")
                v.render(j, tmp)
                sent += len(j["text"])
                stash(j["kind"], j["id"])
                encode(tmp, path, j["tail"])
            print(f"[{i}/{len(jobs)}] wrote {os.path.relpath(path, ROOT)}", flush=True)
    finally:
        # Even when stopped part-way (Ctrl+C, an API error), list what was recorded; a rerun carries on.
        print(f"\nSent {sent:,} characters.")
        write_manifest(data)


if __name__ == "__main__":
    main()
