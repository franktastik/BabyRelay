export type BabyMinimoActivityType =
  | 'care_event_logged'
  | 'reminder_created'
  | 'growth_moment_added'
  | 'handoff_viewed'
  | 'baby_selected'
  | 'baby_created'

export interface BabyMinimoActivityItem {
  id: string
  babyId: string
  type: BabyMinimoActivityType
  label: string
  detail?: string
  occurredAt: Date
  metadata?: Record<string, string | number | boolean | null>
}

export interface BabyMinimoActivitySummary {
  babyId: string
  todayCount: number
  careEventsToday: number
  remindersToday: number
  momentsToday: number
  lastActivity: BabyMinimoActivityItem | null
}

export const BABY_MINIMO_ACTIVITY_RETENTION_LIMIT = 120

export const isSameLocalDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

export const trimBabyMinimoActivities = (items: BabyMinimoActivityItem[]) =>
  [...items]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, BABY_MINIMO_ACTIVITY_RETENTION_LIMIT)

export const summarizeBabyMinimoActivity = (
  babyId: string,
  items: BabyMinimoActivityItem[],
  now = new Date()
): BabyMinimoActivitySummary => {
  const scoped = trimBabyMinimoActivities(items.filter((item) => item.babyId === babyId))
  const today = scoped.filter((item) => isSameLocalDay(item.occurredAt, now))

  return {
    babyId,
    todayCount: today.length,
    careEventsToday: today.filter((item) => item.type === 'care_event_logged').length,
    remindersToday: today.filter((item) => item.type === 'reminder_created').length,
    momentsToday: today.filter((item) => item.type === 'growth_moment_added').length,
    lastActivity: scoped[0] ?? null,
  }
}

export const activityAgeLabel = (date: Date, now = new Date()) => {
  const diffMs = Math.max(0, now.getTime() - date.getTime())
  const diffMin = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))}d ago`
}
