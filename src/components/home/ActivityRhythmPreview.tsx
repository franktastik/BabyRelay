import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Activity, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { activityAgeLabel, type BabyMinimoActivitySummary } from '@/src/features/activity'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

interface ActivityRhythmPreviewProps {
  summary: BabyMinimoActivitySummary
  onPress: () => void
}

export function ActivityRhythmPreview({ summary, onPress }: ActivityRhythmPreviewProps) {
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={t('home.activity.open')}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconFrame}>
            <Activity color={colors.sageText} size={19} strokeWidth={2.3} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>{t('home.activity.eyebrow')}</Text>
            <Text style={styles.title}>{t('home.activity.title')}</Text>
          </View>
        </View>
        <ChevronRight color={colors.muted} size={18} strokeWidth={2.4} />
      </View>

      <Text style={styles.body}>
        {summary.lastActivity
          ? t('home.activity.latest', {
              label: summary.lastActivity.label,
              time: activityAgeLabel(summary.lastActivity.occurredAt),
            })
          : t('home.activity.empty')}
      </Text>

      <View style={styles.statRow}>
        <Stat value={summary.todayCount} label={t('home.activity.today')} />
        <Stat value={summary.careEventsToday} label={t('home.activity.care')} />
        <Stat value={summary.remindersToday} label={t('home.activity.nudges')} />
      </View>
    </Pressable>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    flex: 1,
  },
  iconFrame: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    ...typography.action,
    color: colors.ink,
  },
  body: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginBottom: spacing.base,
  },
  statRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.base,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: colors.ink,
  },
  statLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
})
