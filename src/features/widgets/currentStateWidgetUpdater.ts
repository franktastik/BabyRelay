import { Platform } from 'react-native'
import type { BabyMinimoWidgetPayload, BuildWidgetPayloadInput } from './widgetPayload'
import { buildBabyMinimoWidgetPayload } from './widgetPayload'
import { mapWidgetPayloadToCurrentStateWidgetProps } from './currentStateWidgetProps'
import {
  clearBabyMinimoWidgetSnapshot,
  defaultWidgetSnapshotStorage,
  writeBabyMinimoWidgetSnapshot,
  type WidgetSnapshotStorage,
} from './widgetSnapshotStore'

export type BabyMinimoWidgetUpdateResult =
  | { status: 'updated' }
  | { status: 'skipped'; reason: 'unsupported-platform' | 'native-widget-unavailable' }

export const updateBabyMinimoCurrentStateWidget = async (
  payload: BabyMinimoWidgetPayload
): Promise<BabyMinimoWidgetUpdateResult> => {
  if (Platform.OS !== 'ios') {
    return { status: 'skipped', reason: 'unsupported-platform' }
  }

  if (process.env.EXPO_PUBLIC_ENABLE_NATIVE_WIDGETS !== 'true') {
    return { status: 'skipped', reason: 'native-widget-unavailable' }
  }

  try {
    const widgetModule = await import('@/src/widgets/BabyMinimoCurrentStateWidget')
    widgetModule.default.updateSnapshot(mapWidgetPayloadToCurrentStateWidgetProps(payload))
    return { status: 'updated' }
  } catch {
    return { status: 'skipped', reason: 'native-widget-unavailable' }
  }
}

export const writeAndUpdateBabyMinimoCurrentStateWidget = async (
  input: BuildWidgetPayloadInput,
  storage: WidgetSnapshotStorage = defaultWidgetSnapshotStorage
) => {
  const payload = await writeBabyMinimoWidgetSnapshot(input, storage)
  const widgetUpdate = await updateBabyMinimoCurrentStateWidget(payload)

  return { payload, widgetUpdate }
}

export const clearAndBlankBabyMinimoCurrentStateWidget = async (
  storage: WidgetSnapshotStorage = defaultWidgetSnapshotStorage
) => {
  await clearBabyMinimoWidgetSnapshot(storage)

  const payload = buildBabyMinimoWidgetPayload({
    signedIn: true,
    widgetUpdatesEnabled: false,
    selectedBabyId: null,
    source: 'localDemo',
    surface: 'homeScreen',
  })
  const widgetUpdate = await updateBabyMinimoCurrentStateWidget(payload)

  return { payload, widgetUpdate }
}
