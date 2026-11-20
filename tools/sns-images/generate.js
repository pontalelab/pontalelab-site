#!/usr/bin/env node
/* ============================================================
   tools/sns-images/generate.js

   Instagram用の投稿画像（1080x1350・縦4:5）をPCで一括生成するツール。
   デザインは templates.js（スマホ用SNSスタジオと共通）にある。

   使い方（tools/sns-images/ で実行）:
     node generate.js                      posts/ の全投稿を生成
     node generate.js 05                   ファイル名が「05」で始まる投稿だけ生成
     node generate.js --zukan kabutomushi  図鑑データから豆知識投稿を自動生成

   出力: out/<投稿ID>/01.png, 02.png … と caption.txt（本文）
   詳しくは README.md を参照。
   ============================================================ */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const T = require("./templates");

const TOOL_DIR = __dirname;
const REPO_ROOT = path.join(TOOL_DIR, "..", "..");
const POSTS_DIR = path.join(TOOL_DIR, "posts");
const OUT_DIR = path.join(TOOL_DIR, "out");
const ZUKAN_DATA_DIR = path.join(REPO_ROOT, "tools", "zukan-build", "data");

// "/games/..." のようなリポジトリ内パス、または posts/ からの相対パスを file:// URL に
function makeAsset(baseDir) {
  return (src) => {
    if (!src) return null;
    if (/^(https?:|data:)/.test(src)) return src;
    const abs = src.startsWith("/") ? path.join(REPO_ROOT, src) : path.resolve(baseDir, src);
    if (!fs.existsSync(abs)) {
      console.warn(`  ⚠ 画像が見つかりません: ${src}`);
      return null;
    }
    return pathToFileURL(abs).href;
  };
}

function fontLinks() {
  const dir = path.join(TOOL_DIR, "node_modules", "@fontsource", "m-plus-rounded-1c");
  if (!fs.existsSync(dir)) {
    console.warn("  ⚠ フォントが未インストールです（npm install を実行してください）。代替フォントで生成します。");
    return "";
  }
  return ["500", "700", "800"].map((w) => `<link rel="stylesheet" href="${pathToFileURL(path.join(dir, w + ".css")).href}">`).join("");
}

function pageHtml(slide, i, total, post, ctx) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">${fontLinks()}
<style>html,body{margin:0;width:${T.W}px;height:${T.H}px;overflow:hidden}${T.CSS}</style></head>
<body>${T.renderFrame(slide, i, total, post, ctx)}
<script>window.__fit = ${T.fitFrame.toString()};</script></body></html>`;
}

function postFromZukan(id) {
  for (const cat of fs.readdirSync(ZUKAN_DATA_DIR)) {
    const f = path.join(ZUKAN_DATA_DIR, cat, id + ".json");
    if (fs.existsSync(f)) {
      const post = T.zukanPost(JSON.parse(fs.readFileSync(f, "utf8")));
      post._baseDir = path.dirname(f);
      return post;
    }
  }
  throw new Error(`図鑑データが見つかりません: ${id}`);
}

function loadPosts(filter) {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".json") && f !== "index.json" && (!filter || f.startsWith(filter)))
    .sort()
    .map((f) => {
      const p = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), "utf8"));
      p.id = p.id || path.basename(f, ".json");
      p._baseDir = POSTS_DIR;
      return p;
    });
}

async function main() {
  const args = process.argv.slice(2);
  let posts;
  const zi = args.indexOf("--zukan");
  if (zi >= 0) {
    if (!args[zi + 1]) throw new Error("--zukan のあとに図鑑のID（例: kabutomushi）を指定してください");
    posts = [postFromZukan(args[zi + 1])];
  } else {
    posts = loadPosts(args[0]);
  }
  if (!posts.length) { console.log("生成する投稿がありません。"); return; }

  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch {
    console.error("Playwright が見つかりません。tools/sns-images で `npm install` と `npx playwright install chromium` を実行してください。");
    process.exit(1);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: T.W, height: T.H }, deviceScaleFactor: 1 });

  for (const post of posts) {
    const dir = path.join(OUT_DIR, post.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, "_html"), { recursive: true });
    console.log(`▶ ${post.id}（${post.slides.length}枚）`);
    const ctx = { asset: makeAsset(post._baseDir) };
    for (let i = 0; i < post.slides.length; i++) {
      const name = String(i + 1).padStart(2, "0");
      const htmlPath = path.join(dir, "_html", `${name}.html`);
      fs.writeFileSync(htmlPath, pageHtml(post.slides[i], i, post.slides.length, post, ctx));
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const fit = await page.evaluate(() => window.__fit(document.querySelector(".plf")));
      await page.evaluate(() => document.fonts.ready);
      const out = path.join(dir, `${name}.png`);
      await page.screenshot({ path: out });
      const warn = fit.overflow ? "  ⚠ 文字が多すぎて収まりきりません。文章を短くしてください"
        : fit.scale < 1 ? `  （文字を${Math.round(fit.scale * 100)}%に縮小）` : "";
      console.log(`  ${path.relative(TOOL_DIR, out)}${warn}`);
    }
    fs.rmSync(path.join(dir, "_html"), { recursive: true, force: true });
    if (post.caption) fs.writeFileSync(path.join(dir, "caption.txt"), post.caption + "\n");
    const todos = T.countTodos(post);
    if (todos) console.log(`  ✎ 要記入（【 】）が${todos}か所あります。posts/ のJSONを書き換えて再生成してください`);
  }
  await browser.close();
  console.log(`完了: ${path.relative(process.cwd(), OUT_DIR) || "out"}/ に出力しました`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
