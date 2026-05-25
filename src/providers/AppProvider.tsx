import React, { useEffect } from 'react'
import '@/src/localization/i18n'
import { useAuthStore } from '@/src/stores/authStore'
import { createDemoAuthAdapter } from '@/src/features/demo/auth'
import { createDemoHouseholdAdapter } from '@/src/features/demo/household'
import { configureBabyMinimoNotificationHandler } from '@/src/features/notifications/nativeNotifications'
import { useBabyMinimoNotificationRouting } from '@/src/features/notifications/useNotificationRouting'

const authAdapter = createDemoAuthAdapter()
const householdAdapter = createDemoHouseholdAdapter()

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  useBabyMinimoNotificationRouting()

  const setUser = useAuthStore((s) => s.setUser)
  const setOnboardingState = useAuthStore((s) => s.setOnboardingState)
  const setAuthBootstrapped = useAuthStore((s) => s.setAuthBootstrapped)

  useEffect(() => {
    configureBabyMinimoNotificationHandler()
  }, [])

  useEffect(() => {
    const unsubscribe = authAdapter.subscribeToAuthState(async (user) => {
      setUser(user)
      if (user) {
        try {
          const onboardingState = await householdAdapter.getOnboardingState(user.id)
          setOnboardingState(onboardingState)
        } catch {
          setOnboardingState({
            currentHouseholdId: null,
            selectedBabyId: null,
            onboardingCompleted: false,
          })
        }
      } else {
        setOnboardingState({
          currentHouseholdId: null,
          selectedBabyId: null,
          onboardingCompleted: false,
        })
      }
      setAuthBootstrapped(true)
    })

    return unsubscribe
  }, [setUser, setOnboardingState, setAuthBootstrapped])

  return <>{children}</>
}
