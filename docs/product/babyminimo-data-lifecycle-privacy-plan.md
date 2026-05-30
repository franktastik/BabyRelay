# BabyMinimo Data Lifecycle And Privacy Plan

This document supports PBI-057. It defines the local/emulator-safe lifecycle contract before any production Firebase, App Store, or destructive backend work starts.

## Data Classes

| Data class | Current storage | Release intent | Privacy rule |
| --- | --- | --- | --- |
| Auth session | Firebase Auth Emulator in local dev | Firebase Auth in production | Clear local session on sign out; require reauth before account deletion. |
| User profile | Zustand/demo state, future Firestore `users` | Shared identity profile | Do not leave email/name in widget payloads, logs, or screenshots unless explicitly part of account UI evidence. |
| Household membership | Firestore Emulator in local dev | Firestore membership documents | Never delete another caregiver's valid household data from the client. Backend policy owns last-admin and ownership transfer cases. |
| Baby profile | Firestore Emulator in local dev | Firestore baby documents | Keep baby name in app and widget snapshot; avoid IDs in visible copy. |
| Care events | Firestore Emulator plus local demo state | Firestore events | Event notes stay inside app screens; widget payloads must not include free-text notes. |
| Reminders | Local/demo and emulator-backed flows | Firestore reminders plus local notifications | Notification copy stays caregiver-safe and avoids private free-text details. |
| Growth Timeline photos | Local device only in v1 | Local file system only in v1 | Never upload photos in v1; local cleanup must remove metadata and local files when deletion/reset is requested. |
| Growth Timeline metadata | Local SQLite/demo store in v1 | Local SQLite in v1 | Local-only; delete on device cleanup/account deletion. |
| Growth Timeline media backup manifests | Local/demo export payload in v1 | User-created local archive manifest | Manifest records local media pointers and captions for backup/export; it is not uploaded or retained by BabyMinimo cloud services in v1. |
| Growth album exports | Deferred local/demo artifact | User-created local PDF/image pages in v1 | Treat generated albums as user-created local artifacts; do not upload or retain export archives in cloud without a separate lifecycle/purge policy. |
| Widget snapshots | Expo Widgets/native local snapshot | Local app group/widget storage | Disable, sign out, and account deletion must blank or clear widget data. |
| Analytics events | Local internal buffer in demo | Future analytics provider | No sensitive notes, image URIs, account secrets, or raw household/member IDs. Provide opt-out policy before production analytics. |
| Billing/subscription state | Deferred | StoreKit plus backend-authoritative entitlements | Production-only; not controlled by Remote Config or client-only state. |

## Sign-Out Contract

Local/emulator behavior:
- Sign out clears the auth store and returns to the auth flow.
- Sign out blanks the widget snapshot before navigation completes.
- Sign out does not delete shared household records, care events, reminders, or local Growth Timeline files.
- Cached/demo data can remain available only as generic seeded demo data; it must not expose the signed-out user's private identifiers.

Production requirements:
- Invalidate or unregister push tokens when remote push is enabled.
- Clear analytics identity or switch to anonymous state.
- Clear any persisted account profile cache.
- Preserve shared household data unless the user explicitly deletes their account or leaves a household.

## Account Deletion Contract

Account deletion is owned by PBI-056. The local/emulator-safe UI and device cleanup can ship before production Firebase/App Store readiness; irreversible production cloud deletion remains gated to the backend purge task.

- Require explicit confirmation and provider-specific reauthentication.
- Backend cleanup must run before Firebase Auth user deletion when possible.
- Backend cleanup must remove or anonymize user-scoped data and household membership.
- Last-admin or last-owner household cases must be blocked or handled by a documented transfer/deletion policy.
- Local cleanup must remove auth/session state, local Growth Timeline metadata/photos, widget snapshots, notification schedules, and analytics identity.
- If backend cleanup fails, record a retry-safe deletion state instead of silently deleting Auth only.

Local/emulator behavior implemented before production:
- Account settings may expose a delete-account entry only when the UI clearly explains that production cloud deletion is not yet enabled.
- The local confirmation requires the caregiver to type `DELETE` and enter their password before cleanup.
- The app signs out of the Firebase Emulator session, clears local identity surfaces, blanks widgets, cancels local reminders, resets analytics, clears local care-event caches, clears local Growth Timeline metadata, and resets widget settings.
- Shared household, baby profile, membership, care-event, and reminder authority remains backend-owned. The local client must not delete another caregiver's valid household data.

Production-gated behavior:
- Real Firebase Auth account deletion.
- Backend purge callable/Function.
- Firestore security rule coverage for membership, ownership, last-admin, and retry-safe deletion states.
- Production push token invalidation and App Store entitlement cleanup where applicable.

## Backend Purge Callable Contract

`PBI-056 T3` now has a local typed contract in `src/features/privacy/accountDeletionBackendPurge.ts` and a callable wrapper named `requestAccountDeletionPurge` in `src/lib/firebase/callables.ts`.

The contract requires:
- a signed-in, non-anonymous Firebase UID
- recent reauthentication before purge planning
- server-only purge actions before Firebase Auth deletion
- last-household-owner blocking when other household members remain
- last-admin-without-owner blocking when deleting that admin would orphan household authority
- retry-safe deletion state if backend cleanup fails
- local cleanup after backend purge succeeds

Server-owned purge actions:
- create a deletion request record
- anonymize user profile data
- remove the user's household memberships without deleting other caregivers' data
- invalidate push devices
- detach billing identity from the account deletion surface
- delete the Firebase Auth user only after backend cleanup completes

