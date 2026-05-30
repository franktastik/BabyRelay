# BabyMinimo IAP Release Evidence

This receipt supports `PBI-055 T5`. It records what is automated now and what still requires App Store Connect, Sandbox, TestFlight, deployable Firebase Functions, and production Firestore rules.

## Automated Evidence Added

- `src/features/subscriptions/releaseReadiness.ts` defines the release-gate register for native IAP.
- `src/features/subscriptions/releaseReadiness.test.ts` verifies:
  - automated, manual, and blocked gates are counted separately
  - the release cannot be marked ready while production gates remain blocked
  - Apple Pay and external checkout are rejected for iOS digital subscription unlocks
- Existing subscription tests cover:
  - product loading
  - purchase cancellation and success
  - restore
  - backend-authoritative entitlement refresh
  - wrong-user transaction conflict detection
  - App Store Server Notification lifecycle mapping

## Manual Sandbox Evidence Required Later

Do not mark PBI-055 production-ready until a signed build and App Store Connect sandbox products exist.

Required manual proof:

- App Store Connect subscription group exists for BabyMinimo Premium.
- Sandbox testers exist and can sign in on device.
- StoreKit product IDs match `docs/product/babyminimo-iap-entitlement-contract.md`.
- Sandbox purchase succeeds for weekly, monthly, and annual products.
- Restore purchases works after app reinstall or clean sign-in.
- Cancelled purchase returns calmly without entitlement grant.
- Subscription cancellation, expiration, billing retry, refund, and revoke reconcile through backend-authoritative entitlement state.
- Localized StoreKit price strings come from StoreKit, not hardcoded app copy.

## Manual TestFlight Evidence Required Later

Required manual proof:

- TestFlight build installs on a clean device.
- Purchase, restore, cancellation-management link, and entitlement refresh work with beta testers.
- Paywall copy, pricing, trial terms, and restore entry point match the App Store products.
- Screenshots used for App Store metadata do not show placeholder pricing or unsupported products.

## Current No-Go Gates

- `functions/**` is not in the T326 task scope, so deployable entitlement-refresh and notification Functions were not added here.
- `firestore.rules` is not in the T326 task scope, so production billing/entitlement write protection was not edited here.
- No App Store Connect write, production Firebase deploy, signing, Sandbox purchase, or TestFlight purchase was performed in this task.
