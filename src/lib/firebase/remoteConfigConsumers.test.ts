import { describe, expect, test } from 'bun:test'
import {
  buildRemoteConfigConsumerControls,
  getRemoteConfigConsumerControls,
} from './remoteConfigConsumers'
import {
  createRemoteConfigService,
  createStaticRemoteConfigProvider,
  type RemoteConfigProvider,
} from './remoteConfig'
import { remoteConfigDefaults, remoteConfigKeys } from './remoteConfigRegistry'

describe('Remote Config consumer controls', () => {
  test('maps defaults into low-risk consumer controls', () => {
    const controls = buildRemoteConfigConsumerControls(remoteConfigDefaults)

    expect(controls.onboarding).toEqual({
      variantId: 'default',
      questionnaireVariantId: 'default',
    })
    expect(controls.paywall).toEqual({
      copyVariantId: 'default',
      layoutVariantId: 'default',
      pricingSource: 'storekit',
      remotePricesAllowed: false,
    })
    expect(controls.notifications).toEqual({
      nudgeCopyVariantId: 'default',
      rateLimitVariantId: 'default',
      respectsQuietHours: true,
      respectsOptOut: true,
    })
    expect(controls.maintenance).toEqual({
      enabled: false,
      severity: 'info',
      messageKey: 'maintenance.default',
      blocking: false,
    })
  })

  test('maps activated values without allowing Remote Config pricing', async () => {
    const service = createRemoteConfigService({
      provider: createStaticRemoteConfigProvider({
        [remoteConfigKeys.onboardingVariantId]: 'partner-first',
        [remoteConfigKeys.questionnaireVariantId]: 'short',
        [remoteConfigKeys.paywallCopyVariantId]: 'annual-focus',
        [remoteConfigKeys.paywallLayoutVariantId]: 'comparison',
        [remoteConfigKeys.notificationNudgeCopyVariantId]: 'gentle',
        [remoteConfigKeys.notificationRateLimitVariantId]: 'reduced',
        [remoteConfigKeys.supportHelpCenterUrl]: 'https://support.example/help',
        [remoteConfigKeys.supportContactUrl]: 'https://support.example/contact',
        [remoteConfigKeys.maintenanceBannerEnabled]: true,
        [remoteConfigKeys.maintenanceBannerSeverity]: 'warning',
        [remoteConfigKeys.maintenanceBannerMessageKey]: 'maintenance.incident',
        [remoteConfigKeys.localizationMetadataVersion]: '2026-06-01',
        [remoteConfigKeys.asoCampaignLabel]: 'sleep-tracker',
        [remoteConfigKeys.growthAlbumExportEnabled]: true,
      }),
    })

    await service.refresh()
    const controls = getRemoteConfigConsumerControls(service)

    expect(controls.onboarding.variantId).toBe('partner-first')
    expect(controls.onboarding.questionnaireVariantId).toBe('short')
    expect(controls.paywall.copyVariantId).toBe('annual-focus')
    expect(controls.paywall.layoutVariantId).toBe('comparison')
    expect(controls.paywall.pricingSource).toBe('storekit')
    expect(controls.paywall.remotePricesAllowed).toBe(false)
    expect(controls.notifications.nudgeCopyVariantId).toBe('gentle')
    expect(controls.notifications.rateLimitVariantId).toBe('reduced')
    expect(controls.notifications.respectsQuietHours).toBe(true)
    expect(controls.notifications.respectsOptOut).toBe(true)
    expect(controls.support.helpCenterUrl).toBe('https://support.example/help')
    expect(controls.maintenance).toEqual({
      enabled: true,
      severity: 'warning',
      messageKey: 'maintenance.incident',
      blocking: false,
    })
    expect(controls.featureRollouts.growthAlbumExportEnabled).toBe(true)
  })

  test('falls back invalid consumer values to safe defaults', async () => {
    const service = createRemoteConfigService({
      provider: createStaticRemoteConfigProvider({
        [remoteConfigKeys.paywallLayoutVariantId]: 'price-led',
        [remoteConfigKeys.supportContactUrl]: 'mailto:support@example.com',
        [remoteConfigKeys.notificationRateLimitVariantId]: 'unlimited',
        [remoteConfigKeys.maintenanceBannerSeverity]: 'critical',
        [remoteConfigKeys.maintenanceBannerMessageKey]: '',
      }),
    })

    await service.refresh()
    const controls = getRemoteConfigConsumerControls(service)

    expect(controls.paywall.layoutVariantId).toBe('default')
    expect(controls.support.contactUrl).toBe(
      remoteConfigDefaults[remoteConfigKeys.supportContactUrl]
    )
    expect(controls.notifications.rateLimitVariantId).toBe('default')
    expect(controls.maintenance.severity).toBe('info')
    expect(controls.maintenance.messageKey).toBe('maintenance.default')
  })

  test('keeps consumer controls on stale cache after a failed fetch', async () => {
    let clock = 100
    let shouldFail = false
    const provider: RemoteConfigProvider = {
      async fetchAndActivate() {
        if (shouldFail) {
          throw new Error('offline')
        }

        return {
          values: {
            [remoteConfigKeys.paywallCopyVariantId]: 'value-led',
            [remoteConfigKeys.maintenanceBannerEnabled]: true,
          },
          fetchedAt: clock,
          source: 'firebase',
        }
      },
    }
    const service = createRemoteConfigService({
      provider,
      now: () => clock,
      staleAfterMs: 5000,
    })

    await service.refresh()
    shouldFail = true
    clock = 200
    const result = await service.refresh()
    const controls = getRemoteConfigConsumerControls(service)

    expect(result.status).toBe('stale-cache')
    expect(controls.paywall.copyVariantId).toBe('value-led')
    expect(controls.maintenance.enabled).toBe(true)
  })

  test('exposes analytics-ready experiment IDs only for experiment surfaces', async () => {
    const service = createRemoteConfigService({
      provider: createStaticRemoteConfigProvider({
        [remoteConfigKeys.questionnaireVariantId]: 'care-circle-first',
        [remoteConfigKeys.supportHelpCenterUrl]: 'https://support.example/help',
      }),
    })

    await service.refresh()
    const controls = getRemoteConfigConsumerControls(service)

    expect(controls.experimentExposures).toContainEqual({
      key: remoteConfigKeys.questionnaireVariantId,
      value: 'care-circle-first',
      owner: 'Growth',
    })
    expect(
      controls.experimentExposures.some(
        (exposure) => exposure.key === remoteConfigKeys.supportHelpCenterUrl
      )
    ).toBe(false)
  })
})
