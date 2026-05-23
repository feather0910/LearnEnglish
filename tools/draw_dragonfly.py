"""Regenerate dragonfly.jpg via draw_insect_lineart.

DEPRECATED: dragonfly.jpg was replaced by AI-generated 256x256 line art.
Do NOT run this script — it will overwrite the new image.
"""
from draw_insect_lineart import dragonfly, save
from PIL import Image, ImageDraw

SIZE = 128


def main() -> None:
    im = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
    dragonfly(ImageDraw.Draw(im))
    save(im, "dragonfly")


if __name__ == "__main__":
    main()