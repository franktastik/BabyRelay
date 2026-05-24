declare const process: {
  env: Record<string, string | undefined>
}

const env = process.env

const readEnv = (key: string, fallback: string) => env[key] || fallback

export const firebaseConfig = {
  apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY', 'demo-api-key'),
  authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'localhost'),
  projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'babyminimo-demo'),
  storageBucket: readEnv(
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'babyminimo-demo.appspot.com'
  ),
  messagingSenderId: readEnv(
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    '000000000000'
  ),
  appId: readEnv(
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    '1:000000000000:web:babyminimodemo'
  ),
}

export const firebaseEmulatorConfig = {
  enabled: readEnv('EXPO_PUBLIC_USE_FIREBASE_EMULATOR', 'true') !== 'false',
  host: readEnv('EXPO_PUBLIC_FIREBASE_EMULATOR_HOST', '127.0.0.1'),
  authPort: Number(readEnv('EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT', '9099')),
  firestorePort: Number(
    readEnv('EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT', '8080')
  ),
}
