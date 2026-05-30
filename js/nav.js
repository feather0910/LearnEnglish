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
  reviewPicker: document.getElementById("view-review-picker"),
  reviewList: document.getElementById("view-review-list"),
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

function setFigureLoading(figureEl, loading) {
  if (!figureEl) return;
  figureEl.classList.toggle("is-loading", loading);
  figureEl.setAttribute("aria-busy", loading ? "true" : "false");
}

function setImageWithFade(imgEl, src, alt, options) {
  if (!imgEl) return;
  const onError = options && options.onError;
  const figure = imgEl.closest(".figure");
  const url = (src || "").trim();

  if (!url) {
    imgEl.removeAttribute("src");
    imgEl.classList.add("hidden");
    setFigureLoading(figure, false);
    return;
  }

  if (!imgEl._loadGen) imgEl._loadGen = 0;
  const gen = ++imgEl._loadGen;

  setFigureLoading(figure, true);
  imgEl.classList.add("hidden", "fading");
  imgEl.removeAttribute("src");

  const preload = new Image();
  preload.onload = () => {
    if (gen !== imgEl._loadGen) return;
    imgEl.src = url;
    imgEl.alt = alt || "";
    imgEl.classList.remove("hidden");
    requestAnimationFrame(() => {
      if (gen !== imgEl._loadGen) return;
      imgEl.classList.remove("fading");
      setFigureLoading(figure, false);
    });
  };
  preload.onerror = () => {
    if (gen !== imgEl._loadGen) return;
    imgEl.classList.add("hidden");
    imgEl.removeAttribute("src");
    setFigureLoading(figure, false);
    if (onError) onError();
  };
  preload.src = url;
}
