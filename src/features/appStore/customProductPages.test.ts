import { describe, expect, test } from 'bun:test'
import {
  CUSTOM_PRODUCT_PAGE_SCREENSHOT_COUNT,
  CUSTOM_PRODUCT_PAGES,
  PRIORITY_APP_STORE_LOCALES,
  getCustomProductPage,
  isCustomProductPageId,
} from './customProductPages'

describe('Custom Product Page registry', () => {
  test('defines six first-wave pages with stable unique IDs', () => {
    const ids = CUSTOM_PRODUCT_PAGES.map((page) => page.id)

    expect(CUSTOM_PRODUCT_PAGES).toHaveLength(6)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual([
      'newborn_tracker',
      'feeding_tracker',
      'sleep_tracker',
      'shared_baby_log',
      'memories_milestones',
      'doctor_visit_history',
    ])
  })

  test('keeps every page ready for five screenshot compositions', () => {
    for (const page of CUSTOM_PRODUCT_PAGES) {
      expect(page.screenshotMessages).toHaveLength(
        CUSTOM_PRODUCT_PAGE_SCREENSHOT_COUNT
      )
      expect(page.keywordCluster.length).toBeGreaterThan(0)
      expect(page.successMetrics.length).toBeGreaterThan(0)
    }
  })

  test('marks compliance-sensitive and feature-gated pages explicitly', () => {
    expect(getCustomProductPage('shared_baby_log')?.readiness).toBe(
      'requires_feature_release_gate'
    )
    expect(getCustomProductPage('sleep_tracker')?.readiness).toBe(
      'compliance_sensitive'
    )
    expect(getCustomProductPage('doctor_visit_history')?.readiness).toBe(
      'compliance_sensitive'
    )
  })

  test('avoids prohibited medical and sleep-result claims in screenshot copy', () => {
    const prohibited = /\b(cure|diagnose|diagnosis|treat|treatment|guarantee|fix baby sleep)\b/i

    for (const page of CUSTOM_PRODUCT_PAGES) {
      expect(page.screenshotMessages.join(' ')).not.toMatch(prohibited)
      expect(page.pageAngle).not.toMatch(prohibited)
    }
  })

  test('exposes the priority locale rollout list', () => {
    expect(PRIORITY_APP_STORE_LOCALES).toEqual([
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
    ])
  })

  test('validates page IDs at runtime for attribution parsing', () => {
    expect(isCustomProductPageId('sleep_tracker')).toBe(true)
    expect(isCustomProductPageId('sleep-tracker')).toBe(false)
  })
})
