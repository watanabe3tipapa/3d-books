// 章のブロックを紙面の高さに収まるページへ分割する。
// 実際の描画はスクロール可能なので、ここでは「読みやすい単位」に切ることを優先する。

const PAGE_BUDGET = 548;

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

function estimateBlock(block) {
  switch (block.type) {
    case "heading":
      return block.level === 3 ? 42 : block.level === 4 ? 34 : 28;
    case "paragraph":
      return linesFor(block.text, 52) * 26 + 14;
    case "list": {
      let height = 12;
      for (const item of block.items) {
        height += linesFor(item.text, 48) * 24 + 8;
        if (item.depth > 0) height += 2;
      }
      return height;
    }
    case "table":
      return 26 + (block.rows.length + 1) * 32 + 14;
    case "code":
      return 38 + block.code.split("\n").length * 18 + 14;
    case "quote":
      return linesFor(block.text, 46) * 25 + 28;
    case "hr":
      return 22;
    default:
      return 24;
  }
}

export function paginate(chapters, budget = PAGE_BUDGET) {
  const pages = [];

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
    const chapter = chapters[chapterIndex];
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

    for (const block of chapter.blocks) {
      const height = estimateBlock(block);
      if (page.blocks.length > 0 && page.estimate + height > budget) {
        flush();
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
