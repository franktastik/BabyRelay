# BabyMinimo Android Widget Parity Plan

PBI-048 defines how BabyMinimo should bring the iOS current-state Home Screen widget to Android without expanding the v1 widget contract or blocking the iOS widget MVP.

## Scope

Android widgets are read-only glanceable surfaces for caregiver handoff state. They show the same privacy-safe snapshot as iOS:

- current baby status
- last feed
- last diaper
- last sleep
- next due-soon reminder
- last updated time
- stale, expired, disabled, signed-out, no-baby, and empty states

Android widgets must not include:

- logging actions
- notes or free-text details
- Growth Timeline photos
- account, billing, invite, or household identifiers
- purchase or subscription actions

## Recommended Implementation Path

Use the existing app-side widget contract as the shared cross-platform boundary:

- `src/features/widgets/widgetPayload.ts`
- `src/features/widgets/currentStateWidgetProps.ts`
- `src/features/widgets/widgetSnapshotStore.ts`

Add an Android-native widget layer later through one of these paths:

1. **Custom Expo config plugin plus native Android widget receiver**
   - Best fit for a production Expo app that already has prebuild/native folders.
   - Adds `AppWidgetProvider`, XML widget metadata, layouts, and app group-style shared storage equivalent.
   - Most predictable for App Store/Play Store release because native behavior is explicit.

2. **Expo module wrapper around Android widget APIs**
   - Useful if BabyMinimo needs richer JS-managed update behavior.
   - More moving parts than a simple config plugin.

3. **Third-party React Native widget package**
   - Only acceptable after a maintenance and compatibility review.
   - Do not adopt a dependency that conflicts with Expo SDK, new architecture, or release signing.

Default decision: start with a custom Expo config plugin and native Android widget receiver.

## Widget Sizes

Match the iOS small and medium widget intent, not exact pixel dimensions:

- **Small Android widget**
  - Baby name
  - current status
  - due soon or last updated
  - stale/disabled message when applicable

- **Medium Android widget**
  - Baby name
  - current status
  - last feed, diaper, and sleep
  - due soon
  - last updated

Use BabyMinimo sage, cream, clay, rounded cards, and restrained typography. Android visual QA should compare against the iOS widget and the approved Settings/Home references, not invent a separate Android brand style.

## Data And Refresh

Android must consume the same `BabyMinimoWidgetPayload` shape used by iOS.

Refresh policy:

- Update after Home publishes a fresh snapshot.
- Show stale after 15 minutes without refresh.
- Show expired after 4 hours without refresh.
- Show disabled copy immediately when local widget visibility is turned off.
- Avoid network reads from the widget itself.

The widget should read from app-written local storage only. Firestore, Auth, and notification work should stay inside the app/runtime services, not inside the widget receiver.

## Settings Parity

The existing Settings > Widgets screen should control both platforms:

- `Show baby status widgets`
- clear widget snapshot
- privacy explanation

Android implementation must wire the same local setting to the Android widget blank/update path.

## Verification Plan

Before accepting Android parity:

- Unit tests for payload-to-Android-props mapping.
- Android emulator widget placement screenshots for small and medium widgets.
- Disabled-state screenshot after turning widgets off.
- Stale/expired screenshots using fixed generated times.
- `bun run test:typecheck`
- `bun run test:unit`
- Android native build and install.
- Manual or automated smoke that confirms the widget does not expose notes, photos, account data, or identifiers.

## Risks

- Expo config plugin changes can affect prebuild output and must be reviewed carefully.
- Android widget refresh cadence is OS-managed and can differ by launcher, battery policy, and vendor.
- Exact visual parity with iOS is not realistic; brand and information hierarchy parity is the target.
- The current iOS widget does not yet have complete Home Screen placement screenshots, so Android should wait until iOS visual acceptance is stronger.

## Recommendation

Do not implement Android widget parity before the first iOS widget is fully accepted. Keep this PBI as the planning artifact, then schedule Android implementation after:

- PBI-046 iOS widget placement screenshots are complete.
- PBI-047 widget settings controls are accepted.
- Android release path is active.
