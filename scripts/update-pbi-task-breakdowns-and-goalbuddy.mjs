import { readFileSync, writeFileSync } from 'node:fs'

const pbiPath = 'docs/product/babyminimo-pbi-codex-goalbuddy-pack.md'
const statePath = 'docs/goals/babyminimo-emulator-hardening/state.yaml'

const pbiDoc = readFileSync(pbiPath, 'utf8')

const pbiHeadingRegex = /^#### (PBI-\d{3}): (.+)$/gm
const pbiMatches = [...pbiDoc.matchAll(pbiHeadingRegex)].map((match) => ({
  id: match[1],
  title: match[2],
  index: match.index,
}))

const taskTemplates = {
  default: [
    'Confirm scope, dependencies, acceptance criteria, design references, and forbidden areas.',
    'Implement the smallest safe vertical slice for the PBI.',
    'Wire data/state/navigation behavior and handle empty, loading, and error states.',
    'Add or update focused tests, simulator smoke coverage, and visual evidence where applicable.',
    'Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.',
  ],
  foundation: [
    'Confirm Expo, routing, TypeScript, and folder-structure requirements.',
    'Create or update project configuration and base app route structure.',
    'Add shared source directories, aliases, and initial theme/component scaffolding.',
    'Run typecheck, Expo Doctor, and app startup smoke.',
    'Record created files, setup assumptions, and remaining foundation risks.',
  ],
  firebase: [
    'Define local emulator and production configuration boundaries.',
    'Implement Firebase client exports and environment loading.',
    'Wire auth, Firestore, Functions/callable wrappers, and emulator switching.',
    'Add emulator smoke checks and type coverage for exported clients.',
    'Document config, secret-handling assumptions, and production follow-ups.',
  ],
  ui: [
    'Compare the target screen against approved screenshots and screen contracts.',
    'Implement layout, components, typography, spacing, and visual states.',
    'Wire navigation/actions and data dependencies without adding unsupported controls.',
    'Capture simulator evidence and run typecheck plus relevant smoke tests.',
    'Update changelog and note any missing scroll-state baseline coverage.',
  ],
  backend: [
    'Define data contract, authorization assumptions, and emulator-safe behavior.',
    'Implement service/callable/listener behavior behind a narrow interface.',
    'Handle empty, error, permission, and retry cases.',
    'Add unit/emulator tests and verify no production deploy is required.',
    'Document security, cost, and production rollout risks.',
  ],
  tests: [
    'Inventory required functional, visual, and non-functional coverage.',
    'Create or update Maestro, unit, integration, and visual comparison assets.',
    'Run the relevant local/emulator/simulator test suite.',
    'Record failures, coverage gaps, and manual QA requirements.',
    'Update docs, scripts, and GoalBuddy receipts with reproducible commands.',
  ],
  release: [
    'Confirm release prerequisites, signing, metadata, privacy, and store constraints.',
    'Prepare release configuration, assets, and documentation.',
    'Run production-build or TestFlight smoke path without enabling emulator config.',
    'Verify App Store/TestFlight checklist, screenshots, and rollback notes.',
    'Record release evidence, blockers, and explicit go/no-go status.',
  ],
}

function templateFor(id, title) {
  const numeric = Number(id.slice(4))
  const lower = title.toLowerCase()

  if (numeric === 1 || numeric === 4) return taskTemplates.foundation
  if (numeric === 2 || numeric === 7 || numeric === 29 || numeric === 36 || numeric === 50) {
    return taskTemplates.firebase
  }
  if (
    lower.includes('screen') ||
    lower.includes('flow') ||
    lower.includes('modal') ||
    lower.includes('states') ||
    lower.includes('widgets') ||
    lower.includes('widget') ||
    lower.includes('plans') ||
    lower.includes('account') ||
    lower.includes('settings') ||
    lower.includes('caregivers') ||
    lower.includes('home') ||
    lower.includes('handoff') ||
    lower.includes('timeline')
  ) {
    return taskTemplates.ui
  }
  if (numeric === 52 || lower.includes('qa') || lower.includes('testing')) return taskTemplates.tests
  if (numeric === 53 || lower.includes('release') || lower.includes('app store')) return taskTemplates.release
  if (
    lower.includes('firebase') ||
    lower.includes('analytics') ||
    lower.includes('notification') ||
    lower.includes('subscriptions') ||
    lower.includes('deletion') ||
    lower.includes('lifecycle') ||
    lower.includes('purge') ||
    lower.includes('cost') ||
    lower.includes('performance') ||
    lower.includes('adapter') ||
    lower.includes('metadata') ||
    lower.includes('file storage')
  ) {
    return taskTemplates.backend
  }
  return taskTemplates.default
}

