import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="goal-question" />
      <Stack.Screen name="pain-points" />
      <Stack.Screen name="problem" />
      <Stack.Screen name="benefits" />
      <Stack.Screen name="add-baby" />
      <Stack.Screen name="priorities" />
      <Stack.Screen name="notification-priming" />
      <Stack.Screen name="invite-caregiver" />
      <Stack.Screen name="preview" />
    </Stack>
  )
}
