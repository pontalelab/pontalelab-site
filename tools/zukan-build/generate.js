#!/usr/bin/env node
/* ============================================================
   tools/zukan-build/generate.js

   図鑑データ（data/<category>/*.json）から、静的HTMLページを
   生成してリポジトリ直下の /zukan/ 以下に書き出すスクリプト。
   外部ライブラリへの依存なし（Node標準機能のみ）。

   新しい昆虫を追加する手順：
     1. data/mushi/ に新しいJSONファイルを1つ追加する
     2. リポジトリのルートで `node tools/zukan-build/generate.js` を実行する
     3. 生成された /zukan/ 以下の変更ごとコミットしてpushする

   詳しいデータの書き方は README.md を参照。
   ============================================================ */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..", "..");
const DATA_DIR = path.join(__dirname, "data");
const OUT_DIR = path.join(REPO_ROOT, "zukan");
const SITE_ORIGIN = "https://pontalelab.com";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function loadInsects(category) {
  const dir = path.join(DATA_DIR, category);
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function pageShell({ title, description, url, ogImage, bodyClass, jsonLd, main }) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(ogImage)}">

  <!-- Home screen icons -->
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#2d6a4f">

  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/analytics.js" defer></script>
  ${jsonLd ? `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>` : ""}
</head>
<body data-page="zukan" class="${bodyClass || ""}">
  <header class="header">
    <div class="header-inner">
      <a href="/" class="logo" aria-label="Pontalelab トップページ">
        <ruby>Pontale<span class="logo-dot">lab</span><rt>ぽんたーれらぼ</rt></ruby>
      </a>
      <nav class="header-nav" aria-label="メインナビゲーション">
        <a href="/games/" class="nav-link hide-sm">ゲーム一覧</a>
        <a href="/zukan/mushi/" class="nav-link hide-sm">昆虫図鑑</a>
        <a href="/about/" class="nav-link hide-sm">Pontalelabについて</a>
        <a href="/contact/" class="nav-link hide-sm">お問い合わせ</a>
      </nav>
    </div>
  </header>
  <main>
${main}
  </main>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">Pontalelab</div>
          <p class="footer-tagline">親子で楽しむ、発見の研究所</p>
        </div>
        <nav class="footer-nav" aria-label="フッターナビゲーション">
          <a href="/games/">ゲーム一覧</a>
          <a href="/zukan/mushi/">昆虫図鑑</a>
          <a href="/parents/">おうちの人へ</a>
          <a href="/support/">応援する</a>
          <a href="/about/">Pontalelabについて</a>
          <a href="/privacy/">プライバシーポリシー</a>
          <a href="/contact/">お問い合わせ</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© 2026 Pontalelab</p>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

