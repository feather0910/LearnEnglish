/* ===== 拼写模式（每轮 20） ===== */
let spellQueue = [];
let spellPos = 0;
let spellCurrent = null;
let spellRoundCorrect = 0;
let spellCountedThisQuestion = false;
let spellReviewGroupId = null;

const spellImg = document.getElementById("spell-img");
const spellEmoji = document.getElementById("spell-emoji");
const spellZh = document.getElementById("spell-zh");
const spellInput = document.getElementById("spell-input");
const spellMsg = document.getElementById("spell-msg");
const spellStats = document.getElementById("spell-stats");
const spellHintToggle = document.getElementById("spell-hint-toggle");
const spellHint = document.getElementById("spell-hint");
const spellAnswerLine = document.getElementById("spell-answer-line");
const spellStreakEl = document.getElementById("spell-streak");
const spellContinue = document.getElementById("spell-continue");
const spellDotsEl = document.getElementById("spell-dots");

function updateSpellStats() {
  const n = spellQueue.length;
  if (!n) {
    spellStats.textContent = "";
    renderRoundDots(spellDotsEl, 0, 0);
    return;
  }
  let prefix = "";
  if (spellReviewGroupId) {
    const g = REVIEW_FOCUS_GROUPS.find((x) => x.id === spellReviewGroupId);
    if (g) prefix = `「${g.label}」· `;
  }
  spellStats.textContent = `${prefix}第 ${spellPos + 1} / ${n} 题 · 本轮答对 ${spellRoundCorrect} 题`;
  renderRoundDots(spellDotsEl, spellPos, n);
}

function renderSpellQuestion() {
  spellCurrent = VOCAB[spellQueue[spellPos]];
  showEntryMedia(spellImg, spellEmoji, spellCurrent);
  const zhRaw = spellCurrent.zh != null ? String(spellCurrent.zh).trim() : "";
  if (spellZh) {
    if (zhRaw) {
      spellZh.textContent = zhRaw;
      spellZh.classList.remove("hidden");
    } else {
      spellZh.textContent = "";
      spellZh.classList.add("hidden");
    }
  }
  updateSpellHint();
  spellInput.focus();
  updateSpellStats();
}

function updateSpellHint() {
  if (spellHintToggle.checked && spellCurrent) {
    spellHint.textContent = `提示：首字母为 "${spellCurrent.word.charAt(0)}"`;
    spellHint.classList.remove("hidden");
  } else {
    spellHint.classList.add("hidden");
  }
}

function advanceSpellQuestion() {
  if (spellContinue) spellContinue.classList.add("hidden");
  spellPos += 1;
  spellCountedThisQuestion = false;
  spellMsg.classList.add("hidden");
  spellInput.value = "";
  spellAnswerLine.classList.add("hidden");
  if (spellPos >= spellQueue.length) {
    const mode = spellReviewGroupId ? "reviewFocusSpell" : "spell";
    showRoundComplete(mode, spellRoundCorrect, spellQueue.length);
    spellCurrent = null;
    return;
  }
  renderSpellQuestion();
}

function nextSpellWord() {
  if (!spellCurrent) return;
  markWordSeen(spellCurrent.word);
  updateStreakLine(spellStreakEl, false);
  advanceSpellQuestion();
}

function checkSpell() {
  if (!spellCurrent) return;
  const guess = spellInput.value.trim().toLowerCase();
  const target = spellCurrent.word.trim().toLowerCase();
  if (guess === target) {
    markWordSeen(spellCurrent.word);
    spellRoundCorrect += 1;
    updateStreakLine(spellStreakEl, true);
    onAnswerCorrectFx();
    spellMsg.classList.add("hidden");
    showPraiseToast(praiseForToast());
    if (isAutoNext()) {
      setTimeout(() => advanceSpellQuestion(), 650);
    } else if (spellContinue) {
      spellContinue.classList.remove("hidden");
    } else {
      setTimeout(() => advanceSpellQuestion(), 900);
    }
    return;
  }
  if (!spellCountedThisQuestion) {
    spellCountedThisQuestion = true;
    updateStreakLine(spellStreakEl, false);
  }
  spellMsg.textContent = "不对，再试一次。";
  spellMsg.className = "msg bad";
  spellMsg.classList.remove("hidden");
}

