# BabyMinimo Localization Draft Assets

These files support `PBI-065 T2`.

The current localization package is a planning and QA scaffold, not final native-reviewed translation content.

## Contents

- `locales.json`: supported locale list, language names, text direction, and review status.
- `app-strings/*.json`: canonical English app string inventory mirrored into each supported locale file.
- `metadata/*.json`: App Store / Google Play metadata drafts per supported locale.
- `pricing/*.json`: paywall, billing-period, trial, restore, savings, and cancellation copy per supported locale.
- `pricing/storefront-pricing-matrix.json`: StoreKit-centered pricing product matrix and per-locale storefront template with cost-floor markers.
- `screenshots/*.json`: localized screenshot headline inputs per supported locale.

## Review Status

- `en` is canonical.
- Every non-English locale is marked `draft_requires_native_review`.
- Draft files intentionally preserve the English source strings until translation and native review are performed.

This avoids presenting unreviewed machine translation as production-ready copy.

## Pricing Rule

Runtime price strings must come from StoreKit localized product display values. These docs may contain planning prices and localized billing-period copy, but production UI must not use static converted currency strings.

## Next Steps

1. Add translation drafts for each locale.
2. Run localization validation before any import or screenshot work:

   ```sh
   node scripts/localization/validate-localization-assets.mjs
   ```

   The validator checks locale manifest completeness, per-locale file coverage, key parity with English, interpolation placeholders, App Store / Google Play metadata length limits, StoreKit pricing-source rules, margin-marker fields, product IDs, and screenshot headline completeness.
3. Run RTL/text-expansion simulator checks for high-risk locales.
4. Record native-speaker review gaps before release.

Manual QA gates are tracked in `docs/localization/manual-qa-gaps.md`. Final localized screenshots and release localization signoff remain blocked until runtime i18n, locale override, RTL handling, native review, and localized screenshot baselines exist.
