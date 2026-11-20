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
  const POSTS_BASE = "../sns-images/posts/";
  const ZUKAN_DATA = "/tools/zukan-build/data/";
  const FONT_CSS_URL = "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap";
  const DRAFT_KEY = "pl-sns-studio-drafts-v1";
  const ctx = { asset: (src) => src || null };

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
    cta: ["最後の案内", "リンクへの誘導", "arrow"]
  };
  const NEW_SLIDE = {
    cover: () => ({ type: "cover", eyebrow: "ラベル", title: "タイトルを\n**入力**", sub: "" }),
    text: () => ({ type: "text", icon: "sparkle", eyebrow: "ラベル", heading: "見出し", body: "本文を入力" }),
    list: () => ({ type: "list", eyebrow: "ラベル", heading: "見出し", items: [{ icon: "sparkle", title: "項目1", desc: "説明" }, { icon: "leaf", title: "項目2", desc: "説明" }] }),
    game: () => ({ type: "game", index: "", thumb: "/games/thumbs/mushimushi.webp", name: "むしたん", age: "3〜6歳", desc: "説明" }),
    photo: () => ({ type: "photo", eyebrow: "ラベル", heading: "見出し", photo: null, caption: "" }),
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
    wrap.style.width = T.W + "px"; wrap.style.height = T.H + "px";
    wrap.style.transform = `scale(${width / T.W})`;
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
    loadZukan();
  }

  async function loadZukan() {
    const box = $("#zukan");
    try {
      const html = await (await fetch("/zukan/mushi/")).text();
      const ids = [...new Set([...html.matchAll(/href="\/zukan\/(\w+)\/(\w+)\/"/g)].map((m) => m[1] + "/" + m[2]))];
      const items = await Promise.all(ids.map(async (key) => {
        try { return await (await fetch(ZUKAN_DATA + key + ".json")).json(); } catch { return null; }
      }));
      box.innerHTML = "";
      items.filter(Boolean).forEach((z) => {
        const b = document.createElement("button");
        b.className = "st-bug";
        const img = z.images && z.images[0] ? z.images[0].url : "/icons/icon-192.png";
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
      row.querySelector(".st-draft-del").onclick = () => {
        if (!confirm(`「${d.title}」を削除しますか？`)) return;
        drafts = drafts.filter((x) => x.id !== d.id);
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
    history.pushState({ editor: true }, "");
    $("#post-title").value = d.title;
    $("#caption").value = d.post.caption || "";
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
    if (!fromPop) history.back();
  }
  $("#back").onclick = () => closeEditor(false);
  $("#post-title").oninput = (e) => { cur.title = e.target.value || "無題"; saveSoon(); };

  // プレビュー（横スワイプ）
  let previewObserver = null;
  function renderPreview(scrollToIdx) {
    const box = $("#preview");
    box.innerHTML = "";
    const post = cur.post;
    post.slides.forEach((s, i) => {
      const el = document.createElement("div");
      el.className = "st-slide" + (i === idx ? " on" : "");
      el.dataset.i = i;
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
    const m = mini(cur.post, i, el.clientWidth || Math.min(window.innerWidth * 0.74, 350));
    el.appendChild(m);
    fitLater(m, (r) => {
      const old = el.querySelector(".st-warn"); if (old) old.remove();
      if (r.overflow) {
        const w = document.createElement("div"); w.className = "st-warn"; w.textContent = "⚠ 文字が多すぎます。少し短くしてください";
        el.appendChild(w);
      }
    });
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
  document.querySelector(".st-tools").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const s = cur.post.slides;
    const act = b.dataset.act;
    if (act === "left" && idx > 0) { [s[idx - 1], s[idx]] = [s[idx], s[idx - 1]]; idx--; }
    else if (act === "right" && idx < s.length - 1) { [s[idx + 1], s[idx]] = [s[idx], s[idx + 1]]; idx++; }
    else if (act === "dup") { s.splice(idx + 1, 0, clone(s[idx])); idx++; toast("スライドを複製しました"); }
    else if (act === "del") {
      if (s.length <= 1) { toast("最後の1枚は削除できません"); return; }
      if (!confirm(`${idx + 1}枚目を削除しますか？`)) return;
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
    items: ["項目", "items"],
    cross: ["「ないもの」表示（×印をつける）", "toggle"]
  };
  const SCHEMA = {
    cover: ["eyebrow", "title", "sub", "visual"],
    text: ["icon", "eyebrow", "heading", "body", "chips", "image", "badges", "button"],
    list: ["eyebrow", "heading", "items", "cross", "note", "button"],
    game: ["index", "thumb", "name", "age", "desc"],
    photo: ["eyebrow", "heading", "photo", "caption"],
    cta: ["icon", "eyebrow", "heading", "body", "badges", "button", "url"]
  };

  let redrawTimer = 0;
  function changed(structural) {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(() => { redrawCurrent(); updateTodo(); }, 120);
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
    head.innerHTML = `<span class="st-type-badge">${T.icon(tic, 16)}${idx + 1}枚目 ・ ${tname}</span>`;
    panel.appendChild(head);
    (SCHEMA[s.type] || []).forEach((key) => panel.appendChild(field(s, key)));
    const hint = document.createElement("p");
    hint.className = "st-hint";
    hint.innerHTML = "<b>**ことば**</b> で黄色いマーカー、<b>【ことば】</b> は要記入（黄色い枠）、改行もそのまま反映されます。";
    panel.appendChild(hint);
  }

  function field(s, key) {
    const [label, kind] = F[key];
    const wrap = document.createElement("div");
    wrap.className = "st-field";
    if (kind !== "toggle") wrap.innerHTML = `<label>${label}</label>`;

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
    b.innerHTML = `<span class="st-pick-img ${img && img.style === "sticker" ? "sticker" : ""}" style="${src ? `background-image:url('${src}')` : ""}">${src ? "" : T.icon("camera", 24)}</span>
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
        b.innerHTML = `<div style="overflow:hidden"><img src="${a.src}" alt="" loading="lazy"></div><span>${esc(a.name)}</span>`;
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

  /* ---------- ボトムシート ---------- */
  function openSheet(title, bodyEl) {
    $("#sheet-title").textContent = title;
    const body = $("#sheet-body"); body.innerHTML = ""; body.appendChild(bodyEl);
    $("#sheet").hidden = false; $("#sheet-back").hidden = false;
  }
  function closeSheet() { $("#sheet").hidden = true; $("#sheet-back").hidden = true; }
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
  async function fontEmbedCss(text) {
    if (fontCssText === null) {
      try { fontCssText = await (await fetch(FONT_CSS_URL)).text(); } catch { fontCssText = ""; }
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

  async function renderPng(post, i) {
    const stage = $("#stage");
    stage.innerHTML = T.renderFrame(post.slides[i], i, post.slides.length, post, ctx);
    const frame = stage.firstElementChild;
    await Promise.all([...frame.querySelectorAll("img")].map((im) => im.decode ? im.decode().catch(() => {}) : null));
    if (document.fonts) await document.fonts.ready;
    const fit = T.fitFrame(frame);
    const opts = { width: T.W, height: T.H, pixelRatio: 1, cacheBust: false, fontEmbedCSS: await fontEmbedCss(frame.textContent) };
    // iOS Safariは1回目に画像が抜けることがあるため、2回描画する
    if (isIOS) await window.htmlToImage.toCanvas(frame, opts);
    const canvas = await window.htmlToImage.toCanvas(frame, opts);
    const blob = await new Promise((ok) => canvas.toBlob(ok, "image/png"));
    stage.innerHTML = "";
    return { blob, fit };
  }

  $("#export").onclick = async () => {
    if (exporting) return;
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
      const canShare = navigator.canShare && navigator.canShare({ files });
      if (canShare) {
        const share = document.createElement("button");
        share.className = "st-btn-main";
        share.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>写真に保存・Instagramで共有';
        share.onclick = async () => {
          try { await navigator.share({ files }); } catch (e) { if (e && e.name !== "AbortError") toast("共有できませんでした"); }
        };
        actions.appendChild(share);
      }
      const dl = document.createElement("button");
      dl.className = "st-btn-sub";
      dl.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>1枚ずつダウンロード';
      dl.onclick = async () => {
        for (const a of results.querySelectorAll("a")) { a.click(); await new Promise((r) => setTimeout(r, 350)); }
      };
      actions.appendChild(dl);
      const copy = document.createElement("button");
      copy.className = "st-btn-sub";
      copy.innerHTML = '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>本文をコピー';
      copy.onclick = () => $("#copy-caption").click();
      actions.appendChild(copy);
      const note = document.createElement("p");
      note.className = "st-note";
      note.innerHTML = canShare
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

  /* ---------- 起動 ---------- */
  history.replaceState({ home: true }, "");
  initHome();
})();
