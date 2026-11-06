// 章のブロックを紙面の高さに収まるページへ分割する。
// 本は 960x640（見開き）/ 480x640（単ページ）の固定レイアウトで、
// 画面サイズに応じて全体を拡大縮小する。そのため紙面の容量は常に一定。
// ここでは実際の CSS から算出した高さで、はみ出さないことを優先して分割する。

const PAGE_WIDTH = 480;
const PAGE_HEIGHT = 640;
const CONTENT_WIDTH = PAGE_WIDTH - 34 * 2; // padding 左右
const CONTENT_HEIGHT = PAGE_HEIGHT - 34 - 42; // padding 上下
// 章見出しの高さは章タイトルの行数で変わる。行数ごとの実測値から
// ページごとの本文容量を出し、見出しの分だけ確実に空ける。
const SAFETY = 12;
// 途中で分割してよい最小の高さ。これ未満の残りには詰めず、次ページへ送る
const MIN_HEAD = 110;
const MIN_TAIL = 110;

function chapterBudgets(title) {
  const titleLines = Math.min(2, Math.max(1, Math.ceil(textUnits(title) / 28)));
  const firstHeader = 63 + (titleLines - 1) * 30;
  const continuedHeader = firstHeader + 24;
  return {
    first: CONTENT_HEIGHT - (firstHeader + 18) - SAFETY,
    continued: CONTENT_HEIGHT - (continuedHeader + 18) - SAFETY,
  };
}

function textUnits(text) {
  let units = 0;
  for (const char of String(text)) {
    units += /[\u3000-\u9fff\uff00-\uffef]/.test(char) ? 2 : 1;
  }
  return units;
}

function linesFor(text, unitsPerLine) {
  return Math.max(1, Math.ceil(textUnits(text) / unitsPerLine));
}

function estimateTable(block) {
  const columns = Math.max(1, block.headers.length);
  // table-layout: fixed の等幅列を前提に、折り返しの余裕を 0.82 で見込む
  const unitsPerLine = Math.max(6, Math.floor((CONTENT_WIDTH / columns / 5.6) * 0.82));
  let height = 10 + 14 + 2 + 31.5; // margin + border + thead
  for (const row of block.rows) {
    let maxLines = 1;
    for (let index = 0; index < columns; index += 1) {
      maxLines = Math.max(maxLines, linesFor(row[index] || "", unitsPerLine));
    }
    height += 12 + maxLines * 17.4;
  }
  return height;
}

function codeLineUnits(code) {
  let lines = 0;
  for (const line of String(code).split("\n")) {
    lines += Math.max(1, Math.ceil(textUnits(line) / 54));
  }
  return lines;
}

function estimateCode(block) {
  return 66 + codeLineUnits(block.code) * 16.4;
}

function estimateList(block) {
  let height = 16;
  for (const item of block.items) {
    height += linesFor(item.text, 48) * 23.7 + 6;
  }
  return height;
}

function estimateParagraph(text) {
  return linesFor(text, 55) * 26.3 + 11;
}

function estimateBlock(block) {
  switch (block.type) {
    case "heading": {
      const units = block.level <= 3 ? 46 : 40;
      const line = block.level <= 3 ? 24 : 21;
      const margin = block.level <= 3 ? 29 : 23;
      return margin + linesFor(block.text, units) * line;
    }
    case "paragraph":
      return estimateParagraph(block.text);
    case "list":
      return estimateList(block);
    case "table":
      return estimateTable(block);
    case "code":
      return estimateCode(block);
    case "quote":
      return 48 + linesFor(block.text, 52) * 23.9;
    case "hr":
      return 37;
    default:
      return 24;
  }
}

function splitParagraph(block) {
  return (
    String(block.text).match(/[^。．.!?！？]+[。．.!?！？]+[」』）)]*|[^。．.!?！？]+$/g) || [
      String(block.text),
    ]
  );
}

