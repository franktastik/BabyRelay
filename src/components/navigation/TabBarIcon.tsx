import { View, StyleSheet, Text } from 'react-native'
import { colors, shadows } from '@/src/theme'

export type BabyMinimoTabIconName = 'home' | 'handoff' | 'log' | 'timeline' | 'family' | 'settings'

interface TabBarIconProps {
  name: BabyMinimoTabIconName
  color: string
  focused?: boolean
}

const icons: Record<BabyMinimoTabIconName, string> = {
  home: '⌂',
  handoff: '⇄',
  log: '+',
  timeline: '◷',
  family: '♙',
  settings: '⚙',
}

export function TabBarIcon({ name, color, focused = false }: TabBarIconProps) {
  const icon = icons[name]

  if (name === 'log') {
    return (
      <View style={styles.logButton}>
        <Text style={styles.logText}>{icon}</Text>
      </View>
    )
  }

  return <Text style={[styles.iconText, { color: focused ? colors.sageText : color }]}>{icon}</Text>
}

const styles = StyleSheet.create({
  logButton: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    marginTop: -20,
    ...shadows.md,
  },
  logText: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 36,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  iconText: {
    fontSize: 23,
    lineHeight: 24,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
