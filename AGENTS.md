## Mandatory Rules

Before starting any task, read and follow `rules.md`. It is the fast operational checklist for starting GoalBuddy, serve-sim, Firebase Emulator, PBI/GoalBuddy receipts, changelog updates, agent delegation, and visual QA.

## GoalBuddy Mobile App Build Workflow

Use GoalBuddy as the project-management layer for building the mobile app whenever the work is broad, multi-step, ambiguous, or spans multiple app areas.

Use `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md` as the source of truth for BabyMinimo PBIs, Codex implementation commands, GoalBuddy board prep, code architecture, and design direction.
Use `docs/product/babyminimo-visual-qa-contract.md` as the source of truth for BabyMinimo visual acceptance gates.

Default mobile app workflow:
- Start with `$goal-prep` for app-level work, major features, cross-screen flows, architecture decisions, release readiness, or recovery from a stalled build.
- Use the local live GoalBuddy board in Codex by default unless the user requests GitHub Projects or no visual board.
- After prep, execute with `/goal Follow docs/goals/<slug>/goal.md.`.
- Keep one active task at a time, with receipts and verification recorded in the board.
- Use Scout/Judge/Worker-style task separation for discovery, plan validation, implementation, review, and proof.
- Codex remains the PM, planner, reviewer, and final verifier.
- OpenCode implementation models may handle bounded Worker tasks only after the GoalBuddy board defines allowed files, forbidden paths, requirements, and verification.

Use GoalBuddy for:
- end-to-end mobile app build phases
- onboarding, navigation, and multi-screen user flows
- design system and UI implementation passes
- native widget planning and implementation slices
- data model or sync planning before implementation
- release readiness, QA passes, and regression cleanup
- stalled, vague, risky, or multi-hour work

Do not create a GoalBuddy board for a narrow one-change task. Handle small edits directly, still following the Codex + OpenCode delegation rules when useful.

GoalBuddy handoffs must preserve:
- intended app outcome
- target users and success proof
- non-goals and forbidden systems
- allowed files or areas for each Worker task
- verification commands and demo expectations
- changelog expectations
- unresolved decisions or owner inputs

## BabyMinimo Visual Source Of Truth

Approved mockup screenshots live in:

```text
docs/product/superdesign-reference-assets/screenshots1/
```

These screenshots are the visual source of truth for BabyMinimo UI work. Use fetched Superdesign HTML only for structure/content when it does not conflict with `screenshots1/`.

Screen-specific contracts live in:

```text
docs/product/screen-contracts/
```

For UI implementation tasks:
- Name the approved screenshot file being matched.
- Name the screen contract when one exists.
- Use the approved logo/brand assets; do not recreate them with text or glyphs.
- Do not approximate logo, avatar composition, icon style, spacing rhythm, card dimensions, typography scale, button/input dimensions, bottom nav placement, or scroll behavior.
- If exact matching is blocked by a missing asset, stop and list the missing asset instead of inventing a substitute.
- Capture a simulator screenshot after implementation and compare it to the approved screenshot before accepting the task.
- For scrollable screens, capture top/middle/bottom positions as needed.

Codex review must decide `accept`, `tighten`, or `reject` based on screenshot evidence. Do not accept a UI task based only on a claim that it matches the mockup.

Visual comparison is strict: baselined screenshots must match the approved `screenshots1/` file 1:1 with zero differing pixels. Do not accept minor differences, even one-pixel layout shifts, unless the product owner replaces the approved baseline. For scrollable screens, compare every approved captured position exactly; missing middle/bottom captures are coverage gaps that must be listed rather than guessed.

## BabyMinimo Widgets

Treat widgets as an extension of the shared handoff promise, not a new product pillar.

Widget rules:
- Start with read-only glanceable state: selected baby, current status, last feed, last diaper, sleep state, due soon item, and last updated time.
- Do not include Growth Timeline photos, caregiver notes, free-text notes, account data, billing data, or invite details in widgets in v1.
- Do not add logging, purchase, auth, or account actions from widgets in v1.
- Implement iOS Home Screen widgets first; Android parity requires its own planned slice.
- Widget work needs a GoalBuddy task with native allowed paths, privacy acceptance criteria, and simulator/dev-build verification.
- Codex owns widget privacy review and final visual QA before accepting any widget implementation.

## Codex + OpenCode Bridge

Use this workflow by default for bounded low- and medium-risk implementation tasks in this project.

Operating model:
- Codex 5.5 high or xhigh plans the task.
- OpenCode implements a bounded code-only handoff with an approved implementation model.
- Codex reviews the diff, tests, changelog, and visual QA evidence before accepting the work.
- Codex owns screenshot understanding and final visual QA. Do not rely on OpenCode models for image vision unless a real multimodal OpenCode model is explicitly available and smoke-tested.

Preferred implementation model order:
1. `opencode-go/glm-5.1` if the smoke test passes.
2. `opencode-go/qwen3.6-plus` as the safe fallback.
3. `opencode-go/deepseek-v4-flash`.
4. `opencode-go/deepseek-v4-pro`.
5. `opencode-go/kimi-k2.6` only if its JSON Schema smoke gate passes in the current session.

Current local smoke status:
- 2026-05-23: `opencode-go/glm-5.1` returned `GLM_OK` and is the preferred bounded code implementation model.
- 2026-05-23: `opencode-go/qwen3.6-plus` returned `QWEN_OK` and is the safe fallback implementation model.
- 2026-05-23: `opencode-go/kimi-k2.6` failed with the known JSON Schema provider error.
- 2026-05-22: `opencode-go/kimi-k2.6` failed with the known JSON Schema provider error.
- 2026-05-22: `opencode-go/qwen3.6-plus` returned `QWEN_OK`.

