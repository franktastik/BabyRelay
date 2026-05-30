import { describe, expect, test } from 'bun:test'
import {
  buildPushRetryDecision,
  getPushAudienceSize,
  getPushTokenCleanupReasons,
  guardPushRegistrationReadiness,
  guardPushSendReadiness,
  isPushPermissionAllowed,
  type PushDeviceTokenRecord,
} from './pushProviderResilience'
import type {
  DevicePushRegistrationInput,
  PushSendRequestInput,
} from './pushProvider'

const remoteSendRequest: PushSendRequestInput = {
  useCase: 'caregiverInvite',
  urgency: 'timeSensitive',
  audience: { type: 'user', userId: 'user-2' },
  householdId: 'household-1',
  actorUserId: 'user-1',
  templateId: 'caregiver-invite-v1',
  route: { routeName: 'invite', householdId: 'household-1' },
  permissionState: 'granted',
}

const registration: DevicePushRegistrationInput = {
  userId: 'user-1',
  deviceId: 'device-1',
  nativeToken: 'fcm-token-1',
  tokenKind: 'fcm',
  platform: 'ios',
  permissionState: 'granted',
  householdIds: ['household-1'],
}

describe('Firebase push provider resilience', () => {
  test('guards denied or not-determined permissions before remote sends', () => {
    expect(isPushPermissionAllowed('granted')).toBe(true)
    expect(isPushPermissionAllowed('provisional')).toBe(true)
    expect(isPushPermissionAllowed('denied')).toBe(false)
    expect(
      guardPushSendReadiness({
        ...remoteSendRequest,
        permissionState: 'denied',
      })
    ).toEqual({
      status: 'skipped',
      target: 'local',
      reason: 'permission-denied',
    })
    expect(
      guardPushSendReadiness({
        ...remoteSendRequest,
        permissionState: 'notDetermined',
      })
    ).toEqual({
      status: 'skipped',
      target: 'local',
      reason: 'permission-not-determined',
    })
  })

  test('guards empty audiences without throwing or calling backend send', () => {
    expect(getPushAudienceSize({ type: 'users', userIds: [] })).toBe(0)
    expect(
      getPushAudienceSize({ type: 'users', userIds: ['user-1', 'user-1', ''] })
    ).toBe(1)
    expect(
      guardPushSendReadiness({
        ...remoteSendRequest,
        audience: { type: 'users', userIds: [] },
      })
    ).toEqual({
      status: 'skipped',
      reason: 'no-audience',
    })
  })

  test('guards push token registration before remote callable use', () => {
    expect(
      guardPushRegistrationReadiness({
        ...registration,
        permissionState: 'notDetermined',
      })
    ).toEqual({
      status: 'skipped',
      deviceId: 'device-1',
      reason: 'permission-not-determined',
    })
    expect(
      guardPushRegistrationReadiness({
        ...registration,
        nativeToken: '',
      })
    ).toEqual({
      status: 'failed',
      deviceId: 'device-1',
      reason: 'invalid-payload',
    })
    expect(guardPushRegistrationReadiness(registration)).toBeNull()
  })

  test('retries only transient backend failures and caps attempts', () => {
    expect(
      buildPushRetryDecision({
        error: { code: 'functions/unavailable' },
        attempt: 1,
        baseDelayMs: 250,
      })
    ).toEqual({
      shouldRetry: true,
      attempt: 1,
      maxAttempts: 3,
      nextDelayMs: 250,
      reason: 'backend-unavailable',
    })
    expect(
      buildPushRetryDecision({
        error: { code: 'functions/deadline-exceeded' },
        attempt: 3,
      })
    ).toEqual({
      shouldRetry: false,
      attempt: 3,
      maxAttempts: 3,
      reason: 'deadline-exceeded',
    })
    expect(
      buildPushRetryDecision({
        error: { code: 'functions/permission-denied' },
        attempt: 1,
      }).shouldRetry
    ).toBe(false)
    expect(
      buildPushRetryDecision({
        error: { message: 'cross-household audience denied' },
        attempt: 1,
      }).reason
    ).toBe('cross-household')
  })

  test('identifies token cleanup reasons for disabled, stale, and removed records', () => {
    const record: PushDeviceTokenRecord = {
      ...registration,
      permissionState: 'denied',
      householdIds: [],
      disabledAt: '2026-05-01T00:00:00.000Z',
      disabledReason: 'sign-out',
      refreshedAt: '2026-03-01T00:00:00.000Z',
    }

    expect(
      getPushTokenCleanupReasons(record, {
        now: new Date('2026-05-29T00:00:00.000Z'),
        staleAfterDays: 45,
      })
    ).toEqual([
      'disabled',
      'sign-out',
      'permission-denied',
      'household-removed',
      'stale-refresh',
    ])
  })
})
