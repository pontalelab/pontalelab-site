import { create } from 'zustand'

type ToastItem = {
  id: string
  message: string
  isNew: boolean
}

type UiState = {
  isSettingsOpen: boolean
  isResultOpen: boolean
  toasts: ToastItem[]
  openSettings: () => void
  closeSettings: () => void
  openResult: () => void
  closeResult: () => void
  showToast: (message: string, isNew?: boolean) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  isSettingsOpen: false,
  isResultOpen: false,
  toasts: [],

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openResult: () => set({ isResultOpen: true }),
  closeResult: () => set({ isResultOpen: false }),

  showToast: (message, isNew = false) => {
    const id = `${Date.now()}-${Math.random()}`
    set((s) => ({ toasts: [...s.toasts, { id, message, isNew }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 2500)
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
