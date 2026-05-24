import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
} from 'firebase/auth'
import { firebaseApp } from './app'
import { firebaseEmulatorConfig } from './config'

export const firebaseAuth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: inMemoryPersistence,
    })
  } catch {
    return getAuth(firebaseApp)
  }
})()

const globalFirebaseState = globalThis as typeof globalThis & {
  __babyminimoAuthEmulatorConnected?: boolean
}

export function ensureAuthEmulatorConnected() {
  if (
    !firebaseEmulatorConfig.enabled ||
    globalFirebaseState.__babyminimoAuthEmulatorConnected
  ) {
    return
  }

  connectAuthEmulator(
    firebaseAuth,
    `http://${firebaseEmulatorConfig.host}:${firebaseEmulatorConfig.authPort}`,
    { disableWarnings: true }
  )
  globalFirebaseState.__babyminimoAuthEmulatorConnected = true
}

ensureAuthEmulatorConnected()
