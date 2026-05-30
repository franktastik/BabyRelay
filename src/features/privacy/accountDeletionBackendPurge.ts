export const ACCOUNT_DELETION_REAUTH_MAX_AGE_MS = 5 * 60 * 1000

export type AccountDeletionHouseholdRole = 'owner' | 'admin' | 'caregiver' | 'viewer'

export type AccountDeletionPurgePlanStatus = 'ready' | 'reauth_required' | 'blocked'

export type AccountDeletionPurgeBlockReason =
  | 'anonymous_user'
  | 'missing_user'
  | 'last_household_owner'
  | 'last_household_admin_without_owner'

export type AccountDeletionPurgeActionType =
  | 'create_deletion_request'
  | 'anonymize_user_profile'
  | 'remove_household_membership'
  | 'invalidate_push_tokens'
  | 'detach_billing_identity'
  | 'delete_auth_user_after_backend_cleanup'

export interface AccountDeletionHouseholdMembershipSnapshot {
  householdId: string
  role: AccountDeletionHouseholdRole
  memberCount: number
  ownerCount: number
  adminCount: number
}

export interface BuildAccountDeletionBackendPurgePlanInput {
  uid: string
  requestedAt: number
  reauthenticatedAt?: number | null
  isAnonymous?: boolean
  memberships: AccountDeletionHouseholdMembershipSnapshot[]
  maxReauthAgeMs?: number
}

export interface AccountDeletionPurgeAction {
  type: AccountDeletionPurgeActionType
  path: string
  householdId?: string
  serverOnly: true
}

export type AccountDeletionBackendPurgePlan =
  | {
      status: 'ready'
      uid: string
      requestedAt: number
      actions: AccountDeletionPurgeAction[]
      localCleanupRequired: true
      authDeletionOrder: 'after_backend_cleanup'
    }
  | {
      status: 'reauth_required'
      reason: 'stale_or_missing_reauth'
      maxReauthAgeMs: number
    }
  | {
      status: 'blocked'
      reason: AccountDeletionPurgeBlockReason
      householdId?: string
    }

export interface AccountDeletionRetryStateInput {
  uid: string
  deletionRequestId: string
  failedAt: string
  retryAfter: string
  failureCode: 'backend_unavailable' | 'rules_denied' | 'unknown'
}

export interface AccountDeletionRetryState {
  uid: string
  deletionRequestId: string
  status: 'pending_backend_purge_retry'
  failedAt: string
  retryAfter: string
  failureCode: AccountDeletionRetryStateInput['failureCode']
}

export const ACCOUNT_DELETION_SERVER_OWNED_PATHS = [
  'users/{uid}',
  'users/{uid}/deletionRequests/{requestId}',
  'users/{uid}/pushDevices/{deviceId}',
  'households/{householdId}/members/{uid}',
  'billingEntitlements/{entitlementId}',
  'billingTransactions/{transactionId}',
] as const

export const ACCOUNT_DELETION_FIRESTORE_RULES_CONTRACT = {
  clientCanCreateDeletionRequest: false,
  clientCanDeleteHouseholdMembershipForAccountDeletion: false,
  clientCanDeleteBillingEntitlements: false,
  clientCanDeleteAnotherCaregiverData: false,
  serverOwnedPaths: ACCOUNT_DELETION_SERVER_OWNED_PATHS,
} as const

const isRecentReauth = (
  requestedAt: number,
  reauthenticatedAt: number | null | undefined,
  maxReauthAgeMs: number
) =>
  typeof reauthenticatedAt === 'number' &&
  reauthenticatedAt > 0 &&
  requestedAt - reauthenticatedAt <= maxReauthAgeMs

const getMembershipBlockReason = (
  membership: AccountDeletionHouseholdMembershipSnapshot
): AccountDeletionPurgeBlockReason | null => {
  if (
    membership.role === 'owner' &&
    membership.memberCount > 1 &&
    membership.ownerCount <= 1
  ) {
    return 'last_household_owner'
  }

  if (
    membership.role === 'admin' &&
    membership.memberCount > 1 &&
    membership.ownerCount <= 0 &&
    membership.adminCount <= 1
  ) {
    return 'last_household_admin_without_owner'
  }

  return null
}

export const buildAccountDeletionBackendPurgePlan = ({
  uid,
  requestedAt,
  reauthenticatedAt,
  isAnonymous = false,
  memberships,
  maxReauthAgeMs = ACCOUNT_DELETION_REAUTH_MAX_AGE_MS,
}: BuildAccountDeletionBackendPurgePlanInput): AccountDeletionBackendPurgePlan => {
  if (!uid.trim()) {
    return { status: 'blocked', reason: 'missing_user' }
  }

  if (isAnonymous) {
    return { status: 'blocked', reason: 'anonymous_user' }
  }

  if (!isRecentReauth(requestedAt, reauthenticatedAt, maxReauthAgeMs)) {
    return {
      status: 'reauth_required',
      reason: 'stale_or_missing_reauth',
      maxReauthAgeMs,
    }
  }

  for (const membership of memberships) {
    const reason = getMembershipBlockReason(membership)
    if (reason) {
      return {
        status: 'blocked',
        reason,
        householdId: membership.householdId,
      }
    }
  }

  const actions: AccountDeletionPurgeAction[] = [
    {
      type: 'create_deletion_request',
      path: `users/${uid}/deletionRequests/{requestId}`,
      serverOnly: true,
    },
    {
      type: 'anonymize_user_profile',
      path: `users/${uid}`,
      serverOnly: true,
    },
    ...memberships.map<AccountDeletionPurgeAction>((membership) => ({
      type: 'remove_household_membership',
      path: `households/${membership.householdId}/members/${uid}`,
      householdId: membership.householdId,
      serverOnly: true,
    })),
    {
      type: 'invalidate_push_tokens',
      path: `users/${uid}/pushDevices/{deviceId}`,
      serverOnly: true,
    },
    {
      type: 'detach_billing_identity',
      path: 'billingEntitlements/{entitlementId}',
      serverOnly: true,
    },
    {
      type: 'delete_auth_user_after_backend_cleanup',
      path: `auth/users/${uid}`,
      serverOnly: true,
    },
  ]

  return {
    status: 'ready',
    uid,
    requestedAt,
    actions,
    localCleanupRequired: true,
    authDeletionOrder: 'after_backend_cleanup',
  }
}

export const buildAccountDeletionRetryState = ({
  uid,
  deletionRequestId,
  failedAt,
  retryAfter,
  failureCode,
}: AccountDeletionRetryStateInput): AccountDeletionRetryState => ({
  uid,
  deletionRequestId,
  status: 'pending_backend_purge_retry',
  failedAt,
  retryAfter,
  failureCode,
})

export const canClientWriteAccountDeletionAuthorityPath = () => false
