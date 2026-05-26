import React, { useRef, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { UserPlus, UsersRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { RelationshipLabelSelector } from '@/src/components/household'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { demoCaregivers, type DemoCaregiver } from '@/src/features/demo/caregivers'
import { canInviteHouseholdMembers } from '@/src/features/household/permissions'
import {
  defaultRelationshipLabelId,
  getRelationshipLabelKey,
  normalizeCustomRelationshipLabel,
  type RelationshipLabelId,
} from '@/src/features/household/relationshipLabels'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const avatarSources = {
  'caregiver-1': require('../../app/caregiver-avatar-1.png'),
  'caregiver-2': require('../../app/caregiver-avatar-2.png'),
}

export default function FamilyScreen() {
  const { t } = useTranslation()
  const [inviteEmail, setInviteEmail] = useState('')
  const [invited, setInvited] = useState(false)
  const [inviteRelationshipLabel, setInviteRelationshipLabel] = useState<RelationshipLabelId>(defaultRelationshipLabelId)
  const [customRelationshipLabel, setCustomRelationshipLabel] = useState('')
  const [queuedRelationshipLabel, setQueuedRelationshipLabel] = useState('')
  const scrollRef = useRef<ScrollView>(null)
  const householdRole = useAuthStore((state) => state.householdRole)
  const canInvite = canInviteHouseholdMembers(householdRole)

  const handleInvite = () => {
    if (!canInvite || !inviteEmail.trim()) return
    const relationshipLabel = inviteRelationshipLabel === 'other'
      ? normalizeCustomRelationshipLabel(customRelationshipLabel) || t(getRelationshipLabelKey('other'))
      : t(getRelationshipLabelKey(inviteRelationshipLabel))
    setQueuedRelationshipLabel(relationshipLabel)
    setInvited(true)
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title={t('family.title')} subtitle={t('family.subtitle')} />

        <View style={styles.planCard}>
          <View style={styles.planBadge}>
            <UsersRound color={colors.white} size={16} strokeWidth={2.2} />
            <Text style={styles.planBadgeText}>{t('family.plan.badge')}</Text>
          </View>
          <Text style={styles.planTitle}>{t('family.plan.title')}</Text>
          <Text style={styles.planMeta}>{t('family.plan.meta')}</Text>
          <View style={styles.planFooter}>
            <View style={styles.planAvatars}>
              <Image source={require('../../app/caregiver-avatar-1.png')} style={styles.planAvatar} />
              <Image source={require('../../app/caregiver-avatar-2.png')} style={[styles.planAvatar, styles.planAvatarOverlap]} />
              <View style={[styles.planAvatar, styles.moreAvatar]}>
                <Text style={styles.moreAvatarText}>+2</Text>
              </View>
            </View>
            {canInvite ? (
              <Pressable
                onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                style={styles.manageButton}
                accessibilityRole="button"
                accessibilityLabel={t('family.plan.manage')}
              >
                <Text style={styles.manageButtonText}>{t('family.plan.manage')}</Text>
              </Pressable>
            ) : (
              <View style={styles.accessPill}>
                <Text style={styles.accessPillText}>{t('family.plan.caregiverAccess')}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.householdTitle}>{t('family.members.title')}</Text>
          {canInvite ? (
            <View style={styles.inviteInline}>
              <UserPlus color={colors.sageText} size={15} strokeWidth={2.2} />
              <Text style={styles.inviteInlineText}>{t('family.invite.short')}</Text>
            </View>
          ) : null}
        </View>

        {demoCaregivers.map((caregiver) => (
          <CaregiverRow key={caregiver.id} caregiver={caregiver} />
        ))}

        {canInvite ? (
          <>
            <Text style={styles.sectionTitle}>{t('family.expand.title')}</Text>
            <View style={styles.inviteCard}>
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder={t('family.invite.placeholder')}
                placeholderTextColor={colors.mutedLight}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <RelationshipLabelSelector
                selectedLabelId={inviteRelationshipLabel}
                customLabel={customRelationshipLabel}
                onSelectLabel={setInviteRelationshipLabel}
                onChangeCustomLabel={setCustomRelationshipLabel}
                testIDPrefix="family-relationship-label"
              />
              <Pressable onPress={handleInvite} style={styles.inviteButton}>
                <UserPlus color={colors.white} size={17} strokeWidth={2.3} />
                <Text style={styles.inviteText}>{t('family.invite.button')}</Text>
              </Pressable>
              {invited ? (
                <Text style={styles.invitedText}>
                  {t('family.invite.queued', { relationshipLabel: queuedRelationshipLabel })}
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>{t('family.invite.restrictedTitle')}</Text>
            <Text style={styles.permissionCopy}>{t('family.invite.restrictedCopy')}</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

function CaregiverRow({ caregiver }: { caregiver: DemoCaregiver }) {
  const { t } = useTranslation()
  const relationshipLabel = caregiver.relationshipLabel === 'other'
    ? caregiver.customRelationshipLabel || t(getRelationshipLabelKey('other'))
    : t(getRelationshipLabelKey(caregiver.relationshipLabel))

  return (
    <View style={styles.caregiverRow}>
      {caregiver.avatar ? (
        <Image source={avatarSources[caregiver.avatar]} style={styles.avatar} />
      ) : (
        <View style={styles.initials}>
          <Text style={styles.initialsText}>{caregiver.name.split(' ').map((part) => part[0]).join('')}</Text>
        </View>
      )}
      <View style={styles.caregiverCopy}>
        <Text style={styles.caregiverName}>{caregiver.name}</Text>
        <Text style={styles.caregiverMeta}>
          {relationshipLabel} · {t(caregiver.accessKey)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 120,
  },
  planCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.sage,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  planBadgeText: {
    ...typography.label,
    color: colors.white,
    textTransform: 'uppercase',
  },
  planTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  planMeta: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  planAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.white,
  },
  planAvatarOverlap: {
    marginLeft: -10,
  },
  moreAvatar: {
    marginLeft: -10,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAvatarText: {
    ...typography.label,
    color: colors.white,
  },
  manageButton: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  manageButtonText: {
    ...typography.label,
    color: colors.sageText,
  },
  accessPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accessPillText: {
    ...typography.label,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  householdTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.base,
  },
  inviteInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inviteInlineText: {
    ...typography.bodySmall,
    color: colors.sageText,
    fontWeight: '700',
  },
  caregiverRow: {
    minHeight: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.md,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  initials: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...typography.action,
    color: colors.stoneText,
  },
  caregiverCopy: {
    flex: 1,
  },
  caregiverName: {
    ...typography.action,
    color: colors.ink,
  },
  caregiverMeta: {
    ...typography.label,
    color: colors.sageText,
    marginTop: 3,
  },
  inviteCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: spacing.base,
    ...shadows.sm,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.ink,
  },
  inviteButton: {
    minHeight: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.clay,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  inviteText: {
    ...typography.action,
    color: colors.white,
  },
  invitedText: {
    ...typography.bodySmall,
    color: colors.sageText,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  permissionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    ...shadows.sm,
  },
  permissionTitle: {
    ...typography.action,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  permissionCopy: {
    ...typography.bodySmall,
    color: colors.muted,
  },
})
