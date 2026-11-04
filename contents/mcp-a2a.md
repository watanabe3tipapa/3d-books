---
title: MCP と A2A
subtitle: マルチエージェント時代の接続プロトコル
author: Notes - Tech
description: AIの手「MCP」とAIの口「A2A」。2026-07-28 の最新仕様、比較、セルフホスト、実践ユースケースまでを一冊に。
tags: [MCP, A2A, AIエージェント, プロトコル]
accent: gold
---

# Notes - Tech

## MCP と A2A の関係

**MCP（Model Context Protocol）** は AI が外部ツールやデータにアクセスするための規格（「AIの手」）、**A2A（Agent-to-Agent Protocol）** は AI エージェント同士がタスクを分担・協調するための規格（「AIの口」）。両者は対立するものではなく、異なるレイヤーを補完する。

マルチエージェント時代の全体像としては、営業支援AIエージェントが CRM のデータを MCP 経由で取得し、その分析結果を A2A 経由でレポート作成AIエージェントに渡す、といった連携が可能。各 AI エージェントは MCP で必要なツールやデータにアクセスしつつ、A2A で他のエージェントと協調して複雑なタスクを遂行する。

---

## MCP（Model Context Protocol）詳細

| 項目 | 内容 |
|------|------|
| 提唱元 | Anthropic（2024年11月） |
| 現行安定仕様 | **2026-07-28**（本日2026-07-28正式リリース） |
| 管理団体 | Linux Foundation（2025年12月移管） |
| エコシステム規模 | 7,000+ サーバー（2026年半ば） |

### アーキテクチャ

```
Host (Claude Desktop, Cursor, カスタムAgent) → Client → Server (Tool/Data提供)
```

- **Host**: アプリケーション全体を所有（Claude Desktop, カスタムエージェントなど）
- **Client**: Host 内部で各 MCP Server との接続を1対1で管理
- **Server**: ツール・リソース・プロンプトを公開するプロセス

### 3つのプリミティブ

| プリミティブ | 役割 | 代表的なユースケース |
|-------------|------|---------------------|
| **Tools** | AIが呼び出せる関数（書き込み可） | DB検索、API呼び出し、ファイル操作 |
| **Resources** | URIで識別される読み取り専用データ | ドキュメント参照、設定ファイル読取 |
| **Prompts** | パラメータ化されたテンプレート指示 | 定型処理の指示テンプレート |

### トランスポート

| 方式 | 用途 | 接続形態 | 状態 |
|------|------|---------|------|
| **stdio** | ローカル開発 | 親プロセスが子プロセスとして起動、stdin/stdoutでJSON-RPC | 現行（変更なし） |
| **Streamable HTTP** | リモート本番 | HTTP POSTで単一エンドポイントに送信、`text/event-stream`でストリーム | **推奨（** `Mcp-Method` / `Mcp-Name` **ヘッダ必須）** |
| HTTP+SSE（旧） | 互換用 | 非推奨。最低12ヶ月の非推奨期間後削除予定 | ❌ 非推奨 |

### 公式SDK

| 言語 | パッケージ | 備考 |
|------|-----------|------|
| Python | `mcp`（旧 `fastmcp` は `MCPServer` に統合） | v2 正式版。`MCPServer` デコレータベース、新旧両プロトコルを自動ネゴシエーション |
| TypeScript | `@modelcontextprotocol/server` / `@modelcontextprotocol/client` | v2 でサーバ・クライアントパッケージ分割。デフォルトは2025プロトコル、オプトインで2026-07-28 |
| Go | `@modelcontextprotocol/go` | Tier1 SDK、`StreamableHTTPOptions.Stateless = true` で2026-07-28 |
| C# | `@modelcontextprotocol/csharp-sdk` | Tier1 SDK、HTTPトランスポートはデフォルトで2026-07-28 |
| Rust / Java / Kotlin / Ruby / Swift | コミュニティSDK | 各言語対応 |

### 2025-11-25 までのライフサイクル（旧）

1. **initialize** — `protocolVersion` と `capabilities` を交換
2. **initialized** — `notifications/initialized` 通知でセッション開始
3. **discovery** — `tools/list`, `resources/list`, `prompts/list` で公開一覧取得
4. **invocation** — `tools/call` でツール実行、結果を content array で受取
5. **shutdown** — stdio は stdin クローズ、HTTP は DELETE でセッション終了

### 2026-07-28 での変更点（本日リリース）

