/** 「うみをそうじする」モードのゴミ初期配置・魚のスポーン管理 */

import { trashMaster } from "../data/trashMaster.js";
import { fishMaster } from "../data/fishMaster.js";
import { movementPatterns } from "../data/movementPatterns.js";
import { nextCleanupInstanceId, CLEANUP_CANVAS_W, CLEANUP_CANVAS_H } from "./CleanupState.js";

const OCEAN_TOP = 60;
const OCEAN_BOTTOM = CLEANUP_CANVAS_H - 60;
const OCEAN_LEFT = 40;
const OCEAN_RIGHT = CLEANUP_CANVAS_W - 40;

// このモードで使うゴミの種類（宝箱・メッセージボトルなど得点演出用の特殊ゴミは対象外）
const CLEANUP_TRASH_IDS = ["can", "trash_bag", "boot", "plastic_bottle"];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/** ゲーム開始時：指定個数のゴミを、なるべく重ならないよう画面内にランダム配置する */
export function scatterInitialTrash(state, count) {
  const pool = trashMaster.filter((t) => CLEANUP_TRASH_IDS.includes(t.id));
  const placed = [];

  for (let i = 0; i < count; i++) {
    const master = pool[Math.floor(Math.random() * pool.length)];
    let x, y, ok = false;

    for (let attempt = 0; attempt < 8 && !ok; attempt++) {
      x = randomBetween(OCEAN_LEFT, OCEAN_RIGHT - master.size.width);
      y = randomBetween(OCEAN_TOP, OCEAN_BOTTOM - master.size.height);
      ok = placed.every((p) => Math.hypot(p.x - x, p.y - y) > 55);
    }

    const angle = Math.random() * Math.PI * 2;
    const entity = {
      instanceId: nextCleanupInstanceId(),
      type: "trash",
      masterId: master.id,
      name: master.name,
      emoji: master.emoji,
      x, y,
      size: { ...master.size },
      vx: Math.cos(angle) * randomBetween(8, 20),
      vy: Math.sin(angle) * randomBetween(5, 12),
      wobblePhase: Math.random() * Math.PI * 2,
      collectSound: master.collectSound ?? "splash",
      active: true,
    };
    placed.push({ x, y });
    state.activeTrashList.push(entity);
  }
}

/** 魚エンティティを1体生成する（さかなつりモードの fishMaster / movementPatterns をそのまま流用） */
function createFishEntity(masterId) {
  const master = fishMaster.find((f) => f.id === masterId);
  if (!master) return null;
  const pattern = movementPatterns.find((p) => p.id === master.movementType) ?? movementPatterns[0];
  const mergedParams = { ...pattern.defaultParams, ...master.movementParams };
  const baseY = OCEAN_TOP + Math.random() * (OCEAN_BOTTOM - OCEAN_TOP - master.size.height);

  return {
    instanceId: nextCleanupInstanceId(),
    type: "fish",
    masterId: master.id,
    x: -master.size.width - 10,
    y: baseY,
    baseY,
    size: { ...master.size },
    speed: master.speed,
    direction: 1, // +1: 右へ / -1: 左へ（ゴミにぶつかると反転する）
    movementType: master.movementType,
    movementParams: mergedParams,
    movementState: { isDashing: false, dashTimeLeft: 0 },
    emoji: master.emoji,
    name: master.name,
    tOffset: Math.random() * Math.PI * 2,
    bounceCooldown: 0,
    active: true,
  };
}

/** 経過時間に応じて魚をスポーンさせる（ステージ設定の上限・種類・間隔に従う） */
export function updateCleanupFishSpawner(state, dt) {
  const stage = state.stage;
  state.fishSpawnTimer += dt;
  if (state.fishSpawnTimer < stage.fishSpawnInterval) return;
  if (state.activeFishList.length >= stage.maxFishCount) return;

  state.fishSpawnTimer = 0;
  const pool = stage.fishPool;
  const masterId = pool[Math.floor(Math.random() * pool.length)];
  const entity = createFishEntity(masterId);
  if (entity) state.activeFishList.push(entity);
}

/** 画面の外側（上・左・右のどこか）から、内向きの速度を持ったゴミを1つ生成する */
function createIncomingTrashEntity() {
  const pool = trashMaster.filter((t) => CLEANUP_TRASH_IDS.includes(t.id));
  const master = pool[Math.floor(Math.random() * pool.length)];
  const edge = ["top", "left", "right"][Math.floor(Math.random() * 3)];

  let x, y, vx, vy;
  if (edge === "top") {
    x = randomBetween(OCEAN_LEFT, OCEAN_RIGHT - master.size.width);
    y = OCEAN_TOP - master.size.height - 10;
    vx = randomBetween(-10, 10);
    vy = randomBetween(8, 16);
  } else if (edge === "left") {
    x = OCEAN_LEFT - master.size.width - 10;
    y = randomBetween(OCEAN_TOP, OCEAN_BOTTOM - master.size.height);
    vx = randomBetween(8, 16);
    vy = randomBetween(-8, 8);
  } else {
    x = OCEAN_RIGHT + 10;
    y = randomBetween(OCEAN_TOP, OCEAN_BOTTOM - master.size.height);
    vx = -randomBetween(8, 16);
    vy = randomBetween(-8, 8);
  }

  return {
    instanceId: nextCleanupInstanceId(),
    type: "trash",
    masterId: master.id,
    name: master.name,
    emoji: master.emoji,
    x, y,
    size: { ...master.size },
    vx, vy,
    wobblePhase: Math.random() * Math.PI * 2,
    collectSound: master.collectSound ?? "splash",
    active: true,
  };
}

/**
 * 時間の経過とともに、新しいゴミがゆっくり流れてくる。
 * タップして片付けても、しばらく放っておくとまた少しずつ増えていく（海はまた汚れうる）。
 * 同時に存在できる数には上限（maxTrash）を設ける。
 */
export function updateCleanupTrashSpawner(state, dt) {
  state.trashSpawnTimer -= dt;
  if (state.trashSpawnTimer > 0) return;

  // 次のゴミが流れてくるまでの間隔をランダムに決める（4〜7秒に1個程度、ゆっくり）
  state.trashSpawnTimer = randomBetween(4, 7);

  if (state.activeTrashList.length >= state.maxTrash) return;
  state.activeTrashList.push(createIncomingTrashEntity());
}
