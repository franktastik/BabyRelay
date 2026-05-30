# BabyMinimo Release Readiness

This document supports `PBI-053 T2` and captures the current release configuration, asset, metadata, privacy, and App Store readiness posture without performing production signing, App Store Connect writes, or Firebase deploys.

## Scope Boundary

This is a readiness artifact only. It does not authorize:

- production Firebase deploys
- App Store Connect metadata writes
- signing certificate or provisioning profile changes
- TestFlight upload
- production billing, StoreKit product creation, or subscription group changes
- production push credentials

## Current Release Configuration

| Area | Current value | Status | Notes |
| --- | --- | --- | --- |
| App display name | `BabyMinimo` | Ready for local smoke | Confirm final marketing name before App Store submission. |
| iOS bundle ID | `com.babyminimo.app` | Ready for local smoke | Must match the App Store Connect app record and signing profile later. |
| Widget bundle ID | `com.babyminimo.app.widgets` | Ready for local smoke | Requires matching App Group entitlement before archive. |
| App Group | `group.com.babyminimo.app` | Ready for local smoke | Must be enabled in the Apple developer portal later. |
| Version | `0.1.0` | Ready for local smoke | Increment before TestFlight if this build has already been uploaded. |
| Build number | `1` in iOS project | Manual review | Bump for each TestFlight upload. |
| Orientation | Portrait | Ready for local smoke | iPad supports additional orientations through native project settings. |
| Deployment target | iOS `16.4` | Ready for local smoke | Matches current simulator/testing baseline. |
| Emulator config | Must be disabled in release smoke | Ready with script | Use `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false`. |

## Asset Checklist

| Asset | Source | Status | Release action |
| --- | --- | --- | --- |
| App icon | `ios/BabyMinimo/Images.xcassets/AppIcon.appiconset` | Present | Final visual approval still required before App Store submission. |
| Splash background | `ios/BabyMinimo/Images.xcassets/SplashScreenBackground.colorset` and storyboard | Present | Verify on physical device and light mode. |
| Widget display metadata | `app.json` expo-widgets config | Present | Verify widget extension signing during archive. |
| App Store screenshots | `docs/product/superdesign-reference-assets/screenshots1/` and ASO docs | Blocked for final release | Final localized, full-frame, no-debug screenshots are still required. |
| Landing/hero assets | Product marketing docs | Manual | Review with final App Store metadata. |

## Privacy And Permission Readiness

| Area | Current state | Release requirement |
| --- | --- | --- |
| Privacy manifest | `ios/BabyMinimo/PrivacyInfo.xcprivacy` exists with required accessed API reason declarations and tracking disabled. | Re-review after adding production analytics, StoreKit, push, cloud media, or account deletion backend work. |
| Photo access | Growth Timeline media remains local/demo scoped. | Add accurate purpose strings and clean-device permission smoke before final release if native photo picker is production-enabled. |
| Notifications | Local notifications exist; production push remains a later gate. | Verify notification permission prompts and copy on device/TestFlight before App Store submission. |
| Firebase | Emulator-first local work is present. | Production Auth/Firestore/Storage/Functions security and App Check gates must pass before release. |
| Widgets | Snapshot payload excludes sensitive Growth Timeline photos and account/billing data by contract. | Verify real Home Screen widget rendering and privacy controls on a signed build. |

## App Store Metadata Checklist

Before submission, prepare and owner-review:

- app name and subtitle
- promotional text
- full description
- keyword field by locale
- support URL
- privacy policy URL
- marketing URL if used
- age rating questionnaire
- privacy nutrition labels
- custom product page screenshot/copy mapping
- TestFlight What to Test notes
- review notes explaining demo/test credentials if needed

## Release Build Path Decision

Current recommended first release path:

1. Keep local development on `bun run emulators` and Expo dev-client/simulator checks.
2. Use Xcode archive or EAS build only after signing and App Store Connect records are approved.
3. Run the local production smoke script before any signed archive:

```sh
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false bun scripts/release-production-smoke.mjs --strict
```

4. Run `bun run test:typecheck`, `bun run test:unit`, and the relevant release QA/screenshot checks.
5. Archive/upload only after the no-go gates below are cleared.

## Current No-Go Gates

- App Store Connect app record, signing profiles, App Group capability, and TestFlight group are not verified in this task.
- Final localized App Store screenshots are not release-approved.
- StoreKit/App Store Server Notification production paths remain gated by PBI-055.
- Production Firebase rules/deploy/App Check/credentials remain gated by PBI-050 follow-ups.
- Production push credentials and physical-device push delivery remain gated by PBI-061.
- Widget Home Screen placement screenshots for small/medium release states remain required.

## T333 Receipt

- Added this release readiness register.
- Added a local production-smoke script entry point under `scripts/release-production-smoke.mjs`.
- Kept production credentials, signing, TestFlight upload, App Store Connect writes, and production Firebase deploys out of scope.
