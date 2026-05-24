import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { AppStateView, SuccessToast } from '@/src/components/states'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function StatesScreen() {
  const router = useRouter()

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title="Care states" onBack={() => router.back()} rightIcon="none" />
        <Text style={styles.copy}>
          Screenshot-ready empty, loading, error, and success states for BabyMinimo flows.
        </Text>

        <SuccessToast title="Feeding logged!" copy="Everyone in the household can see it now." />

        <View style={styles.stateGap}>
          <AppStateView
            tone="empty"
            title="Start your story together"
            copy="Every feeding, diaper change, nap, and milestone will appear here."
            actionLabel="Log first event"
          />
        </View>

        <View style={styles.stateGap}>
          <AppStateView
            tone="loading"
            title="Loading your data..."
            copy="Just a moment while BabyMinimo syncs the latest household state."
          />
        </View>

        <View style={styles.errorCard}>
          <AppStateView
            tone="error"
            title="Can’t load data"
            copy="Check your connection or the local emulator, then try again."
            actionLabel="Try again"
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 112,
  },
  copy: {
    ...typography.bodySmall,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  stateGap: {
    marginTop: spacing.lg,
  },
  errorCard: {
    marginTop: spacing.lg,
    borderRadius: radius.xxl,
    ...shadows.sm,
  },
})
