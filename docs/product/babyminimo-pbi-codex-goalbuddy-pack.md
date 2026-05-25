# BabyMinimo PBI, Codex, and GoalBuddy Pack

This is the source-of-truth planning document for building BabyMinimo end to end with Codex, GoalBuddy, and bounded OpenCode implementation handoffs.

## 1. Product Context

Product name: BabyMinimo

Product type: Shared newborn handoff app for tired parents and caregivers.

Core promise: Know what happened last, instantly.

Secondary value: Track newborn care in one calm place.

Third layer: Growth Timeline for baby photo moments stored locally in v1.

Product hierarchy:
1. Shared handoff
2. Care logging
3. Reminders
4. Growth Timeline
5. Widgets and glanceable surfaces
6. Plans and household coordination

Important scope rules:
- Growth Timeline stays inside Timeline, not a separate tab.
- Growth Timeline photos are local-only in v1.
- Family plan is a household coordination plan, not just extra seats.
- Home must stay focused on what happened last and quick actions.
- Handoff must stay focused on current state, due soon, and latest note.
- Widgets must extend the shared handoff promise with glanceable current state; they must not become a separate product pillar or replace opening the app for logging.
- Codex must preserve the Superdesign mockup and logo direction.
- Codex must not invent a different product hierarchy or brand system.
- Use Firebase Emulator for local auth and shared-data development until production Firebase wiring is explicitly requested.
- Approved screenshots in `docs/product/superdesign-reference-assets/screenshots1/` are the visual source of truth for UI work.
- `docs/product/babyminimo-visual-qa-contract.md` defines the required visual acceptance gate.

## 2. GoalBuddy Operating Model

Use GoalBuddy for app-level work, broad implementation phases, cross-screen features, release readiness, and any work that needs durable planning and verification.

Default workflow:
1. Run `$goal-prep` with this document as the source of truth.
2. Use the local live GoalBuddy board in Codex unless the user asks for GitHub Projects or no visual board.
3. Start execution with `/goal Follow docs/goals/<slug>/goal.md.`.
4. Codex acts as PM, planner, reviewer, and final verifier.
5. OpenCode implementation models may handle bounded code-only Worker tasks only after the GoalBuddy board defines allowed files, forbidden paths, exact requirements, design screenshot references, and verification commands.
6. Codex reviews every OpenCode diff, test result, changelog entry, and UI screenshot evidence before accepting.

Do not use GoalBuddy for a narrow one-file change. Use direct Codex implementation for small edits.

### Safe OpenCode Model Choice

OpenCode is code-only for BabyMinimo unless a real multimodal OpenCode model is explicitly available and smoke-tested. Codex owns screenshot understanding and final visual QA.

Preferred bounded implementation model order:

1. `opencode-go/glm-5.1` if the smoke test passes.
2. `opencode-go/qwen3.6-plus` as the safe fallback.
3. `opencode-go/deepseek-v4-flash`.
4. `opencode-go/deepseek-v4-pro`.
5. `opencode-go/kimi-k2.6` only if its JSON Schema smoke gate passes in the current session.

Current local smoke status:

- 2026-05-23: `opencode-go/glm-5.1` returned `GLM_OK`.
- 2026-05-23: `opencode-go/qwen3.6-plus` returned `QWEN_OK`.
- 2026-05-23: `opencode-go/kimi-k2.6` failed with `JSON Schema not supported: could not understand the instance {'default': 'latest'}`.

Smoke commands:

```sh
opencode run --model opencode-go/glm-5.1 --format json "Reply with exactly: GLM_OK"
opencode run --model opencode-go/qwen3.6-plus --format json "Reply with exactly: QWEN_OK"
opencode run --model opencode-go/kimi-k2.6 --format json "Reply with exactly: KIMI_OK"
```

### GoalBuddy Prep Prompt

Use this prompt when creating the end-to-end build board:

```text
$goal-prep

Prepare a GoalBuddy board for building BabyMinimo end to end.

Use docs/product/babyminimo-pbi-codex-goalbuddy-pack.md as the source of truth.

Goal:
Build the BabyMinimo Expo mobile app as a shared newborn handoff app with auth, onboarding, Home, care logging, Timeline, local-only Growth Timeline, Handoff, reminders, caregivers, settings, plans, account, sign out, polish states, analytics, widgets, and screenshot-ready UI.

Visual board:
Use the local live board in Codex by default.

Hard constraints:
- Preserve the BabyMinimo Superdesign mockup and logo direction.
- Do not invent a new product hierarchy, tab structure, or brand system.
- Growth Timeline stays inside Timeline.
- Growth Timeline photos are local-only in v1.
- Widgets are read-only glanceable handoff surfaces in v1.
- Family plan is household coordination, not just extra seats.
- Home focuses on what happened last and quick actions.
- Handoff focuses on current state, due soon, latest note, and overnight readability.
- Use Expo Router, React Native, Firebase Auth, Firestore listeners, callable functions for writes, expo-sqlite, and local file storage.

Proof:
The app runs locally, the main routes render, core flows are demonstrable, tests or smoke checks pass for each slice, UI screens have simulator screenshot evidence against approved `screenshots1/` references, widget payload privacy is reviewed, widget screenshots exist when widget work is in scope, and Codex reviews the final diff and changelog.
```

## 2A. Local Backend Policy

Use Firebase Emulator for demo and development backend work.

Default local project:
- `babyminimo-demo`

Run:

```sh
bun run emulators
```

Expected local services:
- Auth: `127.0.0.1:9099`
- Firestore: `127.0.0.1:8080`
- Emulator UI: `http://127.0.0.1:4000/`

Environment defaults:
- `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`
- `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1`
- `EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099`
- `EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT=8080`

Rules:
- Auth, household, baby, reminders, and shared care-event development should target the emulator first.
- Callable Functions can be added to the emulator later when backend functions are introduced.
- Growth Timeline photos remain local-only in v1.
- Do not deploy emulator Firestore rules to production.

## 2B. Architecture And Deployment Diagrams

Editable product architecture diagrams live in `docs/product/diagrams/`.

Use `docs/product/diagrams/babyminimo-deployment-infrastructure.mmd` when planning or reviewing deployment, Firebase, App Store, marketing, notification, and subscription work.

Use `docs/product/diagrams/babyminimo-screen-navigation.mmd` when planning or reviewing auth, onboarding, tab navigation, modals, settings subflows, interaction hardening, and E2E coverage.

Use `docs/product/diagrams/babyminimo-data-flow.mmd` when planning or reviewing auth bootstrap, onboarding writes, care-event writes/listeners, Handoff summary reads, local Growth Timeline storage, Timeline merging, and sign out.

Use `docs/product/diagrams/babyminimo-uml-class-diagram.mmd` when planning or reviewing the domain model, Firestore collections, service boundaries, Handoff summary derivation, and security rules.

Use `docs/product/diagrams/babyminimo-system-architecture.mmd` when planning or reviewing client modules, local storage, Firebase backend, read models, feature gates, analytics, and app performance.

Use `docs/product/diagrams/babyminimo-end-to-end-user-flow.mmd` when planning or reviewing end-to-end user journeys, interaction hardening, and release QA.

Diagram-backed PBIs:
- `PBI-050`: Production Firebase and security hardening.
- `PBI-052`: E2E and visual release QA.
- `PBI-053`: Release and App Store readiness.
- `PBI-055`: Native subscriptions and Apple IAP.
- `PBI-061`: Hybrid local and Firebase push notification provider.

### Goal Execution Command

After `$goal-prep` creates the board, run:

```text
/goal Follow docs/goals/<slug>/goal.md.
```

### GoalBuddy Task Shape

Every Worker task should include:
- PBI ids covered
- allowed files or app areas
- forbidden paths and systems
- behavior requirements
- design requirements
- approved screenshot file from `docs/product/superdesign-reference-assets/screenshots1/` for UI tasks
- screen contract from `docs/product/screen-contracts/` when one exists
- verification commands
- simulator screenshot evidence requirement for UI tasks
- expected return format
- changelog expectations

### OpenCode Worker Handoff Template

Use this only for bounded low- or medium-risk implementation slices:

```text
Implement this bounded BabyMinimo Worker task.

Source of truth:
- docs/product/babyminimo-pbi-codex-goalbuddy-pack.md
- docs/goals/<slug>/goal.md

PBI ids:
- <PBI-XXX>

Goal:
<one paragraph>

Allowed files:
- <path or directory>

Forbidden:
- auth/session internals unless explicitly allowed
- database migrations unless explicitly allowed
- CI, deployment, and release automation
- billing provider logic
- secrets handling
- unrelated refactors
- files outside the allowed list

Requirements:
- <requirement>

Design:
- Approved screenshot: docs/product/superdesign-reference-assets/screenshots1/<file>.png
- Screen contract: docs/product/screen-contracts/<screen>.md, if present
- Preserve the approved BabyMinimo Superdesign visual direction.
- Use warm neutral surfaces, sage primary actions, clay/gold accents, rounded cards, and calm newborn-care UX.
- Do not approximate logo, avatar composition, icon style, spacing rhythm, card dimensions, typography scale, button/input dimensions, bottom nav placement, or scroll behavior.
- If exact matching is blocked by a missing asset, stop and list the missing asset instead of inventing a substitute.
- Do not add new tabs or change the product hierarchy.

Verification:
- <command>
- Capture a simulator screenshot and compare it to the approved screenshot with `bun run test:visual:compare` when the screen is in the baseline map.
- For scrollable screens, capture top/middle/bottom positions as needed and record any missing approved baseline captures as coverage gaps.

Changelog:
- Update CHANGELOG.md under Unreleased if behavior, workflow, or user-visible UI changed.

Return only:
- files changed
- implementation summary
- approved screenshot used
- simulator screenshot path
- visual comparison result; zero-diff is required for baselined screenshots
- missing scroll baseline coverage, if any
- changelog entry added
- verification run and result
- unresolved risks or caveats
```

## 3. Design Direction for Codex

Use `docs/product/superdesign-reference-assets/screenshots1/` as the visual source of truth. Use fetched Superdesign HTML only for structure/content when it does not conflict with the approved screenshots.

Follow:

- `docs/product/babyminimo-visual-qa-contract.md`
- `docs/product/screen-contracts/`, when a contract exists for the screen

Observed visual system:
- Warm cream app background.
- Sage green primary actions and brand moments.
- Clay secondary accent for human warmth and warning emphasis.
- Gold highlight for benefits, plans, and gentle emphasis.
- Rounded phone-scale cards and calm spacing.
- Friendly illustration and baby photo moments.
- Minimal, low-stress copy.
- Strong one-handed mobile ergonomics.

Design tokens to encode:
- `sage`: `#8DA089`
- `clay`: `#D98E73`
- `gold`: `#E5C36E`
- `cream`: `#FAF9F6`
- `creamAlt`: `#F7F0E6`
- `ink`: deep warm neutral for readable text
- `muted`: soft warm gray for secondary text
- `danger`: calm clay-red for destructive actions

Typography:
- Prefer Outfit for headings when available.
- Prefer Plus Jakarta Sans for body and labels when available.
- If fonts are not yet installed, create theme aliases first and wire actual font loading in the foundation phase.

Design rules:
- Home is a calm command center, not a dashboard stuffed with analytics.
- Handoff is the premium dark-mode glance screen.
- Timeline owns care history and Growth Timeline.
- Growth Timeline is photo-forward but secondary to the shared handoff product promise.
- Settings and Plans should feel supportive, not enterprise-heavy.
- Screens must be screenshot-ready by the polish phase.

## 4. Code Plan and Architecture

Target stack:
- React Native
- Expo
- Expo Router
- TypeScript
- Firebase Auth
- Firestore listeners for shared reads
- Firebase callable functions for shared writes
- Zustand for local app state
- expo-sqlite for local Growth Timeline metadata
- expo-file-system, expo-image-picker, and expo-image-manipulator for local Growth Timeline photos
- Native widget extension support when widget work is in scope, starting with a read-only iOS Home Screen widget before Android widget parity.

Suggested route structure:

```text
app/
  _layout.tsx
  index.tsx
  (auth)/
    _layout.tsx
    login.tsx
    signup.tsx
  (onboarding)/
    _layout.tsx
    welcome.tsx
    problem.tsx
    benefits.tsx
    add-baby.tsx
    priorities.tsx
    invite-caregiver.tsx
    preview.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    timeline.tsx
    handoff.tsx
    settings.tsx
  modals/
    quick-log.tsx
    log-breastfeed.tsx
    log-bottle.tsx
    log-diaper.tsx
    log-sleep.tsx
    log-medication.tsx
    add-moment.tsx
    sign-out-confirm.tsx
  settings/
    account.tsx
    caregivers.tsx
    reminders.tsx
    plans.tsx
```

Suggested source structure:

```text
src/
  app/
    bootstrap/
    providers/
  components/
    ui/
    home/
    timeline/
    handoff/
    reminders/
    caregivers/
    settings/
    onboarding/
    logging/
    states/
    widgets/
  features/
    auth/
    onboarding/
    households/
    babies/
    care-events/
    reminders/
    growth-timeline/
    handoff/
    plans/
    analytics/
    widgets/
  lib/
    firebase/
    sqlite/
    time/
  stores/
  theme/
  types/
```

Core shared UI primitives:
- `Screen`
- `Card`
- `Button`
- `Input`
- `Chip`
- `SectionTitle`
- `EmptyState`
- `LoadingState`
- `ErrorState`

