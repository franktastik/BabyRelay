import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AlertTriangle, CheckCircle2, CloudOff, Heart, LoaderCircle, LucideIcon } from 'lucide-react-native'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

type StateTone = 'empty' | 'loading' | 'error' | 'success'

interface AppStateViewProps {
  tone: StateTone
  title: string
  copy: string
  actionLabel?: string
  onAction?: () => void
}

const icons: Record<StateTone, LucideIcon> = {
  empty: Heart,
  loading: LoaderCircle,
  error: AlertTriangle,
  success: CheckCircle2,
}

export function AppStateView({ tone, title, copy, actionLabel, onAction }: AppStateViewProps) {
  const Icon = icons[tone] || CloudOff
  const isError = tone === 'error'
  const isSuccess = tone === 'success'

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconShell,
          isError && styles.errorShell,
          isSuccess && styles.successShell,
        ]}
      >
        <Icon
          color={isError ? colors.danger : isSuccess ? colors.sageText : colors.sageText}
          size={34}
          strokeWidth={2.1}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} style={[styles.button, isError && styles.errorButton]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconShell: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  errorShell: {
    backgroundColor: colors.softClay,
  },
  successShell: {
    backgroundColor: colors.softSage,
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  copy: {
    ...typography.body,
    color: colors.inkLight,
    textAlign: 'center',
  },
  button: {
    minHeight: 50,
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  errorButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    ...typography.action,
    color: colors.white,
  },
})
