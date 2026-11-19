#!/usr/bin/env node
/* ============================================================
   tools/sns-images/generate.js

   Instagram用の投稿画像（1080x1350・縦4:5）を自動生成するツール。

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
const { icon } = require("./icons");

const TOOL_DIR = __dirname;
const REPO_ROOT = path.join(TOOL_DIR, "..", "..");
const POSTS_DIR = path.join(TOOL_DIR, "posts");
const OUT_DIR = path.join(TOOL_DIR, "out");
const ZUKAN_DATA_DIR = path.join(REPO_ROOT, "tools", "zukan-build", "data");
const W = 1080;
const H = 1350;

/* ---------- テーマ（投稿ごとの色） ---------- */
const THEMES = {
  forest: {
    bg: "#f4faf6", ink: "#17392b", inkMid: "#3d6652", primary: "#2d6a4f", primaryLt: "#52b788",
    accent: "#e07800", accentSoft: "#ffe2b8", card: "#ffffff", line: "#d6eadf",
    blob1: "#a8e0c2", blob2: "#cde9ff", blob3: "#ffe6c4", mark: "#ffd98a"
  },
  sunset: {
    bg: "#fff8f0", ink: "#3a2412", inkMid: "#7a5236", primary: "#c25a00", primaryLt: "#f29a3a",
    accent: "#2d6a4f", accentSoft: "#d3efe0", card: "#ffffff", line: "#f3dcc4",
    blob1: "#ffd2a1", blob2: "#ffe9d2", blob3: "#cdeedd", mark: "#ffd27a"
  },
  winter: {
    bg: "#f3f8fe", ink: "#14304f", inkMid: "#3f5f80", primary: "#1f5aa6", primaryLt: "#5fa8e8",
    accent: "#e07800", accentSoft: "#ffe2b8", card: "#ffffff", line: "#d4e4f5",
    blob1: "#c4e0ff", blob2: "#e3f1ff", blob3: "#ffe8cc", mark: "#ffdc8f"
  },
  lab: {
    bg: "#10281e", ink: "#f2f8f4", inkMid: "#b6d4c3", primary: "#95d5b2", primaryLt: "#52b788",
    accent: "#ffa53a", accentSoft: "#4a3a1f", card: "#183a2b", line: "#2c5a44",
    blob1: "#1f5a40", blob2: "#163f6a", blob3: "#5a3a12", mark: "#9a6a1e"
  }
};

/* ---------- 文字の整形 ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
// **強調** → マーカー、【要記入】 → 黄色の要記入表示、改行 → <br>
function fmt(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<mark>$1</mark>")
    .replace(/【(.*?)】/g, '<span class="todo">【$1】</span>')
    .replace(/\n/g, "<br>");
}
// "/games/..." のようなリポジトリ内パス、または posts/ からの相対パスを file:// URL に
function assetUrl(src, baseDir) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  const abs = src.startsWith("/") ? path.join(REPO_ROOT, src) : path.resolve(baseDir, src);
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ 画像が見つかりません: ${src}`);
    return null;
  }
  return pathToFileURL(abs).href;
}

/* ---------- 部品 ---------- */
function hero(img, baseDir) {
  if (!img) return "";
  const url = assetUrl(img.src, baseDir);
  if (!url) return "";
  if (img.style === "sticker") {
    // 透過PNG（むしたんの虫など）。余白が大きい画像は zoom で拡大する
    const zoom = img.zoom || 1;
    return `<div class="sticker"><div class="sticker-glow"></div><img src="${url}" style="transform:scale(${zoom})"></div>`;
  }
  return `<div class="hero-card"><img src="${url}"></div>`;
}
function collage(list, baseDir) {
  const urls = (list || []).map((s) => assetUrl(s, baseDir)).filter(Boolean).slice(0, 3);
  if (!urls.length) return "";
  return `<div class="collage">${urls.map((u, i) => `<div class="cl cl${i}"><img src="${u}"></div>`).join("")}</div>`;
}
function chips(list) {
  if (!list || !list.length) return "";
  return `<div class="chips">${list.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>`;
}
function badges(list) {
  if (!list || !list.length) return "";
  return `<div class="badges">${list.map((b) => `<span class="badge">${icon("check", 34)}${esc(b)}</span>`).join("")}</div>`;
}
function button(text) {
  if (!text) return "";
  return `<div class="btn">${esc(text)}${icon("arrow", 44)}</div>`;
}
function eyebrow(text) {
  return text ? `<div class="eyebrow">${fmt(text)}</div>` : "";
}

