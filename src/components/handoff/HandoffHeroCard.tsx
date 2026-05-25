import React from 'react'
import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import { Bell } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, spacing, typography, shadows } from '@/src/theme'
import { relativeTime } from '@/src/relative-time'

interface HandoffHeroCardProps {
  babyName: string
  lastFeed: { label: string; time: Date; by: string } | null
  lastDiaper: { label: string; time: Date; by: string } | null
  lastSleep: { label: string; time: Date; status: 'sleeping' | 'awake'; startedAt?: Date } | null
  lastActionBy: string | null
  onReminderPress?: () => void
}

const babyAvatar = require('../../../app/baby-preview-avatar.png')

export function HandoffHeroCard({
  babyName,
  lastFeed,
  lastDiaper,
  lastSleep,
  lastActionBy,
  onReminderPress,
}: HandoffHeroCardProps) {
  const { t } = useTranslation()
  const status = lastSleep?.status === 'sleeping' ? t('handoff.status.sleeping') : t('handoff.status.awake')

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.babyIdentity}>
          <View style={styles.avatarWrap}>
            <Image source={babyAvatar} style={styles.avatar} />
            <View style={styles.statusDot} />
          </View>
          <View>
            <Text style={styles.babyName}>{babyName}</Text>
            <View style={styles.statusLine}>
              <View style={styles.statusPin} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={onReminderPress}
          disabled={!onReminderPress}
          style={[styles.bellButton, !onReminderPress && styles.bellButtonDisabled]}
          accessibilityRole={onReminderPress ? 'button' : undefined}
          accessibilityLabel={onReminderPress ? t('handoff.reminders.open') : t('handoff.reminders.unavailable')}
          accessibilityState={!onReminderPress ? { disabled: true } : undefined}
        >
          <Bell color={colors.sageText} size={18} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        <MetricCard
          icon="⌁"
          iconBackground={colors.softSage}
          iconColor={colors.sageText}
          label={t('handoff.metric.feeding')}
          value={lastFeed?.label ?? t('common.noData')}
          meta={lastFeed ? relativeTime(lastFeed.time) : t('common.startLogging')}
        />
        <MetricCard
          icon="◡"
          iconBackground={colors.softClay}
          iconColor={colors.clay}
          label={t('handoff.metric.diaper')}
          value={lastDiaper?.label ?? t('common.noData')}
          meta={lastDiaper ? relativeTime(lastDiaper.time) : t('common.startLogging')}
        />
        <MetricCard
          icon="☾"
          iconBackground="#F1F0FF"
          iconColor="#7C83D4"
          label={t('handoff.metric.sleep')}
          value={lastSleep?.label ?? t('common.noData')}
          meta={lastSleep?.startedAt ? `Since ${formatTime(lastSleep.startedAt)}` : lastSleep ? relativeTime(lastSleep.time) : t('common.startLogging')}
        />
        <MetricCard
          icon="♨"
          iconBackground="#FFF7DF"
          iconColor="#D69B36"
          label={t('handoff.metric.health')}
          value={t('handoff.metric.healthValue')}
          meta={lastActionBy ? t('handoff.metric.stableBy', { caregiver: lastActionBy }) : t('common.stable')}
        />
      </View>
    </View>
  )
}

function MetricCard({
  icon,
  label,
  value,
  meta,
  iconBackground,
  iconColor,
}: {
  icon: string
  label: string
  value: string
  meta: string
  iconBackground: string
  iconColor: string
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, { backgroundColor: iconBackground }]}>
          <Text style={[styles.metricIconText, { color: iconColor }]}>{icon}</Text>
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.metricMeta} numberOfLines={1}>
        {meta}
      </Text>
    </View>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  babyIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatarWrap: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.sage,
    borderWidth: 2,
    borderColor: colors.white,
  },
  babyName: {
    ...typography.h2,
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  statusPin: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.sage,
  },
  statusText: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  bellButtonDisabled: {
    opacity: 0.55,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: '47.4%',
    minHeight: 118,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconText: {
    fontSize: 17,
    lineHeight: 19,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  metricLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  metricValue: {
    ...typography.h1,
    color: colors.ink,
    marginTop: spacing.base,
  },
  metricMeta: {
    ...typography.bodySmall,
    color: colors.muted,
  },
})
