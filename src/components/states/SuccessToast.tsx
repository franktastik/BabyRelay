import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CheckCircle2, X } from 'lucide-react-native'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

interface SuccessToastProps {
  title: string
  copy: string
}

export function SuccessToast({ title, copy }: SuccessToastProps) {
  return (
    <View style={styles.toast}>
      <View style={styles.iconShell}>
        <CheckCircle2 color={colors.white} size={18} strokeWidth={2.4} />
      </View>
      <View style={styles.copyBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.copy}>{copy}</Text>
      </View>
      <X color={colors.white} size={18} strokeWidth={2.2} />
    </View>
  )
}

const styles = StyleSheet.create({
  toast: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    ...shadows.md,
  },
  iconShell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: {
    flex: 1,
  },
  title: {
    ...typography.action,
    color: colors.white,
  },
  copy: {
    ...typography.label,
    color: colors.white,
    opacity: 0.86,
    marginTop: 2,
  },
})
