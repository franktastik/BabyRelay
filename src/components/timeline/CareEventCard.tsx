import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import type { DemoCareEvent } from '@/src/features/demo/events'
import { relativeTime } from '@/src/relative-time'

const typeIcons: Record<DemoCareEvent['type'], string> = {
  breastfeed: '⌁',
  bottle: '⌁',
  diaper: '♧',
  sleep: '☾',
  medication: '◇',
}

const typeLabelKeys: Record<DemoCareEvent['type'], string> = {
  breastfeed: 'timeline.care.breastfeed',
  bottle: 'timeline.care.bottle',
  diaper: 'timeline.care.diaper',
  sleep: 'timeline.care.sleep',
  medication: 'timeline.care.medication',
}

interface CareEventCardProps {
  event: DemoCareEvent
}

export function CareEventCard({ event }: CareEventCardProps) {
  const { t } = useTranslation()
  const detail = getEventDetail(event, t)

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconShell}>
          <Text style={styles.icon}>{typeIcons[event.type]}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {getEventTitle(event, t)}
          </Text>
          {detail && <Text style={styles.detail}>{detail}</Text>}
          <Text style={styles.meta}>{relativeTime(event.occurredAt)}</Text>
        </View>
      </View>
    </View>
  )
}

function getEventDetail(event: DemoCareEvent, t: (key: string, options?: Record<string, unknown>) => string): string | null {
  const { type, metadata } = event
  if (type === 'breastfeed') {
    const side = metadata.side as string | undefined
    const duration = metadata.durationMin as number | undefined
    const parts: string[] = []
    if (side) parts.push(t('timeline.care.side', { side: capitalize(side) }))
    if (duration) parts.push(t('timeline.care.durationMinutes', { duration }))
    return parts.length > 0 ? parts.join(' · ') : t('timeline.care.nursingSession')
  }
  if (type === 'bottle') {
    const amountOz = metadata.amountOz as number | undefined
    const amountMl = metadata.amountMl as number | undefined
    const milkType = metadata.milkType as string | undefined
    const parts: string[] = []
    if (amountOz) parts.push(`${amountOz} oz`)
    else if (amountMl) parts.push(`${amountMl} ml`)
    if (milkType) parts.push(capitalize(milkType))
    return parts.length > 0 ? parts.join(' · ') : null
  }
  if (type === 'diaper') {
    const kind = metadata.kind as string | undefined
    return kind ? capitalize(kind) : null
  }
  if (type === 'sleep') {
    const duration = metadata.durationMin as number | undefined
    const state = metadata.state as string | undefined
    const parts: string[] = []
    if (duration) parts.push(`${duration} min`)
    if (state) parts.push(capitalize(state))
    return parts.length > 0 ? parts.join(' · ') : null
  }
  if (type === 'medication') {
    const name = metadata.name as string | undefined
    const dose = metadata.dose as string | undefined
    const parts: string[] = []
    if (name) parts.push(name)
    if (dose) parts.push(dose)
    return parts.length > 0 ? parts.join(' · ') : null
  }
  return null
}

function getEventTitle(event: DemoCareEvent, t: (key: string, options?: Record<string, unknown>) => string) {
  if (event.type === 'breastfeed') {
    return t('timeline.care.breastfeedTitle', { caregiver: event.createdBy })
  }

  return t('timeline.care.loggedTitle', {
    caregiver: event.createdBy,
    eventType: t(typeLabelKeys[event.type]).toLowerCase(),
  })
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.base,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.sageText,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.action,
    color: colors.ink,
  },
  detail: {
    ...typography.bodySmall,
    color: colors.inkLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.label,
    color: colors.muted,
    marginTop: spacing.xs,
  },
})
