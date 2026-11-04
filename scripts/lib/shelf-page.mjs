import { BASE_CSS, SHELF_CSS } from "./theme.mjs";
import { escapeHtml } from "./markdown.mjs";
import { renderShelf } from "./shelf.mjs";
import { TAKEOUT_JS } from "./takeout.mjs";

const SHELF_PAGE_CSS = `
body.shelf-page {
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 16%, rgba(201, 162, 39, 0.14), transparent 55%),
    radial-gradient(ellipse at 84% 92%, rgba(233, 69, 96, 0.07), transparent 42%),
    linear-gradient(180deg, #0b0f1d, #070a12 62%, #0c0906);
}

body.shelf-page::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.7;
  pointer-events: none;
}

body.shelf-page::after {
  content: "";
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 22%;
  background:
    linear-gradient(180deg, transparent, rgba(58, 36, 24, 0.16) 40%, rgba(12, 9, 6, 0.8)),
    repeating-linear-gradient(90deg, rgba(231, 205, 114, 0.03) 0 2px, transparent 2px 110px);
  pointer-events: none;
}

.shelf-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px clamp(18px, 4vw, 46px);
}
.shelf-brand {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: var(--ink);
}
.shelf-brand strong {
  font-family: var(--serif);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.3em;
}
.shelf-brand span {
  font-size: 0.56rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
}
.shelf-head-right { display: flex; align-items: center; gap: 12px; }
.shelf-count {
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  color: var(--ink-dim);
}

.shelf-main {
  position: relative;
  z-index: 2;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 86px 0 52px;
}
.shelf-intro {
  flex: 0 0 auto;
  text-align: center;
  padding: 0 24px 14px;
}
.shelf-intro h1 {
  margin: 4px 0 8px;
  font-family: var(--serif);
  font-size: clamp(1.9rem, 3.4vw, 3rem);
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--ink);
}
.shelf-intro p {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--ink-dim);
  line-height: 1.9;
}
.shelf-main .shelf-room {
  flex: 1 1 auto;
  min-height: 0;
}
.shelf-hint {
  flex: 0 0 auto;
  text-align: center;
  padding: 10px 24px 0;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  color: rgba(245, 240, 232, 0.35);
}
.shelf-footer {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: rgba(245, 240, 232, 0.28);
  white-space: nowrap;
}

@media (max-width: 820px) {
  body.shelf-page { overflow-y: auto; height: auto; min-height: 100vh; }
  .shelf-main { height: auto; min-height: 100vh; padding: 94px 0 70px; }
  .shelf-main .shelf-room { min-height: 60vh; }
  .shelf-intro h1 { font-size: 1.9rem; }
  .shelf-footer { position: static; transform: none; text-align: center; padding: 24px 16px 28px; white-space: normal; }
}
`;

function takeoutScript() {
  return `
(function () {
  const spines = Array.from(document.querySelectorAll(".spine"));
  spines.forEach((spine) => {
    spine.addEventListener("click", () => {
      const href = spine.dataset.href || (spine.dataset.slug + ".html");
      window.Takeout.play(spine, {
        onDone: function () { window.location.href = href; }
      });
    });
  });
})();
`;
}

export function renderShelfPage({ books, meta }) {
  const shelf = renderShelf(books, {
    emptyMessage: meta.emptyMessage || undefined,
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>本棚 - 3D BOOKS</title>
<meta name="description" content="Markdown から自動製本された 3D ブックの本棚。">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
${BASE_CSS}
${SHELF_CSS}
${SHELF_PAGE_CSS}
</style>
</head>
<body class="shelf-page">

<header class="shelf-header">
  <a class="shelf-brand" href="./" aria-label="本棚の先頭">
    <strong>3D BOOKS</strong>
    <span>Library / ${String(books.length).padStart(2, "0")} volumes</span>
  </a>
  <div class="shelf-head-right">
    <span class="shelf-count">${escapeHtml(meta.generated)}</span>
    ${meta.siteUrl ? `<a class="pill" href="${escapeHtml(meta.siteUrl)}">LP へ ↗</a>` : ""}
  </div>
</header>

<main class="shelf-main">
  <div class="shelf-intro">
    <p class="eyebrow">Take a book from the shelf</p>
    <h1>本棚</h1>
    <p>背表紙を選ぶと、本が棚から出てきます。<br>そのまま 3D ブックが開きます。</p>
  </div>

  <div class="shelf-room">
    ${shelf}
  </div>

  <p class="shelf-hint">クリック / Enter で取り出す · contents/ に Markdown を置くと自動で並びます</p>
</main>

<footer class="shelf-footer">3D BOOKS · Markdown → Bookshelf → Vercel</footer>

<script>
${TAKEOUT_JS}
${takeoutScript()}
</script>
</body>
</html>`;
}
