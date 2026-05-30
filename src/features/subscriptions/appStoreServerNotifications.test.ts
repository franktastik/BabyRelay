import { describe, expect, test } from 'bun:test'
import {
  AppStoreServerNotificationValidationError,
  buildAppStoreServerNotificationEventRecord,
  mapAppStoreNotificationToEntitlementPatch,
} from './appStoreServerNotifications'
import { IAP_PRODUCT_IDS } from './iap'

const baseNotification = {
  notificationUUID: 'notification-1',
  signedPayloadVerified: true,
  originalTransactionId: 'original-1',
  latestTransactionId: 'latest-1',
  productId: IAP_PRODUCT_IDS.premiumMonthly,
  environment: 'Sandbox' as const,
  currentPeriodEnd: 30_000,
  signedDate: 10_000,
}

describe('App Store Server Notification contract', () => {
  test('maps renewal notifications to active entitlement updates', () => {
    expect(
      mapAppStoreNotificationToEntitlementPatch({
        ...baseNotification,
        notificationType: 'DID_RENEW',
      })
    ).toEqual({
      action: 'entitlement_update',
      status: 'active',
      originalTransactionId: 'original-1',
      latestTransactionId: 'latest-1',
      productId: IAP_PRODUCT_IDS.premiumMonthly,
      environment: 'Sandbox',
      currentPeriodEnd: 30_000,
      autoRenewStatus: true,
      lastValidatedAt: 10_000,
    })
  })

  test('maps billing retry with grace period to a grace-period entitlement update', () => {
    expect(
      mapAppStoreNotificationToEntitlementPatch({
        ...baseNotification,
        notificationType: 'DID_FAIL_TO_RENEW',
        gracePeriodExpiresAt: 20_000,
      })
    ).toMatchObject({
      action: 'entitlement_update',
      status: 'grace_period',
      billingRetry: true,
      autoRenewStatus: false,
      gracePeriodExpiresAt: 20_000,
    })
  })

  test('maps expired, refund, and revoke notifications to non-premium lifecycle states', () => {
    expect(
      mapAppStoreNotificationToEntitlementPatch({
        ...baseNotification,
        notificationType: 'EXPIRED',
      })
    ).toMatchObject({ status: 'expired', autoRenewStatus: false })
    expect(
      mapAppStoreNotificationToEntitlementPatch({
        ...baseNotification,
        notificationType: 'REFUND',
      })
    ).toMatchObject({ status: 'refunded', refundedAt: 10_000 })
    expect(
      mapAppStoreNotificationToEntitlementPatch({
        ...baseNotification,
        notificationType: 'REVOKE',
      })
    ).toMatchObject({ status: 'revoked', revokedAt: 10_000 })
  })

  test('records non-entitlement notifications without mutating access', () => {
    expect(
      mapAppStoreNotificationToEntitlementPatch({
        notificationUUID: 'notification-2',
        notificationType: 'CONSUMPTION_REQUEST',
        signedPayloadVerified: true,
        signedDate: 11_000,
      })
    ).toEqual({
      action: 'record_only',
      lastValidatedAt: 11_000,
    })
  })

  test('builds idempotent notification event records keyed by notification UUID', () => {
    expect(
      buildAppStoreServerNotificationEventRecord({
        ...baseNotification,
        notificationType: 'SUBSCRIBED',
      })
    ).toEqual({
      idempotencyKey: 'notification-1',
      notificationUUID: 'notification-1',
      notificationType: 'SUBSCRIBED',
      subtype: null,
      originalTransactionId: 'original-1',
      latestTransactionId: 'latest-1',
      productId: IAP_PRODUCT_IDS.premiumMonthly,
      environment: 'Sandbox',
      signedPayloadVerified: true,
      receivedAt: 10_000,
      processedAt: null,
      action: 'entitlement_update',
    })
  })

  test('rejects unverified signed payloads before any lifecycle mutation', () => {
    expect(() =>
      mapAppStoreNotificationToEntitlementPatch({
        ...baseNotification,
        notificationType: 'DID_RENEW',
        signedPayloadVerified: false,
      })
    ).toThrow(AppStoreServerNotificationValidationError)
  })

  test('requires transaction identity for entitlement-changing notifications', () => {
    expect(() =>
      mapAppStoreNotificationToEntitlementPatch({
        notificationUUID: 'notification-3',
        notificationType: 'DID_RENEW',
        signedPayloadVerified: true,
        signedDate: 10_000,
      })
    ).toThrow('transaction identity')
  })
})
