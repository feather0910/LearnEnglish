/* ===== 24 点小游戏 ===== */
let game24Numbers = [];
let game24Solution = "";
let game24Tokens = [];
let game24Mode = "play";
let game24SolvePicks = [];

const game24NumbersEl = document.getElementById("game24-numbers");
const game24ExprEl = document.getElementById("game24-expr");
const game24Msg = document.getElementById("game24-msg");
const game24Lead = document.getElementById("game24-lead");
const game24PlayPanel = document.getElementById("game24-play");
const game24SolvePanel = document.getElementById("game24-solve");
const game24SolveSlots = document.getElementById("game24-solve-slots");
const game24SolvePad = document.getElementById("game24-solve-pad");
const game24SolveResult = document.getElementById("game24-solve-result");

const GAME24_EPS = 1e-9;
const GAME24_EXPR_EMPTY = "点击数字和符号组成算式";
const GAME24_CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function game24CardLabel(n) {
  if (n === 1) return "A";
  if (n === 11) return "J";
  if (n === 12) return "Q";
  if (n === 13) return "K";
  return String(n);
}

function game24FindSolution(nums) {
  const nodes = nums.map((n) => ({ value: n, expr: String(n) }));
  return game24SolveNodes(nodes);
}

function game24SolveNodes(nodes) {
  if (nodes.length === 1) {
    if (Math.abs(nodes[0].value - 24) < GAME24_EPS) return nodes[0].expr;
    return null;
  }
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const rest = nodes.filter((_, k) => k !== i && k !== j);
      const candidates = [
        { value: a.value + b.value, expr: `(${a.expr}+${b.expr})` },
        { value: a.value - b.value, expr: `(${a.expr}-${b.expr})` },
        { value: b.value - a.value, expr: `(${b.expr}-${a.expr})` },
        { value: a.value * b.value, expr: `(${a.expr}*${b.expr})` },
      ];
      if (Math.abs(b.value) > GAME24_EPS) {
        candidates.push({ value: a.value / b.value, expr: `(${a.expr}/${b.expr})` });
      }
      if (Math.abs(a.value) > GAME24_EPS) {
        candidates.push({ value: b.value / a.value, expr: `(${b.expr}/${a.expr})` });
      }
      for (const next of candidates) {
        if (!Number.isFinite(next.value)) continue;
        const found = game24SolveNodes([...rest, next]);
        if (found) return found;
      }
    }
  }
  return null;
}

function game24HasSolution(nums) {
  return game24FindSolution(nums) !== null;
}

function formatGame24Solution(expr) {
  let s = String(expr || "");
  while (s.startsWith("(") && s.endsWith(")")) {
    let depth = 0;
    let wrapsWhole = true;
    for (let i = 0; i < s.length - 1; i += 1) {
      if (s[i] === "(") depth += 1;
      else if (s[i] === ")") depth -= 1;
      if (depth === 0) {
        wrapsWhole = false;
        break;
      }
    }
    if (!wrapsWhole) break;
    s = s.slice(1, -1);
  }
  s = s.replace(/\*/g, "×").replace(/\//g, "÷");
  return s
    .replace(/11/g, "J")
    .replace(/12/g, "Q")
    .replace(/13/g, "K")
    .replace(/(^|[^\d])1(?!\d)/g, "$1A");
}

function pickGame24Deal() {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const nums = [];
    for (let i = 0; i < 4; i += 1) {
      nums.push(randomInt(10) + 1);
    }
    const solution = game24FindSolution(nums);
    if (solution) return { nums, solution };
  }
  const fallback = [1, 2, 3, 4];
  return { nums: fallback, solution: game24FindSolution(fallback) || "1*2*3*4" };
}

function game24NumberCounts(nums) {
  const counts = {};
  nums.forEach((n) => {
    counts[n] = (counts[n] || 0) + 1;
  });
  return counts;
}

function game24RemainingNumberCounts() {
  const counts = game24NumberCounts(game24Numbers);
  game24Tokens.forEach((token) => {
    if (!/^\d+$/.test(token)) return;
    const n = Number(token);
    if (counts[n]) counts[n] -= 1;
  });
  return counts;
}

