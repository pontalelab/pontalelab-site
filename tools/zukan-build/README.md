# 図鑑ビルドツール（zukan-build）

`/zukan/` 以下の静的ページを、`data/<カテゴリ>/*.json` から自動生成するための小さなスクリプトです。外部ライブラリへの依存はありません（Node標準機能のみ）。

## 新しい昆虫を1匹追加する手順

1. `data/mushi/` に、新しいJSONファイルを1つ追加する（既存ファイルをコピーして書き換えるのが簡単です）
2. 画像を用意する
   - むしたんに既に登場する虫なら、`games/mushimushi/bugs/<id>.png` を指定するだけでOK（クレジット表記不要）
   - むしたんに登場しない新しい虫なら、`image-sourcing.md` の手順で画像を調達し、`credit`・`license`・`sourceUrl` を必ず記入する
3. リポジトリのルートで次のコマンドを実行する
   ```
   node tools/zukan-build/generate.js
   ```
4. `/zukan/` 以下に生成されたファイルの差分を確認し、データファイルと一緒にコミット・pushする

## データの書き方（1匹分）

`data/mushi/kabutomushi.json` を参考にしてください。主な項目は以下の通りです。

| 項目 | 内容 |
|---|---|
| `id` | ファイル名と一致させる。URLの一部になる（例: `/zukan/mushi/kabutomushi/`） |
| `category` | 現状は `"mushi"` 固定（将来 `"sakana"` 等を追加予定） |
| `name` / `reading` / `scientificName` / `classification` | 名前・読み・学名・分類 |
| `oneLiner` | 一覧カードに出る、ひとこと説明 |
| `description.what` / `.where` / `.food` | 「どんな虫？」「どこにいる？」「なにを食べる？」の本文 |
| `funFacts` | 「へぇ！な豆知識」の配列（3〜4個程度） |
| `ageRange` / `ageMin` / `ageMax` | 対象年齢の目安（表示用文字列と、構造化データ用の数値） |
| `images` | 画像情報の配列。`source: "own-asset"` なら自社イラスト（クレジット非表示）、`"wikimedia"` 等の外部調達なら `credit`・`license`・`sourceUrl` を記入（自動でクレジット表示される） |
| `relatedInsectIds` | 関連する昆虫の `id` の配列。詳細ページに相互リンクが自動で入る |
| `relatedArticles` | 関連記事（今回は空配列。記事を書いたら追記） |
| `mushitanUrl` | 常に `"https://pontalelab.com/games/mushimushi/"` |

## 今回のスコープについて

- 対応しているのは「昆虫（mushi）」カテゴリのみです。将来、魚・都道府県などを追加する場合は `CATEGORIES` 定数にカテゴリを追加し、`data/<新カテゴリ>/` にJSONを置いてください。
- ビルドは手元で `node tools/zukan-build/generate.js` を実行する運用です（GitHub Actionsによる自動ビルドは今回未対応。将来の改善候補です）。
- ふりがな（ルビ）対応は今回未実装です（検証は完了していますが、方式は保留中）。
