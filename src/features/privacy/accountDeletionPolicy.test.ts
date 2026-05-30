import { describe, expect, test } from 'bun:test'
import {
  BABY_MINIMO_DELETE_CONFIRMATION,
  babyMinimoAccountDeletionPolicy,
  isBabyMinimoDeleteConfirmationValid,
} from './accountDeletionPolicy'

describe('BabyMinimo account deletion policy', () => {
  test('requires explicit typed confirmation', () => {
    expect(BABY_MINIMO_DELETE_CONFIRMATION).toBe('DELETE')
    expect(isBabyMinimoDeleteConfirmationValid('DELETE')).toBe(true)
    expect(isBabyMinimoDeleteConfirmationValid(' delete ')).toBe(true)
    expect(isBabyMinimoDeleteConfirmationValid('remove')).toBe(false)
  })

  test('covers local and shared data classes', () => {
    const dataClasses = babyMinimoAccountDeletionPolicy.map((item) => item.dataClass)

    expect(dataClasses).toContain('userProfile')
    expect(dataClasses).toContain('householdMembership')
    expect(dataClasses).toContain('babyProfiles')
    expect(dataClasses).toContain('careEvents')
    expect(dataClasses).toContain('reminders')
    expect(dataClasses).toContain('growthTimelineLocalPhotos')
    expect(dataClasses).toContain('growthTimelineLocalMetadata')
    expect(dataClasses).toContain('widgetSnapshots')
    expect(dataClasses).toContain('notifications')
    expect(dataClasses).toContain('analytics')
    expect(dataClasses).toContain('authSession')
  })

  test('keeps production shared-data deletion backend-owned', () => {
    const clientOwned = babyMinimoAccountDeletionPolicy.filter(
      (item) => item.owner === 'clientLocal'
    )
    const productionOwned = babyMinimoAccountDeletionPolicy.filter(
      (item) => item.owner === 'backendProduction' || item.owner === 'sharedHouseholdPolicy'
    )

    expect(clientOwned.map((item) => item.dataClass)).toEqual([
      'growthTimelineLocalPhotos',
      'growthTimelineLocalMetadata',
      'widgetSnapshots',
      'notifications',
      'analytics',
      'authSession',
    ])
    expect(productionOwned.map((item) => item.dataClass)).toContain('householdMembership')
    expect(productionOwned.map((item) => item.dataClass)).toContain('babyProfiles')
  })
})