Initial stores:
- `authStore`: user, currentHouseholdId, selectedBabyId, onboardingCompleted, auth bootstrapped state.
- `filtersStore`: Timeline filter state.
- `featureFlagStore`: household plan capabilities and loading/error state.

Firebase client modules:
- `src/lib/firebase/app.ts`
- `src/lib/firebase/auth.ts`
- `src/lib/firebase/firestore.ts`
- `src/lib/firebase/functions.ts`
- `src/lib/firebase/callables.ts`

Expected callable wrappers:
- `callCreateHousehold`
- `callCreateBaby`
- `callInviteMember`
- `callCreateCareEvent`
- `callCreateReminder`
- `callGetFeatureFlags`
- `callGetHandoffSummary`

Growth Timeline local schema:

```sql
CREATE TABLE IF NOT EXISTS growth_timeline_entries (
  id TEXT PRIMARY KEY NOT NULL,
  baby_id TEXT NOT NULL,
  local_image_uri TEXT NOT NULL,
  caption TEXT,
  moment_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_growth_timeline_entries_baby_time
ON growth_timeline_entries (baby_id, occurred_at DESC);
```

Verification strategy:
- Use `bun test` for TypeScript unit tests.
- Use Expo start/smoke checks for route and runtime validation.
- Use simulator screenshots compared against approved `screenshots1/` references for UI implementation.
- Visual regression is a strict zero-diff gate for baselined screens: the test screenshot and approved screenshot must have identical dimensions and zero differing pixels.
- For scrollable screens, capture top/middle/bottom positions when content exceeds one viewport.
- If a scrollable middle or bottom position has not been captured by the product owner, treat it as a missing baseline coverage gap rather than accepting approximation.
- Each GoalBuddy Worker task must define its own verification command.

## 5. Product Backlog Items

### Epic 1: Foundation

#### PBI-001: Initialize BabyMinimo mobile repo

Goal: Create the base Expo app and folder structure.

User story: As a developer, I want a clean BabyMinimo Expo repo so implementation can happen in the right structure from day one.

Scope:
- Expo app setup
- Expo Router base structure
- `src/` folder structure
- theme tokens folder
- basic package setup

Acceptance criteria:
- Expo app runs locally.
- `app/` routes compile.
- `src/` folder structure exists.
- theme token files exist.
- no TypeScript compile errors in base setup.

Dependencies: None.

Suggested phase: Phase 1.

Task mapping:
- T1: Confirm Expo, routing, TypeScript, and folder-structure requirements.
- T2: Create or update project configuration and base app route structure.
- T3: Add shared source directories, aliases, and initial theme/component scaffolding.
- T4: Run typecheck, Expo Doctor, and app startup smoke.
- T5: Record created files, setup assumptions, and remaining foundation risks.

#### PBI-002: Add Firebase client setup

Goal: Prepare auth, Firestore, and Functions clients.

User story: As a developer, I want Firebase configured in the mobile app so I can authenticate users and connect to shared app data.

Scope:
- Firebase app init
- Auth client
- Firestore client
- Functions client
- env variable support

Acceptance criteria:
- Firebase config loads from env.
- App can initialize Firebase without runtime failure.
- Auth, Firestore, and Functions exports exist.

Dependencies: PBI-001.

Suggested phase: Phase 1.

Task mapping:
- T1: Define local emulator and production configuration boundaries.
- T2: Implement Firebase client exports and environment loading.
- T3: Wire auth, Firestore, Functions/callable wrappers, and emulator switching.
- T4: Add emulator smoke checks and type coverage for exported clients.
- T5: Document config, secret-handling assumptions, and production follow-ups.

#### PBI-003: Add local SQLite setup for Growth Timeline

Goal: Prepare local metadata storage for photo moments.

User story: As a developer, I want a local SQLite layer so Growth Timeline moments can be stored without cloud sync in v1.

Scope:
- expo-sqlite setup
- migration runner
- `growth_timeline_entries` table

Acceptance criteria:
- Migration runs on app start.
- `growth_timeline_entries` table exists.
- Local DB can be queried without crash.

Dependencies: PBI-001.

Suggested phase: Phase 1.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-004: Create core shared UI primitives

Goal: Build reusable UI components.

User story: As a developer, I want reusable BabyMinimo components so screens stay visually consistent and code is easier to maintain.

Scope:
- Screen
- Card
- Button
- Input
- Chip
- section title helpers

Acceptance criteria:
- Components exist and are reusable.
- Components use BabyMinimo tokens.
- Components render consistently across screens.

Dependencies: PBI-001.

Suggested phase: Phase 1.

Task mapping:
- T1: Confirm Expo, routing, TypeScript, and folder-structure requirements.
- T2: Create or update project configuration and base app route structure.
- T3: Add shared source directories, aliases, and initial theme/component scaffolding.
- T4: Run typecheck, Expo Doctor, and app startup smoke.
- T5: Record created files, setup assumptions, and remaining foundation risks.

### Epic 2: Authentication

#### PBI-005: Build login screen

Goal: Let existing users sign in.

User story: As a returning user, I want to sign in to BabyMinimo so I can access my household and baby data.

Scope:
- login UI
- email/password auth wiring
- loading state
- basic error handling

Acceptance criteria:
- User can sign in with email/password.
- Error is shown for invalid login.
- Successful sign-in updates auth state.

Dependencies: PBI-002, PBI-004.

Suggested phase: Phase 2.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-006: Build signup screen

Goal: Let new users create an account.

User story: As a new user, I want to create a BabyMinimo account so I can start onboarding and create my first household.

Scope:
- signup UI
- Firebase email/password signup
- display name capture
- loading and error states

Acceptance criteria:
- User can create an account.
- Auth state updates after signup.
- User record is available for onboarding flow.

Dependencies: PBI-002, PBI-004.

Suggested phase: Phase 2.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-007: Add auth bootstrap and session routing

Goal: Route users correctly based on auth state and onboarding state.

User story: As a user, I want BabyMinimo to take me to the right place automatically when I open the app.

Scope:
- `onAuthStateChanged` hook
- auth store wiring
- redirect logic

Acceptance criteria:
- Unauthenticated users go to login.
- Authenticated users who have not onboarded go to onboarding.
- Authenticated and onboarded users go to Home.

Dependencies: PBI-005, PBI-006.

Suggested phase: Phase 2.

Task mapping:
- T1: Define local emulator and production configuration boundaries.
- T2: Implement Firebase client exports and environment loading.
- T3: Wire auth, Firestore, Functions/callable wrappers, and emulator switching.
- T4: Add emulator smoke checks and type coverage for exported clients.
- T5: Document config, secret-handling assumptions, and production follow-ups.

### Epic 3: Onboarding

#### PBI-008: Build onboarding welcome screen

Goal: Introduce BabyMinimo clearly.

User story: As a new user, I want a clear introduction so I understand what BabyMinimo is for.

Acceptance criteria:
- Welcome screen exists.
- Core promise is visible.
- Continue action works.

Dependencies: PBI-004.

Suggested phase: Phase 2.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-009: Build onboarding problem and benefits screens

Goal: Explain what BabyMinimo solves.

User story: As a new parent or caregiver, I want to see why BabyMinimo matters so the setup feels worthwhile.

Acceptance criteria:
- Pain framing screen exists.
- Benefits preview screen exists.
- Navigation between onboarding screens works.

Dependencies: PBI-008.

Suggested phase: Phase 2.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-010: Build add baby onboarding step

Goal: Create household and first baby profile.

User story: As a new user, I want to add my baby during onboarding so the app is immediately personalized.

Scope:
- baby name
- optional birth date
- create household
- create first baby
- save selected baby id

Acceptance criteria:
- User can enter baby details.
- Household is created through backend.
- Baby is created through backend.
- User is linked to household.

Dependencies: PBI-007, backend household and baby endpoints.

Suggested phase: Phase 2.

Task mapping:
- T1: Confirm scope, dependencies, acceptance criteria, design references, and forbidden areas.
- T2: Implement the smallest safe vertical slice for the PBI.
- T3: Wire data/state/navigation behavior and handle empty, loading, and error states.
- T4: Add or update focused tests, simulator smoke coverage, and visual evidence where applicable.
- T5: Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.

#### PBI-011: Build priorities selection screen

Goal: Capture care focus preferences.

User story: As a user, I want to choose what matters most right now so setup feels relevant.

Acceptance criteria:
- Priorities screen exists.
- User can select multiple options.
- Continue works.

Dependencies: PBI-009.

Suggested phase: Phase 2.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-012: Build invite caregiver onboarding step

Goal: Introduce household collaboration.

User story: As a user, I want to invite a partner or caregiver during onboarding so shared handoff starts early.

Acceptance criteria:
- Email invite field exists.
- Skip option exists.
- Invite can call backend.
- User can proceed even if skipped.

Dependencies: invite backend.

Suggested phase: Phase 2.

Task mapping:
- T1: Confirm scope, dependencies, acceptance criteria, design references, and forbidden areas.
- T2: Implement the smallest safe vertical slice for the PBI.
- T3: Wire data/state/navigation behavior and handle empty, loading, and error states.
- T4: Add or update focused tests, simulator smoke coverage, and visual evidence where applicable.
- T5: Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.

#### PBI-013: Build onboarding preview screen

Goal: Show first handoff value before entering app.

User story: As a user, I want to preview what BabyMinimo will help me see so I understand the payoff.

Acceptance criteria:
- Preview screen exists.
- Handoff-style summary is shown.
- Start action goes to app home.

Dependencies: PBI-010.

Suggested phase: Phase 2.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-062: Questionnaire-style onboarding expansion

Goal: Add a focused questionnaire-style onboarding slice that personalizes BabyMinimo setup without replacing the approved Superdesign onboarding direction.

Reference: `adamlyttleapps/claude-skill-app-onboarding-questionnaire` is the conversion-pattern reference for goal questions, pain points, personalization, permission priming, and app-preview reinforcement. BabyMinimo's approved screenshots, newborn handoff hierarchy, and calm caregiver tone remain the design authority.

User story: As a new parent or caregiver, I want BabyMinimo to ask a few relevant setup questions so the app feels tailored to my household before I create my baby's profile.

Scope:
- Add a Goal Question step: "What do you need BabyMinimo to help with first?"
- Add a Pain Points multi-select step covering missed handoffs, partner updates, overnight confusion, reminders, scattered notes, and local baby photo moments.
- Refine the existing priorities step so it uses questionnaire answers instead of feeling like an isolated preference screen.
- Add notification priming copy that explains local reminders first and Firebase remote push later only for sparse critical/cross-device use cases.
- Personalize the first handoff preview using the selected goal, pain points, and priorities.
- Keep the questionnaire focused; do not add a full subscription-app CRO flow, social-proof carousel, swipe cards, or paywall-first onboarding unless a later PBI explicitly scopes it.

Acceptance criteria:
- Onboarding sequence is documented as: Welcome → Goal Question → Pain Points → Problem/Benefits → Priorities → Notification Priming → Add Baby → Invite Caregiver → Preview.
- Questionnaire options use BabyMinimo-specific language for shared newborn handoff, care logging, reminders, Growth Timeline, and household coordination.
- User selections are stored locally or in Firebase Emulator-backed onboarding state for preview personalization.
- Notification priming does not request production Firebase remote push by default and does not imply Expo Push Service is required.
- Growth Timeline remains secondary, local-only in v1, and inside Timeline.
- The visual treatment preserves the approved Superdesign mockup direction and does not introduce a new brand system.
- Tests or simulator smoke checks cover navigation through the new questionnaire steps and preview personalization.

Dependencies: PBI-008, PBI-009, PBI-010, PBI-011, PBI-012, PBI-013, PBI-049.

Suggested phase: Phase 2.5, before further production-readiness work.

Task mapping:
- T1: Define BabyMinimo-specific questionnaire questions, options, and notification-priming copy from the onboarding-questionnaire reference.
- T2: Update onboarding route plan, screen navigation diagram, and end-to-end user-flow diagram.
- T3: Implement focused questionnaire screens using approved Superdesign visual direction and existing onboarding primitives.
- T4: Persist selections and use them to personalize the preview without changing auth/session ownership.
- T5: Add typecheck, focused unit or route tests where practical, simulator smoke, visual evidence, changelog entry, and GoalBuddy receipt.

### Epic 4: Home and Core App Shell

#### PBI-014: Build Home screen

Goal: Create the main command center.

User story: As a parent or caregiver, I want to instantly see what happened last so I can act with confidence.

Scope:
- header
- snapshot card
- quick actions
- Growth Timeline preview

Acceptance criteria:
- Home shows the core handoff summary.
- Quick actions are visible.
- Growth Timeline preview is secondary.
- Layout feels calm and clear.

Dependencies: snapshot component and shared event listeners later.

Suggested phase: Phase 3.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-015: Build tab navigation shell

Goal: Set up main app navigation.

User story: As a user, I want stable navigation so I can move between Home, Timeline, Handoff, and Settings easily.

Acceptance criteria:
- Home tab works.
- Timeline tab works.
- Handoff tab works.
- Settings tab works.
- Growth Timeline is not a tab.

Dependencies: PBI-001.

Suggested phase: Phase 3.

Task mapping:
- T1: Confirm scope, dependencies, acceptance criteria, design references, and forbidden areas.
- T2: Implement the smallest safe vertical slice for the PBI.
- T3: Wire data/state/navigation behavior and handle empty, loading, and error states.
- T4: Add or update focused tests, simulator smoke coverage, and visual evidence where applicable.
- T5: Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.

### Epic 5: Care Logging

#### PBI-016: Build quick log chooser modal

Goal: Give fast access to care actions.

