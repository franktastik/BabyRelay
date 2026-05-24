import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, radius, typography } from '@/src/theme'

interface ButtonProps {
  onPress: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  style?: object
  testID?: string
  accessibilityLabel?: string
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const variantStyle = variantStyles[variant]
  const stringLabel = typeof children === 'string' || typeof children === 'number' ? String(children) : undefined

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, variantStyle, disabled && styles.disabled, style]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? stringLabel}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.sage} />
      ) : typeof children === 'string' || typeof children === 'number' ? (
        <Text style={[styles.text, variant === 'primary' && styles.textPrimary]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.action,
    color: colors.sageText,
  },
  textPrimary: {
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
})

const variantStyles = {
  primary: {
    backgroundColor: colors.clay,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
}
