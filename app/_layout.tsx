import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { AppProvider } from '@/src/providers'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(settings)" />
        <Stack.Screen name="modals/quick-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/log-breastfeed" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/log-bottle" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/log-diaper" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/log-sleep" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/log-medication" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/add-moment" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/baby-switcher" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/sign-out-confirm" options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="modals/delete-account-confirm" options={{ presentation: 'transparentModal' }} />
      </Stack>
    </AppProvider>
  )
}
