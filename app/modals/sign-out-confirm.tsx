import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { trackEvent } from '@/src/features/analytics'
import { createDemoAuthAdapter } from '@/src/features/demo/auth'
import {
  getBabyMinimoLifecycleCleanupRetrySteps,
  hasBabyMinimoLifecycleCleanupFailures,
  runBabyMinimoLocalLifecycleCleanup,
} from '@/src/features/privacy'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const authAdapter = createDemoAuthAdapter()

export default function SignOutConfirmModal() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const signOut = async () => {
    setSubmitting(true)
    try {
      trackEvent('sign_out_confirmed')
      await authAdapter.signOut()
    } finally {
      const cleanupResult = await runBabyMinimoLocalLifecycleCleanup('signOut')
      if (
        typeof __DEV__ !== 'undefined' &&
        __DEV__ &&
        hasBabyMinimoLifecycleCleanupFailures(cleanupResult)
      ) {
        console.warn(
          '[BabyMinimo lifecycle]',
          'Retryable local cleanup steps:',
          getBabyMinimoLifecycleCleanupRetrySteps(cleanupResult)
        )
      }
      router.replace('/(auth)/login')
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Image source={require('../logo.png')} style={styles.logo} />
        <Text style={styles.title}>Sign out?</Text>
        <Text style={styles.copy}>
          You&apos;ll need to log in again to access your household and care history.
        </Text>
        <Pressable onPress={signOut} disabled={submitting} style={styles.dangerButton}>
          <Text style={styles.dangerText}>{submitting ? 'Signing out...' : 'Sign out'}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
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
    alignItems: 'center',
    ...shadows.lg,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  copy: {
    ...typography.bodySmall,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  dangerButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
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