プロトコル開始以来最大の改訂。6つの SEP（Specification Enhancement Proposal）で構成される。

#### 1. ステートレスコア（SEP-2575 / SEP-2567）— **破壊的変更**

- **`initialize` / `initialized` ハンドシェイク廃止**（SEP-2575）
  - 代わりに毎リクエストの `_meta` に `protocolVersion` / `clientInfo` / `clientCapabilities` を含める
  - サーバーは新 RPC `server/discover` を実装必須。クライアントはこれを叩いて能力を事前取得
- **`Mcp-Session-Id` ヘッダ廃止**（SEP-2567）
  - 接続依存のルーティング不要 → **ラウンドロビンロードバランサで水平スケール可能に**
  - ステートフルな処理が必要な場合はアプリケーション側で明示的なハンドルを発行・管理

```json
// 2026-07-28 の tools/call リクエスト例（ハンドシェイク不要）
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": {"q": "MCP stateless"},
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {"name": "my-app", "version": "1.0"}
    }
  }
}
```

#### 2. ルーティング可能なヘッダ（SEP-2243）

- Streamable HTTP で `Mcp-Method` と `Mcp-Name` ヘッダが**必須**に
- ロードバランサ・ゲートウェイがボディをパースせずにルーティング・レート制限可能に

#### 3. レスポンスキャッシュ（SEP-2549）

- `tools/list` / `resources/list` / `prompts/list` / `resources/read` / `resources/templates/list` の結果に `ttlMs`（有効期限ミリ秒）と `cacheScope`（`public` / `private`）を追加
- HTTP `Cache-Control` に着想を得た設計。`listChanged` 通知と併用

#### 4. MRTR（Multi Round-Trip Requests）（SEP-2322）

- サーバー開始のコール（sampling, elicitation）を置き換え
- サーバーは `InputRequiredResult` に `inputRequests` + `requestState` を含めて返す
- クライアントが入力を収集し、元の呼び出しに `inputResponses` を付けて再送

#### 5. Tasks 拡張（SEP-2663）

- `2025-11-25` で実験的にコア機能だった Tasks を**拡張**として正式に再設計
- `tasks/result`（ブロッキング）→ `tasks/get`（ポーリング）に変更
- `tasks/list` は削除、`tasks/update` を追加

#### 6. MCP Apps（SEP-1865）

- サーバーが**インタラクティブなHTML UI**を配信できる新しい拡張
- ホストはサンドボックス化されたiframeでレンダリング
- ツールは事前にUIテンプレートを宣言し、ホストはプリフェッチ・キャッシュ・セキュリティレビュー可能

#### 7. 非推奨化ポリシー（SEP-2596 / SEP-2577）

- 機能は最低 **12ヶ月**の非推奨期間を経て削除
- **非推奨（最低12ヶ月維持）**: Roots / Sampling / Logging / HTTP+SSE トランスポート
- 後方互換性: SDK v2 は新旧両プロトコルを自動ネゴシエーション（Python v2 サーバは1エンドポイントで両対応）

#### 2026-07-28 への移行チェックリスト

| 対応 | 内容 |
|------|------|
| SDK更新 | v2 系にアップデート（Python: `mcp` v2 / TypeScript: `@modelcontextprotocol/server`） |
| `initialize`削除 | `_meta` からプロトコルバージョン・クライアント情報を読むよう変更 |
| `server/discover`実装 | 新 RPC を実装（必須） |
| `Mcp-Session-Id`依存排除 | セッションIDキーの状態管理をアプリケーションレベルの明示的ハンドルに移行 |
| `ttlMs`/`cacheScope`付与 | `tools/list`, `resources/list` 等の結果に付与 |
| ヘッダ検証 | `Mcp-Method`, `Mcp-Name` ヘッダの検証ロジック追加 |
| ロードバランサ設定 | スティッキーセッション不要に。`clientAffinityEnabled: false` |

---

## A2A（Agent-to-Agent Protocol）詳細

| 項目 | 内容 |
|------|------|
| 提唱元 | Google DeepMind（2025年4月） |
| 現行安定仕様 | v1.0（2026年） |
| 管理団体 | Linux Foundation（2025年6月移管、150+ 組織が支援） |
| 運営体制 | AWS, Cisco, Google, IBM, Microsoft, Salesforce, SAP, ServiceNow が参加 |

### アーキテクチャ

