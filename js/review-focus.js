/* ===== 重点复习词汇 ===== */
let activeReviewGroupId = null;

const reviewPickerGrid = document.getElementById("review-picker-grid");
const reviewFocusList = document.getElementById("review-focus-list");
const reviewListTitle = document.getElementById("review-list-title");

function openReviewPicker() {
  renderReviewPicker();
  showView("reviewPicker");
}

function renderReviewPicker() {
  if (!reviewPickerGrid) return;
  reviewPickerGrid.innerHTML = "";
  REVIEW_FOCUS_GROUPS.forEach((g) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card";
    btn.innerHTML =
      `<span class="category-card-title">${escapeHtml(g.label)}</span>` +
      `<div class="category-card-meta">重点词 ${g.words.length} 个</div>`;
    btn.addEventListener("click", () => openReviewList(g.id));
    reviewPickerGrid.appendChild(btn);
  });
}

function openReviewList(groupId) {
  const group = REVIEW_FOCUS_GROUPS.find((g) => g.id === groupId);
  if (!group) return;
  activeReviewGroupId = groupId;
  if (reviewListTitle) reviewListTitle.textContent = `重点复习 · ${group.label}`;
  renderReviewList(group);
  bindReviewStartSpell(groupId);
  showView("reviewList");
}

function bindReviewStartSpell(groupId) {
  const btn = document.getElementById("review-start-spell");
  if (!btn) return;
  btn.onclick = () => {
    if (typeof startReviewFocusSpell !== "function") {
      console.error("startReviewFocusSpell is not loaded");
      return;
    }
    startReviewFocusSpell(groupId);
  };
}

function renderReviewList(group) {
  if (!reviewFocusList) return;
  reviewFocusList.innerHTML = "";
  group.words.forEach((word) => {
    const entry = reviewFocusEntry(word);
    const zhRaw = entry.zh != null ? String(entry.zh).trim() : "";
    const zhLine = zhRaw
      ? escapeHtml(zhRaw)
      : "（暂无中文释义）";

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
    reviewFocusList.appendChild(item);
  });
}

document.getElementById("review-picker-back")?.addEventListener("click", () => {
  showView("home");
});

document.getElementById("review-list-back")?.addEventListener("click", () => {
  showView("reviewPicker");
});

