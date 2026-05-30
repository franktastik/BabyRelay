import {
  getFirebaseEmulatorEndpoints,
  getFirebaseRuntimeMode,
  validateFirebaseProductionBoundary,
} from './boundaries'
import { firebaseConfig, firebaseEmulatorConfig } from './config'
import { ensureAuthEmulatorConnected } from './auth'
import { ensureFirestoreEmulatorConnected } from './firestore'
import { ensureFunctionsEmulatorConnected } from './functions'
import { ensureStorageEmulatorConnected } from './storage'

type FirebaseAppConfig = typeof firebaseConfig
type FirebaseEmulatorConfig = typeof firebaseEmulatorConfig

export function assertFirebaseClientRuntimeBoundary(
  config: FirebaseAppConfig = firebaseConfig,
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
) {
  const validation = validateFirebaseProductionBoundary(config, emulatorConfig)

  if (!validation.ok) {
    throw new Error(
      [
        'Firebase production mode is not configured safely.',
        ...validation.issues,
      ].join(' ')
    )
  }

  return validation
}

export function connectFirebaseEmulators(
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
) {
  if (!emulatorConfig.enabled) {
    return false
  }

  ensureAuthEmulatorConnected()
  ensureFirestoreEmulatorConnected()
  ensureStorageEmulatorConnected()
  ensureFunctionsEmulatorConnected()

  return true
}

export function getFirebaseClientRuntimeSummary(
  config: FirebaseAppConfig = firebaseConfig,
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
) {
  const mode = getFirebaseRuntimeMode(emulatorConfig)
  const productionBoundary = validateFirebaseProductionBoundary(config, emulatorConfig)

  return {
    mode,
    productionBoundary,
    emulatorEndpoints: emulatorConfig.enabled
      ? getFirebaseEmulatorEndpoints(emulatorConfig)
      : null,
  }
}

export function configureFirebaseClientRuntime(
  config: FirebaseAppConfig = firebaseConfig,
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
) {
  const boundary = assertFirebaseClientRuntimeBoundary(config, emulatorConfig)
  const emulatorConnected = connectFirebaseEmulators(emulatorConfig)

  return {
    mode: boundary.mode,
    emulatorConnected,
    emulatorEndpoints: emulatorConnected
      ? getFirebaseEmulatorEndpoints(emulatorConfig)
      : null,
  }
}

export const firebaseClientRuntime = configureFirebaseClientRuntime()
