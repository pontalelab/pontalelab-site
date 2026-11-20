#!/usr/bin/env node
/* ============================================================
   tools/sns-studio/build-artifact.js

   SNSスタジオを「Claudeの非公開ページ（アーティファクト）」用に組み立てる。
   外部への通信ができない環境なので、フォント・画像・データをすべて同梱する。

   使い方: node tools/sns-studio/build-artifact.js <出力先フォルダ>
   出力: index.html と、同梱ファイル（fonts/ a/ data/）
   ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.resolve(process.argv[2] || path.join(__dirname, "artifact-build"));
const FONT_DIR = path.join(ROOT, "tools", "sns-images", "node_modules", "@fontsource", "m-plus-rounded-1c");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const copy = (from, to) => {
  const dst = path.join(OUT, to);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(ROOT, from), dst);
  files.push(to);
};
const files = [];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// フォント（日本語ファイルに英数字も含まれる。3つの太さ）
if (!fs.existsSync(FONT_DIR)) throw new Error("tools/sns-images で npm install を先に実行してください");
const fonts = [];
for (const w of [500, 700, 800]) {
  const name = `fonts/jp-${w}.woff2`;
  copy(path.relative(ROOT, path.join(FONT_DIR, "files", `m-plus-rounded-1c-japanese-${w}-normal.woff2`)), name);
  fonts.push({ weight: w, url: name });
}

// 画像
for (const f of fs.readdirSync(path.join(ROOT, "games", "thumbs"))) copy(`games/thumbs/${f}`, `a/games/thumbs/${f}`);
for (const f of fs.readdirSync(path.join(ROOT, "games", "mushimushi", "bugs"))) copy(`games/mushimushi/bugs/${f}`, `a/games/mushimushi/bugs/${f}`);
copy("icons/icon-512.png", "a/icons/icon-512.png");

// テンプレート投稿と図鑑データ
for (const f of fs.readdirSync(path.join(ROOT, "tools", "sns-images", "posts")).filter((f) => f.endsWith(".json"))) {
  copy(`tools/sns-images/posts/${f}`, `data/posts/${f}`);
}
const zukan = [];
const zdir = path.join(ROOT, "tools", "zukan-build", "data");
for (const cat of fs.readdirSync(zdir)) {
  for (const f of fs.readdirSync(path.join(zdir, cat)).filter((f) => f.endsWith(".json")).sort()) {
    copy(`tools/zukan-build/data/${cat}/${f}`, `data/zukan/${cat}/${f}`);
    zukan.push(`data/zukan/${cat}/${f}`);
  }
}
fs.writeFileSync(path.join(OUT, "data/zukan/index.json"), JSON.stringify(zukan));
files.push("data/zukan/index.json");

// ページ本体（CSSとJSはすべて埋め込む）
const html = read("tools/sns-studio/index.html");
const body = html.slice(html.indexOf("<body>") + 6, html.indexOf("<script src=")).replace(/\/icons\/icon-192\.png/g, "a/icons/icon-512.png");
const config = { assetBase: "a", postsBase: "data/posts/", zukanList: "data/zukan/index.json", fonts, useHistory: false };
const page = `<title>SNSスタジオ</title>
<style>
:root { color-scheme: light; }
${read("tools/sns-studio/studio.css")}
</style>
${body.trim()}
<script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js"></script>
<script>window.PL_STUDIO = ${JSON.stringify(config)};</script>
<script>
${read("tools/sns-images/icons.js")}
</script>
<script>
${read("tools/sns-images/templates.js")}
</script>
<script>
${read("tools/sns-studio/studio.js")}
</script>
`;
fs.writeFileSync(path.join(OUT, "index.html"), page);
fs.writeFileSync(path.join(OUT, "files.json"), JSON.stringify(Object.fromEntries(files.map((f) => [f, f])), null, 1));
console.log(`出力: ${OUT}（index.html ＋ 同梱ファイル${files.length}個）`);
