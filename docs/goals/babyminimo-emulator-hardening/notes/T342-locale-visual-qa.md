# T342 Locale Visual QA

Task: `PBI-065 T11`

Date: 2026-05-25

## Scope

Run a judge pass for localized visual readiness after the runtime i18n wiring and batch translation imports.

Representatives:
- English canonical runtime
- German text-expansion representative
- Arabic/Hebrew RTL representative

## Result

Status: partial pass with release blockers.

English runtime smoke passed. The simulator rendered the Baby MiniMemo login screen without a redbox after the localization wiring.

Evidence:
- `docs/goals/babyminimo-emulator-hardening/notes/T342-english-login-smoke.png`

German text-expansion visual QA is blocked from a full claim. German is available through the draft-locale runtime path and covered by unit tests, but only the first runtime batch has a direct UI toggle today. The remaining feature surfaces now have keys and draft files, but they still need an explicit simulator locale override that can force German across all routes without relying on manually reaching Settings.

RTL visual QA is blocked. Arabic and Hebrew draft assets exist, but they are not imported into the runtime bundle, and RTL layout direction/mirroring has not been implemented or verified. Do not generate or approve Arabic/Hebrew localized screenshots yet.

## Current Verification

Passed:
- `bun run test:typecheck`
- `bun run test:unit`
- `node scripts/localization/validate-localization-assets.mjs`
- `npx expo-doctor`
- English simulator smoke at `http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0`

Blocked:
- German full-screen visual QA across auth, onboarding, Home, Timeline, Handoff, Reminders, Family, Widgets, and Account.
- Arabic/Hebrew RTL runtime visual QA.
- Localized App Store screenshot generation for non-English locales.

## Release Blockers

Before PBI-063 localized screenshot generation or release localization signoff:
- Add a dev/test locale override that can force any supported locale at startup or through a QA-only route.
- Import or lazy-load reviewed non-English runtime resources behind draft/QA gating.
- Implement RTL layout direction for Arabic and Hebrew, including alignment, row order, and icon mirroring decisions.
- Run AI linguistic QA for non-English app strings before marking any locale runtime-ready.
- Capture localized screenshot baselines for scrollable screens using top/middle/bottom states where needed.
- Verify StoreKit localized prices in sandbox/TestFlight for pricing/paywall screenshots.

## Judge Decision

Accept T341 as technically correct for the local non-production localization implementation.

Keep PBI-065 non-English runtime release readiness blocked until the locale override, RTL handling, and AI linguistic QA gates are complete.
