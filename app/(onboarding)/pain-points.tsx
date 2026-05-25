import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import {
  type OnboardingPainPoint,
  useOnboardingQuestionnaireStore,
} from '@/src/stores/onboardingQuestionnaireStore'

const painPoints: Array<{
  id: OnboardingPainPoint
  icon: string
  label: string
  detail: string
}> = [
  {
    id: 'missed-handoffs',
    icon: '⇄',
    label: 'Not sure what happened last',
    detail: 'Feeds, diapers, sleep, and notes get fuzzy fast.',
  },
  {
    id: 'partner-updates',
    icon: '✉',
    label: 'Keeping my partner updated',
    detail: 'Texts and memory are easy to miss.',
  },
  {
    id: 'overnight-confusion',
    icon: '◔',
    label: 'Overnight confusion',
    detail: 'Who fed the baby at 3 AM?',
  },
  {
    id: 'forgot-reminders',
    icon: '◷',
    label: 'Forgetting the next care time',
    detail: 'Feeding, medication, or tummy time.',
  },
  {
    id: 'scattered-notes',
    icon: '☰',
    label: 'Notes are scattered everywhere',
    detail: 'Paper, texts, and tired memory do not sync.',
  },
  {
    id: 'photo-moments-buried',
    icon: '◌',
    label: 'Photo moments get buried',
    detail: 'Tiny memories should be easy to find, locally.',
  },
]

export default function PainPointsScreen() {
  const router = useRouter()
  const selectedPainPoints = useOnboardingQuestionnaireStore((s) => s.painPoints)
  const togglePainPoint = useOnboardingQuestionnaireStore((s) => s.togglePainPoint)

  return (
    <Screen>
      <OnboardingFrame
        title="What feels hardest right now?"
        subtitle="Choose anything that sounds familiar. This helps us shape your first handoff preview."
        step="Step 3 of 9"
        progress={0.33}
        onBack={() => router.back()}
      >
        <View style={styles.options}>
          {painPoints.map((painPoint) => {
            const selected = selectedPainPoints.includes(painPoint.id)
            return (
              <Pressable
                key={painPoint.id}
                onPress={() => togglePainPoint(painPoint.id)}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                accessibilityRole="checkbox"
                accessibilityLabel={painPoint.label}
                accessibilityState={{ checked: selected }}
              >
                <View style={[styles.iconBubble, selected && styles.iconBubbleSelected]}>
                  <Text style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                    {painPoint.icon}
                  </Text>
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{painPoint.label}</Text>
                  <Text style={styles.optionDetail}>{painPoint.detail}</Text>
                </View>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            )
          })}
        </View>

        <Button onPress={() => router.push('/(onboarding)/problem')} style={styles.button}>
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.sage,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  button: {
    width: '100%',
    minHeight: 56,
  },
})
