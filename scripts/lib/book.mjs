import { BASE_CSS, SHELF_CSS } from "./theme.mjs";
import { escapeHtml, highlightCode, inline } from "./markdown.mjs";
import { chapterStarts } from "./paginate.mjs";
import { renderShelf } from "./shelf.mjs";
import { TAKEOUT_JS } from "./takeout.mjs";

const BOOK_CSS = `
.reader {
  position: fixed;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.7s ease, visibility 0.7s;
  background:
    radial-gradient(ellipse at 50% 12%, rgba(201, 162, 39, 0.11), transparent 52%),
    radial-gradient(ellipse at 12% 88%, rgba(233, 69, 96, 0.07), transparent 46%),
    linear-gradient(180deg, #0c1020, #070a14);
}
.reader.ready { opacity: 1; visibility: visible; }

.reader::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.045'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.55;
  pointer-events: none;
}

.reader-topbar {
  position: fixed;
  top: 18px;
  left: 22px;
  right: 22px;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  pointer-events: none;
}
.reader-topbar > * { pointer-events: auto; }

.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border: 1px solid rgba(201, 162, 39, 0.28);
  border-radius: 999px;
  background: rgba(12, 16, 32, 0.58);
  color: var(--ink-dim);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
}
.pill:hover { border-color: var(--gold); color: var(--gold-soft); background: rgba(201, 162, 39, 0.1); }

.reader-title {
  min-width: 0;
  text-align: center;
  font-family: var(--serif);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  color: rgba(245, 240, 232, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 22px 86px;
  perspective: 2800px;
  perspective-origin: 50% 44%;
}

.book {
  position: relative;
  flex: none;
  width: 960px;
  height: 640px;
  transform: scale(var(--book-scale, 1));
  transform-origin: center center;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.645, 0.045, 0.355, 1);
  will-change: transform;
}
.book.single { width: 480px; }
.book.closed:not(.single) { transform: translateX(-25%) scale(var(--book-scale, 1)); }

.book-gutter {
  position: absolute;
  left: 50%;
  top: 1%;
  width: 34px;
  height: 98%;
  transform: translateX(-50%);
  z-index: 60;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.16) 42%, rgba(0, 0, 0, 0.24) 50%, rgba(0, 0, 0, 0.16) 58%, transparent);
  filter: blur(0.4px);
}
.book.single .book-gutter { display: none; }

.page-container {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.page {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition: transform 0.86s cubic-bezier(0.645, 0.045, 0.355, 1);
  will-change: transform;
}
.page.flipped { transform: rotateY(-180deg); }
.page.flipping { z-index: 999 !important; }

.book.single .page { left: 0; width: 100%; }

.page-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--paper);
  border-radius: 2px 6px 6px 2px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.25),
    inset 18px 0 28px rgba(0, 0, 0, 0.045);
}
.page-back {
  transform: rotateY(180deg);
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.045), transparent 9%),
    var(--paper-dark);
}
.page-front::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(270deg, transparent 88%, rgba(0, 0, 0, 0.05));
}

.page-content {
  position: absolute;
  inset: 0;
  padding: 34px 34px 42px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 162, 39, 0.5) transparent;
}
.page-content::-webkit-scrollbar { width: 5px; }
.page-content::-webkit-scrollbar-thumb { background: rgba(201, 162, 39, 0.45); border-radius: 3px; }
/* 最後のブロックの余白で不要なスクロールバーが出ないようにする */
.page-content > :last-child { margin-bottom: 0; }

.page-number {
  position: absolute;
  bottom: 13px;
  z-index: 2;
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: #9a8f7e;
}
.page-front .page-number { right: 24px; }
.page-back .page-number { left: 24px; }

/* ---- 紙面の組版 ---- */
.chapter-head { margin-bottom: 18px; }
.chapter-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.chapter-num {
  font-family: var(--serif);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gold);
}
.chapter-kicker {
  font-size: 0.55rem;
  letter-spacing: 0.28em;
  color: #a49a88;
  text-transform: uppercase;
}
.chapter-head h2 {
  font-family: var(--serif);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
  color: #16213e;
  padding-bottom: 9px;
  border-bottom: 2px solid var(--gold);
}
.continued {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #a49a88;
}

.page-content h3 {
  position: relative;
  margin: 20px 0 9px;
  padding-left: 13px;
  font-family: var(--sans);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5;
  color: #0f3460;
}
.page-content h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.28em;
  width: 4px;
  height: 1.05em;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--gold), rgba(201, 162, 39, 0.2));
}
.page-content h4 {
  margin: 16px 0 7px;
  font-family: var(--sans);
  font-size: 0.88rem;
  font-weight: 700;
  color: #7a5a14;
}
.page-content p {
  margin-bottom: 11px;
  font-size: 0.865rem;
  line-height: 1.9;
  color: var(--text);
  text-align: justify;
  text-justify: inter-ideograph;
}
.page-content strong { color: #11172a; font-weight: 700; }
.page-content em { font-style: normal; background: linear-gradient(transparent 68%, rgba(201, 162, 39, 0.28) 68%); }
.page-content del { color: #8e8678; }

.page-content ul,
.page-content ol { margin: 4px 0 12px 1.25em; }
.page-content li {
  margin-bottom: 6px;
  font-size: 0.845rem;
  line-height: 1.75;
  color: var(--text);
}
.page-content li[data-depth="1"] { margin-left: 1em; }
.page-content li[data-depth="2"] { margin-left: 2em; }
.page-content li[data-depth="3"] { margin-left: 3em; }
.page-content li::marker { color: var(--gold); }
.task-box { color: #7a5a14; font-weight: 700; margin-right: 5px; }

.page-content code {
  padding: 1px 5px;
  border-radius: 3px;
  background: #ebe3d4;
  color: #7a2f22;
  font-family: var(--mono);
  font-size: 0.86em;
}

.page-content a {
  color: #9a2f45;
  text-decoration: underline;
  text-decoration-color: rgba(233, 69, 96, 0.35);
  text-underline-offset: 2px;
}
.page-content a:hover { color: var(--rose); }

.page-content blockquote {
  margin: 12px 0;
  padding: 12px 16px;
  border-left: 3px solid var(--gold);
  background: rgba(201, 162, 39, 0.08);
  border-radius: 0 4px 4px 0;
  font-size: 0.83rem;
  line-height: 1.8;
  color: #4d4638;
}

.page-content hr {
  height: 1px;
  margin: 18px 0;
  border: 0;
  background: linear-gradient(90deg, transparent, var(--paper-line) 15%, var(--paper-line) 85%, transparent);
}

.table-wrap {
  margin: 10px 0 14px;
  overflow-x: auto;
  border: 1px solid #ded3c2;
  border-radius: 5px;
  background: #fbf7ef;
}
.page-content table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 0.7rem;
  line-height: 1.55;
}
.page-content th {
  padding: 7px 8px;
  background: #16213e;
  color: #f5f0e8;
  font-weight: 600;
  text-align: left;
  overflow-wrap: anywhere;
}
.page-content td {
  padding: 6px 8px;
  border-top: 1px solid #e6dccd;
  color: #2b3040;
  vertical-align: top;
  overflow-wrap: anywhere;
}
.page-content tbody tr:nth-child(even) { background: rgba(201, 162, 39, 0.055); }

.code-block {
  position: relative;
  margin: 12px 0 16px;
  border-radius: 5px;
  background: var(--code-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 3px 10px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}
.code-lang {
  padding: 6px 12px 0;
  font-family: var(--mono);
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7d8494;
}
.code-block pre {
  margin: 0;
  padding: 8px 13px 12px;
  overflow-x: hidden;
}
.code-block code {
  display: block;
  padding: 0;
  background: none;
  color: #f0eee8;
  font-family: var(--mono);
  font-size: 0.66rem;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 2;
}
.tok-com { color: #7f8a7a; font-style: italic; }
.tok-str { color: #b8d98a; }
.tok-kw { color: #7fd4e8; }
.tok-num { color: #e8b46a; }
.tok-fn { color: #f0a45d; }

/* ---- 表紙 ---- */
.cover-face {
  background:
    radial-gradient(circle at 78% 14%, rgba(201, 162, 39, 0.2), transparent 42%),
    radial-gradient(circle at 16% 88%, rgba(233, 69, 96, 0.12), transparent 46%),
    linear-gradient(145deg, #18203c 0%, #0e1328 52%, #080c18 100%);
  color: var(--ink);
}
.cover-face::before {
  content: "";
  position: absolute;
  inset: 16px;
  border: 1px solid rgba(231, 205, 114, 0.32);
  border-radius: 2px;
  pointer-events: none;
}
.cover-face::after {
  content: "";
  position: absolute;
  inset: 22px;
  border: 1px solid rgba(231, 205, 114, 0.1);
  border-radius: 2px;
  pointer-events: none;
}
.cover-inner {
  position: absolute;
  inset: 0;
  padding: 13% 12%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}
.cover-kicker {
  font-size: 0.62rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold);
}
.cover-emblem {
  position: relative;
  width: 46px;
  height: 46px;
  margin: 6px auto 2px;
  border: 1px solid rgba(231, 205, 114, 0.55);
  transform: rotate(45deg);
}
.cover-emblem::before {
  content: "";
  position: absolute;
  inset: 7px;
  border: 1px solid rgba(231, 205, 114, 0.3);
}
.cover-title {
  max-width: 96%;
  font-family: var(--serif);
  font-size: clamp(1.9rem, 4vw, 2.85rem);
  font-weight: 700;
  line-height: 1.24;
  letter-spacing: 0.03em;
  text-shadow: 0 3px 24px rgba(0, 0, 0, 0.55);
}
.cover-sub {
  max-width: 88%;
  font-size: 0.78rem;
  line-height: 1.8;
  letter-spacing: 0.11em;
  color: var(--ink-dim);
}
.cover-line {
  width: 58px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.cover-author {
  font-size: 0.66rem;
  letter-spacing: 0.22em;
  color: rgba(245, 240, 232, 0.55);
}
.cover-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--mono);
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  color: rgba(245, 240, 232, 0.4);
}

/* ---- 奥付・目次・おわり・裏表紙 ---- */
.about-face { background: var(--paper); }
.about-inner {
  position: absolute;
  inset: 0;
  padding: 46px 38px 40px;
  display: flex;
  flex-direction: column;
}
.about-inner h2 {
  font-family: var(--serif);
  font-size: 1.3rem;
  color: #16213e;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--gold);
}
.about-inner .about-desc {
  margin-top: 18px;
  font-size: 0.86rem;
  line-height: 1.95;
  color: var(--text);
}
.about-meta {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  margin-top: 22px;
  border-top: 1px solid var(--paper-line);
  font-size: 0.7rem;
}
.about-meta dt {
  padding: 8px 16px 8px 0;
  border-bottom: 1px solid var(--paper-line);
  color: #8c8271;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.about-meta dd {
  min-width: 0;
  padding: 8px 0;
  border-bottom: 1px solid var(--paper-line);
  color: #2b3040;
  font-family: var(--mono);
  text-align: right;
  overflow-wrap: anywhere;
}
.about-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
.about-tags span {
  padding: 3px 9px;
  border: 1px solid rgba(201, 162, 39, 0.4);
  border-radius: 999px;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: #7a5a14;
}
.about-note {
  margin-top: auto;
  padding-top: 16px;
  font-size: 0.64rem;
  line-height: 1.7;
  color: #9a9080;
  border-top: 1px dashed var(--paper-line);
}

.toc-face { background: var(--paper); }
.toc-inner { position: absolute; inset: 0; padding: 42px 38px; }
.toc-inner h2 {
  font-family: var(--serif);
  font-size: 1.35rem;
  color: #16213e;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--gold);
}
.toc-note { margin: 10px 0 12px; font-size: 0.64rem; letter-spacing: 0.12em; color: #9a9080; }
.toc-list { list-style: none; }
.toc-list li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 2px;
  border-bottom: 1px dashed #d9cebd;
  cursor: pointer;
  transition: color 0.2s ease, padding 0.2s ease;
}
.toc-list li:hover { color: var(--rose); padding-left: 6px; }
.toc-num {
  flex: 0 0 auto;
  font-family: var(--mono);
  font-size: 0.58rem;
  color: var(--gold);
  letter-spacing: 0.08em;
}
.toc-label {
  flex: 1;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #2b3040;
}
.toc-page {
  flex: 0 0 auto;
  font-family: var(--mono);
  font-size: 0.62rem;
  color: #9a9080;
}
.toc-foot { margin-top: 18px; font-size: 0.62rem; color: #9a9080; line-height: 1.8; }

.end-face {
  background:
    radial-gradient(ellipse at 50% 35%, rgba(201, 162, 39, 0.12), transparent 55%),
    var(--paper);
}
.end-inner {
  position: absolute;
  inset: 0;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.end-inner .end-mark {
  width: 34px;
  height: 34px;
  margin-bottom: 16px;
  border: 1px solid rgba(201, 162, 39, 0.55);
  transform: rotate(45deg);
}
.end-inner h2 {
  font-family: var(--serif);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #16213e;
}
.end-inner .cover-line { margin: 14px 0 18px; }
.end-inner p {
  max-width: 78%;
  font-size: 0.82rem;
  line-height: 1.95;
  color: #5d5648;
}
.end-actions { display: flex; gap: 12px; margin-top: 26px; flex-wrap: wrap; justify-content: center; }
.end-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(201, 162, 39, 0.5);
  border-radius: 999px;
  color: #7a5a14;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  transition: background 0.2s ease, color 0.2s ease;
}
.end-btn:hover { background: #16213e; color: var(--paper); }
.end-note { margin-top: 26px; font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.12em; color: #9a9080; }

.backcover-face {
  background:
    radial-gradient(circle at 72% 20%, rgba(201, 162, 39, 0.16), transparent 42%),
    radial-gradient(circle at 20% 82%, rgba(233, 69, 96, 0.08), transparent 48%),
    linear-gradient(145deg, #0e1328 0%, #090d1a 100%);
  color: var(--ink);
}
.backcover-inner {
  position: absolute;
  inset: 22px;
  border: 1px solid rgba(231, 205, 114, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
}
.backcover-inner .bc-mark {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(231, 205, 114, 0.55);
  transform: rotate(45deg);
}
.backcover-inner .bc-title {
  font-family: var(--serif);
  font-size: 1.1rem;
  letter-spacing: 0.32em;
  color: var(--gold-soft);
}
.backcover-inner .bc-note {
  max-width: 70%;
  font-size: 0.66rem;
  line-height: 1.8;
  letter-spacing: 0.12em;
  color: rgba(245, 240, 232, 0.45);
}

/* ---- ナビゲーション ---- */
.reader-hint {
  position: fixed;
  bottom: 82px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 70;
  color: rgba(245, 240, 232, 0.36);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  pointer-events: none;
  white-space: nowrap;
}

.nav-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 9px 20px;
  border: 1px solid rgba(201, 162, 39, 0.22);
  border-radius: 999px;
  background: rgba(12, 16, 32, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
.nav-btn {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(201, 162, 39, 0.45);
  border-radius: 50%;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s ease, transform 0.25s ease, opacity 0.25s ease;
}
.nav-btn:hover:not(:disabled) { background: var(--gold); color: #14100a; transform: scale(1.08); }
.nav-btn:disabled { opacity: 0.28; cursor: not-allowed; }
.page-indicator {
  min-width: 100px;
  text-align: center;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--ink-dim);
}

/* ---- 開幕の本棚 ---- */
.intro {
  position: fixed;
  inset: 0;
  z-index: 500;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 22%, rgba(201, 162, 39, 0.14), transparent 55%),
    radial-gradient(ellipse at 80% 90%, rgba(233, 69, 96, 0.06), transparent 40%),
    linear-gradient(180deg, #0b0f1d, #070a12 65%, #0c0906);
  opacity: 1;
  transition: opacity 0.65s ease, visibility 0.65s;
}
.intro.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.intro::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28%;
  background:
    linear-gradient(180deg, transparent, rgba(58, 36, 24, 0.28) 35%, rgba(22, 13, 8, 0.85)),
    repeating-linear-gradient(90deg, rgba(231, 205, 114, 0.035) 0 2px, transparent 2px 90px);
  pointer-events: none;
}

.intro-brand {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  font-family: var(--serif);
  font-size: 0.72rem;
  letter-spacing: 0.42em;
  color: var(--gold);
  white-space: nowrap;
}

.intro-shelf {
  position: absolute;
  inset: 8vh 0 10vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-caption {
  position: absolute;
  bottom: 5vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 18px;
  color: rgba(245, 240, 232, 0.5);
  font-size: 0.68rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  white-space: nowrap;
}
.intro-skip {
  padding: 8px 18px;
  border: 1px solid rgba(231, 205, 114, 0.3);
  border-radius: 999px;
  color: var(--gold-soft);
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  transition: background 0.25s ease;
}
.intro-skip:hover { background: rgba(201, 162, 39, 0.14); }

@media (max-width: 900px) {
  .reader-topbar { top: 10px; left: 12px; right: 12px; }
  .reader-title { display: none; }
  .scene { padding: 60px 10px 90px; }
  .nav-controls { gap: 10px; padding: 7px 14px; }
  .reader-hint { display: none; }
  .intro-shelf { inset: 12vh 0 14vh; }
  .intro-caption { font-size: 0.58rem; letter-spacing: 0.16em; }
}
`;

