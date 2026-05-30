import type { FirebaseApp } from 'firebase/app'
import { firebaseApp } from './app'
import {
  remoteConfigDefaults,
  validateRemoteConfigValues,
  type RemoteConfigKey,
  type RemoteConfigValues,
} from './remoteConfigRegistry'

export const remoteConfigFetchDefaults = {
  minimumFetchIntervalMs: 60 * 60 * 1000,
  staleAfterMs: 24 * 60 * 60 * 1000,
} as const

export type RemoteConfigSource = 'defaults' | 'dev' | 'firebase'

export interface RemoteConfigProviderSnapshot {
  values: Record<string, unknown>
  fetchedAt?: number
  source?: RemoteConfigSource
}

export interface RemoteConfigProvider {
  fetchAndActivate: () => Promise<RemoteConfigProviderSnapshot>
}

export type RemoteConfigRefreshStatus =
  | 'activated'
  | 'defaults'
  | 'stale-cache'

export interface RemoteConfigRefreshResult {
  status: RemoteConfigRefreshStatus
  values: RemoteConfigValues
  ignoredKeys: string[]
  source: RemoteConfigSource
  fetchedAt?: number
  error?: unknown
}

export interface CreateRemoteConfigServiceInput {
  provider?: RemoteConfigProvider
  defaults?: RemoteConfigValues
  now?: () => number
  staleAfterMs?: number
}

export interface RemoteConfigService {
  getAll: () => RemoteConfigValues
  getValue: <TKey extends RemoteConfigKey>(key: TKey) => RemoteConfigValues[TKey]
  refresh: () => Promise<RemoteConfigRefreshResult>
}

export function createStaticRemoteConfigProvider(
  values: Record<string, unknown> = remoteConfigDefaults,
  source: RemoteConfigSource = 'dev'
): RemoteConfigProvider {
  return {
    async fetchAndActivate() {
      return {
        values,
        fetchedAt: Date.now(),
        source,
      }
    },
  }
}

export function createRemoteConfigService({
  provider = createStaticRemoteConfigProvider(),
  defaults = remoteConfigDefaults,
  now = Date.now,
  staleAfterMs = remoteConfigFetchDefaults.staleAfterMs,
}: CreateRemoteConfigServiceInput = {}): RemoteConfigService {
  let currentValues: RemoteConfigValues = { ...defaults }
  let lastSuccessfulResult: RemoteConfigRefreshResult | undefined

  return {
    getAll() {
      return { ...currentValues }
    },
    getValue(key) {
      return currentValues[key]
    },
    async refresh() {
      try {
        const snapshot = await provider.fetchAndActivate()
        const validated = validateRemoteConfigValues(snapshot.values, defaults)
        const fetchedAt = snapshot.fetchedAt ?? now()
        currentValues = validated.values

        const result: RemoteConfigRefreshResult = {
          status: 'activated',
          values: { ...currentValues },
          ignoredKeys: validated.ignoredKeys,
          source: snapshot.source ?? 'firebase',
          fetchedAt,
        }
        lastSuccessfulResult = result
        return result
      } catch (error) {
        if (
          lastSuccessfulResult &&
          lastSuccessfulResult.fetchedAt !== undefined &&
          now() - lastSuccessfulResult.fetchedAt <= staleAfterMs
        ) {
          return {
            ...lastSuccessfulResult,
            status: 'stale-cache',
            values: { ...currentValues },
            error,
          }
        }

        currentValues = { ...defaults }
        return {
          status: 'defaults',
          values: { ...currentValues },
          ignoredKeys: [],
          source: 'defaults',
          error,
        }
      }
    },
  }
}

export async function createFirebaseRemoteConfigProvider(
  app: FirebaseApp = firebaseApp,
  options: { minimumFetchIntervalMs?: number } = {}
): Promise<RemoteConfigProvider> {
  const { fetchAndActivate, getAll, getRemoteConfig } = await import(
    'firebase/remote-config'
  )
  const remoteConfig = getRemoteConfig(app)

  remoteConfig.settings = {
    fetchTimeoutMillis: 60 * 1000,
    minimumFetchIntervalMillis:
      options.minimumFetchIntervalMs ??
      remoteConfigFetchDefaults.minimumFetchIntervalMs,
  }
  remoteConfig.defaultConfig = remoteConfigDefaults as Record<
    string,
    string | number | boolean
  >

  return {
    async fetchAndActivate() {
      await fetchAndActivate(remoteConfig)
      const allValues = getAll(remoteConfig)
      const values = Object.fromEntries(
        Object.entries(allValues).map(([key, value]) => [key, value.asString()])
      )

      return {
        values,
        fetchedAt: Date.now(),
        source: 'firebase',
      }
    },
  }
}

export const remoteConfigService = createRemoteConfigService()
