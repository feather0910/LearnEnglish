"""Draw minimal 128x128 line-art insects (JPEG)."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
SIZE = 128
W = 3
INK = (35, 35, 35)


def save(im: Image.Image, name: str) -> Path:
    path = IMAGES / f"{name}.jpg"
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, format="JPEG", quality=85, optimize=True)
    print(f"Wrote {path}")
    return path


def dragonfly(d: ImageDraw.ImageDraw) -> None:
    """Side view: head dot, body line, two wing lines."""
    x0, y = 28, 66
    d.ellipse([x0 - 8, y - 8, x0 + 8, y + 8], outline=INK, width=W)
    d.line([(x0 + 6, y), (98, y)], fill=INK, width=W)
    d.line([(44, y), (88, y - 32)], fill=INK, width=W)
    d.line([(44, y), (88, y + 32)], fill=INK, width=W)


def beetle(d: ImageDraw.ImageDraw) -> None:
    """Top view: oval body + head."""
    d.ellipse([36, 44, 92, 88], outline=INK, width=W)
    d.ellipse([52, 36, 76, 52], outline=INK, width=W)


def cockroach(d: ImageDraw.ImageDraw) -> None:
    """Top view: long oval + two antennae."""
    d.ellipse([32, 52, 96, 80], outline=INK, width=W)
    d.line([(32, 64), (18, 48)], fill=INK, width=W)
    d.line([(32, 68), (18, 84)], fill=INK, width=W)


def fly_bug(d: ImageDraw.ImageDraw) -> None:
    """Top view: head, body, wings."""
    d.ellipse([44, 40, 64, 60], outline=INK, width=W)
    d.ellipse([58, 48, 90, 76], outline=INK, width=W)
    d.ellipse([36, 42, 80, 74], outline=INK, width=2)


def main() -> None:
    for name, draw_fn in [
        ("dragonfly", dragonfly),
        ("beetle", beetle),
        ("cockroach", cockroach),
        ("fly", fly_bug),
    ]:
        im = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
        draw_fn(ImageDraw.Draw(im))
        save(im, name)


if __name__ == "__main__":
    main()
