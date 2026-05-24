import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Bell, Camera, Crown, LogOut, Shield, UsersRound } from 'lucide-react-native'
import { Screen } from '@/src/components/ui'
import { SettingsCard, SettingsHeader, SettingsRow } from '@/src/components/settings'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title="Settings" />

        <Text style={styles.sectionLabel}>Your plan</Text>
        <View style={styles.planCard}>
          <View>
            <Text style={styles.planName}>Premium Plan</Text>
            <Text style={styles.planMeta}>Renews Oct 12, 2024</Text>
          </View>
          <Text style={styles.managePill}>Manage</Text>
        </View>

        <Text style={styles.sectionLabel}>Shared coordination</Text>
        <SettingsCard>
          <SettingsRow
            icon={UsersRound}
            title="Family & Household"
            subtitle="Caregivers and coordination"
            onPress={() => router.push('/family')}
          />
          <SettingsRow
            icon={Bell}
            title="Reminders"
            subtitle="Feeding and meds"
            onPress={() => router.push('/reminders')}
          />
          <SettingsRow
            icon={Camera}
            title="Growth Timeline"
            subtitle="Local photo moments on this device"
            onPress={() => router.push('/timeline')}
          />
        </SettingsCard>

        <Text style={styles.sectionLabel}>Account</Text>
        <SettingsCard>
          <SettingsRow icon={Crown} title="Plans" subtitle="Premium and Family" onPress={() => router.push('/plans')} />
          <SettingsRow icon={Shield} title="Profile & Account" subtitle="Name, email, sign out" onPress={() => router.push('/account')} />
          <SettingsRow icon={LogOut} title="Sign out" danger onPress={() => router.push('/modals/sign-out-confirm')} />
        </SettingsCard>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 120,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  planCard: {
    minHeight: 78,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  planName: {
    ...typography.action,
    color: colors.ink,
  },
  planMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  managePill: {
    ...typography.label,
    color: colors.white,
    backgroundColor: colors.sage,
    borderRadius: radius.full,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
})
