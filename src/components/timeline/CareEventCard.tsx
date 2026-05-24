import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
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

const typeLabels: Record<DemoCareEvent['type'], string> = {
  breastfeed: 'Breastfeed',
  bottle: 'Bottle',
  diaper: 'Diaper',
  sleep: 'Sleep',
  medication: 'Medication',
}

interface CareEventCardProps {
  event: DemoCareEvent
}

export function CareEventCard({ event }: CareEventCardProps) {
  const detail = getEventDetail(event)

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconShell}>
          <Text style={styles.icon}>{typeIcons[event.type]}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {getEventTitle(event)}
          </Text>
          {detail && <Text style={styles.detail}>{detail}</Text>}
          <Text style={styles.meta}>{relativeTime(event.occurredAt)}</Text>
        </View>
      </View>
    </View>
  )
}

function getEventDetail(event: DemoCareEvent): string | null {
  const { type, metadata } = event
  if (type === 'breastfeed') {
    const side = metadata.side as string | undefined
    const duration = metadata.durationMin as number | undefined
    const parts: string[] = []
    if (side) parts.push(`${capitalize(side)} side`)
    if (duration) parts.push(`${duration} min`)
    return parts.length > 0 ? parts.join(' · ') : 'Nursing session'
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

function getEventTitle(event: DemoCareEvent) {
  if (event.type === 'breastfeed') {
    return `${event.createdBy} fed Leo breastmilk.`
  }

  return `${event.createdBy} logged ${typeLabels[event.type].toLowerCase()}.`
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
