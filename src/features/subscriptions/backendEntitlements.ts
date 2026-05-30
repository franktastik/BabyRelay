import {
  IAP_PRODUCT_IDS,
  type BackendEntitlementSnapshot,
  type IapProductId,
} from './iap'

export type AppStoreEnvironment = 'Sandbox' | 'Production'

export type BillingEntitlementStatus =
  | 'active'
  | 'grace_period'
  | 'billing_retry'
  | 'expired'
  | 'revoked'
  | 'refunded'

export type BackendPlanKey = 'premium_annual' | 'premium_monthly' | 'premium_weekly' | 'free'

export const IAP_PRODUCT_TO_BACKEND_PLAN: Record<IapProductId, Exclude<BackendPlanKey, 'free'>> = {
  [IAP_PRODUCT_IDS.premiumAnnual]: 'premium_annual',
  [IAP_PRODUCT_IDS.premiumMonthly]: 'premium_monthly',
  [IAP_PRODUCT_IDS.premiumWeekly]: 'premium_weekly',
}

export const BACKEND_MANAGED_BILLING_COLLECTIONS = [
  'billingEntitlements',
  'billingTransactions',
  'appStoreNotificationEvents',
] as const

export const BACKEND_MANAGED_BILLING_FIELDS = [
  'appStoreProductId',
  'autoRenewStatus',
  'billingRetry',
  'currentPeriodEnd',
  'currentPeriodStart',
  'environment',
  'expiresAt',
  'gracePeriodExpiresAt',
  'latestTransactionId',
  'originalTransactionId',
  'planKey',
  'premiumActive',
  'refundedAt',
  'revokedAt',
  'source',
  'status',
  'updatedAt',
  'uid',
] as const

export type BackendManagedBillingCollection =
  (typeof BACKEND_MANAGED_BILLING_COLLECTIONS)[number]

export interface AppStoreTransactionSyncInput {
  uid: string
  householdId: string
  productId: IapProductId
  originalTransactionId: string
  latestTransactionId: string
  environment: AppStoreEnvironment
  storefront?: string
  status?: BillingEntitlementStatus
  currentPeriodStart?: number
  currentPeriodEnd?: number
  autoRenewStatus?: boolean
  billingRetry?: boolean
  gracePeriodExpiresAt?: number
  revokedAt?: number
  refundedAt?: number
  expirationReason?: string
  validatedAt: number
}

export interface ExistingBillingEntitlementRecord {
  uid: string
  householdId: string
  originalTransactionId: string
  latestTransactionId?: string
  appStoreProductId: IapProductId
  planKey: BackendPlanKey
  status: BillingEntitlementStatus
}

export interface BackendBillingEntitlementRecord {
  uid: string
  householdId: string
  planKey: BackendPlanKey
  appStoreProductId: IapProductId
  originalTransactionId: string
  latestTransactionId: string
  environment: AppStoreEnvironment
  storefront: string | null
  status: BillingEntitlementStatus
  premiumActive: boolean
  familyActive: false
  currentPeriodStart: number | null
  currentPeriodEnd: number | null
  autoRenewStatus: boolean | null
  billingRetry: boolean
  gracePeriodExpiresAt: number | null
  revokedAt: number | null
  refundedAt: number | null
  expirationReason: string | null
  lastValidatedAt: number
  source: 'app_store_server'
  updatedAt: number
}

export class BillingEntitlementConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BillingEntitlementConflictError'
  }
}

export class BillingEntitlementValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BillingEntitlementValidationError'
  }
}

const requireNonEmpty = (value: string, fieldName: string) => {
  if (!value.trim()) {
    throw new BillingEntitlementValidationError(`${fieldName} is required.`)
  }
}

export const isBackendManagedBillingCollection = (
  collectionId: string
): collectionId is BackendManagedBillingCollection =>
  BACKEND_MANAGED_BILLING_COLLECTIONS.includes(
    collectionId as BackendManagedBillingCollection
  )

export const isBackendManagedBillingPath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return segments.some(isBackendManagedBillingCollection)
}

export const canClientWriteBillingPath = () => false

export const assertTransactionCanSync = (
  input: AppStoreTransactionSyncInput,
  existing?: ExistingBillingEntitlementRecord | null
) => {
  requireNonEmpty(input.uid, 'uid')
  requireNonEmpty(input.householdId, 'householdId')
  requireNonEmpty(input.originalTransactionId, 'originalTransactionId')
  requireNonEmpty(input.latestTransactionId, 'latestTransactionId')

  if (existing && existing.uid !== input.uid) {
    throw new BillingEntitlementConflictError(
      'The restored App Store transaction belongs to a different Firebase user.'
    )
  }
}

export const isPremiumActiveForStatus = (
  record: Pick<
    BackendBillingEntitlementRecord,
    'status' | 'currentPeriodEnd' | 'gracePeriodExpiresAt'
  >,
  now: number
) => {
  if (record.status === 'active') {
    return !record.currentPeriodEnd || record.currentPeriodEnd > now
  }

  if (record.status === 'grace_period') {
    return Boolean(record.gracePeriodExpiresAt && record.gracePeriodExpiresAt > now)
  }

  if (record.status === 'billing_retry') {
    return Boolean(record.currentPeriodEnd && record.currentPeriodEnd > now)
  }

  return false
}

export const buildBackendBillingEntitlementRecord = (
  input: AppStoreTransactionSyncInput
): BackendBillingEntitlementRecord => {
  assertTransactionCanSync(input)

  const status = input.status ?? 'active'
  const timing = {
    status,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    gracePeriodExpiresAt: input.gracePeriodExpiresAt ?? null,
  }

  return {
    uid: input.uid,
    householdId: input.householdId,
    planKey: IAP_PRODUCT_TO_BACKEND_PLAN[input.productId],
    appStoreProductId: input.productId,
    originalTransactionId: input.originalTransactionId,
    latestTransactionId: input.latestTransactionId,
    environment: input.environment,
    storefront: input.storefront ?? null,
    status,
    premiumActive: isPremiumActiveForStatus(timing, input.validatedAt),
    familyActive: false,
    currentPeriodStart: input.currentPeriodStart ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    autoRenewStatus: input.autoRenewStatus ?? null,
    billingRetry: input.billingRetry ?? status === 'billing_retry',
    gracePeriodExpiresAt: input.gracePeriodExpiresAt ?? null,
    revokedAt: input.revokedAt ?? null,
    refundedAt: input.refundedAt ?? null,
    expirationReason: input.expirationReason ?? null,
    lastValidatedAt: input.validatedAt,
    source: 'app_store_server',
    updatedAt: input.validatedAt,
  }
}

export const toBackendEntitlementSnapshot = (
  record: BackendBillingEntitlementRecord
): BackendEntitlementSnapshot => ({
  userId: record.uid,
  planId: record.premiumActive ? record.planKey : 'free',
  premiumActive: record.premiumActive,
  maxBabies: record.premiumActive ? 3 : 1,
  maxHouseholdMembers: record.premiumActive ? 6 : 2,
  exportsEnabled: record.premiumActive,
  source: 'backend',
  refreshedAt: record.updatedAt,
  expiresAt: record.currentPeriodEnd ?? undefined,
})