function renderList(block) {
  const tag = block.ordered ? "ol" : "ul";
  const items = block.items
    .map((item) => {
      const task =
        item.checked === null
          ? ""
          : `<span class="task-box">${item.checked ? "☑" : "☐"}</span>`;
      return `<li data-depth="${item.depth}">${task}${inline(item.text)}</li>`;
    })
    .join("");
  return `<${tag}>${items}</${tag}>`;
}

function renderTable(block) {
  const head = block.headers
    .map((cell, index) => {
      const align = block.align[index] ? ` style="text-align:${block.align[index]}"` : "";
      return `<th${align}>${inline(cell)}</th>`;
    })
    .join("");
  const body = block.rows
    .map((row) => {
      const cells = block.headers
        .map((_, index) => {
          const align = block.align[index] ? ` style="text-align:${block.align[index]}"` : "";
          return `<td${align}>${inline(row[index] || "")}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderBlocks(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return block.level <= 3
            ? `<h3>${inline(block.text)}</h3>`
            : `<h4>${inline(block.text)}</h4>`;
        case "paragraph":
          return `<p>${inline(block.text)}</p>`;
        case "list":
          return renderList(block);
        case "table":
          return renderTable(block);
        case "code": {
          const label = escapeHtml(block.lang || "text") + (block.continued ? " · 続き" : "");
          return `<div class="code-block" data-lang="${escapeHtml(block.lang)}">
            <div class="code-lang">${label}</div>
            <pre><code>${highlightCode(block.code)}</code></pre>
          </div>`;
        }
        case "quote":
          return `<blockquote>${inline(block.text).replace(/\n/g, "<br>")}</blockquote>`;
        case "hr":
          return "<hr>";
        default:
          return "";
      }
    })
    .join("\n");
}

function pageNumber(faceIndex) {
  return `<span class="page-number">${String(faceIndex + 1).padStart(2, "0")}</span>`;
}

function coverFace(book, meta) {
  return `
    <div class="page-face page-front cover-face">
      <div class="cover-inner">
        <div class="cover-kicker">3D BOOKS / VOL. ${String(meta.volume).padStart(2, "0")}</div>
        <div class="cover-emblem" aria-hidden="true"></div>
        <h1 class="cover-title">${escapeHtml(book.title)}</h1>
        <div class="cover-line" aria-hidden="true"></div>
        <p class="cover-sub">${escapeHtml(book.subtitle)}</p>
        <div class="cover-author">${escapeHtml(book.author)}</div>
        <div class="cover-meta"><span>${meta.pageCount} PAGES</span><span>·</span><span>${escapeHtml(meta.date)}</span></div>
      </div>
    </div>`;
}

function aboutFace(book, meta) {
  const tags = book.tags.length
    ? `<div class="about-tags">${book.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";
  return `
    <div class="page-face page-back about-face">
      <div class="about-inner">
        <h2>この本について</h2>
        <p class="about-desc">${inline(book.description)}</p>
        ${tags}
        <dl class="about-meta">
          <dt>原稿</dt><dd>contents/${escapeHtml(meta.slug)}.md</dd>
          <dt>製本</dt><dd>books/${escapeHtml(meta.slug)}.html</dd>
          <dt>ページ</dt><dd>${meta.pageCount} pages</dd>
          <dt>生成</dt><dd>${escapeHtml(meta.date)}</dd>
          <dt>公開</dt><dd>Vercel / GitHub Pages</dd>
        </dl>
        <p class="about-note">この本は <strong>contents/*.md</strong> から自動製本されました。Markdown を置くと、本棚と 3D ブックが更新されます。</p>
      </div>
      ${pageNumber(1)}
    </div>`;
}

function tocFace(book, pages, faceOffset) {
  const starts = chapterStarts(pages);
  const items = book.chapters
    .map((chapter, index) => {
      const start = starts.get(index);
      if (start === undefined) return "";
      const face = faceOffset + start;
      return `<li data-face="${face}" tabindex="0" role="button">
        <span class="toc-num">${String(index + 1).padStart(2, "0")}</span>
        <span class="toc-label">${escapeHtml(chapter.title)}</span>
        <span class="toc-page">p.${String(face + 1).padStart(2, "0")}</span>
      </li>`;
    })
    .join("");

  return `
    <div class="page-face page-front toc-face">
      <div class="toc-inner">
        <h2>目次</h2>
        <p class="toc-note">CONTENTS / 章を選ぶとそのページへ移動します</p>
        <ul class="toc-list">${items}</ul>
        <p class="toc-foot">← → キー、スワイプ、下のボタンでもページをめくれます。</p>
      </div>
      ${pageNumber(2)}
    </div>`;
}

function contentFace(page, faceIndex, chapterCount) {
  const chapterNo = String(page.chapterIndex + 1).padStart(2, "0");
  return `
    <div class="page-face page-front">
      <div class="page-content">
        <header class="chapter-head">
          <div class="chapter-meta">
            <span class="chapter-num">${chapterNo}</span>
            <span class="chapter-kicker">CHAPTER ${chapterNo} / ${String(chapterCount).padStart(2, "0")}</span>
          </div>
          <h2>${escapeHtml(page.chapter)}</h2>
          ${page.continued ? '<span class="continued">— 続き —</span>' : ""}
        </header>
        ${renderBlocks(page.blocks)}
      </div>
      ${pageNumber(faceIndex)}
    </div>`;
}

function endFace(book, meta) {
  return `
    <div class="page-face page-front end-face">
      <div class="end-inner">
        <div class="end-mark" aria-hidden="true"></div>
        <h2>おわり</h2>
        <div class="cover-line" aria-hidden="true"></div>
        <p>${escapeHtml(book.title)} を読み終えました。<br>気になった章は目次からいつでも開けます。</p>
        <div class="end-actions">
          <a class="end-btn" href="./">← 本棚に戻る</a>
          <button class="end-btn" type="button" data-face="2">目次へ</button>
        </div>
        <p class="end-note">3D BOOKS · ${escapeHtml(meta.slug)} · ${escapeHtml(meta.date)}</p>
      </div>
      ${pageNumber(meta.endFaceIndex)}
    </div>`;
}

function backCoverFace() {
  return `
    <div class="page-face page-back backcover-face">
      <div class="backcover-inner">
        <div class="bc-mark" aria-hidden="true"></div>
        <div class="bc-title">3D BOOKS</div>
        <p class="bc-note">Markdown を置く。本になる。<br>contents/ → books/ → Vercel</p>
      </div>
    </div>`;
}

function blankFace(faceIndex) {
  return `<div class="page-face ${faceIndex % 2 === 0 ? "page-front" : "page-back"}"></div>`;
}

export function buildFaces(book, pages) {
  const faceOffset = 3; // cover(0), about(1), toc(2)
  const faces = [];

  faces.push({ kind: "cover", html: coverFace(book, {
    volume: book.volume || 1,
    pageCount: pages.length,
    date: book.date || "",
    slug: book.slug,
  }) });
  faces.push({ kind: "about", html: aboutFace(book, {
    pageCount: pages.length,
    date: book.date || "",
    slug: book.slug,
  }) });
  faces.push({ kind: "toc", html: tocFace(book, pages, faceOffset) });

  pages.forEach((page, index) => {
    faces.push({
      kind: "content",
      html: contentFace(page, faceOffset + index, book.chapters.length),
    });
  });

  const endIndex = faces.length;
  faces.push({ kind: "end", html: endFace(book, {
    slug: book.slug,
    date: book.date || "",
    endFaceIndex: endIndex,
  }) });

  while (faces.length % 2 === 0) {
    faces.push({ kind: "blank", html: blankFace(faces.length) });
  }
  faces.push({ kind: "backcover", html: backCoverFace() });

  return faces;
}

function faceSide(html, index) {
  const side = index % 2 === 0 ? "page-front" : "page-back";
  return html.replace(/class="page-face[^"]*"/, (match) => {
    const extra = match
      .replace(/class="page-face\s*/, "")
      .replace(/"$/, "")
      .replace(/\bpage-(front|back)\b/g, "")
      .trim();
    return `class="page-face ${side}${extra ? " " + extra : ""}"`;
  });
}

function renderLeaves(faces) {
  const leaves = [];
  for (let i = 0; i < faces.length; i += 2) {
    leaves.push(`
      <div class="page" data-leaf="${i / 2}">
        ${faceSide(faces[i].html, i)}
        ${faces[i + 1] ? faceSide(faces[i + 1].html, i + 1) : ""}
      </div>`);
  }
  return leaves.join("");
}

const READER_JS = `
(function () {
  const book = document.getElementById("book");
  const leaves = Array.from(document.querySelectorAll(".page"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const indicator = document.getElementById("pageIndicator");
  const intro = document.getElementById("intro");
  const reader = document.getElementById("reader");
  const skipIntro = document.getElementById("skipIntro");
  const replayBtn = document.getElementById("replayBtn");
  const currentSpine = intro ? intro.querySelector(".spine.current") : null;

  let turned = 0;
  let animating = false;
  let introBusy = false;
  let introDone = false;

  function layout() {
    const single = window.matchMedia("(max-width: 760px)").matches;
    book.classList.toggle("single", single);
    // 紙面は固定サイズのまま、画面に合わせて全体を拡大縮小する。
    // これにより、どの画面幅でも 1 ページに入る文字量が変わらない。
    const designWidth = single ? 480 : 960;
    const designHeight = 640;
    const compact = window.innerWidth <= 900;
    const availableWidth = window.innerWidth - (compact ? 20 : 44);
    const availableHeight = window.innerHeight - 150;
    const scale = Math.max(
      0.2,
      Math.min(1, availableWidth / designWidth, availableHeight / designHeight)
    );
    book.style.setProperty("--book-scale", String(scale));
    update();
  }

  function update() {
    leaves.forEach((leaf, index) => {
      const flipped = index < turned;
      leaf.classList.toggle("flipped", flipped);
      leaf.style.zIndex = flipped ? String(index + 1) : String(leaves.length - index + 10);
    });
    book.classList.toggle("closed", turned === 0 && !book.classList.contains("single"));
    if (prevBtn) prevBtn.disabled = turned === 0;
    if (nextBtn) nextBtn.disabled = turned >= leaves.length;
    if (indicator) {
      indicator.textContent =
        turned === 0
          ? "表紙 / " + leaves.length
          : "見開き " + turned + " / " + leaves.length;
    }
  }

  function flip(direction) {
    if (animating) return;
    if (direction > 0 && turned >= leaves.length) return;
    if (direction < 0 && turned <= 0) return;

    const leaf = direction > 0 ? leaves[turned] : leaves[turned - 1];
    animating = true;
    leaf.classList.add("flipping");
    turned += direction;
    update();
    window.setTimeout(() => {
      leaf.classList.remove("flipping");
      animating = false;
    }, 900);
  }

  function goToFace(face) {
    if (animating) return;
    const target = Math.max(0, Math.min(leaves.length, Math.ceil(face / 2)));
    const step = () => {
      if (turned === target) { animating = false; return; }
      animating = true;
      const direction = target > turned ? 1 : -1;
      const leaf = direction > 0 ? leaves[turned] : leaves[turned - 1];
      leaf.classList.add("flipping");
      turned += direction;
      update();
      window.setTimeout(() => {
        leaf.classList.remove("flipping");
        animating = false;
        step();
      }, 430);
    };
    step();
  }

  function showReader(opened) {
    introDone = true;
    introBusy = false;
    if (opened) turned = 1;
    update();
    if (intro) intro.classList.add("hidden");
    reader.classList.add("ready");
    reader.setAttribute("aria-hidden", "false");
  }

  function startIntro() {
    if (introBusy || introDone || !currentSpine) return;
    introBusy = true;
    intro.classList.remove("hidden");
    reader.classList.remove("ready");
    reader.setAttribute("aria-hidden", "true");
    turned = 0;
    update();
    window.setTimeout(() => {
      if (!introBusy || introDone) return;
      if (!window.Takeout) { showReader(true); return; }
      window.Takeout.play(currentSpine, {
        onDone: function () { showReader(true); }
      });
    }, 900);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => flip(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => flip(1));

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); flip(1); }
    if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); flip(-1); }
  });

  let touchStartX = 0;
  document.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    const diff = touchStartX - event.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) flip(diff > 0 ? 1 : -1);
  }, { passive: true });

  document.querySelectorAll("[data-face]").forEach((item) => {
    const open = () => {
      showReader(false);
      goToFace(Number(item.dataset.face));
    };
    item.addEventListener("click", open);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    });
  });

  if (skipIntro) {
    skipIntro.addEventListener("click", () => {
      introBusy = false;
      showReader(true);
    });
  }
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      if (introBusy) return;
      introDone = false;
      startIntro();
    });
  }

  window.addEventListener("resize", layout);
  layout();
  window.setTimeout(startIntro, 500);
})();
`;

export function renderBookPage({ book, pages, books, meta }) {
  const faces = buildFaces(book, pages);
  const shelf = renderShelf(books, { currentSlug: meta.slug, compact: true });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(book.title)} - 3D BOOKS</title>
<meta name="description" content="${escapeHtml(book.description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&amp;family=Noto+Serif+JP:wght@400;600;700;900&amp;display=swap" rel="stylesheet">
<style>
${BASE_CSS}
${SHELF_CSS}
${BOOK_CSS}
</style>
<noscript>
  <style>
    #intro { display: none !important; }
    #reader { opacity: 1 !important; visibility: visible !important; }
    .book { transform: none !important; }
  </style>
</noscript>
</head>
<body>

<div class="intro" id="intro">
  <div class="intro-brand">3D BOOKS / TAKE A BOOK</div>
  <div class="intro-shelf">
    <div class="shelf-room">
      ${shelf}
    </div>
  </div>
  <div class="intro-caption">
    <span>本棚から取り出しています…</span>
    <button class="intro-skip" id="skipIntro" type="button">スキップ</button>
  </div>
</div>

<div class="reader" id="reader" aria-hidden="true">
  <div class="reader-topbar">
    <a class="pill" href="./">← 本棚</a>
    <div class="reader-title">${escapeHtml(book.title)}</div>
    <button class="pill" id="replayBtn" type="button">取り出しを再生</button>
  </div>

  <div class="scene">
    <div class="book closed" id="book">
      <div class="book-gutter" aria-hidden="true"></div>
      <div class="page-container" id="pageContainer">
        ${renderLeaves(faces)}
      </div>
    </div>
  </div>

  <div class="reader-hint">← → キー / スワイプでページをめくる</div>

  <nav class="nav-controls" aria-label="ページ送り">
    <button class="nav-btn" id="prevBtn" type="button" aria-label="前のページ">&#9664;</button>
    <span class="page-indicator" id="pageIndicator">表紙</span>
    <button class="nav-btn" id="nextBtn" type="button" aria-label="次のページ">&#9654;</button>
  </nav>
</div>

<script>
${TAKEOUT_JS}
${READER_JS}
</script>
</body>
</html>`;
}
