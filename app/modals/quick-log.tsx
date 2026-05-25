import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { LogOptionCard } from '@/src/components/logging'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const logOptions = [
  { id: 'breastfeed', labelKey: 'log.option.breastfeed', icon: '⌁', route: '/modals/log-breastfeed' },
  { id: 'bottle', labelKey: 'log.option.bottle', icon: '⌁', route: '/modals/log-bottle' },
  { id: 'diaper', labelKey: 'log.option.diaper', icon: '♧', route: '/modals/log-diaper' },
  { id: 'sleep', labelKey: 'log.option.sleep', icon: '☾', route: '/modals/log-sleep' },
  { id: 'medication', labelKey: 'log.option.medication', icon: '◇', route: '/modals/log-medication' },
] as const

export default function QuickLogModal() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Screen>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={16}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        <Text style={styles.title}>{t('log.quick.title')}</Text>
        <Text style={styles.subtitle}>{t('log.quick.subtitle')}</Text>

        <View style={styles.optionPanel}>
          <View style={styles.grid}>
            {logOptions.slice(0, 4).map((option) => (
              <LogOptionCard
                key={option.id}
                icon={option.icon}
                label={t(option.labelKey)}
                onPress={() => router.push(option.route)}
              />
            ))}
          </View>
          <LogOptionCard
            icon={logOptions[4].icon}
            label={t(logOptions[4].labelKey)}
            onPress={() => router.push(logOptions[4].route)}
            wide
          />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 20,
    lineHeight: 22,
    color: colors.muted,
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionPanel: {
    borderRadius: radius.xxxl,
    backgroundColor: colors.cream,
    padding: spacing.md,
    ...shadows.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
})
