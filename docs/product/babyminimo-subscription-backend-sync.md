# BabyMinimo Subscription Backend Sync

Status: PBI-055 T3/T4 local-code contract. This document does not authorize production Firebase deploys, App Store Connect writes, signing changes, production credentials, or live billing changes.

## Purpose

BabyMinimo native IAP state must stay optimistic on-device. Subscription access is granted only from backend-authoritative entitlement state.

This pass adds the local TypeScript contract for:

- App Store product ID to backend plan mapping.
- Backend-owned billing entitlement records.
- Compact client entitlement projections.
- Wrong-user original transaction conflict detection.
- Backend-managed billing path/field policy.
- App Store Server Notification lifecycle event mapping.
- Typed callable client wrapper for entitlement refresh.

The deployable Cloud Functions endpoint and production Firestore rules are intentionally not edited in this task because GoalBuddy T324/T325 allowed paths exclude `functions/**` and `firestore.rules`.

## Backend Entitlement Record

Backend billing records are owned by trusted server code and should not be created or updated by mobile clients.

Required record fields:

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

Launch plan mapping:

- `com.babyminimo.premium.annual` -> `premium_annual`
- `com.babyminimo.premium.monthly` -> `premium_monthly`
- `com.babyminimo.premium.weekly` -> `premium_weekly`

Family, gift, and lifetime product IDs remain deferred until owner approval defines transfer, refund, fraud, lifecycle, and cost policy.

## Client Projection

Clients should read a compact backend projection only:

- `userId`
- `planId`
- `premiumActive`
- `maxBabies`
- `maxHouseholdMembers`
- `exportsEnabled`
- `refreshedAt`
- `expiresAt`
- `source: backend`

The app must reject entitlement snapshots that are not `source: backend` or that belong to a different signed-in user.

## Firestore Rules Contract

Production Firestore rules must deny all client writes to backend-managed billing paths and fields.

Backend-managed collections:

- `billingEntitlements`
- `billingTransactions`
- `appStoreNotificationEvents`

Backend-managed fields include transaction IDs, plan keys, status, product IDs, billing retry, grace, refund, revoke, active entitlement booleans, and source timestamps.

Expected production rule behavior:

- Signed-in users may read only their own compact entitlement projection.
- Household admins may read only approved household plan projections, if household-scoped benefits are enabled later.
- Clients may not create, update, or delete billing entitlement records.
- Clients may not create, update, or delete raw transaction records.
- Clients may not create, update, or delete App Store Server Notification event records.
- Cross-user and cross-household reads are denied.
- Unmodeled billing paths deny all access.

The current repository `firestore.rules` file remains emulator-only allow-all. Replace it before any production deploy.

## App Store Server Notifications

The lifecycle ingestion path must verify Apple signed payloads before mutating entitlements. The local contract rejects unverified payloads.

Entitlement-changing events:

- `SUBSCRIBED`
- `DID_RENEW`
- `DID_CHANGE_RENEWAL_PREF`
- `OFFER_REDEEMED`
- `RENEWAL_EXTENDED`
- `DID_FAIL_TO_RENEW`
- `EXPIRED`
- `GRACE_PERIOD_EXPIRED`
- `REFUND`
- `REVOKE`
- `DID_CHANGE_RENEWAL_STATUS`

Record-only events:

- `CONSUMPTION_REQUEST`
- `PRICE_INCREASE`
- `REFUND_DECLINED`
- `TEST`

Notification event records are idempotent by `notificationUUID`.

## Callable Contract

The app now exposes a typed Firebase callable wrapper:

- Callable name: `refreshIapEntitlement`
- Input: `{ reason, productId?, transactionIds? }`
- Output: compact backend entitlement projection.

The callable must be implemented by trusted backend code before production IAP launch. It should:

- Require a stable non-anonymous Firebase UID.
- Validate App Store transaction state server-side.
- Reject restores where the original transaction belongs to another UID.
- Persist backend-owned billing records idempotently.
- Return only the compact entitlement projection.

## Verification

Local code coverage added:

- Product to backend plan mapping.
- Active, expired, refunded, grace-period, and wrong-user entitlement behavior.
- Backend-managed billing path/field policy.
- App Store Server Notification renewal, billing retry, expiration, refund, revoke, record-only, idempotency, and unsigned payload rejection.
- Callable routing for `refreshIapEntitlement`.
