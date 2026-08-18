# うみのひらがな（pokopokosea）

Vite + React + TypeScript 製のブラウザゲーム。海の生き物と一緒にひらがなを学ぶゲームのソースコードです。

## 開発

```bash
npm ci
npm run dev   # ローカル開発サーバー（LAN上の他端末からもアクセス可能）
```

## ビルド・公開の仕組み（重要）

このプロジェクトは **GitHub Actions（`.github/workflows/build-pokopokosea.yml`）によって自動ビルド・自動公開** されています。むしたん（`games/mushimushi/`）と全く同じ仕組みです。

`src/`・`public/`・`index.dev.html`・`package.json`・`vite.config.ts` 等を変更して`main`にpushすると、CIが自動的に以下を行います。

1. `index.dev.html` を `index.html` にコピー（正しいビルド元を保証する）
2. `npm ci && npm run build`（型チェック＋ビルド。出力先は `dist/`）
3. `dist/` の中身を、本番で実際に配信されているこのフォルダ直下（`games/pokopokosea/`）へ同期コピー
4. 変更があれば自動でコミット・push

このため、**`games/pokopokosea/`直下にある`index.html`・`assets/`はすべてビルド成果物（自動生成物）** です。手で直接編集しないでください。次のビルドで上書きされます。

### 編集してよいファイル（ソース）

- `src/` 以下（コンポーネント・ロジック）
- `public/` 以下（画像・音声などの静的アセット）
- `index.dev.html`（`<title>`・OGP・meta タグなどHTMLの`<head>`を変更したいとき）
- `package.json` / `vite.config.ts` / `tsconfig.json` など設定ファイル

`index.dev.html`は、Viteが本来必要とする`index.html`（`<script type="module" src="/src/main.tsx">`を含む、ビルドされていない状態のテンプレート）を、ビルド成果物によって上書きされないよう別名で永続的に保持しているファイルです。HTMLの`<head>`内容を変更したい場合は、必ずこちらを編集してください。

（この仕組みの背景は、むしたんの`README.md`に詳しく書いてあります。2026年8月、むしたんで発覚した「ビルド元のindex.htmlが過去の手動デプロイで上書きされ消失していた」事故を教訓に、同じ問題が起きていたpokopokoseaにも同時に導入しました。）

### 手動でビルドし直したい場合

```bash
npm ci
cp index.dev.html index.html
npm run build
# dist/ の中身を games/pokopokosea/ 直下へコピーしてコミットする
```

CIが正常に動いていれば、通常この作業は不要です。
