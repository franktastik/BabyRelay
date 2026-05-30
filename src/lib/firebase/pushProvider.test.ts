import { describe, expect, test } from 'bun:test'
import {
  buildRemotePushRequest,
  createFirebasePushProvider,
  firebasePushCallableNames,
  resolvePushDeliveryTarget,
  type FirebasePushCallableName,
  type PushCallableExecutor,
  type PushDeliveryEvent,
  type PushSendRequestInput,
} from './pushProvider'

const routineReminderRequest: PushSendRequestInput = {
  useCase: 'feedingReminder',
  urgency: 'routine',
  audience: { type: 'device', deviceId: 'device-1' },
  householdId: 'household-1',
  babyId: 'baby-1',
  templateId: 'feeding-reminder-local',
  route: { routeName: 'reminders', householdId: 'household-1', babyId: 'baby-1' },
  permissionState: 'granted',
}

const remoteInviteRequest: PushSendRequestInput = {
  useCase: 'caregiverInvite',
  urgency: 'timeSensitive',
  audience: { type: 'user', userId: 'user-2' },
  householdId: 'household-1',
  actorUserId: 'user-1',
  templateId: 'caregiver-invite-v1',
  route: {
    routeName: 'invite',
    householdId: 'household-1',
    inviteId: 'invite-1',
  },
  permissionState: 'granted',
}

