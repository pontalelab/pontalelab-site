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