```
User → Client Agent → [A2A JSON-RPC over HTTP] → Remote Agent (Server)
                                                    │
                                           Agent Card で発見
                                           (/.well-known/agent-card.json)
```

- **Client Agent**: タスクを委譲する側（orchestrator）
- **Remote Agent**: タスクを受け取って実行する側（server）
- **Agent Card**: エージェントの能力・連絡先・認証方式を記述したJSON（`/.well-known/agent-card.json`）

### 主要コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| **AgentCard** | エージェントの名刺。名前、説明、バージョン、スキル一覧、認証方式、対応メディアタイプを宣言 |
| **AgentSkill** | 個別の能力単位。id, name, description, tags, examples を持つ |
| **AgentExecutor** | タスク実行を司る抽象クラス。`execute()` と `cancel()` を実装 |
| **TaskStore** | タスクの状態を保持。メモリ（開発用） or DB（本番用） |
| **Task** | タスクオブジェクト。状態遷移と成果物（Artifact）を管理 |

### タスクライフサイクル

```
submitted → working → completed
                  ↘ input-required → 再開 → completed
                  ↘ failed
                  ↘ canceled
```

- A2A は**ステートフル**なタスクモデル（MCP と最も異なる点）
- タスクは永続的なオブジェクトで、polling / SSE / Webhook で状態変化を通知可能
- `input-required` 状態によりマルチターン対話が可能

### トランスポート

| 方式 | 用途 |
|------|------|
| JSON-RPC over HTTP | 基本。リクエスト/レスポンス型 |
| SSE（Server-Sent Events） | ストリーミング応答。リアルタイムな進捗通知 |
| Push Notification | Webhook による非同期完了通知（`pushNotifications`） |

### 公式SDK

| 言語 | パッケージ | 備考 |
|------|-----------|------|
| Python | `a2a-sdk` | v1.1.0（2026年5月）。Starlette / FastAPI に統合可能 |
| TypeScript | `@a2a/sdk` | npm 公開 |

### Agent Card の例

```json
{
  "name": "Code Review Agent",
  "description": "コードのセキュリティ・パフォーマンス・スタイルをレビュー",
  "url": "https://code-review.example.com/a2a",
  "version": "1.0.0",
  "capabilities": { "streaming": true, "pushNotifications": true },
  "authentication": { "schemes": ["Bearer"] },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    {
      "id": "security-scan",
      "name": "セキュリティスキャン",
      "description": "OWASP Top 10 の脆弱性を検出",
      "tags": ["security", "code-review"]
    },
    {
      "id": "performance-analysis",
      "name": "パフォーマンス分析",
      "description": "N+1クエリ、メモリリーク、非効率なアルゴリズムを検出",
      "tags": ["performance", "optimization"]
    }
  ]
}
```

### A2A v1.0 の主要機能

- **署名付きAgent Card**: 暗号学的に Agent Card の改ざんを防止（公開鍵検証）
- **マルチテナンシー**: 認証済みユーザー向けに拡張スキルを公開可能（2枚のAgent Card）
- **バージョンネゴシエーション**: HTTP ヘッダ `A2A-Version: 1.0` でプロトコルバージョンを指定

---

## MCP vs A2A 比較表

| 観点 | MCP | A2A |
|------|-----|-----|
| **目的** | AI ↔ ツール・データ接続 | エージェント ↔ エージェント連携 |
| **通信方向** | 垂直（Agent → Tool） | 水平（Agent ↔ Agent） |
| **アーキテクチャ層** | ツール統合層 | エージェント協調層 |
| **通信モデル** | クライアント-サーバ | ピアツーピア（二者ともAgent） |
| **発見方法** | `server/discover` + `tools/list`（動的） | Agent Card（`/.well-known/agent-card.json`、静的） |
| **状態管理** | **完全ステートレス（プロトコルレベル）** / アプリ状態は明示的ハンドルで管理 | ステートフル（タスクライフサイクル有り） |
| **レイテンシモデル** | 同期的・短命（ms〜秒） | 非同期的・長時間（秒〜時間・日） |
| **マルチモーダル** | テキスト + バイナリ | テキスト + 構造化データ + 動画・音声・IFrame |
| **認証** | Bearer Token（推奨: OAuth 2.1） | OAuth 2.0 / API Key / 署名付きAgent Card |
| **トラストモデル** | ホストベース（暗黙的信頼） | 明示的認証（組織境界を越えて動作） |
| **SDK充実度** | 非常に高い（7言語以上） | 発展途上（Python, TypeScript） |
| **主なユースケース** | 単一Agentのツール呼出 | 複数Agent間のタスク委譲・協調 |

