import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { LogChoiceGroup, LogFormShell } from '@/src/components/logging'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, typography, spacing, radius } from '@/src/theme'

type Side = 'left' | 'right' | 'both'

export default function LogBreastfeedModal() {
  const router = useRouter()
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
        createdBy: user?.displayName || 'Caregiver',
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const sides: { key: Side; label: string }[] = [
    { key: 'left', label: 'Left' },
    { key: 'right', label: 'Right' },
    { key: 'both', label: 'Both' },
  ]

  return (
    <LogFormShell
      title="Feeding type"
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      activeType="feeding"
    >
      <LogChoiceGroup
        label="Feeding type"
        value="nursing"
        onChange={() => undefined}
        options={[
          { key: 'nursing', label: 'Nursing' },
          { key: 'bottle', label: 'Bottle' },
        ]}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Side & duration</Text>
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
                {s.label}
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
