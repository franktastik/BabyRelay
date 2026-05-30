import { describe, expect, test } from 'bun:test'
import {
  IAP_DEFERRED_PRODUCT_ID_CANDIDATES,
  IAP_PRODUCT_IDS,
  createIapBoundary,
  type BackendEntitlementSnapshot,
  type IapEntitlementRefreshRequest,
  type IapStoreAdapter,
  type IapStoreProduct,
} from './iap'

const backendEntitlement = (
  overrides: Partial<BackendEntitlementSnapshot> = {}
): BackendEntitlementSnapshot => ({
  userId: 'user-1',
  planId: 'premium',
  premiumActive: true,
  maxBabies: 1,
  maxHouseholdMembers: 2,
  exportsEnabled: true,
  source: 'backend',
  refreshedAt: 1_000,
  ...overrides,
})

const premiumAnnualProduct: IapStoreProduct = {
  id: IAP_PRODUCT_IDS.premiumAnnual,
  title: 'Premium Annual',
  displayPrice: '$39.99',
  kind: 'auto_renewable_subscription',
  audience: 'premium',
}

const createStore = (overrides: Partial<IapStoreAdapter> = {}): IapStoreAdapter => ({
  loadProducts: async () => [premiumAnnualProduct],
  purchase: async (productId) => ({
    status: 'purchased',
    transaction: {
      productId,
      transactionId: 'txn-1',
      originalTransactionId: 'original-txn-1',
    },
  }),
  restorePurchases: async () => ({
    status: 'restored',
    transactions: [
      {
        productId: IAP_PRODUCT_IDS.premiumAnnual,
        transactionId: 'restore-txn-1',
        originalTransactionId: 'original-txn-1',
      },
    ],
  }),
  ...overrides,
})