### 使い分けの指針

| シナリオ | MCP | A2A | 両方 |
|---------|-----|-----|------|
| Claude Desktop + ローカルツール | ✓ | | |
| 単一AgentのAPIアクセス | ✓ | | |
| 同一組織内のAgent委譲 | | ✓ | |
| 組織を越えたAgent連携 | | ✓ | |
| 長時間タスク（数分〜数時間） | | ✓ | |
| Orchestrator + ローカルツール + リモートAgent | | | ✓ |
| エンタープライズマルチエージェント基盤 | | | ✓ |

> **補足**: MCP を Agent 間連携に使うことはできない（タスクライフサイクル・双方向通信・事前発見を欠く）。A2A をツール呼び出しに使うことも過剰設計（Agent Card・状態管理は単純な関数呼出には不要）。適材適所が原則。

---

## 実装ハンズオン

### MCP サーバーをセルフホストする

本番 MCP サーバーは以下の **4層** で構成する。ツールそのものの実装より、周辺の運用層に工数がかかる点が肝。

```
Transport（通信）→ Gate（認証）→ Box（コンテナ化）→ Edge（リバースプロキシ+TLS）
```

#### Step 1: Transport — Streamable HTTP 対応

Python `mcp` v2 の場合、`MCPServer` を使う。v2 サーバーは1エンドポイントで 2025-11-25 と 2026-07-28 の両プロトコルを自動ネゴシエーションする。

```python
# server.py
from mcp.server import MCPServer

app = MCPServer("notes-server")

@app.tool()
def search_notes(query: str) -> str:
    return f"Search results for: {query}"

if __name__ == "__main__":
    # v2 はデフォルトで Streamable HTTP + 両プロトコル対応
    app.run(host="0.0.0.0", port=8000)
```

これだけで `http://localhost:8000/mcp` に MCP エンドポイントが公開される。`Mcp-Method` と `Mcp-Name` ヘッダも自動付与される。古い2025クライアントも接続可能。

#### Step 2: Gate — Bearer Token 認証

MCP サーバーに認証を追加する。トークンはコードに書かず、環境変数から読み込む。

```python
import os

MCP_TOKEN = os.environ.get("MCP_TOKEN", "")

app = MCPServer("notes-server")

# v2 の認証機構を利用。または Nginx 側で認証を肩代わりする（Step 4 で後述）
```

`MCPServer` v2 は認証プラグイン機構を内蔵。または Nginx 側（Edge層）で認証を処理する構成も推奨。

#### Step 3: Box — Docker コンテナ化

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir mcp aiosqlite uvicorn
COPY server.py .

EXPOSE 8000
CMD ["python", "server.py"]
```

```yaml
# docker-compose.yml
services:
  mcp-server:
    build: .
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      - MCP_TOKEN=${MCP_TOKEN}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

- `127.0.0.1:8000:8000` で外部からの直接アクセスを防ぎ、Nginx のみが到達可能にする
- シークレットは環境変数で注入（`.env` ファイル or Docker Secrets）

#### Step 4: Edge — Nginx + TLS（Let's Encrypt）

```nginx
# /etc/nginx/sites-available/mcp
server {
    listen 443 ssl http2;
    server_name mcp.example.com;

    ssl_certificate /etc/letsencrypt/live/mcp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.example.com/privkey.pem;

    location /mcp {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # ★ 重要: SSE ストリーミングのための設定
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
        proxy_read_timeout 300s;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name mcp.example.com;
    return 301 https://$host$request_uri;
}
```

```bash
# 証明書取得
sudo certbot --nginx -d mcp.example.com
```

**`proxy_buffering off` と `proxy_read_timeout 300s` が絶対条件**。デフォルト設定ではストリームが途中で止まる。

#### Step 5: systemd デーモン化

```ini
# /etc/systemd/system/mcp-server.service
[Unit]
Description=MCP Notes Server
After=network-online.target docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/docker compose -f /opt/mcp-server/docker-compose.yml up -d
ExecStop=/usr/bin/docker compose -f /opt/mcp-server/docker-compose.yml down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### MCP クライアント設定

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
{
  "mcpServers": {
    "notes-server": {
      "url": "https://mcp.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_TOKEN>"
      }
    }
  }
}
```

