// 本棚の背表紙を「取り出して開く」演出。本棚ページと各ブックの開幕で共用する。

export const TAKEOUT_JS = `
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = false;

  const esc = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  function play(spine, options) {
    options = options || {};
    if (active) return;
    if (reduced) {
      if (options.onDone) options.onDone();
      return;
    }

    active = true;
    const rect = spine.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const targetW = Math.min(380, window.innerWidth * 0.72, window.innerHeight * 0.46);
    const targetH = targetW * 1.36;
    const dx = rect.left + rect.width / 2 - cx;
    const dy = rect.top + rect.height / 2 - cy;
    const title = spine.dataset.title || "";
    const subtitle = spine.dataset.subtitle || "";
    const author = spine.dataset.author || "";
    const c1 = spine.dataset.c1 || "#5a3a2a";
    const c2 = spine.dataset.c2 || "#2c1a12";

    const layer = document.createElement("div");
    layer.className = "takeout-layer";
    layer.innerHTML = [
      '<div class="tb-spine" style="left:' + rect.left + "px;top:" + rect.top +
        "px;width:" + rect.width + "px;height:" + rect.height +
        "px;--c1:" + c1 + ";--c2:" + c2 + '">' + esc(title) + "</div>",
      '<div class="tb-book" style="left:' + (cx - targetW / 2) + "px;top:" + (cy - targetH / 2) +
        "px;width:" + targetW + "px;height:" + targetH + "px;font-size:" +
        Math.max(13, Math.min(22, targetW / 26)) + 'px">',
      '  <div class="tb-pages"></div>',
      '  <div class="tb-cover">',
      '    <div class="tb-cover-front">',
      '      <span class="tb-kicker">3D BOOKS / VOLUME</span>',
      '      <span class="tb-title">' + esc(title) + "</span>",
      '      <span class="tb-sub">' + esc(subtitle) + "</span>",
      '      <span class="tb-author">' + esc(author) + "</span>",
      "    </div>",
      '    <div class="tb-cover-back"></div>',
      "  </div>",
      "</div>",
      '<div class="takeout-caption"><span>本棚から取り出しています…</span><button type="button" class="skip-btn">スキップ</button></div>',
    ].join("");

    document.body.appendChild(layer);
    const spineEl = layer.querySelector(".tb-spine");
    const bookEl = layer.querySelector(".tb-book");
    const coverEl = layer.querySelector(".tb-cover");
    const animations = [];
    let finished = false;

    const finish = (immediate) => {
      if (finished) return;
      finished = true;
      animations.forEach((animation) => {
        try { animation.cancel(); } catch (error) { /* noop */ }
      });
      layer.classList.add("done");
      window.setTimeout(() => {
        layer.remove();
        active = false;
        if (options.onDone) options.onDone();
      }, immediate ? 120 : 480);
    };

    const skip = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      finish(true);
    };
    layer.addEventListener("click", (event) => {
      if (event.target.closest(".skip-btn") || event.target === layer) skip(event);
    });
    const onKey = (event) => {
      if (event.key === "Escape" || event.key === " ") skip(event);
    };
    window.addEventListener("keydown", onKey);

    animations.push(
      spineEl.animate(
        [
          { transform: "translate3d(0,0,0) rotateY(0deg)", opacity: 1, offset: 0 },
          {
            transform:
              "translate3d(" + dx * 0.32 + "px," + dy * 0.32 + "px,70px) rotateY(10deg)",
            opacity: 1,
            offset: 0.38,
          },
          {
            transform:
              "translate3d(" + dx + "px," + dy + "px,190px) rotateY(88deg)",
            opacity: 0,
            offset: 0.86,
          },
        ],
        { duration: 1050, easing: "cubic-bezier(.22,.8,.2,1)", fill: "forwards" }
      )
    );

    animations.push(
      bookEl.animate(
        [
          {
            transform:
              "translate3d(" + dx + "px," + dy + "px,0) rotateY(-88deg) scale(" +
              (rect.width / targetW) + "," + (rect.height / targetH) + ")",
            opacity: 0,
            offset: 0,
          },
          {
            transform:
              "translate3d(" + dx * 0.45 + "px," + (dy * 0.45 - 24) + "px,90px) rotateY(-42deg) scale(.62,.68)",
            opacity: 0.45,
            offset: 0.34,
          },
          {
            transform: "translate3d(0,0,190px) rotateY(0deg) scale(1,1)",
            opacity: 1,
            offset: 0.84,
          },
          {
            transform: "translate3d(0,0,190px) rotateY(0deg) scale(1,1)",
            opacity: 1,
            offset: 1,
          },
        ],
        { duration: 1350, delay: 60, easing: "cubic-bezier(.22,.8,.2,1)", fill: "forwards" }
      )
    );

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (finished) return;
      // 表紙を開く
      const open = coverEl.animate(
        [
          { transform: "rotateY(0deg)", offset: 0 },
          { transform: "rotateY(-16deg)", offset: 0.22 },
          { transform: "rotateY(-168deg)", offset: 1 },
        ],
        { duration: 980, easing: "cubic-bezier(.6,.04,.2,1)", fill: "forwards" }
      );
      animations.push(open);
      open.finished.then(() => {
        if (finished) return;
        window.removeEventListener("keydown", onKey);
        window.setTimeout(() => finish(false), 260);
      }).catch(() => {});
    });
  }

  window.Takeout = { play: play };
})();
`;
