import { create } from 'zustand'
import type { ActiveBug, GamePhase } from '../types'

const INITIAL_UNLOCKED = ['grass_day', 'forest_evening', 'night_field']

type GameState = {
  phase: GamePhase
  currentStageId: string
  activeBugs: ActiveBug[]
  unlockedStages: string[]
  setPhase: (phase: GamePhase) => void
  setStage: (stageId: string) => void
  addActiveBug: (bug: ActiveBug) => void
  removeBug: (instanceId: string) => void
  despawnBug: (instanceId: string) => void
  captureBug: (instanceId: string) => void
  unlockStage: (stageId: string) => void
  loadFromSave: (unlockedStages: string[]) => void
  lastRunCaptures: string[]
  setLastRunCaptures: (captures: string[]) => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'idle',
  currentStageId: 'grass_day',
  activeBugs: [],
  unlockedStages: INITIAL_UNLOCKED,
  lastRunCaptures: [],

  setPhase: (phase) => set({ phase }),

  setStage: (stageId) =>
    set({ currentStageId: stageId, activeBugs: [] }),

  addActiveBug: (bug) =>
    set((s) => ({ activeBugs: [...s.activeBugs, bug] })),

  removeBug: (instanceId) =>
    set((s) => ({ activeBugs: s.activeBugs.filter((b) => b.instanceId !== instanceId) })),

  despawnBug: (instanceId) =>
    set((s) => ({
      activeBugs: s.activeBugs.map((b) =>
        b.instanceId === instanceId ? { ...b, state: 'despawning' as const } : b
      ),
    })),

  captureBug: (instanceId) =>
    set((s) => ({
      activeBugs: s.activeBugs.map((b) =>
        b.instanceId === instanceId ? { ...b, state: 'captured' as const } : b,
      ),
    })),

  unlockStage: (stageId) =>
    set((s) => ({
      unlockedStages: s.unlockedStages.includes(stageId)
        ? s.unlockedStages
        : [...s.unlockedStages, stageId],
    })),

  loadFromSave: (unlockedStages) =>
    set({ unlockedStages }),

  setLastRunCaptures: (captures) =>
    set({ lastRunCaptures: captures }),
}))
