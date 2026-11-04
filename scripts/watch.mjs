#!/usr/bin/env node
// contents/ を監視し、ファイルが増減・更新された瞬間に製本を走らせる。
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENTS = path.join(ROOT, "contents");

let timer = null;
let running = false;
let queued = false;

function build(reason) {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  queued = false;
  const started = Date.now();
  console.log(`\n[watch] ${reason} → 製本を開始`);

  const child = spawn(process.execPath, [path.join(ROOT, "scripts", "build.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    running = false;
    console.log(`[watch] ${code === 0 ? "完了" : `失敗 (exit ${code})`} · ${((Date.now() - started) / 1000).toFixed(2)}s`);
    if (queued) build("変更が届きました");
  });
}

function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => build(reason), 180);
}

if (!fs.existsSync(CONTENTS)) {
  fs.mkdirSync(CONTENTS, { recursive: true });
}

console.log(`
  3D BOOKS watcher
  ─────────────────────────────────────────
  watching : contents/*.md
  output   : books/ + site/
  stop     : Ctrl+C
`);

build("初回ビルド");

try {
  fs.watch(CONTENTS, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (!filename.endsWith(".md")) return;
    schedule(`${eventType}: contents/${filename}`);
  });
} catch (error) {
  fs.watch(CONTENTS, (eventType, filename) => {
    if (!filename || !filename.endsWith(".md")) return;
    schedule(`${eventType}: contents/${filename}`);
  });
}

process.on("SIGINT", () => {
  console.log("\n[watch] 停止しました");
  process.exit(0);
});
