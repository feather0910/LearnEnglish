/* ===== 单词朗读（Web Speech API） ===== */
let speechVoicesCache = [];
let speechVoicesReady = false;

function cacheSpeechVoices() {
  if (!window.speechSynthesis) return;
  const list = window.speechSynthesis.getVoices();
  if (list && list.length) {
    speechVoicesCache = list;
    speechVoicesReady = true;
  }
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  cacheSpeechVoices();
  window.speechSynthesis.addEventListener("voiceschanged", cacheSpeechVoices);
}

function isPronounceEnabled() {
  return loadSettings().pronounceOn !== false;
}

function pickEnglishVoice() {
  const voices = speechVoicesCache.length
    ? speechVoicesCache
    : window.speechSynthesis
      ? window.speechSynthesis.getVoices()
      : [];
  const en = voices.filter((v) => /^en(-|_)/i.test(v.lang || ""));
  return (
    en.find((v) => /US/i.test(v.lang || "")) ||
    en.find((v) => v.localService) ||
    en[0] ||
    null
  );
}

/** 在用户点击后调用一次，便于 iOS 等环境允许后续朗读 */
function unlockSpeech() {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.resume();
  } catch (_) {
    /* ignore */
  }
}

function speakEnglish(text) {
  if (!isPronounceEnabled()) return false;
  if (!window.speechSynthesis) return false;
  const say = String(text || "").trim();
  if (!say) return false;

  unlockSpeech();
  window.speechSynthesis.cancel();

  if (!speechVoicesReady) cacheSpeechVoices();

  const u = new SpeechSynthesisUtterance(say);
  u.lang = "en-US";
  u.rate = 0.88;
  u.pitch = 1.05;
  const voice = pickEnglishVoice();
  if (voice) u.voice = voice;

  window.speechSynthesis.speak(u);
  return true;
}

function speakWord(word) {
  return speakEnglish(word);
}

function bindSpeakButton(btn, getText) {
  if (!btn) return;
  btn.addEventListener("click", () => {
    unlockSpeech();
    const t = typeof getText === "function" ? getText() : getText;
    speakEnglish(t);
  });
}
