"""
Finds a voice for one character in the ElevenLabs Voice Library, adds it to
your account, and sets it in elevenlabs.json.

    python scripts/voice/pick-voice.py moonface --list         # just show the list
    python scripts/voice/pick-voice.py moonface                # best match
    python scripts/voice/pick-voice.py moonface --pick 2       # the 2nd on the list
    python scripts/voice/pick-voice.py moonface --name Arthur  # the one whose name starts "Arthur"
    python scripts/voice/pick-voice.py moonface --id <id>      # exactly this voice (names repeat)
    python scripts/voice/pick-voice.py moonface --id <id> --no-add   # choose now, add later (add-voices.py)

Searching costs nothing. Each candidate has a preview link to listen to
first; then hear the character's own lines with

    python scripts/voice/generate.py --speaker moonface --limit 5 --force

Never pick a voice that imitates an actor from a film or TV version.
Needs ELEVENLABS_API_KEY.
"""
import argparse, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.elevenlabs.io/v1"

# Words in a voice's description that make it a worse fit for anyone here.
NEVER = ["sexy", "seductive", "asmr", "news", "corporate", "american", "australian", "whisper", "impression", "impersonat"]
STORY = ["british", "english", "storytelling", "audiobook", "character", "animation", "cartoon", "children"]


def want(gender, age, searches, good, bad=()):
    return {"gender": gender, "age": age, "searches": searches, "good": good + STORY, "bad": list(bad) + NEVER}


# What each character should sound like (PLAN.md §2 and ROADMAP.md W8).
WANTED = {
    "narrator": want("female", "middle_aged", ["warm british storyteller", "british children's audiobook narrator"],
                     ["warm", "gentle", "calm", "soothing", "clear", "kind", "bedtime"], ["villain", "deep"]),
    "moonface": want("male", "middle_aged", ["jolly british man", "booming warm british character"],
                     ["jolly", "warm", "booming", "cheerful", "hearty", "friendly", "round"], ["villain", "sinister"]),
    "silky": want("female", "young", ["soft bright british fairy", "gentle young british woman"],
                  ["soft", "bright", "gentle", "light", "sweet", "kind", "fairy", "airy"], ["deep", "old", "villain"]),
    "saucepan": want("male", "old", ["loud cheerful british old man", "eccentric british tinker"],
                     ["loud", "cheerful", "eccentric", "funny", "comic", "bumbling", "quirky"], ["sinister", "villain"]),
    "dameSnap": want("female", "middle_aged", ["strict british headmistress", "icy british witch"],
                     ["strict", "icy", "sharp", "stern", "crisp", "cold", "commanding", "villain", "witch"],
                     ["sweet", "soft", "scream"]),
    "beth": want("female", "young", ["british girl character", "young british girl"],
                 ["girl", "young", "bright", "kind", "sensible", "clear"], ["old", "mature", "deep"]),
    "joe": want("male", "young", ["british boy character", "young british boy"],
                ["boy", "young", "brave", "bright", "cheerful", "earnest"], ["old", "mature", "deep"]),
    "fran": want("female", "young", ["little british girl character", "cheeky young british girl"],
                 ["girl", "young", "cheeky", "playful", "bubbly", "excited"], ["old", "mature", "deep"]),
    "mum": want("female", "middle_aged", ["warm british mum"], ["warm", "kind", "motherly", "gentle"]),
    "dad": want("male", "middle_aged", ["warm british dad"], ["warm", "kind", "fatherly", "friendly"]),
    "washalot": want("female", "old", ["busy british old lady"], ["fussy", "busy", "chatty", "old", "granny"]),
    "watzisname": want("male", "old", ["sleepy british old man"], ["sleepy", "drowsy", "slow", "old", "mumbling"]),
    "pixie": want("male", "middle_aged", ["grumpy british goblin character"], ["grumpy", "cross", "gruff", "comic", "goblin"]),
    "oomboom": want("male", "middle_aged", ["booming deep british character"], ["booming", "deep", "big", "jolly", "pompous"]),
    "topsy": want("male", "middle_aged", ["silly british comic character"], ["silly", "comic", "zany", "playful", "funny"]),
    "jellyGoblin": want("male", "middle_aged", ["wobbly goblin character voice"], ["goblin", "squelchy", "comic", "silly", "gruff"]),
    "giant": want("male", "old", ["deep giant voice british"], ["giant", "deep", "slow", "rumbling", "gentle"]),
    "enchanter": want("male", "old", ["mysterious british wizard"], ["wizard", "mysterious", "wise", "magical"]),
    "toySoldier": want("male", "middle_aged", ["british toy soldier captain"], ["crisp", "brisk", "military", "proper", "comic"]),
    "snowman": want("male", "middle_aged", ["friendly snowman character"], ["friendly", "jolly", "soft", "gentle", "cheerful"]),
    "oldWoman": want("female", "old", ["busy british grandmother", "kind bustling old british lady"],
                     ["busy", "bustling", "kind", "motherly", "granny", "warm", "fussy"], ["villain", "sinister"]),
    "whirligig": want("male", "middle_aged", ["cheerful dizzy british showman", "jolly british fairground man"],
                      ["cheerful", "jolly", "showman", "lively", "playful", "funny", "comic"], ["sinister"]),
    "redGoblin": want("male", "middle_aged", ["sneaky goblin character voice", "mischievous british goblin"],
                      ["goblin", "sneaky", "mischievous", "gruff", "comic", "raspy", "cheeky"], ["horror", "scary", "demon"]),
}


