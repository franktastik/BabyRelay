# BabyMinimo Agent Rules

These rules apply to all coding agents working in this repo. `AGENTS.md` contains the fuller operating guide; this file is the fast pre-task checklist and enforcement contract.

## 1. Required Pre-Task Startup

Before starting any PBI implementation task, verify the local coordination and runtime surfaces are available. Start anything missing unless the task is docs-only and does not need runtime proof.

Required local surfaces:
- GoalBuddy board: `http://127.0.0.1:41737/`
- Browser-hosted iOS simulator: `http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0`
- Firebase Emulator UI: `http://127.0.0.1:4000/`
- Firebase Auth UI: `http://127.0.0.1:4000/auth`
- Firebase Storage UI: `http://127.0.0.1:4000/storage`
- Firebase Functions emulator: `http://127.0.0.1:5001/`

Node runtime policy:
- App/tooling work must use the repo-pinned Node 24 LTS line from `.nvmrc` / `.node-version`; do not standardize new work on host Node 25+ current releases.
- Firebase Functions work must use the `functions/` Node 22 runtime pin unless Firebase production runtime support is explicitly updated in a future PBI.
- If `node --version` does not match the relevant pin, record it in the task receipt and switch runtimes before production Firebase verification.

Default startup commands:
- GoalBuddy board: `node /Users/frank/.codex/skills/goalbuddy/extend/local-goal-board/scripts/local-goal-board.mjs --goal docs/goals/babyminimo-emulator-hardening`
- iOS browser simulator: `npx serve-sim --port 3200 --detach B2C19543-60E2-489E-8E08-4E3F775AD6A0`
- Firebase Emulator: `bun run emulators`

Runtime checks:
- Use `curl -I http://127.0.0.1:41737/` for GoalBuddy.
- Use `curl -I "http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0"` for serve-sim.
- Use `curl -I http://127.0.0.1:4000/`, `curl -I http://127.0.0.1:4000/auth`, or `curl -I http://127.0.0.1:4000/storage` for Firebase Emulator UI.
- For Firebase Functions work, confirm `bun run emulators` starts Functions on `127.0.0.1:5001` and record whether the task touches callable functions or Firestore triggers.

Firebase exception:
- Firebase Emulator is required for local demo, auth, Firestore, Storage readiness, Functions-trigger readiness, reminder, and cost/performance tasks.
- Firebase Emulator may be skipped only when the active PBI explicitly wires production Firebase or the task is purely documentation/design planning.
- Do not deploy emulator Firestore or Storage rules, or emulator-only config, to production.

## 2. PBI And GoalBuddy Workflow

Use GoalBuddy for broad, multi-step, risky, or cross-screen work.

Before implementation:
- Read the relevant PBI in `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md`.
- Confirm the matching GoalBuddy card exists in `docs/goals/babyminimo-emulator-hardening/state.yaml`.
- Move or mark only one task as active at a time.
- Identify allowed files, forbidden systems, verification commands, and expected receipt before editing.

During implementation:
- Keep the PBI scope tight. Do not add unrelated refactors.
- For UI work, name the approved screenshot in `docs/product/superdesign-reference-assets/screenshots1/`.
- For visual work, use the browser simulator and capture evidence before accepting the task.
- For backend-like work, keep Firebase Emulator local unless the PBI explicitly says production Firebase.

After implementation:
- Update the GoalBuddy card with a receipt: files changed, verification run, result, screenshots if relevant, and remaining caveats.
- Update the PBI doc when scope, acceptance criteria, sequencing, or implementation reality changes.
- Update `CHANGELOG.md` under `Unreleased` for user-visible, operational, testing, release, or workflow changes.
- If a PBI is completed, mark its GoalBuddy card done and ensure the PBI pack still reflects the current truth.

## 3. Agent Delegation Rules

Codex remains the planner, PM, reviewer, and final verifier.

Use OpenCode/Qwen/GLM only for bounded implementation tasks when:
- The GoalBuddy card defines allowed paths.
- Forbidden areas are explicit.
- Verification commands are listed.
- The task is not security, auth, billing, migration, production deployment, recovery, or broad shared-invariant work.

Preferred implementation model order:
1. `opencode-go/qwen3.7-max` for bounded text-only/code implementation after a passing current-session smoke test
2. `opencode-go/glm-5.1`
3. `opencode-go/qwen3.6-plus`
4. `opencode-go/deepseek-v4-flash`
5. `opencode-go/deepseek-v4-pro`
6. `opencode-go/kimi-k2.6` only after a passing current-session smoke test

Qwen3.7 Max is text-only. It may write code, tests, and docs, but it must not be used for screenshot interpretation, visual judging, or final UI acceptance. Codex owns simulator/browser visual QA and the final accept/tighten/reject decision.

Critical paths stay under Codex supervision:
- authentication, authorization, session management
- Firestore security rules and production Firebase configuration
- billing, IAP, subscriptions, account deletion, data purge
- migrations, recovery paths, release automation, CI gates
- native entitlement, bundle ID, signing, and App Store submission work

## 4. Visual QA Rules

Approved visual source of truth:
- `docs/product/superdesign-reference-assets/screenshots1/`

Rules:
- Do not invent assets, logo variants, icon styles, typography, spacing, or layout when the approved screenshot defines them.
- If an asset is missing, record the missing asset instead of substituting a guessed one.
- Scrollable screens require top/middle/bottom coverage when those positions are part of the approved reference.
- Visual acceptance is strict: approved baselines are expected to match 1:1 unless the product owner replaces the baseline.
- Do not accept UI work using only typecheck or unit tests.

## 5. Verification Defaults

Use the smallest verification set that proves the PBI, but default to:
- `bun run test:typecheck`
- `bun run test:unit`
- `npx expo-doctor`
- simulator smoke through `serve-sim`
- Maestro flow when the PBI touches navigation, forms, or release QA

For Firebase Emulator work:
- Run the relevant emulator-backed script or manual flow.
- Record Firestore/Auth/Storage/Functions emulator assumptions and any cost/read-write implications.

For release, subscriptions, widgets, notifications, or production Firebase:
- Add explicit sandbox/TestFlight/native verification steps to the GoalBuddy receipt.

## 6. Documentation And Naming Rules

Current product name:
- User-facing brand: `BabyMinimo`
- App Store marketing name: `BabyMinimo: Baby Tracker`
- Installed app display name: `BabyMinimo`

Active docs should use BabyMinimo. Historical changelog entries may preserve BabyRelay as history, but new implementation docs, PBIs, screenshots, and GoalBuddy cards should use BabyMinimo.

Keep these files aligned:
- `rules.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md`
- `docs/goals/babyminimo-emulator-hardening/state.yaml`
- `docs/product/babyminimo-visual-qa-contract.md`
