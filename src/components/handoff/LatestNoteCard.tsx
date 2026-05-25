import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, spacing, typography, shadows } from '@/src/theme'
import { relativeTime } from '@/src/relative-time'

interface LatestNoteCardProps {
  note: { content: string; time: Date; by: string } | null
}

export function LatestNoteCard({ note }: LatestNoteCardProps) {
  const { t } = useTranslation()

  if (!note) {
    return (
      <View style={styles.container}>
        <SectionTitle />
        <View style={styles.noteCard}>
          <Text style={styles.empty}>{t('handoff.latestNote.empty')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SectionTitle />
      <View style={styles.noteCard}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>✎</Text>
        </View>
        <View style={styles.noteContent}>
          <Text style={styles.content}>{note.content}</Text>
          <Text style={styles.meta}>
            {note.by} · {relativeTime(note.time)}
          </Text>
        </View>
      </View>
    </View>
  )
}

function SectionTitle() {
  const { t } = useTranslation()
  return <Text style={styles.title}>{t('handoff.latestNote.title')}</Text>
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  title: {
    ...typography.h3,
    color: colors.ink,
    paddingHorizontal: spacing.xs,
  },
  noteCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.base,
    ...shadows.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.sageText,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  noteContent: {
    flex: 1,
  },
  content: {
    ...typography.body,
    color: colors.stoneText,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.muted,
  },
})
