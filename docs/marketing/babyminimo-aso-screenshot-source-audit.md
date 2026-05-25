# BabyMinimo ASO Screenshot Source Audit

This document supports `PBI-063 T2`. It grades existing BabyMinimo simulator and QA screenshots as source material for future App Store screenshot generation.

Rating key:
- Great: strong enough to pair with a benefit after final status-bar/device-frame preparation.
- Usable: demonstrates the benefit, but needs retake, crop, data polish, copy check, or final framing before generation.
- Retake: should not be used for App Store creative in its current form.

## Source Inventory

Approved visual references:
- `docs/product/superdesign-reference-assets/screenshots1/`

Current implementation/runtime screenshots:
- `docs/product/implementation-screenshots/`
- `docs/qa/screenshots/`
- `docs/testing/screenshots/`
- `docs/goals/babyminimo-emulator-hardening/notes/T300-english-smoke.png`

Current implementation screenshots are generally full simulator captures at `1206x2622`, while approved mockup references are cropped around `346x730`. Final ASO generation must normalize source crops and device framing rather than mixing these formats directly.

## Candidate Screenshot Ratings

| Benefit | Source screenshot | Rating | Assessment |
| --- | --- | --- | --- |
| KNOW WHAT HAPPENED LAST | `docs/product/implementation-screenshots/handoff-t020-smoke.png` | Usable | Strongest direct match for the handoff promise. Rich current-state cards and latest note are visible. Retake with clean 9:41-style status bar, final icons, and final copy before generation. |
| LOG FEEDS, SLEEP, AND DIAPERS | `docs/product/implementation-screenshots/quick-log-t020-smoke.png` or core log modal captures | Usable | Demonstrates care logging, but chooser/modals are more functional than emotional. Retake a polished Log Event screen with realistic content and no bottom clipping. |
| SEE THE FULL DAY AT A GLANCE | `docs/product/implementation-screenshots/timeline-t020-smoke.png` | Great | Strong visual hierarchy with Growth card plus feeding/diaper events. Good proof that Timeline merges memories and care. Retake only if final approved source needs a different baby photo or status-bar normalization. |
| REMEMBER TINY PHOTO MOMENTS | `docs/product/implementation-screenshots/timeline-growth-filter-t017.png` or `timeline-after-add-moment-t017.png` | Usable | Good fit for Growth Timeline, but should use the final local-photo story and approved image crop before ASO generation. |
| SHARE CARE WITH YOUR HOUSEHOLD | `docs/product/implementation-screenshots/family-household-t018.png` | Usable | Clearly shows household coordination, plan, members, and invite. Retake because the bottom invitation area is clipped by the nav/action button and the app name/plan copy should be final. |
| STAY READY WITH GENTLE REMINDERS | `docs/product/implementation-screenshots/reminders-t018.png` | Usable | Shows active nudges and toggles. Retake with a cleaner state that emphasizes reminders without a blank input form competing with the list. |
| UNLOCK CALM BABY CARE | `docs/testing/screenshots/pbi-064/paywall-prototype.jpg` or `docs/goals/babyminimo-emulator-hardening/notes/T300-english-smoke.png` | Usable, gated | Visually aligned with the proposed paywall and includes annual/monthly/weekly rows. Must be retaken after StoreKit/TestFlight copy, price display, restore/legal copy, and purchase CTA behavior are validated. |

## Screens To Exclude From Primary ASO Set

| Source | Rating | Reason |
| --- | --- | --- |
| Login/signup screenshots | Retake/exclude | Useful for brand QA, but not strong App Store conversion proof because they show access gates instead of product value. |
| Onboarding-only screenshots | Retake/exclude | Can support a later onboarding story, but primary ASO should show the working app. |
| Settings/account screenshots | Retake/exclude | Operational, low conversion value. Use only for privacy/support documentation if needed. |
| Empty-state screenshots | Retake/exclude | Current launch screenshots should sell active care coordination, not emptiness. |
| `docs/goals/.../T300-english-smoke.png` | Usable only for paywall proof | It is a live smoke screenshot, not a polished ASO source. |

## Retake Requirements Before Pairing

Before T303 can be treated as release-green:
- Set a clean status bar/time consistently across source captures.
- Capture in one consistent device target for the App Store set.
- Use realistic populated demo data with no debug, emulator, warning, or keyboard overlays.
- Avoid clipped bottom controls and make scrollable-screen coverage explicit.
- Retake Family and Reminders with the strongest benefit visible above the fold.
- Retake Plans/Paywall only after production StoreKit product copy and display prices are validated or clearly marked as prototype.
- Keep approved `screenshots1/` visual direction as the source of truth for layout, but do not use the raw reference screenshots as final ASO source captures.

## Working Pairing Direction

Recommended next pairing candidates for T304:
1. KNOW WHAT HAPPENED LAST -> Handoff current-state screenshot.
2. LOG FEEDS, SLEEP, AND DIAPERS -> Log Event/Quick Log screenshot.
3. SEE THE FULL DAY AT A GLANCE -> Timeline mixed care + growth screenshot.
4. REMEMBER TINY PHOTO MOMENTS -> Growth Timeline/Add Moment screenshot.
5. SHARE CARE WITH YOUR HOUSEHOLD -> Family & Household screenshot.
6. STAY READY WITH GENTLE REMINDERS -> Reminders screenshot.
7. UNLOCK CALM BABY CARE -> Paywall/Plans screenshot, gated on StoreKit validation.
