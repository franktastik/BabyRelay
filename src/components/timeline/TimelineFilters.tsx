import React from 'react'
import { Pressable, StyleSheet, ScrollView, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, spacing, typography } from '@/src/theme'
import type { TimelineFilter } from '@/src/stores/filtersStore'

interface TimelineFiltersProps {
  selected: TimelineFilter
  onSelect: (filter: TimelineFilter) => void
}

const filters: { key: TimelineFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'timeline.filter.all' },
  { key: 'care', labelKey: 'timeline.filter.care' },
  { key: 'growth', labelKey: 'timeline.filter.growth' },
  { key: 'notes', labelKey: 'timeline.filter.notes' },
]

export function TimelineFilters({ selected, onSelect }: TimelineFiltersProps) {
  const { t } = useTranslation()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(({ key, labelKey }) => (
        <Pressable
          key={`${key}-${labelKey}`}
          style={[styles.filterPill, selected === key && styles.filterPillSelected]}
          onPress={() => onSelect(key)}
        >
          <Text style={[styles.filterText, selected === key && styles.filterTextSelected]}>
            {t(labelKey)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 22,
    gap: 10,
  },
  filterPill: {
    minWidth: 78,
    height: 36,
    paddingHorizontal: 17,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  filterText: {
    ...typography.bodySmall,
    lineHeight: 17,
    color: colors.stoneText,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: colors.white,
    fontWeight: '800',
  },
})
