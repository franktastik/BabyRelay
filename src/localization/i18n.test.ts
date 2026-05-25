import { describe, expect, test } from 'bun:test'
import {
  babyMinimoI18n,
  changeBabyMinimoLanguage,
  getBabyMinimoLocaleOverride,
  setBabyMinimoLocaleOverride,
} from './i18n'

describe('BabyMinimo i18n runtime', () => {
  test('falls back to English unless draft locales are explicitly allowed', async () => {
    await changeBabyMinimoLanguage('de')
    expect(babyMinimoI18n.language).toBe('en')
    expect(getBabyMinimoLocaleOverride()).toBe('en')

    await changeBabyMinimoLanguage('de', { allowDraftLocales: true })
    expect(babyMinimoI18n.language).toBe('de')
    expect(babyMinimoI18n.t('settings.title')).toBe('Einstellungen')

    setBabyMinimoLocaleOverride(null)
  })
})
