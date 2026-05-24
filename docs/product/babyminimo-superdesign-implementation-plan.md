# BabyMinimo Superdesign Implementation Plan

This plan turns the fetched Superdesign draft HTML into an implementation path for the Expo codebase.

Project ID: `47fa1dd3-10eb-4443-83d1-37824d15cd2a`

Fetched HTML cache: `/private/tmp/babyminimo-superdesign-html/`

## Fetch Receipt

Fetched 30 draft HTML files from:

```text
https://api.superdesign.dev/v1/design-drafts/{draftId}/html
```

Corrected draft ids from the project node list:

- `onboarding-solution-preview`: `7345976b-0301-4cfe-94ee-8c7d279426bc`
- `profile-account`: `4fc74629-d878-4b38-af08-e5932a51af72`

The HTML files are structure/content references only. Approved screenshots in `docs/product/superdesign-reference-assets/screenshots1/` win for visual design.

## Reference Assets

Approved mockup screenshots live in:

```text
docs/product/superdesign-reference-assets/screenshots1/
```

The machine-readable index is:

```text
docs/product/superdesign-reference-assets/manifest.json
```

Historical notes about old fetched screenshots are tracked in:

```text
docs/product/superdesign-reference-assets/quality-notes.md
```

Use `screenshots1/` as the canonical local visual reference set during Codex, GoalBuddy, and OSS-agent implementation. The previous fetched `screenshots/` folder was intentionally cleared because those PNGs did not match the approved mockup direction.

Use the fetched HTML cache for structure/content only when it does not conflict with the approved `screenshots1/` visual direction. If a screen is scrollable and `screenshots1/` only captures one position, verify top, middle, and bottom states in the simulator before accepting the implementation.

If additional exact mockup captures are needed, add them to `screenshots1/` and refresh `manifest.json`.

## Visual QA Gate

Use this contract for all BabyMinimo UI work:

```text
docs/product/babyminimo-visual-qa-contract.md
```

Screen-specific contracts live in:

```text
docs/product/screen-contracts/
```

For each UI task, the implementation handoff must name the approved screenshot file from `screenshots1/` and any matching screen contract.

Completion requires:

- simulator screenshot captured after implementation
- explicit comparison against the approved screenshot
- known visual differences listed
- scroll positions captured for scrollable screens
- Codex decision: `accept`, `tighten`, or `reject`

Do not accept a UI implementation based only on claims that it matches the mockup.

## No Approximation Rule

Do not approximate:

- logo and brand mark
- avatar composition
- icon style
- spacing rhythm
- card dimensions
- typography scale and weight
- button heights and radius
- input heights and radius
- bottom navigation placement
- scroll behavior

If exact matching is blocked by a missing asset, stop and list the missing asset. Do not invent a substitute and call it complete.

## Generated Asset Policy

Generated assets may be created with Imagen 2 only when the mockup needs non-brand visual material that is not already provided by Superdesign.

Good generated-asset candidates:

- warm newborn or caregiver photography for landing hero and App Store screenshot backgrounds
- soft onboarding illustrations that match the BabyMinimo tone
- local demo placeholders for Growth Timeline moments
- gentle family/caregiver portraits for prototype states

Do not use generated assets to replace:

- the BabyMinimo logo or brand mark when an approved asset exists
- exact UI screenshots from Superdesign
- product hierarchy, navigation, or screen structure
- user-provided baby/family photos

Generated assets must match the mockup direction:

- warm neutral background, soft daylight, calm family-care mood
- sage, clay, cream, and muted gold accents
- no dark stock-photo treatments, heavy blur, generic SaaS gradients, or unrelated illustration styles
- no cloud-sync implication for Growth Timeline v1; placeholder photos are bundled/demo-only

Store generated assets under:

```text
assets/generated/superdesign-parity/
```

Keep prompt/source metadata in:

```text
assets/generated/superdesign-parity/manifest.json
```

## Scrollable Mockup Handling

Some Superdesign mockups are scrollable screens, not fixed one-viewport compositions. The native implementation must reproduce scroll behavior instead of shrinking content until everything fits.

Screens that should be treated as scroll-aware include:

