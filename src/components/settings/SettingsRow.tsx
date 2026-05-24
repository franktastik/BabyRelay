import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight, LucideIcon } from 'lucide-react-native'
import { colors, radius, spacing, typography } from '@/src/theme'

interface SettingsRowProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  onPress?: () => void
  danger?: boolean
  trailing?: string
}

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
  danger = false,
  trailing,
}: SettingsRowProps) {
  const color = danger ? colors.danger : colors.sageText

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.iconShell, danger && styles.iconShellDanger]}>
        <Icon color={color} size={18} strokeWidth={2.2} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, danger && styles.dangerText]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      <ChevronRight color={colors.mutedLight} size={18} strokeWidth={2} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellDanger: {
    backgroundColor: colors.softClay,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.action,
    color: colors.ink,
  },
  dangerText: {
    color: colors.danger,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  trailing: {
    ...typography.label,
    color: colors.sageText,
  },
})
