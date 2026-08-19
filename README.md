# pontalelab-site

[Pontalelab](https://pontalelab.com/) — 親子向けデジタル研究所のWebサイト・ゲーム一式のリポジトリです。
会員登録・課金・広告・チャット機能なしで遊べる、無料のブラウザゲームを提供しています。

GitHub Pagesでホスティングされており、`main`ブランチの内容がそのまま https://pontalelab.com/ に公開されます（`CNAME`参照）。

## サイト構成

```
/                トップページ
/games/          ゲーム一覧
/games/<name>/   各ゲーム本体
/parents/        おうちの人へ（保護者向けページ）
/support/        ぽんたーれらぼを応援する（応援ページ、決済手段は準備中）
/about/          Pontalelabについて
/contact/        お問い合わせ（mailto形式）
/privacy/        プライバシーポリシー
/css, /js        トップページ・共通ページ用のスタイル/スクリプト
/icons           favicon・PWAアイコン
manifest.json    PWA用マニフェスト
```

## ゲーム一覧

| 表示名 | フォルダ | ステータス | 技術構成 |
|---|---|---|---|
| むしたん | `games/mushimushi/` | 公開中（GitHub Actionsで自動ビルド） | Vite + React + TypeScript + Zustand |
| うみのひらがな | `games/pokopokosea/` | 公開中（手動ビルド。むしたんと同じCI化が未着手） | Vite + React + TypeScript |
| あみあみうみ | `games/fishinggame/` | 公開中 | 素のJS/CSS（ビルド不要） |
| けんけんちず | `games/kenkenchizu/` | 公開中・47都道府県すべて実装（GitHub Actionsで自動ビルド） | Vite + React |
| まぜまぜ研究室 | `games/mazemaze/` | 実装あり・`games/index.html`未リンク（開発中扱い） | 素のJS/CSS（ビルド不要） |
| ポコポコ楽団 | 未実装 | 開発中（「もうすぐ」表示のみ） | - |

昆虫図鑑（`/zukan/mushi/`）は`tools/zukan-build/`のNode.jsスクリプトで生成する静的ページです。

> **フォルダ名と表示名が一致しないゲームがあります。** 例えば `games/pokopokosea/` は現在「うみのひらがな」として公開されています。ゲームを探すときは `games/index.html` 内の `href` で実際のリンク先を確認してください。

## ローカルでの開発

### Vite製・CI自動ビルドのゲーム（むしたん / けんけんちず）

```bash
cd games/mushimushi   # または games/kenkenchizu
npm install
npm run dev            # 開発サーバー起動
```

`src/`・`index.dev.html`等を変更して`main`にpushすると、GitHub Actionsが自動的にビルドして配信ディレクトリへ反映します（詳細は各ゲームのREADME.mdを参照）。手元で`npm run build`やビルド成果物のコミットをする必要はありません。

### Vite製・手動ビルドのゲーム（うみのひらがな）

```bash
cd games/pokopokosea
npm install
npm run dev            # 開発サーバー起動
npm run build           # dist/ に本番ビルドを生成
```

`dist/`（ビルド成果物）は**ソースと一緒にリポジトリにコミットされ、そのまま本番で配信されます**。むしたん・けんけんちずと違いCI化されていないため、コードを変更したら手元で `npm run build` を実行し、`dist/` の差分も含めてコミット・pushしてください。

### 素のJS/CSSのゲーム（あみあみうみ / まぜまぜ研究室）

ビルド不要。`index.html` を直接ブラウザで開くか、任意の静的サーバーで配信して確認してください。

```bash
npx serve games/fishinggame
```

## デプロイ

`main`ブランチへのpushをトリガーに、GitHub Pagesが自動的にビルド・公開します（Actionsタブの `pages build and deployment` ワークフロー）。追加のビルドステップは無く、リポジトリ内のファイルがそのまま配信されるため、**静的アセットは配信したい状態のままコミットする必要があります**。

## 開発ワークフロー

現状はGitHub Web UIからの直接アップロードで`main`に反映する運用ですが、今後は以下を基本フローとします。

1. 変更用のブランチを切る（例: `feat/mushimushi-new-stage`, `fix/contact-form`）
2. 変更をコミットする。コミットメッセージは「何を変えたか」が一言でわかる内容にする
   - 良い例: `fix: あみあみうみのリセットボタンが反応しない不具合を修正`
   - 避けたい例: `Add files via upload`, `ｃ２`, `upし直し`
3. `main`向けにPull Requestを作成し、変更内容を簡単に説明する
4. 動作確認（できればスクリーンショットや実機確認）をしてからマージする

不具合報告・要望は [Issues](https://github.com/pontalelab/pontalelab-site/issues) にテンプレートを用意しているので、そちらを使って登録してください。

## お問い合わせ

pontalelab@gmail.com
