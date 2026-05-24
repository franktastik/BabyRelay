import { Tabs } from 'expo-router'
import { FloatingTabBar } from '@/src/components/navigation'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          tabBarLabel: 'Timeline',
        }}
      />
      <Tabs.Screen
        name="handoff"
        options={{
          title: 'Handoff',
          tabBarLabel: 'Handoff',
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarLabel: 'Family',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          href: null,
        }}
      />
    </Tabs>
  )
}
