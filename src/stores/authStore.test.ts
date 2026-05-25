import { describe, expect, test } from 'bun:test'
import { useAuthStore } from './authStore'

const resetAuthStore = () => {
  useAuthStore.getState().reset()
}

describe('auth store multi-baby state', () => {
  test('stores babies and selects the newly added baby', () => {
    resetAuthStore()

    useAuthStore.getState().setBabies([
      { id: 'baby-1', name: 'Luna', birthDate: null },
      { id: 'baby-2', name: 'Milo', birthDate: '2026-05-01' },
    ])
    useAuthStore.getState().setSelectedBabyId('baby-1')
    useAuthStore.getState().addBaby({ id: 'baby-3', name: 'Nora', birthDate: null })

    const state = useAuthStore.getState()
    expect(state.selectedBabyId).toBe('baby-3')
    expect(state.babies.map((baby) => baby.id)).toEqual(['baby-3', 'baby-1', 'baby-2'])
  })

  test('onboarding state keeps existing babies unless a new baby list is supplied', () => {
    resetAuthStore()

    useAuthStore.getState().setBabies([{ id: 'baby-1', name: 'Luna', birthDate: null }])
    useAuthStore.getState().setOnboardingState({
      currentHouseholdId: 'household-1',
      selectedBabyId: 'baby-1',
      onboardingCompleted: true,
    })

    expect(useAuthStore.getState().babies).toEqual([
      { id: 'baby-1', name: 'Luna', birthDate: null },
    ])

    useAuthStore.getState().setOnboardingState({
      currentHouseholdId: 'household-1',
      selectedBabyId: 'baby-2',
      onboardingCompleted: true,
      babies: [{ id: 'baby-2', name: 'Milo', birthDate: null }],
    })

    expect(useAuthStore.getState().babies).toEqual([
      { id: 'baby-2', name: 'Milo', birthDate: null },
    ])
  })
})
