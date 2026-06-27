/** Word List：一级菜单 → 词表子菜单 → 词表 */
const WORD_LIST_GROUPS = [
  {
    id: "starter-h-wordlist-1",
    label: "Wordlist 1",
    subtitle: "Elementary Starter H",
    words: [
      "basket",
      "bird",
      "duck",
      "hat",
      "log",
      "helicopter",
      "lamp",
      "table",
      "leaf",
      "sandwich",
      "seal",
      "lock",
      "Bibs",
      "is",
      "here",
      "look",
      "looks",
      "jump",
      "jumps",
      "see",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "black",
      "brown",
      "purple",
      "circle",
      "square",
      "triangle",
      "rectangle",
      "oval",
      "diamond",
      "heart",
      "star",
    ],
  },
];

/** 词表中文（词库无 zh 或需覆盖时使用） */
const WORD_LIST_ZH = {
  basket: "篮子",
  bird: "鸟",
  Bibs: "比布斯（故事角色）",
  is: "是",
  here: "这里",
  look: "看",
  looks: "看（第三人称）",
  jumps: "跳（第三人称）",
  see: "看见",
};

const WORD_LIST_EMOJI = {
  basket: "🧺",
  bird: "🐦",
  Bibs: "👧",
  is: "✅",
  here: "📍",
  look: "👀",
  looks: "👁️",
  jumps: "🦘",
  see: "👁️",
};

function getWordListWords(group) {
  if (!group) return [];
  return group.words || [];
}

function wordListVocabIndexByWord(word) {
  const key = String(word).trim().toLowerCase();
  for (let i = 0; i < VOCAB.length; i += 1) {
    if (VOCAB[i].word.trim().toLowerCase() === key) return i;
  }
  return -1;
}

function wordListVocabEntry(word) {
  const idx = wordListVocabIndexByWord(word);
  return idx >= 0 ? VOCAB[idx] : null;
}

function buildWordListSpellQueue(groupId) {
  const group = WORD_LIST_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];
  const indices = [];
  getWordListWords(group).forEach((w) => {
    const idx = wordListVocabIndexByWord(w);
    if (idx >= 0) indices.push(idx);
  });
  return shuffleInPlace(indices);
}

function wordListEntry(word) {
  const base = wordListVocabEntry(word);
  const zh =
    WORD_LIST_ZH[word] ||
    (base && base.zh && String(base.zh).trim()) ||
    "";
  const emoji = (base && base.emoji) || WORD_LIST_EMOJI[word] || "📖";
  const file = (base && base.file) || "";
  return {
    word,
    zh,
    file,
    emoji,
    vocabEntry: base,
  };
}
