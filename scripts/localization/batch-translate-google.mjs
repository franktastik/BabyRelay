#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_SECTIONS = ['app-strings', 'metadata', 'pricing', 'screenshots']
const PAYLOAD_KEYS = {
  'app-strings': 'strings',
  metadata: 'metadata',
  pricing: 'pricingCopy',
  screenshots: 'headlines',
}
const GOOGLE_LOCALE_CODES = {
  fil: 'tl',
  nb: 'no',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
}
const PROTECTED_TOKENS = ['BabyMinimo', 'Baby MiniMemo', 'StoreKit', 'App Store', 'Firebase']
const PLACEHOLDER_PATTERN = /\{[a-zA-Z0-9_]+\}/g
const DEFAULT_DELAY_MS = 125
const METADATA_LIMITS = {
  appName: 30,
  subtitle: 30,
  keywords: 100,
  promotionalText: 170,
  shortDescription: 80,
  positioning: 170,
}

function parseArgs(argv) {
  const options = {
    locales: null,
    sections: DEFAULT_SECTIONS,
    write: false,
    receipt: true,
    delayMs: DEFAULT_DELAY_MS,
    provider: 'google-public-endpoint',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--locales') {
      options.locales = argv[++index].split(',').map((locale) => locale.trim()).filter(Boolean)
    } else if (arg === '--sections') {
      options.sections = argv[++index].split(',').map((section) => section.trim()).filter(Boolean)
    } else if (arg === '--write') {
      options.write = true
    } else if (arg === '--no-receipt') {
      options.receipt = false
    } else if (arg === '--delay-ms') {
      options.delayMs = Number(argv[++index])
    } else if (arg === '--help') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  for (const section of options.sections) {
    if (!DEFAULT_SECTIONS.includes(section)) {
      throw new Error(`Unsupported section: ${section}`)
    }
  }

  return options
}

function printHelp() {
  console.log(`Usage:
  node scripts/localization/batch-translate-google.mjs [--write] [--locales de,fr] [--sections app-strings,metadata]

Default mode is dry-run. Add --write to update docs/localization/<section>/<locale>.json.

Notes:
  - Machine translations remain draft_requires_ai_linguistic_qa.
  - Protected tokens are restored after translation.
  - {placeholders} must survive exactly.
`)
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function flattenStrings(value, prefix = '', output = []) {
  if (typeof value === 'string') {
    output.push({ key: prefix, value })
    return output
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, nested] of Object.entries(value)) {
      flattenStrings(nested, prefix ? `${prefix}.${key}` : key, output)
    }
  }

  return output
}

function setNestedValue(target, dottedKey, value) {
  if (Object.prototype.hasOwnProperty.call(target, dottedKey)) {
    target[dottedKey] = value
    return
  }

  const parts = dottedKey.split('.')
  let cursor = target
  for (const part of parts.slice(0, -1)) {
    cursor = cursor[part]
  }
  cursor[parts.at(-1)] = value
}

function extractPlaceholders(value) {
  return [...value.matchAll(PLACEHOLDER_PATTERN)].map((match) => match[0]).sort()
}

function protectText(value) {
  const replacements = []
  let protectedValue = value

  const addReplacement = (raw) => {
    const marker = `BMINIMO${replacements.length}TOKEN`
    replacements.push({ marker, raw })
    protectedValue = protectedValue.split(raw).join(marker)
  }

  for (const token of PROTECTED_TOKENS) {
    if (protectedValue.includes(token)) addReplacement(token)
  }

  for (const placeholder of extractPlaceholders(value)) {
    if (protectedValue.includes(placeholder)) addReplacement(placeholder)
  }

  return { protectedValue, replacements }
}

function restoreText(value, replacements) {
  let restored = value
  for (const { marker, raw } of replacements) {
    restored = restored.replace(new RegExp(marker, 'gi'), raw)
  }
  return restored
}

function googleLocale(locale) {
  return GOOGLE_LOCALE_CODES[locale] ?? locale
}

