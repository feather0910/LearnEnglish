/* ===== 视图切换 ===== */
const views = {
  home: document.getElementById("view-home"),
  flash: document.getElementById("view-flash"),
  quizWord: document.getElementById("view-quiz-word"),
  quizImage: document.getElementById("view-quiz-image"),
  spell: document.getElementById("view-spell"),
  categoryPicker: document.getElementById("view-category-picker"),
  categorySpell: document.getElementById("view-category-spell"),
  first: document.getElementById("view-first"),
  wordbook: document.getElementById("view-wordbook"),
};

function showView(name) {
  Object.keys(views).forEach((k) =>
    views[k].classList.toggle("hidden", k !== name)
  );
}

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => {
    hideRoundComplete();
    showView("home");
  });
});

function setImageWithFade(imgEl, src, alt) {
  imgEl.classList.add("fading");
  setTimeout(() => {
    imgEl.src = src;
    imgEl.alt = alt;
    imgEl.classList.remove("fading");
  }, 80);
}
