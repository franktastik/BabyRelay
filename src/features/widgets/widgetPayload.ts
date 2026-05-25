import type { DemoHandoffSummary } from '@/src/features/demo/handoff'
import type { DemoReminder } from '@/src/features/demo/reminders'

export const BABY_MINIMO_WIDGET_SCHEMA_VERSION = 1
export const WIDGET_STALE_AFTER_MS = 15 * 60 * 1000
export const WIDGET_MAX_VISIBLE_AGE_MS = 4 * 60 * 60 * 1000

export type WidgetPayloadState =
  | 'signedOut'
  | 'disabled'
  | 'noSelectedBaby'
  | 'empty'
  | 'ready'
  | 'stale'
  | 'expired'

export type WidgetSurface = 'homeScreen' | 'lockScreen'
export type WidgetSnapshotSource = 'emulator' | 'production' | 'localDemo'

export interface WidgetCareSummary {
  label: string
  occurredAt: string
  by: string
}

export interface WidgetSleepSummary extends WidgetCareSummary {
  status: 'sleeping' | 'awake' | 'unknown'
  startedAt: string | null
}

export interface WidgetDueSoonSummary {
  title: string
  dueAt: string
  dueLabel: string
  category: DemoReminder['category']
}

export interface WidgetBabyState {
  babyId: string
  babyName: string
  currentStatus: 'sleeping' | 'awake' | 'unknown'
  statusSince: string | null
  lastFeed: WidgetCareSummary | null
  lastDiaper: WidgetCareSummary | null
  lastSleep: WidgetSleepSummary | null
  dueSoon: WidgetDueSoonSummary | null
}

export interface WidgetPayloadBase {
  schemaVersion: typeof BABY_MINIMO_WIDGET_SCHEMA_VERSION
  state: WidgetPayloadState
  generatedAt: string
  lastSyncedAt: string | null
  expiresAt: string | null
  source: WidgetSnapshotSource
  surface: WidgetSurface
  privacy: {
    hidesNotes: true
    hidesGrowthPhotos: true
    hidesAccountData: true
    hidesHouseholdIds: true
  }
}

export type BabyMinimoWidgetPayload =
  | (WidgetPayloadBase & {
      state: 'signedOut'
      baby: null
      message: 'Sign in to BabyMinimo to see your baby care snapshot.'
    })
  | (WidgetPayloadBase & {
      state: 'disabled'
      baby: null
      message: 'Widget updates are off on this device.'
    })
  | (WidgetPayloadBase & {
      state: 'noSelectedBaby'
      baby: null
      message: 'Choose a baby in BabyMinimo to show widget updates.'
    })
  | (WidgetPayloadBase & {
      state: 'empty' | 'ready' | 'stale' | 'expired'
      baby: WidgetBabyState
      staleSince: string | null
      message: string | null
    })

export interface BuildWidgetPayloadInput {
  signedIn: boolean
  widgetUpdatesEnabled?: boolean
  selectedBabyId: string | null
  babyName?: string | null
  handoffSummary?: DemoHandoffSummary | null
  reminders?: DemoReminder[]
  source?: WidgetSnapshotSource
  surface?: WidgetSurface
  generatedAt?: Date
  lastSyncedAt?: Date
}

const privacy = {
  hidesNotes: true,
  hidesGrowthPhotos: true,
  hidesAccountData: true,
  hidesHouseholdIds: true,
} as const

const toIso = (date: Date) => date.toISOString()

const createBasePayload = (
  input: BuildWidgetPayloadInput,
  generatedAt: Date,
  lastSyncedAt: Date | null
): WidgetPayloadBase => ({
  schemaVersion: BABY_MINIMO_WIDGET_SCHEMA_VERSION,
  state: 'empty',
  generatedAt: toIso(generatedAt),
  lastSyncedAt: lastSyncedAt ? toIso(lastSyncedAt) : null,
  expiresAt: lastSyncedAt
    ? toIso(new Date(lastSyncedAt.getTime() + WIDGET_MAX_VISIBLE_AGE_MS))
    : null,
  source: input.source ?? 'emulator',
  surface: input.surface ?? 'homeScreen',
  privacy,
})

const toCareSummary = (
  value: DemoHandoffSummary['lastFeed'] | DemoHandoffSummary['lastDiaper']
): WidgetCareSummary | null => {
  if (!value) {
    return null
  }

  return {
    label: value.label,
    occurredAt: toIso(value.time),
    by: value.by,
  }
}

