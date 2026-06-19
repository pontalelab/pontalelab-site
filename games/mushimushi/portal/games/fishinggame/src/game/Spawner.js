/** 魚・ゴミのスポーン管理（重み付き抽選 + レア補正） */

import { nextInstanceId } from "./GameState.js";
import { movementPatterns } from "../data/movementPatterns.js";

const CANVAS_W = 800;
const CANVAS_H = 500;
const OCEAN_TOP    = 60;
const OCEAN_BOTTOM = CANVAS_H - 60;

/** 重み付きランダム抽選 */
export function weightedRandom(pool) {
  const total = pool.reduce((s, item) => s + item.weight, 0);
  let rand = Math.random() * total;
  for (const item of pool) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return pool[pool.length - 1];
}

/** 現在のレア補正を計算する */
export function calcRareBoost(elapsedTime, rareBoostTable) {
  const boost = { rare: 1.0, superRare: 1.0 };
  for (const rule of rareBoostTable) {
    if (elapsedTime >= rule.startTime && elapsedTime < rule.endTime) {
      boost[rule.rarity] = rule.multiplier;
    }
  }
  return boost;
}

/** fishSpawnList にレア補正を掛けた重みプールを返す */
function buildFishPool(fishSpawnList, fishMaster, rareBoost) {
  return fishSpawnList.map(({ fishId, weight }) => {
    const master = fishMaster.find(f => f.id === fishId);
    if (!master) return null;
    let w = weight;
    if (master.rarity === "rare")      w *= rareBoost.rare;
    if (master.rarity === "superRare") w *= rareBoost.superRare;
    return { master, weight: w };
  }).filter(Boolean);
}

/** エンティティオブジェクトを生成する */
function createEntity(master, type) {
  const pattern = movementPatterns.find(p => p.id === master.movementType) ?? movementPatterns[0];
  const mergedParams = { ...pattern.defaultParams, ...master.movementParams };
  const baseY = OCEAN_TOP + Math.random() * (OCEAN_BOTTOM - OCEAN_TOP - master.size.height);

  return {
    instanceId: nextInstanceId(),
    type,
    masterId: master.id,
    x: -master.size.width - 10,
    y: baseY,
    baseY,
    size: { ...master.size },
    speed: master.speed,
    movementType: master.movementType,
    movementParams: mergedParams,
    movementState: { isDashing: false, dashTimeLeft: 0 },
    emoji: master.emoji,
    name: master.name,
    realName: master.realName ?? "",
    rarity: master.rarity ?? "common",
    effectType: master.effectType ?? "addPoint",
    effectValue: master.effectValue ?? master.point ?? 0,
    effectDuration: master.effectDuration ?? 0,
    messageText: master.messageText ?? "",
    point: master.point ?? 0,
    catchSound: master.catchSound ?? "splash",
    active: true,
    tOffset: Math.random() * Math.PI * 2,
    catchAnimation: 0,
  };
}

/** 群れスポーン（楕円形フォーメーション） */
function spawnSchool(state, fishMaster, schoolConfig) {
  const { fishIds, fishCount } = schoolConfig;
  const fishId = fishIds[Math.floor(Math.random() * fishIds.length)];
  const master = fishMaster.find(f => f.id === fishId);
  if (!master) return;

  const count = typeof fishCount === "number" ? fishCount
    : Math.round(fishCount.min + Math.random() * (fishCount.max - fishCount.min));

  // 楕円の中心 (画面左端の外)
  const cx  = -(master.size.width + 60);
  const cy  = OCEAN_TOP + (OCEAN_BOTTOM - OCEAN_TOP) * (0.3 + Math.random() * 0.4);
  const rx  = 55;                                                         // X半径
  const ry  = Math.min(90, (OCEAN_BOTTOM - OCEAN_TOP - master.size.height) * 0.45); // Y半径

  for (let i = 0; i < count; i++) {
    const angle  = (Math.PI * 2 * i) / count;
    const entity = createEntity(master, "fish");
    entity.x     = cx + Math.cos(angle) * rx;
    entity.baseY = Math.max(
      OCEAN_TOP,
      Math.min(OCEAN_BOTTOM - master.size.height, cy + Math.sin(angle) * ry),
    );
    entity.y = entity.baseY;
    state.activeFishList.push(entity);
  }
}

/**
 * スポーナー更新処理
 * @param {object} state       - ゲーム状態
 * @param {number} dt          - デルタ時間（秒）
 * @param {object} stageMaster - ステージマスター
 * @param {Array}  fishMaster  - 魚マスター
 * @param {Array}  trashMaster - ゴミマスター
 */
export function updateSpawner(state, dt, stageMaster, fishMaster, trashMaster) {
  const level = state.levelConfig;
  const rareBoost = state.currentRareBoost;

  // 魚スポーン
  state.fishSpawnTimer += dt;
  if (state.fishSpawnTimer >= level.fishSpawnInterval) {
    state.fishSpawnTimer = 0;
    if (state.activeFishList.length < level.maxFishCount) {
      const pool = buildFishPool(level.fishSpawnList, fishMaster, rareBoost);
      if (pool.length > 0) {
        const { master } = weightedRandom(pool);
        state.activeFishList.push(createEntity(master, "fish"));
      }
    }
  }

  // ゴミスポーン
  state.trashSpawnTimer += dt;
  if (state.trashSpawnTimer >= level.trashSpawnInterval) {
    state.trashSpawnTimer = 0;
    if (state.activeTrashList.length < level.maxTrashCount) {
      const pool = level.trashSpawnList.map(({ trashId, weight }) => {
        const master = trashMaster.find(t => t.id === trashId);
        return master ? { master, weight } : null;
      }).filter(Boolean);
      if (pool.length > 0) {
        const { master } = weightedRandom(pool);
        state.activeTrashList.push(createEntity(master, "trash"));
      }
    }
  }

  // 群れスポーン
  const sc = level.schoolConfig;
  if (sc.enabled) {
    state.schoolCheckTimer += dt;
    if (state.schoolCheckTimer >= 5) {
      state.schoolCheckTimer = 0;
      const elapsed = state.elapsedTime;
      const sinceLastSchool = elapsed - state.lastSchoolTime;
      if (
        elapsed >= sc.minTime &&
        elapsed <= sc.maxTime &&
        sinceLastSchool >= sc.cooldown &&
        Math.random() < sc.chance
      ) {
        spawnSchool(state, fishMaster, sc);
        state.lastSchoolTime = elapsed;
      }
    }
  }
}
