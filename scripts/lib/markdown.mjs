// 依存ライブラリなしの小さな Markdown パーサー。
// 本の生成に必要なブロック（見出し・段落・リスト・表・コード・引用・水平線）だけを扱う。

const HEADING = /^(#{1,6})\s+(.+?)\s*#*$/;
const FENCE = /^(\s*)(```+|~~~+)\s*([^\s`]*)\s*$/;
const HR = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const UL = /^(\s*)([-*+])\s+(.*)$/;
const OL = /^(\s*)(\d+)[.)]\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

export function splitFrontMatter(source) {
  const text = String(source).replace(/\r\n?/g, "\n");
  if (!text.startsWith("---\n")) return { meta: {}, body: text };

  const end = text.indexOf("\n---", 4);
  if (end === -1) return { meta: {}, body: text };

  const raw = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, "");
  const meta = {};

  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    meta[match[1]] = value;
  }

  return { meta, body };
}

function isBlank(line) {
  return /^\s*$/.test(line);
}

function listMatch(line) {
  const ul = line.match(UL);
  if (ul) {
    return {
      indent: ul[1].length,
      ordered: false,
      marker: ul[2],
      text: ul[3],
    };
  }
  const ol = line.match(OL);
  if (ol) {
    return {
      indent: ol[1].length,
      ordered: true,
      marker: ol[2],
      text: ol[3],
    };
  }
  return null;
}

function splitTableRow(line) {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => cell.trim());
}

function isTableStart(lines, i) {
  if (i + 1 >= lines.length) return false;
  if (!lines[i].includes("|")) return false;
  return TABLE_SEP.test(lines[i + 1]);
}