User story: As a tired parent, I want to quickly choose what to log so I can update care history with minimal effort.

Acceptance criteria:
- Modal opens from Home.
- Actions route to correct log screens.

Dependencies: modal routing.

Suggested phase: Phase 4.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-017: Build breastfeed log flow

Goal: Log breastfeeding sessions.

User story: As a caregiver, I want to log breastfeeding details so the household can track feed timing and side.

Acceptance criteria:
- Side can be selected.
- Note is optional.
- Event saves through backend.
- Timeline updates after save.

Dependencies: `createEvent` callable.

Suggested phase: Phase 4.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-018: Build bottle log flow

Goal: Log bottle feeds.

Acceptance criteria:
- Amount can be entered.
- Milk type can be selected.
- Event saves successfully.
- Timeline updates after save.

Dependencies: `createEvent` callable.

Suggested phase: Phase 4.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-019: Build diaper log flow

Goal: Log diaper events quickly.

Acceptance criteria:
- Wet, dirty, and both options exist.
- Save is fast and simple.
- Event appears in timeline.

Dependencies: `createEvent` callable.

Suggested phase: Phase 4.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-020: Build sleep log flow

Goal: Log sleep start state.

Acceptance criteria:
- Sleep start can be saved.
- Event appears in timeline.
- Handoff can reflect sleep status.

Dependencies: `createEvent` callable.

Suggested phase: Phase 4.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-021: Build medication log flow

Goal: Log medication and optionally set reminder.

Acceptance criteria:
- Medication name and dose can be entered.
- Event is saved.
- Reminder can also be created.

Dependencies: `createEvent` callable, `createReminder` callable.

Suggested phase: Phase 4.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 6: Timeline

#### PBI-022: Build Timeline screen shell

Goal: Show full history.

User story: As a caregiver, I want to see a full timeline of care actions so I can understand what happened throughout the day.

Acceptance criteria:
- Timeline screen exists.
- Title and Add Moment action exist.
- Filters exist.
- List can render timeline items.

Dependencies: shared events hook.

Suggested phase: Phase 3.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-023: Add timeline filters

Goal: Support All, Care, Growth, and Notes.

Acceptance criteria:
- Filter chips exist.
- Selected filter updates state.
- List responds to filter selection.

Dependencies: timeline adapter.

Suggested phase: Phase 3 or 7.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-024: Build timeline adapter

Goal: Merge shared care events and local Growth Timeline moments.

Acceptance criteria:
- Care events normalize into timeline items.
- Growth moments normalize into timeline items.
- Merged list sorts by occurred time descending.
- Filters work correctly.

Dependencies: care event listeners, growth timeline hook.

Suggested phase: Phase 7.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 7: Growth Timeline

#### PBI-025: Build local file storage for Growth Timeline

Goal: Save images locally on device.

User story: As a parent, I want to save photo moments locally so I can build a baby Growth Timeline without cloud complexity in v1.

Acceptance criteria:
- Image can be picked.
- Image is compressed.
- Image is stored in app local storage.

Dependencies: expo-file-system, expo-image-picker, expo-image-manipulator.

Suggested phase: Phase 7.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-026: Build Growth Timeline metadata service

Goal: Save local SQLite metadata for photo moments.

Acceptance criteria:
- Caption can be stored.
- Moment type can be stored.
- Occurred time can be stored.
- Items can be read by baby id.

Dependencies: PBI-003.

Suggested phase: Phase 7.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-027: Build Add Moment modal

Goal: Let users add photo moments.

Acceptance criteria:
- Choose photo works.
- Caption field works.
- Moment type can be selected.
- Local save works.
- Modal closes after success.

Dependencies: PBI-025, PBI-026.

Suggested phase: Phase 7.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-028: Add Growth Timeline to Timeline screen

Goal: Show photo moments inside Timeline.

Acceptance criteria:
- Growth filter shows only growth moments.
- All filter shows both care and growth items.
- Growth Timeline is not a separate tab.

Dependencies: PBI-024, PBI-027.

Suggested phase: Phase 7.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 8: Handoff

#### PBI-029: Build handoff summary backend endpoint

Goal: Produce current-state summary.

Acceptance criteria:
- Backend returns last feed, diaper, sleep, next meds, latest note, and last action by.
- Empty cases are handled safely.

Dependencies: event data, reminder data.

Suggested phase: Phase 5.

Task mapping:
- T1: Define local emulator and production configuration boundaries.
- T2: Implement Firebase client exports and environment loading.
- T3: Wire auth, Firestore, Functions/callable wrappers, and emulator switching.
- T4: Add emulator smoke checks and type coverage for exported clients.
- T5: Document config, secret-handling assumptions, and production follow-ups.

#### PBI-030: Build Handoff screen

Goal: Show current baby state in one glance.

User story: As a partner or caregiver, I want to understand current baby state in under 5 seconds so handoff is easier.

Acceptance criteria:
- Hero card exists.
- Due soon card exists.
- Latest note exists.
- Screen uses dark mode design.
- Overnight readability is high.

Dependencies: handoff summary hook.

Suggested phase: Phase 5.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 9: Reminders

#### PBI-031: Build reminders create flow

Goal: Let users create reminders.

Acceptance criteria:
- Reminder form exists.
- Reminder saves successfully.
- Reminder appears in list.

Dependencies: `createReminder` callable.

Suggested phase: Phase 5.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-032: Build reminders list screen

Goal: Show active reminders.

Acceptance criteria:
- Reminders screen exists.
- List renders active reminders.
- Empty state exists.

Dependencies: reminders listener.

Suggested phase: Phase 5.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 10: Caregivers, Settings, and Plans

#### PBI-033: Build caregivers management screen

Goal: Manage household caregiver invites.

Acceptance criteria:
- Invite form exists.
- Current caregiver section exists.
- Invite calls backend.

Dependencies: `inviteMember` callable.

Suggested phase: Phase 6.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-034: Build settings screen

Goal: Provide app management entry points.

Acceptance criteria:
- Settings rows exist for Plan, Caregivers, Reminders, Growth Timeline, and Account.
- Navigation works from Settings.

Dependencies: settings row component.

Suggested phase: Phase 6.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-035: Build plans screen

Goal: Show Free, Premium, and Family positioning.

Acceptance criteria:
- Plan cards are shown.
- Premium is recommended.
- Family is framed as household coordination.
- Feature flags can be displayed or used.

Dependencies: feature flags hook.

Suggested phase: Phase 6.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-036: Add feature flags hook and store

Goal: Load household plan capabilities.

Acceptance criteria:
- Feature flags load from backend.
- Plan screen can render them.
- Future gating is possible.

Dependencies: `getFeatureFlags` callable.

Suggested phase: Phase 6.

Task mapping:
- T1: Define local emulator and production configuration boundaries.
- T2: Implement Firebase client exports and environment loading.
- T3: Wire auth, Firestore, Functions/callable wrappers, and emulator switching.
- T4: Add emulator smoke checks and type coverage for exported clients.
- T5: Document config, secret-handling assumptions, and production follow-ups.

### Epic 11: Account and Sign Out

#### PBI-037: Build account screen

Goal: Show account details and actions.

Acceptance criteria:
- Account details screen exists.
- User name and email are visible.
- Sign out entry exists.

Dependencies: auth state.

Suggested phase: Phase 6 or 8.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-038: Build sign out confirmation flow

Goal: Allow safe account exit.

Acceptance criteria:
- Confirmation modal exists.
- Sign out works.
- App returns to auth flow after sign out.

Dependencies: auth client signOut helper.

Suggested phase: Phase 6 or 8.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 12: States and Polish

#### PBI-039: Add empty states

Acceptance criteria:
- Home empty state exists.
- Timeline empty state exists.
- Handoff empty state exists.
- Reminders empty state exists.

Suggested phase: Phase 8.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-040: Add loading states

Acceptance criteria:
- Loading placeholders or loading UI exist for Home, Timeline, and Handoff.

Suggested phase: Phase 8.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-041: Add error handling states

Acceptance criteria:
- Save failures show retryable errors.
- Failed loads surface calm error states.

Suggested phase: Phase 8.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-042: Add analytics instrumentation

Acceptance criteria:
- Onboarding completed is tracked.
- Baby created is tracked.
- First care event is tracked.
- Handoff viewed is tracked.
- Reminder created is tracked.
- Add moment is tracked.
- Plan screen viewed is tracked.

Suggested phase: Phase 8.

Task mapping:
- T1: Define data contract, authorization assumptions, and emulator-safe behavior.
- T2: Implement service/callable/listener behavior behind a narrow interface.
- T3: Handle empty, error, permission, and retry cases.
- T4: Add unit/emulator tests and verify no production deploy is required.
- T5: Document security, cost, and production rollout risks.

### Epic 13: Marketing Assets

#### PBI-043: Create App Store screenshot set

Goal: Produce launch visuals.

Acceptance criteria:
- Six screenshot concepts exist.
- Home, Handoff, Timeline, Growth Timeline, and Plans are represented.

Suggested phase: Phase 8.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-044: Create landing hero visual

Goal: Produce hero visual for waitlist page.

Acceptance criteria:
- Hero visual exists.
- Visual uses BabyMinimo logo and selected mockup direction.
- Visual emphasizes the core promise.

Suggested phase: Phase 8.

Task mapping:
- T1: Confirm scope, dependencies, acceptance criteria, design references, and forbidden areas.
- T2: Implement the smallest safe vertical slice for the PBI.
- T3: Wire data/state/navigation behavior and handle empty, loading, and error states.
- T4: Add or update focused tests, simulator smoke coverage, and visual evidence where applicable.
- T5: Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.

### Epic 14: Widgets

Widgets extend BabyMinimo's handoff promise outside the app. They should be glanceable, calm, and read-only in the first release unless interaction support is explicitly scoped later.

#### PBI-045: Define widget data contract and refresh policy

Goal: Create a safe, minimal data contract for BabyMinimo widgets.

User story: As a parent or caregiver, I want my phone widget to show the latest baby state without exposing too much sensitive detail or relying on opening the app.

Scope:
- Widget payload shape for selected baby, last feed, last diaper, sleep state, due soon item, and last sync time.
- Shared local snapshot writer from app state to widget-accessible storage.
- Privacy rules for what appears on the lock screen or home screen.
- Refresh cadence and stale-state behavior.

Acceptance criteria:
- Widget payload type exists and is covered by tests.
- Empty, stale, signed-out, and no-selected-baby states are defined.
- Payload excludes notes and free-text caregiver content by default.
- Firebase Emulator-backed app state can produce a local widget snapshot.
- Growth Timeline photos are not included in widgets in v1.

Dependencies: PBI-002, PBI-014, PBI-030, PBI-031.

Suggested phase: Phase 9.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-046: Build iOS current-state Home Screen widget

Goal: Add a read-only iOS widget showing the BabyMinimo current-state handoff snapshot.

User story: As a tired parent, I want to glance at my iPhone Home Screen and know what happened last and what is due soon.

Scope:
- Small and medium iOS widget layouts.
- Baby name, current status, last feed, last diaper, sleep state, due soon item, and last updated time.
- Empty, stale, and signed-out widget states.
- App group or equivalent native storage bridge as required by the Expo dev-build/native setup.

Acceptance criteria:
- Widget renders in iOS simulator/dev build.
- Small widget prioritizes current status and due soon.
- Medium widget includes the latest feed, diaper, sleep, and due soon summary.
- Widget uses BabyMinimo tokens and logo direction.
- Widget does not allow logging or account actions from the widget in v1.
- Widget screenshot evidence exists for small, medium, empty, and stale states.

Implementation note:
- Current local evidence covers native iOS build, extension embedding, app launch, and app-side snapshot publishing. Full Home Screen widget placement screenshots for small, medium, empty, and stale states still need a simulator Home Screen widget-add flow or manual/widget-host tooling before PBI-046 can be treated as visually complete.

Dependencies: PBI-045.

Suggested phase: Phase 9.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-047: Add widget settings and privacy controls

Goal: Let users understand and control widget visibility.

User story: As a caregiver, I want to choose whether BabyMinimo widgets can show baby status on my device.

Scope:
- Settings entry for Widgets.
- Toggle for enabling widget snapshot updates.
- Privacy explanation for what the widget can show.
- Stale-data reset or clear-widget-data action.

Acceptance criteria:
- Settings includes a Widgets row.
- Widget controls are functional locally.
- Turning widgets off clears or blanks the widget snapshot.
- Copy is calm and explicit about local device visibility.

Implementation note:
- Local implementation adds Settings > Widgets, a local widget visibility store, safe disabled widget copy, a clear snapshot action, and simulator evidence at `docs/qa/screenshots/pbi-047/widgets-enabled.png` and `docs/qa/screenshots/pbi-047/widgets-disabled.png`.
- No dedicated approved widget-settings screenshot exists yet; the screen intentionally follows the approved Settings reference visual language and should be replaced or tightened if a specific widget-settings baseline is added later.

Dependencies: PBI-034, PBI-045.

Suggested phase: Phase 9.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

#### PBI-048: Plan Android widget parity

Goal: Define the Android widget path without blocking the iOS widget MVP.

User story: As an Android caregiver, I want the same BabyMinimo glanceable state on my home screen.

Scope:
- Android widget implementation plan.
- Required native modules or Expo config/plugin decision.
- Layout parity notes for small and medium widget equivalents.
- Test strategy and known platform differences.

Acceptance criteria:
- Android widget technical plan exists.
- Implementation dependencies and risks are documented.
- iOS MVP remains unblocked.

