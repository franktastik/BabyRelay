# Changelog

All notable changes to this project are documented here.

## Unreleased

### Added

- Added the BabyMinimo PBI, Codex command, GoalBuddy, code plan, and design source-of-truth pack.
- Added Expo Router project foundation with `package.json`, `app.json`, `tsconfig.json`, and `expo-env.d.ts`.
- Added BabyMinimo design tokens: sage, clay, gold, cream, creamAlt, ink, muted, danger, plus spacing, radius, typography, and shadows.
- Added reusable UI primitives: `Screen`, `Card`, `Button`, `Input`, `Chip`.
- Added `AppProvider` boundary in `src/app/providers/`.
- Added local/demo adapter boundaries for auth, events, growth timeline, and handoff summary in `src/features/demo/`.
- Added Expo Router tab shell with Home placeholder screen preserving BabyMinimo's warm cream surface, sage primary actions, and calm newborn handoff copy.
- Added Zustand auth store (`useAuthStore`) for demo session state: user, household, baby, onboarding status.
- Implemented demo auth adapter with local signIn, signUp, signOut, and getCurrentUser.
- Implemented demo household adapter with createHousehold and createBaby for onboarding flow.
- Added auth routes: `/(auth)/login` and `/(auth)/signup` with demo auth flows.
- Added onboarding routes: `/(onboarding)/welcome`, `problem`, `benefits`, `add-baby`, `priorities`, `invite-caregiver`, and `preview`.
- Added session-based routing in `app/index.tsx`: unauthenticated → login, authenticated without onboarding → welcome, authenticated and onboarded → Home.
- Updated `AppProvider` to bootstrap demo auth state on app start.
- Implemented Home demo screen (PBI-014) as calm command center with `HomeHeader`, `SnapshotCard`, `QuickActionBar`, and `GrowthPreview` components.
- Populated demo adapters with sample care events, growth moments, and handoff summary data for local demo use.
- Growth Timeline preview is visually secondary on Home; not a tab.
- Added Quick Log demo flow (PBI-016, PBI-017, PBI-019) with chooser modal, breastfeed log modal, and diaper log modal.
- Added `LogOptionCard` and `LogFormShell` reusable logging components.
- Added `useCareEventStore` Zustand store for local demo event storage with add, get, and latest event queries.
- Wired Home quick actions to open modal routes: Feed → quick-log chooser, Diaper → log-diaper, More → quick-log chooser.
- Breastfeed modal supports Left/Right/Both side selection and optional note.
- Diaper modal supports Wet/Dirty/Both selection and optional note.
- Saved events are stored in local memory and immediately visible to Home's snapshot data path.
- Added Timeline tab route (PBI-022) with title header and disabled Add Moment CTA.
- Added `TimelineFilters` component with All, Care, Growth, and Notes filter chips (PBI-023).
- Added `TimelineList`, `CareEventCard`, and `GrowthMomentCard` components for rendering timeline items.
- Added timeline adapter (`buildTimelineItems`, `filterTimelineItems`) that normalizes care events and growth moments into a merged list sorted by occurred time descending (PBI-024).
- Added `useFiltersStore` Zustand store for timeline filter state.
- Timeline includes locally saved quick-log events from `useCareEventStore` merged with demo care events and growth moments.
- Growth Timeline moments appear through the Growth filter inside Timeline, not as a separate tab.
- Added Handoff tab route (PBI-030) with premium dark-mode design for high overnight readability.
- Added `HandoffHeroCard` component showing current baby state: last feed, last diaper, last sleep status, and last action by.
- Added `DueSoonCard` component showing next medication/due soon with overdue highlighting.
- Added `LatestNoteCard` component showing the latest caregiver note with attribution and relative time.
- Added `useHandoffSummary` hook that reads from local/demo handoff summary adapter.
- Updated demo handoff adapter with structured fields (baby name, typed last events, sleep status, medication due time, note metadata).
- Handoff screen is glanceable in under 5 seconds with current state, due soon, and latest note sections.
- Added Growth Timeline Add Moment demo path (PBI-027, PBI-028) with local in-memory storage.
- Timeline Add Moment CTA opens /modals/add-moment with simulated photo picker, caption field, moment type selection, and save flow.
- Added `useGrowthTimelineStore` Zustand store for locally added growth moments.
- Added `useGrowthTimeline` hook that merges locally added growth moments with demo growth moments.
- Added `AddMomentForm` component with warm, calm design and note that photos are local-only on this device in v1.
- Growth filter shows growth moments; All shows care + growth.
- Added approved-reference local Growth Timeline image asset cropped from the Superdesign Timeline screenshot for simulator parity.
- Added direct Expo native dependencies needed by the simulator build, including `expo-constants` and compatible `expo-font`/`react-native-svg` versions.
- Added Firebase Emulator configuration for local Auth and Firestore development with emulator UI support.
- Added emulator-first Firebase client modules with Expo public environment defaults.
- Wired demo auth to Firebase Auth Emulator for email/password signup, login, sign out, and auth-state bootstrap.
- Wired onboarding household and baby creation to Firestore Emulator collections.
- Wired quick-log care events to Firestore Emulator while keeping fallback demo events for empty/offline local states.
- Added `.env.example` with BabyMinimo local emulator defaults.
- Added approved login reference assets for the Google mark and caregiver avatar stack.
- Added approved BabyMinimo font loading for Outfit headings and Plus Jakarta Sans body text.
- Added shared tab icon primitives for BabyMinimo navigation.
- Added Bottle, Sleep, and Medication logging modals using the approved Log Event shell.
- Added reusable logging choice controls for segmented care form selections.
- Added Reminders flow with local demo reminder creation, active reminder list, and toggle states.
- Added Family & Household screen with household coordination plan positioning, caregiver members, and demo invite entry.
- Added Settings hub linking Plan, Caregivers, Reminders, Growth Timeline, Account, and Sign out flows.
- Added Plans screen with Free, Premium, and Family cards where Family is framed as household coordination.
- Added Profile & Account screen and sign-out confirmation modal backed by Firebase Emulator sign out.
- Added shared Settings header/card/row components for account and household management screens.
- Added reusable empty, loading, error, and success state components for BabyMinimo screens.
- Added Care States showcase route for screenshot-ready state QA.
- Added a lightweight internal analytics event helper with hooks for signup, onboarding completion, baby creation, first care event, Handoff view, reminder creation, Add Moment, Plans view, and sign-out confirmation.
- Added BabyMinimo testing strategy documentation, Bun unit coverage for analytics and Timeline adapter logic, and Maestro smoke/visual E2E flow scaffolding.
- Added stable accessibility labels and test IDs for shared buttons, inputs, and log form actions so Maestro can target controls without relying on fragile OCR taps.
- Added Widgets to the BabyMinimo PBI and Codex command pack as a post-core epic for read-only glanceable handoff state, starting with an iOS Home Screen widget plan.
- Added strict visual baseline testing with a Maestro screenshot map and zero-diff ImageMagick comparison against the approved `screenshots1/` mockups.
- Added production-readiness PBIs for notifications, production Firebase/security, full interaction hardening, E2E/visual release QA, release/App Store readiness, widget implementation, native subscriptions/App Store IAP, account deletion, and data lifecycle/privacy hardening.
- Added PBI-066 for Firebase Remote Config and remote app controls, including safe A/B experiment flags for pricing/paywall copy without making Remote Config the source of truth for StoreKit prices, security, secrets, or entitlements.
- Updated PBI-064 with competitor pricing research and the current BabyMinimo launch pricing hypothesis: Annual $39.99/year selected by default with a valid "Save 65%" badge, Monthly $9.99/month, Weekly $3.99/week as an experiment/fallback, and optional 3-day free trial with clear terms.
- Clarified the lifetime pricing formula in PBI-064 as a 25- or 26-month value anchor: 2 years of monthly access plus 1 or 2 extra monthly periods before selecting the closest App Store price point.
- Added emulator performance and cost-discovery PBIs, including Firebase Emulator load testing, lazy-loading audit, and canceled-subscription heavy-data purge policy.
- Added a Firebase Emulator load-test script that reports Firestore read/write/delete counts, timing, and operation-cost estimates for local BabyMinimo workflows.
- Added the first Firebase Emulator cost-discovery receipt with measured read/write/delete counts, lazy-loading notes, and remaining optimization candidates.
- Added a monthly Firebase operation cost model with 10k-user, 100k-user, and 100k higher-usage projections.
- Added optimization savings estimates showing latest-state summary reads and feature-flag caching can reduce modeled Firestore operation cost by about 28-33%.
- Clarified that Firebase operation-cost estimates exclude storage, indexes, egress, Auth, Functions, push notifications, logs, backups, and store fees.
- Added a canceled-subscription heavy-data purge policy module with unit coverage for future cloud media, export archives, and generated report retention.
- Added the PBI-059 lazy-loading and performance receipt to the Firebase Emulator cost-discovery notes.
- Added the PBI-049 notification system slice with Expo Notifications, local reminder scheduling, permission handling, quiet-hours delay, cancellation/rescheduling, and reminder deep-link metadata.
- Added BabyMinimo notification system documentation covering local demo behavior, caregiver-safe notification copy, quiet hours, and the phased production push infrastructure decision.
- Added PBI-061 for the hybrid notification provider path: local notifications by default, with Firebase Cloud Messaging/APNs used sparingly for cross-device, critical, account, lifecycle, and limited conversion notifications.
- Added task mappings for all 61 BabyMinimo PBIs and mirrored the full PBI roadmap into the GoalBuddy board with production/release work sequenced last.
- Added an editable BabyMinimo deployment/infrastructure Mermaid diagram and linked it to production, release, subscription, and notification PBIs.
- Added editable BabyMinimo screen navigation and data-flow Mermaid diagrams and linked them to app-flow, data, security, interaction-hardening, and E2E PBIs.
- Added editable BabyMinimo UML class, system architecture, and end-to-end user-flow Mermaid diagrams as planning references for data model, service boundaries, production security, performance, and release QA PBIs.
- Added a questionnaire-style onboarding expansion PBI based on the app onboarding questionnaire skill, including goal, pain-point, notification-priming, and personalized preview steps.
- Added an ASO App Store screenshot generation PBI based on the app-store screenshot skill, including benefit discovery, simulator screenshot grading, screenshot manifest requirements, and optional gifting/subscription creative.
- Added a localization PBI for app strings, App Store metadata, country/storefront pricing metadata with PPP-style affordability and above-floor markers, paywall/notification copy, RTL QA, and localized screenshot generation across Arabic, Czech, Danish, English, Estonian, Lithuanian, Latvian, German, Greek, Spanish, Finnish, Filipino, French, Hebrew, Croatian, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Dutch, Norwegian, Polish, Portuguese, Romanian, Russian, Slovak, Swedish, Thai, Turkish, Ukrainian, Vietnamese, Simplified Chinese, and Traditional Chinese.
- Added a conversion paywall and pricing experiment PBI covering weekly/monthly pricing candidates, computed savings badges, trial validation, lifetime purchase positioning, gift/subscription creative, dynamic BabyMinimo logo guidance, Apple Retention Messaging API cancellation-offer planning, and Apple IAP validation cases.
- Updated the login screen contract and copy to the softer Baby MiniMemo positioning: "Tiny moments. Calm care.", memo-focused hero copy, and "Start your care circle" signup language.