- Login and Signup, especially with keyboard open
- Onboarding steps
- Care Logging
- Timeline and Growth Timeline
- Handoff
- Reminders
- Family/Caregivers
- Settings, Plans, Account, Help, Notifications, Insights, and Achievements
- Empty, loading, error, and success states when content exceeds the viewport

Implementation rules:

- Use scrollable containers for long forms and feed-style screens.
- Keep CTAs reachable with safe-area-aware bottom padding.
- Preserve the bottom navigation/floating Log button without covering content.
- Do not reduce typography below the design scale just to avoid scrolling.
- For App Store screenshots, define the intended scroll position before capture.

Verification for scrollable screens should capture top, middle, and bottom positions in the simulator.

## Why The Current App Is Still Off

The current native app is directionally close, but it is not yet a faithful implementation because:

- It does not load the Superdesign fonts: `Outfit` for headings and `Plus Jakarta Sans` for body/labels.
- It uses text/emoji icons instead of Lucide-style icons from the drafts.
- The tab shell still uses Expo Tabs instead of the custom Superdesign bottom nav with a raised Log action.
- Home is still framed around a single snapshot card; the fetched Home draft uses a 2x2 status grid, weekly summary card, achievements card, and recent activity list.
- Quick log is a modal chooser, while the fetched Care Logging draft is a full Log Event screen with category pills, time card, form card, and clay save CTA.
- Handoff should follow the fetched Handoff draft cards and due-soon layout before further dark-mode decisions.
- The visual language depends on small details: 24-32px radii, 10-11px uppercase labels, 40-56px icon containers, warm borders, and very soft shadows.

## Design System To Implement

### Fonts

Install and load:

- `Outfit`: headings, screen titles, card titles
- `Plus Jakarta Sans`: body, labels, inputs, buttons

Implementation target:

- `src/theme/fonts.ts`
- `src/providers/AppProvider.tsx` loads fonts before routing
- `src/theme/tokens.ts` exposes `fontFamily.heading` and `fontFamily.body`

Suggested commands:

```sh
bun add @expo-google-fonts/outfit @expo-google-fonts/plus-jakarta-sans
bunx expo install expo-font
```

### Icons

Use Lucide icons instead of emoji/text glyphs.

Suggested commands:

```sh
bun add lucide-react-native
bunx expo install react-native-svg
```

Create:

- `src/components/ui/Icon.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/navigation/BottomNav.tsx`
- `src/components/navigation/FloatingLogButton.tsx`

Primary icon mapping:

- baby: `Baby`
- settings: `Settings`
- handoff: `ArrowRightLeft`
- home: `Home`
- log: `Plus`
- timeline: `History` or `Calendar`
- family/caregivers: `Users`
- bottle/feed: `Milk`
- sleep: `Moon`
- diaper: `Droplets`
- growth: `Camera`
- plans/achievements: `Award`

### Tokens

Canonical colors from fetched HTML:

- background: `#FAF9F6`
- sage fill: `#8DA089`
- sage text: `#6B7B68`
- clay: `#D98E73`
- gold: `#E5C38E`
- warm border: `#EAE3D9`
- soft sage: `#F2F4F1`
- soft clay: `#FDF4F1`
- ink: `#2D2A26`
- stone text: `#44403C`
- muted: stone 400/500 equivalent

Core shape and layout:

- screen horizontal padding: `24`
- primary cards: radius `28` or `32`
- small icon buttons: `40x40`, radius `16`
- social/auth buttons: height `58`, radius `20`
- form inputs: height `52-58`, radius `16-22`
- bottom nav: white, warm top border, `pb` safe-area aware
- floating log action: `56x56`, raised above nav

## Native Component Plan

### Foundation Components

Add or update:

- `Screen`: warm background, safe-area handling, optional scroll, optional bottom nav padding.
- `Card`: radius variants `24`, `28`, `32`, warm border, soft shadow.
- `Button`: clay default CTA, sage secondary where draft uses sage, black social variant.
- `Input`: warm border, stone-50 fill, label slot, left icon support.
- `Pill`: category/filter pills matching care logging and timeline.
- `MetricCard`: 2x2 Home status cards.
- `TimelineRail`: vertical timeline line/dots for care and growth items.
- `AvatarStack`: Home caregiver avatars.
- `BottomNav`: custom nav with Home, Timeline, Handoff, More/Family visual slots and raised Log action.

