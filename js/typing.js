/* ===== 字母泡泡（从零基础循序渐进） ===== */
const TYPING_ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const TYPING_HIGHSCORE_KEY = "pk_typing_highscore_v1";
const TYPING_HISTORY_KEY = "pk_typing_history_v1";
const TYPING_HISTORY_MAX = 30;
const TYPING_BASE_SCORE = 10;
const TYPING_GOLDEN_SCORE = 20;
const TYPING_GOLDEN_EVERY = 10;
const TYPING_PAD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

const TYPING_DIFFICULTIES = {
  beginner: {
    id: "beginner",
    label: "入门",
    desc: "下落很慢，同屏少，生命多，适合零基础。",
    fallSpeed: 28,
    spawnMs: 2800,
    maxBubbles: 2,
    maxLives: 5,
    roundSec: 90,
    rampAt: [45],
    rampFall: 32,
    rampSpawn: 2400,
  },
  easy: {
    id: "easy",
    label: "轻松",
    desc: "节奏稍快一点，熟悉字母后再试。",
    fallSpeed: 36,
    spawnMs: 2200,
    maxBubbles: 2,
    maxLives: 4,
    roundSec: 75,
    rampAt: [40],
    rampFall: 42,
    rampSpawn: 1900,
  },
  normal: {
    id: "normal",
    label: "标准",
    desc: "经典节奏，同屏三个泡泡。",
    fallSpeed: 42,
    spawnMs: 2000,
    maxBubbles: 3,
    maxLives: 3,
    roundSec: 60,
    rampAt: [30],
    rampFall: 50,
    rampSpawn: 1600,
  },
  hard: {
    id: "hard",
    label: "挑战",
    desc: "更快更密，适合进阶练习。",
    fallSpeed: 55,
    spawnMs: 1400,
    maxBubbles: 4,
    maxLives: 3,
    roundSec: 60,
    rampAt: [25],
    rampFall: 64,
    rampSpawn: 1100,
  },
};

const TYPING_PRESET_GROUPS = [
  { id: "basics", label: "零基础" },
  { id: "blocks", label: "字母表" },
  { id: "rows", label: "键盘排" },
  { id: "mixup", label: "易混" },
  { id: "combo", label: "综合" },
];

const TYPING_LETTER_PRESETS = [
  { id: "vowels", group: "basics", label: "元音", letters: "aeiou" },
  { id: "first5", group: "basics", label: "前 5 个", letters: "abcde" },
  { id: "first10", group: "basics", label: "前 10 个", letters: "abcdefghij" },
  { id: "mid10", group: "basics", label: "后半入门", letters: "klmnopqrst" },
  { id: "last6", group: "basics", label: "末尾 6 个", letters: "uvwxyz" },
  { id: "ag", group: "blocks", label: "A–G", letters: "abcdefg" },
  { id: "hn", group: "blocks", label: "H–N", letters: "hijklmn" },
  { id: "ou", group: "blocks", label: "O–U", letters: "opqrstu" },
  { id: "vz", group: "blocks", label: "V–Z", letters: "vwxyz" },
  { id: "home", group: "rows", label: "中排", letters: "asdfghjkl" },
  { id: "homeL", group: "rows", label: "左手中排", letters: "asdfg" },
  { id: "homeR", group: "rows", label: "右手中排", letters: "hjkl" },
  { id: "top", group: "rows", label: "上排", letters: "qwertyuiop" },
  { id: "bottom", group: "rows", label: "下排", letters: "zxcvbnm" },
  { id: "leftAll", group: "rows", label: "左手全区", letters: "qwertasdfgzxcvb" },
  { id: "rightAll", group: "rows", label: "右手全区", letters: "yuiophjklnm" },
  { id: "nearL", group: "mixup", label: "邻键易混", letters: "asdewq" },
  { id: "mirror", group: "mixup", label: "镜像易混", letters: "fghjkl" },
  { id: "lookalike", group: "mixup", label: "形近字母", letters: "bdnpqm" },
  { id: "freq", group: "combo", label: "高频字母", letters: "etaoinsrhl" },
  { id: "consonants", group: "combo", label: "辅音入门", letters: "bcdfghjklmnpqrstvwxyz" },
  { id: "all", group: "combo", label: "全字母", letters: "abcdefghijklmnopqrstuvwxyz" },
];

const BUBBLE_COLORS = [
  "#fff7ed", "#eff6ff", "#f0fdf4", "#fdf4ff", "#fef9c3", "#fce7f3", "#ecfeff",
];

