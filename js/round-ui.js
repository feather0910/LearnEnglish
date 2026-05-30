const roundOverlay = document.getElementById("round-overlay");
const roundOverlayBody = document.getElementById("round-overlay-body");
const roundOverlayInner = document.querySelector(".round-overlay-inner");
const roundOverlayTitleEl = document.getElementById("round-overlay-title");
let roundOverlayMode = null;

function renderRoundDots(container, pos, total) {
  if (!container) return;
  if (!total) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = "";
  const cap = Math.min(total, 40);
  for (let i = 0; i < cap; i += 1) {
    const dot = document.createElement("span");
    dot.className = "round-dot";
    if (i < pos) dot.classList.add("done");
    else if (i === pos) dot.classList.add("current");
    else dot.classList.add("upcoming");
    dot.title = `第 ${i + 1} 题`;
    container.appendChild(dot);
  }
}

function showRoundComplete(mode, correct, total) {
  roundOverlayMode = mode;
  let title = "本轮完成";
  let tier = "is-retry";
  let confScale = 1.35;
  if (total > 0) {
    const r = correct / total;
    if (correct === total) {
      title = "太棒了！";
      tier = "is-great";
      confScale = 2.1;
    } else if (r >= 0.7) {
      title = "很不错！";
      tier = "is-ok";
      confScale = 1.75;
    }
  }
  if (roundOverlayInner) {
    roundOverlayInner.classList.remove("is-great", "is-ok", "is-retry");
    roundOverlayInner.classList.add(tier);
  }
  if (roundOverlayTitleEl) roundOverlayTitleEl.textContent = title;
  if (roundOverlayBody) {
    roundOverlayBody.textContent = `答对 ${correct} / ${total} 题。`;
  }
  spawnConfetti(confScale);
  if (roundOverlay) roundOverlay.classList.remove("hidden");
}

function hideRoundComplete() {
  if (roundOverlay) roundOverlay.classList.add("hidden");
  roundOverlayMode = null;
  if (roundOverlayInner) roundOverlayInner.classList.remove("is-great", "is-ok", "is-retry");
}

const roundOverlayHomeBtn = document.getElementById("round-overlay-home");
const roundOverlayAgainBtn = document.getElementById("round-overlay-again");
if (roundOverlayHomeBtn) {
  roundOverlayHomeBtn.addEventListener("click", () => {
    hideRoundComplete();
    showView("home");
  });
}
if (roundOverlayAgainBtn) {
  roundOverlayAgainBtn.addEventListener("click", () => {
    const m = roundOverlayMode;
    hideRoundComplete();
    if (m === "quizWord") startQuizWord();
    else if (m === "quizImage") startQuizImage();
    else if (m === "spell") startSpell();
    else if (m === "first") startFirst();
    else if (m === "categorySpell" && lastCategorySpellId) startCategorySpell(lastCategorySpellId);
    else if (m === "reviewFocusSpell" && lastReviewFocusGroupId) startReviewFocusSpell(lastReviewFocusGroupId);
  });
}
