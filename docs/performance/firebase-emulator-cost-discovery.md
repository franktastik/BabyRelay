# Firebase Emulator Cost Discovery

Date: 2026-05-23

## Purpose

Use Firebase Emulator before production wiring to measure BabyMinimo's Firestore read/write/delete shape and catch expensive query patterns early.

This is not a production bill forecast. It is an operation-count benchmark and optimization signal. Confirm current location-specific Firestore pricing before making budget commitments.

Official pricing references:
- Firebase explains Firestore billing is based on document reads, writes, deletes, storage, and network usage.
- Google Cloud publishes location-specific Firestore prices and free quotas.

## Current Local Command

```sh
bun run test:firebase:load
```

The command runs `node scripts/firebase-emulator-load-test.mjs` against the local Firestore Emulator.

Default scenario:
- 10 households
- 1 baby per household
- 40 care events per baby
- 5 latest-event read passes
- latest-event query limit of 20
- cleanup enabled

## First Run

```json
{
  "counts": {
    "reads": 1000,
    "writes": 430,
    "deletes": 430
  },
  "estimatedFirestoreOperationCostUsd": {
    "readsUsd": 0.0006,
    "writesUsd": 0.000774,
    "deletesUsd": 0.000086,
    "totalUsd": 0.00146
  },
  "timingsMs": {
    "reads": 274,
    "total": 1915
  }
}
```

Rates used by the script:
- reads: `$0.06 / 100k`
- writes: `$0.18 / 100k`
- deletes: `$0.02 / 100k`

These are operation-only defaults. The real production estimate must also include free quota, region, storage, indexes, network egress, backups, Functions, Auth, Cloud Messaging, and App Store/Play billing infrastructure.

Important exclusion: every estimate in this document excludes storage, indexes, egress, Auth, Functions, push notifications, logs, backups, and store fees unless a later section explicitly adds them.

## Optimization Applied

Before this pass, the care-events adapter read the full `careEvents` collection and filtered by baby on the client. That scales with total household events.

Now care-event reads use:
- `where('babyId', '==', babyId)`
- `orderBy('occurredAt', 'desc')`
- `limit(...)`

This caps latest-event read cost per baby and matches the way Home, Handoff, and Timeline need to query recent state.

The required composite index is declared in `firestore.indexes.json`.

## Lazy-Loading Notes

PBI-059 implementation pass:
- Expo Router already gives route-level code splitting for app routes.
- Keep auth bootstrap and Home as the only eager critical path.
- Settings subflows, Plans, Account, Widgets, Notifications, App Store release helpers, and production-only flows should remain route-loaded instead of imported into Home.
- Large mockup/reference assets must not be imported into unrelated screens.
- Auth startup now imports `authStore`, auth adapter, and household adapter directly instead of using broad `src/stores` or `src/features/demo` barrels.
- Auth, onboarding, settings, and modal routes now avoid broad demo/store barrels so loading one screen does not pull unrelated demo adapters or stores into that route.
- Home and Timeline care-event listeners attach only while their screens are focused.
- Handoff summary subscribes only while the Handoff route is focused and no longer performs a duplicate get-then-subscribe read.
- Home defers secondary Growth Timeline preview data loading until after initial interactions, keeping the primary handoff snapshot path first.
- Runtime code does not import `docs/product/superdesign-reference-assets/screenshots1/` or other Superdesign reference folders.

Remaining production performance work:
- Measure app startup after production Firebase listeners are added.
- Prefer latest-summary documents for Home/Handoff if listener reads become too high.
- Add focused-listener checks for future reminders, notifications, feature flags, plan entitlements, widgets, and production-only flows.
- Add a release profiler pass after notifications and widgets are implemented, because those features can add background refresh, scheduling, and entitlement reads.

## Heavy-Data Retention Policy

BabyMinimo v1 does not plan to store Growth Timeline photos in Firestore or cloud storage. Growth photos remain local-only.

For future heavy cloud data, the first policy is:
- classify heavy records as `cloud_media`, `export_archive`, or `generated_report`
- never purge active or trialing subscriptions
- select canceled or expired subscriptions only after a default 90-day retention window
- exclude local Growth Timeline photos and widget snapshots from cloud heavy-data purge candidates
- implement destructive purge as a backend job only after a separate production PBI and explicit approval

