import { babyMinimoI18n } from '@/src/localization'

export type BabyMinimoLifecycleCleanupReason = 'signOut' | 'accountDeletion'

export type BabyMinimoLifecycleCleanupStep =
  | 'widgetSnapshot'
  | 'notifications'
  | 'analytics'
  | 'authSession'
  | 'careEvents'
  | 'growthTimeline'
  | 'activity'
  | 'widgetSettings'

export interface BabyMinimoLifecycleCleanupResult {
  reason: BabyMinimoLifecycleCleanupReason
  completed: BabyMinimoLifecycleCleanupStep[]
  failed: Array<{
    step: BabyMinimoLifecycleCleanupStep
    message: string
  }>
}

export interface BabyMinimoLifecycleCleanupDependencies {
  clearWidgetSnapshot: () => Promise<void> | void
  cancelNotifications: () => Promise<void> | void
  resetAnalytics: () => void
  resetAuthSession: () => void
  resetCareEvents: () => void
  resetGrowthTimeline: () => void
  resetActivity: () => void
  resetWidgetSettings: () => void
}

const runStep = async (
  result: BabyMinimoLifecycleCleanupResult,
  step: BabyMinimoLifecycleCleanupStep,
  action: () => Promise<void> | void
) => {
  try {
    await action()
    result.completed.push(step)
  } catch (error) {
    result.failed.push({
      step,
      message: error instanceof Error ? error.message : 'Cleanup step failed.',
    })
  }
}

export const createBabyMinimoLifecycleCleanup = (
  dependencies: BabyMinimoLifecycleCleanupDependencies
) => async (
  reason: BabyMinimoLifecycleCleanupReason
): Promise<BabyMinimoLifecycleCleanupResult> => {
  const result: BabyMinimoLifecycleCleanupResult = {
    reason,
    completed: [],
    failed: [],
  }

  await runStep(result, 'widgetSnapshot', dependencies.clearWidgetSnapshot)
  await runStep(result, 'notifications', dependencies.cancelNotifications)
  await runStep(result, 'analytics', dependencies.resetAnalytics)
  await runStep(result, 'authSession', dependencies.resetAuthSession)

  if (reason === 'accountDeletion') {
    await runStep(result, 'careEvents', dependencies.resetCareEvents)
    await runStep(result, 'growthTimeline', dependencies.resetGrowthTimeline)
    await runStep(result, 'activity', dependencies.resetActivity)
    await runStep(result, 'widgetSettings', dependencies.resetWidgetSettings)
  }

  return result
}

export const hasBabyMinimoLifecycleCleanupFailures = (
  result: BabyMinimoLifecycleCleanupResult
) => result.failed.length > 0

export const hasBabyMinimoLifecycleCleanupBlockingFailure = (
  result: BabyMinimoLifecycleCleanupResult
) => result.failed.some((failure) => failure.step === 'authSession')

export const getBabyMinimoLifecycleCleanupRetrySteps = (
  result: BabyMinimoLifecycleCleanupResult
) => result.failed.map((failure) => failure.step)

export const getBabyMinimoLifecycleCleanupSafeMessage = (
  result: BabyMinimoLifecycleCleanupResult
) => {
  if (!hasBabyMinimoLifecycleCleanupFailures(result)) {
    return babyMinimoI18n.t('lifecycle.cleanup.completed')
  }

  if (hasBabyMinimoLifecycleCleanupBlockingFailure(result)) {
    return babyMinimoI18n.t('lifecycle.cleanup.blocked')
  }

  return babyMinimoI18n.t('lifecycle.cleanup.retry')
}
