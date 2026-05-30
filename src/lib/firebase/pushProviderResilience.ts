import type {
  DevicePushRegistrationInput,
  PushPermissionState,
  PushProviderResult,
  PushSendAudience,
  PushSendRequestInput,
} from './pushProvider'

export type PushProviderErrorCode =
  | 'permission-denied'
  | 'permission-not-determined'
  | 'no-audience'
  | 'invalid-payload'
  | 'unauthorized'
  | 'cross-household'
  | 'network'
  | 'backend-unavailable'
  | 'deadline-exceeded'
  | 'unknown'

export type PushRetryDecision = {
  shouldRetry: boolean
  attempt: number
  maxAttempts: number
  nextDelayMs?: number
  reason: PushProviderErrorCode
}

export type PushTokenCleanupReason =
  | 'disabled'
  | 'permission-denied'
  | 'sign-out'
  | 'account-deleted'
  | 'household-removed'
  | 'stale-refresh'

export type PushDeviceTokenRecord = DevicePushRegistrationInput & {
  refreshedAt?: string
  updatedAt?: string
  disabledAt?: string | null
  disabledReason?: PushTokenCleanupReason | null
  removedHouseholdIds?: string[]
}

const retryableErrorCodes = new Set<PushProviderErrorCode>([
  'network',
  'backend-unavailable',
  'deadline-exceeded',
])

const nonRetryableErrorCodes = new Set<PushProviderErrorCode>([
  'permission-denied',
  'permission-not-determined',
  'no-audience',
  'invalid-payload',
  'unauthorized',
  'cross-household',
])

export function isPushPermissionAllowed(permissionState: PushPermissionState) {
  return permissionState === 'granted' || permissionState === 'provisional'
}

export function getPushAudienceSize(audience: PushSendAudience) {
  switch (audience.type) {
    case 'device':
      return audience.deviceId.trim().length > 0 ? 1 : 0
    case 'user':
      return audience.userId.trim().length > 0 ? 1 : 0
    case 'users':
      return new Set(
        audience.userIds.map((userId) => userId.trim()).filter(Boolean)
      ).size
    case 'household':
      return audience.householdId.trim().length > 0 ? 1 : 0
  }
}

export function guardPushSendReadiness(
  request: PushSendRequestInput
): PushProviderResult | null {
  if (request.permissionState === 'denied') {
    return {
      status: 'skipped',
      target: 'local',
      reason: 'permission-denied',
    }
  }

  if (!isPushPermissionAllowed(request.permissionState)) {
    return {
      status: 'skipped',
      target: 'local',
      reason: 'permission-not-determined',
    }
  }

  if (getPushAudienceSize(request.audience) === 0) {
    return {
      status: 'skipped',
      reason: 'no-audience',
    }
  }

  if (!request.templateId.trim() || !request.route.routeName) {
    return {
      status: 'failed',
      reason: 'invalid-payload',
    }
  }

  return null
}

export function guardPushRegistrationReadiness(
  registration: Pick<
    DevicePushRegistrationInput,
    'permissionState' | 'nativeToken' | 'householdIds' | 'deviceId'
  >
): PushProviderResult | null {
  if (registration.permissionState === 'denied') {
    return {
      status: 'skipped',
      deviceId: registration.deviceId,
      reason: 'permission-denied',
    }
  }

  if (!isPushPermissionAllowed(registration.permissionState)) {
    return {
      status: 'skipped',
      deviceId: registration.deviceId,
      reason: 'permission-not-determined',
    }
  }

  if (
    !registration.nativeToken.trim() ||
    registration.householdIds.length === 0
  ) {
    return {
      status: 'failed',
      deviceId: registration.deviceId,
      reason: 'invalid-payload',
    }
  }

  return null
}

export function classifyPushProviderError(
  error: unknown
): PushProviderErrorCode {
  const errorCode =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : ''
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message)
      : error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : ''
  const normalized = `${errorCode} ${message}`.toLowerCase()

  if (normalized.includes('permission-denied')) return 'permission-denied'
  if (normalized.includes('not-determined')) return 'permission-not-determined'
  if (normalized.includes('no-audience')) return 'no-audience'
  if (normalized.includes('invalid-argument')) return 'invalid-payload'
  if (normalized.includes('invalid-payload')) return 'invalid-payload'
  if (normalized.includes('unauthenticated')) return 'unauthorized'
  if (normalized.includes('unauthorized')) return 'unauthorized'
  if (normalized.includes('cross-household')) return 'cross-household'
  if (normalized.includes('deadline-exceeded')) return 'deadline-exceeded'
  if (normalized.includes('unavailable')) return 'backend-unavailable'
  if (normalized.includes('network')) return 'network'

  return 'unknown'
}

export function buildPushRetryDecision(input: {
  error: unknown
  attempt: number
  maxAttempts?: number
  baseDelayMs?: number
}): PushRetryDecision {
  const maxAttempts = input.maxAttempts ?? 3
  const attempt = Math.max(1, input.attempt)
  const reason = classifyPushProviderError(input.error)

  if (nonRetryableErrorCodes.has(reason) || !retryableErrorCodes.has(reason)) {
    return {
      shouldRetry: false,
      attempt,
      maxAttempts,
      reason,
    }
  }

  if (attempt >= maxAttempts) {
    return {
      shouldRetry: false,
      attempt,
      maxAttempts,
      reason,
    }
  }

  const baseDelayMs = input.baseDelayMs ?? 500

  return {
    shouldRetry: true,
    attempt,
    maxAttempts,
    nextDelayMs: baseDelayMs * 2 ** (attempt - 1),
    reason,
  }
}

export function getPushTokenCleanupReasons(
  record: PushDeviceTokenRecord,
  options: { now?: Date; staleAfterDays?: number } = {}
): PushTokenCleanupReason[] {
  const reasons = new Set<PushTokenCleanupReason>()

  if (record.disabledAt || record.disabledReason === 'disabled') {
    reasons.add('disabled')
  }

  if (record.disabledReason) {
    reasons.add(record.disabledReason)
  }

  if (record.permissionState === 'denied') {
    reasons.add('permission-denied')
  }

  if (record.householdIds.length === 0 || record.removedHouseholdIds?.length) {
    reasons.add('household-removed')
  }

  const staleAfterDays = options.staleAfterDays ?? 45
  const lastRefresh = Date.parse(record.refreshedAt ?? record.updatedAt ?? '')
  const now = options.now ?? new Date()

  if (
    Number.isFinite(lastRefresh) &&
    now.getTime() - lastRefresh > staleAfterDays * 24 * 60 * 60 * 1000
  ) {
    reasons.add('stale-refresh')
  }

  return [...reasons]
}
