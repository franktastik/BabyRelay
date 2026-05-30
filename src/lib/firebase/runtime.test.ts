import { describe, expect, test } from 'bun:test'
import {
  assertFirebaseClientRuntimeBoundary,
  connectFirebaseEmulators,
  getFirebaseClientRuntimeSummary,
} from './runtime'
import { firebaseEmulatorConfig } from './config'

const productionConfig = {
  apiKey: 'prod-api-key',
  authDomain: 'babyminimo.firebaseapp.com',
  projectId: 'babyminimo-prod',
  storageBucket: 'babyminimo-prod.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:production',
}

describe('Firebase runtime switching', () => {
  test('summarizes emulator mode with Auth, Firestore, Storage, Functions, and UI endpoints', () => {
    expect(getFirebaseClientRuntimeSummary()).toEqual({
      mode: 'emulator',
      productionBoundary: {
        ok: true,
        mode: 'emulator',
        issues: [],
      },
      emulatorEndpoints: {
        auth: 'http://127.0.0.1:9099',
        firestore: 'http://127.0.0.1:8080',
        storage: 'http://127.0.0.1:9199',
        functions: 'http://127.0.0.1:5001',
        ui: 'http://127.0.0.1:4000',
        storageUi: 'http://127.0.0.1:4000/storage',
      },
    })
  })

  test('does not connect emulators when production mode is selected', () => {
    expect(
      connectFirebaseEmulators({
        ...firebaseEmulatorConfig,
        enabled: false,
      })
    ).toBe(false)
  })

  test('throws before production mode can use demo Firebase placeholders', () => {
    expect(() =>
      assertFirebaseClientRuntimeBoundary(undefined, {
        ...firebaseEmulatorConfig,
        enabled: false,
      })
    ).toThrow('Firebase production mode is not configured safely.')
  })

  test('allows production mode only with non-demo Firebase configuration', () => {
    expect(
      assertFirebaseClientRuntimeBoundary(productionConfig, {
        ...firebaseEmulatorConfig,
        enabled: false,
      })
    ).toEqual({
      ok: true,
      mode: 'production',
      issues: [],
    })
  })
})
