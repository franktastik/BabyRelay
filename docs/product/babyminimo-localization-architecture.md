# BabyMinimo Localization Architecture

This document supports `PBI-065 T1`. It defines the localization architecture, locale list, key naming conventions, fallback behavior, and canonical English string inventory before translation files are generated.

## Goals

- Make BabyMinimo understandable and trustworthy in supported launch languages.
- Keep app strings, App Store metadata, paywall copy, notification copy, pricing copy, screenshot headlines, widgets, and account deletion copy aligned.
- Prevent missing keys, broken interpolation, invalid metadata lengths, and misleading localized pricing.
- Support RTL layouts for Arabic and Hebrew.
- Keep StoreKit localized price values as the runtime price source.

## Supported Locales

| Locale | Language | Direction | Notes |
| --- | --- | --- | --- |
| `ar` | Arabic | RTL | High-risk RTL and text shaping QA. |
| `cs` | Czech | LTR | Text expansion QA. |
| `da` | Danish | LTR | Standard EU metadata. |
| `en` | English | LTR | Canonical source locale. |
| `et` | Estonian | LTR | Baltic locale. |
| `lt` | Lithuanian | LTR | Baltic locale. |
| `lv` | Latvian | LTR | Baltic locale. |
| `de` | German | LTR | High text-expansion risk. |
| `el` | Greek | LTR | Font coverage check. |
| `es` | Spanish | LTR | Broad storefront coverage. |
| `fi` | Finnish | LTR | High text-expansion risk. |
| `fil` | Filipino | LTR | Southeast Asia storefront copy. |
| `fr` | French | LTR | Text-expansion and App Store metadata QA. |
| `he` | Hebrew | RTL | High-risk RTL QA. |
| `hr` | Croatian | LTR | EU metadata. |
| `hu` | Hungarian | LTR | Text-expansion QA. |
| `id` | Indonesian | LTR | Southeast Asia storefront copy. |
| `it` | Italian | LTR | EU metadata. |
| `ja` | Japanese | LTR | CJK line-height and truncation QA. |
| `ko` | Korean | LTR | CJK line-height and truncation QA. |
| `ms` | Malay | LTR | Southeast Asia storefront copy. |
| `nl` | Dutch | LTR | EU metadata. |
| `nb` | Norwegian Bokmal | LTR | Nordic storefront copy. |
| `pl` | Polish | LTR | Text-expansion QA. |
| `pt` | Portuguese | LTR | Brazil/Portugal metadata variants later if needed. |
| `ro` | Romanian | LTR | EU metadata. |
| `ru` | Russian | LTR | High text-expansion risk. |
| `sk` | Slovak | LTR | EU metadata. |
| `sv` | Swedish | LTR | Nordic storefront copy. |
| `th` | Thai | LTR | Font and line-height QA. |
| `tr` | Turkish | LTR | Text casing QA. |
| `uk` | Ukrainian | LTR | High text-expansion risk. |
| `vi` | Vietnamese | LTR | Accent/font coverage QA. |
| `zh-Hans` | Simplified Chinese | LTR | CJK metadata. |
| `zh-Hant` | Traditional Chinese | LTR | CJK metadata. |

## File Architecture

Recommended future structure:

```text
src/localization/
  locales.ts
  keys.ts
  index.ts
  messages/
    en.json
    ar.json
    ...
  metadata/
    app-store.en.json
    app-store.ar.json
    ...
  pricing/
    storefront-pricing.json
  screenshots/
    screenshot-headlines.en.json
    screenshot-headlines.ar.json
    ...
scripts/localization/
  validate-locales.ts
  validate-metadata.ts
  validate-pricing-matrix.ts
```

`T297` records the architecture only. `T298` can add the initial files.

## Key Naming

Use stable dotted keys:

```text
area.screen.element.state
```

Examples:

