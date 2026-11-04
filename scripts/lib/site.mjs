import { BASE_CSS } from "./theme.mjs";
import { escapeHtml } from "./markdown.mjs";

const SITE_CSS = `
body.site { overflow-x: hidden; background: #0c1020; }

.site-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px clamp(18px, 4vw, 52px);
  background: linear-gradient(180deg, rgba(12, 16, 32, 0.92), rgba(12, 16, 32, 0));
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
.nav-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--ink);
}
.nav-brand strong {
  font-family: var(--serif);
  font-size: 0.88rem;
  letter-spacing: 0.28em;
}
.nav-brand span {
  font-size: 0.54rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
}
.nav-links { display: flex; align-items: center; gap: 10px; }
.nav-links a {
  padding: 7px 13px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--ink-dim);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.nav-links a:hover { color: var(--gold-soft); border-color: rgba(201, 162, 39, 0.35); background: rgba(201, 162, 39, 0.08); }
.nav-links a.primary { color: #14100a; background: var(--gold); border-color: var(--gold); }
.nav-links a.primary:hover { background: var(--gold-soft); }

.wrap { width: min(1140px, calc(100% - 48px)); margin: 0 auto; }

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
  overflow: hidden;
}
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 24% 20%, rgba(201, 162, 39, 0.14), transparent 52%),
    radial-gradient(ellipse at 78% 78%, rgba(233, 69, 96, 0.08), transparent 46%);
  pointer-events: none;
}
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
  pointer-events: none;
}
.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: center;
  gap: clamp(32px, 6vw, 80px);
}
.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  font-size: 0.64rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
}
.hero-label::before {
  content: "";
  width: 38px;
  height: 1px;
  background: var(--gold);
}
.hero h1 {
  font-family: var(--serif);
  font-size: clamp(2.6rem, 6.2vw, 5.4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.hero h1 em {
  font-style: normal;
  color: var(--gold-soft);
  background: linear-gradient(transparent 72%, rgba(201, 162, 39, 0.25) 72%);
}
.hero-lead {
  max-width: 540px;
  margin: 26px 0 30px;
  font-size: 0.9rem;
  line-height: 2;
  color: var(--ink-dim);
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}
.btn:hover { transform: translateY(-2px); }
.btn.primary { background: var(--gold); color: #14100a; border: 1px solid var(--gold); font-weight: 600; }
.btn.primary:hover { background: var(--gold-soft); }
.btn.ghost { border: 1px solid rgba(231, 205, 114, 0.35); color: var(--gold-soft); }
.btn.ghost:hover { background: rgba(201, 162, 39, 0.1); border-color: var(--gold); }

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 26px;
  margin-top: 44px;
  padding-top: 22px;
  border-top: 1px solid rgba(201, 162, 39, 0.18);
}
.hero-stat strong {
  display: block;
  font-family: var(--serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.2;
}
.hero-stat span {
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1600px;
}
.hero-visual::before {
  content: "";
  position: absolute;
  width: 78%;
  height: 78%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.16), transparent 65%);
  filter: blur(10px);
}
.hero-book {
  position: relative;
  width: min(300px, 72%);
  aspect-ratio: 0.71;
  transform: rotateY(-20deg) rotateX(5deg) rotateZ(1deg);
  transform-style: preserve-3d;
  animation: hero-float 7s ease-in-out infinite;
  filter: drop-shadow(0 40px 50px rgba(0, 0, 0, 0.55));
}
.hero-book::before {
  content: "";
  position: absolute;
  top: 1.5%;
  bottom: 1.5%;
  right: -7px;
  width: 12px;
  border-radius: 0 4px 4px 0;
  background: repeating-linear-gradient(180deg, #f7f2e8 0 2px, #d9cfbd 2px 3px);
  box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.2);
}
.hero-book::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 2px 6px 6px 2px;
  background:
    radial-gradient(circle at 76% 14%, rgba(201, 162, 39, 0.22), transparent 42%),
    linear-gradient(145deg, #18203c, #0b1020 60%, #070a14);
  border: 1px solid rgba(231, 205, 114, 0.34);
  box-shadow: inset 0 0 0 7px rgba(231, 205, 114, 0.06);
}
.hero-book-inner {
  position: absolute;
  inset: 8% 9%;
  z-index: 2;
  border: 1px solid rgba(231, 205, 114, 0.24);
  padding: 15% 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}
.hero-book-inner .hb-kicker {
  font-size: 0.5rem;
  letter-spacing: 0.34em;
  color: var(--gold);
  text-transform: uppercase;
}
.hero-book-inner .hb-title {
  font-family: var(--serif);
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--ink);
}
.hero-book-inner .hb-sub {
  font-size: 0.55rem;
  line-height: 1.8;
  letter-spacing: 0.08em;
  color: var(--ink-dim);
}
.hero-book-inner .hb-mark {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(231, 205, 114, 0.5);
  transform: rotate(45deg);
}
@keyframes hero-float {
  0%, 100% { transform: rotateY(-20deg) rotateX(5deg) rotateZ(1deg) translateY(0); }
  50% { transform: rotateY(-16deg) rotateX(3deg) rotateZ(-1deg) translateY(-14px); }
}

.section { position: relative; padding: clamp(70px, 10vw, 120px) 0; }
.section.alt {
  background:
    radial-gradient(ellipse at 10% 0%, rgba(201, 162, 39, 0.05), transparent 45%),
    #090d18;
  border-top: 1px solid rgba(201, 162, 39, 0.1);
  border-bottom: 1px solid rgba(201, 162, 39, 0.1);
}
.section-head { margin-bottom: 44px; }
.section-head .eyebrow { display: block; margin-bottom: 10px; }
.section-head h2 {
  font-family: var(--serif);
  font-size: clamp(1.9rem, 3.6vw, 3rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.03em;
}
.section-head p {
  max-width: 620px;
  margin-top: 14px;
  font-size: 0.84rem;
  line-height: 1.95;
  color: var(--ink-dim);
}

.shelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 18px;
}
.book-card {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  padding: 20px;
  border: 1px solid rgba(201, 162, 39, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(28, 36, 64, 0.55), rgba(12, 16, 32, 0.35));
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.book-card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 162, 39, 0.5);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35), 0 0 24px rgba(201, 162, 39, 0.08);
}
.mini-cover {
  position: relative;
  width: 74px;
  height: 104px;
  border-radius: 2px 4px 4px 2px;
  background:
    radial-gradient(circle at 78% 16%, rgba(201, 162, 39, 0.24), transparent 45%),
    linear-gradient(145deg, #18203c, #0a0e1c);
  border: 1px solid rgba(231, 205, 114, 0.3);
  box-shadow: 6px 8px 18px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 6px;
  text-align: center;
  overflow: hidden;
}
.mini-cover::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(231, 205, 114, 0.14);
}
.mini-cover span {
  position: relative;
  z-index: 1;
  font-family: var(--serif);
  font-size: 0.58rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: var(--ink);
  max-height: 84px;
  overflow: hidden;
}
.book-card-body { min-width: 0; }
.book-card-body h3 {
  font-family: var(--serif);
  font-size: 1rem;
  line-height: 1.45;
  margin-bottom: 5px;
}
.book-card-body p {
  font-size: 0.68rem;
  line-height: 1.7;
  color: var(--ink-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-family: var(--mono);
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.book-card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gold); }

.more-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 28px; flex-wrap: wrap; }
.more-row p { font-size: 0.72rem; color: var(--muted); letter-spacing: 0.06em; }

.steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 34px;
}
.step {
  position: relative;
  padding: 24px 20px 22px;
  border: 1px solid rgba(201, 162, 39, 0.16);
  border-radius: 8px;
  background: rgba(20, 26, 48, 0.45);
}
.step-num {
  display: block;
  margin-bottom: 12px;
  font-family: var(--serif);
  font-size: 1.5rem;
  color: var(--gold);
  line-height: 1;
}
.step h3 { font-size: 0.86rem; margin-bottom: 8px; }
.step p { font-size: 0.68rem; line-height: 1.8; color: var(--ink-dim); }
.step code { font-family: var(--mono); font-size: 0.62rem; color: var(--gold-soft); }

.diagram {
  position: relative;
  border: 1px solid rgba(201, 162, 39, 0.22);
  border-radius: 10px;
  overflow: hidden;
  background: #080b14;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
}
.diagram-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(201, 162, 39, 0.14);
  background: rgba(20, 26, 48, 0.65);
}
.diagram-bar span { font-size: 0.62rem; letter-spacing: 0.18em; color: var(--ink-dim); text-transform: uppercase; }
.diagram-bar a { font-size: 0.62rem; letter-spacing: 0.08em; color: var(--gold-soft); }
.diagram iframe {
  display: block;
  width: 100%;
  height: 1000px;
  border: 0;
  background: #080b14;
}
.diagram-missing {
  padding: 60px 30px;
  text-align: center;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.9;
}
.diagram-missing code { color: var(--gold-soft); font-family: var(--mono); }

.publish-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.publish-card {
  padding: 26px;
  border: 1px solid rgba(201, 162, 39, 0.18);
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(28, 36, 64, 0.5), rgba(12, 16, 32, 0.3));
}
.publish-card .pc-role {
  display: inline-block;
  margin-bottom: 12px;
  padding: 3px 9px;
  border: 1px solid rgba(201, 162, 39, 0.35);
  border-radius: 999px;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  color: var(--gold-soft);
  text-transform: uppercase;
}
.publish-card h3 { font-family: var(--serif); font-size: 1.2rem; margin-bottom: 8px; }
.publish-card p { font-size: 0.72rem; line-height: 1.9; color: var(--ink-dim); }
.publish-card a { display: inline-block; margin-top: 14px; font-size: 0.68rem; letter-spacing: 0.08em; }

.start-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 30px;
  align-items: start;
}
.start-copy p { font-size: 0.8rem; line-height: 1.95; color: var(--ink-dim); margin-bottom: 14px; }
.start-copy ul { list-style: none; margin-top: 16px; }
.start-copy li {
  padding: 7px 0 7px 18px;
  position: relative;
  font-size: 0.72rem;
  color: var(--ink-dim);
  border-bottom: 1px dashed rgba(201, 162, 39, 0.12);
}
.start-copy li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1.1em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold);
}
.terminal {
  border: 1px solid rgba(201, 162, 39, 0.22);
  border-radius: 8px;
  overflow: hidden;
  background: #080b13;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}
.terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  background: #141a30;
  border-bottom: 1px solid rgba(201, 162, 39, 0.14);
}
.terminal-dots { display: flex; gap: 5px; }
.terminal-dots span { width: 7px; height: 7px; border-radius: 50%; background: #3a4160; }
.terminal-dots span:first-child { background: #e94560; }
.terminal-dots span:nth-child(2) { background: #c9a227; }
.terminal-dots span:nth-child(3) { background: #4f9d69; }
.copy-btn {
  padding: 4px 10px;
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 4px;
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--gold-soft);
}
.copy-btn:hover { background: rgba(201, 162, 39, 0.12); }
.terminal pre {
  padding: 18px 20px;
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 0.72rem;
  line-height: 1.9;
  color: #cdd3e0;
}
.terminal .c { color: #737a8c; }
.terminal .g { color: #b8d98a; }
.terminal .y { color: #e8c66a; }

.site-footer {
  padding: 44px 0 34px;
  border-top: 1px solid rgba(201, 162, 39, 0.12);
  text-align: center;
}
.site-footer strong { display: block; font-family: var(--serif); letter-spacing: 0.3em; font-size: 0.8rem; }
.site-footer p { margin-top: 8px; font-size: 0.6rem; letter-spacing: 0.14em; color: var(--muted); }

@media (max-width: 980px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-visual { order: -1; min-height: 300px; }
  .hero-book { width: min(240px, 58%); }
  .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .start-grid { grid-template-columns: 1fr; }
  .diagram iframe { height: 760px; }
}
@media (max-width: 640px) {
  .wrap { width: calc(100% - 32px); }
  .nav-links a { padding: 6px 10px; font-size: 0.6rem; }
  .nav-links a:not(.primary) { display: none; }
  .hero { padding-top: 100px; }
  .hero h1 { font-size: clamp(2.2rem, 12vw, 3.2rem); }
  .hero-stats { gap: 18px; }
  .steps, .publish-grid { grid-template-columns: 1fr; }
  .diagram iframe { height: 620px; }
}
`;