describe('Firebase push provider', () => {
  test('routes routine reminders to local scheduling by default', async () => {
    const calls: FirebasePushCallableName[] = []
    const provider = createFirebasePushProvider({
      execute: async (name) => {
        calls.push(name)
        return { requestId: 'unexpected' } as never
      },
      scheduleLocal: async () => ({
        status: 'scheduledLocal',
        target: 'local',
        reason: 'routine-reminder',
      }),
    })

    expect(resolvePushDeliveryTarget(routineReminderRequest)).toBe('local')
    await expect(provider.send(routineReminderRequest)).resolves.toEqual({
      status: 'scheduledLocal',
      target: 'local',
      reason: 'routine-reminder',
    })
    expect(calls).toEqual([])
  })

  test('constructs sparse remote requests without sensitive free-text fields', async () => {
    const requestWithUnsafeRoute = {
      ...remoteInviteRequest,
      route: {
        ...remoteInviteRequest.route,
        note: 'caregiver note must not travel',
        symptoms: 'sensitive detail',
        message: 'arbitrary body copy',
      },
    } as PushSendRequestInput

    const payload = buildRemotePushRequest(requestWithUnsafeRoute)

    expect(payload).toEqual({
      useCase: 'caregiverInvite',
      urgency: 'timeSensitive',
      audience: { type: 'user', userId: 'user-2' },
      householdId: 'household-1',
      babyId: undefined,
      actorUserId: 'user-1',
      templateId: 'caregiver-invite-v1',
      route: {
        routeName: 'invite',
        householdId: 'household-1',
        inviteId: 'invite-1',
      },
      policy: {
        conversionApproved: false,
        respectsQuietHours: true,
        respectsOptOut: true,
        rateLimitKey: undefined,
      },
    })
    expect(JSON.stringify(payload)).not.toContain('caregiver note')
    expect(JSON.stringify(payload)).not.toContain('sensitive detail')
    expect(JSON.stringify(payload)).not.toContain('arbitrary body')
  })

  test('queues approved remote sends through an injected callable executor', async () => {
    const calls: Array<{ name: FirebasePushCallableName; input: unknown }> = []
    const execute: PushCallableExecutor = async (name, input) => {
      calls.push({ name, input })
      return { requestId: 'request-1', dryRun: true } as never
    }
    const provider = createFirebasePushProvider({ execute })

    await expect(provider.send(remoteInviteRequest)).resolves.toEqual({
      status: 'queuedRemote',
      target: 'remote',
      requestId: 'request-1',
      reason: 'dry-run',
    })
    expect(calls).toHaveLength(1)
    expect(calls[0]?.name).toBe(firebasePushCallableNames.sendRemotePush)
    expect(calls[0]?.input).toMatchObject({
      useCase: 'caregiverInvite',
      templateId: 'caregiver-invite-v1',
    })
  })

  test('does not call the backend for denied permissions or empty audiences', async () => {
    const calls: FirebasePushCallableName[] = []
    const provider = createFirebasePushProvider({
      execute: async (name) => {
        calls.push(name)
        return { requestId: 'unexpected' } as never
      },
    })

    await expect(
      provider.send({
        ...remoteInviteRequest,
        permissionState: 'denied',
      })
    ).resolves.toEqual({
      status: 'skipped',
      target: 'local',
      reason: 'permission-denied',
    })
    await expect(
      provider.send({
        ...remoteInviteRequest,
        audience: { type: 'users', userIds: [] },
      })
    ).resolves.toEqual({
      status: 'skipped',
      reason: 'no-audience',
    })
    expect(calls).toEqual([])
  })

  test('uses native Firebase token registration without assuming Expo tokens', async () => {
    const calls: Array<{ name: FirebasePushCallableName; input: unknown }> = []
    const execute: PushCallableExecutor = async (name, input) => {
      calls.push({ name, input })
      return { deviceId: 'device-1' } as never
    }
    const provider = createFirebasePushProvider({ execute })

    await expect(
      provider.registerDevice({
        userId: 'user-1',
        deviceId: 'device-1',
        nativeToken: 'fcm-token-1',
        tokenKind: 'fcm',
        platform: 'ios',
        permissionState: 'granted',
        householdIds: ['household-1'],
        appVersion: '1.0.0',
        locale: 'en-US',
        timezone: 'America/New_York',
      })
    ).resolves.toEqual({
      status: 'registered',
      deviceId: 'device-1',
    })
    expect(calls[0]?.name).toBe(firebasePushCallableNames.registerDevice)
    expect(calls[0]?.input).toMatchObject({
      nativeToken: 'fcm-token-1',
      tokenKind: 'fcm',
    })
    expect(JSON.stringify(calls[0]?.input)).not.toContain('expo')
  })

  test('does not register push tokens until permission and token data are valid', async () => {
    const calls: FirebasePushCallableName[] = []
    const provider = createFirebasePushProvider({
      execute: async (name) => {
        calls.push(name)
        return { deviceId: 'unexpected' } as never
      },
    })

    await expect(
      provider.registerDevice({
        userId: 'user-1',
        deviceId: 'device-1',
        nativeToken: '',
        tokenKind: 'fcm',
        platform: 'ios',
        permissionState: 'granted',
        householdIds: ['household-1'],
      })
    ).resolves.toEqual({
      status: 'failed',
      deviceId: 'device-1',
      reason: 'invalid-payload',
    })
    await expect(
      provider.registerDevice({
        userId: 'user-1',
        deviceId: 'device-1',
        nativeToken: 'fcm-token-1',
        tokenKind: 'fcm',
        platform: 'ios',
        permissionState: 'notDetermined',
        householdIds: ['household-1'],
      })
    ).resolves.toEqual({
      status: 'skipped',
      deviceId: 'device-1',
      reason: 'permission-not-determined',
    })
    expect(calls).toEqual([])
  })

  test('subscribes to delivery events and delegates unsubscribe behavior', () => {
    const events: PushDeliveryEvent[] = []
    let unsubscribed = false
    const provider = createFirebasePushProvider({
      execute: async () => ({ requestId: 'unused' }) as never,
      listenToDeliveryEvents: (input, onEvent) => {
        expect(input).toEqual({ householdId: 'household-1', userId: 'user-1' })
        onEvent({
          requestId: 'request-1',
          status: 'dryRun',
          target: 'remote',
          useCase: 'crossDeviceHouseholdUpdate',
          householdId: 'household-1',
        })
        return () => {
          unsubscribed = true
        }
      },
    })

    const unsubscribe = provider.listenToDeliveryEvents(
      { householdId: 'household-1', userId: 'user-1' },
      (event) => events.push(event)
    )

    expect(events).toEqual([
      {
        requestId: 'request-1',
        status: 'dryRun',
        target: 'remote',
        useCase: 'crossDeviceHouseholdUpdate',
        householdId: 'household-1',
      },
    ])
    unsubscribe()
    expect(unsubscribed).toBe(true)
  })
})
