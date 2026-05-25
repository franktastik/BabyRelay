# BabyMinimo Pricing Experiment Plan

This plan supports `PBI-064 T2`. It defines BabyMinimo product identifiers, launch pricing candidates, localized pricing metadata requirements, PPP-style affordability rules, above-floor markers, trial assumptions, gifting hypotheses, lifetime purchase assumptions, and cancellation-retention planning.

No App Store Connect products are created by this document. StoreKit/App Store Connect remains the source of truth for live prices, localized display prices, trial eligibility, subscription state, and entitlement state.

## Launch Product Matrix

| Plan | Product ID Candidate | Product Type | Launch Role | Planning Price | Notes |
| --- | --- | --- | --- | --- | --- |
| Premium Weekly | `premium_weekly` | Auto-renewable subscription | Experiment/fallback | `$3.99/week` | Not selected by default. Useful for short-term cohorts only if churn/refund rate is acceptable. |
| Premium Monthly | `premium_monthly` | Auto-renewable subscription | Baseline comparison | `$9.99/month` | Used as the main comparison baseline for annual and lifetime savings. |
| Premium Annual | `premium_annual` | Auto-renewable subscription | Default recommendation | `$39.99/year` | Selected by default. `Save 65%` is valid against `$9.99/month` because annualized monthly is `$119.88`. |
| Premium Lifetime 25 | `premium_lifetime_25mo` | Non-consumable IAP | Research candidate | nearest App Store price point to `$249.75` | 25-month anchor: 24 months + 1 monthly period at `$9.99`. |
| Premium Lifetime 26 | `premium_lifetime_26mo` | Non-consumable IAP | Research candidate | nearest App Store price point to `$259.74` | 26-month anchor: 24 months + 2 monthly periods at `$9.99`. |
| Gift 1 Month | `gift_premium_1mo` | Non-consumable or consumable gift entitlement candidate | Research candidate | storefront-local monthly equivalent | Requires redemption and entitlement model before implementation. |
| Gift 1 Year | `gift_premium_1yr` | Non-consumable or consumable gift entitlement candidate | Research candidate | storefront-local annual equivalent | Useful for baby-shower and family support positioning. |

Default launch recommendation:

- Show Premium Annual selected by default.
- Show Monthly as the plain comparison.
- Show Weekly only in an experiment or secondary path.
- Keep Lifetime hidden until backend cost/support risk is accepted.
- Keep Gifting hidden until redemption, entitlement, refund, and fraud rules are designed.

## Savings Badge Rules

Savings badges must be computed from the active storefront price data.

Formula:

```text
savings_percent = round((comparison_total - candidate_price) / comparison_total * 100)
```

Annual example:

```text
monthly_baseline = 9.99
annualized_monthly = 9.99 * 12 = 119.88
annual_candidate = 39.99
savings = (119.88 - 39.99) / 119.88 = 66.6%
```

Display decision:

- `Save 65%` is acceptable as a conservative rounded badge.
- `Save 50%` is acceptable only if the local annual discount is at least 50%.
- `Save 90%` is allowed only when the local comparison price mathematically supports it and the baseline is visible.

Never hardcode a badge into the UI without storing the comparison baseline, product price, territory, effective date, and calculation.

## PPP-Style Pricing Model With Above-Floor Guardrail

BabyMinimo can use lower local prices in lower-purchasing-power markets, but every price must stay above the contribution-margin floor.

Each storefront row must include:

- storefront country/region
- locale/language
- currency
- App Store price point ID
- localized display price from StoreKit
- local billing-period copy
- comparison product
- computed savings badge
- estimated monthly variable cost per paying household
- App Store commission assumption
- tax/VAT assumption where relevant
- expected refund/support reserve
- expected family/caregiver usage multiplier
- margin result
- above-floor marker
- launch decision

Required marker values:

- `above_floor`: price can launch if copy/legal review also passes.
- `near_floor`: price needs product owner approval and usage monitoring.
- `below_floor`: price must not launch; raise price, make it a limited intro offer, or exclude the storefront.
- `unknown`: missing enough cost, tax, or price-point data to decide.

Guardrail:

```text
net_revenue = storefront_price - app_store_commission - tax_or_vat_reserve - refund_reserve
estimated_cost = firebase_ops + functions + storage + egress + push + logs + backups + support
margin = net_revenue - estimated_cost
```

Launch rule:

- `above_floor` only when margin is comfortably positive.
- `near_floor` cannot be the default annual plan without explicit product-owner approval.
- `below_floor` cannot be configured as a standard App Store price.

Nigeria example:

- `NGN 500` or `NGN 1,000` may look attractive for affordability.
- It must be marked `above_floor` before launch.
- If it is `near_floor` or `below_floor`, use a higher local price, a time-limited introductory offer, or no launch price for that product in the storefront.

## Storefront Pricing Tiers To Research

These tiers are planning buckets only. Real prices must use App Store price points and StoreKit localized values.

