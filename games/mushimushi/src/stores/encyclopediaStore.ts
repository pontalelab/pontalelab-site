import { create } from 'zustand'

type EncyclopediaState = {
  discoveredBugs: string[]
  capturedCounts: Record<string, number>
  newBugs: string[]
  discoverBug: (bugId: string) => boolean
  incrementCapture: (bugId: string) => void
  viewBug: (bugId: string) => void
  loadFromSave: (discovered: string[], counts: Record<string, number>) => void
}

export const useEncyclopediaStore = create<EncyclopediaState>((set, get) => ({
  discoveredBugs: [],
  capturedCounts: {},
  newBugs: [],

  discoverBug: (bugId) => {
    const isNew = !get().discoveredBugs.includes(bugId)
    if (isNew) {
      set((s) => ({
        discoveredBugs: [...s.discoveredBugs, bugId],
        newBugs: [...s.newBugs, bugId],
      }))
    }
    return isNew
  },

  incrementCapture: (bugId) =>
    set((s) => ({
      capturedCounts: {
        ...s.capturedCounts,
        [bugId]: (s.capturedCounts[bugId] ?? 0) + 1,
      },
    })),

  viewBug: (bugId) =>
    set((s) => ({ newBugs: s.newBugs.filter((id) => id !== bugId) })),

  loadFromSave: (discovered, counts) =>
    set({ discoveredBugs: discovered, capturedCounts: counts, newBugs: [] }),
}))