const typingHud = document.getElementById("typing-hud");
const typingArena = document.getElementById("typing-arena");
const typingBubblesEl = document.getElementById("typing-bubbles");
const typingInput = document.getElementById("typing-input");
const typingMsg = document.getElementById("typing-msg");
const typingSetup = document.getElementById("typing-setup");
const typingEnd = document.getElementById("typing-end");
const typingScoreEl = document.getElementById("typing-score");
const typingStreakEl = document.getElementById("typing-streak");
const typingLivesEl = document.getElementById("typing-lives");
const typingTimeEl = document.getElementById("typing-time");
const typingBestEl = document.getElementById("typing-best");
const typingEndBody = document.getElementById("typing-end-body");
const typingDiffLabel = document.getElementById("typing-diff-label");
const typingDiffBtns = document.getElementById("typing-diff-btns");
const typingDiffDesc = document.getElementById("typing-diff-desc");
const typingPresetGroups = document.getElementById("typing-preset-groups");
const typingPresetBtns = document.getElementById("typing-preset-btns");
const typingKeypad = document.getElementById("typing-keypad");
const typingKeysCount = document.getElementById("typing-keys-count");
const typingStartBtn = document.getElementById("typing-start-btn");
const typingHistoryList = document.getElementById("typing-history-list");
const typingHistoryEmpty = document.getElementById("typing-history-empty");
const typingMobileControls = document.getElementById("typing-mobile-controls");
const typingLetterPad = document.getElementById("typing-letter-pad");
const typingOpenKeyboardBtn = document.getElementById("typing-open-keyboard");

let typingState = "idle";
let typingBubbles = [];
let typingBubbleId = 0;
let typingScore = 0;
let typingStreak = 0;
let typingBestStreak = 0;
let typingHits = 0;
let typingMisses = 0;
let typingLives = 5;
let typingMaxLives = 5;
let typingTimeLeft = 90;
let typingRoundSec = 90;
let typingLastLetter = "";
let typingSpawnTimer = null;
let typingCountdownTimer = null;
let typingAnimFrame = null;
let typingLastFrame = 0;
let typingFallSpeed = 28;
let typingSpawnMs = 2800;
let typingMaxBubbles = 2;
let typingElapsed = 0;
let typingNextGolden = false;
let typingWrongTimer = null;
let typingRamped = false;
let typingLetterPool = "aeiou".split("");
let typingSelectedDifficulty = "beginner";
let typingSelectedGroup = "basics";
let typingSelectedPresetId = "vowels";
let typingSelectedLetters = new Set("aeiou".split(""));

function getDifficulty() {
  return TYPING_DIFFICULTIES[typingSelectedDifficulty] || TYPING_DIFFICULTIES.beginner;
}

function getPresetById(id) {
  return TYPING_LETTER_PRESETS.find((p) => p.id === id) || TYPING_LETTER_PRESETS[0];
}

function lettersFromSet(set) {
  return TYPING_ALPHABET.filter((ch) => set.has(ch));
}

function summarizeLetters(letters) {
  const sorted = [...letters].sort().join("");
  const preset = TYPING_LETTER_PRESETS.find((p) => p.letters.split("").sort().join("") === sorted);
  if (preset) return preset.label;
  if (letters.length >= 20) return `自定义(${letters.length})`;
  if (letters.length <= 8) return letters.join("");
  return `自定义(${letters.length})`;
}

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

function loadTypingHistory() {
  try {
    const raw = localStorage.getItem(TYPING_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((item) => item && typeof item === "object").slice(0, TYPING_HISTORY_MAX);
  } catch {
    return [];
  }
}

function saveTypingHistory(list) {
  try {
    localStorage.setItem(TYPING_HISTORY_KEY, JSON.stringify(list.slice(0, TYPING_HISTORY_MAX)));
  } catch { /* ignore */ }
}

function appendTypingHistory(entry) {
  const list = loadTypingHistory();
  list.unshift(entry);
  saveTypingHistory(list);
}

function clearTypingHistory() {
  try {
    localStorage.removeItem(TYPING_HISTORY_KEY);
  } catch { /* ignore */ }
}

function formatHistoryTime(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return "—";
  }
}

