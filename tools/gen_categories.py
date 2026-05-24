import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
vocab_js = (ROOT / "js" / "data" / "vocab.js").read_text(encoding="utf-8")
start = vocab_js.index("const VOCAB = [")
end = vocab_js.index("\n];", start)
block = vocab_js[start:end]
words = re.findall(r'word:\s*"([^"]+)"', block)

insects = set(
    "ant insects worm bee beetle butterfly caterpillar cockroach dragonfly fly grasshopper ladybug mantis mosquito".split()
)
animal = set(
    "alligator bat cat chick deer dinosaur dog duck elephant fish fox goat goose horse kangaroo lizard monkey octopus ostrich ox pig raccoon rooster seal tiger turtle turkey zebra feather wing zoo".split()
)
food = set("apple egg ham milk nut pear peas pumpkin sandwich tomato watermelon".split())
body = set("elbow foot hand leg lip neck nose teeth thumb".split())
color = set()  # 颜色仅 VOCAB_SUPPLEMENT（gold/silver 等），基础词表里无 color 项
shape = set()  # 形状仅 VOCAB_SUPPLEMENT；ball/disc 等为 daily_object
unc = {
    "five",
    "four",
    "nine",
    "seven",
    "six",
    "ten",
    "zero",
    "numbers",
    "dive",
    "jump",
    "kick",
    "kiss",
    "quack",
    "rain",
    "rose",
    "leaf",
    "vine",
    "upstairs",
    "wink",
    "yawn",
    "quarter",
    "question mark",
}

animal.update({"pig"})
daily = set(words) - animal - insects - food - body - color - shape - unc
missing = set(words) - animal - insects - food - body - color - shape - unc - daily
print("missing", missing)


def cat(w):
    if w in insects:
        return "insects"
    if w in animal:
        return "animal"
    if w in food:
        return "food"
    if w in body:
        return "body"
    if w in color:
        return "color"
    if w in shape:
        return "shape"
    if w in unc:
        return "uncategorized"
    return "daily_object"


for w in sorted(words):
    print(f'    "{w}": "{cat(w)}",')
