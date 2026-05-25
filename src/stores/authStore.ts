import { create } from 'zustand'
import type { DemoUser } from '@/src/features/demo/auth'
import type { DemoBaby } from '@/src/features/demo/household'

interface AuthState {
  user: DemoUser | null
  currentHouseholdId: string | null
  selectedBabyId: string | null
  babies: DemoBaby[]
  onboardingCompleted: boolean
  authBootstrapped: boolean
  setUser: (user: DemoUser | null) => void
  setCurrentHouseholdId: (id: string | null) => void
  setSelectedBabyId: (id: string | null) => void
  setBabies: (babies: DemoBaby[]) => void
  addBaby: (baby: DemoBaby) => void
  setOnboardingCompleted: (completed: boolean) => void
  setOnboardingState: (state: {
    currentHouseholdId: string | null
    selectedBabyId: string | null
    onboardingCompleted: boolean
    babies?: DemoBaby[]
  }) => void
  setAuthBootstrapped: (bootstrapped: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentHouseholdId: null,
  selectedBabyId: null,
  babies: [],
  onboardingCompleted: false,
  authBootstrapped: false,
  setUser: (user) => set({ user }),
  setCurrentHouseholdId: (id) => set({ currentHouseholdId: id }),
  setSelectedBabyId: (id) => set({ selectedBabyId: id }),
  setBabies: (babies) => set({ babies }),
  addBaby: (baby) =>
    set((state) => ({
      babies: [baby, ...state.babies.filter((existingBaby) => existingBaby.id !== baby.id)],
      selectedBabyId: baby.id,
    })),
  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
  setOnboardingState: (state) => set((current) => ({ ...state, babies: state.babies ?? current.babies })),
  setAuthBootstrapped: (bootstrapped) => set({ authBootstrapped: bootstrapped }),
  reset: () =>
    set({
      user: null,
      currentHouseholdId: null,
      selectedBabyId: null,
      babies: [],
      onboardingCompleted: false,
      authBootstrapped: false,
    }),
}))
