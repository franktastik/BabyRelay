import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Input } from '@/src/components/ui'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { trackEvent } from '@/src/features/analytics'
import { createDemoAuthAdapter } from '@/src/features/demo/auth'

const authAdapter = createDemoAuthAdapter()

export default function SignupScreen() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async () => {
    if (!displayName || !email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const user = await authAdapter.signUp(displayName, email, password)
      setUser(user)
      trackEvent('signup_completed', { userId: user.id })
      router.replace('/(onboarding)/welcome')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.push('/(auth)/login')} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <View style={styles.logoMark}>
              <Image source={require('../logo.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.kicker}>Join the circle</Text>
            <Text style={styles.logo}>Create Your Household</Text>
            <Text style={styles.subtitle}>
              Coordinate care with your partner, family, and caregivers in one shared, secure space.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Alex Miller"
              leftAccessory={<Text style={styles.inputIcon}>♙</Text>}
              rightAccessory={<Text style={styles.inputBadge}>•••</Text>}
            />
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="alex@household.com"
              keyboardType="email-address"
              leftAccessory={<Text style={styles.inputIcon}>✉</Text>}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              leftAccessory={<Text style={styles.inputIcon}>⌂</Text>}
              rightAccessory={<Text style={styles.eyeHint}>⌕</Text>}
            />
            <Text style={styles.helper}>Must be at least 6 characters.</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              onPress={handleSignup}
              loading={loading}
              style={styles.button}
              accessibilityLabel="Start Your Relay"
              testID="start-your-relay-button"
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Start Your Relay</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </View>
            </Button>
            <Text style={styles.securityText}>♡ END-TO-END ENCRYPTED HOUSEHOLD DATA</Text>

            <Button
              onPress={() => router.push('/(auth)/login')}
              variant="ghost"
              style={styles.ghostButton}
            >
              Already have an account? Log in
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 22,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 30,
    lineHeight: 32,
    color: colors.muted,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  kicker: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: spacing.xs,
  },
  logo: {
    ...typography.h1,
    color: colors.stoneText,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing.lg,
    maxWidth: 278,
  },
  form: {
    gap: spacing.base,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.action,
    color: colors.white,
  },
  inputBadge: {
    width: 24,
    height: 22,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.mutedLight,
    color: colors.white,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  inputIcon: {
    width: 22,
    color: colors.mutedLight,
    fontSize: 17,
    textAlign: 'center',
  },
  eyeHint: {
    color: colors.mutedLight,
    fontSize: 16,
  },
  buttonArrow: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  helper: {
    ...typography.label,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: -6,
  },
  securityText: {
    fontSize: 9,
    lineHeight: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: colors.mutedLight,
    textAlign: 'center',
    marginTop: -2,
  },
  ghostButton: {
    minHeight: 36,
    marginTop: 0,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
})
