import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { firebaseApp } from './app'
import { firebaseEmulatorConfig } from './config'

export const firestore = getFirestore(firebaseApp)

const globalFirebaseState = globalThis as typeof globalThis & {
  __babyminimoFirestoreEmulatorConnected?: boolean
}

export function ensureFirestoreEmulatorConnected() {
  if (
    !firebaseEmulatorConfig.enabled ||
    globalFirebaseState.__babyminimoFirestoreEmulatorConnected
  ) {
    return
  }

  connectFirestoreEmulator(
    firestore,
    firebaseEmulatorConfig.host,
    firebaseEmulatorConfig.firestorePort
  )
  globalFirebaseState.__babyminimoFirestoreEmulatorConnected = true
}

ensureFirestoreEmulatorConnected()
