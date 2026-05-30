import React from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Lock, LogOut, Mail, Trash2, UserRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { SettingsHeader, SettingsCard, SettingsRow } from '@/src/components/settings'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function AccountScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title={t('account.title')} onBack={() => router.back()} rightIcon="none" />

        <View style={styles.profileBlock}>
          <Image source={require('../../app/caregiver-sarah-clean.png')} style={styles.avatar} />
          <Text style={styles.name}>{user?.displayName || 'Sarah Miller'}</Text>
          <Text style={styles.email}>{user?.email || 'sarah@household.com'}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('account.section.personal')}</Text>
        <SettingsCard>
          <SettingsRow icon={UserRound} title={t('account.fullName')} subtitle={user?.displayName || 'Sarah Miller'} />
          <SettingsRow icon={Mail} title={t('account.emailAddress')} subtitle={user?.email || 'sarah@household.com'} />
        </SettingsCard>

        <Text style={styles.sectionLabel}>{t('account.section.security')}</Text>
        <SettingsCard>
          <SettingsRow icon={Lock} title={t('account.password')} subtitle={t('account.passwordDeferred')} trailing={t('account.deferred')} />
        </SettingsCard>

        <Pressable onPress={() => router.push('/modals/sign-out-confirm')} style={styles.signOutButton}>
          <LogOut color={colors.danger} size={18} strokeWidth={2.2} />
          <Text style={styles.signOutText}>{t('account.signOut')}</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>{t('account.delete.section')}</Text>
        <SettingsCard>
          <SettingsRow
            icon={Trash2}
            title={t('account.delete.title')}
            subtitle={t('account.delete.subtitle')}
            danger
            onPress={() => router.push('/modals/delete-account-confirm')}
          />
        </SettingsCard>

        <Text style={styles.policyNote}>{t('account.delete.warning')}</Text>
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
  profileBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  name: {
    ...typography.h2,
    color: colors.ink,
  },
  email: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  signOutButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  signOutText: {
    ...typography.action,
    color: colors.danger,
  },
  policyNote: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.base,
    lineHeight: 18,
  },
})
