import { describe, expect, test } from 'bun:test'
import {
  createFirebaseCallableClient,
  firebaseCallableNames,
  type FirebaseCallableExecutor,
  type FirebaseCallableName,
} from './callables'

describe('Firebase callable wrappers', () => {
  test('exposes the expected callable names for production wrappers', () => {
    expect(firebaseCallableNames).toEqual({
      createHousehold: 'createHousehold',
      createBaby: 'createBaby',
      inviteMember: 'inviteMember',
      createCareEvent: 'createCareEvent',
      createReminder: 'createReminder',
      getFeatureFlags: 'getFeatureFlags',
      getHandoffSummary: 'getHandoffSummary',
      refreshIapEntitlement: 'refreshIapEntitlement',
      requestAccountDeletionPurge: 'requestAccountDeletionPurge',
    })
  })

  test('routes each wrapper through the shared callable executor', async () => {
    const calls: Array<{ name: FirebaseCallableName; input: unknown }> = []
    const execute: FirebaseCallableExecutor = async (name, input) => {
      calls.push({ name, input })
      return { id: `${name}-result` } as never
    }
    const client = createFirebaseCallableClient(execute)

    await client.callCreateHousehold({ name: 'The Miller Household' })
    await client.callCreateBaby({
      householdId: 'household-1',
      name: 'Leo',
      birthDate: '2026-05-01',
    })
    await client.callInviteMember({
      householdId: 'household-1',
      email: 'partner@example.com',
      role: 'caregiver',
      relationshipLabel: 'Partner',
    })
    await client.callCreateCareEvent({
      householdId: 'household-1',
      babyId: 'baby-1',
      type: 'bottle',
      occurredAt: '2026-05-29T10:00:00.000Z',
      metadata: { amountMl: 90 },
    })
    await client.callCreateReminder({
      householdId: 'household-1',
      babyId: 'baby-1',
      title: 'Vitamin D',
      dueAt: '2026-05-29T14:00:00.000Z',
    })
    await client.callGetFeatureFlags({ householdId: 'household-1', locale: 'en-US' })
    await client.callGetHandoffSummary({ babyId: 'baby-1' })
    await client.callRefreshIapEntitlement({
      reason: 'purchase',
      productId: 'com.babyminimo.premium.annual',
      transactionIds: ['txn-1'],
    })
    await client.callRequestAccountDeletionPurge({
      confirmation: 'DELETE',
      requestedAt: Date.parse('2026-05-29T12:00:00.000Z'),
      reauthenticatedAt: Date.parse('2026-05-29T11:59:30.000Z'),
      reason: 'user_requested',
    })

    expect(calls.map((call) => call.name)).toEqual([
      firebaseCallableNames.createHousehold,
      firebaseCallableNames.createBaby,
      firebaseCallableNames.inviteMember,
      firebaseCallableNames.createCareEvent,
      firebaseCallableNames.createReminder,
      firebaseCallableNames.getFeatureFlags,
      firebaseCallableNames.getHandoffSummary,
      firebaseCallableNames.refreshIapEntitlement,
      firebaseCallableNames.requestAccountDeletionPurge,
    ])
    expect(calls[2]?.input).toEqual({
      householdId: 'household-1',
      email: 'partner@example.com',
      role: 'caregiver',
      relationshipLabel: 'Partner',
    })
  })
})
