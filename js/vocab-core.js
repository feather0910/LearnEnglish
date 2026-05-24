function isSupplementEntry(entry) {
  return !!(entry && entry.supplement);
}

/** 仅含配图词条（排除分类补充的无图词条），用于常规测验与卡片模式 */
function coreVocabIndices() {
  return VOCAB.map((_, i) => i).filter((i) => !isSupplementEntry(VOCAB[i]));
}

/** 生词本未测优先，再其余未测，凑满 ROUND_SIZE 后用已测补足 */
function buildRoundQueueIndices() {
  const seen = loadSeenWords();
  const wbWords = new Set(loadWordbook());
  const all = coreVocabIndices();
  const untested = all.filter((i) => !seen.has(VOCAB[i].word));
  const tested = all.filter((i) => seen.has(VOCAB[i].word));
  const wbU = shuffleInPlace(untested.filter((i) => wbWords.has(VOCAB[i].word)));
  const restU = shuffleInPlace(untested.filter((i) => !wbWords.has(VOCAB[i].word)));
  const orderedUntested = [...wbU, ...restU];
  shuffleInPlace(tested);
  const cap = Math.min(ROUND_SIZE, all.length);
  const out = [];
  for (const i of orderedUntested) {
    if (out.length >= cap) break;
    out.push(i);
  }
  for (const i of tested) {
    if (out.length >= cap) break;
    out.push(i);
  }
  return out;
}

function pickDistinctIndices(excludeIdx, count) {
  const pool = coreVocabIndices().filter((i) => i !== excludeIdx);
  shuffleInPlace(pool);
  return pool.slice(0, Math.min(count, pool.length));
}

function buildPrioritizedQueue() {
  const core = coreVocabIndices();
  const coreSet = new Set(core);
  const wb = getWordbookVocabIndices().filter((i) => coreSet.has(i));
  const wbSet = new Set(wb);
  const other = core.filter((i) => !wbSet.has(i));
  shuffleInPlace(wb);
  shuffleInPlace(other);
  return wb.length ? [...wb, ...other] : shuffleInPlace([...core]);
}
