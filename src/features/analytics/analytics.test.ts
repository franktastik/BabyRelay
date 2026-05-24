import { describe, expect, test } from 'bun:test'
import { getAnalyticsEvents, resetAnalyticsEvents, trackEvent } from './analytics'

describe('analytics event buffer', () => {
  test('records ordered events with timestamps and returns defensive copies', () => {
    resetAnalyticsEvents()

    expect(getAnalyticsEvents()).toEqual([])

    trackEvent('signup_completed', { userId: 'user-1' })
    trackEvent('baby_created', { babyId: 'baby-1', householdId: 'household-1' })

    const events = getAnalyticsEvents()

    expect(events).toHaveLength(2)
    expect(events[0].name).toBe('signup_completed')
    expect(events[1].properties).toEqual({
      babyId: 'baby-1',
      householdId: 'household-1',
    })
    expect(events[0].occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    events.push({
      name: 'sign_out_confirmed',
      occurredAt: new Date().toISOString(),
    })

    expect(getAnalyticsEvents()).toHaveLength(2)
  })

  test('reset clears recorded analytics events', () => {
    trackEvent('handoff_viewed')
    resetAnalyticsEvents()

    expect(getAnalyticsEvents()).toHaveLength(0)
  })
})
