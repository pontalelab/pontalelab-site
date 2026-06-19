import type { SaveData } from '../types';

const STORAGE_KEY = 'pokopoko-sea-save';

const DEFAULT_SAVE_DATA: SaveData = {
  discoveredFishIds: [],
};

export const storageService = {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA };
      return JSON.parse(raw) as SaveData;
    } catch {
      return { ...DEFAULT_SAVE_DATA };
    }
  },

  save(data: Partial<SaveData>): void {
    try {
      const current = this.load();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
    } catch (e) {
      console.error('セーブに失敗しました', e);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('クリアに失敗しました', e);
    }
  },
};
