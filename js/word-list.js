/* ===== Word List ===== */
let activeWordListGroupId = null;

const wordListPickerGrid = document.getElementById("word-list-picker-grid");
const wordListItems = document.getElementById("word-list-items");
const wordListTitle = document.getElementById("word-list-title");

function openWordListPicker() {
  renderWordListPicker();
  showView("wordListPicker");
}
window.openWordListPicker = openWordListPicker;

function renderWordListPicker() {
  if (!wordListPickerGrid) return;
  wordListPickerGrid.innerHTML = "";
  WORD_LIST_GROUPS.forEach((g) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card";
    const sub = g.subtitle
      ? `<div class="category-card-meta">${escapeHtml(g.subtitle)}</div>`
      : "";
    btn.innerHTML =
      `<span class="category-card-title">${escapeHtml(g.label)}</span>` +
      sub +
      `<div class="category-card-meta">共 ${getWordListWords(g).length} 个词</div>`;
    btn.addEventListener("click", () => openWordList(g.id));
    wordListPickerGrid.appendChild(btn);
  });
}

function openWordList(groupId) {
  const group = WORD_LIST_GROUPS.find((g) => g.id === groupId);
  if (!group) return;
  activeWordListGroupId = groupId;
  if (wordListTitle) {
    const sub = group.subtitle ? ` · ${group.subtitle}` : "";
    wordListTitle.textContent = `Word List · ${group.label}${sub}`;
  }
  renderWordList(group);
  bindWordListStartSpell(groupId);
  showView("wordList");
}

function bindWordListStartSpell(groupId) {
  const btn = document.getElementById("word-list-start-spell");
  if (!btn) return;
  btn.onclick = () => {
    if (typeof startWordListSpell !== "function") {
      console.error("startWordListSpell is not loaded");
      return;
    }
    startWordListSpell(groupId);
  };
}

function renderWordList(group) {
  if (!wordListItems) return;
  wordListItems.innerHTML = "";
  getWordListWords(group).forEach((word) => {
    const entry = wordListEntry(word);
    const zhRaw = entry.zh != null ? String(entry.zh).trim() : "";
    const zhLine = zhRaw ? escapeHtml(zhRaw) : "（暂无中文释义）";

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
      em.textContent = entry.emoji || "📖";
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
    const speakBtn = document.createElement("button");
    speakBtn.type = "button";
    speakBtn.className = "secondary";
    speakBtn.textContent = "🔊";
    speakBtn.title = "听发音";
    speakBtn.addEventListener("click", () => {
      unlockSpeech();
      speakEnglish(word);
    });
    actions.appendChild(speakBtn);

    item.appendChild(thumbEl);
    item.appendChild(body);
    item.appendChild(actions);
    wordListItems.appendChild(item);
  });
}

document.getElementById("word-list-picker-back")?.addEventListener("click", () => {
  showView("home");
});

document.getElementById("word-list-back")?.addEventListener("click", () => {
  showView("wordListPicker");
});
