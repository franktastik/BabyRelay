#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const localizationRoot = join(root, 'docs', 'localization')
const localeManifestPath = join(localizationRoot, 'locales.json')

const REQUIRED_SECTIONS = ['app-strings', 'metadata', 'pricing', 'screenshots']
const VALID_DIRECTIONS = new Set(['ltr', 'rtl'])
const VALID_STATUSES = new Set(['canonical', 'draft_requires_native_review'])
const VALID_MARGIN_MARKERS = new Set(['unknown', 'above_floor', 'near_floor', 'below_floor_blocked'])
const VALID_LAUNCH_DECISIONS = new Set(['candidate', 'needs_review', 'blocked'])
const PROTECTED_TOKENS = ['BabyMinimo', 'Baby MiniMemo', 'StoreKit', 'App Store', 'Firebase']
const PLACEHOLDER_PATTERN = /\{[a-zA-Z0-9_]+\}/g

const METADATA_LIMITS = {
  appName: 30,
  subtitle: 30,
  keywords: 100,
  promotionalText: 170,
  shortDescription: 80,
  positioning: 170,
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Failed to read JSON at ${filePath}: ${error.message}`)
  }
}

function flattenStringLeaves(value, prefix = '', output = new Map()) {
  if (typeof value === 'string') {
    output.set(prefix, value)
    return output
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => flattenStringLeaves(entry, `${prefix}[${index}]`, output))
    return output
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      flattenStringLeaves(nested, prefix ? `${prefix}.${key}` : key, output)
    }
  }

  return output
}

function extractPlaceholders(value) {
  return [...value.matchAll(PLACEHOLDER_PATTERN)].map((match) => match[0]).sort()
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message)
}

function compareLeafMaps({ locale, section, target, english, failures }) {
  const targetKeys = [...target.keys()].sort()
  const englishKeys = [...english.keys()].sort()
  const englishKeySet = new Set(englishKeys)
  const targetKeySet = new Set(targetKeys)

  for (const key of englishKeys) {
    assert(targetKeySet.has(key), `${section}/${locale}: missing key ${key}`, failures)
  }

  for (const key of targetKeys) {
    assert(englishKeySet.has(key), `${section}/${locale}: extra key ${key}`, failures)
  }

  for (const key of englishKeys) {
    if (!targetKeySet.has(key)) continue
    const value = target.get(key)
    assert(typeof value === 'string', `${section}/${locale}: ${key} must be a string`, failures)
    assert(value.trim().length > 0, `${section}/${locale}: ${key} is empty`, failures)

    const expectedPlaceholders = extractPlaceholders(english.get(key) ?? '').join(',')
    const actualPlaceholders = extractPlaceholders(value).join(',')
    assert(
      expectedPlaceholders === actualPlaceholders,
      `${section}/${locale}: ${key} placeholder mismatch; expected [${expectedPlaceholders}], got [${actualPlaceholders}]`,
      failures
    )
  }
}

function validateLocaleDocument({ localeEntry, section, doc, englishDoc, failures }) {
  const locale = localeEntry.code

  assert(doc.locale === locale, `${section}/${locale}: locale field must equal ${locale}`, failures)
  assert(doc.language === localeEntry.language, `${section}/${locale}: language field must equal manifest language`, failures)
  assert(doc.direction === localeEntry.direction, `${section}/${locale}: direction field must equal manifest direction`, failures)
  assert(doc.status === localeEntry.status, `${section}/${locale}: status field must equal manifest status`, failures)
  assert(doc.sourceLocale === 'en', `${section}/${locale}: sourceLocale must be en`, failures)
  assert(doc.reviewRequired === (locale !== 'en'), `${section}/${locale}: reviewRequired must match locale status`, failures)

  const payloadKey = {
    'app-strings': 'strings',
    metadata: 'metadata',
    pricing: 'pricingCopy',
    screenshots: 'headlines',
  }[section]

  assert(doc[payloadKey] && typeof doc[payloadKey] === 'object', `${section}/${locale}: missing ${payloadKey}`, failures)

  if (!doc[payloadKey] || !englishDoc[payloadKey]) return

  compareLeafMaps({
    locale,
    section,
    target: flattenStringLeaves(doc[payloadKey]),
    english: flattenStringLeaves(englishDoc[payloadKey]),
    failures,
  })
}

function validateMetadata(locale, metadata, failures) {
  for (const [field, limit] of Object.entries(METADATA_LIMITS)) {
    const value = metadata[field]
    assert(typeof value === 'string', `metadata/${locale}: ${field} must be a string`, failures)
    if (typeof value !== 'string') continue
    assert(value.length <= limit, `metadata/${locale}: ${field} length ${value.length} exceeds ${limit}`, failures)
  }

  for (const token of PROTECTED_TOKENS) {
    const appearsInEnglish = Object.values(metadata).some((value) => typeof value === 'string' && value.includes(token))
    if (!appearsInEnglish) continue
    const stillPresent = Object.values(metadata).some((value) => typeof value === 'string' && value.includes(token))
    assert(stillPresent, `metadata/${locale}: protected token ${token} is missing`, failures)
  }
}

function validatePricingMatrix(locales, failures) {
  const matrixPath = join(localizationRoot, 'pricing', 'storefront-pricing-matrix.json')
  assert(existsSync(matrixPath), 'pricing/storefront-pricing-matrix.json is missing', failures)
  if (!existsSync(matrixPath)) return

  const matrix = readJson(matrixPath)
  assert(matrix.runtimePriceSource === 'StoreKit localized product display values', 'pricing matrix must use StoreKit localized display values as runtime price source', failures)
  assert(Array.isArray(matrix.products), 'pricing matrix products must be an array', failures)
  assert(Array.isArray(matrix.storefrontTemplate), 'pricing matrix storefrontTemplate must be an array', failures)

  const requiredProducts = [
    'premium_weekly',
    'premium_monthly',
    'premium_annual',
    'premium_lifetime_25mo',
    'premium_lifetime_26mo',
    'gift_premium_1mo',
    'gift_premium_1yr',
  ]
  const productKeys = new Set((matrix.products ?? []).map((product) => product.productKey))
  for (const productKey of requiredProducts) {
    assert(productKeys.has(productKey), `pricing matrix missing product ${productKey}`, failures)
  }

  for (const product of matrix.products ?? []) {
    assert(typeof product.appStoreProductId === 'string', `pricing product ${product.productKey}: missing appStoreProductId`, failures)
    if (typeof product.appStoreProductId === 'string') {
      assert(product.appStoreProductId.startsWith('com.babyminimo.'), `pricing product ${product.productKey}: appStoreProductId must use com.babyminimo.*`, failures)
    }
  }

  const localeCodes = locales.map((locale) => locale.code)
  const storefrontByLocale = new Map((matrix.storefrontTemplate ?? []).map((entry) => [entry.locale, entry]))

  for (const locale of localeCodes) {
    const entry = storefrontByLocale.get(locale)
    assert(Boolean(entry), `pricing matrix missing storefront template for ${locale}`, failures)
    if (!entry) continue
    assert(entry.currency === 'StoreKit', `pricing matrix ${locale}: currency must be StoreKit placeholder`, failures)
    assert(entry.localizedDisplayPrice === 'StoreKit', `pricing matrix ${locale}: localizedDisplayPrice must be StoreKit placeholder`, failures)
    assert(VALID_MARGIN_MARKERS.has(entry.marginMarker), `pricing matrix ${locale}: invalid marginMarker ${entry.marginMarker}`, failures)
    assert(VALID_LAUNCH_DECISIONS.has(entry.launchDecision), `pricing matrix ${locale}: invalid launchDecision ${entry.launchDecision}`, failures)
    assert(typeof entry.estimatedMonthlyCostFloor === 'string', `pricing matrix ${locale}: missing estimatedMonthlyCostFloor`, failures)
  }

  for (const locale of storefrontByLocale.keys()) {
    assert(localeCodes.includes(locale), `pricing matrix has unknown locale ${locale}`, failures)
  }
}

function main() {
  const failures = []
  const warnings = []

  assert(existsSync(localeManifestPath), 'docs/localization/locales.json is missing', failures)
  if (!existsSync(localeManifestPath)) {
    console.error('Localization validation failed: missing locale manifest')
    process.exit(1)
  }

  const locales = readJson(localeManifestPath)
  assert(Array.isArray(locales), 'locales.json must be an array', failures)

  const seenLocales = new Set()
  for (const locale of locales) {
    assert(typeof locale.code === 'string' && locale.code.length > 0, 'locale entry missing code', failures)
    assert(typeof locale.language === 'string' && locale.language.length > 0, `${locale.code}: missing language`, failures)
    assert(VALID_DIRECTIONS.has(locale.direction), `${locale.code}: invalid direction ${locale.direction}`, failures)
    assert(VALID_STATUSES.has(locale.status), `${locale.code}: invalid status ${locale.status}`, failures)
    assert(locale.sourceLocale === 'en', `${locale.code}: sourceLocale must be en`, failures)
    assert(!seenLocales.has(locale.code), `duplicate locale ${locale.code}`, failures)
    seenLocales.add(locale.code)
  }

  const englishLocale = locales.find((locale) => locale.code === 'en')
  assert(Boolean(englishLocale), 'missing canonical en locale', failures)
  if (englishLocale) {
    assert(englishLocale.status === 'canonical', 'en locale must be canonical', failures)
    assert(englishLocale.direction === 'ltr', 'en locale must be ltr', failures)
  }

  const nonEnglishLocales = locales.filter((locale) => locale.code !== 'en')
  for (const locale of nonEnglishLocales) {
    assert(locale.status === 'draft_requires_native_review', `${locale.code}: non-English locale must be draft_requires_native_review until accepted`, failures)
  }

  for (const section of REQUIRED_SECTIONS) {
    const englishPath = join(localizationRoot, section, 'en.json')
    assert(existsSync(englishPath), `${section}/en.json is missing`, failures)
    if (!existsSync(englishPath)) continue
    const englishDoc = readJson(englishPath)

    for (const localeEntry of locales) {
      const filePath = join(localizationRoot, section, `${localeEntry.code}.json`)
      assert(existsSync(filePath), `${section}/${localeEntry.code}.json is missing`, failures)
      if (!existsSync(filePath)) continue
      const doc = readJson(filePath)
      validateLocaleDocument({ localeEntry, section, doc, englishDoc, failures })
      if (section === 'metadata' && doc.metadata) {
        validateMetadata(localeEntry.code, doc.metadata, failures)
      }
      if (localeEntry.code !== 'en') {
        const payloadKey = {
          'app-strings': 'strings',
          metadata: 'metadata',
          pricing: 'pricingCopy',
          screenshots: 'headlines',
        }[section]
        if (JSON.stringify(doc[payloadKey]) === JSON.stringify(englishDoc[payloadKey])) {
          warnings.push(`${section}/${localeEntry.code}: mirrors English source and still requires native review`)
        }
      }
    }
  }

  validatePricingMatrix(locales, failures)

  if (failures.length > 0) {
    console.error(`Localization validation failed with ${failures.length} issue(s):`)
    for (const failure of failures.slice(0, 120)) {
      console.error(`- ${failure}`)
    }
    if (failures.length > 120) {
      console.error(`... ${failures.length - 120} more issue(s) omitted`)
    }
    process.exit(1)
  }

  console.log('Localization validation passed')
  console.log(`Locales checked: ${locales.length}`)
  console.log(`Sections checked: ${REQUIRED_SECTIONS.join(', ')}`)
  console.log(`Draft mirror warnings: ${warnings.length}`)
}

main()
