export type BabyMinimoLocale =
  | 'ar'
  | 'cs'
  | 'da'
  | 'en'
  | 'et'
  | 'lt'
  | 'lv'
  | 'de'
  | 'el'
  | 'es'
  | 'fi'
  | 'fil'
  | 'fr'
  | 'he'
  | 'hr'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'ms'
  | 'nl'
  | 'nb'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sv'
  | 'th'
  | 'tr'
  | 'uk'
  | 'vi'
  | 'zh-Hans'
  | 'zh-Hant'

export type BabyMinimoLocaleStatus =
  | 'canonical'
  | 'draft_requires_ai_linguistic_qa'
  | 'ai_linguistic_qa_passed'
  | 'owner_accepted'
  | 'native_reviewed'

export interface BabyMinimoLocaleRegistryEntry {
  locale: BabyMinimoLocale
  language: string
  direction: 'ltr' | 'rtl'
  status: BabyMinimoLocaleStatus
  runtimeEnabled: boolean
  appStoreLocale: string | null
  playStoreLocale: string
}

const draft = 'draft_requires_ai_linguistic_qa' satisfies BabyMinimoLocaleStatus

export const BABY_MINIMO_LOCALES: readonly BabyMinimoLocaleRegistryEntry[] = Object.freeze([
  { locale: 'ar', language: 'Arabic', direction: 'rtl', status: draft, runtimeEnabled: false, appStoreLocale: 'ar-SA', playStoreLocale: 'ar' },
  { locale: 'cs', language: 'Czech', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'cs', playStoreLocale: 'cs-CZ' },
  { locale: 'da', language: 'Danish', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'da', playStoreLocale: 'da-DK' },
  { locale: 'en', language: 'English', direction: 'ltr', status: 'canonical', runtimeEnabled: true, appStoreLocale: 'en-US', playStoreLocale: 'en-US' },
  { locale: 'et', language: 'Estonian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'et', playStoreLocale: 'et-EE' },
  { locale: 'lt', language: 'Lithuanian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'lt', playStoreLocale: 'lt-LT' },
  { locale: 'lv', language: 'Latvian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'lv', playStoreLocale: 'lv-LV' },
  { locale: 'de', language: 'German', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'de-DE', playStoreLocale: 'de-DE' },
  { locale: 'el', language: 'Greek', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'el', playStoreLocale: 'el-GR' },
  { locale: 'es', language: 'Spanish', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'es-ES', playStoreLocale: 'es-ES' },
  { locale: 'fi', language: 'Finnish', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'fi', playStoreLocale: 'fi-FI' },
  { locale: 'fil', language: 'Filipino', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: null, playStoreLocale: 'fil-PH' },
  { locale: 'fr', language: 'French', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'fr-FR', playStoreLocale: 'fr-FR' },
  { locale: 'he', language: 'Hebrew', direction: 'rtl', status: draft, runtimeEnabled: false, appStoreLocale: 'he', playStoreLocale: 'iw-IL' },
  { locale: 'hr', language: 'Croatian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'hr', playStoreLocale: 'hr-HR' },
  { locale: 'hu', language: 'Hungarian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'hu', playStoreLocale: 'hu-HU' },
  { locale: 'id', language: 'Indonesian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'id', playStoreLocale: 'id-ID' },
  { locale: 'it', language: 'Italian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'it-IT', playStoreLocale: 'it-IT' },
  { locale: 'ja', language: 'Japanese', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'ja', playStoreLocale: 'ja-JP' },
  { locale: 'ko', language: 'Korean', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'ko', playStoreLocale: 'ko-KR' },
  { locale: 'ms', language: 'Malay', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'ms', playStoreLocale: 'ms-MY' },
  { locale: 'nl', language: 'Dutch', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'nl-NL', playStoreLocale: 'nl-NL' },
  { locale: 'nb', language: 'Norwegian Bokmal', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'no', playStoreLocale: 'no-NO' },
  { locale: 'pl', language: 'Polish', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'pl', playStoreLocale: 'pl-PL' },
  { locale: 'pt', language: 'Portuguese', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'pt-BR', playStoreLocale: 'pt-BR' },
  { locale: 'ro', language: 'Romanian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'ro', playStoreLocale: 'ro-RO' },
  { locale: 'ru', language: 'Russian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'ru', playStoreLocale: 'ru-RU' },
  { locale: 'sk', language: 'Slovak', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'sk', playStoreLocale: 'sk-SK' },
  { locale: 'sv', language: 'Swedish', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'sv', playStoreLocale: 'sv-SE' },
  { locale: 'th', language: 'Thai', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'th', playStoreLocale: 'th-TH' },
  { locale: 'tr', language: 'Turkish', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'tr', playStoreLocale: 'tr-TR' },
  { locale: 'uk', language: 'Ukrainian', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'uk', playStoreLocale: 'uk-UA' },
  { locale: 'vi', language: 'Vietnamese', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'vi', playStoreLocale: 'vi-VN' },
  { locale: 'zh-Hans', language: 'Simplified Chinese', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'zh-Hans', playStoreLocale: 'zh-CN' },
  { locale: 'zh-Hant', language: 'Traditional Chinese', direction: 'ltr', status: draft, runtimeEnabled: false, appStoreLocale: 'zh-Hant', playStoreLocale: 'zh-TW' },
])

const localeByCode = new Map(BABY_MINIMO_LOCALES.map((entry) => [entry.locale, entry]))

export function getBabyMinimoLocaleEntry(locale: string | null | undefined) {
  const normalized = normalizeBabyMinimoLocale(locale)
  return normalized ? localeByCode.get(normalized) ?? null : null
}

export function isBabyMinimoLocale(value: string | null | undefined): value is BabyMinimoLocale {
  return Boolean(value && localeByCode.has(value as BabyMinimoLocale))
}

export function normalizeBabyMinimoLocale(value: string | null | undefined): BabyMinimoLocale | null {
  if (!value) return null
  const normalized = value.replace('_', '-')

  if (isBabyMinimoLocale(normalized)) return normalized

  const lower = normalized.toLowerCase()
  if (lower === 'zh' || lower === 'zh-cn' || lower === 'zh-sg' || lower === 'zh-hans') {
    return 'zh-Hans'
  }
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || lower === 'zh-hant') {
    return 'zh-Hant'
  }
  if (lower === 'no' || lower === 'no-no' || lower === 'nb-no') {
    return 'nb'
  }
  if (lower === 'tl' || lower === 'tl-ph' || lower === 'fil-ph') {
    return 'fil'
  }

  const language = lower.split('-')[0]
  if (isBabyMinimoLocale(language)) return language

  return null
}

export function getRuntimeBabyMinimoLocale(
  preferredLocale: string | null | undefined,
  options: { allowDraftLocales?: boolean } = {}
): BabyMinimoLocale {
  const locale = normalizeBabyMinimoLocale(preferredLocale)
  if (!locale) return 'en'

  const entry = localeByCode.get(locale)
  if (!entry) return 'en'
  if (entry.runtimeEnabled || options.allowDraftLocales) return locale

  return 'en'
}

export function getBabyMinimoTextDirection(locale: string | null | undefined): 'ltr' | 'rtl' {
  return getBabyMinimoLocaleEntry(locale)?.direction ?? 'ltr'
}
