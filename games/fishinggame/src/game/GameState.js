/** ゲーム実行時データ（1セッション分の可変状態） */

export const CANVAS_W   = 800;
export const CANVAS_H   = 500;
export const NET_RADIUS = 28;
export const NET_MIN_X  = CANVAS_W / 2;                   // 可動範囲左端（画面中央）
export const NET_MAX_X  = CANVAS_W - NET_RADIUS - 12;     // 可動範囲右端 = 760

export function createGameState(saveData, levelConfig) {
  return {
    // 時間
    timeLeft: 60,
    elapsedTime: 0,

    // 海の状態
    currentStageId: saveData.currentStageId,
    currentSeaLevel: saveData.currentSeaLevel,
    seaPoint: saveData.seaPoint,
    levelConfig,

    // 画面内エンティティ
    activeFishList: [],
    activeTrashList: [],

    // 網（右半分を自由に移動）
    netPosition: { x: NET_MAX_X, y: CANVAS_H / 2 },
    netRadius: NET_RADIUS,

    // BGM/音
    currentBgm: "normal",
    bgmChangeTimer: 0,

    // ポーズ
    isPaused: false,
    pauseReason: null,

    // 表示中メッセージ
    currentMessage: null,

    // レア補正
    currentRareBoost: { rare: 1.0, superRare: 1.0 },

    // 群れ管理
    lastSchoolTime: -999,

    // プレイ状態
    isPlaying: false,

    // セッション中の結果集計
    sessionPointGained: 0,
    sessionCatchCounts: {},
    sessionCaughtFishIds: [],
    sessionTrashCount: 0,
    sessionViewedMessages: [],

    // スポーンタイマー
    fishSpawnTimer: 0,
    trashSpawnTimer: 0,
    schoolCheckTimer: 0,

    // パーティクル
    particles: [],

    // レベルアップフラグ
    levelUpPending: null,
  };
}

let _instanceIdCounter = 0;
export function nextInstanceId() {
  return ++_instanceIdCounter;
}
