/* ===== 卡片模式 ===== */
let flashOrder = [];
let flashPos = 0;
let flashReveal = false;
let flashFilterLetter = null;

const flashImg   = document.getElementById("flash-img");
const flashFigure = document.getElementById("flash-figure");
const flashWord  = document.getElementById("flash-word");
const flashZh    = document.getElementById("flash-zh");
const flashStats = document.getElementById("flash-stats");
const flashProgress = document.getElementById("flash-progress");
const flashAlphabet = document.getElementById("flash-alphabet");

for (let i = 0; i < 26; i += 1) {
  const ch = String.fromCharCode(65 + i);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "flash-letter";
  b.dataset.letter = ch;
  b.textContent = ch;
  b.addEventListener("click", onFlashLetterClick);
  flashAlphabet.appendChild(b);
}

function firstFlashLetter(word) {
  const t = (word || "").trim();
  if (!t) return "";
  const c = t.charAt(0).toLowerCase();
  return /[a-z]/.test(c) ? c : "";
}

function buildFlashOrder() {
  const all = coreVocabIndices();
  const letter = flashFilterLetter ? flashFilterLetter.toLowerCase() : null;
  const pool = letter
    ? all.filter((idx) => firstFlashLetter(VOCAB[idx].word) === letter)
    : all.slice();
  shuffleInPlace(pool);
  return pool;
}

function syncFlashLetterButtons() {
  flashAlphabet.querySelectorAll("button.flash-letter").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.letter === flashFilterLetter);
  });
}

function onFlashLetterClick(ev) {
  const btn = ev.target.closest("button.flash-letter");
  if (!btn) return;
  const L = btn.dataset.letter;
  if (flashFilterLetter === L) flashFilterLetter = null;
  else flashFilterLetter = L;
  syncFlashLetterButtons();
  const next = buildFlashOrder();
  if (!next.length) {
    flashFilterLetter = null;
    syncFlashLetterButtons();
    flashOrder = buildFlashOrder();
    flashPos = 0;
    flashReveal = false;
    renderFlash();
    flashStats.textContent = "该首字母下暂无单词，已取消筛选。";
    return;
  }
  flashOrder = next;
  flashPos = 0;
  flashReveal = false;
  renderFlash();
}

function renderFlash() {
  if (!flashOrder.length) {
    flashWord.textContent = "";
    flashWord.dataset.word = "";
    flashWord.dataset.zh = "";
    flashWord.classList.add("concealed");
    flashWord.setAttribute("aria-hidden", "true");
    flashZh.textContent = "";
    flashZh.classList.add("concealed");
    flashStats.textContent = "当前没有可显示的卡片。";
    flashProgress.style.width = "0%";
    return;
  }
  const e = VOCAB[flashOrder[flashPos]];
  setImageWithFade(flashImg, e.file, e.word);
  flashWord.dataset.word = e.word;
  flashWord.dataset.zh = e.zh != null ? String(e.zh) : "";
  flashZh.dataset.zh = flashWord.dataset.zh;
  if (flashReveal) {
    flashWord.textContent = e.word;
    flashWord.classList.remove("concealed");
    flashWord.setAttribute("aria-hidden", "false");
    flashZh.textContent = flashZh.dataset.zh || "";
    flashZh.classList.remove("concealed");
  } else {
    flashWord.textContent = "";
    flashWord.classList.add("concealed");
    flashWord.setAttribute("aria-hidden", "true");
    flashZh.textContent = "";
    flashZh.classList.add("concealed");
  }
  flashStats.textContent = `第 ${flashPos + 1} / ${flashOrder.length} 张`;
  flashProgress.style.width = `${((flashPos + 1) / flashOrder.length) * 100}%`;
}

function startFlash() {
  flashFilterLetter = null;
  syncFlashLetterButtons();
  flashOrder = buildFlashOrder();
  flashPos = 0;
  flashReveal = false;
  showView("flash");
  renderFlash();
}

document.getElementById("flash-shuffle").addEventListener("click", () => {
  if (!flashOrder.length) return;
  shuffleInPlace(flashOrder);
  flashPos = 0;
  flashReveal = false;
  renderFlash();
});

document.getElementById("flash-prev").addEventListener("click", () => {
  if (!flashOrder.length) return;
  flashPos = (flashPos - 1 + flashOrder.length) % flashOrder.length;
  flashReveal = false;
  renderFlash();
});

document.getElementById("flash-next").addEventListener("click", () => {
  if (!flashOrder.length) return;
  flashPos = (flashPos + 1) % flashOrder.length;
  flashReveal = false;
  renderFlash();
});

function toggleFlashReveal() {
  if (!flashOrder.length) return;
  flashReveal = !flashReveal;
  const w = flashWord.dataset.word || "";
  const z = flashZh.dataset.zh || "";
  if (flashReveal) {
    flashWord.textContent = w;
    flashWord.classList.remove("concealed");
    flashWord.setAttribute("aria-hidden", "false");
    flashZh.textContent = z;
    flashZh.classList.remove("concealed");
    if (flashFigure) {
      flashFigure.classList.remove("flash-anim");
      void flashFigure.offsetWidth;
      flashFigure.classList.add("flash-anim");
      setTimeout(() => flashFigure.classList.remove("flash-anim"), 600);
    }
  } else {
    flashWord.textContent = "";
    flashWord.classList.add("concealed");
    flashWord.setAttribute("aria-hidden", "true");
    flashZh.textContent = "";
    flashZh.classList.add("concealed");
  }
}

flashWord.addEventListener("click", toggleFlashReveal);
flashZh.addEventListener("click", toggleFlashReveal);
flashImg.addEventListener("click",  toggleFlashReveal);

bindSpeakButton(document.getElementById("flash-speak"), () => {
  if (!flashOrder.length) return "";
  return VOCAB[flashOrder[flashPos]].word;
});

document.addEventListener("keydown", (ev) => {
  if (views.flash.classList.contains("hidden")) return;
  if (!flashOrder.length) return;
  if (ev.key === "ArrowLeft")  { ev.preventDefault(); document.getElementById("flash-prev").click(); }
  if (ev.key === "ArrowRight") { ev.preventDefault(); document.getElementById("flash-next").click(); }
  if (ev.key === " " || ev.code === "Space") {
    ev.preventDefault();
    toggleFlashReveal();
  }
});

function isAutoNext() {
  const el = document.getElementById("setting-auto-next");
  return !!(el && el.checked);
}