/* ---------- スライドの種類 ---------- */
const RENDER = {
  // 表紙
  cover(s, ctx) {
    const visual = s.collage ? collage(s.collage, ctx.baseDir) : hero(s.image, ctx.baseDir);
    return `<div class="cover ${visual ? "" : "cover-noimg"}">
      ${eyebrow(s.eyebrow)}
      <h1 class="title">${fmt(s.title)}</h1>
      ${s.sub ? `<p class="sub">${fmt(s.sub)}</p>` : ""}
      ${visual ? `<div class="visual"><div class="vwrap">${visual}</div></div>` : ""}
    </div>`;
  },
  // 見出し＋本文
  text(s, ctx) {
    const visual = hero(s.image, ctx.baseDir);
    return `<div class="textslide">
      ${s.icon ? `<div class="big-ico">${icon(s.icon, 96)}</div>` : ""}
      ${eyebrow(s.eyebrow)}
      <h2 class="heading">${fmt(s.heading)}</h2>
      ${s.body ? `<div class="card body">${fmt(s.body)}</div>` : ""}
      ${chips(s.chips)}
      ${visual ? `<div class="visual small">${visual}</div>` : ""}
      ${badges(s.badges)}
      ${button(s.button)}
    </div>`;
  },
  // 箇条書き（アイコン付き）
  list(s) {
    const items = (s.items || []).map((it) => `
      <div class="item ${s.cross ? "cross" : ""} ${it.desc ? "" : "solo"}">
        <div class="item-ico">${icon(it.icon || "sparkle", 58)}${s.cross ? `<span class="xmark">${icon("x", 34)}</span>` : ""}</div>
        <div class="item-txt">
          <div class="item-title">${fmt(it.title)}</div>
          ${it.desc ? `<div class="item-desc">${fmt(it.desc)}</div>` : ""}
        </div>
      </div>`).join("");
    return `<div class="listslide">
      ${eyebrow(s.eyebrow)}
      <h2 class="heading">${fmt(s.heading)}</h2>
      <div class="items">${items}</div>
      ${s.note ? `<p class="note">${fmt(s.note)}</p>` : ""}
      ${button(s.button)}
    </div>`;
  },
  // ゲーム紹介（サムネイル大）
  game(s, ctx) {
    const url = assetUrl(s.thumb, ctx.baseDir);
    return `<div class="gameslide">
      ${s.index ? `<div class="gindex">${esc(s.index)}</div>` : ""}
      <div class="gthumb">${url ? `<img src="${url}">` : ""}</div>
      <div class="gname">${fmt(s.name)}</div>
      ${s.age ? `<div class="gage">${icon("user", 34)}対象年齢の目安 ${esc(s.age)}</div>` : ""}
      ${s.desc ? `<p class="gdesc">${fmt(s.desc)}</p>` : ""}
    </div>`;
  },
  // 写真（未指定なら「ここに写真」の枠を表示）
  photo(s, ctx) {
    const url = assetUrl(s.photo, ctx.baseDir);
    const box = url
      ? `<div class="photo"><img src="${url}"></div>`
      : `<div class="photo empty">${icon("camera", 120)}<div>ここに写真を入れてください</div><small>posts/ のJSONで "photo" に画像のパスを指定</small></div>`;
    return `<div class="photoslide">
      ${eyebrow(s.eyebrow)}
      <h2 class="heading">${fmt(s.heading)}</h2>
      ${box}
      ${s.caption ? `<p class="pcap">${fmt(s.caption)}</p>` : ""}
    </div>`;
  },
  // 最後の案内
  cta(s) {
    return `<div class="ctaslide">
      ${s.icon ? `<div class="big-ico">${icon(s.icon, 110)}</div>` : ""}
      ${eyebrow(s.eyebrow)}
      <h2 class="heading big">${fmt(s.heading)}</h2>
      ${s.body ? `<p class="lead">${fmt(s.body)}</p>` : ""}
      ${badges(s.badges)}
      ${button(s.button)}
      ${s.url ? `<div class="url">${esc(s.url)}</div>` : ""}
    </div>`;
  }
};

/* ---------- ページ全体 ---------- */
function fontCss() {
  const dir = path.join(TOOL_DIR, "node_modules", "@fontsource", "m-plus-rounded-1c");
  if (!fs.existsSync(dir)) {
    console.warn("  ⚠ フォントが未インストールです（npm install を実行してください）。代替フォントで生成します。");
    return "";
  }
  return ["500", "700", "800"].map((w) => `<link rel="stylesheet" href="${pathToFileURL(path.join(dir, w + ".css")).href}">`).join("");
}

