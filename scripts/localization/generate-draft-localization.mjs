import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'docs', 'localization')

const locales = [
  ['ar', 'Arabic', 'rtl'],
  ['cs', 'Czech', 'ltr'],
  ['da', 'Danish', 'ltr'],
  ['en', 'English', 'ltr'],
  ['et', 'Estonian', 'ltr'],
  ['lt', 'Lithuanian', 'ltr'],
  ['lv', 'Latvian', 'ltr'],
  ['de', 'German', 'ltr'],
  ['el', 'Greek', 'ltr'],
  ['es', 'Spanish', 'ltr'],
  ['fi', 'Finnish', 'ltr'],
  ['fil', 'Filipino', 'ltr'],
  ['fr', 'French', 'ltr'],
  ['he', 'Hebrew', 'rtl'],
  ['hr', 'Croatian', 'ltr'],
  ['hu', 'Hungarian', 'ltr'],
  ['id', 'Indonesian', 'ltr'],
  ['it', 'Italian', 'ltr'],
  ['ja', 'Japanese', 'ltr'],
  ['ko', 'Korean', 'ltr'],
  ['ms', 'Malay', 'ltr'],
  ['nl', 'Dutch', 'ltr'],
  ['nb', 'Norwegian Bokmal', 'ltr'],
  ['pl', 'Polish', 'ltr'],
  ['pt', 'Portuguese', 'ltr'],
  ['ro', 'Romanian', 'ltr'],
  ['ru', 'Russian', 'ltr'],
  ['sk', 'Slovak', 'ltr'],
  ['sv', 'Swedish', 'ltr'],
  ['th', 'Thai', 'ltr'],
  ['tr', 'Turkish', 'ltr'],
  ['uk', 'Ukrainian', 'ltr'],
  ['vi', 'Vietnamese', 'ltr'],
  ['zh-Hans', 'Simplified Chinese', 'ltr'],
  ['zh-Hant', 'Traditional Chinese', 'ltr'],
]

const englishStrings = {
  'auth.login.productName': 'Baby MiniMemo',
  'auth.login.tagline': 'Tiny moments. Calm care.',
  'auth.login.hero': 'Coordinating baby care, one memo at a time.',
  'auth.login.appleButton': 'Continue with Apple',
  'auth.login.googleButton': 'Continue with Google',
  'auth.login.emailLabel': 'Household email',
  'auth.login.passwordLabel': 'Secure password',
  'auth.login.submit': 'Sign in',
  'auth.login.signupPrompt': 'New family?',
  'auth.login.signupLink': 'Start your care circle',
  'onboarding.goalQuestion.title': 'What do you need help with first?',
  'onboarding.goalQuestion.subtitle': 'Pick the care rhythm that matters most right now.',
  'onboarding.painPoints.title': 'What feels hardest right now?',
  'onboarding.painPoints.subtitle':
    'Choose anything that sounds familiar. This helps us shape your first handoff preview.',
  'home.title': "Leo's Relay",
  'home.synced': 'Synced just now',
  'timeline.title': 'Timeline',
  'timeline.filter.all': 'All Events',
  'timeline.filter.growth': 'Growth',
  'handoff.title': 'Handoff',
  'reminders.title': 'Reminders',
  'family.title': 'Family & Household',
  'settings.title': 'Settings',
  'settings.plans': 'Plans',
  'account.signOut': 'Sign out',
  'paywall.title': 'Unlock calm baby care',
  'paywall.subtitle': 'Keep feeds, sleep, diapers, memories, and handoffs in one shared place.',
  'paywall.benefit.handoff': 'Shared handoff history',
  'paywall.benefit.logs': 'Unlimited care logs',
  'paywall.benefit.reminders': 'Gentle reminders',
  'paywall.benefit.photos': 'Local photo memories',
  'paywall.benefit.caregivers': 'Caregiver coordination',
  'paywall.plan.annual.name': 'Annual',
  'paywall.plan.monthly.name': 'Monthly',
  'paywall.plan.weekly.name': 'Weekly',
  'paywall.cta.trial': 'Try 3 Days Free',
  'paywall.cta.continue': 'Continue',
  'paywall.restore': 'Restore',
  'notifications.reminder.title': 'BabyMinimo reminder',
  'notifications.reminder.body': '{title} is due soon.',
  'widgets.currentState.ready': 'Current baby status',
  'widgets.currentState.signedOut': 'Sign in to BabyMinimo',
  'errors.generic.title': 'Something went wrong',
  'errors.generic.retry': 'Try again',
}

const metadata = {
  appName: 'BabyMinimo: Baby Tracker',
  subtitle: 'Feeding, sleep & diaper log',
  keywords: 'newborn,feeding,sleep,diaper,baby log,baby journal,milestone,tracker,caregiver,handoff,reminder',
  promotionalText: 'Track feeding, sleep, diapers, memories, and handoffs in one calm baby log.',
  shortDescription: 'Track feeds, sleep, diapers, milestones and caregiver handoffs in one baby log.',
  positioning: 'The calm baby log for feeding, sleep, diapers, memories, and caregiver handoffs.',
}

const screenshotHeadlines = {
  home: 'Know what happened last',
  handoff: 'Handoff in seconds',
  timeline: 'Every care moment in one place',
  growth: 'Tiny memories, saved locally',
  reminders: 'Gentle nudges for due-soon care',
  family: 'Keep the care circle in sync',
  paywall: 'Unlock calm baby care',
}

