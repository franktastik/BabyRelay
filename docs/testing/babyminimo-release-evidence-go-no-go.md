# BabyMinimo Release Evidence And Go/No-Go

This document supports `PBI-053 T5`: record release evidence, blockers, and an explicit go/no-go status.

## Final Status

`NO-GO` for TestFlight/App Store release.

This is the correct status for the current branch. PBI-053 documentation and local smoke coverage are in place, but release submission requires manual owner-approved Apple, production Firebase, StoreKit, push, widget, permissions, and screenshot work that is outside this task's approved scope.

## Evidence Recorded

| Evidence | Current result |
| --- | --- |
| Release readiness register | `docs/product/babyminimo-release-readiness.md` exists. |
| Local production smoke path | `docs/testing/babyminimo-production-build-smoke.md` exists. |
| App Store/TestFlight checklist | `docs/testing/babyminimo-app-store-testflight-checklist.md` exists. |
| Rollback notes | Recorded in `docs/testing/babyminimo-app-store-testflight-checklist.md`. |
| Draft screenshot manifest | `docs/marketing/babyminimo-aso-screenshot-manifest.draft.json` exists but is blocked. |
| Privacy manifest | `ios/BabyMinimo/PrivacyInfo.xcprivacy` exists. |
| App icon asset | Native AppIcon asset exists. |
| Emulator-disabled smoke | Covered by `scripts/release-production-smoke.mjs`. |

## Release Blockers

1. App Store Connect app record, signing certificate/profile, App Group capability, and TestFlight group have not been verified.
2. Final localized App Store screenshots are not generated, approved, or linked from a final manifest.
3. `ios/BabyMinimo/Info.plist` does not currently include photo/camera purpose strings; production media import/camera behavior must not ship without accurate purpose copy.
4. Production Firebase security/App Check/rules/deploy gates remain under PBI-050.
5. StoreKit products, sandbox purchases, restore behavior, entitlement backend, and App Store Server Notification work remain gated under PBI-055.
6. Production APNs/FCM credentials and physical-device push delivery remain gated under PBI-061.
7. Signed widget extension, App Group entitlement, and Home Screen widget rendering still need signed-build/TestFlight evidence.
8. Privacy nutrition labels, age rating, support/privacy URLs, review notes, and localized metadata require owner approval in App Store Connect.

## Explicit Non-Actions

This task did not:

- deploy production Firebase
- modify production security rules
- access production credentials
- create or modify App Store Connect records
- create signing certificates or provisioning profiles
- archive or upload a TestFlight build
- create StoreKit products or run sandbox purchases
- enable production push credentials
- submit localized App Store screenshots

## Go/No-Go Rule

The release status can move from `NO-GO` to `GO` only when:

- local smoke and unit/typecheck gates pass,
- final screenshots and metadata are approved,
- permission strings match production behavior,
- production Firebase, StoreKit, push, and widget gates are either passed or intentionally disabled,
- a signed TestFlight build installs and passes clean-device smoke,
- and the owner records the final build number and TestFlight build ID.

## T336 Receipt

- Recorded the release evidence and explicit `NO-GO` status.
- Listed release blockers that require future owner-approved production, Apple, or signed-build work.
- Preserved the task boundary: no credentialed release action was performed.
