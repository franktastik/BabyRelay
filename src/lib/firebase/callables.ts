import { httpsCallable, type Functions } from 'firebase/functions'
import { firebaseFunctions } from './functions'

export const firebaseCallableNames = {
  createHousehold: 'createHousehold',
  createBaby: 'createBaby',
  inviteMember: 'inviteMember',
  createCareEvent: 'createCareEvent',
  createReminder: 'createReminder',
  getFeatureFlags: 'getFeatureFlags',
  getHandoffSummary: 'getHandoffSummary',
  refreshIapEntitlement: 'refreshIapEntitlement',
  requestAccountDeletionPurge: 'requestAccountDeletionPurge',
} as const

export type FirebaseCallableName =
  (typeof firebaseCallableNames)[keyof typeof firebaseCallableNames]

export type CreateHouseholdInput = {
  name: string
}

export type CreateHouseholdResult = {
  householdId: string
}

export type CreateBabyInput = {
  householdId: string
  name: string
  birthDate: string | null
}

export type CreateBabyResult = {
  babyId: string
}

export type InviteMemberInput = {
  householdId: string
  email: string
  role: 'admin' | 'caregiver' | 'viewer'
  relationshipLabel?: string
}

export type InviteMemberResult = {
  inviteId: string
}

export type CreateCareEventInput = {
  householdId: string
  babyId: string
  type: 'breastfeed' | 'bottle' | 'diaper' | 'sleep' | 'medication'
  occurredAt: string
  metadata?: Record<string, unknown>
}

export type CreateCareEventResult = {
  eventId: string
}

export type CreateReminderInput = {
  householdId: string
  babyId: string
  title: string
  dueAt: string
}

export type CreateReminderResult = {
  reminderId: string
}

export type GetFeatureFlagsInput = {
  householdId: string
  locale?: string
}

export type GetFeatureFlagsResult = {
  flags: Record<string, boolean | string | number>
  refreshedAt: string
}

export type GetHandoffSummaryInput = {
  babyId: string
}

export type GetHandoffSummaryResult = {
  babyId: string
  updatedAt: string
  summary: Record<string, unknown>
}

export type RefreshIapEntitlementInput = {
  reason: 'purchase' | 'restore' | 'manual_refresh'
  productId?: string
  transactionIds?: string[]
}

export type RefreshIapEntitlementResult = {
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

export type RequestAccountDeletionPurgeInput = {
  confirmation: 'DELETE'
  reauthenticatedAt: number
  requestedAt: number
  reason?: 'user_requested'
}

export type RequestAccountDeletionPurgeResult = {
  status: 'purge_completed' | 'reauth_required' | 'blocked_last_owner' | 'queued_retry'
  deletionRequestId?: string
  retryAfter?: string
}

export type FirebaseCallableExecutor = <Input, Result>(
  name: FirebaseCallableName,
  input: Input
) => Promise<Result>

export function createFirebaseCallableExecutor(
  functions: Functions = firebaseFunctions
): FirebaseCallableExecutor {
  return async <Input, Result>(name: FirebaseCallableName, input: Input) => {
    const callable = httpsCallable<Input, Result>(functions, name)
    const result = await callable(input)
    return result.data
  }
}

export function createFirebaseCallableClient(
  execute: FirebaseCallableExecutor = createFirebaseCallableExecutor()
) {
  return {
    callCreateHousehold: (input: CreateHouseholdInput) =>
      execute<CreateHouseholdInput, CreateHouseholdResult>(
        firebaseCallableNames.createHousehold,
        input
      ),
    callCreateBaby: (input: CreateBabyInput) =>
      execute<CreateBabyInput, CreateBabyResult>(firebaseCallableNames.createBaby, input),
    callInviteMember: (input: InviteMemberInput) =>
      execute<InviteMemberInput, InviteMemberResult>(
        firebaseCallableNames.inviteMember,
        input
      ),
    callCreateCareEvent: (input: CreateCareEventInput) =>
      execute<CreateCareEventInput, CreateCareEventResult>(
        firebaseCallableNames.createCareEvent,
        input
      ),
    callCreateReminder: (input: CreateReminderInput) =>
      execute<CreateReminderInput, CreateReminderResult>(
        firebaseCallableNames.createReminder,
        input
      ),
    callGetFeatureFlags: (input: GetFeatureFlagsInput) =>
      execute<GetFeatureFlagsInput, GetFeatureFlagsResult>(
        firebaseCallableNames.getFeatureFlags,
        input
      ),
    callGetHandoffSummary: (input: GetHandoffSummaryInput) =>
      execute<GetHandoffSummaryInput, GetHandoffSummaryResult>(
        firebaseCallableNames.getHandoffSummary,
        input
      ),
    callRefreshIapEntitlement: (input: RefreshIapEntitlementInput) =>
      execute<RefreshIapEntitlementInput, RefreshIapEntitlementResult>(
        firebaseCallableNames.refreshIapEntitlement,
        input
      ),
    callRequestAccountDeletionPurge: (input: RequestAccountDeletionPurgeInput) =>
      execute<RequestAccountDeletionPurgeInput, RequestAccountDeletionPurgeResult>(
        firebaseCallableNames.requestAccountDeletionPurge,
        input
      ),
  }
}

export const firebaseCallableClient = createFirebaseCallableClient()

export const {
  callCreateHousehold,
  callCreateBaby,
  callInviteMember,
  callCreateCareEvent,
  callCreateReminder,
  callGetFeatureFlags,
  callGetHandoffSummary,
  callRefreshIapEntitlement,
  callRequestAccountDeletionPurge,
} = firebaseCallableClient
