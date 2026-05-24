/* ===== 首字母模式（每轮 20） ===== */
let firstQueue = [];
let firstPos = 0;
let firstCurrent = null;
let firstRoundCorrect = 0;
let firstCountedThisQuestion = false;

const firstImg = document.getElementById("first-img");
const firstInput = document.getElementById("first-input");
const firstMsg = document.getElementById("first-msg");
const firstStats = document.getElementById("first-stats");
const firstAnswerLine = document.getElementById("first-answer-line");
const firstStreakEl = document.getElementById("first-streak");
const firstContinue = document.getElementById("first-continue");
const firstDotsEl = document.getElementById("first-dots");

function updateFirstStats() {
  const n = firstQueue.length;
  if (!n) {
    firstStats.textContent = "";
    renderRoundDots(firstDotsEl, 0, 0);
    return;
  }
  firstStats.textContent = `第 ${firstPos + 1} / ${n} 题 · 本轮答对 ${firstRoundCorrect} 题`;
  renderRoundDots(firstDotsEl, firstPos, n);
}

function advanceFirstQuestion() {
  if (firstContinue) firstContinue.classList.add("hidden");
  firstPos += 1;
  firstCountedThisQuestion = false;
  firstMsg.classList.add("hidden");
  firstInput.value = "";
  firstAnswerLine.classList.add("hidden");
  if (firstPos >= firstQueue.length) {
    showRoundComplete("first", firstRoundCorrect, firstQueue.length);
    firstCurrent = null;
    return;
  }
  firstCurrent = VOCAB[firstQueue[firstPos]];
  setImageWithFade(firstImg, firstCurrent.file, firstCurrent.word);
  firstInput.focus();
  updateFirstStats();
}

function nextFirstWord() {
  if (!firstCurrent) return;
  markWordSeen(firstCurrent.word);
  updateStreakLine(firstStreakEl, false);
  advanceFirstQuestion();
}

function checkFirst() {
  if (!firstCurrent) return;
  const raw = firstInput.value.trim();
  if (!raw) {
    firstMsg.textContent = "请输入至少一个字符。";
    firstMsg.className = "msg bad";
    firstMsg.classList.remove("hidden");
    return;
  }
  const g = raw.charAt(0).toLowerCase();
  const target = firstCurrent.word.charAt(0).toLowerCase();
  if (g === target) {
    markWordSeen(firstCurrent.word);
    firstRoundCorrect += 1;
    updateStreakLine(firstStreakEl, true);
    onAnswerCorrectFx();
    firstMsg.classList.add("hidden");
    showPraiseToast(praiseForToast());
    if (isAutoNext()) {
      setTimeout(() => advanceFirstQuestion(), 650);
    } else if (firstContinue) {
      firstContinue.classList.remove("hidden");
    } else {
      setTimeout(() => advanceFirstQuestion(), 900);
    }
    return;
  }
  if (!firstCountedThisQuestion) {
    firstCountedThisQuestion = true;
    updateStreakLine(firstStreakEl, false);
  }
  firstMsg.textContent = "不对，再试一次。";
  firstMsg.className = "msg bad";
  firstMsg.classList.remove("hidden");
}

function startFirst() {
  if (firstContinue) firstContinue.classList.add("hidden");
  firstQueue = buildRoundQueueIndices();
  firstPos = 0;
  firstRoundCorrect = 0;
  firstCountedThisQuestion = false;
  resetStreakLine([firstStreakEl]);
  showView("first");
  if (!firstQueue.length) {
    firstStats.textContent = "词表为空";
    return;
  }
  firstCurrent = VOCAB[firstQueue[firstPos]];
  firstMsg.classList.add("hidden");
  firstInput.value = "";
  firstAnswerLine.classList.add("hidden");
  setImageWithFade(firstImg, firstCurrent.file, firstCurrent.word);
  updateFirstStats();
  firstInput.focus();
}

document.getElementById("first-submit").addEventListener("click", checkFirst);
document.getElementById("first-skip").addEventListener("click", nextFirstWord);
document.getElementById("first-show-answer").addEventListener("click", () => {
  if (!firstCurrent) return;
  firstAnswerLine.textContent = `答案：${firstCurrent.word}`;
  firstAnswerLine.classList.remove("hidden");
});
document.getElementById("first-add-wordbook").addEventListener("click", () => {
  if (!firstCurrent) return;
  const added = addToWordbook(firstCurrent.word);
  firstMsg.textContent = added ? "已加入生词本。" : "该单词已在生词本中。";
  firstMsg.className = added ? "msg ok" : "msg bad";
  firstMsg.classList.remove("hidden");
});
firstInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") { ev.preventDefault(); checkFirst(); }
});
if (firstContinue) {
  firstContinue.addEventListener("click", () => advanceFirstQuestion());
}