Before delegating implementation work, run the smoke gate for the intended model:

```sh
opencode run --model opencode-go/glm-5.1 --format json "Reply with exactly: GLM_OK"
opencode run --model opencode-go/qwen3.6-plus --format json "Reply with exactly: QWEN_OK"
opencode run --model opencode-go/kimi-k2.6 --format json "Reply with exactly: KIMI_OK"
```

Expected passing results:

```text
GLM_OK
QWEN_OK
KIMI_OK
```

If Kimi fails with `JSON Schema not supported: could not understand the instance {'default': 'latest'}`, do not use Kimi for implementation in that session. If GLM-5.1 fails, use Qwen 3.6 Plus. If Qwen fails, use the first fallback model that passes a smoke test:

```sh
opencode run --model opencode-go/deepseek-v4-flash --format json "Reply with exactly: OK"
```

### Handoff Requirements

Codex handoffs to OpenCode must be compact and explicit. Include:
- goal
- current context
- allowed files
- forbidden files and systems
- exact behavior requirements
- changelog expectations
- verification commands
- expected return format

Use this template:

```text
Implement this bounded task.

Goal:
<one paragraph>

Context:
<short project-specific context>

Allowed files:
- <path>
- <path>

Forbidden:
- auth, authorization, session management
- database schema, migrations, recovery paths
- CI, deployment, build pipelines
- billing, secrets, security-sensitive flows
- unrelated refactors
- files outside the allowed list

Requirements:
- <requirement>
- <requirement>
- <requirement>

Design:
- Approved screenshot: docs/product/superdesign-reference-assets/screenshots1/<file>.png
- Screen contract: docs/product/screen-contracts/<screen>.md, if present
- Match the approved screenshot. Do not reinterpret spacing, typography, hierarchy, icon style, visual density, logo, or asset composition.
- Capture a simulator screenshot after implementation and list known visual differences.

Changelog:
- Add or update CHANGELOG.md under Unreleased.
- Mention only user-visible or operationally meaningful changes.
- Use Internal for developer workflow changes.

Verification:
- <command>
- <command>

Return only:
- files changed
- implementation summary
- changelog entry added
- verification run and result
- approved screenshot used, simulator screenshot path, and known visual differences for UI work
- unresolved risks or caveats
```

### Review Checklist

After OpenCode finishes, Codex must inspect:
- `git diff`
- changed files
- verification output
- changelog entry
- OpenCode summary and caveats

Codex review must confirm:
- OpenCode edited only allowed files.
- The implementation satisfies the written requirements.
- There are no unrelated refactors.
- Tests were added or updated when behavior changed.
- Verification ran successfully.
- The changelog entry matches the diff and is not inflated.
- There are no security, data-loss, migration, or permission-boundary risks.
- The code follows local project patterns.

Codex may then accept the implementation, make small finishing edits, send a narrow follow-up handoff, or reject and replan if the implementation is structurally wrong.

### Risk Boundaries

Do not delegate critical paths to OpenCode without close Codex supervision:
- authentication, authorization, or session management
- permission boundaries
- database migrations or schema authority
- state repair or recovery paths
- billing or payment flows
- secrets handling
- production deployment
- CI gates or release automation
- broad changes spanning multiple modules with shared invariants

Good OpenCode tasks:
- single-file utilities
- focused UI component edits
- straightforward tests
- mechanical refactors with a clear pattern
- docs updates
- narrow bug fixes with reproduction steps
- first-pass implementation from a strict plan

## BabyMinimo Firebase Emulator

Use Firebase Emulator for local BabyMinimo backend work until production Firebase wiring is explicitly requested.

Default local project:
- `babyminimo-demo`

Run local emulators:
- `bun run emulators`

Local emulator endpoints:
- Auth: `127.0.0.1:9099`
- Firestore: `127.0.0.1:8080`
- Emulator UI: `http://127.0.0.1:4000/`
- Auth UI shortcut: `http://127.0.0.1:4000/auth`

## BabyMinimo Simulator Visual QA

Use the browser-hosted iOS simulator as the default visual QA surface:

- `http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0`

Rules:
- Check this simulator browser view after screen changes.
- Capture simulator screenshots for receipts under `docs/product/implementation-screenshots/`.
- Compare simulator output to approved references in `docs/product/superdesign-reference-assets/screenshots1/`.
- Run `bun run test:e2e:visual` for the Maestro visual flow plus zero-diff baseline comparison.
- Run `bun run test:visual:compare:coverage` before release visual acceptance to fail missing scroll-position baselines.
- Do not accept UI work based only on TypeScript/tests.

Rules:
- Keep `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` for demo/dev work.
- Do not deploy the open emulator Firestore rules to production.
- Do not delegate auth/session/emulator auth adapter changes to OpenCode or OSS agents.
- Growth Timeline photos remain local-only in v1 and must not be moved to Firebase Storage without an explicit product decision.

### Token Budget Rules

To keep Codex token usage low:
- Keep Codex plans short and explicit.
- Do not paste OpenCode's full JSON event stream back into Codex.
- Return only summaries, file lists, diffs, and test results.
- Let Codex inspect files directly instead of narrating file contents.
- Prefer one bounded handoff over repeated vague prompts.
- If the implementation model gets stuck twice, stop and replan with Codex.

### Project Commands

Default to Bun:
- `bun test`
- `bun run <script>`
- `bun install`

Use Bun APIs when adding application code:
- `Bun.serve()` instead of Express.
- `bun:sqlite` instead of `better-sqlite3`.
- `Bun.redis` instead of `ioredis`.
- `Bun.sql` instead of `pg` or `postgres.js`.
- `Bun.file` instead of `node:fs` helpers when practical.
