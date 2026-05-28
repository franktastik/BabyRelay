# BabyMinimo Multi-Baby And Activity Plan

## Multi-Baby Policy

One household can own multiple baby profiles. Twins, triplets, and siblings should stay in the same household instead of forcing separate accounts or separate households.

Default behavior:

- Home, Timeline, Handoff, Quick Log, Reminders, Growth Timeline, widgets, and local cleanup are scoped to the selected baby.
- The selected baby is stored locally in Zustand and mirrored to the Firebase Emulator user/household documents.
- Adding another baby is local/emulator-safe and uses the existing `babies` collection.
- All-babies aggregation is deferred until it has a clear product reason and visual design.

## Current Non-Production Implementation

- Home opens a baby switcher from the baby identity header.
- The baby switcher lists household babies, marks the selected baby, and can add another baby.
- The baby switcher is centered away from the Dynamic Island/status area so title and helper copy do not collide with the top device chrome.
- Newly added babies become the selected baby immediately.
- Reminders and local care views use `selectedBabyId`.
- Handoff display uses the selected baby name when local baby data is available.

## Activity And Habit Tracker Policy

BabyMinimo activity tracking is a gentle care-rhythm surface, not a punitive streak system.

Local activity items are scoped to the selected baby and cover:

- care event logged
- reminder created
- Growth Timeline moment added
- Handoff viewed
- baby selected
- baby profile added

Retention is intentionally bounded to the latest 120 local activity items so the feature does not become an unbounded local history store.

The current local implementation uses:

- `src/features/activity/activityModel.ts` for typed activity items, summaries, retention, and relative age labels.
- `src/stores/activityStore.ts` for the local in-memory activity recorder.
- `app/(settings)/activity.tsx` for the Activity Rhythm screen under Settings, not as a new primary tab.

The Activity Rhythm screen summarizes today's activity, care-log count, reminder count, and the latest touchpoint for the selected baby. It is intentionally supportive and avoids streak, score, or guilt language.

## Production Boundaries

- Firestore security rules must later enforce household membership for listing, adding, and selecting babies.
- Production data migration is not needed for the local demo because the model already supports `Household 1..* Baby`.
- Production analytics and billing must not infer plan seats from baby count until pricing policy explicitly allows it.
- Remote analytics export for activity rhythm is deferred until consent, privacy, and production analytics scope are explicitly approved.
- Activity data should remain scoped to selected-baby care rhythm unless a later PBI designs an all-babies household overview.

## Screenshot Planning

App Store screenshots are deferred until production tickets are resolved. If multi-baby support remains in scope for screenshots, capture a single source-accurate screen that shows a calm switcher for twins/triplets without implying Family plan purchase is required.

If Activity Rhythm remains in the App Store screenshot set, it should be captured only after production Firebase, App Store Connect, and final visual baselines are resolved. Do not generate final App Store screenshots from the current local prototype.
