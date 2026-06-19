import type { DifficultyLevel } from '../types';

export const DIFFICULTY_MASTER: DifficultyLevel[] = [
  {
    id: 1,
    name: 'はじめてのうみ',
    targetAge: '3〜4さい',
    emoji: '🌊',
    dummyMin: 0,
    dummyMax: 0,
    showFishName: true,
    rareThreshold: 999,
    rarityWeights: { '1': 50, '2': 30, '3': 15, '4': 4, '5': 1 },
  },
  {
    id: 2,
    name: 'おさかなたんけん',
    targetAge: '4〜6さい',
    emoji: '🐠',
    dummyMin: 1,
    dummyMax: 3,
    showFishName: true,
    rareThreshold: 4,
    rarityWeights: { '1': 40, '2': 30, '3': 20, '4': 8, '5': 2 },
  },
  {
    id: 3,
    name: 'しんかいチャレンジ',
    targetAge: '5さい いじょう',
    emoji: '🦈',
    dummyMin: 3,
    dummyMax: 6,
    showFishName: true,
    rareThreshold: 3,
    rarityWeights: { '1': 30, '2': 30, '3': 25, '4': 10, '5': 5 },
  },
];