function heartsText(n) {
  return `${"♥".repeat(Math.max(0, n))}${"♡".repeat(Math.max(0, typingMaxLives - n))}`;
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
  const pool = typingLetterPool.length ? typingLetterPool : TYPING_ALPHABET;
  let letter = pool[randomInt(pool.length)];
  let guard = 0;
  while (letter === typingLastLetter && pool.length > 1 && guard < 8) {
    letter = pool[randomInt(pool.length)];
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
  if (typingDiffLabel) typingDiffLabel.textContent = getDifficulty().label;
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
  if (typingBubbles.length >= typingMaxBubbles) return;
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
  typingMisses += 1;
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
  if (!typingLetterPool.includes(letter)) {
    showTypingMsg(`「${letter}」不在本局练习范围`, false);
    if (typingWrongTimer) clearTimeout(typingWrongTimer);
    typingWrongTimer = setTimeout(hideTypingMsg, 900);
    return;
  }
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

function applyMildRamp() {
  if (typingRamped) return;
  const diff = getDifficulty();
  const at = Array.isArray(diff.rampAt) ? diff.rampAt[0] : null;
  if (at == null || typingElapsed < at) return;
  typingRamped = true;
  if (typeof diff.rampFall === "number") typingFallSpeed = diff.rampFall;
  if (typeof diff.rampSpawn === "number") {
    typingSpawnMs = diff.rampSpawn;
    scheduleTypingSpawn();
  }
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

  applyMildRamp();
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

function buildTypingLetterPad() {
  if (!typingLetterPad) return;
  const poolSet = new Set(typingLetterPool);
  typingLetterPad.innerHTML = "";
  TYPING_PAD_ROWS.forEach((row) => {
    const letters = row.split("").filter((ch) => poolSet.has(ch));
    if (!letters.length) return;
    const rowEl = document.createElement("div");
    rowEl.className = "typing-letter-row";
    letters.forEach((letter) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "typing-letter-key";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        handleTypingKey(letter);
      });
      rowEl.appendChild(btn);
    });
    typingLetterPad.appendChild(rowEl);
  });
}

function showTypingMobileControls(show) {
  if (!typingMobileControls) return;
  typingMobileControls.classList.toggle("hidden", !show);
}

function focusTypingInput() {
  if (!typingInput) return;
  typingInput.value = "";
  try {
    typingInput.focus({ preventScroll: true });
  } catch {
    typingInput.focus();
  }
}

function consumeTypingInputValue() {
  if (!typingInput || typingState !== "playing") return;
  const raw = String(typingInput.value || "");
  typingInput.value = "";
  if (!raw) return;
  for (const ch of raw) {
    const letter = ch.toLowerCase();
    if (letter >= "a" && letter <= "z") handleTypingKey(letter);
  }
}

function resetTypingRound() {
  const diff = getDifficulty();
  typingBubbles.forEach((b) => b.el?.remove());
  typingBubbles = [];
  typingScore = 0;
  typingStreak = 0;
  typingBestStreak = 0;
  typingHits = 0;
  typingMisses = 0;
  typingMaxLives = diff.maxLives;
  typingLives = diff.maxLives;
  typingRoundSec = diff.roundSec;
  typingTimeLeft = diff.roundSec;
  typingLastLetter = "";
  typingFallSpeed = diff.fallSpeed;
  typingSpawnMs = diff.spawnMs;
  typingMaxBubbles = diff.maxBubbles;
  typingElapsed = 0;
  typingLastFrame = 0;
  typingNextGolden = false;
  typingRamped = false;
  typingLetterPool = lettersFromSet(typingSelectedLetters);
  if (!typingLetterPool.length) typingLetterPool = "aeiou".split("");
  hideTypingMsg();
  renderTypingHud();
}

