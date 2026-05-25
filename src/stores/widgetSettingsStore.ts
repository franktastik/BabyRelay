import { create } from 'zustand'

interface WidgetSettingsState {
  widgetSnapshotsEnabled: boolean
  lastClearedAt: string | null
  setWidgetSnapshotsEnabled: (enabled: boolean) => void
  markWidgetSnapshotCleared: (clearedAt?: Date) => void
  resetWidgetSettings: () => void
}

export const useWidgetSettingsStore = create<WidgetSettingsState>((set) => ({
  widgetSnapshotsEnabled: true,
  lastClearedAt: null,
  setWidgetSnapshotsEnabled: (enabled) => set({ widgetSnapshotsEnabled: enabled }),
  markWidgetSnapshotCleared: (clearedAt = new Date()) =>
    set({ lastClearedAt: clearedAt.toISOString() }),
  resetWidgetSettings: () =>
    set({
      widgetSnapshotsEnabled: true,
      lastClearedAt: null,
    }),
}))
