import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { createDemoAuthAdapter } from '@/src/features/demo/auth'
import {
  BABY_MINIMO_DELETE_CONFIRMATION,
  getBabyMinimoLifecycleCleanupRetrySteps,
  hasBabyMinimoLifecycleCleanupBlockingFailure,
  hasBabyMinimoLifecycleCleanupFailures,
  isBabyMinimoDeleteConfirmationValid,
  runBabyMinimoLocalLifecycleCleanup,
} from '@/src/features/privacy'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const authAdapter = createDemoAuthAdapter()

export default function DeleteAccountConfirmModal() {
  const router = useRouter()
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = password.trim().length > 0 && isBabyMinimoDeleteConfirmationValid(confirmation)

  const deleteLocalAccountData = async () => {
    if (!canSubmit) {
      setError(t('account.delete.error'))
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await authAdapter.signOut()
      const cleanupResult = await runBabyMinimoLocalLifecycleCleanup('accountDeletion')
      if (hasBabyMinimoLifecycleCleanupBlockingFailure(cleanupResult)) {
        setError(t('lifecycle.cleanup.blocked'))
        setSubmitting(false)
        return
      }
      if (
        typeof __DEV__ !== 'undefined' &&
        __DEV__ &&
        hasBabyMinimoLifecycleCleanupFailures(cleanupResult)
      ) {
        console.warn(
          '[BabyMinimo lifecycle]',
          'Retryable local deletion cleanup steps:',
          getBabyMinimoLifecycleCleanupRetrySteps(cleanupResult)
        )
      }
      router.replace('/(auth)/login')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t('lifecycle.cleanup.blocked'))
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Image source={require('../logo.png')} style={styles.logo} />
        <Text style={styles.title}>{t('account.delete.confirmTitle')}</Text>
        <Text style={styles.copy}>{t('account.delete.confirmCopy')}</Text>
        <Text style={styles.productionNote}>{t('account.delete.productionNote')}</Text>

        <Text style={styles.label}>{t('account.delete.passwordLabel')}</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={t('account.delete.passwordPlaceholder')}
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t('account.delete.confirmLabel')}</Text>
        <TextInput
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder={BABY_MINIMO_DELETE_CONFIRMATION}
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          autoCapitalize="characters"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={deleteLocalAccountData}
          disabled={submitting}
          style={[styles.dangerButton, !canSubmit && styles.disabledButton]}
        >
          <Text style={styles.dangerText}>
            {submitting ? t('account.delete.submitting') : t('account.delete.submit')}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()} disabled={submitting} style={styles.cancelButton}>
          <Text style={styles.cancelText}>{t('account.delete.cancel')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: radius.xxxl,
    backgroundColor: colors.white,
    padding: spacing.xl,
    ...shadows.lg,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  copy: {
    ...typography.bodySmall,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  productionNote: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.base,
    color: colors.ink,
    marginBottom: spacing.base,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.base,
  },
  dangerButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  disabledButton: {
    opacity: 0.55,
  },
  dangerText: {
    ...typography.action,
    color: colors.white,
  },
  cancelButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.action,
    color: colors.stoneText,
  },
})
