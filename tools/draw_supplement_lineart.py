"""Generate 256x256 line-art JPEGs for supplement vocab without images."""
from __future__ import annotations

import math
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
VOCAB_JS = ROOT / "js" / "data" / "vocab.js"
SIZE = 256
INK = (35, 35, 35)
W = 3
JPEG_KW = {"format": "JPEG", "quality": 85, "optimize": True}


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
    return im, ImageDraw.Draw(im)


def save(im: Image.Image, word: str) -> Path:
    path = IMAGES / f"{word}.jpg"
    im.save(path, **JPEG_KW)
    return path


def star_points(cx: float, cy: float, r_outer: float, r_inner: float, n: int = 5) -> list[tuple[float, float]]:
    pts = []
    for i in range(n * 2):
        ang = -math.pi / 2 + i * math.pi / n
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts


def heart_points(cx: float, cy: float, scale: float = 1.0) -> list[tuple[float, float]]:
    pts = []
    for deg in range(0, 360, 4):
        t = math.radians(deg)
        x = 16 * (math.sin(t) ** 3)
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * scale, cy + y * scale))
    return pts


# --- colors ---
COLOR_RGB = {
    "red": (220, 55, 55),
    "blue": (55, 110, 220),
    "green": (55, 170, 85),
    "yellow": (245, 210, 45),
    "orange": (245, 140, 45),
    "purple": (150, 75, 200),
    "pink": (245, 140, 180),
    "brown": (140, 90, 55),
    "black": (30, 30, 30),
    "white": (250, 250, 250),
    "gray": (150, 150, 150),
    "gold": (220, 180, 50),
    "silver": (190, 195, 205),
}


def draw_color(word: str, d: ImageDraw.ImageDraw) -> None:
    fill = COLOR_RGB[word]
    d.ellipse([48, 48, 208, 208], fill=fill, outline=INK, width=W)
    if word == "white":
        d.ellipse([48, 48, 208, 208], outline=INK, width=W + 1)


