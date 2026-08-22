/** ホーム画面の描画 */

import { stageMaster } from "../data/stageMaster.js";

const APP_VERSION = "0.0.1";

/**
 * @param {HTMLElement} container
 * @param {object}      saveData
 * @param {Function}    onStart   - ゲーム開始
 * @param {Function}    onBook    - ずかん
 * @param {Function}    onReset   - うみをリセット
 * @param {Function}    onCleanup - うみをそうじする（新モード）
 */
export function renderHomeScreen(container, saveData, onStart, onBook, onReset, onCleanup) {
  const level       = saveData.currentSeaLevel;
  const points      = saveData.seaPoint;
  const levelConfig = stageMaster.levels.find(l => l.level === level) ?? stageMaster.levels[0];
  const nextConfig  = stageMaster.levels.find(l => l.level === level + 1);

  const progress    = nextConfig
    ? Math.min(1, (points - levelConfig.requiredPoint) / (nextConfig.requiredPoint - levelConfig.requiredPoint))
    : 1;
  const progressPct = Math.round(progress * 100);

  const levelEmojis = { 1: "🌊💀", 2: "🌊🐟", 3: "🌊🌺🐠" };
  const emoji       = levelEmojis[level] ?? "🌊";

  container.innerHTML = `
    <a href="https://pontalelab.com/games/" class="btn-back">← もどる</a>

    <div class="home-title">🎣 あみあみ うみ</div>
    <div class="home-subtitle">うみをきれいにして　おさかなをつかまえよう</div>

    <div class="home-sea-card">
      <div class="sea-level-label">いまの うみ</div>
      <div class="sea-level-name">Lv${level}：${levelConfig.name}</div>
      <div class="sea-emoji-row">${emoji}</div>
      <div class="sea-point-label">うみぽいんと</div>
      <div class="sea-point-value">${points} pt${nextConfig ? ` / ${nextConfig.requiredPoint} pt` : " (MAX)"}</div>
      ${nextConfig ? `
        <div class="home-point-bar-bg">
          <div class="home-point-bar-fill" style="width:${progressPct}%"></div>
        </div>
      ` : `<div style="color:#0ff;font-size:0.85rem;margin-top:0.4rem">✨ さいこうレベルたっせい！</div>`}
    </div>

    <div class="home-btn-wrap">
      <button id="btn-start"   class="btn-primary">🎣 はじめる！</button>
      <button id="btn-cleanup" class="btn-cleanup">🧹 うみをそうじする</button>
      <button id="btn-book"    class="btn-secondary">📖 ずかんをみる</button>
      <button id="btn-reset"   class="btn-danger">🔄 うみをリセット</button>
    </div>

    <div class="home-version">v${APP_VERSION}</div>
  `;

  document.getElementById("btn-start").addEventListener("click", onStart);
  document.getElementById("btn-cleanup").addEventListener("click", onCleanup);
  document.getElementById("btn-book").addEventListener("click", onBook);
  document.getElementById("btn-reset").addEventListener("click", onReset);
}
