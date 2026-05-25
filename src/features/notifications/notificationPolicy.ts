export type BabyMinimoNotificationPermissionState =
  | 'notAsked'
  | 'granted'
  | 'denied'
  | 'limited'

export type BabyMinimoReminderCategory = 'feed' | 'medication' | 'sleep' | 'custom'

export interface BabyMinimoReminderNotificationInput {
  id: string
  title: string
  category: BabyMinimoReminderCategory
  dueAt: Date
  critical?: boolean
}

export interface BabyMinimoQuietHours {
  enabled: boolean
  startHour: number
  endHour: number
}

export interface BabyMinimoReminderNotificationPlan {
  reminderId: string
  category: BabyMinimoReminderCategory
  scheduledAt: Date
  title: string
  body: string
  data: {
    type: 'reminder'
    reminderId: string
    route: '/reminders'
  }
  delayedForQuietHours: boolean
}

const DEFAULT_QUIET_HOURS: BabyMinimoQuietHours = {
  enabled: true,
  startHour: 22,
  endHour: 7,
}

export function normalizePermissionState(input: {
  status?: string
  granted?: boolean
  iosStatus?: number
}): BabyMinimoNotificationPermissionState {
  if (input.granted || input.status === 'granted' || input.iosStatus === 2) {
    return 'granted'
  }

  if (input.iosStatus === 3 || input.iosStatus === 4) {
    return 'limited'
  }

  if (input.status === 'denied' || input.iosStatus === 1) {
    return 'denied'
  }

  return 'notAsked'
}

export function isNotificationAllowed(state: BabyMinimoNotificationPermissionState) {
  return state === 'granted' || state === 'limited'
}

export function isWithinQuietHours(date: Date, quietHours = DEFAULT_QUIET_HOURS) {
  if (!quietHours.enabled) {
    return false
  }

  const hour = date.getHours()

  if (quietHours.startHour === quietHours.endHour) {
    return false
  }

  if (quietHours.startHour < quietHours.endHour) {
    return hour >= quietHours.startHour && hour < quietHours.endHour
  }

  return hour >= quietHours.startHour || hour < quietHours.endHour
}

export function applyQuietHours(
  scheduledAt: Date,
  quietHours = DEFAULT_QUIET_HOURS,
  critical = false
) {
  const delayedAt = new Date(scheduledAt)

  if (critical || !isWithinQuietHours(delayedAt, quietHours)) {
    return { scheduledAt: delayedAt, delayedForQuietHours: false }
  }

  if (delayedAt.getHours() >= quietHours.startHour) {
    delayedAt.setDate(delayedAt.getDate() + 1)
  }

  delayedAt.setHours(quietHours.endHour, 0, 0, 0)

  return { scheduledAt: delayedAt, delayedForQuietHours: true }
}

export function buildReminderNotificationPlan(
  reminder: BabyMinimoReminderNotificationInput,
  quietHours = DEFAULT_QUIET_HOURS
): BabyMinimoReminderNotificationPlan {
  const { scheduledAt, delayedForQuietHours } = applyQuietHours(
    reminder.dueAt,
    quietHours,
    reminder.critical
  )

  return {
    reminderId: reminder.id,
    category: reminder.category,
    scheduledAt,
    title: babyMinimoI18n.t('notifications.reminder.title'),
    body: babyMinimoI18n.t('notifications.reminder.body', { title: reminder.title }),
    data: {
      type: 'reminder',
      reminderId: reminder.id,
      route: '/reminders',
    },
    delayedForQuietHours,
  }
}

export function getDefaultQuietHours() {
  return { ...DEFAULT_QUIET_HOURS }
}
import { babyMinimoI18n } from '@/src/localization'
