/* ============================================================
   Pontalelab — main.js
   - Bilingual (ja / en) language switching
   - Persists preference in localStorage
   - Works on every page via data-i18n attributes
   ============================================================ */

/* ===========================
   Translation Dictionary
   =========================== */
const i18n = {
  ja: {
    /* --- Meta --- */
    "meta:title:home":    "Pontalelab - 親子向けデジタル研究所",
    "meta:title:games":   "ゲーム一覧 | Pontalelab",
    "meta:title:about":   "Pontalelabについて",
    "meta:title:privacy": "プライバシーポリシー | Pontalelab",
    "meta:title:contact": "お問い合わせ | Pontalelab",

    /* --- Header / Nav --- */
    "lang:btn":     "English",
    "nav:games":    "ゲーム一覧",
    "nav:about":    "について",
    "nav:contact":  "お問い合わせ",

    /* --- Hero (top page) --- */
    "hero:title":   "Pontalelab",
    "hero:tagline": "遊びながら発見する、親子向けデジタル研究所",
    "hero:cta":     "ゲーム一覧を見る →",

    /* --- Featured Games --- */
    "featured:heading": "注目のゲーム",
    "game1:name": "まぜまぜ研究室",
    "game1:desc": "いろいろな素材を組み合わせて発見を楽しもう",
    "game1:btn":  "遊ぶ →",
    "game2:name": "むしたん",
    "game2:desc": "虫を探して図鑑を集めよう",
    "game2:btn":  "遊ぶ →",

    /* --- Skills --- */
    "skills:heading": "遊びながら育つ力",
    "skill1:name": "観察する",
    "skill1:desc": "自然の変化に気づき、ちがいを見つける力を育む",
    "skill2:name": "考える",
    "skill2:desc": "「なぜ？」「どうして？」を大切にする力を育む",
    "skill3:name": "つくる",
    "skill3:desc": "アイデアをかたちにする力を育む",

    /* --- Parents --- */
    "parents:heading": "保護者の方へ",
    "parents:item1": "会員登録不要",
    "parents:item2": "個人情報入力不要",
    "parents:item3": "課金なし",
    "parents:item4": "チャット機能なし",
    "parents:item5": "ブラウザだけで遊べる",

    /* --- Research Log --- */
    "log:heading": "研究記録",
    "log1:date":  "2026年05月20日",
    "log1:title": "むしたん v1.0 公開",
    "log1:text":  "虫の図鑑収集ゲームの初版をリリースしました。10種類の虫を探して集めよう！",
    "log2:date":  "2026年04月15日",
    "log2:title": "まぜまぜ研究室 ベータ版",
    "log2:text":  "素材を組み合わせる実験ゲームのベータ版を公開。新しい発見があるかも？",
    "log3:date":  "2026年04月01日",
    "log3:title": "Pontalelab オープン！",
    "log3:text":  "親子向けデジタル研究所「Pontalelab」をオープンしました。これからもいろんなゲームを追加していきます！",

    /* --- About (top page snippet) --- */
    "about:heading": "Pontalelabについて",
    "about:text":    "生き物や音や発見をテーマにした親子向けデジタル研究所です。子どもが自然に好奇心を持ち、親子で一緒に楽しめるゲームを作っています。",

    /* --- Footer --- */
    "footer:tagline": "親子で楽しむ、発見の研究所",
    "footer:games":   "ゲーム一覧",
    "footer:about":   "Pontalelabについて",
    "footer:privacy": "プライバシーポリシー",
    "footer:contact": "お問い合わせ",
    "footer:copy":    "© 2026 Pontalelab",

    /* --- Games Page --- */
    "games:heading": "ゲーム一覧",
    "games:desc":    "親子で楽しめる無料ブラウザゲーム",
    "game4:name":    "うみのひらがな",
    "game4:desc":    "海の生き物と一緒にひらがなを学ぼう",
    "game4:btn":     "遊ぶ →",
    "game3:name":    "ポコポコ楽団",
    "game3:desc":    "リズムに合わせて楽器を鳴らして音楽を楽しもう",
    "game3:badge":   "開発中",
    "game3:btn":     "もうすぐ！",

    /* --- About Page --- */
    "about-page:h1":    "Pontalelabについて",
    "about-page:lead":  "生き物・音・発見をテーマにした親子向けデジタル研究所",
    "about-page:h2-1":  "Pontalelabとは",
    "about-page:p1":    "Pontalelabは、3歳〜10歳の子どもと保護者が一緒に楽しめる無料のブラウザゲームを提供する、デジタル研究所です。",
    "about-page:p2":    "自然観察センターや科学館のような「発見の楽しさ」をテーマに、派手さよりも「じっくり楽しめる体験」を大切に作っています。",
    "about-page:h2-2":  "コンセプト",
    "about-page:p3":    "ゲームを通じて「観察する・考える・つくる」という力を自然に育むことを目指しています。難しいルールはなく、画面をタップするだけで遊び始められます。",
    "about-page:h2-3":  "安心して使えるサイト",
    "about-page:p4":    "会員登録・個人情報の入力・課金・チャット機能はすべてありません。ブラウザだけで、すぐに遊べます。",
    "about-page:h2-4":  "お問い合わせ",
    "about-page:p5":    "ご意見・ご要望は pontalelab@gmail.com までお気軽にどうぞ。",

    /* --- Privacy Page --- */
    "privacy:h1":   "プライバシーポリシー",
    "privacy:lead": "Pontalelabにおける個人情報の取り扱いについて説明します。",

    /* --- Contact Page --- */
    "contact:h1":           "お問い合わせ",
    "contact:lead":         "ご質問・ご意見・ご要望はこちらからどうぞ",
    "contact:label:name":   "お名前",
    "contact:label:email":  "メールアドレス",
    "contact:label:type":   "お問い合わせ種別",
    "contact:label:msg":    "内容",
    "contact:type:general": "一般的なご質問",
    "contact:type:bug":     "不具合の報告",
    "contact:type:request": "ご要望・アイデア",
    "contact:type:other":   "その他",
    "contact:submit":       "メールで送信する",
    "contact:note":         "送信後、お使いのメールアプリが開きます。",
    "contact:alt":          "または直接メールでご連絡ください：",
  },

  en: {
    /* --- Meta --- */
    "meta:title:home":    "Pontalelab — A Digital Lab for Families",
    "meta:title:games":   "Games | Pontalelab",
    "meta:title:about":   "About | Pontalelab",
    "meta:title:privacy": "Privacy Policy | Pontalelab",
    "meta:title:contact": "Contact | Pontalelab",

    /* --- Header / Nav --- */
    "lang:btn":    "日本語",
    "nav:games":   "Games",
    "nav:about":   "About",
    "nav:contact": "Contact",

    /* --- Hero --- */
    "hero:title":   "Pontalelab",
    "hero:tagline": "Play, Discover, and Explore — A Digital Lab for Families",
    "hero:cta":     "See All Games →",

    /* --- Featured Games --- */
    "featured:heading": "Featured Games",
    "game1:name": "Mix Mix Lab",
    "game1:desc": "Combine different materials and enjoy the thrill of discovery!",
    "game1:btn":  "Play →",
    "game2:name": "Mushitan",
    "game2:desc": "Search for insects and build your field guide collection!",
    "game2:btn":  "Play →",

    /* --- Skills --- */
    "skills:heading": "Skills Through Play",
    "skill1:name": "Observe",
    "skill1:desc": "Notice changes in nature and spot the differences",
    "skill2:name": "Think",
    "skill2:desc": "Cherish curiosity and keep asking why",
    "skill3:name": "Create",
    "skill3:desc": "Turn your ideas into something real",

    /* --- Parents --- */
    "parents:heading": "For Parents",
    "parents:item1": "No account needed",
    "parents:item2": "No personal information required",
    "parents:item3": "Completely free",
    "parents:item4": "No chat features",
    "parents:item5": "Plays right in your browser",

    /* --- Research Log --- */
    "log:heading": "Research Log",
    "log1:date":  "May 20, 2026",
    "log1:title": "Mushitan v1.0 Released",
    "log1:text":  "The first version of Bug Hunt is live! Search and collect 10 different insects.",
    "log2:date":  "April 15, 2026",
    "log2:title": "Mix Mix Lab Beta",
    "log2:text":  "Beta release of our material-combining experiment game. What will you discover?",
    "log3:date":  "April 1, 2026",
    "log3:title": "Pontalelab is Open!",
    "log3:text":  "Welcome to Pontalelab, a digital lab for families! We'll keep adding new games.",

    /* --- About (snippet) --- */
    "about:heading": "About Pontalelab",
    "about:text":    "A family-oriented digital lab themed around living things, sounds, and discovery. We create games that spark natural curiosity and invite parents and children to explore together.",

    /* --- Footer --- */
    "footer:tagline": "A Discovery Lab for Families",
    "footer:games":   "Games",
    "footer:about":   "About",
    "footer:privacy": "Privacy Policy",
    "footer:contact": "Contact",
    "footer:copy":    "© 2026 Pontalelab",

    /* --- Games Page --- */
    "games:heading": "Games",
    "games:desc":    "Free browser games for the whole family",
    "game4:name":    "Umi no Hiragana",
    "game4:desc":    "Learn hiragana with ocean creatures!",
    "game4:btn":     "Play →",
    "game3:name":    "Pokopoko Band",
    "game3:desc":    "Play instruments to the rhythm and create your own music!",
    "game3:badge":   "Coming Soon",
    "game3:btn":     "Coming Soon!",

    /* --- About Page --- */
    "about-page:h1":    "About Pontalelab",
    "about-page:lead":  "A digital lab for families — themed around living things, sounds, and discovery",
    "about-page:h2-1":  "What is Pontalelab?",
    "about-page:p1":    "Pontalelab provides free browser games for children aged 3–10 and their parents to enjoy together.",
    "about-page:p2":    "Inspired by nature centers and science museums, we focus on the joy of discovery rather than flashy effects — crafting experiences you can savour together.",
    "about-page:h2-2":  "Our Concept",
    "about-page:p3":    "Through play, we aim to naturally nurture three abilities: observing, thinking, and creating. No complex rules — just tap the screen and start exploring.",
    "about-page:h2-3":  "A Safe Site for Families",
    "about-page:p4":    "No sign-ups, no personal data, no payments, no chat. Everything runs in your browser — play begins instantly.",
    "about-page:h2-4":  "Get in Touch",
    "about-page:p5":    "Questions and ideas are welcome at pontalelab@gmail.com.",

    /* --- Privacy Page --- */
    "privacy:h1":   "Privacy Policy",
    "privacy:lead": "How Pontalelab handles information about our visitors.",

    /* --- Contact Page --- */
    "contact:h1":           "Contact Us",
    "contact:lead":         "Questions, feedback, or ideas? We'd love to hear from you.",
    "contact:label:name":   "Your Name",
    "contact:label:email":  "Email Address",
    "contact:label:type":   "Category",
    "contact:label:msg":    "Message",
    "contact:type:general": "General Question",
    "contact:type:bug":     "Bug Report",
    "contact:type:request": "Feature Request",
    "contact:type:other":   "Other",
    "contact:submit":       "Send via Email",
    "contact:note":         "Clicking submit will open your email app.",
    "contact:alt":          "Or email us directly at:",
  }
};

