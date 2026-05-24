import React from 'react'
import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen } from '@/src/components/ui'
import { colors, typography, spacing, shadows } from '@/src/theme'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View />
          <Pressable onPress={() => router.push('/(onboarding)/add-baby')}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.storyStack}>
          <Image source={require('../caregiver-avatar-1.png')} style={styles.personTop} />
          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>⌁</Text>
            <View>
              <Text style={styles.actionLabel}>Last action</Text>
              <Text style={styles.actionValue}>Fed 4oz • 15m ago</Text>
            </View>
          </View>
          <Image source={require('../caregiver-avatar-2.png')} style={styles.personBottom} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Know exactly what{'\n'}happened last.</Text>
          <Text style={styles.subtitle}>
            BabyMinimo is the shared memory for your family. Stay in sync with every caregiver,
            so you never miss a beat—or a feeding.
          </Text>
        </View>

        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          onPress={() => router.push('/(onboarding)/problem')}
          style={styles.bottomCard}
          accessibilityRole="button"
          accessibilityLabel="Continue onboarding"
        />
        <View style={styles.footerCopy}>
          <Text style={styles.footerText}>Already have a household?</Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    paddingBottom: 14,
  },
  topRow: {
    height: 36,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 54,
  },
  skip: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  storyStack: {
    alignItems: 'center',
    minHeight: 206,
    marginBottom: spacing.lg,
  },
  personTop: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  actionCard: {
    marginTop: 18,
    minWidth: 218,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
  },
  actionIcon: {
    fontSize: 20,
    color: colors.ink,
  },
  actionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  actionValue: {
    ...typography.action,
    color: colors.ink,
  },
  personBottom: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: colors.white,
    marginTop: 20,
    ...shadows.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing.lg,
    maxWidth: 270,
    lineHeight: 21,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.mutedLight,
  },
  bottomCard: {
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  footerCopy: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  footerLink: {
    ...typography.bodySmall,
    color: colors.sageText,
    textDecorationLine: 'underline',
  },
})
