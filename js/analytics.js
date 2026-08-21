/* ============================================================
   Pontalelab — analytics.js
   Google Analytics 4 (GA4) の読み込み設定。
   ============================================================ */
(function () {
  const GA_MEASUREMENT_ID = "G-YQCSGSWJXZ";

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("XXXXXXXXXX") !== -1) {
    console.info("[Pontalelab] GA4測定IDが未設定のため、アクセス解析は無効です。js/analytics.js を参照してください。");
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
})();

/* ============================================================
   カスタムイベント：CTAクリック計測
   「おうちの人へ」「応援する」への導線や、「今日のなんで」の
   選択肢クリックなど、どこでどれだけクリックされているかを
   把握するための汎用トラッキング。
   main.js を読み込まないページ（図鑑ページ等）でも動くよう、
   全ページ共通のこのファイルに実装する。

   要素にaddEventListenerする方式ではなく、documentへの
   イベント委譲（クリック時にclosest()で祖先をたどる）にしている。
   これにより、ページ読み込み後にJavaScriptで動的に追加された
   要素（例：js/why.jsがSupabaseから取得して描画するボタン）でも、
   追加のバインド処理なしでそのまま計測対象になる。

   使い方：計測したい要素に以下の data 属性を付与する
     data-ga-event    : 送信するイベント名（例: "cta_click"）
     data-ga-cta       : （任意）cta パラメータの値
     data-ga-location  : （任意）location パラメータの値
   ============================================================ */
document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-ga-event]");
  if (!el) return;
  if (typeof window.gtag !== "function") return;

  const eventName = el.dataset.gaEvent;
  const params = {};
  if (el.dataset.gaCta)      params.cta = el.dataset.gaCta;
  if (el.dataset.gaLocation) params.location = el.dataset.gaLocation;
  window.gtag("event", eventName, params);
});
