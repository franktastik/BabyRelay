# BabyMinimo Paywall Visual Spec

This spec supports `PBI-064: Conversion paywall design and pricing experiment plan`.

The supplied paywall screenshots and video frames are reference patterns only. BabyMinimo must not copy the source app names, mascots, logos, color systems, or exact wording. The reusable pattern is:

- a focused modal-style paywall
- close control in the top corner
- dynamic product mark at the top
- concise value headline
- icon-led benefit list
- selectable plan rows
- selected-plan checkmark/radio state
- truthful savings badge
- trial toggle/disclosure when enabled
- primary CTA
- restore, terms, and privacy links
- clear renewal and cancellation copy

## Design Source

Primary BabyMinimo visual source:

- `docs/product/superdesign-reference-assets/screenshots1/`
- `docs/product/babyminimo-superdesign-implementation-plan.md`
- `docs/product/babyminimo-visual-qa-contract.md`

The paywall should feel like the approved BabyMinimo mockups:

- warm cream background
- clay primary action
- sage support/accent states
- soft rounded cards
- generous but not wasteful spacing
- Outfit-style bold headings
- Plus Jakarta Sans-style body labels
- calm, parent-safe copy

Do not use aggressive red/yellow sales styling from the reference screenshots. BabyMinimo can use savings badges, but the badge must feel premium and quiet.

## Screen Shape

Recommended route:

- `app/modals/paywall.tsx` or an equivalent modal route

Recommended viewport behavior:

- Paywall content is vertically scrollable.
- The primary CTA stays visible near the bottom when practical.
- On smaller phones, legal copy and restore links may scroll below the CTA.
- The close button remains in the header area, not hidden behind a scroll position.

Recommended hierarchy:

1. Close button
2. Dynamic BabyMinimo mark
3. Headline
4. Benefit bullets
5. Plan selector
6. Trial toggle/disclosure, if enabled
7. Primary CTA
8. Restore, terms, privacy
9. Billing fine print

## Header

Visual:

- Top-right close button in a soft circular hit target.
- BabyMinimo mark centered above the title.
- Mark may be static for v1.
- Dynamic/Lottie mark is allowed only if it is local, lightweight, and visually matches the approved BabyMinimo logo direction.

Copy:

- Title: `Unlock calm baby care`
- Subtitle: `Keep feeds, sleep, diapers, memories, and handoffs in one shared place.`

Rejected title patterns:

- `Unlimited Access`
- `Remove annoying paywalls`
- fake urgency or countdown language
- vague AI/tooling copy unrelated to baby care

## Benefit Bullets

Each benefit line uses one small BabyMinimo-style icon before the text. Icons should be simple line or filled icons in sage/clay/gold, matching the rest of the app.

Recommended benefit list:

- `Shared handoff history`
- `Unlimited care logs`
- `Gentle reminders`
- `Local photo memories`
- `Caregiver coordination`

Optional Family-specific benefits:

- `Coordinate parents and caregivers`
- `See who did what last`
- `Keep overnight handoffs clear`

Icon rules:

- Use the app icon language already used in tabs and care cards.
- Avoid brand-new illustration systems.
- Avoid icons from the reference apps.
- Keep icon color tied to the feature category, not random color.

## Plan Selector

Initial planning products:

- Annual: `$39.99/year`, selected by default, `Save 65%` only when mathematically true.
- Monthly: `$9.99/month`.
- Weekly: `$3.99/week`, experiment/fallback only.
- Lifetime: one-time non-consumable candidate, priced from the 25- or 26-month anchor.
- Gift: fixed-duration gift candidate, final scope depends on App Store validation.

Plan row layout:

- Left: plan name and billing period.
- Middle or lower line: localized price and optional renewal/trial details.
- Right: radio/checkmark state.
- Savings badge sits inside the row, aligned to the plan with the computed savings.

Selected state:

- Border: sage or clay depending on variant.
- Background: very light sage/clay tint.
- Checkmark: filled circle or rounded square, never tiny low-contrast text.

Unselected state:

- Cream/white card.
- Warm border.
- Empty radio.

Savings badge rules:

- `Save 50%`, `Save 65%`, or `Save 90%` can appear only when the displayed comparison price supports the claim.
- Calculation must come from the pricing matrix and storefront product data.
- If the local App Store price changes, stale hardcoded savings text must not remain.

## Trial Disclosure

