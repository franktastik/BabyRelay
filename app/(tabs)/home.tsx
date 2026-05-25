import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Screen } from '@/src/components/ui'
import { HomeHeader, SnapshotCard, QuickActionBar, GrowthPreview } from '@/src/components/home'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useWidgetSettingsStore } from '@/src/stores/widgetSettingsStore'
import { spacing } from '@/src/theme'

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const selectedBabyId = useAuthStore((state) => state.selectedBabyId) || 'baby-1'
  const localEvents = useCareEventStore((state) => state.events)
  const subscribeToEvents = useCareEventStore((state) => state.subscribeToEvents)
  const widgetSnapshotsEnabled = useWidgetSettingsStore((state) => state.widgetSnapshotsEnabled)
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
    const cancelDeferredWork = scheduleDeferredWork(() => {
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
      cancelDeferredWork()
    }
  }, [selectedBabyId])

  useEffect(() => {
    let cancelled = false

    const cancelDeferredWork = scheduleDeferredWork(() => {
      if (!widgetSnapshotsEnabled) {
        import('@/src/features/widgets/currentStateWidgetUpdater')
          .then((widgetUpdater) => widgetUpdater.clearAndBlankBabyMinimoCurrentStateWidget())
          .catch(() => {
            // Widget updates are best-effort in local dev builds.
          })
        return
      }

      Promise.all([
        import('@/src/features/demo/handoff'),
        import('@/src/features/demo/reminders'),
        import('@/src/features/widgets/currentStateWidgetUpdater'),
      ])
        .then(async ([{ createDemoHandoffAdapter }, { demoReminders }, widgetUpdater]) => {
          const summary = await createDemoHandoffAdapter().getSummary(selectedBabyId)
          if (cancelled) return

          await widgetUpdater.writeAndUpdateBabyMinimoCurrentStateWidget({
            signedIn: Boolean(user),
            selectedBabyId,
            babyName: summary.babyName,
            handoffSummary: summary,
            reminders: demoReminders,
            source: 'localDemo',
            surface: 'homeScreen',
          })
        })
        .catch(() => {
          // Widget updates are best-effort in local dev builds.
        })
    })

    return () => {
      cancelled = true
      cancelDeferredWork()
    }
  }, [selectedBabyId, user, widgetSnapshotsEnabled])

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
          onViewAll={() => router.push('/timeline')}
        />
      </ScrollView>
    </Screen>
  )
}

function scheduleDeferredWork(work: () => void): () => void {
  if (typeof globalThis.requestIdleCallback === 'function') {
    const idleCallbackId = globalThis.requestIdleCallback(work)
    return () => globalThis.cancelIdleCallback?.(idleCallbackId)
  }

  const timeoutId = setTimeout(work, 0)
  return () => clearTimeout(timeoutId)
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
