import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'

interface GrowthPreviewProps {
  moments?: DemoGrowthMoment[]
  onViewAll?: () => void
}

export function GrowthPreview({ onViewAll }: GrowthPreviewProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.ribbon}>♙</Text>
          <Text style={styles.title}>{t('home.wins.title')}</Text>
        </View>
        <Text style={styles.viewAll} onPress={onViewAll}>
          {t('home.wins.viewAll')}
        </Text>
      </View>
      <View style={styles.winRow}>
        <Win icon="♨" label={t('home.wins.weekStrong')} color={colors.gold} />
        <Win icon="♙" label={t('home.wins.familySync')} color={colors.sage} />
        <Win icon="♡" label={t('home.wins.careChampion')} color={colors.clay} />
      </View>
    </View>
  )
}

function Win({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.win}>
      <View style={[styles.winIcon, { backgroundColor: color }]}>
        <Text style={styles.winIconText}>{icon}</Text>
      </View>
      <Text style={styles.winLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ribbon: {
    color: colors.ink,
    fontSize: 18,
  },
  title: {
    ...typography.action,
    color: colors.ink,
  },
  viewAll: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  winRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  win: {
    width: 78,
    alignItems: 'center',
  },
  winIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  winIconText: {
    color: colors.white,
    fontSize: 19,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  winLabel: {
    ...typography.label,
    color: colors.muted,
    fontSize: 9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
})
