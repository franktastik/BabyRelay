export const FEATURE_FLAGS_CACHE_TTL_MS = 15 * 60 * 1000
export const PLAN_ENTITLEMENTS_CACHE_TTL_MS = 5 * 60 * 1000

export type BabyMinimoFeatureFlags = Record<string, boolean>

export interface BabyMinimoPlanEntitlements {
  planId: string
  premiumActive: boolean
  maxBabies: number
  maxHouseholdMembers: number
  exportsEnabled: boolean
}

interface CacheEntry<T> {
  value: T
  refreshedAt: number
}

export interface LocalEntitlementCache {
  getFeatureFlags: (now?: number) => BabyMinimoFeatureFlags | null
  setFeatureFlags: (flags: BabyMinimoFeatureFlags, refreshedAt?: number) => void
  refreshFeatureFlags: (
    loader: () => Promise<BabyMinimoFeatureFlags>,
    refreshedAt?: number
  ) => Promise<BabyMinimoFeatureFlags>
  getPlanEntitlements: (userId: string, now?: number) => BabyMinimoPlanEntitlements | null
  setPlanEntitlements: (
    userId: string,
    entitlements: BabyMinimoPlanEntitlements,
    refreshedAt?: number
  ) => void
  refreshPlanEntitlements: (
    userId: string,
    loader: () => Promise<BabyMinimoPlanEntitlements>,
    refreshedAt?: number
  ) => Promise<BabyMinimoPlanEntitlements>
  clear: () => void
}

const isFresh = <T>(entry: CacheEntry<T> | undefined, ttlMs: number, now: number) =>
  Boolean(entry && now - entry.refreshedAt <= ttlMs)

export const createLocalEntitlementCache = (): LocalEntitlementCache => {
  let featureFlags: CacheEntry<BabyMinimoFeatureFlags> | undefined
  const planEntitlements = new Map<string, CacheEntry<BabyMinimoPlanEntitlements>>()

  return {
    getFeatureFlags: (now = Date.now()) => {
      if (!isFresh(featureFlags, FEATURE_FLAGS_CACHE_TTL_MS, now)) {
        return null
      }

      return { ...featureFlags!.value }
    },
    setFeatureFlags: (flags, refreshedAt = Date.now()) => {
      featureFlags = {
        value: { ...flags },
        refreshedAt,
      }
    },
    refreshFeatureFlags: async (loader, refreshedAt = Date.now()) => {
      const flags = await loader()
      featureFlags = {
        value: { ...flags },
        refreshedAt,
      }
      return { ...flags }
    },
    getPlanEntitlements: (userId, now = Date.now()) => {
      const entry = planEntitlements.get(userId)
      if (!isFresh(entry, PLAN_ENTITLEMENTS_CACHE_TTL_MS, now)) {
        return null
      }

      return { ...entry!.value }
    },
    setPlanEntitlements: (userId, entitlements, refreshedAt = Date.now()) => {
      planEntitlements.set(userId, {
        value: { ...entitlements },
        refreshedAt,
      })
    },
    refreshPlanEntitlements: async (userId, loader, refreshedAt = Date.now()) => {
      const entitlements = await loader()
      planEntitlements.set(userId, {
        value: { ...entitlements },
        refreshedAt,
      })
      return { ...entitlements }
    },
    clear: () => {
      featureFlags = undefined
      planEntitlements.clear()
    },
  }
}

export const babyMinimoEntitlementCache = createLocalEntitlementCache()
