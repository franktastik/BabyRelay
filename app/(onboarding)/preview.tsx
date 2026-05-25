import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { trackEvent } from '@/src/features/analytics'
import {
  getOnboardingGoalLabel,
  getOnboardingPreviewMode,
  useOnboardingQuestionnaireStore,
} from '@/src/stores/onboardingQuestionnaireStore'

export default function PreviewScreen() {
  const router = useRouter()
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted)
  const primaryGoal = useOnboardingQuestionnaireStore((s) => s.primaryGoal)
  const painPoints = useOnboardingQuestionnaireStore((s) => s.painPoints)
  const priorities = useOnboardingQuestionnaireStore((s) => s.priorities)
  const previewMode = getOnboardingPreviewMode(primaryGoal, painPoints)
  const goalLabel = getOnboardingGoalLabel(primaryGoal)
  const nextDueLabel = previewMode === 'reminder' ? 'Next reminder' : 'Next due'
  const nextDueValue = previewMode === 'growth' ? 'Photo moment' : 'Vitamin D'
  const latestNote =
    previewMode === 'overnight'
      ? 'Overnight handoff is ready before anyone wakes.'
      : previewMode === 'growth'
        ? 'Local photo moments stay on this device in v1.'
        : previewMode === 'logging'
          ? 'Feeds, diapers, and sleep are ready for your first log.'
          : 'Your care circle will see what happened last.'

  const handleStart = () => {
    setOnboardingCompleted(true)
    trackEvent('onboarding_completed')
    router.replace('/(tabs)/home')
  }

  return (
    <Screen>
      <OnboardingFrame
        title="Know what happened last, instantly."
        subtitle={`Your setup is shaped around ${goalLabel}, with a calm preview for your first day.`}
        step="Preview"
        progress={1}
        onBack={() => router.back()}
      >
        <Card style={styles.previewCard}>
          <View style={styles.babyHeader}>
            <Image source={require('../baby-preview-avatar.png')} style={styles.babyAvatar} />
            <View>
              <Text style={styles.babyName}>Leo Miller</Text>
              <Text style={styles.babyStatus}>Currently sleeping</Text>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricTile}>
              <Text style={styles.metricIcon}>⌁</Text>
              <Text style={styles.metricLabel}>Last fed</Text>
              <Text style={styles.metricValue}>4.5<Text style={styles.metricUnit}> oz</Text></Text>
              <Text style={styles.metricMeta}>2h15m ago • Sarah</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricIcon}>◌</Text>
              <Text style={styles.metricLabel}>Diaper</Text>
              <Text style={styles.metricValue}>Wet</Text>
              <Text style={styles.metricMeta}>48m ago • David</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricIcon}>◷</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
              <Text style={styles.metricValue}>1h 22m</Text>
              <Text style={styles.metricMeta}>Since 1:45 PM</Text>
            </View>
            <View style={[styles.metricTile, styles.nextDueTile]}>
              <Text style={[styles.metricIcon, styles.nextDueText]}>◴</Text>
              <Text style={[styles.metricLabel, styles.nextDueText]}>{nextDueLabel}</Text>
              <Text style={[styles.metricValue, styles.nextDueText]}>{nextDueValue}</Text>
              <Text style={[styles.metricMeta, styles.nextDueMeta]}>
                {previewMode === 'reminder' ? 'in 15 minutes' : '4:00 PM'}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.personalCard}>
          <Text style={styles.personalTitle}>Personalized for {goalLabel}</Text>
          <Text style={styles.personalText}>{latestNote}</Text>
          <Text style={styles.personalMeta}>
            Tracking first: {priorities.slice(0, 3).join(', ') || 'feeding, diapers, sleep'}
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button onPress={handleStart} style={styles.button}>
            Start BabyMinimo →
          </Button>
        </View>
        <Text style={styles.helper}>Your household is ready.</Text>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  previewCard: {
    padding: spacing.lg,
    borderRadius: radius.xxxl,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  babyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  babyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  babyName: {
    ...typography.action,
    color: colors.ink,
  },
  babyStatus: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
  },
  metricTile: {
    width: '47%',
    minHeight: 94,
    borderRadius: radius.lg,
    backgroundColor: colors.stone,
    padding: spacing.md,
  },
  nextDueTile: {
    backgroundColor: colors.clay,
    ...shadows.sm,
  },
  metricIcon: {
    color: colors.sageText,
    fontSize: 17,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  metricValue: {
    ...typography.h3,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  metricUnit: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  metricMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: spacing.xs,
  },
  nextDueText: {
    color: colors.white,
  },
  nextDueMeta: {
    color: colors.white,
  },
  personalCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.softSage,
    marginBottom: spacing.lg,
  },
  personalTitle: {
    ...typography.action,
    color: colors.ink,
  },
  personalText: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
  personalMeta: {
    ...typography.label,
    color: colors.sageText,
    marginTop: spacing.base,
    textTransform: 'uppercase',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  button: {
    width: '100%',
    minHeight: 56,
    backgroundColor: colors.sage,
    ...shadows.md,
  },
  helper: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.base,
  },
})
