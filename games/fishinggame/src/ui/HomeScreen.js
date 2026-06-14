/** ホーム画面の描画 */

import { stageMaster } from "../data/stageMaster.js";

/**
 * @param {HTMLElement} container
 * @param {object}      saveData
 * @param {Function}    onStart  - ゲーム開始
 * @param {Function}    onBook   - 図鑑
 * @param {Function}    onReset  - 海をリセット
 */
export function renderHomeScreen(container, saveData, onStart, onBook, onReset) {
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
    <div class="home-title">🎣 魚とり</div>
    <div class="home-subtitle">海をきれいにしよう！</div>

    <div class="home-sea-card">
      <div class="sea-level-label">現在の海</div>
      <div class="sea-level-name">Lv${level}：${levelConfig.name}</div>
      <div class="sea-emoji-row">${emoji}</div>
      <div class="sea-point-label">海ポイント</div>
      <div class="sea-point-value">${points} pt${nextConfig ? ` / ${nextConfig.requiredPoint} pt` : " (MAX)"}</div>
      ${nextConfig ? `
        <div class="home-point-bar-bg">
          <div class="home-point-bar-fill" style="width:${progressPct}%"></div>
        </div>
      ` : `<div style="color:#0ff;font-size:0.85rem;margin-top:0.4rem">✨ 最高レベル達成！</div>`}
    </div>

    <div class="home-btn-wrap">
      <button id="btn-start" class="btn-primary">🎣 はじめる！</button>
      <button id="btn-book"  class="btn-secondary">📖 図鑑をみる</button>
      <button id="btn-reset" class="btn-danger">🔄 海をリセット</button>
    </div>
  `;

  document.getElementById("btn-start").addEventListener("click", onStart);
  document.getElementById("btn-book").addEventListener("click", onBook);
  document.getElementById("btn-reset").addEventListener("click", onReset);
}
