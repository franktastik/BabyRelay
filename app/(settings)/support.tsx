import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SettingsHeader } from '@/src/components/settings'
import { Screen } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const topicKeys = [
  'support.topic.account',
  'support.topic.household',
  'support.topic.timeline',
]

export default function SupportScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader
          title={t('support.title')}
          subtitle={t('support.subtitle')}
          onBack={() => router.replace('/settings')}
        />

        {submitted ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>{t('support.successTitle')}</Text>
            <Text style={styles.successBody}>{t('support.successBody')}</Text>
            <Pressable
              onPress={() => setSubmitted(false)}
              style={styles.secondaryButton}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>{t('support.sendAnother')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{t('support.heroTitle')}</Text>
              <Text style={styles.heroBody}>{t('support.heroBody')}</Text>
            </View>

            <View style={styles.topicCard}>
              <Text style={styles.sectionTitle}>{t('support.topicTitle')}</Text>
              {topicKeys.map((key) => (
                <View key={key} style={styles.topicRow}>
                  <View style={styles.topicDot} />
                  <Text style={styles.topicText}>{t(key)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.messageCard}>
              <Text style={styles.sectionTitle}>{t('support.messageTitle')}</Text>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{t('support.messagePlaceholder')}</Text>
              </View>
              <Pressable
                onPress={() => setSubmitted(true)}
                style={styles.primaryButton}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>{t('support.sendButton')}</Text>
              </Pressable>
            </View>
          </>
        )}
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
    ...shadows.md,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.ink,
  },
  heroBody: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  topicCard: {
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
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  topicDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.clay,
  },
  topicText: {
    ...typography.bodySmall,
    color: colors.inkLight,
    flex: 1,
  },
  messageCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  messageBox: {
    minHeight: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.stone,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  messageText: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
  },
  primaryButtonText: {
    ...typography.action,
    color: colors.white,
  },
  successCard: {
    alignItems: 'center',
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.md,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successIconText: {
    ...typography.h1,
    color: colors.sageText,
  },
  successTitle: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  successBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  secondaryButton: {
    borderRadius: radius.xl,
    backgroundColor: colors.sage,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    marginTop: spacing.lg,
  },
  secondaryButtonText: {
    ...typography.action,
    color: colors.white,
  },
})
