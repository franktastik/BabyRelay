import type { BabyMinimoWidgetPayload, WidgetPayloadState } from './widgetPayload'

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
      ? 'Widgets are off'
      : state === 'signedOut'
        ? 'Sign in needed'
        : state === 'noSelectedBaby'
          ? 'Choose a baby'
          : 'Open the app',
  statusDetail: message,
  statusTone: 'muted',
  lastFeedLabel: 'No feed yet',
  lastDiaperLabel: 'No diaper yet',
  lastSleepLabel: 'No sleep yet',
  dueSoonTitle: 'Nothing due',
  dueSoonDetail: 'You are caught up.',
  lastUpdatedLabel: 'Not synced',
  message,
})

const shortTime = (iso: string | null) => {
  if (!iso) {
    return 'recently'
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'recently'
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const statusLabel = (payload: BabyMinimoWidgetPayload) => {
  if (!payload.baby) {
    return 'Open BabyMinimo'
  }

  if (payload.state === 'expired') {
    return 'Open BabyMinimo'
  }

  if (payload.state === 'stale') {
    return 'May be out of date'
  }

  if (payload.state === 'empty') {
    return 'No care events yet'
  }

  if (payload.baby.currentStatus === 'sleeping') {
    return 'Currently sleeping'
  }

  if (payload.baby.currentStatus === 'awake') {
    return 'Currently awake'
  }

  return payload.baby.dueSoon ? 'Due soon' : 'Latest snapshot'
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
      return 'LIVE'
    case 'stale':
      return 'STALE'
    case 'expired':
      return 'REFRESH'
    case 'empty':
      return 'EMPTY'
    case 'signedOut':
      return 'SIGN IN'
    case 'noSelectedBaby':
      return 'SETUP'
    case 'disabled':
      return 'OFF'
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
    statusDetail: payload.message ?? `Updated ${shortTime(payload.lastSyncedAt)}`,
    statusTone: statusTone(payload),
    lastFeedLabel: payload.baby.lastFeed?.label ?? 'No feed yet',
    lastDiaperLabel: payload.baby.lastDiaper?.label ?? 'No diaper yet',
    lastSleepLabel: payload.baby.lastSleep?.label ?? 'No sleep yet',
    dueSoonTitle: payload.baby.dueSoon?.title ?? 'Nothing due',
    dueSoonDetail: payload.baby.dueSoon?.dueLabel ?? 'You are caught up.',
    lastUpdatedLabel: `Updated ${shortTime(payload.lastSyncedAt)}`,
    message: payload.message ?? '',
  }
}
