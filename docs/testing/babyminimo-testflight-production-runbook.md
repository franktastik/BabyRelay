# BabyMinimo TestFlight And Production Release Runbook

This runbook is the owner-facing checklist for taking BabyMinimo from the local repository to TestFlight and then App Store production. It documents the manual App Store Connect and Firebase steps that must happen outside this repo.

Current local release identifiers:

| Item | Value |
| --- | --- |
| App Store name | `BabyMinimo: Baby Tracker` unless changed by owner |
| Expo slug | `babyminimo` |
| iOS bundle ID | `com.babyminimo.app` |
| Widget bundle ID | `com.babyminimo.app.widgets` |
| App Group | `group.com.babyminimo.app` |
| Local app version | `0.1.0` |
| Local build number | `1` |
| Emulator project | `babyminimo-demo` |
| App/tooling Node runtime | Node 24 LTS |
| Firebase Functions runtime | Node 22 |

## Release Rule

Do not submit a TestFlight or App Store build until every production gate below is either marked `Done` or explicitly marked `Disabled for v1`.

Growth Timeline baby photos remain local-only for v1 unless a separate production media task explicitly approves cloud media sync.

## Phase 0: Local Repository Preflight

1. Start from the approved release branch.
2. Confirm the worktree contains only approved release changes.
3. Confirm local runtime versions:

```sh
node --version
bun --version
```

4. Install dependencies:

```sh
bun install
```

5. Run required local verification:

```sh
bun run test:typecheck
bun run test:unit
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false bun scripts/release-production-smoke.mjs --strict
```

6. Run emulator smoke before touching production:

```sh
bun run emulators
bun run test:firebase:smoke
```

7. Run the read-only App Store Connect automation preflight:

```sh
bun run asc:readiness
```

   - This checks local release identity, `asc` availability, `asc capabilities`, and whether an App Store Connect record already exists for `com.babyminimo.app`.
   - It does not create App Store records, edit metadata, upload screenshots, change pricing, submit builds, or touch Firebase.

8. Run `asc doctor` directly and resolve keychain/profile issues before release work.
9. Run `asc web auth status` directly if the next release step needs an experimental `asc web` command.
10. Confirm app identity:
   - `app.json` iOS bundle ID is `com.babyminimo.app`.
   - Widget bundle ID is `com.babyminimo.app.widgets`.
   - App Group is `group.com.babyminimo.app`.
   - Display name is owner-approved.
11. Confirm release mode does not point at localhost, `127.0.0.1`, or `babyminimo-demo`.
12. Confirm final screenshots are approved, localized where required, and do not show emulator/debug chrome.
13. Confirm every visible App Store screenshot string and metadata string is translated for each shipped locale.
14. Confirm `Info.plist` has accurate purpose strings for every production-enabled permission.

## Phase 1: Apple Developer Account Setup

1. Open Apple Developer and App Store Connect with the owner account.
2. Confirm Apple Developer Program membership is active.
3. In App Store Connect, accept all pending agreements, tax, and banking requirements.
4. In Certificates, Identifiers & Profiles, create or confirm the main App ID:
   - Bundle ID: `com.babyminimo.app`
   - Capabilities: App Groups, Push Notifications if production push is enabled, App Attest/App Check if used, In-App Purchase if subscriptions are enabled.
5. Create or confirm the widget App ID:
   - Bundle ID: `com.babyminimo.app.widgets`
   - Capabilities: App Groups.
6. Create or confirm the App Group:
   - `group.com.babyminimo.app`
7. Confirm the main app and widget extension both include the App Group entitlement.
8. If using EAS managed credentials, confirm EAS has the correct Apple team and bundle identifiers.
9. If using Xcode manual signing, create distribution certificates and provisioning profiles for the app and widget.

## Phase 2: App Store Connect App Record

1. Open App Store Connect.
2. Go to `Apps`.
3. Click `+`.
4. Select `New App`.
5. Choose platform `iOS`.
6. Enter the owner-approved app name, currently planned as `BabyMinimo: Baby Tracker`.
7. Choose the primary language.
8. Select bundle ID `com.babyminimo.app`.
9. Set SKU, for example `babyminimo-ios`.
10. Choose user access.
11. Create the app record.
12. Save the App Store Connect Apple ID in the private release notes or credential vault, not in this repo.
13. Set `ASC_APP_ID` locally and rerun:

```sh
ASC_APP_ID=<app-id> bun run asc:readiness
```

14. Use `docs/testing/babyminimo-asc-automation-readiness.md` to decide which follow-up steps can use stable `asc` commands and which require App Store Connect UI.

## Phase 3: App Store Metadata

Complete this before submitting a build for review:

