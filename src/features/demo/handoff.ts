export interface DemoHandoffSummary {
  babyName: string
  lastFeed: { label: string; time: Date; by: string } | null
  lastDiaper: { label: string; time: Date; by: string } | null
  lastSleep: { label: string; time: Date; status: 'sleeping' | 'awake'; startedAt?: Date } | null
  nextMedication: { label: string; dueAt: Date } | null
  latestNote: { content: string; time: Date; by: string } | null
  lastActionBy: string | null
}

export interface DemoHandoffAdapter {
  getSummary: (babyId: string) => Promise<DemoHandoffSummary>
  subscribeToSummary: (
    babyId: string,
    callback: (summary: DemoHandoffSummary) => void
  ) => () => void
}

const now = Date.now()

const demoSummary: DemoHandoffSummary = {
  babyName: 'Liam James',
  lastFeed: {
    label: '4.5 oz',
    time: new Date(now - 2 * 60 * 60 * 1000 - 15 * 60 * 1000),
    by: 'Mama',
  },
  lastDiaper: {
    label: 'Wet',
    time: new Date(now - 48 * 60 * 1000),
    by: 'Mama',
  },
  lastSleep: {
    label: '1h 12m',
    time: new Date(now - 72 * 60 * 1000),
    status: 'sleeping',
    startedAt: new Date(now - 72 * 60 * 1000),
  },
  nextMedication: {
    label: 'Vitamin D Drops',
    dueAt: new Date(new Date(now).setHours(8, 0, 0, 0)),
  },
  latestNote: {
    content: 'Settled quickly after the last feed. Keep the room dim if he stirs.',
    time: new Date(now - 35 * 60 * 1000),
    by: 'Mama',
  },
  lastActionBy: 'Mama',
}

export const createDemoHandoffAdapter = (): DemoHandoffAdapter => ({
  getSummary: async (_babyId: string) => {
    return demoSummary
  },
  subscribeToSummary: (
    _babyId: string,
    callback: (summary: DemoHandoffSummary) => void
  ) => {
    callback(demoSummary)
    return () => {}
  },
})