function bookCards(books, baseUrl) {
  if (!books.length) {
    return `<div class="diagram-missing">まだ本がありません。<code>contents/</code> に Markdown を置いてください。</div>`;
  }
  return books
    .map((book) => {
      const url = `${baseUrl.replace(/\/$/, "")}/${book.href}`;
      return `
        <a class="book-card" href="${escapeHtml(url)}">
          <div class="mini-cover"><span>${escapeHtml(book.title)}</span></div>
          <div class="book-card-body">
            <h3>${escapeHtml(book.title)}</h3>
            <p>${escapeHtml(book.description)}</p>
            <div class="book-card-meta">
              <span>${escapeHtml(book.author)}</span><span class="dot"></span><span>${book.pages} PAGES</span>
            </div>
          </div>
        </a>`;
    })
    .join("");
}

export function renderSitePage({ books, meta }) {
  const baseUrl = (meta.booksBaseUrl || "").replace(/\/$/, "");
  const shelfUrl = `${baseUrl}/`;
  const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0);
  const latest = books[0] || {
    title: "MCP と A2A",
    subtitle: "マルチエージェント時代の接続プロトコル",
  };

  const diagram = meta.mechanismAvailable
    ? `<iframe src="./mechanism.html?theme=dark&embed=1" title="3D BOOKS 自動製本パイプラインの仕組み" loading="lazy"></iframe>`
    : `<div class="diagram-missing">仕組み図は <code>site/mechanism.html</code> に配置すると表示されます。<br>Archify で生成したワークフロー図をここに載せています。</div>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>3D BOOKS - Markdown を置く。本になる。</title>
<meta name="description" content="contents/ に Markdown を置くと、3D 本棚と一冊の 3D ブックが自動生成され、Vercel と GitHub Pages に公開されます。">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
${BASE_CSS}
${SITE_CSS}
</style>
</head>
<body class="site">

<nav class="site-nav">
  <a class="nav-brand" href="./">
    <strong>3D BOOKS</strong>
    <span>Markdown bindery</span>
  </a>
  <div class="nav-links">
    <a href="#shelf">本棚</a>
    <a href="#mechanism">仕組み</a>
    <a href="#start">はじめかた</a>
    <a class="primary" href="${escapeHtml(shelfUrl)}">本棚を開く ↗</a>
  </div>
</nav>

<header class="hero">
  <div class="wrap hero-grid">
    <div>
      <div class="hero-label">Automated 3D book bindery</div>
      <h1>置くだけで、<br><em>本になる。</em></h1>
      <p class="hero-lead">
        <code>contents/</code> に Markdown を置くと、3D 本棚と一冊の 3D ブックが生まれます。
        ページめくりも、棚からの取り出しも、すべて CSS と JavaScript だけで動きます。
      </p>
      <div class="hero-actions">
        <a class="btn primary" href="${escapeHtml(shelfUrl)}">本棚を開く <span aria-hidden="true">↗</span></a>
        <a class="btn ghost" href="#mechanism">仕組みを見る</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><strong>${String(books.length).padStart(2, "0")}</strong><span>Volumes</span></div>
        <div class="hero-stat"><strong>${totalPages}</strong><span>Pages bound</span></div>
        <div class="hero-stat"><strong>1</strong><span>Markdown file</span></div>
        <div class="hero-stat"><strong>2</strong><span>Deploy targets</span></div>
      </div>
    </div>

    <div class="hero-visual" aria-hidden="true">
      <div class="hero-book">
        <div class="hero-book-inner">
          <span class="hb-kicker">3D BOOKS / VOL. 01</span>
          <span class="hb-title">${escapeHtml(latest.title)}</span>
          <span class="hb-sub">${escapeHtml(latest.subtitle || "")}</span>
          <span class="hb-mark"></span>
          <span class="hb-kicker">Markdown bindery</span>
        </div>
      </div>
    </div>
  </div>
</header>

<section class="section" id="shelf">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Library / ${String(books.length).padStart(2, "0")} volumes</span>
      <h2>本棚</h2>
      <p>背表紙をクリックすると、本が棚から出てきて開きます。本棚と本は Vercel で公開されています。</p>
    </div>

    <div class="shelf-grid">
      ${bookCards(books, baseUrl)}
    </div>

    <div class="more-row">
      <p>新しい原稿は <code>contents/</code> に置くだけ。ビルドが本棚に並べます。</p>
      <a class="btn ghost" href="${escapeHtml(shelfUrl)}">本棚で取り出す ↗</a>
    </div>
  </div>
</section>

<section class="section alt" id="mechanism">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">How it works</span>
      <h2>Markdown が本になるまで</h2>
      <p>原稿の配置を合図に、解析・ページ分割・製本・公開までが自動で走ります。ローカルでは watcher、GitHub では push がトリガーです。</p>
    </div>

    <div class="steps">
      <div class="step">
        <span class="step-num">01</span>
        <h3>Markdown を置く</h3>
        <p><code>contents/</code> に <code>.md</code> を追加。front matter で書名・著者・説明を指定できます。</p>
      </div>
      <div class="step">
        <span class="step-num">02</span>
        <h3>自動ビルド</h3>
        <p><code>npm run dev</code> の watcher、または GitHub への push が製本を開始します。</p>
      </div>
      <div class="step">
        <span class="step-num">03</span>
        <h3>本棚と本を生成</h3>
        <p>見出し・表・コードを解析し、章ごとにページ分割。背表紙と 3D ブックを <code>books/</code> に書き出します。</p>
      </div>
      <div class="step">
        <span class="step-num">04</span>
        <h3>2 つの場所へ公開</h3>
        <p>本棚と本は Vercel、この LP と仕組み図は GitHub Pages へ。役割を分けて公開します。</p>
      </div>
    </div>

    <div class="diagram">
      <div class="diagram-bar">
        <span>Archify / Workflow diagram</span>
        <a href="./mechanism.html?theme=dark" target="_blank" rel="noopener">全画面で開く ↗</a>
      </div>
      ${diagram}
    </div>
  </div>
</section>

<section class="section" id="publish">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Two deploy targets</span>
      <h2>公開の分担</h2>
      <p>LP と成果物でホスティングを分けています。どちらも静的ファイルなので、ビルド後はそのまま配れます。</p>
    </div>

    <div class="publish-grid">
      <div class="publish-card">
        <span class="pc-role">GitHub Pages</span>
        <h3>LP / 仕組み図</h3>
        <p>このランディングページと Archify のワークフロー図を配信します。原稿が追加されるたびに GitHub Actions が LP を再ビルドします。</p>
        <a href="#mechanism">仕組み図を見る →</a>
      </div>
      <div class="publish-card">
        <span class="pc-role">Vercel</span>
        <h3>本棚 / 3D ブック</h3>
        <p>背表紙が並ぶ本棚と、取り出しアニメーション付きの 3D ブックを配信します。Vercel のビルドでも <code>contents/</code> から自動製本されます。</p>
        <a href="${escapeHtml(shelfUrl)}" target="_blank" rel="noopener">本棚を開く ↗</a>
      </div>
    </div>
  </div>
</section>

<section class="section alt" id="start">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Get started</span>
      <h2>はじめかた</h2>
      <p>原稿を置いて、ローカルで確認。公開は push するだけです。</p>
    </div>

    <div class="start-grid">
      <div class="start-copy">
        <p>原稿はプレーンな Markdown。front matter は任意ですが、書名・サブタイトル・著者・説明を入れると本棚と表紙が整います。</p>
        <ul>
          <li><code>npm run dev</code> — contents/ を監視して即時製本</li>
          <li><code>npm run preview</code> — ローカルで LP と本棚を確認</li>
          <li><code>npm run build</code> — books/ と site/ を一括生成</li>
          <li>push — GitHub Actions が LP を、Vercel が本棚を公開</li>
        </ul>
      </div>

      <div class="terminal">
        <div class="terminal-bar">
          <div class="terminal-dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <button class="copy-btn" id="copyCmd" type="button">COPY</button>
        </div>
        <pre id="cmd"><span class="c"># 1. 原稿を置く</span>
<span class="g">contents/</span>mcp-a2a.md

<span class="c"># 2. 監視ビルドを開始（置いた瞬間に製本）</span>
<span class="y">npm</span> run dev

<span class="c"># 3. プレビュー</span>
<span class="y">npm</span> run preview
<span class="c"># → http://localhost:4173/site/</span>

<span class="c"># 4. 公開</span>
<span class="y">git</span> add contents/ books/ site/
<span class="y">git</span> commit -m "add a new book"
<span class="y">git</span> push</pre>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer">
  <strong>3D BOOKS</strong>
  <p>Markdown → Bookshelf → Vercel / GitHub Pages · Generated ${escapeHtml(meta.generated)}</p>
</footer>

<script>
(function () {
  const button = document.getElementById("copyCmd");
  const cmd = document.getElementById("cmd");
  if (!button || !cmd) return;
  button.addEventListener("click", async function () {
    const text = cmd.innerText;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "COPIED";
      window.setTimeout(function () { button.textContent = "COPY"; }, 1600);
    } catch (error) {
      button.textContent = "FAILED";
      window.setTimeout(function () { button.textContent = "COPY"; }, 1600);
    }
  });
})();
</script>
</body>
</html>`;
}