Implementation note:
- Android widget parity is documented in `docs/product/babyminimo-android-widget-parity-plan.md`.
- The recommended path is a custom Expo config plugin plus native Android `AppWidgetProvider`, using the shared BabyMinimo widget payload contract and the existing Settings > Widgets controls.
- Android native implementation and Android widget placement screenshots are intentionally deferred until after iOS widget visual acceptance is complete.

Dependencies: PBI-045, PBI-046.

Suggested phase: Phase 9 or post-v1.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

### Epic 15: Production Readiness

Production readiness is a separate phase from the local demo. These PBIs move BabyMinimo from Firebase Emulator demo behavior toward a release candidate with verified backend security, notifications, release QA, and privacy controls.

#### PBI-049: Implement local notification system

Goal: Add BabyMinimo local reminder notifications and app-side notification handling.

User story: As a parent or caregiver, I want timely BabyMinimo notifications so the household can stay coordinated without constantly opening the app.

Scope:
- Notification permission request flow.
- Local notification scheduling for reminders.
- App-side notification infrastructure using `expo-notifications` for local device scheduling only.
- Production push provider decision recorded separately in PBI-061; Expo Push Service is not the default production plan.
- Notification preference model for feeding, medication, sleep, household/caregiver updates, and milestones.
- Quiet hours behavior.
- Deep links from notifications to the relevant BabyMinimo screen.
- Cancellation/rescheduling when reminders are edited, toggled off, completed, or deleted.

Acceptance criteria:
- Permission states are handled: not asked, granted, denied, and provisional/limited where supported.
- Reminder creation schedules a local notification in dev build.
- Reminder toggle/delete cancels the scheduled notification.
- Quiet hours suppress or delay non-critical notifications.
- Notification copy is calm, caregiver-safe, and avoids sensitive free-text notes.
- Notification deep links open the correct app route.
- Tests cover scheduling, cancellation, disabled permissions, and quiet-hours behavior.

Dependencies: PBI-031, PBI-032, PBI-034.

Suggested phase: Phase 10.

Task mapping:
- T1: Define data contract, authorization assumptions, and emulator-safe behavior.
- T2: Implement service/callable/listener behavior behind a narrow interface.
- T3: Handle empty, error, permission, and retry cases.
- T4: Add unit/emulator tests and verify no production deploy is required.
- T5: Document security, cost, and production rollout risks.

#### PBI-061: Hybrid local and Firebase push notification provider

Goal: Keep local notifications as the default low-cost reminder path and add sparse production push notifications through Firebase Cloud Messaging and Apple Push Notification service for cross-device, critical, and conversion use cases.

User story: As a parent or caregiver, I want BabyMinimo to remind me locally when possible and only use remote push when the household, account, or product context truly requires it.

Scope:
- Add a notification provider abstraction with separate local and production push paths.
- Keep `expo-notifications` for local notification scheduling, permission handling, foreground handling, and notification response/deep-link behavior.
- Treat local notifications as the default for device-owned reminders: feeding, medication, sleep, tummy time, and routine household nudges.
- Add Firebase Cloud Messaging registration for production push tokens.
- Configure iOS APNs integration through Firebase Cloud Messaging.
- Store device push tokens in Firestore under user/household-scoped records with least-privilege rules.
- Add token refresh, token deletion on sign out/account deletion, and stale-token cleanup behavior.
- Add backend send path through Firebase Functions or another approved backend service.
- Add sparse remote-push templates for cross-device household updates, caregiver invites, critical due-soon events, account/security notices, trial/plan lifecycle, and carefully limited conversion/activation nudges.
- Add a notification routing policy that decides local vs remote push by use case, urgency, audience, permission state, and cost impact.
- Add rate limits, quiet-hours rules, and opt-out controls for non-critical conversion/activation notifications.
- Preserve caregiver-safe notification copy; do not include sensitive free-text notes.
- Keep Expo Push Service as a documented optional future migration path only.

Acceptance criteria:
- App has a clear `NotificationProvider` boundary for local notifications vs production push.
- Routine reminders use local scheduling by default and do not require backend push fan-out.
- Production builds register native/Firebase push tokens for remote push use cases, not Expo push tokens.
- iOS APNs credentials are configured through Firebase/Apple release setup, with no credentials committed.
- Firestore rules prevent cross-household token reads/writes.
- Sign out, account deletion, and household removal unregister or invalidate device tokens.
- Backend send path can deliver a test push to a physical iOS device through FCM/APNs.
- Remote push use is limited by policy to cross-device, critical, account/security, lifecycle, or explicitly approved conversion/activation use cases.
- Non-critical conversion/activation push respects opt-out, rate limits, and quiet hours.
- Notification deep links route to the intended BabyMinimo screen.
- Tests cover local-vs-remote routing decisions, token registration, token refresh, token cleanup, denied permissions, backend payload building, rate limits, quiet hours, opt-out, and sensitive-copy exclusion.
- Documentation explains cost boundaries: FCM itself is a no-cost Firebase product, while Functions, Firestore token storage, logs, egress, Apple Developer Program membership, and store fees may still cost money.

Dependencies: PBI-049, PBI-050, PBI-051, PBI-052, PBI-053, PBI-056, PBI-057.

Suggested phase: Phase 11.

Task mapping:
- T1: Define data contract, authorization assumptions, and emulator-safe behavior.
- T2: Implement service/callable/listener behavior behind a narrow interface.
- T3: Handle empty, error, permission, and retry cases.
- T4: Add unit/emulator tests and verify no production deploy is required.
- T5: Document security, cost, and production rollout risks.

#### PBI-050: Production Firebase and security hardening

Goal: Replace emulator-only assumptions with production-ready Firebase configuration and rules.

User story: As a BabyMinimo household, I want my baby's data protected so only authorized caregivers can access the right household information.

Scope:
- Production Firebase environment configuration.
- Firestore security rules for households, babies, care events, reminders, invites, feature flags, and user profiles.
- Firebase Auth production behavior and session bootstrap review.
- Emulator-backed security rules test suite.
- Separation between local emulator config and production config.
- Secret and API key handling review.

Acceptance criteria:
- App can switch between emulator and production Firebase config without code edits.
- Firestore rules deny cross-household reads and writes.
- Caregiver roles are enforced for household-scoped data.
- Invite/member flows do not allow privilege escalation.
- Security rules tests pass locally against the Firebase Emulator.
- No production secrets are committed.
- Production rules deployment is documented but not run without explicit approval.

Dependencies: PBI-002, PBI-007, PBI-010, PBI-017 through PBI-021, PBI-031, PBI-033, PBI-036.

Suggested phase: Phase 10.

Task mapping:
- T1: Define local emulator and production configuration boundaries.
- T2: Implement Firebase client exports and environment loading.
- T3: Wire auth, Firestore, Functions/callable wrappers, and emulator switching.
- T4: Add emulator smoke checks and type coverage for exported clients.
- T5: Document config, secret-handling assumptions, and production follow-ups.

#### PBI-066: Firebase Remote Config and remote app controls

Goal: Add a safe remote configuration layer for non-critical app behavior, rollout control, and paywall/onboarding experiments.

User story: As the product owner, I want to update selected BabyMinimo behavior remotely so we can tune copy, rollout flags, and experiments without shipping a new build for every low-risk change.

Scope:
- Add Firebase Remote Config client integration for production builds.
- Add an emulator/dev-safe fallback because Firebase Remote Config does not have the same local emulator workflow as Auth, Firestore, or Functions.
- Create a typed Remote Config schema with defaults, validation, allowed values, owner, rollout notes, and rollback guidance.
- Support non-sensitive remote controls:
  - onboarding copy and questionnaire variant identifiers
  - paywall copy/layout experiment identifiers
  - notification nudge copy/rate-limit flags
  - support/help URLs
  - maintenance or incident banners
  - localized metadata/config pointers
  - screenshot/ASO campaign variant labels
  - non-critical feature rollout and kill switches
- Allow A/B testing through Remote Config for copy, paywall layout, onboarding order, and messaging experiments.
- Keep pricing source of truth in StoreKit/App Store Connect; Remote Config may select variants or labels but must not hardcode runtime prices.
- Add fetch/activate policy, minimum fetch interval, stale-config fallback, and offline/default boot behavior.
- Add analytics exposure logging for experiment IDs and variant IDs when analytics is enabled.
- Document operational ownership for each config key and define who can change production values.

Forbidden:
- Do not store secrets, API keys, entitlement grants, or security decisions in Remote Config.
- Do not control authentication, authorization, Firestore security rules, account deletion, data purge eligibility, or payment entitlement validity through Remote Config.
- Do not use Remote Config as the source of truth for App Store product prices or subscription status.
- Do not put PII, baby names, caregiver notes, or household-specific data in Remote Config.

Acceptance criteria:
- Typed Remote Config defaults exist and app boot succeeds offline with defaults only.
- Invalid or unknown config values are ignored or fall back safely.
- Remote Config fetch/activate failures do not block auth, onboarding, care logging, reminders, or sign out.
- Paywall/pricing A/B flags can switch copy/layout/variant IDs while StoreKit localized product values remain the runtime pricing source.
- Notification and marketing nudge flags respect quiet-hours, opt-out, and rate-limit policy from PBI-049/PBI-061.
- Config key registry documents key name, type, default, allowed values, owner, rollout plan, rollback plan, and release risk.
- Tests cover defaults, validation, stale config, invalid config, failed fetch, experiment exposure mapping, and pricing-source boundary.
- Release readiness checks verify no secrets or critical-path decisions are controlled remotely.

Dependencies:
- PBI-036
- PBI-049
- PBI-050
- PBI-051
- PBI-064
- PBI-065

Suggested phase: Phase 11, after production Firebase/security planning and before final pricing, localization, screenshots, and release readiness.

Task mapping:
- T1: Define Remote Config key registry, schema, defaults, safety boundaries, and dev fallback behavior.
- T2: Implement typed Remote Config service with fetch/activate, validation, stale fallback, and offline defaults.
- T3: Wire low-risk consumers for paywall variants, onboarding/questionnaire variants, support URLs, notification nudge flags, and maintenance banners.
- T4: Add tests for defaults, invalid values, failed fetch, stale config, experiment exposure IDs, and pricing-source guardrails.
- T5: Document production operating rules, rollout/rollback process, A/B testing scope, and GoalBuddy receipt.

#### PBI-051: Full interaction hardening

Goal: Ensure every visible BabyMinimo control is functional, intentionally disabled, or removed.

User story: As a caregiver, I want every button, icon, row, and control to behave predictably so the app feels reliable.

Scope:
- Audit all visible controls across auth, onboarding, Home, logging, Timeline, Handoff, Reminders, Family, Settings, Plans, Account, states, and widgets.
- Wire missing navigation/actions where in scope.
- Disable or hide unsupported controls with clear product reasoning.
- Add accessibility labels/test IDs for remaining interactive elements.
- Document intentionally deferred controls.

Acceptance criteria:
- Control inventory exists and maps each visible control to functional, disabled, hidden, or deferred.
- Apple/Google auth buttons are either implemented or visibly disabled/deferred.
- Timeline search/settings, Handoff bell, plan CTAs, and header/right icons are resolved.
- Unsupported production features do not look tappable.
- Maestro smoke coverage includes representative interactions for each core screen.
- No accidental no-op buttons remain in release-candidate screens.

Dependencies: PBI-005 through PBI-038, PBI-045 through PBI-047.

Suggested phase: Phase 10.

Task mapping:
- T1: Confirm scope, dependencies, acceptance criteria, design references, and forbidden areas.
- T2: Implement the smallest safe vertical slice for the PBI.
- T3: Wire data/state/navigation behavior and handle empty, loading, and error states.
- T4: Add or update focused tests, simulator smoke coverage, and visual evidence where applicable.
- T5: Update CHANGELOG.md, docs, and GoalBuddy receipt with verification results and caveats.

Implementation receipt:
- Completed local interaction hardening for the demo/release-candidate UI: unsupported social login and StoreKit purchase actions are disabled/deferred, Settings non-action rows no longer look tappable, Home Growth Timeline routes to Timeline, Settings plan management routes to Plans, Family plan management scrolls to caregiver invite, Handoff reminder icon routes to Reminders, and Login remember-me toggles local state.
- Removed the Home lazy-loading `InteractionManager` warning path so the simulator no longer shows the deprecation warning banner during smoke tests.
- Verification passed: `bun run test:typecheck`, `bun run test:unit`, `npx expo-doctor`, and `maestro test e2e/maestro/smoke.yaml`.
- Evidence is recorded under `docs/qa/screenshots/pbi-051/` and in `docs/product/babyminimo-interaction-hardening-inventory.md`.

#### PBI-052: E2E and visual release QA

Goal: Establish release-grade automated QA for app flows and exact visual matching.

User story: As the product owner, I want automated tests to prove the app works and matches approved screenshots before release.

Scope:
- Maestro E2E flows for auth, onboarding, care logging, Timeline filters, Add Moment, Handoff, reminders, family invite, settings, plans, account, sign out, widgets where possible, and notifications where possible.
- Strict visual comparison against `docs/product/superdesign-reference-assets/screenshots1/`.
- Scrollable screen top/middle/bottom baseline coverage.
- Test artifacts and failure triage documentation.
- CI-ready command list, even if CI setup is deferred.

Acceptance criteria:
- E2E smoke flow covers the happy path from signup through core app navigation.
- Visual baseline config maps all approved screenshot files that are in release scope.
- Visual diff threshold is zero pixels unless the product owner replaces the approved baseline.
- Scrollable screens fail coverage checks when top/middle/bottom baselines are missing.
- Test strategy lists required manual checks that cannot be automated yet.
- `bun run test:all`, `bun run test:e2e:smoke`, and visual comparison commands are documented and passing for the release candidate.

