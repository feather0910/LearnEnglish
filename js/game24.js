/* ===== 24 点小游戏 ===== */
let game24Numbers = [];
let game24Solution = "";
let game24Tokens = [];

const game24NumbersEl = document.getElementById("game24-numbers");
const game24ExprEl = document.getElementById("game24-expr");
const game24Msg = document.getElementById("game24-msg");

const GAME24_EPS = 1e-9;
const GAME24_EXPR_EMPTY = "点击数字和符号组成算式";

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
  return s.replace(/\*/g, "×").replace(/\//g, "÷");
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
    const n = Number(btn.textContent);
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
}

function showGame24Answer() {
  if (!game24Solution) {
    game24Solution = game24FindSolution(game24Numbers) || "";
  }
  if (!game24Solution) {
    showGame24Msg("暂时没有算出答案，请换一题。", false);
    return;
  }
  showGame24Msg(`参考答案：${formatGame24Solution(game24Solution)}`, true);
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

document.querySelectorAll(".game24-key[data-token]").forEach((btn) => {
  btn.addEventListener("click", () => appendGame24Token(btn.dataset.token || ""));
});

document.getElementById("game24-check")?.addEventListener("click", checkGame24);
document.getElementById("game24-clear")?.addEventListener("click", clearGame24Input);
document.getElementById("game24-deal")?.addEventListener("click", dealGame24);
document.getElementById("game24-answer")?.addEventListener("click", showGame24Answer);
document.getElementById("game24-backspace")?.addEventListener("click", backspaceGame24);

dealGame24();
