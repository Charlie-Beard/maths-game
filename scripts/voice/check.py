"""
Listens to the recorded clips and flags the ones that are probably wrong, so a
person only has to judge the suspects (in /review.html) and ElevenLabs only
re-records what is actually broken.

    pip install faster-whisper numpy
    python scripts/voice/check.py                      # everything → scripts/voice/qa.json
    python scripts/voice/check.py --only numbers

Writes, per clip (and per earlier take in scripts/voice/takes/), "flags"
that count against it and "hints" that are only worth a listen:

  misread  A line or piece whose transcript differs a lot from its text.
           Whisper doesn't know the Folk's names ("Watzisname"), and is
           American-trained, so small differences and very short pieces
           ("is", "more!") are only hints.
  number   A number clip Whisper heard as some other number.
  long     A clip far longer than its text needs: ElevenLabs sometimes
           trails off into breathing or says the context out loud.
"""
import argparse, datetime, difflib, hashlib, json, os, re, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AUDIO = os.path.join(ROOT, "public", "audio")
HERE = os.path.join(ROOT, "scripts", "voice")
TAKES = os.path.join(HERE, "takes")
KINDS = ("lines", "pieces", "numbers")


def file_hash(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()[:10]


def path_of(kind, cid, take=None):
    return os.path.join(TAKES, kind, cid, take + ".mp3") if take else os.path.join(AUDIO, kind, cid + ".mp3")


def takes_of(kind, cid):
    d = os.path.join(TAKES, kind, cid)
    return sorted(f[:-4] for f in os.listdir(d) if f.endswith(".mp3")) if os.path.isdir(d) else []


def stash(kind, cid, label="previous"):
    """Keeps the current clip as a take before it is replaced, unless an identical take exists."""
    cur = path_of(kind, cid)
    if not os.path.exists(cur):
        return
    h = file_hash(cur)
    if any(file_hash(path_of(kind, cid, t)) == h for t in takes_of(kind, cid)):
        return
    os.makedirs(os.path.join(TAKES, kind, cid), exist_ok=True)
    dst = path_of(kind, cid, label)
    shutil.copyfile(cur, dst if not os.path.exists(dst) else path_of(kind, cid, f"{label}-{h[:6]}"))


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip() or 0)


class Ears:
    """Whisper, fed through ffmpeg (faster-whisper's own decoder is fussy about PyAV versions)."""

    def __init__(self):
        global np
        import numpy as np
        from faster_whisper import WhisperModel
        self.m = WhisperModel("small.en", device="cpu", compute_type="int8")

    def __call__(self, path):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                             capture_output=True, check=True).stdout
        segs, _ = self.m.transcribe(np.frombuffer(raw, dtype=np.float32), beam_size=5, language="en",
                                    condition_on_previous_text=False)
        return " ".join(s.text.strip() for s in segs)


WORD_NUMBERS = {w: i for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
    "seventeen eighteen nineteen".split())}
WORD_TENS = {w: 10 * i for i, w in enumerate("_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()) if w != "_"}


def norm(text):
    return re.sub(r"[^a-z0-9' ]", "", text.lower().replace("’", "'").replace("-", " ")).split()


def heard_number(text):
    """The number in a transcript: "46", "Forty-six." or "one hundred" → 46 / 100. None if there isn't one."""
    words = norm(text.replace(",", ""))
    digits = [w for w in words if w.isdigit()]
    if digits:
        return int(digits[0])
    total, seen = 0, False
    for w in words:
        if w in WORD_NUMBERS:
            total += WORD_NUMBERS[w]
            seen = True
        elif w in WORD_TENS:
            total += WORD_TENS[w]
            seen = True
        elif w == "hundred":
            total = max(total, 1) * 100
            seen = True
        elif w == "oh":
            seen = True
    return total if seen else None


def check_text(path, text, ears):
    heard = ears(path)
    a, b = norm(text), norm(heard)
    if "".join(a) == "".join(b):  # "Moon Face" for "Moon-Face"
        return [], []
    sm = difflib.SequenceMatcher(None, a, b)
    wer = 1 - sum(m.size for m in sm.get_matching_blocks()) / max(1, len(a))
    if wer > 0.5 and len(a) >= 3:
        return [f"Whisper heard “{heard}”"], []
    return [], ([f"Whisper heard “{heard}”"] if wer > 0.15 else [])


def check_number(path, n, ears):
    heard = ears(path)
    got = heard_number(heard)
    return ([f"Whisper heard “{heard}”, not {n}"] if got != n else []), []


def check_length(path, text):
    """About 15 characters a second is a calm pace; three times as long as that is suspicious."""
    d = duration(path)
    return [f"{d:.1f} s long for {len(text)} characters"] if d > 1.2 + len(text) / 5 else []


class Checker:
    def __init__(self, whisper=True):
        data = json.load(open(os.path.join(HERE, "lines.json"), encoding="utf-8"))
        self.text = {("lines", l["id"]): l["text"] for l in data["lines"]}
        self.text.update({("pieces", p["id"]): p["text"] for p in data["pieces"]})
        self.ears = Ears() if whisper else None

    def __call__(self, kind, cid, path):
        """(flags, hints) for one clip or take."""
        if kind == "numbers":
            n = int(cid.split("-")[0])
            flags, hints = check_number(path, n, self.ears) if self.ears else ([], [])
            return flags, hints + check_length(path, str(n))
        text = self.text.get((kind, cid))
        if text is None:
            return [], []
        flags, hints = check_text(path, text, self.ears) if self.ears else ([], [])
        return flags, hints + check_length(path, text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=",".join(KINDS))
    ap.add_argument("--no-whisper", action="store_true", help="skip transcription (only the length check)")
    ap.add_argument("--no-takes", action="store_true", help="don't check the earlier takes")
    args = ap.parse_args()
    only = [k for k in KINDS if k in args.only.split(",")]

    check = Checker(whisper=not args.no_whisper)
    manifest = json.load(open(os.path.join(AUDIO, "manifest.json"), encoding="utf-8"))
    out_path = os.path.join(HERE, "qa.json")
    out = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {"clips": {}}
    clips = out["clips"]

    for kind in only:
        ids = [f"{n}-{e}" for n in manifest["numbers"] for e in ("mid", "end")] if kind == "numbers" else manifest[kind]
        for cid in ids:
            for take in [None] + ([] if args.no_takes else takes_of(kind, cid)):
                path = path_of(kind, cid, take)
                key = f"{kind}/{cid}" + (f"#{take}" if take else "")
                h = file_hash(path)
                # Already checked, and the clip hasn't changed.
                if key in clips and clips[key]["hash"] == h and (args.no_whisper or clips[key].get("whisper")):
                    continue
                flags, hints = check(kind, cid, path)
                clips[key] = {"hash": h, "flags": flags, "hints": hints, "whisper": not args.no_whisper}
                print(f"{'FLAG' if flags else '    '} {key:28} {'; '.join(flags + hints)}", flush=True)

    # Drop entries for clips and takes that no longer exist.
    for key in list(clips):
        kind, rest = key.split("/", 1)
        cid, _, take = rest.partition("#")
        if not os.path.exists(path_of(kind, cid, take or None)):
            del clips[key]

    out["checked"] = datetime.date.today().isoformat()
    json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)
    n = sum(1 for k, c in clips.items() if c["flags"] and "#" not in k)
    print(f"\n{n} clips flagged → {os.path.relpath(out_path, ROOT)}")


if __name__ == "__main__":
    main()
