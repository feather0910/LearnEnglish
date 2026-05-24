/* ===== 首页 ===== */
const homeEmpty = document.getElementById("home-empty");
homeEmpty.classList.toggle("hidden", VOCAB.length > 0);

function guardVocab(fn) {
  if (!VOCAB.length) return;
  fn();
}

document.getElementById("go-flash").addEventListener("click", () => guardVocab(startFlash));
document.getElementById("go-quiz-word").addEventListener("click", () => guardVocab(startQuizWord));
document.getElementById("go-quiz-image").addEventListener("click", () => guardVocab(startQuizImage));
document.getElementById("go-spell").addEventListener("click", () => guardVocab(startSpell));
document.getElementById("go-category-spell").addEventListener("click", () => guardVocab(openCategoryPicker));
document.getElementById("go-first").addEventListener("click", () => guardVocab(startFirst));
document.getElementById("go-wordbook").addEventListener("click", () => {
  renderWordbook();
  showView("wordbook");
});

const settingAutoNext = document.getElementById("setting-auto-next");
const settingSoundOn = document.getElementById("setting-sound-on");
const s0 = loadSettings();
if (settingAutoNext) {
  settingAutoNext.checked = s0.autoNext;
  settingAutoNext.addEventListener("change", () => {
    saveSettings({ autoNext: settingAutoNext.checked });
  });
}
if (settingSoundOn) {
  settingSoundOn.checked = s0.soundOn;
  settingSoundOn.addEventListener("change", () => {
    saveSettings({ soundOn: settingSoundOn.checked });
  });
}

document.getElementById("reset-seen-words").addEventListener("click", () => {
  if (!confirm("确定清空「已测」记录？未测优先将重新从全词表开始。")) return;
  localStorage.removeItem(SEEN_WORDS_KEY);
});
