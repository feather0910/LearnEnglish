"""Split english.html into css/ and js/ per maintenance plan."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
lines = (ROOT / "index.html").read_text(encoding="utf-8").splitlines(keepends=True)

def write(rel: str, content: str) -> None:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.rstrip() + "\n", encoding="utf-8")

# CSS
css_start = next(i for i, l in enumerate(lines) if "<style>" in l) + 1
css_end = next(i for i, l in enumerate(lines) if "</style>" in l)
write("css/app.css", "".join(lines[css_start:css_end]))

# Body
body_start = next(i for i, l in enumerate(lines) if l.strip() == "<body>") + 1
script_open = next(i for i, l in enumerate(lines) if l.strip() == "<script>")
script_close = next(i for i, l in enumerate(lines) if l.strip() == "</script>")
body_html = "".join(lines[body_start:script_open])

# Script (strip 2-space indent)
raw = [ln[2:] if ln.startswith("  ") else ln for ln in lines[script_open + 1 : script_close]]
n = len(raw)

def find(substr: str, start: int = 0) -> int:
    for i in range(start, n):
        if substr in raw[i]:
            return i
    raise SystemExit(f"marker not found: {substr!r}")

def chunk(a: int, b: int) -> str:
    return "".join(raw[a:b]).rstrip() + "\n"

# Ranges (exclusive end)
i_vocab = find("const VOCAB = [")
i_supp = find("const VOCAB_SUPPLEMENT")
i_push = find("VOCAB.push(...VOCAB_SUPPLEMENT)")
i_primary = find("const PRIMARY_CATEGORY_BY_WORD")
i_attach = find("function attachVocabCategories")
i_config = find("const WORDBOOK_KEY")
i_supp_entry = find("function isSupplementEntry")
i_confetti = find("const confettiRoot")
i_round = find("const roundOverlay =")
i_settings = find("const settingAutoNext")
i_wordbook_fn = find("function loadWordbook()")
i_utils = find("/* ===== 工具函数 =====")
i_nav = find("/* ===== 视图切换 =====")
i_home = find("/* ===== 首页 =====")
i_flash = find("/* ===== 卡片模式 =====")
i_qw = find("/* ===== 看图选词")
i_qi = find("/* ===== 看词选图")
i_spell = find("/* ===== 拼写模式")
i_cat = find("/* ===== 分类拼写")
i_first = find("/* ===== 首字母模式")

write("js/data/vocab.js", chunk(i_vocab, i_push + 1))
write("js/data/categories.js", chunk(i_primary, i_config))

write("js/config.js", chunk(i_config, i_config + 4))  # only 4 const lines — fix below
write("js/config.js", chunk(i_config, find("function loadSettings")))

write("js/vocab-core.js", chunk(i_supp_entry, i_confetti))
write("js/fx.js", chunk(i_confetti, i_round))
write("js/round-ui.js", chunk(i_round, i_settings))
write("js/utils.js", chunk(i_utils, i_nav))
write("js/nav.js", chunk(i_nav, i_home))

i_escape = find("function escapeHtml")
write("js/storage.js", chunk(find("function loadSettings"), i_wordbook_fn))
write("js/wordbook.js", chunk(i_wordbook_fn, i_utils) + "\n" + chunk(i_escape, i_flash))

write("js/modes/flash.js", chunk(i_flash, i_qw))
write("js/modes/quiz-word.js", chunk(i_qw, i_qi))
write("js/modes/quiz-image.js", chunk(i_qi, i_spell))
write("js/modes/spell.js", chunk(i_spell, i_cat))
write("js/modes/category-spell.js", chunk(i_cat, i_first))
write("js/modes/first.js", chunk(i_first, n))

# main: home + settings init + reset-seen (settings block before wordbook fns)
write("js/main.js", chunk(i_home, i_escape) + "\n" + chunk(i_settings, i_wordbook_fn))

scripts = """
  <script src="js/data/vocab.js"></script>
  <script src="js/config.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/data/categories.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/vocab-core.js"></script>
  <script src="js/fx.js"></script>
  <script src="js/round-ui.js"></script>
  <script src="js/nav.js"></script>
  <script src="js/wordbook.js"></script>
  <script src="js/modes/flash.js"></script>
  <script src="js/modes/quiz-word.js"></script>
  <script src="js/modes/quiz-image.js"></script>
  <script src="js/modes/spell.js"></script>
  <script src="js/modes/category-spell.js"></script>
  <script src="js/modes/first.js"></script>
  <script src="js/main.js"></script>
"""

index = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>单词图片学习</title>
  <link rel="stylesheet" href="css/app.css" />
</head>
<body>
{body_html}{scripts}</body>
</html>
"""
(ROOT / "index.html").write_text(index, encoding="utf-8")
print("Split complete.")