### Route Shell

Replace Expo default tab visuals with a custom navigation shell.

Keep product hierarchy intact:

- Main visible destinations: Home, Timeline, Handoff, More/Settings.
- Floating Log button opens the log flow.
- Do not make Growth Timeline a separate tab.
- If the draft shows Family, map it to More/Settings or Caregivers depending on product phase.

Files:

- `app/(tabs)/_layout.tsx`
- `src/components/navigation/BottomNav.tsx`
- `src/components/navigation/FloatingLogButton.tsx`

## Screen Implementation Plan

### Phase 1: Exact Visual Foundation

Goal: make primitives capable of matching every draft.

Files:

- `package.json`
- `src/theme/tokens.ts`
- `src/theme/fonts.ts`
- `src/providers/AppProvider.tsx`
- `src/components/ui/**`
- `src/components/navigation/**`

Acceptance:

- Fonts load before app display.
- Lucide icons render on iOS.
- Buttons, cards, pills, inputs, bottom nav match draft dimensions and radii.

Verification:

```sh
bunx tsc --noEmit
bun test
bunx expo-doctor
```

### Phase 2: Auth Parity

Ground truth:

- `login.html`
- `signup.html`

Target screens:

- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`

Requirements:

- Login header uses brand mark, BabyMinimo title, subtitle, caregiver avatar story, and card anchored to bottom.
- Login card includes Apple, Google, divider, household email, secure password, remember row, forgot link, clay CTA, and signup link.
- Signup uses back button, centered brand card, uppercase kicker, three rounded inputs, terms row, clay CTA, and login link.
- Avoid keyboard overlap by using scrollable auth layout with stable bottom spacing.

### Phase 3: Home Parity

Ground truth:

- `home.html`

Target files:

- `app/(tabs)/home.tsx`
- `src/components/home/**`

Requirements:

- Header: baby icon card, `Leo/Luna’s Relay`, synced indicator, avatar stack, settings icon.
- Main content starts with 2x2 metric grid:
  - Last Fed
  - Sleep Today
  - Last Diaper
  - Due Next
- Add `This Week's Summary` card.
- Add `Recent Wins` card.
- Add `What's happened?` recent activity list.
- Quick actions may remain visible, but should follow the draft density and not dominate Home.
- Growth Timeline remains secondary and appears as a recent activity/preview, not a separate tab.

### Phase 4: Log Flow Parity

Ground truth:

- `care-logging.html`

Target files:

- `app/modals/quick-log.tsx`
- `app/modals/log-breastfeed.tsx`
- `app/modals/log-diaper.tsx`
- future bottle/sleep/medication modal files
- `src/components/logging/**`

Requirements:

- Prefer a full `Log Event` screen/sheet over a sparse modal.
- Add category pills: Feeding, Diaper, Sleep, Health.
- Add time card: event time, current time, today.
- Form content sits inside a `rounded-[32]` card.
- Breastfeed form matches Feeding Type and Side & Duration structure.
- Diaper form should match the same shell, not a centered icon modal.
- Save CTA is clay and full width.

### Phase 5: Timeline Parity

Ground truth:

- `timeline.html`
- `timeline-empty.html`

Target files:

- `app/(tabs)/timeline.tsx`
- `src/components/timeline/**`
- `src/features/timeline/adapter.ts`

Requirements:

- Sticky warm header with title, search, settings.
- Horizontal filter pills: All Events, Feeding, Sleep, Growth Photos.
- Vertical rail with colored dots.
- Care events are small white rounded cards.
- Growth moments are image-forward cards inside Timeline.
- Empty state follows the fetched timeline empty state.

### Phase 6: Handoff Parity

Ground truth:

- `handoff.html`

Target files:

- `app/(tabs)/handoff.tsx`
- `src/components/handoff/**`
- `src/features/handoff/useHandoffSummary.ts`

Requirements:

- Header with baby avatar, live status, and share/action button.
- Current state summary grid/card set.
- Due Soon section with overdue pill and compact due rows.
- Clay `Ready for Handoff?` CTA panel.
- Keep Handoff focused on current state, due soon, and latest note.

Note: Previous product docs mention premium dark-mode Handoff, but the fetched endpoint is warm/light. Use the fetched HTML for parity unless the product direction explicitly changes back to dark.

### Phase 7: Settings, Plans, Caregivers, Reminders

Ground truth:

- `settings.html`
- `plans.html`
- `caregivers.html`
- `caregivers-empty.html`
- `reminders.html`
- `profile-account.html`
- `notifications-timing.html`
- `help-support.html`

Requirements:

- Implement these after demo core screens match.
- Preserve the same header, row, card, and bottom nav patterns.
- Family/Plans copy must frame Family as household coordination, not just seats.
- Growth Timeline local-only note belongs in Settings.

### Phase 8: Empty, Success, Marketing, Achievements

Ground truth:

- `error-success-states.html`
- `success-confirmation-states.html`
- `empty-stats-insights.html`
- `empty-achievements.html`
- `achievement-gallery.html`
- `milestone-celebration.html`

Requirements:

- Add empty/loading/error/success components only after core screen parity.
- Keep App Store screenshot polish separate from runnable demo implementation.

## GoalBuddy Work Plan

Create a new GoalBuddy tranche:

```text
/goal Follow docs/goals/babyminimo-superdesign-parity/goal.md.
```

Suggested tasks:

1. Scout: compare current native UI against fetched Superdesign HTML and produce screen-by-screen gaps.
2. Worker: implement fonts, icons, navigation shell, and primitive parity.
3. Judge: review primitive parity with simulator screenshots.
4. Worker: implement Auth parity.
5. Worker: implement Home parity.
6. Worker: implement Log flow parity.
7. Worker: implement Timeline parity.
8. Worker: implement Handoff parity.
9. Judge: final visual audit across simulator screenshots.

For OpenCode handoffs, keep tasks bounded to one phase and forbid auth/session internals unless the phase explicitly requires auth UI only.

Safe implementation model order:

1. `opencode-go/glm-5.1` when its smoke gate passes.
2. `opencode-go/qwen3.6-plus` as the safe fallback.
3. `opencode-go/deepseek-v4-flash` or `opencode-go/deepseek-v4-pro` if both GLM and Qwen fail.
4. `opencode-go/kimi-k2.6` only after its JSON Schema smoke gate passes.

Codex owns screenshot understanding and final visual QA. Do not rely on OpenCode workers to interpret images or decide whether UI matches `screenshots1/`; require them to implement from text requirements and return simulator evidence for Codex review.

## Recommended First Worker Handoff

Use Codex to review this handoff before sending it to an implementation model.

```text
Implement this bounded BabyMinimo Superdesign parity task.

Goal:
Create the native design foundation needed to match the fetched Superdesign HTML drafts.

Allowed files:
- package.json
- bun.lock
- src/theme/**
- src/providers/AppProvider.tsx
- src/components/ui/**
- src/components/navigation/**
- app/(tabs)/_layout.tsx

Forbidden:
- Firebase auth/session logic
- Firestore or emulator behavior
- app screen content beyond route shell/nav visuals
- database schema, migrations, CI, deployment
- unrelated refactors

Requirements:
- Install/load Outfit and Plus Jakarta Sans.
- Add Lucide icon support.
- Add theme font aliases and exact Superdesign color tokens.
- Add reusable Icon, IconButton, Pill, MetricCard, BottomNav, and FloatingLogButton components.
- Replace default Expo tab visual icons with the custom Superdesign-style bottom nav.
- Preserve current routing behavior.

Verification:
- bunx tsc --noEmit
- bun test
- bunx expo-doctor
- launch iOS simulator and capture Home/Login screenshots

Return only:
- files changed
- implementation summary
- verification run and result
- unresolved risks or caveats
```

## Review Checklist

Codex review should verify:

- Fonts actually render in simulator, not just token aliases.
- Icons are vector Lucide icons, not emojis.
- Home matches the fetched `home.html` structure.
- Log flow matches `care-logging.html` structure.
- Timeline keeps Growth moments inside Timeline.
- Bottom nav does not introduce a forbidden Growth tab.
- Firebase Emulator wiring remains local-only and unchanged unless explicitly scoped.
- Screens pass iOS simulator smoke checks and do not show runtime redboxes.
