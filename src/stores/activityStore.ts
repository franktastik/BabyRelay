import { create } from 'zustand'
import {
  type BabyMinimoActivityItem,
  type BabyMinimoActivityType,
  summarizeBabyMinimoActivity,
  trimBabyMinimoActivities,
} from '@/src/features/activity'

interface AddBabyMinimoActivityInput {
  babyId: string
  type: BabyMinimoActivityType
  label: string
  detail?: string
  metadata?: Record<string, string | number | boolean | null>
}

interface BabyMinimoActivityState {
  items: BabyMinimoActivityItem[]
  addActivity: (activity: AddBabyMinimoActivityInput) => BabyMinimoActivityItem
  getRecentForBaby: (babyId: string, limit?: number) => BabyMinimoActivityItem[]
  getSummaryForBaby: (babyId: string) => ReturnType<typeof summarizeBabyMinimoActivity>
  resetActivities: () => void
}

export const useBabyMinimoActivityStore = create<BabyMinimoActivityState>((set, get) => ({
  items: [],
  addActivity: (activity) => {
    const item: BabyMinimoActivityItem = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      occurredAt: new Date(),
    }
    set((state) => ({
      items: trimBabyMinimoActivities([item, ...state.items]),
    }))
    return item
  },
  getRecentForBaby: (babyId, limit = 20) =>
    trimBabyMinimoActivities(get().items.filter((item) => item.babyId === babyId)).slice(0, limit),
  getSummaryForBaby: (babyId) => summarizeBabyMinimoActivity(babyId, get().items),
  resetActivities: () => set({ items: [] }),
}))
