Tarkov Wiki / Tasks App (Next.js)
=================================

Escape from Tarkov のデータ（items / tasks / traders）を GraphQL（tarkov.dev）から取得し、
Next.js 15 (App Router) と React 19 で表示・検索するアプリです。RSC + DB キャッシュ、簡易認証、
多言語対応（日本語/英語）、Upstash Redis によるレート制限、SQLite FTS5 を用いた全文検索を備えています。

主な技術
- Next.js 15, React 19 (App Router, RSC)
- Prisma + SQLite（開発）/ 外部 DB（本番想定）
- GraphQL Code Generator（型生成）
- Upstash Redis（レート制限）
- SQLite FTS5（全文検索）
- i18n（`ja`/`en`）と言語プレフィックスミドルウェア

リポジトリ
- GitHub: https://github.com/sk-0908/tarkov-task-todo-2

目次
- 必要要件
- クイックスタート（ローカル）
- 環境変数
- データベースと全文検索(FTS5)
- スクリプト
- API エンドポイント
- Vercel デプロイ
- トラブルシュート

必要要件
- Node.js 18+（推奨 20+）
- SQLite（FTS5 対応ビルド。一般的な配布物は対応済み）
- （任意）Upstash Redis 資格情報（REST URL/Token）

クイックスタート（ローカル）
1) 依存関係のインストール
```bash
npm ci # or npm i / pnpm i / yarn
```

2) 環境変数の設定（`.env.local` などに設定）
下記「環境変数」を参照。

3) GraphQL 型生成（初回必須）
```bash
npm run codegen
```
`src/graphql/generated.ts` が生成されます。

4) データベースの準備（開発: SQLite）
```bash
npx prisma migrate dev
```

5) FTS5 のセットアップ（全文検索の仮想テーブル/トリガ）
SQLite CLI で実行します（パスは環境に合わせて調整）。
```bash
# Windows (PowerShell の例)
sqlite3 .\prisma\dev.db < prisma\fts5-setup.sql

# macOS/Linux の例
sqlite3 ./prisma/dev.db < prisma/fts5-setup.sql
```

6) 開発サーバ起動
```bash
npm run dev
```
http://localhost:3000 を開きます。

環境変数
以下を `.env.local` 等に設定してください。
```
# 開発（SQLite）の例
DATABASE_URL="file:./prisma/dev.db"

# RSC 内で内部 API を呼ぶためのベース URL
APP_URL="http://localhost:3000"

# レート制限（任意: 設定しない場合は開発時に失敗する可能性あり）
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

データベースと全文検索(FTS5)
- Prisma スキーマはデフォルトで SQLite を指します（`prisma/schema.prisma`）。
- 開発では `npx prisma migrate dev` でテーブルを作成します。
- 検索は SQLite FTS5 を使用します。`prisma/fts5-setup.sql` を SQLite に流して、
  仮想テーブル `search_fts` とトリガを作成してください。
- 検索用データ投入は `POST /api/search` に `{"action":"index_items","data":{ items, language }}` で投入できます。

スクリプト（package.json）
- `dev`: Next.js 開発サーバ（Turbopack）
- `build`: Next.js ビルド（Turbopack）
- `start`: プロダクション起動
- `lint`: ESLint 実行
- `type-check`: TypeScript 型チェック
- `codegen`: GraphQL Code Generator 実行
- `codegen:watch`: GraphQL スキーマ/クエリ監視しつつ型生成

API エンドポイント（概要）
- 認証
  - `POST /api/auth/signup` ユーザー登録
  - `POST /api/auth/signin` ログイン（HTTP-only Cookie `session-token`）
  - `POST /api/auth/signout` ログアウト
  - `GET  /api/auth/me` ログインユーザー取得
- CSRF
  - `GET /api/csrf` トークン発行（Cookie にシークレット設定）
- キャッシュ
  - `GET /api/cache/items?lang=ja|en` Items 一覧（DB キャッシュ）
  - `GET /api/cache/item/[id]?lang=ja|en` Item 詳細（DB キャッシュ）
  - `POST /api/cache/revalidate` RSC のタグ無効化
- 検索
  - `GET /api/search?q=...&lang=ja|en&kind=item|task|trader|map&limit=&offset=`
  - `POST /api/search`（`action=index_items` でインデックス投入）

Vercel デプロイ
- GitHub リポジトリを Import。
- Build Command を次のように設定してください。
  ```
  npm run codegen && npm run build
  ```
- 環境変数（最低限）
  - `APP_URL` = `https://<your-vercel-domain>`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `DATABASE_URL` = 外部 DB の接続文字列（Vercel 実行環境は書き込み不可のため SQLite は不可）
- 本番 DB について
  - 本番は外部 DB（例: Vercel Postgres/Neon/Supabase 等）を推奨します。
  - Prisma の `provider` を `postgresql` 等へ変更し、マイグレーションを適用してください。
  - 検索（FTS5）は SQLite 固有のため、Postgres 本番では tsvector/GIN 等に置き換える必要があります。

トラブルシュート
- ビルド時に `src/graphql/generated.ts` がない
  - `npm run codegen` を必ず実行。Vercel では Build Command に組み込み。
- レート制限で 429 エラーが出る
  - Upstash の URL/Token を設定。開発時は一時的にコードのフォールバックを検討。
- 検索がヒットしない
  - `prisma/fts5-setup.sql` の適用と、`/api/search` へのインデックス投入の実施を確認。
- Vercel で DB 書き込みが失敗する
  - 外部 DB を使用し、`DATABASE_URL` を設定。マイグレーションをデプロイ環境に適用。

謝辞
- データ提供: https://tarkov.dev/