// 残り高さに収まる先頭部分と、次ページへ送る残りを作る。
// うまく分割できない（小さすぎる / 分割不要）場合は null。
function splitToFit(block, maxHeight, allowSmallTail = false) {
  if (maxHeight < MIN_HEAD) return null;
  if (estimateBlock(block) <= maxHeight) return null;

  if (block.type === "table") {
    const rows = [];
    for (const row of block.rows) {
      if (rows.length > 0 && estimateTable({ ...block, rows: [...rows, row] }) > maxHeight) break;
      rows.push(row);
    }
    if (rows.length === 0 || rows.length >= block.rows.length) return null;
    const tail = { ...block, rows: block.rows.slice(rows.length), continued: true };
    if (!allowSmallTail && estimateTable(tail) < MIN_TAIL) return null;
    return {
      head: { ...block, rows, continued: block.continued },
      tail,
    };
  }

  if (block.type === "code") {
    const lines = block.code.split("\n");
    const headLines = [];
    for (const line of lines) {
      if (
        headLines.length > 0 &&
        estimateCode({ code: [...headLines, line].join("\n") }) > maxHeight
      ) {
        break;
      }
      headLines.push(line);
    }
    if (headLines.length === 0 || headLines.length >= lines.length) return null;
    const tail = { ...block, code: lines.slice(headLines.length).join("\n"), continued: true };
    if (!allowSmallTail && estimateCode(tail) < MIN_TAIL) return null;
    return {
      head: { ...block, code: headLines.join("\n"), continued: block.continued },
      tail,
    };
  }

  if (block.type === "list") {
    const items = [];
    for (const item of block.items) {
      if (items.length > 0 && estimateList({ ...block, items: [...items, item] }) > maxHeight) break;
      items.push(item);
    }
    if (items.length === 0 || items.length >= block.items.length) return null;
    const tail = { ...block, items: block.items.slice(items.length), continued: true };
    if (!allowSmallTail && estimateList(tail) < MIN_TAIL) return null;
    return {
      head: { ...block, items, continued: block.continued },
      tail,
    };
  }

  if (block.type === "paragraph") {
    const sentences = splitParagraph(block);
    if (sentences.length < 2) return null;
    let text = "";
    let index = 0;
    for (; index < sentences.length; index += 1) {
      const trial = text + sentences[index];
      if (text && estimateParagraph(trial) > maxHeight) break;
      text = trial;
    }
    if (!text || index >= sentences.length) return null;
    const tailText = sentences.slice(index).join("");
    if (!allowSmallTail && estimateParagraph(tailText) < MIN_TAIL) return null;
    return {
      head: { ...block, text, continued: block.continued },
      tail: { ...block, text: tailText, continued: true },
    };
  }

  return null;
}

export function paginate(chapters) {
  const pages = [];

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
    const chapter = chapters[chapterIndex];
    const budgets = chapterBudgets(chapter.title);
    const limit = () => (page.continued ? budgets.continued : budgets.first);
    // 章末の区切り線は、次の章見出しと重複するので落とす
    const blocks = chapter.blocks.filter(
      (block, index, list) => !(block.type === "hr" && index === list.length - 1)
    );

    let page = {
      chapter: chapter.title,
      chapterIndex,
      blocks: [],
      estimate: 0,
      continued: false,
    };

    const flush = () => {
      pages.push(page);
      page = {
        chapter: chapter.title,
        chapterIndex,
        blocks: [],
        estimate: 0,
        continued: true,
      };
    };

    const queue = blocks.slice();
    while (queue.length > 0) {
      const block = queue.shift();
      const height = estimateBlock(block);

      // 先頭の区切り線だけのページは作らない
      if (page.blocks.length === 0 && block.type === "hr") continue;

      if (page.blocks.length > 0 && page.estimate + height > limit()) {
        // 残りに収まるなら、表の行・コードの行などで分割して詰める
        let parts = splitToFit(block, limit() - page.estimate);
        const last = page.blocks[page.blocks.length - 1];
        // 見出しの直後で分割しきれない場合は、小さな末尾も許して見出しと一緒に送る
        if (!parts && last && last.type === "heading") {
          parts = splitToFit(block, limit() - page.estimate, true);
        }
        if (parts) {
          page.blocks.push(parts.head);
          page.estimate += estimateBlock(parts.head);
          queue.unshift(parts.tail);
          flush();
          continue;
        }

        // 見出しだけがページ末尾に残らないよう、次のページへ送る
        let carry = null;
        if (last && last.type === "heading" && page.blocks.length > 1) {
          carry = page.blocks.pop();
          page.estimate -= estimateBlock(carry);
        }
        flush();
        if (carry) {
          page.blocks.push(carry);
          page.estimate += estimateBlock(carry);
        }
        queue.unshift(block);
        continue;
      }

      // 空のページにも収まらない巨大ブロックは、ページ容量で分割する
      if (page.blocks.length === 0 && height > limit()) {
        const parts = splitToFit(block, limit(), true);
        if (parts) {
          page.blocks.push(parts.head);
          page.estimate += estimateBlock(parts.head);
          queue.unshift(parts.tail);
          flush();
          continue;
        }
      }

      page.blocks.push(block);
      page.estimate += height;
    }

    if (page.blocks.length > 0 || pages.length === 0) {
      pages.push(page);
    }
  }

  return pages;
}

export function chapterStarts(pages) {
  const starts = new Map();
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    if (!starts.has(page.chapterIndex) && !page.continued) {
      starts.set(page.chapterIndex, index);
    }
  }
  return starts;
}
