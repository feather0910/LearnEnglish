/* ===== 看图选词（每轮 20） ===== */
let quizWordQueue = [];
let quizWordPos = 0;
let quizWordRoundCorrect = 0;
let quizWordAnswered = false;
let quizWordCurrent = null;

const quizWordImg = document.getElementById("quiz-word-img");
const quizWordOptions = document.getElementById("quiz-word-options");
const quizWordMsg = document.getElementById("quiz-word-msg");
const quizWordNext = document.getElementById("quiz-word-next");
const quizWordStatsEl = document.getElementById("quiz-word-stats");
const quizWordStreakEl = document.getElementById("quiz-word-streak");
const quizWordDotsEl = document.getElementById("quiz-word-dots");

function updateQuizWordStats() {
  const n = quizWordQueue.length;
  if (!n) {
    quizWordStatsEl.textContent = "";
    renderRoundDots(quizWordDotsEl, 0, 0);
    return;
  }
  quizWordStatsEl.textContent = `第 ${quizWordPos + 1} / ${n} 题 · 本轮答对 ${quizWordRoundCorrect} 题`;
  renderRoundDots(quizWordDotsEl, quizWordPos, n);
}

function buildQuizWordQuestion() {
  if (quizWordPos >= quizWordQueue.length) {
    showRoundComplete("quizWord", quizWordRoundCorrect, quizWordQueue.length);
    return;
  }
  quizWordAnswered = false;
  quizWordMsg.classList.add("hidden");
  quizWordNext.classList.add("hidden");
  quizWordOptions.innerHTML = "";

  const idx = quizWordQueue[quizWordPos];
  quizWordCurrent = VOCAB[idx];
  setImageWithFade(quizWordImg, quizWordCurrent.file, quizWordCurrent.word);

  const need = Math.min(3, Math.max(0, coreVocabIndices().length - 1));
  const wrong = pickDistinctWords(quizWordCurrent.word, need);
  const choices = shuffleInPlace([quizWordCurrent.word, ...wrong]);

  choices.forEach((w) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "option";
    b.dataset.word = w;
    b.textContent = w;
    b.addEventListener("click", () => onQuizWordPick(w, b));
    quizWordOptions.appendChild(b);
  });
  updateQuizWordStats();
}

function advanceQuizWord() {
  quizWordPos += 1;
  if (quizWordPos >= quizWordQueue.length) {
    showRoundComplete("quizWord", quizWordRoundCorrect, quizWordQueue.length);
    return;
  }
  buildQuizWordQuestion();
}

function onQuizWordPick(word, btn) {
  if (quizWordAnswered || !quizWordCurrent) return;
  const ok = word === quizWordCurrent.word;
  if (!ok) {
    updateStreakLine(quizWordStreakEl, false);
    btn.disabled = true;
    btn.classList.add("wrong");
    quizWordMsg.textContent = "再想想，点别的选项再试一次！";
    quizWordMsg.className = "msg bad";
    quizWordMsg.classList.remove("hidden");
    return;
  }

  quizWordAnswered = true;
  markWordSeen(quizWordCurrent.word);
  quizWordRoundCorrect += 1;
  updateStreakLine(quizWordStreakEl, true);
  onAnswerCorrectFx();

  quizWordOptions.querySelectorAll("button.option").forEach((el) => {
    el.disabled = true;
    if (el.dataset.word === quizWordCurrent.word) el.classList.add("correct");
  });
  quizWordMsg.classList.add("hidden");
  showPraiseToast(praiseForToast());
  updateQuizWordStats();

  if (isAutoNext()) {
    setTimeout(() => advanceQuizWord(), 750);
  } else {
    quizWordNext.classList.remove("hidden");
  }
}

function startQuizWord() {
  quizWordQueue = buildRoundQueueIndices();
  quizWordPos = 0;
  quizWordRoundCorrect = 0;
  resetStreakLine([quizWordStreakEl]);
  showView("quizWord");
  if (!quizWordQueue.length) {
    quizWordStatsEl.textContent = "词表为空";
    return;
  }
  buildQuizWordQuestion();
}

quizWordNext.addEventListener("click", advanceQuizWord);

bindSpeakButton(document.getElementById("quiz-word-speak"), () =>
  quizWordCurrent ? quizWordCurrent.word : ""
);
