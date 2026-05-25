import React, { useRef, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { UserPlus, UsersRound } from 'lucide-react-native'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { demoCaregivers, type DemoCaregiver } from '@/src/features/demo/caregivers'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const avatarSources = {
  'caregiver-1': require('../../app/caregiver-avatar-1.png'),
  'caregiver-2': require('../../app/caregiver-avatar-2.png'),
}

export default function FamilyScreen() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [invited, setInvited] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    setInvited(true)
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title="Family & Household" subtitle="Coordinating care together" />

        <View style={styles.planCard}>
          <View style={styles.planBadge}>
            <UsersRound color={colors.white} size={16} strokeWidth={2.2} />
            <Text style={styles.planBadgeText}>Active coordination plan</Text>
          </View>
          <Text style={styles.planTitle}>The Miller Household</Text>
          <Text style={styles.planMeta}>Standard Family Plan • Renewing Oct 12</Text>
          <View style={styles.planFooter}>
            <View style={styles.planAvatars}>
              <Image source={require('../../app/caregiver-avatar-1.png')} style={styles.planAvatar} />
              <Image source={require('../../app/caregiver-avatar-2.png')} style={[styles.planAvatar, styles.planAvatarOverlap]} />
              <View style={[styles.planAvatar, styles.moreAvatar]}>
                <Text style={styles.moreAvatarText}>+2</Text>
              </View>
            </View>
            <Pressable
              onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
              style={styles.manageButton}
              accessibilityRole="button"
              accessibilityLabel="Manage caregivers"
            >
              <Text style={styles.manageButtonText}>Manage Caregivers</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.householdTitle}>Household Members</Text>
          <View style={styles.inviteInline}>
            <UserPlus color={colors.sageText} size={15} strokeWidth={2.2} />
            <Text style={styles.inviteInlineText}>Invite</Text>
          </View>
        </View>

        {demoCaregivers.map((caregiver) => (
          <CaregiverRow key={caregiver.id} caregiver={caregiver} />
        ))}

        <Text style={styles.sectionTitle}>Expand the circle</Text>
        <View style={styles.inviteCard}>
          <TextInput
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholder="partner@family.com"
            placeholderTextColor={colors.mutedLight}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable onPress={handleInvite} style={styles.inviteButton}>
            <UserPlus color={colors.white} size={17} strokeWidth={2.3} />
            <Text style={styles.inviteText}>Invite caregiver</Text>
          </Pressable>
          {invited ? (
            <Text style={styles.invitedText}>
              Demo invite queued locally. Real email delivery is intentionally not wired in v1 demo.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  )
}

function CaregiverRow({ caregiver }: { caregiver: DemoCaregiver }) {
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
          {caregiver.role.toUpperCase()} · {caregiver.access}
        </Text>
      </View>
      <Text style={styles.more}>···</Text>
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
  more: {
    ...typography.h3,
    color: colors.mutedLight,
  },
  inviteCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
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
    marginBottom: spacing.base,
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
})
