import { useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Camera, Images, Search, Settings2, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { GrowthMediaSafetyCard, TimelineFilters, TimelineList } from '@/src/components/timeline'
import {
  buildTimelineItems,
  filterTimelineItems,
  searchTimelineItems,
  sortTimelineItems,
  type TimelineSortOrder,
} from '@/src/features/timeline/adapter'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useFiltersStore } from '@/src/stores/filtersStore'
import { useGrowthTimeline } from '@/src/features/growth'
import {
  buildGrowthTimelineMediaRecord,
  summarizeGrowthTimelineMediaDurability,
} from '@/src/features/growth/mediaDurability'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function TimelineScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const searchInputRef = useRef<TextInput>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>('newest')
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

  const careEvents = useMemo(
    () => localEvents.filter((event) => event.babyId === selectedBabyId),
    [localEvents, selectedBabyId]
  )
  const timelineItems = useMemo(
    () => buildTimelineItems(careEvents, growthMoments),
    [careEvents, growthMoments]
  )
  const filteredItems = useMemo(
    () =>
      sortTimelineItems(
        searchTimelineItems(filterTimelineItems(timelineItems, filter), searchQuery),
        sortOrder
      ),
    [filter, searchQuery, sortOrder, timelineItems]
  )
  const mediaSummary = useMemo(
    () =>
      summarizeGrowthTimelineMediaDurability(
        growthMoments.map(buildGrowthTimelineMediaRecord)
      ),
    [growthMoments]
  )
  const openSearch = () => {
    setSettingsOpen(false)
    setSearchOpen(true)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }
  const closeSearch = () => {
    setSearchQuery('')
    setSearchOpen(false)
  }

  return (
    <Screen style={styles.screen}>
      {searchOpen ? (
        <View style={styles.header}>
          <View style={styles.headerSearchPanel}>
            <Search color={colors.sageText} size={18} strokeWidth={2.2} />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('timeline.searchPlaceholder')}
              placeholderTextColor={colors.mutedLight}
              style={styles.searchInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={t('timeline.searchInputLabel')}
            />
            <Pressable
              onPress={searchQuery.length > 0 ? () => setSearchQuery('') : closeSearch}
              style={styles.clearSearchButton}
              accessibilityRole="button"
              accessibilityLabel={searchQuery.length > 0 ? t('timeline.clearSearch') : t('common.cancel')}
              hitSlop={10}
            >
              <X color={colors.muted} size={17} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>{t('timeline.title')}</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="search"
              label={t('timeline.search')}
              onPress={openSearch}
            />
            <IconButton
              icon="settings"
              label={t('timeline.settings')}
              selected={settingsOpen}
              onPress={() => setSettingsOpen((open) => !open)}
            />
          </View>
        </View>
      )}

      <TimelineFilters selected={filter} onSelect={setFilter} />

      {filter === 'growth' ? (
        <>
          <Pressable
            onPress={() => router.push('/modals/export-album')}
            style={styles.albumEntry}
            accessibilityRole="button"
            accessibilityLabel={t('album.timelineEntry.title')}
            testID="timeline-growth-export-album-entry"
          >
            <View style={styles.albumEntryIcon}>
              <Images color={colors.sageText} size={19} strokeWidth={2.2} />
            </View>
            <View style={styles.albumEntryCopy}>
              <Text style={styles.albumEntryTitle}>{t('album.timelineEntry.title')}</Text>
              <Text style={styles.albumEntryMeta}>{t('album.timelineEntry.meta')}</Text>
            </View>
            <Text style={styles.albumEntryAction}>{t('album.timelineEntry.action')}</Text>
          </Pressable>
          <GrowthMediaSafetyCard
            mediaCount={growthMoments.length}
            backupCandidateCount={mediaSummary.backupCandidateCount}
            missingCount={mediaSummary.missingCount}
          />
        </>
      ) : null}

      {settingsOpen ? (
        <View style={styles.settingsPanel}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>{t('timeline.settingsTitle')}</Text>
            <Text style={styles.settingsMeta}>{t('timeline.settingsMeta')}</Text>
          </View>
          <View style={styles.sortControl}>
            <SortButton
              label={t('timeline.sortNewest')}
              selected={sortOrder === 'newest'}
              onPress={() => setSortOrder('newest')}
            />
            <SortButton
              label={t('timeline.sortOldest')}
              selected={sortOrder === 'oldest'}
              onPress={() => setSortOrder('oldest')}
            />
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push('/modals/add-moment')}
        style={styles.addMomentButton}
        accessibilityRole="button"
        accessibilityLabel={t('timeline.addMoment')}
      >
        <View style={styles.addMomentIcon}>
          <Camera color={colors.sageText} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.addMomentCopy}>
          <Text style={styles.addMomentTitle}>{t('timeline.addMoment')}</Text>
          <Text style={styles.addMomentSubtitle}>{t('timeline.addMomentSubtitle')}</Text>
        </View>
      </Pressable>

      <TimelineList
        items={filteredItems}
        onAddMoment={() => router.push('/modals/add-moment')}
      />
    </Screen>
  )
}

function SortButton({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.sortButton, selected && styles.sortButtonSelected]}
    >
      <Text style={[styles.sortButtonText, selected && styles.sortButtonTextSelected]}>
        {label}
      </Text>
    </Pressable>
  )
}

function IconButton({
  icon,
  label,
  selected = false,
  onPress,
}: {
  icon: 'search' | 'settings'
  label: string
  selected?: boolean
  onPress?: () => void
}) {
  const Icon = icon === 'search' ? Search : Settings2
  const disabled = !onPress

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      style={[
        styles.iconButton,
        selected && styles.iconButtonSelected,
        disabled && styles.iconButtonDisabled,
      ]}
      hitSlop={10}
    >
      <Icon
        color={selected ? colors.white : disabled ? colors.mutedLight : colors.sageText}
        size={19}
        strokeWidth={2}
      />
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
  iconButtonSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  headerSearchPanel: {
    minHeight: 48,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    ...shadows.sm,
  },
  searchInput: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
    minHeight: 44,
    paddingVertical: 0,
  },
  clearSearchButton: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsPanel: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    padding: spacing.base,
    gap: spacing.base,
    ...shadows.sm,
  },
  settingsHeader: {
    gap: 2,
  },
  settingsTitle: {
    ...typography.action,
    color: colors.ink,
  },
  settingsMeta: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  sortControl: {
    minHeight: 40,
    borderRadius: radius.full,
    backgroundColor: colors.softSage,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  sortButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  sortButtonSelected: {
    backgroundColor: colors.sage,
  },
  sortButtonText: {
    ...typography.bodySmall,
    color: colors.stoneText,
    fontWeight: '700',
  },
  sortButtonTextSelected: {
    color: colors.white,
  },
  albumEntry: {
    minHeight: 76,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    ...shadows.sm,
  },
  albumEntryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumEntryCopy: {
    flex: 1,
  },
  albumEntryTitle: {
    ...typography.action,
    color: colors.ink,
  },
  albumEntryMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  albumEntryAction: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  addMomentButton: {
    minHeight: 62,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.base,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    ...shadows.sm,
  },
  addMomentIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMomentCopy: {
    flex: 1,
  },
  addMomentTitle: {
    ...typography.action,
    color: colors.ink,
  },
  addMomentSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
})
