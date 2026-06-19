/** ゲーム実行時データ（1セッション分の可変状態） */

export const CANVAS_W   = 800;
export const CANVAS_H   = 500;
export const NET_RADIUS = 28;                           // 旧55の半分
export const NET_FIXED_X = CANVAS_W - NET_RADIUS - 12; // 右端固定X = 760

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

    // 網（X固定・Y のみプレイヤーが操作）
    netPosition: { x: NET_FIXED_X, y: CANVAS_H / 2 },
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
