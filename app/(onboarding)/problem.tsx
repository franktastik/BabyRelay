import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen, Button, Card } from '@/src/components/ui'
import { OnboardingFrame } from '@/src/components/onboarding'
import { colors, typography, spacing, radius } from '@/src/theme'

const problems = [
  {
    icon: '♧',
    title: 'Less to remember',
    body: 'No more 3 AM mental math. We track the times so you can focus on the snuggles.',
  },
  {
    icon: '⇄',
    title: 'Seamless handoffs',
    body: 'Passing the baton? Your partner instantly knows exactly what happened last.',
  },
  {
    icon: '♡',
    title: 'Shared support',
    body: 'Keep parents, grandparents, and trusted caregivers aligned without extra noise.',
  },
]

export default function ProblemScreen() {
  const router = useRouter()

  return (
    <Screen>
      <OnboardingFrame
        title={'Care is a relay,\nnot a marathon.'}
        subtitle="Newborn care is a shared journey. BabyMinimo helps your family stay perfectly in sync."
        step="Step 4 of 9"
        progress={0.44}
        onBack={() => router.back()}
      >
        <View style={styles.problems}>
          {problems.map((problem, index) => (
            <Card key={index} style={styles.problemCard}>
              <View style={styles.problemIcon}>
                <Text style={styles.problemIconText}>{problem.icon}</Text>
              </View>
              <View style={styles.problemCopy}>
                <Text style={styles.problemTitle}>{problem.title}</Text>
                <Text style={styles.problemText}>{problem.body}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          <Button onPress={() => router.push('/(onboarding)/benefits')} style={styles.button}>
            See how it works →
          </Button>
        </View>
      </OnboardingFrame>
    </Screen>
  )
}

const styles = StyleSheet.create({
  problems: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  problemCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xxl,
  },
  problemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemIconText: {
    color: colors.sageText,
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  problemCopy: {
    flex: 1,
  },
  problemTitle: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  problemText: {
    ...typography.body,
    color: colors.inkLight,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
})
