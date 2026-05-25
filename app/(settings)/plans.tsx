import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Bell,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react-native'
import { Screen } from '@/src/components/ui'
import { trackEvent } from '@/src/features/analytics'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

type PaywallPlanKey = 'annual' | 'monthly' | 'weekly'

interface PaywallPlan {
  key: PaywallPlanKey
  name: string
  price: string
  cadence: string
  detail: string
  badge?: string
  recommended?: boolean
}

const plans: PaywallPlan[] = [
  {
    key: 'annual',
    name: 'Annual',
    price: '$39.99',
    cadence: 'per year',
    detail: 'Best for your first year of shared baby care.',
    badge: 'Save 65%',
    recommended: true,
  },
  {
    key: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    cadence: 'per month',
    detail: 'Flexible access for your care circle.',
  },
  {
    key: 'weekly',
    name: 'Weekly',
    price: '$3.99',
    cadence: 'per week',
    detail: 'Short-term option for testing Premium.',
  },
]

const benefits = [
  { icon: HeartHandshake, text: 'Shared handoff history' },
  { icon: Clock3, text: 'Unlimited care logs' },
  { icon: Bell, text: 'Gentle reminders' },
  { icon: Camera, text: 'Local photo memories' },
  { icon: Users, text: 'Caregiver coordination' },
]

export default function PlansScreen() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlanKey>('annual')
  const [notice, setNotice] = useState<string | null>(null)
  const logoScale = useRef(new Animated.Value(0.96)).current
  const selected = useMemo(() => plans.find((plan) => plan.key === selectedPlan) ?? plans[0], [selectedPlan])

  useEffect(() => {
    trackEvent('plan_screen_viewed')
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 6,
      tension: 42,
      useNativeDriver: true,
    }).start()
  }, [logoScale])

  const showDeferredNotice = (action: string) => {
    setNotice(`${action} will be enabled after StoreKit setup in PBI-055.`)
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Close plans" onPress={() => router.back()} style={styles.closeButton}>
            <X color={colors.muted} size={20} strokeWidth={2.2} />
          </Pressable>
        </View>

        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <Image source={require('../logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Text style={styles.title}>Unlock calm baby care</Text>
        <Text style={styles.subtitle}>
          Keep feeds, sleep, diapers, memories, and handoffs in one shared place.
        </Text>

        <View style={styles.benefits}>
          {benefits.map(({ icon: Icon, text }) => (
            <View key={text} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Icon color={colors.sageText} size={18} strokeWidth={2.1} />
              </View>
              <Text style={styles.benefitText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planGroup}>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.key
            return (
              <Pressable
                accessibilityLabel={`${plan.name} plan, ${plan.price} ${plan.cadence}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                key={plan.key}
                onPress={() => {
                  setSelectedPlan(plan.key)
                  setNotice(null)
                }}
                style={[styles.planRow, isSelected && styles.planRowSelected]}
              >
                <View style={styles.planTextBlock}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.badge ? <Text style={styles.badge}>{plan.badge}</Text> : null}
                    {plan.recommended ? <Text style={styles.recommended}>Best value</Text> : null}
                  </View>
                  <Text style={styles.planDetail}>{plan.detail}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.cadence}>{plan.cadence}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <Check color={colors.white} size={15} strokeWidth={2.6} /> : null}
                </View>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.trialCard}>
          <View style={styles.trialIcon}>
            <ShieldCheck color={colors.sageText} size={18} strokeWidth={2.2} />
          </View>
          <View style={styles.trialTextBlock}>
            <Text style={styles.trialTitle}>Optional 3-day free trial</Text>
            <Text style={styles.trialCopy}>
              Trial display depends on StoreKit eligibility. If unavailable, BabyMinimo shows the direct
              {` ${selected.name.toLowerCase()} renewal terms instead.`}
            </Text>
          </View>
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Pressable
          accessibilityLabel={`Continue with ${selected.name} plan`}
          onPress={() => showDeferredNotice('Purchases')}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>
            {selected.key === 'annual' ? 'Try 3 Days Free' : 'Continue'}
          </Text>
          <ChevronRight color={colors.white} size={18} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.linkRow}>
          <Pressable onPress={() => showDeferredNotice('Restore purchases')} hitSlop={8} style={styles.footerLink}>
            <RotateCcw color={colors.sageText} size={14} strokeWidth={2.2} />
            <Text style={styles.linkText}>Restore</Text>
          </Pressable>
          <Pressable onPress={() => showDeferredNotice('Terms')} hitSlop={8}>
            <Text style={styles.linkText}>Terms</Text>
          </Pressable>
          <Pressable onPress={() => showDeferredNotice('Privacy')} hitSlop={8}>
            <Text style={styles.linkText}>Privacy</Text>
          </Pressable>
        </View>

        <Text style={styles.legal}>
          Prices shown are planning values for the local demo. Live prices, trials, and renewal terms will come
          from StoreKit for your storefront. Cancel anytime in App Store subscriptions.
        </Text>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 112,
  },
  header: {
    alignItems: 'flex-end',
    minHeight: 44,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  logoWrap: {
    alignSelf: 'center',
    width: 86,
    height: 86,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logo: {
    width: 58,
    height: 58,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkLight,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  benefits: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...typography.action,
    color: colors.ink,
    flex: 1,
  },
  planGroup: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    ...shadows.sm,
  },
  planRowSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  planTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  planName: {
    ...typography.h3,
    color: colors.ink,
  },
  badge: {
    ...typography.label,
    color: colors.white,
    backgroundColor: colors.clay,
    borderRadius: radius.full,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  recommended: {
    ...typography.label,
    color: colors.sageText,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  planDetail: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  priceBlock: {
    alignItems: 'flex-end',
    minWidth: 76,
  },
  price: {
    ...typography.h3,
    color: colors.ink,
  },
  cadence: {
    ...typography.label,
    color: colors.muted,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.sage,
  },
  trialCard: {
    flexDirection: 'row',
    gap: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  trialIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialTextBlock: {
    flex: 1,
  },
  trialTitle: {
    ...typography.action,
    color: colors.ink,
  },
  trialCopy: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
  notice: {
    ...typography.bodySmall,
    color: colors.sageText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cta: {
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  ctaText: {
    ...typography.action,
    color: colors.white,
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkText: {
    ...typography.label,
    color: colors.sageText,
    textDecorationLine: 'underline',
  },
  legal: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
})
