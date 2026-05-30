import { describe, expect, test } from 'bun:test'
import type { DemoHandoffSummary } from '@/src/features/demo/handoff'
import type { DemoReminder } from '@/src/features/demo/reminders'
import {
  BABY_MINIMO_WIDGET_SCHEMA_VERSION,
  WIDGET_STALE_AFTER_MS,
  buildBabyMinimoWidgetPayload,
  widgetPayloadToJson,
} from './widgetPayload'
import {
  BABY_MINIMO_WIDGET_SNAPSHOT_KEY,
  createInMemoryWidgetSnapshotStorage,
  readBabyMinimoWidgetSnapshot,
  writeBabyMinimoWidgetSnapshot,
} from './widgetSnapshotStore'

const now = new Date('2026-05-24T12:00:00.000Z')
const recentSync = new Date('2026-05-24T11:55:00.000Z')

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
  nextMedication: {
    label: 'Vitamin D Drops',
    dueAt: new Date('2026-05-24T13:00:00.000Z'),
  },
  latestNote: {
    content: 'Private caregiver note should never leave the app.',
    time: new Date('2026-05-24T11:45:00.000Z'),
    by: 'Sarah',
  },
  lastActionBy: 'Sarah',
}

const reminders: DemoReminder[] = [
  {
    id: 'rem-1',
    babyId: 'baby-1',
    title: 'Vitamin D Drops',
    detail: 'Private detail should not be in widget payload.',
    dueLabel: 'in 45 min',
    dueAt: new Date('2026-05-24T12:45:00.000Z'),
    active: true,
    category: 'medication',
    scheduledNotificationId: 'local-notification-id',
  },
]

describe('BabyMinimo widget payload', () => {
  test('builds a ready, serializable, caregiver-safe widget payload', () => {
    const payload = buildBabyMinimoWidgetPayload({
      signedIn: true,
      selectedBabyId: 'baby-1',
      handoffSummary,
      reminders,
      generatedAt: now,
      lastSyncedAt: recentSync,
    })

    expect(payload.schemaVersion).toBe(BABY_MINIMO_WIDGET_SCHEMA_VERSION)
    expect(payload.state).toBe('ready')
    expect(payload.lastSyncedAt).toBe('2026-05-24T11:55:00.000Z')
    expect(payload.expiresAt).toBe('2026-05-24T15:55:00.000Z')
    expect(payload.baby?.babyName).toBe('Leo')
    expect(payload.baby?.currentStatus).toBe('sleeping')
    expect(payload.baby?.lastFeed?.label).toBe('4.5 oz')
    expect(payload.baby?.lastDiaper?.label).toBe('Wet')
    expect(payload.baby?.lastSleep?.startedAt).toBe('2026-05-24T10:48:00.000Z')
    expect(payload.baby?.dueSoon?.title).toBe('Vitamin D Drops')

    const json = widgetPayloadToJson(payload)
    expect(json).not.toContain('Private caregiver note')
    expect(json).not.toContain('Private detail')
    expect(json).not.toContain('scheduledNotificationId')
    expect(json).not.toContain('localImageUri')
    expect(json).not.toContain('household')
  })

  test('returns signed-out and no-selected-baby states', () => {
    expect(
      buildBabyMinimoWidgetPayload({
        signedIn: false,
        selectedBabyId: 'baby-1',
        generatedAt: now,
      }).state
    ).toBe('signedOut')

    expect(
      buildBabyMinimoWidgetPayload({
        signedIn: true,
        selectedBabyId: null,
        generatedAt: now,
      }).state
    ).toBe('noSelectedBaby')
  })

  test('defines empty, stale, and expired widget states', () => {
    const empty = buildBabyMinimoWidgetPayload({
      signedIn: true,
      selectedBabyId: 'baby-1',
      generatedAt: now,
      lastSyncedAt: now,
    })

    expect(empty.state).toBe('empty')
    expect(empty.baby?.lastFeed).toBeNull()
    expect(empty.baby?.dueSoon).toBeNull()

    const stale = buildBabyMinimoWidgetPayload({
      signedIn: true,
      selectedBabyId: 'baby-1',
      handoffSummary,
      generatedAt: now,
      lastSyncedAt: new Date(now.getTime() - WIDGET_STALE_AFTER_MS - 1),
    })

    expect(stale.state).toBe('stale')
    if (stale.baby) {
      expect(stale.staleSince).toBe('2026-05-24T11:59:59.999Z')
    }

    const expired = buildBabyMinimoWidgetPayload({
      signedIn: true,
      selectedBabyId: 'baby-1',
      handoffSummary,
      generatedAt: now,
      lastSyncedAt: new Date('2026-05-24T07:30:00.000Z'),
    })

    expect(expired.state).toBe('expired')
    expect(expired.message).toBe('Open BabyMinimo to refresh.')
  })

  test('writes and reads a local widget snapshot through the storage adapter', async () => {
    const storage = createInMemoryWidgetSnapshotStorage()
    const payload = await writeBabyMinimoWidgetSnapshot(
      {
        signedIn: true,
        selectedBabyId: 'baby-1',
        handoffSummary,
        reminders,
        generatedAt: now,
        lastSyncedAt: recentSync,
      },
      storage
    )

    const raw = await storage.read(BABY_MINIMO_WIDGET_SNAPSHOT_KEY)
    const saved = await readBabyMinimoWidgetSnapshot(storage)

    expect(raw).toBeString()
    expect(saved).toEqual(payload)
  })
})
