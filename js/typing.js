/* ===== 字母泡泡（打字练习第一版） ===== */
const TYPING_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const TYPING_HIGHSCORE_KEY = "pk_typing_highscore_v1";
const TYPING_ROUND_SEC = 60;
const TYPING_MAX_BUBBLES = 3;
const TYPING_MAX_LIVES = 3;
const TYPING_BASE_SCORE = 10;
const TYPING_GOLDEN_SCORE = 20;
const TYPING_GOLDEN_EVERY = 10;

const BUBBLE_COLORS = [
  "#fff7ed", "#eff6ff", "#f0fdf4", "#fdf4ff", "#fef9c3", "#fce7f3", "#ecfeff",
];

const typingHud = document.getElementById("typing-hud");
const typingArena = document.getElementById("typing-arena");
const typingBubblesEl = document.getElementById("typing-bubbles");
const typingInput = document.getElementById("typing-input");
const typingMsg = document.getElementById("typing-msg");
const typingStart = document.getElementById("typing-start");
const typingEnd = document.getElementById("typing-end");
const typingScoreEl = document.getElementById("typing-score");
const typingStreakEl = document.getElementById("typing-streak");
const typingLivesEl = document.getElementById("typing-lives");
const typingTimeEl = document.getElementById("typing-time");
const typingBestEl = document.getElementById("typing-best");
const typingEndBody = document.getElementById("typing-end-body");

let typingState = "idle";
let typingBubbles = [];
let typingBubbleId = 0;
let typingScore = 0;
let typingStreak = 0;
let typingBestStreak = 0;
let typingHits = 0;
let typingLives = TYPING_MAX_LIVES;
let typingTimeLeft = TYPING_ROUND_SEC;
let typingLastLetter = "";
let typingSpawnTimer = null;
let typingCountdownTimer = null;
let typingAnimFrame = null;
let typingLastFrame = 0;
let typingFallSpeed = 42;
let typingSpawnMs = 2000;
let typingElapsed = 0;
let typingNextGolden = false;
let typingWrongTimer = null;
let typingDifficultyTier = 0;

