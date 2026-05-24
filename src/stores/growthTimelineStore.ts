import { create } from 'zustand'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'

interface GrowthTimelineState {
  localMoments: DemoGrowthMoment[]
  addMoment: (moment: Omit<DemoGrowthMoment, 'id'>) => void
}

export const useGrowthTimelineStore = create<GrowthTimelineState>((set) => ({
  localMoments: [],
  addMoment: (moment) =>
    set((state) => ({
      localMoments: [
        { ...moment, id: `local-gm-${Date.now()}` },
        ...state.localMoments,
      ],
    })),
}))