function startTypingGame() {
  syncSelectedLettersFromUi();
  if (!typingSelectedLetters.size) {
    showTypingMsg("请至少选择 1 个字母再开始", false);
    return;
  }
  resetTypingRound();
  typingState = "playing";
  if (typingSetup) typingSetup.classList.add("hidden");
  if (typingEnd) typingEnd.classList.add("hidden");
  if (typingHud) typingHud.classList.remove("hidden");
  if (typingArena) typingArena.classList.remove("hidden");
  buildTypingLetterPad();
  showTypingMobileControls(true);
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

function showTypingSetup() {
  typingState = "idle";
  stopTypingTimers();
  typingBubbles.forEach((b) => b.el?.remove());
  typingBubbles = [];
  hideTypingMsg();
  showTypingMobileControls(false);
  if (typingInput) typingInput.blur();
  if (typingHud) typingHud.classList.add("hidden");
  if (typingArena) typingArena.classList.add("hidden");
  if (typingEnd) typingEnd.classList.add("hidden");
  if (typingSetup) typingSetup.classList.remove("hidden");
  if (typingBestEl) typingBestEl.textContent = String(loadTypingHighscore());
  updateStartButtonState();
  renderTypingHistory();
}

function endTypingGame() {
  if (typingState === "ended") return;
  typingState = "ended";
  stopTypingTimers();
  typingBubbles.forEach((b) => b.el?.remove());
  typingBubbles = [];
  showTypingMobileControls(false);
  if (typingInput) typingInput.blur();

  const diff = getDifficulty();
  const letterSummary = summarizeLetters(typingLetterPool);
  const prevBest = loadTypingHighscore();
  const isNewBest = typingScore > prevBest;
  if (isNewBest) saveTypingHighscore(typingScore);
  if (typingBestEl) typingBestEl.textContent = String(loadTypingHighscore());

  appendTypingHistory({
    at: new Date().toISOString(),
    score: typingScore,
    hits: typingHits,
    misses: typingMisses,
    bestStreak: typingBestStreak,
    difficulty: diff.id,
    difficultyLabel: diff.label,
    letters: typingLetterPool.join(""),
    lettersLabel: letterSummary,
    durationSec: typingRoundSec,
    livesLeft: Math.max(0, typingLives),
  });

  if (typingEndBody) {
    typingEndBody.textContent = [
      `得分：${typingScore}${isNewBest ? "（新纪录！）" : ""}`,
      `难度：${diff.label} · 按键：${letterSummary}`,
      `打对字母：${typingHits} 个`,
      `最高连击：${typingBestStreak}`,
      `落地失误：${typingMisses} 次`,
    ].join("\n");
  }
  if (typingEnd) typingEnd.classList.remove("hidden");
  if (typingScore >= 100) spawnConfetti(1.5);
  renderTypingHistory();
}

function setSelectedLetters(letters) {
  typingSelectedLetters = new Set(
    String(letters)
      .toLowerCase()
      .split("")
      .filter((ch) => ch >= "a" && ch <= "z")
  );
  renderKeypad();
  updateKeysCount();
  updateStartButtonState();
  markPresetSelection();
}

function applyPreset(presetId) {
  const preset = getPresetById(presetId);
  typingSelectedPresetId = preset.id;
  typingSelectedGroup = preset.group;
  setSelectedLetters(preset.letters);
  renderPresetGroups();
  renderPresetButtons();
}

function syncSelectedLettersFromUi() {
  typingSelectedLetters = new Set();
  typingKeypad?.querySelectorAll(".typing-key.is-on").forEach((btn) => {
    const ch = btn.dataset.letter;
    if (ch) typingSelectedLetters.add(ch);
  });
  updateKeysCount();
  updateStartButtonState();
  markPresetSelection();
}

function updateKeysCount() {
  if (typingKeysCount) typingKeysCount.textContent = String(typingSelectedLetters.size);
}

function updateStartButtonState() {
  if (typingStartBtn) typingStartBtn.disabled = typingSelectedLetters.size < 1;
}

function markPresetSelection() {
  const sorted = lettersFromSet(typingSelectedLetters).join("");
  const matched = TYPING_LETTER_PRESETS.find(
    (p) => p.letters.split("").sort().join("") === [...sorted].sort().join("")
  );
  typingSelectedPresetId = matched ? matched.id : "";
  typingPresetBtns?.querySelectorAll(".typing-chip").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.presetId === typingSelectedPresetId);
  });
}

function renderDiffButtons() {
  if (!typingDiffBtns) return;
  typingDiffBtns.innerHTML = "";
  Object.values(TYPING_DIFFICULTIES).forEach((diff) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `typing-chip${diff.id === typingSelectedDifficulty ? " is-active" : ""}`;
    btn.textContent = diff.label;
    btn.dataset.diffId = diff.id;
    btn.addEventListener("click", () => {
      typingSelectedDifficulty = diff.id;
      renderDiffButtons();
      if (typingDiffDesc) typingDiffDesc.textContent = diff.desc;
    });
    typingDiffBtns.appendChild(btn);
  });
  if (typingDiffDesc) typingDiffDesc.textContent = getDifficulty().desc;
}

function renderPresetGroups() {
  if (!typingPresetGroups) return;
  typingPresetGroups.innerHTML = "";
  TYPING_PRESET_GROUPS.forEach((group) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `typing-chip typing-group-chip${group.id === typingSelectedGroup ? " is-active" : ""}`;
    btn.textContent = group.label;
    btn.dataset.groupId = group.id;
    btn.addEventListener("click", () => {
      typingSelectedGroup = group.id;
      renderPresetGroups();
      renderPresetButtons();
    });
    typingPresetGroups.appendChild(btn);
  });
}

