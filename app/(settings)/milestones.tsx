import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SettingsHeader } from '@/src/components/settings'
import { Screen } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const milestoneKeys = [
  'milestones.item.smile',
  'milestones.item.roll',
  'milestones.item.sit',
]

export default function MilestonesScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [celebrating, setCelebrating] = useState(true)

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader
          title={t('milestones.title')}
          subtitle={t('milestones.subtitle')}
          onBack={() => router.replace('/settings')}
        />

        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★</Text>
          </View>
          <Text style={styles.heroTitle}>{t('milestones.heroTitle')}</Text>
          <Text style={styles.heroBody}>{t('milestones.heroBody')}</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressMeta}>{t('milestones.progressMeta')}</Text>
        </View>

        {celebrating ? (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationIcon}>✦</Text>
            <View style={styles.celebrationCopy}>
              <Text style={styles.cardTitle}>{t('milestones.celebrationTitle')}</Text>
              <Text style={styles.cardBody}>{t('milestones.celebrationBody')}</Text>
            </View>
            <Pressable
              onPress={() => setCelebrating(false)}
              style={styles.closePill}
              accessibilityRole="button"
              accessibilityLabel={t('milestones.dismiss')}
            >
              <Text style={styles.closeText}>{t('milestones.dismiss')}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>{t('milestones.listTitle')}</Text>
          {milestoneKeys.map((key, index) => (
            <View key={key} style={styles.milestoneRow}>
              <View style={[styles.milestoneDot, index === 2 && styles.milestoneDotPending]} />
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{t(key)}</Text>
                <Text style={styles.rowMeta}>{t(index === 2 ? 'milestones.pending' : 'milestones.logged')}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => setCelebrating(true)}
          style={styles.primaryButton}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{t('milestones.markButton')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 120,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.md,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.softClay,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 28,
    color: colors.clay,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  heroBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  progressTrack: {
    height: 10,
    width: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.stone,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '68%',
    borderRadius: radius.full,
    backgroundColor: colors.sage,
  },
  progressMeta: {
    ...typography.label,
    color: colors.sageText,
    marginTop: spacing.sm,
  },
  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    borderRadius: radius.xxl,
    backgroundColor: colors.creamAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  celebrationIcon: {
    fontSize: 24,
    color: colors.gold,
  },
  celebrationCopy: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  closePill: {
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  closeText: {
    ...typography.label,
    color: colors.sageText,
  },
  sectionCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginTop: spacing.md,
  },
  milestoneDot: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
  },
  milestoneDotPending: {
    backgroundColor: colors.border,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    ...typography.action,
    color: colors.ink,
  },
  rowMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: radius.xl,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
  },
  primaryButtonText: {
    ...typography.action,
    color: colors.white,
  },
})
