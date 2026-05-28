import { describe, expect, test } from 'bun:test'
import {
  BABY_MINIMO_ACTIVITY_RETENTION_LIMIT,
  type BabyMinimoActivityItem,
  activityAgeLabel,
  summarizeBabyMinimoActivity,
  trimBabyMinimoActivities,
} from './activityModel'

const item = (
  id: string,
  babyId: string,
  type: BabyMinimoActivityItem['type'],
  occurredAt: string
): BabyMinimoActivityItem => ({
  id,
  babyId,
  type,
  label: type,
  occurredAt: new Date(occurredAt),
})

describe('BabyMinimo activity model', () => {
  test('summarizes activity by selected baby and local day', () => {
    const summary = summarizeBabyMinimoActivity(
      'baby-1',
      [
        item('1', 'baby-1', 'care_event_logged', '2026-05-25T09:00:00.000Z'),
        item('2', 'baby-1', 'reminder_created', '2026-05-25T10:00:00.000Z'),
        item('3', 'baby-1', 'growth_moment_added', '2026-05-24T10:00:00.000Z'),
        item('4', 'baby-2', 'care_event_logged', '2026-05-25T11:00:00.000Z'),
      ],
      new Date('2026-05-25T12:00:00.000Z')
    )

    expect(summary.todayCount).toBe(2)
    expect(summary.careEventsToday).toBe(1)
    expect(summary.remindersToday).toBe(1)
    expect(summary.momentsToday).toBe(0)
    expect(summary.lastActivity?.id).toBe('2')
  })

  test('trims activity to the retention limit', () => {
    const items = Array.from({ length: BABY_MINIMO_ACTIVITY_RETENTION_LIMIT + 5 }, (_, index) =>
      item(`${index}`, 'baby-1', 'care_event_logged', new Date(Date.UTC(2026, 4, 25, 0, index, 0)).toISOString())
    )

    expect(trimBabyMinimoActivities(items)).toHaveLength(BABY_MINIMO_ACTIVITY_RETENTION_LIMIT)
  })

  test('formats gentle relative ages', () => {
    expect(activityAgeLabel(new Date('2026-05-25T11:40:00.000Z'), new Date('2026-05-25T12:00:00.000Z'))).toBe('20m ago')
    expect(activityAgeLabel(new Date('2026-05-25T09:00:00.000Z'), new Date('2026-05-25T12:00:00.000Z'))).toBe('3h ago')
  })
})
