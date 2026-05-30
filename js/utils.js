/* ===== 工具函数 ===== */
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function pickDistinctWords(excludeWord, count) {
  const pool = VOCAB.filter((e) => !isSupplementEntry(e) && e.word !== excludeWord).map((e) => e.word);
  shuffleInPlace(pool);
  return pool.slice(0, count);
}

/** 拼写答案：去首尾空白、小写、连续空白压成单个空格 */
function normalizeSpellAnswer(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function spellAnswerCompact(s) {
  return normalizeSpellAnswer(s).replace(/\s/g, "");
}

/** 对单个英文词生成常见单复数变体（用于短语最后一个词） */
function spellTokenVariants(token) {
  const variants = new Set();
  if (!token) return variants;
  variants.add(token);

  if (token.endsWith("ies") && token.length > 4) {
    variants.add(token.slice(0, -3) + "y");
  }
  if (token.endsWith("es") && token.length > 3) {
    variants.add(token.slice(0, -2));
  }
  if (token.endsWith("s") && token.length > 2 && !token.endsWith("ss")) {
    variants.add(token.slice(0, -1));
  }

  if (token.endsWith("y") && token.length > 2 && !/[aeiou]y$/.test(token)) {
    variants.add(token.slice(0, -1) + "ies");
  }
  if (/(?:s|x|z|ch|sh)$/.test(token)) {
    variants.add(token + "es");
  }
  variants.add(token + "s");

  return variants;
}

/** 短语：在规范化基础上，对最后一个词做单复数变体 */
function spellPhraseVariants(phrase) {
  const normalized = normalizeSpellAnswer(phrase);
  const results = new Set([normalized]);
  const parts = normalized.split(" ").filter(Boolean);
  if (!parts.length) return results;

  const prefix = parts.length > 1 ? parts.slice(0, -1).join(" ") + " " : "";
  const last = parts[parts.length - 1];
  for (const v of spellTokenVariants(last)) {
    results.add(prefix + v);
  }
  return results;
}

/** 拼写是否算对：忽略多余空格、可连写、末词单复数互通 */
function spellAnswersMatch(guess, target) {
  const gSet = spellPhraseVariants(guess);
  const tSet = spellPhraseVariants(target);
  for (const g of gSet) {
    if (tSet.has(g)) return true;
  }
  for (const g of gSet) {
    const gc = spellAnswerCompact(g);
    for (const t of tSet) {
      if (gc === spellAnswerCompact(t)) return true;
    }
  }
  return false;
}
