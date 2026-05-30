export type BabyMinimoAnalyticsEvent =
  | 'signup_completed'
  | 'onboarding_completed'
  | 'baby_created'
  | 'first_care_event_logged'
  | 'handoff_viewed'
  | 'reminder_created'
  | 'add_moment_used'
  | 'plan_screen_viewed'
  | 'sign_out_confirmed'
  | 'app_store_attribution_received'
  | 'feature_activated'

export interface AnalyticsRecord {
  name: BabyMinimoAnalyticsEvent
  properties?: Record<string, string | number | boolean | null>
  occurredAt: string
}

const analyticsEvents: AnalyticsRecord[] = []

export function trackEvent(
  name: BabyMinimoAnalyticsEvent,
  properties?: AnalyticsRecord['properties']
) {
  const record: AnalyticsRecord = {
    name,
    properties,
    occurredAt: new Date().toISOString(),
  }

  analyticsEvents.push(record)

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BabyMinimo analytics]', record)
  }
}

export function getAnalyticsEvents() {
  return [...analyticsEvents]
}

export function resetAnalyticsEvents() {
  analyticsEvents.length = 0
}
