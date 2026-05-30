# BabyMinimo Release Prerequisites Scout

This document supports `PBI-053 T1`: confirm release prerequisites, signing, metadata, privacy, and store constraints before release implementation work.

It is a scout artifact. It records what exists locally and what remains blocked; it does not perform signing, App Store Connect writes, production Firebase deploys, TestFlight uploads, or production credential access.

## Scout Verdict

`NO-GO` for TestFlight/App Store release.

The repo has enough local metadata to start release-readiness documentation and local production-smoke checks, but it is not ready for a signed TestFlight/App Store path.

## Local Evidence

| Area | Evidence | Scout status |
| --- | --- | --- |
| App name | `app.json` has `expo.name: BabyMinimo`; `Info.plist` has `CFBundleDisplayName: BabyMinimo`. | Present |
| Bundle ID | `app.json` has `ios.bundleIdentifier: com.babyminimo.app`. | Present locally; Apple record/signing not verified |
| Version | `app.json` has `version: 0.1.0`; `Info.plist` has `CFBundleShortVersionString: 0.1.0`; native build is `1`. | Present locally; build number must be incremented per upload |
| App icon | `ios/BabyMinimo/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png`. | Present; owner visual approval still required |
| Splash | `ios/BabyMinimo/Images.xcassets/SplashScreenBackground.colorset/Contents.json` plus launch storyboard reference. | Present; physical-device smoke still required |
| Widget IDs | `com.babyminimo.app.widgets` and `group.com.babyminimo.app` configured in `app.json`/`Info.plist`. | Present locally; App Group capability/signing not verified |
| Privacy manifest | `ios/BabyMinimo/PrivacyInfo.xcprivacy` exists with accessed API reasons and `NSPrivacyTracking: false`. | Present for current local scope |
| Permission strings | `Info.plist` currently has no photo/camera purpose strings. | Blocked if production media import/camera is enabled |
| Store metadata | Metadata/checklist docs exist later in PBI-053 work. | Needs owner/App Store Connect approval |
| Screenshots | Draft ASO screenshot manifest exists later under PBI-063/PBI-053 work. | Blocked until final localized screenshots exist |

## Signing And Store Constraints

These are required before any TestFlight/App Store release:

- Apple Developer Program access.
- App Store Connect app record for `com.babyminimo.app`.
- Signing certificate and provisioning profiles for app and widget extension.
- App Group capability enabled for `group.com.babyminimo.app`.
- TestFlight internal or external testing group.
- Owner-approved app name, subtitle, description, keywords, support URL, privacy policy URL, age rating, and review notes.
- Privacy nutrition labels aligned with Firebase, notifications, analytics, local photos, widgets, subscriptions, and account deletion.
- Final screenshots generated at App Store dimensions from approved UI states.

## Production Constraints

The following remain outside T352 and must stay blocked until explicitly approved tasks clear them:

- production Firebase rules/deploy/App Check/credentials,
- StoreKit products, sandbox purchases, entitlement backend, and App Store Server Notifications,
- production push credentials and physical-device APNs/FCM evidence,
- signed widget extension and Home Screen widget smoke,
- App Store Connect metadata writes,
- TestFlight upload or release submission.

## Dependency Readiness

| Dependency | Current scout read |
| --- | --- |
| PBI-043/PBI-063 screenshots | Draft manifest exists, final assets blocked. |
| PBI-044 metadata/legal | Metadata checklist exists, owner/App Store Connect writes blocked. |
| PBI-049/PBI-050 Firebase | Local Firebase client/emulator work exists; production gates remain. |
| PBI-052/PBI-066 controls | Remote Config docs exist; production rollout controls remain owner-gated. |

## T352 Receipt

- Confirmed local release identity, versioning, icon, splash, widget IDs, and privacy manifest evidence.
- Confirmed signing, App Store Connect, TestFlight, final screenshots, permission strings, production Firebase, StoreKit, push, and widget signed-build evidence are not release-ready.
- Preserved the release boundary: no production Apple, Firebase, StoreKit, push, signing, upload, or credentialed action was performed.
