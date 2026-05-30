import { doc, getDoc, onSnapshot, type DocumentData } from 'firebase/firestore'
import { firestore } from '@/src/lib/firebase'

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

type LatestStateSlot = {
  occurredAt?: unknown
  createdBy?: string
  metadataPreview?: Record<string, unknown>
}

const latestStateDocRef = (babyId: string) => doc(firestore, 'babyLatestStates', babyId)

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return value
  }

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate()
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

const toNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const formatMinutes = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

const slotTime = (slot: LatestStateSlot | undefined) => toDate(slot?.occurredAt) ?? new Date()

const slotBy = (slot: LatestStateSlot | undefined, fallback: string | null) =>
  slot?.createdBy || fallback || demoSummary.lastActionBy || ''

const buildFeedSummary = (
  slot: LatestStateSlot | undefined,
  fallbackBy: string | null
): DemoHandoffSummary['lastFeed'] => {
  if (!slot) return null

  const metadata = slot.metadataPreview ?? {}
  const amountMl = toNumber(metadata.amountMl)
  const durationMin = toNumber(metadata.durationMin)
  const label = amountMl
    ? `${amountMl} ml`
    : durationMin
      ? formatMinutes(durationMin)
      : (demoSummary.lastFeed?.label ?? '')

  return {
    label,
    time: slotTime(slot),
    by: slotBy(slot, fallbackBy),
  }
}

const buildDiaperSummary = (
  slot: LatestStateSlot | undefined,
  fallbackBy: string | null
): DemoHandoffSummary['lastDiaper'] => {
  if (!slot) return null

  const kind = slot.metadataPreview?.kind
  const label = typeof kind === 'string' && kind.length > 0
    ? kind.charAt(0).toUpperCase() + kind.slice(1)
    : (demoSummary.lastDiaper?.label ?? '')

  return {
    label,
    time: slotTime(slot),
    by: slotBy(slot, fallbackBy),
  }
}

const buildSleepSummary = (
  slot: LatestStateSlot | undefined
): DemoHandoffSummary['lastSleep'] => {
  if (!slot) return null

  const durationMin = toNumber(slot.metadataPreview?.durationMin)
  const statusValue = slot.metadataPreview?.status
  const time = slotTime(slot)

  return {
    label: durationMin ? formatMinutes(durationMin) : (demoSummary.lastSleep?.label ?? ''),
    time,
    status: statusValue === 'awake' ? 'awake' : 'sleeping',
    startedAt: time,
  }
}

const mapLatestStateToHandoffSummary = (
  data: DocumentData | undefined
): DemoHandoffSummary => {
  if (!data) {
    return demoSummary
  }

  const lastActionBy = typeof data.lastActionBy === 'string' ? data.lastActionBy : demoSummary.lastActionBy
  const babyName = typeof data.babyName === 'string' && data.babyName.length > 0
    ? data.babyName
    : demoSummary.babyName

  return {
    babyName,
    lastFeed: buildFeedSummary(data.lastFeed, lastActionBy) ?? demoSummary.lastFeed,
    lastDiaper: buildDiaperSummary(data.lastDiaper, lastActionBy) ?? demoSummary.lastDiaper,
    lastSleep: buildSleepSummary(data.lastSleep) ?? demoSummary.lastSleep,
    nextMedication: demoSummary.nextMedication,
    latestNote: demoSummary.latestNote,
    lastActionBy,
  }
}

export const createDemoHandoffAdapter = (): DemoHandoffAdapter => ({
  getSummary: async (babyId: string) => {
    try {
      const snapshot = await getDoc(latestStateDocRef(babyId))
      return mapLatestStateToHandoffSummary(snapshot.exists() ? snapshot.data() : undefined)
    } catch {
      return demoSummary
    }
  },
  subscribeToSummary: (
    babyId: string,
    callback: (summary: DemoHandoffSummary) => void
  ) => {
    const unsubscribe = onSnapshot(
      latestStateDocRef(babyId),
      (snapshot) => {
        callback(mapLatestStateToHandoffSummary(snapshot.exists() ? snapshot.data() : undefined))
      },
      () => callback(demoSummary)
    )

    return unsubscribe
  },
})
