import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, radius, typography } from '@/src/theme'

interface ChipProps {
  label: string
  onPress?: () => void
  selected?: boolean
  variant?: 'default' | 'sage' | 'clay' | 'gold'
}

export function Chip({ label, onPress, selected = false, variant = 'default' }: ChipProps) {
  const variantStyle = variantStyles[variant]

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        variantStyle,
        selected && styles.selected,
        selected && variantStyleSelected[variant],
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          selected && styles.textSelected,
          selected && variantTextStyleSelected[variant],
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.creamAlt,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 1,
  },
  text: {
    ...typography.label,
    lineHeight: 16,
    color: colors.muted,
  },
  textSelected: {
    fontWeight: '600',
  },
})

const variantStyles = {
  default: {
    borderColor: colors.creamAlt,
    backgroundColor: colors.white,
  },
  sage: {
    borderColor: colors.sage,
    backgroundColor: colors.white,
  },
  clay: {
    borderColor: colors.clay,
    backgroundColor: colors.white,
  },
  gold: {
    borderColor: colors.gold,
    backgroundColor: colors.white,
  },
}

const variantStyleSelected = {
  default: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  sage: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  clay: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
  },
  gold: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
}

const variantTextStyleSelected = {
  default: {
    color: colors.white,
  },
  sage: {
    color: colors.white,
  },
  clay: {
    color: colors.white,
  },
  gold: {
    color: colors.ink,
  },
}
