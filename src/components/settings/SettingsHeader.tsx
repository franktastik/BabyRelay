import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronLeft, Settings2 } from 'lucide-react-native'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

interface SettingsHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  rightIcon?: 'settings' | 'none'
}

export function SettingsHeader({
  title,
  subtitle,
  onBack,
  rightIcon = 'settings',
}: SettingsHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconButton} hitSlop={12}>
          <ChevronLeft color={colors.stoneText} size={20} strokeWidth={2.3} />
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightIcon === 'settings' ? (
        <View style={styles.iconButton}>
          <Settings2 color={colors.stoneText} size={18} strokeWidth={2.2} />
        </View>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.sageText,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconSpacer: {
    width: 42,
    height: 42,
  },
})
