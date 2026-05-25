import type { BabyMinimoWidgetPayload, WidgetPayloadState } from './widgetPayload'
import { babyMinimoI18n } from '@/src/localization'

export const BABY_MINIMO_CURRENT_STATE_WIDGET_NAME = 'BabyMinimoCurrentStateWidget'

export type BabyMinimoCurrentStateWidgetTone = 'sage' | 'clay' | 'muted'

export interface BabyMinimoCurrentStateWidgetProps {
  state: WidgetPayloadState
  babyName: string
  stateBadgeLabel: string
  statusLabel: string
  statusDetail: string
  statusTone: BabyMinimoCurrentStateWidgetTone
  lastFeedLabel: string
  lastDiaperLabel: string
  lastSleepLabel: string
  dueSoonTitle: string
  dueSoonDetail: string
  lastUpdatedLabel: string
  message: string
}

const fallbackProps = (
  state: WidgetPayloadState,
  message: string
): BabyMinimoCurrentStateWidgetProps => ({
  state,
  stateBadgeLabel: stateBadgeLabel(state),
  babyName: 'BabyMinimo',
  statusLabel:
    state === 'disabled'
      ? babyMinimoI18n.t('widgets.currentState.widgetsOff')
      : state === 'signedOut'
        ? babyMinimoI18n.t('widgets.currentState.signInNeeded')
        : state === 'noSelectedBaby'
          ? babyMinimoI18n.t('widgets.currentState.chooseBaby')
          : babyMinimoI18n.t('widgets.currentState.openApp'),
  statusDetail: message,
  statusTone: 'muted',
  lastFeedLabel: babyMinimoI18n.t('widgets.currentState.noFeed'),
  lastDiaperLabel: babyMinimoI18n.t('widgets.currentState.noDiaper'),
  lastSleepLabel: babyMinimoI18n.t('widgets.currentState.noSleep'),
  dueSoonTitle: babyMinimoI18n.t('widgets.currentState.nothingDue'),
  dueSoonDetail: babyMinimoI18n.t('widgets.currentState.caughtUp'),
  lastUpdatedLabel: babyMinimoI18n.t('widgets.currentState.notSynced'),
  message,
})

const shortTime = (iso: string | null) => {
  if (!iso) {
    return babyMinimoI18n.t('widgets.clear.recently')
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return babyMinimoI18n.t('widgets.clear.recently')
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const statusLabel = (payload: BabyMinimoWidgetPayload) => {
  if (!payload.baby) {
    return babyMinimoI18n.t('widgets.currentState.openBabyMinimo')
  }

  if (payload.state === 'expired') {
    return babyMinimoI18n.t('widgets.currentState.openBabyMinimo')
  }

  if (payload.state === 'stale') {
    return babyMinimoI18n.t('widgets.currentState.stale')
  }

  if (payload.state === 'empty') {
    return babyMinimoI18n.t('widgets.currentState.empty')
  }

  if (payload.baby.currentStatus === 'sleeping') {
    return babyMinimoI18n.t('widgets.currentState.sleeping')
  }

  if (payload.baby.currentStatus === 'awake') {
    return babyMinimoI18n.t('widgets.currentState.awake')
  }

  return payload.baby.dueSoon
    ? babyMinimoI18n.t('widgets.currentState.dueSoon')
    : babyMinimoI18n.t('widgets.currentState.latestSnapshot')
}

const statusTone = (payload: BabyMinimoWidgetPayload): BabyMinimoCurrentStateWidgetTone => {
  if (payload.state === 'stale' || payload.state === 'expired') {
    return 'clay'
  }

  if (payload.baby?.currentStatus === 'sleeping') {
    return 'sage'
  }

  return payload.baby?.dueSoon ? 'clay' : 'sage'
}

const stateBadgeLabel = (state: WidgetPayloadState) => {
  switch (state) {
    case 'ready':
      return babyMinimoI18n.t('widgets.badge.live')
    case 'stale':
      return babyMinimoI18n.t('widgets.badge.stale')
    case 'expired':
      return babyMinimoI18n.t('widgets.badge.refresh')
    case 'empty':
      return babyMinimoI18n.t('widgets.badge.empty')
    case 'signedOut':
      return babyMinimoI18n.t('widgets.badge.signIn')
    case 'noSelectedBaby':
      return babyMinimoI18n.t('widgets.badge.setup')
    case 'disabled':
      return babyMinimoI18n.t('widgets.badge.off')
  }
}

export const mapWidgetPayloadToCurrentStateWidgetProps = (
  payload: BabyMinimoWidgetPayload
): BabyMinimoCurrentStateWidgetProps => {
  if (
    payload.state === 'signedOut' ||
    payload.state === 'disabled' ||
    payload.state === 'noSelectedBaby'
  ) {
    return fallbackProps(payload.state, payload.message)
  }

  return {
    state: payload.state,
    stateBadgeLabel: stateBadgeLabel(payload.state),
    babyName: payload.baby.babyName,
    statusLabel: statusLabel(payload),
    statusDetail: payload.message ?? babyMinimoI18n.t('widgets.currentState.updated', { time: shortTime(payload.lastSyncedAt) }),
    statusTone: statusTone(payload),
    lastFeedLabel: payload.baby.lastFeed?.label ?? babyMinimoI18n.t('widgets.currentState.noFeed'),
    lastDiaperLabel: payload.baby.lastDiaper?.label ?? babyMinimoI18n.t('widgets.currentState.noDiaper'),
    lastSleepLabel: payload.baby.lastSleep?.label ?? babyMinimoI18n.t('widgets.currentState.noSleep'),
    dueSoonTitle: payload.baby.dueSoon?.title ?? babyMinimoI18n.t('widgets.currentState.nothingDue'),
    dueSoonDetail: payload.baby.dueSoon?.dueLabel ?? babyMinimoI18n.t('widgets.currentState.caughtUp'),
    lastUpdatedLabel: babyMinimoI18n.t('widgets.currentState.updated', { time: shortTime(payload.lastSyncedAt) }),
    message: payload.message ?? '',
  }
}
