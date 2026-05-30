import {
  guardPushRegistrationReadiness,
  guardPushSendReadiness,
} from './pushProviderResilience'

export const firebasePushCallableNames = {
  registerDevice: 'registerPushDevice',
  unregisterDevice: 'unregisterPushDevice',
  sendRemotePush: 'sendRemotePush',
} as const

export type FirebasePushCallableName =
  (typeof firebasePushCallableNames)[keyof typeof firebasePushCallableNames]

export type PushUseCase =
  | 'feedingReminder'
  | 'medicationReminder'
  | 'sleepReminder'
  | 'tummyTimeReminder'
  | 'routineHouseholdNudge'
  | 'caregiverInvite'
  | 'crossDeviceHouseholdUpdate'
  | 'criticalDueSoonEscalation'
  | 'accountSecurity'
  | 'lifecycle'
  | 'conversionActivationNudge'

export type PushUrgency = 'routine' | 'timeSensitive' | 'critical'

export type PushRouteName =
  | 'home'
  | 'handoff'
  | 'timeline'
  | 'reminders'
  | 'invite'
  | 'account'
  | 'paywall'

export type PushRouteMetadata = {
  routeName: PushRouteName
  householdId?: string
  babyId?: string
  reminderId?: string
  inviteId?: string
  source?: string
}

export type PushPermissionState =
  | 'unknown'
  | 'notDetermined'
  | 'granted'
  | 'provisional'
  | 'denied'

export type NativePushTokenKind = 'fcm' | 'apnsViaFcm'

export type DevicePushRegistrationInput = {
  userId: string
  deviceId: string
  nativeToken: string
  tokenKind: NativePushTokenKind
  platform: 'ios' | 'android'
  permissionState: PushPermissionState
  householdIds: string[]
  appVersion?: string
  locale?: string
  timezone?: string
  optOutUseCases?: PushUseCase[]
}

export type PushSendAudience =
  | { type: 'device'; deviceId: string }
  | { type: 'user'; userId: string }
  | { type: 'users'; userIds: string[] }
  | { type: 'household'; householdId: string }

export type PushSendRequestInput = {
  useCase: PushUseCase
  urgency: PushUrgency
  audience: PushSendAudience
  householdId?: string
  babyId?: string
  actorUserId?: string
  templateId: string
  route: PushRouteMetadata
  permissionState: PushPermissionState
  conversionApproved?: boolean
  respectsQuietHours?: boolean
  respectsOptOut?: boolean
  rateLimitKey?: string
}

export type PushDeliveryTarget = 'local' | 'remote'

export type PushProviderStatus =
  | 'scheduledLocal'
  | 'queuedRemote'
  | 'registered'
  | 'unregistered'
  | 'subscribed'
  | 'unsubscribed'
  | 'skipped'
  | 'failed'

export type PushProviderResult = {
  status: PushProviderStatus
  target?: PushDeliveryTarget
  requestId?: string
  deviceId?: string
  reason?: string
}

export type PushDeliveryEvent = {
  requestId: string
  status: 'queued' | 'sent' | 'failed' | 'dryRun'
  target: PushDeliveryTarget
  useCase: PushUseCase
  householdId?: string
  createdAt?: string
  errorCode?: string
}

export type PushUnsubscribe = () => void

export type PushDeliveryListener = (
  input: { householdId: string; userId?: string },
  onEvent: (event: PushDeliveryEvent) => void
) => PushUnsubscribe

export type PushCallableExecutor = <Input, Result>(
  name: FirebasePushCallableName,
  input: Input
) => Promise<Result>

export type LocalPushScheduler = (
  request: PushSendRequestInput
) => Promise<PushProviderResult>

export type RemotePushRequestPayload = {
  useCase: Exclude<
    PushUseCase,
    | 'feedingReminder'
    | 'medicationReminder'
    | 'sleepReminder'
    | 'tummyTimeReminder'
    | 'routineHouseholdNudge'
  >
  urgency: PushUrgency
  audience: PushSendAudience
  householdId?: string
  babyId?: string
  actorUserId?: string
  templateId: string
  route: PushRouteMetadata
  policy: {
    conversionApproved: boolean
    respectsQuietHours: boolean
    respectsOptOut: boolean
    rateLimitKey?: string
  }
}

export type RemotePushRequestResult = {
  requestId: string
  dryRun?: boolean
}

export type RegisterPushDeviceResult = {
  deviceId: string
}

export type UnregisterPushDeviceResult = {
  deviceId: string
}

