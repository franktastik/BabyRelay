import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen, Button, Input } from '@/src/components/ui'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'
import { useAuthStore } from '@/src/stores/authStore'
import { createDemoAuthAdapter } from '@/src/features/demo/auth'
import { createDemoHouseholdAdapter } from '@/src/features/demo/household'

const authAdapter = createDemoAuthAdapter()
const householdAdapter = createDemoHouseholdAdapter()

export default function LoginScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const setUser = useAuthStore((s) => s.setUser)
  const setOnboardingState = useAuthStore((s) => s.setOnboardingState)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.login.errorMissing'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const user = await authAdapter.signIn(email, password)
      const onboardingState = await householdAdapter.getOnboardingState(user.id)
      setUser(user)
      setOnboardingState(onboardingState)
      router.replace(onboardingState.onboardingCompleted ? '/(tabs)/home' : '/(onboarding)/welcome')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.login.errorFallback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Image source={require('../logo.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.logo}>{t('auth.login.productName')}</Text>
            <Text style={styles.subtitle}>{t('auth.login.tagline')}</Text>

            <View style={styles.avatarStack}>
              <View style={[styles.avatar, styles.photoAvatar]}>
                <Image
                  source={require('../caregiver-avatar-1.png')}
                  style={styles.avatarImage}
                  accessibilityLabel="Caregiver avatar"
                />
              </View>
              <View style={[styles.avatar, styles.photoAvatar]}>
                <Image
                  source={require('../caregiver-avatar-2.png')}
                  style={styles.avatarImage}
                  accessibilityLabel="Caregiver avatar"
                />
              </View>
              <View style={[styles.avatar, styles.avatarHeart]}>
                <Text style={styles.avatarHeartText}>♡</Text>
              </View>
            </View>

            <Text style={styles.heroCopy}>{t('auth.login.hero')}</Text>
          </View>

          <View style={styles.form}>
            <Pressable
              disabled
              accessibilityLabel="Apple sign-in coming soon"
              accessibilityState={{ disabled: true }}
              style={[styles.socialButton, styles.socialButtonDisabled]}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialText}>{t('auth.login.appleButton')}</Text>
            </Pressable>
            <Pressable
              disabled
              accessibilityLabel="Google sign-in coming soon"
              accessibilityState={{ disabled: true }}
              style={[styles.socialButton, styles.socialButtonLight, styles.socialButtonDisabled]}
            >
              <Image source={require('../google-logo.png')} style={styles.googleLogo} />
              <Text style={[styles.socialText, styles.socialTextDark]}>{t('auth.login.googleButton')}</Text>
            </Pressable>
            <Text style={styles.deferredProviderText}>
              {t('auth.login.deferredProviders')}
            </Text>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{t('auth.login.divider')}</Text>
              <View style={styles.divider} />
            </View>

            <Input
              label={t('auth.login.emailLabel')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              inputStyle={styles.mockInput}
              leftAccessory={<Text style={styles.inputIcon}>✉</Text>}
              rightAccessory={<Text style={styles.inputBadge}>•••</Text>}
            />
            <Input
              label={t('auth.login.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.passwordPlaceholder')}
              secureTextEntry
              inputStyle={styles.mockInput}
              leftAccessory={<Text style={styles.inputIcon}>⌕</Text>}
            />

            <View style={styles.formMeta}>
              <Pressable
                onPress={() => setRememberMe((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
                style={styles.rememberToggle}
              >
                <Text style={styles.remember}>
                  {rememberMe ? '☑' : '□'} {t('auth.login.remember')}
                </Text>
              </Pressable>
              <Text style={styles.forgot}>{t('auth.login.forgotDeferred')}</Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button onPress={handleLogin} loading={loading} style={styles.button}>
              {t('auth.login.submit')}
            </Button>

            <View style={styles.footerCopy}>
              <Text style={styles.footerText}>{t('auth.login.signupPrompt')}</Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.footerLink}>{t('auth.login.signupLink')}</Text>
              </Pressable>
            </View>
            <Text style={styles.securityText}>♡ {t('auth.login.securityText').toUpperCase()}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 64,
  },
  header: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 18,
  },
  logoMark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    ...shadows.sm,
  },
  logoImage: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  logo: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.inkLight,
    marginTop: 3,
    fontWeight: '500',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -5,
    ...shadows.sm,
  },
  photoAvatar: {
    backgroundColor: colors.cream,
    overflow: 'hidden',
    padding: 0,
  },
  avatarHeart: {
    backgroundColor: colors.sage,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarHeartText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  heroCopy: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    maxWidth: 280,
  },
  form: {
    width: '82%',
    maxWidth: 320,
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 27,
    paddingHorizontal: 27,
    paddingBottom: 24,
    ...shadows.md,
  },
  socialButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  socialButtonLight: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonDisabled: {
    opacity: 0.62,
  },
  deferredProviderText: {
    ...typography.label,
    color: colors.muted,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  socialText: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
    fontWeight: '800',
  },
  appleIcon: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 21,
  },
  googleLogo: {
    width: 18,
    height: 18,
  },
  socialTextDark: {
    color: colors.stoneText,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 5,
    marginBottom: 0,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  mockInput: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  inputIcon: {
    width: 19,
    color: colors.mutedLight,
    fontSize: 17,
    textAlign: 'center',
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
  formMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remember: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  rememberToggle: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  forgot: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  button: {
    marginTop: 0,
    minHeight: 50,
    borderRadius: 16,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  footerCopy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: -2,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  footerLink: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.sageText,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  securityText: {
    fontSize: 8,
    lineHeight: 10,
    color: colors.mutedLight,
    textAlign: 'center',
    marginTop: -6,
  },
})
