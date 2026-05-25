# BabyMinimo Localization Draft Assets

These files support `PBI-065 T2`.

The current localization package is a planning and QA scaffold, not final AI-reviewed or owner-accepted translation content.

## Contents

- `locales.json`: supported locale list, language names, text direction, and review status.
- `app-strings/*.json`: canonical English app string inventory mirrored into each supported locale file.
- `metadata/*.json`: App Store / Google Play metadata drafts per supported locale.
- `pricing/*.json`: paywall, billing-period, trial, restore, savings, and cancellation copy per supported locale.
- `pricing/storefront-pricing-matrix.json`: StoreKit-centered pricing product matrix and per-locale storefront template with cost-floor markers.
- `screenshots/*.json`: localized screenshot headline inputs per supported locale.
- `batch-translation-implementation-plan.md`: runtime i18n, batch translation, AI linguistic QA, and visual QA implementation plan.
- `translation-receipts/*.json`: generated batch translation manifests and samples when draft imports run.

## Review Status

- `en` is canonical.
- Every non-English locale remains `draft_requires_ai_linguistic_qa`.
- Draft files may contain Google Translate or AI-generated copy, but that content is not release-ready until AI linguistic QA, owner acceptance, or optional native review is performed.

This avoids presenting unreviewed machine translation as production-ready copy.

## Batch Translation Plan

BabyMinimo should follow the localization approach proven in `/Users/frank/flashcard-generator`: use i18n for runtime strings, generate translations in batches, and treat Google Translate or AI output as draft content until validation and review pass.

Batch order:

1. App shell, auth/login, onboarding questionnaire, and settings language controls.
2. Care logging, Home, Handoff, Timeline, and Growth Timeline.
3. Reminders, Family, widgets, notifications, account deletion, empty/loading/error states.
4. Paywall, pricing, trial, lifetime, gift, retention-offer, and metadata copy.
5. Screenshot headlines and App Store creative overlays after runtime locale QA.

Every batch must produce:

- machine-translation source marker, such as Google Translate, AI draft, human translator, or owner edit
- protected-token report for `BabyMinimo`, `Baby MiniMemo`, product IDs, URLs, legal names, interpolation placeholders, and platform terms
- placeholder/interpolation parity report
- namespace-level English-leak report
- AI linguistic QA status, explicit owner acceptance status, or optional native-review status
- simulator visual evidence before a locale is considered runtime-ready

## Batch Translation Command

Use the draft importer for machine-generated translation batches:

```sh
bun run localization:translate:draft -- --locales de,fr --sections app-strings --write
```

The command:

- reads English source files from `docs/localization/<section>/en.json`
- translates leaf strings with key context
- restores protected tokens such as `BabyMinimo`, `Baby MiniMemo`, `StoreKit`, `App Store`, and `{placeholders}`
- keeps target files in `draft_requires_ai_linguistic_qa`
- writes a receipt under `docs/localization/translation-receipts/`

Run without `--write` only to test the pipeline and generate a dry-run receipt. Network translation must be approved before execution in agent sessions.

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
4. Record AI linguistic QA, owner-acceptance, and optional native-speaker review gaps before release.

QA gates are tracked in `docs/localization/manual-qa-gaps.md` and the latest judge note is `docs/goals/babyminimo-emulator-hardening/notes/T342-locale-visual-qa.md`. Final localized screenshots and release localization signoff remain blocked until a full simulator locale override, RTL handling, AI linguistic QA or owner acceptance, StoreKit localized price verification, and localized screenshot baselines exist. Native-speaker review is recommended for high-risk locales and revenue/legal copy, but it is not a hard blocker when AI linguistic QA passes.