const toSleepSummary = (
  value: DemoHandoffSummary['lastSleep']
): WidgetSleepSummary | null => {
  if (!value) {
    return null
  }

  return {
    label: value.label,
    occurredAt: toIso(value.time),
    by: 'Caregiver',
    status: value.status,
    startedAt: value.startedAt ? toIso(value.startedAt) : null,
  }
}

const getDueSoon = (
  reminders: DemoReminder[],
  now: Date
): WidgetDueSoonSummary | null => {
  const activeUpcoming = reminders
    .filter((reminder) => reminder.active && reminder.dueAt.getTime() >= now.getTime())
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())

  const reminder = activeUpcoming[0]
  if (!reminder) {
    return null
  }

  return {
    title: reminder.title,
    dueAt: toIso(reminder.dueAt),
    dueLabel: reminder.dueLabel,
    category: reminder.category,
  }
}

const getFreshnessState = (
  lastSyncedAt: Date | null,
  generatedAt: Date,
  hasData: boolean
): { state: 'empty' | 'ready' | 'stale' | 'expired'; staleSince: string | null; message: string | null } => {
  if (!hasData) {
    return {
      state: 'empty',
      staleSince: null,
      message: 'No care events yet.',
    }
  }

  if (!lastSyncedAt) {
    return {
      state: 'ready',
      staleSince: null,
      message: null,
    }
  }

  const ageMs = generatedAt.getTime() - lastSyncedAt.getTime()
  if (ageMs > WIDGET_MAX_VISIBLE_AGE_MS) {
    return {
      state: 'expired',
      staleSince: toIso(new Date(lastSyncedAt.getTime() + WIDGET_STALE_AFTER_MS)),
      message: 'Open BabyMinimo to refresh.',
    }
  }

  if (ageMs > WIDGET_STALE_AFTER_MS) {
    return {
      state: 'stale',
      staleSince: toIso(new Date(lastSyncedAt.getTime() + WIDGET_STALE_AFTER_MS)),
      message: 'Widget may be out of date.',
    }
  }

  return {
    state: 'ready',
    staleSince: null,
    message: null,
  }
}

export const buildBabyMinimoWidgetPayload = (
  input: BuildWidgetPayloadInput
): BabyMinimoWidgetPayload => {
  const generatedAt = input.generatedAt ?? new Date()
  const lastSyncedAt = input.lastSyncedAt ?? generatedAt
  const base = createBasePayload(input, generatedAt, lastSyncedAt)

  if (!input.signedIn) {
    return {
      ...base,
      state: 'signedOut',
      baby: null,
      message: 'Sign in to BabyMinimo to see your baby care snapshot.',
    }
  }

  if (input.widgetUpdatesEnabled === false) {
    return {
      ...base,
      state: 'disabled',
      baby: null,
      message: 'Widget updates are off on this device.',
    }
  }

  if (!input.selectedBabyId) {
    return {
      ...base,
      state: 'noSelectedBaby',
      baby: null,
      message: 'Choose a baby in BabyMinimo to show widget updates.',
    }
  }

  const summary = input.handoffSummary
  const lastFeed = toCareSummary(summary?.lastFeed ?? null)
  const lastDiaper = toCareSummary(summary?.lastDiaper ?? null)
  const lastSleep = toSleepSummary(summary?.lastSleep ?? null)
  const dueSoon = getDueSoon(input.reminders ?? [], generatedAt)
  const hasData = Boolean(lastFeed || lastDiaper || lastSleep || dueSoon)
  const freshness = getFreshnessState(lastSyncedAt, generatedAt, hasData)

  return {
    ...base,
    state: freshness.state,
    baby: {
      babyId: input.selectedBabyId,
      babyName: input.babyName || summary?.babyName || 'Baby',
      currentStatus: summary?.lastSleep?.status ?? 'unknown',
      statusSince: summary?.lastSleep?.startedAt ? toIso(summary.lastSleep.startedAt) : null,
      lastFeed,
      lastDiaper,
      lastSleep,
      dueSoon,
    },
    staleSince: freshness.staleSince,
    message: freshness.message,
  }
}

export const widgetPayloadToJson = (payload: BabyMinimoWidgetPayload) =>
  JSON.stringify(payload)
