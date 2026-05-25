# T300 Judge Receipt: Localization Simulator Smoke And Visual Gate

Date: 2026-05-25

## Scope

T300 covers PBI-065 T4: run simulator smoke/visual checks for English plus RTL and text-expansion representative locales.

## Result

Decision: partial accept with blocked runtime-locale visuals.

English simulator smoke passed. The browser-hosted iOS simulator and the booted iOS simulator were reachable, and the current BabyMinimo runtime displayed an English paywall screen without a red screen or loading failure.

Evidence:
- `docs/goals/babyminimo-emulator-hardening/notes/T300-english-smoke.png`
- `curl -I http://127.0.0.1:41737/`
- `curl -I "http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0"`
- `curl -I http://127.0.0.1:4000/auth`

## Blocked Checks

RTL and text-expansion simulator visual checks cannot be accepted yet because PBI-065 currently provides documentation and draft localization assets only. The app does not yet expose a runtime locale switch, loaded translation bundle, RTL layout toggle, or accepted translated strings for non-English UI.

Blocked locale groups:
- RTL: Arabic (`ar`), Hebrew (`he`)
- High text expansion: German (`de`), Finnish (`fi`), Russian (`ru`)
- CJK/compact layout: Japanese (`ja`), Korean (`ko`), Simplified Chinese (`zh-Hans`), Traditional Chinese (`zh-Hant`)

## Follow-Up Required

Before final localized screenshot generation or release QA:
- Implement runtime i18n wiring for app strings.
- Add a dev/test locale override that can force each supported locale in simulator.
- Add RTL layout handling for Arabic and Hebrew.
- Replace machine-draft translations with accepted/native-reviewed copy.
- Capture top/middle/bottom screenshots for scrollable localized screens where applicable.
- Run strict screenshot comparison only after approved localized baselines exist.
