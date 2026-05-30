import { describe, expect, test } from 'bun:test'
import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { Functions } from 'firebase/functions'
import type { FirebaseStorage } from 'firebase/storage'
import {
  type CreateBabyInput,
  type CreateCareEventInput,
  type CreateHouseholdInput,
  type CreateReminderInput,
  type GetFeatureFlagsInput,
  type GetHandoffSummaryInput,
  type InviteMemberInput,
  buildPushRetryDecision,
  ensureAuthEmulatorConnected,
  ensureFirestoreEmulatorConnected,
  ensureFunctionsEmulatorConnected,
  ensureStorageEmulatorConnected,
  firebaseCallableClient,
  firebaseClientRuntime,
  firebaseApp,
  firebaseAuth,
  firebaseFunctions,
  firebaseStorage,
  firestore,
  getRemoteConfigConsumerControls,
  guardPushSendReadiness,
  remoteConfigDefaults,
  remoteConfigKeys,
  remoteConfigService,
  type PushProviderErrorCode,
  type RemoteConfigConsumerControls,
  type RemoteConfigValues,
} from './index'

describe('Firebase client exports', () => {
  test('exports initialized Firebase clients through one module boundary', () => {
    const typedExports = {
      app: firebaseApp,
      auth: firebaseAuth,
      firestore,
      storage: firebaseStorage,
      functions: firebaseFunctions,
    } satisfies {
      app: FirebaseApp
      auth: Auth
      firestore: Firestore
      storage: FirebaseStorage
      functions: Functions
    }

    expect(firebaseApp.name).toBe('[DEFAULT]')
    expect(typedExports.auth.app).toBe(typedExports.app)
    expect(typedExports.firestore.app).toBe(typedExports.app)
    expect(typedExports.storage.app).toBe(typedExports.app)
    expect(typedExports.functions.app).toBe(typedExports.app)
    expect(firebaseCallableClient).toBeDefined()
    expect(remoteConfigService.getAll()).toEqual(remoteConfigDefaults)
    expect(firebaseClientRuntime.mode).toBe('emulator')
  })

  test('exports idempotent emulator connection helpers', () => {
    expect(() => ensureAuthEmulatorConnected()).not.toThrow()
    expect(() => ensureFirestoreEmulatorConnected()).not.toThrow()
    expect(() => ensureStorageEmulatorConnected()).not.toThrow()
    expect(() => ensureFunctionsEmulatorConnected()).not.toThrow()
  })

  test('keeps callable wrapper input types exported from the shared boundary', () => {
    const createHouseholdInput = {
      name: 'The Miller Household',
    } satisfies CreateHouseholdInput
    const createBabyInput = {
      householdId: 'household-1',
      name: 'Leo',
      birthDate: '2026-05-01',
    } satisfies CreateBabyInput
    const inviteMemberInput = {
      householdId: 'household-1',
      email: 'partner@example.com',
      role: 'caregiver',
      relationshipLabel: 'Partner',
    } satisfies InviteMemberInput
    const createCareEventInput = {
      householdId: 'household-1',
      babyId: 'baby-1',
      type: 'bottle',
      occurredAt: '2026-05-29T10:00:00.000Z',
      metadata: { amountMl: 90 },
    } satisfies CreateCareEventInput
    const createReminderInput = {
      householdId: 'household-1',
      babyId: 'baby-1',
      title: 'Vitamin D',
      dueAt: '2026-05-29T14:00:00.000Z',
    } satisfies CreateReminderInput
    const featureFlagsInput = {
      householdId: 'household-1',
      locale: 'en-US',
    } satisfies GetFeatureFlagsInput
    const handoffSummaryInput = {
      babyId: 'baby-1',
    } satisfies GetHandoffSummaryInput

    expect(createHouseholdInput.name).toBe('The Miller Household')
    expect(createBabyInput.name).toBe('Leo')
    expect(inviteMemberInput.role).toBe('caregiver')
    expect(createCareEventInput.type).toBe('bottle')
    expect(createReminderInput.title).toBe('Vitamin D')
    expect(featureFlagsInput.locale).toBe('en-US')
    expect(handoffSummaryInput.babyId).toBe('baby-1')
  })

  test('keeps Remote Config schema types exported from the shared boundary', () => {
    const defaults = remoteConfigDefaults satisfies RemoteConfigValues

    expect(defaults[remoteConfigKeys.paywallCopyVariantId]).toBe('default')
  })

  test('exports Remote Config consumer controls from the shared boundary', () => {
    const controls =
      getRemoteConfigConsumerControls() satisfies RemoteConfigConsumerControls

    expect(controls.paywall.pricingSource).toBe('storekit')
    expect(controls.notifications.respectsOptOut).toBe(true)
  })

  test('exports push provider resilience helpers from the shared boundary', () => {
    const errorCode =
      buildPushRetryDecision({
        error: { code: 'functions/unavailable' },
        attempt: 1,
      }).reason satisfies PushProviderErrorCode

    expect(errorCode).toBe('backend-unavailable')
    expect(
      guardPushSendReadiness({
        useCase: 'caregiverInvite',
        urgency: 'timeSensitive',
        audience: { type: 'users', userIds: [] },
        templateId: 'caregiver-invite-v1',
        route: { routeName: 'invite' },
        permissionState: 'granted',
      })
    ).toEqual({
      status: 'skipped',
      reason: 'no-audience',
    })
  })
})