function canAppendGame24Number(n) {
  const counts = game24RemainingNumberCounts();
  return (counts[n] || 0) > 0;
}

function renderGame24Expr() {
  if (!game24ExprEl) return;
  if (!game24Tokens.length) {
    game24ExprEl.textContent = GAME24_EXPR_EMPTY;
    game24ExprEl.classList.add("is-empty");
    return;
  }
  game24ExprEl.textContent = game24Tokens.join("");
  game24ExprEl.classList.remove("is-empty");
}

function updateGame24NumberCards() {
  if (!game24NumbersEl) return;
  const remaining = game24RemainingNumberCounts();
  game24NumbersEl.querySelectorAll(".game24-number-card").forEach((btn) => {
    const n = Number(btn.dataset.value || btn.textContent);
    btn.disabled = !(remaining[n] > 0);
  });
}

function renderGame24Numbers() {
  if (!game24NumbersEl) return;
  game24NumbersEl.innerHTML = "";
  game24Numbers.forEach((n) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "game24-number-card";
    card.dataset.value = String(n);
    card.textContent = String(n);
    card.addEventListener("click", () => appendGame24Token(String(n)));
    game24NumbersEl.appendChild(card);
  });
  updateGame24NumberCards();
}

function dealGame24() {
  const deal = pickGame24Deal();
  game24Numbers = deal.nums;
  game24Solution = deal.solution;
  renderGame24Numbers();
  clearGame24Input();
  hideGame24Msg();
}

function appendGame24Token(token) {
  if (!token) return;
  if (/^\d+$/.test(token)) {
    const n = Number(token);
    if (!canAppendGame24Number(n)) return;
  }
  game24Tokens.push(token);
  renderGame24Expr();
  updateGame24NumberCards();
}

function backspaceGame24() {
  game24Tokens.pop();
  renderGame24Expr();
  updateGame24NumberCards();
}

function clearGame24Input() {
  game24Tokens = [];
  renderGame24Expr();
  updateGame24NumberCards();
  hideGame24Msg();
}

function getGame24Expr() {
  return game24Tokens.join("");
}

function hideGame24Msg() {
  if (!game24Msg) return;
  game24Msg.textContent = "";
  game24Msg.className = "msg hidden";
}

function showGame24Msg(text, ok) {
  if (!game24Msg) return;
  game24Msg.textContent = text;
  game24Msg.className = ok ? "msg ok" : "msg bad";
  game24Msg.classList.remove("hidden");
}

function game24SolutionToTokens(solution) {
  const tokens = [];
  let i = 0;
  const s = String(solution || "");
  while (i < s.length) {
    const ch = s[i];
    if (ch >= "0" && ch <= "9") {
      let num = ch;
      i += 1;
      while (i < s.length && s[i] >= "0" && s[i] <= "9") {
        num += s[i];
        i += 1;
      }
      tokens.push(num);
      continue;
    }
    if (ch === "*") {
      tokens.push("×");
      i += 1;
      continue;
    }
    if (ch === "/") {
      tokens.push("÷");
      i += 1;
      continue;
    }
    if ("+-()".includes(ch)) {
      tokens.push(ch);
      i += 1;
      continue;
    }
    i += 1;
  }
  return tokens;
}

function showGame24Answer() {
  if (!game24Solution) {
    game24Solution = game24FindSolution(game24Numbers) || "";
  }
  if (!game24Solution) {
    showGame24Msg("暂时没有算出答案，请换一题。", false);
    return;
  }
  game24Tokens = game24SolutionToTokens(game24Solution);
  renderGame24Expr();
  updateGame24NumberCards();
  const formatted = formatGame24Solution(game24Solution);
  showGame24Msg(`参考答案：${formatted}`, true);
  game24Msg?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function normalizeGame24Expr(raw) {
  return String(raw || "")
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[xX]/g, "*");
}

function tokenizeGame24Expr(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch >= "0" && ch <= "9") {
      let num = ch;
      i += 1;
      while (i < expr.length && expr[i] >= "0" && expr[i] <= "9") {
        num += expr[i];
        i += 1;
      }
      tokens.push({ type: "num", value: Number(num) });
      continue;
    }
    if ("+-*/()".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    return null;
  }
  return tokens;
}

