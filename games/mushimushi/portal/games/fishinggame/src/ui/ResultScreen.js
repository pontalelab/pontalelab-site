/** ゲーム終了後のリザルト画面 */

import { stageMaster } from "../data/stageMaster.js";
import { fishMaster }  from "../data/fishMaster.js";

/**
 * @param {HTMLElement} container
 * @param {object}      state      - 終了直後のゲーム状態
 * @param {object}      saveData   - 保存後の最新データ
 * @param {Function}    onHome     - ホームへ戻るコールバック
 */
export function renderResultScreen(container, state, saveData, onHome) {
  const level    = state.currentSeaLevel;
  const newLevel = saveData.currentSeaLevel;
  const levelCfg = stageMaster.levels.find(l => l.level === newLevel) ?? stageMaster.levels[0];
  const nextCfg  = stageMaster.levels.find(l => l.level === newLevel + 1);

  const leveledUp = newLevel > level;
  const ptGained  = state.sessionPointGained;
  const totalPt   = saveData.seaPoint;

  // 捕まえた魚リスト
  const caughtList = state.sessionCaughtFishIds.map(id => {
    const master = fishMaster.find(f => f.id === id);
    const count  = state.sessionCatchCounts[id] ?? 0;
    return master ? { master, count } : null;
  }).filter(Boolean);

  const progress = nextCfg
    ? Math.min(1, (totalPt - levelCfg.requiredPoint) / (nextCfg.requiredPoint - levelCfg.requiredPoint))
    : 1;

  const fishGridHtml = caughtList.length > 0
    ? caughtList.map(({ master, count }) => `
        <div class="caught-fish-item">
          <div class="caught-fish-emoji">${master.emoji}</div>
          <div class="caught-fish-name">${master.name}</div>
          <div class="caught-fish-count">×${count}</div>
        </div>
      `).join("")
    : `<p style="color:#8ac;font-size:0.85rem;">今回は魚を捕まえられなかったよ</p>`;

  container.innerHTML = `
    <div class="result-container">
      <div class="result-title">🎉 結果発表！</div>

      ${caughtList.length > 0 ? `
        <div class="result-section">
          <h3>🐟 捕まえた魚</h3>
          <div class="caught-fish-grid">${fishGridHtml}</div>
        </div>
      ` : ""}

      <div class="result-section">
        <h3>🧹 ゴミかたづけ</h3>
        <div class="trash-count">${state.sessionTrashCount} 個のゴミをかたづけた！</div>
        <div class="point-gained">＋ ${ptGained} pt</div>
      </div>

      <div class="result-section">
        <h3>🌊 海の状態</h3>
        <div class="level-progress-area">
          <div class="level-labels">
            <span>Lv${newLevel}：${levelCfg.name}</span>
            <span>${totalPt} pt${nextCfg ? ` / ${nextCfg.requiredPoint}` : ""}</span>
          </div>
          <div class="level-bar-bg">
            <div class="level-bar-fill" id="result-bar" style="width:0%"></div>
          </div>
          ${nextCfg
            ? `<div style="font-size:0.75rem;color:#8ac;margin-top:4px">次のレベルまで：あと ${nextCfg.requiredPoint - totalPt} pt</div>`
            : `<div style="color:#0ff;font-size:0.85rem;margin-top:4px">✨ 最高レベル達成！</div>`
          }
        </div>
        ${leveledUp ? `<div class="levelup-badge">⬆️ レベルアップ！ ${levelCfg.name} になった！</div>` : ""}
      </div>

      <div class="result-btn-wrap">
        <button id="btn-home" class="btn-primary">🏠 ホームへ</button>
      </div>
    </div>
  `;

  // バーをアニメーション
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const bar = document.getElementById("result-bar");
      if (bar) bar.style.width = `${Math.round(progress * 100)}%`;
    });
  });

  document.getElementById("btn-home").addEventListener("click", onHome);
}
