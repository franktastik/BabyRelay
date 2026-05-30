export const CUSTOM_PRODUCT_PAGE_SCREENSHOT_COUNT = 5

export const PRIORITY_APP_STORE_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'nl',
  'pl',
  'tr',
  'ar',
] as const

export type PriorityAppStoreLocale = (typeof PRIORITY_APP_STORE_LOCALES)[number]

export type AppStoreCustomProductPageId =
  | 'newborn_tracker'
  | 'feeding_tracker'
  | 'sleep_tracker'
  | 'shared_baby_log'
  | 'memories_milestones'
  | 'doctor_visit_history'

export type AppStoreCampaignSource =
  | 'apple_search_ads'
  | 'tiktok'
  | 'instagram'
  | 'pinterest'
  | 'creator'
  | 'organic_search'
  | 'unknown'

export type AppStoreCampaignAngle =
  | 'newborn_tracking'
  | 'feeding_tracking'
  | 'sleep_tracking'
  | 'shared_care'
  | 'memories_milestones'
  | 'doctor_visit_history'

export type AppStoreFeatureActivation =
  | 'first_care_event_logged'
  | 'feeding_log_created'
  | 'sleep_log_created'
  | 'shared_log_used'
  | 'growth_moment_added'
  | 'doctor_history_reviewed'

export type AppStorePageReadiness =
  | 'ready_for_english_planning'
  | 'requires_feature_release_gate'
  | 'compliance_sensitive'

export interface AppStoreCustomProductPage {
  id: AppStoreCustomProductPageId
  title: string
  targetMotivation: string
  pageAngle: string
  screenshotMessages: readonly [
    string,
    string,
    string,
    string,
    string,
  ]
  keywordCluster: readonly string[]
  trafficSources: readonly AppStoreCampaignSource[]
  campaignAngle: AppStoreCampaignAngle
  featureActivation: AppStoreFeatureActivation
  successMetrics: readonly string[]
  readiness: AppStorePageReadiness
  complianceNotes?: readonly string[]
}

