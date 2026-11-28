/* ============================================================
   tools/sns-images/templates.js

   投稿画像のデザイン（テーマ・レイアウト・CSS）。
   PC用の generate.js と、スマホ用の SNSスタジオ（tools/sns-studio/）の
   両方から使う共通部品。ここを直せば両方の見た目が変わる。
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./icons"));
  else root.PLTemplates = factory(root.PLIcons);
})(typeof self !== "undefined" ? self : this, function (IC) {
const icon = IC.icon;
const W = 1080;
const H = 1350;
const REEL_H = 1920;   // リール（縦9:16）の高さ
function isTallFormat(post) { return !!post && (post.format === "reel" || post.format === "story"); }
function frameSize(post) { return { w: W, h: isTallFormat(post) ? REEL_H : H }; }

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
/* ---------- 部品 ---------- */
function hero(img, ctx) {
  if (!img) return "";
  const url = ctx.asset(img.src);
  if (!url) return "";
  if (img.style === "sticker") {
    // 透過PNG（むしたんの虫など）。余白が大きい画像は zoom で拡大する
    const zoom = img.zoom || 1;
    return `<div class="sticker"><div class="sticker-glow"></div><img src="${url}" style="transform:scale(${zoom})"></div>`;
  }
  return `<div class="hero-card"><img src="${url}"></div>`;
}
function collage(list, ctx) {
  const urls = (list || []).map((s) => ctx.asset(s)).filter(Boolean).slice(0, 3);
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
    const visual = s.collage ? collage(s.collage, ctx) : hero(s.image, ctx);
    return `<div class="cover ${visual ? "" : "cover-noimg"}">
      ${eyebrow(s.eyebrow)}
      <h1 class="title">${fmt(s.title)}</h1>
      ${s.sub ? `<p class="sub">${fmt(s.sub)}</p>` : ""}
      ${visual ? `<div class="visual"><div class="vwrap">${visual}</div></div>` : ""}
    </div>`;
  },
  // 見出し＋本文
  text(s, ctx) {
    const visual = hero(s.image, ctx);
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
    const url = ctx.asset(s.thumb);
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
    const url = ctx.asset(s.photo);
    const box = url
      ? `<div class="photo"><img src="${url}"></div>`
      : `<div class="photo empty">${icon("camera", 120)}<div>ここに写真を入れてください</div></div>`;
    return `<div class="photoslide">
      ${eyebrow(s.eyebrow)}
      <h2 class="heading">${fmt(s.heading)}</h2>
      ${box}
      ${s.caption ? `<p class="pcap">${fmt(s.caption)}</p>` : ""}
    </div>`;
  },
  // ゲーム画面（スマホのスクリーンショットを端末の枠に入れて表示）
  screen(s, ctx) {
    const url = ctx.asset(s.photo);
    const land = s.device === "tablet";
    const big = s.device === "big";
    const inner = url
      ? `<img src="${url}">`
      : `<div class="dev-empty">${icon("camera", 90)}<div>ゲーム画面の<br>スクショを入れてください</div></div>`;
    return `<div class="screenslide ${big ? "big" : ""}">
      ${eyebrow(s.eyebrow)}
      <h2 class="heading">${fmt(s.heading)}</h2>
      <div class="dev-stage">
        <div class="dev-glow"></div>
        <div class="dev ${big ? "bare" : land ? "tablet" : "phone"}">${land || big ? "" : '<span class="dev-notch"></span>'}<div class="dev-screen">${inner}</div></div>
      </div>
      ${s.caption ? `<p class="pcap center">${fmt(s.caption)}</p>` : ""}
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

/* ---------- 1枚分のフレーム ----------
   ctx.asset(src) で画像パスをURLに変換する（PCとスマホで変換方法が違うため） */
function renderFrame(slide, i, total, post, ctx) {
  const t = THEMES[post.theme] || THEMES.forest;
  const render = RENDER[slide.type];
  if (!render) throw new Error("未対応のスライド種類: " + slide.type);
  const logo = ctx.asset("/icons/icon-512.png");
  const isLast = i === total - 1;
  const story = post.format === "story";
  const reel = post.format === "reel" || story;
  const vars = `--bg:${t.bg};--ink:${t.ink};--ink-mid:${t.inkMid};--primary:${t.primary};--primary-lt:${t.primaryLt};` +
    `--accent:${t.accent};--accent-soft:${t.accentSoft};--card:${t.card};--line:${t.line};--mark:${t.mark};--fs:1;` +
    `background:radial-gradient(520px 520px at 92% 6%, ${t.blob1} 0%, transparent 70%),` +
    `radial-gradient(600px 600px at -6% 58%, ${t.blob2} 0%, transparent 70%),` +
    `radial-gradient(520px 520px at 100% 104%, ${t.blob3} 0%, transparent 70%), ${t.bg};`;
  return `<div class="plf frame ${post.theme === "lab" ? "dark" : ""} ${reel ? "reel" : ""} ${story ? "story" : ""}" lang="ja" style="${vars}">
  <div class="dots"></div>
  <header>
    <div class="brand">${logo ? `<img src="${logo}">` : ""}<span>ぽんたーれらぼ</span></div>
    ${total > 1 && !reel ? `<div class="pager">${i + 1}<span>/</span>${total}</div>` : ""}
  </header>
  <main class="plf-main">${render(slide, ctx)}</main>
  ${story && slide.link !== false ? `<div class="linkzone"><div class="lz-label">${fmt(post.linkLabel || "＼ タップしてあそぶ ／")}</div><div class="lz-arrow">${icon("arrow", 72)}</div><div class="lz-space"></div></div>` : ""}
  <footer>
    <span>pontalelab.com</span>
    ${reel ? `<span class="hint">無料・登録なし・広告なし</span>`
      : isLast ? `<span class="hint">${icon("bookmark", 30)}保存してあとで見返してね</span>`
             : `<span class="hint">スワイプ${icon("arrow", 30)}</span>`}
  </footer>
</div>`;
}

// 文字があふれる場合は全体を少しずつ縮小する（ブラウザ内で実行）
function fitFrame(frame) {
  const m = frame.querySelector(".plf-main"); let s = 1;
  frame.style.setProperty("--fs", "1");
  while (m.scrollHeight > m.clientHeight + 1 && s > 0.62) {
    s -= 0.03; frame.style.setProperty("--fs", s.toFixed(2));
  }
  return { scale: s, overflow: m.scrollHeight > m.clientHeight + 1 };
}

/* ---------- 図鑑データ → 投稿 ---------- */
function zukanPost(z) {
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
  return { id: `zukan-${z.id}`, theme, slides, caption };
}


const CSS = `
.plf,.plf *{box-sizing:border-box;margin:0;padding:0}
.plf{font-family:'M PLUS Rounded 1c','Hiragino Maru Gothic ProN','Hiragino Sans','Noto Sans JP',sans-serif;color:var(--ink);
  -webkit-font-smoothing:antialiased;font-feature-settings:"palt";word-break:auto-phrase;text-wrap:pretty}
.plf.frame{position:relative;text-align:left;line-height:normal;width:${W}px;height:${H}px;overflow:hidden;padding:64px 80px 56px;display:flex;flex-direction:column}
.plf .dots{position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--primary) 16%,transparent) 2px,transparent 2.5px);
  background-size:36px 36px;-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 30%,transparent 75%,#000 100%);mask-image:linear-gradient(180deg,#000 0%,transparent 30%,transparent 75%,#000 100%);opacity:.7;pointer-events:none}
