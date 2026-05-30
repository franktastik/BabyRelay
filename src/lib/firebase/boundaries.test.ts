import { describe, expect, test } from 'bun:test'
import {
  getFirebaseEmulatorEndpoints,
  getFirebaseRuntimeMode,
  isDemoFirebaseConfig,
  validateFirebaseProductionBoundary,
} from './boundaries'
import { firebaseConfig, firebaseEmulatorConfig } from './config'

const productionConfig = {
  apiKey: 'prod-api-key',
  authDomain: 'babyminimo.firebaseapp.com',
  projectId: 'babyminimo-prod',
  storageBucket: 'babyminimo-prod.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:production',
}

describe('Firebase local and production boundaries', () => {
  test('keeps emulator mode as the default local runtime', () => {
    expect(getFirebaseRuntimeMode(firebaseEmulatorConfig)).toBe('emulator')
  })

  test('allows demo Firebase placeholders only while the emulator is enabled', () => {
    const result = validateFirebaseProductionBoundary(firebaseConfig, {
      ...firebaseEmulatorConfig,
      enabled: true,
    })

    expect(result.ok).toBe(true)
    expect(result.mode).toBe('emulator')
    expect(isDemoFirebaseConfig(firebaseConfig)).toBe(true)
  })

  test('blocks production mode when demo Firebase placeholders are still present', () => {
    const result = validateFirebaseProductionBoundary(firebaseConfig, {
      ...firebaseEmulatorConfig,
      enabled: false,
    })

    expect(result.ok).toBe(false)
    expect(result.mode).toBe('production')
    expect(result.issues).toContain(
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID still uses the emulator project.'
    )
    expect(result.issues).toContain(
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN still points at localhost.'
    )
  })

  test('accepts non-demo Firebase values for production mode', () => {
    const result = validateFirebaseProductionBoundary(productionConfig, {
      ...firebaseEmulatorConfig,
      enabled: false,
    })

    expect(result).toEqual({
      ok: true,
      mode: 'production',
      issues: [],
    })
    expect(isDemoFirebaseConfig(productionConfig)).toBe(false)
  })

  test('documents local Auth, Firestore, Storage, Functions, and UI endpoints', () => {
    expect(getFirebaseEmulatorEndpoints(firebaseEmulatorConfig)).toEqual({
      auth: 'http://127.0.0.1:9099',
      firestore: 'http://127.0.0.1:8080',
      storage: 'http://127.0.0.1:9199',
      functions: 'http://127.0.0.1:5001',
      ui: 'http://127.0.0.1:4000',
      storageUi: 'http://127.0.0.1:4000/storage',
    })
  })
})
