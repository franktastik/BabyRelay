import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Bell, Plus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Screen } from '@/src/components/ui'
import { SettingsHeader } from '@/src/components/settings'
import { AppStateView } from '@/src/components/states'
import { trackEvent } from '@/src/features/analytics'
import { demoReminders, type DemoReminder } from '@/src/features/demo/reminders'
import {
  cancelBabyMinimoReminderNotification,
  getBabyMinimoNotificationPermissionState,
  requestBabyMinimoNotificationPermissions,
  scheduleBabyMinimoReminderNotification,
  type BabyMinimoNotificationPermissionState,
} from '@/src/features/notifications'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function RemindersScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [reminders, setReminders] = useState(demoReminders)
  const [title, setTitle] = useState('')
  const [permissionState, setPermissionState] =
    useState<BabyMinimoNotificationPermissionState>('notAsked')
  const [notificationMessage, setNotificationMessage] = useState(
    t('reminders.notifications.demo')
  )

  useEffect(() => {
    getBabyMinimoNotificationPermissionState()
      .then(setPermissionState)
      .catch(() => setPermissionState('denied'))
  }, [])

  const requestPermissions = async () => {
    const nextState = await requestBabyMinimoNotificationPermissions()
    setPermissionState(nextState)
    setNotificationMessage(
      nextState === 'granted' || nextState === 'limited'
        ? t('reminders.notifications.enabledMessage')
        : t('reminders.notifications.offMessage')
    )
  }

  const scheduleReminder = async (reminder: DemoReminder) => {
    const result = await scheduleBabyMinimoReminderNotification({
      id: reminder.id,
      title: reminder.title,
      category: reminder.category,
      dueAt: reminder.dueAt,
      critical: false,
    })

    setPermissionState(result.permissionState)
    setReminders((current) =>
      current.map((item) =>
        item.id === reminder.id
          ? {
              ...item,
              scheduledNotificationId: result.notificationId,
              delayedForQuietHours: result.delayedForQuietHours,
            }
          : item
      )
    )
    setNotificationMessage(
      result.notificationId
        ? result.delayedForQuietHours
          ? t('reminders.notifications.afterQuietHours')
          : t('reminders.notifications.scheduled')
        : t('reminders.notifications.savedNoPermission')
    )
  }

  const addReminder = async () => {
    if (!title.trim()) return
    const dueAt = new Date()
    dueAt.setDate(dueAt.getDate() + 1)
    dueAt.setHours(8, 0, 0, 0)

    const reminder: DemoReminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      detail: t('reminders.customDetail'),
      dueLabel: t('reminders.customDue'),
      dueAt,
      active: true,
      category: 'custom',
    }
    setReminders((current) => [reminder, ...current])
    trackEvent('reminder_created', {
      reminderId: reminder.id,
      category: reminder.category,
    })
    setTitle('')
    await scheduleReminder(reminder)
  }

  const toggleReminder = async (reminder: DemoReminder) => {
    if (reminder.active) {
      await cancelBabyMinimoReminderNotification(reminder.scheduledNotificationId)
      setReminders((current) =>
        current.map((item) =>
          item.id === reminder.id
            ? { ...item, active: false, scheduledNotificationId: null, delayedForQuietHours: false }
            : item
        )
      )
      setNotificationMessage(t('reminders.notifications.canceled'))
      return
    }

    const nextReminder = { ...reminder, active: true }
    setReminders((current) =>
      current.map((item) => (item.id === reminder.id ? nextReminder : item))
    )
    await scheduleReminder(nextReminder)
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title={t('reminders.title')} onBack={() => router.back()} rightIcon="none" />

        <View style={styles.addCard}>
          <View style={styles.addIcon}>
            <Plus color={colors.white} size={22} strokeWidth={2.6} />
          </View>
          <View style={styles.addCopy}>
            <Text style={styles.addTitle}>{t('reminders.add.title')}</Text>
            <Text style={styles.addSubtitle}>{t('reminders.add.subtitle')}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('reminders.input.placeholder')}
            placeholderTextColor={colors.mutedLight}
            style={styles.input}
          />
          <Pressable onPress={addReminder} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t('reminders.create')}</Text>
          </Pressable>
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionCopy}>
            <Text style={styles.permissionTitle}>{t('reminders.notifications.title')}</Text>
            <Text style={styles.permissionDetail}>{notificationMessage}</Text>
          </View>
          <Pressable onPress={requestPermissions} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>
              {permissionState === 'granted' || permissionState === 'limited' ? t('reminders.notifications.enabled') : t('reminders.notifications.enable')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>{t('reminders.section.active')}</Text>
          <Text style={styles.sectionMeta}>{t('reminders.section.total', { count: reminders.length })}</Text>
        </View>

        {reminders.length === 0 ? (
          <AppStateView
            tone="empty"
            title={t('reminders.empty.title')}
            copy={t('reminders.empty.copy')}
            actionLabel={t('reminders.empty.action')}
          />
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={[styles.reminderRow, !reminder.active && styles.reminderDisabled]}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeText}>{reminder.dueLabel.split(' ')[0]}</Text>
                <Text style={styles.timeMeta}>{reminder.dueLabel.replace(reminder.dueLabel.split(' ')[0], '').trim() || t('common.daily')}</Text>
              </View>
              <View style={styles.reminderIcon}>
                <Bell color={colors.sageText} size={17} strokeWidth={2.1} />
              </View>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderDetail}>
                  {reminder.delayedForQuietHours
                    ? `${reminder.detail} · ${t('reminders.afterQuietHours')}`
                    : reminder.detail}
                </Text>
              </View>
              <Switch
                value={reminder.active}
                trackColor={{ false: colors.border, true: colors.sage }}
                thumbColor={colors.white}
                onValueChange={() => toggleReminder(reminder)}
              />
            </View>
          ))
        )}
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
  addCard: {
    minHeight: 74,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.md,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCopy: {
    flex: 1,
  },
  addTitle: {
    ...typography.action,
    color: colors.ink,
  },
  addSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  formCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.ink,
    marginBottom: spacing.base,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.action,
    color: colors.white,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  sectionMeta: {
    ...typography.label,
    color: colors.muted,
  },
  permissionCard: {
    minHeight: 74,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  permissionCopy: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.action,
    color: colors.ink,
  },
  permissionDetail: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  permissionButton: {
    minHeight: 36,
    minWidth: 84,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  permissionButtonText: {
    ...typography.label,
    color: colors.white,
    textTransform: 'uppercase',
  },
  reminderRow: {
    minHeight: 74,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.md,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  reminderDisabled: {
    opacity: 0.45,
  },
  timeBlock: {
    width: 48,
  },
  timeText: {
    ...typography.action,
    color: colors.ink,
  },
  timeMeta: {
    ...typography.label,
    color: colors.muted,
  },
  reminderIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCopy: {
    flex: 1,
  },
  reminderTitle: {
    ...typography.action,
    color: colors.ink,
  },
  reminderDetail: {
    ...typography.bodySmall,
    color: colors.muted,
  },
})
