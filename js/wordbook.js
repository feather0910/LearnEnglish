const wordbookList = document.getElementById("wordbook-list");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderWordbook() {
  const indices = getWordbookVocabIndices();
  if (!indices.length) {
    wordbookList.innerHTML = '<div class="wordbook-empty">生词本暂时为空。</div>';
    return;
  }
  wordbookList.innerHTML = "";
  indices.forEach((idx) => {
    const entry = VOCAB[idx];
    const word = entry.word;
    const zhRaw = entry.zh != null ? String(entry.zh).trim() : "";
    const zhLine = zhRaw
      ? escapeHtml(zhRaw)
      : "（暂无中文，可在 VOCAB 中为该词添加 zh 字段）";

    const item = document.createElement("div");
    item.className = "wordbook-item";

    let thumbEl = null;
    if ((entry.file || "").trim()) {
      const thumb = document.createElement("img");
      thumb.className = "wordbook-thumb";
      thumb.src = entry.file;
      thumb.alt = "";
      thumbEl = thumb;
    } else {
      const em = document.createElement("div");
      em.className = "wordbook-thumb-emoji";
      em.textContent = entry.emoji || categoryFallbackEmoji(entry) || "❓";
      em.title = word;
      thumbEl = em;
    }

    const body = document.createElement("div");
    body.className = "wordbook-body";
    body.innerHTML =
      `<div class="wordbook-en">${escapeHtml(word)}</div>` +
      `<div class="wordbook-zh">${zhLine}</div>`;

    const actions = document.createElement("div");
    actions.className = "wordbook-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary";
    btn.textContent = "移除";
    btn.addEventListener("click", () => {
      removeFromWordbook(word);
      renderWordbook();
    });
    actions.appendChild(btn);

    item.appendChild(thumbEl);
    item.appendChild(body);
    item.appendChild(actions);
    wordbookList.appendChild(item);
  });
}
