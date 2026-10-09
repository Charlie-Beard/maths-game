"""
Adds every chosen Voice Library voice (library.json) to your ElevenLabs
account, so generate.py can record with them. Voices already there are
skipped, so it's safe to run again.

    python scripts/voice/add-voices.py            # add what's missing
    python scripts/voice/add-voices.py --dry-run  # just say what it would add

Needs ELEVENLABS_API_KEY with the Voices: Write permission (voices_write).
"""
import argparse, json, os, sys, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.elevenlabs.io/v1"


def request(method, path, key, body=None):
    req = urllib.request.Request(
        API + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("Set ELEVENLABS_API_KEY first.")

    library = json.load(open(os.path.join(HERE, "library.json"), encoding="utf-8"))["speakers"]
    config = json.load(open(os.path.join(HERE, "elevenlabs.json"), encoding="utf-8"))["speakers"]
    have = {v["voice_id"] for v in request("GET", "/voices", key).get("voices", [])}

    # One voice can serve more than one speaker: add it once.
    todo = {}
    for who, v in library.items():
        if config.get(who, {}).get("voice_id") != v["voice_id"]:
            print(f"{who}: elevenlabs.json has another voice now, skipping {v['voice_id']}")
        elif v["voice_id"] not in have:
            todo.setdefault(v["voice_id"], (who, v["owner"]))
    if not todo:
        print("Every chosen voice is already in your account.")
        return

    for voice_id, (who, owner) in todo.items():
        if args.dry_run:
            print(f"would add {voice_id} ({who})")
            continue
        try:
            added = request("POST", f"/voices/add/{owner}/{voice_id}", key, {"new_name": f"{who} ({voice_id})"})
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")
            if "voices_write" in detail:
                sys.exit("The API key is missing Voices: Write. Edit it on elevenlabs.io → API Keys, then run this again.")
            sys.exit(f"{who}: ElevenLabs {e.code}: {detail}")
        if added.get("voice_id", voice_id) != voice_id:
            # generate.py sends elevenlabs.json's id, so it must be the account's.
            print(f"{who}: added, but as {added['voice_id']}. Put that id in elevenlabs.json.")
        else:
            print(f"added {voice_id} ({who})")


if __name__ == "__main__":
    main()
