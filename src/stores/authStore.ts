import { create } from 'zustand'
import type { DemoUser } from '@/src/features/demo/auth'

interface AuthState {
  user: DemoUser | null
  currentHouseholdId: string | null
  selectedBabyId: string | null
  onboardingCompleted: boolean
  authBootstrapped: boolean
  setUser: (user: DemoUser | null) => void
  setCurrentHouseholdId: (id: string | null) => void
  setSelectedBabyId: (id: string | null) => void
  setOnboardingCompleted: (completed: boolean) => void
  setOnboardingState: (state: {
    currentHouseholdId: string | null
    selectedBabyId: string | null
    onboardingCompleted: boolean
  }) => void
  setAuthBootstrapped: (bootstrapped: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentHouseholdId: null,
  selectedBabyId: null,
  onboardingCompleted: false,
  authBootstrapped: false,
  setUser: (user) => set({ user }),
  setCurrentHouseholdId: (id) => set({ currentHouseholdId: id }),
  setSelectedBabyId: (id) => set({ selectedBabyId: id }),
  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
  setOnboardingState: (state) => set(state),
  setAuthBootstrapped: (bootstrapped) => set({ authBootstrapped: bootstrapped }),
  reset: () =>
    set({
      user: null,
      currentHouseholdId: null,
      selectedBabyId: null,
      onboardingCompleted: false,
      authBootstrapped: false,
    }),
}))
