# BabyMinimo Localization Manual QA Gaps

This document supports `PBI-065 T5`. It records what is still required before localized app UI, metadata, pricing copy, and App Store screenshots can be considered release-ready.

## Current Gate

Status: blocked for non-English runtime visual acceptance.

The current localization package is a planning scaffold. English is canonical, while non-English files are draft placeholders that intentionally mirror English until translation and native review are complete.

Runtime limitations:
- The app does not yet load localized string bundles.
- The simulator does not yet expose a dev/test locale override.
- Arabic and Hebrew RTL layout behavior is not wired.
- StoreKit localized prices are not available in the local emulator-only build.
- Approved localized screenshot baselines do not exist yet.

## Required Manual QA Before Release

Each supported locale needs:
- Native-speaker review for app strings, onboarding, notification copy, paywall copy, pricing copy, account deletion copy, and metadata.
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
- A dev/test locale override exists for simulator QA.
- RTL layout is implemented and verified for Arabic and Hebrew.
- Non-English translations are reviewed or explicitly accepted by the product owner.
- StoreKit localized display prices are verified in sandbox/TestFlight for enabled products.
- Visual baselines are captured for localized screenshot states.

## Non-Blocking Work

The following can continue before final translation:
- English ASO benefit discovery.
- English screenshot storyboard planning.
- Screenshot manifest structure.
- Pricing experiment copy structure.
- Metadata validation scripts.
- Translation vendor/native-review workflow planning.
