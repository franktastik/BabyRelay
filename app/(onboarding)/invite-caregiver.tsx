import React, { useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react-native'
import { RelationshipLabelSelector } from '@/src/components/household'
import { Screen, Button, Input, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import {
  defaultRelationshipLabelId,
  getRelationshipLabelKey,
  normalizeCustomRelationshipLabel,
  type RelationshipLabelId,
} from '@/src/features/household/relationshipLabels'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'

export default function InviteCaregiverScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [invited, setInvited] = useState(false)
  const [relationshipLabel, setRelationshipLabel] = useState<RelationshipLabelId>(defaultRelationshipLabelId)
  const [customRelationshipLabel, setCustomRelationshipLabel] = useState('')
  const [queuedRelationshipLabel, setQueuedRelationshipLabel] = useState('')

  const handleInvite = () => {
    if (email) {
      const selectedRelationshipLabel = relationshipLabel === 'other'
        ? normalizeCustomRelationshipLabel(customRelationshipLabel) || t(getRelationshipLabelKey('other'))
        : t(getRelationshipLabelKey(relationshipLabel))
      setQueuedRelationshipLabel(selectedRelationshipLabel)
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
        title={t('onboarding.invite.title')}
        subtitle={t('onboarding.invite.subtitle')}
        step={t('onboarding.invite.step')}
        progress={1}
        onBack={() => router.back()}
      >
        <View style={styles.avatarCluster}>
          <View style={styles.avatarWrap}>
            <Image source={require('../caregiver-avatar-1.png')} style={styles.avatar} />
            <View style={styles.addBadge}>
              <UserPlus color={colors.sageText} size={16} strokeWidth={2.4} />
            </View>
          </View>
        </View>

        <Card style={styles.card}>
          {invited ? (
            <Text style={styles.invitedText}>
              {t('onboarding.invite.sent', { relationshipLabel: queuedRelationshipLabel })}
            </Text>
          ) : (
            <>
              <Input
                label={t('onboarding.invite.emailLabel')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('onboarding.invite.emailPlaceholder')}
                keyboardType="email-address"
                inputStyle={styles.inputShell}
                leftAccessory={<Text style={styles.inputIcon}>✉</Text>}
                accessibilityLabel={t('onboarding.invite.emailLabel')}
              />
              <RelationshipLabelSelector
                selectedLabelId={relationshipLabel}
                customLabel={customRelationshipLabel}
                onSelectLabel={setRelationshipLabel}
                onChangeCustomLabel={setCustomRelationshipLabel}
                testIDPrefix="onboarding-relationship-label"
              />
              <View style={styles.noteBox}>
                <Text style={styles.noteIcon}>ⓘ</Text>
                <Text style={styles.noteText}>
                  {t('onboarding.invite.noteBefore')}{' '}
                  <Text style={styles.noteStrong}>{t('onboarding.invite.householdName')}</Text>{' '}
                  {t('onboarding.invite.noteAfter')}
                </Text>
              </View>
            </>
          )}
        </Card>

        {!invited && (
          <Button onPress={handleInvite} style={styles.button}>
            {t('onboarding.invite.send')}
          </Button>
        )}

        <View style={styles.actions}>
          <Button onPress={handleContinue} variant="ghost">
            {t('onboarding.invite.later')}
          </Button>
        </View>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  avatarCluster: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.base,
    marginBottom: spacing.base,
  },
  avatarWrap: {
    width: 68,
    height: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  addBadge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  card: {
    gap: spacing.base,
    padding: spacing.base,
    borderRadius: radius.xxxl,
    marginBottom: spacing.sm,
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
  noteBox: {
    minHeight: 60,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
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
    minHeight: 52,
    borderRadius: 14,
    ...shadows.md,
  },
  actions: {
    gap: spacing.sm,
  },
})
