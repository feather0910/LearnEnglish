const confettiRoot = document.getElementById("confetti-root");
function spawnConfetti(scale = 1) {
  if (!confettiRoot) return;
  const colors = ["#f97316", "#fb923c", "#22c55e", "#38bdf8", "#a855f7", "#f472b6", "#facc15"];
  const n = Math.max(10, Math.round(26 * scale));
  const durMul = scale >= 1.6 ? 1.12 : 1;
  for (let i = 0; i < n; i += 1) {
    const el = document.createElement("span");
    el.className = "confetti-piece";
    el.style.left = `${6 + Math.random() * 88}%`;
    el.style.background = colors[randomInt(colors.length)];
    el.style.setProperty("--dx", `${(Math.random() - 0.5) * (140 + 40 * scale)}px`);
    el.style.animationDuration = `${(0.85 + Math.random() * 0.35) * durMul}s`;
    confettiRoot.appendChild(el);
    setTimeout(() => el.remove(), 1300 + Math.round(200 * scale));
  }
}

const PRAISE_PHRASES = [
  "太棒了！", "又对了！", "小天才！", "好厉害！", "完全正确！", "真聪明！", "棒棒哒！", "答对啦！",
];
const STREAK_BONUS = { 3: "三连击！", 5: "五连闪！", 10: "十全十美！" };

function randomPraise() {
  const len = PRAISE_PHRASES.length;
  if (!len) return "答对了！";
  const i = Math.floor(Math.random() * len);
  return PRAISE_PHRASES[i] || "答对了！";
}

let praiseToastHideTimer = null;
function showPraiseToast(line) {
  const el = document.getElementById("praise-toast");
  if (!el) return;
  const text = (line && String(line).trim()) || "答对了！";
  if (praiseToastHideTimer) clearTimeout(praiseToastHideTimer);
  el.classList.remove("is-visible");
  el.textContent = text;
  void el.offsetWidth;
  el.classList.add("is-visible");
  praiseToastHideTimer = setTimeout(() => {
    el.classList.remove("is-visible");
    el.textContent = "";
    praiseToastHideTimer = null;
  }, 2200);
}

function praiseForToast() {
  return randomPraise();
}

let winAudioCtx = null;
function playWinBeep() {
  if (!loadSettings().soundOn) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!winAudioCtx) winAudioCtx = new AC();
    const ctx = winAudioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.12);
  } catch (_) { /* 部分环境禁用音频 */ }
}

function onAnswerCorrectFx() {
  spawnConfetti(1);
  playWinBeep();
}

let streakCount = 0;
function streakText() {
  if (streakCount <= 1) return "";
  return `连对 ${streakCount} 题`;
}
function updateStreakLine(el, ok) {
  if (!el) return;
  if (ok) {
    streakCount += 1;
  } else {
    streakCount = 0;
  }
  let t = streakText();
  if (ok && STREAK_BONUS[streakCount]) {
    t = t ? `${t} ${STREAK_BONUS[streakCount]}` : STREAK_BONUS[streakCount];
  }
  el.textContent = t;
}
function resetStreakLine(els) {
  streakCount = 0;
  (els || []).forEach((el) => { if (el) el.textContent = ""; });
}

let lastCategorySpellId = null;
