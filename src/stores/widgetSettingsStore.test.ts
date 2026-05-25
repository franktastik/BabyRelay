import { describe, expect, test } from 'bun:test'
import { useWidgetSettingsStore } from './widgetSettingsStore'

describe('widget settings store', () => {
  test('tracks local widget visibility and clear state', () => {
    useWidgetSettingsStore.getState().resetWidgetSettings()

    expect(useWidgetSettingsStore.getState().widgetSnapshotsEnabled).toBe(true)
    expect(useWidgetSettingsStore.getState().lastClearedAt).toBeNull()

    useWidgetSettingsStore.getState().setWidgetSnapshotsEnabled(false)
    useWidgetSettingsStore
      .getState()
      .markWidgetSnapshotCleared(new Date('2026-05-24T12:00:00.000Z'))

    expect(useWidgetSettingsStore.getState().widgetSnapshotsEnabled).toBe(false)
    expect(useWidgetSettingsStore.getState().lastClearedAt).toBe('2026-05-24T12:00:00.000Z')
  })
})
