import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '@/src/lib/firebase'

export interface DemoBaby {
  id: string
  name: string
  birthDate: string | null
}

export interface DemoHousehold {
  id: string
  name: string
  babies: DemoBaby[]
}

export interface DemoHouseholdAdapter {
  createHousehold: (name: string) => Promise<DemoHousehold>
  createBaby: (householdId: string, name: string, birthDate: string | null) => Promise<DemoBaby>
  completeOnboarding: (userId: string, householdId: string, babyId: string) => Promise<void>
  getOnboardingState: (userId: string) => Promise<{
    currentHouseholdId: string | null
    selectedBabyId: string | null
    onboardingCompleted: boolean
  }>
}

export const createDemoHouseholdAdapter = (): DemoHouseholdAdapter => ({
  createHousehold: async (name: string) => {
    const householdRef = await addDoc(collection(firestore, 'households'), {
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const household: DemoHousehold = {
      id: householdRef.id,
      name,
      babies: [],
    }

    return household
  },
  createBaby: async (householdId: string, name: string, birthDate: string | null) => {
    const babyRef = await addDoc(collection(firestore, 'babies'), {
      householdId,
      name,
      birthDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const baby: DemoBaby = {
      id: babyRef.id,
      name,
      birthDate,
    }

    await updateDoc(doc(firestore, 'households', householdId), {
      selectedBabyId: baby.id,
      updatedAt: serverTimestamp(),
    })

    return baby
  },
  completeOnboarding: async (userId: string, householdId: string, babyId: string) => {
    await setDoc(
      doc(firestore, 'users', userId),
      {
        currentHouseholdId: householdId,
        selectedBabyId: babyId,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  },
  getOnboardingState: async (userId: string) => {
    const profileSnap = await getDoc(doc(firestore, 'users', userId))
    const profile = profileSnap.exists() ? profileSnap.data() : {}

    return {
      currentHouseholdId:
        typeof profile.currentHouseholdId === 'string' ? profile.currentHouseholdId : null,
      selectedBabyId: typeof profile.selectedBabyId === 'string' ? profile.selectedBabyId : null,
      onboardingCompleted: profile.onboardingCompleted === true,
    }
  },
})
