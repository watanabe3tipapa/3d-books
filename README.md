# 3d-books

**日本語** | [English](./README.en.md)

**置くだけで、本になる。**

**contents/ に Markdown を置くと、3D 本棚と一冊の 3D ブックが自動で生まれます。**

3d-books は、`contents/*.md` を解析して 3D 本棚とページめくり可能な 3D ブックを生成する静的サイトジェネレーターです。ビルドは Node.js の標準モジュールだけで動き、生成物は HTML / CSS / JavaScript の静的ファイルだけ。本棚と本は Vercel、LP と仕組み図は GitHub Pages で公開します。

> **位置付け:** v0.1.0 は**プロトタイプ**です。1 冊の原稿から本棚と 3D ブックを生成する基本フローを検証するための版で、複数冊の運用、画像組版、本文検索などは今後の課題です。

> **原稿が主役:** 原稿はプレーンな Markdown のまま `contents/` に残ります。専用データベースや管理画面はありません。

> **発火は 2 経路:** ローカルでは `npm run dev` の watcher が保存の瞬間に製本し、リモートでは `contents/**` を含む push が GitHub Actions のビルドを起動します。

[![Version](https://img.shields.io/badge/version-v0.1.0-blue.svg)](https://github.com/watanabe3tipapa/3d-books)
[![Phase](https://img.shields.io/badge/phase-prototype-orange.svg)](https://github.com/watanabe3tipapa/3d-books)
[![Vercel](https://img.shields.io/badge/Vercel-live-black.svg)](https://3d-books.vercel.app/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-222.svg)](https://watanabe3tipapa.github.io/3d-books/)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933.svg)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)
[![3D](https://img.shields.io/badge/CSS-3D-c9a227.svg)](./scripts/lib/book.mjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**クイックリンク:** [LP](https://watanabe3tipapa.github.io/3d-books/) · [本棚](https://3d-books.vercel.app/) · [仕組み図](https://watanabe3tipapa.github.io/3d-books/mechanism.html) · [Repository](https://github.com/watanabe3tipapa/3d-books) · [Issues](https://github.com/watanabe3tipapa/3d-books/issues)

## コンセプト

### なぜ「Markdown が本になる」のか

文章を書くとき、いちばん邪魔になるのは「本らしく見せる作業」です。表紙を整え、目次を作り、ページを割り、公開用の HTML を用意する。3d-books はその工程を、原稿を置くという 1 つの操作に畳み込みました。

`contents/` に `.md` を置けば、見出しから章を組み立て、紙面の高さに合わせてページを分割し、背表紙・表紙・目次・本文・奥付を持つ 3D ブックを `books/` に書き出します。本棚の背表紙をクリックすれば、本が棚から抜き出され、表紙が開いて読み始められます。

| 体験 | 3d-books の対応物 |
|---|---|
| 書く | プレーンな Markdown。front matter で書名・著者・説明を指定 |
| 束ねる | 見出しを章として認識し、紙面の高さでページ分割 |
| 装う | 深いネイビー、アンティークゴールド、アイボリーの紙面 |
| 並べる | 背表紙の色と高さを slug から決めて本棚へ |
| 取り出す | 背表紙が抜け、表紙が開き、見開きへ遷移 |
| めくる | CSS 3D のページめくり、キーボード、スワイプ、目次ジャンプ |
| 公開する | Vercel に本棚と本、GitHub Pages に LP と仕組み図 |

### 設計方針

1. **原稿はプレーンな Markdown** — 独自記法を必須にせず、`contents/` のファイルをそのまま正とする
2. **依存ゼロ** — Node.js の標準モジュールだけで解析・生成・配信確認まで完結する
3. **静的ファイルだけ** — 生成物は HTML / CSS / JavaScript。データベースもサーバーも不要
4. **置いた瞬間に発火** — ローカルは watcher、リモートは push をトリガーにする
5. **公開先を分ける** — LP は GitHub Pages、成果物の本棚と本は Vercel

## 主な特徴

### 自動製本

- **front matter** — `title` / `subtitle` / `author` / `description` / `tags` / `accent` / `order` を任意で指定。未指定でも H1 や本文から補完
- **Markdown 解析** — 見出し、段落、リスト（タスクリスト含む）、表、コードフェンス、引用、水平線をブロックとして解析
- **章立て** — H2 を章として扱い、H3 / H4 を章内見出しとして組版。冒頭の本文は「はじめに」にまとめる
- **ページ分割** — 文字数・行数・ブロック種別から高さを見積もり、紙面に収まる単位でページへ分割
- **動的な紙面** — 表紙、この本について、目次、本文、おわり、裏表紙を面として生成。見開きの左右で正しい面に配置

### 3D 本棚と取り出し

- **背表紙** — slug のハッシュから色と高さを決め、同じ本はいつも同じ姿で並ぶ
- **本棚ページ** — `books/index.html` に背表紙を並べ、巻数と生成日を表示
- **取り出しアニメーション** — 背表紙が手前に抜け、3D の本が中央へ移動し、表紙が開いて読書画面へ
- **開幕アニメーション** — 各ブックを開いたときも、本棚から取り出すところから始まる。スキップボタンと `Escape` / `Space` に対応
- **再生** — 読書画面の「取り出しを再生」で演出を何度でも確認できる

### 3D ブック

- **ページめくり** — 葉（leaf）単位の `rotateY` で、表紙から裏表紙まで連続してめくれる
- **操作** — `←` / `→`、`PageUp` / `PageDown`、スワイプ、前後ボタン、目次クリック
- **レスポンシブ** — 760px 以下では見開きから 1 ページ表示へ切り替え
- **紙面** — 章番号、章見出し、続き表示、ページ番号、表、コード、引用、タスクリストを組版
- **アクセシビリティ** — キーボード操作、`aria-label`、`prefers-reduced-motion` で演出を抑制

### 仕組み図

- **Archify** — 原稿の配置から発火、解析、ページ分割、レンダリング、公開までをワークフロー図に
- **LP に埋め込み** — `site/mechanism.html` をダークテーマ・埋め込みモードで iframe 表示
- **全画面** — 図だけを開いてパン・ズーム・検索・エクスポートができる

## アーキテクチャ

### パイプライン

```text
contents/*.md
   │
   ├─ scripts/watch.mjs        npm run dev: 変更を監視して build を起動
   └─ GitHub Actions           contents/** を含む push で build を起動
          │
          ▼
   scripts/build.mjs
   ├─ lib/markdown.mjs         front matter / ブロック / インライン記法を解析
   ├─ lib/paginate.mjs         章を紙面の高さでページへ分割
   ├─ lib/book.mjs             表紙・目次・本文・奥付・裏表紙と読書 UI を生成
   ├─ lib/shelf.mjs            背表紙の色・高さ・本棚の HTML
   ├─ lib/shelf-page.mjs       本棚ページ
   ├─ lib/takeout.mjs          棚から取り出すアニメーション
   ├─ lib/theme.mjs            共有 CSS（色・書体・本棚・演出）
   └─ lib/site.mjs             LP と Archify の埋め込み
          │
          ├─ books/index.html      3D 本棚（Vercel）
          ├─ books/<slug>.html     3D ブック（Vercel）
          ├─ books/manifest.json   書誌一覧
          └─ site/index.html       LP（GitHub Pages）
```

### 技術

- **実行環境**: Node.js 20 以上（ESM）
- **依存パッケージ**: なし
- **Markdown**: 自前のブロックパーサー + インラインレンダラー + 軽量シンタックスハイライト
- **3D**: CSS `transform-style: preserve-3d` / `perspective` / `rotateY`
- **アニメーション**: Web Animations API（`Element.animate`）
- **配信**: Vercel（`books/`）、GitHub Pages（`site/`）
- **仕組み図**: Archify 3（ワークフロー、日本語ロケール）

### データとセキュリティ

- 原稿はリポジトリ内のファイルとして扱い、外部サービスへ送信しません
- 生成物は静的な HTML / CSS / JavaScript のみで、API キーや認証情報を持ちません
- 外部リンクは `target="_blank"` と `rel="noopener noreferrer"` を付与
- ユーザー入力を実行時に評価せず、Markdown はビルド時に HTML へ変換
- フォントは Google Fonts から読み込みます。オフラインではシステムの明朝 / ゴシックへフォールバック

## インストールとビルド

### 前提条件

| ツール | 必要バージョン | 確認コマンド |
|---|---:|---|
| Node.js | >= 20 | `node --version` |
| npm | Node.js に同梱 | `npm --version` |

### 基本的な手順

1. リポジトリを取得

```bash
git clone https://github.com/watanabe3tipapa/3d-books.git
cd 3d-books
```

2. 依存インストールは不要です

```bash
# package.json に dependencies はありません
npm run build
```

3. 原稿を監視して製本

```bash
npm run dev
```

`contents/*.md` を保存すると、その場で `books/` と `site/index.html` が更新されます。

4. ローカルで確認

```bash
npm run preview
# LP     : http://localhost:4173/site/
# Shelf  : http://localhost:4173/books/
# Book   : http://localhost:4173/books/mcp-a2a.html
```

### 主要コマンド

| コマンド | 用途 |
|---|---|
| `npm run build` | `books/` と `site/index.html` を一括生成 |
| `npm run dev` | `contents/` を監視して即時製本（ローカル用の相対 URL） |
| `npm run watch` | 監視のみ。`BOOKS_BASE_URL` は環境変数に従う |
| `npm run preview` | ビルドして `http://localhost:4173` で確認 |
| `npm run clean` | `books/` と `site/index.html` を削除 |

## 使い方

### 1. 原稿を置く

`contents/` に Markdown を追加します。ファイル名が slug になります（例: `mcp-a2a.md` → `books/mcp-a2a.html`）。

```markdown
---
title: MCP と A2A
subtitle: マルチエージェント時代の接続プロトコル
author: Notes - Tech
description: AIの手「MCP」とAIの口「A2A」を一冊に。
tags: [MCP, A2A, AIエージェント, プロトコル]
accent: gold
order: 1
---

# Notes - Tech

## MCP と A2A の関係

本文...
```

- `title` を省略した場合は H1、H1 もなければファイル名を使用
- `order` が小さい本から本棚に並びます。同じ値なら slug 順
- ファイル名が `_` で始まる Markdown はビルド対象外

### 2. 製本する

```bash
npm run dev
```

`contents/` の変更を検知して自動でビルドします。GitHub へ push した場合は GitHub Actions が LP を再ビルドします。リポジトリを Vercel に接続している場合は、Vercel も本棚と本を再ビルドします。

### 3. 読む

- 本棚: `books/index.html` の背表紙をクリック
- 本: 表紙が開くまで待つか「スキップ」
- ページめくり: `←` / `→`、スワイプ、下部のボタン
- 目次: 章をクリックするとそのページへ移動
- 演出の再確認: 右上の「取り出しを再生」

### 4. 公開する

```bash
git add contents/ books/ site/ scripts/ package.json vercel.json .github/
git commit -m "add a new book"
git push origin main
```

## 公開

### 役割分担

| ホスティング | URL | 内容 |
|---|---|---|
| GitHub Pages | https://watanabe3tipapa.github.io/3d-books/ | LP、仕組み図 |
| Vercel | https://3d-books.vercel.app/ | 本棚、各 3D ブック、manifest |

### GitHub Pages

`.github/workflows/publish.yml` が `main` への push で `site/` をデプロイします。

1. GitHub の **Settings → Pages** を開く
2. **Build and deployment → Source** を **GitHub Actions** に設定
3. `main` へ push、または Actions から手動実行

LP の「本棚を開く」は `BOOKS_BASE_URL` を参照します。既定値は `https://3d-books.vercel.app` です。別のドメインへ変える場合はビルド時に環境変数を渡してください。

```bash
BOOKS_BASE_URL=https://your-project.vercel.app node scripts/build.mjs
```

### Vercel

リポジトリを Vercel に接続すると、`vercel.json` の設定でビルドと配信が行われます。

```json
{
  "buildCommand": "node scripts/build.mjs",
  "outputDirectory": "books"
}
```

- ルート `/` が本棚（`books/index.html`）
- `/mcp-a2a.html` が各 3D ブック
- `/manifest.json` が書誌一覧

接続後は Vercel 側でも `contents/` から自動製本されるため、原稿を push するだけで本棚が更新されます。

### ローカル

`npm run dev` と `npm run preview` は `BOOKS_BASE_URL=../books` を設定するため、LP からローカルの本棚へ相対リンクします。

## 既知の制約とロードマップ

### v0.1.0（プロトタイプ）でできること

- [x] `contents/*.md` からの自動製本
- [x] 3D 本棚と背表紙の取り出しアニメーション
- [x] 表紙・目次・本文・奥付・裏表紙を持つ 3D ブック
- [x] ページめくり、キーボード、スワイプ、目次ジャンプ
- [x] モバイルの 1 ページ表示
- [x] `prefers-reduced-motion` への対応
- [x] Archify のワークフロー図を LP に埋め込み
- [x] Vercel / GitHub Pages の公開設定

### 制約

- Markdown は本の組版に必要なサブセットです。画像、脚注、定義リスト、HTML ブロックは未対応です
- シンタックスハイライトは言語非依存の簡易ハイライトです
- ページ分割は文字数とブロック種別からの見積もりです。非常に長いコードや表はページ内スクロールになります
- フォントは Google Fonts を読み込むため、オフラインではシステムフォントになります
- 生成日はビルド日時です。再ビルドすると `manifest.json` と各ブックの日付が更新されます
- サンプル原稿は `contents/mcp-a2a.md` の 1 冊です

### 次の候補

- [ ] 画像・図版の組版
- [ ] 複数冊の本棚ページング
- [ ] 本文検索
- [ ] しおり・読書位置の保存
- [ ] OGP 画像の自動生成
- [ ] 原稿ごとのアクセントカラーの反映

## ディレクトリ構成

```text
contents/
└── mcp-a2a.md                  # 原稿（front matter + 本文）

scripts/
├── build.mjs                   # 一括ビルド
├── watch.mjs                   # contents/ の監視
├── serve.mjs                   # ローカル確認用サーバー
└── lib/
    ├── markdown.mjs            # front matter / ブロック / インライン解析
    ├── paginate.mjs            # 章をページへ分割
    ├── theme.mjs               # 共有 CSS
    ├── shelf.mjs               # 背表紙と本棚
    ├── takeout.mjs             # 取り出しアニメーション
    ├── book.mjs                # 3D ブックと読書 UI
    ├── shelf-page.mjs          # 本棚ページ
    └── site.mjs                # LP と仕組み図の埋め込み

books/
├── index.html                  # 3D 本棚（Vercel）
├── mcp-a2a.html                # 3D ブック（Vercel）
└── manifest.json               # 書誌一覧

site/
├── index.html                  # LP（GitHub Pages）
└── mechanism.html              # Archify のワークフロー図

.archify/
└── workflow-3d-books-20261104-095119/
    ├── candidate.json          # Archify の入力
    └── 3d-books-workflow.html  # Archify の生成物

.github/workflows/publish.yml   # GitHub Pages へのデプロイ
vercel.json                     # Vercel のビルド / 出力設定
package.json                    # npm scripts（依存なし）
```

## ドキュメント

1. [LP](./site/index.html) — プロダクト概要と本棚への導線
2. [仕組み図](./site/mechanism.html) — Archify による自動製本ワークフロー
3. [Archify 入力](./.archify/workflow-3d-books-20261104-095119/candidate.json) — 図の編集元
4. [本棚](./books/index.html) — 生成された 3D 本棚
5. [サンプルブック](./books/mcp-a2a.html) — 生成された 3D ブック

## ライセンス

MIT ライセンス — 詳細は [LICENSE](./LICENSE) を参照してください。

3D BOOKS は個人プロジェクトです。Noto Sans JP / Noto Serif JP は Google Fonts のライセンスに従います。
