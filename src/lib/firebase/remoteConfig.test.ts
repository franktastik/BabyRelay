import { describe, expect, test } from 'bun:test'
import {
  createRemoteConfigService,
  createStaticRemoteConfigProvider,
  type RemoteConfigProvider,
} from './remoteConfig'
import {
  assertRemoteConfigPricingBoundary,
  getRemoteConfigExposureProperties,
  remoteConfigDefaults,
  remoteConfigKeys,
  remoteConfigRegistry,
  validateRemoteConfigValues,
} from './remoteConfigRegistry'

describe('Firebase Remote Config registry', () => {
  test('defines typed defaults for every registered key', () => {
    expect(Object.keys(remoteConfigDefaults).sort()).toEqual(
      Object.keys(remoteConfigRegistry).sort()
    )
    expect(remoteConfigDefaults[remoteConfigKeys.onboardingVariantId]).toBe(
      'default'
    )
    expect(remoteConfigDefaults[remoteConfigKeys.maintenanceBannerEnabled]).toBe(
      false
    )
  })

  test('rejects unknown keys and invalid values without changing defaults', () => {
    const result = validateRemoteConfigValues({
      [remoteConfigKeys.paywallCopyVariantId]: 'annual-focus',
      [remoteConfigKeys.paywallLayoutVariantId]: 'price-9-99',
      [remoteConfigKeys.supportHelpCenterUrl]: 'http://insecure.example/help',
      [remoteConfigKeys.maintenanceBannerEnabled]: 'true',
      'security.authorizationBypass': true,
    })

    expect(result.values[remoteConfigKeys.paywallCopyVariantId]).toBe(
      'annual-focus'
    )
    expect(result.values[remoteConfigKeys.paywallLayoutVariantId]).toBe(
      remoteConfigDefaults[remoteConfigKeys.paywallLayoutVariantId]
    )
    expect(result.values[remoteConfigKeys.supportHelpCenterUrl]).toBe(
      remoteConfigDefaults[remoteConfigKeys.supportHelpCenterUrl]
    )
    expect(result.values[remoteConfigKeys.maintenanceBannerEnabled]).toBe(true)
    expect(result.ignoredKeys).toEqual([
      remoteConfigKeys.paywallLayoutVariantId,
      remoteConfigKeys.supportHelpCenterUrl,
      'security.authorizationBypass',
    ])
  })

  test('maps exposure properties only for experiment keys', () => {
    const exposure = getRemoteConfigExposureProperties(
      remoteConfigKeys.questionnaireVariantId,
      {
        ...remoteConfigDefaults,
        [remoteConfigKeys.questionnaireVariantId]: 'short',
      }
    )
    const supportExposure = getRemoteConfigExposureProperties(
      remoteConfigKeys.supportHelpCenterUrl,
      remoteConfigDefaults
    )

    expect(exposure).toEqual({
      remote_config_key: remoteConfigKeys.questionnaireVariantId,
      remote_config_value: 'short',
      remote_config_owner: 'Growth',
    })
    expect(supportExposure).toBeUndefined()
  })

  test('keeps pricing and entitlement source of truth out of Remote Config', () => {
    expect(() => assertRemoteConfigPricingBoundary()).not.toThrow()
  })
})

describe('Firebase Remote Config service', () => {
  test('boots with offline defaults before any fetch succeeds', () => {
    const service = createRemoteConfigService()

    expect(service.getAll()).toEqual(remoteConfigDefaults)
    expect(service.getValue(remoteConfigKeys.paywallLayoutVariantId)).toBe(
      'default'
    )
  })

  test('activates validated provider values and keeps ignored key receipt', async () => {
    const service = createRemoteConfigService({
      provider: createStaticRemoteConfigProvider({
        [remoteConfigKeys.onboardingVariantId]: 'sleep-first',
        [remoteConfigKeys.growthAlbumExportEnabled]: true,
        [remoteConfigKeys.maintenanceBannerSeverity]: 'critical',
      }),
    })

    const result = await service.refresh()

    expect(result.status).toBe('activated')
    expect(result.source).toBe('dev')
    expect(result.values[remoteConfigKeys.onboardingVariantId]).toBe('sleep-first')
    expect(result.values[remoteConfigKeys.growthAlbumExportEnabled]).toBe(true)
    expect(result.values[remoteConfigKeys.maintenanceBannerSeverity]).toBe('info')
    expect(result.ignoredKeys).toEqual([
      remoteConfigKeys.maintenanceBannerSeverity,
    ])
  })

  test('uses a fresh stale cache when fetch fails', async () => {
    let clock = 1000
    let shouldFail = false
    const provider: RemoteConfigProvider = {
      async fetchAndActivate() {
        if (shouldFail) {
          throw new Error('offline')
        }

        return {
          values: {
            [remoteConfigKeys.paywallLayoutVariantId]: 'comparison',
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
    clock = 3000
    const staleResult = await service.refresh()

    expect(staleResult.status).toBe('stale-cache')
    expect(staleResult.values[remoteConfigKeys.paywallLayoutVariantId]).toBe(
      'comparison'
    )
  })

  test('falls back to defaults when fetch fails and cache is stale', async () => {
    let clock = 1000
    let shouldFail = false
    const provider: RemoteConfigProvider = {
      async fetchAndActivate() {
        if (shouldFail) {
          throw new Error('offline')
        }

        return {
          values: {
            [remoteConfigKeys.notificationNudgeCopyVariantId]: 'direct',
          },
          fetchedAt: clock,
          source: 'firebase',
        }
      },
    }
    const service = createRemoteConfigService({
      provider,
      now: () => clock,
      staleAfterMs: 500,
    })

    await service.refresh()
    shouldFail = true
    clock = 2000
    const fallbackResult = await service.refresh()

    expect(fallbackResult.status).toBe('defaults')
    expect(
      fallbackResult.values[remoteConfigKeys.notificationNudgeCopyVariantId]
    ).toBe('default')
  })
})