Firestore rule contract:
- clients must not create authoritative deletion request records
- clients must not bulk-delete household memberships through account deletion
- clients must not delete billing or entitlement records
- clients must not delete another caregiver's data

Current limitation:
- The deployable Cloud Function and `firestore.rules` implementation remain blocked until a GoalBuddy task explicitly allows `functions/**` and `firestore.rules`. This task added the local callable contract, tests, and documentation only; it did not perform a production deploy.

## Local Growth Timeline Cleanup

Cleanup must:
- Delete local Growth Timeline SQLite metadata for the selected user/baby scope.
- Delete local image files created by the app for Growth Timeline.
- Leave bundled demo/reference assets intact.
- Never attempt to delete cloud storage for Growth Timeline v1 because v1 photos are local-only.

## Local Growth Timeline Media Durability

Growth Timeline display should be metadata-driven:
- Timeline metadata stores caption, moment type, occurred time, baby ID, and a pointer to an app-local image file or bundled demo asset.
- The UI should prefer an app-local thumbnail/file URI when available, fall back to approved bundled demo assets for seeded demo records, and show a calm missing-media state when no durable pointer exists.
- User-selected images should be copied into an app-controlled local media directory before the moment is considered durable; temporary picker/cache URIs are not enough.
- Local-only baby photos can be lost if the app is deleted, app data is cleared, or the device is lost/replaced before backup.
- Backup/export should produce a local manifest that records media pointers, captions, dates, baby ID, and export metadata so future archive packaging can include media files and metadata together.
- Generated album text supplied by the user is preserved exactly as typed, including the user's own language, and is not automatically translated.

## Widget Snapshot Cleanup

Widget disable, sign out, and account deletion must:
- Clear local snapshot storage when available.
- Publish a blank disabled/signed-out safe state to the native widget where tooling is available.
- Exclude Growth Timeline photos, notes, invite details, billing data, account data, and raw household IDs.

## Household And Member Removal

Local/emulator implementation can document and simulate member removal, but production removal requires backend authority:
- Removing a member should not delete that member's account.
- Removing oneself should leave household data available to remaining valid caregivers.
- Removing the last admin/owner must be blocked or routed through a transfer/deletion flow.
- Invite revocation and pending-invite cleanup must be backend-owned.

## Export And Delete Request Plan

Before release, BabyMinimo needs a privacy support path for:
- Exporting account and household data where legally required.
- Deleting account/user-scoped data.
- Explaining that local-only Growth Timeline photos are controlled on the device unless the user exports or backs them up outside BabyMinimo.
- Explaining that Growth Timeline album PDFs/image pages are user-created local export artifacts controlled by the user after export.
- Clarifying shared household records may remain visible to other caregivers according to household policy.

## Offline, Cache, And Stale Data

- Screens showing cached or widget data must label stale/expired states calmly.
- Widgets expire after the current widget contract's max visible age and should prompt opening BabyMinimo.
- Offline writes must be queued or failed visibly; destructive cleanup must not run from stale or unknown state without explicit backend confirmation.

## Logs And Test Artifacts

Do not store sensitive data in:
- Console logs.
- Maestro screenshots except approved account/demo UI states.
- GoalBuddy receipts.
- Load-test output.
- Changelog entries.

Allowed evidence should use seeded demo names/emails only and should avoid private notes, image URIs, invite tokens, auth tokens, billing identifiers, and raw household IDs.

## Emulator-Safe Implementation Boundary

Allowed before production setup:
- Local cleanup helpers for auth store, widget snapshots, notification schedules, analytics buffer, and local Growth Timeline demo metadata.
- Privacy copy and Settings/Account UI for local lifecycle explanations.
- Unit tests for local cleanup and payload privacy.
- Emulator-only tests that avoid destructive production calls.

Production-gated:
- Real account deletion callable.
- Firestore security rules for deletion/ownership behavior.
- Push token deletion against production FCM/APNs.
- StoreKit entitlement cleanup.
- Real cloud media/export/report purge jobs.

## Security, Cost, And Rollout Risks

Security risks:
- Account deletion must not be client-authoritative. Production deletion needs backend authorization, ownership checks, and retry-safe state.
- Household/member removal can cause data loss if last-admin and ownership transfer rules are not backend-enforced.
- Widget snapshots are visible outside the unlocked app, so only the approved minimal snapshot fields may be exposed.
- Analytics and logs must never include free-text notes, image URIs, auth tokens, invite tokens, billing IDs, or raw household identifiers.

Cost risks:
- Local Growth Timeline photos are cost-safe in v1 because they remain on device, but future cloud media/export/report features must use the PBI-060 heavy-data purge policy.
- Remote push tokens, analytics events, Growth album export archives, and generated report archives can become retention/cost surfaces and need lifecycle cleanup before production launch.
- Repeated cleanup retry jobs must be bounded and observable so failures do not create runaway Functions or Firestore writes.

Production rollout gates:
- PBI-056 must implement backend account deletion and local file cleanup before account deletion is exposed as a real action.
- Production Firebase rules must prevent clients from deleting shared household, billing, entitlement, or membership authority data directly.
- A manual privacy review must confirm widgets, notifications, screenshots, logs, and analytics contain only approved data classes.
- TestFlight release candidates must verify sign-out/relaunch, notification cleanup, widget blanking, and stale/offline copy on clean devices.