function numbersMatchGame24(used, target) {
  const a = used.slice().sort((x, y) => x - y);
  const b = target.slice().sort((x, y) => x - y);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function evaluateGame24Tokens(tokens) {
  let pos = 0;

  function parseExpr() {
    let left = parseTerm();
    while (pos < tokens.length && (tokens[pos].value === "+" || tokens[pos].value === "-")) {
      const op = tokens[pos].value;
      pos += 1;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (pos < tokens.length && (tokens[pos].value === "*" || tokens[pos].value === "/")) {
      const op = tokens[pos].value;
      pos += 1;
      const right = parseFactor();
      if (op === "/" && Math.abs(right) < GAME24_EPS) return NaN;
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parseFactor() {
    if (pos >= tokens.length) return NaN;
    if (tokens[pos].type === "num") {
      const v = tokens[pos].value;
      pos += 1;
      return v;
    }
    if (tokens[pos].value === "(") {
      pos += 1;
      const v = parseExpr();
      if (pos >= tokens.length || tokens[pos].value !== ")") return NaN;
      pos += 1;
      return v;
    }
    return NaN;
  }

  const result = parseExpr();
  if (pos !== tokens.length) return NaN;
  return result;
}

function checkGame24() {
  const expr = normalizeGame24Expr(getGame24Expr());
  if (!expr) {
    showGame24Msg("先点数字和符号组成算式哦～", false);
    return;
  }

  const tokens = tokenizeGame24Expr(expr);
  if (!tokens || !tokens.length) {
    showGame24Msg("算式里有不认识的符号，请检查一下。", false);
    return;
  }

  const used = tokens.filter((t) => t.type === "num").map((t) => t.value);
  if (!numbersMatchGame24(used, game24Numbers)) {
    showGame24Msg("四个数字各用一次哦，不能多也不能少。", false);
    return;
  }

  const result = evaluateGame24Tokens(tokens);
  if (!Number.isFinite(result)) {
    showGame24Msg("算式好像不对，再试试～", false);
    return;
  }

  if (Math.abs(result - 24) < GAME24_EPS) {
    showGame24Msg("算对了！24 点达成！", true);
    spawnConfetti(1.75);
    showPraiseToast("算对了！");
    return;
  }

  showGame24Msg(`结果是 ${Number.isInteger(result) ? result : result.toFixed(2)}，还不是 24，再试试～`, false);
}

/* ===== 求解模式 ===== */
function hideGame24SolveResult() {
  if (!game24SolveResult) return;
  game24SolveResult.className = "game24-solve-result hidden";
  game24SolveResult.textContent = "";
}

function showGame24SolveResult(text, ok) {
  if (!game24SolveResult) return;
  game24SolveResult.textContent = text;
  game24SolveResult.className = ok ? "game24-solve-result is-ok" : "game24-solve-result is-bad";
}

function renderGame24SolveSlots() {
  if (!game24SolveSlots) return;
  game24SolveSlots.innerHTML = "";
  for (let i = 0; i < 4; i += 1) {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "game24-number-card game24-solve-slot";
    if (i < game24SolvePicks.length) {
      const n = game24SolvePicks[i];
      slot.textContent = game24CardLabel(n);
      slot.dataset.value = String(n);
      slot.classList.add("is-filled");
      slot.addEventListener("click", () => {
        game24SolvePicks.splice(i, 1);
        renderGame24SolveSlots();
        updateGame24SolvePad();
        hideGame24SolveResult();
        hideGame24Msg();
      });
    } else {
      slot.textContent = "?";
      slot.classList.add("is-empty");
      slot.disabled = true;
    }
    game24SolveSlots.appendChild(slot);
  }
}

function updateGame24SolvePad() {
  if (!game24SolvePad) return;
  const full = game24SolvePicks.length >= 4;
  game24SolvePad.querySelectorAll(".game24-solve-card").forEach((btn) => {
    btn.disabled = full;
  });
}

function buildGame24SolvePad() {
  if (!game24SolvePad || game24SolvePad.dataset.ready === "1") return;
  game24SolvePad.innerHTML = "";
  GAME24_CARD_VALUES.forEach((n) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary game24-solve-card";
    btn.textContent = game24CardLabel(n);
    btn.dataset.value = String(n);
    btn.addEventListener("click", () => {
      if (game24SolvePicks.length >= 4) {
        showGame24Msg("已经选满 4 张牌啦，点「求解」或清空后再选。", false);
        return;
      }
      game24SolvePicks.push(n);
      renderGame24SolveSlots();
      updateGame24SolvePad();
      hideGame24SolveResult();
      hideGame24Msg();
    });
    game24SolvePad.appendChild(btn);
  });
  game24SolvePad.dataset.ready = "1";
}

function clearGame24Solve() {
  game24SolvePicks = [];
  renderGame24SolveSlots();
  updateGame24SolvePad();
  hideGame24SolveResult();
  hideGame24Msg();
}

function runGame24Solve() {
  if (game24SolvePicks.length !== 4) {
    showGame24Msg("请先选满 4 张牌。", false);
    hideGame24SolveResult();
    return;
  }
  const nums = game24SolvePicks.slice();
  const solution = game24FindSolution(nums);
  const labels = nums.map(game24CardLabel).join("、");
  if (!solution) {
    showGame24SolveResult(`选牌：${labels}\n这组牌算不出 24（无解）。`, false);
    showGame24Msg("这组牌无解。", false);
    return;
  }
  const formatted = formatGame24Solution(solution);
  showGame24SolveResult(`选牌：${labels}\n答案：${formatted}`, true);
  showGame24Msg(`答案：${formatted}`, true);
  spawnConfetti(1.2);
  showPraiseToast("求出答案啦！");
  game24SolveResult?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setGame24Mode(mode) {
  game24Mode = mode === "solve" ? "solve" : "play";
  const playTab = document.getElementById("game24-tab-play");
  const solveTab = document.getElementById("game24-tab-solve");
  if (playTab) {
    playTab.classList.toggle("is-active", game24Mode === "play");
    playTab.setAttribute("aria-selected", game24Mode === "play" ? "true" : "false");
  }
  if (solveTab) {
    solveTab.classList.toggle("is-active", game24Mode === "solve");
    solveTab.setAttribute("aria-selected", game24Mode === "solve" ? "true" : "false");
  }
  if (game24PlayPanel) game24PlayPanel.classList.toggle("hidden", game24Mode !== "play");
  if (game24SolvePanel) game24SolvePanel.classList.toggle("hidden", game24Mode !== "solve");
  if (game24Lead) {
    game24Lead.textContent =
      game24Mode === "solve"
        ? "输入 4 张牌，立刻求出 24 点答案。A=1，J=11，Q=12，K=13。"
        : "用四个数字算出 24。每个数字只能用一次。";
  }
  hideGame24Msg();
  if (game24Mode === "solve") {
    buildGame24SolvePad();
    renderGame24SolveSlots();
    updateGame24SolvePad();
  }
}

document.querySelectorAll(".game24-key[data-token]").forEach((btn) => {
  btn.addEventListener("click", () => appendGame24Token(btn.dataset.token || ""));
});

document.getElementById("game24-check")?.addEventListener("click", checkGame24);
document.getElementById("game24-clear")?.addEventListener("click", clearGame24Input);
document.getElementById("game24-deal")?.addEventListener("click", dealGame24);
document.getElementById("game24-answer")?.addEventListener("click", showGame24Answer);
document.getElementById("game24-backspace")?.addEventListener("click", backspaceGame24);
document.getElementById("game24-solve-run")?.addEventListener("click", runGame24Solve);
document.getElementById("game24-solve-clear")?.addEventListener("click", clearGame24Solve);
document.getElementById("game24-tab-play")?.addEventListener("click", () => setGame24Mode("play"));
document.getElementById("game24-tab-solve")?.addEventListener("click", () => setGame24Mode("solve"));

dealGame24();
setGame24Mode("play");
