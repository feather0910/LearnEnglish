"""Update PRIMARY_CATEGORY_BY_WORD in js/data/categories.js from tools/primary_map_fragment.txt."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
categories_path = ROOT / "js" / "data" / "categories.js"
fragment_path = ROOT / "tools" / "primary_map_fragment.txt"

categories = categories_path.read_text(encoding="utf-8")
raw_frag = fragment_path.read_text(encoding="utf-8").lstrip("\ufeff")
fragment_lines = raw_frag.splitlines()
while fragment_lines and "missing" in fragment_lines[0] and "set()" in fragment_lines[0]:
    fragment_lines = fragment_lines[1:]
map_body = "\n".join(fragment_lines)

start_key = "const PRIMARY_CATEGORY_BY_WORD = {"
end_key = "\n};"
start = categories.index(start_key)
end = categories.index(end_key, start) + len(end_key)

new_map = f"{start_key}\n{map_body}\n}};"
categories_path.write_text(categories[:start] + new_map + categories[end:], encoding="utf-8")
print("Updated PRIMARY_CATEGORY_BY_WORD in js/data/categories.js")
