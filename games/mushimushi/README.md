# むしたん（mushimushi）

Vite + React + TypeScript 製のブラウザゲーム。虫を探して図鑑を集める、むしたんのソースコードです。

## 開発

```bash
npm ci
npm run dev        # ローカル開発サーバー
npm run dev:host   # LAN上の他端末（スマホ等）からもアクセス可能にする
```

## ビルド・公開の仕組み（重要）

このプロジェクトは **GitHub Actions（`.github/workflows/build-mushimushi.yml`）によって自動ビルド・自動公開** されています。

`src/`・`public/`・`index.dev.html`・`package.json`・`vite.config.ts` 等を変更して`main`にpushすると、CIが自動的に以下を行います。

1. `index.dev.html` を `index.html` にコピー（正しいビルド元を保証する）
2. `npm ci && npm run build`（型チェック＋ビルド。出力先は `dist/`）
3. `dist/` の中身を、本番で実際に配信されているこのフォルダ直下（`games/mushimushi/`）へ同期コピー
4. 変更があれば自動でコミット・push

このため、**`games/mushimushi/`直下にある`index.html`・`assets/`・`bugs/`・`bg/`・`bgm/`・`icons.svg`・`favicon.svg`・`home_bg.png`はすべてビルド成果物（自動生成物）** です。手で直接編集しないでください。次のビルドで上書きされます。

### 編集してよいファイル（ソース）

- `src/` 以下（コンポーネント・ロジック）
- `public/` 以下（画像・音声などの静的アセット）
- `index.dev.html`（`<title>`・OGP・meta タグなどHTMLの`<head>`を変更したいとき）
- `package.json` / `vite.config.ts` / `tsconfig*.json` など設定ファイル

`index.dev.html`は、Viteが本来必要とする`index.html`（`<script type="module" src="/src/main.tsx">`を含む、ビルドされていない状態のテンプレート）を、ビルド成果物によって上書きされないよう別名で永続的に保持しているファイルです。HTMLの`<head>`内容を変更したい場合は、必ずこちらを編集してください。

### なぜこんな仕組みになっているか

GitHub Pagesは「pushされたファイルをそのまま配信する」だけで、リポジトリ内でビルドはしてくれません。かつ、このゲームはURL構造の都合上、ビルド成果物を`games/mushimushi/`直下という**ソースコードと同じディレクトリ**に配置する必要があります。そのため、Viteが読み込む`index.html`（ビルド入力）と、実際に配信される`index.html`（ビルド出力）が同じパスを取り合ってしまい、かつてはビルドのたびに片方が失われる事故が起きていました（2026年8月に発覚・修正）。`index.dev.html`という別名の永続ソースを用意することで、この事故を防いでいます。

### 手動でビルドし直したい場合

```bash
npm ci
cp index.dev.html index.html
npm run build
# dist/ の中身を games/mushimushi/ 直下へコピーしてコミットする
```

CIが正常に動いていれば、通常この作業は不要です。