### Changed

- Tightened the login screen toward the approved Superdesign visual reference using the BabyMinimo logo asset, correct avatar composition, and wider sign-in card proportions.
- Rebuilt signup and onboarding screens against the approved `screenshots1` references, including the embedded solution preview, add-baby photo target, care-circle selection, invite caregiver form, and preview handoff card.
- Replaced text-symbol tab icons with shared navigation icon primitives and adjusted tab bar sizing toward the approved mockups.
- Tightened later onboarding presentation screens for care priorities, caregiver invite, and household preview toward the approved Superdesign references.
- Tightened the Handoff screen from the prior dark treatment to the approved warm/light `screenshots1` direction with current state, due soon, and latest note hierarchy.
- Replaced the default tab bar with a custom BabyMinimo bottom shell, including the raised center Log action and Home/Handoff/Events/Family destinations.
- Reworked Home toward the approved dashboard reference with a 2x2 care status grid, weekly summary card, quick actions, recent wins, and nav-safe scroll padding.
- Reworked the quick-log chooser and care logging forms to route every core action through Firebase Emulator-backed care events.
- Reworked Timeline and Growth Timeline visual treatment against the approved integrated Timeline screenshot, including explicit filter pills, image-forward Growth cards, Timeline tab labeling, and local Add Moment save flow.
- Reworked the Family tab to match the approved Family & Household mockup hierarchy instead of a generic caregivers-only page.
- Updated Handoff loading presentation and Reminders empty-state behavior to use the shared BabyMinimo state components.
- Normalized Settings navigation copy around Family & Household coordination and removed the QA-only care states row from the user-facing Settings hub.
- Optimized care-event reads to use baby-scoped ordered/limited Firestore queries instead of reading the full `careEvents` collection and filtering client-side.
- Tightened route imports so auth, onboarding, settings, and modal screens avoid broad store/demo barrels that can pull unrelated Firebase-backed modules into the startup path.
- Scoped Home, Timeline, and Handoff listeners to focused routes and deferred Home's secondary Growth Timeline preview load until after initial interactions.
- Connected the Reminders screen to local device notifications while preserving Firebase Emulator as the app's current data/auth boundary.
- Clarified that BabyMinimo's notification strategy is local-first for cost/privacy, with Firebase Messaging/APNs reserved for sparse remote-push use cases and Expo Push Service left as an optional future migration.

