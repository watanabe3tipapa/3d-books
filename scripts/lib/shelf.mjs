import { escapeHtml } from "./markdown.mjs";

// 背表紙の色は slug から決める（同じ本はいつも同じ色）。
const PALETTE = [
  ["#6b3a3a", "#2c1717"],
  ["#2f4a5e", "#14222d"],
  ["#5b4a2c", "#241b0e"],
  ["#3e3a5e", "#19172b"],
  ["#4a5a38", "#1c2415"],
  ["#6b4a2c", "#2a1a0e"],
  ["#3b5050", "#172121"],
  ["#5e2f42", "#27121b"],
  ["#4a3f6b", "#1c1830"],
  ["#5c5133", "#211c10"],
];

export function paletteFor(slug) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function spineHeight(slug, index = 0) {
  let hash = 0;
  for (const char of slug) hash = (hash * 17 + char.charCodeAt(0)) >>> 0;
  return 246 + (hash % 62) + ((index % 3) * 4);
}

export function spineWidth(book, index = 0) {
  const base = 40 + Math.min(18, Math.round((book.title || "").length * 1.3));
  return base + (index % 3) * 3;
}

/**
 * 本棚の HTML。books は manifest の books 配列。
 */
export function renderShelf(books, options = {}) {
  const { currentSlug = "", compact = false, emptyMessage = "" } = options;

  if (!books.length) {
    return `
      <div class="shelf-empty">
        ${emptyMessage || "まだ本がありません。<br><code>contents/</code> に Markdown を置くと、ここに並びます。"}
      </div>`;
  }

  const perRow = compact ? 8 : 9;
  const rows = [];
  for (let i = 0; i < books.length; i += perRow) rows.push(books.slice(i, i + perRow));

  const rowsHtml = rows
    .map((row, rowIndex) => {
      const spines = row
        .map((book, index) => {
          const [c1, c2] = paletteFor(book.slug);
          const width = spineWidth(book, index);
          const height = spineHeight(book.slug, index + rowIndex);
          const current = book.slug === currentSlug ? " current" : "";
          return `
            <button class="spine${current}" type="button"
              data-slug="${escapeHtml(book.slug)}"
              data-title="${escapeHtml(book.title)}"
              data-subtitle="${escapeHtml(book.subtitle || "")}"
              data-author="${escapeHtml(book.author || "")}"
              data-c1="${c1}" data-c2="${c2}"
              data-href="${escapeHtml(book.href || book.slug + ".html")}"
              style="--w:${width}px;--h:${height}px;--hm:${Math.round(height * 0.78)}px;--c1:${c1};--c2:${c2}"
              aria-label="${escapeHtml(book.title)} を取り出す">
              <span class="spine-dot" aria-hidden="true"></span>
              <span class="spine-title">${escapeHtml(book.title)}</span>
            </button>`;
        })
        .join("");

      return `
        <div class="shelf-row" role="list">${spines}</div>
        <div class="shelf-board" aria-hidden="true"></div>`;
    })
    .join("");

  return `
    <div class="shelf-cabinet">
      <div class="shelf-inner">
        ${rowsHtml}
        <div class="shelf-caption">
          <span>3D BOOKS / LIBRARY</span>
          <span>${books.length} VOLUME${books.length === 1 ? "" : "S"}</span>
        </div>
      </div>
    </div>`;
}
