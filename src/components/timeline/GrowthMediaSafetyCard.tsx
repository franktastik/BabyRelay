import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Archive, HardDrive } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export function GrowthMediaSafetyCard({
  mediaCount,
  backupCandidateCount,
  missingCount,
}: {
  mediaCount: number
  backupCandidateCount: number
  missingCount: number
}) {
  const { t } = useTranslation()

  return (
    <View style={styles.card} testID="timeline-growth-media-safety-card">
      <View style={styles.iconWrap}>
        <HardDrive color={colors.sageText} size={19} strokeWidth={2.3} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{t('timeline.mediaSafety.title')}</Text>
        <Text style={styles.meta}>{t('timeline.mediaSafety.meta')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Archive color={colors.sageText} size={13} strokeWidth={2.3} />
            <Text style={styles.statText}>
              {t('timeline.mediaSafety.backupReady', { count: backupCandidateCount })}
            </Text>
          </View>
          <Text style={styles.statMuted}>
            {missingCount > 0
              ? t('timeline.mediaSafety.missing', { count: missingCount })
              : t('timeline.mediaSafety.allTracked', { count: mediaCount })}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    borderRadius: radius.xl,
    backgroundColor: colors.softSage,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    padding: spacing.base,
    flexDirection: 'row',
    gap: spacing.base,
    ...shadows.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.action,
    color: colors.ink,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.stoneText,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statPill: {
    minHeight: 28,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.label,
    color: colors.sageText,
  },
  statMuted: {
    ...typography.label,
    color: colors.muted,
  },
})
