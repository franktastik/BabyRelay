import { describe, expect, test } from 'bun:test'
import {
  NOTIFICATION_DELIVERY_LOG_TTL_MS,
  buildNotificationDeliveryLogCleanupPlan,
  getNotificationDeliveryLogExpiresAt,
} from './deliveryLogPolicy'

describe('notification delivery log TTL policy', () => {
  test('assigns a finite local cleanup window for delivery records', () => {
    const deliveredAt = new Date('2026-05-01T10:00:00.000Z')

    expect(getNotificationDeliveryLogExpiresAt(deliveredAt)).toEqual(
      new Date(deliveredAt.getTime() + NOTIFICATION_DELIVERY_LOG_TTL_MS)
    )
  })

  test('separates expired and retained delivery logs', () => {
    const now = new Date('2026-06-01T10:00:00.000Z')
    const plan = buildNotificationDeliveryLogCleanupPlan(
      [
        {
          id: 'expired-by-delivery-time',
          babyId: 'baby-1',
          householdId: 'household-1',
          deliveredAt: new Date('2026-04-01T10:00:00.000Z'),
        },
        {
          id: 'retained',
          babyId: 'baby-1',
          householdId: 'household-1',
          deliveredAt: new Date('2026-05-20T10:00:00.000Z'),
        },
        {
          id: 'expired-by-explicit-ttl',
          babyId: 'baby-2',
          householdId: 'household-2',
          deliveredAt: new Date('2026-05-31T10:00:00.000Z'),
          expiresAt: new Date('2026-05-31T11:00:00.000Z'),
        },
      ],
      now
    )

    expect(plan.expiredIds).toEqual([
      'expired-by-delivery-time',
      'expired-by-explicit-ttl',
    ])
    expect(plan.retainedIds).toEqual(['retained'])
  })
})
