import { describe, expect, test } from 'bun:test'
import {
  BACKEND_MANAGED_BILLING_COLLECTIONS,
  BACKEND_MANAGED_BILLING_FIELDS,
  BillingEntitlementConflictError,
  IAP_PRODUCT_TO_BACKEND_PLAN,
  assertTransactionCanSync,
  buildBackendBillingEntitlementRecord,
  canClientWriteBillingPath,
  isBackendManagedBillingPath,
  toBackendEntitlementSnapshot,
} from './backendEntitlements'
import { IAP_PRODUCT_IDS } from './iap'

const activeTransaction = {
  uid: 'user-1',
  householdId: 'household-1',
  productId: IAP_PRODUCT_IDS.premiumAnnual,
  originalTransactionId: 'original-1',
  latestTransactionId: 'latest-1',
  environment: 'Sandbox' as const,
  storefront: 'USA',
  currentPeriodStart: 1_000,
  currentPeriodEnd: 20_000,
  autoRenewStatus: true,
  validatedAt: 10_000,
}

describe('backend entitlement sync contract', () => {
  test('maps launch IAP product ids to backend plan keys', () => {
    expect(IAP_PRODUCT_TO_BACKEND_PLAN).toEqual({
      [IAP_PRODUCT_IDS.premiumAnnual]: 'premium_annual',
      [IAP_PRODUCT_IDS.premiumMonthly]: 'premium_monthly',
      [IAP_PRODUCT_IDS.premiumWeekly]: 'premium_weekly',
    })
  })

  test('builds a backend-owned billing entitlement record from a validated transaction', () => {
    const record = buildBackendBillingEntitlementRecord(activeTransaction)

    expect(record).toMatchObject({
      uid: 'user-1',
      householdId: 'household-1',
      planKey: 'premium_annual',
      appStoreProductId: IAP_PRODUCT_IDS.premiumAnnual,
      originalTransactionId: 'original-1',
      latestTransactionId: 'latest-1',
      environment: 'Sandbox',
      storefront: 'USA',
      status: 'active',
      premiumActive: true,
      familyActive: false,
      source: 'app_store_server',
      lastValidatedAt: 10_000,
      updatedAt: 10_000,
    })
  })

  test('projects only compact backend entitlement state to clients', () => {
    const record = buildBackendBillingEntitlementRecord(activeTransaction)

    expect(toBackendEntitlementSnapshot(record)).toEqual({
      userId: 'user-1',
      planId: 'premium_annual',
      premiumActive: true,
      maxBabies: 3,
      maxHouseholdMembers: 6,
      exportsEnabled: true,
      source: 'backend',
      refreshedAt: 10_000,
      expiresAt: 20_000,
    })
  })

  test('does not keep premium active after expiration or refund states', () => {
    const expired = buildBackendBillingEntitlementRecord({
      ...activeTransaction,
      status: 'expired',
      currentPeriodEnd: 9_999,
    })
    const refunded = buildBackendBillingEntitlementRecord({
      ...activeTransaction,
      status: 'refunded',
      refundedAt: 10_000,
    })

    expect(toBackendEntitlementSnapshot(expired)).toMatchObject({
      planId: 'free',
      premiumActive: false,
      exportsEnabled: false,
    })
    expect(toBackendEntitlementSnapshot(refunded)).toMatchObject({
      planId: 'free',
      premiumActive: false,
      exportsEnabled: false,
    })
  })

  test('treats active grace period as premium and expired grace as free', () => {
    const activeGrace = buildBackendBillingEntitlementRecord({
      ...activeTransaction,
      status: 'grace_period',
      currentPeriodEnd: 9_000,
      gracePeriodExpiresAt: 12_000,
    })
    const expiredGrace = buildBackendBillingEntitlementRecord({
      ...activeTransaction,
      status: 'grace_period',
      currentPeriodEnd: 9_000,
      gracePeriodExpiresAt: 9_999,
    })

    expect(activeGrace.premiumActive).toBe(true)
    expect(expiredGrace.premiumActive).toBe(false)
  })

  test('rejects restore or sync when original transaction belongs to another user', () => {
    expect(() =>
      assertTransactionCanSync(activeTransaction, {
        uid: 'other-user',
        householdId: 'household-1',
        originalTransactionId: 'original-1',
        latestTransactionId: 'latest-1',
        appStoreProductId: IAP_PRODUCT_IDS.premiumAnnual,
        planKey: 'premium_annual',
        status: 'active',
      })
    ).toThrow(BillingEntitlementConflictError)
  })

  test('defines backend-managed billing paths and fields as client write denied', () => {
    expect(BACKEND_MANAGED_BILLING_COLLECTIONS).toEqual([
      'billingEntitlements',
      'billingTransactions',
      'appStoreNotificationEvents',
    ])
    expect(BACKEND_MANAGED_BILLING_FIELDS).toContain('premiumActive')
    expect(isBackendManagedBillingPath('billingEntitlements/user-1')).toBe(true)
    expect(isBackendManagedBillingPath('households/household-1/billingTransactions/txn-1')).toBe(
      true
    )
    expect(isBackendManagedBillingPath('careEvents/event-1')).toBe(false)
    expect(canClientWriteBillingPath()).toBe(false)
  })
})
