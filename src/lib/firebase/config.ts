declare const process: {
  env: Record<string, string | undefined>
}

const env = process.env

export type FirebasePublicEnv = Record<string, string | undefined>

export const firebaseEnvDefaults = {
  apiKey: 'demo-api-key',
  authDomain: 'localhost',
  projectId: 'babyminimo-demo',
  storageBucket: 'babyminimo-demo.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:babyminimodemo',
  useEmulator: 'true',
  emulatorHost: '127.0.0.1',
  authEmulatorPort: '9099',
  firestoreEmulatorPort: '8080',
  storageEmulatorPort: '9199',
  functionsEmulatorPort: '5001',
  uiEmulatorPort: '4000',
} as const

export const firebaseEnvKeys = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
  useEmulator: 'EXPO_PUBLIC_USE_FIREBASE_EMULATOR',
  emulatorHost: 'EXPO_PUBLIC_FIREBASE_EMULATOR_HOST',
  authEmulatorPort: 'EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT',
  firestoreEmulatorPort: 'EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT',
  storageEmulatorPort: 'EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT',
  functionsEmulatorPort: 'EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT',
  uiEmulatorPort: 'EXPO_PUBLIC_FIREBASE_UI_EMULATOR_PORT',
} as const

function readEnv(
  source: FirebasePublicEnv,
  key: string,
  fallback: string
): string {
  const value = source[key]
  return value && value.trim().length > 0 ? value : fallback
}

function readPort(source: FirebasePublicEnv, key: string, fallback: string) {
  const rawPort = readEnv(source, key, fallback)
  const port = Number(rawPort)

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return Number(fallback)
  }

  return port
}

export function buildFirebaseConfig(source: FirebasePublicEnv = env) {
  return {
    apiKey: readEnv(source, firebaseEnvKeys.apiKey, firebaseEnvDefaults.apiKey),
    authDomain: readEnv(
      source,
      firebaseEnvKeys.authDomain,
      firebaseEnvDefaults.authDomain
    ),
    projectId: readEnv(
      source,
      firebaseEnvKeys.projectId,
      firebaseEnvDefaults.projectId
    ),
    storageBucket: readEnv(
      source,
      firebaseEnvKeys.storageBucket,
      firebaseEnvDefaults.storageBucket
    ),
    messagingSenderId: readEnv(
      source,
      firebaseEnvKeys.messagingSenderId,
      firebaseEnvDefaults.messagingSenderId
    ),
    appId: readEnv(source, firebaseEnvKeys.appId, firebaseEnvDefaults.appId),
  }
}

export function buildFirebaseEmulatorConfig(source: FirebasePublicEnv = env) {
  return {
    enabled:
      readEnv(
        source,
        firebaseEnvKeys.useEmulator,
        firebaseEnvDefaults.useEmulator
      ) !== 'false',
    host: readEnv(
      source,
      firebaseEnvKeys.emulatorHost,
      firebaseEnvDefaults.emulatorHost
    ),
    authPort: readPort(
      source,
      firebaseEnvKeys.authEmulatorPort,
      firebaseEnvDefaults.authEmulatorPort
    ),
    firestorePort: readPort(
      source,
      firebaseEnvKeys.firestoreEmulatorPort,
      firebaseEnvDefaults.firestoreEmulatorPort
    ),
    storagePort: readPort(
      source,
      firebaseEnvKeys.storageEmulatorPort,
      firebaseEnvDefaults.storageEmulatorPort
    ),
    functionsPort: readPort(
      source,
      firebaseEnvKeys.functionsEmulatorPort,
      firebaseEnvDefaults.functionsEmulatorPort
    ),
    uiPort: readPort(
      source,
      firebaseEnvKeys.uiEmulatorPort,
      firebaseEnvDefaults.uiEmulatorPort
    ),
  }
}

export const firebaseConfig = buildFirebaseConfig(env)

export const firebaseEmulatorConfig = buildFirebaseEmulatorConfig(env)
