import React from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Screen, Button, Input } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

type LogCategory = 'feeding' | 'diaper' | 'sleep' | 'health'

interface LogFormShellProps {
  title: string
  children: React.ReactNode
  note?: string
  onNoteChange?: (text: string) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  activeType?: LogCategory
  saveLabel?: string
}

export function LogFormShell({
  title,
  children,
  note,
  onNoteChange,
  onSave,
  onCancel,
  saving = false,
  activeType = 'feeding',
  saveLabel = 'Save',
}: LogFormShellProps) {
  return (
    <Screen>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onCancel} style={styles.backButton} hitSlop={14}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Log Event</Text>
          <Image source={require('../../../app/baby-preview-avatar.png')} style={styles.avatar} />
        </View>

        <View style={styles.categoryRow}>
          <CategoryPill icon="⌁" label="Feeding" active={activeType === 'feeding'} />
          <CategoryPill icon="♧" label="Diaper" active={activeType === 'diaper'} />
          <CategoryPill icon="☾" label="Sleep" active={activeType === 'sleep'} />
          <CategoryPill icon="◇" label="Health" active={activeType === 'health'} />
        </View>

        <View style={styles.timeCard}>
          <View style={styles.cardHeadingRow}>
            <Text style={styles.timeLabel}>Event Time</Text>
            <Text style={styles.nowText}>Just now</Text>
          </View>
          <View style={styles.timeRow}>
            <View style={styles.timePill}>
              <Text style={styles.timeIcon}>◷</Text>
              <Text style={styles.timeValue}>10:45{'\n'}AM</Text>
            </View>
            <View style={styles.timePill}>
              <Text style={styles.timeIcon}>▣</Text>
              <Text style={styles.timeValue}>Today</Text>
            </View>
          </View>
        </View>

        {children}

        {onNoteChange && (
          <View style={styles.noteSection}>
            <Input
              label="Notes (optional)"
              value={note || ''}
              onChangeText={onNoteChange}
              placeholder="Add a note..."
            />
          </View>
        )}

        <View style={styles.actions}>
          <Button
            variant="ghost"
            onPress={onCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel"
            testID="log-cancel-button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Button>
          <Button
            variant="primary"
            onPress={onSave}
            loading={saving}
            style={styles.saveButton}
            accessibilityLabel={saveLabel}
            testID="log-save-button"
          >
            <Text style={styles.saveText}>{saveLabel}</Text>
          </Button>
        </View>
      </ScrollView>
    </Screen>
  )
}

function CategoryPill({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active: boolean
}) {
  return (
    <View style={[styles.categoryPill, active && styles.categoryPillActive]}>
      <Text style={[styles.categoryIcon, active && styles.categoryTextActive]}>{icon}</Text>
      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 104,
  },
  topBar: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backText: {
    color: colors.stoneText,
    fontSize: 30,
    lineHeight: 32,
  },
  title: {
    ...typography.h2,
    color: colors.stoneText,
  },
  avatar: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryPill: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryPillActive: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
    ...shadows.sm,
  },
  categoryIcon: {
    color: colors.sageText,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  categoryText: {
    ...typography.action,
    color: colors.stoneText,
  },
  categoryTextActive: {
    color: colors.white,
  },
  timeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  nowText: {
    ...typography.bodySmall,
    color: colors.sageText,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timePill: {
    flex: 1,
    minHeight: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeIcon: {
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  timeValue: {
    ...typography.h3,
    color: colors.stoneText,
    textAlign: 'center',
  },
  noteSection: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  cancelText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.muted,
  },
  saveButton: {
    flex: 2,
    borderRadius: radius.lg,
    backgroundColor: colors.clay,
  },
  saveText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.white,
  },
})
