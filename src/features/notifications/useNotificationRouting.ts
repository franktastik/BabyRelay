import { useEffect } from 'react'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'

export function useBabyMinimoNotificationRouting() {
  const response = Notifications.useLastNotificationResponse()

  useEffect(() => {
    if (
      !response ||
      response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      return
    }

    const route = response.notification.request.content.data?.route

    if (route === '/reminders') {
      router.push('/reminders')
      Notifications.clearLastNotificationResponse()
    }
  }, [response])
}
