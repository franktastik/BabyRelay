# Superdesign Reference Quality Notes

These notes identify Superdesign reference exports that should not be copied literally.

## BabyMinimo - Empty Stats & Insights

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-empty-stats-insights-53c40798.png
```

Issue:

- The exported PNG has a visible overlap artifact around the `Start logging to see insights` headline and body copy.
- The screenshot appears to be an imperfect export/capture of a scrollable or constrained viewport state.

Use instead:

- HTML source: `/private/tmp/babyminimo-superdesign-html/empty-stats-insights.html`
- Superdesign project/canvas reference for the intended spacing.
- Simulator verification with top, middle, and bottom scroll positions.

Implementation guidance:

- Keep the icon cluster, headline, and explanatory copy as separate vertical blocks.
- Preserve at least 8-12px between headline and body copy.
- Do not shrink type or overlap text to force all content into one viewport.
- Keep the bottom nav fixed and add enough scroll padding so the quick log card is not hidden.

## BabyMinimo Family Management

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-family-management-f7464c51.png
```

Issue:

- The exported PNG does not perfectly align with the broader mockup/canvas reference.
- Text and sections can appear cramped when the screenshot is treated as a fixed-height composition.
- The underlying screen is scrollable; the screenshot does not show the lower upgrade nudge and can make the layout look more compressed than intended.

Use instead:

- HTML source: `/private/tmp/babyminimo-superdesign-html/family.html`
- Superdesign canvas reference for top-level visual alignment.
- Simulator verification with top and bottom scroll positions.

Implementation guidance:

- Keep the header, coordination plan card, household member heading, member list, and upgrade nudge as separate vertical sections.
- Use the HTML spacing as the baseline: `px-6`, plan card `mt-4 mb-8`, member heading `mb-4`, member rows `space-y-3`, upgrade nudge `mt-8`.
- Preserve the scrollable main content and fixed bottom nav instead of compressing all sections into one viewport.
- Ensure member names, role badges, and relationship labels have enough horizontal space and never overlap.

## BabyMinimo Help & Support Updated Navigation

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-help-support-updated-navigation-bb4e4f58.png
```

Issue:

- The exported PNG does not perfectly align with the broader mockup/canvas reference.
- It captures only the upper portion of a scrollable screen, with the Browse Categories section cut by the fixed bottom nav.
- Treating the screenshot as a full fixed viewport would hide lower support content and create cramped spacing.

Use instead:

- HTML source: `/private/tmp/babyminimo-superdesign-html/help-support.html`
- Superdesign canvas reference for visual alignment.
- Simulator verification with top, middle, and bottom scroll positions.

Implementation guidance:

- Keep the header/search area fixed only if the native screen design calls for it; otherwise preserve the HTML's header plus scrollable main content.
- Keep contact buttons, FAQ list, browse categories, feedback card, and footer email as separate vertical sections.
- Preserve main scroll padding (`pb-32` equivalent) so the bottom nav does not cover category cards or footer content.
- Do not treat the cropped category cards in the screenshot as the intended resting state.

## BabyMinimo Home Dashboard - Fully Linked

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-home-dashboard-fully-linked-dedb99eb.png
```

Issue:

- The exported PNG captures only the upper portion of the scrollable Home screen.
- Lower sections such as `What’s happened?` are not visible in the PNG and can appear overlapped or cut off when the screenshot is treated as a fixed-height composition.
- The bottom navigation is fixed, so content must scroll behind/above it with enough bottom padding.

Use instead:

- HTML source: `/private/tmp/babyminimo-superdesign-html/home.html`
- Superdesign canvas reference for the intended full Home flow.
- Simulator verification with top, middle, and bottom scroll positions.

Implementation guidance:

- Preserve the full section order from HTML: header, 2x2 metric grid, weekly summary, recent wins, `What’s happened?` activity list.
- Keep `main` scrollable with bottom padding equivalent to `pb-32`.
- Do not overlap the activity list with the bottom nav or floating Log button.
- Do not compress cards or reduce text size to force the entire Home screen into one viewport.

## BabyMinimo Interactive Onboarding Flow

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-interactive-onboarding-flow-88c34ba2.png
```

Source:

- This came from the provided Superdesign draft list as `BabyMinimo Interactive Onboarding Flow`.
- Draft id: `88c34ba2-a02b-4249-aff0-3f3e29df0d83`

Issue:

- This appears to be an alternate or aggregate onboarding concept rather than one of the approved individual onboarding screens.
- It should not override the canonical onboarding references.

Use instead:

- `BabyMinimo - Onboarding Welcome (Linked)`
- `Onboarding - Problem Framing`
- `BabyMinimo Onboarding - Step 1`
- `BabyMinimo Onboarding - Solution Preview`
- `Onboarding - Invite Caregiver`

Implementation guidance:

- Treat this file as secondary/non-canonical unless explicitly approved.
- Do not use it as the source of truth for onboarding sequence, layout, or copy.

## BabyMinimo Milestone Celebration

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-milestone-celebration-ab05dbdf.png
```

Source:

- HTML source: `/private/tmp/babyminimo-superdesign-html/milestone-celebration.html`

Issue:

- This is an overlay/modal celebration state, not a normal full-screen route.
- The PNG can look empty or low-context when viewed by itself because the design depends on the dark backdrop and centered modal card.

Use instead:

- The HTML source for the actual celebration modal structure.

Implementation guidance:

