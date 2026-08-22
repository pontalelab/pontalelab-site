/** 「うみをそうじする」モードのメインループ */

import { updateParticles } from "../game/Effects.js";
import { getCleanupStage } from "./CleanupStageMaster.js";
import { CLEANUP_COMBO_MAX } from "./CleanupState.js";
import {
  scatterInitialTrash,
  updateCleanupFishSpawner,
  updateCleanupTrashSpawner,
} from "./CleanupSpawner.js";
import {
  updateTrashDrift,
  updateCleanupFishMovement,
  checkFishTrashCollisions,
  removeOffscreenFish,
} from "./CleanupMovement.js";

const CLEAR_TOAST_DURATION = 3.5; // 秒。この間だけ「きれいになったよ」トーストを表示する

function spawnBounceParticles(state, x, y) {
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 60;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.2,
      maxLife: 0.4 + Math.random() * 0.2,
      color: "#cff",
      size: 2 + Math.random() * 2,
    });
  }
}

function spawnComboParticles(state, x, y, special) {
  const count = special ? 18 : 8;
  const palette = special ? ["#ff8", "#f8f", "#8ff", "#fff"] : ["#ffd", "#fff", "#8df"];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (special ? 90 : 50) + Math.random() * 70;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 20,
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.5 + Math.random() * 0.3,
      color: palette[i % palette.length],
      size: 2 + Math.random() * 3,
    });
  }
}

function spawnClearParticles(state, x, y) {
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14;
    const speed = 70 + Math.random() * 90;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.7 + Math.random() * 0.4,
      maxLife: 0.7 + Math.random() * 0.4,
      color: ["#8f8", "#ff8", "#8ff", "#fff"][i % 4],
      size: 3 + Math.random() * 3,
    });
  }
}

export class CleanupLoop {
  constructor(state, renderer, audio, callbacks) {
    this._state = state;
    this._renderer = renderer;
    this._audio = audio;
    this._callbacks = callbacks;
    this._rafId = null;
    this._lastTime = null;
  }

  start() {
    const state = this._state;
    scatterInitialTrash(state, state.maxTrash);
    state.trashSpawnTimer = 5; // 開始直後にすぐ流れてくるのを避ける
    state.isPlaying = true;
    this._lastTime = null;
    this._audio.startBgm(state.stage.bgmKey);
    this._rafId = requestAnimationFrame((ts) => this._loop(ts));
  }

  stop() {
    this._state.isPlaying = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._audio.stopBgm();
  }

  /** 90秒のプレイ時間が終わったときの処理 */
  _endSession() {
    const state = this._state;
    state.isPlaying = false;
    this._audio.stopBgm();
    this._callbacks.onTimeUp?.(state);
  }

  /** 現在の残りゴミ数に応じてステージ（背景・魚・BGM）を同期する。両方向（増減）に対応 */
  _syncStage() {
    const state = this._state;
    state.remaining = state.activeTrashList.length;

    const nextStage = getCleanupStage(state.remaining);
    if (nextStage.key !== state.stage.key) {
      state.stage = nextStage;
      this._audio.changeBgm(nextStage.bgmKey);
      this._callbacks.onStageChange?.(nextStage);
    }

    // ちょうど0個になった瞬間だけ、一時的なお祝いトーストを出す（ゲームは止めない）
    if (state.remaining === 0 && state.clearToastTimer <= 0) {
      state.clearToastTimer = CLEAR_TOAST_DURATION;
      spawnClearParticles(state, 400, 250);
      this._callbacks.onClearMoment?.();
    }
  }

