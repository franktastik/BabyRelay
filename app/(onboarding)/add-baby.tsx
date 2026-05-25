import React, { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Input, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, typography, spacing } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { trackEvent } from '@/src/features/analytics'
import { createDemoHouseholdAdapter } from '@/src/features/demo/household'

const householdAdapter = createDemoHouseholdAdapter()

export default function AddBabyScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setCurrentHouseholdId = useAuthStore((s) => s.setCurrentHouseholdId)
  const setSelectedBabyId = useAuthStore((s) => s.setSelectedBabyId)
  const [babyName, setBabyName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!babyName) {
      setError("What's your baby's name?")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const household = await householdAdapter.createHousehold(`${user?.displayName || 'My'}'s Household`)
      const baby = await householdAdapter.createBaby(household.id, babyName, birthDate || null)
      trackEvent('baby_created', {
        householdId: household.id,
        babyId: baby.id,
      })
      if (user?.id) {
        await householdAdapter.completeOnboarding(user.id, household.id, baby.id)
      }
      setCurrentHouseholdId(household.id)
      setSelectedBabyId(baby.id)
      router.push('/(onboarding)/invite-caregiver')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add baby')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <OnboardingFrame
          title="Let's meet your baby"
          subtitle="Start your shared care timeline by creating a profile for your little one."
          step="Step 8 of 9"
          progress={0.88}
          onBack={() => router.back()}
        >
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>▣</Text>
            <View style={styles.photoPlus}>
              <Text style={styles.photoPlusText}>+</Text>
            </View>
            <Text style={styles.photoText}>Add photo</Text>
          </View>

          <Card style={styles.card}>
            <Input
              label="Baby's name"
              value={babyName}
              onChangeText={setBabyName}
              placeholder="e.g. Liam James"
            />
            <Input
              label="Birth date"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Select Date"
            />
          </Card>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Button onPress={handleContinue} loading={loading} style={styles.button}>
              Next →
            </Button>
            <Button onPress={() => router.push('/(onboarding)/invite-caregiver')} variant="ghost">
              Skip for now
            </Button>
          </View>
        </OnboardingFrame>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
  photoPlaceholder: {
    width: 106,
    height: 106,
    borderRadius: 34,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  photoPlus: {
    position: 'absolute',
    right: -8,
    bottom: 24,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlusText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  photoIcon: {
    fontSize: 22,
    color: colors.clay,
  },
  photoText: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
})