Dependencies: PBI-039, PBI-040, PBI-041, PBI-049, PBI-051.

Suggested phase: Phase 10.

Task mapping:
- T1: Inventory required functional, visual, and non-functional coverage.
- T2: Create or update Maestro, unit, integration, and visual comparison assets.
- T3: Run the relevant local/emulator/simulator test suite.
- T4: Record failures, coverage gaps, and manual QA requirements.
- T5: Update docs, scripts, and GoalBuddy receipts with reproducible commands.

Implementation receipt:
- Expanded `e2e/maestro/smoke.yaml` to cover auth/onboarding reachability, core logging, Timeline growth filter, Handoff, Family manage-caregiver scroll, Settings, Plans, Widgets, Reminders, and Account.
- Updated `e2e/maestro/visual-regression.yaml` to match the current `Baby MiniMemo` login copy and capture the release visual subset.
- Added `docs/testing/babyminimo-release-qa-inventory.md` with functional coverage, visual coverage, scrollable baseline gaps, manual QA requirements, and release blockers.
- Verification passed: `bun run test:typecheck`, `bun run test:unit`, `npx expo-doctor`, `maestro test e2e/maestro/smoke.yaml`, and `maestro test e2e/maestro/visual-regression.yaml`.
- Strict visual pixel comparison is not release-green yet: `bun run test:visual:compare` fails because approved mockups are cropped around `344x730` while Maestro captures full simulator frames at `1206x2622`; Home, Timeline, Family, and Settings also need middle/bottom approved scroll baselines.

#### PBI-065: App, store metadata, and screenshot localization

Goal: Localize BabyMinimo app strings, App Store metadata, and release screenshots for supported launch languages.

User story: As a parent or caregiver in a supported locale, I want BabyMinimo to feel native in my language so the app, store listing, paywall, reminders, and screenshots are clear and trustworthy.

Supported locales:
- Arabic (`ar`)
- Czech (`cs`)
- Danish (`da`)
- English (`en`)
- Estonian (`et`)
- Lithuanian (`lt`)
- Latvian (`lv`)
- German (`de`)
- Greek (`el`)
- Spanish (`es`)
- Finnish (`fi`)
- Filipino (`fil`)
- French (`fr`)
- Hebrew (`he`)
- Croatian (`hr`)
- Hungarian (`hu`)
- Indonesian (`id`)
- Italian (`it`)
- Japanese (`ja`)
- Korean (`ko`)
- Malay (`ms`)
- Dutch (`nl`)
- Norwegian (`nb`)
- Polish (`pl`)
- Portuguese (`pt`)
- Romanian (`ro`)
- Russian (`ru`)
- Slovak (`sk`)
- Swedish (`sv`)
- Thai (`th`)
- Turkish (`tr`)
- Ukrainian (`uk`)
- Vietnamese (`vi`)
- Simplified Chinese (`zh-Hans`)
- Traditional Chinese (`zh-Hant`)

Scope:
- Add an app localization framework for UI strings, validation messages, notification copy, onboarding, paywall, settings, empty/loading/error states, widgets, and account deletion copy.
- Localize App Store metadata: app name where appropriate, subtitle, promotional text, description, keywords, privacy/permission copy, paywall copy, and screenshot headlines.
- Localize store-facing pricing metadata for every supported storefront/locale: subscription display names, billing periods, trial terms, promotional offers, retention offers, gift plan copy, savings badges, restore/manage subscription copy, and cancellation disclosures.
- Show prices in each user's local currency and language using StoreKit/App Store product display price values as the source of truth, not hand-authored converted prices.
- Maintain a storefront pricing matrix that maps country/region, locale, currency, Apple price tier or configured price, localized period text, localized savings badge text, tax/VAT-inclusive display assumptions, and effective date.
- Include affordability/PPP-style local pricing metadata with a BabyMinimo cost-floor marker: each country price must show whether it is above unit economics after App Store fees, estimated Firebase/notification/support costs, taxes/VAT assumptions, and expected usage.
- Mark any low-price storefront such as Nigeria with an explicit status: `above_floor`, `near_floor`, or `below_floor_blocked`; blocked prices must not ship even if they look locally affordable.
- Preserve the English canonical positioning:
  - App Store name: `BabyMinimo: Baby Tracker`
  - Subtitle: `Feeding, sleep & diaper log`
  - Positioning: `The calm baby log for feeding, sleep, diapers, memories, and caregiver handoffs.`
- Prepare localized screenshot generation inputs for PBI-063: benefit headlines, screenshot manifest locale column, localized source-state seed data, and device/font notes.
- Handle RTL layout requirements for Arabic and Hebrew, including text alignment, direction, clipped text checks, and icon placement where mirrored layouts are expected.
- Define translation QA workflow using native-speaker review where possible and machine translation only as a first draft.
- Add locale fallback rules: unsupported locale falls back to English; incomplete keys fail tests before release.
- Include string-length and truncation checks for compact UI, buttons, tabs, paywall rows, localized price strings, notifications, widgets, and App Store metadata length limits.

Acceptance criteria:
- Localization key inventory covers all user-facing app strings in release scope.
- Locale files exist for every supported locale listed above.
- English canonical copy is approved before translation.
- Arabic and Hebrew pass RTL smoke checks on auth, onboarding, Home, Timeline, Handoff, Reminders, Settings, Plans/Paywall, and Account.
- Localized App Store metadata exists for every supported locale, including keywords where Apple supports per-locale keyword fields.
- Localized pricing metadata exists for every supported locale/storefront, including weekly, monthly, annual, trial, lifetime, gift, promotional, and retention-offer copy where those products are enabled.
- Paywall and pricing UI use StoreKit localized display price/currency data at runtime and never rely on static USD-to-local-currency conversions.
- Storefront pricing matrix includes country/region, language, currency, product ID, localized billing period, savings-badge calculation, and App Store configured price source.
- Storefront pricing matrix includes affordability/PPP notes, cost-floor estimate, above-floor marker, and launch/no-launch decision for each country/region price.
- PBI-063 screenshot manifest can generate localized screenshot sets for every supported locale without missing headline/caption strings.
- Automated tests fail on missing translation keys, malformed interpolation variables, unsupported fallback paths, invalid metadata lengths, and missing localized pricing metadata.
- Manual QA checklist exists for at least high-risk text expansion locales: German, Finnish, Russian, Arabic, Hebrew, Japanese, Korean, Simplified Chinese, and Traditional Chinese.

Dependencies:
- PBI-051
- PBI-052
- PBI-064 for paywall and pricing copy
- PBI-066 for localized remote config keys, experiment labels, and rollout flags

Suggested phase: Phase 11, before ASO screenshot generation and release readiness.

Task mapping:
- T1: Create localization architecture, locale list, key naming conventions, fallback behavior, and canonical English string inventory.
- T2: Add translated app strings, App Store metadata drafts, notification copy, paywall/pricing copy, country/storefront pricing metadata, and screenshot headline inputs for all supported locales.
- T3: Add tests for missing keys, interpolation variables, fallback behavior, metadata length limits, localized pricing metadata, and screenshot manifest locale completeness.
- T4: Run simulator smoke/visual checks for English plus RTL and text-expansion representative locales.
- T5: Record native-speaker/manual QA gaps, update PBI docs, CHANGELOG.md, and GoalBuddy receipt.

Implementation receipt:
- T1 added `docs/product/babyminimo-localization-architecture.md` with the supported locale inventory, key naming conventions, fallback behavior, canonical English string inventory, pricing localization rules, metadata length checks, RTL QA requirements, and translation QA workflow.
- T2 added `docs/localization/` draft assets for all 35 supported locales, including app strings, App Store metadata drafts, notification/paywall/pricing copy, screenshot headline inputs, and a StoreKit-centered storefront pricing matrix with review status markers. Non-English files are marked `draft_requires_native_review` until translation and native review are completed.
- T3 added `scripts/localization/validate-localization-assets.mjs` and documented the validation command in `docs/localization/README.md`. The validator checks locale/file completeness, English key parity, interpolation placeholders, metadata length limits, StoreKit runtime-price-source rules, product IDs, margin markers, launch-decision fields, and screenshot headline completeness. The first validation pass caught and fixed the Google Play short description length from 81 to 79 characters.

#### PBI-063: ASO App Store screenshot generation and gifting creative set

Goal: Produce the final App Store screenshot set from approved BabyMinimo simulator states before go-live.

User story: As the product owner, I want App Store screenshots that clearly sell BabyMinimo's strongest benefits so parents understand why to download, subscribe, or gift the app.

Reference:
- Use the `adamlyttleapps/claude-skill-aso-appstore-screenshots` workflow as the ASO screenshot process reference.
- Use `/Users/frank/flashcard-generator` as a precedent for screenshot capture, visual baseline, and generated asset organization patterns.
- Use `docs/product/superdesign-reference-assets/screenshots1/` and the BabyMinimo implementation plan as the visual source of truth.
- Use PBI-065 localized screenshot headline inputs and locale manifest data for localized App Store screenshot generation.

Scope:
- Discover and confirm 5-7 App Store benefit headlines before generation.
- Benefits must lead with action verbs and describe what parents/caregivers get, not internal features.
- Capture or select clean simulator screenshots for Home, Handoff, Timeline/Growth Timeline, Reminders, Family coordination, Plans/Paywall, and one optional gifting/subscription-for-someone screen.
- Grade source screenshots as Great, Usable, or Retake before pairing them to benefits.
- Generate final framed App Store screenshot assets only from approved BabyMinimo UI states.
- Add one extra screenshot if gifting or buying a subscription for another person needs its own clear benefit creative.
- Avoid login screens, debug UI, sparse empty states, and placeholder data unless intentionally selected for a specific store message.
- Create a screenshot manifest with benefit headline, source simulator screenshot, generated asset path, device target, locale, and retake notes.
- Generate localized screenshot sets for all supported PBI-065 locales after the English set is approved.

Acceptance criteria:
- Confirmed benefit list exists before any generated screenshots are accepted.
- Every final screenshot maps to a clear user benefit and a specific approved simulator source screenshot.
- The screenshot set covers the core value chain: handoff, care logging, Timeline/Growth Timeline, reminders, household coordination, and plan/gifting value when in scope.
- Optional gift/subscription screenshot is included only if the purchase and entitlement story is accurate for the release.
- Final assets have no visible debug chrome, no emulator warning overlays, no broken status bar, and no mismatched visual language.
- Scrollable screens use intentional top/middle/bottom captures where needed.
- The release checklist in PBI-053 references the final screenshot manifest.
- Localized screenshot outputs exist or are explicitly deferred with a locale-by-locale release note.

Dependencies:
- PBI-035
- PBI-043
- PBI-052
- PBI-065
- PBI-055 when subscription or gifting screenshots show purchase behavior

Suggested phase: Phase 11, immediately before Release and App Store readiness.

Task mapping:
- T1: Run ASO benefit discovery using the app-store-screenshot skill framework and BabyMinimo product hierarchy.
- T2: Capture, inspect, and grade simulator screenshots against approved BabyMinimo visual references.
- T3: Pair each confirmed benefit with a source screenshot and identify whether an extra gifting/subscription creative is needed.
- T4: Generate/export the final App Store screenshot set and screenshot manifest.
- T5: Verify assets against the manifest, update release docs, CHANGELOG.md, and GoalBuddy receipt.

#### PBI-053: Release and App Store readiness

Goal: Prepare BabyMinimo for TestFlight and App Store submission.

User story: As the product owner, I want a release-ready iOS build so BabyMinimo can be tested and submitted through Apple safely.

Scope:
- Bundle identifier, display name, app icon, splash, build number, and versioning.
- Signing profile and EAS or Xcode build path decision.
- TestFlight build workflow.
- App Store metadata checklist.
- Privacy nutrition labels and permission purpose strings.
- Final localized ASO App Store screenshot set, screenshot manifest, and landing hero asset review.
- Release checklist and rollback notes.

Acceptance criteria:
- Release build path is documented and smoke-tested.
- App icon, splash, display name, bundle ID, and version fields are correct.
- Required iOS permission strings exist and match app behavior.
- Privacy disclosures cover Firebase, notifications, analytics, local photos, and widgets.
- TestFlight upload checklist exists.
- App Store screenshots are generated/localized, mapped to approved visual states, and linked from the final screenshot manifest.
- No emulator-only config is enabled in release builds.

Dependencies: PBI-043, PBI-044, PBI-049, PBI-050, PBI-052, PBI-063, PBI-065, PBI-066.

Suggested phase: Phase 11.

Task mapping:
- T1: Confirm release prerequisites, signing, metadata, privacy, and store constraints.
- T2: Prepare release configuration, assets, and documentation.
- T3: Run production-build or TestFlight smoke path without enabling emulator config.
- T4: Verify App Store/TestFlight checklist, screenshots, and rollback notes.
- T5: Record release evidence, blockers, and explicit go/no-go status.

#### PBI-054: Implement widget release slice

Goal: Build and verify the first production-eligible BabyMinimo widget implementation.

User story: As a caregiver, I want a safe read-only BabyMinimo widget so I can glance at the latest handoff state from my phone home screen.

Scope:
- iOS widget extension implementation.
- Widget snapshot writer integration with app state.
- Widget privacy controls from Settings.
- Signed-out, stale, empty, and no-selected-baby states.
- Widget visual QA against approved BabyMinimo style.
- Release build compatibility.

