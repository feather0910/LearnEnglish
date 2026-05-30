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

function setMediaLoading(hostEl, loading) {
  if (!hostEl) return;
  hostEl.classList.toggle("is-loading", loading);
  hostEl.setAttribute("aria-busy", loading ? "true" : "false");
}

function setFigureLoading(figureEl, loading) {
  setMediaLoading(figureEl, loading);
}

/** 预加载后再显示图片；loadHost 为显示 loading 的容器（.figure 或 .option-image） */
function loadImageWithLoading(imgEl, src, alt, options) {
  if (!imgEl) return;
  const opts = options || {};
  const onError = opts.onError;
  const onReady = opts.onReady;
  const useFade = opts.fade !== false;
  const loadHost =
    opts.loadHost || imgEl.closest(".figure") || imgEl.closest(".option-image");
  const url = (src || "").trim();

  if (!url) {
    imgEl.removeAttribute("src");
    imgEl.classList.add("hidden");
    setMediaLoading(loadHost, false);
    if (onReady) onReady();
    return;
  }

  if (!imgEl._loadGen) imgEl._loadGen = 0;
  const gen = ++imgEl._loadGen;

  setMediaLoading(loadHost, true);
  imgEl.classList.add("hidden");
  if (useFade) imgEl.classList.add("fading");
  imgEl.removeAttribute("src");

  const preload = new Image();
  preload.onload = () => {
    if (gen !== imgEl._loadGen) return;
    imgEl.src = url;
    imgEl.alt = alt || "";
    imgEl.classList.remove("hidden");
    const done = () => {
      if (gen !== imgEl._loadGen) return;
      if (useFade) imgEl.classList.remove("fading");
      setMediaLoading(loadHost, false);
      if (onReady) onReady();
    };
    if (useFade) requestAnimationFrame(done);
    else done();
  };
  preload.onerror = () => {
    if (gen !== imgEl._loadGen) return;
    imgEl.classList.add("hidden");
    imgEl.removeAttribute("src");
    setMediaLoading(loadHost, false);
    if (onError) onError();
    else if (onReady) onReady();
  };
  preload.src = url;
}

function setImageWithFade(imgEl, src, alt, options) {
  loadImageWithLoading(imgEl, src, alt, {
    ...options,
    loadHost: imgEl && imgEl.closest(".figure"),
    fade: true,
  });
}
