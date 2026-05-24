import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { LogFormShell } from '@/src/components/logging'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, typography, spacing, radius } from '@/src/theme'

type DiaperKind = 'wet' | 'dirty' | 'both'

export default function LogDiaperModal() {
  const router = useRouter()
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

  const kinds: { key: DiaperKind; label: string }[] = [
    { key: 'wet', label: 'Wet' },
    { key: 'dirty', label: 'Dirty' },
    { key: 'both', label: 'Both' },
  ]

  return (
    <LogFormShell
      title="Diaper"
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      activeType="diaper"
    >
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Type</Text>
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
                {k.label}
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
