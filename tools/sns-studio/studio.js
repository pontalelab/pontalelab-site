/* ============================================================
   SNSスタジオ：スマホで投稿画像を編集・書き出しするエディタ
   - デザインは ../sns-images/templates.js（PC用ツールと共通）
   - 画像の書き出しは html-to-image（vendor/）
   - 下書きはこの端末の localStorage に保存
   ============================================================ */
(function () {
  "use strict";
  const T = window.PLTemplates;
  const $ = (s, el = document) => el.querySelector(s);
  // 動かす場所ごとの設定。Claudeの非公開ページ版では window.PL_STUDIO で上書きする
  const CFG = Object.assign({
    assetBase: "",                         // "/games/..." の前に付ける文字列
    postsBase: "../sns-images/posts/",
    zukanList: null,                       // 図鑑JSONのURL一覧を返すURL（null ならサイトの図鑑ページから探す）
    zukanData: "/tools/zukan-build/data/",
    gamesUrl: "../sns-images/games.json",
    fonts: null,                           // [{weight, url, range}] を指定すると同梱フォントを使う
    fontCssUrl: "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap",
    useHistory: true
  }, window.PL_STUDIO || {});
  const POSTS_BASE = CFG.postsBase;
  const DRAFT_KEY = "pl-sns-studio-drafts-v1";
  const ctx = { asset: (src) => !src ? null : (src.startsWith("/") ? CFG.assetBase + src : src) };

  // 投稿画像用のCSSをページに読み込む
  const styleEl = document.createElement("style");
  styleEl.textContent = T.CSS;
  document.head.appendChild(styleEl);

  /* ---------- 素材ライブラリ ---------- */
  const GAMES = [
    ["mushimushi", "むしたん"], ["pokopokosea", "おさかなひらがな"], ["fishinggame", "あみあみうみ"],
    ["kenkenchizu", "けんけんちず"], ["otonoehon", "おとのえほん"], ["osarunotaiko", "おさるのたいこ"], ["agehanosora", "アゲハのそら"]
  ];
  const BUGS = [
    ["kabutomushi", "カブトムシ"], ["nokogiri_kuwagata", "ノコギリクワガタ"], ["nanahoshi_tentou", "ナナホシテントウ"],
    ["monshirocho", "モンシロチョウ"], ["oniyanma", "オニヤンマ"], ["syouryou_batta", "ショウリョウバッタ"], ["genji_botaru", "ゲンジボタル"]
  ];
  const ASSETS = [
    { group: "ゲーム画面", items: GAMES.map(([id, n]) => ({ src: `/games/thumbs/${id}.webp`, name: n, style: "card" })) },
    { group: "むしたんの虫（背景なし）", items: BUGS.map(([id, n]) => ({ src: `/games/mushimushi/bugs/${id}.png`, name: n, style: "sticker", zoom: 1.8 })) },
    { group: "ロゴ", items: [{ src: "/icons/icon-512.png", name: "ロゴ", style: "sticker", zoom: 0.82 }] }
  ];
  const THEME_INFO = {
    forest: ["緑", "基本"], sunset: ["オレンジ", "安心・お知らせ"], winter: ["青", "冬の季節ネタ"], lab: ["ダーク", "開発日誌"]
  };
  const TYPES = {
    cover: ["表紙", "大きなタイトルと画像", "sparkle"],
    text: ["見出し＋本文", "説明や豆知識に", "pencil"],
    list: ["箇条書き", "アイコン付きのリスト", "check"],
    game: ["ゲーム紹介", "ゲーム画面を大きく", "game"],
    photo: ["写真", "スマホの写真を大きく", "camera"],
    screen: ["ゲーム画面", "スクショを端末の枠に入れる", "game"],
    cta: ["最後の案内", "リンクへの誘導", "arrow"]
  };
  const NEW_SLIDE = {
    cover: () => ({ type: "cover", eyebrow: "ラベル", title: "タイトルを\n**入力**", sub: "" }),
    text: () => ({ type: "text", icon: "sparkle", eyebrow: "ラベル", heading: "見出し", body: "本文を入力" }),
    list: () => ({ type: "list", eyebrow: "ラベル", heading: "見出し", items: [{ icon: "sparkle", title: "項目1", desc: "説明" }, { icon: "leaf", title: "項目2", desc: "説明" }] }),
    game: () => ({ type: "game", index: "", thumb: "/games/thumbs/mushimushi.webp", name: "むしたん", age: "3〜6歳", desc: "説明" }),
    photo: () => ({ type: "photo", eyebrow: "ラベル", heading: "見出し", photo: null, caption: "" }),
    screen: () => ({ type: "screen", eyebrow: "ゲーム画面", heading: "こんな画面で\n遊べます", photo: null, caption: "" }),
    cta: () => ({ type: "cta", icon: "game", eyebrow: "", heading: "プロフィールのリンクから\n遊べます", badges: ["無料", "登録なし", "広告なし"], button: "プロフィールのリンクから" })
  };

  /* ---------- 状態 ---------- */
  let drafts = loadDrafts();
  let cur = null;      // 編集中の下書き { id, title, updatedAt, post }
  let idx = 0;         // 選択中のスライド
  let tab = "slide";

  function loadDrafts() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || []; } catch { return []; }
  }
  let saveTimer = 0;
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 400);
  }
  function saveNow() {
    if (!cur) return;
    cur.updatedAt = Date.now();
    drafts = [cur, ...drafts.filter((d) => d.id !== cur.id)].slice(0, 30);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); }
    catch { toast("保存容量がいっぱいです。古い下書きを削除してください"); }
  }

  /* ---------- 小物 ---------- */
  let toastTimer = 0;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.classList.add("on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("on"), 2200);
  }
  const esc = T.esc;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // 1080x1350の投稿画像を、指定の幅に縮小して表示する
  function mini(post, i, width) {
    const wrap = document.createElement("div");
    wrap.className = "st-mini";
    const fsz = T.frameSize(post);
    wrap.style.width = fsz.w + "px"; wrap.style.height = fsz.h + "px";
    wrap.style.transform = `scale(${width / fsz.w})`;
    wrap.innerHTML = T.renderFrame(post.slides[i], i, post.slides.length, post, ctx);
    return wrap;
  }
  function fitLater(wrap, cb) {
    const run = () => { const r = T.fitFrame(wrap.firstElementChild); cb && cb(r); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(run)); else run();
    // 画像の読み込みで高さが変わる場合に備えて再計算
    wrap.querySelectorAll("img").forEach((im) => { if (!im.complete) im.addEventListener("load", run, { once: true }); });
  }

  /* ---------- 画面切り替え ---------- */
  function show(view) {
    $("#home").hidden = view !== "home";
    $("#editor").hidden = view !== "editor";
    window.scrollTo(0, 0);
  }
  window.addEventListener("popstate", () => { if (!$("#sheet").hidden) closeSheet(); else if (cur) closeEditor(true); });

  /* ---------- ホーム ---------- */
  let presets = [];
  async function initHome() {
    renderDrafts();
    try {
      const list = await (await fetch(POSTS_BASE + "index.json")).json();
      presets = await Promise.all(list.map(async (p) => {
        const post = await (await fetch(POSTS_BASE + p.file)).json();
        return { ...p, post };
      }));
    } catch (e) { presets = []; }
    const box = $("#presets"); box.innerHTML = "";
    presets.forEach((p) => {
      const b = document.createElement("button");
      b.className = "st-card";
      b.innerHTML = `<div class="st-card-thumb"></div><span class="st-count">${p.post.slides.length}枚</span><b>${esc(p.title)}</b><small>${esc(p.desc || "")}</small>`;
      box.appendChild(b);
      const th = b.querySelector(".st-card-thumb");
      requestAnimationFrame(() => { const m = mini(p.post, 0, th.clientWidth); th.appendChild(m); fitLater(m); });
      b.onclick = () => openDraft(newDraft(p.title, clone(p.post)));
    });
    loadGames();
    loadZukan();
  }

  async function loadGames() {
    const box = $("#games");
    try {
      const games = await (await fetch(CFG.gamesUrl)).json();
      box.innerHTML = "";
      games.forEach((g) => {
        const b = document.createElement("button");
        b.className = "st-game";
        b.innerHTML = `<div class="st-game-img"><img src="${esc(ctx.asset(g.thumb))}" alt=""></div><b>${esc(g.name)}</b><small>${esc(g.age)}</small>`;
        b.onclick = () => openGameSheet(g);
        box.appendChild(b);
      });
    } catch (e) {
      box.innerHTML = `<p class="st-hint">ゲームの一覧を読み込めませんでした</p>`;
    }
  }

  function openGameSheet(g) {
    const body = document.createElement("div");
    body.className = "st-types";
    const opts = [
      ["image", "画像投稿（5枚）", "表紙・遊び方・ゲーム画面・おすすめ・案内", "sparkle"],
      ["reel", "リール（動画）", "画面録画を端末の枠に入れて、音つきで書き出す", "music"],
      ["story-image", "ストーリーズ（画像）", "リンクスタンプを貼る場所つき。押せるリンクで誘導", "arrow"],
      ["story-video", "ストーリーズ（動画）", "画面録画＋リンクスタンプの場所", "arrow"]
    ];
    opts.forEach(([k, name, desc, ic]) => {
      const b = document.createElement("button");
      b.className = "st-type-opt";
      b.innerHTML = `<i>${T.icon(ic, 24)}</i><span><b>${name}</b><small>${desc}</small></span>`;
      b.onclick = () => {
        closeSheet();
        if (k === "image") {
          const post = T.gamePost(g);
          openDraft(newDraft(`ゲーム紹介：${g.name}`, { theme: post.theme, slides: post.slides, caption: post.caption }));
        } else if (k === "reel") {
          openDraft(newDraft(`リール：${g.name}`, T.reelPost(g)));
        } else {
          const p = T.storyPost(g, k === "story-video" ? "video" : "image");
          openDraft(newDraft(`ストーリーズ：${g.name}`, p));
        }
      };
      body.appendChild(b);
    });
    openSheet(g.name, body);
  }

  async function loadZukan() {
    const box = $("#zukan");
    try {
      let urls;
      if (CFG.zukanList) urls = await (await fetch(CFG.zukanList)).json();
      else {
        const html = await (await fetch("/zukan/mushi/")).text();
        const ids = [...new Set([...html.matchAll(/href="\/zukan\/(\w+)\/(\w+)\/"/g)].map((m) => m[1] + "/" + m[2]))];
        urls = ids.map((key) => CFG.zukanData + key + ".json");
      }
      const items = await Promise.all(urls.map(async (u) => {
        try { return await (await fetch(u)).json(); } catch { return null; }
      }));
      box.innerHTML = "";
      items.filter(Boolean).forEach((z) => {
        const b = document.createElement("button");
        b.className = "st-bug";
        const img = ctx.asset(z.images && z.images[0] ? z.images[0].url : "/icons/icon-512.png");
        b.innerHTML = `<div class="st-bug-img"><img src="${esc(img)}" alt=""></div><b>${esc(z.name)}</b>`;
        b.onclick = () => {
          const post = T.zukanPost(z);
          openDraft(newDraft(`図鑑：${z.name}`, { theme: post.theme, slides: post.slides, caption: post.caption }));
        };
        box.appendChild(b);
      });
    } catch (e) {
      box.innerHTML = `<p class="st-hint">図鑑データを読み込めませんでした</p>`;
    }
  }

  function renderDrafts() {
    const sec = $("#drafts-sec"), box = $("#drafts");
    sec.hidden = !drafts.length;
    box.innerHTML = "";
    drafts.forEach((d) => {
      const row = document.createElement("div");
      row.className = "st-draft";
      const date = new Date(d.updatedAt);
      row.innerHTML = `<div class="st-draft-thumb"></div>
        <button class="st-draft-main"><b>${esc(d.title)}</b><small>${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ・ ${d.post.slides.length}枚</small></button>
        <button class="st-draft-del" aria-label="削除"><svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>`;
      box.appendChild(row);
      const th = row.querySelector(".st-draft-thumb");
      const m = mini(d.post, 0, 56); th.appendChild(m); fitLater(m);
      row.querySelector(".st-draft-main").onclick = () => openDraft(d);
      row.querySelector(".st-draft-del").onclick = async () => {
        if (!(await askConfirm(`「${d.title}」を削除しますか？`, "削除する"))) return;
        drafts = drafts.filter((x) => x.id !== d.id);
        videoStore.del(d.id);
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); } catch {}
        renderDrafts();
      };
    });
  }

  function newDraft(title, post) {
    return { id: "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title, updatedAt: Date.now(), post };
  }
  $("#new-blank").onclick = () => openDraft(newDraft("新しい投稿", { theme: "forest", slides: [NEW_SLIDE.cover(), NEW_SLIDE.cta()], caption: "" }));

  /* ---------- 編集画面 ---------- */
  function openDraft(d) {
    cur = d; idx = 0; tab = "slide";
    if (CFG.useHistory) history.pushState({ editor: true }, "");
    $("#post-title").value = d.title;
    $("#caption").value = d.post.caption || "";
    document.querySelector(".st-tools").hidden = isReel();
    $("#export").lastChild.textContent = isReel() ? "動画を書き出す" : "画像を書き出す";
    if (isReel()) loadVideo(d.id);
    setTab("slide");
    show("editor");
    renderPreview(true);
    renderPanel();
    updateTheme();
    updateTodo();
    saveNow();
  }
  function closeEditor(fromPop) {
    saveNow();
    cur = null;
    show("home");
    renderDrafts();
    if (!fromPop && CFG.useHistory) history.back();
  }
  $("#back").onclick = () => closeEditor(false);
  $("#post-title").oninput = (e) => { cur.title = e.target.value || "無題"; saveSoon(); };

  // プレビュー（横スワイプ）
  let previewObserver = null;
  function renderPreview(scrollToIdx) {
    const box = $("#preview");
    box.innerHTML = "";
    const post = cur.post;
    box.classList.toggle("reel", isTall());
    post.slides.forEach((s, i) => {
      const el = document.createElement("div");
      el.className = "st-slide" + (isTall() ? " reel" : "") + (i === idx ? " on" : "");
      el.dataset.i = i;
      if (isReel() && i === 1 && !post.video.endCard) el.classList.add("off");
      box.appendChild(el);
      drawSlide(el, i);
      el.onclick = () => { if (i !== idx) selectSlide(i, true); };
    });
    renderPager();
    if (previewObserver) previewObserver.disconnect();
    previewObserver = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting && en.intersectionRatio > 0.6) {
          const i = +en.target.dataset.i;
          if (i !== idx) selectSlide(i, false);
        }
      });
    }, { root: box, threshold: [0.6] });
    box.querySelectorAll(".st-slide").forEach((el) => previewObserver.observe(el));
    if (scrollToIdx) requestAnimationFrame(() => scrollSlide(idx, false));
  }
  function drawSlide(el, i) {
    el.innerHTML = "";
    const w = el.clientWidth || (isTall() ? Math.min(window.innerWidth * 0.52, 250) : Math.min(window.innerWidth * 0.74, 350));
    const m = mini(cur.post, i, w);
    el.appendChild(m);
    if (isStory()) markLinkZone(el, m, w);
    fitLater(m, (r) => {
      const old = el.querySelector(".st-warn"); if (old) old.remove();
      if (r.overflow) {
        const w = document.createElement("div"); w.className = "st-warn"; w.textContent = "⚠ 文字が多すぎます。少し短くしてください";
        el.appendChild(w);
      }
    });
  }
  // ストーリーズ：リンクスタンプを貼る位置を、プレビューにだけ点線で示す（書き出し画像には入らない）
  function markLinkZone(el, m, w) {
    const place = () => {
      const old = el.querySelector(".st-lz"); if (old) old.remove();
      const frame = m.firstElementChild, sp = frame && frame.querySelector(".lz-space");
      if (!sp) return;
      const k = w / T.W;
      const fr = frame.getBoundingClientRect(), r = sp.getBoundingClientRect();
      const g = document.createElement("div");
      g.className = "st-lz";
      g.style.left = (r.left - fr.left) + "px"; g.style.top = (r.top - fr.top) + "px";
      g.style.width = r.width + "px"; g.style.height = r.height + "px";
      g.textContent = "リンクスタンプの位置";
      el.appendChild(g);
      void k;
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(place))); else place();
  }

  function redrawCurrent() {
    const el = $(`#preview .st-slide[data-i="${idx}"]`);
    if (el) drawSlide(el, idx);
  }
  function scrollSlide(i, smooth) {
    const el = $(`#preview .st-slide[data-i="${i}"]`);
    if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", inline: "center", block: "nearest" });
  }
  function selectSlide(i, scroll) {
    idx = i;
    document.querySelectorAll("#preview .st-slide").forEach((el) => el.classList.toggle("on", +el.dataset.i === i));
    renderPager();
    renderPanel();
    if (scroll) scrollSlide(i, true);
  }
  function renderPager() {
    $("#pager").innerHTML = cur.post.slides.map((_, i) => `<i class="${i === idx ? "on" : ""}"></i>`).join("");
  }

  // スライドの並べ替え・追加・削除
  document.querySelector(".st-tools").addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const s = cur.post.slides;
    const act = b.dataset.act;
    if (act === "left" && idx > 0) { [s[idx - 1], s[idx]] = [s[idx], s[idx - 1]]; idx--; }
    else if (act === "right" && idx < s.length - 1) { [s[idx + 1], s[idx]] = [s[idx], s[idx + 1]]; idx++; }
    else if (act === "dup") { s.splice(idx + 1, 0, clone(s[idx])); idx++; toast("スライドを複製しました"); }
    else if (act === "del") {
      if (s.length <= 1) { toast("最後の1枚は削除できません"); return; }
      if (!(await askConfirm(`${idx + 1}枚目のスライドを削除しますか？`, "削除する"))) return;
      s.splice(idx, 1); idx = Math.min(idx, s.length - 1);
    }
    else if (act === "add") { openTypeSheet(); return; }
    else return;
    renderPreview(true); renderPanel(); updateTodo(); saveSoon();
  });

  function openTypeSheet() {
    const body = document.createElement("div");
    body.className = "st-types";
    Object.entries(TYPES).forEach(([type, [name, desc, ic]]) => {
      const b = document.createElement("button");
      b.className = "st-type-opt";
      b.innerHTML = `<i>${T.icon(ic, 24)}</i><span><b>${name}</b><small>${desc}</small></span>`;
      b.onclick = () => {
        cur.post.slides.splice(idx + 1, 0, NEW_SLIDE[type]());
        idx++;
        closeSheet();
        renderPreview(true); renderPanel(); updateTodo(); saveSoon();
      };
      body.appendChild(b);
    });
    openSheet("スライドを追加", body);
  }

  // テーマ
  function updateTheme() {
    const t = T.THEMES[cur.post.theme] || T.THEMES.forest;
    $("#theme-dot").style.background = `linear-gradient(135deg, ${t.primaryLt}, ${t.primary})`;
  }
  $("#theme-btn").onclick = () => {
    const body = document.createElement("div");
    body.className = "st-themes";
    Object.entries(THEME_INFO).forEach(([key, [name, use]]) => {
      const t = T.THEMES[key];
      const b = document.createElement("button");
      b.className = "st-theme" + (cur.post.theme === key ? " on" : "");
      b.innerHTML = `<div class="st-theme-sw" style="background:radial-gradient(60px 60px at 85% 10%, ${t.blob1}, transparent 70%),radial-gradient(70px 70px at 0% 100%, ${t.blob2}, transparent 70%),${t.bg}">
        <span style="position:absolute;left:10px;bottom:10px;width:46%;height:12px;border-radius:6px;background:${t.ink}"></span>
        <span style="position:absolute;left:10px;top:10px;width:30%;height:10px;border-radius:6px;background:${t.accent}"></span></div>
        <b>${name}</b><small>${use}</small>`;
      b.onclick = () => { cur.post.theme = key; closeSheet(); updateTheme(); renderPreview(true); saveSoon(); };
      body.appendChild(b);
    });
    openSheet("テーマの色", body);
  };

  // タブ
  function setTab(t) {
    tab = t;
    document.querySelectorAll(".st-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    $("#panel-slide").hidden = t !== "slide";
    $("#panel-caption").hidden = t !== "caption";
    updateCaptionCount();
  }
  document.querySelector(".st-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (b) setTab(b.dataset.tab);
  });

  // 本文
  $("#caption").oninput = (e) => { cur.post.caption = e.target.value; updateCaptionCount(); updateTodo(); saveSoon(); };
  function updateCaptionCount() {
    if (!cur) return;
    const v = cur.post.caption || "";
    const tags = (v.match(/#[^\s#]+/g) || []).length;
    $("#caption-count").innerHTML = `${[...v].length}文字 ・ ハッシュタグ${tags}個${tags > 5 ? "（<b>5個までがおすすめ</b>）" : ""}`;
  }
  $("#copy-caption").onclick = async () => {
    const v = cur.post.caption || "";
    try { await navigator.clipboard.writeText(v); }
    catch {
      const ta = $("#caption"); ta.focus(); ta.select(); document.execCommand("copy");
    }
    toast(/【[^】]*】/.test(v) ? "コピーしました（【 】が残っています）" : "本文をコピーしました");
  };

  function updateTodo() {
    const n = T.countTodos(cur.post);
    const el = $("#todo");
    el.hidden = !n;
    el.textContent = `✎ 【 】で囲んだ要記入の文章が${n}か所あります。自分の言葉に書き換えてください`;
  }

  /* ---------- 入力フォーム ---------- */
  const F = {
    eyebrow: ["ラベル（上の小さな文字）", "input"],
    title: ["タイトル", "textarea"],
    sub: ["サブタイトル", "textarea"],
    heading: ["見出し", "textarea"],
    body: ["本文", "textarea"],
    chips: ["チップ（「、」で区切る）", "csv"],
    badges: ["バッジ（「、」で区切る）", "csv"],
    button: ["ボタンの文字", "input"],
    note: ["補足の一言", "input"],
    url: ["URL表示", "input"],
    index: ["番号（例：01 / 07）", "input"],
    name: ["ゲーム名", "input"],
    age: ["対象年齢", "input"],
    desc: ["説明", "textarea"],
    caption: ["写真の説明", "textarea"],
    icon: ["アイコン", "icon"],
    visual: ["画像", "visual"],
    image: ["画像（任意）", "image"],
    thumb: ["ゲーム画像", "thumb"],
    photo: ["写真", "photo"],
    shot: ["ゲーム画面のスクリーンショット", "photo"],
    device: ["端末の形", "device"],
    items: ["項目", "items"],
    cross: ["「ないもの」表示（×印をつける）", "toggle"],
    video: ["ゲームの画面録画", "video"],
    endcard: ["動画のあとに、この案内を2.5秒表示する", "endcard"]
  };
  const SCHEMA = {
    cover: ["eyebrow", "title", "sub", "visual"],
    text: ["icon", "eyebrow", "heading", "body", "chips", "image", "badges", "button"],
    list: ["eyebrow", "heading", "items", "cross", "note", "button"],
    game: ["index", "thumb", "name", "age", "desc"],
    photo: ["eyebrow", "heading", "photo", "caption"],
    screen: ["eyebrow", "heading", "shot", "device", "caption"],
    cta: ["icon", "eyebrow", "heading", "body", "badges", "button", "url"]
  };

  let redrawTimer = 0;
  function changed(structural) {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(() => { if (isStory()) renderPreview(false); else redrawCurrent(); updateTodo(); }, 120);
    saveSoon();
    if (structural) renderPanel();
  }

  function renderPanel() {
    const panel = $("#panel-slide");
    const s = cur.post.slides[idx];
    panel.innerHTML = "";
    const [tname, , tic] = TYPES[s.type] || ["スライド", "", "sparkle"];
    const head = document.createElement("div");
    head.className = "st-type";
    head.innerHTML = isReel()
      ? `<span class="st-type-badge">${T.icon(idx === 0 ? "music" : "arrow", 16)}${idx === 0 ? (isStory() ? "ストーリーズの画面" : "リールの画面") : "最後に表示する案内"}</span>`
      : `<span class="st-type-badge">${T.icon(tic, 16)}${idx + 1}枚目 ・ ${tname}</span>`;
    panel.appendChild(head);
    const keys = isReel() ? (idx === 0 ? ["video", "eyebrow", "heading", "device", "caption"] : ["endcard", "eyebrow", "heading", "body", "badges", "button", "url"]) : (SCHEMA[s.type] || []);
    if (isStory()) panel.appendChild(storyLinkField());
    keys.forEach((key) => panel.appendChild(field(s, key)));
    const hint = document.createElement("p");
    hint.className = "st-hint";
    hint.innerHTML = "<b>**ことば**</b> で黄色いマーカー、<b>【ことば】</b> は要記入（黄色い枠）、改行もそのまま反映されます。";
    panel.appendChild(hint);
  }

  function field(s, key) {
    const [label, kind] = F[key];
    const wrap = document.createElement("div");
    wrap.className = "st-field";
    if (kind !== "toggle" && kind !== "endcard") wrap.innerHTML = `<label>${label}</label>`;

    if (kind === "input" || kind === "textarea" || kind === "csv") {
      const el = document.createElement(kind === "textarea" ? "textarea" : "input");
      if (kind !== "textarea") el.type = "text";
      else el.rows = Math.min(6, Math.max(2, String(s[key] || "").split("\n").length + 1));
      el.value = kind === "csv" ? (s[key] || []).join("、") : (s[key] || "");
      el.oninput = () => {
        if (kind === "csv") s[key] = el.value.split(/[、,]/).map((x) => x.trim()).filter(Boolean);
        else s[key] = el.value;
        changed();
      };
      wrap.appendChild(el);
    }
    else if (kind === "icon") {
      wrap.appendChild(iconButton(s.icon, (v) => { s.icon = v; changed(true); }, true));
    }
    else if (kind === "toggle") {
      const row = document.createElement("button");
      row.className = "st-toggle";
      row.innerHTML = `<span>${label}</span><span class="st-switch ${s[key] ? "on" : ""}"></span>`;
      row.onclick = () => { s[key] = !s[key]; changed(true); };
      wrap.appendChild(row);
    }
    else if (kind === "visual") {
      const mode = s.collage ? "collage" : s.image ? "image" : "none";
      const seg = document.createElement("div");
      seg.className = "st-seg";
      [["none", "なし"], ["image", "画像1枚"], ["collage", "3枚重ね"]].forEach(([m, n]) => {
        const b = document.createElement("button");
        b.textContent = n; b.className = m === mode ? "on" : "";
        b.onclick = () => {
          if (m === "none") { delete s.image; delete s.collage; }
          if (m === "image") { delete s.collage; s.image = s.image || { src: "/games/thumbs/mushimushi.webp", style: "card" }; }
          if (m === "collage") { delete s.image; s.collage = s.collage || ["/games/thumbs/mushimushi.webp", "/games/thumbs/agehanosora.webp", "/games/thumbs/kenkenchizu.webp"]; }
          changed(true);
        };
        seg.appendChild(b);
      });
      wrap.appendChild(seg);
      if (mode === "image") wrap.appendChild(imagePicker(s.image, (v) => { s.image = v; changed(true); }, false));
      if (mode === "collage") {
        s.collage.forEach((src, i) => wrap.appendChild(imagePicker({ src, style: "card" }, (v) => {
          if (v) s.collage[i] = v.src; else s.collage.splice(i, 1);
          if (!s.collage.length) delete s.collage;
          changed(true);
        }, true, `${i + 1}枚目`)));
        if (s.collage.length < 3) {
          const add = document.createElement("button");
          add.className = "st-btn-sub"; add.style.marginTop = "8px"; add.textContent = "＋ 画像を追加";
          add.onclick = () => openAssetSheet((v) => { s.collage.push(v.src); changed(true); });
          wrap.appendChild(add);
        }
      }
    }
    else if (kind === "image") {
      if (s.image) wrap.appendChild(imagePicker(s.image, (v) => { if (v) s.image = v; else delete s.image; changed(true); }, true));
      else {
        const add = document.createElement("button");
        add.className = "st-btn-sub"; add.textContent = "＋ 画像を選ぶ";
        add.onclick = () => openAssetSheet((v) => { s.image = v; changed(true); });
        wrap.appendChild(add);
      }
    }
    else if (kind === "thumb") {
      wrap.appendChild(imagePicker(s.thumb ? { src: s.thumb, style: "card" } : null, (v) => { s.thumb = v ? v.src : null; changed(true); }, true));
    }
    else if (kind === "photo") {
      wrap.appendChild(imagePicker(s.photo ? { src: s.photo, style: "card" } : null, (v) => { s.photo = v ? v.src : null; changed(true); }, true, null, true));
      if (key === "shot") {
        const h = document.createElement("p");
        h.className = "st-hint";
        h.textContent = "ゲームで一番楽しい場面をスマホでスクリーンショットして選んでください。";
        wrap.appendChild(h);
      }
    }
    else if (kind === "video") {
      wrap.appendChild(videoField());
    }
    else if (kind === "endcard") {
      const row = document.createElement("button");
      row.className = "st-toggle";
      const on = cur.post.video.endCard;
      row.innerHTML = `<span>${label}</span><span class="st-switch ${on ? "on" : ""}"></span>`;
      row.onclick = () => { cur.post.video.endCard = !on; saveSoon(); renderPreview(false); renderPanel(); };
      wrap.appendChild(row);
    }
    else if (kind === "device") {
      const seg = document.createElement("div");
      seg.className = "st-seg";
      [["phone", "スマホ（縦）"], ["tablet", "タブレット（横）"]].forEach(([m, n]) => {
        const b = document.createElement("button");
        b.textContent = n; b.className = (s.device || "phone") === m ? "on" : "";
        b.onclick = () => { if (m === "phone") delete s.device; else s.device = m; changed(true); };
        seg.appendChild(b);
      });
      wrap.appendChild(seg);
    }
    else if (kind === "items") {
      const list = document.createElement("div");
      list.className = "st-items";
      s.items = s.items || [];
      s.items.forEach((it, i) => {
        const box = document.createElement("div");
        box.className = "st-item";
        const row = document.createElement("div");
        row.className = "st-item-row";
        row.appendChild(iconButton(it.icon, (v) => { it.icon = v; changed(true); }));
        const t = document.createElement("input");
        t.type = "text"; t.value = it.title || ""; t.placeholder = "項目名";
        t.oninput = () => { it.title = t.value; changed(); };
        row.appendChild(t);
        const x = document.createElement("button");
        x.className = "st-item-x"; x.setAttribute("aria-label", "項目を削除");
        x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        x.onclick = () => { s.items.splice(i, 1); changed(true); };
        row.appendChild(x);
        box.appendChild(row);
        const d = document.createElement("input");
        d.type = "text"; d.className = "st-item-desc"; d.value = it.desc || ""; d.placeholder = "説明（なくてもOK）";
        d.style.cssText = "width:100%;margin-top:8px";
        d.oninput = () => { it.desc = d.value; changed(); };
        box.appendChild(d);
        list.appendChild(box);
      });
      wrap.appendChild(list);
      const add = document.createElement("button");
      add.className = "st-btn-sub"; add.style.marginTop = "10px"; add.textContent = "＋ 項目を追加";
      add.onclick = () => { s.items.push({ icon: "sparkle", title: "", desc: "" }); changed(true); };
      wrap.appendChild(add);
    }
    return wrap;
  }

  // ストーリーズのリンク（投稿全体で共通）
  function storyLinkField() {
    const box = document.createElement("div");
    box.className = "st-field st-storylink";
    box.innerHTML = `<label>リンクスタンプに入れるURL</label>
      <div class="st-urlrow"><input type="text" id="story-link" inputmode="url"><button class="st-ico-btn" aria-label="URLをコピー">${'<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>'}</button></div>
      <label style="margin-top:12px">リンクの上の一言</label>
      <input type="text" id="story-label">
      <p class="st-hint">投稿するとき、Instagramでリンクスタンプを追加して、プレビューの点線の位置に置いてください。点線は書き出し画像には入りません。</p>`;
    const link = box.querySelector("#story-link"), label = box.querySelector("#story-label");
    link.value = cur.post.link || ""; label.value = cur.post.linkLabel || "";
    link.oninput = () => { cur.post.link = link.value.trim(); saveSoon(); };
    label.oninput = () => { cur.post.linkLabel = label.value; changed(); };
    box.querySelector(".st-ico-btn").onclick = () => copyText(cur.post.link || "", "URLをコピーしました");
    return box;
  }
  async function copyText(v, msg) {
    try { await navigator.clipboard.writeText(v); toast(msg); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = v; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(msg); } catch (e2) { toast("コピーできませんでした"); }
      ta.remove();
    }
  }

  function iconButton(value, onPick, wide) {
    const b = document.createElement("button");
    b.className = "st-ico-btn";
    if (wide) { b.style.width = "auto"; b.style.padding = "0 14px"; b.style.gap = "8px"; b.style.display = "inline-flex"; b.style.alignItems = "center"; }
    b.innerHTML = value ? T.icon(value, 24) + (wide ? "<b style='font-size:13px'>変更</b>" : "") : (wide ? "<b style='font-size:13px'>アイコンを選ぶ</b>" : "＋");
    b.onclick = () => {
      const body = document.createElement("div");
      body.className = "st-grid-ico";
      if (wide) {
        const none = document.createElement("button");
        none.innerHTML = "<b style='font-size:12px'>なし</b>";
        none.onclick = () => { closeSheet(); onPick(null); };
        body.appendChild(none);
      }
      T.ICON_NAMES.filter((n) => n !== "arrow").forEach((n) => {
        const ib = document.createElement("button");
        ib.className = n === value ? "on" : "";
        ib.innerHTML = T.icon(n, 28);
        ib.onclick = () => { closeSheet(); onPick(n); };
        body.appendChild(ib);
      });
      openSheet("アイコンを選ぶ", body);
    };
    return b;
  }

  function imagePicker(img, onChange, removable, label, photoOnly) {
    const box = document.createElement("div");
    const b = document.createElement("button");
    b.className = "st-pick";
    const src = img && img.src;
    const isData = src && src.startsWith("data:");
    const name = !src ? "未選択" : isData ? "スマホの写真" : (ASSETS.flatMap((g) => g.items).find((a) => a.src === src) || {}).name || "画像";
    b.innerHTML = `<span class="st-pick-img ${img && img.style === "sticker" ? "sticker" : ""}" style="${src ? `background-image:url('${ctx.asset(src)}')` : ""}">${src ? "" : T.icon("camera", 24)}</span>
      <span><b>${label ? label + "：" : ""}${esc(name)}</b><small>タップして変更</small></span>
      ${removable && src ? `<span class="st-pick-x" aria-label="外す">${'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'}</span>` : ""}`;
    b.onclick = (e) => {
      if (e.target.closest(".st-pick-x")) { onChange(null); return; }
      if (photoOnly) pickPhoto((v) => onChange(v));
      else openAssetSheet((v) => onChange(v));
    };
    box.appendChild(b);
    if (img && img.style === "sticker") {
      const r = document.createElement("label");
      r.className = "st-range";
      r.innerHTML = `大きさ<input type="range" min="0.5" max="2.6" step="0.05" value="${img.zoom || 1}">`;
      r.querySelector("input").oninput = (e) => { img.zoom = +e.target.value; changed(); };
      box.appendChild(r);
    }
    return box;
  }

  function openAssetSheet(onPick) {
    const body = document.createElement("div");
    const up = document.createElement("button");
    up.className = "st-upload";
    up.innerHTML = T.icon("camera", 24) + "スマホの写真から選ぶ";
    up.onclick = () => { closeSheet(); pickPhoto(onPick); };
    body.appendChild(up);
    ASSETS.forEach((g) => {
      const h = document.createElement("div"); h.className = "st-asset-group"; h.textContent = g.group; body.appendChild(h);
      const grid = document.createElement("div"); grid.className = "st-assets";
      g.items.forEach((a) => {
        const b = document.createElement("button");
        b.className = "st-asset" + (a.style === "sticker" ? " sticker" : "");
        b.innerHTML = `<div style="overflow:hidden"><img src="${ctx.asset(a.src)}" alt="" loading="lazy"></div><span>${esc(a.name)}</span>`;
        b.onclick = () => { closeSheet(); onPick({ src: a.src, style: a.style, ...(a.zoom ? { zoom: a.zoom } : {}) }); };
        grid.appendChild(b);
      });
      body.appendChild(grid);
    });
    openSheet("画像を選ぶ", body);
  }

  // スマホの写真を読み込み、長辺1600pxに縮小してJPEGにする（保存容量の節約）
  function pickPhoto(onPick) {
    const input = $("#file");
    input.value = "";
    input.onchange = async () => {
      const f = input.files && input.files[0];
      if (!f) return;
      try {
        const url = URL.createObjectURL(f);
        const im = new Image();
        await new Promise((ok, ng) => { im.onload = ok; im.onerror = ng; im.src = url; });
        const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        onPick({ src: c.toDataURL("image/jpeg", 0.86), style: "card" });
      } catch (e) { toast("この写真は読み込めませんでした"); }
    };
    input.click();
  }

  /* ---------- 確認（ブラウザの confirm は使えない場所があるため自前で表示） ---------- */
  function askConfirm(message, okLabel) {
    return new Promise((resolve) => {
      const body = document.createElement("div");
      body.innerHTML = `<p class="st-confirm-msg"></p><div class="st-actions"><button class="st-btn-danger">${esc(okLabel)}</button><button class="st-btn-sub">やめる</button></div>`;
      body.querySelector(".st-confirm-msg").textContent = message;
      let done = false;
      const finish = (v) => { if (done) return; done = true; closeSheet(); resolve(v); };
      body.querySelector(".st-btn-danger").onclick = () => finish(true);
      body.querySelector(".st-btn-sub").onclick = () => finish(false);
      openSheet("確認", body, () => finish(false));
    });
  }

  /* ---------- ボトムシート ---------- */
  let onSheetClose = null;
  function openSheet(title, bodyEl, onClose) {
    if (onSheetClose) { const f = onSheetClose; onSheetClose = null; f(); }
    onSheetClose = onClose || null;
    $("#sheet-title").textContent = title;
    const body = $("#sheet-body"); body.innerHTML = ""; body.appendChild(bodyEl);
    $("#sheet").hidden = false; $("#sheet-back").hidden = false;
  }
  function closeSheet() {
    $("#sheet").hidden = true; $("#sheet-back").hidden = true;
    if (onSheetClose) { const f = onSheetClose; onSheetClose = null; f(); }
  }
  $("#sheet-x").onclick = closeSheet;
  $("#sheet-back").onclick = () => { if (!exporting) closeSheet(); };

  /* ---------- 書き出し ---------- */
  // 使っている文字が含まれるフォントだけを埋め込む（日本語フォントは分割されているため）
  let fontCssText = null;
  const fontData = new Map();
  function rangeHit(range, codes) {
    return range.split(",").some((part) => {
      const m = part.trim().replace(/^U\+/i, "").split("-");
      const a = parseInt(m[0].replace(/\?/g, "0"), 16), b = m[1] ? parseInt(m[1], 16) : parseInt(m[0].replace(/\?/g, "F"), 16);
      for (const c of codes) if (c >= a && c <= b) return true;
      return false;
    });
  }
  // 同梱フォント（Claudeの非公開ページ版）：画面表示用に登録し、書き出し用のCSSも作る
  let localFontCss = null;
  function bufToDataUrl(buf) {
    return new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(new Blob([buf], { type: "font/woff2" })); });
  }
  function loadLocalFonts() {
    if (localFontCss) return localFontCss;
    localFontCss = Promise.all(CFG.fonts.map(async (f) => {
      const buf = await (await fetch(f.url)).arrayBuffer();
      const desc = { weight: String(f.weight), style: "normal", ...(f.range ? { unicodeRange: f.range } : {}) };
      try { const face = new FontFace("M PLUS Rounded 1c", buf.slice(0), desc); await face.load(); document.fonts.add(face); } catch (e) {}
      const data = await bufToDataUrl(buf);
      return `@font-face{font-family:'M PLUS Rounded 1c';font-style:normal;font-weight:${f.weight};src:url(${data}) format('woff2');${f.range ? `unicode-range:${f.range};` : ""}}`;
    })).then((rules) => {
      // 表示中のプレビューをフォント読み込み後に描き直す
      if (cur) renderPreview(false);
      document.querySelectorAll(".st-card-thumb .st-mini, .st-draft-thumb .st-mini").forEach((m) => T.fitFrame(m.firstElementChild));
      return rules.join("\n");
    }).catch(() => "");
    return localFontCss;
  }
  async function fontEmbedCss(text) {
    if (CFG.fonts) return loadLocalFonts();
    if (fontCssText === null) {
      try { fontCssText = await (await fetch(CFG.fontCssUrl)).text(); } catch { fontCssText = ""; }
    }
    const codes = new Set([...text + "0123456789/"].map((c) => c.codePointAt(0)));
    const blocks = fontCssText.match(/@font-face\s*{[^}]*}/g) || [];
    const out = [];
    for (const blk of blocks) {
      const ur = /unicode-range:\s*([^;}]+)/.exec(blk);
      if (ur && !rangeHit(ur[1], codes)) continue;
      const u = /url\(([^)]+)\)/.exec(blk);
      if (!u) continue;
      const url = u[1].replace(/['"]/g, "");
      if (!fontData.has(url)) {
        fontData.set(url, fetch(url).then((r) => r.blob()).then((bl) => new Promise((ok) => {
          const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(bl);
        })).catch(() => null));
      }
      const data = await fontData.get(url);
      if (data) out.push(blk.replace(u[0], `url(${data})`));
    }
    return out.join("\n");
  }

  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let exporting = false;

  // 投稿の1枚を原寸のcanvasに描く（リール用に、画面の位置も測って返す）
  async function renderCanvas(post, i) {
    const stage = $("#stage");
    const fsz = T.frameSize(post);
    stage.style.height = fsz.h + "px";
    stage.innerHTML = T.renderFrame(post.slides[i], i, post.slides.length, post, ctx);
    const frame = stage.firstElementChild;
    await Promise.all([...frame.querySelectorAll("img")].map((im) => im.decode ? im.decode().catch(() => {}) : null));
    if (document.fonts) await document.fonts.ready;
    T.fitFrame(frame);
    const fr = frame.getBoundingClientRect();
    const rel = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height }; };
    const screenEl = frame.querySelector(".dev-screen");
    const screen = rel(screenEl);
    const radius = screenEl ? parseFloat(getComputedStyle(screenEl).borderTopLeftRadius) || 0 : 0;
    const notch = rel(frame.querySelector(".dev-notch"));
    const opts = { width: fsz.w, height: fsz.h, pixelRatio: 1, cacheBust: false, fontEmbedCSS: await fontEmbedCss(frame.textContent) };
    if (isIOS) await window.htmlToImage.toCanvas(frame, opts);
    const canvas = await window.htmlToImage.toCanvas(frame, opts);
    stage.innerHTML = "";
    stage.style.height = "";
    return { canvas, screen, radius, notch };
  }

  async function renderPng(post, i) {
    const stage = $("#stage");
    stage.innerHTML = T.renderFrame(post.slides[i], i, post.slides.length, post, ctx);
    const frame = stage.firstElementChild;
    await Promise.all([...frame.querySelectorAll("img")].map((im) => im.decode ? im.decode().catch(() => {}) : null));
    if (document.fonts) await document.fonts.ready;
    const fit = T.fitFrame(frame);
    const fsz = T.frameSize(post);
    stage.style.height = fsz.h + "px";
    const opts = { width: fsz.w, height: fsz.h, pixelRatio: 1, cacheBust: false, fontEmbedCSS: await fontEmbedCss(frame.textContent) };
    // iOS Safariは1回目に画像が抜けることがあるため、2回描画する
    if (isIOS) await window.htmlToImage.toCanvas(frame, opts);
    const canvas = await window.htmlToImage.toCanvas(frame, opts);
    const blob = await new Promise((ok) => canvas.toBlob(ok, "image/png"));
    stage.innerHTML = "";
    stage.style.height = "";
    return { blob, fit };
  }

  $("#export").onclick = async () => {
    if (exporting) return;
    if (isReel()) { exportReel(true); return; }
    saveNow();
    exporting = true;
    $("#export").disabled = true;
    const post = cur.post;
    const n = post.slides.length;
    const body = document.createElement("div");
    body.innerHTML = `<div class="st-progress"><i></i></div><div class="st-progress-txt">準備中…</div><div class="st-results"></div><div class="st-actions"></div>`;
    openSheet("画像を書き出し中", body);
    const bar = body.querySelector(".st-progress i"), txt = body.querySelector(".st-progress-txt");
    const results = body.querySelector(".st-results"), actions = body.querySelector(".st-actions");
    const files = [], warns = [];
    const base = (cur.title || "pontalelab").replace(/[\\/:*?"<>|\s#]+/g, "_").slice(0, 30);
    try {
      for (let i = 0; i < n; i++) {
        txt.textContent = `${i + 1} / ${n}枚目を作成中…`;
        const { blob, fit } = await renderPng(post, i);
        if (fit.overflow) warns.push(i + 1);
        const file = new File([blob], `${base}_${String(i + 1).padStart(2, "0")}.png`, { type: "image/png" });
        files.push(file);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name;
        a.innerHTML = `<img src="${url}" alt="${i + 1}枚目">`;
        results.appendChild(a);
        bar.style.width = `${((i + 1) / n) * 100}%`;
      }
      $("#sheet-title").textContent = "書き出し完了";
      txt.textContent = `${n}枚の画像ができました` + (warns.length ? `（${warns.join("・")}枚目は文字があふれています）` : "");
      const claudeDl = window.claude && window.claude.use ? await window.claude.use("downloads").catch(() => null) : null;
      const saveOne = async (file) => {
        try { await claudeDl.save({ filename: file.name, data: file }); return true; }
        catch (e) {
          const code = e && e.code;
          if (code === "declined") return false;
          if (code === "rate_limited") { toast("少し待ってから、もう一度お試しください"); return false; }
          toast("保存できませんでした"); return false;
        }
      };
      const canShare = !claudeDl && navigator.canShare && navigator.canShare({ files });
      if (claudeDl) {
        // Claudeのページ：1枚ずつ保存の確認が出る（iPhoneのClaudeアプリでは共有メニューから「画像を保存」）
        results.querySelectorAll("a").forEach((a, i) => {
          a.addEventListener("click", (ev) => { ev.preventDefault(); saveOne(files[i]); });
        });
        const all = document.createElement("button");
        all.className = "st-btn-main";
        all.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>すべて保存（1枚ずつ確認）';
        all.onclick = async () => {
          for (let i = 0; i < files.length; i++) {
            all.disabled = true;
            all.lastChild.textContent = `${i + 1} / ${files.length}枚目を保存中…`;
            const ok = await saveOne(files[i]);
            if (!ok) break;
          }
          all.disabled = false;
          all.lastChild.textContent = "すべて保存（1枚ずつ確認）";
        };
        actions.appendChild(all);
      } else if (canShare) {
        const share = document.createElement("button");
        share.className = "st-btn-main";
        share.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>写真に保存・Instagramで共有';
        share.onclick = async () => {
          try { await navigator.share({ files }); } catch (e) { if (e && e.name !== "AbortError") toast("共有できませんでした"); }
        };
        actions.appendChild(share);
      }
      if (!claudeDl) {
        const dl = document.createElement("button");
        dl.className = "st-btn-sub";
        dl.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>1枚ずつダウンロード';
        dl.onclick = async () => {
          for (const a of results.querySelectorAll("a")) { a.click(); await new Promise((r) => setTimeout(r, 350)); }
        };
        actions.appendChild(dl);
      }
      if (isStory()) actions.appendChild(storyCopyButton());
      const copy = document.createElement("button");
      copy.className = "st-btn-sub";
      copy.innerHTML = '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>本文をコピー';
      copy.onclick = () => $("#copy-caption").click();
      if (!isStory()) actions.appendChild(copy);
      const note = document.createElement("p");
      note.className = "st-note";
      note.innerHTML = isStory() ? STORY_NOTE : claudeDl
        ? "保存の確認が1枚ずつ出ます。iPhoneのClaudeアプリでは、共有メニューの「画像を保存」で写真アプリに入ります。画像をタップすると、その1枚だけ保存できます。"
        : canShare
          ? "「写真に保存・Instagramで共有」から、写真アプリへまとめて保存できます。Instagramでは1枚目から順番に選んでください。"
          : "画像を長押しすると保存できます。Instagramでは1枚目から順番に選んでください。";
      actions.appendChild(note);
    } catch (e) {
      console.error(e);
      $("#sheet-title").textContent = "書き出しに失敗しました";
      txt.textContent = "通信状態を確認して、もう一度お試しください。";
    } finally {
      exporting = false;
      $("#export").disabled = false;
    }
  };

  const STORY_NOTE = "Instagramでストーリーズを作り、この画像（動画）を選んだら、スタンプから<b>「リンク」</b>を選んでURLを貼り付け、矢印の下の空いている場所に置いてください。投稿後にハイライトへ追加すると、プロフィールにずっと残せます。";
  function storyCopyButton() {
    const b = document.createElement("button");
    b.className = "st-btn-sub";
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>リンクスタンプ用のURLをコピー';
    b.onclick = () => copyText(cur.post.link || "", "URLをコピーしました");
    return b;
  }

  /* ---------- リール（動画） ---------- */
  function isReel() { return isVideo(); }   // 動画を書き出す投稿（リール・動画ストーリーズ）
  function isVideo() { return !!(cur && cur.post.video); }
  function isTall() { return !!(cur && T.isTallFormat(cur.post)); }
  function isStory() { return !!(cur && cur.post.format === "story"); }

  // 画面録画はサイズが大きいので、下書き（localStorage）ではなく IndexedDB に保存する
  const videoMem = new Map();
  const videoStore = {
    db: null,
    open() {
      if (this.db) return this.db;
      this.db = new Promise((ok, ng) => {
        try {
          const r = indexedDB.open("pl-sns-studio", 1);
          r.onupgradeneeded = () => r.result.createObjectStore("videos");
          r.onsuccess = () => ok(r.result); r.onerror = () => ng(r.error);
        } catch (e) { ng(e); }
      });
      return this.db;
    },
    async tx(mode, fn) {
      const db = await this.open();
      return new Promise((ok, ng) => { const t = db.transaction("videos", mode); const req = fn(t.objectStore("videos")); t.oncomplete = () => ok(req && req.result); t.onerror = () => ng(t.error); });
    },
    async put(k, v) { videoMem.set(k, v); try { await this.tx("readwrite", (st) => st.put(v, k)); } catch (e) {} },
    async get(k) { if (videoMem.has(k)) return videoMem.get(k); try { const v = await this.tx("readonly", (st) => st.get(k)); if (v) videoMem.set(k, v); return v || null; } catch (e) { return null; } },
    async del(k) { videoMem.delete(k); try { await this.tx("readwrite", (st) => st.delete(k)); } catch (e) {} }
  };

  let curVideo = null;   // { blob, url, duration }
  async function loadVideo(id) {
    if (curVideo && curVideo.url) URL.revokeObjectURL(curVideo.url);
    curVideo = null;
    const blob = await videoStore.get(id);
    if (!blob || !cur || cur.id !== id) { if (cur && cur.id === id) renderPanel(); return; }
    const url = URL.createObjectURL(blob);
    const duration = await probeDuration(url);
    curVideo = { blob, url, duration };
    if (cur && cur.id === id && idx === 0) renderPanel();
  }
  function probeDuration(url) {
    return new Promise((ok) => {
      const v = document.createElement("video");
      v.preload = "metadata"; v.muted = true; v.playsInline = true;
      v.onloadedmetadata = () => ok(isFinite(v.duration) ? v.duration : 0);
      v.onerror = () => ok(0);
      v.src = url;
    });
  }
  // 動画の1コマを画像にして、プレビューの端末の中に表示する
  function makePoster(url, t) {
    return new Promise((ok) => {
      const v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.preload = "auto";
      v.onloadeddata = () => { v.currentTime = Math.min(t, Math.max(0, (v.duration || 1) - 0.05)); };
      v.onseeked = () => {
        const k = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/jpeg", 0.8));
      };
      v.onerror = () => ok(null);
      v.src = url;
    });
  }
  const fmtSec = (x) => (Math.round(x * 10) / 10).toFixed(1) + "秒";

  function pickVideo() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "video/*";
    input.onchange = async () => {
      const f = input.files && input.files[0];
      if (!f || !cur) return;
      const id = cur.id;
      toast("動画を読み込んでいます…");
      await videoStore.put(id, f);
      if (curVideo && curVideo.url) URL.revokeObjectURL(curVideo.url);
      const url = URL.createObjectURL(f);
      const duration = await probeDuration(url);
      if (!duration) { toast("この動画は読み込めませんでした"); return; }
      curVideo = { blob: f, url, duration };
      cur.post.video.start = 0;
      cur.post.video.end = Math.min(duration, 30);
      cur.post.slides[0].photo = await makePoster(url, 0.2);
      // 横長の動画ならタブレットの枠にする
      const v = document.createElement("video"); v.src = url; v.muted = true;
      await new Promise((ok) => { v.onloadedmetadata = ok; v.onerror = ok; });
      if (v.videoWidth > v.videoHeight) cur.post.slides[0].device = "tablet"; else delete cur.post.slides[0].device;
      saveSoon(); renderPreview(false); renderPanel(); updateTodo();
    };
    input.click();
  }

  function videoField() {
    const box = document.createElement("div");
    const vid = cur.post.video;
    if (!curVideo) {
      const b = document.createElement("button");
      b.className = "st-upload";
      b.innerHTML = T.icon("camera", 24) + "画面録画を選ぶ";
      b.onclick = pickVideo;
      box.appendChild(b);
      const h = document.createElement("p");
      h.className = "st-hint";
      h.innerHTML = "ゲームを遊びながら、スマホの「画面収録」で録画した動画を選んでください。<b>15〜30秒</b>がおすすめです。ゲームの音もそのまま入ります。";
      box.appendChild(h);
      return box;
    }
    const d = curVideo.duration;
    const end = Math.min(vid.end == null ? Math.min(d, 30) : vid.end, d);
    const info = document.createElement("div");
    info.className = "st-vinfo";
    info.innerHTML = `<b>使う長さ：<span class="st-vlen">${fmtSec(end - vid.start)}</span></b><small>動画全体 ${fmtSec(d)}</small>`;
    box.appendChild(info);
    const mk = (labelTxt, val, onInput, onChange) => {
      const r = document.createElement("label");
      r.className = "st-range";
      r.innerHTML = `<span style="width:3.2em">${labelTxt}</span><input type="range" min="0" max="${d.toFixed(2)}" step="0.1" value="${val}"><span class="st-rv" style="width:3.6em;text-align:right">${fmtSec(val)}</span>`;
      const inp = r.querySelector("input");
      inp.oninput = () => { onInput(+inp.value, r); };
      inp.onchange = () => onChange && onChange(+inp.value);
      return r;
    };
    const update = () => {
      box.querySelector(".st-vlen").textContent = fmtSec((vid.end ?? d) - vid.start);
      const warn = box.querySelector(".st-vwarn");
      const len = (vid.end ?? d) - vid.start;
      warn.hidden = len <= 60;
    };
    box.appendChild(mk("はじめ", vid.start, (v, r) => {
      vid.start = Math.min(v, (vid.end ?? d) - 1); r.querySelector(".st-rv").textContent = fmtSec(vid.start); update(); saveSoon();
    }, async () => { cur.post.slides[0].photo = await makePoster(curVideo.url, vid.start + 0.1); saveSoon(); redrawCurrent(); }));
    box.appendChild(mk("おわり", end, (v, r) => {
      vid.end = Math.max(v, vid.start + 1); r.querySelector(".st-rv").textContent = fmtSec(vid.end); update(); saveSoon();
    }));
    const warn = document.createElement("p");
    warn.className = "st-hint st-vwarn"; warn.hidden = true;
    warn.innerHTML = "<b>60秒より長いと書き出しに時間がかかります。15〜30秒がおすすめです。</b>";
    box.appendChild(warn);
    const row = document.createElement("div");
    row.className = "st-vrow";
    const play = document.createElement("button");
    play.className = "st-btn-sub"; play.innerHTML = T.icon("music", 20) + "試しに再生";
    play.onclick = () => exportReel(false);
    const change = document.createElement("button");
    change.className = "st-btn-sub"; change.textContent = "動画を変える";
    change.onclick = pickVideo;
    row.appendChild(play); row.appendChild(change);
    box.appendChild(row);
    return box;
  }

  function pickMime() {
    if (!window.MediaRecorder) return null;
    const list = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4",
      "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    return list.find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || "";
  }
  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }

  // record=false なら「試しに再生」（書き出さずに合成結果を見せる）
  async function exportReel(record) {
    if (exporting) return;
    if (!curVideo) { toast("先に画面録画を選んでください"); return; }
    const mime = record ? pickMime() : "";
    if (record && mime === null) { toast("この端末では動画を書き出せません"); return; }
    const post = cur.post, vid = post.video;
    // iPhoneでは、ボタンを押した直後に再生と音の準備をしておかないと、あとで音が出せない
    const v = document.createElement("video");
    v.playsInline = true; v.preload = "auto"; v.src = curVideo.url;
    v.setAttribute("playsinline", "");
    v.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
    document.body.appendChild(v);
    let ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); } catch (e) {}
    v.play().then(() => v.pause()).catch(() => {});

    exporting = true;
    $("#export").disabled = true;
    const body = document.createElement("div");
    body.innerHTML = `<div class="st-reel-view"><canvas width="${T.W}" height="${T.REEL_H}"></canvas></div>
      <div class="st-progress"><i></i></div><div class="st-progress-txt">準備中…</div><div class="st-actions"></div>`;
    let cancelled = false;
    openSheet(record ? "動画を書き出し中" : "試しに再生", body, () => { cancelled = true; });
    const cv = body.querySelector("canvas"), cx = cv.getContext("2d");
    const bar = body.querySelector(".st-progress i"), txt = body.querySelector(".st-progress-txt"), actions = body.querySelector(".st-actions");
    try {
      txt.textContent = "画面を準備しています…";
      const base = await renderCanvas(post, 0);
      const endCard = vid.endCard ? await renderCanvas(post, 1) : null;
      if (!base.screen) throw new Error("no screen");
      await new Promise((ok, ng) => { if (v.readyState >= 1) ok(); else { v.onloadedmetadata = ok; v.onerror = ng; } });
      const d = v.duration || curVideo.duration;
      const start = Math.min(vid.start || 0, Math.max(0, d - 0.5));
      const endT = Math.min(vid.end == null ? Math.min(d, 30) : vid.end, d);
      const endSec = vid.endCard ? (vid.endSec || 2.5) : 0;
      const total = (endT - start) + endSec;

      const sr = base.screen;
      const drawVideoFrame = () => {
        cx.drawImage(base.canvas, 0, 0);
        const vw = v.videoWidth, vh = v.videoHeight;
        if (vw && vh) {
          cx.save();
          roundRectPath(cx, sr.x, sr.y, sr.w, sr.h, base.radius);
          cx.clip();
          cx.fillStyle = "#000"; cx.fillRect(sr.x, sr.y, sr.w, sr.h);
          const k = Math.max(sr.w / vw, sr.h / vh);
          const sw = sr.w / k, sh = sr.h / k;
          cx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, sr.x, sr.y, sr.w, sr.h);
          cx.restore();
        }
        if (base.notch) { cx.fillStyle = "#14181a"; roundRectPath(cx, base.notch.x, base.notch.y, base.notch.w, base.notch.h, base.notch.h / 2); cx.fill(); }
      };

      let rec = null, chunks = [];
      if (record) {
        const stream = cv.captureStream(30);
        if (ac) {
          try {
            const src = ac.createMediaElementSource(v);
            const dest = ac.createMediaStreamDestination();
            src.connect(dest);
            dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
          } catch (e) {}
        }
        rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 8000000, audioBitsPerSecond: 128000 });
        rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      } else if (ac) {
        // 試しに再生では音をスピーカーから出す
        try { const src = ac.createMediaElementSource(v); src.connect(ac.destination); } catch (e) {}
      }

      v.currentTime = start;
      await new Promise((ok) => { v.onseeked = ok; setTimeout(ok, 1500); });
      drawVideoFrame();
      txt.textContent = record ? "書き出し中…（画面を閉じずにお待ちください）" : "再生中…";
      if (rec) rec.start(250);
      if (ac) await ac.resume().catch(() => {});
      await v.play();

      // 動画の部分
      await new Promise((ok) => {
        const tick = () => {
          if (cancelled) { ok(); return; }
          drawVideoFrame();
          const t = v.currentTime - start;
          bar.style.width = `${Math.min(100, (t / total) * 100)}%`;
          if (v.currentTime >= endT || v.ended) { v.pause(); ok(); return; }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      // 最後の案内
      if (endCard && !cancelled) {
        const t0 = performance.now();
        await new Promise((ok) => {
          const tick = () => {
            if (cancelled) { ok(); return; }
            cx.drawImage(endCard.canvas, 0, 0);
            const t = (performance.now() - t0) / 1000;
            bar.style.width = `${Math.min(100, ((endT - start + t) / total) * 100)}%`;
            if (t >= endSec) { ok(); return; }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }
      v.pause();
      if (ac) ac.close().catch(() => {});
      if (cancelled) { if (rec && rec.state !== "inactive") rec.stop(); return; }
      bar.style.width = "100%";
      if (!rec) {
        txt.textContent = "再生が終わりました。よければ「動画を書き出す」へ進んでください";
        return;
      }
      const blob = await new Promise((ok) => { rec.onstop = () => ok(new Blob(chunks, { type: (rec.mimeType || mime || "video/mp4").split(";")[0] })); rec.stop(); });
      const isMp4 = /mp4/.test(blob.type);
      const usedMime = (rec.mimeType || mime || "").toLowerCase();
      const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|android/i.test(navigator.userAgent);
      const instaOk = isMp4 && (/avc1|h264/.test(usedMime) || (isSafari && !/vp9|vp8|av01/.test(usedMime)));
      const base0 = (cur.title || "pontalelab").replace(/[\\/:*?"<>|\s#]+/g, "_").slice(0, 30);
      const filename = `${base0}.${isMp4 ? "mp4" : "webm"}`;
      const url = URL.createObjectURL(blob);
      $("#sheet-title").textContent = "書き出し完了";
      body.querySelector(".st-reel-view").innerHTML = `<video src="${url}" controls playsinline></video>`;
      txt.textContent = `${fmtSec(total)}の動画ができました（${(blob.size / 1048576).toFixed(1)}MB）`;
      const file = new File([blob], filename, { type: blob.type });
      const claudeDl = window.claude && window.claude.use ? await window.claude.use("downloads").catch(() => null) : null;
      if (claudeDl) {
        const b = document.createElement("button");
        b.className = "st-btn-main";
        b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>動画を保存';
        b.onclick = async () => {
          try { await claudeDl.save({ filename, data: file }); }
          catch (e) { if (!(e && e.code === "declined")) toast(e && e.code === "rate_limited" ? "少し待ってから、もう一度お試しください" : "保存できませんでした"); }
        };
        actions.appendChild(b);
      } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
        const b = document.createElement("button");
        b.className = "st-btn-main";
        b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>動画を保存・共有';
        b.onclick = async () => { try { await navigator.share({ files: [file] }); } catch (e) {} };
        actions.appendChild(b);
      } else {
        const a = document.createElement("a");
        a.className = "st-btn-main"; a.href = url; a.download = filename; a.style.textDecoration = "none";
        a.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>動画をダウンロード';
        actions.appendChild(a);
      }
      if (isStory()) actions.appendChild(storyCopyButton());
      const copy = document.createElement("button");
      copy.className = "st-btn-sub";
      copy.innerHTML = '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>本文をコピー';
      copy.onclick = () => $("#copy-caption").click();
      if (!isStory()) actions.appendChild(copy);
      const note = document.createElement("p");
      note.className = "st-note";
      note.innerHTML = isStory() && instaOk ? STORY_NOTE : instaOk
        ? "Instagramでは「リール」を選んで、この動画を投稿してください。BGMを足す場合は、Instagramの音源を小さめの音量で重ねるのがおすすめです。"
        : "<b>この端末では、Instagram向けの形式（H.264）で書き出せませんでした。</b>投稿できない場合は、iPhoneのClaudeアプリかSafariで書き出してください。";
      actions.appendChild(note);
    } catch (e) {
      console.error(e);
      $("#sheet-title").textContent = "うまくいきませんでした";
      txt.textContent = "動画を読み込めなかったか、この端末では書き出しに対応していない可能性があります。";
    } finally {
      try { v.pause(); v.remove(); } catch (e) {}
      exporting = false;
      $("#export").disabled = false;
    }
  }

  /* ---------- 起動 ---------- */
  if (CFG.useHistory) history.replaceState({ home: true }, "");
  if (CFG.fonts) loadLocalFonts();
  initHome();
})();
