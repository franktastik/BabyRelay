export const NOTIFICATION_DELIVERY_LOG_TTL_MS = 30 * 24 * 60 * 60 * 1000

export interface NotificationDeliveryLogRecord {
  id: string
  babyId: string
  householdId: string
  deliveredAt: Date
  expiresAt?: Date
}

export interface NotificationDeliveryLogCleanupPlan {
  cutoff: Date
  expiredIds: string[]
  retainedIds: string[]
}

export const getNotificationDeliveryLogCleanupCutoff = (now = new Date()) =>
  new Date(now.getTime() - NOTIFICATION_DELIVERY_LOG_TTL_MS)

export const getNotificationDeliveryLogExpiresAt = (deliveredAt: Date) =>
  new Date(deliveredAt.getTime() + NOTIFICATION_DELIVERY_LOG_TTL_MS)

export const shouldRetainNotificationDeliveryLog = (
  log: NotificationDeliveryLogRecord,
  now = new Date()
) => {
  const expiresAt = log.expiresAt ?? getNotificationDeliveryLogExpiresAt(log.deliveredAt)
  return expiresAt.getTime() > now.getTime()
}

export const buildNotificationDeliveryLogCleanupPlan = (
  logs: NotificationDeliveryLogRecord[],
  now = new Date()
): NotificationDeliveryLogCleanupPlan => {
  const expiredIds: string[] = []
  const retainedIds: string[] = []

  for (const log of logs) {
    if (shouldRetainNotificationDeliveryLog(log, now)) {
      retainedIds.push(log.id)
    } else {
      expiredIds.push(log.id)
    }
  }

  return {
    cutoff: getNotificationDeliveryLogCleanupCutoff(now),
    expiredIds,
    retainedIds,
  }
}