The policy is implemented in `src/features/subscriptions/purgePolicy.ts` with unit tests.

## Monthly Usage Model

Run:

```sh
bun run cost:firebase --users=10000
bun run cost:firebase --users=100000
```

Default monthly assumptions:
- two users per household
- 30 days per month
- six app opens per user per day
- two Handoff views per user per day
- one Timeline view per user per day
- eight widget refreshes per user per day
- 14 care events per household per day
- two writes per care event
- one notification-related write per household per day

### 10k Users

Derived households: `5,000`

Monthly operations:
- reads: `24,300,000`
- writes: `4,380,000`
- deletes: `10,000`

Estimated Firestore operation cost:
- reads: `$14.58`
- writes: `$7.88`
- deletes: `$0.00`
- total: `$22.47/month`

### 100k Users

Derived households: `50,000`

Monthly operations:
- reads: `243,000,000`
- writes: `43,800,000`
- deletes: `100,000`

Estimated Firestore operation cost:
- reads: `$145.80`
- writes: `$78.84`
- deletes: `$0.02`
- total: `$224.66/month`

### 100k Higher-Usage Stress Case

Assumptions changed:
- 12 app opens per user per day
- three Timeline views per user per day
- 24 widget refreshes per user per day
- 25 care events per household per day

Monthly operations:
- reads: `519,000,000`
- writes: `76,800,000`
- deletes: `100,000`

Estimated Firestore operation cost:
- reads: `$311.40`
- writes: `$138.24`
- deletes: `$0.02`
- total: `$449.66/month`

## Optimization Savings Estimate

The first optimization direction reduces repeated reads by serving Home and Handoff from a compact latest-state summary document and caching feature flags/plan entitlements. It does not reduce write volume yet.

Modeled optimized assumptions:
- Home reads per open: `6 -> 1`
- Handoff reads per view: `6 -> 1`
- feature flag reads per user per day: `1 -> 0.1`
- Timeline remains capped at `20` reads per view
- widgets remain capped at `1` summary read per refresh

### Moderate Usage Savings

At `10,000` users:
- baseline: `24,300,000` reads, `$22.47/month`
- optimized: `12,030,000` reads, `$15.10/month`
- estimated savings: `$7.36/month`
- read reduction: `12,270,000` fewer reads/month
- total operation-cost reduction: about `33%`

At `100,000` users:
- baseline: `243,000,000` reads, `$224.66/month`
- optimized: `120,300,000` reads, `$151.04/month`
- estimated savings: `$73.62/month`
- read reduction: `122,700,000` fewer reads/month
- total operation-cost reduction: about `33%`

### Higher-Usage Savings

At `100,000` users with the higher-usage stress assumptions:
- baseline: `519,000,000` reads, `$449.66/month`
- optimized: `306,300,000` reads, `$322.04/month`
- estimated savings: `$127.62/month`
- read reduction: `212,700,000` fewer reads/month
- total operation-cost reduction: about `28%`

The direct dollar savings are modest because Firestore document reads are relatively cheap. The bigger product value is avoiding runaway costs from unbounded listeners, keeping Home/Handoff fast, and making widgets predictable. For example, if Timeline accidentally reads `200` documents per view instead of the modeled `20`, that adds about `540,000,000` reads/month at `100,000` users and about `$324/month` in extra Firestore read operations.

## Cost Sensitivity

At `100,000` users and two users per household:
- one extra read per user per day costs about `$1.80/month`
- one extra write per household per day costs about `$2.70/month`
- one extra widget refresh per user per day costs about `$1.80/month` when each refresh reads one document

This means the largest cost risks are not single reads. The risks are:
- unbounded Timeline reads
- realtime listeners attached too globally
- widget refreshes reading multiple documents
- writes that fan out to many household/caregiver documents
- notification fan-out stored as per-user documents without batching or TTL

## Optimization Direction

Recommended before production:
- Maintain one compact latest-state summary document per baby for Home, Handoff, widgets, and notification scheduling.
- Keep Timeline paginated and baby-scoped.
- Attach realtime listeners only while screens are focused.
- Cache feature flags/plan entitlements locally with explicit refresh points.
- Keep widget refresh to one summary read where possible.
- Add TTL or scheduled cleanup for notification delivery logs and other operational records.
