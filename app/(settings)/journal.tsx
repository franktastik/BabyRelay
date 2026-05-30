import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SettingsHeader } from '@/src/components/settings'
import { Screen } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const promptKeys = [
  'journal.prompt.feeding',
  'journal.prompt.sleep',
  'journal.prompt.mood',
]

export default function JournalScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [openPrompt, setOpenPrompt] = useState(promptKeys[0])

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader
          title={t('journal.title')}
          subtitle={t('journal.subtitle')}
          onBack={() => router.replace('/settings')}
        />

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>✎</Text>
          </View>
          <Text style={styles.heroTitle}>{t('journal.heroTitle')}</Text>
          <Text style={styles.heroBody}>{t('journal.heroBody')}</Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.sectionTitle}>{t('journal.todayTitle')}</Text>
          {promptKeys.map((key) => {
            const open = openPrompt === key
            return (
              <Pressable
                key={key}
                onPress={() => setOpenPrompt(open ? '' : key)}
                style={[styles.promptRow, open && styles.promptRowOpen]}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <View style={styles.promptHeader}>
                  <Text style={styles.promptTitle}>{t(key)}</Text>
                  <Text style={styles.promptChevron}>{open ? '−' : '+'}</Text>
                </View>
                {open ? <Text style={styles.promptBody}>{t(`${key}.answer`)}</Text> : null}
              </Pressable>
            )
          })}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{t('journal.memoryTitle')}</Text>
          <Text style={styles.noteBody}>{t('journal.memoryBody')}</Text>
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
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xxl,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroIconText: {
    fontSize: 30,
    color: colors.sageText,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  heroBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  promptCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  promptRow: {
    borderRadius: radius.xl,
    backgroundColor: colors.stone,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  promptRowOpen: {
    backgroundColor: colors.softClay,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  promptTitle: {
    ...typography.action,
    color: colors.ink,
    flex: 1,
  },
  promptChevron: {
    ...typography.h3,
    color: colors.sageText,
  },
  promptBody: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.sm,
  },
  noteCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.creamAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.base,
  },
  noteTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  noteBody: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
})
