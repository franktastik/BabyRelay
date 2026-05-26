# BabyMinimo Control And Integration Audit

Date: 2026-05-26

This audit tracks visible controls that are not fully functional production features yet. It separates actual no-op UI from intentionally local/emulator-only work so each item can become a Firebase, database, App Store Connect, StoreKit, native permission, or UI hardening ticket.

## Classification

- **Bug**: Looks tappable or selectable but does nothing useful.
- **Deferred integration**: Works only as local demo, emulator, or notice until a production service is connected.
- **Local-only by design**: Useful in the current local/emulator app, but should not be mistaken for production behavior.
- **Needs decision**: Product should decide whether to wire, remove, or restyle.

## High-Priority Tickets

| Ticket | Area | Current state | Required production work |
| --- | --- | --- | --- |
| CTRL-001 | StoreKit/App Store Connect | Plans CTA, Restore, Terms, and Privacy show a local deferred notice. | Connect StoreKit products, restore purchases, localized storefront prices, subscription state, and legal document links. |
| CTRL-002 | Firebase Auth providers | Apple and Google login buttons are visibly disabled. | Configure native Apple/Google providers, Firebase Auth provider linking, error states, and E2E coverage. |
| CTRL-003 | Account security | Password reset/change is marked deferred; profile name/email rows are read-only. | Add password reset/change, email update, display-name edit, re-auth flows, and Firebase Auth validation. |
| CTRL-004 | Caregiver invites | Onboarding and Family invite controls only set local UI state; no email, callable, invite document, acceptance flow, or revocation exists. | Add invite callable/Cloud Function, email delivery, invite tokens, member roles, acceptance flow, resend/cancel, and Firestore rules. |
| CTRL-005 | Production Firebase authorization | `firestore.rules` is emulator-open; local UI now hides caregiver invite controls but production enforcement is not wired. | Add least-privilege Firestore rules for households, babies, care events, reminders, invites, roles, widgets, and account lifecycle. |
| CTRL-006 | Production data persistence | Some flows are emulator-backed or in-memory/local only. | Move remaining local stores to scoped Firebase/SQLite policy as approved, with offline behavior and per-baby/household indexes. |

## UI Hardening Bugs

Tracked implementation ticket: **PBI-051A: UI hardening follow-up for misleading controls** in `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md`. GoalBuddy task: **T353**.

| Ticket | Surface | Control | Finding | Recommendation |
| --- | --- | --- | --- | --- |
| CTRL-101 | Home | Weekly summary card chevron | Chevron implies the summary card opens, but the card is a static `View`. | Either make it open Baby Activity/weekly detail or remove the chevron. |
| CTRL-102 | Shared settings header | Right settings icon | `SettingsHeader` renders a button-styled settings icon by default, but it is a static `View` on screens like Settings and Family. | Hide by default, or make it accept an `onRightPress` handler before showing the button shell. |
| CTRL-103 | Family | Caregiver row ellipsis | Each caregiver row shows `...` but there is no member action menu. | Add a role-aware member menu, or remove the ellipsis until edit/remove/resend actions exist. |
| CTRL-104 | Breastfeed log modal | Feeding type segmented choice | Bottle appears as a selectable option inside the breastfeeding modal, but `onChange={() => undefined}` makes it a no-op. | Switch to bottle modal when Bottle is selected, or render this as a non-interactive label. |
| CTRL-105 | Log form shell | Event time/date pills | Time and date are styled like controls but cannot be changed. | Add date/time picker support or restyle as read-only metadata. |
| CTRL-106 | Timeline/home text links | Text-only tappables | Growth preview "View all" and similar text taps work, but they do not expose button semantics. | Convert action text to `Pressable` with `accessibilityRole="button"` and test IDs. |

Resolution receipt, 2026-05-26:
- CTRL-101: Removed the Home weekly summary chevron so the static weekly summary no longer implies navigation.
- CTRL-102: `SettingsHeader` now hides the right settings icon by default and only renders it as a button when an `onRightPress` handler is supplied.
- CTRL-103: Removed the Family member row ellipsis until role-aware member actions exist.
- CTRL-104: Breastfeed modal Bottle selection now routes to the Bottle log modal instead of acting as a no-op.
- CTRL-105: Log form time/date pills were restyled as read-only metadata blocks with accessibility labels.
- CTRL-106: Home Growth "View all" is now a `Pressable` with `accessibilityRole="button"` and `testID="home-growth-view-all-button"`.
- Visual evidence: `docs/qa/screenshots/pbi-051a/home-summary-no-chevron.png`, `docs/qa/screenshots/pbi-051a/family-no-ellipsis-no-header-action.png`, `docs/qa/screenshots/pbi-051a/breastfeed-bottle-routes-to-bottle.png`, and `docs/qa/screenshots/pbi-051a/growth-view-all-opens-timeline.png`.

