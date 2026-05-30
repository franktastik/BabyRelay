# BabyMinimo Production Build Smoke Path

This document supports `PBI-053 T3`: run a production-build or TestFlight smoke path without enabling emulator config.

## Local Smoke Command

Run this before a production archive or TestFlight upload:

```sh
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false bun scripts/release-production-smoke.mjs --strict
```

Expected result:

- app display name is `BabyMinimo`
- iOS bundle identifier is `com.babyminimo.app`
- version is semver-like
- widget bundle and App Group identifiers are configured
- privacy manifest is present
- emulator mode is explicitly disabled
- signing/TestFlight gates are reported as manual, not performed

## Why This Is Not A Full TestFlight Run

The GoalBuddy task explicitly stops if it requires signing, App Store Connect writes, production credentials, or production Firebase deploys without explicit approval. A real TestFlight run still needs:

- Apple developer account access
- signing certificate and provisioning profile
- App Group capability enabled for the app and widget extension
- App Store Connect app record
- TestFlight group
- optional sandbox testers for subscription validation
- owner-approved release notes and review metadata

## Manual TestFlight Smoke Steps

When the owner approves signing and App Store Connect work:

1. Confirm `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false` in the build environment.
2. Confirm production Firebase public app identifiers are set through the approved environment store.
3. Archive with the approved Xcode/EAS path.
4. Upload to TestFlight.
5. Install on a clean physical device.
6. Confirm the app launches without local emulator warnings or development overlays.
7. Confirm login/auth behavior uses the intended production or sandbox backend.
8. Confirm local notifications and widget privacy settings still behave as expected.
9. Confirm no Growth Timeline local media is uploaded to production Storage unless a later approved media task explicitly enables it.
10. Record screenshots, build number, TestFlight build ID, and go/no-go decision in the final PBI-053 receipt.

## T334 Local Result Contract

Passing the local smoke script means the repository configuration is not obviously shipping with emulator mode enabled. It does not prove:

- Apple signing
- App Store Connect upload
- TestFlight install
- production Firebase security
- production StoreKit purchases
- APNs/FCM delivery
- real widget placement

Those remain later manual or credentialed release gates.