| Tier | Example Regions | Annual Strategy | Monthly Strategy |
| --- | --- | --- | --- |
| Premium | USA, Canada, UK, Germany, Australia, Switzerland, Nordics | close to `$39.99/year` or higher | close to `$9.99/month` |
| Standard | France, Spain, Italy, Japan, South Korea, Netherlands | near localized equivalent of `$29.99-$39.99/year` | localized equivalent of `$7.99-$9.99/month` |
| Affordability | Brazil, Mexico, India, Indonesia, Turkey, Philippines, Nigeria | lower local annual only if `above_floor` | lower local monthly only if `above_floor` |
| Watchlist | high tax, high fraud, high support, or uncertain purchasing-power markets | default to `unknown` until verified | default to `unknown` until verified |

## Trial And Intro Offer Assumptions

Allowed launch candidate:

- 3-day free trial for eligible users, only if App Store Connect permits it and StoreKit reports eligibility.

Research-only candidates:

- `$0.99` for 3 days.
- `$0.50` for 3 days.

Paid short intro pricing must not ship until App Store Connect confirms:

- product/offer type is valid
- renewal transition copy is clear
- localized terms are correct
- refund/support risk is acceptable

Paywall copy must never say `No payment required today` unless StoreKit confirms an actual free trial with no charge today.

## Lifetime Purchase Assumptions

Lifetime is a non-consumable IAP candidate, not an auto-renewable subscription.

Default scope:

- Premium-only lifetime.
- Family lifetime is blocked until cost analysis proves long-term caregiver/household usage is profitable.

Anchor options:

- 25-month anchor: `24 * monthly + 1 * monthly = $249.75`
- 26-month anchor: `24 * monthly + 2 * monthly = $259.74`

Selection rule:

- Choose the nearest App Store price point after margin analysis.
- Confirm long-term support, storage, account recovery, and entitlement-sync costs.
- Include a migration path if Premium feature definitions change.

## Gifting Hypotheses

Gift positioning:

- `Give a calmer first month`
- `Gift a year of shared baby care`
- `Help a new family keep the day organized`

Initial gift candidates:

- Gift 1 month.
- Gift 1 year.

Validation requirements:

- Gift purchaser and recipient accounts are distinct.
- Redemption is single-use.
- Duplicate redemption is blocked.
- Refund/reversal removes future entitlement safely.
- Gift expiration is explicit.
- Gift does not expose baby or household data to the purchaser.

Gift screenshots or ASO creative must not imply live gifting until implementation and App Store review are ready.

## Cancellation-Retention Offer Hypotheses

Apple Retention Messaging API is access-gated and must not block launch.

If access is available, test only truthful retention offers on Apple's cancellation confirmation surface.

Candidate message:

- `Keep your care circle in sync with BabyMinimo.`

Candidate offers:

- `25% off the next 2 months`
- `30% off the next 2 months`
- short Premium/Family extension if App Store promotional-offer constraints allow it

Audience:

- active households with care logs in the last 14-30 days
- exclude refund, billing retry, account deletion, privacy-risk, or support-escalated states

Metrics:

- cancellation saves
- offer redemption
- retained revenue at 30/60/90 days
- refund rate
- support tickets
- downstream churn

## Remote Config Boundaries

Firebase Remote Config may provide:

- `paywall.variant_id`
- `paywall.default_plan_key`
- `paywall.headline_key`
- `paywall.benefit_set_key`
- `paywall.show_weekly`
- `paywall.show_lifetime`
- `paywall.show_gifting`
- `paywall.trial_message_variant`

Remote Config must not provide:

- real price strings
- entitlement state
- purchase validation result
- subscription status
- hidden product IDs not configured in App Store Connect
- security or authorization rules

## Required Pricing Manifest Shape

Future implementation should store a planning manifest similar to this:

```json
{
  "storefront": "USA",
  "locale": "en-US",
  "productKey": "premium_annual",
  "appStoreProductId": "com.babyminimo.premium.annual",
  "currency": "USD",
  "planningPrice": 39.99,
  "localizedPeriodLabel": "per year",
  "comparisonProductKey": "premium_monthly",
  "comparisonAnnualizedPrice": 119.88,
  "savingsBadge": "Save 65%",
  "estimatedMonthlyCostFloor": 1.25,
  "commissionRate": 0.3,
  "taxReserveRate": 0,
  "refundReserveRate": 0.03,
  "marginMarker": "above_floor",
  "launchDecision": "candidate",
  "effectiveDate": "TBD"
}
```

## Acceptance Gates Before PBI-055

Before native purchase implementation starts:

- product IDs are finalized
- launch product count is intentionally small
- annual/monthly/weekly/lifetime/gift assumptions are documented
- every enabled storefront has an above-floor decision
- savings badge math is deterministic
- trial copy is tied to StoreKit eligibility
- lifetime scope is accepted as Premium-only or explicitly expanded
- gifting scope is accepted or deferred
- cancellation-retention is marked access-gated
- Remote Config boundaries are documented
