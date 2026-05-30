import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const args = new Set(process.argv.slice(2))
const asJson = args.has('--json')
const skipAsc = args.has('--no-asc')
const strict = args.has('--strict')

const optionValue = (name) => {
  const prefix = `${name}=`
  const value = process.argv.slice(2).find((arg) => arg.startsWith(prefix))
  return value ? value.slice(prefix.length) : undefined
}

const appId = optionValue('--app-id') || process.env.ASC_APP_ID
const buildId = optionValue('--build-id') || process.env.ASC_BUILD_ID

const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const appConfig = readJson('app.json').expo
const widgetPlugin = (appConfig.plugins || []).find(
  (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-widgets'
)?.[1]

const expected = {
  appName: 'BabyMinimo: Baby Tracker',
  displayName: appConfig.name,
  sku: 'babyminimo-ios',
  primaryLocale: 'en-US',
  bundleId: appConfig.ios?.bundleIdentifier,
  widgetBundleId: widgetPlugin?.bundleIdentifier,
  appGroup: widgetPlugin?.groupIdentifier,
  version: appConfig.version,
}

const checks = []
const commands = []

const addCheck = (id, status, detail) => checks.push({ id, status, detail })

const runCommand = (command, commandArgs) => {
  const label = [command, ...commandArgs].join(' ')
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 8,
  })

  const entry = {
    command: label,
    status: result.status === 0 ? 'pass' : 'warn',
    exitCode: result.status,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  }
  commands.push(entry)
  return entry
}

const parseJson = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

addCheck(
  'app-json-present',
  existsSync(resolve(root, 'app.json')) ? 'pass' : 'fail',
  'app.json is present for local release identity checks.'
)

addCheck(
  'ios-bundle-id',
  expected.bundleId === 'com.babyminimo.app' ? 'pass' : 'fail',
  `iOS bundle ID is ${expected.bundleId || '[missing]'}.`
)

addCheck(
  'widget-identity',
  expected.widgetBundleId === 'com.babyminimo.app.widgets' &&
    expected.appGroup === 'group.com.babyminimo.app'
    ? 'pass'
    : 'fail',
  `Widget bundle is ${expected.widgetBundleId || '[missing]'} and App Group is ${
    expected.appGroup || '[missing]'
  }.`
)

addCheck(
  'version-shape',
  /^\d+\.\d+(?:\.\d+)?$/.test(expected.version || '') ? 'pass' : 'fail',
  `App version is ${expected.version || '[missing]'}.`
)

const automationMatrix = [
  {
    area: 'Apple account agreements, tax, banking',
    owner: 'Manual App Store Connect UI',
    policy: 'Required before submission; do not automate acceptance.',
  },
  {
    area: 'App record, app info, metadata, localizations',
    owner: 'asc stable commands first',
    policy: 'Use diff/validate before write commands.',
  },
  {
    area: 'Screenshots and custom product pages',
    owner: 'asc after final local assets exist',
    policy: 'Use approved assets only; no emulator chrome or draft screenshots.',
  },
  {
    area: 'TestFlight groups, testers, build notes, validation',
    owner: 'asc plus signed build workflow',
    policy: 'Build upload still requires approved signing/EAS/Xcode path.',
  },
  {
    area: 'IAP/subscriptions',
    owner: 'asc after StoreKit product decisions are approved',
    policy: 'Validate sandbox/TestFlight before production claims.',
  },
  {
    area: 'Firebase production setup',
    owner: 'Firebase CLI/console, not asc',
    policy: 'Never use babyminimo-demo for production.',
  },
]