export type FirebasePushProvider = {
  resolveDeliveryTarget: (request: PushSendRequestInput) => PushDeliveryTarget
  buildRemoteRequest: (
    request: PushSendRequestInput
  ) => RemotePushRequestPayload | null
  send: (request: PushSendRequestInput) => Promise<PushProviderResult>
  registerDevice: (
    input: DevicePushRegistrationInput
  ) => Promise<PushProviderResult>
  unregisterDevice: (input: {
    userId: string
    deviceId: string
  }) => Promise<PushProviderResult>
  listenToDeliveryEvents: (
    input: { householdId: string; userId?: string },
    onEvent: (event: PushDeliveryEvent) => void
  ) => PushUnsubscribe
}

const routineLocalUseCases = new Set<PushUseCase>([
  'feedingReminder',
  'medicationReminder',
  'sleepReminder',
  'tummyTimeReminder',
  'routineHouseholdNudge',
])

const sparseRemoteUseCases = new Set<PushUseCase>([
  'caregiverInvite',
  'crossDeviceHouseholdUpdate',
  'criticalDueSoonEscalation',
  'accountSecurity',
  'lifecycle',
  'conversionActivationNudge',
])

const sensitiveRouteKeys = new Set([
  'note',
  'notes',
  'body',
  'message',
  'symptoms',
  'inviteSecret',
  'freeText',
])

export function isRemotePushUseCase(useCase: PushUseCase) {
  return sparseRemoteUseCases.has(useCase)
}

export function resolvePushDeliveryTarget(
  request: PushSendRequestInput
): PushDeliveryTarget {
  if (routineLocalUseCases.has(request.useCase)) {
    return 'local'
  }

  if (!sparseRemoteUseCases.has(request.useCase)) {
    return 'local'
  }

  if (request.permissionState === 'denied') {
    return 'local'
  }

  if (
    request.useCase === 'conversionActivationNudge' &&
    request.conversionApproved !== true
  ) {
    return 'local'
  }

  return 'remote'
}

export function sanitizePushRouteMetadata(
  route: PushRouteMetadata
): PushRouteMetadata {
  return Object.fromEntries(
    Object.entries(route).filter(([key]) => !sensitiveRouteKeys.has(key))
  ) as PushRouteMetadata
}

export function buildRemotePushRequest(
  request: PushSendRequestInput
): RemotePushRequestPayload | null {
  if (resolvePushDeliveryTarget(request) !== 'remote') {
    return null
  }

  return {
    useCase: request.useCase as RemotePushRequestPayload['useCase'],
    urgency: request.urgency,
    audience: request.audience,
    householdId: request.householdId,
    babyId: request.babyId,
    actorUserId: request.actorUserId,
    templateId: request.templateId,
    route: sanitizePushRouteMetadata(request.route),
    policy: {
      conversionApproved: request.conversionApproved === true,
      respectsQuietHours: request.respectsQuietHours !== false,
      respectsOptOut: request.respectsOptOut !== false,
      rateLimitKey: request.rateLimitKey,
    },
  }
}

export function createFirebasePushProvider(input: {
  execute: PushCallableExecutor
  scheduleLocal?: LocalPushScheduler
  listenToDeliveryEvents?: PushDeliveryListener
}): FirebasePushProvider {
  const scheduleLocal: LocalPushScheduler =
    input.scheduleLocal ??
    (async () => ({
      status: 'scheduledLocal',
      target: 'local',
      reason: 'local-scheduler-not-configured',
    }))

  return {
    resolveDeliveryTarget: resolvePushDeliveryTarget,
    buildRemoteRequest: buildRemotePushRequest,
    async send(request) {
      const readiness = guardPushSendReadiness(request)

      if (readiness) {
        return readiness
      }

      const payload = buildRemotePushRequest(request)

      if (!payload) {
        return scheduleLocal(request)
      }

      const result = await input.execute<
        RemotePushRequestPayload,
        RemotePushRequestResult
      >(firebasePushCallableNames.sendRemotePush, payload)

      return {
        status: 'queuedRemote',
        target: 'remote',
        requestId: result.requestId,
        reason: result.dryRun ? 'dry-run' : undefined,
      }
    },
    async registerDevice(registration) {
      const readiness = guardPushRegistrationReadiness(registration)

      if (readiness) {
        return readiness
      }

      const result = await input.execute<
        DevicePushRegistrationInput,
        RegisterPushDeviceResult
      >(firebasePushCallableNames.registerDevice, registration)

      return {
        status: 'registered',
        deviceId: result.deviceId,
      }
    },
    async unregisterDevice(registration) {
      const result = await input.execute<
        { userId: string; deviceId: string },
        UnregisterPushDeviceResult
      >(firebasePushCallableNames.unregisterDevice, registration)

      return {
        status: 'unregistered',
        deviceId: result.deviceId,
      }
    },
    listenToDeliveryEvents(listenerInput, onEvent) {
      return input.listenToDeliveryEvents?.(listenerInput, onEvent) ?? (() => {})
    },
  }
}
