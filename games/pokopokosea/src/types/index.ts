export type Screen = 'HOME' | 'PLAY' | 'FOUND' | 'DETAIL' | 'DIFFICULTY_SELECT';

export interface Fish {
  id: string;
  name: string;          // ひらがな（問題生成・表示用）
  displayName: string;   // カタカナ（図鑑表示用）
  image: string;         // 画像ファイル名
  emoji?: string;        // MVPプレースホルダー
  description?: string;  // 図鑑説明文
}

export interface SeaDevelopmentLevel {
  level: number;
  requiredSpecies: number;
  background: 'sand' | 'seaweed' | 'coral';
}

export interface DifficultyLevel {
  id: number;
  name: string;
  targetAge: string;
  emoji: string;
  dummyMin: number;
  dummyMax: number;
  showFishName: boolean;
  rareThreshold: number;
  rarityWeights: Record<string, number>;
}

export interface SaveData {
  discoveredFishIds: string[];
  lastDifficultyId?: number;
}

export interface BubbleLetter {
  id: string;
  letter: string;
  index: number;   // 魚名内の位置（0始まり）。正しいタップ順の判定に使用
  selected: boolean;
}
