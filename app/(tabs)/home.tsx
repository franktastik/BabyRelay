import { useCallback, useEffect, useState } from 'react'
import { InteractionManager, ScrollView, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Screen } from '@/src/components/ui'
import { HomeHeader, SnapshotCard, QuickActionBar, GrowthPreview } from '@/src/components/home'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { spacing } from '@/src/theme'

export default function HomeScreen() {
  const router = useRouter()
  const selectedBabyId = useAuthStore((state) => state.selectedBabyId) || 'baby-1'
  const localEvents = useCareEventStore((state) => state.events)
  const subscribeToEvents = useCareEventStore((state) => state.subscribeToEvents)
  const [moments, setMoments] = useState<DemoGrowthMoment[]>([])
  const latestLocalEvent = localEvents
    .filter((event) => event.babyId === selectedBabyId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0]
  const latestEvent = latestLocalEvent

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = subscribeToEvents(selectedBabyId)
      return unsubscribe
    }, [selectedBabyId, subscribeToEvents])
  )

  useEffect(() => {
    let cancelled = false
    const task = InteractionManager.runAfterInteractions(() => {
      import('@/src/features/demo/growth').then(({ createDemoGrowthAdapter }) => {
        if (cancelled) return
        createDemoGrowthAdapter()
          .getMoments(selectedBabyId)
          .then((nextMoments) => {
            if (!cancelled) {
              setMoments(nextMoments)
            }
          })
      })
    })

    return () => {
      cancelled = true
      task.cancel()
    }
  }, [selectedBabyId])

  return (
    <Screen style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          babyName="Luna"
          caregiverName="Mama"
          onSettingsPress={() => router.push('/settings')}
        />

        <SnapshotCard
          latestEvent={latestEvent || undefined}
          lastActionBy={latestEvent?.createdBy}
        />

        <QuickActionBar />

        <GrowthPreview
          moments={moments}
          onViewAll={() => console.log('View all growth moments')}
        />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  screen: {
    paddingHorizontal: spacing.lg,
  },
})
