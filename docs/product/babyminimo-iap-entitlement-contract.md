# BabyMinimo IAP Entitlement Contract

Status: PBI-055 T1/T2 implementation contract. This document is emulator/local-code readiness only. It does not authorize App Store Connect writes, production Firebase deploys, billing changes, signing changes, or production StoreKit release.

## Launch Product Set

BabyMinimo should launch with one App Store auto-renewable subscription group:

- Subscription group: `babyminimo-premium`
- Annual product: `com.babyminimo.premium.annual`
- Monthly product: `com.babyminimo.premium.monthly`
- Weekly product: `com.babyminimo.premium.weekly`

Internal plan keys:

- `premium_annual`
- `premium_monthly`
- `premium_weekly`

All three launch products grant the same Premium entitlement at launch. Annual should be the recommended/default plan, monthly should be the comparison plan, and weekly should remain hidden unless product availability and an approved experiment enable it.

Deferred product candidates:

- `com.babyminimo.family.monthly`
- `com.babyminimo.family.annual`
- `com.babyminimo.lifetime`
- `com.babyminimo.gift.premium.monthly`
- `com.babyminimo.gift.premium.annual`

These deferred IDs are not part of the default StoreKit product request list. They require owner approval for lifecycle rules, refund behavior, fraud handling, transfer behavior, and pricing/cost policy before they become purchaseable.

## Pricing Rules

Runtime UI must display StoreKit-supplied localized price, period, intro offer, trial eligibility, and renewal terms. Hardcoded USD values are allowed only in docs, mocks, screenshots, or tests.

The code boundary therefore models `displayPrice` as store-provided display text instead of deriving prices locally.

## Entitlement Authority

StoreKit client state is optimistic and never the source of truth for plan access. The backend-managed entitlement state is authoritative.

Backend entitlement record shape should include:

- `uid`
- `householdId`
- `planKey`
- `appStoreProductId`
- `originalTransactionId`
- `latestTransactionId`
- `environment`
- `storefront`
- `status`
- `premiumActive`
- `familyActive`
- `currentPeriodStart`
- `currentPeriodEnd`
- `autoRenewStatus`
- `billingRetry`
- `gracePeriodExpiresAt`
- `revokedAt`
- `refundedAt`
- `expirationReason`
- `lastValidatedAt`
- `source: app_store_server`
- `updatedAt`

Client entitlement projection should stay compact:

- `userId`
- `planId`
- `premiumActive`
- `maxBabies`
- `maxHouseholdMembers`
- `exportsEnabled`
- `refreshedAt`
- `expiresAt`
- `source: backend`

Purchase, restore, and manual refresh flows must return only backend-authoritative entitlement state. Wrong-user cached entitlements must be rejected.

## Provider Linking Policy

Purchase and restore require a stable signed-in Firebase UID. Anonymous/demo users must be blocked from purchase and restore.

Before purchase or restore, Apple, Google, and email provider collisions should be resolved by linking providers into one Firebase UID. Restore may return an account-conflict state if the restored `originalTransactionId` belongs to another UID.

## Native Boundary

The current app code exposes a pure injectable IAP boundary in `src/features/subscriptions/iap.ts`.

The boundary:

- Requests only launch Premium product IDs by default.
- Loads product metadata and store-supplied display prices from an injected store adapter.
- Requires signed-in user IDs for purchase, restore, and manual entitlement refresh.
- Refreshes backend entitlements after successful purchase.
- Refreshes backend entitlements after restore, including empty restore, without granting locally.
- Rejects purchase transactions that return a different product ID than requested.
- Rejects entitlement snapshots that are not backend-sourced or belong to a different user.

The boundary intentionally does not add a native StoreKit dependency, App Store Connect setup, Firebase billing writes, production deploys, or entitlement mutation rules. Those remain for PBI-055 T3-T5.

## Backend Sync And Notifications

PBI-055 T3/T4 adds the local backend entitlement and App Store Server Notification contracts in `docs/product/babyminimo-subscription-backend-sync.md`.

Implemented local-code pieces:

- `src/features/subscriptions/backendEntitlements.ts` maps launch IAP products to backend plan keys, builds backend-owned entitlement records, projects compact client entitlements, rejects wrong-user transaction ownership, and centralizes backend-managed billing paths/fields.
- `src/features/subscriptions/appStoreServerNotifications.ts` maps verified App Store Server Notification lifecycle events into entitlement updates or record-only events.
- `src/lib/firebase/callables.ts` exposes the typed `refreshIapEntitlement` callable wrapper for purchase, restore, and manual refresh flows.

Deployable Cloud Functions and production Firestore rule edits remain blocked until the GoalBuddy task scope includes `functions/**` and `firestore.rules`. The current `firestore.rules` file is still emulator-only and must be replaced before production deploy.

## Open Decisions Before Production

- Confirm whether Family plans are launch scope or post-launch.
- Choose the React Native StoreKit library and native setup path.
- Confirm whether paid access is user-scoped, household-scoped, or user-owned with household benefits.
- Finalize App Store Connect subscription group names, localized products, review notes, and sandbox testers.