if (skipAsc) {
  addCheck('asc-discovery', 'manual', 'Skipped asc discovery because --no-asc was provided.')
} else {
  const version = runCommand('asc', ['version'])
  addCheck(
    'asc-cli-present',
    version.status === 'pass' ? 'pass' : 'warn',
    version.status === 'pass' ? `asc is available: ${version.stdout}` : 'asc CLI was not available.'
  )

  addCheck(
    'asc-doctor',
    'manual',
    'Run `asc doctor` directly before release work; scripted child processes may not read keychain credentials reliably.'
  )

  addCheck(
    'asc-web-auth-status',
    'manual',
    'Run `asc web auth status` directly before experimental `asc web` commands; scripted child processes may not read the cached web session reliably.'
  )

  const capabilities = runCommand('asc', ['capabilities', '--output', 'json', '--pretty'])
  const capabilitiesJson = parseJson(capabilities.stdout)
  const capabilityItems = Array.isArray(capabilitiesJson)
    ? capabilitiesJson
    : Array.isArray(capabilitiesJson?.capabilities)
      ? capabilitiesJson.capabilities
      : []
  const capabilityCounts = capabilityItems.reduce((acc, item) => {
    const status = item.status || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
  addCheck(
    'asc-capability-map',
    capabilities.status === 'pass' ? 'pass' : 'warn',
    capabilities.status === 'pass'
      ? `Loaded asc capability map: ${Object.entries(capabilityCounts)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ') || 'no countable rows'}.`
      : 'Could not load asc capability map.'
  )

  const appLookup = runCommand('asc', [
    'apps',
    'list',
    '--bundle-id',
    expected.bundleId,
    '--output',
    'json',
    '--pretty',
  ])
  const appLookupJson = parseJson(appLookup.stdout)
  const appRows = Array.isArray(appLookupJson?.data)
    ? appLookupJson.data
    : Array.isArray(appLookupJson)
      ? appLookupJson
      : []
  addCheck(
    'asc-app-record-lookup',
    appLookup.status === 'pass' && appRows.length > 0 ? 'pass' : strict ? 'fail' : 'warn',
    appRows.length > 0
      ? `Found ${appRows.length} App Store Connect app record(s) for ${expected.bundleId}.`
      : `No App Store Connect app record was found for ${expected.bundleId}, or lookup could not complete.`
  )

  if (appId) {
    const validation = runCommand('asc', [
      'validate',
      '--app',
      appId,
      '--version',
      expected.version,
      '--platform',
      'IOS',
      '--output',
      'json',
      '--pretty',
    ])
    addCheck(
      'asc-version-validation',
      validation.status === 'pass' ? 'pass' : strict ? 'fail' : 'warn',
      validation.status === 'pass'
        ? `asc validate completed for app ${appId} version ${expected.version}.`
        : `asc validate did not complete for app ${appId} version ${expected.version}.`
    )
  } else {
    addCheck(
      'asc-version-validation',
      'manual',
      'Set ASC_APP_ID or pass --app-id=APP_ID to run version validation.'
    )
  }

  if (appId && buildId) {
    const testflightValidation = runCommand('asc', [
      'validate',
      'testflight',
      '--app',
      appId,
      '--build',
      buildId,
    ])
    addCheck(
      'asc-testflight-validation',
      testflightValidation.status === 'pass' ? 'pass' : strict ? 'fail' : 'warn',
      testflightValidation.status === 'pass'
        ? `TestFlight validation completed for build ${buildId}.`
        : `TestFlight validation did not complete for build ${buildId}.`
    )
  } else {
    addCheck(
      'asc-testflight-validation',
      'manual',
      'Set ASC_APP_ID and ASC_BUILD_ID to run TestFlight build validation.'
    )
  }
}

const failed = checks.filter((check) => check.status === 'fail')
const warned = checks.filter((check) => check.status === 'warn')

const summary = {
  status: failed.length ? 'fail' : 'pass',
  failed: failed.length,
  warnings: warned.length,
  expected,
  checks,
  automationMatrix,
  commands: commands.map((command) => ({
    command: command.command,
    status: command.status,
    exitCode: command.exitCode,
    stdout: command.stdout.slice(0, 1200),
    stderr: command.stderr.slice(0, 1200),
  })),
}

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`asc-release-readiness: ${summary.status}`)
  console.log(`Expected app: ${expected.appName}`)
  console.log(`Bundle ID: ${expected.bundleId}`)
  console.log(`Version: ${expected.version}`)
  for (const check of checks) {
    console.log(`- ${check.status.toUpperCase()} ${check.id}: ${check.detail}`)
  }
  console.log('\nAutomation ownership:')
  for (const row of automationMatrix) {
    console.log(`- ${row.area}: ${row.owner}. ${row.policy}`)
  }
}

if (failed.length > 0) {
  process.exitCode = 1
}
