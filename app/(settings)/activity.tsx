import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Activity, Bell, Camera, CheckCircle2, Clock3 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { AppStateView } from '@/src/components/states'
import { activityAgeLabel } from '@/src/features/activity'
import { useAuthStore } from '@/src/stores/authStore'
import { useBabyMinimoActivityStore } from '@/src/stores/activityStore'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function ActivityScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const selectedBabyId = useAuthStore((state) => state.selectedBabyId) || 'baby-1'
  const selectedBaby = useAuthStore((state) =>
    state.babies.find((baby) => baby.id === selectedBabyId)
  )
  const items = useBabyMinimoActivityStore((state) => state.items)
  const getRecentForBaby = useBabyMinimoActivityStore((state) => state.getRecentForBaby)
  const getSummaryForBaby = useBabyMinimoActivityStore((state) => state.getSummaryForBaby)
  const summary = getSummaryForBaby(selectedBabyId)
  const recent = getRecentForBaby(selectedBabyId, 12)
  const babyName = selectedBaby?.name || t('activity.defaultBaby')

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title={t('activity.title')} onBack={() => router.back()} rightIcon="none" />

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{t('activity.eyebrow', { babyName })}</Text>
          <Text style={styles.heroTitle}>{t('activity.heroTitle')}</Text>
          <Text style={styles.heroCopy}>{t('activity.heroCopy')}</Text>
          <View style={styles.statRow}>
            <Stat value={String(summary.todayCount)} label={t('activity.stats.today')} />
            <Stat value={String(summary.careEventsToday)} label={t('activity.stats.care')} />
            <Stat value={String(summary.remindersToday)} label={t('activity.stats.reminders')} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <CheckCircle2 color={colors.sageText} size={20} strokeWidth={2.3} />
          </View>
          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>{t('activity.rhythmTitle')}</Text>
            <Text style={styles.insightBody}>
              {summary.lastActivity
                ? t('activity.rhythmBodyWithActivity', {
                    label: summary.lastActivity.label,
                    time: activityAgeLabel(summary.lastActivity.occurredAt),
                  })
                : t('activity.rhythmBodyEmpty')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('activity.recentTitle')}</Text>
        {items.length === 0 || recent.length === 0 ? (
          <AppStateView
            tone="empty"
            title={t('activity.empty.title')}
            copy={t('activity.empty.copy')}
          />
        ) : (
          recent.map((item) => {
            const Icon = iconForActivity(item.type)
            return (
              <View key={item.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Icon color={colors.sageText} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityLabel}>{item.label}</Text>
                  <Text style={styles.activityDetail}>{item.detail || t('activity.detailFallback')}</Text>
                </View>
                <Text style={styles.activityTime}>{activityAgeLabel(item.occurredAt)}</Text>
              </View>
            )
          })
        )}
      </ScrollView>
    </Screen>
  )
}

function iconForActivity(type: string) {
  if (type === 'reminder_created') return Bell
  if (type === 'growth_moment_added') return Camera
  if (type === 'handoff_viewed') return Clock3
  return Activity
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 112,
  },
  heroCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  eyebrow: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.ink,
  },
  heroCopy: {
    ...typography.body,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.base,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.ink,
  },
  statLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  insightCard: {
    minHeight: 82,
    borderRadius: radius.xl,
    backgroundColor: colors.softSage,
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: {
    flex: 1,
  },
  insightTitle: {
    ...typography.action,
    color: colors.ink,
  },
  insightBody: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  activityRow: {
    minHeight: 70,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
  },
  activityLabel: {
    ...typography.action,
    color: colors.ink,
  },
  activityDetail: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  activityTime: {
    ...typography.label,
    color: colors.sageText,
  },
})
