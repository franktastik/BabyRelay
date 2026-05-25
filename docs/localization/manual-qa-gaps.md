# BabyMinimo Localization QA Gaps

This document supports `PBI-065 T5`. It records what is still required before localized app UI, metadata, pricing copy, and App Store screenshots can be considered release-ready.

## Current Gate

Status: blocked for non-English release visual acceptance.

English is canonical. Non-English files now contain machine-translated draft app strings, metadata, pricing copy, and screenshot headline inputs, but they remain `draft_requires_ai_linguistic_qa` until AI linguistic QA, owner acceptance, or optional native review is complete.

Runtime limitations:
- The app loads English by default and has a guarded German draft QA runtime path for the first runtime batch.
- The app does not yet expose a startup-level dev/test locale override that can force any supported locale across all routes.
- Arabic and Hebrew draft assets exist, but RTL layout direction/mirroring is not wired.
- StoreKit localized prices are not available in the local emulator-only build.
- Approved localized screenshot baselines do not exist yet.

## Required Localization QA Before Release

Each supported locale needs:
- AI linguistic QA or explicit owner acceptance for app strings, onboarding, notification copy, paywall copy, pricing copy, account deletion copy, and metadata.
- Optional native-speaker review for high-risk locales, App Store metadata, revenue/legal copy, and any locale where AI QA flags uncertainty.
- App Store metadata review for app name/subtitle/description/keywords within platform limits.
- Pricing review against StoreKit/App Store Connect product display prices, not static converted values.
- Screenshot headline review for clarity, emotional fit, truncation risk, and ASO intent.
- Simulator pass with runtime locale forced.
- Scrollable-screen coverage where the approved reference requires top, middle, or bottom states.

## High-Risk Locale Queue

Run these before broad localized screenshot generation:

| Priority | Locale | Risk | Required checks |
| --- | --- | --- | --- |
| 1 | `ar` | RTL, shaping, line wrapping | Auth, onboarding, Home, Timeline, Handoff, Reminders, Settings, Plans/Paywall, Account |
| 1 | `he` | RTL, icon mirroring, alignment | Auth, onboarding, Home, Timeline, Handoff, Reminders, Settings, Plans/Paywall, Account |
| 2 | `de` | Long compound words | Buttons, cards, tab labels, paywall rows, App Store screenshots |
| 2 | `fi` | Text expansion | Onboarding questions, reminders, paywall rows, settings rows |
| 2 | `ru` | Text expansion and font coverage | Form labels, timeline cards, metadata fields |
| 3 | `ja` | CJK line height | Headers, compact cards, screenshot captions |
| 3 | `ko` | CJK line height | Headers, compact cards, screenshot captions |
| 3 | `zh-Hans` | CJK compact copy | Metadata, screenshot captions, paywall rows |
| 3 | `zh-Hant` | CJK compact copy | Metadata, screenshot captions, paywall rows |

## Release Blockers

Do not proceed to final localized ASO screenshots or release localization signoff until:
- Runtime i18n wiring exists in the app.
- A dev/test locale override exists for full simulator QA across all supported locales.
- RTL layout is implemented and verified for Arabic and Hebrew.
- Non-English translations pass AI linguistic QA or are explicitly accepted by the product owner.
- StoreKit localized display prices are verified in sandbox/TestFlight for enabled products.
- Visual baselines are captured for localized screenshot states.

## Non-Blocking Work

The following can continue before final translation:
- English ASO benefit discovery.
- English screenshot storyboard planning.
- Screenshot manifest structure.
- Pricing experiment copy structure.
- Metadata validation scripts.
- Translation vendor, AI linguistic QA, and optional native-review workflow planning.
