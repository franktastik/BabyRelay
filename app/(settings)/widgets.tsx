import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CheckCircle2, EyeOff, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react-native'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { clearAndBlankBabyMinimoCurrentStateWidget } from '@/src/features/widgets/currentStateWidgetUpdater'
import { useWidgetSettingsStore } from '@/src/stores'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const visibleItems = [
  'current baby status',
  'due soon reminder',
  'last feed, diaper, and sleep',
  'last updated time',
]

const hiddenItems = [
  'notes and free-text details',
  'Growth Timeline photos',
  'account, billing, and invite data',
]

export default function WidgetSettingsScreen() {
  const router = useRouter()
  const widgetSnapshotsEnabled = useWidgetSettingsStore((state) => state.widgetSnapshotsEnabled)
  const lastClearedAt = useWidgetSettingsStore((state) => state.lastClearedAt)
  const setWidgetSnapshotsEnabled = useWidgetSettingsStore(
    (state) => state.setWidgetSnapshotsEnabled
  )
  const markWidgetSnapshotCleared = useWidgetSettingsStore(
    (state) => state.markWidgetSnapshotCleared
  )
  const [statusMessage, setStatusMessage] = useState(
    'Widgets update from this device when BabyMinimo refreshes Home.'
  )

  const clearWidgetSnapshot = async () => {
    await clearAndBlankBabyMinimoCurrentStateWidget().catch(() => null)
    markWidgetSnapshotCleared()
    setStatusMessage('Widget snapshot cleared on this device.')
  }

  const toggleWidgets = async (enabled: boolean) => {
    setWidgetSnapshotsEnabled(enabled)

    if (!enabled) {
      await clearWidgetSnapshot()
      setStatusMessage('Widgets are off. No baby care snapshot is shown.')
      return
    }

    setStatusMessage('Widgets will update again from Home after the next refresh.')
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title="Widgets" onBack={() => router.back()} rightIcon="none" />

        <Text style={styles.sectionLabel}>Widget visibility</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.iconShell}>
              <Smartphone color={colors.sageText} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Show baby status widgets</Text>
              <Text style={styles.rowSubtitle}>
                Updates this device's Home Screen widget.
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

        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.privacyHeader}>
            <View style={styles.iconShell}>
              <ShieldCheck color={colors.sageText} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Visible on this device</Text>
              <Text style={styles.rowSubtitle}>
                Anyone who can see the widget can see this glanceable care state.
              </Text>
            </View>
          </View>

          {visibleItems.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <CheckCircle2 color={colors.sageText} size={16} strokeWidth={2.2} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          {hiddenItems.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <EyeOff color={colors.muted} size={16} strokeWidth={2.2} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Reset</Text>
        <View style={styles.card}>
          <Pressable onPress={clearWidgetSnapshot} style={styles.clearRow}>
            <View style={[styles.iconShell, styles.clearIconShell]}>
              <RotateCcw color={colors.clay} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Clear widget snapshot</Text>
              <Text style={styles.rowSubtitle}>
                Blanks the widget until BabyMinimo writes a fresh local snapshot.
              </Text>
              {lastClearedAt ? (
                <Text style={styles.clearedText}>Last cleared {formatClearedAt(lastClearedAt)}</Text>
              ) : null}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}

const formatClearedAt = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'recently'
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
