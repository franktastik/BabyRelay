import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import type { DemoCareEvent } from '@/src/features/demo/events'

interface SnapshotCardProps {
  latestEvent?: DemoCareEvent
  lastActionBy?: string
}

export function SnapshotCard({ latestEvent }: SnapshotCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <StatusTile icon="⌁" label="Last fed" value={latestEvent ? getTimeAgo(latestEvent.occurredAt) : '2h 15m ago'} meta="4oz • Sarah" />
        <StatusTile icon="◔" label="Sleep today" value="8h 12m" meta="Goal: 14h" />
        <StatusTile icon="♧" label="Last diaper" value="45m ago" meta="Wet • David" />
        <StatusTile icon="◷" label="Due next" value="Feeding" meta="in 45 minutes" accent />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryIcon}>▥</Text>
          <Text style={styles.summaryTitle}>This Week's Summary</Text>
          <Text style={styles.summaryChevron}>›</Text>
        </View>
        <View style={styles.summaryStats}>
          <SummaryStat value="48" label="↗ Feeds" tone="good" />
          <View style={styles.statDivider} />
          <SummaryStat value="12.4h" label="↘ Sleep" tone="bad" />
          <View style={styles.statDivider} />
          <SummaryStat value="56" label="Diapers" />
        </View>
      </View>
    </View>
  )
}

function StatusTile({
  icon,
  label,
  value,
  meta,
  accent = false,
}: {
  icon: string
  label: string
  value: string
  meta: string
  accent?: boolean
}) {
  return (
    <View style={[styles.tile, accent && styles.accentTile]}>
      <View style={[styles.tileIcon, accent && styles.accentIcon]}>
        <Text style={[styles.tileIconText, accent && styles.accentText]}>{icon}</Text>
      </View>
      <Text style={[styles.tileLabel, accent && styles.accentText]}>{label}</Text>
      <Text style={[styles.tileValue, accent && styles.accentText]}>{value}</Text>
      <Text style={[styles.tileMeta, accent && styles.accentText]}>{meta}</Text>
    </View>
  )
}

function SummaryStat({
  value,
  label,
  tone,
}: {
  value: string
  label: string
  tone?: 'good' | 'bad'
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text
        style={[
          styles.summaryLabel,
          tone === 'good' && styles.goodText,
          tone === 'bad' && styles.badText,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

function getTimeAgo(date: Date): string {
  const diffMin = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMin < 60) return `${diffMin}m ago`
  const hours = Math.floor(diffMin / 60)
  const minutes = diffMin % 60
  return minutes ? `${hours}h ${minutes}m ago` : `${hours}h ago`
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
  },
  tile: {
    width: '48%',
    minHeight: 126,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  accentTile: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
    ...shadows.md,
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  accentIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  tileIconText: {
    color: colors.sageText,
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tileLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tileValue: {
    ...typography.h2,
    color: colors.ink,
  },
  tileMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  accentText: {
    color: colors.white,
  },
  summaryCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  summaryIcon: {
    color: colors.sageText,
    fontSize: 16,
  },
  summaryTitle: {
    ...typography.action,
    flex: 1,
    color: colors.ink,
  },
  summaryChevron: {
    color: colors.muted,
    fontSize: 22,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.action,
    color: colors.ink,
  },
  summaryLabel: {
    ...typography.label,
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: colors.creamAlt,
  },
  goodText: {
    color: '#27A75E',
  },
  badText: {
    color: colors.danger,
  },
})
