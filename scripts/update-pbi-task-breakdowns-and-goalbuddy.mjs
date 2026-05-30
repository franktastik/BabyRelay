import { readFileSync, writeFileSync } from 'node:fs'

const pbiPath = 'docs/product/babyminimo-pbi-codex-goalbuddy-pack.md'
const statePath = 'docs/goals/babyminimo-emulator-hardening/state.yaml'

const pbiDoc = readFileSync(pbiPath, 'utf8')
const stateDoc = readFileSync(statePath, 'utf8')

const pbiHeadingRegex = /^#### (PBI-\d{3}): (.+)$/gm
const pbiMatches = [...pbiDoc.matchAll(pbiHeadingRegex)].map((match, index, matches) => ({
  id: match[1],
  title: match[2],
  index: match.index,
  nextIndex: matches[index + 1]?.index ?? pbiDoc.indexOf('## 6. Codex Command Pack'),
}))

const completedPbis = new Set([
  ...Array.from({ length: 44 }, (_, index) => `PBI-${String(index + 1).padStart(3, '0')}`),
  'PBI-049',
  'PBI-058',
  'PBI-059',
  'PBI-060',
])

const completedOrder = [
  ...Array.from({ length: 44 }, (_, index) => `PBI-${String(index + 1).padStart(3, '0')}`),
  'PBI-049',
  'PBI-058',
  'PBI-059',
  'PBI-060',
]

const localFirstOrder = [
  'PBI-062',
  'PBI-045',
  'PBI-046',
  'PBI-047',
  'PBI-048',
  'PBI-051',
  'PBI-052',
  'PBI-054',
  'PBI-057',
  'PBI-064',
  'PBI-065',
  'PBI-063',
]

const productionLastOrder = [
  'PBI-050',
  'PBI-066',
  'PBI-061',
  'PBI-055',
  'PBI-056',
  'PBI-053',
]

const order = [...completedOrder, ...localFirstOrder, ...productionLastOrder]
const pbiById = Object.fromEntries(pbiMatches.map((pbi) => [pbi.id, pbi]))

const missingIds = pbiMatches.map((pbi) => pbi.id).filter((id) => !order.includes(id))
if (missingIds.length > 0) {
  throw new Error(`PBI order is missing: ${missingIds.join(', ')}`)
}

function yamlQuote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function sectionFor(pbi) {
  return pbiDoc.slice(pbi.index, pbi.nextIndex)
}

