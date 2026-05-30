/* ===== 看词选图（每轮 20） ===== */
let quizImageQueue = [];
let quizImagePos = 0;
let quizImageRoundCorrect = 0;
let quizImageAnswered = false;
let quizImageAnswerIdx = -1;

const quizImagePrompt = document.getElementById("quiz-image-prompt");
const quizImageOptions = document.getElementById("quiz-image-options");
const quizImageMsg = document.getElementById("quiz-image-msg");
const quizImageNext = document.getElementById("quiz-image-next");
const quizImageStatsEl = document.getElementById("quiz-image-stats");
const quizImageStreakEl = document.getElementById("quiz-image-streak");
const quizImageDotsEl = document.getElementById("quiz-image-dots");

function updateQuizImageStats() {
  const n = quizImageQueue.length;
  if (!n) {
    quizImageStatsEl.textContent = "";
    renderRoundDots(quizImageDotsEl, 0, 0);
    return;
  }
  quizImageStatsEl.textContent = `第 ${quizImagePos + 1} / ${n} 题 · 本轮答对 ${quizImageRoundCorrect} 题`;
  renderRoundDots(quizImageDotsEl, quizImagePos, n);
}

function buildQuizImageQuestion() {
  if (quizImagePos >= quizImageQueue.length) {
    showRoundComplete("quizImage", quizImageRoundCorrect, quizImageQueue.length);
    return;
  }
  quizImageAnswered = false;
  quizImageMsg.classList.add("hidden");
  quizImageNext.classList.add("hidden");
  quizImageOptions.innerHTML = "";

  const idx = quizImageQueue[quizImagePos];
  quizImageAnswerIdx = idx;
  const cur = VOCAB[idx];
  quizImagePrompt.textContent = cur.word;

  const need = Math.min(3, Math.max(0, coreVocabIndices().length - 1));
  const wrongIdx = pickDistinctIndices(idx, need);
  const choiceIdxs = shuffleInPlace([idx, ...wrongIdx]);

  choiceIdxs.forEach((ci) => {
    const ent = VOCAB[ci];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "option-image";
    b.dataset.vocabIdx = String(ci);
    const im = document.createElement("img");
    im.src = ent.file;
    im.alt = "";
    b.appendChild(im);
    b.addEventListener("click", () => onQuizImagePick(ci, b));
    quizImageOptions.appendChild(b);
  });
  updateQuizImageStats();
}

function advanceQuizImage() {
  quizImagePos += 1;
  if (quizImagePos >= quizImageQueue.length) {
    showRoundComplete("quizImage", quizImageRoundCorrect, quizImageQueue.length);
    return;
  }
  buildQuizImageQuestion();
}

function onQuizImagePick(pickedIdx, btn) {
  if (quizImageAnswered || quizImageAnswerIdx < 0) return;
  const ok = pickedIdx === quizImageAnswerIdx;
  const curWord = VOCAB[quizImageAnswerIdx].word;
  if (!ok) {
    updateStreakLine(quizImageStreakEl, false);
    btn.disabled = true;
    btn.classList.add("wrong");
    quizImageMsg.textContent = "再想想，换一张图点点看！";
    quizImageMsg.className = "msg bad";
    quizImageMsg.classList.remove("hidden");
    return;
  }

  quizImageAnswered = true;
  markWordSeen(curWord);
  quizImageRoundCorrect += 1;
  updateStreakLine(quizImageStreakEl, true);
  onAnswerCorrectFx();

  quizImageOptions.querySelectorAll("button.option-image").forEach((el) => {
    el.disabled = true;
    if (Number(el.dataset.vocabIdx) === quizImageAnswerIdx) el.classList.add("correct");
  });
  quizImageMsg.classList.add("hidden");
  showPraiseToast(praiseForToast());
  updateQuizImageStats();

  if (isAutoNext()) {
    setTimeout(() => advanceQuizImage(), 750);
  } else {
    quizImageNext.classList.remove("hidden");
  }
}

function startQuizImage() {
  quizImageQueue = buildRoundQueueIndices();
  quizImagePos = 0;
  quizImageRoundCorrect = 0;
  resetStreakLine([quizImageStreakEl]);
  showView("quizImage");
  if (!quizImageQueue.length) {
    quizImageStatsEl.textContent = "词表为空";
    return;
  }
  buildQuizImageQuestion();
}

quizImageNext.addEventListener("click", advanceQuizImage);

bindSpeakButton(document.getElementById("quiz-image-speak"), () => {
  if (quizImageAnswerIdx < 0) return "";
  return VOCAB[quizImageAnswerIdx].word;
});
