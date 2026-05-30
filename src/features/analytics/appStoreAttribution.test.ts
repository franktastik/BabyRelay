import { describe, expect, test } from 'bun:test'
import { getAnalyticsEvents, resetAnalyticsEvents } from './analytics'
import {
  trackAppStoreAttribution,
  trackAppStoreFeatureActivation,
} from './appStoreAttribution'

describe('App Store attribution analytics', () => {
  test('records Custom Product Page attribution with stable property names', () => {
    resetAnalyticsEvents()

    trackAppStoreAttribution({
      appStorePage: 'sleep_tracker',
      campaignSource: 'tiktok',
      campaignAngle: 'sleep_tracking',
      locale: 'en-US',
    })

    expect(getAnalyticsEvents()).toEqual([
      expect.objectContaining({
        name: 'app_store_attribution_received',
        properties: {
          app_store_page: 'sleep_tracker',
          campaign_source: 'tiktok',
          campaign_angle: 'sleep_tracking',
          locale: 'en-US',
        },
      }),
    ])
  })

  test('records promised-feature activation and time to activation', () => {
    resetAnalyticsEvents()

    trackAppStoreFeatureActivation({
      feature: 'sleep_log_created',
      appStorePage: 'sleep_tracker',
      campaignSource: 'apple_search_ads',
      campaignAngle: 'sleep_tracking',
      locale: 'en-US',
      attributedAt: '2026-05-29T09:00:00.000Z',
      activatedAt: '2026-05-29T09:04:31.000Z',
    })

    expect(getAnalyticsEvents()).toEqual([
      expect.objectContaining({
        name: 'feature_activated',
        properties: {
          feature: 'sleep_log_created',
          app_store_page: 'sleep_tracker',
          campaign_source: 'apple_search_ads',
          campaign_angle: 'sleep_tracking',
          locale: 'en-US',
          time_to_activation_minutes: 5,
        },
      }),
    ])
  })

  test('keeps activation timing nullable when attribution timing is unavailable', () => {
    resetAnalyticsEvents()

    trackAppStoreFeatureActivation({
      feature: 'growth_moment_added',
      appStorePage: 'memories_milestones',
    })

    expect(getAnalyticsEvents()[0].properties).toEqual({
      feature: 'growth_moment_added',
      app_store_page: 'memories_milestones',
      campaign_source: null,
      campaign_angle: null,
      locale: null,
      time_to_activation_minutes: null,
    })
  })
})
