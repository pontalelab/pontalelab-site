/** 「うみをそうじする」モードの実行時状態（1プレイ分。永続保存はしない） */

import { CLEANUP_MAX_TRASH, getCleanupStage } from "./CleanupStageMaster.js";

export const CLEANUP_CANVAS_W = 800;
export const CLEANUP_CANVAS_H = 500;

// 1プレイの長さ（秒）。時間になったら終了し、「もういちど あそぶ」で再挑戦できる。
export const CLEANUP_PLAY_SECONDS = 90;

// 同じ魚を連続で捕まえたときの、ドレミファソ…の音階の段数（ここまで上がったら特別な音で最初に戻る）
export const CLEANUP_COMBO_MAX = 10;

export function createCleanupState() {
  const remaining = CLEANUP_MAX_TRASH;
  return {
    maxTrash: CLEANUP_MAX_TRASH,
    remaining,
    stage: getCleanupStage(remaining),

    activeFishList: [],
    activeTrashList: [],
    particles: [],

    elapsedTime: 0,
    fishSpawnTimer: 0,
    trashSpawnTimer: 0,

    isPlaying: false,

    // プレイ時間（1プレイ完結・秒）
    timeLeft: CLEANUP_PLAY_SECONDS,

    // 「ゴミ0個」を達成した瞬間だけ一時的に表示するお祝いトースト用（>0の間は表示中）。
    // ここに達しても isPlaying は止めない＝ゴミはこの後も流れてき続け、海はまた汚れうる。
    clearToastTimer: 0,

    // 同じ魚を連続で捕まえたときの音階コンボ
    lastCaughtFishId: null,
    comboStep: 0,
    bestComboStep: 0,

    // このプレイで捕まえた魚の総数（タップで消えた魚の数。終了画面の表示に使う）
    caughtFishCount: 0,
  };
}

let _instanceIdCounter = 0;
export function nextCleanupInstanceId() {
  return ++_instanceIdCounter;
}
