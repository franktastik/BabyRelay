import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Check, Crown } from 'lucide-react-native'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { trackEvent } from '@/src/features/analytics'
import { demoPlans, type DemoPlan } from '@/src/features/demo/plans'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function PlansScreen() {
  const router = useRouter()

  useEffect(() => {
    trackEvent('plan_screen_viewed')
  }, [])

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title="Choose Your Plan" onBack={() => router.back()} rightIcon="none" />
        <Text style={styles.subcopy}>
          Support your household with the tools needed for seamless care coordination.
        </Text>
        {demoPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </ScrollView>
    </Screen>
  )
}

function PlanCard({ plan }: { plan: DemoPlan }) {
  const highlighted = plan.id === 'premium'
  const family = plan.id === 'family'

  return (
    <View style={[styles.card, highlighted && styles.highlightCard, family && styles.familyCard]}>
      {plan.recommended ? <Text style={styles.recommended}>{plan.recommended}</Text> : null}
      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planCaption}>
            {family ? 'Household coordination plan' : highlighted ? 'Perfect for mom + partner' : 'The basics for new parents'}
          </Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.cadence}>{plan.cadence}</Text>
        </View>
      </View>

      <View style={styles.features}>
        {plan.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            {highlighted || family ? (
              <Crown color={family ? colors.gold : colors.sageText} size={15} strokeWidth={2.1} />
            ) : (
              <Check color={colors.sageText} size={16} strokeWidth={2.2} />
            )}
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.planButton, highlighted && styles.planButtonPrimary]}>
        <Text style={[styles.planButtonText, highlighted && styles.planButtonTextPrimary]}>
          {plan.id === 'free' ? 'Current Plan' : plan.id === 'family' ? 'Review Family' : 'Start Premium'}
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
    paddingBottom: 112,
  },
  subcopy: {
    ...typography.bodySmall,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  highlightCard: {
    borderColor: colors.sage,
  },
  familyCard: {
    borderColor: colors.gold,
  },
  recommended: {
    alignSelf: 'center',
    ...typography.label,
    color: colors.white,
    backgroundColor: colors.sage,
    borderRadius: radius.full,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: -spacing.xl,
    marginBottom: spacing.base,
    textTransform: 'uppercase',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.base,
    marginBottom: spacing.md,
  },
  planName: {
    ...typography.h3,
    color: colors.ink,
  },
  planCaption: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.h2,
    color: colors.ink,
  },
  cadence: {
    ...typography.label,
    color: colors.muted,
  },
  features: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.inkLight,
    flex: 1,
  },
  planButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planButtonPrimary: {
    backgroundColor: colors.clay,
  },
  planButtonText: {
    ...typography.action,
    color: colors.stoneText,
  },
  planButtonTextPrimary: {
    color: colors.white,
  },
})
