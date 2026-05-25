# BabyMinimo Interaction Hardening Inventory

PBI-051 tracks visible controls that must be functional, intentionally disabled, hidden, or deferred before BabyMinimo can be treated as release-candidate UI.

## Scope Boundary

This PBI is local and emulator-safe. It must not add production Firebase, App Store Connect, StoreKit production purchases, production push credentials, or production billing behavior.

## Functional Controls Already In Scope

- Email/password signup and login through Firebase Emulator.
- Onboarding navigation and add-baby flow.
- Home settings button and quick-log actions.
- Quick-log chooser and breastfeed, bottle, diaper, sleep, medication modals.
- Timeline filters and Add Moment flow.
- Handoff display.
- Reminders create, permission prompt, local schedule, toggle, and cancellation.
- Family invite field/button.
- Settings navigation rows.
- Account sign out and sign-out confirmation.
- Settings > Widgets local toggle and clear snapshot action.

## Controls To Resolve In PBI-051

| Surface | Control | Current state | Hardening decision |
| --- | --- | --- | --- |
| Login | Continue with Apple | Visual `Pressable` with no action | Done: disabled with deferred native-provider copy. |
| Login | Continue with Google | Visual `Pressable` with no action | Done: disabled with deferred native-provider copy. |
| Login | Remember me | Visual checkbox text with no action | Done: toggles local checkbox state. |
| Login | Forgot/reset password | Looked action-oriented without a reset flow | Done: marked deferred until production account-security work. |
| Home | Growth Timeline "View all" | Console log only | Done: navigates to Timeline. |
| Timeline | Search icon | No-op action | Done: disabled with accessible "coming soon" label. |
| Timeline | Settings/filter icon | No-op action | Done: disabled with accessible "coming soon" label. |
| Account | Full name row | Looks tappable because `SettingsRow` always shows chevron | Done: non-action Settings rows are disabled and no longer show chevrons. |
| Account | Email row | Looks tappable because `SettingsRow` always shows chevron | Done: non-action Settings rows are disabled and no longer show chevrons. |
| Account | Password row | Shows "Change" but no action | Done: marked deferred until production account-security work. |
| Settings | Plan card "Manage" pill | Looked tappable but was static text | Done: routes to Plans. |
| Plans | Plan CTA-like rows | Visual only | Done: replaced CTA styling with non-interactive status pills. |
| Family | Manage Caregivers in plan card | Visual text only | Done: button scrolls to the caregiver invite area. |
| Handoff | Bell icon | Decorative view | Done: routes to Reminders. |

## PBI-051 Slice Receipt

- `SettingsRow` now only exposes button semantics and chevrons when an `onPress` exists.
- Login social buttons are disabled/deferred until native provider setup.
- Login "Remember me" toggles local UI state and password reset is marked deferred.
- Timeline search/settings icons are disabled with accessible labels instead of no-op handlers.
- Home Growth Timeline preview routes to Timeline.
- Family plan "Manage Caregivers" scrolls to the invite/caregiver management section.
- Settings plan "Manage" routes to Plans.
- Handoff reminder icon routes to Reminders.
- Plan purchase rows are status pills until StoreKit/App Store Connect work starts.
- Account password changes are marked deferred until production account-security work.

Evidence:
- `docs/qa/screenshots/pbi-051/timeline-disabled-icons.png`
- `docs/qa/screenshots/pbi-051/family-manage-caregivers-scroll.png`

## Implementation Order

1. Fix generic `SettingsRow` so rows without `onPress` no longer look tappable.
2. Replace Home Growth Preview `console.log` with Timeline navigation.
3. Disable or hide login social buttons with clear local-demo copy.
4. Resolve Timeline icon no-ops.
5. Convert obvious visual-only CTAs to disabled/deferred states or local navigation.
6. Update Maestro smoke coverage for the changed routes.

## Acceptance Notes

- Unsupported production features should not look tappable.
- Disabled/deferred controls should have calm copy and accessible labels.
- Do not wire fake production behavior.
- Keep visual treatment aligned with approved `screenshots1/` references.
