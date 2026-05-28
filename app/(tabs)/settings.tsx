import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Activity, Bell, Camera, Crown, Globe2, LogOut, Shield, Smartphone, UsersRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { SettingsCard, SettingsHeader, SettingsRow } from '@/src/components/settings'
import { changeBabyMinimoLanguage } from '@/src/localization'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function SettingsScreen() {
  const router = useRouter()
  const { i18n, t } = useTranslation()
  const showingGermanDraft = i18n.language === 'de'

  const toggleLanguageDraft = () => {
    const nextLocale = showingGermanDraft ? 'en' : 'de'
    void changeBabyMinimoLanguage(nextLocale, { allowDraftLocales: true })
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title={t('settings.title')} />

        <Text style={styles.sectionLabel}>{t('settings.section.plan')}</Text>
        <View style={styles.planCard}>
          <View>
            <Text style={styles.planName}>{t('settings.planName')}</Text>
            <Text style={styles.planMeta}>{t('settings.planMeta')}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/plans')}
            style={styles.managePill}
            accessibilityRole="button"
            accessibilityLabel={t('settings.manage')}
          >
            <Text style={styles.managePillText}>{t('settings.manage')}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>{t('settings.section.coordination')}</Text>
        <SettingsCard>
          <SettingsRow
            icon={UsersRound}
            title={t('family.title')}
            subtitle={t('settings.family.subtitle')}
            onPress={() => router.push('/family')}
          />
          <SettingsRow
            icon={Bell}
            title={t('reminders.title')}
            subtitle={t('settings.reminders.subtitle')}
            onPress={() => router.push('/reminders')}
          />
        </SettingsCard>

        <Text style={styles.sectionLabel}>{t('settings.section.features')}</Text>
        <SettingsCard>
          <SettingsRow
            icon={Camera}
            title={t('settings.growthTimeline')}
            subtitle={t('settings.growthTimeline.subtitle')}
            onPress={() => router.push('/timeline')}
          />
          <SettingsRow
            icon={Smartphone}
            title={t('settings.widgets')}
            subtitle={t('settings.widgets.subtitle')}
            onPress={() => router.push('/widgets')}
          />
          <SettingsRow
            icon={Activity}
            title={t('settings.activity')}
            subtitle={t('settings.activity.subtitle')}
            onPress={() => router.push('/activity')}
          />
          <SettingsRow
            icon={Globe2}
            title={t('settings.language')}
            subtitle={t(
              showingGermanDraft
                ? 'settings.language.switchToEnglish'
                : 'settings.language.switchToGerman'
            )}
            trailing={showingGermanDraft ? 'DE' : 'EN'}
            onPress={toggleLanguageDraft}
          />
        </SettingsCard>

        <Text style={styles.sectionLabel}>{t('settings.section.account')}</Text>
        <SettingsCard>
          <SettingsRow icon={Crown} title={t('settings.plans')} subtitle={t('settings.plans.subtitle')} onPress={() => router.push('/plans')} />
          <SettingsRow icon={Shield} title={t('settings.account')} subtitle={t('settings.account.subtitle')} onPress={() => router.push('/account')} />
          <SettingsRow icon={LogOut} title={t('account.signOut')} danger onPress={() => router.push('/modals/sign-out-confirm')} />
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
    backgroundColor: colors.sage,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  managePillText: {
    ...typography.label,
    color: colors.white,
  },
})
