export const remoteConfigKeys = {
  onboardingVariantId: 'onboarding.variantId',
  questionnaireVariantId: 'questionnaire.variantId',
  paywallCopyVariantId: 'paywall.copyVariantId',
  paywallLayoutVariantId: 'paywall.layoutVariantId',
  notificationNudgeCopyVariantId: 'notification.nudgeCopyVariantId',
  notificationRateLimitVariantId: 'notification.rateLimitVariantId',
  supportHelpCenterUrl: 'support.helpCenterUrl',
  supportContactUrl: 'support.contactUrl',
  maintenanceBannerEnabled: 'maintenance.bannerEnabled',
  maintenanceBannerSeverity: 'maintenance.bannerSeverity',
  maintenanceBannerMessageKey: 'maintenance.bannerMessageKey',
  localizationMetadataVersion: 'localization.metadataVersion',
  asoCampaignLabel: 'aso.campaignLabel',
  growthAlbumExportEnabled: 'features.growthAlbumExportEnabled',
} as const

type RemoteConfigValueType = 'boolean' | 'enum' | 'string' | 'url'

interface RemoteConfigRegistryBase<TDefault> {
  valueType: RemoteConfigValueType
  defaultValue: TDefault
  owner: string
  rolloutPlan: string
  rollbackPlan: string
  releaseRisk: 'low' | 'medium'
  description: string
  exposureEvent?: boolean
  maxLength?: number
}

type BooleanRegistryEntry = RemoteConfigRegistryBase<boolean> & {
  valueType: 'boolean'
}

type StringRegistryEntry = RemoteConfigRegistryBase<string> & {
  valueType: 'string' | 'url'
}

type EnumRegistryEntry<TAllowed extends readonly string[]> =
  RemoteConfigRegistryBase<TAllowed[number]> & {
    valueType: 'enum'
    allowedValues: TAllowed
  }

type RemoteConfigRegistryEntry =
  | BooleanRegistryEntry
  | StringRegistryEntry
  | EnumRegistryEntry<readonly string[]>

export const remoteConfigRegistry = {
  [remoteConfigKeys.onboardingVariantId]: {
    valueType: 'enum',
    defaultValue: 'default',
    allowedValues: ['default', 'sleep-first', 'feeding-first', 'partner-first'],
    owner: 'Growth',
    rolloutPlan: 'Ship default first, then roll out one onboarding order test at a time.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'medium',
    description: 'Selects a non-critical onboarding copy/order variant.',
    exposureEvent: true,
  },
  [remoteConfigKeys.questionnaireVariantId]: {
    valueType: 'enum',
    defaultValue: 'default',
    allowedValues: ['default', 'short', 'care-circle-first'],
    owner: 'Growth',
    rolloutPlan: 'Roll out to a small cohort after onboarding analytics are verified.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'medium',
    description: 'Selects the onboarding questionnaire variant.',
    exposureEvent: true,
  },
  [remoteConfigKeys.paywallCopyVariantId]: {
    valueType: 'enum',
    defaultValue: 'default',
    allowedValues: ['default', 'value-led', 'annual-focus'],
    owner: 'Revenue',
    rolloutPlan: 'Use only for copy experiments after StoreKit products are verified.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'medium',
    description: 'Selects paywall copy variant. It must not contain prices.',
    exposureEvent: true,
  },
  [remoteConfigKeys.paywallLayoutVariantId]: {
    valueType: 'enum',
    defaultValue: 'default',
    allowedValues: ['default', 'compact', 'comparison'],
    owner: 'Revenue',
    rolloutPlan: 'Use for visual layout experiments with StoreKit price labels still live.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'medium',
    description: 'Selects paywall layout variant. StoreKit remains the price source.',
    exposureEvent: true,
  },
  [remoteConfigKeys.notificationNudgeCopyVariantId]: {
    valueType: 'enum',
    defaultValue: 'default',
    allowedValues: ['default', 'gentle', 'direct'],
    owner: 'Lifecycle',
    rolloutPlan: 'Roll out after opt-out, quiet-hours, and rate limits are verified.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'medium',
    description: 'Selects notification nudge copy while local notification policy still gates delivery.',
    exposureEvent: true,
  },
  [remoteConfigKeys.notificationRateLimitVariantId]: {
    valueType: 'enum',
    defaultValue: 'default',
    allowedValues: ['default', 'quiet', 'reduced'],
    owner: 'Lifecycle',
    rolloutPlan: 'Roll out reduced-frequency variants before any higher-frequency experiment.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'medium',
    description: 'Selects non-critical notification rate-limit preset.',
  },
  [remoteConfigKeys.supportHelpCenterUrl]: {
    valueType: 'url',
    defaultValue: 'https://babyminimo.example/help',
    owner: 'Support',
    rolloutPlan: 'Change only after the destination is live and localized.',
    rollbackPlan: 'Restore the default support URL.',
    releaseRisk: 'low',
    description: 'Public support help center link.',
    maxLength: 240,
  },
  [remoteConfigKeys.supportContactUrl]: {
    valueType: 'url',
    defaultValue: 'https://babyminimo.example/contact',
    owner: 'Support',
    rolloutPlan: 'Change only after the destination is live and localized.',
    rollbackPlan: 'Restore the default contact URL.',
    releaseRisk: 'low',
    description: 'Public support contact link.',
    maxLength: 240,
  },
  [remoteConfigKeys.maintenanceBannerEnabled]: {
    valueType: 'boolean',
    defaultValue: false,
    owner: 'Support',
    rolloutPlan: 'Enable for non-blocking incident or maintenance messaging only.',
    rollbackPlan: 'Set to false.',
    releaseRisk: 'medium',
    description: 'Shows a non-blocking maintenance banner.',
  },
  [remoteConfigKeys.maintenanceBannerSeverity]: {
    valueType: 'enum',
    defaultValue: 'info',
    allowedValues: ['info', 'warning'],
    owner: 'Support',
    rolloutPlan: 'Use warning only for active incidents with approved copy.',
    rollbackPlan: 'Set back to info or disable the banner.',
    releaseRisk: 'medium',
    description: 'Controls non-blocking banner severity.',
  },
  [remoteConfigKeys.maintenanceBannerMessageKey]: {
    valueType: 'string',
    defaultValue: 'maintenance.default',
    owner: 'Support',
    rolloutPlan: 'Use runtime i18n keys only; never store incident copy directly.',
    rollbackPlan: 'Set back to maintenance.default.',
    releaseRisk: 'medium',
    description: 'Runtime i18n key for a non-blocking maintenance banner.',
    maxLength: 80,
  },
  [remoteConfigKeys.localizationMetadataVersion]: {
    valueType: 'string',
    defaultValue: '2026-05-29',
    owner: 'Localization',
    rolloutPlan: 'Bump after localized metadata assets are approved.',
    rollbackPlan: 'Restore the prior approved version string.',
    releaseRisk: 'low',
    description: 'Pointer to approved localized metadata/config version.',
    maxLength: 40,
  },
  [remoteConfigKeys.asoCampaignLabel]: {
    valueType: 'string',
    defaultValue: 'default',
    owner: 'Growth',
    rolloutPlan: 'Use only for non-PII campaign labeling and analytics grouping.',
    rollbackPlan: 'Set back to default.',
    releaseRisk: 'low',
    description: 'Non-PII App Store campaign label.',
    maxLength: 64,
  },
  [remoteConfigKeys.growthAlbumExportEnabled]: {
    valueType: 'boolean',
    defaultValue: false,
    owner: 'Product',
    rolloutPlan: 'Enable only after local export QA and heavy-data lifecycle checks pass.',
    rollbackPlan: 'Set to false.',
    releaseRisk: 'medium',
    description: 'Non-critical local Growth Album export rollout switch.',
  },
} as const satisfies Record<string, RemoteConfigRegistryEntry>