function loadTypingHighscore() {
  try {
    const n = Number(localStorage.getItem(TYPING_HIGHSCORE_KEY));
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function saveTypingHighscore(score) {
  try {
    localStorage.setItem(TYPING_HIGHSCORE_KEY, String(score));
  } catch { /* ignore */ }
}

function heartsText(n) {
  return `${"♥".repeat(Math.max(0, n))}${"♡".repeat(Math.max(0, TYPING_MAX_LIVES - n))}`;
}

function hideTypingMsg() {
  if (!typingMsg) return;
  typingMsg.textContent = "";
  typingMsg.className = "msg hidden";
}

function showTypingMsg(text, ok) {
  if (!typingMsg) return;
  typingMsg.textContent = text;
  typingMsg.className = ok ? "msg ok" : "msg bad";
  typingMsg.classList.remove("hidden");
}

function pickTypingLetter() {
  let letter = TYPING_LETTERS[randomInt(TYPING_LETTERS.length)];
  let guard = 0;
  while (letter === typingLastLetter && guard < 8) {
    letter = TYPING_LETTERS[randomInt(TYPING_LETTERS.length)];
    guard += 1;
  }
  typingLastLetter = letter;
  return letter;
}

function renderTypingHud() {
  if (typingScoreEl) typingScoreEl.textContent = String(typingScore);
  if (typingStreakEl) typingStreakEl.textContent = String(typingStreak);
  if (typingLivesEl) typingLivesEl.textContent = heartsText(typingLives);
  if (typingTimeEl) typingTimeEl.textContent = String(Math.max(0, Math.ceil(typingTimeLeft)));
}

function createTypingBubbleEl(bubble) {
  const el = document.createElement("div");
  el.className = "typing-bubble";
  if (bubble.golden) el.classList.add("is-golden");
  el.textContent = bubble.letter;
  el.style.left = `${bubble.x}%`;
  el.style.top = `${bubble.y}px`;
  el.style.background = bubble.color;
  el.dataset.id = String(bubble.id);
  typingBubblesEl.appendChild(el);
  bubble.el = el;
}

function spawnTypingBubble() {
  if (typingState !== "playing") return;
  if (typingBubbles.length >= TYPING_MAX_BUBBLES) return;
  const golden = typingNextGolden;
  typingNextGolden = false;
  const bubble = {
    id: ++typingBubbleId,
    letter: pickTypingLetter(),
    x: 8 + randomInt(74),
    y: -56,
    speed: typingFallSpeed * (0.92 + Math.random() * 0.16),
    golden,
    color: golden ? "#fef08a" : BUBBLE_COLORS[randomInt(BUBBLE_COLORS.length)],
    el: null,
  };
  typingBubbles.push(bubble);
  createTypingBubbleEl(bubble);
}

function removeTypingBubble(bubble, popped) {
  const idx = typingBubbles.indexOf(bubble);
  if (idx >= 0) typingBubbles.splice(idx, 1);
  if (!bubble.el) return;
  if (popped) {
    bubble.el.classList.add("is-popping");
    setTimeout(() => bubble.el.remove(), 220);
  } else {
    bubble.el.classList.add("is-missed");
    setTimeout(() => bubble.el.remove(), 280);
  }
}

function popTypingBubble(bubble) {
  const points = bubble.golden ? TYPING_GOLDEN_SCORE : TYPING_BASE_SCORE;
  typingScore += points;
  typingHits += 1;
  typingStreak += 1;
  if (typingStreak > typingBestStreak) typingBestStreak = typingStreak;
  removeTypingBubble(bubble, true);
  renderTypingHud();
  hideTypingMsg();

  let toast = praiseForToast();
  if (typingStreak === 3) toast = "三连击！";
  else if (typingStreak === 5) {
    toast = "五连闪！";
    spawnConfetti(1.2);
  } else if (typingStreak === 10) {
    toast = "十全十美！";
    spawnConfetti(1.8);
  } else if (bubble.golden) {
    toast = "金色泡泡！";
    spawnConfetti(1.4);
  }
  showPraiseToast(toast);

  if (typingHits % TYPING_GOLDEN_EVERY === 0) typingNextGolden = true;
}

function missTypingBubble(bubble) {
  removeTypingBubble(bubble, false);
  typingLives -= 1;
  typingStreak = 0;
  renderTypingHud();
  showTypingMsg("泡泡落地了，注意快一点！", false);
  if (typingLives <= 0) endTypingGame();
}

function findTypingBubbleForLetter(letter) {
  let chosen = null;
  let maxY = -Infinity;
  typingBubbles.forEach((b) => {
    if (b.letter !== letter) return;
    if (b.y > maxY) {
      maxY = b.y;
      chosen = b;
    }
  });
  return chosen;
}

function handleTypingKey(letter) {
  if (typingState !== "playing") return;
  const bubble = findTypingBubbleForLetter(letter);
  if (!bubble) {
    typingStreak = 0;
    renderTypingHud();
    showTypingMsg(`当前没有「${letter}」泡泡哦`, false);
    if (typingWrongTimer) clearTimeout(typingWrongTimer);
    typingWrongTimer = setTimeout(hideTypingMsg, 900);
    return;
  }
  popTypingBubble(bubble);
}

function typingTick(now) {
  if (typingState !== "playing") return;
  if (!typingLastFrame) typingLastFrame = now;
  const dt = Math.min(0.05, (now - typingLastFrame) / 1000);
  typingLastFrame = now;
  typingElapsed += dt;

  const arenaH = typingArena ? typingArena.clientHeight : 320;
  const limitY = arenaH - 48;

  typingBubbles.slice().forEach((bubble) => {
    bubble.y += bubble.speed * dt;
    if (bubble.el) bubble.el.style.top = `${bubble.y}px`;
    if (bubble.y >= limitY) missTypingBubble(bubble);
  });

  if (typingElapsed >= 15 && typingDifficultyTier < 1) {
    typingDifficultyTier = 1;
    typingSpawnMs = 1500;
    typingFallSpeed = 50;
    scheduleTypingSpawn();
  } else if (typingElapsed >= 30 && typingDifficultyTier < 2) {
    typingDifficultyTier = 2;
    typingSpawnMs = 1200;
    typingFallSpeed = 58;
    scheduleTypingSpawn();
  } else if (typingElapsed >= 45 && typingDifficultyTier < 3) {
    typingDifficultyTier = 3;
    typingSpawnMs = 1000;
    typingFallSpeed = 66;
    scheduleTypingSpawn();
  }

  typingAnimFrame = requestAnimationFrame(typingTick);
}

function scheduleTypingSpawn() {
  if (typingSpawnTimer) clearInterval(typingSpawnTimer);
  typingSpawnTimer = setInterval(() => {
    if (typingState === "playing") spawnTypingBubble();
  }, typingSpawnMs);
}

function scheduleTypingCountdown() {
  if (typingCountdownTimer) clearInterval(typingCountdownTimer);
  typingCountdownTimer = setInterval(() => {
    if (typingState !== "playing") return;
    typingTimeLeft -= 1;
    renderTypingHud();
    if (typingTimeLeft <= 0) endTypingGame();
  }, 1000);
}

function focusTypingInput() {
  if (!typingInput) return;
  typingInput.value = "";
  typingInput.focus({ preventScroll: true });
}

function resetTypingRound() {
  typingBubbles.forEach((b) => b.el?.remove());
  typingBubbles = [];
  typingScore = 0;
  typingStreak = 0;
  typingBestStreak = 0;
  typingHits = 0;
  typingLives = TYPING_MAX_LIVES;
  typingTimeLeft = TYPING_ROUND_SEC;
  typingLastLetter = "";
  typingFallSpeed = 42;
  typingSpawnMs = 2000;
  typingElapsed = 0;
  typingLastFrame = 0;
  typingNextGolden = false;
  typingDifficultyTier = 0;
  hideTypingMsg();
  renderTypingHud();
}

function startTypingGame() {
  resetTypingRound();
  typingState = "playing";
  if (typingStart) typingStart.classList.add("hidden");
  if (typingEnd) typingEnd.classList.add("hidden");
  if (typingHud) typingHud.classList.remove("hidden");
  if (typingArena) typingArena.classList.remove("hidden");
  scheduleTypingSpawn();
  scheduleTypingCountdown();
  spawnTypingBubble();
  typingAnimFrame = requestAnimationFrame(typingTick);
  focusTypingInput();
}

function stopTypingTimers() {
  if (typingSpawnTimer) {
    clearInterval(typingSpawnTimer);
    typingSpawnTimer = null;
  }
  if (typingCountdownTimer) {
    clearInterval(typingCountdownTimer);
    typingCountdownTimer = null;
  }
  if (typingAnimFrame) {
    cancelAnimationFrame(typingAnimFrame);
    typingAnimFrame = null;
  }
}

function endTypingGame() {
  if (typingState === "ended") return;
  typingState = "ended";
  stopTypingTimers();
  typingBubbles.forEach((b) => b.el?.remove());
  typingBubbles = [];

  const prevBest = loadTypingHighscore();
  const isNewBest = typingScore > prevBest;
  if (isNewBest) saveTypingHighscore(typingScore);
  if (typingBestEl) typingBestEl.textContent = String(loadTypingHighscore());

  if (typingEndBody) {
    typingEndBody.textContent = [
      `得分：${typingScore}${isNewBest ? "（新纪录！）" : ""}`,
      `打对字母：${typingHits} 个`,
      `最高连击：${typingBestStreak}`,
    ].join("\n");
  }
  if (typingEnd) typingEnd.classList.remove("hidden");
  if (typingScore >= 100) spawnConfetti(1.5);
}

document.getElementById("typing-start-btn")?.addEventListener("click", startTypingGame);
document.getElementById("typing-again-btn")?.addEventListener("click", startTypingGame);

typingInput?.addEventListener("keydown", (e) => {
  if (typingState !== "playing") return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : "";
  if (key >= "a" && key <= "z") {
    e.preventDefault();
    handleTypingKey(key);
    typingInput.value = "";
  }
});

document.addEventListener("keydown", (e) => {
  if (typingState !== "playing") return;
  if (document.activeElement === typingInput) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : "";
  if (key >= "a" && key <= "z") {
    e.preventDefault();
    handleTypingKey(key);
  }
});

typingArena?.addEventListener("click", focusTypingInput);

if (typingBestEl) typingBestEl.textContent = String(loadTypingHighscore());