function listBlock(section, label) {
  const start = section.indexOf(`${label}:\n`)
  if (start === -1) return []
  const after = section.slice(start + label.length + 2)
  const lines = []
  for (const line of after.split('\n')) {
    if (/^([A-Z][A-Za-z /+-]*|#### .+):/.test(line)) break
    if (/^- /.test(line)) lines.push(line.replace(/^- /, '').trim())
  }
  return lines
}

function taskMapping(section) {
  const lines = listBlock(section, 'Task mapping')
  if (lines.length === 0) {
    return [
      'Confirm scope, dependencies, acceptance criteria, and forbidden areas.',
      'Implement the smallest safe vertical slice for the PBI.',
      'Wire data/state/navigation behavior and handle empty, loading, and error states.',
      'Add or update focused tests and simulator smoke coverage.',
      'Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.',
    ]
  }
  return lines.map((line) => line.replace(/^T\d+:\s*/, ''))
}

function suggestedPhase(section) {
  return section.match(/Suggested phase:\s*(.+)/)?.[1]?.trim() || 'Unspecified'
}

function dependencies(section) {
  const inline = section.match(/Dependencies:\s*([^\n]+)\n/)
  if (inline && !inline[1].trim().startsWith('')) {
    const value = inline[1].trim()
    if (value && value !== 'None.') return [value.replace(/\.$/, '')]
  }
  const block = listBlock(section, 'Dependencies')
  return block.length > 0 ? block : ['None']
}

function isProductionLast(id) {
  return productionLastOrder.includes(id)
}

function taskType(taskText) {
  const lower = taskText.toLowerCase()
  if (lower.startsWith('confirm') || lower.startsWith('inventory') || lower.startsWith('compare') || lower.startsWith('define')) {
    return 'scout'
  }
  if (lower.startsWith('verify') || lower.startsWith('record') || lower.startsWith('run simulator') || lower.startsWith('audit')) {
    return 'judge'
  }
  return 'worker'
}

function allowedFiles(id, title) {
  const lower = title.toLowerCase()
  const common = [
    'docs/product/babyminimo-pbi-codex-goalbuddy-pack.md',
    'docs/goals/babyminimo-emulator-hardening/state.yaml',
    'CHANGELOG.md',
  ]
  if (id === 'PBI-050' || lower.includes('firebase')) {
    return [...common, 'src/lib/firebase/**', 'firebase.json', 'firestore.rules', 'storage.rules', 'firestore.indexes.json', '.firebaserc', '.env.example', 'scripts/**']
  }
  if (id === 'PBI-055' || lower.includes('subscriptions') || lower.includes('iap') || lower.includes('paywall') || lower.includes('pricing')) {
    return [...common, 'app/**', 'src/**', 'ios/**', 'docs/product/**', 'docs/testing/**']
  }
  if (lower.includes('widget')) {
    return [...common, 'app/**', 'src/**', 'ios/**', 'docs/product/**', 'docs/testing/**']
  }
  if (lower.includes('screenshot') || lower.includes('localization') || lower.includes('release') || lower.includes('app store')) {
    return [...common, 'docs/**', 'e2e/**', 'scripts/**', 'app.json', 'ios/**']
  }
  if (lower.includes('screen') || lower.includes('flow') || lower.includes('modal') || lower.includes('timeline') || lower.includes('home') || lower.includes('handoff') || lower.includes('settings') || lower.includes('account') || lower.includes('caregiver') || lower.includes('reminders')) {
    return [...common, 'app/**', 'src/**', 'e2e/**', 'docs/product/**']
  }
  return [...common, 'app/**', 'src/**', 'docs/**', 'scripts/**', 'e2e/**']
}

function verifyCommands(id, title) {
  const lower = title.toLowerCase()
  const commands = ['bun run test:typecheck', 'bun run test:unit']
  if (lower.includes('screen') || lower.includes('flow') || lower.includes('modal') || lower.includes('widget') || lower.includes('qa') || lower.includes('screenshot')) {
    commands.push('npx expo-doctor')
    commands.push('Simulator smoke at http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0')
  }
  if (lower.includes('firebase') || lower.includes('cost') || lower.includes('emulator')) {
    commands.push('Firebase Emulator smoke at http://127.0.0.1:4000/auth')
    commands.push('Firebase Storage Emulator smoke at http://127.0.0.1:4000/storage')
  }
  if (lower.includes('qa') || lower.includes('visual')) {
    commands.push('maestro test e2e/maestro/smoke.yaml')
  }
  return commands
}

function stopConditions(id) {
  const stops = [
    'Need files outside allowed_files.',
    'Acceptance criteria conflict with approved PBI scope.',
    'Verification fails twice.',
  ]
  if (isProductionLast(id)) {
    stops.push('Requires production Firebase deploy, App Store Connect write, signing, or production credentials not explicitly approved for this task.')
  }
  return stops
}

function receiptForDone(pbi, taskText) {
  return [
    '    receipt:',
    '      result: done',
    `      summary: ${yamlQuote(`Completed as part of ${pbi.id}: ${pbi.title}. Subtask: ${taskText}`)}`,
  ].join('\n')
}

function taskCard(pbi, pbiOrder, taskText, taskIndex, taskNumber) {
  const status = completedPbis.has(pbi.id) ? 'done' : 'queued'
  const id = `T${String(taskNumber).padStart(3, '0')}`
  const type = status === 'done' ? 'pm' : taskType(taskText)
  const assignee = type === 'scout' ? 'Scout' : type === 'judge' ? 'Judge' : type === 'worker' ? 'Worker' : 'PM'
  const section = sectionFor(pbi)
  const lines = [
    `  - id: ${id}`,
    `    type: ${type}`,
    `    assignee: ${assignee}`,
    `    status: ${status}`,
    `    pbi: ${yamlQuote(pbi.id)}`,
    `    pbi_title: ${yamlQuote(pbi.title)}`,
    `    phase: ${yamlQuote(suggestedPhase(section))}`,
    `    production_last_phase: ${isProductionLast(pbi.id) ? 'true' : 'false'}`,
    `    objective: ${yamlQuote(`${pbi.id} T${taskIndex + 1}: ${taskText}`)}`,
    `    inputs:`,
    `      - ${yamlQuote(`PBI source: docs/product/babyminimo-pbi-codex-goalbuddy-pack.md#${pbi.id}`)}`,
    ...dependencies(section).map((dependency) => `      - ${yamlQuote(`Dependency: ${dependency}`)}`),
    `    constraints:`,
    `      - ${yamlQuote('Follow rules.md and AGENTS.md before starting implementation.')}`,
    `      - ${yamlQuote('Keep one active task at a time and update GoalBuddy receipts after verification.')}`,
    `      - ${yamlQuote('Do not start production Firebase or App Store Connect setup unless this specific task requires it and the user has approved it.')}`,
    `    expected_output:`,
    `      - ${yamlQuote('Subtask completed or blocked with reason')}`,
    `      - ${yamlQuote('Files changed or inspected')}`,
    `      - ${yamlQuote('Verification commands and results')}`,
    `      - ${yamlQuote('GoalBuddy receipt and changelog/doc updates when applicable')}`,
    `    allowed_files:`,
    ...allowedFiles(pbi.id, pbi.title).map((file) => `      - ${yamlQuote(file)}`),
    `    verify:`,
    ...verifyCommands(pbi.id, pbi.title).map((command) => `      - ${yamlQuote(command)}`),
    `    stop_if:`,
    ...stopConditions(pbi.id).map((condition) => `      - ${yamlQuote(condition)}`),
  ]
  if (status === 'done') lines.push(receiptForDone(pbi, taskText))
  return lines.join('\n')
}

const markerIndex = [
  '  # PBI roadmap cards.',
  '  # PBI subtask roadmap.',
].map((marker) => stateDoc.indexOf(marker)).find((index) => index !== -1) ?? -1
if (markerIndex === -1) throw new Error('Could not find PBI roadmap marker in state.yaml')

let prefix = stateDoc.slice(0, markerIndex).trimEnd()
prefix = prefix
  .replace('title: "BabyMinimo Emulator Hardening"', 'title: "BabyMinimo PBI Delivery Board"')
  .replace('slug: "babyminimo-emulator-hardening"', 'slug: "babyminimo-emulator-hardening"')
  .replace(
    'tranche: "Firebase Emulator performance, cost discovery, lazy-loading audit, and heavy-data purge policy before production readiness."',
    'tranche: "All BabyMinimo PBIs split into smaller GoalBuddy tasks, ordered with local/non-production work before Firebase/App Store production work."'
  )
  .replace(
    'original_request: "Before production-grade PBIs, implement everything we can with Firebase Emulator and run performance/load testing to estimate DB read/write I/O and cost, optimize lazy loading, and define purge after canceled subscription."',
    'original_request: "Add every BabyMinimo PBI to GoalBuddy, split each PBI into smaller tasks, and prioritize work that does not require production Firebase or App Store Connect setup."'
  )
  .replace(
    'interpreted_outcome: "Use emulator-only work to measure and reduce database I/O, add local load tooling, and establish retention policy for future heavy data before production Firebase wiring."',
    'interpreted_outcome: "GoalBuddy shows every PBI as smaller executable cards, with completed work receipted and queued work ordered so local/docs/UI/QA tasks come before production Firebase and App Store tasks."'
  )
  .replace(
    'completion_proof: "Local tests, typecheck, and Firebase Emulator load script pass with a receipt summarizing counts and optimization findings."',
    'completion_proof: "The local GoalBuddy board renders all PBI subtasks with valid YAML, no unsupported statuses, and production-dependent tasks sequenced last."'
  )
  .replace('active_task: null', 'active_task: T006')
  .replaceAll('assignee: Codex', 'assignee: PM')
  .replace(/(  - id: T00[1-5]\n)    type: (scout|judge|worker)/g, '$1    type: pm')

if (!prefix.includes('\nagents:\n')) {
  prefix = prefix.replace(
    '\nrules:\n',
    '\nagents:\n  scout: installed\n  worker: installed\n  judge: installed\n\nrules:\n',
  )
}

const cards = []
cards.push([
  '  - id: T006',
  '    type: pm',
  '    assignee: PM',
  '    status: active',
  '    objective: "Review the generated BabyMinimo PBI subtask board before implementation begins."',
  '    expected_output:',
  '      - "Owner can view GoalBuddy board and confirm the next implementation task."',
  '      - "No PBI implementation starts until this review checkpoint is cleared."',
  '    receipt: null',
].join('\n'))

let nextTaskNumber = 7
for (let pbiOrder = 0; pbiOrder < order.length; pbiOrder += 1) {
  const pbi = pbiById[order[pbiOrder]]
  const tasks = taskMapping(sectionFor(pbi))
  tasks.forEach((taskText, taskIndex) => {
    cards.push(taskCard(pbi, pbiOrder + 1, taskText, taskIndex, nextTaskNumber))
    nextTaskNumber += 1
  })
}

const suffix = [
  '',
  '  # PBI subtask roadmap. Completed PBIs are receipted; queued cards are ordered so local/non-production work comes before Firebase/App Store production work.',
  ...cards,
  '',
].join('\n')

writeFileSync(statePath, `${prefix}\n${suffix}`)
