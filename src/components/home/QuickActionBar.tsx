import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { colors, typography, spacing, radius } from '@/src/theme'

interface QuickAction {
  id: string
  labelKey: string
  icon: string
  route?: string
}

const actions: QuickAction[] = [
  { id: 'feed', labelKey: 'home.quickActions.feed', icon: '🍼', route: '/modals/quick-log' },
  { id: 'diaper', labelKey: 'home.quickActions.diaper', icon: '🧷', route: '/modals/log-diaper' },
  { id: 'sleep', labelKey: 'home.quickActions.sleep', icon: '☾', route: '/modals/quick-log' },
  { id: 'more', labelKey: 'home.quickActions.more', icon: '+', route: '/modals/quick-log' },
]

export function QuickActionBar() {
  const router = useRouter()
  const { t } = useTranslation()

  const handleAction = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route as any)
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('home.quickActions.title')}</Text>

      <View style={styles.row}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => handleAction(action)}
            style={styles.action}
          >
            <View style={[styles.iconWrap, action.id === 'more' && styles.moreIconWrap]}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{t(action.labelKey)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.stoneText,
    fontSize: 14,
    lineHeight: 18,
    textTransform: 'none',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    minHeight: 74,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  moreIconWrap: {
    backgroundColor: colors.softClay,
  },
  icon: {
    fontSize: 17,
  },
  actionLabel: {
    ...typography.label,
    color: colors.stoneText,
  },
})
