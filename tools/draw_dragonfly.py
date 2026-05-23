"""Regenerate dragonfly.jpg via draw_insect_lineart."""
from draw_insect_lineart import dragonfly, save
from PIL import Image, ImageDraw

SIZE = 128


def main() -> None:
    im = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
    dragonfly(ImageDraw.Draw(im))
    save(im, "dragonfly")


if __name__ == "__main__":
    main()