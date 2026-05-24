import {
  addDoc,
  collection,
  getDocs,
  limit as limitDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { firestore } from '@/src/lib/firebase'

export interface DemoCareEvent {
  id: string
  babyId: string
  type: 'breastfeed' | 'bottle' | 'diaper' | 'sleep' | 'medication'
  occurredAt: Date
  metadata: Record<string, unknown>
  createdBy: string
}

export interface DemoEventsAdapter {
  createEvent: (event: Omit<DemoCareEvent, 'id'>) => Promise<DemoCareEvent>
  getEvents: (babyId: string, limit?: number) => Promise<DemoCareEvent[]>
  subscribeToEvents: (
    babyId: string,
    callback: (events: DemoCareEvent[]) => void
  ) => () => void
}

const demoEvents: DemoCareEvent[] = [
  {
    id: 'evt-1',
    babyId: 'baby-1',
    type: 'breastfeed',
    occurredAt: new Date(Date.now() - 25 * 60 * 1000),
    metadata: { side: 'left', durationMin: 12 },
    createdBy: 'Mama',
  },
  {
    id: 'evt-2',
    babyId: 'baby-1',
    type: 'diaper',
    occurredAt: new Date(Date.now() - 55 * 60 * 1000),
    metadata: { kind: 'wet' },
    createdBy: 'Mama',
  },
  {
    id: 'evt-3',
    babyId: 'baby-1',
    type: 'sleep',
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { durationMin: 45 },
    createdBy: 'Dada',
  },
  {
    id: 'evt-4',
    babyId: 'baby-1',
    type: 'bottle',
    occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    metadata: { amountMl: 90, milkType: 'formula' },
    createdBy: 'Dada',
  },
]

type StoredCareEvent = {
  babyId?: string
  type?: DemoCareEvent['type']
  occurredAt?: Date | { toDate: () => Date }
  metadata?: Record<string, unknown>
  createdBy?: string
}

const careEventsCollection = () => collection(firestore, 'careEvents')
const careEventsForBabyQuery = (babyId: string, resultLimit?: number) => {
  const constraints = [
    where('babyId', '==', babyId),
    orderBy('occurredAt', 'desc'),
  ]

  return query(
    careEventsCollection(),
    ...(resultLimit ? [...constraints, limitDocs(resultLimit)] : constraints)
  )
}

const fallbackEventsForBaby = (babyId: string) =>
  demoEvents.map((event) => ({ ...event, babyId }))

const sortEvents = (events: DemoCareEvent[]) =>
  [...events].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())

const toDate = (value: StoredCareEvent['occurredAt']) => {
  if (!value) {
    return new Date()
  }
  if (value instanceof Date) {
    return value
  }
  return value.toDate()
}

const readSnapshotEvents = (
  docs: Array<{ id: string; data: () => StoredCareEvent }>,
  babyId: string
) => {
  const events = docs
    .map((document) => {
      const data = document.data()
      if (data.babyId !== babyId || !data.type) {
        return null
      }

      return {
        id: document.id,
        babyId,
        type: data.type,
        occurredAt: toDate(data.occurredAt),
        metadata: data.metadata || {},
        createdBy: data.createdBy || 'Caregiver',
      } satisfies DemoCareEvent
    })
    .filter((event): event is DemoCareEvent => Boolean(event))

  return sortEvents(events.length ? events : fallbackEventsForBaby(babyId))
}

export const createDemoEventsAdapter = (): DemoEventsAdapter => ({
  createEvent: async (event) => {
    const eventRef = await addDoc(careEventsCollection(), {
      ...event,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      ...event,
      id: eventRef.id,
    }
  },
  getEvents: async (babyId: string, limit?: number) => {
    try {
      const snapshot = await getDocs(careEventsForBabyQuery(babyId, limit))
      const events = readSnapshotEvents(snapshot.docs, babyId)
      return limit ? events.slice(0, limit) : events
    } catch {
      const events = sortEvents(fallbackEventsForBaby(babyId))
      return limit ? events.slice(0, limit) : events
    }
  },
  subscribeToEvents: (babyId: string, callback: (events: DemoCareEvent[]) => void) => {
    const unsubscribe = onSnapshot(
      careEventsForBabyQuery(babyId, 50),
      (snapshot) => {
        callback(readSnapshotEvents(snapshot.docs, babyId))
      },
      () => {
        callback(sortEvents(fallbackEventsForBaby(babyId)))
      }
    )

    return unsubscribe
  },
})
