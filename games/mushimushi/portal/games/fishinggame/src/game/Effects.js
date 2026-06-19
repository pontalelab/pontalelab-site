/** 捕獲時の特殊エフェクト処理 */

import { seaMessages } from "../data/trashMaster.js";
import { stageMaster } from "../data/stageMaster.js";

/**
 * エンティティを捕獲したときの処理
 * @param {object} entity   - 捕獲したエンティティ
 * @param {object} state    - ゲーム状態
 * @param {object} audio    - AudioManager
 * @param {object} callbacks - { onMessage, onLevelUp }
 */
export function processCatch(entity, state, audio, callbacks) {
  entity.active = false;
  audio.play(entity.catchSound);
  spawnCatchParticles(state, entity);

  if (entity.type === "fish") {
    _processFishCatch(entity, state);
  } else {
    _processTrashCatch(entity, state, audio, callbacks);
  }
}

function _processFishCatch(entity, state) {
  state.sessionCatchCounts[entity.masterId] = (state.sessionCatchCounts[entity.masterId] || 0) + 1;
  if (!state.sessionCaughtFishIds.includes(entity.masterId)) {
    state.sessionCaughtFishIds.push(entity.masterId);
  }
}

function _processTrashCatch(entity, state, audio, callbacks) {
  switch (entity.effectType) {
    case "addPoint":
      state.sessionPointGained += entity.point;
      state.seaPoint += entity.point;
      state.sessionTrashCount++;
      _checkLevelUp(state, callbacks);
      break;

    case "changeBgm":
      state.sessionPointGained += entity.point;
      state.seaPoint += entity.point;
      state.sessionTrashCount++;
      state.currentBgm = "special";
      state.bgmChangeTimer = entity.effectDuration;
      audio.changeBgm("special");
      _checkLevelUp(state, callbacks);
      break;

    case "showMessageAndPause": {
      state.sessionPointGained += entity.point;
      state.seaPoint += entity.point;
      state.sessionTrashCount++;
      const msg = _pickMessage(state);
      state.isPaused = true;
      state.pauseReason = "message";
      state.currentMessage = msg;
      callbacks.onMessage(msg);
      _checkLevelUp(state, callbacks);
      break;
    }

    default:
      state.sessionPointGained += entity.point;
      state.seaPoint += entity.point;
      state.sessionTrashCount++;
  }
}

function _pickMessage(state) {
  const unviewed = seaMessages.filter((_, i) => !state.sessionViewedMessages.includes(i));
  const pool = unviewed.length > 0 ? unviewed.map((m, _) => m) : seaMessages;
  const idx = Math.floor(Math.random() * seaMessages.length);
  state.sessionViewedMessages.push(idx);
  return seaMessages[idx];
}

function _checkLevelUp(state, callbacks) {
  const nextLevel = state.currentSeaLevel + 1;
  if (nextLevel > stageMaster.maxLevel) return;
  const nextLevelConfig = stageMaster.levels.find(l => l.level === nextLevel);
  if (!nextLevelConfig) return;
  if (state.seaPoint >= nextLevelConfig.requiredPoint) {
    state.currentSeaLevel = nextLevel;
    state.levelConfig = nextLevelConfig;
    state.levelUpPending = nextLevelConfig;
    callbacks.onLevelUp(nextLevelConfig);
  }
}

/** 捕獲時にパーティクルを生成する */
export function spawnCatchParticles(state, entity) {
  const cx = entity.x + entity.size.width / 2;
  const cy = entity.y + entity.size.height / 2;
  const colors = {
    common:    ["#adf", "#8cf", "#fff"],
    uncommon:  ["#8f8", "#afa", "#fff"],
    rare:      ["#ff8", "#ffa", "#fff"],
    superRare: ["#f8f", "#faf", "#fff"],
  };
  const palette = colors[entity.rarity] ?? colors.common;
  const count = entity.rarity === "superRare" ? 16 : entity.rarity === "rare" ? 12 : 8;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 80 + Math.random() * 120;
    state.particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 0.6 + Math.random() * 0.4,
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 3 + Math.random() * 4,
    });
  }
}

/** パーティクル更新 */
export function updateParticles(state, dt) {
  state.particles = state.particles.filter(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 100 * dt;
    p.life -= dt;
    return p.life > 0;
  });
}
