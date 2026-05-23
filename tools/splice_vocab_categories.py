"""Insert VOCAB supplement + PRIMARY_CATEGORY_BY_WORD + helpers after VOCAB array in index.html."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
html_path = ROOT / "index.html"
fragment_path = ROOT / "tools" / "primary_map_fragment.txt"

html = html_path.read_text(encoding="utf-8")
raw_frag = fragment_path.read_text(encoding="utf-8").lstrip("\ufeff")
fragment_lines = raw_frag.splitlines()
# skip "missing set()" header if present
while fragment_lines and "missing" in fragment_lines[0] and "set()" in fragment_lines[0]:
    fragment_lines = fragment_lines[1:]
map_body = "\n".join(fragment_lines)

MARKER_END = '    { word: "zoo", file: "images/zoo.jpg", zh: "动物园" },\n\n  ];'
INSERT_AFTER = MARKER_END

SUPPLEMENT = r"""
  const VOCAB_SUPPLEMENT = [
    { word: "red", zh: "红色", file: "", emoji: "🔴", category: ["color"] },
    { word: "blue", zh: "蓝色", file: "", emoji: "🔵", category: ["color"] },
    { word: "green", zh: "绿色", file: "", emoji: "🟢", category: ["color"] },
    { word: "yellow", zh: "黄色", file: "", emoji: "🟡", category: ["color"] },
    { word: "orange", zh: "橙色", file: "", emoji: "🟠", category: ["color"] },
    { word: "purple", zh: "紫色", file: "", emoji: "🟣", category: ["color"] },
    { word: "pink", zh: "粉色", file: "", emoji: "🌸", category: ["color"] },
    { word: "brown", zh: "棕色", file: "", emoji: "🟤", category: ["color"] },
    { word: "black", zh: "黑色", file: "", emoji: "⚫", category: ["color"] },
    { word: "white", zh: "白色", file: "", emoji: "⚪", category: ["color"] },
    { word: "gray", zh: "灰色", file: "", emoji: "🔘", category: ["color"] },
    { word: "circle", zh: "圆形", file: "", emoji: "⭕", category: ["shape"] },
    { word: "square", zh: "正方形", file: "", emoji: "🟦", category: ["shape"] },
    { word: "triangle", zh: "三角形", file: "", emoji: "🔺", category: ["shape"] },
    { word: "rectangle", zh: "长方形", file: "", emoji: "▭", category: ["shape"] },
    { word: "star", zh: "星形", file: "", emoji: "⭐", category: ["shape"] },
    { word: "heart", zh: "心形", file: "", emoji: "❤️", category: ["shape"] },
    { word: "oval", zh: "椭圆形", file: "", emoji: "🥚", category: ["shape"] },
    { word: "diamond", zh: "菱形", file: "", emoji: "💎", category: ["shape"] },
  ];
  VOCAB.push(...VOCAB_SUPPLEMENT);

  const PRIMARY_CATEGORY_BY_WORD = {
""" + map_body + """
  };

  function attachVocabCategories() {
    VOCAB.forEach((e) => {
      if (e.category && e.category.length) return;
      const p = PRIMARY_CATEGORY_BY_WORD[e.word];
      e.category = [p || "uncategorized"];
    });
  }
  attachVocabCategories();

  const QUIZ_CATEGORY_IDS = ["color", "shape", "animal", "insects", "food", "body", "daily_object"];
  const QUIZ_CATEGORY_LABELS = {
    color: "颜色",
    shape: "形状",
    animal: "动物",
    insects: "昆虫",
    food: "食物",
    body: "身体部位",
    daily_object: "日常物品",
  };
  const CATEGORY_NEIGHBORS = {
    color: ["shape", "daily_object"],
    shape: ["color", "daily_object"],
    animal: ["food", "body"],
    food: ["animal", "daily_object"],
    body: ["animal", "daily_object"],
    daily_object: ["shape", "food", "animal"],
  };

  function categoryFallbackEmoji(entry) {
    const c = (entry.category && entry.category[0]) || "";
    if (c === "animal") return "🐾";
    if (c === "food") return "🍽️";
    if (c === "body") return "🧍";
    if (c === "color") return "🎨";
    if (c === "shape") return "📐";
    if (c === "daily_object") return "📦";
    return "❓";
  }

  /** 显示图片；无 file 或加载失败时显示 emoji */
  function showEntryMedia(imgEl, emojiEl, entry) {
    if (!imgEl || !emojiEl) return;
    imgEl.onerror = null;
    const file = (entry.file || "").trim();
    if (!file) {
      imgEl.removeAttribute("src");
      imgEl.classList.add("hidden");
      emojiEl.textContent = entry.emoji || categoryFallbackEmoji(entry);
      emojiEl.classList.remove("hidden");
      return;
    }
    emojiEl.classList.add("hidden");
    imgEl.classList.remove("hidden");
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.classList.add("hidden");
      emojiEl.textContent = entry.emoji || categoryFallbackEmoji(entry);
      emojiEl.classList.remove("hidden");
    };
    setImageWithFade(imgEl, file, entry.word);
  }

  function vocabIndicesInCategory(catId) {
    const out = [];
    for (let i = 0; i < VOCAB.length; i += 1) {
      const cats = VOCAB[i].category || [];
      if (cats.includes(catId)) out.push(i);
    }
    return out;
  }

  function categoryExclusivePool(catId) {
    return vocabIndicesInCategory(catId).filter((i) => {
      const cats = VOCAB[i].category || [];
      return cats.length === 1 && cats[0] === catId;
    });
  }

  /** 先该类词条，不足则用邻类，再用全表补齐；一轮长度为 min(ROUND_SIZE, VOCAB.length) */
  function buildCategorySpellQueue(catId) {
    const cap = Math.min(ROUND_SIZE, VOCAB.length);
    const picked = new Set();
    const queue = [];
    const takeFrom = (indices) => {
      const shuffled = shuffleInPlace([...indices]);
      for (const idx of shuffled) {
        if (queue.length >= cap) break;
        if (picked.has(idx)) continue;
        queue.push(idx);
        picked.add(idx);
      }
    };
    takeFrom(categoryExclusivePool(catId));
    if (queue.length < cap) {
      takeFrom(vocabIndicesInCategory(catId));
    }
    const neighbors = CATEGORY_NEIGHBORS[catId] || [];
    for (const nid of neighbors) {
      if (queue.length >= cap) break;
      takeFrom(vocabIndicesInCategory(nid));
    }
    if (queue.length < cap) {
      const rest = shuffleInPlace(VOCAB.map((_, i) => i).filter((i) => !picked.has(i)));
      takeFrom(rest);
    }
    return queue;
  }

"""

if MARKER_END not in html:
    raise SystemExit("Marker not found — VOCAB end pattern mismatch")

new_html = html.replace(MARKER_END, MARKER_END + SUPPLEMENT, 1)
html_path.write_text(new_html, encoding="utf-8")
print("Spliced category data after VOCAB.")
