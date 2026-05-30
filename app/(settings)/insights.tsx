import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SettingsHeader } from '@/src/components/settings'
import { Screen } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const bars = [44, 72, 58, 84, 66, 92, 76]

export default function InsightsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [showEmptyState, setShowEmptyState] = useState(false)

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader
          title={t('insights.title')}
          subtitle={t('insights.subtitle')}
          onBack={() => router.replace('/settings')}
        />

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.eyebrow}>{t('insights.weekLabel')}</Text>
              <Text style={styles.heroTitle}>{t('insights.heroTitle')}</Text>
            </View>
            <Pressable
              onPress={() => setShowEmptyState((value) => !value)}
              style={styles.togglePill}
              accessibilityRole="button"
              accessibilityLabel={t('insights.toggleEmpty')}
            >
              <Text style={styles.toggleText}>
                {showEmptyState ? t('insights.showChart') : t('insights.showEmpty')}
              </Text>
            </Pressable>
          </View>

          {showEmptyState ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyIcon}>♡</Text>
              <Text style={styles.emptyTitle}>{t('insights.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('insights.emptyBody')}</Text>
            </View>
          ) : (
            <View style={styles.chartWrap}>
              {bars.map((height, index) => (
                <View key={index} style={styles.barTrack}>
                  <View style={[styles.barFill, { height }]} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.metricGrid}>
          <Metric label={t('insights.feedMetric')} value="18" />
          <Metric label={t('insights.sleepMetric')} value="14h" />
          <Metric label={t('insights.diaperMetric')} value="31" />
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRing}>
            <Text style={styles.progressValue}>72%</Text>
          </View>
          <View style={styles.progressCopy}>
            <Text style={styles.cardTitle}>{t('insights.progressTitle')}</Text>
            <Text style={styles.cardBody}>{t('insights.progressBody')}</Text>
          </View>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.cardTitle}>{t('insights.nextTitle')}</Text>
          {['insights.nextFeed', 'insights.nextSleep', 'insights.nextHandoff'].map((key) => (
            <View key={key} style={styles.taskRow}>
              <View style={styles.checkDot} />
              <Text style={styles.taskText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  togglePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.softSage,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  toggleText: {
    ...typography.label,
    color: colors.sageText,
  },
  chartWrap: {
    height: 132,
    borderRadius: radius.xl,
    backgroundColor: colors.stone,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  barTrack: {
    width: 22,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.sage,
  },
  emptyPanel: {
    minHeight: 132,
    borderRadius: radius.xl,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    color: colors.sageText,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.ink,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  metricCard: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  metricValue: {
    ...typography.h2,
    color: colors.ink,
  },
  metricLabel: {
    ...typography.label,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 8,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    ...typography.label,
    color: colors.ink,
  },
  progressCopy: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  taskCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
  },
  taskText: {
    ...typography.bodySmall,
    color: colors.inkLight,
    flex: 1,
  },
})
