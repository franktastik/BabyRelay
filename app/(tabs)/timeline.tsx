import { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Search, Settings2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { TimelineFilters, TimelineList } from '@/src/components/timeline'
import { buildTimelineItems, filterTimelineItems } from '@/src/features/timeline/adapter'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useFiltersStore } from '@/src/stores/filtersStore'
import { useGrowthTimeline } from '@/src/features/growth'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function TimelineScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const selectedBabyId = useAuthStore((s) => s.selectedBabyId) || 'baby-1'
  const filter = useFiltersStore((s) => s.filter)
  const setFilter = useFiltersStore((s) => s.setFilter)
  const localEvents = useCareEventStore((s) => s.events)
  const subscribeToEvents = useCareEventStore((s) => s.subscribeToEvents)
  const { moments: growthMoments } = useGrowthTimeline(selectedBabyId)

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = subscribeToEvents(selectedBabyId)
      return unsubscribe
    }, [selectedBabyId, subscribeToEvents])
  )

  const careEvents = localEvents.filter((event) => event.babyId === selectedBabyId)
  const timelineItems = buildTimelineItems(careEvents, growthMoments)
  const filteredItems = filterTimelineItems(timelineItems, filter)

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('timeline.title')}</Text>
        <View style={styles.headerActions}>
          <IconButton icon="search" label={t('timeline.searchComingSoon')} />
          <IconButton icon="settings" label={t('timeline.settingsComingSoon')} />
        </View>
      </View>

      <TimelineFilters selected={filter} onSelect={setFilter} />

      <TimelineList
        items={filteredItems}
        onAddMoment={() => router.push('/modals/add-moment')}
      />
    </Screen>
  )
}

function IconButton({ icon, label }: { icon: 'search' | 'settings'; label: string }) {
  const Icon = icon === 'search' ? Search : Settings2

  return (
    <Pressable
      disabled
      accessibilityLabel={label}
      accessibilityState={{ disabled: true }}
      style={[styles.iconButton, styles.iconButtonDisabled]}
      hitSlop={10}
    >
      <Icon color={colors.mutedLight} size={19} strokeWidth={2} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconButtonDisabled: {
    opacity: 0.55,
  },
})
