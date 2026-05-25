import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { de } from './resources/de'
import { en } from './resources/en'
import {
  type BabyMinimoLocale,
  getRuntimeBabyMinimoLocale,
  normalizeBabyMinimoLocale,
} from './localeRegistry'

const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
}

let localeOverride: BabyMinimoLocale | null = null

function detectDeviceLocale() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale
  } catch {
    return 'en'
  }
}

export function getInitialBabyMinimoLocale(
  detectedLocale = detectDeviceLocale()
): BabyMinimoLocale {
  return getRuntimeBabyMinimoLocale(localeOverride ?? detectedLocale)
}

export function getBabyMinimoLocaleOverride() {
  return localeOverride
}

export function setBabyMinimoLocaleOverride(
  locale: string | null,
  options: { allowDraftLocales?: boolean } = {}
): BabyMinimoLocale {
  const nextLocale = locale ? getRuntimeBabyMinimoLocale(locale, options) : 'en'
  localeOverride = nextLocale
  void babyMinimoI18n.changeLanguage(nextLocale)
  return nextLocale
}

export async function changeBabyMinimoLanguage(
  locale: string,
  options: { allowDraftLocales?: boolean } = {}
): Promise<BabyMinimoLocale> {
  const normalized = normalizeBabyMinimoLocale(locale)
  const nextLocale = getRuntimeBabyMinimoLocale(normalized, options)
  localeOverride = nextLocale
  await babyMinimoI18n.changeLanguage(nextLocale)
  return nextLocale
}

export const babyMinimoI18n = i18n.createInstance()

void babyMinimoI18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'en',
  lng: getInitialBabyMinimoLocale(),
  resources,
  keySeparator: false,
  interpolation: {
    prefix: '{',
    suffix: '}',
    escapeValue: false,
  },
})

export type { BabyMinimoLocale }
