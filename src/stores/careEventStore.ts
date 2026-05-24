import { create } from 'zustand'
import { trackEvent } from '@/src/features/analytics'
import { createDemoEventsAdapter, type DemoCareEvent } from '@/src/features/demo/events'

let eventsAdapter: ReturnType<typeof createDemoEventsAdapter> | null = null

const getEventsAdapter = () => {
  eventsAdapter ||= createDemoEventsAdapter()
  return eventsAdapter
}

interface CareEventState {
  events: DemoCareEvent[]
  addEvent: (event: Omit<DemoCareEvent, 'id'>) => Promise<DemoCareEvent>
  setEvents: (events: DemoCareEvent[]) => void
  subscribeToEvents: (babyId: string) => () => void
  getEvents: (babyId: string, limit?: number) => DemoCareEvent[]
  getLatestEvent: (babyId: string) => DemoCareEvent | null
}

export const useCareEventStore = create<CareEventState>((set, get) => ({
  events: [],
  addEvent: async (event) => {
    const existingEventCount = get().events.filter((e) => e.babyId === event.babyId).length
    const savedEvent = await getEventsAdapter().createEvent(event)
    set((state) => ({
      events: [savedEvent, ...state.events.filter((e) => e.id !== savedEvent.id)],
    }))
    if (existingEventCount === 0) {
      trackEvent('first_care_event_logged', {
        babyId: savedEvent.babyId,
        type: savedEvent.type,
      })
    }
    return savedEvent
  },
  setEvents: (events) => set({ events }),
  subscribeToEvents: (babyId) =>
    getEventsAdapter().subscribeToEvents(babyId, (events) => set({ events })),
  getEvents: (babyId, limit) => {
    const { events } = get()
    const filtered = events
      .filter((e) => e.babyId === babyId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    return limit ? filtered.slice(0, limit) : filtered
  },
  getLatestEvent: (babyId) => {
    const { events } = get()
    return (
      events
        .filter((e) => e.babyId === babyId)
        .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0] || null
    )
  },
}))
