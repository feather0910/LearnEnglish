"""Import AI-generated images from artifacts into images/ as 256x256 JPEG."""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = Path("/opt/cursor/artifacts/assets")
IMAGES = ROOT / "images"
VOCAB_JS = ROOT / "js" / "data" / "vocab.js"
SIZE = (256, 256)
JPEG_KW = {"format": "JPEG", "quality": 85, "optimize": True}

# artifact basename (no ext) -> vocab image filename (with .jpg)
ARTIFACT_TO_FILE = {
    "sleeping-bags": "sleeping bags.jpg",
    "police-car": "police car.jpg",
    "railroad-crossing": "railroad crossing.jpg",
    "pickup-truck": "pickup truck.jpg",
    "dump-truck": "dump truck.jpg",
    "garbage-truck": "garbage truck.jpg",
    "put-up": "put up.jpg",
    "buckle-up": "buckle up.jpg",
}


def to_rgb_white_bg(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        base = Image.new("RGB", im.size, (255, 255, 255))
        rgba = im.convert("RGBA")
        base.paste(rgba, mask=rgba.split()[-1])
        return base
    if im.mode != "RGB":
        return im.convert("RGB")
    return im


def letterbox(im: Image.Image) -> Image.Image:
    rgb = to_rgb_white_bg(im)
    boxed = ImageOps.contain(rgb, SIZE, method=Image.Resampling.LANCZOS)
    out = Image.new("RGB", SIZE, (255, 255, 255))
    x = (SIZE[0] - boxed.width) // 2
    y = (SIZE[1] - boxed.height) // 2
    out.paste(boxed, (x, y))
    return out


def missing_words() -> list[str]:
    text = VOCAB_JS.read_text(encoding="utf-8")
    return re.findall(r'\{ word: "([^"]+)"[^}]*file: ""', text)


def artifact_path(word: str) -> Path | None:
    key = word.replace(" ", "-")
    for name in (f"{key}.jpg", f"{key}.png", f"{word}.jpg", f"{word}.png"):
        p = ARTIFACTS / name
        if p.is_file():
            return p
    return None


def target_filename(word: str) -> str:
    for stem, fname in ARTIFACT_TO_FILE.items():
        if stem.replace("-", " ") == word or stem == word.replace(" ", "-"):
            return fname
    return f"{word}.jpg"


def import_one(word: str) -> bool:
    src = artifact_path(word)
    if not src:
        print(f"MISSING artifact for: {word}", file=sys.stderr)
        return False
    dst = IMAGES / target_filename(word)
    with Image.open(src) as im:
        out = letterbox(im.copy())
    out.save(dst, **JPEG_KW)
    print(f"OK {word} -> {dst.name}")
    return True


def patch_vocab() -> int:
    text = VOCAB_JS.read_text(encoding="utf-8")
    n = 0
    for word in missing_words():
        esc = re.escape(word)
        pat = rf'(\{{ word: "{esc}"[^}}]*file: )""'
        repl = rf'\1"images/{word}.jpg"'
        new, c = re.subn(pat, repl, text)
        if c:
            text = new
            n += c
    VOCAB_JS.write_text(text, encoding="utf-8")
    return n


def main() -> int:
    if not ARTIFACTS.is_dir():
        print(f"Artifacts dir not found: {ARTIFACTS}", file=sys.stderr)
        return 1
    IMAGES.mkdir(parents=True, exist_ok=True)
    words = missing_words()
    if not words:
        print("No missing images in vocab.js")
        return 0
    ok = sum(1 for w in words if import_one(w))
    n = patch_vocab()
    print(f"\nImported {ok}/{len(words)}, patched {n} vocab entries.")
    return 0 if ok == len(words) else 1


if __name__ == "__main__":
    raise SystemExit(main())
