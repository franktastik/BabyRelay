import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { LogFormShell } from '@/src/components/logging'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, typography, spacing, radius } from '@/src/theme'

type DiaperKind = 'wet' | 'dirty' | 'both'

export default function LogDiaperModal() {
  const router = useRouter()
  const { t } = useTranslation()
  const [kind, setKind] = useState<DiaperKind>('wet')
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
        type: 'diaper',
        occurredAt: new Date(),
        metadata: { kind, note: note || undefined },
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

  const kinds: { key: DiaperKind; labelKey: string }[] = [
    { key: 'wet', labelKey: 'log.diaper.wet' },
    { key: 'dirty', labelKey: 'log.diaper.dirty' },
    { key: 'both', labelKey: 'log.diaper.both' },
  ]

  return (
    <LogFormShell
      title={t('log.option.diaper')}
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      activeType="diaper"
    >
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('log.type')}</Text>
        <View style={styles.kindRow}>
          {kinds.map((k) => (
            <Pressable
              key={k.key}
              onPress={() => setKind(k.key)}
              style={[
                styles.kindChip,
                kind === k.key && styles.kindChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.kindText,
                  kind === k.key && styles.kindTextSelected,
                ]}
              >
                {t(k.labelKey)}
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
  kindRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  kindChip: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.lg,
    backgroundColor: colors.stone,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  kindChipSelected: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
  },
  kindText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.ink,
  },
  kindTextSelected: {
    color: colors.white,
  },
})
