import { describe, expect, test } from 'bun:test'
import {
  FEATURE_FLAGS_CACHE_TTL_MS,
  PLAN_ENTITLEMENTS_CACHE_TTL_MS,
  createLocalEntitlementCache,
} from './localEntitlementCache'

describe('local entitlement cache', () => {
  test('returns feature flags only while the explicit refresh is fresh', async () => {
    const cache = createLocalEntitlementCache()
    const refreshedAt = 1_000

    await cache.refreshFeatureFlags(
      async () => ({ albumExport: true, householdInvites: false }),
      refreshedAt
    )

    expect(cache.getFeatureFlags(refreshedAt + FEATURE_FLAGS_CACHE_TTL_MS)).toEqual({
      albumExport: true,
      householdInvites: false,
    })
    expect(cache.getFeatureFlags(refreshedAt + FEATURE_FLAGS_CACHE_TTL_MS + 1)).toBeNull()
  })

  test('caches plan entitlements per user and expires them independently', () => {
    const cache = createLocalEntitlementCache()
    const refreshedAt = 2_000

    cache.setPlanEntitlements(
      'user-a',
      {
        planId: 'family',
        premiumActive: true,
        maxBabies: 4,
        maxHouseholdMembers: 6,
        exportsEnabled: true,
      },
      refreshedAt
    )

    cache.setPlanEntitlements(
      'user-b',
      {
        planId: 'free',
        premiumActive: false,
        maxBabies: 1,
        maxHouseholdMembers: 2,
        exportsEnabled: false,
      },
      refreshedAt + PLAN_ENTITLEMENTS_CACHE_TTL_MS + 10
    )

    expect(cache.getPlanEntitlements('user-a', refreshedAt + PLAN_ENTITLEMENTS_CACHE_TTL_MS)).toMatchObject({
      planId: 'family',
      exportsEnabled: true,
    })
    expect(cache.getPlanEntitlements('user-a', refreshedAt + PLAN_ENTITLEMENTS_CACHE_TTL_MS + 1)).toBeNull()
    expect(cache.getPlanEntitlements('user-b', refreshedAt + PLAN_ENTITLEMENTS_CACHE_TTL_MS + 11)).toMatchObject({
      planId: 'free',
      exportsEnabled: false,
    })
  })
})
