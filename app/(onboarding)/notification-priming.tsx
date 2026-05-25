import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import { requestBabyMinimoNotificationPermissions } from '@/src/features/notifications'
import { useOnboardingQuestionnaireStore } from '@/src/stores/onboardingQuestionnaireStore'

const benefits = [
  {
    icon: '◷',
    title: 'Only what you ask for',
    body: 'Next feed, diaper, medication, or tummy time. No noisy extras.',
  },
  {
    icon: '▣',
    title: 'Local reminders first',
    body: 'Reminder alerts can stay on this device while you get set up.',
  },
  {
    icon: '♧',
    title: 'Always adjustable',
    body: 'Change reminder timing or turn alerts off anytime in Settings.',
  },
]

export default function NotificationPrimingScreen() {
  const router = useRouter()
  const setNotificationPrimingChoice = useOnboardingQuestionnaireStore(
    (s) => s.setNotificationPrimingChoice
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const continueToAddBaby = () => {
    router.push('/(onboarding)/add-baby')
  }

  const handleEnable = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const state = await requestBabyMinimoNotificationPermissions()
      setNotificationPrimingChoice(state === 'denied' ? 'blocked' : 'enabled')
      setMessage(
        state === 'denied'
          ? 'Notifications are off for now. You can still use every setup step.'
          : 'Local reminders are ready when you create them.'
      )
      continueToAddBaby()
    } catch {
      setNotificationPrimingChoice('blocked')
      setMessage('Notifications could not be enabled right now. You can retry in Settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    setNotificationPrimingChoice('skipped')
    continueToAddBaby()
  }

  return (
    <Screen>
      <OnboardingFrame
        center
        title="Gentle reminders when it matters"
        subtitle="Start with local reminders on this device. No spam, no noise."
        step="Step 7 of 9"
        progress={0.77}
        onBack={() => router.back()}
      >
        <View style={styles.iconHero}>
          <Text style={styles.iconHeroText}>◷</Text>
        </View>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <Card key={benefit.title} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>{benefit.icon}</Text>
              </View>
              <View style={styles.benefitCopy}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitBody}>{benefit.body}</Text>
              </View>
            </Card>
          ))}
        </View>

        {message && <Text style={styles.message}>{message}</Text>}

        <View style={styles.actions}>
          <Button onPress={handleEnable} loading={loading} style={styles.button}>
            Turn on local reminders
          </Button>
          <Pressable onPress={handleSkip} style={styles.skipButton} accessibilityRole="button">
            <Text style={styles.skipText}>Not now</Text>
          </Pressable>
        </View>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  iconHero: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -spacing.sm,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  iconHeroText: {
    color: colors.sageText,
    fontSize: 36,
    lineHeight: 42,
    fontFamily: 'Outfit_800ExtraBold',
  },
  benefits: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  benefitCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softSage,
  },
  benefitIconText: {
    color: colors.sageText,
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  benefitCopy: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.action,
    color: colors.ink,
  },
  benefitBody: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
  message: {
    ...typography.bodySmall,
    color: colors.sageText,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
    minHeight: 56,
  },
  skipButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    ...typography.action,
    color: colors.muted,
  },
})
