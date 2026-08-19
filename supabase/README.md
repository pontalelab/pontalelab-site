# お問い合わせフォーム用 Supabase Edge Function

`contact/` ページのお問い合わせフォームを、mailto方式からサーバー経由のメール送信方式に切り替えるための、最小構成のEdge Functionです。

## できること・できないこと

- 受信先メールアドレス・メール送信APIのキーは、すべてSupabase側の環境変数（secrets）にのみ存在し、リポジトリやフロントエンドのコードには一切含まれません
- 隠しフィールド（ハニーポット）による簡易的なスパム対策のみ実装しています。CAPTCHAや高度なレート制限、問い合わせ内容のデータベース保存、自動返信、管理画面は今回のスコープ外です
- メール送信には[Resend](https://resend.com/)を使う前提で書いています。他のメール送信APIを使う場合は`index.ts`内のfetch部分を差し替えてください

## デプロイ手順

1. [Supabase](https://supabase.com/)でプロジェクトを作成（未作成の場合）
2. [Resend](https://resend.com/)でアカウントを作成し、APIキーを発行
   - 独自ドメインの検証は不要です。Resendの無料枠は、ドメイン未検証の場合「Resendアカウント登録時のメールアドレス宛」にしか送信できませんが、このフォームは元々「運営者自身のメールアドレス1つに固定で送る」用途なので、この制約でそのまま問題なく動きます
   - 見た目の信頼性を上げたい場合（送信元を独自ドメインにしたい場合）は、後から`index.ts`の`from`を差し替えられます
3. Supabase CLIをインストールし、プロジェクトにログイン・リンク
   ```
   npm install -g supabase
   supabase login
   supabase link --project-ref <あなたのプロジェクトref>
   ```
4. 環境変数（secrets）を設定
   ```
   supabase secrets set RESEND_API_KEY=re_xxxxxxxx
   supabase secrets set CONTACT_TO_EMAIL=your-address@example.com
   supabase secrets set ALLOWED_ORIGIN=https://pontalelab.com
   ```
5. Edge Functionをデプロイ
   ```
   supabase functions deploy contact-form
   ```
6. デプロイ後に表示される関数のURL（`https://<project-ref>.supabase.co/functions/v1/contact-form`）を、`js/main.js`内の`CONTACT_FUNCTION_URL`に設定してください（現在はプレースホルダーになっています）

## 動作確認

デプロイ後、`contact/`ページから実際にフォームを送信し、以下を確認してください。

- 指定したメールアドレスに問い合わせ内容が届くこと（`reply_to`に問い合わせ者のメールアドレスが設定されているので、そのまま返信できます）
- 送信後に画面へ完了メッセージが表示されること
- 開発者ツールのコンソール・ネットワークタブにCORSエラーが出ていないこと（出る場合は`ALLOWED_ORIGIN`の値と、実際にフォームを開いているオリジンが一致しているか確認してください）
