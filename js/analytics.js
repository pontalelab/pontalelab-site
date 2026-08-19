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
   「おうちの人へ」「応援する」への導線がどこから、どれだけ
   クリックされているかを把握するための汎用トラッキング。
   main.js を読み込まないページ（図鑑ページ等）でも動くよう、
   全ページ共通のこのファイルに実装する。

   使い方：計測したい要素に以下の data 属性を付与する
     data-ga-event    : 送信するイベント名（例: "cta_click"）
     data-ga-cta       : （任意）cta パラメータの値
     data-ga-location  : （任意）location パラメータの値
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-ga-event]").forEach((el) => {
    el.addEventListener("click", () => {
      if (typeof window.gtag !== "function") return;
      const eventName = el.dataset.gaEvent;
      const params = {};
      if (el.dataset.gaCta)      params.cta = el.dataset.gaCta;
      if (el.dataset.gaLocation) params.location = el.dataset.gaLocation;
      window.gtag("event", eventName, params);
    });
  });
});
