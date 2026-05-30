import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { firebaseApp } from './app'
import { firebaseEmulatorConfig } from './config'

export const firebaseFunctions = getFunctions(firebaseApp)

const globalFirebaseState = globalThis as typeof globalThis & {
  __babyminimoFunctionsEmulatorConnected?: boolean
}

export function ensureFunctionsEmulatorConnected() {
  if (
    !firebaseEmulatorConfig.enabled ||
    globalFirebaseState.__babyminimoFunctionsEmulatorConnected
  ) {
    return
  }

  connectFunctionsEmulator(
    firebaseFunctions,
    firebaseEmulatorConfig.host,
    firebaseEmulatorConfig.functionsPort
  )
  globalFirebaseState.__babyminimoFunctionsEmulatorConnected = true
}

ensureFunctionsEmulatorConnected()
