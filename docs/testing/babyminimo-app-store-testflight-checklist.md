# BabyMinimo App Store And TestFlight Checklist

This document supports `PBI-053 T4`: verify the App Store/TestFlight checklist, screenshot status, and rollback notes. It is a release-readiness artifact only; it does not perform signing, App Store Connect writes, production Firebase deploys, TestFlight uploads, or production credential access.

For the owner-facing step-by-step App Store Connect, Apple Developer, Firebase, TestFlight, production submission, and rollback runbook, see `docs/testing/babyminimo-testflight-production-runbook.md`.

## Current Verdict

`NO-GO` for App Store/TestFlight submission.

The local repository has enough release metadata for configuration smoke testing, but the submission checklist is not complete. The remaining blockers are explicit and owner/action dependent.

## Checklist

| Area | Evidence | Status | Required before TestFlight/App Store |
| --- | --- | --- | --- |
| Display name | `app.json` and `ios/BabyMinimo/Info.plist` use `BabyMinimo`. | Pass for local smoke | Product owner confirms final public name. |
| Bundle ID | `app.json` uses `com.babyminimo.app`. | Pass for local smoke | App Store Connect record and signing profile must match. |
| Version/build | `app.json` version is `0.1.0`; native build number is `1`. | Manual gate | Increment build number for every TestFlight upload. |
| App icon | `ios/BabyMinimo/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png` exists. | Manual visual gate | Product owner approves final icon and App Store icon appearance. |
| Splash | Splash background asset and storyboard are present. | Manual visual gate | Verify on clean physical device/TestFlight. |
| Privacy manifest | `ios/BabyMinimo/PrivacyInfo.xcprivacy` exists and declares accessed API reasons with tracking disabled. | Pass for current local scope | Re-review after production analytics, StoreKit, push, cloud media, or account deletion backend work. |
| iOS permission strings | `ios/BabyMinimo/Info.plist` currently has no photo/camera purpose strings. | Blocked | Add accurate purpose strings before enabling production native photo import/camera flows. |
| Firebase release mode | Local smoke command verifies emulator mode can be disabled. | Pass for local smoke | Production Firebase security/App Check/rules/deploy gates remain under PBI-050. |
| StoreKit/IAP | PBI-055 records sandbox/TestFlight gates separately. | Blocked | Complete StoreKit products, sandbox purchase smoke, restore smoke, and entitlement backend before release. |
| Push notifications | Local notification/push readiness is documented in PBI-061. | Blocked for production push | Verify APNs/FCM credentials and real physical-device delivery before production push enablement. |
| Widgets | Widget identifiers and App Group values are configured. | Manual gate | Verify signed widget extension, App Group entitlement, and Home Screen widget rendering. |
| App Store screenshots | Draft screenshot manifest exists at `docs/marketing/babyminimo-aso-screenshot-manifest.draft.json`. | Blocked | Generate final localized assets from approved retakes and link the final manifest. |
| TestFlight upload checklist | This document and `docs/testing/babyminimo-production-build-smoke.md` define the local and manual gates. | Present | Owner-approved signing/App Store Connect run remains required. |

## Screenshot Verification

The current screenshot evidence is not release-ready:

- `docs/marketing/babyminimo-aso-screenshot-manifest.draft.json` is draft-only.
- Most source screenshots are marked `requiresRetake: true`.
- The paywall screenshot is blocked pending StoreKit validation.
- PBI-063 states final screenshot asset verification is blocked until final generated App Store assets exist.
- PBI-065 states final localized screenshots remain blocked until runtime i18n, locale override, RTL handling, linguistic QA or owner acceptance, StoreKit localized price verification, and localized screenshot baselines exist.

Release requirement: final screenshots must be generated/localized, mapped to approved visual states, and linked from a final screenshot manifest before App Store submission.

## Manual TestFlight Upload Checklist

Use this checklist only after the owner explicitly approves signing and App Store Connect access:

1. Confirm the branch is clean except approved release files.
2. Run `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false bun scripts/release-production-smoke.mjs --strict --json`.
3. Run `bun run test:typecheck` and `bun run test:unit`.
4. Confirm final App Store screenshots and localized metadata are owner-approved.
5. Confirm `Info.plist` contains accurate permission strings for every production-enabled permission surface.
6. Confirm production Firebase, StoreKit, push, and widget release gates are cleared or intentionally disabled.
7. Archive with the approved Xcode/EAS path.
8. Upload to TestFlight through the approved App Store Connect workflow.
9. Install on a clean physical device.
10. Smoke login, onboarding, Home, Handoff, Log, Timeline, Family, Settings, widgets, notifications, and paywall/subscription behavior where enabled.
11. Record build number, TestFlight build ID, device/iOS version, screenshots, and final go/no-go status.

## Rollback Notes

If a TestFlight or production release must be rolled back:

1. Stop the rollout in App Store Connect or remove the affected TestFlight build from external testing.
2. Revert Remote Config rollout keys to their documented rollback/default values.
3. Disable production push routing server-side if notifications are implicated.
4. Pause or roll back Firebase deploys, rules, indexes, or Functions changes through the approved production runbook.
5. Keep local-only Growth Timeline media untouched; do not migrate or delete user-created local media as part of a remote rollback.
6. Ship a patched build with an incremented build number if binary behavior must change.
7. Record incident owner, trigger, rollback action, user impact, and follow-up tasks in the GoalBuddy/PBI receipt.

## T335 Receipt

- Verified the App Store/TestFlight checklist against current repository evidence.
- Confirmed the checklist is present but still blocked for release because final screenshots, permission strings, signing, StoreKit, production Firebase, push, and widget signed-build evidence are incomplete.
- Documented rollback steps without performing production or credentialed actions.
