import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, spacing, typography, shadows } from '@/src/theme'

interface DueSoonCardProps {
  medication: { label: string; dueAt: Date } | null
}

export function DueSoonCard({ medication }: DueSoonCardProps) {
  if (!medication) {
    return (
      <View style={styles.container}>
        <SectionHeader overdueCount={0} />
        <View style={styles.row}>
          <Text style={styles.empty}>Nothing due right now</Text>
        </View>
      </View>
    )
  }

  const isOverdue = medication.dueAt.getTime() < Date.now()

  return (
    <View style={styles.container}>
      <SectionHeader overdueCount={isOverdue ? 1 : 0} />
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>⌁</Text>
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.medicationLabel}>{medication.label}</Text>
          <Text style={[styles.dueTime, isOverdue && styles.overdueText]}>
            {formatDueText(medication.dueAt, isOverdue)}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </View>
  )
}

function SectionHeader({ overdueCount }: { overdueCount: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Due Soon</Text>
      {overdueCount > 0 && (
        <Text style={styles.overduePill}>{overdueCount} Overdue</Text>
      )}
    </View>
  )
}

function formatDueText(date: Date, isOverdue: boolean): string {
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return isOverdue ? `Was due at ${time}` : `Due at ${time}`
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.ink,
  },
  overduePill: {
    ...typography.label,
    color: colors.clay,
    textTransform: 'uppercase',
  },
  row: {
    minHeight: 68,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    ...shadows.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.softClay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.clay,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  rowContent: {
    flex: 1,
  },
  medicationLabel: {
    ...typography.action,
    color: colors.ink,
  },
  dueTime: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  overdueText: {
    color: colors.clay,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  empty: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  chevron: {
    color: colors.mutedLight,
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
