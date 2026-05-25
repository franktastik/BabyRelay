import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
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
  labelKey: string
  detailKey: string
}> = [
  {
    id: 'missed-handoffs',
    icon: '⇄',
    labelKey: 'onboarding.painPoints.option.missedHandoffs.label',
    detailKey: 'onboarding.painPoints.option.missedHandoffs.detail',
  },
  {
    id: 'partner-updates',
    icon: '✉',
    labelKey: 'onboarding.painPoints.option.partnerUpdates.label',
    detailKey: 'onboarding.painPoints.option.partnerUpdates.detail',
  },
  {
    id: 'overnight-confusion',
    icon: '◔',
    labelKey: 'onboarding.painPoints.option.overnightConfusion.label',
    detailKey: 'onboarding.painPoints.option.overnightConfusion.detail',
  },
  {
    id: 'forgot-reminders',
    icon: '◷',
    labelKey: 'onboarding.painPoints.option.forgotReminders.label',
    detailKey: 'onboarding.painPoints.option.forgotReminders.detail',
  },
  {
    id: 'scattered-notes',
    icon: '☰',
    labelKey: 'onboarding.painPoints.option.scatteredNotes.label',
    detailKey: 'onboarding.painPoints.option.scatteredNotes.detail',
  },
  {
    id: 'photo-moments-buried',
    icon: '◌',
    labelKey: 'onboarding.painPoints.option.photoMomentsBuried.label',
    detailKey: 'onboarding.painPoints.option.photoMomentsBuried.detail',
  },
]

export default function PainPointsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const selectedPainPoints = useOnboardingQuestionnaireStore((s) => s.painPoints)
  const togglePainPoint = useOnboardingQuestionnaireStore((s) => s.togglePainPoint)

  return (
    <Screen>
      <OnboardingFrame
        title={t('onboarding.painPoints.title')}
        subtitle={t('onboarding.painPoints.subtitle')}
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
                accessibilityLabel={t(painPoint.labelKey)}
                accessibilityState={{ checked: selected }}
              >
                <View style={[styles.iconBubble, selected && styles.iconBubbleSelected]}>
                  <Text style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                    {painPoint.icon}
                  </Text>
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{t(painPoint.labelKey)}</Text>
                  <Text style={styles.optionDetail}>{t(painPoint.detailKey)}</Text>
                </View>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            )
          })}
        </View>

        <Button onPress={() => router.push('/(onboarding)/problem')} style={styles.button}>
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
