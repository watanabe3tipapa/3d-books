# 3d-books

[日本語](./README.md) | **English**

**Drop it in. It becomes a book.**

**Place a Markdown file in `contents/`, and a 3D bookshelf and a 3D book are generated automatically.**

3d-books is a static site generator that turns `contents/*.md` into a 3D bookshelf and a page-turning 3D book. The build runs on the Node.js standard library alone, and every artifact is static HTML, CSS, and JavaScript. The bookshelf and books are published on Vercel; the landing page and mechanism diagram are published on GitHub Pages.

> **Status:** v0.1.0 is a **prototype**. It validates the basic flow from a single manuscript to a bookshelf and a 3D book. Multi-book operation, image layout, full-text search, and other capabilities remain future work.

> **The manuscript stays in charge:** manuscripts remain plain Markdown files in `contents/`. There is no proprietary database or admin UI.

> **Two ways to trigger a build:** locally, the `npm run dev` watcher starts a build on save. Remotely, a push that touches `contents/**` starts the GitHub Actions build.

[![Version](https://img.shields.io/badge/version-v0.1.0-blue.svg)](https://github.com/watanabe3tipapa/3d-books)
[![Phase](https://img.shields.io/badge/phase-prototype-orange.svg)](https://github.com/watanabe3tipapa/3d-books)
[![Vercel](https://img.shields.io/badge/Vercel-live-black.svg)](https://3d-books.vercel.app/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-222.svg)](https://watanabe3tipapa.github.io/3d-books/)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933.svg)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)
[![3D](https://img.shields.io/badge/CSS-3D-c9a227.svg)](./scripts/lib/book.mjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Quick links:** [Landing page](https://watanabe3tipapa.github.io/3d-books/) · [Bookshelf](https://3d-books.vercel.app/) · [Mechanism diagram](https://watanabe3tipapa.github.io/3d-books/mechanism.html) · [Repository](https://github.com/watanabe3tipapa/3d-books) · [Issues](https://github.com/watanabe3tipapa/3d-books/issues)

## Concept

### Why turn Markdown into a book?

When you write, the tedious part is usually making it look like a book. Designing a cover, building a table of contents, breaking text into pages, and preparing publication-ready HTML. 3d-books folds that work into a single action: place the manuscript.

Drop a `.md` file into `contents/` and the build reads its headings as chapters, splits the text into pages that fit the paper, and writes a 3D book with a spine, cover, table of contents, body, colophon, and back cover into `books/`. Click a spine on the shelf and the book is pulled out, the cover opens, and reading begins.

| Experience | What 3d-books does |
|---|---|
| Write | Plain Markdown. Front matter sets the title, author, and description |
| Bind | Headings become chapters; pages are split to fit the paper |
| Dress | Deep navy, antique gold, and ivory paper |
| Shelve | Spine color and height are derived from the slug |
| Take out | The spine slides out, the cover opens, and the reader appears |
| Turn | CSS 3D page flips, keyboard, swipe, and table-of-contents jumps |
| Publish | Bookshelf and books on Vercel; LP and mechanism diagram on GitHub Pages |

### Design principles

1. **Manuscripts stay plain Markdown** — no required custom syntax; files in `contents/` are the source of truth
2. **Zero dependencies** — parsing, generation, and local serving use only the Node.js standard library
3. **Static files only** — artifacts are HTML, CSS, and JavaScript. No database and no server
4. **Fire on placement** — a local watcher for development, a push trigger for CI
5. **Separate the deploy targets** — the LP lives on GitHub Pages; the bookshelf and books live on Vercel

## Features

### Automatic binding

- **Front matter** — optional `title`, `subtitle`, `author`, `description`, `tags`, `accent`, and `order`. Missing values fall back to the H1 or body text
- **Markdown parsing** — headings, paragraphs, lists (including task lists), tables, fenced code, blockquotes, and horizontal rules
- **Chapters** — H2 becomes a chapter, while H3 and H4 are rendered as section headings. Introductory body text becomes "Introduction"
- **Pagination** — estimates block height from text length, line count, and block type, then splits chapters into pages
- **Generated faces** — cover, about, table of contents, body, ending, and back cover are assembled as book faces, with correct left/right placement in a spread

### 3D bookshelf and take-out animation

- **Spines** — color and height are derived from a hash of the slug, so a book always looks the same
- **Shelf page** — `books/index.html` lines up the spines and shows the volume count and generation date
- **Take-out** — the spine slides forward, a 3D book moves to the center, and the cover opens into the reader
- **Opening animation** — each book also starts by pulling itself from the shelf. A skip button and `Escape` / `Space` are supported
- **Replay** — the "Replay take-out" control replays the animation from the reader

### 3D book

- **Page turning** — leaf-level `rotateY` flips from the cover through the back cover
- **Controls** — `←` / `→`, `PageUp` / `PageDown`, swipe, previous/next buttons, and table-of-contents links
- **Responsive** — below 760px the spread becomes a single page
- **Typography** — chapter numbers, chapter headings, continuation labels, page numbers, tables, code, quotes, and task lists
- **Accessibility** — keyboard controls, `aria-label`, and reduced motion via `prefers-reduced-motion`

### Mechanism diagram

- **Archify** — a workflow diagram from manuscript placement through triggering, parsing, pagination, rendering, and publishing
- **Embedded in the LP** — `site/mechanism.html` is shown in an iframe in dark, embedded mode
- **Full screen** — open the diagram alone for pan, zoom, search, and export

## Architecture

### Pipeline

```text
contents/*.md
   │
   ├─ scripts/watch.mjs        npm run dev: watch changes and start a build
   └─ GitHub Actions           start a build on a push that touches contents/**
          │
          ▼
   scripts/build.mjs
   ├─ lib/markdown.mjs         parse front matter, blocks, and inline syntax
   ├─ lib/paginate.mjs         split chapters into pages that fit the paper
   ├─ lib/book.mjs             generate cover, TOC, body, colophon, back cover, and reader UI
   ├─ lib/shelf.mjs            derive spine color/height and render the shelf
   ├─ lib/shelf-page.mjs       render the shelf page
   ├─ lib/takeout.mjs          take-out animation
   ├─ lib/theme.mjs            shared CSS (colors, type, shelf, motion)
   └─ lib/site.mjs             LP and Archify embedding
          │
          ├─ books/index.html      3D bookshelf (Vercel)
          ├─ books/<slug>.html     3D book (Vercel)
          ├─ books/manifest.json   bibliography
          └─ site/index.html       landing page (GitHub Pages)
```

### Stack

- **Runtime**: Node.js 20+ (ESM)
- **Dependencies**: none
- **Markdown**: custom block parser, inline renderer, and lightweight syntax highlighting
- **3D**: CSS `transform-style: preserve-3d`, `perspective`, and `rotateY`
- **Animation**: Web Animations API (`Element.animate`)
- **Hosting**: Vercel (`books/`) and GitHub Pages (`site/`)
- **Mechanism diagram**: Archify 3 (workflow, Japanese locale)

### Data and security

- Manuscripts stay in the repository and are never sent to an external service
- Artifacts are static HTML, CSS, and JavaScript, with no API keys or credentials
- External links use `target="_blank"` and `rel="noopener noreferrer"`
- User input is never evaluated at runtime; Markdown is converted to HTML at build time
- Fonts are loaded from Google Fonts. Offline, the pages fall back to system serif/sans-serif fonts

## Install and build

### Requirements

| Tool | Required version | Check |
|---|---:|---|
| Node.js | >= 20 | `node --version` |
| npm | Bundled with Node.js | `npm --version` |

### Basic steps

1. Clone the repository

```bash
git clone https://github.com/watanabe3tipapa/3d-books.git
cd 3d-books
```

2. No dependency install is needed

```bash
# package.json has no dependencies
npm run build
```

3. Watch manuscripts and bind on save

```bash
npm run dev
```

Saving a file in `contents/*.md` updates `books/` and `site/index.html` immediately.

4. Preview locally

```bash
npm run preview
# LP     : http://localhost:4173/site/
# Shelf  : http://localhost:4173/books/
# Book   : http://localhost:4173/books/mcp-a2a.html
```

### Commands

| Command | Purpose |
|---|---|
| `npm run build` | Generate `books/` and `site/index.html` |
| `npm run dev` | Watch `contents/` and bind immediately (local relative URLs) |
| `npm run watch` | Watch only. `BOOKS_BASE_URL` comes from the environment |
| `npm run preview` | Build and preview at `http://localhost:4173` |
| `npm run clean` | Remove `books/` and `site/index.html` |

## Usage

### 1. Place a manuscript

Add Markdown to `contents/`. The file name becomes the slug (for example, `mcp-a2a.md` becomes `books/mcp-a2a.html`).

```markdown
---
title: MCP and A2A
subtitle: Connection protocols for the multi-agent era
author: Notes - Tech
description: MCP for AI hands and A2A for AI voices, in one volume.
tags: [MCP, A2A, AI agents, protocols]
accent: gold
order: 1
---

# Notes - Tech

## The relationship between MCP and A2A

Body text...
```

- If `title` is omitted, the H1 is used; if there is no H1, the file name is used
- Books are shelved in ascending `order`; ties are sorted by slug
- Markdown files whose names start with `_` are ignored

### 2. Bind

```bash
npm run dev
```

The watcher rebuilds on changes in `contents/`. When you push to GitHub, GitHub Actions rebuilds the LP. If the repository is connected to Vercel, Vercel also rebuilds the bookshelf and books.

### 3. Read

- Bookshelf: click a spine in `books/index.html`
- Book: wait for the cover to open, or choose "Skip"
- Page turning: `←` / `→`, swipe, or the buttons below the book
- Table of contents: click a chapter to jump to its page
- Replay: use "Replay take-out" in the top-right corner

### 4. Publish

```bash
git add contents/ books/ site/ scripts/ package.json vercel.json .github/
git commit -m "add a new book"
git push origin main
```

## Publishing

### Split of responsibilities

| Host | URL | Content |
|---|---|---|
| GitHub Pages | https://watanabe3tipapa.github.io/3d-books/ | LP and mechanism diagram |
| Vercel | https://3d-books.vercel.app/ | Bookshelf, 3D books, manifest |

### GitHub Pages

`.github/workflows/publish.yml` deploys `site/` on every push to `main`.

1. Open **Settings → Pages** in GitHub
2. Set **Build and deployment → Source** to **GitHub Actions**
3. Push to `main`, or run the workflow manually from Actions

The LP's "Open the bookshelf" link uses `BOOKS_BASE_URL`, which defaults to `https://3d-books.vercel.app`. To use another domain, pass the environment variable at build time:

```bash
BOOKS_BASE_URL=https://your-project.vercel.app node scripts/build.mjs
```

### Vercel

Connect the repository to Vercel and `vercel.json` defines the build and output:

```json
{
  "buildCommand": "node scripts/build.mjs",
  "outputDirectory": "books"
}
```

- `/` serves the bookshelf (`books/index.html`)
- `/mcp-a2a.html` serves a 3D book
- `/manifest.json` serves the bibliography

Once connected, Vercel also builds from `contents/`, so pushing a manuscript updates the shelf.

### Local

`npm run dev` and `npm run preview` set `BOOKS_BASE_URL=../books`, so the LP links to the local bookshelf.

## Known limitations and roadmap

### Available in v0.1.0 (prototype)

- [x] Automatic binding from `contents/*.md`
- [x] 3D bookshelf and spine take-out animation
- [x] 3D book with cover, TOC, body, colophon, and back cover
- [x] Page turning, keyboard, swipe, and TOC jumps
- [x] Single-page layout on mobile
- [x] `prefers-reduced-motion` support
- [x] Archify workflow diagram embedded in the LP
- [x] Vercel and GitHub Pages deployment configuration

### Limitations

- Markdown support is a subset needed for book layout. Images, footnotes, definition lists, and HTML blocks are not supported
- Syntax highlighting is a simple, language-agnostic highlighter
- Pagination is estimated from text length and block type. Very long code blocks or tables scroll inside the page
- Fonts come from Google Fonts; offline, the pages use system fonts
- The generation date is the build date. Rebuilding updates `manifest.json` and the date in each book
- The sample manuscript set contains one book: `contents/mcp-a2a.md`

### Next candidates

- [ ] Image and figure layout
- [ ] Shelf pagination for larger libraries
- [ ] Full-text search
- [ ] Bookmarks and reading-position persistence
- [ ] Automatic OGP image generation
- [ ] Per-manuscript accent colors

## Directory layout

```text
contents/
└── mcp-a2a.md                  # manuscript (front matter + body)

scripts/
├── build.mjs                   # full build
├── watch.mjs                   # watch contents/
├── serve.mjs                   # local preview server
└── lib/
    ├── markdown.mjs            # front matter, block, and inline parsing
    ├── paginate.mjs            # split chapters into pages
    ├── theme.mjs               # shared CSS
    ├── shelf.mjs               # spines and shelf
    ├── takeout.mjs             # take-out animation
    ├── book.mjs                # 3D book and reader UI
    ├── shelf-page.mjs          # shelf page
    └── site.mjs                # LP and mechanism embedding

books/
├── index.html                  # 3D bookshelf (Vercel)
├── mcp-a2a.html                # 3D book (Vercel)
└── manifest.json               # bibliography

site/
├── index.html                  # landing page (GitHub Pages)
└── mechanism.html              # Archify workflow diagram

.archify/
└── workflow-3d-books-20261104-095119/
    ├── candidate.json          # Archify input
    └── 3d-books-workflow.html  # Archify output

.github/workflows/publish.yml   # GitHub Pages deployment
vercel.json                     # Vercel build and output settings
package.json                    # npm scripts (no dependencies)
```

## Documentation

1. [Landing page](./site/index.html) — product overview and links to the shelf
2. [Mechanism diagram](./site/mechanism.html) — Archify workflow for automatic binding
3. [Archify input](./.archify/workflow-3d-books-20261104-095119/candidate.json) — editable diagram source
4. [Bookshelf](./books/index.html) — the generated 3D bookshelf
5. [Sample book](./books/mcp-a2a.html) — a generated 3D book

## License

MIT License — see [LICENSE](./LICENSE) for details.

3D BOOKS is a personal project. Noto Sans JP and Noto Serif JP follow the Google Fonts license.
