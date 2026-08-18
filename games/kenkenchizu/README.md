# けんけんちず

Vite + React 製のブラウザゲーム。都道府県のシルエットを見てどこの県か当てるクイズです。対象年齢は未就学〜小学校低学年のため、画面表示はすべてひらがな・カタカナです。

## 開発

```bash
npm install
npm run dev        # ローカル開発サーバー
npm run dev:host   # LAN上の他端末（スマホ等）からもアクセス可能にする
```

## ビルド・公開の仕組み（重要）

このプロジェクトは **GitHub Actions（`.github/workflows/build-kenkenchizu.yml`）によって自動ビルド・自動公開** されています。仕組みは[むしたん](../mushimushi/README.md)と同じです。

`src/`・`index.dev.html`・`package.json`・`vite.config.js` 等を変更して`main`にpushすると、CIが自動的に以下を行います。

1. `index.dev.html` を `index.html` にコピー（正しいビルド元を保証する）
2. `npm install && npm run build`（出力先は `dist/`）
3. `dist/` の中身を、本番で実際に配信されているこのフォルダ直下（`games/kenkenchizu/`）へ同期コピー
4. 変更があれば自動でコミット・push

このため、**`games/kenkenchizu/`直下にある`index.html`・`assets/`・`bgm/`はすべてビルド成果物（自動生成物）** です。手で直接編集しないでください。次のビルドで上書きされます。

### 編集してよいファイル（ソース）

- `src/` 以下（`SilhouetteQuiz.jsx`が本体）
- `public/` 以下（BGMなどの静的アセット。ビルド時にそのまま出力先へコピーされる）
- `index.dev.html`（`<title>`・OGP・meta タグなどHTMLの`<head>`を変更したいとき）
- `package.json` / `vite.config.js`

## BGM

`public/bgm/theme.mp3` をホーム画面〜クイズ画面〜結果画面を通してループ再生します。スマホの自動再生制限があるため、実際の再生開始はホーム画面の「はじめる」ボタンを押した瞬間（最初のユーザー操作）です。画面右上のボタンでいつでもミュート/解除でき、その状態は端末に保存されます。

- 音源：「Funky droll street」（[DOVA-SYNDROME](https://dova-s.jp/)、作曲：蒲鉾さちこ）
- ライセンス：DOVA-SYNDROMEの[利用規約](https://dova-s.jp/help/articles/terms/)・[ライセンス](https://dova-s.jp/help/articles/license/)に準拠（商用利用可・クレジット表記任意・大幅な改変や再配布は禁止）

`index.dev.html`は、Viteが本来必要とする`index.html`（`<script type="module" src="/src/main.jsx">`を含む、ビルドされていない状態のテンプレート）を、ビルド成果物によって上書きされないよう別名で永続的に保持しているファイルです（むしたんと同じ設計・同じ理由）。

### 都道府県データの追加・修正

`tools/kenkenchizu-build/`を参照してください。

## 都道府県データについて

`src/SilhouetteQuiz.jsx`内の`QUESTIONS`配列に、都道府県ごとのシルエット（実際の地理データ由来のSVGパス）・ひらがな読み・「であえる いきもの」紹介文・4択の選択肢を持っています。47都道府県すべて実装済みです。

## クイズの出題形式

1回のクイズは、47都道府県の中からランダムに選ばれた5問で構成されます（`QUESTIONS_PER_QUIZ`定数で変更可能）。
