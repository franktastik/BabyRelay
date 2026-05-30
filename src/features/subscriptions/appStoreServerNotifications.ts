import type { IapProductId } from './iap'
import type {
  AppStoreEnvironment,
  BillingEntitlementStatus,
} from './backendEntitlements'

export type AppStoreServerNotificationType =
  | 'CONSUMPTION_REQUEST'
  | 'DID_CHANGE_RENEWAL_PREF'
  | 'DID_CHANGE_RENEWAL_STATUS'
  | 'DID_FAIL_TO_RENEW'
  | 'DID_RENEW'
  | 'EXPIRED'
  | 'GRACE_PERIOD_EXPIRED'
  | 'OFFER_REDEEMED'
  | 'PRICE_INCREASE'
  | 'REFUND'
  | 'REFUND_DECLINED'
  | 'RENEWAL_EXTENDED'
  | 'REVOKE'
  | 'SUBSCRIBED'
  | 'TEST'

export type AppStoreNotificationAction = 'entitlement_update' | 'record_only'

export interface VerifiedAppStoreServerNotificationInput {
  notificationUUID: string
  notificationType: AppStoreServerNotificationType
  subtype?: string
  signedPayloadVerified: boolean
  originalTransactionId?: string
  latestTransactionId?: string
  productId?: IapProductId
  environment?: AppStoreEnvironment
  currentPeriodEnd?: number
  gracePeriodExpiresAt?: number
  signedDate: number
}

export interface AppStoreServerNotificationEventRecord {
  idempotencyKey: string
  notificationUUID: string
  notificationType: AppStoreServerNotificationType
  subtype: string | null
  originalTransactionId: string | null
  latestTransactionId: string | null
  productId: IapProductId | null
  environment: AppStoreEnvironment | null
  signedPayloadVerified: true
  receivedAt: number
  processedAt: number | null
  action: AppStoreNotificationAction
}

export interface AppStoreNotificationEntitlementPatch {
  action: AppStoreNotificationAction
  status?: BillingEntitlementStatus
  originalTransactionId?: string
  latestTransactionId?: string
  productId?: IapProductId
  environment?: AppStoreEnvironment
  currentPeriodEnd?: number
  gracePeriodExpiresAt?: number
  billingRetry?: boolean
  autoRenewStatus?: boolean
  refundedAt?: number
  revokedAt?: number
  lastValidatedAt: number
}

export class AppStoreServerNotificationValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppStoreServerNotificationValidationError'
  }
}

const requireVerifiedPayload = (input: VerifiedAppStoreServerNotificationInput) => {
  if (!input.signedPayloadVerified) {
    throw new AppStoreServerNotificationValidationError(
      'App Store Server Notification payload must be verified before processing.'
    )
  }

  if (!input.notificationUUID.trim()) {
    throw new AppStoreServerNotificationValidationError('notificationUUID is required.')
  }
}

const requireTransactionFields = (input: VerifiedAppStoreServerNotificationInput) => {
  if (!input.originalTransactionId || !input.productId || !input.environment) {
    throw new AppStoreServerNotificationValidationError(
      'Entitlement-changing App Store Server Notifications require transaction identity.'
    )
  }
}

export const buildAppStoreServerNotificationEventRecord = (
  input: VerifiedAppStoreServerNotificationInput
): AppStoreServerNotificationEventRecord => {
  requireVerifiedPayload(input)
  const patch = mapAppStoreNotificationToEntitlementPatch(input)

  return {
    idempotencyKey: input.notificationUUID,
    notificationUUID: input.notificationUUID,
    notificationType: input.notificationType,
    subtype: input.subtype ?? null,
    originalTransactionId: input.originalTransactionId ?? null,
    latestTransactionId: input.latestTransactionId ?? null,
    productId: input.productId ?? null,
    environment: input.environment ?? null,
    signedPayloadVerified: true,
    receivedAt: input.signedDate,
    processedAt: null,
    action: patch.action,
  }
}

export const mapAppStoreNotificationToEntitlementPatch = (
  input: VerifiedAppStoreServerNotificationInput
): AppStoreNotificationEntitlementPatch => {
  requireVerifiedPayload(input)

  switch (input.notificationType) {
    case 'SUBSCRIBED':
    case 'DID_RENEW':
    case 'DID_CHANGE_RENEWAL_PREF':
    case 'OFFER_REDEEMED':
    case 'RENEWAL_EXTENDED':
      requireTransactionFields(input)
      return {
        action: 'entitlement_update',
        status: 'active',
        originalTransactionId: input.originalTransactionId,
        latestTransactionId: input.latestTransactionId,
        productId: input.productId,
        environment: input.environment,
        currentPeriodEnd: input.currentPeriodEnd,
        autoRenewStatus: true,
        lastValidatedAt: input.signedDate,
      }
    case 'DID_FAIL_TO_RENEW':
      requireTransactionFields(input)
      return {
        action: 'entitlement_update',
        status: input.gracePeriodExpiresAt ? 'grace_period' : 'billing_retry',
        originalTransactionId: input.originalTransactionId,
        latestTransactionId: input.latestTransactionId,
        productId: input.productId,
        environment: input.environment,
        currentPeriodEnd: input.currentPeriodEnd,
        gracePeriodExpiresAt: input.gracePeriodExpiresAt,
        billingRetry: true,
        autoRenewStatus: false,
        lastValidatedAt: input.signedDate,
      }
    case 'EXPIRED':
    case 'GRACE_PERIOD_EXPIRED':
      requireTransactionFields(input)
      return {
        action: 'entitlement_update',
        status: 'expired',
        originalTransactionId: input.originalTransactionId,
        latestTransactionId: input.latestTransactionId,
        productId: input.productId,
        environment: input.environment,
        currentPeriodEnd: input.currentPeriodEnd,
        autoRenewStatus: false,
        lastValidatedAt: input.signedDate,
      }
    case 'REFUND':
      requireTransactionFields(input)
      return {
        action: 'entitlement_update',
        status: 'refunded',
        originalTransactionId: input.originalTransactionId,
        latestTransactionId: input.latestTransactionId,
        productId: input.productId,
        environment: input.environment,
        refundedAt: input.signedDate,
        autoRenewStatus: false,
        lastValidatedAt: input.signedDate,
      }
    case 'REVOKE':
      requireTransactionFields(input)
      return {
        action: 'entitlement_update',
        status: 'revoked',
        originalTransactionId: input.originalTransactionId,
        latestTransactionId: input.latestTransactionId,
        productId: input.productId,
        environment: input.environment,
        revokedAt: input.signedDate,
        autoRenewStatus: false,
        lastValidatedAt: input.signedDate,
      }
    case 'DID_CHANGE_RENEWAL_STATUS':
      requireTransactionFields(input)
      return {
        action: 'entitlement_update',
        originalTransactionId: input.originalTransactionId,
        latestTransactionId: input.latestTransactionId,
        productId: input.productId,
        environment: input.environment,
        autoRenewStatus: input.subtype !== 'AUTO_RENEW_DISABLED',
        lastValidatedAt: input.signedDate,
      }
    case 'CONSUMPTION_REQUEST':
    case 'PRICE_INCREASE':
    case 'REFUND_DECLINED':
    case 'TEST':
      return {
        action: 'record_only',
        lastValidatedAt: input.signedDate,
      }
  }
}
