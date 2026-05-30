import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const strict = process.argv.includes('--strict')
const asJson = process.argv.includes('--json')

const readText = (path) => readFileSync(resolve(root, path), 'utf8')
const appConfig = JSON.parse(readText('app.json')).expo
const infoPlist = readText('ios/BabyMinimo/Info.plist')
const privacyManifest = readText('ios/BabyMinimo/PrivacyInfo.xcprivacy')

const emulatorEnv = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR
const isFalse = (value) => ['false', '0', 'no', 'off'].includes(String(value).toLowerCase())
const isTrue = (value) => ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase())

const gates = []

const addGate = ({ id, status, detail }) => {
  gates.push({ id, status, detail })
}

const requireGate = (id, condition, detail, failDetail = detail) => {
  addGate({
    id,
    status: condition ? 'pass' : 'fail',
    detail: condition ? detail : failDetail,
  })
}

requireGate(
  'app-display-name',
  appConfig.name === 'BabyMinimo',
  'Expo display name is BabyMinimo.',
  `Unexpected Expo display name: ${appConfig.name || '[missing]'}`
)

requireGate(
  'ios-bundle-identifier',
  appConfig.ios?.bundleIdentifier === 'com.babyminimo.app',
  'iOS bundle identifier is com.babyminimo.app.',
  `Unexpected iOS bundle identifier: ${appConfig.ios?.bundleIdentifier || '[missing]'}`
)

requireGate(
  'version-semver',
  /^\d+\.\d+\.\d+$/.test(appConfig.version || ''),
  `Expo version is ${appConfig.version}.`,
  `Expo version must be semver-like, got ${appConfig.version || '[missing]'}.`
)

requireGate(
  'ios-info-version',
  infoPlist.includes('<string>0.1.0</string>'),
  'iOS Info.plist contains the expected short version string.',
  'iOS Info.plist short version string does not match the current release config.'
)

requireGate(
  'widget-identifiers',
  JSON.stringify(appConfig.plugins || []).includes('com.babyminimo.app.widgets') &&
    JSON.stringify(appConfig.plugins || []).includes('group.com.babyminimo.app'),
  'Widget bundle and app-group identifiers are configured.',
  'Widget bundle or app-group identifiers are missing from app.json.'
)

requireGate(
  'privacy-manifest-present',
  privacyManifest.includes('NSPrivacyAccessedAPITypes') &&
    privacyManifest.includes('NSPrivacyTracking') &&
    privacyManifest.includes('<false/>'),
  'Privacy manifest is present with accessed API reasons and tracking disabled.',
  'Privacy manifest is missing expected accessed API or tracking declarations.'
)

if (isTrue(emulatorEnv)) {
  addGate({
    id: 'emulator-disabled-for-production',
    status: 'fail',
    detail:
      'EXPO_PUBLIC_USE_FIREBASE_EMULATOR is true; production/TestFlight smoke must not enable emulator mode.',
  })
} else if (isFalse(emulatorEnv)) {
  addGate({
    id: 'emulator-disabled-for-production',
    status: 'pass',
    detail: 'EXPO_PUBLIC_USE_FIREBASE_EMULATOR is explicitly false.',
  })
} else {
  addGate({
    id: 'emulator-disabled-for-production',
    status: strict ? 'fail' : 'warn',
    detail:
      'EXPO_PUBLIC_USE_FIREBASE_EMULATOR is unset; set it to false for strict production/TestFlight smoke.',
  })
}

addGate({
  id: 'signing-and-testflight',
  status: 'manual',
  detail:
    'Code signing, archive export, App Store Connect upload, and TestFlight install require owner-approved credentials and are not performed by this local smoke.',
})

const failed = gates.filter((gate) => gate.status === 'fail')
const warned = gates.filter((gate) => gate.status === 'warn')
const manual = gates.filter((gate) => gate.status === 'manual')

const summary = {
  status: failed.length === 0 ? 'pass' : 'fail',
  strict,
  failed: failed.length,
  warnings: warned.length,
  manual: manual.length,
  gates,
}

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`release-production-smoke: ${summary.status}`)
  for (const gate of gates) {
    console.log(`- ${gate.status.toUpperCase()} ${gate.id}: ${gate.detail}`)
  }
}

if (failed.length > 0) {
  process.exitCode = 1
}
