/** 「うみをそうじする」モードの移動・当たり判定 */

import { updateEntityMovement } from "../game/Movement.js";
import { CLEANUP_CANVAS_W, CLEANUP_CANVAS_H } from "./CleanupState.js";

const OCEAN_TOP = 60;
const OCEAN_BOTTOM = CLEANUP_CANVAS_H - 60;
const OCEAN_LEFT = 10;
const OCEAN_RIGHT = CLEANUP_CANVAS_W - 10;

const BOUNCE_COOLDOWN = 0.6;

/** ゴミをゆっくり漂わせる（画面内で軽く跳ね返る＋わずかに上下ゆれ） */
export function updateTrashDrift(entity, dt, t) {
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;

  if (entity.x < OCEAN_LEFT) { entity.x = OCEAN_LEFT; entity.vx = Math.abs(entity.vx); }
  if (entity.x + entity.size.width > OCEAN_RIGHT) { entity.x = OCEAN_RIGHT - entity.size.width; entity.vx = -Math.abs(entity.vx); }
  if (entity.y < OCEAN_TOP) { entity.y = OCEAN_TOP; entity.vy = Math.abs(entity.vy); }
  if (entity.y + entity.size.height > OCEAN_BOTTOM) { entity.y = OCEAN_BOTTOM - entity.size.height; entity.vy = -Math.abs(entity.vy); }

  // 見た目だけの小さな揺れ（当たり判定には影響させない）
  entity.wobbleOffset = Math.sin(t * 1.4 + entity.wobblePhase) * 3;
}

/** 魚を1体分移動させる（さかなつりモードの Movement.js をそのまま利用） */
export function updateCleanupFishMovement(entity, dt, t) {
  updateEntityMovement(entity, dt, t);
  if (entity.bounceCooldown > 0) entity.bounceCooldown -= dt;
}

/**
 * 魚とゴミの接触判定。ぶつかった魚は進行方向を反転させる。
 * @returns {Array} 今フレームでぶつかった {fish, trash} の組
 */
export function checkFishTrashCollisions(state) {
  const bounced = [];
  for (const fish of state.activeFishList) {
    if (!fish.active || fish.bounceCooldown > 0) continue;
    const fx = fish.x + fish.size.width / 2;
    const fy = fish.y + fish.size.height / 2;
    const fr = Math.min(fish.size.width, fish.size.height) * 0.35;

    for (const trash of state.activeTrashList) {
      if (!trash.active) continue;
      const tx = trash.x + trash.size.width / 2;
      const ty = trash.y + trash.size.height / 2;
      const tr = Math.min(trash.size.width, trash.size.height) * 0.4;

      if (Math.hypot(fx - tx, fy - ty) <= fr + tr) {
        fish.direction *= -1;
        fish.bounceCooldown = BOUNCE_COOLDOWN;
        fish.x += fish.direction * 24; // 押し戻して同じゴミへの連続反転を防ぐ
        bounced.push({ fish, trash });
        break;
      }
    }
  }
  return bounced;
}

/** 画面外に完全に出た魚を取り除く（左右どちらの方向へ泳いでいても対象） */
export function removeOffscreenFish(state) {
  state.activeFishList = state.activeFishList.filter((f) => {
    if (!f.active) return false;
    return f.x + f.size.width > -20 && f.x < CLEANUP_CANVAS_W + 20;
  });
}