Acceptance criteria:
- iOS small and medium widgets render from app-provided snapshot data.
- Widget state updates after relevant app events within the documented refresh policy.
- Widget payload excludes Growth Timeline photos, notes, invite details, billing data, and account data.
- Settings controls can stop widget updates and clear local widget snapshot data.
- Widget screenshots exist for all required states.
- Widget passes privacy review and release build smoke test.

Dependencies: PBI-045, PBI-046, PBI-047, PBI-050, PBI-053.

Suggested phase: Phase 11.

Task mapping:
- T1: Compare the target screen against approved screenshots and screen contracts.
- T2: Implement layout, components, typography, spacing, and visual states.
- T3: Wire navigation/actions and data dependencies without adding unsupported controls.
- T4: Capture simulator evidence and run typecheck plus relevant smoke tests.
- T5: Update changelog and note any missing scroll-state baseline coverage.

Implementation receipt:
- PBI-054 tightened the read-only widget release slice by adding explicit widget state badges and safer copy for signed-out, setup, disabled, empty, stale, expired, and live states.
- Home now publishes a safe blank disabled widget state when local widget visibility is off, and sign-out blanks the widget before returning to auth.
- Verified with `bun run test:typecheck`, `bun run test:unit`, `npx expo-doctor`, and `maestro --udid B2C19543-60E2-489E-8E08-4E3F775AD6A0 test e2e/maestro/smoke.yaml`.
- Simulator evidence for Settings > Widgets is saved at `docs/testing/screenshots/pbi-054/widgets-settings.png`.
- No approved `screenshots1/` baseline exists yet for native Home Screen widget placement or the Widget Settings screen. The current implementation follows the approved Settings/Home visual language and the widget privacy contract; native small/medium Home Screen widget placement screenshots remain a release QA gap.

#### PBI-064: Conversion paywall design and pricing experiment plan

Goal: Define and implement a BabyMinimo paywall strategy that can be tested safely with Apple IAP.

User story: As the product owner, I want a high-converting but accurate paywall so parents understand BabyMinimo's value and can choose weekly, monthly, annual, lifetime, or gifting options without confusing billing behavior.

Reference:
- Use the provided YouTube paywall screenshots as visual inspiration only, not as copied assets or proof of Apple approval.
- Visually reverse engineer the pattern into a BabyMinimo-specific paywall: dynamic brand mark, benefit bullets with icons, plan rows, selected-plan checkmark, trial toggle/disclosure, strong CTA, close button, restore link, terms/privacy links, and clear billing copy.
- Use BabyMinimo's approved warm-neutral visual system, logo, and `screenshots1` references rather than the source apps' colors, mascots, or language.
- Apple reference assumptions: weekly/monthly/yearly auto-renewable subscription durations are supported; 3-day free trials are supported introductory offers; paid 3-day intro pricing such as $0.99 or $0.50 must be validated in App Store Connect before implementation.
- Apple Retention Messaging API is a pre-release/limited-access cancellation-retention surface. Treat it as a release-readiness opportunity only after Apple access, eligibility, and App Store Connect setup are confirmed.
- Competitor pricing observation: one baby-tracker competitor appears to expose several products around weekly, monthly, and annual price points, including repeated annual pricing near EUR 24.99/year. Treat this as market research only, not proof of conversion or a reason to ship many products at launch.

Scope:
- Create a BabyMinimo paywall screen spec and implementation plan for Premium, Family, gifting, and lifetime access.
- Include plan candidates:
  - Annual default: $39.99/year candidate, selected by default, with "Save 65%" as the initial planning badge if the configured StoreKit monthly comparison price makes the claim mathematically true.
  - Monthly: $9.99/month candidate.
  - Weekly: $3.99/week candidate, available as an experiment or fallback plan but not the primary recommended default.
  - Trial: optional 3-day free trial candidate where Apple eligibility permits and billing terms are clear.
  - Paid trial research: $0.99 or $0.50 for a short intro period is a research candidate only and must not ship until App Store Connect confirms the exact offer structure is valid.
  - Lifetime: expensive one-time non-consumable candidate priced from a 25- or 26-month value anchor: 2 years of access plus either 1 extra monthly period or 2 extra monthly periods. With the current $9.99/month planning price, the raw anchor range is $249.75-$259.74 before selecting the closest App Store price point and validating margin/support risk.
- Launch with a small clean pricing matrix before adding more products; do not mirror competitor-style product sprawl unless experiments prove it is needed.
- Test annual price anchors before adding many plan variants. Initial annual anchor candidate is $39.99/year; lower annual anchors such as $29.99/year or market-local equivalents may be tested later through App Store Connect/storefront pricing, not hardcoded UI.
- Define whether lifetime applies to personal Premium only or also Family; default to Premium-only unless backend cost analysis approves Family lifetime.
- Define a country/storefront pricing matrix for every launch market, with local currency, App Store configured price/tier, localized billing period text, localized savings claim, tax/VAT display assumptions, and effective date.
- Add a PPP-style affordability model with an above-floor marker. The model may lower prices for markets with lower purchasing power, but each storefront price must remain above BabyMinimo's estimated contribution-margin floor after App Store commission, taxes/VAT assumptions, Firebase reads/writes/storage/functions, notifications, support, refunds, and expected family/caregiver usage.
- Example guardrail: a Nigeria price such as NGN 500 or NGN 1,000 is only allowed if the pricing matrix marks it `above_floor`; otherwise it must be raised, converted into a limited intro offer, or excluded from launch pricing.
- Runtime paywall prices must come from StoreKit localized product values for the user's storefront; hardcoded USD strings are allowed only in planning docs and tests.
- Add dynamic BabyMinimo logo/brand animation requirement using a local Lottie or generated animation asset only if it matches the approved mockup direction and does not slow first paint.
- Define icon-led benefit copy, with one small BabyMinimo icon before each line of paywall value text.
- Include savings badges such as "Save 50%" or "Save 90%" on annual, lifetime, or gift plans only when the percentage is mathematically true against the clearly displayed weekly/monthly comparison price.
- Savings badges must be generated from the pricing matrix, not hardcoded marketing copy, so App Store price changes cannot leave stale or misleading discount claims.
- Use Firebase Remote Config from PBI-066 for paywall copy/layout variant IDs, experiment IDs, and rollout flags only; StoreKit/App Store Connect remains the source of truth for product prices, localized display prices, subscription status, and entitlement state.
- Include payment test cases for weekly, monthly, annual, trial eligibility, restore, cancel, billing retry, lifetime purchase, duplicate lifetime purchase, and gift purchase/redemption if gifting is in scope.
- Include commercial experiment hypotheses for weekly vs monthly, trial vs no trial, lifetime anchor vs no lifetime, and gift subscription positioning.
- Include a cancellation-retention experiment plan using Apple's Retention Messaging API if available:
  - Default message candidate: "Keep your care circle in sync with BabyMinimo."
  - Offer candidate: 25-30% off the next 2 months, or a short Family/Premium extension, depending on App Store promotional-offer constraints.
  - Trigger: only on Apple's subscription cancellation confirmation surface, not as an in-app dark pattern.
  - Audience: recently active households or caregivers who have logged care in the last 14-30 days; exclude users with refund, billing retry, account deletion, or privacy-risk states.
  - Metrics: cancellation saves, offer redemption, 30/60/90-day retained revenue, refund rate, support tickets, and downstream churn.
- Keep paywall copy transparent: show price, renewal period, trial terms, cancellation path, and restore option.

Acceptance criteria:
- Paywall spec includes visual layout, component states, icon rules, dynamic logo/animation guidance, and BabyMinimo-specific copy.
- Pricing matrix documents weekly, monthly, annual, trial, lifetime, gifting candidates, comparison baseline, localized price strings, country/storefront currency, and computed savings badge text with App Store product type assumptions.
- Initial launch hypothesis documents Annual $39.99/year selected by default, Monthly $9.99/month, Weekly $3.99/week as an experiment/fallback, and optional 3-day free trial only with clear terms.
- Every enabled storefront has localized price/billing-period/offer terms for the paywall, metadata, screenshots, and cancellation-retention messaging.
- Every country/storefront price has an affordability note, estimated cost floor, above-floor marker, and explicit launch decision before it is configured in App Store Connect.
- PPP-style discounts are blocked when the projected contribution margin is negative or too close to the cost floor for expected usage.
- "Save 50%" / "Save 90%" badges are allowed only when the calculation, baseline, and displayed price support the claim for the user's storefront.
- The $0.99/$0.50 short trial idea is explicitly marked as validation-only until App Store Connect confirms the product/offer can be configured.
- Lifetime purchase is modeled as a non-consumable IAP candidate, not an auto-renewable subscription, and includes backend cost/risk caveats.
- Lifetime price recommendation documents the selected 25-month or 26-month formula, the monthly baseline used, the nearest App Store price point, and why the long-term support/data cost is still acceptable.
- Paywall implementation must not use dark-pattern copy such as fake scarcity, misleading savings, or unclear renewal terms.
- Retention Messaging API work is documented as access-gated and must not block launch if Apple access is unavailable.
- Retention offers use truthful Apple promotional-offer terms, server-side eligibility checks, and App Store Server Notifications to reconcile cancellation, redemption, renewal, and refund outcomes.
- StoreKit, sandbox, and TestFlight validation cases are listed before PBI-055 implementation begins.
- ASO screenshots in PBI-063 may include the paywall or gifting creative only after the paywall plan is accurate.

Dependencies:
- PBI-035
- PBI-036
- PBI-051
- PBI-066 for remote paywall variant and experiment flags
- PBI-055 for implementation
- PBI-063 for App Store screenshot use

Suggested phase: Phase 11, before Native subscriptions and Apple IAP implementation.

Task mapping:
- T1: Produce the BabyMinimo paywall visual spec from the reference pattern without copying source app assets.
- T2: Define product IDs, pricing candidates, country/storefront pricing matrix, PPP-style affordability model, cost-floor markers, trial/offer assumptions, lifetime product type, gifting hypotheses, and cancellation-retention offer hypotheses.
- T3: Add StoreKit/sandbox/TestFlight validation cases for every plan, trial, restore, cancellation, retention offer, and gifting path.
- T4: Prototype or implement the paywall UI with dynamic logo support, icon-led benefits, and accurate legal/billing copy.
- T5: Record conversion experiment plan, verification results, App Store validation caveats, and release go/no-go criteria.

Implementation receipt:
- T1 added `docs/product/babyminimo-paywall-visual-spec.md` as the visual source for the BabyMinimo conversion paywall.
- The spec keeps the reference screenshots as pattern inspiration only and defines a BabyMinimo-specific modal hierarchy, dynamic brand mark constraints, benefit icon rules, plan selector states, trial disclosure behavior, truthful savings-badge rules, footer/legal requirements, Remote Config boundaries, accessibility states, and App Store screenshot caveats.
- T2 added `docs/product/babyminimo-pricing-experiment-plan.md` with product ID candidates, annual/monthly/weekly/lifetime/gift pricing assumptions, computed savings-badge rules, PPP-style storefront pricing buckets, above-floor contribution-margin markers, trial assumptions, gifting hypotheses, cancellation-retention offer planning, and Remote Config boundaries.
- T3 added `docs/testing/babyminimo-storekit-paywall-validation-plan.md` with StoreKit, sandbox, and TestFlight validation cases for weekly, monthly, annual, trial eligibility, restore, cancellation, purchase failure, refund/revoke, lifetime, gift purchase/redemption, cancellation-retention offers, storefront localization, and release gates.
- T4 replaced the old Plans cards with a non-production BabyMinimo paywall prototype: dynamic brand mark support, icon-led benefits, annual/monthly/weekly plan rows, annual selected by default, StoreKit-deferred CTA/restore/legal actions, and truthful demo pricing fine print. Simulator evidence is recorded at `docs/testing/screenshots/pbi-064/paywall-prototype.jpg`.
- T5 added `docs/product/babyminimo-paywall-experiment-readout.md` with conversion hypotheses, verification results, App Store validation caveats, release go/no-go criteria, and the explicit stop point before production IAP/App Store Connect work.
- Production StoreKit/App Store Connect products, entitlement sync, promotional offers, retention messaging, and real gift redemption remain gated to PBI-055 and later release tasks.

#### PBI-055: Native subscriptions and Apple IAP

Goal: Implement production-safe BabyMinimo plan purchases using native store billing.

User story: As a household, I want to subscribe to Premium or Family through the App Store so BabyMinimo plan access works safely across devices.

Scope:
- Native store purchase decision and implementation path for iOS digital subscriptions.
- Product IDs, subscription group, pricing tiers, lifetime product, gift products, and plan mapping for Premium and Family.
- Paywall purchase, restore purchases, cancellation/management entry, and entitlement refresh.
- Backend-authoritative entitlement sync through Firebase Functions.
- App Store Server Notifications lifecycle ingestion plan.
- Provider-linking policy so Apple/Google/email auth map to one Firebase UID before purchase or restore.
- TestFlight/sandbox validation plan.

Acceptance criteria:
- iOS digital plan unlocks use App Store In-App Purchase, not Apple Pay or external checkout.
- Restore purchases is visible and functional.
- Local IAP state is treated as optimistic only; backend entitlement state is the source of truth.
- Production Firestore rules prevent client writes to backend-managed billing/entitlement fields.
- App Store Server Notification handling is planned or implemented for renewals, cancellations, refunds, and billing retry.
- Plan screen and gates reflect backend entitlement state.
- Tests cover product loading failure, purchase success, restore success, cancelled purchase, entitlement refresh, and wrong-user cached entitlement prevention.
- Release checklist verifies no Apple Pay path appears for iOS digital subscription unlocks.