export function parseBlocks(source) {
  const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // コードフェンス
    const fence = line.match(FENCE);
    if (fence) {
      const indent = fence[1].length;
      const marker = fence[2][0];
      const lang = fence[3] || "";
      const code = [];
      i += 1;
      while (i < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[i])) {
        code.push(lines[i].slice(Math.min(indent, lines[i].length)));
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    // 見出し
    const heading = line.match(HEADING);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      i += 1;
      continue;
    }

    // 水平線（表の区切りより先に判定）
    if (HR.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // 表
    if (isTableStart(lines, i)) {
      const headers = splitTableRow(lines[i]);
      const align = splitTableRow(lines[i + 1]).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return "";
      });
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && !isBlank(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows, align });
      continue;
    }

    // 引用
    if (/^\s*>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: quote.join("\n").trim() });
      continue;
    }

    // リスト
    const firstItem = listMatch(line);
    if (firstItem) {
      const items = [];
      let ordered = firstItem.ordered;
      while (i < lines.length) {
        const item = listMatch(lines[i]);
        if (!item) {
          // 空行を挟んだ継続はリストを終了（シンプルさ優先）
          break;
        }
        ordered = item.ordered;
        let text = item.text;
        let checked = null;
        const task = text.match(/^\[([ xX])\]\s+(.*)$/);
        if (task) {
          checked = task[1].toLowerCase() === "x";
          text = task[2];
        }
        const depth = Math.min(3, Math.floor(item.indent / 2));
        i += 1;
        // ぶら下がり行（インデントされた継続行）を連結
        while (
          i < lines.length &&
          !isBlank(lines[i]) &&
          !listMatch(lines[i]) &&
          /^\s{2,}/.test(lines[i]) &&
          !isTableStart(lines, i)
        ) {
          text += " " + lines[i].trim();
          i += 1;
        }
        items.push({ text, depth, checked });
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // 段落
    const paragraph = [line.trim()];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      if (
        isBlank(next) ||
        FENCE.test(next) ||
        HEADING.test(next) ||
        HR.test(next) ||
        /^\s*>/.test(next) ||
        listMatch(next) ||
        isTableStart(lines, i)
      ) {
        break;
      }
      paragraph.push(next.trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

/**
 * Markdown を本の構造へ変換する。
 * H1 = 書名（front matter がなければ採用）、H2 = 章、H3/H4 = 章内見出し。
 */
export function parseBook(source, fallbackTitle = "Untitled") {
  const { meta, body } = splitFrontMatter(source);
  const blocks = parseBlocks(body);

  let title = typeof meta.title === "string" ? meta.title : "";
  const intro = [];
  const chapters = [];
  let current = null;

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 1) {
      if (!title) title = block.text;
      continue;
    }
    if (block.type === "heading" && block.level === 2) {
      current = { title: block.text, blocks: [] };
      chapters.push(current);
      continue;
    }
    if (current) current.blocks.push(block);
    else intro.push(block);
  }

  if (!title) title = fallbackTitle;
  if (chapters.length === 0) {
    chapters.push({ title, blocks: intro.splice(0) });
  } else if (intro.length) {
    chapters.unshift({ title: "はじめに", blocks: intro });
  }

  for (const chapter of chapters) {
    chapter.blocks = chapter.blocks.filter(
      (block) => !(block.type === "heading" && block.level <= 2)
    );
  }

  const description =
    typeof meta.description === "string"
      ? meta.description
      : firstParagraph(chapters) || `${title} をまとめた 3D ブック。`;

  return {
    meta,
    title,
    subtitle: typeof meta.subtitle === "string" ? meta.subtitle : "3D BOOKS",
    author: typeof meta.author === "string" ? meta.author : "3D Books",
    description,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    accent: typeof meta.accent === "string" ? meta.accent : "",
    chapters,
  };
}

function firstParagraph(chapters) {
  for (const chapter of chapters) {
    for (const block of chapter.blocks) {
      if (block.type === "paragraph") return stripInline(block.text);
    }
  }
  return "";
}

function stripInline(text) {
  return text.replace(/[*_`>#\[\]]/g, "").replace(/\s+/g, " ").trim();
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

/** インライン記法（強調・コード・リンク・打ち消し線） */
export function inline(text) {
  let value = escapeHtml(text);
  const codes = [];

  value = value.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000C${codes.length - 1}\u0000`;
  });

  value = value.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label, url) =>
      `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
  );
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  value = value.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  value = value.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  value = value.replace(/\u0000C(\d+)\u0000/g, (_, index) => {
    return `<code>${codes[Number(index)]}</code>`;
  });

  return value;
}

const KEYWORDS = new Set([
  "def", "return", "import", "from", "class", "if", "elif", "else", "for",
  "while", "in", "as", "with", "try", "except", "finally", "raise", "yield",
  "async", "await", "pass", "lambda", "True", "False", "None", "self",
  "const", "let", "var", "function", "new", "typeof", "export", "default",
  "public", "private", "static", "void", "int", "float", "bool", "string",
  "struct", "interface", "extends", "implements", "throw", "catch", "package",
  "include", "define", "using", "namespace", "override", "virtual", "null",
  "true", "false", "undefined", "this", "super", "type", "enum", "switch",
  "case", "break", "continue", "do", "end", "then", "fi", "esac", "sudo",
  "services", "volumes", "environment", "restart", "ports", "build", "image",
  "server", "location", "listen", "proxy_pass", "add_header",
]);

function highlightLine(line) {
  const pattern =
    /(\/\/.*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  let out = "";
  let last = 0;
  let match;

  while ((match = pattern.exec(line))) {
    out += escapeHtml(line.slice(last, match.index));
    const token = match[0];
    let cls = "";
    if (token.startsWith("//") || (token.startsWith("#") && !/^#\s*(include|define)/.test(token))) {
      cls = "tok-com";
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      cls = "tok-str";
    } else if (/^\d/.test(token)) {
      cls = "tok-num";
    } else if (KEYWORDS.has(token)) {
      cls = "tok-kw";
    } else if (line[match.index + token.length] === "(") {
      cls = "tok-fn";
    }
    out += cls
      ? `<span class="${cls}">${escapeHtml(token)}</span>`
      : escapeHtml(token);
    last = match.index + token.length;
  }

  out += escapeHtml(line.slice(last));
  return out;
}

export function highlightCode(code) {
  return code
    .split("\n")
    .map((line) => highlightLine(line))
    .join("\n");
}
