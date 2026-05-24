# BabyMinimo Notification System

Date: 2026-05-24

## Current Implementation

BabyMinimo uses `expo-notifications` for the local development notification slice. This is local device scheduling and app-side notification handling, not Expo Push Service.

Implemented for PBI-049:
- Permission state handling for not asked, granted, denied, and iOS provisional/ephemeral limited states.
- Local reminder notification scheduling from the Reminders screen.
- Reminder notification cancellation when a reminder is toggled off.
- Reminder notification rescheduling when a reminder is toggled back on.
- Quiet-hours delay for non-critical reminders.
- Caregiver-safe notification copy that avoids sensitive free-text notes.
- Notification deep-link metadata that routes reminder notifications to `/reminders`.

## Quiet Hours

Default quiet hours are:
- Start: `22:00`
- End: `07:00`

Non-critical reminders scheduled inside quiet hours are delayed to `07:00`.

Medication, feeding, sleep, and custom reminders currently use the same non-critical behavior in the local demo slice. A future production preferences pass should decide which reminder types can bypass quiet hours.

## Push Infrastructure Decision

The current production recommendation is hybrid and cost-aware:

1. Keep `expo-notifications` for local scheduling, permission handling, foreground handling, and notification response/deep-link behavior.
2. Use local notifications as the default for routine device-owned reminders: feeding, medication, sleep, tummy time, and household nudges created on the device.
3. Use Firebase Cloud Messaging sparingly for remote push cases that local scheduling cannot solve well.
4. On iOS, configure FCM with Apple Push Notification service credentials so Apple delivers the notification to the device.
5. Store native/Firebase push tokens, not Expo push tokens.
6. Keep Expo Push Service as an optional future migration path only if the business later chooses it.

Remote Firebase push should be reserved for:
- Cross-device household coordination updates.
- Caregiver invites and important household membership changes.
- Critical due-soon or missed-care alerts that must reach another caregiver's device.
- Account/security notices.
- Trial, plan, or subscription lifecycle notices.
- Carefully limited conversion or activation nudges.

Remote Firebase push should not be the default for every reminder because local notifications are cheaper, simpler, more private, and work without backend fan-out once scheduled.

Non-critical conversion or activation nudges must respect:
- explicit user notification preferences
- opt-out
- quiet hours
- rate limits
- caregiver-safe copy
- no sensitive free-text notes

Do not call `getExpoPushTokenAsync` for the production path. Production token registration should use the native/Firebase token path introduced in PBI-061.

Do not add APNs keys, FCM server keys, EAS credentials, or production notification fan-out in the local demo phase.

Cost boundary:
- FCM itself is a Firebase no-cost product.
- APNs does not have a separate usage bill, but App Store/TestFlight distribution requires Apple Developer Program membership.
- Real production cost can still come from Firebase Functions, Firestore token storage, logs, egress, backups, Auth behavior, and store fees.

## Remaining Production Work

- Store notification preferences per household/caregiver.
- Add local-vs-remote routing policy for each notification use case.
- Add backend scheduling or fan-out for household coordination updates.
- Add rate limits and opt-out handling for conversion/activation push.
- Add notification delivery logs with TTL.
- Add Firebase/Apple production push credentials through an approved secrets workflow.
- Add manual QA for iOS notification permission prompts on a clean simulator/device.
