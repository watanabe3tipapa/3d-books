#!/usr/bin/env node
// macOS の LaunchAgent として watcher を常駐させる。
// 使い方: node scripts/launchd.mjs install | status | restart | uninstall
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.platform !== "darwin") {
  console.error("このスクリプトは macOS 専用です。");
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LABEL = "com.watanabe3tipapa.3d-books.watcher";
const PLIST_PATH = path.join(os.homedir(), "Library", "LaunchAgents", `${LABEL}.plist`);
const LOG_DIR = path.join(ROOT, ".logs");
const LOG_PATH = path.join(LOG_DIR, "watcher.log");
const BIN_DIR = path.join(ROOT, ".bin");
const BIN_PATH = path.join(BIN_DIR, "3d-books");
const UID = process.getuid();
const DOMAIN = `gui/${UID}`;

function nodeBinary() {
  if (process.env.NODE_BIN) return process.env.NODE_BIN;
  // Homebrew のバージョン固定パスではなく、更新に追従する symlink を優先する
  for (const candidate of ["/usr/local/bin/node", "/opt/homebrew/bin/node"]) {
    try {
      if (fs.realpathSync(candidate) === fs.realpathSync(process.execPath)) return candidate;
    } catch {
      // 次の候補へ
    }
  }
  return process.execPath;
}

function xml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plist() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${xml(LABEL)}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(BIN_PATH)}</string>
    <string>${xml(path.join(ROOT, "scripts", "watch.mjs"))}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xml(ROOT)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>BOOKS_ONLY</key>
    <string>1</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>${xml(LOG_PATH)}</string>
  <key>StandardErrorPath</key>
  <string>${xml(LOG_PATH)}</string>
</dict>
</plist>
`;
}

function launchctl(args) {
  return spawnSync("launchctl", args, { encoding: "utf8" });
}

function bootout() {
  const result = launchctl(["bootout", DOMAIN, PLIST_PATH]);
  if (result.status !== 0 && !/No such process|Could not find service/i.test(result.stderr || "")) {
    return result;
  }
  return null;
}

function bootstrap() {
  const result = launchctl(["bootstrap", DOMAIN, PLIST_PATH]);
  if (result.status === 0) return null;
  // 古い macOS 向けのフォールバック
  return launchctl(["load", "-w", PLIST_PATH]);
}

function status() {
  const result = launchctl(["print", `${DOMAIN}/${LABEL}`]);
  if (result.status !== 0) {
    console.log("LaunchAgent は登録されていません。");
    console.log(`  npm run watcher:install`);
    return false;
  }
  const lines = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(state|pid|program|working directory|path) = /.test(line));
  console.log("LaunchAgent: 登録済み");
  for (const line of lines) console.log(`  ${line}`);
  console.log(`  plist: ${PLIST_PATH}`);
  console.log(`  log  : ${LOG_PATH}`);
  return true;
}

function install() {
  fs.mkdirSync(path.dirname(PLIST_PATH), { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.mkdirSync(BIN_DIR, { recursive: true });
  // プロセス名を node ではなく 3d-books として見せるためのランチャー
  fs.rmSync(BIN_PATH, { force: true });
  fs.symlinkSync(nodeBinary(), BIN_PATH);
  fs.writeFileSync(PLIST_PATH, plist(), "utf8");

  bootout();
  const error = bootstrap();
  if (error && error.status !== 0) {
    console.error("LaunchAgent の登録に失敗しました。");
    console.error(error.stderr || error.stdout || "");
    process.exit(1);
  }

  console.log("LaunchAgent を登録しました。");
  console.log(`  label    : ${LABEL}`);
  console.log(`  3d-books : ${BIN_PATH}`);
  console.log(`  runtime  : ${nodeBinary()}`);
  console.log(`  root     : ${ROOT}`);
  console.log(`  log  : ${LOG_PATH}`);
  console.log("");
  console.log("contents/*.md を置くと自動で製本されます。");
  console.log("状態確認: npm run watcher:status");
  console.log("停止    : npm run watcher:uninstall");
}

function uninstall() {
  bootout();
  if (fs.existsSync(PLIST_PATH)) fs.rmSync(PLIST_PATH);
  fs.rmSync(BIN_PATH, { force: true });
  console.log("LaunchAgent を解除しました。");
  console.log(`  plist: ${PLIST_PATH}`);
  console.log(`  log  : ${LOG_PATH}（履歴は残しています）`);
}

const command = process.argv[2] || "status";
if (command === "install") {
  install();
} else if (command === "uninstall") {
  uninstall();
} else if (command === "restart") {
  bootout();
  const error = bootstrap();
  if (error && error.status !== 0) {
    console.error(error.stderr || error.stdout || "");
    process.exit(1);
  }
  console.log("LaunchAgent を再起動しました。");
  status();
} else if (command === "status") {
  status();
} else {
  console.error(`不明なコマンド: ${command}`);
  console.error("使い方: node scripts/launchd.mjs install | status | restart | uninstall");
  process.exit(1);
}
