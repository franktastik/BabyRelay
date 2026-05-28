import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types'
import { useRouter } from 'expo-router'
import { colors, shadows, spacing, typography } from '@/src/theme'
import { TabBarIcon, type BabyMinimoTabIconName } from './TabBarIcon'

type TabItem = {
  key: string
  label: string
  icon: BabyMinimoTabIconName
  routeName?: string
  onPress?: () => void
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter()
  const focusedRoute = state.routes[state.index]?.name

  const items: TabItem[] = [
    { key: 'home', label: 'Home', icon: 'home', routeName: 'home' },
    { key: 'handoff', label: 'Handoff', icon: 'handoff', routeName: 'handoff' },
    { key: 'log', label: 'Log', icon: 'log', onPress: () => router.push('/modals/quick-log') },
    { key: 'timeline', label: 'Timeline', icon: 'timeline', routeName: 'timeline' },
    { key: 'family', label: 'Family', icon: 'family', routeName: 'family' },
  ]

  const navigateTo = (item: TabItem) => {
    if (item.onPress) {
      item.onPress()
      return
    }
    if (item.routeName) {
      navigation.navigate(item.routeName)
    }
  }

  return (
    <View style={styles.shell}>
      {items.map((item) => {
        const focused = item.routeName === focusedRoute && item.key !== 'family'
        const color = focused ? colors.sageText : colors.muted
        return (
          <Pressable
            key={item.key}
            onPress={() => navigateTo(item)}
            style={[styles.item, item.key === 'log' && styles.logItem]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <TabBarIcon name={item.icon} color={color} focused={focused} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    paddingTop: spacing.base,
    paddingBottom: 22,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    ...shadows.md,
  },
  item: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
  },
  logItem: {
    marginTop: -28,
  },
  label: {
    ...typography.label,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
})
