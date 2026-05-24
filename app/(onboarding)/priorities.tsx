import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, typography, spacing, radius, shadows } from '@/src/theme'

const priorities = [
  { id: 'coparent', label: 'Co-Parent', icon: '♡' },
  { id: 'grandparent', label: 'Grandparent', icon: '♙' },
  { id: 'nanny', label: 'Nanny', icon: '⌁' },
  { id: 'family', label: 'Family', icon: '♧' },
  { id: 'friend', label: 'Trusted Friend', icon: '◌' },
]

export default function PrioritiesScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(['coparent', 'family']))

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  return (
    <Screen>
      <OnboardingFrame
        center
        title="Build your care circle"
        subtitle="Invite family members, grandparents, nannies, or other trusted caregivers to share in baby's care."
        step="Step 2 of 5"
        progress={0.66}
        onBack={() => router.back()}
      >
        <View style={styles.orbit} accessibilityLabel="Care circle preview">
          <View style={[styles.orbitNode, styles.orbitNodeTop]}>
            <Text style={styles.orbitIcon}>♙</Text>
          </View>
          <View style={[styles.orbitNode, styles.orbitNodeLeft]}>
            <Text style={styles.orbitIcon}>♡</Text>
          </View>
          <View style={styles.logoNode}>
            <Text style={styles.logoMark}>◡</Text>
          </View>
          <View style={[styles.orbitNode, styles.orbitNodeRight]}>
            <Text style={styles.orbitIcon}>⌁</Text>
          </View>
          <View style={[styles.orbitNode, styles.orbitNodeBottom]}>
            <Text style={styles.orbitIcon}>+</Text>
          </View>
        </View>

        <View style={styles.priorities}>
          {priorities.map((priority) => {
            const isSelected = selected.has(priority.id)
            return (
              <TouchableOpacity
                key={priority.id}
                onPress={() => toggle(priority.id)}
                style={[styles.priorityCard, isSelected && styles.prioritySelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.priorityIcon, isSelected && styles.priorityIconSelected]}>
                  {priority.icon}
                </Text>
                <Text style={[styles.priorityLabel, isSelected && styles.priorityLabelSelected]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>⇄</Text>
          </View>
          <View style={styles.featureCopy}>
            <Text style={styles.featureTitle}>Real-time sync</Text>
            <Text style={styles.featureText}>
              Everyone sees feeding, sleep, and diaper updates instantly.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button onPress={() => router.push('/(onboarding)/invite-caregiver')} style={styles.button}>
            Continue
          </Button>
        </View>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  orbit: {
    width: 218,
    height: 154,
    alignSelf: 'center',
    marginTop: -spacing.base,
    marginBottom: spacing.lg,
  },
  orbitNode: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  orbitNodeTop: {
    top: 2,
    left: 84,
  },
  orbitNodeLeft: {
    top: 78,
    left: 10,
  },
  orbitNodeRight: {
    top: 78,
    right: 10,
  },
  orbitNodeBottom: {
    bottom: 0,
    left: 85,
    borderStyle: 'dashed',
    backgroundColor: colors.cream,
  },
  orbitIcon: {
    color: colors.sageText,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  logoNode: {
    position: 'absolute',
    top: 52,
    left: 76,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  logoMark: {
    color: colors.sageText,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'Outfit_800ExtraBold',
  },
  priorities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prioritySelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  priorityIcon: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.clay,
    marginRight: spacing.xs,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  priorityIconSelected: {
    color: colors.sageText,
  },
  priorityLabel: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  priorityLabelSelected: {
    color: colors.ink,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    color: colors.sageText,
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    ...typography.action,
    color: colors.ink,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
})