function startSpell() {
  spellReviewGroupId = null;
  lastReviewFocusGroupId = null;
  if (spellContinue) spellContinue.classList.add("hidden");
  spellQueue = buildRoundQueueIndices();
  spellPos = 0;
  spellRoundCorrect = 0;
  spellCountedThisQuestion = false;
  resetStreakLine([spellStreakEl]);
  showView("spell");
  if (!spellQueue.length) {
    spellStats.textContent = "词表为空";
    return;
  }
  spellMsg.classList.add("hidden");
  spellInput.value = "";
  spellAnswerLine.classList.add("hidden");
  renderSpellQuestion();
}

function startReviewFocusSpell(groupId) {
  const group = REVIEW_FOCUS_GROUPS.find((g) => g.id === groupId);
  if (!group) return;
  spellReviewGroupId = groupId;
  lastReviewFocusGroupId = groupId;
  if (spellContinue) spellContinue.classList.add("hidden");
  spellQueue = buildReviewFocusSpellQueue(groupId);
  spellPos = 0;
  spellRoundCorrect = 0;
  spellCountedThisQuestion = false;
  resetStreakLine([spellStreakEl]);
  showView("spell");
  if (!spellQueue.length) {
    spellStats.textContent = "该日期暂无可用词条";
    return;
  }
  spellMsg.classList.add("hidden");
  spellInput.value = "";
  spellAnswerLine.classList.add("hidden");
  renderSpellQuestion();
}

document.getElementById("spell-back")?.addEventListener("click", () => {
  hideRoundComplete();
  if (spellReviewGroupId) {
    const id = spellReviewGroupId;
    spellReviewGroupId = null;
    openReviewList(id);
  } else {
    showView("home");
  }
});

spellHintToggle.addEventListener("change", updateSpellHint);
document.getElementById("spell-submit").addEventListener("click", checkSpell);
document.getElementById("spell-skip").addEventListener("click", nextSpellWord);
document.getElementById("spell-show-answer").addEventListener("click", () => {
  if (!spellCurrent) return;
  spellAnswerLine.textContent = `答案：${spellCurrent.word}`;
  spellAnswerLine.classList.remove("hidden");
});
document.getElementById("spell-add-wordbook").addEventListener("click", () => {
  if (!spellCurrent) return;
  const added = addToWordbook(spellCurrent.word);
  spellMsg.textContent = added ? "已加入生词本。" : "该单词已在生词本中。";
  spellMsg.className = added ? "msg ok" : "msg bad";
  spellMsg.classList.remove("hidden");
});
spellInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") { ev.preventDefault(); checkSpell(); }
});
if (spellContinue) {
  spellContinue.addEventListener("click", () => advanceSpellQuestion());
}

function normalizeSpellAnswer(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function openCategoryPicker() {
  renderCategoryPicker();
  showView("categoryPicker");
}

function renderCategoryPicker() {
  const grid = document.getElementById("category-picker-grid");
  if (!grid) return;
  grid.innerHTML = "";
  QUIZ_CATEGORY_IDS.forEach((cid) => {
    const n = vocabIndicesInCategory(cid).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card";
    btn.innerHTML =
      `<span class="category-card-title">${escapeHtml(QUIZ_CATEGORY_LABELS[cid] || cid)}</span>` +
      `<div class="category-card-meta">本主题词条：${n} 个（本轮仅抽该类）</div>`;
    btn.addEventListener("click", () => startCategorySpell(cid));
    grid.appendChild(btn);
  });
}

document.getElementById("category-picker-back").addEventListener("click", () => {
  hideRoundComplete();
  showView("home");
});
