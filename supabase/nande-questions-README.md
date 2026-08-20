# 「今日のなんで」用 Supabaseテーブル

TOPページに表示する「⭐ 今日のなんで」ウィジェットのための、最小構成のデータベーステーブルです。
質問投稿フォームや管理画面は今回のスコープに含まれません。質問・回答は
**Supabase DashboardのTable Editorから手動で登録**する運用を前提にしています。

## できること・できないこと

- TOPページは、`is_public = true`の行だけをSupabaseのData API（PostgREST）経由で読み取り、日付（日本時間）から決定的に1件選んで表示します。同じ日であれば誰がアクセスしても同じ質問が表示されます
- 「今日の一問」を意図的に切り替えたい特別な日がある場合は、Table Editorで該当の行の`is_public`や`display_order`を編集してください。日次のcronのような自動処理は今回は組み込んでいません（並び順と日付から機械的に選ばれるだけです）
- 質問の投稿・書き込みはできません（読み取り専用）。ユーザーからの質問収集機能は将来のフェーズで別途検討します

## セットアップ手順

1. お問い合わせフォームで使っているものと**同じSupabaseプロジェクト**を使う想定です。新しいプロジェクトを作る必要はありません
2. `supabase/migrations/20260820000000_create_nande_questions.sql` を適用します
   ```
   supabase link --project-ref <あなたのプロジェクトref>
   supabase db push
   ```
   または、Supabase DashboardのSQL Editorに同ファイルの内容をそのまま貼り付けて実行してもかまいません
3. 適用すると、動作確認用のサンプル質問が2件自動的に登録されます。実際に使いたい質問に差し替える場合は、Table Editorで`nande_questions`テーブルを開き、行を編集・追加・削除してください
4. Supabase Dashboardの「Project Settings → API」から、以下の2つの値を確認します
   - Project URL（例：`https://xxxxxxxxxxxx.supabase.co`）
   - `anon` `public` キー（**`service_role`キーではないので注意**。anon keyはブラウザに公開されて問題ない鍵です）
5. `js/why.js`内の以下2行を、実際の値に差し替えてください（現在はプレースホルダーです）
   ```js
   const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR-SUPABASE-ANON-KEY";
   ```

## テーブル定義（概要）

| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid | 主キー（自動生成） |
| `emoji` | text | 表示用の絵文字（省略可、既定は❓） |
| `question` | text | 質問文（必須） |
| `options` | text[] | 選択肢（0〜複数。空の場合は「答えを見る」ボタンのみ表示） |
| `answer_short` | text | 🔬 ポンターレラボの答え（必須） |
| `lab_comment` | text | 🧪 ポンターレラボからのひとこと（省略可） |
| `is_public` | boolean | trueの行だけがTOPページに表示される（既定true） |
| `display_order` | integer | 表示順の目安（省略可。省略時は登録日時順） |
| `created_at` | timestamptz | 登録日時（自動） |

投稿者情報（氏名・メールアドレス等）に相当するカラムはそもそも存在しません。このテーブルは完全に管理者による手動登録のみを想定しているためです。

## セキュリティ（RLS）

- Row Level Security（RLS）を有効化し、匿名クライアント（`anon`ロール）には「`is_public = true`の行を読み取る」ことだけを許可しています
- INSERT/UPDATE/DELETEのポリシーは一切定義していないため、ブラウザ側から書き込むことはできません（RLSとテーブル権限の両方でブロックされます）
- 行の追加・編集・削除は、Supabase Dashboardからのみ行えます（DashboardはRLSを経由しない管理者権限でアクセスするため）
- 既存のお問い合わせフォーム（`contact-form` Edge Function）はこのテーブルを一切参照しないため、影響はありません

## 動作確認

セットアップ後、`index.html`（TOPページ）を開き、以下を確認してください。

- 「⭐ 今日のなんで」セクションが表示され、質問と絵文字が出ていること
- 選択肢（または「答えを見る」ボタン）をクリックすると、🔬答えと🧪ひとことが表示されること
- 開発者ツールのコンソールに`Supabaseの接続先が未設定`という案内が出ていないこと（出ている場合は`SUPABASE_URL`/`SUPABASE_ANON_KEY`の差し替えが未完了です）
- ブラウザの言語を切り替えても表示が崩れないこと（このウィジェットの本文は日本語専用です）