Trial display is allowed only when StoreKit reports trial eligibility or the test scenario explicitly enables it.

Preferred trial row copy:

- `3-day free trial`
- `Then {localized price} / {period}`

CTA copy with trial:

- `Try 3 Days Free`

CTA copy without trial:

- `Continue`

Fine print:

- `{trial length} free, then {localized price} per {period}. Cancel anytime in App Store subscriptions.`

Paid short intro ideas such as `$0.99 for 3 days` or `$0.50 for 3 days` are research-only until App Store Connect confirms the offer structure is valid.

## Primary CTA

Visual:

- Clay filled button for the default BabyMinimo paywall.
- Sage filled button is acceptable for a softer variant.
- Large thumb-friendly height.
- Text centered.

CTA states:

- default
- loading
- disabled while StoreKit products load
- error/retry after purchase failure
- restored after successful restore

Avoid:

- “No payment required today” unless the user is actually eligible for a free trial and StoreKit confirms no charge today.
- “Start Free Trial” when a paid intro or no trial is active.

## Footer Links

Footer links:

- `Restore`
- `Terms`
- `Privacy`

Footer behavior:

- Restore calls purchase restore only after PBI-055.
- Terms and Privacy link to product/legal URLs or local placeholder screens before production.
- Links should remain readable and tappable on small phones.

## Legal And Billing Copy

Required display fields:

- product price
- billing period
- trial period, if active
- renewal terms
- cancellation path
- restore option

Required product behavior:

- Prices shown in the app must come from StoreKit localized product values once PBI-055 starts.
- Hardcoded USD strings are only allowed in planning docs, mock states, and deterministic tests.
- Plan selection must not create entitlement state until purchase confirmation is received.

## Dynamic Brand Mark

The paywall may use a dynamic BabyMinimo mark to increase polish, but it must follow these constraints:

- local asset only
- no network dependency
- no first-paint delay
- no mismatch with approved logo direction
- static fallback always available
- respects reduced motion

Suggested animation:

- BabyMinimo logo gently scales from 0.96 to 1.0 and settles.
- Small memo/heart sparkle pulse once.
- No looping distraction while reading plan terms.

## Remote Config Boundaries

Firebase Remote Config from PBI-066 may control:

- paywall variant ID
- headline variant
- benefit list variant
- CTA copy variant
- default selected plan key
- trial toggle visibility only when StoreKit eligibility also permits it

Remote Config must not control:

- actual product price
- entitlement status
- purchase validation
- subscription status
- hidden discounts that are not configured in App Store Connect
- security or authorization behavior

## Accessibility

Requirements:

- All plan rows are accessible buttons/radios.
- Selected plan announces selected state.
- CTA announces loading state.
- Close button has a clear accessibility label.
- Restore, Terms, and Privacy links have distinct labels.
- Savings badges are not the only signal for value.
- Motion respects reduced-motion settings.

## Error And Empty States

StoreKit unavailable:

- Show disabled plan rows with copy: `Plans are temporarily unavailable. Try again in a moment.`
- CTA: `Retry`

Restore no purchase:

- Show calm inline message: `No active purchase found for this account.`

Purchase canceled:

- Do not treat as an error.
- Return to paywall with plan still selected.

Purchase failed:

- Show retryable message without blaming the user.

## Visual Variants For Experimentation

Variant A: `calm_annual_default`

- Annual selected by default.
- Clay CTA.
- Savings badge on annual if valid.
- Best for launch baseline.

Variant B: `trial_first`

- Trial row highlighted.
- CTA: `Try 3 Days Free`.
- Requires StoreKit trial eligibility.

Variant C: `family_coordination`

- Family/caregiver benefits emphasized.
- Best for users who invited a caregiver or selected household coordination during onboarding.

Variant D: `memory_plus_care`

- Growth Timeline and local memories emphasized.
- Best for users who selected photo moments during onboarding.

## App Store Screenshot Use

PBI-063 may include paywall screenshots only after:

- pricing copy is accurate
- savings claims are computed and valid
- trial eligibility assumptions are not misleading
- restore/terms/privacy are present
- no production-only behavior is implied before PBI-055

## Non-Goals For This Spec

This spec does not implement:

- App Store Connect products
- StoreKit purchase flow
- App Store Server Notifications
- production entitlement backend
- promotional offers
- Apple Retention Messaging API
- real gift purchase/redemption

Those remain in PBI-055 and later release tasks.
