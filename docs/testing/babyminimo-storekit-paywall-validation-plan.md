# BabyMinimo StoreKit, Sandbox, And TestFlight Validation Plan

This plan supports `PBI-064 T3` and prepares `PBI-055` without starting production App Store Connect work.

The goal is to prove every paywall, pricing, entitlement, restore, cancellation, retention, and gifting path before BabyMinimo ships native purchases.

## Validation Layers

### 1. Local StoreKit Configuration

Purpose:

- Validate UI purchase states quickly during development.
- Simulate products, trial eligibility, failed purchases, renewals, expirations, refunds, and restore cases without relying on App Store Connect availability.

Required artifact later:

- `BabyMinimo.storekit`

Coverage:

- Weekly subscription.
- Monthly subscription.
- Annual subscription.
- Optional 3-day free trial.
- Lifetime non-consumable.
- Gift 1 month candidate.
- Gift 1 year candidate.
- Restore purchases.
- Interrupted purchase.
- Failed purchase.
- Canceled purchase.
- Expired subscription.
- Billing retry.
- Refund/revoke.

### 2. App Store Sandbox

Purpose:

- Validate real App Store Connect product setup, storefront pricing, localized price strings, intro offer eligibility, restore behavior, and subscription renewal/cancellation lifecycle without real charges.

Required before execution:

- App Store Connect app exists.
- Subscription group exists.
- Products exist and are approved for sandbox testing.
- Sandbox testers exist.
- Bundle ID, entitlements, and StoreKit implementation are configured.

Coverage:

- Real localized product metadata.
- Storefront-specific price display.
- Trial eligibility per sandbox account.
- Restore across reinstall.
- Renewal acceleration.
- Cancel from sandbox subscription management.
- Billing retry and failed renewal states where possible.
- App Store Server Notification reconciliation after PBI-055 backend work.

### 3. TestFlight

Purpose:

- Validate install/update behavior, real device behavior, beta tester purchase flow, accelerated subscription lifecycle, localized screens, and screenshot-readiness in a near-release environment.

Required before execution:

- Signed build uploaded.
- TestFlight group configured.
- What to Test notes include payment scenarios.
- Products configured in App Store Connect.
- Privacy, terms, and support URLs available.

Coverage:

- New install paywall.
- Existing account restore.
- Trial eligibility.
- Renewal/cancellation transitions.
- Local notification interaction after subscription changes.
- Widget behavior after plan changes, if gated later.
- Screenshot/ASO paywall capture after pricing is accurate.

## Core Product Test Matrix

| Case | Product | Layer | Expected Result |
| --- | --- | --- | --- |
| Subscribe weekly | `premium_weekly` | StoreKit, Sandbox, TestFlight | Purchase succeeds, Premium entitlement active, paywall closes or confirms access. |
| Subscribe monthly | `premium_monthly` | StoreKit, Sandbox, TestFlight | Purchase succeeds, Premium entitlement active, monthly billing copy shown. |
| Subscribe annual | `premium_annual` | StoreKit, Sandbox, TestFlight | Purchase succeeds, Premium entitlement active, annual selected by default, valid savings badge shown. |
| Trial eligible annual | `premium_annual` + intro offer | StoreKit, Sandbox, TestFlight | CTA says `Try 3 Days Free`, terms state free trial then localized annual renewal. |
| Trial ineligible annual | `premium_annual` | StoreKit, Sandbox, TestFlight | CTA does not promise a free trial; terms show direct annual renewal. |
| Purchase canceled | any subscription | StoreKit, Sandbox | User returns to paywall, no entitlement granted, no scary error. |
| Purchase failed | any subscription | StoreKit, Sandbox | Retryable error shown, no entitlement granted. |
| Interrupted purchase | any subscription | StoreKit | Loading/interrupted state is recoverable on next app open. |
| Restore active subscription | any active subscription | StoreKit, Sandbox, TestFlight | Restore succeeds, entitlement active, access restored. |
| Restore no purchase | none | StoreKit, Sandbox | Calm no-purchase-found message shown. |
| Subscription expired | any subscription | StoreKit, Sandbox | Entitlement removed after server/client confirmation; user sees upgrade path. |
| Billing retry | any subscription | Sandbox, TestFlight where available | Entitlement state follows App Store/server status and messaging is calm. |
| Refund/revoke | any subscription | Sandbox/server notification after PBI-055 | Entitlement revoked and audit event recorded. |

## Lifetime Test Matrix

