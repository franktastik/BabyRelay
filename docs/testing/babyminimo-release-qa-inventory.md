# BabyMinimo Release QA Inventory

PBI-052 tracks the test and visual-release gate for BabyMinimo. This inventory defines the coverage required before a release candidate can be treated as stable.

## Scope Boundary

This PBI is local and emulator-safe. It must not require production Firebase credentials, App Store Connect, StoreKit production products, production push credentials, or live billing.

## Required Functional Coverage

| Area | Required coverage | Current asset | Gap |
| --- | --- | --- | --- |
| Auth | Login, signup screen reachability, email/password emulator path | `e2e/maestro/smoke.yaml` | Add Firebase Emulator form-submit integration coverage. |
| Onboarding | Welcome, questionnaire, pain points, problem, benefits, priorities, notification priming, add baby, preview | `e2e/maestro/smoke.yaml` | Add assertions for selected questionnaire state carrying into preview. |
| Home | Dashboard load, settings navigation, quick action entry, Growth Timeline navigation | `e2e/maestro/smoke.yaml` | Add explicit settings and Growth Timeline navigation assertions. |
| Logging | Quick log chooser, breastfeed, bottle, diaper, sleep, medication save flows | `e2e/maestro/smoke.yaml` covers chooser + diaper | Add save-flow assertions for breastfeed, bottle, sleep, medication. |
| Timeline | Filter chips, merged care/growth list, Add Moment route | `e2e/maestro/smoke.yaml`, `e2e/maestro/visual-regression.yaml` | Add Notes filter and Add Moment save smoke. |
| Handoff | Current state, due soon, latest note, reminder icon route | `e2e/maestro/smoke.yaml` | Add explicit reminder-icon route assertion. |
| Reminders | Create, permission prompt, toggle/cancel path | Unit notification policy tests and Reminders UI | Add Maestro create/toggle flow. |
| Family | Invite field/button, Manage Caregivers local scroll | `e2e/maestro/smoke.yaml` | Add invite assertion and Manage Caregivers scroll assertion. |
| Settings | Settings rows route correctly, widgets route, sign out route | Partial smoke/manual evidence | Add Maestro route assertions for each settings row. |
| Plans | Display-only local pricing/paywall preview, production IAP disabled/deferred | Visual baseline config | Add assertion that purchase controls are deferred until StoreKit PBI. |
| Account | Profile rows non-interactive, password deferred, sign out works | Sign-out modal exists | Add Maestro sign-out confirmation flow. |
| Widgets | Settings toggle, clear snapshot, privacy copy | PBI-047 screenshots and unit tests | Add Maestro widgets settings smoke. |
| Notifications | Local notification policy, permission CTA, reminder scheduling/cancel | Unit notification policy tests | Add emulator/dev-build manual checklist for OS notification delivery. |

## Required Visual Coverage

Approved baselines live in:

```text
docs/product/superdesign-reference-assets/screenshots1/
```

Current release visual config:

```text
e2e/visual-baselines.json
```

The approved folder currently contains 41 product-owner screenshots. The visual config currently maps the core release subset: login, signup, onboarding welcome, Home, quick log, Timeline, Add Moment, Handoff, Reminders, Family, Settings, Plans, and Account.

## Scrollable Coverage Gaps

Final release visual acceptance requires top, middle, and bottom approved captures for every scrollable screen in scope. Current known gaps:

| Screen | Required positions | Approved positions currently tracked | Release status |
| --- | --- | --- | --- |
| Home | top, middle, bottom | top | Blocked until middle/bottom baselines are approved. |
| Timeline | top, middle, bottom | top | Blocked until middle/bottom baselines are approved. |
| Family | top, middle, bottom | top | Blocked until middle/bottom baselines are approved. |
| Settings | top, middle, bottom | top | Blocked until middle/bottom baselines are approved. |

Do not shrink or compress scrollable content to force a full screen into one screenshot.

## Required Commands

Local release QA command set:

```sh
bun run test:typecheck
bun run test:unit
npx expo-doctor
maestro test e2e/maestro/smoke.yaml
bun run test:e2e:visual
bun run test:visual:compare:coverage
```

Expected current state:

- `bun run test:typecheck`: should pass.
- `bun run test:unit`: should pass.
- `npx expo-doctor`: should pass.
- `maestro test e2e/maestro/smoke.yaml`: should pass.
- `bun run test:e2e:visual`: expected to fail until actual screenshots are captured at matching dimensions and all mapped baselines align exactly.
- `bun run test:visual:compare:coverage`: expected to fail until missing scrollable middle/bottom approved baselines are provided.

## Current PBI-052 Capture Result

The Maestro visual capture flow currently passes after updating the login assertion to the current approved `Baby MiniMemo` copy.

Current pixel comparison result:

- `bun run test:visual:compare` fails because the product-owner approved screenshots are cropped mockup captures around roughly `344x730`, while Maestro captures full simulator frames at `1206x2622`.
- The same run reports missing middle/bottom scroll baselines for Home, Timeline, Family, and Settings.

This is an expected release QA blocker, not an implementation acceptance. The next release QA slice must either capture approved baselines at the same full-frame dimensions as Maestro or add a documented, deterministic crop/normalization step that is approved by the product owner before zero-diff comparison is considered meaningful.

## Manual Checks Still Required

- Device notification delivery behavior for local notifications.
- Native widget behavior on Home Screen after dev build install. Current PBI-054 evidence covers Settings > Widgets at `docs/testing/screenshots/pbi-054/widgets-settings.png`; native small/medium Home Screen widget placement screenshots are still required.
- Growth Timeline image picker permissions on a clean simulator.
- OS-level sign-out and relaunch behavior after Firebase Emulator session changes.
- Accessibility sweep for disabled/deferred controls and tap target size.
- Production-only billing/auth/security controls remain deferred and visibly non-functional until their PBIs start.

## Release QA Blockers

The current local build is not release-QA complete because these gates are still open:

1. Visual baseline dimensions do not match Maestro full-frame captures.
   - Approved examples are cropped mockup screenshots, for example `344x710`.
   - Maestro actual screenshots are full simulator frames, currently `1206x2622`.
   - Zero-diff comparison cannot be meaningful until approved and actual captures use the same frame/crop policy.

2. Scrollable baseline coverage is incomplete.
   - Home, Timeline, Family, and Settings currently track top-position baselines only.
   - Middle and bottom approved baselines are required before `test:visual:compare:coverage` can pass.

3. Functional E2E coverage is still smoke-level.
   - The expanded smoke flow verifies screen reachability and representative interactions.
   - It does not yet save every log type, create/toggle every reminder scenario, run Add Moment end-to-end with OS picker permissions, or verify sign-out/relaunch recovery.

4. Manual native checks remain.
   - Home Screen widget rendering for small and medium widgets, including empty, stale/expired, disabled, signed-out, and ready states.
   - Local notification delivery.
   - OS permission sheets for photos/notifications.
   - Accessibility and tap-target review.

5. Production-dependent flows remain intentionally out of scope.
   - StoreKit/App Store Connect pricing and subscription flows.
   - Production Firebase security rules and credentials.
   - Production push messaging, account deletion, and billing lifecycle behavior.