## Deferred Integration Inventory

| Surface | Control | Current behavior | Integration target |
| --- | --- | --- | --- |
| Login | Continue with Apple | Disabled with deferred copy. | Apple Sign In entitlement, Firebase Auth provider, App Store review-safe copy. |
| Login | Continue with Google | Disabled with deferred copy. | Google Sign-In native setup, Firebase Auth provider, OAuth client IDs. |
| Login | Forgot/reset password | Read-only "Reset deferred" text. | Firebase Auth password reset and email template handling. |
| Login | Remember me | Local UI toggle only. | Decide whether to implement credential persistence/session duration or remove as unnecessary. |
| Plans | Try 3 Days Free / Continue | Shows StoreKit deferred notice. | App Store Connect products, StoreKit purchase flow, trial eligibility, receipt/subscription state. |
| Plans | Restore | Shows StoreKit deferred notice. | StoreKit restore purchases and entitlement refresh. |
| Plans | Terms / Privacy | Shows deferred notice. | Open hosted legal URLs or local legal screens. |
| Account | Full name / email rows | Non-interactive information rows. | Profile editing, email verification, re-authentication. |
| Account | Delete local account data | Local cleanup and sign out only; production purge is deferred. | Firebase Auth deletion, backend purge, shared-household last-owner policy, export/delete audit logs. |
| Onboarding invite | Send Invite to Caregiver | Local success state only. | Invite backend, email delivery, token acceptance, role assignment. |
| Family invite | Invite caregiver | Local queued state only, now role-gated. | Same invite backend plus resend/cancel/member management. |
| Reminders | Create/toggle reminder | Local state + local notifications; not household-synced production reminders. | Firestore reminder records, cross-device sync, optional FCM/APNs fan-out. |
| Widgets | Toggle/clear snapshot | Local setting and best-effort native update. | Native widget extension verification, production snapshot source, signed-out/disabled/stale states. |
| Add Moment | Add photo moment | Simulated local photo selection and in-memory/local growth moment. | Native image picker, permissions, local media policy, optional cloud media storage if approved. |
| Activity | Baby Activity tracker | Local in-memory activity store. | Decide whether activity remains device-local or gets persisted/synced per baby. |
| Language | German draft toggle | English runtime plus German draft QA toggle. | Full runtime locale picker, RTL/text expansion QA, accepted translations. |

## Production Integration Ticket Set

1. **Auth Providers And Account Security**
   - CTRL-002, CTRL-003, login reset-password path, profile editing.
   - Dependencies: Firebase Auth providers, Apple capability, Google OAuth client, account-security copy.

2. **Household Invite And Role Backend**
   - CTRL-004, CTRL-005, caregiver row member actions.
   - Dependencies: Cloud Functions/callables, Firestore invite/member schema, email provider, security rules.

3. **StoreKit And App Store Connect**
   - CTRL-001, plans CTA/restore/legal links.
   - Dependencies: App Store Connect product IDs, StoreKit config, entitlement model, legal URLs.

4. **Production Data Persistence**
   - CTRL-006, reminders, activity, growth moments, widget snapshots.
   - Dependencies: Firestore rules/indexes, offline policy, data lifecycle/account deletion policy.

5. **Native Device Integrations**
   - Notifications, image picker, Home Screen widgets.
   - Dependencies: iOS permissions, Expo/native modules, dev-build/TestFlight proof.

6. **UI Interaction Hardening**
   - CTRL-101 through CTRL-106.
   - Dependencies: no production backend required; can be handled as a local polish ticket before release QA.

## Current Functional Controls

The following controls are already wired to useful local/emulator behavior:

- Email/password login and signup through Firebase Emulator.
- Onboarding questionnaire, notification priming, add-baby, and preview navigation.
- Home settings, baby switcher, Baby Activity card, quick-log entry, and Growth/Timeline navigation.
- Quick log chooser plus breastfeed, bottle, diaper, sleep, and medication save flows.
- Timeline search, sort/settings panel, filters, and Add Moment route.
- Handoff reminder icon route to Reminders.
- Reminder create, permission request, local notification scheduling, toggle/cancel.
- Settings navigation rows for Plans, Family, Reminders, Timeline, Widgets, Activity, Language, Account, and Sign out.
- Sign out local lifecycle cleanup.
- Account deletion local cleanup confirmation.

## Release Rule

Before treating BabyMinimo as release-candidate UI, every row above must be either:

- implemented,
- visibly disabled with clear copy,
- hidden from the UI,
- or explicitly documented as local-only with matching QA coverage.