### Fixed

- Fixed emulator auth routing so login no longer marks every signed-in user as onboarded; onboarding completion now restores from Firestore Emulator profile data after household and baby setup.
- Removed the Timeline rail warning overlay by replacing unsupported dotted borders with a supported subtle rail style.
- Fixed the Settings shortcut on Home so it opens the Settings hub instead of rendering as an inert icon.
- Fixed Growth Timeline demo asset IDs so active growth moments reference the approved Growth Timeline image asset directly.

### Internal

- Added GoalBuddy as the default planning and execution board workflow for broad mobile app build work.
- Adopted the Codex + OpenCode implementation delegation workflow with Kimi smoke gating and Qwen fallback guidance.
- Kept Firebase Emulator auth/data-boundary work Codex-owned because auth/session paths are not delegated to OSS implementation agents.
- Documented active app image asset provenance against the approved `screenshots1` mockup reference set.
- Disabled Expo Doctor's app config sync warning for the intentional local dev-build setup with a checked-in `ios/` folder.
- Added test scripts for unit, typecheck, Expo Doctor, Maestro smoke, Maestro visual, and local all-checks runs.
- Pinned Maestro scripts to the browser-backed iOS simulator by default with `MAESTRO_DEVICE_ID` override support.
- Upgraded the app to Expo SDK 56 with React Native 0.85, React 19.2, TypeScript 6.0, and an iOS 16.4 deployment target.