function renderDetailPage(insect, all) {
  const url = `${SITE_ORIGIN}/zukan/${insect.category}/${insect.id}/`;
  const img = insect.images[0];
  const related = (insect.relatedInsectIds || [])
    .map((id) => all.find((i) => i.id === id))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insect.name,
    description: insect.oneLiner,
    url,
    about: {
      "@type": "Thing",
      name: insect.name,
      alternateName: insect.scientificName
    },
    audience: { "@type": "PeopleAudience", suggestedMinAge: insect.ageMin, suggestedMaxAge: insect.ageMax }
  };

  const imageCredit = img.source === "own-asset"
    ? "Pontalelabオリジナルイラスト（むしたんより）"
    : `${esc(img.credit || "")}${img.license ? ` / ${esc(img.license)}` : ""}`;

  const main = `
    <div class="page-hero">
      <h1 class="page-hero-title">${esc(insect.name)}<span style="font-size:0.5em;display:block;font-weight:600;color:var(--text-mid);">${esc(insect.reading)}</span></h1>
      <p class="page-hero-desc">${esc(insect.oneLiner)}</p>
    </div>
    <div class="simple-page">
      <figure style="text-align:center;margin-bottom:24px;">
        <div style="background:var(--bg-tint);border:2px solid var(--border);border-radius:var(--r-lg);padding:24px;display:inline-block;">
          <img src="${esc(img.url)}" alt="${esc(insect.name)}" style="width:200px;height:200px;object-fit:contain;">
        </div>
        <figcaption style="font-size:0.75rem;color:var(--text-lt);margin-top:8px;">
          ${imageCredit}
          ${img.sourceUrl ? ` — <a href="${esc(img.sourceUrl)}" style="color:var(--text-lt);" target="_blank" rel="noopener">出典</a>` : ""}
        </figcaption>
      </figure>

      <p style="color:var(--text-mid);font-size:0.9rem;">
        学名：${esc(insect.scientificName)}　/　分類：${esc(insect.classification)}　/　対象年齢の目安：${esc(insect.ageRange)}
      </p>

      <h2>どんな虫？</h2>
      <p>${esc(insect.description.what)}</p>
      <h2>どこにいる？</h2>
      <p>${esc(insect.description.where)}</p>
      <h2>なにを食べる？</h2>
      <p>${esc(insect.description.food)}</p>

      <h2>へぇ！な豆知識</h2>
      <ul style="padding-left:1.2em;color:var(--text-mid);">
        ${insect.funFacts.map((f) => `<li style="margin-bottom:8px;">${esc(f)}</li>`).join("\n        ")}
      </ul>

      <div class="game-card" style="margin:32px 0;">
        <div class="game-card-icon">🐛</div>
        <h3 class="game-card-title">むしたんで探してみよう！</h3>
        <p class="game-card-desc">${esc(insect.name)}を、実際にゲームの中で見つけられるかな？</p>
        <a href="${esc(insect.mushitanUrl)}" class="btn-play">むしたんで遊ぶ →</a>
      </div>

      ${related.length ? `
      <h2>関連する昆虫</h2>
      <div class="game-cards">
        ${related.map((r) => `
        <a href="/zukan/${r.category}/${r.id}/" class="game-card" style="text-decoration:none;color:inherit;">
          <img src="${esc(r.images[0].url)}" alt="${esc(r.name)}" style="width:64px;height:64px;object-fit:contain;">
          <h3 class="game-card-title">${esc(r.name)}</h3>
          <p class="game-card-desc">${esc(r.oneLiner)}</p>
        </a>`).join("\n        ")}
      </div>` : ""}

      ${(insect.relatedArticles || []).length ? `
      <h2>関連記事</h2>
      <ul style="padding-left:1.2em;">
        ${insect.relatedArticles.map((a) => `<li><a href="${esc(a.url)}" style="color:var(--forest-dk);">${esc(a.title)}</a></li>`).join("\n        ")}
      </ul>` : ""}

      <p style="margin-top:32px;">
        <a href="/parents/" style="color:var(--forest-dk);text-decoration:underline;font-weight:700;"
           data-ga-event="cta_click" data-ga-cta="parents_page" data-ga-location="zukan_detail">おうちの人へ →</a>
      </p>
    </div>
  `;

  return pageShell({
    title: `${insect.name}（${insect.reading}）| 昆虫図鑑 | Pontalelab`,
    description: `${insect.oneLiner} 対象年齢の目安：${insect.ageRange}。`,
    url,
    ogImage: `${SITE_ORIGIN}/icons/icon-512.png`,
    bodyClass: "zukan-detail",
    jsonLd,
    main
  });
}

function renderListPage(category, insects, meta) {
  const url = `${SITE_ORIGIN}/zukan/${category}/`;
  const main = `
    <div class="page-hero">
      <h1 class="page-hero-title">${esc(meta.title)}</h1>
      <p class="page-hero-desc">${esc(meta.desc)}</p>
    </div>
    <section class="sect-games">
      <div class="inner">
        <div class="games-grid">
          ${insects.map((i) => `
          <a href="/zukan/${i.category}/${i.id}/" class="game-card-full" style="text-decoration:none;color:inherit;">
            <img src="${esc(i.images[0].url)}" alt="${esc(i.name)}" style="width:96px;height:96px;object-fit:contain;align-self:center;">
            <h2 class="game-card-title">${esc(i.name)}</h2>
            <p class="game-card-desc">${esc(i.oneLiner)}</p>
            <p class="game-card-age">対象年齢の目安：${esc(i.ageRange)}</p>
          </a>`).join("\n          ")}
        </div>
      </div>
    </section>
  `;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: insects.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: { "@type": "Thing", name: i.name, url: `${SITE_ORIGIN}/zukan/${i.category}/${i.id}/` }
    }))
  };
  return pageShell({
    title: meta.title + " | Pontalelab",
    description: meta.desc,
    url,
    ogImage: `${SITE_ORIGIN}/icons/icon-512.png`,
    bodyClass: "zukan-list",
    jsonLd,
    main
  });
}

const CATEGORIES = {
  mushi: { title: "昆虫図鑑", desc: "むしたんに出てくる虫を、もっとくわしく知ろう" }
};

function main() {
  const t0 = Date.now();
  let pageCount = 0;

  for (const [category, meta] of Object.entries(CATEGORIES)) {
    const insects = loadInsects(category);

    for (const insect of insects) {
      const dir = path.join(OUT_DIR, insect.category, insect.id);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), renderDetailPage(insect, insects));
      pageCount++;
    }

    const listDir = path.join(OUT_DIR, category);
    fs.mkdirSync(listDir, { recursive: true });
    fs.writeFileSync(path.join(listDir, "index.html"), renderListPage(category, insects, meta));
    pageCount++;

    console.log(`✔ [${category}] ${insects.length}件のデータから ${insects.length + 1}ページを生成`);
    insects.forEach((i) => console.log(`  - /zukan/${i.category}/${i.id}/  (${i.name})`));
  }

  console.log(`合計 ${pageCount}ページを生成しました（${Date.now() - t0}ms）`);
}

main();