async function translateText(value, locale) {
  if (!value.trim()) return value
  if (PROTECTED_TOKENS.includes(value.trim())) return value

  const { protectedValue, replacements } = protectText(value)
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: googleLocale(locale),
    dt: 't',
    q: protectedValue,
  })

  let response
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`)
    if (response.ok) break
    if (attempt < 3) await sleep(500 * attempt)
  }

  if (!response?.ok) {
    throw new Error(`Google Translate request failed for ${locale}: ${response?.status} ${response?.statusText}`)
  }

  const body = await response.json()
  const translated = Array.isArray(body?.[0]) ? body[0].map((part) => part[0]).join('') : protectedValue
  return restoreText(translated, replacements)
}

function assertTranslationShape({ source, translated, section, locale, key }) {
  const sourcePlaceholders = extractPlaceholders(source).join(',')
  const translatedPlaceholders = extractPlaceholders(translated).join(',')
  if (sourcePlaceholders !== translatedPlaceholders) {
    throw new Error(
      `${section}/${locale}:${key} placeholder mismatch; expected [${sourcePlaceholders}], got [${translatedPlaceholders}]`
    )
  }

  for (const token of PROTECTED_TOKENS) {
    if (source.includes(token) && !translated.includes(token)) {
      throw new Error(`${section}/${locale}:${key} lost protected token ${token}`)
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function translatePayload({ sourcePayload, section, locale, delayMs }) {
  const translatedPayload = structuredClone(sourcePayload)
  const entries = flattenStrings(sourcePayload)
  const sample = []

  for (const entry of entries) {
    let translated = await translateText(entry.value, locale)
    try {
      assertTranslationShape({ source: entry.value, translated, section, locale, key: entry.key })
    } catch {
      translated = entry.value
    }
    setNestedValue(translatedPayload, entry.key, translated)
    if (sample.length < 5) sample.push({ key: entry.key, source: entry.value, translated })
    if (delayMs > 0) await sleep(delayMs)
  }

  if (section === 'metadata') {
    for (const [field, limit] of Object.entries(METADATA_LIMITS)) {
      if (typeof translatedPayload[field] === 'string' && translatedPayload[field].length > limit) {
        translatedPayload[field] = sourcePayload[field]
      }
    }
  }

  return { translatedPayload, leafCount: entries.length, sample }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const root = process.cwd()
  const localizationRoot = join(root, 'docs', 'localization')
  const locales = readJson(join(localizationRoot, 'locales.json'))
  const targetLocales = (options.locales ?? locales.map((locale) => locale.code))
    .filter((locale) => locale !== 'en')

  const localeByCode = new Map(locales.map((locale) => [locale.code, locale]))
  const missingLocales = targetLocales.filter((locale) => !localeByCode.has(locale))
  if (missingLocales.length > 0) {
    throw new Error(`Unknown locales: ${missingLocales.join(', ')}`)
  }

  const receipt = {
    generatedAt: new Date().toISOString(),
    provider: options.provider,
    mode: options.write ? 'write' : 'dry-run',
    locales: targetLocales,
    sections: options.sections,
    protectedTokens: PROTECTED_TOKENS,
    delayMs: options.delayMs,
    results: [],
  }

  for (const section of options.sections) {
    const payloadKey = PAYLOAD_KEYS[section]
    const englishDoc = readJson(join(localizationRoot, section, 'en.json'))

    for (const locale of targetLocales) {
      const localeEntry = localeByCode.get(locale)
      const { translatedPayload, leafCount, sample } = await translatePayload({
        sourcePayload: englishDoc[payloadKey],
        section,
        locale,
        delayMs: options.delayMs,
      })

      const targetDoc = {
        locale,
        language: localeEntry.language,
        direction: localeEntry.direction,
        status: localeEntry.status,
        reviewRequired: locale !== 'en',
        sourceLocale: 'en',
        [payloadKey]: translatedPayload,
      }

      if (options.write) {
        writeJson(join(localizationRoot, section, `${locale}.json`), targetDoc)
      }

      receipt.results.push({ locale, section, leafCount, sample })
      console.log(`${options.write ? 'Wrote' : 'Prepared'} ${section}/${locale} (${leafCount} strings)`)
    }
  }

  if (options.receipt) {
    const receiptDir = join(localizationRoot, 'translation-receipts')
    mkdirSync(receiptDir, { recursive: true })
    const receiptName = `${receipt.generatedAt.replace(/[:.]/g, '-')}-${options.write ? 'write' : 'dry-run'}.json`
    const receiptPath = join(receiptDir, receiptName)
    writeJson(receiptPath, receipt)
    console.log(`Receipt: ${receiptPath}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