export const CUSTOM_PRODUCT_PAGES = [
  {
    id: 'newborn_tracker',
    title: 'Newborn Tracker',
    targetMotivation:
      'A new parent feels overwhelmed and needs one calm place to track everything.',
    pageAngle:
      'Track feeds, diapers, sleep, and growth in one calm baby log.',
    screenshotMessages: [
      'Everything your newborn needs, in one timeline',
      'Log feeding, diapers, sleep, and growth fast',
      'See patterns without remembering everything',
      'Share updates with your partner or care circle',
      'Feel more organized as a new parent',
    ],
    keywordCluster: ['newborn tracker', 'baby tracker', 'new parent app'],
    trafficSources: ['apple_search_ads', 'tiktok', 'instagram'],
    campaignAngle: 'newborn_tracking',
    featureActivation: 'first_care_event_logged',
    successMetrics: [
      'product_page_conversion_rate',
      'day_1_retention',
      'first_care_event_logged',
    ],
    readiness: 'ready_for_english_planning',
  },
  {
    id: 'feeding_tracker',
    title: 'Breastfeeding & Bottle Tracker',
    targetMotivation:
      'A feeding parent needs to know when and how much the baby ate.',
    pageAngle:
      'Track breastfeeding, bottle feeds, pumping, formula, and feeding history.',
    screenshotMessages: [
      'Never forget the last feed',
      'Track breast, bottle, pumping, and formula',
      'See feeding history by time and amount',
      'Share feeding logs with your partner',
      'Helpful records for doctor or midwife visits',
    ],
    keywordCluster: [
      'breastfeeding tracker',
      'bottle feeding tracker',
      'baby feeding log',
    ],
    trafficSources: ['apple_search_ads', 'tiktok', 'instagram'],
    campaignAngle: 'feeding_tracking',
    featureActivation: 'feeding_log_created',
    successMetrics: [
      'product_page_conversion_rate',
      'feeding_log_created',
      'time_to_first_feed_log',
    ],
    readiness: 'ready_for_english_planning',
  },
  {
    id: 'sleep_tracker',
    title: 'Baby Sleep Tracker',
    targetMotivation:
      'A parent wants to understand naps, night sleep, wake windows, and routines.',
    pageAngle:
      'Track sleep and notice patterns without promising sleep outcomes.',
    screenshotMessages: [
      "Understand your baby's sleep rhythm",
      'Log naps and night sleep in seconds',
      'See wake windows and sleep patterns',
      'Build a calmer daily routine',
      'Share sleep updates with your care circle',
    ],
    keywordCluster: ['baby sleep tracker', 'nap tracker', 'baby routine'],
    trafficSources: ['apple_search_ads', 'tiktok', 'instagram'],
    campaignAngle: 'sleep_tracking',
    featureActivation: 'sleep_log_created',
    successMetrics: [
      'product_page_conversion_rate',
      'sleep_log_created',
      'day_1_retention',
    ],
    readiness: 'compliance_sensitive',
    complianceNotes: [
      'Use understand, track, notice patterns, and support routines.',
      'Do not claim the app fixes sleep.',
    ],
  },
  {
    id: 'shared_baby_log',
    title: 'Shared Baby Log',
    targetMotivation:
      'Parents, partners, and household members need to stay updated together.',
    pageAngle:
      'Keep one shared baby timeline for handoffs and busy routines.',
    screenshotMessages: [
      'One baby log for the whole family',
      'Invite your partner or household member',
      'See who logged each feed, diaper, or nap',
      'No more guessing what happened today',
      'Perfect for handoffs and busy routines',
    ],
    keywordCluster: ['shared baby tracker', 'baby log for parents', 'nanny log'],
    trafficSources: ['apple_search_ads', 'instagram', 'creator'],
    campaignAngle: 'shared_care',
    featureActivation: 'shared_log_used',
    successMetrics: [
      'product_page_conversion_rate',
      'household_invite_completed',
      'shared_log_used',
    ],
    readiness: 'requires_feature_release_gate',
    complianceNotes: [
      'Do not send paid traffic here until shared household functionality is real or release-ready.',
    ],
  },
  {
    id: 'memories_milestones',
    title: 'Baby Memories & Milestones',
    targetMotivation:
      'A parent wants emotional value, not only practical tracking.',
    pageAngle:
      'Save milestones, photos, notes, and tiny daily memories.',
    screenshotMessages: [
      'Capture the moments you never want to forget',
      'Save first smiles, first steps, and daily notes',
      'Add photos to your baby timeline',
      'Mix practical logs with beautiful memories',
      "Build a gentle record of your baby's first years",
    ],
    keywordCluster: ['baby memories', 'baby milestones', 'baby photo timeline'],
    trafficSources: ['instagram', 'pinterest', 'creator'],
    campaignAngle: 'memories_milestones',
    featureActivation: 'growth_moment_added',
    successMetrics: [
      'product_page_conversion_rate',
      'growth_moment_added',
      'album_export_opened',
    ],
    readiness: 'ready_for_english_planning',
  },
  {
    id: 'doctor_visit_history',
    title: 'Doctor Visit Baby History',
    targetMotivation:
      'A parent wants accurate information before an appointment.',
    pageAngle:
      'Keep clear baby records for feeding, diapers, sleep, growth, and notes.',
    screenshotMessages: [
      'Bring better baby history to appointments',
      'Track feeding, diapers, sleep, and growth',
      'Add notes for symptoms and concerns',
      'Review patterns before doctor visits',
      'Feel prepared when asked how baby has been',
    ],
    keywordCluster: ['baby health log', 'baby doctor visit notes', 'baby history'],
    trafficSources: ['apple_search_ads', 'organic_search'],
    campaignAngle: 'doctor_visit_history',
    featureActivation: 'doctor_history_reviewed',
    successMetrics: [
      'product_page_conversion_rate',
      'notes_added',
      'doctor_history_reviewed',
    ],
    readiness: 'compliance_sensitive',
    complianceNotes: [
      'This page can track, record, review, and prepare.',
      'Do not imply diagnosis, treatment, clinical decisions, or medical outcomes.',
    ],
  },
] as const satisfies readonly AppStoreCustomProductPage[]

const customProductPageIds = new Set(
  CUSTOM_PRODUCT_PAGES.map((page) => page.id)
)

export function isCustomProductPageId(
  value: string
): value is AppStoreCustomProductPageId {
  return customProductPageIds.has(value as AppStoreCustomProductPageId)
}

export function getCustomProductPage(id: AppStoreCustomProductPageId) {
  return CUSTOM_PRODUCT_PAGES.find((page) => page.id === id)
}
