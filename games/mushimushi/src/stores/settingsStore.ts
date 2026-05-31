import { create } from 'zustand';
import type { SettingsData } from '../types';

type SettingsState = SettingsData & {
  setSoundEnabled: (v: boolean) => void;
  setVolume: (v: number) => void;
  loadFromSave: (s: SettingsData) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: true,
  volume: 0.7,

  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setVolume: (v) => set({ volume: v }),
  loadFromSave: (s) => set(s),
}));
