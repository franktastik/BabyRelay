import { describe, expect, test } from 'bun:test'
import {
  createBabyMinimoLifecycleCleanup,
  getBabyMinimoLifecycleCleanupRetrySteps,
  getBabyMinimoLifecycleCleanupSafeMessage,
  hasBabyMinimoLifecycleCleanupBlockingFailure,
  hasBabyMinimoLifecycleCleanupFailures,
  type BabyMinimoLifecycleCleanupDependencies,
  type BabyMinimoLifecycleCleanupStep,
} from './localLifecycleCore'

const createDependencies = (completed: BabyMinimoLifecycleCleanupStep[] = []) => {
  const dependencyFor = (step: BabyMinimoLifecycleCleanupStep) => () => {
    completed.push(step)
  }

  return {
    completed,
    dependencies: {
      clearWidgetSnapshot: dependencyFor('widgetSnapshot'),
      cancelNotifications: dependencyFor('notifications'),
      resetAnalytics: dependencyFor('analytics'),
      resetAuthSession: dependencyFor('authSession'),
      resetCareEvents: dependencyFor('careEvents'),
      resetGrowthTimeline: dependencyFor('growthTimeline'),
      resetWidgetSettings: dependencyFor('widgetSettings'),
    } satisfies BabyMinimoLifecycleCleanupDependencies,
  }
}

describe('BabyMinimo local lifecycle cleanup', () => {
  test('sign out clears local identity surfaces without deleting app data', async () => {
    const { completed, dependencies } = createDependencies()
    const cleanup = createBabyMinimoLifecycleCleanup(dependencies)

    const result = await cleanup('signOut')

    expect(result.failed).toEqual([])
    expect(hasBabyMinimoLifecycleCleanupFailures(result)).toBe(false)
    expect(getBabyMinimoLifecycleCleanupSafeMessage(result)).toBe('Local cleanup completed.')
    expect(result.completed).toEqual([
      'widgetSnapshot',
      'notifications',
      'analytics',
      'authSession',
    ])
    expect(completed).not.toContain('careEvents')
    expect(completed).not.toContain('growthTimeline')
    expect(completed).not.toContain('widgetSettings')
  })

  test('account deletion includes local data reset steps', async () => {
    const { dependencies } = createDependencies()
    const cleanup = createBabyMinimoLifecycleCleanup(dependencies)

    const result = await cleanup('accountDeletion')

    expect(result.failed).toEqual([])
    expect(result.completed).toEqual([
      'widgetSnapshot',
      'notifications',
      'analytics',
      'authSession',
      'careEvents',
      'growthTimeline',
      'widgetSettings',
    ])
  })

  test('reports cleanup failures without stopping later steps', async () => {
    const { dependencies } = createDependencies()
    const cleanup = createBabyMinimoLifecycleCleanup({
      ...dependencies,
      clearWidgetSnapshot: () => {
        throw new Error('widget unavailable')
      },
    })

    const result = await cleanup('signOut')

    expect(result.failed).toEqual([
      {
        step: 'widgetSnapshot',
        message: 'widget unavailable',
      },
    ])
    expect(hasBabyMinimoLifecycleCleanupFailures(result)).toBe(true)
    expect(hasBabyMinimoLifecycleCleanupBlockingFailure(result)).toBe(false)
    expect(getBabyMinimoLifecycleCleanupRetrySteps(result)).toEqual(['widgetSnapshot'])
    expect(getBabyMinimoLifecycleCleanupSafeMessage(result)).toBe(
      'Some local cleanup will be retried the next time BabyMinimo opens.'
    )
    expect(result.completed).toEqual(['notifications', 'analytics', 'authSession'])
  })

  test('classifies auth session cleanup failure as blocking', async () => {
    const { dependencies } = createDependencies()
    const cleanup = createBabyMinimoLifecycleCleanup({
      ...dependencies,
      resetAuthSession: () => {
        throw new Error('auth store unavailable')
      },
    })

    const result = await cleanup('signOut')

    expect(hasBabyMinimoLifecycleCleanupBlockingFailure(result)).toBe(true)
    expect(getBabyMinimoLifecycleCleanupRetrySteps(result)).toContain('authSession')
    expect(getBabyMinimoLifecycleCleanupSafeMessage(result)).toBe(
      'Local account cleanup could not finish. Please try again.'
    )
  })
})