function renderPresetButtons() {
  if (!typingPresetBtns) return;
  typingPresetBtns.innerHTML = "";
  TYPING_LETTER_PRESETS.filter((p) => p.group === typingSelectedGroup).forEach((preset) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `typing-chip${preset.id === typingSelectedPresetId ? " is-active" : ""}`;
    btn.textContent = preset.label;
    btn.title = preset.letters;
    btn.dataset.presetId = preset.id;
    btn.addEventListener("click", () => applyPreset(preset.id));
    typingPresetBtns.appendChild(btn);
  });
}

function renderKeypad() {
  if (!typingKeypad) return;
  typingKeypad.innerHTML = "";
  TYPING_PAD_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "typing-key-row";
    row.split("").forEach((ch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `typing-key${typingSelectedLetters.has(ch) ? " is-on" : ""}`;
      btn.textContent = ch;
      btn.dataset.letter = ch;
      btn.setAttribute("aria-pressed", typingSelectedLetters.has(ch) ? "true" : "false");
      btn.addEventListener("click", () => {
        if (typingSelectedLetters.has(ch)) typingSelectedLetters.delete(ch);
        else typingSelectedLetters.add(ch);
        btn.classList.toggle("is-on", typingSelectedLetters.has(ch));
        btn.setAttribute("aria-pressed", typingSelectedLetters.has(ch) ? "true" : "false");
        updateKeysCount();
        updateStartButtonState();
        markPresetSelection();
      });
      rowEl.appendChild(btn);
    });
    typingKeypad.appendChild(rowEl);
  });
}

function renderTypingHistory() {
  const list = loadTypingHistory();
  if (typingHistoryList) typingHistoryList.innerHTML = "";
  if (typingHistoryEmpty) typingHistoryEmpty.classList.toggle("hidden", list.length > 0);
  if (!typingHistoryList) return;
  list.forEach((item) => {
    const li = document.createElement("li");
    li.className = "typing-history-item";
    const diffLabel = item.difficultyLabel
      || TYPING_DIFFICULTIES[item.difficulty]?.label
      || item.difficulty
      || "—";
    const lettersLabel = item.lettersLabel || summarizeLetters((item.letters || "").split(""));
    li.innerHTML = `
      <span class="typing-history-main">${formatHistoryTime(item.at)} · ${diffLabel} · ${item.score ?? 0} 分</span>
      <span class="typing-history-sub">按键 ${lettersLabel} · 打对 ${item.hits ?? 0} · 连击 ${item.bestStreak ?? 0}</span>
    `;
    typingHistoryList.appendChild(li);
  });
}

function initTypingSetupUi() {
  renderDiffButtons();
  renderPresetGroups();
  applyPreset("vowels");
  renderTypingHistory();
  if (typingBestEl) typingBestEl.textContent = String(loadTypingHighscore());
}

document.getElementById("typing-start-btn")?.addEventListener("click", startTypingGame);
document.getElementById("typing-again-btn")?.addEventListener("click", showTypingSetup);

document.getElementById("typing-keys-all")?.addEventListener("click", () => {
  setSelectedLetters(TYPING_ALPHABET.join(""));
});
document.getElementById("typing-keys-clear")?.addEventListener("click", () => {
  setSelectedLetters("");
});
document.getElementById("typing-keys-apply")?.addEventListener("click", () => {
  const preset = TYPING_LETTER_PRESETS.find((p) => p.group === typingSelectedGroup && p.id === typingSelectedPresetId)
    || TYPING_LETTER_PRESETS.find((p) => p.group === typingSelectedGroup)
    || TYPING_LETTER_PRESETS[0];
  applyPreset(preset.id);
});

document.getElementById("typing-history-clear")?.addEventListener("click", () => {
  clearTypingHistory();
  renderTypingHistory();
});

typingOpenKeyboardBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  focusTypingInput();
});

typingInput?.addEventListener("keydown", (e) => {
  if (typingState !== "playing") return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : "";
  if (key >= "a" && key <= "z") {
    e.preventDefault();
    handleTypingKey(key);
    typingInput.value = "";
  }
});

typingInput?.addEventListener("input", () => {
  consumeTypingInputValue();
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

typingArena?.addEventListener("pointerdown", (e) => {
  if (e.target && e.target.closest && e.target.closest(".typing-letter-key")) return;
  focusTypingInput();
});

initTypingSetupUi();
