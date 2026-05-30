import { describe, expect, test } from 'bun:test'
import {
  buildRemotePushRequest,
  createFirebasePushProvider,
  firebasePushCallableNames,
  isRemotePushUseCase,
  resolvePushDeliveryTarget,
  sanitizePushRouteMetadata,
  type FirebasePushCallableName,
  type PushProviderResult,
  type PushRouteMetadata,
  type PushSendRequestInput,
  type PushUseCase,
  type RemotePushRequestPayload,
} from './pushProvider'
import {
  getPushTokenCleanupReasons,
  guardPushRegistrationReadiness,
  guardPushSendReadiness,
  type PushDeviceTokenRecord,
} from './pushProviderResilience'

const routineUseCases: PushUseCase[] = [
  'feedingReminder',
  'medicationReminder',
  'sleepReminder',
  'tummyTimeReminder',
  'routineHouseholdNudge',
]

const remoteUseCases: RemotePushRequestPayload['useCase'][] = [
  'caregiverInvite',
  'crossDeviceHouseholdUpdate',
  'criticalDueSoonEscalation',
  'accountSecurity',
  'lifecycle',
  'conversionActivationNudge',
]

const remoteRequest = (
  overrides: Partial<PushSendRequestInput> = {}
): PushSendRequestInput => ({
  useCase: 'caregiverInvite',
  urgency: 'timeSensitive',
  audience: { type: 'household', householdId: 'household-1' },
  householdId: 'household-1',
  babyId: 'baby-1',
  actorUserId: 'user-1',
  templateId: 'caregiver-invite-v1',
  route: {
    routeName: 'invite',
    householdId: 'household-1',
    babyId: 'baby-1',
    inviteId: 'invite-1',
  },
  permissionState: 'granted',
  ...overrides,
})

const registrationRecord = (
  overrides: Partial<PushDeviceTokenRecord> = {}
): PushDeviceTokenRecord => ({
  userId: 'user-1',
  deviceId: 'device-1',
  nativeToken: 'fcm-token-1',
  tokenKind: 'fcm',
  platform: 'ios',
  permissionState: 'granted',
  householdIds: ['household-1'],
  updatedAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
})