- `auth.login.title`
- `auth.login.subtitle`
- `auth.login.appleButton`
- `onboarding.goalQuestion.title`
- `home.snapshot.lastFeed`
- `timeline.filter.growth`
- `handoff.hero.title`
- `reminders.empty.title`
- `settings.plans.title`
- `paywall.plan.annual.name`
- `notifications.reminder.title`
- `widgets.currentState.signedOut`
- `account.delete.confirmTitle`
- `errors.network.retry`
```

Rules:

- Never key by English copy.
- Avoid product names in keys unless the key is metadata-specific.
- Use interpolation variables with explicit names: `{babyName}`, `{price}`, `{period}`, `{count}`.
- Do not use positional interpolation.
- Keep platform-specific strings separate when App Store and Google Play differ.

## Fallback Behavior

Runtime fallback order:

1. exact locale, for example `pt-BR` when later added
2. language family, for example `pt`
3. English `en`

Release behavior:

- Missing keys in release scope fail tests.
- Missing interpolation variables fail tests.
- Unsupported locale falls back to English.
- Incomplete locale files are allowed only behind an explicit non-release flag.

## Pricing Localization Rule

StoreKit/App Store product values are the runtime price source.

Allowed localized strings:

- period labels, such as `per month`
- trial labels, such as `3-day free trial`
- restore/manage/cancel copy
- savings badge template, such as `Save {percent}%`

Not allowed:

- hand-authored converted prices
- static USD strings in production UI
- hardcoded localized savings badges that are not computed from StoreKit product values

## Canonical English Positioning

App Store name:

- `BabyMinimo: Baby Tracker`

Installed display name:

- `BabyMinimo`

Subtitle:

- `Feeding, sleep & diaper log`

Positioning:

- `The calm baby log for feeding, sleep, diapers, memories, and caregiver handoffs.`

Login/onboarding positioning:

- `Baby MiniMemo`
- `Tiny moments. Calm care.`
- `Coordinating baby care, one memo at a time.`
- `New family? Start your care circle`

## Canonical English String Inventory

### Auth

- `auth.login.productName`: `Baby MiniMemo`
- `auth.login.tagline`: `Tiny moments. Calm care.`
- `auth.login.hero`: `Coordinating baby care, one memo at a time.`
- `auth.login.appleButton`: `Continue with Apple`
- `auth.login.googleButton`: `Continue with Google`
- `auth.login.emailLabel`: `Household email`
- `auth.login.passwordLabel`: `Secure password`
- `auth.login.submit`: `Sign in`
- `auth.login.signupPrompt`: `New family?`
- `auth.login.signupLink`: `Start your care circle`

### Onboarding

- `onboarding.welcome.title`: `Welcome to BabyMinimo`
- `onboarding.welcome.body`: `The care coordination app for parents who finally want to get some sleep.`
- `onboarding.goalQuestion.title`: `What do you need help with first?`
- `onboarding.goalQuestion.subtitle`: `Pick the care rhythm that matters most right now.`
- `onboarding.painPoints.title`: `What feels hardest right now?`
- `onboarding.painPoints.subtitle`: `Choose anything that sounds familiar. This helps us shape your first handoff preview.`
- `onboarding.notificationPriming.title`: `Let BabyMinimo remind you gently`
- `onboarding.preview.title`: `Here is your first care preview`

### Home And Timeline

- `home.title`: `Leo's Relay`
- `home.synced`: `Synced just now`
- `home.lastFed`: `Last fed`
- `home.sleepToday`: `Sleep today`
- `home.lastDiaper`: `Last diaper`
- `home.dueNext`: `Due next`
- `timeline.title`: `Timeline`
- `timeline.filter.all`: `All Events`
- `timeline.filter.feeding`: `Feeding`
- `timeline.filter.sleep`: `Sleep`
- `timeline.filter.growth`: `Growth`
- `timeline.empty.title`: `Start your story together`

### Handoff And Care Logging

- `handoff.title`: `Handoff`
- `handoff.dueSoon`: `Due Soon`
- `handoff.latestNote`: `Latest note`
- `log.title`: `Log Event`
- `log.feeding`: `Feeding`
- `log.diaper`: `Diaper`
- `log.sleep`: `Sleep`
- `log.medication`: `Medication`
- `log.save`: `Save`

### Reminders, Family, Settings

- `reminders.title`: `Reminders`
- `reminders.add`: `Add a nudge`
- `family.title`: `Family & Household`
- `family.subtitle`: `Coordinating care together`
- `settings.title`: `Settings`
- `settings.plans`: `Plans`
- `settings.account`: `Profile & Account`
- `account.signOut`: `Sign out`

### Paywall

