import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CheckCircle2, EyeOff, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { clearAndBlankBabyMinimoCurrentStateWidget } from '@/src/features/widgets/currentStateWidgetUpdater'
import { useWidgetSettingsStore } from '@/src/stores'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const visibleItemKeys = [
  'widgets.visible.status',
  'widgets.visible.reminder',
  'widgets.visible.lastCare',
  'widgets.visible.updated',
]

const hiddenItemKeys = [
  'widgets.hidden.notes',
  'widgets.hidden.photos',
  'widgets.hidden.account',
]

export default function WidgetSettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const widgetSnapshotsEnabled = useWidgetSettingsStore((state) => state.widgetSnapshotsEnabled)
  const lastClearedAt = useWidgetSettingsStore((state) => state.lastClearedAt)
  const setWidgetSnapshotsEnabled = useWidgetSettingsStore(
    (state) => state.setWidgetSnapshotsEnabled
  )
  const markWidgetSnapshotCleared = useWidgetSettingsStore(
    (state) => state.markWidgetSnapshotCleared
  )
  const [statusMessage, setStatusMessage] = useState(
    t('widgets.status.default')
  )

  const clearWidgetSnapshot = async () => {
    await clearAndBlankBabyMinimoCurrentStateWidget().catch(() => null)
    markWidgetSnapshotCleared()
    setStatusMessage(t('widgets.status.cleared'))
  }

  const toggleWidgets = async (enabled: boolean) => {
    setWidgetSnapshotsEnabled(enabled)

    if (!enabled) {
      await clearWidgetSnapshot()
      setStatusMessage(t('widgets.status.off'))
      return
    }

    setStatusMessage(t('widgets.status.on'))
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title={t('widgets.title')} onBack={() => router.back()} rightIcon="none" />

        <Text style={styles.sectionLabel}>{t('widgets.section.visibility')}</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.iconShell}>
              <Smartphone color={colors.sageText} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{t('widgets.show.title')}</Text>
              <Text style={styles.rowSubtitle}>
                {t('widgets.show.subtitle')}
              </Text>
            </View>
            <Switch
              value={widgetSnapshotsEnabled}
              trackColor={{ false: colors.border, true: colors.sage }}
              thumbColor={colors.white}
              onValueChange={toggleWidgets}
            />
          </View>

          <View style={styles.statusPanel}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('widgets.section.privacy')}</Text>
        <View style={styles.card}>
          <View style={styles.privacyHeader}>
            <View style={styles.iconShell}>
              <ShieldCheck color={colors.sageText} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{t('widgets.visible.title')}</Text>
              <Text style={styles.rowSubtitle}>
                {t('widgets.visible.subtitle')}
              </Text>
            </View>
          </View>

          {visibleItemKeys.map((itemKey) => (
            <View key={itemKey} style={styles.bulletRow}>
              <CheckCircle2 color={colors.sageText} size={16} strokeWidth={2.2} />
              <Text style={styles.bulletText}>{t(itemKey)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          {hiddenItemKeys.map((itemKey) => (
            <View key={itemKey} style={styles.bulletRow}>
              <EyeOff color={colors.muted} size={16} strokeWidth={2.2} />
              <Text style={styles.bulletText}>{t(itemKey)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('widgets.section.reset')}</Text>
        <View style={styles.card}>
          <Pressable onPress={clearWidgetSnapshot} style={styles.clearRow}>
            <View style={[styles.iconShell, styles.clearIconShell]}>
              <RotateCcw color={colors.clay} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{t('widgets.clear.title')}</Text>
              <Text style={styles.rowSubtitle}>
                {t('widgets.clear.subtitle')}
              </Text>
              {lastClearedAt ? (
                <Text style={styles.clearedText}>{t('widgets.clear.lastCleared', { time: formatClearedAt(lastClearedAt, t) })}</Text>
              ) : null}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}

const formatClearedAt = (iso: string, t: (key: string) => string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return t('widgets.clear.recently')
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
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
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  settingRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  clearRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIconShell: {
    backgroundColor: colors.softClay,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    ...typography.action,
    color: colors.ink,
  },
  rowSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  statusPanel: {
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginTop: spacing.base,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.stoneText,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bulletText: {
    ...typography.bodySmall,
    color: colors.stoneText,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  clearedText: {
    ...typography.label,
    color: colors.sageText,
    marginTop: spacing.xs,
  },
})
