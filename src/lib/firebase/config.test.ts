import { describe, expect, test } from 'bun:test'
import {
  buildFirebaseConfig,
  buildFirebaseEmulatorConfig,
  firebaseEnvDefaults,
  firebaseEnvKeys,
} from './config'

describe('Firebase environment loading', () => {
  test('loads emulator-safe defaults when public env values are missing', () => {
    expect(buildFirebaseConfig({})).toEqual({
      apiKey: firebaseEnvDefaults.apiKey,
      authDomain: firebaseEnvDefaults.authDomain,
      projectId: firebaseEnvDefaults.projectId,
      storageBucket: firebaseEnvDefaults.storageBucket,
      messagingSenderId: firebaseEnvDefaults.messagingSenderId,
      appId: firebaseEnvDefaults.appId,
    })

    expect(buildFirebaseEmulatorConfig({})).toEqual({
      enabled: true,
      host: firebaseEnvDefaults.emulatorHost,
      authPort: Number(firebaseEnvDefaults.authEmulatorPort),
      firestorePort: Number(firebaseEnvDefaults.firestoreEmulatorPort),
      storagePort: Number(firebaseEnvDefaults.storageEmulatorPort),
      functionsPort: Number(firebaseEnvDefaults.functionsEmulatorPort),
      uiPort: Number(firebaseEnvDefaults.uiEmulatorPort),
    })
  })

  test('loads production Firebase public values from Expo environment keys', () => {
    const config = buildFirebaseConfig({
      [firebaseEnvKeys.apiKey]: 'prod-key',
      [firebaseEnvKeys.authDomain]: 'babyminimo.firebaseapp.com',
      [firebaseEnvKeys.projectId]: 'babyminimo-prod',
      [firebaseEnvKeys.storageBucket]: 'babyminimo-prod.appspot.com',
      [firebaseEnvKeys.messagingSenderId]: '123456789012',
      [firebaseEnvKeys.appId]: '1:123456789012:web:prod',
    })

    expect(config).toEqual({
      apiKey: 'prod-key',
      authDomain: 'babyminimo.firebaseapp.com',
      projectId: 'babyminimo-prod',
      storageBucket: 'babyminimo-prod.appspot.com',
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:prod',
    })
  })

  test('loads emulator ports from Expo environment keys', () => {
    const emulatorConfig = buildFirebaseEmulatorConfig({
      [firebaseEnvKeys.useEmulator]: 'false',
      [firebaseEnvKeys.emulatorHost]: 'localhost',
      [firebaseEnvKeys.authEmulatorPort]: '19099',
      [firebaseEnvKeys.firestoreEmulatorPort]: '18080',
      [firebaseEnvKeys.storageEmulatorPort]: '19199',
      [firebaseEnvKeys.functionsEmulatorPort]: '15001',
      [firebaseEnvKeys.uiEmulatorPort]: '14000',
    })

    expect(emulatorConfig).toEqual({
      enabled: false,
      host: 'localhost',
      authPort: 19099,
      firestorePort: 18080,
      storagePort: 19199,
      functionsPort: 15001,
      uiPort: 14000,
    })
  })

  test('falls back to safe default ports for invalid emulator port values', () => {
    const emulatorConfig = buildFirebaseEmulatorConfig({
      [firebaseEnvKeys.authEmulatorPort]: 'abc',
      [firebaseEnvKeys.firestoreEmulatorPort]: '-1',
      [firebaseEnvKeys.storageEmulatorPort]: '70000',
      [firebaseEnvKeys.functionsEmulatorPort]: '0',
      [firebaseEnvKeys.uiEmulatorPort]: '',
    })

    expect(emulatorConfig.authPort).toBe(9099)
    expect(emulatorConfig.firestorePort).toBe(8080)
    expect(emulatorConfig.storagePort).toBe(9199)
    expect(emulatorConfig.functionsPort).toBe(5001)
    expect(emulatorConfig.uiPort).toBe(4000)
  })
})
