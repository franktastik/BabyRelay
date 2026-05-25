import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
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
  labelKey: string
  detailKey: string
}> = [
  {
    id: 'sync',
    icon: '⇄',
    labelKey: 'onboarding.goalQuestion.option.sync.label',
    detailKey: 'onboarding.goalQuestion.option.sync.detail',
  },
  {
    id: 'logging',
    icon: '⌁',
    labelKey: 'onboarding.goalQuestion.option.logging.label',
    detailKey: 'onboarding.goalQuestion.option.logging.detail',
  },
  {
    id: 'reminders',
    icon: '◷',
    labelKey: 'onboarding.goalQuestion.option.reminders.label',
    detailKey: 'onboarding.goalQuestion.option.reminders.detail',
  },
  {
    id: 'moments',
    icon: '▣',
    labelKey: 'onboarding.goalQuestion.option.moments.label',
    detailKey: 'onboarding.goalQuestion.option.moments.detail',
  },
  {
    id: 'household',
    icon: '♧',
    labelKey: 'onboarding.goalQuestion.option.household.label',
    detailKey: 'onboarding.goalQuestion.option.household.detail',
  },
  {
    id: 'overnight',
    icon: '◔',
    labelKey: 'onboarding.goalQuestion.option.overnight.label',
    detailKey: 'onboarding.goalQuestion.option.overnight.detail',
  },
]

export default function GoalQuestionScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const primaryGoal = useOnboardingQuestionnaireStore((s) => s.primaryGoal)
  const setPrimaryGoal = useOnboardingQuestionnaireStore((s) => s.setPrimaryGoal)

  return (
    <Screen>
      <OnboardingFrame
        title={t('onboarding.goalQuestion.title')}
        subtitle={t('onboarding.goalQuestion.subtitle')}
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
                accessibilityLabel={t(goal.labelKey)}
                accessibilityState={{ selected }}
              >
                <View style={[styles.iconBubble, selected && styles.iconBubbleSelected]}>
                  <Text style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                    {goal.icon}
                  </Text>
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{t(goal.labelKey)}</Text>
                  <Text style={styles.optionDetail}>{t(goal.detailKey)}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            )
          })}
        </View>

        <Card style={styles.reassuranceCard}>
          <Text style={styles.reassuranceTitle}>
            {t('onboarding.goalQuestion.reassurance.title')}
          </Text>
          <Text style={styles.reassuranceText}>
            {t('onboarding.goalQuestion.reassurance.body')}
          </Text>
        </Card>

        <Button
          onPress={() => router.push('/(onboarding)/pain-points')}
          disabled={!primaryGoal}
          style={styles.button}
        >
          {t('common.continue')} →
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
