import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { colors, radius, typography, spacing } from '@/src/theme'

interface LogOptionCardProps {
  icon: string
  label: string
  onPress: () => void
  wide?: boolean
}

export function LogOptionCard({ icon, label, onPress, wide = false }: LogOptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, wide && styles.wideCard]}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    width: '47.8%',
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wideCard: {
    width: '100%',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.softClay,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 22,
    color: colors.sageText,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.ink,
  },
})
