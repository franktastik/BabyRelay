import type {
  AppStoreCampaignAngle,
  AppStoreCampaignSource,
  AppStoreCustomProductPageId,
  AppStoreFeatureActivation,
} from '../appStore/customProductPages'
import { trackEvent } from './analytics'

export interface AppStoreAttributionInput {
  appStorePage: AppStoreCustomProductPageId
  campaignSource: AppStoreCampaignSource
  campaignAngle: AppStoreCampaignAngle
  locale: string
}

export interface AppStoreFeatureActivationInput {
  feature: AppStoreFeatureActivation
  appStorePage: AppStoreCustomProductPageId
  campaignSource?: AppStoreCampaignSource
  campaignAngle?: AppStoreCampaignAngle
  locale?: string
  attributedAt?: string
  activatedAt?: string
}

export function trackAppStoreAttribution(input: AppStoreAttributionInput) {
  trackEvent('app_store_attribution_received', {
    app_store_page: input.appStorePage,
    campaign_source: input.campaignSource,
    campaign_angle: input.campaignAngle,
    locale: input.locale,
  })
}

export function trackAppStoreFeatureActivation(
  input: AppStoreFeatureActivationInput
) {
  trackEvent('feature_activated', {
    feature: input.feature,
    app_store_page: input.appStorePage,
    campaign_source: input.campaignSource ?? null,
    campaign_angle: input.campaignAngle ?? null,
    locale: input.locale ?? null,
    time_to_activation_minutes: getTimeToActivationMinutes(
      input.attributedAt,
      input.activatedAt
    ),
  })
}

function getTimeToActivationMinutes(
  attributedAt?: string,
  activatedAt?: string
) {
  if (!attributedAt || !activatedAt) {
    return null
  }

  const attributedTime = Date.parse(attributedAt)
  const activatedTime = Date.parse(activatedAt)

  if (Number.isNaN(attributedTime) || Number.isNaN(activatedTime)) {
    return null
  }

  return Math.max(0, Math.round((activatedTime - attributedTime) / 60000))
}
