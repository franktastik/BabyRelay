# BabyMinimo ASO Benefit Discovery

This document supports `PBI-063 T1` and follows the `aso-appstore-screenshots` skill framework for benefit discovery. It is a planning artifact only; it does not create App Store Connect assets or production listings.

## App Context

App name: BabyMinimo

Store name direction: BabyMinimo: Baby Tracker

Positioning: The calm baby log for feeding, sleep, diapers, memories, and caregiver handoffs.

Target audience:
- Tired parents of newborns and infants.
- Partners who trade care shifts and need to know what happened last.
- Caregivers, grandparents, and household helpers who need a simple shared view.
- Parents who want baby memories captured without making cloud photo sync a v1 requirement.

Product hierarchy:
1. Shared handoff.
2. Care logging.
3. Reminders.
4. Growth Timeline.
5. Plans, widgets, and household coordination.

## What The App Lets Users Do

Current implemented local/demo flows support:
- Email/password signup and login through Firebase Emulator.
- Questionnaire-style onboarding and baby setup.
- Home current-state summary with quick actions.
- Quick logging for breastfeeding, bottle, diaper, sleep, and medication.
- Timeline filters for care and Growth Timeline moments.
- Local-only Add Moment flow for baby photo memories.
- Handoff screen for overnight/current-state review.
- Reminders and local notification planning.
- Family & Household coordination.
- Settings, Plans/Paywall, Account, Widgets settings, and sign out.

Production-dependent or deferred:
- StoreKit purchase/selection flow.
- Production Firebase rules/security/deployment.
- Final localized runtime i18n.
- Production push notification fan-out.
- Final App Store screenshot generation.

## Recommended Core Benefits

These are draft screenshot headline candidates. They use action-led language and focus on what a parent gets, not the implementation details.

1. KNOW WHAT HAPPENED LAST
   - Why it drives downloads: It states BabyMinimo's primary promise in the most urgent parent language. This should be the first screenshot because it answers the handoff problem instantly.

2. LOG FEEDS, SLEEP, AND DIAPERS
   - Why it drives downloads: It covers the highest-intent baby tracker keywords and shows that BabyMinimo is useful even before household sharing is considered.

3. SEE THE FULL DAY AT A GLANCE
   - Why it drives downloads: Timeline screenshots can show rich proof that the app organizes scattered care moments into one calm view.

4. REMEMBER TINY PHOTO MOMENTS
   - Why it drives downloads: This adds emotion and differentiates BabyMinimo from purely clinical trackers while keeping Growth Timeline secondary.

5. SHARE CARE WITH YOUR HOUSEHOLD
   - Why it drives downloads: It frames Family as coordination, not seats, and speaks to partners/caregivers.

6. STAY READY WITH GENTLE REMINDERS
   - Why it drives downloads: It makes reminders feel calm and supportive, not productivity-heavy.

7. UNLOCK CALM BABY CARE
   - Why it drives downloads: This is the premium/paywall benefit headline for Plans screenshots. It should only be used when the screenshot clearly shows benefit-led premium value, not a bare price table.

## Recommended Screenshot Set

Primary 6-screen set:

| Order | Benefit headline | Best app state to show | Notes |
| --- | --- | --- | --- |
| 1 | KNOW WHAT HAPPENED LAST | Handoff or Home current-state summary | Lead with the core promise. Use a rich, non-empty state. |
| 2 | LOG FEEDS, SLEEP, AND DIAPERS | Quick log / Log Event | Demonstrates baby tracker keyword intent. |
| 3 | SEE THE FULL DAY AT A GLANCE | Timeline with mixed care events | Avoid empty Timeline states for the main listing. |
| 4 | REMEMBER TINY PHOTO MOMENTS | Growth Timeline / Add Moment | Shows local photo memory value without making it a tab. |
| 5 | SHARE CARE WITH YOUR HOUSEHOLD | Family & Household | Shows caregivers and plan coordination. |
| 6 | STAY READY WITH GENTLE REMINDERS | Reminders | Useful if the screen is populated with realistic nudges. |

Optional 7th or 8th screenshots:
- UNLOCK CALM BABY CARE: Plans/Paywall, only after StoreKit/TestFlight copy is validated.
- GIFT CALM CARE TO FAMILY: future gifting/subscription-for-someone concept, only after gifting exists or is explicitly framed as coming soon and allowed by store policy.

## Screens To Avoid As Primary ASO Screenshots

- Login/signup screens unless used only for brand story, because they do not prove core value.
- Empty states unless the screenshot specifically sells onboarding simplicity.
- Settings/account screens except as support material.
- Debug/emulator states, warning banners, low-battery status bars, or simulator chrome.
- Paywall-only screenshots before StoreKit copy and pricing are validated.

## Confirmation Gate

The ASO skill normally requires owner confirmation before screenshot pairing and final generation. For GoalBuddy execution, these benefits are approved as working candidates for T303 screenshot grading, but final App Store screenshot generation should remain gated until the product owner confirms the final headline order and paywall/gifting inclusion.