- Implement as a modal/overlay state over existing app context.
- Required modal pieces: dark blurred backdrop, centered rounded celebration card, close button, award badge, `100 Feeds Logged!`, supportive copy, streak badge, `Celebrate with Family` CTA, and dismiss action.
- Do not add this as a standalone tab or primary screen.

## BabyMinimo Onboarding - Solution Preview

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-onboarding-solution-preview-7345976b.png
```

Source:

- HTML source: `/private/tmp/babyminimo-superdesign-html/onboarding-solution-preview.html`

Issue:

- The screenshot can look empty or low-context when viewed alone.
- The HTML source is populated and should be treated as the reliable reference.

Use instead:

- The HTML source for layout, copy, and component structure.

Implementation guidance:

- Required pieces: progress header, back button, `Know what happened last, instantly.` headline, explanatory copy, dashboard preview card, pagination dots, bottom `Continue to Setup` CTA, and helper text.
- Keep the preview card scroll-aware and avoid cropping the CTA on smaller devices.

## BabyMinimo Onboarding - Step 1

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-onboarding-step-1-959d519b.png
```

Source:

- HTML source: `/private/tmp/babyminimo-superdesign-html/onboarding-step-1.html`

Issue:

- The screenshot can look empty or low-context when viewed alone.
- The HTML source is populated and should be treated as the reliable reference.

Use instead:

- The HTML source for the add-baby/profile creation step.

Implementation guidance:

- Required pieces: progress header, back button, `Let's meet your baby` headline, explanatory copy, add-photo placeholder, baby name field, birth date field, bottom `Next` CTA, and skip action.
- Keep the form scroll-aware so the CTA remains reachable with the keyboard open.

## BabyMinimo - Onboarding Welcome (Linked)

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-onboarding-welcome-linked-3d1241f1.png
```

Issue:

- This draft does not match the approved BabyMinimo mockup direction currently being used.
- Treat it as an alternate concept, not an implementation source of truth.

Implementation guidance:

- Do not use this draft to override the selected onboarding visual system.
- Use the approved mockup/canvas direction for onboarding welcome unless this draft is explicitly re-approved.

## BabyMinimo Premium Handoff - Navigation Linked

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-premium-handoff-navigation-linked-f0b2eab9.png
```

Issue:

- This screenshot does not match the approved mockup direction being used for BabyMinimo.
- It appears to be a cropped or alternate viewport of the Handoff concept.
- Treating this PNG as exact would push the implementation away from the mockup.

Use instead:

- HTML source for structure: `/private/tmp/babyminimo-superdesign-html/handoff.html`
- Approved mockup/canvas direction for final visual alignment.
- Simulator screenshots for top and bottom scroll states.

Implementation guidance:

- Preserve the intended Handoff information hierarchy: current baby state, key care metrics, due-soon items, and handoff CTA.
- Do not copy this PNG literally for typography, spacing, or nav placement.
- Resolve final Handoff visuals against the approved mockup, not this exported screenshot.

## BabyMinimo Profile & Account Settings

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-profile-account-settings-4fc74629.png
```

Issue:

- This screenshot does not match the approved BabyMinimo mockup direction.
- Treat it as a structural reference only.

Use instead:

- HTML source for route structure: `/private/tmp/babyminimo-superdesign-html/profile-account.html`
- Approved mockup/canvas direction for final visual alignment.

Implementation guidance:

- Preserve the account hierarchy: profile card, personal details, security, household/account actions, and destructive account action.
- Do not copy this PNG literally for final spacing, typography, or card styling.
- Verify the screen as scrollable if all account sections do not fit in one viewport.

## BabyMinimo - Reminders Linked

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-reminders-linked-9e638c80.png
```

Issue:

- This screenshot does not match the approved BabyMinimo mockup direction.
- Treat it as content/route structure only.

Use instead:

- HTML source for structure: `/private/tmp/babyminimo-superdesign-html/reminders.html`
- Approved mockup/canvas direction for final visual alignment.

Implementation guidance:

- Preserve the reminders hierarchy: header, add-reminder/nudge entry point, active reminder list, empty state where applicable, and settings/navigation access.
- Do not copy this PNG literally for final spacing, typography, or card styling.
- Verify as scrollable when reminder lists exceed one viewport.

## BabyMinimo Settings - Connected

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-settings-connected-ff445965.png
```

Issue:

- This screenshot does not match the approved BabyMinimo mockup direction.
- Treat it as content/route structure only.

Use instead:

- HTML source for structure: `/private/tmp/babyminimo-superdesign-html/settings.html`
- Approved mockup/canvas direction for final visual alignment.

Implementation guidance:

- Preserve the settings hierarchy: plan summary, shared coordination settings, feature settings, account/support rows, and sign-out/destructive actions where applicable.
- Do not copy this PNG literally for final spacing, typography, or card styling.
- Verify as scrollable so lower settings sections are not hidden by the bottom nav.

## BabyMinimo - Signup Screen

File:

```text
docs/product/superdesign-reference-assets/screenshots/babyminimo-signup-screen-5ea51d22.png
```

Source:

- HTML source: `/private/tmp/babyminimo-superdesign-html/signup.html`

Issue:

- The screenshot can look empty or low-context when viewed alone.
- The HTML source is populated and should be treated as the reliable structural reference.

Use instead:

- The HTML source for signup structure.
- The approved auth mockup/canvas direction for final styling.

Implementation guidance:

- Required pieces: back button, brand mark, `Join the Circle`, `Create Your Household`, explanatory copy, full name field, email field, password field, terms row, `Start Your Relay` CTA, secure data note, divider, and login link.
- Keep signup keyboard-aware and scrollable enough that the CTA and login link remain reachable.
