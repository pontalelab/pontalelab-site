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
    "nav:zukan":    "昆虫図鑑",
    "nav:about":    "Pontalelabについて",
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
    "game2:age":  "対象年齢の目安：3〜6歳",
    "game2:zukanLink": "図鑑で虫をもっと知る →",

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
    "footer:zukan":   "昆虫図鑑",
    "footer:parents": "おうちの人へ",
    "footer:support": "応援する",
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
    "game4:age":     "対象年齢の目安：4〜7歳",
    "game5:name":    "あみあみうみ",
    "game5:desc":    "あみで魚をすくって図鑑を集めよう",
    "game5:btn":     "遊ぶ →",
    "game5:age":     "対象年齢の目安：3〜6歳",
    "game6:name":    "けんけんちず",
    "game6:desc":    "シルエットを見てどこの県か当てよう",
    "game6:btn":     "遊ぶ →",
    "game6:age":     "対象年齢の目安：4〜8歳",
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
    "about-page:p5":    "ご意見・ご要望はお気軽にお問い合わせフォームからご連絡ください。",
    "about-page:contactLink": "お問い合わせフォームを開く →",

    /* --- Parents Page --- */
    "meta:title:parents": "おうちの人へ | Pontalelab",
    "parents-page:h1":    "おうちの人へ",
    "parents-page:lead":  "子どもと一緒に、ぽんたーれらぼを楽しんでください",
    "parents-page:intro": "ぽんたーれらぼは、子どもたちが遊びながら、生きものや自然に興味を持てるサイトです。",
    "parents-page:h2-1":  "🐞 まずは一緒に遊んでみる",
    "parents-page:p1":    "お子さんが興味を持ったものを、一緒に楽しんでみてください。",
    "parents-page:h2-2":  "🌳 本物の生きものも探してみる",
    "parents-page:p2":    "サイトで見つけた生きものを、今度は公園や外で探してみるのもおすすめです。",
    "parents-page:h2-3":  "🔎 「なんだろう？」を一緒に楽しむ",
    "parents-page:p3":    "わからないことがあったら、図鑑で調べたり、実際に観察したり。",
    "parents-page:p4":    "子どもの「なんだろう？」を、次の発見につなげてみてください。",
    "parents-page:h2-4":  "🌱 ぽんたーれらぼから",
    "parents-page:p5":    "画面の中だけではなく、ぽんたーれらぼをきっかけに、子どもが外の世界にも興味を持ってくれたらうれしいです。",
    "parents-page:p6":    "ぜひ、お子さんと一緒に遊んでみてください。",
    "parents-page:gamesLink":   "ゲーム一覧を見る →",
    "parents-page:supportLink": "ぽんたーれらぼを応援する →",

    /* --- Support Page --- */
    "meta:title:support": "ぽんたーれらぼを応援する | Pontalelab",
    "support-page:h1":    "❤️ ぽんたーれらぼを応援する",
    "support-page:lead":  "子どもたちの「なんだろう？」を、もっと。",
    "support-page:p1":    "ぽんたーれらぼでは、子どもたちが遊びながら、生きものや自然に興味を持てるコンテンツを作っています。",
    "support-page:h2-1":  "これからも、少しずつ増やしていきます",
    "support-page:li1":   "🐞 新しい生きもの",
    "support-page:li2":   "🎮 新しいゲーム",
    "support-page:li3":   "📚 図鑑や学べるコンテンツ",
    "support-page:h2-2":  "🌱 応援していただけるとうれしいです",
    "support-page:p2":    "ぽんたーれらぼは、これからも無料で楽しめるサイトとして続けていきたいと考えています。",
    "support-page:p3":    "現在、応援の仕組みを準備しています。",
    "support-page:p4":    "「これからも続けてほしい」と思っていただけたら、ぜひ応援してください。",
    "support-page:p5":    "みなさんの応援が、新しいコンテンツを作る力になります。",
    "support-page:comingSoon": "応援する（準備中）",
    "support-page:h2-3":  "🐞 まずは遊んでみてください",
    "support-page:p6":    "お子さんと一緒に遊んで、楽しんでもらえること。それも、ぽんたーれらぼにとって大切な応援です。",
    "support-page:p7":    "これからも、ぽんたーれらぼをよろしくお願いします。",
    "support-page:gamesLink": "ゲーム一覧を見る →",

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
    "contact:submit":       "送信する",
    "contact:note":         "いただいた内容は、運営者へ直接メールでお送りします。",
    "contact:sending":      "送信中…",
    "contact:success":      "お問い合わせを送信しました。ありがとうございました。",
    "contact:error":        "送信に失敗しました。しばらくしてから、もう一度お試しください。",
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
    "nav:zukan":   "Insect Encyclopedia",
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
    "game2:age":  "Recommended age: 3–6",
    "game2:zukanLink": "Learn more in the encyclopedia →",

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
    "footer:zukan":   "Insect Encyclopedia",
    "footer:parents": "For Parents",
    "footer:support": "Support Us",
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
    "game4:age":     "Recommended age: 4–7",
    "game5:name":    "Amiami Umi",
    "game5:desc":    "Scoop up fish with your net and collect them all!",
    "game5:btn":     "Play →",
    "game5:age":     "Recommended age: 3–6",
    "game6:name":    "Ken-Ken-Chizu",
    "game6:desc":    "Guess the prefecture from its silhouette!",
    "game6:btn":     "Play →",
    "game6:age":     "Recommended age: 4–8",
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
    "about-page:p5":    "Questions and ideas are always welcome — please use our contact form.",
    "about-page:contactLink": "Open the contact form →",

    /* --- Parents Page --- */
    "meta:title:parents": "For Parents | Pontalelab",
    "parents-page:h1":    "For Parents",
    "parents-page:lead":  "Enjoy Pontalelab together with your child",
    "parents-page:intro": "Pontalelab is a site where children can discover an interest in living things and nature through play.",
    "parents-page:h2-1":  "🐞 Start by playing together",
    "parents-page:p1":    "Try enjoying whatever catches your child's interest, together.",
    "parents-page:h2-2":  "🌳 Look for the real thing, too",
    "parents-page:p2":    "We recommend taking what you find on the site and looking for it at a park or outdoors.",
    "parents-page:h2-3":  "🔎 Enjoy the \"why?\" together",
    "parents-page:p3":    "When something's unclear, look it up in the encyclopedia or go observe it for real.",
    "parents-page:p4":    "Try turning your child's \"why?\" into their next discovery.",
    "parents-page:h2-4":  "🌱 From Pontalelab",
    "parents-page:p5":    "We'd love for Pontalelab to spark curiosity about the world beyond the screen, too.",
    "parents-page:p6":    "We hope you'll enjoy it together with your child.",
    "parents-page:gamesLink":   "See all games →",
    "parents-page:supportLink": "Support Pontalelab →",

    /* --- Support Page --- */
    "meta:title:support": "Support Pontalelab | Pontalelab",
    "support-page:h1":    "❤️ Support Pontalelab",
    "support-page:lead":  "More of your child's \"why?\" moments.",
    "support-page:p1":    "At Pontalelab, we're building content that helps children discover an interest in living things and nature through play.",
    "support-page:h2-1":  "We'll keep adding, little by little",
    "support-page:li1":   "🐞 New creatures",
    "support-page:li2":   "🎮 New games",
    "support-page:li3":   "📚 Encyclopedia and learning content",
    "support-page:h2-2":  "🌱 We'd love your support",
    "support-page:p2":    "We want Pontalelab to keep being a site families can enjoy for free.",
    "support-page:p3":    "We're currently preparing a way for you to support us.",
    "support-page:p4":    "If you'd like to see us keep going, we'd really appreciate your support.",
    "support-page:p5":    "Your support helps us create new content.",
    "support-page:comingSoon": "Support us (coming soon)",
    "support-page:h2-3":  "🐞 First, come play",
    "support-page:p6":    "Playing together and having fun with your child — that's meaningful support for Pontalelab too.",
    "support-page:p7":    "Thank you for continuing to enjoy Pontalelab with us.",
    "support-page:gamesLink": "See all games →",

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
    "contact:submit":       "Send",
    "contact:note":         "Your message will be sent directly to us by email.",
    "contact:sending":      "Sending…",
    "contact:success":      "Your message has been sent. Thank you!",
    "contact:error":        "Something went wrong. Please try again in a moment.",
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
   Contact Form → Supabase Edge Function
   （受信先メールアドレス・送信用APIキーはSupabase側の環境変数にのみ存在し、
   このリポジトリ・フロントエンドのコードには一切含まれない）
   =========================== */

const CONTACT_FUNCTION_URL = "https://gzkzsxumeffesfvydfac.supabase.co/functions/v1/contact-form";

function initContactForm() {
  const form   = document.getElementById("contact-form");
  const status = document.getElementById("cf-status");
  if (!form) return;

  const setStatus = (key, variant) => {
    if (!status) return;
    status.textContent = i18n[currentLang]?.[key] ?? "";
    status.className = `form-status is-visible form-status--${variant}`;
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name      = (document.getElementById("cf-name")?.value    || "").trim();
    const email     = (document.getElementById("cf-email")?.value   || "").trim();
    const type      = (document.getElementById("cf-type")?.value    || "");
    const message   = (document.getElementById("cf-message")?.value || "").trim();
    const website   = (document.getElementById("cf-website")?.value || ""); // honeypot

    if (submitBtn) submitBtn.disabled = true;
    setStatus("contact:sending", "success");

    try {
      const res = await fetch(CONTACT_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message, website }),
      });

      if (!res.ok) throw new Error(`request failed: ${res.status}`);

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "unknown error");

      setStatus("contact:success", "success");
      form.reset();
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setStatus("contact:error", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
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
