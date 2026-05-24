import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, radius, shadows } from '@/src/theme'

interface CardProps {
  children: React.ReactNode
  style?: object
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
})