/* ===========================
   Language Switcher
   =========================== */
let currentLang = localStorage.getItem("plab-lang") || "ja";

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("plab-lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = i18n[lang]?.[key];
    if (val !== undefined) el.textContent = val;
  });

  /* Update <option> elements (select boxes) */
  document.querySelectorAll("[data-i18n-val]").forEach(el => {
    const key = el.dataset.i18nVal;
    const val = i18n[lang]?.[key];
    if (val !== undefined) el.textContent = val;
  });

  /* Update page title via data-page attribute on <body> */
  const page = document.body.dataset.page;
  const titleKey = "meta:title:" + page;
  const title = i18n[lang]?.[titleKey];
  if (title) document.title = title;
}

/* ===========================
   Contact Form → mailto
   =========================== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name    = (document.getElementById("cf-name")?.value    || "").trim();
    const email   = (document.getElementById("cf-email")?.value   || "").trim();
    const type    = (document.getElementById("cf-type")?.value    || "");
    const message = (document.getElementById("cf-message")?.value || "").trim();

    const subject = encodeURIComponent(
      currentLang === "ja"
        ? `[Pontalelab] お問い合わせ (${type})`
        : `[Pontalelab] Contact (${type})`
    );
    const body = encodeURIComponent(
      currentLang === "ja"
        ? `お名前: ${name}\nメール: ${email}\n\n${message}`
        : `Name: ${name}\nEmail: ${email}\n\n${message}`
    );

    window.location.href = `mailto:pontalelab@gmail.com?subject=${subject}&body=${body}`;
  });
}

/* ===========================
   Init
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  applyLang(currentLang);

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      applyLang(currentLang === "ja" ? "en" : "ja");
    });
  });

  initContactForm();
});
