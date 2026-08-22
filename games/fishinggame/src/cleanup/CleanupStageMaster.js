/**
 * 「うみをそうじする」モード専用のステージテーブル。
 * さかなつりモードの stageMaster とは独立（うみレベル・セーブデータには一切影響しない）。
 * 残りゴミ数に応じて、背景・出現する魚の種類・数・BGMを段階的に変化させる。
 */

// ゴミは片付けても終わりではなく、時間とともにまた少しずつ流れてくる。
// この値は「同時に画面内に存在できるゴミの上限」（＝もっとも汚れた状態の目安）として使う。
export const CLEANUP_MAX_TRASH = 20;

/** 段階は残りゴミ数の多い順に並べる（配列の先頭から順に該当するものを探す） */
export const cleanupStages = [
  {
    key: "stage1",
    name: "きたない うみ",
    minRemaining: 16, // 16〜20個
    bgLevel: 1,
    maxFishCount: 2,
    fishSpawnInterval: 3.2,
    fishPool: ["sardine"],
    bgmKey: "stage1",
  },
  {
    key: "stage2",
    name: "すこし きれい",
    minRemaining: 11, // 11〜15個
    bgLevel: 1,
    maxFishCount: 4,
    fishSpawnInterval: 2.4,
    fishPool: ["sardine", "horse_mackerel"],
    bgmKey: "stage2",
  },
  {
    key: "stage3",
    name: "きれいな うみ",
    minRemaining: 6, // 6〜10個
    bgLevel: 2,
    maxFishCount: 6,
    fishSpawnInterval: 1.8,
    fishPool: ["sardine", "horse_mackerel", "clownfish", "butterflyfish"],
    bgmKey: "stage3",
  },
  {
    key: "stage4",
    name: "とても きれい",
    minRemaining: 1, // 1〜5個
    bgLevel: 3,
    maxFishCount: 8,
    fishSpawnInterval: 1.3,
    fishPool: ["sardine", "horse_mackerel", "clownfish", "butterflyfish", "squid", "pufferfish"],
    bgmKey: "stage4",
  },
  {
    key: "clear",
    name: "かんぺきな うみ",
    minRemaining: 0, // 0個
    bgLevel: 3,
    maxFishCount: 10,
    fishSpawnInterval: 1.0,
    fishPool: [
      "sardine", "horse_mackerel", "clownfish", "butterflyfish",
      "squid", "pufferfish", "tuna", "sea_turtle", "napoleonfish",
    ],
    bgmKey: "clear",
  },
];

/** 残りゴミ数から該当ステージ設定を返す */
export function getCleanupStage(remaining) {
  for (const stage of cleanupStages) {
    if (remaining >= stage.minRemaining) return stage;
  }
  return cleanupStages[0];
}