#### 本番運用チェックリスト

| 項目 | 内容 |
|------|------|
| SDK更新 | `mcp` v2（Python） / `@modelcontextprotocol/server`（TypeScript）にアップデート |
| `initialize`廃止対応 | `_meta` からプロトコルバージョン・クライアント情報を読む |
| `Mcp-Session-Id`排除 | セッション依存の状態管理をアプリレベルの明示的ハンドルに移行 |
| `ttlMs`/`cacheScope` | `tools/list` 等に有効期限とキャッシュスコープを付与 |
| ロードバランサ | スティッキーセッション不要。`clientAffinityEnabled: false` |
| シークレット管理 | 環境変数 or Docker Secrets、イメージ内に書かない |
| 認証強化 | 静的Token → JWT → OAuth 2.1 へ段階的アップグレード |
| データ永続化 | コンテナは disposable。Volume マウント or 管理DBを使う |
| レート制限 | Nginx か API Gateway でリクエスト制限 |
| 監視・ヘルスチェック | `curl -f http://localhost:8000/mcp` の定期実行 |

#### VPS 最小要件

- 1 vCPU / 2 GB RAM / 20 GB SSD
- Ubuntu 22.04 LTS or Debian 12
- Docker Engine 20.10+ / Docker Compose v2
- 独自ドメイン（Let's Encrypt の証明書取得に必要）

---

### A2A サーバーをセルフホストする

#### Step 1: 環境構築

```bash
mkdir a2a-agent && cd a2a-agent
python -m venv .venv && source .venv/bin/activate
pip install "a2a-sdk[http-server]" uvicorn
```

#### Step 2: Agent Card を定義

```python
# agent_card.py
from a2a.types import (
    AgentCapabilities, AgentCard, AgentInterface, AgentSkill,
)

skill = AgentSkill(
    id="reverse-text",
    name="Reverse Text",
    description="受け取ったテキストを反転して返す",
    tags=["text", "utility"],
    examples=["hello", "world"],
)

public_agent_card = AgentCard(
    name="Reverse Agent",
    description="テキスト反転エージェント",
    version="1.0.0",
    default_input_modes=["text/plain"],
    default_output_modes=["text/plain"],
    capabilities=AgentCapabilities(streaming=True),
    supported_interfaces=[
        AgentInterface(
            protocol_binding="JSONRPC",
            url="http://127.0.0.1:9999",
            protocol_version="1.0",
        )
    ],
    skills=[skill],
)
```

#### Step 3: Agent Executor を実装

```python
# agent_executor.py
import asyncio
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.types import Task, TaskState, TaskStatus, TaskStatusUpdateEvent
from a2a.utils.message import new_agent_text_message


class ReverseAgentExecutor(AgentExecutor):
    async def execute(self, context: RequestContext, event_queue: EventQueue):
        user_text = context.message.parts[0].root.text

        await event_queue.put(
            TaskStatusUpdateEvent(
                task_id=context.task_id,
                context_id=context.context_id,
                status=TaskStatus(state=TaskState.working),
                final=False,
            )
        )

        reversed_text = user_text[::-1]

        await event_queue.put(
            Task(
                id=context.task_id,
                context_id=context.context_id,
                status=TaskStatus(
                    state=TaskState.completed,
                    message=new_agent_text_message(
                        reversed_text, context.context_id, context.task_id,
                    ),
                ),
            )
        )

    async def cancel(self, context: RequestContext, event_queue: EventQueue):
        await event_queue.put(
            Task(
                id=context.task_id,
                context_id=context.context_id,
                status=TaskStatus(state=TaskState.canceled),
            )
        )
```

#### Step 4: サーバーを起動

```python
# server.py
import uvicorn
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.routes import create_agent_card_routes, create_jsonrpc_routes
from a2a.server.tasks import InMemoryTaskStore
from starlette.applications import Starlette

from agent_card import public_agent_card
from agent_executor import ReverseAgentExecutor

request_handler = DefaultRequestHandler(
    agent_executor=ReverseAgentExecutor(),
    task_store=InMemoryTaskStore(),
    agent_card=public_agent_card,
)

routes = []
routes.extend(create_agent_card_routes(public_agent_card))
routes.extend(create_jsonrpc_routes(request_handler, "/"))

app = Starlette(routes=routes)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9999)
```

```bash
python server.py
```

#### Step 5: curl で動作確認

