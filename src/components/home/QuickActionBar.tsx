import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, typography, spacing, radius } from '@/src/theme'

interface QuickAction {
  id: string
  label: string
  icon: string
  route?: string
}

const actions: QuickAction[] = [
  { id: 'feed', label: 'Feed', icon: '🍼', route: '/modals/quick-log' },
  { id: 'diaper', label: 'Diaper', icon: '🧷', route: '/modals/log-diaper' },
  { id: 'sleep', label: 'Sleep', icon: '☾', route: '/modals/quick-log' },
  { id: 'more', label: 'More', icon: '+', route: '/modals/quick-log' },
]

export function QuickActionBar() {
  const router = useRouter()

  const handleAction = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route as any)
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Quick actions</Text>

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
            <Text style={styles.actionLabel}>{action.label}</Text>
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
