import {
  getRemoteConfigExposureProperties,
  remoteConfigKeys,
  type RemoteConfigKey,
  type RemoteConfigValues,
} from './remoteConfigRegistry'
import { remoteConfigService, type RemoteConfigService } from './remoteConfig'

export interface RemoteConfigExperimentExposure {
  key: RemoteConfigKey
  value: string
  owner: string
}

export interface RemoteConfigConsumerControls {
  onboarding: {
    variantId: RemoteConfigValues[typeof remoteConfigKeys.onboardingVariantId]
    questionnaireVariantId: RemoteConfigValues[typeof remoteConfigKeys.questionnaireVariantId]
  }
  paywall: {
    copyVariantId: RemoteConfigValues[typeof remoteConfigKeys.paywallCopyVariantId]
    layoutVariantId: RemoteConfigValues[typeof remoteConfigKeys.paywallLayoutVariantId]
    pricingSource: 'storekit'
    remotePricesAllowed: false
  }
  support: {
    helpCenterUrl: string
    contactUrl: string
  }
  notifications: {
    nudgeCopyVariantId: RemoteConfigValues[typeof remoteConfigKeys.notificationNudgeCopyVariantId]
    rateLimitVariantId: RemoteConfigValues[typeof remoteConfigKeys.notificationRateLimitVariantId]
    respectsQuietHours: true
    respectsOptOut: true
  }
  maintenance: {
    enabled: boolean
    severity: RemoteConfigValues[typeof remoteConfigKeys.maintenanceBannerSeverity]
    messageKey: string
    blocking: false
  }
  localization: {
    metadataVersion: string
  }
  marketing: {
    asoCampaignLabel: string
  }
  featureRollouts: {
    growthAlbumExportEnabled: boolean
  }
  experimentExposures: RemoteConfigExperimentExposure[]
}

export function buildRemoteConfigConsumerControls(
  values: RemoteConfigValues
): RemoteConfigConsumerControls {
  return {
    onboarding: {
      variantId: values[remoteConfigKeys.onboardingVariantId],
      questionnaireVariantId: values[remoteConfigKeys.questionnaireVariantId],
    },
    paywall: {
      copyVariantId: values[remoteConfigKeys.paywallCopyVariantId],
      layoutVariantId: values[remoteConfigKeys.paywallLayoutVariantId],
      pricingSource: 'storekit',
      remotePricesAllowed: false,
    },
    support: {
      helpCenterUrl: values[remoteConfigKeys.supportHelpCenterUrl],
      contactUrl: values[remoteConfigKeys.supportContactUrl],
    },
    notifications: {
      nudgeCopyVariantId: values[remoteConfigKeys.notificationNudgeCopyVariantId],
      rateLimitVariantId: values[remoteConfigKeys.notificationRateLimitVariantId],
      respectsQuietHours: true,
      respectsOptOut: true,
    },
    maintenance: {
      enabled: values[remoteConfigKeys.maintenanceBannerEnabled],
      severity: values[remoteConfigKeys.maintenanceBannerSeverity],
      messageKey: values[remoteConfigKeys.maintenanceBannerMessageKey],
      blocking: false,
    },
    localization: {
      metadataVersion: values[remoteConfigKeys.localizationMetadataVersion],
    },
    marketing: {
      asoCampaignLabel: values[remoteConfigKeys.asoCampaignLabel],
    },
    featureRollouts: {
      growthAlbumExportEnabled: values[remoteConfigKeys.growthAlbumExportEnabled],
    },
    experimentExposures: buildRemoteConfigExperimentExposures(values),
  }
}

export function buildRemoteConfigExperimentExposures(
  values: RemoteConfigValues
): RemoteConfigExperimentExposure[] {
  return Object.values(remoteConfigKeys).flatMap((key) => {
    const properties = getRemoteConfigExposureProperties(key, values)

    if (!properties) {
      return []
    }

    return [
      {
        key,
        value: properties.remote_config_value,
        owner: properties.remote_config_owner,
      },
    ]
  })
}

export function getRemoteConfigConsumerControls(
  service: RemoteConfigService = remoteConfigService
) {
  return buildRemoteConfigConsumerControls(service.getAll())
}
