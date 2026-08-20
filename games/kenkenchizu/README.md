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

## いきものの写真（正解時に表示）

正解画面では、`QUESTIONS`の各エントリに紐づく写真を「であえる いきもの」の紹介文の上に表示します。1エントリにつき以下の3フィールドを持ちます。

```js
image: "東京都_タヌキ.jpg",       // public/photos/ 内のファイル名
imageLicense: "CC BY-SA 2.0",     // ライセンス表記
imageCreditUrl: "https://commons.wikimedia.org/wiki/File:...", // 出典（Wikimedia Commons）
```

- 画像の実体は `public/photos/` に置きます（BGMと同じVite publicの仕組みで、ビルド時にそのまま出力先へコピーされます）
- 写真の下に小さく「📷 Wikimedia Commons」というリンクを表示し、タップすると`imageCreditUrl`（出典ページ）を新しいタブで開きます。CC BY / CC BY-SA画像の著作者表示を、ゲームの雰囲気を崩さない最小限の形で満たすためのものです
- `image`が未設定（空文字 or フィールドなし）のエントリは、写真エリアが自動的に非表示になります（レイアウトは崩れません）

### 画像の入れ替え方

1. 新しい画像を `public/photos/` に追加（またはファイル名を変更して既存ファイルを上書き）
2. 元画像が大きい場合は、先に縮小・圧縮しておく（目安：長辺700px程度、JPEG quality 80。フルサイズのWikimedia Commons画像は数MB〜20MB超あるため、そのまま使うとページが重くなります）
3. 対象の都道府県エントリの`image`・`imageLicense`・`imageCreditUrl`を新しい画像の情報に更新
4. 元の`public/photos/`内の古い画像ファイルが不要になった場合は削除

現在の47枚はすべてWikimedia Commons由来（CC BY-SA / CC BY / CC0 / Public Domainのいずれか）です。ライセンス・出典の一覧は画像収集時の作業フォルダ（このリポジトリ外）の`クレジット一覧.txt`を参照してください。

## クイズの出題形式

1回のクイズは、47都道府県の中からランダムに選ばれた5問で構成されます（`QUESTIONS_PER_QUIZ`定数で変更可能）。
