import React from 'react'
import { Pressable, StyleSheet, ScrollView, Text } from 'react-native'
import { colors, radius, spacing, typography } from '@/src/theme'
import type { TimelineFilter } from '@/src/stores/filtersStore'

interface TimelineFiltersProps {
  selected: TimelineFilter
  onSelect: (filter: TimelineFilter) => void
}

const filters: { key: TimelineFilter; label: string }[] = [
  { key: 'all', label: 'All Events' },
  { key: 'care', label: 'Feeding' },
  { key: 'growth', label: 'Growth' },
  { key: 'notes', label: 'Notes' },
]

export function TimelineFilters({ selected, onSelect }: TimelineFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(({ key, label }) => (
        <Pressable
          key={`${key}-${label}`}
          style={[styles.filterPill, selected === key && styles.filterPillSelected]}
          onPress={() => onSelect(key)}
        >
          <Text style={[styles.filterText, selected === key && styles.filterTextSelected]}>
            {label}
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
