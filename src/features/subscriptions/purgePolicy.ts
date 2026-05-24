export type SubscriptionState = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'

export type HeavyDataKind =
  | 'cloud_media'
  | 'export_archive'
  | 'generated_report'
  | 'widget_snapshot'
  | 'local_growth_photo'

export type HeavyDataRecord = {
  id: string
  kind: HeavyDataKind
  ownerUserId: string
  subscriptionState: SubscriptionState
  canceledAt: Date | null
  createdAt: Date
  bytes: number
}

export type PurgeCandidate = HeavyDataRecord & {
  retentionDaysElapsed: number
  reason: string
}

export const DEFAULT_CANCELED_SUBSCRIPTION_HEAVY_DATA_RETENTION_DAYS = 90

const elapsedDays = (from: Date, to: Date) =>
  Math.floor((to.getTime() - from.getTime()) / 86_400_000)

export const isHeavyDataKind = (kind: HeavyDataKind) =>
  kind === 'cloud_media' || kind === 'export_archive' || kind === 'generated_report'

export const getCanceledSubscriptionPurgeCandidate = (
  record: HeavyDataRecord,
  now: Date = new Date(),
  retentionDays = DEFAULT_CANCELED_SUBSCRIPTION_HEAVY_DATA_RETENTION_DAYS
): PurgeCandidate | null => {
  if (record.subscriptionState !== 'canceled' && record.subscriptionState !== 'expired') {
    return null
  }

  if (!record.canceledAt) {
    return null
  }

  if (!isHeavyDataKind(record.kind)) {
    return null
  }

  const retentionDaysElapsed = elapsedDays(record.canceledAt, now)
  if (retentionDaysElapsed < retentionDays) {
    return null
  }

  return {
    ...record,
    retentionDaysElapsed,
    reason: `Subscription has been ${record.subscriptionState} for ${retentionDaysElapsed} days; ${record.kind} exceeds the ${retentionDays}-day heavy-data retention window.`,
  }
}

export const getCanceledSubscriptionPurgeCandidates = (
  records: HeavyDataRecord[],
  now: Date = new Date(),
  retentionDays = DEFAULT_CANCELED_SUBSCRIPTION_HEAVY_DATA_RETENTION_DAYS
) =>
  records
    .map((record) => getCanceledSubscriptionPurgeCandidate(record, now, retentionDays))
    .filter((record): record is PurgeCandidate => Boolean(record))
