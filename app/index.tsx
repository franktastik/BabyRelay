import { Redirect } from 'expo-router'
import { useAuthStore } from '@/src/stores/authStore'

export default function Index() {
  const user = useAuthStore((s) => s.user)
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted)
  const authBootstrapped = useAuthStore((s) => s.authBootstrapped)

  if (!authBootstrapped) {
    return null
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />
  }

  return <Redirect href="/(tabs)/home" />
}
