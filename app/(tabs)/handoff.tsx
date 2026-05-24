import { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Screen } from '@/src/components/ui'
import { HandoffHeroCard, DueSoonCard, LatestNoteCard } from '@/src/components/handoff'
import { AppStateView } from '@/src/components/states'
import { trackEvent } from '@/src/features/analytics'
import { useHandoffSummary } from '@/src/features/handoff'
import { colors, spacing } from '@/src/theme'

export default function HandoffScreen() {
  const { summary, loading } = useHandoffSummary('baby-1')

  useEffect(() => {
    trackEvent('handoff_viewed', { babyId: 'baby-1' })
  }, [])

  if (loading || !summary) {
    return (
      <View style={styles.stateContainer}>
        <AppStateView
          tone="loading"
          title="Preparing handoff..."
          copy="BabyMinimo is pulling the latest feed, diaper, sleep, and note details."
        />
      </View>
    )
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HandoffHeroCard
          babyName={summary.babyName}
          lastFeed={summary.lastFeed}
          lastDiaper={summary.lastDiaper}
          lastSleep={summary.lastSleep}
          lastActionBy={summary.lastActionBy}
        />

        <DueSoonCard medication={summary.nextMedication} />

        <LatestNoteCard note={summary.latestNote} />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: 112,
    gap: spacing.lg,
  },
  stateContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    padding: spacing.lg,
  },
})