```bash
# Agent Card の取得
curl -s http://127.0.0.1:9999/.well-known/agent-card.json | python -m json.tool

# テキスト反転の依頼（A2A-Version ヘッダ必須）
curl -s -X POST http://127.0.0.1:9999/ \
  -H "Content-Type: application/json" \
  -H "A2A-Version: 1.0" \
  -d '{
    "jsonrpc": "2.0",
    "id": "req-1",
    "method": "SendMessage",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "Hello A2A!"}],
        "messageId": "msg-1"
      }
    }
  }'
```

> **注意**: `A2A-Version: 1.0` ヘッダを忘れると SDK が古い 0.3 ワイヤーフォーマットと解釈し、エラーになる。公式ドキュメントでも見落としがちなポイント。

#### Python クライアントから呼び出す

```python
# client.py
import asyncio
from a2a.client import A2AClient


async def main():
    async with A2AClient(url="http://localhost:9999") as client:
        card = await client.get_agent_card()
        print(f"Connected to: {card.name}")
        print(f"Skills: {[s.name for s in card.skills]}")

        response = await client.send_message(
            message={
                "role": "user",
                "parts": [{"kind": "text", "text": "Protocol tutorial"}],
            }
        )
        task = response.result
        reply = task.status.message.parts[0].root.text
        print(f"Agent replied: {reply}")


asyncio.run(main())
```

#### A2A サーバーの本番デプロイ

MCP と全く同じパターン（Docker + Nginx + TLS + systemd）が適用できる。注意点として、A2A は**ステートフル**（`TaskStore` にタスク状態を保持）なので、複数レプリカで運用する場合は `InMemoryTaskStore` ではなく Redis や PostgreSQL を使う。

```yaml
# docker-compose.yml
services:
  a2a-agent:
    build: .
    ports:
      - "127.0.0.1:9999:9999"
    environment:
      - A2A_TOKEN=${A2A_TOKEN}
    restart: unless-stopped
```

Nginx の設定は MCP と同様で、`proxy_buffering off` + `proxy_read_timeout 300s` を忘れずに。

#### Google ADK を使った A2A 簡略化

Google Agent Development Kit（ADK）を使うと、既存のAgent を1行で A2A サーバー化できる。

```python
from google.adk import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a

agent = Agent(
    model="gemini-2.0-flash",
    name="smart_reverse",
    description="受け取ったテキストを反転して返す",
    instruction="ユーザーから受け取ったテキストを反転して返してください。",
)

app = to_a2a(agent, port=8001)
# uvicorn adk_agent:app --host localhost --port 8001
```

---

## 実践ユースケース

### ケース1: MCPのみ — 単一Agent + ツール連携

```
ユーザー → AIエージェント → MCP → 社内DB・API・ファイルシステム
```

- **例**: 「営業資料の下書きを作成して」→ AI が社内Wiki（MCP Resource）と顧客DB（MCP Tool）を参照して下書きを生成
- **評価**: 単一Agentで完結する場合、A2A は不要。MCP だけで十分。

### ケース2: A2Aのみ — 複数Agent間のタスク委譲

```
ユーザー → Orchestrator Agent
              │ A2A
              ├── Research Agent（調査）
              ├── Compliance Agent（コンプライアンス審査）
              └── Report Agent（レポート生成）
```

- **例**: 「競合他社の価格調査をして、コンプライアンスチェックを通したレポートを作って」
- **評価**: 各Agentは外部ツールを必要としない（内部知識or提供データのみ）。A2A でタスク委譲するだけで完結。

### ケース3: MCP + A2A の併用（推奨） — ハイブリッドアーキテクチャ

```
ユーザー → Orchestrator Agent
              │ A2A（タスク委譲）
              ├── Research Agent ── MCP（Web検索・スクレイピング）
              ├── Compliance Agent ── MCP（法令DB・契約書DB）
              └── Report Agent ── MCP（CMSツール）
```

**実例: コンプライアンスパイプライン**（Python + Go のクロスランゲージ協調）

```
[Python] Extract Agent ─── A2A ───→ [Go] Compliance Agent
    │ MCP                                    │ MCP
    ├── 契約書DB読み取り                     ├── ポリシーDB検索
    └── LLM抽出（Gemini）                    └── 完全決定論的ルール検証
                                          ↓
                              [Python] Report Agent
                                  │ MCP
                                  └── レポート生成・CMS保存
```

