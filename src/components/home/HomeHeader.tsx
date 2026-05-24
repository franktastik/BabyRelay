import React from 'react'
import { Image, Pressable, View, Text, StyleSheet } from 'react-native'
import { Settings2 } from 'lucide-react-native'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'

interface HomeHeaderProps {
  babyName?: string
  caregiverName?: string
  onSettingsPress?: () => void
}

export function HomeHeader({ babyName = 'Baby', caregiverName, onSettingsPress }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Image source={require('../../../app/logo.png')} style={styles.logoImage} />
        </View>
        <View>
          <Text style={styles.babyName}>{babyName}’s Relay</Text>
          <View style={styles.syncRow}>
            <View style={styles.syncDot} />
            <Text style={styles.caregiver}>
              {caregiverName ? `Synced just now • ${caregiverName}` : 'Synced just now'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.peopleStack}>
        <Image source={require('../../../app/caregiver-avatar-1.png')} style={styles.person} />
        <Image source={require('../../../app/caregiver-avatar-2.png')} style={[styles.person, styles.personOverlap]} />
        <View style={styles.onlineDot} />
      </View>
      <Pressable onPress={onSettingsPress} style={styles.settingsButton} hitSlop={10}>
        <Settings2 color={colors.muted} size={18} strokeWidth={2.2} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  logoImage: {
    width: 27,
    height: 27,
    borderRadius: 8,
  },
  babyName: {
    ...typography.h2,
    color: colors.stoneText,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#56B86B',
  },
  caregiver: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  peopleStack: {
    marginLeft: 'auto',
    marginRight: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  person: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.white,
  },
  personOverlap: {
    marginLeft: -10,
  },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#56B86B',
    borderWidth: 2,
    borderColor: colors.white,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
})
