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
