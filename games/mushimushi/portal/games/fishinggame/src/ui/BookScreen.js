/** 図鑑画面 */

import { fishMaster } from "../data/fishMaster.js";

const RARITY_LABELS = {
  common:    "★ コモン",
  uncommon:  "★★ アンコモン",
  rare:      "★★★ レア",
  superRare: "★★★★ スーパーレア",
};

/**
 * @param {HTMLElement} container
 * @param {object}      saveData
 * @param {Function}    onBack
 */
export function renderBookScreen(container, saveData, onBack) {
  const collected = saveData.collectedFishIds ?? [];
  const counts    = saveData.fishCatchCounts  ?? {};

  const cardsHtml = fishMaster.map(fish => {
    const caught  = collected.includes(fish.id);
    const count   = counts[fish.id] ?? 0;
    const locked  = !caught;
    return `
      <div class="book-card ${locked ? "locked" : ""}"
           data-fish-id="${fish.id}"
           data-locked="${locked}">
        <div class="book-card-emoji">${locked ? "❓" : fish.emoji}</div>
        <div class="book-card-name">${locked ? "???" : fish.name}</div>
        <div class="book-card-catch">${caught ? `${count}回` : "未発見"}</div>
        <div class="book-card-rarity rarity-${fish.rarity}">
          ${RARITY_LABELS[fish.rarity] ?? ""}
        </div>
      </div>
    `;
  }).join("");

  const total   = fishMaster.length;
  const caughtN = collected.length;

  container.innerHTML = `
    <div class="book-container">
      <div class="book-back-wrap">
        <button id="btn-book-back" class="btn-secondary">← もどる</button>
      </div>
      <div class="book-title">📖 魚図鑑</div>
      <div style="text-align:center;color:#8ac;font-size:0.85rem;margin-bottom:1rem;">
        ${caughtN} / ${total} 種類を発見！
      </div>
      <div class="book-grid">${cardsHtml}</div>
    </div>
  `;

  document.getElementById("btn-book-back").addEventListener("click", onBack);

  // カードクリックで詳細モーダル
  container.querySelectorAll(".book-card").forEach(card => {
    card.addEventListener("click", () => {
      const fishId = card.dataset.fishId;
      const locked = card.dataset.locked === "true";
      if (!locked) _showDetail(fishId, counts[fishId] ?? 0);
    });
  });
}

function _showDetail(fishId, count) {
  const fish = fishMaster.find(f => f.id === fishId);
  if (!fish) return;

  const modal = document.createElement("div");
  modal.className = "book-detail-modal";
  modal.innerHTML = `
    <div class="book-detail-box">
      <div class="book-detail-emoji">${fish.emoji}</div>
      <div class="book-detail-name">${fish.name}</div>
      <div class="book-detail-real">（${fish.realName}）</div>
      <div class="book-detail-desc">${fish.description}</div>
      <div class="book-detail-catch-info">これまで ${count} 回つかまえた！</div>
      <button class="btn-primary" id="btn-detail-close">とじる</button>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector("#btn-detail-close").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
}
