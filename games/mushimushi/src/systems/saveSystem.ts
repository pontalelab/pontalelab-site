import type { SaveData } from '../types';
import { useEncyclopediaStore } from '../stores/encyclopediaStore';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';

const SAVE_KEY = 'mushi_game_save';
const CURRENT_VERSION = 1;

const defaultSave = (): SaveData => ({
  version: CURRENT_VERSION,
  discoveredBugs: [],
  capturedCounts: {},
  unlockedStages: ['grass_day'],
  settings: { soundEnabled: true, volume: 0.7 },
});

export function saveGame(): void {
  const enc = useEncyclopediaStore.getState();
  const game = useGameStore.getState();
  const settings = useSettingsStore.getState();

  const data: SaveData = {
    version: CURRENT_VERSION,
    discoveredBugs: enc.discoveredBugs,
    capturedCounts: enc.capturedCounts,
    unlockedStages: game.unlockedStages,
    settings: {
      soundEnabled: settings.soundEnabled,
      volume: settings.volume,
    },
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function loadGame(): void {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;

    const data: SaveData = JSON.parse(raw);
    if (data.version !== CURRENT_VERSION) {
      localStorage.removeItem(SAVE_KEY);
      return;
    }

    useEncyclopediaStore.getState().loadFromSave(
      data.discoveredBugs,
      data.capturedCounts,
    );
    useGameStore.getState().loadFromSave(data.unlockedStages);
    useSettingsStore.getState().loadFromSave(data.settings);
  } catch {
    // corrupted save — start fresh
    localStorage.removeItem(SAVE_KEY);
  }
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
  const d = defaultSave();
  useEncyclopediaStore.getState().loadFromSave(d.discoveredBugs, d.capturedCounts);
  useGameStore.getState().loadFromSave(d.unlockedStages);
  useSettingsStore.getState().loadFromSave(d.settings);
}
