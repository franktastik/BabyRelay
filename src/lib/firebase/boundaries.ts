import { firebaseConfig, firebaseEmulatorConfig } from './config'

export type FirebaseRuntimeMode = 'emulator' | 'production'

type FirebaseAppConfig = typeof firebaseConfig
type FirebaseEmulatorConfig = typeof firebaseEmulatorConfig

const DEMO_PROJECT_ID = 'babyminimo-demo'
const DEMO_API_KEY = 'demo-api-key'
const DEMO_APP_ID = '1:000000000000:web:babyminimodemo'
const DEMO_MESSAGING_SENDER_ID = '000000000000'
const LOCAL_AUTH_DOMAIN = 'localhost'

export const firebaseBoundaryDefaults = {
  demoProjectId: DEMO_PROJECT_ID,
  emulatorHost: '127.0.0.1',
  emulatorUiPort: 4000,
  functionsPort: 5001,
} as const

export function getFirebaseRuntimeMode(
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
): FirebaseRuntimeMode {
  return emulatorConfig.enabled ? 'emulator' : 'production'
}

export function getFirebaseEmulatorEndpoints(
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
) {
  const host = emulatorConfig.host

  return {
    auth: `http://${host}:${emulatorConfig.authPort}`,
    firestore: `http://${host}:${emulatorConfig.firestorePort}`,
    storage: `http://${host}:${emulatorConfig.storagePort}`,
    functions: `http://${host}:${emulatorConfig.functionsPort}`,
    ui: `http://${host}:${emulatorConfig.uiPort}`,
    storageUi: `http://${host}:${emulatorConfig.uiPort}/storage`,
  }
}

export function isDemoFirebaseConfig(config: FirebaseAppConfig = firebaseConfig) {
  return (
    config.apiKey === DEMO_API_KEY ||
    config.authDomain === LOCAL_AUTH_DOMAIN ||
    config.projectId === DEMO_PROJECT_ID ||
    config.storageBucket === `${DEMO_PROJECT_ID}.appspot.com` ||
    config.messagingSenderId === DEMO_MESSAGING_SENDER_ID ||
    config.appId === DEMO_APP_ID
  )
}

export function validateFirebaseProductionBoundary(
  config: FirebaseAppConfig = firebaseConfig,
  emulatorConfig: FirebaseEmulatorConfig = firebaseEmulatorConfig
) {
  const mode = getFirebaseRuntimeMode(emulatorConfig)
  const issues: string[] = []

  if (mode === 'emulator') {
    return {
      ok: true,
      mode,
      issues,
    }
  }

  if (config.apiKey === DEMO_API_KEY) {
    issues.push('EXPO_PUBLIC_FIREBASE_API_KEY still uses the demo placeholder.')
  }

  if (config.authDomain === LOCAL_AUTH_DOMAIN) {
    issues.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN still points at localhost.')
  }

  if (config.projectId === DEMO_PROJECT_ID) {
    issues.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID still uses the emulator project.')
  }

  if (config.storageBucket === `${DEMO_PROJECT_ID}.appspot.com`) {
    issues.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET still uses the emulator bucket.')
  }

  if (config.messagingSenderId === DEMO_MESSAGING_SENDER_ID) {
    issues.push(
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID still uses the demo placeholder.'
    )
  }

  if (config.appId === DEMO_APP_ID) {
    issues.push('EXPO_PUBLIC_FIREBASE_APP_ID still uses the demo placeholder.')
  }

  return {
    ok: issues.length === 0,
    mode,
    issues,
  }
}
