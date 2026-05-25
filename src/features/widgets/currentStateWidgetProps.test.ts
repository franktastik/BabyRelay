import { describe, expect, test } from 'bun:test'
import type { DemoHandoffSummary } from '@/src/features/demo/handoff'
import {
  buildBabyMinimoWidgetPayload,
  WIDGET_STALE_AFTER_MS,
} from './widgetPayload'
import { mapWidgetPayloadToCurrentStateWidgetProps } from './currentStateWidgetProps'

const now = new Date('2026-05-24T12:00:00.000Z')

const handoffSummary: DemoHandoffSummary = {
  babyName: 'Leo',
  lastFeed: {
    label: '4.5 oz',
    time: new Date('2026-05-24T10:45:00.000Z'),
    by: 'Sarah',
  },
  lastDiaper: {
    label: 'Wet',
    time: new Date('2026-05-24T11:15:00.000Z'),
    by: 'David',
  },
  lastSleep: {
    label: '1h 12m',
    time: new Date('2026-05-24T11:30:00.000Z'),
    status: 'sleeping',
    startedAt: new Date('2026-05-24T10:48:00.000Z'),
  },
  nextMedication: null,
  latestNote: null,
  lastActionBy: 'Sarah',
}

describe('current-state widget props', () => {
  test('maps ready payloads to small and medium widget copy', () => {
    const payload = buildBabyMinimoWidgetPayload({
      signedIn: true,
      selectedBabyId: 'baby-1',
      handoffSummary,
      generatedAt: now,
      lastSyncedAt: new Date('2026-05-24T11:55:00.000Z'),
    })

    const props = mapWidgetPayloadToCurrentStateWidgetProps(payload)

    expect(props.babyName).toBe('Leo')
    expect(props.stateBadgeLabel).toBe('LIVE')
    expect(props.statusLabel).toBe('Currently sleeping')
    expect(props.statusTone).toBe('sage')
    expect(props.lastFeedLabel).toBe('4.5 oz')
    expect(props.lastDiaperLabel).toBe('Wet')
    expect(props.lastSleepLabel).toBe('1h 12m')
    expect(props.dueSoonTitle).toBe('Nothing due')
    expect(props.lastUpdatedLabel).toBe('Updated 11:55 AM')
  })

  test('maps signed-out and no-baby states to safe fallback copy', () => {
    const signedOut = mapWidgetPayloadToCurrentStateWidgetProps(
      buildBabyMinimoWidgetPayload({
        signedIn: false,
        selectedBabyId: 'baby-1',
        generatedAt: now,
      })
    )

    const noBaby = mapWidgetPayloadToCurrentStateWidgetProps(
      buildBabyMinimoWidgetPayload({
        signedIn: true,
        selectedBabyId: null,
        generatedAt: now,
      })
    )

    expect(signedOut.babyName).toBe('BabyMinimo')
    expect(signedOut.stateBadgeLabel).toBe('SIGN IN')
    expect(signedOut.statusLabel).toBe('Sign in needed')
    expect(signedOut.statusDetail).toContain('Sign in')
    expect(signedOut.message).toContain('Sign in')
    expect(noBaby.stateBadgeLabel).toBe('SETUP')
    expect(noBaby.statusLabel).toBe('Choose a baby')
    expect(noBaby.statusDetail).toContain('Choose a baby')
    expect(noBaby.message).toContain('Choose a baby')
  })

  test('maps disabled widget updates to blank safe copy', () => {
    const props = mapWidgetPayloadToCurrentStateWidgetProps(
      buildBabyMinimoWidgetPayload({
        signedIn: true,
        widgetUpdatesEnabled: false,
        selectedBabyId: 'baby-1',
        generatedAt: now,
      })
    )

    expect(props.state).toBe('disabled')
    expect(props.babyName).toBe('BabyMinimo')
    expect(props.stateBadgeLabel).toBe('OFF')
    expect(props.statusLabel).toBe('Widgets are off')
    expect(props.statusDetail).toBe('Widget updates are off on this device.')
    expect(props.message).toBe('Widget updates are off on this device.')
  })

  test('uses clay tone for stale snapshots without exposing private data', () => {
    const payload = buildBabyMinimoWidgetPayload({
      signedIn: true,
      selectedBabyId: 'baby-1',
      handoffSummary,
      generatedAt: now,
      lastSyncedAt: new Date(now.getTime() - WIDGET_STALE_AFTER_MS - 1),
    })

    const props = mapWidgetPayloadToCurrentStateWidgetProps(payload)

    expect(props.state).toBe('stale')
    expect(props.stateBadgeLabel).toBe('STALE')
    expect(props.statusLabel).toBe('May be out of date')
    expect(props.statusTone).toBe('clay')
    expect(JSON.stringify(props)).not.toContain('latestNote')
    expect(JSON.stringify(props)).not.toContain('household')
  })
})
