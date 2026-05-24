import React, { useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Input, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'

export default function InviteCaregiverScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [invited, setInvited] = useState(false)

  const handleInvite = () => {
    if (email) {
      setInvited(true)
    }
  }

  const handleContinue = () => {
    router.push('/(onboarding)/preview')
  }

  return (
    <Screen>
      <OnboardingFrame
        center
        title="Shared care is better care."
        subtitle="Staying in sync with Leo's other caregivers means less mental load and smoother handoffs for everyone."
        step="Step 3 of 5"
        progress={0.6}
        onBack={() => router.back()}
      >
        <View style={styles.avatarCluster}>
          <Image source={require('../caregiver-avatar-1.png')} style={styles.avatar} />
          <View style={styles.addBadge}>
            <Text style={styles.addBadgeIcon}>♙+</Text>
          </View>
          <View style={styles.heartBadge}>
            <Text style={styles.heartBadgeIcon}>♡</Text>
          </View>
        </View>

        <Card style={styles.card}>
          {invited ? (
            <Text style={styles.invitedText}>
              Invite sent! They'll receive an email to join your household.
            </Text>
          ) : (
            <>
              <Input
                label="Partner's email"
                value={email}
                onChangeText={setEmail}
                placeholder="partner@example.com"
                keyboardType="email-address"
                inputStyle={styles.inputShell}
                leftAccessory={<Text style={styles.inputIcon}>✉</Text>}
                rightAccessory={<Text style={styles.inputAction}>•••</Text>}
              />
              <View style={styles.noteBox}>
                <Text style={styles.noteIcon}>ⓘ</Text>
                <Text style={styles.noteText}>
                  They'll get an invite to join <Text style={styles.noteStrong}>The Miller Household</Text>{' '}
                  and view Leo's live handoff status.
                </Text>
              </View>
            </>
          )}
        </Card>

        {!invited && (
          <Button onPress={handleInvite} style={styles.button}>
            Send Invite to Caregiver ↗
          </Button>
        )}

        <View style={styles.actions}>
          <Button onPress={handleContinue} variant="ghost">
            I'll do this later
          </Button>
        </View>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  avatarCluster: {
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.base,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  addBadge: {
    position: 'absolute',
    left: '50%',
    marginLeft: 22,
    top: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  addBadgeIcon: {
    color: colors.sageText,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  heartBadge: {
    position: 'absolute',
    left: '50%',
    marginLeft: 42,
    top: 30,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  heartBadgeIcon: {
    color: colors.white,
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xxxl,
    marginBottom: spacing.base,
  },
  invitedText: {
    ...typography.body,
    color: colors.sage,
    textAlign: 'center',
  },
  inputShell: {
    minHeight: 58,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
  },
  inputIcon: {
    color: colors.mutedLight,
    fontSize: 16,
    marginLeft: 2,
  },
  inputAction: {
    color: colors.white,
    overflow: 'hidden',
    backgroundColor: '#B8BEC8',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  noteBox: {
    minHeight: 70,
    flexDirection: 'row',
    gap: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  noteIcon: {
    color: colors.sageText,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  noteText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.inkLight,
    lineHeight: 18,
  },
  noteStrong: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.sageText,
  },
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: 14,
    ...shadows.md,
  },
  actions: {
    gap: spacing.sm,
  },
})
