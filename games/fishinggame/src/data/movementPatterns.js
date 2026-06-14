/** 魚の動きパターンマスターデータ */
export const movementPatterns = [
  {
    id: "straight",
    name: "まっすぐ",
    description: "左から右へまっすぐ泳ぐ。",
    baseBehavior: "linear",
    defaultParams: { verticalOffset: 0 },
  },
  {
    id: "wave",
    name: "ゆらゆら",
    description: "上下に波のように揺れながら泳ぐ。",
    baseBehavior: "sineWave",
    defaultParams: { amplitude: 30, frequency: 2 },
  },
  {
    id: "slow",
    name: "ゆっくり",
    description: "大きな生き物がゆったり泳ぐ。",
    baseBehavior: "linearSlow",
    defaultParams: { speedMultiplier: 0.7 },
  },
  {
    id: "fast",
    name: "高速",
    description: "画面を速く横切る。",
    baseBehavior: "linearFast",
    defaultParams: { speedMultiplier: 1.8 },
  },
  {
    id: "dash",
    name: "ピュッと加速",
    description: "通常移動中に一定確率で急加速する。",
    baseBehavior: "dash",
    defaultParams: { dashSpeed: 220, dashChance: 0.03, dashDuration: 0.5 },
  },
  {
    id: "float",
    name: "ふわふわ",
    description: "ふわっと上下に漂うように動く。",
    baseBehavior: "float",
    defaultParams: { amplitude: 20, frequency: 1.2 },
  },
];
