export const IAP_PRODUCT_IDS = {
  premiumWeekly: 'com.babyminimo.premium.weekly',
  premiumMonthly: 'com.babyminimo.premium.monthly',
  premiumAnnual: 'com.babyminimo.premium.annual',
} as const

export type IapProductId = (typeof IAP_PRODUCT_IDS)[keyof typeof IAP_PRODUCT_IDS]

export const IAP_PRODUCT_ID_LIST = Object.values(IAP_PRODUCT_IDS) as IapProductId[]

export const IAP_DEFERRED_PRODUCT_ID_CANDIDATES = {
  familyMonthly: 'com.babyminimo.family.monthly',
  familyAnnual: 'com.babyminimo.family.annual',
  lifetime: 'com.babyminimo.lifetime',
  giftPremiumMonthly: 'com.babyminimo.gift.premium.monthly',
  giftPremiumAnnual: 'com.babyminimo.gift.premium.annual',
} as const

export type DeferredIapProductIdCandidate =
  (typeof IAP_DEFERRED_PRODUCT_ID_CANDIDATES)[keyof typeof IAP_DEFERRED_PRODUCT_ID_CANDIDATES]

export type IapProductKind = 'auto_renewable_subscription' | 'non_consumable'
export type IapPlanAudience = 'premium' | 'family' | 'gift'
export type IapRefreshReason = 'purchase' | 'restore' | 'manual_refresh'

export interface IapStoreProduct {
  id: IapProductId
  title: string
  description?: string
  displayPrice: string
  kind: IapProductKind
  audience: IapPlanAudience
}

export interface IapStoreTransaction {
  productId: IapProductId
  transactionId: string
  originalTransactionId?: string
}

export type IapPurchaseResult =
  | {
      status: 'purchased'
      transaction: IapStoreTransaction
    }
  | {
      status: 'cancelled'
      productId: IapProductId
    }

export type IapRestoreResult =
  | {
      status: 'restored'
      transactions: IapStoreTransaction[]
    }
  | {
      status: 'empty'
    }

export interface IapStoreAdapter {
  loadProducts: (productIds: IapProductId[]) => Promise<IapStoreProduct[]>
  purchase: (productId: IapProductId) => Promise<IapPurchaseResult>
  restorePurchases: () => Promise<IapRestoreResult>
}

export interface BackendEntitlementSnapshot {
  userId: string
  planId: string
  premiumActive: boolean
  maxBabies: number
  maxHouseholdMembers: number
  exportsEnabled: boolean
  source: 'backend'
  refreshedAt: number
  expiresAt?: number
}

export interface IapEntitlementRefreshRequest {
  userId: string
  reason: IapRefreshReason
  productId?: IapProductId
  transactionIds?: string[]
}

export type IapEntitlementRefresher = (
  request: IapEntitlementRefreshRequest
) => Promise<BackendEntitlementSnapshot>

export type EntitlementRefreshState = {
  required: true
  completed: true
  authority: 'backend'
}

export type IapPurchaseFlowResult =
  | {
      status: 'entitlement_refreshed'
      action: 'purchase'
      productId: IapProductId
      transaction: IapStoreTransaction
      entitlement: BackendEntitlementSnapshot
      entitlementRefresh: EntitlementRefreshState
    }
  | {
      status: 'cancelled'
      action: 'purchase'
      productId: IapProductId
      entitlementRefresh: {
        required: false
        completed: false
        authority: 'none'
      }
    }

export type IapRestoreFlowResult = {
  status: 'entitlement_refreshed' | 'no_restorable_purchases'
  action: 'restore'
  restoredTransactionCount: number
  entitlement: BackendEntitlementSnapshot
  entitlementRefresh: EntitlementRefreshState
}

export interface IapBoundary {
  loadProducts: () => Promise<IapStoreProduct[]>
  purchase: (input: { userId: string; productId: IapProductId }) => Promise<IapPurchaseFlowResult>
  restorePurchases: (input: { userId: string }) => Promise<IapRestoreFlowResult>
  refreshEntitlements: (input: { userId: string; reason?: IapRefreshReason }) => Promise<BackendEntitlementSnapshot>
}

export interface CreateIapBoundaryOptions {
  store: IapStoreAdapter
  refreshEntitlements: IapEntitlementRefresher
  productIds?: IapProductId[]
}

const requireUserId = (userId: string) => {
  if (!userId.trim()) {
    throw new Error('IAP entitlement refresh requires a signed-in user id.')
  }
}

const assertBackendEntitlementForUser = (
  requestedUserId: string,
  entitlement: BackendEntitlementSnapshot
) => {
  if (entitlement.source !== 'backend') {
    throw new Error('IAP entitlement refresh must return backend-authoritative state.')
  }

  if (entitlement.userId !== requestedUserId) {
    throw new Error('IAP entitlement refresh returned state for a different user.')
  }
}

const refreshAndValidate = async (
  refreshEntitlements: IapEntitlementRefresher,
  request: IapEntitlementRefreshRequest
) => {
  requireUserId(request.userId)
  const entitlement = await refreshEntitlements(request)
  assertBackendEntitlementForUser(request.userId, entitlement)
  return entitlement
}

export const createIapBoundary = ({
  store,
  refreshEntitlements,
  productIds = IAP_PRODUCT_ID_LIST,
}: CreateIapBoundaryOptions): IapBoundary => ({
  loadProducts: async () => store.loadProducts([...productIds]),
  purchase: async ({ userId, productId }) => {
    requireUserId(userId)
    const result = await store.purchase(productId)

    if (result.status === 'cancelled') {
      return {
        status: 'cancelled',
        action: 'purchase',
        productId,
        entitlementRefresh: {
          required: false,
          completed: false,
          authority: 'none',
        },
      }
    }

    if (result.transaction.productId !== productId) {
      throw new Error('IAP purchase returned a transaction for a different product.')
    }

    const entitlement = await refreshAndValidate(refreshEntitlements, {
      userId,
      reason: 'purchase',
      productId: result.transaction.productId,
      transactionIds: [result.transaction.transactionId],
    })

    return {
      status: 'entitlement_refreshed',
      action: 'purchase',
      productId: result.transaction.productId,
      transaction: result.transaction,
      entitlement,
      entitlementRefresh: {
        required: true,
        completed: true,
        authority: 'backend',
      },
    }
  },
  restorePurchases: async ({ userId }) => {
    requireUserId(userId)
    const result = await store.restorePurchases()
    const transactions = result.status === 'restored' ? result.transactions : []
    const entitlement = await refreshAndValidate(refreshEntitlements, {
      userId,
      reason: 'restore',
      transactionIds: transactions.map((transaction) => transaction.transactionId),
    })

    return {
      status: transactions.length === 0 ? 'no_restorable_purchases' : 'entitlement_refreshed',
      action: 'restore',
      restoredTransactionCount: transactions.length,
      entitlement,
      entitlementRefresh: {
        required: true,
        completed: true,
        authority: 'backend',
      },
    }
  },
  refreshEntitlements: ({ userId, reason = 'manual_refresh' }) =>
    refreshAndValidate(refreshEntitlements, {
      userId,
      reason,
    }),
})
