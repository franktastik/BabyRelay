import { describe, expect, test } from 'bun:test'
import {
  getCanceledSubscriptionPurgeCandidate,
  getCanceledSubscriptionPurgeCandidates,
  type HeavyDataRecord,
} from './purgePolicy'

const now = new Date('2026-05-23T12:00:00.000Z')

const baseRecord: HeavyDataRecord = {
  id: 'heavy-1',
  kind: 'cloud_media',
  ownerUserId: 'user-1',
  subscriptionState: 'canceled',
  canceledAt: new Date('2026-02-01T12:00:00.000Z'),
  createdAt: new Date('2026-01-01T12:00:00.000Z'),
  bytes: 12_000_000,
}

describe('subscription purge policy', () => {
  test('returns cloud heavy-data after the canceled retention window', () => {
    const candidate = getCanceledSubscriptionPurgeCandidate(baseRecord, now)

    expect(candidate?.id).toBe('heavy-1')
    expect(candidate?.retentionDaysElapsed).toBe(111)
    expect(candidate?.reason).toContain('90-day heavy-data retention window')
  })

  test('does not purge active subscriptions', () => {
    const candidate = getCanceledSubscriptionPurgeCandidate(
      { ...baseRecord, subscriptionState: 'active' },
      now
    )

    expect(candidate).toBeNull()
  })

  test('does not purge before retention window expires', () => {
    const candidate = getCanceledSubscriptionPurgeCandidate(
      { ...baseRecord, canceledAt: new Date('2026-04-15T12:00:00.000Z') },
      now
    )

    expect(candidate).toBeNull()
  })

  test('does not classify local-only growth photos as cloud purge candidates', () => {
    const candidate = getCanceledSubscriptionPurgeCandidate(
      { ...baseRecord, kind: 'local_growth_photo' },
      now
    )

    expect(candidate).toBeNull()
  })

  test('filters a list down to eligible purge candidates', () => {
    const candidates = getCanceledSubscriptionPurgeCandidates(
      [
        baseRecord,
        { ...baseRecord, id: 'widget-1', kind: 'widget_snapshot' },
        { ...baseRecord, id: 'report-1', kind: 'generated_report' },
      ],
      now
    )

    expect(candidates.map((candidate) => candidate.id)).toEqual(['heavy-1', 'report-1'])
  })
})