const pricingCopy = {
  period: {
    weekly: 'per week',
    monthly: 'per month',
    annual: 'per year',
    lifetime: 'one time',
  },
  trial: {
    threeDayFree: '3-day free trial',
    thenPricePerPeriod: 'Then {price} {period}',
  },
  savings: {
    template: 'Save {percent}%',
    annualDefault: 'Save 65%',
  },
  restore: 'Restore purchases',
  manage: 'Manage subscription',
  cancellation: 'Cancel anytime in App Store subscriptions.',
}

mkdirSync(outDir, { recursive: true })
mkdirSync(join(outDir, 'app-strings'), { recursive: true })
mkdirSync(join(outDir, 'metadata'), { recursive: true })
mkdirSync(join(outDir, 'screenshots'), { recursive: true })
mkdirSync(join(outDir, 'pricing'), { recursive: true })

const localeManifest = locales.map(([code, language, direction]) => ({
  code,
  language,
  direction,
  status: code === 'en' ? 'canonical' : 'draft_requires_native_review',
  sourceLocale: 'en',
}))

writeFileSync(join(outDir, 'locales.json'), `${JSON.stringify(localeManifest, null, 2)}\n`)

for (const [code, language, direction] of locales) {
  const status = code === 'en' ? 'canonical' : 'draft_requires_native_review'
  const localized = {
    locale: code,
    language,
    direction,
    status,
    reviewRequired: code !== 'en',
    sourceLocale: 'en',
    strings: englishStrings,
  }
  const localizedMetadata = {
    locale: code,
    language,
    direction,
    status,
    reviewRequired: code !== 'en',
    sourceLocale: 'en',
    metadata,
  }
  const localizedScreenshots = {
    locale: code,
    language,
    direction,
    status,
    reviewRequired: code !== 'en',
    sourceLocale: 'en',
    headlines: screenshotHeadlines,
  }
  const localizedPricing = {
    locale: code,
    language,
    direction,
    status,
    reviewRequired: code !== 'en',
    sourceLocale: 'en',
    pricingCopy,
  }

  writeFileSync(join(outDir, 'app-strings', `${code}.json`), `${JSON.stringify(localized, null, 2)}\n`)
  writeFileSync(join(outDir, 'metadata', `${code}.json`), `${JSON.stringify(localizedMetadata, null, 2)}\n`)
  writeFileSync(join(outDir, 'screenshots', `${code}.json`), `${JSON.stringify(localizedScreenshots, null, 2)}\n`)
  writeFileSync(join(outDir, 'pricing', `${code}.json`), `${JSON.stringify(localizedPricing, null, 2)}\n`)
}

const storefrontPricing = {
  source: 'planning',
  runtimePriceSource: 'StoreKit localized product display values',
  products: [
    {
      productKey: 'premium_weekly',
      appStoreProductId: 'com.babyminimo.premium.weekly',
      type: 'auto_renewable_subscription',
      planningPriceUsd: 3.99,
      role: 'experiment_or_fallback',
    },
    {
      productKey: 'premium_monthly',
      appStoreProductId: 'com.babyminimo.premium.monthly',
      type: 'auto_renewable_subscription',
      planningPriceUsd: 9.99,
      role: 'comparison_baseline',
    },
    {
      productKey: 'premium_annual',
      appStoreProductId: 'com.babyminimo.premium.annual',
      type: 'auto_renewable_subscription',
      planningPriceUsd: 39.99,
      role: 'default_recommended',
      savingsBadgeCandidate: 'Save 65%',
    },
    {
      productKey: 'premium_lifetime_25mo',
      appStoreProductId: 'com.babyminimo.premium.lifetime25',
      type: 'non_consumable',
      planningPriceUsd: 249.75,
      role: 'research_candidate',
    },
    {
      productKey: 'premium_lifetime_26mo',
      appStoreProductId: 'com.babyminimo.premium.lifetime26',
      type: 'non_consumable',
      planningPriceUsd: 259.74,
      role: 'research_candidate',
    },
    {
      productKey: 'gift_premium_1mo',
      appStoreProductId: 'com.babyminimo.gift.premium.1mo',
      type: 'gift_entitlement_candidate',
      role: 'research_candidate',
    },
    {
      productKey: 'gift_premium_1yr',
      appStoreProductId: 'com.babyminimo.gift.premium.1yr',
      type: 'gift_entitlement_candidate',
      role: 'research_candidate',
    },
  ],
  storefrontTemplate: localeManifest.map(({ code, language, direction, status }) => ({
    locale: code,
    language,
    direction,
    status,
    countryOrRegion: 'TBD',
    currency: 'StoreKit',
    applePricePointId: 'TBD',
    localizedDisplayPrice: 'StoreKit',
    localizedBillingPeriod: 'draft',
    taxVatDisplayAssumption: 'TBD',
    estimatedMonthlyCostFloor: 'TBD',
    marginMarker: 'unknown',
    launchDecision: code === 'en' ? 'candidate' : 'needs_review',
  })),
}

writeFileSync(join(outDir, 'pricing', 'storefront-pricing-matrix.json'), `${JSON.stringify(storefrontPricing, null, 2)}\n`)

console.log(`Generated ${locales.length} locale draft sets in ${outDir}`)
