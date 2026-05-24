import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { firebaseAuth } from '@/src/lib/firebase'

export interface DemoUser {
  id: string
  displayName: string
  email: string
}

export interface DemoAuthAdapter {
  signIn: (email: string, password: string) => Promise<DemoUser>
  signUp: (displayName: string, email: string, password: string) => Promise<DemoUser>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<DemoUser | null>
  subscribeToAuthState: (callback: (user: DemoUser | null) => void) => () => void
}

const mapFirebaseUser = (user: User): DemoUser => ({
  id: user.uid,
  displayName:
    user.displayName || user.email?.split('@')[0] || 'Caregiver',
  email: user.email || '',
})

const authErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return 'Authentication failed'
  }

  const message = error.message
  if (message.includes('auth/invalid-credential')) {
    return 'No matching emulator account found for that email and password'
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'An emulator account already exists for that email'
  }
  if (message.includes('auth/weak-password')) {
    return 'Use a password with at least 6 characters'
  }
  if (message.includes('auth/network-request-failed')) {
    return 'Firebase Auth emulator is not reachable. Start it with bun run emulators.'
  }

  return message
}

export const createDemoAuthAdapter = (): DemoAuthAdapter => ({
  signIn: async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password
      )
      return mapFirebaseUser(credential.user)
    } catch (error) {
      throw new Error(authErrorMessage(error))
    }
  },
  signUp: async (displayName: string, email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password
      )
      await updateProfile(credential.user, { displayName: displayName.trim() })
      return mapFirebaseUser(credential.user)
    } catch (error) {
      throw new Error(authErrorMessage(error))
    }
  },
  signOut: async () => {
    await firebaseSignOut(firebaseAuth)
  },
  getCurrentUser: async () => {
    return firebaseAuth.currentUser ? mapFirebaseUser(firebaseAuth.currentUser) : null
  },
  subscribeToAuthState: (callback) => {
    return onAuthStateChanged(firebaseAuth, (user) => {
      callback(user ? mapFirebaseUser(user) : null)
    })
  },
})
