# SNSスタジオ（スマホ用の投稿画像エディタ）

https://pontalelab.com/tools/sns-studio/ をスマホのブラウザで開くと、Instagram用の投稿画像（1080×1350px）を作れます。
アプリのインストールやPCは不要です。

## できること
- **テンプレートから作る**：`tools/sns-images/posts/index.json` に載っている投稿をコピーして編集
- **図鑑から作る**：昆虫図鑑のデータから、5枚の豆知識投稿と本文を自動作成
- **白紙から作る**
- スライドの追加・複製・並べ替え・削除、テーマ色の変更
- スマホの写真の差し込み（長辺1600pxに縮小して保存）
- 本文（キャプション）の編集とコピー（ハッシュタグの数もチェック）
- 「画像を書き出す」→ 写真アプリにまとめて保存、またはInstagramへ共有

## 仕組み
- 画像のデザインは `../sns-images/templates.js`（PC用の generate.js と共通）。ここを直すと両方に反映される
- 画像への変換は [html-to-image](https://github.com/bubkoo/html-to-image)（MIT License、`vendor/` に同梱）
- フォント（M PLUS Rounded 1c）は Google Fonts から、使っている文字の分だけ読み込んで画像に埋め込む
- 下書きはその端末のブラウザ（localStorage）に保存される。別の端末とは共有されない。ブラウザのデータを消すと下書きも消える

## 注意
- 検索エンジンには載らないようにしている（`noindex` と robots.txt）が、URLを知っていれば誰でも開けるページです。個人情報は入力しないでください
