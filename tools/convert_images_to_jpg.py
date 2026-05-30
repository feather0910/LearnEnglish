"""Convert all PNGs under images/ to 256x256 JPEG (letterbox fit, white background)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
SIZE = (256, 256)
JPEG_KW = {"format": "JPEG", "quality": 85, "optimize": True}


def to_rgb_white_bg(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        base = Image.new("RGB", im.size, (255, 255, 255))
        rgba = im.convert("RGBA")
        base.paste(rgba, mask=rgba.split()[-1])
        return base
    if im.mode != "RGB":
        return im.convert("RGB")
    return im


def letterbox(im: Image.Image, size: tuple[int, int] = SIZE, fill: tuple[int, int, int] = (255, 255, 255)) -> Image.Image:
    """Scale to fit inside size without cropping (preserve full illustration)."""
    rgb = to_rgb_white_bg(im)
    boxed = ImageOps.contain(rgb, size, method=Image.Resampling.LANCZOS)
    out = Image.new("RGB", size, fill)
    x = (size[0] - boxed.width) // 2
    y = (size[1] - boxed.height) // 2
    out.paste(boxed, (x, y))
    return out


def convert_one(png_path: Path) -> Path | None:
    jpg_path = png_path.with_suffix(".jpg")
    try:
        with Image.open(png_path) as im:
            im = im.copy()
        out = letterbox(im)
        out.save(jpg_path, **JPEG_KW)
    except OSError as e:
        print(f"FAIL {png_path}: {e}", file=sys.stderr)
        return None
    return jpg_path


def main() -> int:
    if not IMAGES.is_dir():
        print(f"Missing directory: {IMAGES}", file=sys.stderr)
        return 1
    pngs = sorted(IMAGES.rglob("*.png"))
    if not pngs:
        print("No PNG files found.")
        return 0
    ok, bad = 0, 0
    for p in pngs:
        if convert_one(p) is not None:
            ok += 1
            print(f"OK   {p.relative_to(ROOT)}")
        else:
            bad += 1
    print(f"\nDone: {ok} converted, {bad} failed, {len(pngs)} total.")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
