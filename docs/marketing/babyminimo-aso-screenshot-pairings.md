# BabyMinimo ASO Screenshot Pairings

This document supports `PBI-063 T3`. It pairs the working ASO benefit candidates with current source screenshots and identifies where retakes or product decisions are required before final App Store screenshot generation.

## Pairing Status

Status: planning-ready, generation-blocked.

These pairings are good enough to guide retakes and manifest planning. Final generated screenshots should not be accepted until:
- Product owner confirms the headline order.
- Final source screenshots are retaken or approved.
- Paywall/gifting screenshots are validated against real StoreKit/App Store behavior.
- Localized screenshot generation gates from PBI-065 are resolved for non-English outputs.

## Primary Pairings

| Order | Benefit headline | Source screenshot | Current rating | Pairing decision |
| --- | --- | --- | --- | --- |
| 1 | KNOW WHAT HAPPENED LAST | `docs/product/implementation-screenshots/handoff-t020-smoke.png` | Usable | Lead screenshot candidate. Retake with clean status bar, final icon set, and final copy. |
| 2 | LOG FEEDS, SLEEP, AND DIAPERS | `docs/product/implementation-screenshots/quick-log-t020-smoke.png` plus core log modal retakes | Usable | Use a Log Event or quick-log source that clearly shows feeding, diaper, and sleep options without visual clutter. |
| 3 | SEE THE FULL DAY AT A GLANCE | `docs/product/implementation-screenshots/timeline-t020-smoke.png` | Great | Strongest current source. Shows Timeline merging Growth and care events. |
| 4 | REMEMBER TINY PHOTO MOMENTS | `docs/product/implementation-screenshots/timeline-growth-filter-t017.png` or `docs/product/implementation-screenshots/timeline-after-add-moment-t017.png` | Usable | Use after final Growth Timeline photo/copy is approved. |
| 5 | SHARE CARE WITH YOUR HOUSEHOLD | `docs/product/implementation-screenshots/family-household-t018.png` | Usable | Strong feature fit, but retake to avoid bottom clipping and make the household benefit visible at thumbnail size. |
| 6 | STAY READY WITH GENTLE REMINDERS | `docs/product/implementation-screenshots/reminders-t018.png` | Usable | Retake with the reminder list emphasized over the creation form. |

## Optional Premium / Monetization Pairings

| Benefit headline | Source screenshot | Include at launch? | Decision |
| --- | --- | --- | --- |
| UNLOCK CALM BABY CARE | `docs/testing/screenshots/pbi-064/paywall-prototype.jpg` or a fresh Plans/Paywall capture | Maybe | Include only after StoreKit/TestFlight validates product IDs, display prices, trial terms, restore/legal copy, and purchase CTA behavior. |
| GIFT CALM CARE TO FAMILY | No accurate in-app source yet | No for current local/demo scope | Do not generate this screenshot until gifting or subscription-for-someone is implemented or explicitly positioned as a future waitlist/marketing concept. |

## Retake Shot List

1. Handoff current state: baby status, last feed, diaper, sleep, health/current state, due soon, latest note.
2. Care logging: polished Log Event or Quick Log state with feed/diaper/sleep/medication visible.
3. Timeline: mixed Growth + feeding + diaper events, no empty state.
4. Growth Timeline: image-forward local moment state with caption and local-only positioning if shown.
5. Family & Household: coordination card plus caregivers, no bottom nav clipping.
6. Reminders: active nudges visible; creation form should not dominate.
7. Plans/Paywall: only after StoreKit copy and product display prices are verified.

## Manifest Draft

The final manifest should use this shape:

```json
[
  {
    "locale": "en",
    "order": 1,
    "benefit": "KNOW WHAT HAPPENED LAST",
    "sourceScreenshot": "docs/product/implementation-screenshots/handoff-t020-smoke.png",
    "sourceRating": "usable",
    "requiresRetake": true,
    "generationStatus": "blocked_pending_final_source"
  }
]
```

Do not generate final framed App Store assets until every selected source row is either `great` or explicitly accepted by the product owner.