Dependencies: PBI-035, PBI-036, PBI-050, PBI-051, PBI-053, PBI-064.

Suggested phase: Phase 11.

Task mapping:
- T1: Define plan product IDs, entitlement model, pricing matrix, and provider-linking policy.
- T2: Implement native IAP/paywall purchase and restore flow.
- T3: Implement backend entitlement sync and Firestore billing rules.
- T4: Add lifecycle notification ingestion plan or endpoint.
- T5: Add tests, sandbox/TestFlight validation, and release evidence.

#### PBI-056: Account deletion and data purge

Goal: Add safe account deletion with reauthentication and data purge behavior.

User story: As a caregiver, I want to permanently delete my BabyMinimo account and understand what happens to household and local data.

Scope:
- Account deletion screen under Account settings.
- Reauthentication requirement based on current auth provider.
- Typed confirmation step before deletion.
- Firebase Auth account deletion.
- Backend callable/Function to purge user-scoped data and remove household membership safely.
- Household ownership/last-admin handling.
- Local device cleanup for auth state, cached profile, local Growth Timeline metadata/photos, widget snapshot data, and analytics identity.
- User-facing copy explaining shared household data, local-only photos, and irreversible effects.

Acceptance criteria:
- Delete account action is not accessible accidentally and requires explicit confirmation.
- Password or provider reauthentication is required when Firebase requires recent login.
- User-scoped profile data is deleted or anonymized according to the data policy.
- Household membership is removed without deleting another caregiver's valid household data unexpectedly.
- Last-owner/last-admin cases are blocked or handled by a documented policy.
- Local Growth Timeline photos and SQLite metadata are deleted from the device when deletion completes.
- Widget snapshots are cleared or blanked after deletion.
- Firebase Auth user is deleted after backend cleanup succeeds or a retry-safe deletion state is recorded.
- Tests cover confirmation, reauth required, successful delete, backend failure, last-admin handling, local cleanup, and sign-out fallback.

Dependencies: PBI-037, PBI-038, PBI-050, PBI-055.

Suggested phase: Phase 11.

Task mapping:
- T1: Define deletion policy for user profile, household membership, babies, events, reminders, local photos, widgets, and analytics.
- T2: Build Account deletion UI with confirmation and reauth states.
- T3: Implement backend purge callable/Function and Firestore rules coverage.
- T4: Implement local cleanup for Growth Timeline files, SQLite metadata, widget snapshots, and auth/session stores.
- T5: Add unit, integration, emulator, and Maestro coverage plus privacy documentation.

#### PBI-057: Data lifecycle and privacy hardening

Goal: Define and implement safe lifecycle behavior for BabyMinimo data.

User story: As a BabyMinimo caregiver, I want clear control over local and shared data so household information is handled responsibly.

Scope:
- Account sign-out data behavior.
- Account deletion data behavior.
- Local Growth Timeline photo and metadata deletion behavior.
- Widget snapshot clearing behavior.
- Analytics retention and opt-out decision.
- Household/member removal behavior.
- Data export/delete request plan.
- Offline/cache behavior and stale-data labeling.
- Privacy copy for local-only photos, reminders, widgets, and shared household data.

Acceptance criteria:
- Sign out clears or preserves only the data explicitly documented for the device.
- Account deletion behavior is consistent with PBI-056 and documented in app privacy copy.
- Local Growth Timeline deletion removes local metadata and local files.
- Widget disable/sign-out clears or blanks widget snapshots.
- Privacy copy explains local-only Growth Timeline photos and widget visibility.
- Household/member removal risks and required backend support are documented.
- No sensitive data is left in logs or test artifacts.
- Manual privacy review checklist is complete before release.

Dependencies: PBI-025, PBI-026, PBI-037, PBI-038, PBI-047, PBI-050, PBI-054, PBI-056.

Suggested phase: Phase 11.

Task mapping:
- T1: Define data contract, authorization assumptions, and emulator-safe behavior.
- T2: Implement service/callable/listener behavior behind a narrow interface.
- T3: Handle empty, error, permission, and retry cases.
- T4: Add unit/emulator tests and verify no production deploy is required.
- T5: Document security, cost, and production rollout risks.

Implementation receipt:
- PBI-057 added `docs/product/babyminimo-data-lifecycle-privacy-plan.md` as the lifecycle policy for sign out, account deletion, local Growth Timeline cleanup, widget snapshots, analytics identity, household/member removal, export/delete requests, stale/offline data, and log/test-artifact hygiene.
- Implemented a local lifecycle cleanup interface in `src/features/privacy/` with separate pure coordination logic and runtime adapters for widget snapshot blanking, local notification cancellation, analytics reset, auth-session reset, and account-deletion-only local care/Growth Timeline/widget settings cleanup.
- Sign-out now runs the local lifecycle cleanup after Firebase Emulator sign-out and logs only retryable cleanup step names in dev if non-blocking cleanup fails.
- Verified with `bun run test:unit` and `bun run test:typecheck`.
- Production account deletion, Firestore security rules, real backend purge, production push token deletion, StoreKit entitlement cleanup, and cloud media/export/report purge jobs remain gated to production PBIs.

### Epic 16: Emulator Performance And Cost Discovery

This phase happens before full production hardening. It uses Firebase Emulator and local scripts to measure read/write behavior, identify obvious data-model cost risks, and implement low-risk optimizations before production Firebase is wired.

#### PBI-058: Firebase Emulator load testing and cost model

Goal: Measure BabyMinimo's Firestore read/write/delete behavior under realistic local workflows.

User story: As the product owner, I want to estimate database cost and scaling pressure before production so we can optimize the data model early.

Scope:
- Local Firebase Emulator load script for households, babies, users, care events, and common latest-event reads.
- Operation count reporting for reads, writes, deletes, and query timing.
- Cost-estimation output with configurable rates and a warning to confirm current Firebase location pricing before production budgeting.
- Explicit exclusion note that the model does not include storage, indexes, egress, Auth, Functions, push notifications, logs, backups, or store fees.
- Compare current query patterns against optimized query patterns.
- Document expected read/write behavior for core flows.

Acceptance criteria:
- A local command can seed emulator data, run read passes, optionally clean up, and print JSON results.
- Care-event reads use baby-scoped ordered/limited queries instead of reading the full collection and filtering client-side.
- Required Firestore indexes are declared for optimized emulator/prod parity.
- Results identify the dominant read/write paths and obvious optimization candidates.
- Results clearly state that the estimate excludes storage, indexes, egress, Auth, Functions, push notifications, logs, backups, and store fees.
- The command is safe for emulator use and does not require production Firebase credentials.

Dependencies: PBI-002, PBI-014, PBI-017 through PBI-024, PBI-031, PBI-050.

Suggested phase: Phase 9.5.

Task mapping:
- T1: Audit current Firestore read/write paths.
- T2: Add emulator load/cost script and package command.
- T3: Optimize obvious high-read queries using scoped filters, ordering, limits, and indexes.
- T4: Run baseline load test and record results.
- T5: Document cost signals and next optimization tasks.

#### PBI-059: Lazy loading and app performance pass

Goal: Reduce startup and navigation cost before production readiness.

User story: As a tired caregiver, I want BabyMinimo to open quickly and move between screens smoothly.

Scope:
- Audit route and component loading.
- Identify heavy screens, media assets, and form flows that should be lazily loaded.
- Keep auth bootstrap and Home fast.
- Delay non-critical analytics, visual showcase, settings subflows, and production-only flows until needed.
- Add performance smoke notes for simulator testing.

Acceptance criteria:
- Heavy or rarely used routes are lazy-loaded where Expo Router and React Native support it safely.
- Home/auth startup path avoids unnecessary data reads and heavy media imports.
- Large approved reference assets are not loaded on unrelated screens.
- Performance notes list measured startup/navigation observations and remaining risks.
- Typecheck and simulator smoke tests pass.

Dependencies: PBI-014 through PBI-038, PBI-052, PBI-058.

Suggested phase: Phase 9.5.

Task mapping:
- T1: Define data contract, authorization assumptions, and emulator-safe behavior.
- T2: Implement service/callable/listener behavior behind a narrow interface.
- T3: Handle empty, error, permission, and retry cases.
- T4: Add unit/emulator tests and verify no production deploy is required.
- T5: Document security, cost, and production rollout risks.

#### PBI-060: Canceled subscription heavy-data purge policy

Goal: Define and implement purge policy for future heavy cloud data after a subscription has been canceled long enough.

User story: As the product owner, I want BabyMinimo to avoid storing expensive heavy files forever after a household stops paying, while preserving essential safe records and respecting user privacy.

Scope:
- Heavy-data classification for future cloud media, export archives, generated reports, and other large artifacts.
- Default 90-day retention window after subscription cancellation or expiration.
- Explicit exclusion for local-only Growth Timeline photos in v1 because they are not stored in the cloud.
- Purge candidate selector and tests.
- Future backend purge job/callable plan.
- User-facing policy copy for Premium/Family data retention.

Acceptance criteria:
- Heavy-data purge policy module exists with tests.
- Active/trialing subscriptions are never selected for purge.
- Canceled/expired subscriptions are selected only after the configured retention window.
- Local-only Growth Timeline photos are excluded from cloud purge candidates.
- The policy states that BabyMinimo v1 does not plan to store Growth Timeline photos in Firestore or cloud storage.
- Future production purge job requirements are documented before any destructive backend implementation.

Dependencies: PBI-055, PBI-056, PBI-057.

Suggested phase: Phase 9.5.

Task mapping:
- T1: Define data contract, authorization assumptions, and emulator-safe behavior.
- T2: Implement service/callable/listener behavior behind a narrow interface.
- T3: Handle empty, error, permission, and retry cases.
- T4: Add unit/emulator tests and verify no production deploy is required.
- T5: Document security, cost, and production rollout risks.

## 6. Codex Command Pack

### Global Codex Context

Paste once before starting implementation tasks:

```text
You are implementing BabyMinimo, a shared newborn handoff app.

Core product hierarchy:
1. shared handoff
2. care logging
3. reminders
4. Growth Timeline
5. widgets and glanceable surfaces

Important product rules:
- BabyMinimo must feel like a shared newborn handoff app first.
- Growth Timeline is secondary and stays inside Timeline.
- Family is a household coordination plan, not just extra caregiver seats.
- Home focuses on what happened last and quick actions.
- Handoff is the premium dark-mode screen.
- Widgets extend the handoff promise with read-only current state and due-soon context.
- Growth Timeline photos are local-only in v1.

Architecture rules:
- React Native + Expo Router.
- Firebase Auth for identity.
- Firestore for shared household data.
- Firebase callable functions for writes.
- Firestore listeners for reads.
- expo-file-system + expo-sqlite for Growth Timeline.
- Native widget extension support only when the widget PBIs are in scope; start with read-only iOS widgets.
- Use reusable components and BabyMinimo theme tokens.

Assets:
- Approved screenshots in `docs/product/superdesign-reference-assets/screenshots1/` and approved logo assets are the design source of truth.
- Use fetched Superdesign HTML only for structure/content when it does not conflict with approved screenshots.
- Preserve the existing BabyMinimo visual direction.
- Do not invent a different product hierarchy or visual identity.

Implementation rules:
- Work in vertical slices.
- Return files in final folder order.
- Prefer reusable components over duplicated screen code.
- Do not add extra tabs or unrelated features.
- Use GoalBuddy for broad phases and OpenCode only for bounded Worker tasks.
```

### Command 1: Foundation

```text
Use GoalBuddy task context from docs/product/babyminimo-pbi-codex-goalbuddy-pack.md.

Implement the BabyMinimo project foundation.

PBIs:
- PBI-001
- PBI-002
- PBI-003
- PBI-004
- PBI-015 shell only

Requirements:
- Create or update the Expo Router structure for auth, onboarding, tabs, and modals.
- Add theme token files for colors, spacing, radius, typography, and shadows.
- Add shared UI primitives: Screen, Card, Button, Input, Chip.
- Add Zustand stores: authStore, filtersStore, featureFlagStore.
- Add Firebase client initialization with environment variables.
- Add expo-sqlite setup and migration for growth_timeline_entries.
- Keep the code TypeScript-first and aligned with the BabyMinimo architecture.
- Preserve the BabyMinimo Superdesign visual direction.

Verification:
- bun test
- TypeScript or Expo route compile check available in this repo.

Return all created or updated files in final folder order.
```

### Command 2: Auth and Onboarding

```text
Implement BabyMinimo authentication and onboarding.

PBIs:
- PBI-005
- PBI-006
- PBI-007
- PBI-008
- PBI-009
- PBI-010
- PBI-011
- PBI-012
- PBI-013

Requirements:
- Build login and signup screens using Firebase email/password auth.
- Add auth bootstrap using onAuthStateChanged.
- Add onboarding screens: welcome, problem, benefits, add-baby, priorities, invite-caregiver, preview.
- In add-baby, call createHouseholdCallable and createBabyCallable.
- Save currentHouseholdId, onboardingCompleted, and selectedBabyId in Zustand after onboarding.
- Keep the visual design aligned to the BabyMinimo mockup and logo.

Verification:
- bun test
- app route smoke check for auth and onboarding routes.

Return all created or updated files in final folder order.
```

### Command 3: Home Screen

