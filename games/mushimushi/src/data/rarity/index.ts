import type { Rarity } from '../../types';

export const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 70,
  uncommon: 20,
  rare: 8,
  epic: 1.8,
  legendary: 0.2,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンダリー',
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF8F00',
};
