import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Input } from '@/src/components/ui'
import { LogFormShell } from '@/src/components/logging'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { colors, radius, spacing, typography } from '@/src/theme'

export default function LogMedicationModal() {
  const router = useRouter()
  const [name, setName] = useState('Vitamin D Drops')
  const [dose, setDose] = useState('1')
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
        type: 'medication',
        occurredAt: new Date(),
        metadata: {
          name: name || 'Medication',
          dose: dose || undefined,
          note: note || undefined,
        },
        createdBy: user?.displayName || 'Caregiver',
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <LogFormShell
      title="Health"
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={() => router.back()}
      saving={saving}
      activeType="health"
    >
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Medication</Text>
        <Input value={name} onChangeText={setName} placeholder="Medication name" />
        <View style={styles.fieldSpacer} />
        <Input
          value={dose}
          onChangeText={setDose}
          keyboardType="numeric"
          placeholder="Dose"
          rightAccessory={<Text style={styles.unit}>ml</Text>}
        />
      </View>
    </LogFormShell>
  )
}

const styles = StyleSheet.create({
  card: {
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
    marginBottom: spacing.sm,
  },
  fieldSpacer: {
    height: spacing.base,
  },
  unit: {
    ...typography.action,
    color: colors.muted,
  },
})
