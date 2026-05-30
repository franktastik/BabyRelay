import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { firebaseApp } from './app'
import { firebaseEmulatorConfig } from './config'

export const firebaseStorage = getStorage(firebaseApp)

const globalFirebaseState = globalThis as typeof globalThis & {
  __babyminimoStorageEmulatorConnected?: boolean
}

export function ensureStorageEmulatorConnected() {
  if (
    !firebaseEmulatorConfig.enabled ||
    globalFirebaseState.__babyminimoStorageEmulatorConnected
  ) {
    return
  }

  connectStorageEmulator(
    firebaseStorage,
    firebaseEmulatorConfig.host,
    firebaseEmulatorConfig.storagePort
  )
  globalFirebaseState.__babyminimoStorageEmulatorConnected = true
}

ensureStorageEmulatorConnected()
