# SNS投稿画像ジェネレーター（sns-images）

Instagram用の投稿画像（**1080×1350px・縦4:5**）を、JSONから自動生成するツールです。
デザイン（色・フォント・レイアウト）はテンプレートで統一されているので、**文章を書くだけ**で投稿画像がそろいます。

> **スマホで作る場合は [SNSスタジオ](../sns-studio/)（https://pontalelab.com/tools/sns-studio/）を使ってください。**
> ここにあるテンプレート投稿と図鑑データを、ブラウザだけで編集・書き出しできます。

## ファイル構成
| ファイル | 役割 |
|---|---|
| `templates.js` | 投稿画像のデザイン（テーマ・レイアウト・CSS）。**PC用ツールとSNSスタジオの共通部品** |
| `icons.js` | 画像内で使うアイコン（共通部品） |
| `generate.js` | PCで一括生成するスクリプト |
| `posts/*.json` | 投稿データ。`posts/index.json` に載せたものはSNSスタジオのテンプレートにも表示される |

## はじめに（1回だけ）

```bash
cd tools/sns-images
npm install
npx playwright install chromium
```

## 使い方

```bash
node generate.js                       # posts/ の全投稿を生成
node generate.js 05                    # ファイル名が「05」で始まる投稿だけ生成
node generate.js --zukan kabutomushi   # 図鑑データから豆知識投稿を自動生成
```

- 出力先：`out/<投稿ID>/01.png, 02.png …`（Instagramにはこの順番でアップロード）
- `caption.txt`：投稿の本文（JSONに `caption` がある場合）
- `out/` はGitにコミットされません

### 生成時のメッセージ
| 表示 | 意味 |
|---|---|
| `（文字を85%に縮小）` | 文字が多めなので自動で縮小した。読みにくければ文章を短くする |
| `⚠ 文字が多すぎて収まりきりません` | 縮小しても入らない。文章を短くする |
| `✎ 要記入（【 】）がNか所` | 【 】で囲んだ仮の文章が残っている。画像にも黄色の枠で表示される |

## 投稿データの書き方（posts/*.json）

```json
{
  "theme": "forest",
  "slides": [ { "type": "cover", ... }, ... ],
  "caption": "投稿の本文"
}
```

### テーマ（theme）
| 名前 | 用途 |
|---|---|
| `forest` | 基本（緑） |
| `sunset` | 安心・お知らせ系（オレンジ） |
| `winter` | 冬の季節ネタ（青） |
| `lab` | 開発日誌（ダーク） |

### 文字の装飾
- `**ことば**` → 黄色いマーカーで強調
- `\n` → 改行
- `【ことば】` → 要記入（黄色の点線枠）

### スライドの種類（type）
| type | 主な項目 | 用途 |
|---|---|---|
| `cover` | `eyebrow` `title` `sub` と、`image` か `collage`（画像3枚まで） | 1枚目の表紙 |
| `text` | `icon` `eyebrow` `heading` `body` `chips` `image` `badges` `button` | 見出し＋本文 |
| `list` | `eyebrow` `heading` `items`（`icon` `title` `desc`）`cross` `note` `button` | 箇条書き。`cross: true` で「ないもの」表示 |
| `game` | `index` `thumb` `name` `age` `desc` | ゲーム紹介 |
| `photo` | `eyebrow` `heading` `photo` `caption` | 写真（開発日誌など）。`photo` 未指定なら「ここに写真」の枠 |
| `cta` | `icon` `eyebrow` `heading` `body` `badges` `button` `url` | 最後の案内 |

### 画像の指定
- `/games/thumbs/mushimushi.webp` のように、`/` から始めるとリポジトリ内のファイル
- それ以外は `posts/` からの相対パス（自分で撮った写真は `posts/photos/` などに置く）
- `image` は `{ "src": "...", "style": "sticker", "zoom": 1.8 }` の形式。
  `style: "sticker"` は透過PNG（むしたんの虫など）用。余白が大きい画像は `zoom` で拡大

### 使えるアイコン（icon）
`game` `book` `sparkle` `search` `leaf` `bug` `heart` `megaphone` `coin` `user` `chat` `sun` `music` `flask` `map` `camera` `tree` `home` `food` `pin` `bookmark` `check` `x` `pencil` `arrow` `snow` `clock`

## 図鑑モード（--zukan）

`tools/zukan-build/data/` の図鑑データ1種から、5枚の豆知識投稿と本文を自動で作ります。
図鑑に1種追加したら、そのままSNSの投稿にできます。

```bash
node generate.js --zukan nanahoshi_tentou
```

## フォント
M PLUS Rounded 1c（SIL Open Font License）を `@fontsource` 経由で使用しています。
