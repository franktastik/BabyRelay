import { describe, expect, test } from 'bun:test'
import {
  getBabyMinimoTextDirection,
  getRuntimeBabyMinimoLocale,
  normalizeBabyMinimoLocale,
} from './localeRegistry'

describe('BabyMinimo locale registry', () => {
  test('normalizes region-specific app locales', () => {
    expect(normalizeBabyMinimoLocale('en-US')).toBe('en')
    expect(normalizeBabyMinimoLocale('pt-BR')).toBe('pt')
    expect(normalizeBabyMinimoLocale('zh-CN')).toBe('zh-Hans')
    expect(normalizeBabyMinimoLocale('zh-TW')).toBe('zh-Hant')
    expect(normalizeBabyMinimoLocale('nb-NO')).toBe('nb')
    expect(normalizeBabyMinimoLocale('no-NO')).toBe('nb')
    expect(normalizeBabyMinimoLocale('tl-PH')).toBe('fil')
    expect(normalizeBabyMinimoLocale('unknown')).toBeNull()
  })

  test('keeps draft locales out of runtime by default', () => {
    expect(getRuntimeBabyMinimoLocale('de')).toBe('en')
    expect(getRuntimeBabyMinimoLocale('de', { allowDraftLocales: true })).toBe('de')
  })

  test('reports text direction for RTL locales', () => {
    expect(getBabyMinimoTextDirection('ar')).toBe('rtl')
    expect(getBabyMinimoTextDirection('he')).toBe('rtl')
    expect(getBabyMinimoTextDirection('en')).toBe('ltr')
  })
})