- Orchestrator は A2A で Extract → Compliance → Report の順にタスク委譲
- 各Agent は必要に応じて MCP でツールを呼ぶ
- Go の Compliance Agent は LLM を使わず決定論的な検証 → **監査証跡として信頼性が高い**
- Compliance Agent が応答不能の場合は `MANUAL_REVIEW` 状態に遷移（**フェイルセーフ設計**）

### ハイブリッド導入の判断基準

| 要件 | 採用プロトコル |
|------|--------------|
| 外部API連携・DB操作・ファイル操作 | MCP |
| 社内SaaS（CRM/HRIS/ERP）との統合 | MCP |
| 専門Agentへのタスク委譲（同一組織内） | A2A |
| 組織を越えたAgent間連携 | A2A（必須） |
| 長時間タスク（数分〜数時間）の非同期実行 | A2A |
| Agent同士の双方向対話（質問→回答） | A2A |
| シングルAgent完結のツール呼出 | MCPのみ（A2A不要） |

---

## 参考リンク

### MCP

| リンク | 説明 |
|--------|------|
| https://modelcontextprotocol.io/specification/draft | **2026-07-28 最新仕様（本日リリース）** |
| https://modelcontextprotocol.io/specification/draft/changelog | 2025-11-25 からの変更点一覧 |
| https://modelcontextprotocol.io/specification/2025-11-25 | 旧安定仕様（2025-11-25） |
| https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/ | リリース候補アナウンス（変更点の詳細解説） |
| https://blog.modelcontextprotocol.io/posts/sdk-betas-2026-07-28/ | SDK v2 ベータアナウンス |
| https://modelcontextprotocol.io/quickstart/server | 公式クイックスタート |
| https://github.com/modelcontextprotocol/typescript-sdk | TypeScript SDK（v2: `@modelcontextprotocol/server`） |
| https://github.com/modelcontextprotocol/python-sdk | Python SDK（v2: `mcp`） |
| https://github.com/modelcontextprotocol/go-sdk | Go SDK（Tier1） |
| https://github.com/modelcontextprotocol/csharp-sdk | C# SDK（Tier1） |
| https://github.com/modelcontextprotocol/inspector | MCP Inspector（デバッグツール） |
| https://registry.modelcontextprotocol.io/ | 公式レジストリ（7,000+ サーバー） |
| https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/ | 2026年ロードマップ |

### A2A

| リンク | 説明 |
|--------|------|
| https://a2a-protocol.org/latest/ | 公式プロトコルドキュメント |
| https://a2a-protocol.org/latest/tutorials/python/ | Python チュートリアル |
| https://github.com/a2aproject/a2a-samples | 公式サンプルコード |
| https://github.com/google/adk-python | Google Agent Development Kit |
| https://opensource.googleblog.com/2026/04/ | A2A 1周年ブログ（署名付きAgent Card等） |

### 比較・分析

| リンク | 説明 |
|--------|------|
| https://redis.io/blog/5-agent-architectures-mcp-a2a-protocol-guide/ | 5つのアーキテクチャシナリオ比較 |
| https://arxiv.org/html/2505.02279v1 | 学術サーベイ論文（MCP/ACP/A2A/ANP比較） |
| https://www.stackone.com/blog/mcp-vs-a2a-protocol/ | 技術比較と使い分けガイド |

### セルフホスト参考

| リンク | 説明 |
|--------|------|
| https://render.com/articles/building-and-hosting-mcp-servers-a-complete-guide | MCPサーバー構築・ホスティング完全ガイド（2026年4月） |
| https://www.virtua.cloud/learn/en/tutorials/build-mcp-server-vps | VPS上のMCPサーバー構築（TypeScript + Nginx + Let's Encrypt） |
| https://nerdleveltech.com/a2a-protocol-python-tutorial | A2A AgentをPythonで実装するチュートリアル（2026年7月） |
| https://perlod.com/tutorials/deploy-a-remote-mcp-server-with-docker/ | Docker + Nginx + TLS デプロイガイド |

---

> **更新履歴**: 2026-07-28 初版。MCP 仕様 2026-07-28（本日正式リリース）、A2A v1.0 の情報に基づく。MCP v2 の主な変更: ステートレスコア（initialize/セッション廃止）、server/discover、Mcp-Method/Name ヘッダ必須化、レスポンスキャッシュ、MRTR、Tasks/MCP Apps 拡張化。