describe('iap boundary', () => {
  test('surfaces product loading failure from the injected store adapter', async () => {
    const boundary = createIapBoundary({
      store: createStore({
        loadProducts: async () => {
          throw new Error('StoreKit products unavailable')
        },
      }),
      refreshEntitlements: async () => backendEntitlement(),
    })

    await expect(boundary.loadProducts()).rejects.toThrow('StoreKit products unavailable')
  })

  test('loads products with store-supplied display prices', async () => {
    const seenProductIds: string[][] = []
    const boundary = createIapBoundary({
      store: createStore({
        loadProducts: async (productIds) => {
          seenProductIds.push([...productIds])
          return [
            premiumAnnualProduct,
            {
              id: IAP_PRODUCT_IDS.premiumMonthly,
              title: 'Premium Monthly',
              displayPrice: '€119,99',
              kind: 'auto_renewable_subscription',
              audience: 'premium',
            },
          ]
        },
      }),
      refreshEntitlements: async () => backendEntitlement(),
    })

    const products = await boundary.loadProducts()

    expect(seenProductIds[0]).toContain(IAP_PRODUCT_IDS.premiumWeekly)
    expect(seenProductIds[0]).not.toContain(IAP_DEFERRED_PRODUCT_ID_CANDIDATES.familyMonthly)
    expect(seenProductIds[0]).not.toContain(IAP_DEFERRED_PRODUCT_ID_CANDIDATES.giftPremiumAnnual)
    expect(products.map((product) => product.displayPrice)).toEqual(['$39.99', '€119,99'])
  })

  test('purchase success requires a backend entitlement refresh before returning access state', async () => {
    const refreshRequests: IapEntitlementRefreshRequest[] = []
    const boundary = createIapBoundary({
      store: createStore(),
      refreshEntitlements: async (request) => {
        refreshRequests.push(request)
        return backendEntitlement({ userId: request.userId })
      },
    })

    const result = await boundary.purchase({
      userId: 'user-1',
      productId: IAP_PRODUCT_IDS.premiumAnnual,
    })

    expect(result.status).toBe('entitlement_refreshed')
    if (result.status !== 'entitlement_refreshed') {
      throw new Error('Expected purchase entitlement refresh.')
    }
    expect(result.entitlement.source).toBe('backend')
    expect(result.entitlementRefresh).toEqual({
      required: true,
      completed: true,
      authority: 'backend',
    })
    expect(refreshRequests).toEqual([
      {
        userId: 'user-1',
        reason: 'purchase',
        productId: IAP_PRODUCT_IDS.premiumAnnual,
        transactionIds: ['txn-1'],
      },
    ])
  })

  test('rejects a purchase transaction returned for a different product id', async () => {
    const boundary = createIapBoundary({
      store: createStore({
        purchase: async () => ({
          status: 'purchased',
          transaction: {
            productId: IAP_PRODUCT_IDS.premiumWeekly,
            transactionId: 'txn-1',
          },
        }),
      }),
      refreshEntitlements: async () => backendEntitlement(),
    })

    await expect(
      boundary.purchase({
        userId: 'user-1',
        productId: IAP_PRODUCT_IDS.premiumAnnual,
      })
    ).rejects.toThrow('different product')
  })

  test('restore success requires backend entitlement refresh and does not grant locally', async () => {
    const refreshRequests: IapEntitlementRefreshRequest[] = []
    const boundary = createIapBoundary({
      store: createStore(),
      refreshEntitlements: async (request) => {
        refreshRequests.push(request)
        return backendEntitlement({ userId: request.userId, planId: 'family' })
      },
    })

    const result = await boundary.restorePurchases({ userId: 'user-1' })

    expect(result).toMatchObject({
      status: 'entitlement_refreshed',
      action: 'restore',
      restoredTransactionCount: 1,
      entitlementRefresh: {
        required: true,
        completed: true,
        authority: 'backend',
      },
    })
    expect(result.entitlement.planId).toBe('family')
    expect(refreshRequests).toEqual([
      {
        userId: 'user-1',
        reason: 'restore',
        transactionIds: ['restore-txn-1'],
      },
    ])
  })

  test('empty restore still refreshes backend state without claiming a restored purchase', async () => {
    const refreshRequests: IapEntitlementRefreshRequest[] = []
    const boundary = createIapBoundary({
      store: createStore({
        restorePurchases: async () => ({ status: 'empty' }),
      }),
      refreshEntitlements: async (request) => {
        refreshRequests.push(request)
        return backendEntitlement({
          userId: request.userId,
          premiumActive: false,
          exportsEnabled: false,
          planId: 'free',
        })
      },
    })

    const result = await boundary.restorePurchases({ userId: 'user-1' })

    expect(result).toMatchObject({
      status: 'no_restorable_purchases',
      restoredTransactionCount: 0,
      entitlement: {
        planId: 'free',
        premiumActive: false,
        source: 'backend',
      },
    })
    expect(refreshRequests).toEqual([
      {
        userId: 'user-1',
        reason: 'restore',
        transactionIds: [],
      },
    ])
  })


  test('cancelled purchase does not refresh entitlements or grant access', async () => {
    let refreshCount = 0
    const boundary = createIapBoundary({
      store: createStore({
        purchase: async (productId) => ({
          status: 'cancelled',
          productId,
        }),
      }),
      refreshEntitlements: async () => {
        refreshCount += 1
        return backendEntitlement()
      },
    })

    const result = await boundary.purchase({
      userId: 'user-1',
      productId: IAP_PRODUCT_IDS.premiumMonthly,
    })

    expect(result).toEqual({
      status: 'cancelled',
      action: 'purchase',
      productId: IAP_PRODUCT_IDS.premiumMonthly,
      entitlementRefresh: {
        required: false,
        completed: false,
        authority: 'none',
      },
    })
    expect(refreshCount).toBe(0)
  })

  test('manual entitlement refresh returns only backend authority for the requested user', async () => {
    const boundary = createIapBoundary({
      store: createStore(),
      refreshEntitlements: async (request) =>
        backendEntitlement({
          userId: request.userId,
          planId: 'premium',
          premiumActive: true,
          refreshedAt: 2_000,
        }),
    })

    const entitlement = await boundary.refreshEntitlements({ userId: 'user-1' })

    expect(entitlement).toEqual({
      userId: 'user-1',
      planId: 'premium',
      premiumActive: true,
      maxBabies: 1,
      maxHouseholdMembers: 2,
      exportsEnabled: true,
      source: 'backend',
      refreshedAt: 2_000,
    })
  })

  test('prevents wrong-user cached entitlement from satisfying purchase refresh', async () => {
    const boundary = createIapBoundary({
      store: createStore(),
      refreshEntitlements: async () => backendEntitlement({ userId: 'previous-user' }),
    })

    await expect(
      boundary.purchase({
        userId: 'current-user',
        productId: IAP_PRODUCT_IDS.premiumAnnual,
      })
    ).rejects.toThrow('different user')
  })
})
