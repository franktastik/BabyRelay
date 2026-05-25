# BabyMinimo Paywall Experiment Readout

This readout closes `PBI-064` and records what is ready before production Apple IAP work begins.

## Current Decision

Decision: proceed to the next non-production PBI queue, but do not start production IAP/App Store Connect work without explicit approval.

Reason:

- Visual paywall direction is documented.
- Pricing/product assumptions are documented.
- StoreKit, sandbox, and TestFlight validation cases are documented.
- A local non-production paywall prototype exists in Plans.
- Production StoreKit products, entitlement backend, App Store Server Notifications, promotional offers, Retention Messaging API access, and real gift redemption are not implemented yet.

## Experiment Hypotheses

### H1: Annual Default

Hypothesis:

- Annual selected by default at `$39.99/year` with a valid `Save 65%` badge will convert better than Monthly default.

Primary metrics:

- paywall view to purchase conversion
- annual share of purchases
- refund rate
- 30-day retention

Go signal:

- Annual conversion is not materially worse than Monthly and annual share improves revenue quality.

No-go signal:

- Refunds/support tickets rise because savings or renewal terms are confusing.

### H2: Trial Eligibility

Hypothesis:

- A truthful 3-day free trial improves conversion without increasing refunds.

Primary metrics:

- trial start rate
- trial to paid conversion
- refund rate
- cancellation before renewal

Go signal:

- Trial increases paid conversion after renewal with acceptable refunds.

No-go signal:

- Users start trials but churn before renewal at a rate that hurts retained revenue.

### H3: Weekly Fallback

Hypothesis:

- Weekly at `$3.99/week` helps hesitant users but should not be the default.

Primary metrics:

- weekly selection rate
- week-2 renewal
- refund/support rate
- migration to annual/monthly

Go signal:

- Weekly users retain or later upgrade without disproportionate support/refunds.

No-go signal:

- Weekly creates high churn, complaints, or weak LTV.

### H4: Lifetime Research

Hypothesis:

- A high lifetime anchor can monetize a small set of committed users without damaging subscription revenue.

Primary metrics:

- lifetime purchase rate
- annual subscription cannibalization
- support burden
- long-term cost-floor risk

Go signal:

- Lifetime attracts incremental revenue and remains safely above cost-floor assumptions.

No-go signal:

- Lifetime cannibalizes annual or creates unacceptable long-term support/data obligations.

### H5: Gifting

Hypothesis:

- Fixed gift durations can convert family members outside the primary household.

Primary metrics:

- gift purchase rate
- redemption rate
- recipient activation
- refund/fraud rate

Go signal:

- Gift redemption leads to active recipient households without privacy or fraud problems.

No-go signal:

- Purchasers expect access to recipient data or redemption/support burden is high.

## Verification Results

Completed during PBI-064:

- `bun run test:typecheck`: pass
- `bun run test:unit`: pass
- Simulator opened the local Plans paywall with `babyminimo://plans`: pass
- Simulator screenshot captured: `docs/testing/screenshots/pbi-064/paywall-prototype.jpg`
- GoalBuddy validation after each task: pass

Docs created:

- `docs/product/babyminimo-paywall-visual-spec.md`
- `docs/product/babyminimo-pricing-experiment-plan.md`
- `docs/testing/babyminimo-storekit-paywall-validation-plan.md`

Implementation changed:

- `app/(settings)/plans.tsx`

## App Store Validation Caveats

Blocked until PBI-055 or later:

- Real StoreKit product loading.
- App Store Connect product creation.
- Subscription group setup.
- In-app purchase review submission attachment.
- Sandbox purchase testing.
- TestFlight purchase testing.
- App Store Server Notification reconciliation.
- Promotional offer eligibility.
- Apple Retention Messaging API access.
- Real gift purchase/redemption.
- Live localized price strings.

## Release Go/No-Go Criteria

Go for local/emulator prototype:

- Paywall screen renders without runtime crash.
- Plan rows are selectable.
- CTA/restore/legal actions do not pretend to purchase.
- Copy states StoreKit setup is deferred.
- Typecheck and unit tests pass.

No-go for production billing:

- Any price is hardcoded as the live price.
- Savings badges are not computed from real storefront data.
- Trial copy appears when StoreKit says the user is ineligible.
- Client-only state grants entitlement.
- Restore purchases is only visual.
- Refund/revoke/cancel lifecycle is not reconciled.
- Legal links are missing.
- App Store review metadata and IAP attachment are incomplete.

## Next Recommended Sequence

Continue non-production work:

1. `PBI-065`: localization architecture and string inventory.
2. `PBI-066`: Firebase Remote Config planning/prototype with safe boundaries.
3. Screenshot/ASO planning work that does not imply live purchases.

Stop for explicit approval before:

1. `PBI-055`: native subscriptions and Apple IAP.
2. Production Firebase/security rules deployment.
3. App Store Connect product creation, pricing, TestFlight submission, or release submission.