| Case | Product | Layer | Expected Result |
| --- | --- | --- | --- |
| Buy lifetime | `premium_lifetime_25mo` or `premium_lifetime_26mo` | StoreKit, Sandbox, TestFlight | Non-consumable purchase succeeds, Premium lifetime entitlement active. |
| Restore lifetime | lifetime product | StoreKit, Sandbox, TestFlight | Restore reactivates lifetime entitlement on reinstall/new device. |
| Duplicate lifetime purchase | lifetime product | StoreKit, Sandbox | App shows already-owned/restore behavior; no duplicate entitlement confusion. |
| Lifetime refund/revoke | lifetime product | Sandbox/server notification after PBI-055 | Lifetime entitlement removed only after authoritative notification. |
| Lifetime with Family upsell | lifetime product | StoreKit/UI test | Lifetime remains Premium-only unless Family lifetime is explicitly approved. |

## Gift Test Matrix

Gift products remain research candidates until entitlement/redemption design is approved.

| Case | Product | Layer | Expected Result |
| --- | --- | --- | --- |
| Buy gift 1 month | `gift_premium_1mo` | StoreKit, Sandbox | Purchase creates redeemable gift entitlement without linking purchaser to recipient household data. |
| Buy gift 1 year | `gift_premium_1yr` | StoreKit, Sandbox | Purchase creates redeemable gift entitlement with clear expiration/redeem instructions. |
| Redeem valid gift | gift code/link | Emulator, Sandbox later | Recipient receives entitlement, purchaser cannot see recipient household. |
| Duplicate redemption | gift code/link | Emulator, Sandbox later | Second redemption is blocked with a calm message. |
| Expired gift | gift code/link | Emulator, Sandbox later | Redemption blocked; support path available. |
| Refunded gift | gift purchase | Sandbox/server notification later | Future entitlement is revoked or marked invalid according to policy. |

## Cancellation And Retention Validation

Apple Retention Messaging API is access-gated and not required for launch.

If available:

| Case | Expected Result |
| --- | --- |
| Eligible user cancels | Apple cancellation page displays BabyMinimo retention message/offer. |
| Ineligible user cancels | No retention offer is shown. |
| Offer redeemed | Promotional offer activates and entitlement/renewal state reconciles. |
| Offer ignored | Cancellation proceeds normally. |
| Refund/billing retry user cancels | User is excluded from retention offer. |

Retention offer copy must be truthful and must not block cancellation.

## Storefront And Localization Validation

For every enabled storefront:

- StoreKit localized price matches App Store Connect.
- Billing period text is localized.
- Savings badge is recalculated for the local price.
- Trial terms are localized.
- Terms and privacy links are reachable.
- RTL layouts are visually checked for Arabic and Hebrew.
- Text-expansion checks cover German, French, Portuguese, Russian, and Ukrainian.
- CJK checks cover Japanese, Korean, Simplified Chinese, and Traditional Chinese.

## TestFlight What To Test Notes Draft

Use this as a future TestFlight note after IAP is implemented:

```text
Please test BabyMinimo Premium purchase flows:
1. Open Plans and view the paywall.
2. Confirm the displayed price and billing period are clear.
3. Try the Annual plan first.
4. If a free trial is shown, confirm the trial terms are clear.
5. Cancel before confirming purchase and verify the app returns calmly.
6. Complete a purchase with a sandbox account.
7. Close and reopen the app; Premium access should remain.
8. Try Restore Purchases from the paywall.
9. Report any confusing pricing, renewal, or cancellation wording.
```

## Release Gates

PBI-055 must not be considered complete until:

- local StoreKit tests pass
- sandbox purchase and restore pass
- TestFlight purchase smoke passes
- localized price strings come from StoreKit
- savings badges are computed from current storefront products
- trial eligibility is respected
- refunds/revokes are reflected by authoritative status
- no production entitlement is granted from client-only state
- screenshot/paywall copy matches actual products

## T326 Release Evidence Status

The local release-gate register lives in `src/features/subscriptions/releaseReadiness.ts`, with focused coverage in `src/features/subscriptions/releaseReadiness.test.ts`.

Current automated gates are limited to code and documentation evidence. Real Sandbox/TestFlight execution remains manual because it requires App Store Connect products, sandbox testers, signing, and a TestFlight build. Production deployable entitlement Functions and billing Firestore rules are also still blocked until a task scope explicitly includes `functions/**` and `firestore.rules`.
