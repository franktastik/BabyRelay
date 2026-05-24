import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Input } from '@/src/components/ui'
import { LogChoiceGroup, LogFormShell } from '@/src/components/logging'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { colors, radius, spacing, typography } from '@/src/theme'

type MilkType = 'breastmilk' | 'formula'

export default function LogBottleModal() {
  const router = useRouter()
  const [amount, setAmount] = useState('4')
  const [milkType, setMilkType] = useState<MilkType>('formula')
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
        type: 'bottle',
        occurredAt: new Date(),
        metadata: {
          amountMl: Math.round(Number(amount || 0) * 29.5735),
          amountOz: Number(amount || 0),
          milkType,
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
      title="Feeding type"
      note={note}
      onNoteChange={setNote}
      onSave={handleSave}
      onCancel={() => router.back()}
      saving={saving}
      activeType="feeding"
    >
      <View style={styles.amountCard}>
        <Text style={styles.sectionLabel}>Amount</Text>
        <Input
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="4"
          rightAccessory={<Text style={styles.unit}>oz</Text>}
        />
      </View>

      <LogChoiceGroup
        label="Milk type"
        value={milkType}
        onChange={setMilkType}
        options={[
          { key: 'breastmilk', label: 'Breastmilk' },
          { key: 'formula', label: 'Formula' },
        ]}
      />
    </LogFormShell>
  )
}

const styles = StyleSheet.create({
  amountCard: {
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
