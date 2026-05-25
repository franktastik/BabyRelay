import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Card } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function BenefitsScreen() {
  const router = useRouter()

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.step}>Step 5 of 9</Text>
        </View>

        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>
            Know what happened{'\n'}last, <Text style={styles.titleAccent}>instantly.</Text>
          </Text>
          <Text style={styles.subtitle}>
            BabyMinimo keeps your household in sync, so you never have to ask "When did they
            last eat?"
          </Text>
        </View>

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
              <Text style={styles.metricValue}>
                4.5<Text style={styles.metricUnit}> oz</Text>
              </Text>
              <Text style={styles.metricMeta}>2h15m ago • Sarah</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricIcon}>◡</Text>
              <Text style={styles.metricLabel}>Diaper</Text>
              <Text style={styles.metricValue}>Wet</Text>
              <Text style={styles.metricMeta}>48m ago • David</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricIcon}>◔</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
              <Text style={styles.metricValue}>1h 22m</Text>
              <Text style={styles.metricMeta}>Since 1:45 PM</Text>
            </View>
            <View style={[styles.metricTile, styles.nextDueTile]}>
              <Text style={styles.nextDueIcon}>◷</Text>
              <Text style={styles.nextDueLabel}>Next due</Text>
              <Text style={styles.nextDueValue}>Vitamin D</Text>
              <Text style={styles.nextDueMeta}>4:00 PM</Text>
            </View>
          </View>
        </Card>

        <Button onPress={() => router.push('/(onboarding)/priorities')} style={styles.button}>
          Continue to Setup →
        </Button>
        <Text style={styles.helper}>You'll set up your baby profile next.</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.creamAlt,
    overflow: 'hidden',
  },
  progressFill: {
    width: '55%',
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
  },
  step: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  backText: {
    fontSize: 30,
    lineHeight: 31,
    color: colors.muted,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    fontSize: 27,
    lineHeight: 31,
  },
  titleAccent: {
    color: colors.sageText,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkLight,
    marginTop: spacing.base,
    maxWidth: 286,
  },
  previewCard: {
    padding: spacing.lg,
    borderRadius: radius.xxxl,
    marginBottom: -24,
  },
  babyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  babyAvatar: {
    width: 48,
    height: 48,
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
    minHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.stone,
    padding: spacing.md,
  },
  metricIcon: {
    color: colors.clay,
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  metricValue: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  metricUnit: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  metricMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: colors.muted,
    marginTop: spacing.xs,
  },
  nextDueTile: {
    backgroundColor: colors.clay,
    ...shadows.sm,
  },
  nextDueIcon: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: spacing.sm,
  },
  nextDueLabel: {
    ...typography.label,
    color: colors.white,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  nextDueValue: {
    ...typography.h3,
    color: colors.white,
    marginTop: spacing.xs,
  },
  nextDueMeta: {
    ...typography.bodySmall,
    color: colors.white,
    marginTop: spacing.xs,
  },
  button: {
    width: '100%',
    minHeight: 58,
    backgroundColor: colors.sage,
    ...shadows.lg,
  },
  helper: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.base,
  },
})
