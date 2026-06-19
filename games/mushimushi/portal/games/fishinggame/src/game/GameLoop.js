/** メインゲームループ */

import { updateEntityMovement } from "./Movement.js";
import { updateSpawner, calcRareBoost } from "./Spawner.js";
import { findCaughtEntities } from "./Collision.js";
import { processCatch, updateParticles } from "./Effects.js";
import { stageMaster } from "../data/stageMaster.js";
import { fishMaster }  from "../data/fishMaster.js";
import { trashMaster } from "../data/trashMaster.js";
import { CANVAS_W, NET_FIXED_X } from "./GameState.js";

export class GameLoop {
  constructor(state, renderer, audio, callbacks) {
    this._state     = state;
    this._renderer  = renderer;
    this._audio     = audio;
    this._callbacks = callbacks;
    this._rafId     = null;
    this._lastTime  = null;
  }

  start() {
    this._state.isPlaying      = true;
    this._state.fishSpawnTimer  = this._state.levelConfig.fishSpawnInterval;
    this._state.trashSpawnTimer = this._state.levelConfig.trashSpawnInterval;
    this._audio.startBgm("normal");
    this._lastTime = null;
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  stop() {
    this._state.isPlaying = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._audio.stopBgm();
  }

  /** Y のみ更新。X は右端に固定 */
  handleMouseMove(_canvasX, canvasY) {
    this._state.netPosition = { x: NET_FIXED_X, y: canvasY };
  }

  resumeFromPause() {
    this._state.isPaused     = false;
    this._state.pauseReason  = null;
    this._state.currentMessage = null;
    this._state.levelUpPending = null;
  }

  _loop(timestamp) {
    if (this._lastTime === null) this._lastTime = timestamp;
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.1);
    this._lastTime = timestamp;

    if (!this._state.isPaused && this._state.isPlaying) {
      this._update(dt);
    }

    this._renderer.render(this._state);

    if (this._state.isPlaying) {
      this._rafId = requestAnimationFrame(ts => this._loop(ts));
    }
  }

  _update(dt) {
    const state = this._state;

    state.timeLeft   -= dt;
    state.elapsedTime += dt;

    if (state.timeLeft <= 0) {
      state.timeLeft  = 0;
      state.isPlaying = false;
      this._callbacks.onGameEnd(state);
      return;
    }

    // BGM タイマー
    if (state.bgmChangeTimer > 0) {
      state.bgmChangeTimer -= dt;
      if (state.bgmChangeTimer <= 0) {
        state.currentBgm = "normal";
        this._audio.changeBgm("normal");
      }
    }

    // レア補正更新
    state.currentRareBoost = calcRareBoost(state.elapsedTime, stageMaster.rareBoostByTime);

    // スポーン
    updateSpawner(state, dt, stageMaster, fishMaster, trashMaster);

    // エンティティ移動
    for (const entity of state.activeFishList)  updateEntityMovement(entity, dt, state.elapsedTime);
    for (const entity of state.activeTrashList) updateEntityMovement(entity, dt, state.elapsedTime);

    // ===== 網との接触判定（自動取得） =====
    const allEntities = [...state.activeFishList, ...state.activeTrashList];
    const caught = findCaughtEntities(
      allEntities,
      state.netPosition.x,
      state.netPosition.y,
      state.netRadius,
    );
    for (const entity of caught) {
      processCatch(entity, state, this._audio, {
        onMessage: (msg) => this._callbacks.onMessage(msg),
        onLevelUp: (cfg) => this._callbacks.onLevelUp(cfg),
      });
      this._callbacks.onCatch(entity);
    }

    // 画面外エンティティを除去
    const isOffScreen = e => e.x > CANVAS_W + e.size.width + 10;
    state.activeFishList  = state.activeFishList.filter(e => e.active && !isOffScreen(e));
    state.activeTrashList = state.activeTrashList.filter(e => e.active && !isOffScreen(e));

    // パーティクル更新
    updateParticles(state, dt);
  }
}
