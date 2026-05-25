import {
  buildBabyMinimoWidgetPayload,
  type BabyMinimoWidgetPayload,
  type BuildWidgetPayloadInput,
} from './widgetPayload'

export const BABY_MINIMO_WIDGET_SNAPSHOT_KEY = 'babyminimo.widget.snapshot.v1'

export interface WidgetSnapshotStorage {
  read: (key: string) => Promise<string | null>
  write: (key: string, value: string) => Promise<void>
  remove: (key: string) => Promise<void>
}

export const createInMemoryWidgetSnapshotStorage = (): WidgetSnapshotStorage => {
  const values = new Map<string, string>()

  return {
    read: async (key) => values.get(key) ?? null,
    write: async (key, value) => {
      values.set(key, value)
    },
    remove: async (key) => {
      values.delete(key)
    },
  }
}

export const defaultWidgetSnapshotStorage = createInMemoryWidgetSnapshotStorage()

export const writeBabyMinimoWidgetSnapshot = async (
  input: BuildWidgetPayloadInput,
  storage: WidgetSnapshotStorage = defaultWidgetSnapshotStorage
) => {
  const payload = buildBabyMinimoWidgetPayload(input)
  await storage.write(BABY_MINIMO_WIDGET_SNAPSHOT_KEY, JSON.stringify(payload))
  return payload
}

export const readBabyMinimoWidgetSnapshot = async (
  storage: WidgetSnapshotStorage = defaultWidgetSnapshotStorage
): Promise<BabyMinimoWidgetPayload | null> => {
  const value = await storage.read(BABY_MINIMO_WIDGET_SNAPSHOT_KEY)
  return value ? (JSON.parse(value) as BabyMinimoWidgetPayload) : null
}

export const clearBabyMinimoWidgetSnapshot = async (
  storage: WidgetSnapshotStorage = defaultWidgetSnapshotStorage
) => {
  await storage.remove(BABY_MINIMO_WIDGET_SNAPSHOT_KEY)
}

