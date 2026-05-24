import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Input } from '@/src/components/ui'
import { LogChoiceGroup, LogFormShell } from '@/src/components/logging'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { colors, radius, spacing, typography } from '@/src/theme'

type SleepState = 'crib' | 'arms' | 'other'

export default function LogSleepModal() {
  const router = useRouter()
  const [sleepState, setSleepState] = useState<SleepState>('crib')
  const [duration, setDuration] = useState('45')
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
        type: 'sleep',
        occurredAt: new Date(),
        metadata: {
          state: sleepState,
          durationMin: Number(duration || 0),
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
      title="Sleep"
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={() => router.back()}
      saving={saving}
      activeType="sleep"
    >
      <LogChoiceGroup
        label="Sleep state"
        value={sleepState}
        onChange={setSleepState}
        options={[
          { key: 'crib', label: 'Crib' },
          { key: 'arms', label: 'Arms' },
          { key: 'other', label: 'Other' },
        ]}
      />

      <View style={styles.durationCard}>
        <Text style={styles.sectionLabel}>Duration</Text>
        <Input
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="45"
          rightAccessory={<Text style={styles.unit}>min</Text>}
        />
      </View>
    </LogFormShell>
  )
}

const styles = StyleSheet.create({
  durationCard: {
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
  unit: {
    ...typography.action,
    color: colors.muted,
  },
})