  /** キャンバス座標でタップされたゴミを1つ取り除く（ゴミが無ければ魚のタップ＝捕まえる、を試す） */
  handleTap(cx, cy) {
    const state = this._state;
    if (!state.isPlaying) return;

    const TAP_PAD = 18;
    let closestTrash = null;
    let closestTrashDist = Infinity;

    for (const trash of state.activeTrashList) {
      if (!trash.active) continue;
      const ex = trash.x + trash.size.width / 2;
      const ey = trash.y + trash.size.height / 2;
      const dist = Math.hypot(cx - ex, cy - ey);
      const hitRadius = TAP_PAD + Math.min(trash.size.width, trash.size.height) * 0.5;
      if (dist <= hitRadius && dist < closestTrashDist) {
        closestTrash = trash;
        closestTrashDist = dist;
      }
    }

    if (closestTrash) {
      closestTrash.active = false;
      this._audio.play(closestTrash.collectSound ?? "splash");
      const ex = closestTrash.x + closestTrash.size.width / 2;
      const ey = closestTrash.y + closestTrash.size.height / 2;
      spawnBounceParticles(state, ex, ey);

      state.activeTrashList = state.activeTrashList.filter((t) => t.active);
      this._callbacks.onTrashRemoved?.(state.activeTrashList.length);
      this._syncStage();
      return;
    }

    // ゴミに当たらなかった場合、魚をタップ（捕まえる）していないか確認する
    let closestFish = null;
    let closestFishDist = Infinity;
    for (const fish of state.activeFishList) {
      if (!fish.active) continue;
      const ex = fish.x + fish.size.width / 2;
      const ey = fish.y + fish.size.height / 2;
      const dist = Math.hypot(cx - ex, cy - ey);
      const hitRadius = TAP_PAD + Math.min(fish.size.width, fish.size.height) * 0.5;
      if (dist <= hitRadius && dist < closestFishDist) {
        closestFish = fish;
        closestFishDist = dist;
      }
    }
    if (closestFish) this._handleFishCatch(closestFish);
  }

  /**
   * 魚を捕まえたときの処理。魚自体は消えず、そのまま泳ぎ続ける
   * （うみがきれいになるほど魚が増える、という体験を邪魔しないため）。
   * 同じ魚を連続で捕まえるたびに、ドレミファソ…と音階が1段ずつ上がっていく。
   */
  _handleFishCatch(fish) {
    const state = this._state;

    if (fish.masterId === state.lastCaughtFishId) {
      state.comboStep += 1;
    } else {
      state.lastCaughtFishId = fish.masterId;
      state.comboStep = 1;
    }

    const ex = fish.x + fish.size.width / 2;
    const ey = fish.y + fish.size.height / 2;

    if (state.comboStep >= CLEANUP_COMBO_MAX) {
      this._audio.playComboComplete();
      spawnComboParticles(state, ex, ey, true);
      state.bestComboStep = Math.max(state.bestComboStep, state.comboStep);
      state.comboStep = 0;
      state.lastCaughtFishId = null;
    } else {
      this._audio.playComboStep(state.comboStep);
      spawnComboParticles(state, ex, ey, false);
      state.bestComboStep = Math.max(state.bestComboStep, state.comboStep);
    }

    this._callbacks.onFishCatch?.(state.comboStep);
  }

  _loop(timestamp) {
    if (this._lastTime === null) this._lastTime = timestamp;
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.1);
    this._lastTime = timestamp;

    if (this._state.isPlaying) {
      this._update(dt);
    }

    this._renderer.render(this._state);

    if (this._state.isPlaying) {
      this._rafId = requestAnimationFrame((ts) => this._loop(ts));
    }
  }

  _update(dt) {
    const state = this._state;
    state.elapsedTime += dt;

    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      this._endSession();
      return;
    }

    updateCleanupFishSpawner(state, dt);

    const beforeCount = state.activeTrashList.length;
    updateCleanupTrashSpawner(state, dt);
    if (state.activeTrashList.length !== beforeCount) {
      this._callbacks.onTrashRemoved?.(state.activeTrashList.length); // 増減どちらもHUD更新に使う
      this._syncStage();
    }

    for (const trash of state.activeTrashList) updateTrashDrift(trash, dt, state.elapsedTime);
    for (const fish of state.activeFishList) updateCleanupFishMovement(fish, dt, state.elapsedTime);

    const bounced = checkFishTrashCollisions(state);
    for (const { fish } of bounced) {
      this._audio.play("pop");
      spawnBounceParticles(state, fish.x + fish.size.width / 2, fish.y + fish.size.height / 2);
    }

    removeOffscreenFish(state);
    updateParticles(state, dt);

    if (state.clearToastTimer > 0) {
      state.clearToastTimer -= dt;
      if (state.clearToastTimer <= 0) {
        state.clearToastTimer = 0;
        this._callbacks.onClearToastEnd?.();
      }
    }
  }
}