```text
Implement the BabyMinimo Home screen.

PBIs:
- PBI-014

Requirements:
- Build a calm command-center screen.
- Include HomeHeader, SnapshotCard, QuickActionBar, and a small Growth Timeline preview.
- Keep Home focused on what happened last.
- Growth Timeline must remain secondary.
- Use BabyMinimo reusable components and theme tokens.
- Preserve the visual direction from the existing BabyMinimo mockup/logo.

Verification:
- bun test
- UI smoke check for Home.

Return all created or updated files in final folder order.
```

### Command 4: Quick Log and Core Log Modals

```text
Implement BabyMinimo quick log and core care logging modals.

PBIs:
- PBI-016
- PBI-017
- PBI-018
- PBI-019
- PBI-020
- PBI-021

Requirements:
- Add quick-log chooser modal.
- Add breastfeed, bottle, diaper, sleep, and medication log modals.
- Use reusable form pieces where possible.
- Use Firebase callable functions for saving care events.
- Medication flow may also create a reminder when appropriate.
- Keep all flows minimal, thumb-friendly, and calm.

Verification:
- bun test
- smoke each modal route and save handler boundary.

Return all created or updated files in final folder order.
```

### Command 5: Timeline

```text
Implement the BabyMinimo Timeline screen.

PBIs:
- PBI-022
- PBI-023
- PBI-024 initial care-event side

Requirements:
- Add Timeline screen with title, Add Moment CTA, filter chips for All, Care, Growth, Notes.
- Add reusable components: TimelineFilters, TimelineList, CareEventCard, GrowthMomentCard.
- Add Firestore listener hook for shared events.
- Prepare the timeline adapter so Growth Timeline can be merged later.
- Keep the design consistent with the BabyMinimo mockup and visual system.

Verification:
- bun test
- unit tests for timeline adapter if practical.

Return all created or updated files in final folder order.
```

### Command 6: Growth Timeline and Add Moment

```text
Implement BabyMinimo Growth Timeline v1.

PBIs:
- PBI-025
- PBI-026
- PBI-027
- PBI-028
- PBI-024 completion

Requirements:
- Add local Growth Timeline storage using expo-file-system, expo-image-picker, expo-image-manipulator, and expo-sqlite.
- Add Add Moment modal with choose photo, caption, moment type, and save flow.
- Add useGrowthTimeline hook.
- Merge Growth Timeline moments into the Timeline adapter.
- Keep Growth Timeline inside Timeline, not a separate tab.
- Add a settings note that Growth Timeline photos are stored locally on this device in v1.

Verification:
- bun test
- unit tests for Growth Timeline metadata service where practical.
- route smoke check for Add Moment modal.

Return all created or updated files in final folder order.
```

### Command 7: Handoff

```text
Implement the BabyMinimo Handoff screen.

PBIs:
- PBI-029 if backend is in scope
- PBI-030

Requirements:
- Build the premium dark-mode Handoff screen.
- Add HandoffHeroCard, due-soon section, and latest-note section.
- Use useHandoffSummary to load summary data from the backend.
- Keep readability very high for overnight use.
- Preserve BabyMinimo's dark-mode visual direction.

Verification:
- bun test
- UI smoke check for empty, loading, and populated handoff states.

Return all created or updated files in final folder order.
```

### Command 8: Reminders

```text
Implement the BabyMinimo Reminders screen.

PBIs:
- PBI-031
- PBI-032

Requirements:
- Build reminders create flow and reminders list screen.
- Use callCreateReminder for writes and Firestore reminder listeners for reads.
- Keep the screen simple, calm, and not productivity-app-heavy.

Verification:
- bun test
- smoke create-flow validation and list rendering.

Return all created or updated files in final folder order.
```

### Command 9: Caregivers

```text
Implement the BabyMinimo Caregivers screen.

PBIs:
- PBI-033

Requirements:
- Build a screen for viewing household caregivers and inviting a new caregiver.
- Use callInviteMember for the invite flow.
- Reinforce shared support and coordination in the copy and structure.
- Keep it visually aligned with BabyMinimo's warm-neutral design system.

Verification:
- bun test
- smoke invite form validation.

Return all created or updated files in final folder order.
```

### Command 10: Settings, Plans, Account, and Sign Out

```text
Implement BabyMinimo Settings, Plan, Account, and Sign out flows.

PBIs:
- PBI-034
- PBI-035
- PBI-036
- PBI-037
- PBI-038

Requirements:
- Build Settings screen with rows linking to Plan, Caregivers, Reminders, Growth Timeline, and Account.
- Build Plan screen with Free, Premium, and Family cards.
- Premium should feel recommended for smaller households.
- Family should feel like a household coordination plan.
- Build Account screen and sign out confirmation flow.
- Sign out should return the user to the auth flow.

Verification:
- bun test
- navigation smoke for each settings route.

Return all created or updated files in final folder order.
```

### Command 11: Empty, Loading, and Error States

```text
Add BabyMinimo empty, loading, and error states.

PBIs:
- PBI-039
- PBI-040
- PBI-041

Requirements:
- Add empty states for Home, Timeline, Handoff, and Reminders.
- Add loading placeholders or loading states for key screens.
- Add calm, retry-friendly error states for failed loads and failed saves.
- Keep the app feeling supportive and low-stress.

Verification:
- bun test
- visual smoke check for empty, loading, and error variants.

Return all created or updated files in final folder order.
```

### Command 12: App Store Screenshot Support

```text
Prepare BabyMinimo UI screens to support App Store screenshot generation.

PBIs:
- PBI-043

Requirements:
- Ensure Home, Timeline, Handoff, Growth Timeline, and Plans screens are visually consistent and screenshot-ready.
- Add any small display-only polish needed for mock data states.
- Keep the UI aligned with the BabyMinimo mockup and logo assets already provided from Superdesign.
- Do not redesign the product.

Verification:
- bun test
- screenshot smoke pass for target screens where tooling exists.

Return all created or updated files in final folder order.
```

### Command 13: Landing Hero Visual Support

```text
Prepare BabyMinimo product visuals for landing page hero use.

PBIs:
- PBI-044

Requirements:
- Make sure the Home screen and one supporting Growth Timeline preview state are visually clean enough to be used in the landing page hero.
- Preserve brand consistency with the BabyMinimo logo and mockup direction from Superdesign.
- Do not redesign the product; only polish for presentation.

Verification:
- bun test
- visual smoke check for Home and Growth Timeline preview.

Return all created or updated files in final folder order.
```

### Command 14: Refactor Pass

```text
Refactor the BabyMinimo codebase for consistency.

Requirements:
- Remove duplicated layout and styling code where practical.
- Ensure reusable components are used consistently.
- Align spacing and typography with BabyMinimo theme tokens.
- Preserve the existing architecture and product hierarchy.
- Keep Firebase shared-data logic and local-only Growth Timeline logic intact.

Verification:
- bun test
- route smoke check for core screens.

Return all created or updated files in final folder order.
```

### Command 15: Analytics Pass

```text
Add a lightweight analytics layer to BabyMinimo.

PBIs:
- PBI-042

Requirements:
- Add analytics helper service.
- Track key events: signup completed, onboarding completed, baby created, first event logged, handoff viewed, reminder created, add moment used, plan screen viewed, sign out confirmed.
- Keep analytics implementation simple and expandable.

Verification:
- bun test
- unit or smoke checks proving event names are stable and calls are guarded.

Return all created or updated files in final folder order.
```

### Command 16: Widgets

```text
Implement BabyMinimo widget planning and the first read-only iOS widget slice.

PBIs:
- PBI-045
- PBI-046
- PBI-047
- PBI-048 planning only if Android parity is in scope

Requirements:
- Add a typed widget snapshot contract for selected baby, current status, last feed, last diaper, sleep state, due soon item, and last updated time.
- Add a local widget snapshot writer that can publish Firebase Emulator-backed app state into widget-accessible storage.
- Build read-only iOS small and medium widget layouts for current-state handoff.
- Add signed-out, no-selected-baby, empty, and stale widget states.
- Add a Settings > Widgets entry with local enable/disable and clear-snapshot behavior.
- Do not include Growth Timeline photos, notes, or free-text caregiver content in widgets in v1.
- Do not add logging, purchases, auth, or account actions from widgets in v1.
- Preserve BabyMinimo's approved visual direction and calm glanceable hierarchy.

Verification:
- bun test
- iOS simulator/dev-build widget smoke check where tooling is available.
- Widget screenshot evidence for small, medium, empty, and stale states.
- Manual privacy review confirming only approved fields appear in widget payloads.

Return all created or updated files in final folder order.
```

### Command 17: Production Readiness

```text
Prepare BabyMinimo for production readiness.

PBIs:
- PBI-049
- PBI-050
- PBI-051
- PBI-052
- PBI-053
- PBI-054
- PBI-055
- PBI-056
- PBI-057

Requirements:
- Implement or plan the notification system, including permissions, local scheduling, push infrastructure decision, quiet hours, notification preferences, cancellation, and deep links.
- Harden production Firebase configuration and Firestore/Auth security, with emulator-backed security rules tests.
- Audit every visible control and make each one functional, intentionally disabled, hidden, or explicitly deferred.
- Expand E2E and strict visual QA so release-scope screens compare 1:1 against `docs/product/superdesign-reference-assets/screenshots1/`, including scrollable screen coverage.
- Prepare release readiness for TestFlight/App Store: bundle id, signing path, icon/splash/versioning, permission strings, privacy labels, screenshots, and release checklist.
- Implement the first production-eligible iOS widget release slice after the widget data contract is approved.
- Implement native store subscription readiness for Premium and Family plans; iOS digital unlocks must use App Store In-App Purchase, not Apple Pay or external checkout.
- Implement account deletion readiness with reauth, backend purge, household membership policy, local Growth Timeline file cleanup, widget snapshot cleanup, and privacy copy.
- Harden data lifecycle and privacy behavior for sign out, account deletion, Growth Timeline local files, widget snapshots, analytics retention, household/member removal, and stale/offline states.
- Keep Firebase Emulator as the default local test surface until production Firebase wiring is explicitly approved.
- Do not deploy production Firebase rules, upload TestFlight builds, or run release automation without explicit approval.

Verification:
- bun run test:all
- Firebase Emulator security rules tests
- Maestro E2E smoke tests
- strict visual baseline comparison and scroll coverage check
- iOS dev/release build smoke check
- notification scheduling/cancellation smoke check
- native IAP sandbox/TestFlight validation plan or smoke evidence where credentials are available
- account deletion emulator tests and local cleanup checks
- widget simulator/dev-build smoke check where tooling is available
- manual privacy and release checklist review

Return all created or updated files in final folder order.
```

### Command 18: Emulator Performance And Cost Discovery

```text
Implement BabyMinimo Firebase Emulator performance and cost discovery before production hardening.

PBIs:
- PBI-058
- PBI-059
- PBI-060

Requirements:
- Audit current Firebase Emulator read/write paths for auth, onboarding, care events, Timeline, reminders, plans, widgets, and account flows.
- Add a local Firebase Emulator load script that seeds households, babies, users, and care events, runs latest-event reads, reports read/write/delete counts, and estimates operation-only cost with configurable rates.
- Include the budgeting caveat that operation estimates exclude storage, indexes, egress, Auth, Functions, push notifications, logs, backups, and store fees.
- Optimize obvious high-read queries using scoped filters, ordering, limits, and required Firestore indexes.
- Add lazy-loading or deferred-loading recommendations and low-risk implementation where supported by Expo Router/React Native.
- Add a canceled-subscription heavy-data purge policy for future cloud media/export/report artifacts after a default 90-day retention window.
- Keep Growth Timeline photos local-only in v1 and explicitly exclude them from cloud purge candidates.
- Do not connect to production Firebase or run destructive backend purge jobs in this phase.

Verification:
- bun run test:unit
- bun run test:typecheck
- bun run test:firebase:load
- Firebase Emulator UI remains available at http://127.0.0.1:4000/

Return all created or updated files in final folder order.
```

## 7. Recommended Execution Order

Use the Codex commands in this order:
1. Global Codex Context
2. Foundation
3. Auth and Onboarding
4. Home Screen
5. Quick Log and Core Log Modals
6. Timeline
7. Growth Timeline and Add Moment
8. Handoff
9. Reminders
10. Caregivers
11. Settings, Plans, Account, and Sign Out
12. Empty, Loading, and Error States
13. App Store Screenshot Support
14. Landing Hero Visual Support
15. Refactor Pass
16. Analytics Pass
17. Widgets
18. Emulator Performance And Cost Discovery
19. Production Readiness

## 8. Fast Demo Order

For a usable demo quickly, do only this first:
1. Foundation
2. Auth and Onboarding
3. Home
4. Quick Log plus breastfeed and diaper
5. Timeline
6. Handoff
7. Growth Timeline and Add Moment

This is enough for a strong first demo because it proves the handoff promise, the care logging loop, and the local photo timeline.

Add Widgets after the fast demo is stable. Widgets require native extension work and should not block the first runnable app demo.

## 9. Codex Design Review Checklist

Before accepting any UI slice, Codex must confirm:
- The screen matches the warm BabyMinimo Superdesign direction.
- The hierarchy still says shared handoff first.
- The screen is usable one-handed.
- Primary actions are obvious and calm.
- Text is readable on small mobile screens.
- Growth Timeline did not become a separate tab or dominant product pillar.
- Handoff remains glanceable in under 5 seconds.
- Empty, loading, and error states are low-stress.
- The implementation uses reusable components and theme tokens.

## 10. One-Sentence Execution Rule

Use the PBIs to manage scope and priorities, use GoalBuddy to coordinate broad mobile app work, and use the Codex commands one vertical slice at a time so BabyMinimo becomes runnable early instead of becoming a giant half-finished repo.