.plf header,.plf footer,.plf main{position:relative;z-index:1}
.plf header{display:flex;align-items:center;justify-content:space-between;height:72px}
.plf .brand{display:flex;align-items:center;gap:16px;font-weight:800;font-size:30px;color:var(--primary);letter-spacing:.04em}
.plf .brand img{width:60px;height:60px;border-radius:16px;background:#fff;padding:6px;box-shadow:0 4px 14px rgba(0,0,0,.10)}
.plf .pager{font-weight:800;font-size:26px;color:var(--ink-mid);background:color-mix(in srgb,var(--card) 80%,transparent);
  border:2px solid var(--line);border-radius:999px;padding:8px 22px}
.plf .pager span{opacity:.5;margin:0 6px}
.plf main{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;padding:28px 0}
.plf footer{display:flex;justify-content:space-between;align-items:center;height:48px;font-size:24px;font-weight:700;color:var(--ink-mid);letter-spacing:.04em}
.plf .hint{display:flex;align-items:center;gap:10px;color:var(--primary)}
.plf mark{background:linear-gradient(transparent 58%,var(--mark) 58%,var(--mark) 92%,transparent 92%);color:inherit;padding:0 .08em}
.plf .todo{background:#fff2a8;color:#7a5a00;border:3px dashed #e0b400;border-radius:12px;padding:0 .2em;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
.plf .eyebrow{align-self:flex-start;display:inline-flex;align-items:center;font-weight:800;font-size:calc(30px*var(--fs));letter-spacing:.08em;
  color:#fff;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#000));border-radius:999px;
  padding:12px 30px;margin-bottom:calc(28px*var(--fs));box-shadow:0 8px 20px color-mix(in srgb,var(--accent) 35%,transparent)}
.plf .title{font-weight:800;font-size:calc(92px*var(--fs));line-height:1.28;letter-spacing:.01em}
.plf .heading{font-weight:800;font-size:calc(70px*var(--fs));line-height:1.32;margin-bottom:calc(36px*var(--fs))}
.plf .heading.big{font-size:calc(82px*var(--fs))}
.plf .sub{margin-top:calc(26px*var(--fs));font-size:calc(38px*var(--fs));font-weight:700;color:var(--ink-mid);line-height:1.5}
.plf .card{background:var(--card);border:2px solid var(--line);border-radius:40px;box-shadow:0 18px 50px rgba(20,50,35,.10)}
.plf.dark .card{box-shadow:0 18px 50px rgba(0,0,0,.35)}
.plf .body{padding:calc(44px*var(--fs)) calc(52px*var(--fs));font-size:calc(40px*var(--fs));line-height:1.8;font-weight:500}

/* cover */
.plf .cover{display:flex;flex-direction:column;height:100%;justify-content:flex-start;padding-top:12px}
.plf .cover-noimg{justify-content:center}
.plf .visual{position:relative;flex:1;min-height:260px;margin-top:calc(30px*var(--fs))}
.plf .vwrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.plf .visual.small{display:flex;align-items:center;justify-content:center}
.plf .visual.small{flex:0 0 auto;height:calc(360px*var(--fs));margin:calc(10px*var(--fs)) 0 calc(20px*var(--fs))}
.plf .hero-card{height:100%;max-height:560px;aspect-ratio:4/3;border-radius:44px;overflow:hidden;border:10px solid #fff;
  box-shadow:0 30px 70px rgba(20,50,35,.25);transform:rotate(-2deg)}
.plf .hero-card img{width:100%;height:100%;object-fit:cover;display:block}
.plf .sticker{position:relative;overflow:hidden;height:100%;aspect-ratio:1;max-height:600px;display:flex;align-items:center;justify-content:center}
.plf .sticker-glow{position:absolute;inset:6%;border-radius:50%;background:radial-gradient(circle,#fff 0%,color-mix(in srgb,var(--primary-lt) 30%,#fff) 62%,transparent 72%)}
.plf .sticker img{position:relative;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 24px 30px rgba(0,0,0,.22))}
.plf .collage{position:relative;width:100%;height:92%;max-height:600px}
.plf .cl{position:absolute;width:56%;aspect-ratio:4/3;border-radius:36px;overflow:hidden;border:9px solid #fff;box-shadow:0 26px 60px rgba(20,50,35,.28)}
.plf .cl img{width:100%;height:100%;object-fit:cover;display:block}
.plf .cl0{left:0;top:4%;transform:rotate(-7deg);z-index:1}
.plf .cl1{right:0;top:0;transform:rotate(6deg);z-index:2}
.plf .cl2{left:22%;bottom:0;transform:rotate(-1.5deg);z-index:3}

/* text */
.plf .textslide,.plf .listslide,.plf .ctaslide,.plf .photoslide{display:flex;flex-direction:column}
.plf .big-ico{width:calc(150px*var(--fs));height:calc(150px*var(--fs));border-radius:44px;display:flex;align-items:center;justify-content:center;
  color:#fff;background:linear-gradient(135deg,var(--primary-lt),var(--primary));box-shadow:0 18px 40px color-mix(in srgb,var(--primary) 40%,transparent);
  margin-bottom:calc(34px*var(--fs))}
.plf .big-ico .ico{width:58%;height:58%}
.plf .chips{display:flex;gap:18px;flex-wrap:wrap;margin-top:calc(34px*var(--fs))}
.plf .chip{font-weight:800;font-size:calc(38px*var(--fs));color:var(--primary);background:var(--card);border:3px solid var(--primary-lt);
  border-radius:999px;padding:14px 36px}

/* list */
.plf .items{display:flex;flex-direction:column;gap:calc(24px*var(--fs))}
.plf .item{display:flex;align-items:center;gap:32px;background:var(--card);border:2px solid var(--line);border-radius:36px;
  padding:calc(28px*var(--fs)) 36px;box-shadow:0 12px 34px rgba(20,50,35,.08)}
.plf.dark .item{box-shadow:0 12px 34px rgba(0,0,0,.3)}
.plf .item-ico{position:relative;flex:0 0 auto;width:calc(112px*var(--fs));height:calc(112px*var(--fs));border-radius:32px;display:flex;align-items:center;justify-content:center;
  color:var(--primary);background:color-mix(in srgb,var(--primary-lt) 22%,var(--card))}
.plf .item-ico .ico{width:52%;height:52%}
.plf .item.cross .item-ico{color:var(--ink-mid);background:color-mix(in srgb,var(--ink-mid) 12%,var(--card))}
.plf .xmark{position:absolute;right:-12px;top:-12px;width:54px;height:54px;border-radius:50%;background:#e5484d;color:#fff;display:flex;align-items:center;justify-content:center;
  border:5px solid var(--card);box-shadow:0 6px 14px rgba(229,72,77,.4)}
.plf .xmark .ico{width:60%;height:60%;stroke-width:3.2}
.plf .item-title{font-weight:800;font-size:calc(46px*var(--fs));line-height:1.3}
.plf .item.solo .item-title{font-size:calc(38px*var(--fs));font-weight:700;line-height:1.5}
.plf .item-desc{margin-top:6px;font-size:calc(31px*var(--fs));line-height:1.55;color:var(--ink-mid);font-weight:500}
.plf .note{margin-top:calc(30px*var(--fs));font-size:calc(34px*var(--fs));color:var(--ink-mid);font-weight:700}

/* game */
.plf .gameslide{display:flex;flex-direction:column;align-items:center;text-align:center}
.plf .gindex{font-weight:800;font-size:28px;letter-spacing:.12em;color:var(--primary);margin-bottom:calc(26px*var(--fs))}
.plf .gthumb{width:calc(900px*var(--fs));aspect-ratio:4/3;border-radius:48px;overflow:hidden;border:10px solid #fff;box-shadow:0 30px 70px rgba(20,50,35,.25)}
.plf .gthumb img{width:100%;height:100%;object-fit:cover;display:block}
.plf .gname{margin-top:calc(44px*var(--fs));font-weight:800;font-size:calc(84px*var(--fs));line-height:1.2}
.plf .gage{margin-top:calc(22px*var(--fs));display:inline-flex;align-items:center;gap:12px;font-weight:800;font-size:calc(32px*var(--fs));color:var(--primary);
  background:color-mix(in srgb,var(--primary-lt) 20%,var(--card));border-radius:999px;padding:12px 30px}
.plf .gdesc{margin-top:calc(28px*var(--fs));font-size:calc(40px*var(--fs));line-height:1.6;font-weight:700;color:var(--ink-mid)}

/* photo */
.plf .photo{flex:0 0 auto;height:calc(640px*var(--fs));border-radius:44px;overflow:hidden;border:10px solid #fff;box-shadow:0 26px 60px rgba(20,50,35,.22);transform:rotate(-1.5deg)}
.plf .photo img{width:100%;height:100%;object-fit:cover;display:block}
.plf .photo.empty{transform:none;border:6px dashed var(--line);background:color-mix(in srgb,var(--card) 70%,transparent);box-shadow:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:var(--ink-mid);font-weight:800;font-size:40px}
.plf .photo.empty small{font-size:26px;font-weight:500;opacity:.8}
.plf .pcap{margin-top:calc(34px*var(--fs));font-size:calc(38px*var(--fs));line-height:1.6;font-weight:700}

/* cta */
.plf .ctaslide{align-items:center;text-align:center}
.plf .ctaslide .eyebrow{align-self:center}
.plf .lead{font-size:calc(40px*var(--fs));line-height:1.75;font-weight:700;color:var(--ink-mid);margin-bottom:calc(10px*var(--fs))}
.plf .badges{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:calc(34px*var(--fs))}
.plf .badge{display:inline-flex;align-items:center;gap:10px;font-weight:800;font-size:calc(32px*var(--fs));color:var(--primary);background:var(--card);
  border:3px solid var(--primary-lt);border-radius:999px;padding:10px 24px 10px 18px;white-space:nowrap}
.plf .badge .ico{stroke-width:3}
.plf .btn{margin-top:calc(46px*var(--fs));align-self:center;display:inline-flex;align-items:center;gap:18px;font-weight:800;font-size:calc(40px*var(--fs));color:#fff;
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 85%,#fff),var(--accent));border-radius:999px;padding:30px 56px;
  box-shadow:0 16px 36px color-mix(in srgb,var(--accent) 45%,transparent),inset 0 -6px 0 rgba(0,0,0,.12)}
.plf .textslide .btn,.plf .listslide .btn{align-self:flex-start}
.plf .url{margin-top:calc(34px*var(--fs));font-size:30px;font-weight:700;color:var(--ink-mid);letter-spacing:.05em}

/* screen（端末の枠） */
.plf .screenslide{display:flex;flex-direction:column;height:100%}
.plf .dev-stage{position:relative;flex:1;min-height:420px;display:flex;align-items:center;justify-content:center}
.plf .dev-glow{position:absolute;width:78%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--primary-lt) 45%,transparent) 0%,transparent 68%)}
.plf .dev{position:relative;background:#14181a;box-shadow:0 40px 80px rgba(10,30,20,.35),inset 0 0 0 3px #2c3236;padding:18px}
.plf .dev.phone{position:absolute;top:8px;bottom:8px;left:50%;transform:translateX(-50%);aspect-ratio:9/19;border-radius:72px}
.plf .dev.tablet{width:96%;aspect-ratio:4/3;border-radius:52px;padding:26px}
.plf .dev-notch{position:absolute;top:34px;left:50%;transform:translateX(-50%);width:120px;height:34px;border-radius:20px;background:#14181a;z-index:2}
.plf .dev-screen{width:100%;height:100%;border-radius:56px;overflow:hidden;background:#e9efe9}
.plf .dev.tablet .dev-screen{border-radius:30px}
.plf .dev-screen img{width:100%;height:100%;object-fit:cover;display:block}
.plf .dev-empty{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#5d7368;font-weight:800;font-size:30px;text-align:center;line-height:1.5}
.plf .pcap.center{text-align:center}

/* リール（1080x1920）。上下はInstagramの表示（ボタンや説明文）にかぶるので余白を広く取る */
.plf.frame.reel{height:${REEL_H}px;padding:150px 80px 250px}
.plf.reel .heading{font-size:calc(84px*var(--fs))}
.plf.reel .heading.big{font-size:calc(92px*var(--fs))}
.plf.reel .dev.tablet{width:100%}
.plf.reel .pcap{font-size:calc(42px*var(--fs))}
.plf.reel .ctaslide{justify-content:center;height:100%}

/* ストーリーズ（1080x1920）。上は名前とバー、下は返信欄がかぶるので広めにあける。
   linkzone の空白部分に、Instagramでリンクスタンプを貼る */
.plf.frame.story{padding:230px 80px 230px}
.plf .linkzone{position:relative;z-index:1;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;padding-top:20px}
.plf .lz-label{font-weight:800;font-size:44px;color:var(--primary);letter-spacing:.06em}
.plf .lz-arrow{color:var(--accent);margin:6px 0 0;transform:rotate(90deg)}
.plf .lz-arrow .ico{width:72px;height:72px;stroke-width:2.6}
.plf .lz-space{width:620px;height:150px}

/* 「大きく（枠なし）」：ゲーム画面を表示領域いっぱいに */
.plf .dev.bare{position:absolute;inset:0;padding:0;border-radius:48px;background:#000;box-shadow:0 30px 70px rgba(10,30,20,.3)}
.plf .dev.bare .dev-screen{border-radius:48px}
.plf .screenslide.big .eyebrow{margin-bottom:calc(18px*var(--fs))}
.plf .screenslide.big .heading{font-size:calc(64px*var(--fs));margin-bottom:calc(24px*var(--fs))}
.plf .screenslide.big .pcap{margin-top:calc(22px*var(--fs));font-size:calc(36px*var(--fs))}
.plf .screenslide.big .dev-glow{display:none}
`;


/* ---------- ゲームデータ → 紹介投稿 ---------- */
const GAME_THEME = { pokopokosea: "winter", fishinggame: "winter", kenkenchizu: "sunset", otonoehon: "sunset", osarunotaiko: "sunset" };
function gamePost(g) {
  const plain = (t) => String(t || "").replace(/\*\*/g, "").replace(/\n/g, "");
  const slides = [
    { type: "cover", eyebrow: "無料で遊べるゲーム", title: g.catch || g.name, sub: `${g.name}（${g.age}）\n${g.desc}`, image: { src: g.thumb, style: "card" } },
    { type: "list", eyebrow: "あそびかた", heading: "3ステップで\nすぐ遊べる", items: g.steps || [] },
    { type: "screen", eyebrow: "ゲーム画面", heading: "こんな画面で\n遊べます", photo: null, ...(g.device ? { device: g.device } : {}), caption: "【画面の説明を一言で】" },
    { type: "list", eyebrow: "ここがおすすめ", heading: "おうちの人にも\nうれしいポイント", items: [
      ...(g.points || []),
      { icon: "check", title: "無料・登録なし・広告なし", desc: "アプリのインストールもいりません" }
    ] },
    { type: "cta", icon: "game", eyebrow: "スマホですぐ遊べる", heading: `${g.name}で\n遊んでみよう`,
      badges: ["無料", "登録なし", "広告なし"], button: "プロフィールのリンクから", url: `pontalelab.com/games/${g.id}/` }
  ];
  const caption = [
    `${plain(g.catch)}！「${g.name}」を紹介します🎮`,
    "",
    g.desc,
    "",
    "＼あそびかた／",
    ...(g.steps || []).map((st, i) => `${i + 1}. ${st.title}`),
    "",
    "＼ここがおすすめ／",
    ...(g.points || []).map((p) => "・" + p.title),
    "・無料・登録なし・広告なし",
    "",
    `🎮 対象年齢の目安：${g.age}`,
    "▶ プロフィールのリンクから、スマホですぐ遊べます",
    ...(g.credit ? ["", g.credit] : []),
    "",
    ["#知育ゲーム", ...(g.tags || []).slice(0, 3), "#おうち遊び"].join(" ")
  ].join("\n");
  return { id: `game-${g.id}`, theme: GAME_THEME[g.id] || "forest", slides, caption };
}

/* ---------- ゲームデータ → リール（動画） ----------
   slides[0] は動画を入れる画面、slides[1] は最後に表示する案内。動画そのものは別に保存する */
function reelPost(g) {
  const base = g ? gamePost(g) : null;
  const plain = (t) => String(t || "").replace(/\*\*/g, "").replace(/\n/g, "");
  return {
    format: "reel",
    theme: base ? base.theme : "forest",
    video: { start: 0, end: null, endCard: true, endSec: 2.5, hook: g && g.hook ? g.hook : "", hookSec: 2 },
    slides: [
      { type: "screen", eyebrow: g ? "無料で遊べるゲーム" : "ゲーム紹介", heading: g ? g.catch : "見出しを\n**入力**",
        photo: null, device: g && g.device ? g.device : "big", caption: g ? `${g.name}（${g.age}）` : "" },
      { type: "cta", icon: "game", eyebrow: "スマホですぐ遊べる", heading: g ? `${g.name}で\n遊んでみよう` : "プロフィールのリンクから\n遊べます",
        badges: ["無料", "登録なし", "広告なし"], button: "プロフィールのリンクから", url: g ? `pontalelab.com/games/${g.id}/` : "pontalelab.com" }
    ],
    caption: g ? [
      `${plain(g.catch)}！「${g.name}」🎮`,
      "",
      g.desc,
      "",
      `🎮 対象年齢の目安：${g.age}`,
      "💡 無料・登録なし・広告なし",
      "▶ プロフィールのリンクから、スマホですぐ遊べます",
      ...(g.credit ? ["", g.credit] : []),
      "",
      ["#知育ゲーム", ...(g.tags || []).slice(0, 3), "#おうち遊び"].join(" ")
    ].join("\n") : ""
  };
}

/* ---------- ゲームデータ → ストーリーズ ----------
   mode: "image"（画像1枚）または "video"（画面録画） */
function storyPost(g, mode) {
  const link = g ? `https://pontalelab.com/games/${g.id}/?utm_source=instagram&utm_medium=story` : "https://pontalelab.com/?utm_source=instagram&utm_medium=story";
  const base = { format: "story", theme: g ? (gamePost(g).theme) : "forest", link, linkLabel: "＼ タップしてあそぶ ／", caption: "" };
  if (mode === "video") {
    const r = reelPost(g);
    return Object.assign(base, {
      video: { start: 0, end: null, endCard: false, endSec: 2.5, hook: g && g.hook ? g.hook : "", hookSec: 2 },
      slides: [Object.assign({}, r.slides[0]), Object.assign({}, r.slides[1], { link: true })]
    });
  }
  return Object.assign(base, {
    slides: [g
      ? { type: "cover", eyebrow: "無料で遊べるゲーム", title: g.catch, sub: `${g.name}（${g.age}）`, image: { src: g.thumb, style: "card" } }
      : { type: "cover", eyebrow: "ラベル", title: "タイトルを\n**入力**", sub: "" }]
  });
}

// 投稿内に残っている【要記入】の数
function countTodos(post) {
  const m = JSON.stringify(post).match(/【[^】]*】/g);
  return m ? m.length : 0;
}

return { W, H, REEL_H, frameSize, isTallFormat, reelPost, storyPost, THEMES, CSS, esc, fmt, renderFrame, fitFrame, zukanPost, gamePost, countTodos, icon, ICON_NAMES: IC.ICON_NAMES };
});