1. App Information:
   - Name.
   - Subtitle.
   - Category.
   - Content rights.
   - Age rating.
   - Privacy Policy URL.
   - Support URL.
   - Marketing URL if available.
2. Pricing and Availability:
   - Price.
   - Countries/regions.
   - Phased release decision.
3. Version page:
   - Promotional text.
   - Description.
   - Keywords.
   - Screenshots for required device sizes.
   - App Review notes.
   - Demo account only if required.
4. App Privacy:
   - Declare all collected data types.
   - Update before enabling analytics, crash reporting, push, IAP, account deletion backend, or cloud media.
5. Review Notes:
   - State that Growth Timeline media is local-only for v1 if still true.
   - Explain any disabled production features.
   - Explain login/test account access if required.
6. In-App Purchases:
   - Complete only after PBI-055 StoreKit gates are done.
   - Do not submit subscription claims if entitlement backend is not production-ready.
7. Custom Product Pages:
   - Use the PBI-072 plan.
   - Launch initial English pages first.
   - Do not create all 210 localized page sets before validation.

## Phase 4: Firebase Production Project

Production Firebase must use an owner-created production project. Do not use `babyminimo-demo` for production.

1. Create or select the production Firebase project.
2. Add an Apple app:
   - Bundle ID: `com.babyminimo.app`
   - App nickname: `BabyMinimo iOS`
   - App Store ID: add after the App Store Connect record exists.
3. Download `GoogleService-Info.plist` only if the native Firebase path needs it.
4. Configure production environment values outside git:

```sh
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false
```

5. Enable only approved products:
   - Authentication.
   - Firestore.
   - Storage only if a production media/storage PBI approves it.
   - Functions only for approved backend tasks.
   - Remote Config.
   - App Check.
   - Cloud Messaging only if production push is enabled.
   - Analytics or Crashlytics only after privacy labels are updated.
6. Authentication:
   - Enable approved providers.
   - Configure Apple Sign In if enabled.
   - Configure Google Sign In if enabled.
   - Confirm unauthorized invite flows cannot escalate permissions.
7. Firestore:
   - Create the production database in the approved region.
   - Deploy rules and indexes only after emulator tests pass.
   - Confirm household scoping rules block cross-household reads/writes.
8. Storage:
   - Keep off for v1 unless approved.
   - If enabled, deploy `storage.rules` after emulator rules tests pass.
   - Confirm anonymous access is denied.
   - Confirm cross-household paths are denied.
9. Functions:
   - Use Node 22 runtime.
   - Run Functions in the emulator first.
   - Store secrets in Firebase/Google secret storage, not in repo.
   - Deploy only approved callable/trigger functions.
10. Remote Config:
   - Publish safe defaults.
   - Document rollback values.
   - Keep paywall pricing text sourced from StoreKit, not Remote Config.
11. App Check:
   - Configure App Attest for iOS.
   - Start in monitoring mode.
   - Enforce only after TestFlight traffic confirms healthy attestation.
12. Billing and safety:
   - Set budget alerts.
   - Restrict IAM roles.
   - Confirm no personal production credentials are committed.

## Phase 5: Production Build And Upload

### EAS Path

Use this if the project is using EAS credentials and submission:

```sh
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false eas build --platform ios --profile production
eas submit --platform ios
```

Before upload:

1. Increment iOS build number.
2. Confirm production env values are injected in the build profile.
3. Confirm `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false`.
4. Confirm signing uses the correct Apple team.
5. Confirm widget extension signing is valid.

### Xcode Path

Use this if uploading manually from Xcode:

1. Open the iOS workspace.
2. Select the release scheme.
3. Confirm signing for app and widget.
4. Confirm bundle ID and App Group entitlements.
5. Increment build number.
6. Archive.
7. Validate the archive.
8. Distribute to App Store Connect.

## Phase 6: TestFlight

1. Wait for App Store Connect build processing to finish.
2. Complete export compliance questions.
3. Add clear `What to Test` notes.
4. Add internal testers first.
5. Install on a clean physical iPhone.
6. Smoke test:
   - Launch.
   - Login/signup.
   - Onboarding.
   - Home.
   - Handoff.
   - Log.
   - Timeline.
   - Family.
   - Settings.
   - Widgets.
   - Notifications if enabled.
   - Paywall/subscription if enabled.
   - Account deletion if enabled.
7. Record build number, TestFlight build ID, device model, iOS version, Firebase project ID, and go/no-go verdict.
8. Add external testers only after the internal smoke is clean.
9. Submit external TestFlight build for beta review if needed.
10. Collect and triage feedback before App Store submission.

## Phase 7: Live App Store Submission

