import * as Notifications from 'expo-notifications'
import {
  buildReminderNotificationPlan,
  getDefaultQuietHours,
  isNotificationAllowed,
  normalizePermissionState,
  type BabyMinimoNotificationPermissionState,
  type BabyMinimoQuietHours,
  type BabyMinimoReminderNotificationInput,
} from './notificationPolicy'

export interface ScheduledReminderNotification {
  notificationId: string | null
  permissionState: BabyMinimoNotificationPermissionState
  scheduledAt: Date | null
  delayedForQuietHours: boolean
}

let handlerConfigured = false

export function configureBabyMinimoNotificationHandler() {
  if (handlerConfigured) {
    return
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })

  handlerConfigured = true
}

export async function getBabyMinimoNotificationPermissionState() {
  const permissions = await Notifications.getPermissionsAsync()
  return normalizePermissionState({
    status: permissions.status,
    granted: permissions.granted,
    iosStatus: permissions.ios?.status,
  })
}

export async function requestBabyMinimoNotificationPermissions() {
  const permissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
      allowProvisional: true,
    },
  })

  return normalizePermissionState({
    status: permissions.status,
    granted: permissions.granted,
    iosStatus: permissions.ios?.status,
  })
}

export async function scheduleBabyMinimoReminderNotification(
  reminder: BabyMinimoReminderNotificationInput,
  quietHours: BabyMinimoQuietHours = getDefaultQuietHours()
): Promise<ScheduledReminderNotification> {
  configureBabyMinimoNotificationHandler()

  let permissionState = await getBabyMinimoNotificationPermissionState()

  if (permissionState === 'notAsked') {
    permissionState = await requestBabyMinimoNotificationPermissions()
  }

  if (!isNotificationAllowed(permissionState)) {
    return {
      notificationId: null,
      permissionState,
      scheduledAt: null,
      delayedForQuietHours: false,
    }
  }

  const plan = buildReminderNotificationPlan(reminder, quietHours)
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: plan.title,
      body: plan.body,
      data: plan.data,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: plan.scheduledAt,
    },
  })

  return {
    notificationId,
    permissionState,
    scheduledAt: plan.scheduledAt,
    delayedForQuietHours: plan.delayedForQuietHours,
  }
}

export async function cancelBabyMinimoReminderNotification(notificationId?: string | null) {
  if (!notificationId) {
    return
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId)
}
