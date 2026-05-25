import { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { HandoffHeroCard, DueSoonCard, LatestNoteCard } from '@/src/components/handoff'
import { AppStateView } from '@/src/components/states'
import { trackEvent } from '@/src/features/analytics'
import { useHandoffSummary } from '@/src/features/handoff'
import { useAuthStore } from '@/src/stores/authStore'
import { useBabyMinimoActivityStore } from '@/src/stores/activityStore'
import { colors, spacing } from '@/src/theme'

export default function HandoffScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const selectedBabyId = useAuthStore((state) => state.selectedBabyId) || 'baby-1'
  const selectedBaby = useAuthStore((state) =>
    state.babies.find((baby) => baby.id === selectedBabyId)
  )
  const addActivity = useBabyMinimoActivityStore((state) => state.addActivity)
  const { summary, loading } = useHandoffSummary(selectedBabyId)

  useEffect(() => {
    trackEvent('handoff_viewed', { babyId: selectedBabyId })
    addActivity({
      babyId: selectedBabyId,
      type: 'handoff_viewed',
      label: 'Handoff viewed',
      detail: selectedBaby?.name || summary?.babyName,
    })
  }, [addActivity, selectedBaby?.name, selectedBabyId, summary?.babyName])

  if (loading || !summary) {
    return (
      <View style={styles.stateContainer}>
        <AppStateView
          tone="loading"
          title={t('handoff.loading.title')}
          copy={t('handoff.loading.copy')}
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
          babyName={selectedBaby?.name || summary.babyName}
          lastFeed={summary.lastFeed}
          lastDiaper={summary.lastDiaper}
          lastSleep={summary.lastSleep}
          lastActionBy={summary.lastActionBy}
          onReminderPress={() => router.push('/reminders')}
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
