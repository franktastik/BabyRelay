import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firestore } from '@/src/lib/firebase'
import {
  normalizeHouseholdMemberRole,
  type HouseholdMemberRole,
} from '@/src/features/household/permissions'

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
  createHousehold: (name: string, ownerUserId?: string) => Promise<DemoHousehold>
  createBaby: (householdId: string, name: string, birthDate: string | null) => Promise<DemoBaby>
  listBabies: (householdId: string) => Promise<DemoBaby[]>
  selectBaby: (userId: string, householdId: string, babyId: string) => Promise<void>
  completeOnboarding: (userId: string, householdId: string, babyId: string) => Promise<void>
  getOnboardingState: (userId: string) => Promise<{
    currentHouseholdId: string | null
    selectedBabyId: string | null
    householdRole: HouseholdMemberRole | null
    onboardingCompleted: boolean
    babies: DemoBaby[]
  }>
}

type StoredBaby = {
  name?: string
  birthDate?: string | null
}

const babiesCollection = () => collection(firestore, 'babies')

const readBabies = (docs: Array<{ id: string; data: () => StoredBaby }>): DemoBaby[] =>
  docs.map((babyDoc) => {
    const data = babyDoc.data()
    return {
      id: babyDoc.id,
      name: data.name || 'Baby',
      birthDate: typeof data.birthDate === 'string' ? data.birthDate : null,
    }
  })

export const createDemoHouseholdAdapter = (): DemoHouseholdAdapter => ({
  createHousehold: async (name: string, ownerUserId?: string) => {
    const householdRef = await addDoc(collection(firestore, 'households'), {
      name,
      ownerUserId: ownerUserId ?? null,
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
  listBabies: async (householdId: string) => {
    const snapshot = await getDocs(
      query(babiesCollection(), where('householdId', '==', householdId), orderBy('createdAt', 'asc'))
    )
    return readBabies(snapshot.docs)
  },
  selectBaby: async (userId: string, householdId: string, babyId: string) => {
    await Promise.all([
      updateDoc(doc(firestore, 'households', householdId), {
        selectedBabyId: babyId,
        updatedAt: serverTimestamp(),
      }),
      setDoc(
        doc(firestore, 'users', userId),
        {
          selectedBabyId: babyId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
    ])
  },
  completeOnboarding: async (userId: string, householdId: string, babyId: string) => {
    await setDoc(
      doc(firestore, 'users', userId),
      {
        currentHouseholdId: householdId,
        selectedBabyId: babyId,
        householdRole: 'owner',
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  },
  getOnboardingState: async (userId: string) => {
    const profileSnap = await getDoc(doc(firestore, 'users', userId))
    const profile = profileSnap.exists() ? profileSnap.data() : {}
    const currentHouseholdId =
      typeof profile.currentHouseholdId === 'string' ? profile.currentHouseholdId : null
    const onboardingCompleted = profile.onboardingCompleted === true
    const storedHouseholdRole = normalizeHouseholdMemberRole(profile.householdRole)
    let householdRole = storedHouseholdRole

    if (onboardingCompleted && currentHouseholdId && !storedHouseholdRole) {
      const householdSnap = await getDoc(doc(firestore, 'households', currentHouseholdId))
      const household = householdSnap.exists() ? householdSnap.data() : {}
      householdRole = household.ownerUserId === userId ? 'owner' : null

      if (householdRole) {
        await setDoc(
          doc(firestore, 'users', userId),
          {
            householdRole,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }
    }

    const babies = currentHouseholdId ? await createDemoHouseholdAdapter().listBabies(currentHouseholdId) : []

    return {
      currentHouseholdId,
      selectedBabyId: typeof profile.selectedBabyId === 'string' ? profile.selectedBabyId : null,
      householdRole,
      onboardingCompleted,
      babies,
    }
  },
})