def request(method, path, key, body=None):
    req = urllib.request.Request(
        API + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def search(key, terms, w):
    """Voices matching `terms`, trying strict filters first, then looser ones."""
    for params in (
        {"search": terms, "gender": w["gender"], "age": w["age"], "accent": "british", "page_size": 50},
        {"search": terms, "gender": w["gender"], "accent": "british", "page_size": 50},
        {"search": terms, "gender": w["gender"], "page_size": 50},
        {"search": terms, "page_size": 50},
    ):
        for attempt in range(4):
            try:
                found = request("GET", "/shared-voices?" + urllib.parse.urlencode(params), key).get("voices", [])
                if found:
                    return found
                break
            except urllib.error.HTTPError as e:
                # Too many searches in a row: wait and ask again, rather than
                # reporting an empty library.
                if e.code == 429 or e.code >= 500:
                    time.sleep(2 * (attempt + 1))
                    continue
                print(f"  ({terms}: ElevenLabs {e.code})", file=sys.stderr)
                break
    return []


def score(v, w):
    text = " ".join(str(v.get(k) or "") for k in ("name", "description", "descriptive", "use_case", "accent", "age", "gender")).lower()
    s = sum(2 for x in w["good"] if x in text) - sum(4 for x in w["bad"] if x in text)
    if (v.get("age") or "") == w["age"]:
        s += 6
    if "british" in (v.get("accent") or "").lower() or "english" in (v.get("accent") or "").lower():
        s += 6
    if (v.get("gender") or "") not in ("", w["gender"]):
        s -= 50
    # A little weight for voices many people use (usually better quality).
    s += min(6, (v.get("cloned_by_count") or 0) ** 0.25)
    return s


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("character", choices=sorted(WANTED))
    ap.add_argument("--pick", type=int, default=1, help="which of the listed voices to use (1 = best)")
    ap.add_argument("--name", help="use the listed voice whose name starts with this")
    ap.add_argument("--id", help="use the listed voice with this voice id")
    ap.add_argument("--no-add", action="store_true", help="set it in elevenlabs.json without adding it to your account")
    ap.add_argument("--list", action="store_true", help="only list the candidates")
    ap.add_argument("--top", type=int, default=8, help="how many candidates to list")
    args = ap.parse_args()
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("Set ELEVENLABS_API_KEY first.")
    w = WANTED[args.character]

    found = {}
    for terms in w["searches"]:
        for v in search(key, terms, w):
            found.setdefault(v["voice_id"], v)
    # The library matches a search phrase almost word for word, so a phrase
    # like "warm british dad" can find nothing. Fall back to single words.
    for word in w["good"][:4]:
        if len(found) >= args.top * 2:
            break
        for v in search(key, word, w):
            found.setdefault(v["voice_id"], v)
    if not found:
        sys.exit("No voices found in the library.")
    everyone = sorted(found.values(), key=lambda v: score(v, w), reverse=True)
    ranked = everyone[: args.top]

    print(f"Best voices for {args.character}:\n")
    for i, v in enumerate(ranked, 1):
        desc = (v.get("description") or v.get("descriptive") or "").strip().replace("\n", " ")
        print(f"{i}. {v.get('name')}  ({v.get('gender')}, {v.get('age')}, {v.get('accent')})  id {v['voice_id']}")
        print(f"   {desc[:140]}")
        print(f"   listen: {v.get('preview_url')}\n")
    if args.list:
        return

    if args.id:
        # Names repeat across the library (there are many Claires): the id never does.
        chosen = found.get(args.id)
        # A voice found some other way (the website, a wider search): look
        # it up by its name, given with --name.
        for terms in [args.name] if args.name and not chosen else []:
            req = "/shared-voices?" + urllib.parse.urlencode({"search": terms, "page_size": 100})
            chosen = next((v for v in request("GET", req, key).get("voices", []) if v["voice_id"] == args.id), None)
        if not chosen:
            sys.exit(f'Voice {args.id} isn\'t in the results. Try --list.')
    elif args.name:
        named = [v for v in everyone if (v.get("name") or "").lower().startswith(args.name.lower())]
        if not named:
            sys.exit(f'No voice named "{args.name}" in the results. Try --list.')
        chosen = named[0]
    else:
        chosen = ranked[args.pick - 1]
    if args.no_add:
        # Choosing can happen before the key may add voices (voices_write);
        # the owner id is what adding it later needs.
        voice_id = chosen["voice_id"]
        print(f"owner {chosen['public_owner_id']}")
    else:
        added = request("POST", f"/voices/add/{chosen['public_owner_id']}/{chosen['voice_id']}", key,
                        {"new_name": f"{chosen.get('name')} ({args.character})"})
        voice_id = added.get("voice_id", chosen["voice_id"])

    # Swap just this character's voice_id, keeping the file's layout.
    path = os.path.join(HERE, "elevenlabs.json")
    text = open(path, encoding="utf-8").read()
    pattern = re.compile(r'("' + args.character + r'"\s*:\s*\{\s*"voice_id"\s*:\s*")[^"]*(")')
    if not pattern.search(text):
        sys.exit(f'No "{args.character}" entry in elevenlabs.json.')
    open(path, "w", encoding="utf-8", newline="").write(pattern.sub(lambda m: m.group(1) + voice_id + m.group(2), text, count=1))

    # Remember whose voice it is, for add-voices.py.
    lib_path = os.path.join(HERE, "library.json")
    lib = json.load(open(lib_path, encoding="utf-8"))
    lib["speakers"][args.character] = {"voice_id": voice_id, "owner": chosen["public_owner_id"]}
    open(lib_path, "w", encoding="utf-8", newline="\n").write(json.dumps(lib, indent=2) + "\n")
    added_text = "Not added to your account yet" if args.no_add else "Added to your account"
    print(f"Chose {chosen.get('name')}. {added_text}, and set as {args.character}'s voice "
          f"in elevenlabs.json ({voice_id}).")


if __name__ == "__main__":
    main()
