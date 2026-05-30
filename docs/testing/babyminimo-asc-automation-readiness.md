# BabyMinimo App Store Connect Automation Readiness

This document turns the App Store Connect automation plan into a safe release workflow. It documents what can be handled with `asc`, what must stay manual, and how to run read-only readiness checks before any App Store Connect write command.

## Current Position

Run `asc doctor` directly before release work to confirm keychain/config/profile readiness, and run `asc web auth status` directly before using experimental `asc web` commands. The readiness script does not treat those keychain-backed checks as automated because scripted child processes may not read the cached credentials reliably. Prefer stable `asc` API-backed commands first. The experimental `asc web` surface is allowed only as a fallback for gaps after `asc capabilities`, local docs, and dry-run/diff output show that no stable command exists.

The current release identity remains:

| Item | Value |
| --- | --- |
| App Store name | `BabyMinimo: Baby Tracker` |
| Installed display name | `BabyMinimo` |
| iOS bundle ID | `com.babyminimo.app` |
| Widget bundle ID | `com.babyminimo.app.widgets` |
| App Group | `group.com.babyminimo.app` |
| SKU | `babyminimo-ios` |
| Primary locale | `en-US` |

## Read-Only Preflight

Run this before App Store Connect setup work:

```sh
bun run asc:readiness
```

For JSON output:

```sh
bun run asc:readiness -- --json
```

After an App Store Connect app ID exists:

```sh
ASC_APP_ID=<app-id> bun run asc:readiness
```

After a TestFlight build exists:

```sh
ASC_APP_ID=<app-id> ASC_BUILD_ID=<build-id> bun run asc:readiness
```

The readiness script is intentionally read-only. It may run:

- `asc version`
- `asc capabilities --output json --pretty`
- `asc apps list --bundle-id com.babyminimo.app --output json --pretty`
- `asc validate ...` only when `ASC_APP_ID` is supplied
- `asc validate testflight ...` only when `ASC_APP_ID` and `ASC_BUILD_ID` are supplied

It must not create an app record, edit metadata, upload screenshots, submit builds, create subscriptions, change pricing, or accept agreements.

## Automation Ownership

| Area | Primary owner | Rule |
| --- | --- | --- |
| Apple Developer agreements, tax, banking | Manual App Store Connect UI | Required before submission; do not automate legal/account acceptance. |
| App record and metadata | `asc` stable commands first | Use capability checks and validation before write commands. |
| Screenshots | Local screenshot generation plus `asc screenshots` after approval | Upload only final approved, localized assets with no emulator/debug chrome. |
| Custom Product Pages | `asc product-pages` after final assets exist | Start with the approved PBI-072 English pages; do not create 210 localized page sets before validation. |
| TestFlight groups/testers/build notes | `asc testflight` | Distribution still requires a signed build from the approved Xcode/EAS path. |
| IAP/subscriptions | `asc subscriptions` after StoreKit decisions are approved | Sandbox and TestFlight purchase validation must pass before production claims. |
| Firebase production | Firebase CLI/console | Never use `babyminimo-demo` for production. |
| Build archive/upload | Xcode or EAS | Requires owner-approved signing credentials and build number increment. |

## Safe Setup Sequence

1. Run `bun run asc:readiness`.
2. Resolve local release blockers from `docs/testing/babyminimo-app-store-testflight-checklist.md`.
3. Run `asc doctor` directly and resolve keychain/profile issues.
4. Confirm Apple Developer agreements, tax, and banking manually.
5. Create or confirm the Bundle ID, widget Bundle ID, App Group, and signing path.
6. Create or confirm the App Store Connect app record for `com.babyminimo.app`.
7. Run `asc web auth status` directly if the next step needs an experimental `asc web` command.
8. Set `ASC_APP_ID` and rerun `bun run asc:readiness`.
9. Use `asc validate --app "$ASC_APP_ID" --version <version> --platform IOS` before any submission attempt.
10. Upload only owner-approved screenshots and metadata.
11. Use `asc validate testflight --app "$ASC_APP_ID" --build "$ASC_BUILD_ID"` after a signed build has processed.
12. Keep final release status as `NO-GO` until the signed physical-device TestFlight smoke, StoreKit, production Firebase, push, widget, privacy, and screenshot gates are closed or explicitly disabled for v1.

## Explicit Non-Actions

This automation readiness work does not authorize:

- production Firebase deploys
- App Store Connect write commands
- app submission
- TestFlight upload
- StoreKit product creation
- pricing changes
- signing certificate or provisioning profile changes
- production credential storage in this repo
- moving Growth Timeline baby photos into cloud storage