# --- shapes ---
def draw_circle(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([56, 56, 200, 200], outline=INK, width=W)


def draw_square(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([64, 64, 192, 192], outline=INK, width=W)


def draw_rectangle(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([40, 80, 216, 176], outline=INK, width=W)


def draw_star(d: ImageDraw.ImageDraw) -> None:
    d.polygon(star_points(128, 128, 88, 36), outline=INK, width=W)


def draw_heart(d: ImageDraw.ImageDraw) -> None:
    d.polygon(heart_points(128, 138, 5.2), outline=INK, width=W)


def draw_oval(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([48, 72, 208, 184], outline=INK, width=W)


def draw_diamond(d: ImageDraw.ImageDraw) -> None:
    d.polygon([(128, 52), (204, 128), (128, 204), (52, 128)], outline=INK, width=W)


# --- insects ---
def draw_bee(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([88, 108, 168, 148], outline=INK, width=W)
    for x in (100, 118, 136, 154):
        d.line([(x, 108), (x, 148)], fill=INK, width=2)
    d.ellipse([72, 96, 120, 124], outline=INK, width=2)
    d.ellipse([136, 96, 184, 124], outline=INK, width=2)
    d.line([(128, 108), (128, 88)], fill=INK, width=W)
    d.line([(120, 88), (128, 76)], fill=INK, width=W)
    d.line([(136, 88), (128, 76)], fill=INK, width=W)


def draw_butterfly(d: ImageDraw.ImageDraw) -> None:
    d.line([(128, 80), (128, 176)], fill=INK, width=W)
    d.ellipse([48, 72, 120, 152], outline=INK, width=W)
    d.ellipse([136, 72, 208, 152], outline=INK, width=W)
    d.ellipse([56, 152, 112, 200], outline=INK, width=2)
    d.ellipse([144, 152, 200, 200], outline=INK, width=2)


def draw_caterpillar(d: ImageDraw.ImageDraw) -> None:
    xs = [52, 82, 112, 142, 172, 200]
    for i, x in enumerate(xs):
        r = 22 if i == 0 else 20
        d.ellipse([x - r, 118 - r, x + r, 118 + r], outline=INK, width=W)
    d.line([(40, 118), (52, 118)], fill=INK, width=2)
    d.line([(34, 110), (40, 118)], fill=INK, width=2)
    d.line([(34, 126), (40, 118)], fill=INK, width=2)


def draw_ladybug(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([72, 88, 184, 168], outline=INK, width=W)
    d.line([(128, 88), (128, 168)], fill=INK, width=2)
    for dx, dy in [(100, 120), (156, 120), (128, 140)]:
        d.ellipse([dx - 6, dy - 6, dx + 6, dy + 6], fill=INK)
    d.ellipse([108, 76, 148, 100], outline=INK, width=W)


def draw_mosquito(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([108, 72, 148, 112], outline=INK, width=W)
    d.line([(128, 112), (128, 168)], fill=INK, width=W)
    d.ellipse([88, 100, 168, 140], outline=INK, width=2)
    for ang in (-0.5, 0.5):
        d.line([(128, 168), (128 + 40 * math.cos(ang), 210)], fill=INK, width=2)
        d.line([(128, 168), (128 - 40 * math.cos(ang), 210)], fill=INK, width=2)
    d.line([(108, 72), (92, 56)], fill=INK, width=2)
    d.line([(148, 72), (164, 56)], fill=INK, width=2)


# --- body ---
def draw_eye(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([72, 100, 184, 156], outline=INK, width=W)
    d.ellipse([108, 112, 148, 148], fill=INK)


def draw_ear(d: ImageDraw.ImageDraw) -> None:
    d.arc([88, 72, 168, 192], 300, 60, fill=INK, width=W + 1)


def draw_mouth(d: ImageDraw.ImageDraw) -> None:
    d.arc([72, 108, 184, 180], 20, 160, fill=INK, width=W)


def draw_head(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([72, 64, 184, 176], outline=INK, width=W)
    d.ellipse([100, 108, 120, 128], fill=INK)
    d.ellipse([136, 108, 156, 128], fill=INK)
    d.arc([108, 132, 148, 156], 20, 160, fill=INK, width=2)


def draw_arm(d: ImageDraw.ImageDraw) -> None:
    d.line([(80, 160), (128, 120), (176, 80)], fill=INK, width=W)
    d.ellipse([164, 68, 188, 92], outline=INK, width=W)


def draw_knee(d: ImageDraw.ImageDraw) -> None:
    d.line([(128, 64), (128, 140)], fill=INK, width=W)
    d.line([(128, 140), (96, 200)], fill=INK, width=W)
    d.line([(128, 140), (160, 200)], fill=INK, width=W)
    d.arc([108, 124, 148, 164], 0, 180, fill=INK, width=W)


def draw_shoulder(d: ImageDraw.ImageDraw) -> None:
    d.arc([64, 80, 192, 200], 200, 340, fill=INK, width=W + 1)
    d.line([(64, 140), (192, 140)], fill=INK, width=W)


def draw_finger(d: ImageDraw.ImageDraw) -> None:
    d.line([(96, 200), (96, 120), (128, 88)], fill=INK, width=W)
    d.ellipse([112, 72, 144, 104], outline=INK, width=W)


def draw_toe(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([88, 72, 168, 160], outline=INK, width=W)
    for x in (108, 128, 148):
        d.ellipse([x - 10, 152, x + 10, 176], outline=INK, width=2)


def draw_hair(d: ImageDraw.ImageDraw) -> None:
    d.arc([72, 100, 184, 200], 180, 0, fill=INK, width=W)
    for x in range(80, 180, 16):
        d.arc([x - 12, 48, x + 28, 120], 200, 340, fill=INK, width=2)


def draw_face(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([64, 72, 192, 184], outline=INK, width=W)
    d.ellipse([96, 112, 116, 132], fill=INK)
    d.ellipse([140, 112, 160, 132], fill=INK)
    d.arc([108, 136, 148, 164], 20, 160, fill=INK, width=2)


def draw_stomach(d: ImageDraw.ImageDraw) -> None:
    d.arc([72, 88, 184, 200], 0, 180, fill=INK, width=W)
    d.line([(72, 140), (184, 140)], fill=INK, width=2)


def draw_tongue(d: ImageDraw.ImageDraw) -> None:
    d.arc([72, 100, 184, 160], 20, 160, fill=INK, width=W)
    d.ellipse([108, 140, 148, 200], fill=INK)


def draw_cheek(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([80, 88, 176, 184], outline=INK, width=W)
    d.ellipse([108, 128, 140, 152], outline=INK, width=2)


def draw_chin(d: ImageDraw.ImageDraw) -> None:
    d.arc([72, 72, 184, 184], 30, 150, fill=INK, width=W)
    d.arc([96, 140, 160, 200], 0, 180, fill=INK, width=W)


def draw_forehead(d: ImageDraw.ImageDraw) -> None:
    d.arc([72, 100, 184, 200], 200, 340, fill=INK, width=W + 1)
    d.line([(72, 140), (184, 140)], fill=INK, width=2)


def draw_tooth(d: ImageDraw.ImageDraw) -> None:
    d.polygon([(108, 72), (148, 72), (140, 180), (116, 180)], outline=INK, width=W)


# --- review / vehicles ---
def draw_sleeping_bags(d: ImageDraw.ImageDraw) -> None:
    d.rounded_rectangle([48, 100, 140, 180], radius=24, outline=INK, width=W)
    d.arc([100, 100, 200, 180], 270, 90, fill=INK, width=W)


def draw_tent(d: ImageDraw.ImageDraw) -> None:
    d.polygon([(128, 56), (48, 200), (208, 200)], outline=INK, width=W)
    d.line([(128, 56), (128, 200)], fill=INK, width=2)


def draw_siren(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([96, 120, 160, 160], outline=INK, width=W)
    d.ellipse([104, 72, 152, 120], outline=INK, width=W)
    for i, y in enumerate((64, 48, 32)):
        d.arc([80 - i * 8, y, 176 + i * 8, y + 40], 180, 0, fill=INK, width=2)


def draw_ambulance(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([48, 120, 208, 180], outline=INK, width=W)
    d.rectangle([48, 88, 120, 120], outline=INK, width=W)
    d.line([(88, 132), (88, 168)], fill=INK, width=3)
    d.line([(72, 150), (104, 150)], fill=INK, width=3)


def draw_police_car(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([40, 130, 216, 180], outline=INK, width=W)
    d.rectangle([72, 100, 184, 130], outline=INK, width=W)
    d.rectangle([96, 88, 160, 104], fill=INK)
    d.ellipse([56, 168, 88, 196], outline=INK, width=W)
    d.ellipse([168, 168, 200, 196], outline=INK, width=W)


def draw_railroad_crossing(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([88, 56, 168, 120], outline=INK, width=W)
    d.line([(96, 64), (160, 112)], fill=INK, width=W)
    d.line([(160, 64), (96, 112)], fill=INK, width=W)
    d.line([(48, 160), (208, 160)], fill=INK, width=W)
    d.line([(48, 176), (208, 176)], fill=INK, width=W)


def draw_pickup_truck(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([40, 120, 216, 176], outline=INK, width=W)
    d.rectangle([136, 88, 208, 120], outline=INK, width=W)
    d.ellipse([56, 168, 88, 196], outline=INK, width=W)
    d.ellipse([168, 168, 200, 196], outline=INK, width=W)


def draw_dump_truck(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([48, 130, 140, 176], outline=INK, width=W)
    d.polygon([(140, 100), (208, 100), (208, 150), (140, 150)], outline=INK, width=W)
    d.ellipse([56, 168, 88, 196], outline=INK, width=W)
    d.ellipse([168, 168, 200, 196], outline=INK, width=W)


def draw_garbage_truck(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([40, 130, 160, 176], outline=INK, width=W)
    d.rectangle([160, 96, 208, 150], outline=INK, width=W)
    d.ellipse([56, 168, 88, 196], outline=INK, width=W)
    d.ellipse([168, 168, 200, 196], outline=INK, width=W)


def draw_almost(d: ImageDraw.ImageDraw) -> None:
    d.line([(48, 160), (200, 96)], fill=INK, width=W)
    d.line([(48, 176), (200, 112)], fill=INK, width=2)
    d.line([(200, 96), (188, 80)], fill=INK, width=2)
    d.line([(200, 96), (212, 108)], fill=INK, width=2)


def draw_campfire(d: ImageDraw.ImageDraw) -> None:
    d.line([(88, 180), (108, 140)], fill=INK, width=W)
    d.line([(168, 180), (148, 140)], fill=INK, width=W)
    d.polygon([(128, 48), (96, 140), (160, 140)], outline=INK, width=W)


def draw_drive(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([64, 64, 192, 192], outline=INK, width=W)
    d.ellipse([96, 96, 160, 160], outline=INK, width=W)
    d.rectangle([120, 88, 136, 112], fill=INK)


def draw_honk(d: ImageDraw.ImageDraw) -> None:
    d.polygon([(64, 120), (120, 100), (120, 156), (64, 156)], outline=INK, width=W)
    for x in (140, 168, 196):
        d.arc([x - 20, 108, x + 20, 148], 270, 90, fill=INK, width=2)


def draw_put_up(d: ImageDraw.ImageDraw) -> None:
    d.line([(64, 200), (64, 80)], fill=INK, width=W)
    d.line([(192, 200), (192, 80)], fill=INK, width=W)
    d.line([(64, 80), (192, 80)], fill=INK, width=W)
    d.polygon([(128, 48), (88, 120), (168, 120)], outline=INK, width=2)


def draw_camping(d: ImageDraw.ImageDraw) -> None:
    draw_tent(d)
    d.line([(40, 200), (40, 140)], fill=INK, width=2)
    d.ellipse([24, 100, 56, 132], outline=INK, width=2)
    d.line([(216, 200), (216, 130)], fill=INK, width=2)
    d.ellipse([200, 90, 232, 122], outline=INK, width=2)


def draw_buckle_up(d: ImageDraw.ImageDraw) -> None:
    d.arc([88, 72, 168, 160], 200, 340, fill=INK, width=W)
    d.line([(72, 140), (184, 140)], fill=INK, width=W)
    d.rectangle([116, 132, 140, 156], outline=INK, width=W)


DRAWERS: dict[str, callable] = {
    **{c: (lambda d, c=c: draw_color(c, d)) for c in COLOR_RGB},
    "circle": draw_circle,
    "square": draw_square,
    "rectangle": draw_rectangle,
    "star": draw_star,
    "heart": draw_heart,
    "oval": draw_oval,
    "diamond": draw_diamond,
    "bee": draw_bee,
    "butterfly": draw_butterfly,
    "caterpillar": draw_caterpillar,
    "ladybug": draw_ladybug,
    "mosquito": draw_mosquito,
    "eye": draw_eye,
    "ear": draw_ear,
    "mouth": draw_mouth,
    "head": draw_head,
    "arm": draw_arm,
    "knee": draw_knee,
    "shoulder": draw_shoulder,
    "finger": draw_finger,
    "toe": draw_toe,
    "hair": draw_hair,
    "face": draw_face,
    "stomach": draw_stomach,
    "tongue": draw_tongue,
    "cheek": draw_cheek,
    "chin": draw_chin,
    "forehead": draw_forehead,
    "tooth": draw_tooth,
    "sleeping bags": draw_sleeping_bags,
    "tent": draw_tent,
    "siren": draw_siren,
    "ambulance": draw_ambulance,
    "police car": draw_police_car,
    "railroad crossing": draw_railroad_crossing,
    "pickup truck": draw_pickup_truck,
    "dump truck": draw_dump_truck,
    "garbage truck": draw_garbage_truck,
    "almost": draw_almost,
    "campfire": draw_campfire,
    "drive": draw_drive,
    "honk": draw_honk,
    "put up": draw_put_up,
    "camping": draw_camping,
    "buckle up": draw_buckle_up,
}


def missing_words() -> list[str]:
    text = VOCAB_JS.read_text(encoding="utf-8")
    return re.findall(r'\{ word: "([^"]+)"[^}]*file: ""', text)


def patch_vocab() -> int:
    text = VOCAB_JS.read_text(encoding="utf-8")
    n = 0
    for word in DRAWERS:
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
    IMAGES.mkdir(parents=True, exist_ok=True)
    words = missing_words()
    if not words:
        print("No missing images in vocab.js")
        return 0
    bad = []
    for word in words:
        fn = DRAWERS.get(word)
        if not fn:
            bad.append(word)
            continue
        im, d = canvas()
        fn(d)
        path = save(im, word)
        print(f"OK {path.name}")
    if bad:
        print("No drawer for:", ", ".join(bad), file=sys.stderr)
    n = patch_vocab()
    print(f"Patched {n} vocab entries.")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
