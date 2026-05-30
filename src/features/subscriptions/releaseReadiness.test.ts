import { describe, expect, test } from 'bun:test'
import {
  PBI055_RELEASE_GATES,
  assertIapCheckoutBoundary,
  summarizeIapReleaseReadiness,
} from './releaseReadiness'

describe('PBI-055 IAP release readiness', () => {
  test('records automated, manual, and blocked release gates separately', () => {
    const summary = summarizeIapReleaseReadiness()

    expect(summary.totalCount).toBe(PBI055_RELEASE_GATES.length)
    expect(summary.passedCount).toBeGreaterThan(0)
    expect(summary.manualRequiredCount).toBeGreaterThan(0)
    expect(summary.blockedCount).toBeGreaterThan(0)
    expect(summary.overallStatus).toBe('blocked')
  })

  test('can become ready only when every release gate passes', () => {
    const summary = summarizeIapReleaseReadiness(
      PBI055_RELEASE_GATES.map((gate) => ({ ...gate, status: 'passed' }))
    )

    expect(summary).toEqual({
      overallStatus: 'passed',
      passedCount: PBI055_RELEASE_GATES.length,
      manualRequiredCount: 0,
      blockedCount: 0,
      totalCount: PBI055_RELEASE_GATES.length,
    })
  })

  test('rejects Apple Pay and external checkout for iOS digital subscription unlocks', () => {
    expect(
      assertIapCheckoutBoundary({
        usesStoreKitInAppPurchase: true,
        usesApplePayForDigitalUnlock: false,
        usesExternalCheckoutForDigitalUnlock: false,
      })
    ).toBe(true)

    expect(() =>
      assertIapCheckoutBoundary({
        usesStoreKitInAppPurchase: true,
        usesApplePayForDigitalUnlock: true,
        usesExternalCheckoutForDigitalUnlock: false,
      })
    ).toThrow('Apple Pay')

    expect(() =>
      assertIapCheckoutBoundary({
        usesStoreKitInAppPurchase: true,
        usesApplePayForDigitalUnlock: false,
        usesExternalCheckoutForDigitalUnlock: true,
      })
    ).toThrow('External checkout')
  })
})
