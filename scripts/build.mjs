#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseBook } from "./lib/markdown.mjs";
import { paginate } from "./lib/paginate.mjs";
import { renderBookPage } from "./lib/book.mjs";
import { renderShelfPage } from "./lib/shelf-page.mjs";
import { renderSitePage } from "./lib/site.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENTS_DIR = path.join(ROOT, "contents");
const BOOKS_DIR = path.join(ROOT, "books");
const SITE_DIR = path.join(ROOT, "site");

const BOOKS_BASE_URL =
  process.env.BOOKS_BASE_URL ||
  "https://3d-books.vercel.app";
const BOOKS_ONLY = process.env.BOOKS_ONLY === "1";
const SITE_URL =
  process.env.SITE_URL ||
  (BOOKS_BASE_URL.startsWith(".")
    ? "../site/"
    : "https://watanabe3tipapa.github.io/3d-books/");

const GENERATED = formatDate(new Date());

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(name, index) {
  const ascii = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (ascii) return ascii;
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `book-${hash.toString(36)}`;
}

function readManuscripts() {
  if (!fs.existsSync(CONTENTS_DIR)) return [];
  return fs
    .readdirSync(CONTENTS_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => {
      const full = path.join(CONTENTS_DIR, file);
      const source = fs.readFileSync(full, "utf8");
      const parsed = parseBook(source, file.replace(/\.md$/, ""));
      const stat = fs.statSync(full);
      return {
        file,
        full,
        source,
        parsed,
        mtime: stat.mtime,
      };
    });
}

function makeBooks(manuscripts) {
  const used = new Set();
  const books = manuscripts.map((entry, index) => {
    const base = slugify(entry.file.replace(/\.md$/, ""), index);
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(slug);

    const pages = paginate(entry.parsed.chapters);
    const book = {
      ...entry.parsed,
      slug,
      volume: index + 1,
      date: GENERATED,
      pages,
      pageCount: pages.length,
      sourceFile: entry.file,
      updated: entry.mtime.toISOString(),
      href: `${slug}.html`,
    };

    return book;
  });

  books.sort((a, b) => {
    const orderA = Number(a.parsed?.meta?.order ?? a.meta?.order ?? 0);
    const orderB = Number(b.parsed?.meta?.order ?? b.meta?.order ?? 0);
    if (orderA !== orderB) return orderA - orderB;
    return a.slug.localeCompare(b.slug);
  });

  books.forEach((book, index) => {
    book.volume = index + 1;
  });

  return books;
}

function publicBook(book) {
  return {
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    description: book.description,
    tags: book.tags,
    pages: book.pageCount,
    href: book.href,
    updated: book.updated,
    volume: book.volume,
  };
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, "utf8");
  return content.length;
}

function removeStaleBooks(validFiles) {
  if (!fs.existsSync(BOOKS_DIR)) return;
  for (const file of fs.readdirSync(BOOKS_DIR)) {
    if (!file.endsWith(".html")) continue;
    if (file === "index.html") continue;
    if (!validFiles.has(file)) {
      fs.rmSync(path.join(BOOKS_DIR, file));
      console.log(`  removed stale ${file}`);
    }
  }
}

function main() {
  const started = Date.now();
  ensureDir(BOOKS_DIR);
  ensureDir(SITE_DIR);

  const manuscripts = readManuscripts();
  const books = makeBooks(manuscripts);
  const publicBooks = books.map(publicBook);

  console.log(`\n  3D BOOKS ビルド開始 — ${manuscripts.length} 原稿\n`);

  for (const book of books) {
    const html = renderBookPage({
      book,
      pages: book.pages,
      books: publicBooks,
      meta: {
        slug: book.slug,
        date: book.date,
      },
    });
    const bytes = write(path.join(BOOKS_DIR, book.href), html);
    console.log(
      `  ✓ ${book.sourceFile} → books/${book.href}  (${book.pageCount}p, ${(bytes / 1024).toFixed(1)}KB)`
    );
  }

  removeStaleBooks(new Set(books.map((book) => book.href)));

  const manifest = {
    generated: GENERATED,
    generatedAt: new Date().toISOString(),
    booksBaseUrl: BOOKS_BASE_URL,
    siteUrl: SITE_URL,
    books: publicBooks,
  };
  write(path.join(BOOKS_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const shelfHtml = renderShelfPage({
    books: publicBooks,
    meta: {
      generated: GENERATED,
      siteUrl: SITE_URL,
    },
  });
  write(path.join(BOOKS_DIR, "index.html"), shelfHtml);

  if (BOOKS_ONLY) {
    console.log(`\n  ✓ books/index.html（本棚）`);
    console.log(`  ✓ books/manifest.json（${publicBooks.length} 冊）`);
    console.log(`  · site/index.html（BOOKS_ONLY のためスキップ）`);
  } else {
    const mechanismAvailable = fs.existsSync(path.join(SITE_DIR, "mechanism.html"));
    const siteHtml = renderSitePage({
      books: publicBooks,
      meta: {
        generated: GENERATED,
        booksBaseUrl: BOOKS_BASE_URL,
        siteUrl: SITE_URL,
        mechanismAvailable,
      },
    });
    write(path.join(SITE_DIR, "index.html"), siteHtml);

    console.log(`\n  ✓ books/index.html（本棚）`);
    console.log(`  ✓ books/manifest.json（${publicBooks.length} 冊）`);
    console.log(`  ✓ site/index.html（LP）`);
    console.log(`  ✓ site/mechanism.html ${mechanismAvailable ? "検出" : "未配置"}`);
  }
  console.log(`\n  ${((Date.now() - started) / 1000).toFixed(2)}s で完了\n`);
}

main();
