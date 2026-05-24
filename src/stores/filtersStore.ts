import { create } from 'zustand'

export type TimelineFilter = 'all' | 'care' | 'growth' | 'notes'

interface FiltersState {
  filter: TimelineFilter
  setFilter: (filter: TimelineFilter) => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}))
