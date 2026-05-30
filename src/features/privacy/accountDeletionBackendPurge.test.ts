import { describe, expect, test } from 'bun:test'
import {
  ACCOUNT_DELETION_FIRESTORE_RULES_CONTRACT,
  ACCOUNT_DELETION_REAUTH_MAX_AGE_MS,
  buildAccountDeletionBackendPurgePlan,
  buildAccountDeletionRetryState,
  canClientWriteAccountDeletionAuthorityPath,
} from './accountDeletionBackendPurge'

const requestedAt = Date.parse('2026-05-29T12:00:00.000Z')
const recentReauth = requestedAt - 30_000

describe('account deletion backend purge contract', () => {
  test('requires recent reauthentication before backend purge is planned', () => {
    const plan = buildAccountDeletionBackendPurgePlan({
      uid: 'user-1',
      requestedAt,
      reauthenticatedAt: requestedAt - ACCOUNT_DELETION_REAUTH_MAX_AGE_MS - 1,
      memberships: [],
    })

    expect(plan).toEqual({
      status: 'reauth_required',
      reason: 'stale_or_missing_reauth',
      maxReauthAgeMs: ACCOUNT_DELETION_REAUTH_MAX_AGE_MS,
    })
  })

  test('blocks anonymous or missing users from destructive backend purge', () => {
    expect(
      buildAccountDeletionBackendPurgePlan({
        uid: '',
        requestedAt,
        reauthenticatedAt: recentReauth,
        memberships: [],
      })
    ).toEqual({ status: 'blocked', reason: 'missing_user' })

    expect(
      buildAccountDeletionBackendPurgePlan({
        uid: 'anon-1',
        isAnonymous: true,
        requestedAt,
        reauthenticatedAt: recentReauth,
        memberships: [],
      })
    ).toEqual({ status: 'blocked', reason: 'anonymous_user' })
  })

  test('blocks last household owner deletion when other members remain', () => {
    const plan = buildAccountDeletionBackendPurgePlan({
      uid: 'owner-1',
      requestedAt,
      reauthenticatedAt: recentReauth,
      memberships: [
        {
          householdId: 'household-1',
          role: 'owner',
          memberCount: 3,
          ownerCount: 1,
          adminCount: 1,
        },
      ],
    })

    expect(plan).toEqual({
      status: 'blocked',
      reason: 'last_household_owner',
      householdId: 'household-1',
    })
  })

  test('plans server-only purge actions before Firebase Auth deletion', () => {
    const plan = buildAccountDeletionBackendPurgePlan({
      uid: 'caregiver-1',
      requestedAt,
      reauthenticatedAt: recentReauth,
      memberships: [
        {
          householdId: 'household-1',
          role: 'caregiver',
          memberCount: 3,
          ownerCount: 1,
          adminCount: 1,
        },
      ],
    })

    expect(plan.status).toBe('ready')
    if (plan.status !== 'ready') return

    expect(plan.authDeletionOrder).toBe('after_backend_cleanup')
    expect(plan.localCleanupRequired).toBe(true)
    expect(plan.actions.map((action) => action.type)).toEqual([
      'create_deletion_request',
      'anonymize_user_profile',
      'remove_household_membership',
      'invalidate_push_tokens',
      'detach_billing_identity',
      'delete_auth_user_after_backend_cleanup',
    ])
    expect(plan.actions.every((action) => action.serverOnly)).toBe(true)
  })

  test('documents Firestore authority as server-owned for deletion paths', () => {
    expect(canClientWriteAccountDeletionAuthorityPath()).toBe(false)
    expect(ACCOUNT_DELETION_FIRESTORE_RULES_CONTRACT).toMatchObject({
      clientCanCreateDeletionRequest: false,
      clientCanDeleteHouseholdMembershipForAccountDeletion: false,
      clientCanDeleteBillingEntitlements: false,
      clientCanDeleteAnotherCaregiverData: false,
    })
  })

  test('records retry-safe deletion state when backend cleanup fails', () => {
    expect(
      buildAccountDeletionRetryState({
        uid: 'user-1',
        deletionRequestId: 'delete-1',
        failedAt: '2026-05-29T12:00:00.000Z',
        retryAfter: '2026-05-29T12:10:00.000Z',
        failureCode: 'backend_unavailable',
      })
    ).toEqual({
      uid: 'user-1',
      deletionRequestId: 'delete-1',
      status: 'pending_backend_purge_retry',
      failedAt: '2026-05-29T12:00:00.000Z',
      retryAfter: '2026-05-29T12:10:00.000Z',
      failureCode: 'backend_unavailable',
    })
  })
})