function insertTaskMappings(doc) {
  let output = ''
  for (let i = 0; i < pbiMatches.length; i += 1) {
    const current = pbiMatches[i]
    const nextIndex = pbiMatches[i + 1]?.index ?? doc.indexOf('## 6. Codex Command Pack')
    const section = doc.slice(current.index, nextIndex)
    const previousEnd = i === 0 ? 0 : pbiMatches[i - 1]?.nextIndex
    current.nextIndex = nextIndex

    if (i === 0) {
      output += doc.slice(0, current.index)
    }

    if (section.includes('\nTask mapping:\n')) {
      output += section
      continue
    }

    const tasks = templateFor(current.id, current.title)
      .map((task, index) => `- T${index + 1}: ${task}`)
      .join('\n')
    const mapping = `\nTask mapping:\n${tasks}\n`

    const suggestedPhasePattern = /(Suggested phase: .+?\n)/
    if (suggestedPhasePattern.test(section)) {
      output += section.replace(suggestedPhasePattern, `$1${mapping}`)
    } else {
      output += `${section.trimEnd()}\n${mapping}\n`
    }
  }
  const tailStart = pbiMatches[pbiMatches.length - 1].nextIndex
  output += doc.slice(tailStart)
  return output
}

const updatedPbiDoc = insertTaskMappings(pbiDoc)
writeFileSync(pbiPath, updatedPbiDoc)

const completedPbis = new Set([
  ...Array.from({ length: 44 }, (_, index) => `PBI-${String(index + 1).padStart(3, '0')}`),
  'PBI-049',
  'PBI-058',
  'PBI-059',
  'PBI-060',
])

const productionLastOrder = [
  ...Array.from({ length: 44 }, (_, index) => `PBI-${String(index + 1).padStart(3, '0')}`),
  'PBI-049',
  'PBI-058',
  'PBI-059',
  'PBI-060',
  'PBI-045',
  'PBI-046',
  'PBI-047',
  'PBI-048',
  'PBI-051',
  'PBI-052',
  'PBI-054',
  'PBI-057',
  'PBI-056',
  'PBI-055',
  'PBI-061',
  'PBI-050',
  'PBI-053',
]

const pbiById = Object.fromEntries(pbiMatches.map((pbi) => [pbi.id, pbi]))

function yamlQuote(value) {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function goalbuddyTaskFor(id, order) {
  const pbi = pbiById[id]
  const status = completedPbis.has(id) ? 'done' : 'todo'
  const isProduction = ['PBI-050', 'PBI-053', 'PBI-055', 'PBI-056', 'PBI-057', 'PBI-061'].includes(id)
  const objectivePrefix = completedPbis.has(id) ? 'Completed PBI' : 'Implement PBI'
  return [
    `  - id: ${id}`,
    `    type: worker`,
    `    assignee: Codex`,
    `    status: ${status}`,
    `    pbi: ${yamlQuote(id)}`,
    `    sequence: ${order}`,
    `    production_last_phase: ${isProduction ? 'true' : 'false'}`,
    `    objective: ${yamlQuote(`${objectivePrefix}: ${pbi.title}`)}`,
    `    source: ${yamlQuote('docs/product/babyminimo-pbi-codex-goalbuddy-pack.md')}`,
    `    verification:`,
    `      - ${yamlQuote('Use the PBI task mapping, acceptance criteria, and relevant local tests/simulator checks.')}`,
    `    expected_receipt:`,
    `      - ${yamlQuote('subtasks completed')}`,
    `      - ${yamlQuote('files changed')}`,
    `      - ${yamlQuote('verification run and result')}`,
    `      - ${yamlQuote('remaining risks or blockers')}`,
  ].join('\n')
}

const state = readFileSync(statePath, 'utf8')
if (!state.includes('id: PBI-001')) {
  const goalbuddyTasks = productionLastOrder
    .filter((id) => pbiById[id])
    .map((id, index) => goalbuddyTaskFor(id, index + 1))
    .join('\n')

  writeFileSync(
    statePath,
    `${state.trimEnd()}\n\n  # PBI roadmap cards. Completed PBIs are receipts; todo PBIs are queued with production/release work last.\n${goalbuddyTasks}\n`
  )
}