1. Confirm every `NO-GO` item in the release checklist is closed or intentionally disabled for v1.
2. Confirm screenshots and metadata are final.
3. Confirm privacy labels match the binary and backend.
4. Confirm support and privacy URLs work.
5. Confirm IAP/subscription products are approved if monetization is enabled.
6. Confirm the binary has no emulator config.
7. Confirm Firebase production rules, indexes, Functions, Remote Config, App Check, and budget alerts are ready.
8. Select the approved build on the App Store version page.
9. Click `Add for Review`.
10. Answer all App Review questions.
11. Submit for review.
12. Monitor App Review messages until approved or rejected.

## Phase 8: Post-Release Monitoring

Monitor these during TestFlight and the first production release:

1. App Store Connect:
   - Crashes.
   - Feedback.
   - App Review messages.
   - Conversion.
   - Custom product page performance.
2. Firebase:
   - Auth errors.
   - Firestore denied reads/writes.
   - Functions errors.
   - Remote Config fetch health.
   - App Check rejection rate.
   - Storage usage if enabled.
   - Cost alerts.
3. Product:
   - Onboarding completion.
   - First baby created.
   - First log created.
   - First shared household invite.
   - Feature activation by App Store custom product page.

## Rollback Checklist

1. Stop external TestFlight testing or remove the affected build.
2. If live, pause phased release in App Store Connect when available.
3. Revert Remote Config keys to documented safe defaults.
4. Disable risky feature flags.
5. Disable production push routing if notification behavior is involved.
6. Roll back Functions to the previous known-good version.
7. Do not delete local Growth Timeline media as part of a remote rollback.
8. Prepare a patched binary with an incremented build number if binary behavior must change.
9. Record incident owner, trigger, impact, rollback action, and follow-up PBI/GoalBuddy tasks.

## Live Production Checklist

### App Store Connect

- [ ] Apple Developer membership active.
- [ ] Agreements, tax, and banking complete.
- [ ] App record created for `com.babyminimo.app`.
- [ ] App name approved.
- [ ] Primary language selected.
- [ ] Age rating complete.
- [ ] Privacy Policy URL live.
- [ ] Support URL live.
- [ ] App Privacy labels complete.
- [ ] Final screenshots uploaded.
- [ ] Localized metadata uploaded for launch locales.
- [ ] Review notes complete.
- [ ] Export compliance complete.
- [ ] IAP/subscriptions approved or disabled.

### Firebase

- [ ] Production project exists and is not `babyminimo-demo`.
- [ ] Production env values are stored outside git.
- [ ] Emulator mode disabled for production build.
- [ ] Auth providers configured.
- [ ] Firestore production database created.
- [ ] Firestore rules tested in emulator.
- [ ] Firestore indexes deployed.
- [ ] Storage disabled for v1 or production rules tested/deployed.
- [ ] Functions tested in emulator before deploy.
- [ ] Functions secrets stored outside repo.
- [ ] Remote Config defaults and rollback values documented.
- [ ] App Check configured and rollout mode chosen.
- [ ] Budget alerts configured.
- [ ] IAM roles restricted.

### Build And QA

- [ ] `bun run test:typecheck` passed.
- [ ] `bun run test:unit` passed.
- [ ] `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false bun scripts/release-production-smoke.mjs --strict` passed.
- [ ] Firebase emulator smoke passed before production deploy.
- [ ] iOS build number incremented.
- [ ] App and widget signing valid.
- [ ] App Group entitlement valid.
- [ ] Clean physical-device TestFlight smoke passed.
- [ ] TestFlight build ID recorded.
- [ ] Go/no-go decision recorded.

## References

- BabyMinimo: `docs/testing/babyminimo-asc-automation-readiness.md`
- Apple: [Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/)
- Apple: [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
- Apple: [Submit an app](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app/)
- Apple: [Overview of publishing your app on the App Store](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/overview-of-publishing-your-app-on-the-app-store)
- Firebase: [Add Firebase to your Apple app](https://firebase.google.com/docs/ios/setup)
- Firebase: [Manage and deploy Security Rules](https://firebase.google.com/docs/rules/manage-deploy)
- Firebase: [App Check with App Attest on Apple platforms](https://firebase.google.com/docs/app-check/ios/app-attest-provider)
- Firebase: [Run functions locally](https://firebase.google.com/docs/functions/local-emulator)
- Expo: [Create your first build](https://docs.expo.dev/build/setup/)
- Expo: [Submit to app stores](https://docs.expo.dev/submit/ios/)
- Expo: [Environment variables and secrets](https://docs.expo.dev/eas/environment-variables/)
- Expo: [App version management](https://docs.expo.dev/build-reference/app-versions/)
