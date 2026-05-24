/* ===== 分类拼写（按主题） ===== */
let categorySpellQueue = [];
let categorySpellPos = 0;
let categorySpellCurrent = null;
let categorySpellRoundCorrect = 0;
let categorySpellCountedThisQuestion = false;

const categorySpellImg = document.getElementById("category-spell-img");
const categorySpellEmoji = document.getElementById("category-spell-emoji");
const categorySpellZh = document.getElementById("category-spell-zh");
const categorySpellInput = document.getElementById("category-spell-input");
const categorySpellMsg = document.getElementById("category-spell-msg");
const categorySpellStats = document.getElementById("category-spell-stats");
const categorySpellAnswerLine = document.getElementById("category-spell-answer-line");
const categorySpellStreakEl = document.getElementById("category-spell-streak");
const categorySpellContinue = document.getElementById("category-spell-continue");
const categorySpellDotsEl = document.getElementById("category-spell-dots");

document.getElementById("category-spell-back").addEventListener("click", () => {
  hideRoundComplete();
  openCategoryPicker();
});

function updateCategorySpellStats() {
  const n = categorySpellQueue.length;
  if (!n) {
    categorySpellStats.textContent = "";
    renderRoundDots(categorySpellDotsEl, 0, 0);
    return;
  }
  const label = QUIZ_CATEGORY_LABELS[lastCategorySpellId] || "";
  categorySpellStats.textContent =
    `${label ? `「${label}」· ` : ""}第 ${categorySpellPos + 1} / ${n} 题 · 本轮答对 ${categorySpellRoundCorrect} 题`;
  renderRoundDots(categorySpellDotsEl, categorySpellPos, n);
}

function renderCategorySpellQuestion() {
  categorySpellCurrent = VOCAB[categorySpellQueue[categorySpellPos]];
  const zhRaw = categorySpellCurrent.zh != null ? String(categorySpellCurrent.zh).trim() : "";
  categorySpellZh.textContent = zhRaw || "（暂无中文释义）";
  showEntryMedia(categorySpellImg, categorySpellEmoji, categorySpellCurrent);
  categorySpellInput.focus();
  updateCategorySpellStats();
}

function advanceCategorySpellQuestion() {
  if (categorySpellContinue) categorySpellContinue.classList.add("hidden");
  categorySpellPos += 1;
  categorySpellCountedThisQuestion = false;
  categorySpellMsg.classList.add("hidden");
  categorySpellInput.value = "";
  categorySpellAnswerLine.classList.add("hidden");
  if (categorySpellPos >= categorySpellQueue.length) {
    showRoundComplete("categorySpell", categorySpellRoundCorrect, categorySpellQueue.length);
    categorySpellCurrent = null;
    return;
  }
  renderCategorySpellQuestion();
}

function nextCategorySpellWord() {
  if (!categorySpellCurrent) return;
  markWordSeen(categorySpellCurrent.word);
  updateStreakLine(categorySpellStreakEl, false);
  advanceCategorySpellQuestion();
}

function checkCategorySpell() {
  if (!categorySpellCurrent) return;
  const guess = normalizeSpellAnswer(categorySpellInput.value);
  const target = normalizeSpellAnswer(categorySpellCurrent.word);
  if (guess === target) {
    markWordSeen(categorySpellCurrent.word);
    categorySpellRoundCorrect += 1;
    updateStreakLine(categorySpellStreakEl, true);
    onAnswerCorrectFx();
    categorySpellMsg.classList.add("hidden");
    showPraiseToast(praiseForToast());
    if (isAutoNext()) {
      setTimeout(() => advanceCategorySpellQuestion(), 650);
    } else if (categorySpellContinue) {
      categorySpellContinue.classList.remove("hidden");
    } else {
      setTimeout(() => advanceCategorySpellQuestion(), 900);
    }
    return;
  }
  if (!categorySpellCountedThisQuestion) {
    categorySpellCountedThisQuestion = true;
    updateStreakLine(categorySpellStreakEl, false);
  }
  categorySpellMsg.textContent = "不对，再试一次。";
  categorySpellMsg.className = "msg bad";
  categorySpellMsg.classList.remove("hidden");
}

function startCategorySpell(catId) {
  lastCategorySpellId = catId;
  if (categorySpellContinue) categorySpellContinue.classList.add("hidden");
  categorySpellQueue = buildCategorySpellQueue(catId);
  categorySpellPos = 0;
  categorySpellRoundCorrect = 0;
  categorySpellCountedThisQuestion = false;
  resetStreakLine([categorySpellStreakEl]);
  showView("categorySpell");
  if (!categorySpellQueue.length) {
    categorySpellStats.textContent = "暂无题目";
    return;
  }
  categorySpellMsg.classList.add("hidden");
  categorySpellInput.value = "";
  categorySpellAnswerLine.classList.add("hidden");
  renderCategorySpellQuestion();
}

document.getElementById("category-spell-submit").addEventListener("click", checkCategorySpell);
document.getElementById("category-spell-skip").addEventListener("click", nextCategorySpellWord);
document.getElementById("category-spell-show-answer").addEventListener("click", () => {
  if (!categorySpellCurrent) return;
  categorySpellAnswerLine.textContent = `答案：${categorySpellCurrent.word}`;
  categorySpellAnswerLine.classList.remove("hidden");
});
document.getElementById("category-spell-add-wordbook").addEventListener("click", () => {
  if (!categorySpellCurrent) return;
  const added = addToWordbook(categorySpellCurrent.word);
  categorySpellMsg.textContent = added ? "已加入生词本。" : "该单词已在生词本中。";
  categorySpellMsg.className = added ? "msg ok" : "msg bad";
  categorySpellMsg.classList.remove("hidden");
});
categorySpellInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") { ev.preventDefault(); checkCategorySpell(); }
});
if (categorySpellContinue) {
  categorySpellContinue.addEventListener("click", () => advanceCategorySpellQuestion());
}