export type RemoteConfigKey = keyof typeof remoteConfigRegistry

type ValueForEntry<TEntry> = TEntry extends { valueType: 'boolean' }
  ? boolean
  : TEntry extends { allowedValues: readonly (infer TAllowed)[] }
    ? TAllowed
    : string

export type RemoteConfigValues = {
  [TKey in RemoteConfigKey]: ValueForEntry<(typeof remoteConfigRegistry)[TKey]>
}

export const remoteConfigDefaults = Object.fromEntries(
  Object.entries(remoteConfigRegistry).map(([key, entry]) => [key, entry.defaultValue])
) as RemoteConfigValues

export function isRemoteConfigKey(key: string): key is RemoteConfigKey {
  return key in remoteConfigRegistry
}

export function validateRemoteConfigValues(
  values: Record<string, unknown>,
  defaults: RemoteConfigValues = remoteConfigDefaults
) {
  const nextValues: RemoteConfigValues = { ...defaults }
  const ignoredKeys: string[] = []

  for (const [key, rawValue] of Object.entries(values)) {
    if (!isRemoteConfigKey(key)) {
      ignoredKeys.push(key)
      continue
    }

    const entry = remoteConfigRegistry[key]
    const parsedValue = parseRemoteConfigValue(entry, rawValue)

    if (parsedValue.valid) {
      nextValues[key] = parsedValue.value as never
    } else {
      ignoredKeys.push(key)
    }
  }

  return {
    values: nextValues,
    ignoredKeys,
  }
}

function parseRemoteConfigValue(entry: RemoteConfigRegistryEntry, rawValue: unknown) {
  if (entry.valueType === 'boolean') {
    if (typeof rawValue === 'boolean') {
      return { valid: true, value: rawValue }
    }

    if (typeof rawValue === 'string') {
      if (rawValue === 'true') {
        return { valid: true, value: true }
      }
      if (rawValue === 'false') {
        return { valid: true, value: false }
      }
    }

    return { valid: false }
  }

  if (typeof rawValue !== 'string') {
    return { valid: false }
  }

  const value = rawValue.trim()

  if (entry.maxLength && value.length > entry.maxLength) {
    return { valid: false }
  }

  if (entry.valueType === 'enum') {
    return entry.allowedValues.includes(value)
      ? { valid: true, value }
      : { valid: false }
  }

  if (entry.valueType === 'url') {
    return /^https:\/\/[^\s]+$/u.test(value)
      ? { valid: true, value }
      : { valid: false }
  }

  return value.length > 0 ? { valid: true, value } : { valid: false }
}

export function getRemoteConfigExposureProperties(
  key: RemoteConfigKey,
  values: RemoteConfigValues
) {
  const entry = remoteConfigRegistry[key]

  if (!('exposureEvent' in entry) || !entry.exposureEvent) {
    return undefined
  }

  return {
    remote_config_key: key,
    remote_config_value: String(values[key]),
    remote_config_owner: entry.owner,
  }
}

export function assertRemoteConfigPricingBoundary() {
  const forbiddenPattern = /price|amount|currency|entitlement|subscription|productId/i
  const forbiddenKeys = Object.keys(remoteConfigRegistry).filter((key) =>
    forbiddenPattern.test(key)
  )

  if (forbiddenKeys.length > 0) {
    throw new Error(
      `Remote Config cannot own pricing, entitlement, or product identity keys: ${forbiddenKeys.join(', ')}`
    )
  }
}
