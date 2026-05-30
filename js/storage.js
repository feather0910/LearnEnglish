function loadSettings() {
  const defaults = { autoNext: true, soundOn: false, pronounceOn: true };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaults };
    const o = JSON.parse(raw);
    return {
      autoNext: o && typeof o.autoNext === "boolean" ? o.autoNext : defaults.autoNext,
      soundOn: o && typeof o.soundOn === "boolean" ? o.soundOn : defaults.soundOn,
      pronounceOn:
        o && typeof o.pronounceOn === "boolean" ? o.pronounceOn : defaults.pronounceOn,
    };
  } catch {
    return { ...defaults };
  }
}

function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function loadSeenWords() {
  try {
    const raw = localStorage.getItem(SEEN_WORDS_KEY);
    if (!raw) return new Set();
    const a = JSON.parse(raw);
    if (!Array.isArray(a)) return new Set();
    return new Set(a.filter((w) => typeof w === "string"));
  } catch {
    return new Set();
  }
}

function saveSeenWords(set) {
  localStorage.setItem(SEEN_WORDS_KEY, JSON.stringify([...set]));
}

function markWordSeen(word) {
  const s = loadSeenWords();
  if (s.has(word)) return;
  s.add(word);
  saveSeenWords(s);
}

function loadWordbook() {
  try {
    const raw = localStorage.getItem(WORDBOOK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((w) => typeof w === "string"))];
  } catch {
    return [];
  }
}

function saveWordbook(words) {
  const normalized = [...new Set(words.filter((w) => typeof w === "string"))];
  localStorage.setItem(WORDBOOK_KEY, JSON.stringify(normalized));
}

function hasInWordbook(word) {
  return loadWordbook().includes(word);
}

function addToWordbook(word) {
  const words = loadWordbook();
  if (words.includes(word)) return false;
  words.push(word);
  saveWordbook(words);
  return true;
}

function removeFromWordbook(word) {
  const words = loadWordbook().filter((w) => w !== word);
  saveWordbook(words);
}

function getWordbookVocabIndices() {
  const wordSet = new Set(loadWordbook());
  const indices = [];
  for (let i = 0; i < VOCAB.length; i += 1) {
    if (wordSet.has(VOCAB[i].word)) indices.push(i);
  }
  return indices;
}
