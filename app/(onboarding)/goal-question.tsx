import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import {
  type OnboardingGoal,
  useOnboardingQuestionnaireStore,
} from '@/src/stores/onboardingQuestionnaireStore'

const goals: Array<{
  id: OnboardingGoal
  icon: string
  label: string
  detail: string
}> = [
  {
    id: 'sync',
    icon: '⇄',
    label: 'Stay in sync with my partner',
    detail: 'Everyone knows what happened last.',
  },
  {
    id: 'logging',
    icon: '⌁',
    label: 'Track feeds, diapers, and sleep',
    detail: 'Build one calm baby log.',
  },
  {
    id: 'reminders',
    icon: '◷',
    label: 'Never miss a reminder',
    detail: 'Gentle nudges for due-soon care.',
  },
  {
    id: 'moments',
    icon: '▣',
    label: 'Capture local photo moments',
    detail: 'Keep tiny memories on this device.',
  },
  {
    id: 'household',
    icon: '♧',
    label: 'Coordinate our household',
    detail: 'Parents and caregivers share one view.',
  },
  {
    id: 'overnight',
    icon: '◔',
    label: 'Make overnight handoffs easier',
    detail: 'Less waking, less guessing.',
  },
]

export default function GoalQuestionScreen() {
  const router = useRouter()
  const primaryGoal = useOnboardingQuestionnaireStore((s) => s.primaryGoal)
  const setPrimaryGoal = useOnboardingQuestionnaireStore((s) => s.setPrimaryGoal)

  return (
    <Screen>
      <OnboardingFrame
        title="What do you need help with first?"
        subtitle="Pick the care rhythm that matters most right now."
        step="Step 2 of 9"
        progress={0.22}
        onBack={() => router.back()}
      >
        <View style={styles.options}>
          {goals.map((goal) => {
            const selected = primaryGoal === goal.id
            return (
              <Pressable
                key={goal.id}
                onPress={() => setPrimaryGoal(goal.id)}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                accessibilityRole="button"
                accessibilityLabel={goal.label}
                accessibilityState={{ selected }}
              >
                <View style={[styles.iconBubble, selected && styles.iconBubbleSelected]}>
                  <Text style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                    {goal.icon}
                  </Text>
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{goal.label}</Text>
                  <Text style={styles.optionDetail}>{goal.detail}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            )
          })}
        </View>

        <Card style={styles.reassuranceCard}>
          <Text style={styles.reassuranceTitle}>Tiny moments. Calm care.</Text>
          <Text style={styles.reassuranceText}>
            We will use this to shape your preview and keep setup focused.
          </Text>
        </Card>

        <Button
          onPress={() => router.push('/(onboarding)/pain-points')}
          disabled={!primaryGoal}
          style={styles.button}
        >
          Continue →
        </Button>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  optionCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  optionCardSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.stone,
  },
  iconBubbleSelected: {
    backgroundColor: colors.sage,
  },
  optionIcon: {
    color: colors.sageText,
    fontSize: 18,
    lineHeight: 21,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  optionIconSelected: {
    color: colors.white,
  },
  optionCopy: {
    flex: 1,
  },
  optionLabel: {
    ...typography.action,
    color: colors.ink,
  },
  optionDetail: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  radioSelected: {
    borderColor: colors.sage,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.sage,
  },
  reassuranceCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.creamAlt,
    marginBottom: spacing.lg,
  },
  reassuranceTitle: {
    ...typography.action,
    color: colors.ink,
  },
  reassuranceText: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
  button: {
    width: '100%',
    minHeight: 56,
  },
})