- `paywall.title`: `Unlock calm baby care`
- `paywall.subtitle`: `Keep feeds, sleep, diapers, memories, and handoffs in one shared place.`
- `paywall.benefit.handoff`: `Shared handoff history`
- `paywall.benefit.logs`: `Unlimited care logs`
- `paywall.benefit.reminders`: `Gentle reminders`
- `paywall.benefit.photos`: `Local photo memories`
- `paywall.benefit.caregivers`: `Caregiver coordination`
- `paywall.plan.annual.name`: `Annual`
- `paywall.plan.annual.detail`: `Best for your first year of shared baby care.`
- `paywall.plan.monthly.name`: `Monthly`
- `paywall.plan.monthly.detail`: `Flexible access for your care circle.`
- `paywall.plan.weekly.name`: `Weekly`
- `paywall.plan.weekly.detail`: `Short-term option for testing Premium.`
- `paywall.cta.trial`: `Try 3 Days Free`
- `paywall.cta.continue`: `Continue`
- `paywall.restore`: `Restore`
- `paywall.terms`: `Terms`
- `paywall.privacy`: `Privacy`

### Notifications And Widgets

- `notifications.reminder.title`: `BabyMinimo reminder`
- `notifications.reminder.body`: `{title} is due soon.`
- `widgets.currentState.ready`: `Current baby status`
- `widgets.currentState.signedOut`: `Sign in to BabyMinimo`
- `widgets.currentState.disabled`: `Widget updates are off`

### Errors

- `errors.generic.title`: `Something went wrong`
- `errors.generic.retry`: `Try again`
- `errors.network`: `Connection issue. Please try again.`
- `errors.saveFailed`: `Could not save. Please try again.`

## App Store Metadata Length Limits

Validate at minimum:

- iOS app name: 30 characters
- iOS subtitle: 30 characters
- iOS keywords: 100 characters
- promotional text: 170 characters
- short screenshot headline targets: 24-34 characters depending on layout

Current English checks:

- `BabyMinimo: Baby Tracker`: 24 characters
- `Feeding, sleep & diaper log`: 27 characters
- `newborn,feeding,sleep,diaper,baby log,baby journal,milestone,tracker,caregiver,handoff,reminder`: 95 characters

## RTL QA Requirements

Arabic and Hebrew must verify:

- auth/login
- onboarding questionnaire
- Home
- Timeline
- Handoff
- Reminders
- Family
- Settings
- Plans/Paywall
- Account
- notifications
- widgets where native support allows

Use mirrored alignment where expected, but do not mirror semantic icons that would become misleading.

## Translation QA

Process:

1. English canonical copy approved.
2. Machine translation or AI draft generated.
3. Drafts imported in batches by namespace and locale risk.
4. Automated validation for keys, interpolation, protected tokens, English leaks, length, metadata, and pricing matrix completeness.
5. AI-assisted linguistic QA or explicit owner acceptance for launch-critical locales. Native-speaker/manual review is recommended for high-risk locales and revenue/legal copy, but it is not a hard blocker when AI linguistic QA passes.
6. Simulator checks for RTL and text-expansion locales.

The flashcard-generator localization workflow is the implementation precedent. BabyMinimo should copy the same safety posture:

- use Google Translate or AI only as draft sources when owner-approved
- keep a source marker for each generated batch
- preserve brand tokens and technical/legal tokens exactly
- fail validation on missing keys, broken placeholders, and protected-token damage
- add namespace-specific English-leak checks before exposing non-English runtime locales
- use AI linguistic QA to score tone, meaning, ASO intent, cultural fit, medical/caregiver safety, and truncation risk before runtime exposure
- keep final localized screenshots blocked until runtime i18n and visual QA pass

Recommended batch order:

1. App shell, auth/login, onboarding questionnaire, and settings language controls.
2. Care logging, Home, Handoff, Timeline, and Growth Timeline.
3. Reminders, Family, widgets, notifications, account deletion, and state screens.
4. Paywall, pricing, trial, lifetime, gift, retention-offer, and metadata copy.
5. Screenshot headline/overlay localization after runtime locale QA.

High-risk locales for AI linguistic QA, visual QA, and optional native review:

- Arabic
- Hebrew
- German
- Finnish
- Russian
- Japanese
- Korean
- Simplified Chinese
- Traditional Chinese
