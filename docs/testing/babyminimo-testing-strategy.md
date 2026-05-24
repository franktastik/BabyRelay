# BabyMinimo Testing Strategy

BabyMinimo should use a layered test suite. Each layer catches a different class of failure, so no single test type is enough.

## Test Layers

### Unit Tests

Command:

```sh
bun run test:unit
```

Use for pure TypeScript behavior:

- relative time formatting
- timeline merge/filter logic
- analytics event recording
- local utility functions

Current coverage:

- `src/relative-time.test.ts`
- `src/features/timeline/adapter.test.ts`
- `src/features/analytics/analytics.test.ts`

### Type and Project Health

Commands:

```sh
bun run test:typecheck
bun run test:doctor
```

Use these before every handoff. `expo-doctor` is configured to ignore the intentional local dev-build `ios/` app-config sync warning and to treat remote Expo metadata failures as warnings during local offline runs.

### Integration Tests

Target next:

- Firebase Emulator adapter tests for Auth, household/baby creation, and care events.
- Store integration tests for `useCareEventStore`, `useGrowthTimelineStore`, and onboarding state transitions.

Integration tests should run against local Firebase Emulator only. Do not require production Firebase credentials.

### Functional E2E Tests

Command:

```sh
bun run test:e2e:smoke
```

Tool: Maestro CLI.

Scope:

- launch app
- auth and signup screen reachability
- onboarding screen reachability
- core log modal reachability and selection controls
- inspect Timeline
- inspect Handoff
- inspect Family & Household

Prerequisites:

```sh
bun run emulators
./node_modules/.bin/expo start --localhost --port 8081 --clear
npx serve-sim --port 3200 B2C19543-60E2-489E-8E08-4E3F775AD6A0
```

The iOS simulator must have the BabyMinimo dev build installed.

The Maestro scripts default to the browser-backed simulator UDID:

```sh
B2C19543-60E2-489E-8E08-4E3F775AD6A0
```

Override it when needed:

```sh
MAESTRO_DEVICE_ID=<simulator-udid> bun run test:e2e:smoke
```

Firebase Auth form submission should be covered by Firebase Emulator integration tests instead of the visual smoke flow. Maestro can visually enter secure password text on this simulator, but the secure field does not reliably flush into React state through the iOS accessibility driver.

### Visual Regression Smoke

Command:

```sh
bun run test:e2e:visual
```

The visual flow captures screenshots into Maestro's artifact output and then compares those screenshots against approved product-owner baselines.

Approved baselines:

```text
docs/product/superdesign-reference-assets/screenshots1/
```

Comparison config:

```text
e2e/visual-baselines.json
```

Comparison script:

```text
scripts/compare-visual-baselines.ts
```

Visual gates:

- Every configured actual screenshot must exist.
- Every configured approved screenshot must exist.
- Actual and approved image dimensions must match exactly.
- Pixel diff must be zero. No minor visual difference is acceptable.
- No overlapping text.
- No compressed scrollable screens.
- Growth Timeline remains inside Timeline.
- Home stays focused on "what happened last."
- Handoff stays focused on current state and due soon.
- Settings labels match approved copy.

Use this command to run only the pixel comparison after screenshots already exist:

```sh
bun run test:visual:compare
```

Use this stricter command before final release visual acceptance:

```sh
bun run test:visual:compare:coverage
```

`test:visual:compare:coverage` also fails when a scrollable screen is missing approved top, middle, or bottom baselines.

Scrollable screen rule:

- Compare every approved scroll-position screenshot 1:1.
- If the product owner has not captured middle or bottom positions yet, record that as missing baseline coverage.
- Do not accept an implementation based on an uncaptured scroll region.
- Do not resize, compress, or crop app content to force a scrollable screen into one screenshot.

Important: a zero-diff visual gate means the app screenshot must be captured at the same crop, simulator scale, safe-area state, font state, and content state as the approved baseline. If dimensions differ, the test fails before pixel comparison.

### Non-Functional Testing

Run these before release planning:

- Accessibility: inspect tappable targets, labels, contrast, dynamic text behavior.
- Performance: profile startup, Timeline render, image-heavy Growth Timeline screens.
- Offline/local behavior: verify Growth Timeline local-only behavior and emulator failure fallbacks.
- Privacy/security: verify no production secrets, local-only photos, no analytics network calls.
- Reliability: restart app after signup/onboarding/logging and confirm state recovery from Firebase Emulator.

## Recommended CI Shape

For local development:

```sh
bun run test:all
```

For full simulator validation:

```sh
bun run emulators
./node_modules/.bin/expo start --localhost --port 8081 --clear
bun run test:e2e:smoke
bun run test:e2e:visual
```

For future CI:

- run `bun run test:all` on every PR
- run Maestro on a macOS runner for release candidates
- archive Maestro screenshots as build artifacts
- run `bun run test:e2e:visual` once baseline images are approved and mapped in `e2e/visual-baselines.json`
- run `bun run test:visual:compare:coverage` before release candidates to prove scrollable baseline coverage is complete
