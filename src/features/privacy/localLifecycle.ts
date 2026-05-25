import { resetAnalyticsEvents } from '@/src/features/analytics'
import { cancelAllBabyMinimoReminderNotifications } from '@/src/features/notifications/nativeNotifications'
import { clearAndBlankBabyMinimoCurrentStateWidget } from '@/src/features/widgets/currentStateWidgetUpdater'
import { useAuthStore } from '@/src/stores/authStore'
import { useCareEventStore } from '@/src/stores/careEventStore'
import { useGrowthTimelineStore } from '@/src/stores/growthTimelineStore'
import { useWidgetSettingsStore } from '@/src/stores/widgetSettingsStore'
import { createBabyMinimoLifecycleCleanup } from './localLifecycleCore'

export {
  createBabyMinimoLifecycleCleanup,
  getBabyMinimoLifecycleCleanupRetrySteps,
  getBabyMinimoLifecycleCleanupSafeMessage,
  hasBabyMinimoLifecycleCleanupBlockingFailure,
  hasBabyMinimoLifecycleCleanupFailures,
  type BabyMinimoLifecycleCleanupDependencies,
  type BabyMinimoLifecycleCleanupReason,
  type BabyMinimoLifecycleCleanupResult,
  type BabyMinimoLifecycleCleanupStep,
} from './localLifecycleCore'

export const runBabyMinimoLocalLifecycleCleanup = createBabyMinimoLifecycleCleanup({
  clearWidgetSnapshot: async () => {
    await clearAndBlankBabyMinimoCurrentStateWidget()
  },
  cancelNotifications: cancelAllBabyMinimoReminderNotifications,
  resetAnalytics: resetAnalyticsEvents,
  resetAuthSession: () => useAuthStore.getState().reset(),
  resetCareEvents: () => useCareEventStore.getState().resetEvents(),
  resetGrowthTimeline: () => useGrowthTimelineStore.getState().resetGrowthTimeline(),
  resetWidgetSettings: () => useWidgetSettingsStore.getState().resetWidgetSettings(),
})