function pageHtml(slide, i, total, post, ctx) {
  const t = THEMES[post.theme] || THEMES.forest;
  const render = RENDER[slide.type];
  if (!render) throw new Error(`未対応のスライド種類: ${slide.type}`);
  const logo = assetUrl("/icons/icon-512.png", ctx.baseDir);
  const isLast = i === total - 1;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">${fontCss()}
<style>
:root{--bg:${t.bg};--ink:${t.ink};--ink-mid:${t.inkMid};--primary:${t.primary};--primary-lt:${t.primaryLt};
--accent:${t.accent};--accent-soft:${t.accentSoft};--card:${t.card};--line:${t.line};--mark:${t.mark};--fs:1}
${CSS}
.bg{background:
  radial-gradient(520px 520px at 92% 6%, ${t.blob1} 0%, transparent 70%),
  radial-gradient(600px 600px at -6% 58%, ${t.blob2} 0%, transparent 70%),
  radial-gradient(520px 520px at 100% 104%, ${t.blob3} 0%, transparent 70%), var(--bg);}
</style></head><body>
<div class="frame bg ${post.theme === "lab" ? "dark" : ""}">
  <div class="dots"></div>
  <header>
    <div class="brand"><img src="${logo}"><span>ぽんたーれらぼ</span></div>
    ${total > 1 ? `<div class="pager">${i + 1}<span>/</span>${total}</div>` : ""}
  </header>
  <main id="main">${render(slide, ctx)}</main>
  <footer>
    <span>pontalelab.com</span>
    ${isLast ? `<span class="hint">${icon("bookmark", 30)}保存してあとで見返してね</span>`
             : `<span class="hint">スワイプ${icon("arrow", 30)}</span>`}
  </footer>
</div>
<script>
  // 文字があふれる場合は全体を少しずつ縮小する
  window.__fit = () => {
    const m = document.getElementById('main'); let s = 1;
    while (m.scrollHeight > m.clientHeight + 1 && s > 0.62) {
      s -= 0.03; document.documentElement.style.setProperty('--fs', s.toFixed(2));
    }
    return { scale: s, overflow: m.scrollHeight > m.clientHeight + 1 };
  };
</script>
</body></html>`;
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px}
body{font-family:'M PLUS Rounded 1c','Hiragino Maru Gothic ProN','Hiragino Sans','Noto Sans JP',sans-serif;color:var(--ink);
  -webkit-font-smoothing:antialiased;font-feature-settings:"palt";word-break:auto-phrase;text-wrap:pretty}
.frame{position:relative;width:${W}px;height:${H}px;overflow:hidden;padding:64px 80px 56px;display:flex;flex-direction:column}
.dots{position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--primary) 16%,transparent) 2px,transparent 2.5px);
  background-size:36px 36px;mask-image:linear-gradient(180deg,#000 0%,transparent 30%,transparent 75%,#000 100%);opacity:.7;pointer-events:none}
header,footer,main{position:relative;z-index:1}
header{display:flex;align-items:center;justify-content:space-between;height:72px}
.brand{display:flex;align-items:center;gap:16px;font-weight:800;font-size:30px;color:var(--primary);letter-spacing:.04em}
.brand img{width:60px;height:60px;border-radius:16px;background:#fff;padding:6px;box-shadow:0 4px 14px rgba(0,0,0,.10)}
.pager{font-weight:800;font-size:26px;color:var(--ink-mid);background:color-mix(in srgb,var(--card) 80%,transparent);
  border:2px solid var(--line);border-radius:999px;padding:8px 22px;backdrop-filter:blur(6px)}
.pager span{opacity:.5;margin:0 6px}
main{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;padding:28px 0}
footer{display:flex;justify-content:space-between;align-items:center;height:48px;font-size:24px;font-weight:700;color:var(--ink-mid);letter-spacing:.04em}
.hint{display:flex;align-items:center;gap:10px;color:var(--primary)}
mark{background:linear-gradient(transparent 58%,var(--mark) 58%,var(--mark) 92%,transparent 92%);color:inherit;padding:0 .08em}
.todo{background:#fff2a8;color:#7a5a00;border:3px dashed #e0b400;border-radius:12px;padding:0 .2em;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
.eyebrow{align-self:flex-start;display:inline-flex;align-items:center;font-weight:800;font-size:calc(30px*var(--fs));letter-spacing:.08em;
  color:#fff;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#000));border-radius:999px;
  padding:12px 30px;margin-bottom:calc(28px*var(--fs));box-shadow:0 8px 20px color-mix(in srgb,var(--accent) 35%,transparent)}
.title{font-weight:800;font-size:calc(92px*var(--fs));line-height:1.28;letter-spacing:.01em}
.heading{font-weight:800;font-size:calc(70px*var(--fs));line-height:1.32;margin-bottom:calc(36px*var(--fs))}
.heading.big{font-size:calc(82px*var(--fs))}
.sub{margin-top:calc(26px*var(--fs));font-size:calc(38px*var(--fs));font-weight:700;color:var(--ink-mid);line-height:1.5}
.card{background:var(--card);border:2px solid var(--line);border-radius:40px;box-shadow:0 18px 50px rgba(20,50,35,.10)}
.dark .card{box-shadow:0 18px 50px rgba(0,0,0,.35)}
.body{padding:calc(44px*var(--fs)) calc(52px*var(--fs));font-size:calc(40px*var(--fs));line-height:1.8;font-weight:500}

/* cover */
.cover{display:flex;flex-direction:column;height:100%;justify-content:flex-start;padding-top:12px}
.cover-noimg{justify-content:center}
.visual{position:relative;flex:1;min-height:260px;margin-top:calc(30px*var(--fs))}
.vwrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.visual.small{display:flex;align-items:center;justify-content:center}
.visual.small{flex:0 0 auto;height:calc(360px*var(--fs));margin:calc(10px*var(--fs)) 0 calc(20px*var(--fs))}
.hero-card{height:100%;max-height:560px;aspect-ratio:4/3;border-radius:44px;overflow:hidden;border:10px solid #fff;
  box-shadow:0 30px 70px rgba(20,50,35,.25);transform:rotate(-2deg)}
.hero-card img{width:100%;height:100%;object-fit:cover;display:block}
.sticker{position:relative;overflow:hidden;height:100%;aspect-ratio:1;max-height:600px;display:flex;align-items:center;justify-content:center}
.sticker-glow{position:absolute;inset:6%;border-radius:50%;background:radial-gradient(circle,#fff 0%,color-mix(in srgb,var(--primary-lt) 30%,#fff) 62%,transparent 72%)}
.sticker img{position:relative;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 24px 30px rgba(0,0,0,.22))}
.collage{position:relative;width:100%;height:100%;max-height:600px}
.cl{position:absolute;width:56%;aspect-ratio:4/3;border-radius:36px;overflow:hidden;border:9px solid #fff;box-shadow:0 26px 60px rgba(20,50,35,.28)}
.cl img{width:100%;height:100%;object-fit:cover;display:block}
.cl0{left:0;top:4%;transform:rotate(-7deg);z-index:1}
.cl1{right:0;top:0;transform:rotate(6deg);z-index:2}
.cl2{left:22%;bottom:0;transform:rotate(-1.5deg);z-index:3}

/* text */
.textslide,.listslide,.ctaslide,.photoslide{display:flex;flex-direction:column}
.big-ico{width:calc(150px*var(--fs));height:calc(150px*var(--fs));border-radius:44px;display:flex;align-items:center;justify-content:center;
  color:#fff;background:linear-gradient(135deg,var(--primary-lt),var(--primary));box-shadow:0 18px 40px color-mix(in srgb,var(--primary) 40%,transparent);
  margin-bottom:calc(34px*var(--fs))}
.big-ico .ico{width:58%;height:58%}
.chips{display:flex;gap:18px;flex-wrap:wrap;margin-top:calc(34px*var(--fs))}
.chip{font-weight:800;font-size:calc(38px*var(--fs));color:var(--primary);background:var(--card);border:3px solid var(--primary-lt);
  border-radius:999px;padding:14px 36px}

/* list */
.items{display:flex;flex-direction:column;gap:calc(24px*var(--fs))}
.item{display:flex;align-items:center;gap:32px;background:var(--card);border:2px solid var(--line);border-radius:36px;
  padding:calc(28px*var(--fs)) 36px;box-shadow:0 12px 34px rgba(20,50,35,.08)}
.dark .item{box-shadow:0 12px 34px rgba(0,0,0,.3)}
.item-ico{position:relative;flex:0 0 auto;width:calc(112px*var(--fs));height:calc(112px*var(--fs));border-radius:32px;display:flex;align-items:center;justify-content:center;
  color:var(--primary);background:color-mix(in srgb,var(--primary-lt) 22%,var(--card))}
.item-ico .ico{width:52%;height:52%}
.item.cross .item-ico{color:var(--ink-mid);background:color-mix(in srgb,var(--ink-mid) 12%,var(--card))}
.xmark{position:absolute;right:-12px;top:-12px;width:54px;height:54px;border-radius:50%;background:#e5484d;color:#fff;display:flex;align-items:center;justify-content:center;
  border:5px solid var(--card);box-shadow:0 6px 14px rgba(229,72,77,.4)}
.xmark .ico{width:60%;height:60%;stroke-width:3.2}
.item-title{font-weight:800;font-size:calc(46px*var(--fs));line-height:1.3}
.item.solo .item-title{font-size:calc(38px*var(--fs));font-weight:700;line-height:1.5}
.item-desc{margin-top:6px;font-size:calc(31px*var(--fs));line-height:1.55;color:var(--ink-mid);font-weight:500}
.note{margin-top:calc(30px*var(--fs));font-size:calc(34px*var(--fs));color:var(--ink-mid);font-weight:700}

/* game */
.gameslide{display:flex;flex-direction:column;align-items:center;text-align:center}
.gindex{font-weight:800;font-size:28px;letter-spacing:.12em;color:var(--primary);margin-bottom:calc(26px*var(--fs))}
.gthumb{width:calc(900px*var(--fs));aspect-ratio:4/3;border-radius:48px;overflow:hidden;border:10px solid #fff;box-shadow:0 30px 70px rgba(20,50,35,.25)}
.gthumb img{width:100%;height:100%;object-fit:cover;display:block}
.gname{margin-top:calc(44px*var(--fs));font-weight:800;font-size:calc(84px*var(--fs));line-height:1.2}
.gage{margin-top:calc(22px*var(--fs));display:inline-flex;align-items:center;gap:12px;font-weight:800;font-size:calc(32px*var(--fs));color:var(--primary);
  background:color-mix(in srgb,var(--primary-lt) 20%,var(--card));border-radius:999px;padding:12px 30px}
.gdesc{margin-top:calc(28px*var(--fs));font-size:calc(40px*var(--fs));line-height:1.6;font-weight:700;color:var(--ink-mid)}

/* photo */
.photo{flex:0 0 auto;height:calc(640px*var(--fs));border-radius:44px;overflow:hidden;border:10px solid #fff;box-shadow:0 26px 60px rgba(20,50,35,.22);transform:rotate(-1.5deg)}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo.empty{transform:none;border:6px dashed var(--line);background:color-mix(in srgb,var(--card) 70%,transparent);box-shadow:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:var(--ink-mid);font-weight:800;font-size:40px}
.photo.empty small{font-size:26px;font-weight:500;opacity:.8}
.pcap{margin-top:calc(34px*var(--fs));font-size:calc(38px*var(--fs));line-height:1.6;font-weight:700}

/* cta */
.ctaslide{align-items:center;text-align:center}
.ctaslide .eyebrow{align-self:center}
.lead{font-size:calc(40px*var(--fs));line-height:1.75;font-weight:700;color:var(--ink-mid);margin-bottom:calc(10px*var(--fs))}
.badges{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:calc(34px*var(--fs))}
.badge{display:inline-flex;align-items:center;gap:10px;font-weight:800;font-size:calc(32px*var(--fs));color:var(--primary);background:var(--card);
  border:3px solid var(--primary-lt);border-radius:999px;padding:10px 24px 10px 18px;white-space:nowrap}
.badge .ico{stroke-width:3}
.btn{margin-top:calc(46px*var(--fs));align-self:center;display:inline-flex;align-items:center;gap:18px;font-weight:800;font-size:calc(40px*var(--fs));color:#fff;
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 85%,#fff),var(--accent));border-radius:999px;padding:30px 56px;
  box-shadow:0 16px 36px color-mix(in srgb,var(--accent) 45%,transparent),inset 0 -6px 0 rgba(0,0,0,.12)}
.textslide .btn,.listslide .btn{align-self:flex-start}
.url{margin-top:calc(34px*var(--fs));font-size:30px;font-weight:700;color:var(--ink-mid);letter-spacing:.05em}
`;

/* ---------- 図鑑データ → 投稿 ---------- */
function postFromZukan(id) {
  let file = null;
  for (const cat of fs.readdirSync(ZUKAN_DATA_DIR)) {
    const f = path.join(ZUKAN_DATA_DIR, cat, id + ".json");
    if (fs.existsSync(f)) file = f;
  }
  if (!file) throw new Error(`図鑑データが見つかりません: ${id}`);
  const z = JSON.parse(fs.readFileSync(file, "utf8"));
  const season = (z.season || [])[0];
  const theme = season === "冬" ? "winter" : season === "秋" ? "sunset" : "forest";
  const img = z.images && z.images[0] ? z.images[0].url : null;
  const pageUrl = `pontalelab.com/zukan/${z.category}/${z.id}/`;
  const facts = (z.funFacts || []).slice(0, 4);
  const slides = [
    { type: "cover", eyebrow: "いきもの図鑑", title: `**${z.name}**`, sub: z.oneLiner,
      image: img ? { src: img, style: "sticker", zoom: 1.7 } : null },
    { type: "text", icon: "search", eyebrow: "どんな虫？", heading: z.name, body: z.description.what },
    { type: "list", eyebrow: "くらし", heading: "どこにいて、\nなにを食べる？", items: [
      { icon: "pin", title: "すんでいるところ", desc: z.description.where },
      { icon: "food", title: "食べもの", desc: z.description.food },
      ...(z.size ? [{ icon: "sparkle", title: "大きさ", desc: z.size }] : [])
    ] },
    { type: "list", eyebrow: "へぇ！な豆知識", heading: "知ってた？", items: facts.map((f) => ({ icon: "sparkle", title: f })) },
    { type: "cta", icon: "book", eyebrow: "もっと知りたい人へ", heading: `${z.name}を\n図鑑で見てみよう`,
      body: "ぽんたーれらぼの昆虫図鑑では、\nほかの虫の豆知識も読めます。", button: "図鑑はプロフィールのリンクから", url: pageUrl }
  ];
  const caption = [
    `${z.name}って、どんな虫か知っていますか？🐞`,
    "",
    z.description.what,
    "",
    "＼へぇ！な豆知識／",
    ...facts.map((f) => "・" + f),
    "",
    "週末の公園で、ぜひ探してみてください🌳",
    "",
    "ぽんたーれらぼの昆虫図鑑では、ほかの虫のくらしも読めます。",
    "▶ プロフィールのリンクから",
    "",
    `#${z.name} #虫好きキッズ #昆虫好き #自然あそび #知育`
  ].join("\n");
  return { id: `zukan-${z.id}`, theme, slides, caption, _baseDir: path.dirname(file) };
}

/* ---------- 実行 ---------- */
function loadPosts(filter) {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".json") && (!filter || f.startsWith(filter)))
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
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

  for (const post of posts) {
    const dir = path.join(OUT_DIR, post.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, "_html"), { recursive: true });
    console.log(`▶ ${post.id}（${post.slides.length}枚）`);
    const ctx = { baseDir: post._baseDir };
    for (let i = 0; i < post.slides.length; i++) {
      const html = pageHtml(post.slides[i], i, post.slides.length, post, ctx);
      const htmlPath = path.join(dir, "_html", `${String(i + 1).padStart(2, "0")}.html`);
      fs.writeFileSync(htmlPath, html);
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const fit = await page.evaluate(() => window.__fit());
      await page.evaluate(() => document.fonts.ready);
      const out = path.join(dir, `${String(i + 1).padStart(2, "0")}.png`);
      await page.screenshot({ path: out });
      const warn = fit.overflow ? "  ⚠ 文字が多すぎて収まりきりません。文章を短くしてください" : fit.scale < 1 ? `  （文字を${Math.round(fit.scale * 100)}%に縮小）` : "";
      console.log(`  ${path.relative(TOOL_DIR, out)}${warn}`);
    }
    fs.rmSync(path.join(dir, "_html"), { recursive: true, force: true });
    if (post.caption) fs.writeFileSync(path.join(dir, "caption.txt"), post.caption + "\n");
    const todos = JSON.stringify(post).match(/【[^】]*】/g);
    if (todos) console.log(`  ✎ 要記入（【 】）が${todos.length}か所あります。posts/ のJSONを書き換えて再生成してください`);
  }
  await browser.close();
  console.log(`完了: ${path.relative(process.cwd(), OUT_DIR) || "out"}/ に出力しました`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