describe('Firebase push provider local boundary coverage', () => {
  test('routes routine use cases locally and sparse use cases remotely without contacting Firebase', () => {
    for (const useCase of routineUseCases) {
      const request = remoteRequest({
        useCase,
        urgency: 'routine',
        templateId: `${useCase}-template`,
      })

      expect(resolvePushDeliveryTarget(request)).toBe('local')
      expect(buildRemotePushRequest(request)).toBeNull()
      expect(isRemotePushUseCase(useCase)).toBe(false)
    }

    for (const useCase of remoteUseCases) {
      const request = remoteRequest({
        useCase,
        conversionApproved:
          useCase === 'conversionActivationNudge' ? true : undefined,
        templateId: `${useCase}-template`,
      })

      expect(resolvePushDeliveryTarget(request)).toBe('remote')
      expect(buildRemotePushRequest(request)?.useCase).toBe(useCase)
      expect(isRemotePushUseCase(useCase)).toBe(true)
    }
  })

  test('falls back to the local boundary for denied permissions and unapproved conversion nudges', async () => {
    const calls: FirebasePushCallableName[] = []
    const scheduled: PushSendRequestInput[] = []
    const provider = createFirebasePushProvider({
      execute: async (name) => {
        calls.push(name)
        return { requestId: 'unexpected' } as never
      },
      scheduleLocal: async (request): Promise<PushProviderResult> => {
        scheduled.push(request)
        return {
          status: 'scheduledLocal',
          target: 'local',
          reason: 'policy-local-fallback',
        }
      },
    })

    expect(
      guardPushSendReadiness(
        remoteRequest({
          permissionState: 'denied',
        })
      )
    ).toEqual({
      status: 'skipped',
      target: 'local',
      reason: 'permission-denied',
    })
    expect(
      buildRemotePushRequest(
        remoteRequest({
          permissionState: 'denied',
        })
      )
    ).toBeNull()
    await expect(
      provider.send(
        remoteRequest({
          useCase: 'conversionActivationNudge',
          conversionApproved: false,
          templateId: 'conversion-activation-v1',
          route: { routeName: 'paywall', source: 'local-boundary-test' },
        })
      )
    ).resolves.toEqual({
      status: 'scheduledLocal',
      target: 'local',
      reason: 'policy-local-fallback',
    })

    expect(calls).toEqual([])
    expect(scheduled).toHaveLength(1)
  })

  test('keeps notification policy flags explicit for backend rules while excluding sensitive route copy', () => {
    const unsafeRoute = {
      ...remoteRequest().route,
      note: 'parent note',
      notes: 'care notes',
      body: 'long message body',
      message: 'push copy',
      symptoms: 'private symptoms',
      inviteSecret: 'secret-token',
      freeText: 'unstructured private text',
    } as PushRouteMetadata

    expect(sanitizePushRouteMetadata(unsafeRoute)).toEqual({
      routeName: 'invite',
      householdId: 'household-1',
      babyId: 'baby-1',
      inviteId: 'invite-1',
    })

    const payload = buildRemotePushRequest(
      remoteRequest({
        route: unsafeRoute,
        respectsQuietHours: false,
        respectsOptOut: false,
        rateLimitKey: 'household-1:caregiverInvite:2026-05-29',
      })
    )

    expect(payload?.policy).toEqual({
      conversionApproved: false,
      respectsQuietHours: false,
      respectsOptOut: false,
      rateLimitKey: 'household-1:caregiverInvite:2026-05-29',
    })
    expect(JSON.stringify(payload)).not.toContain('parent note')
    expect(JSON.stringify(payload)).not.toContain('care notes')
    expect(JSON.stringify(payload)).not.toContain('long message body')
    expect(JSON.stringify(payload)).not.toContain('push copy')
    expect(JSON.stringify(payload)).not.toContain('private symptoms')
    expect(JSON.stringify(payload)).not.toContain('secret-token')
    expect(JSON.stringify(payload)).not.toContain('unstructured private text')
  })

  test('covers token invalidation cleanup reasons without touching FCM or APNs delivery', () => {
    expect(
      guardPushRegistrationReadiness({
        deviceId: 'device-1',
        nativeToken: 'fcm-token-1',
        permissionState: 'denied',
        householdIds: ['household-1'],
      })
    ).toEqual({
      status: 'skipped',
      deviceId: 'device-1',
      reason: 'permission-denied',
    })

    expect(
      getPushTokenCleanupReasons(
        registrationRecord({
          disabledReason: 'account-deleted',
        })
      )
    ).toEqual(['account-deleted'])
    expect(
      getPushTokenCleanupReasons(
        registrationRecord({
          disabledReason: 'disabled',
          disabledAt: '2026-05-20T00:00:00.000Z',
        })
      )
    ).toEqual(['disabled'])
    expect(
      getPushTokenCleanupReasons(
        registrationRecord({
          permissionState: 'denied',
        })
      )
    ).toEqual(['permission-denied'])
    expect(
      getPushTokenCleanupReasons(
        registrationRecord({
          removedHouseholdIds: ['household-1'],
        })
      )
    ).toEqual(['household-removed'])
    expect(
      getPushTokenCleanupReasons(
        registrationRecord({
          refreshedAt: '2026-03-01T00:00:00.000Z',
        }),
        {
          now: new Date('2026-05-29T00:00:00.000Z'),
          staleAfterDays: 45,
        }
      )
    ).toEqual(['stale-refresh'])
  })

  test('keeps the PBI-061 T4 push boundary verification local and deploy-free', async () => {
    const packageJson = await Bun.file(
      new URL('../../../package.json', import.meta.url)
    ).json()
    const verificationCommands = [
      'bun test src/lib/firebase/pushProvider.test.ts src/lib/firebase/pushProviderResilience.test.ts src/lib/firebase/clientExports.test.ts src/lib/firebase/pushProviderBoundary.test.ts',
      'bun run test:typecheck',
    ]

    expect(packageJson.scripts['test:firebase:smoke']).toContain(
      'firebase-emulator-smoke'
    )
    for (const command of verificationCommands) {
      expect(command).not.toMatch(/\bfirebase\s+deploy\b/)
      expect(command).not.toMatch(/\bdeploy\b/)
      expect(command).not.toMatch(/production|prod|serviceAccount|credentials/)
    }
    expect(firebasePushCallableNames.sendRemotePush).toBe('sendRemotePush')
  })
})
