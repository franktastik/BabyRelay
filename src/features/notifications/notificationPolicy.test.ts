import { describe, expect, test } from 'bun:test'
import {
  applyQuietHours,
  buildReminderNotificationPlan,
  isNotificationAllowed,
  isWithinQuietHours,
  normalizePermissionState,
} from './notificationPolicy'

describe('notification policy', () => {
  test('normalizes permission states', () => {
    expect(normalizePermissionState({ status: 'undetermined' })).toBe('notAsked')
    expect(normalizePermissionState({ status: 'denied' })).toBe('denied')
    expect(normalizePermissionState({ status: 'granted', granted: true })).toBe('granted')
    expect(normalizePermissionState({ iosStatus: 3 })).toBe('limited')
    expect(normalizePermissionState({ iosStatus: 4 })).toBe('limited')
  })

  test('allows granted and limited notification states', () => {
    expect(isNotificationAllowed('granted')).toBe(true)
    expect(isNotificationAllowed('limited')).toBe(true)
    expect(isNotificationAllowed('notAsked')).toBe(false)
    expect(isNotificationAllowed('denied')).toBe(false)
  })

  test('detects overnight quiet hours', () => {
    const quietHours = { enabled: true, startHour: 22, endHour: 7 }

    expect(isWithinQuietHours(new Date('2026-05-24T22:30:00'), quietHours)).toBe(true)
    expect(isWithinQuietHours(new Date('2026-05-24T06:30:00'), quietHours)).toBe(true)
    expect(isWithinQuietHours(new Date('2026-05-24T08:30:00'), quietHours)).toBe(false)
  })

  test('delays non-critical reminders until quiet hours end', () => {
    const quietHours = { enabled: true, startHour: 22, endHour: 7 }
    const result = applyQuietHours(new Date('2026-05-24T23:15:00'), quietHours)

    expect(result.delayedForQuietHours).toBe(true)
    expect(result.scheduledAt.toISOString()).toBe('2026-05-25T07:00:00.000Z')
  })

  test('does not delay critical reminders', () => {
    const quietHours = { enabled: true, startHour: 22, endHour: 7 }
    const dueAt = new Date('2026-05-24T23:15:00')
    const result = applyQuietHours(dueAt, quietHours, true)

    expect(result.delayedForQuietHours).toBe(false)
    expect(result.scheduledAt.toISOString()).toBe(dueAt.toISOString())
  })

  test('builds caregiver-safe reminder notification content', () => {
    const plan = buildReminderNotificationPlan(
      {
        id: 'rem-1',
        title: 'Vitamin D Drops',
        category: 'medication',
        dueAt: new Date('2026-05-24T08:00:00'),
      },
      { enabled: true, startHour: 22, endHour: 7 }
    )

    expect(plan.title).toBe('BabyMinimo reminder')
    expect(plan.body).toBe('Vitamin D Drops is due soon.')
    expect(plan.body).not.toContain('note')
    expect(plan.data).toEqual({
      type: 'reminder',
      reminderId: 'rem-1',
      route: '/reminders',
    })
  })
})
