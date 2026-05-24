import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { TimelineItem } from '@/src/features/timeline/adapter'
import { CareEventCard } from './CareEventCard'
import { GrowthMomentCard } from './GrowthMomentCard'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

interface TimelineListProps {
  items: TimelineItem[]
  onAddMoment: () => void
}

export function TimelineList({ items, onAddMoment }: TimelineListProps) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconShell}>
          <Text style={styles.emptyIcon}>♡</Text>
        </View>
        <Text style={styles.emptyTitle}>Start your story together</Text>
        <Text style={styles.emptyCopy}>
          Every feeding, diaper change, nap, and milestone will appear here,
          building your family&apos;s shared memory.
        </Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardIcon}>⌁</Text>
          <View style={styles.emptyCardText}>
            <Text style={styles.emptyCardTitle}>Log care events</Text>
            <Text style={styles.emptyCardMeta}>Feedings, diapers, sleep, and more</Text>
          </View>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardIcon}>♙</Text>
          <View style={styles.emptyCardText}>
            <Text style={styles.emptyCardTitle}>See who did what</Text>
            <Text style={styles.emptyCardMeta}>Every caregiver&apos;s actions appear automatically</Text>
          </View>
        </View>

        <Pressable onPress={onAddMoment} style={styles.emptyCta}>
          <Text style={styles.emptyCtaText}>＋ Add First Moment</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const timeLabel =
          item.type === 'growth'
            ? index === 0
              ? 'TODAY'
              : 'YESTERDAY, 4:20 PM'
            : '10:45 AM'
        const typeLabel =
          item.type === 'growth'
            ? 'GROWTH'
            : item.careEvent
              ? getCareTypeLabel(item.careEvent.type)
              : 'CARE'
        return (
          <View style={styles.itemRow}>
            <View style={styles.rail}>
              <View style={[styles.dot, item.type === 'growth' && styles.growthDot]} />
              <View style={styles.railLine} />
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemMetaRow}>
                <Text style={styles.itemTime}>{timeLabel}</Text>
                <Text style={styles.itemType}>{typeLabel}</Text>
              </View>
              {item.type === 'care' && item.careEvent ? (
                <CareEventCard event={item.careEvent} />
              ) : null}
              {item.type === 'growth' && item.growthMoment ? (
                <GrowthMomentCard moment={item.growthMoment} />
              ) : null}
            </View>
          </View>
        )
      }}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  )
}

function getCareTypeLabel(type: NonNullable<TimelineItem['careEvent']>['type']) {
  if (type === 'breastfeed' || type === 'bottle') return 'FEEDING'
  if (type === 'medication') return 'HEALTH'
  return type.toUpperCase()
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 118,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.clay,
    borderWidth: 2,
    borderColor: colors.cream,
    marginTop: 4,
  },
  growthDot: {
    backgroundColor: colors.sage,
  },
  railLine: {
    width: 1,
    flex: 1,
    minHeight: 116,
    backgroundColor: colors.border,
    opacity: 0.72,
  },
  itemContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.base,
    marginBottom: spacing.sm,
  },
  itemTime: {
    ...typography.bodySmall,
    color: colors.muted,
    fontWeight: '700',
  },
  itemType: {
    ...typography.label,
    color: colors.sageText,
    fontSize: 9,
  },
  empty: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 118,
    alignItems: 'center',
  },
  emptyIconShell: {
    width: 92,
    height: 92,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  emptyIcon: {
    color: colors.sageText,
    fontSize: 36,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  emptyCopy: {
    ...typography.body,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyCard: {
    width: '100%',
    minHeight: 72,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  emptyCardIcon: {
    color: colors.sageText,
    width: 32,
    textAlign: 'center',
    fontSize: 20,
  },
  emptyCardText: {
    flex: 1,
  },
  emptyCardTitle: {
    ...typography.action,
    color: colors.ink,
  },
  emptyCardMeta: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  emptyCta: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  emptyCtaText: {
    ...typography.action,
    color: colors.white,
  },
})
