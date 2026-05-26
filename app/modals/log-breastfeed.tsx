import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { LogChoiceGroup, LogFormShell } from '@/src/components/logging'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, typography, spacing, radius } from '@/src/theme'

type Side = 'left' | 'right' | 'both'

export default function LogBreastfeedModal() {
  const router = useRouter()
  const { t } = useTranslation()
  const [side, setSide] = useState<Side>('left')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const addEvent = useCareEventStore((s) => s.addEvent)
  const user = useAuthStore((s) => s.user)
  const selectedBabyId = useAuthStore((s) => s.selectedBabyId)

  const handleSave = async () => {
    setSaving(true)
    try {
      await addEvent({
        babyId: selectedBabyId || 'baby-1',
        type: 'breastfeed',
        occurredAt: new Date(),
        metadata: { side, note: note || undefined },
        createdBy: user?.displayName || t('log.createdBy.fallback'),
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleFeedingTypeChange = (nextType: 'nursing' | 'bottle') => {
    if (nextType === 'bottle') {
      router.replace('/modals/log-bottle')
    }
  }

  const sides: { key: Side; labelKey: string }[] = [
    { key: 'left', labelKey: 'log.side.left' },
    { key: 'right', labelKey: 'log.side.right' },
    { key: 'both', labelKey: 'log.side.both' },
  ]

  return (
    <LogFormShell
      title={t('log.feedingType')}
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      activeType="feeding"
    >
      <LogChoiceGroup
        label={t('log.feedingType')}
        value="nursing"
        onChange={handleFeedingTypeChange}
        options={[
          { key: 'nursing', label: t('log.option.nursing') },
          { key: 'bottle', label: t('log.option.bottle') },
        ]}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('log.sideDuration')}</Text>
        <View style={styles.sideRow}>
          {sides.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSide(s.key)}
              style={[
                styles.sideChip,
                side === s.key && styles.sideChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.sideText,
                  side === s.key && styles.sideTextSelected,
                ]}
              >
                {t(s.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </LogFormShell>
  )
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sideRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sideChip: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.lg,
    backgroundColor: colors.stone,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sideChipSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  sideText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.ink,
  },
  sideTextSelected: {
    color: colors.white,
  },
})
