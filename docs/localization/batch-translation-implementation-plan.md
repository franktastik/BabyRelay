# BabyMinimo Batch Translation Implementation Plan

This plan closes GoalBuddy `T337` and translates the proven `/Users/frank/flashcard-generator` localization workflow into BabyMinimo.

## Target Outcome

BabyMinimo should support all requested locales through runtime i18n, batched translation imports, AI linguistic QA, automated validation, and simulator visual QA before localized screenshots or release metadata are treated as final.

Human/native review is recommended for high-risk locales and revenue/legal copy, but it is not a hard release blocker when AI linguistic QA, automated checks, and visual QA pass.

## Runtime Architecture

Implement runtime i18n with:

- `i18next`
- `react-i18next`
- `expo-localization`
- a BabyMinimo locale registry
- exact-locale to language-family to English fallback
- manual dev/test language override
- guarded runtime exposure based on locale status

English remains canonical. Non-English locales should start as `draft_requires_ai_linguistic_qa`, then move to one of:

- `ai_linguistic_qa_passed`
- `owner_accepted`
- `native_reviewed`

Only accepted statuses should be eligible for release runtime exposure. Local/dev override may expose draft locales for QA.

## Batch Order

1. App shell, login/auth, onboarding questionnaire, and settings language controls.
2. Care logging, Home, Handoff, Timeline, and Growth Timeline.
3. Reminders, Family, widgets, notifications, account deletion, and state screens.
4. Paywall, pricing, trial, lifetime, gift, retention-offer, and store metadata copy.
5. Screenshot headline and App Store creative overlay localization after runtime QA.

## Translation Sources

Allowed draft sources:

- Google Translate
- AI translation draft
- owner edit
- human translator

Every generated batch must record a source marker. Machine translation is acceptable as a draft source, but it must pass validation and AI linguistic QA before runtime release exposure.

## Validation Gates

Required automated checks:

- locale/file completeness
- key parity against English
- interpolation placeholder parity
- protected-token preservation
- metadata length limits
- StoreKit runtime price-source guard
- PPP/above-floor pricing marker completeness
- screenshot headline completeness
- namespace-level English-leak checks after translation import

Protected tokens:

- `BabyMinimo`
- `Baby MiniMemo`
- `StoreKit`
- `App Store`
- `Firebase`
- product IDs
- URLs
- interpolation placeholders such as `{title}`

## AI Linguistic QA

AI QA should score each locale/batch for:

- meaning preservation
- newborn-care tone
- caregiver safety
- ASO search intent
- cultural fit
- medical/legal overclaim risk
- truncation risk
- RTL or text-expansion risk

AI QA output should be stored as a receipt, not as a hidden assumption.

## Visual QA

Runtime QA must include:

- English smoke check
- Arabic and Hebrew RTL check
- German, Finnish, and Russian text-expansion check
- Japanese, Korean, Simplified Chinese, and Traditional Chinese line-height/compact-copy check

Final localized screenshots remain blocked until runtime i18n, locale override, AI linguistic QA or owner acceptance, and visual QA evidence exist.

## GoalBuddy Continuation

After `T337`, execute:

- `T338`: runtime i18n foundation
- `T339`: batch translation import tooling
- `T340`: first low-risk runtime batch
- `T341`: remaining runtime strings
- `T342`: locale visual QA

Production Firebase and App Store Connect tasks remain queued after local/non-production localization work.
