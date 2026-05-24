import React from 'react'
import { useRouter } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { AddMomentForm } from '@/src/components/growth'
import { trackEvent } from '@/src/features/analytics'
import { useAuthStore } from '@/src/stores/authStore'
import { useGrowthTimelineStore } from '@/src/stores/growthTimelineStore'
import { colors } from '@/src/theme'

export default function AddMomentModal() {
  const router = useRouter()
  const addMoment = useGrowthTimelineStore((s) => s.addMoment)
  const selectedBabyId = useAuthStore((s) => s.selectedBabyId) || 'baby-1'

  const handleSave = (data: { caption: string; momentType: string; localImageUri: string; localImageAsset?: string }) => {
    addMoment({
      babyId: selectedBabyId,
      caption: data.caption,
      momentType: data.momentType,
      localImageUri: data.localImageUri,
      localImageAsset: data.localImageAsset,
      occurredAt: new Date(),
    })
    trackEvent('add_moment_used', {
      babyId: selectedBabyId,
      momentType: data.momentType,
    })
    router.back()
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <AddMomentForm onSave={handleSave} onCancel={handleCancel} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
})
