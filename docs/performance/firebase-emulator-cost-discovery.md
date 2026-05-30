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

The command runs `node scripts/firebase-emulator-load-test.mjs` against the local Auth, Firestore, Storage, and Functions emulators.

Default scenario:
- 10 households
- 1 baby per household
- 40 care events per baby
- 5 latest-event read passes
- latest-event query limit of 20
- cleanup enabled

Verified concurrent local scenario:

```sh
bun run test:firebase:concurrent
```

That scenario creates 1,000 emulator Auth users, logs them in, writes local household/baby/user/care-event documents, performs baby-scoped latest-event reads, uploads/reads/deletes a bounded Storage sample, and deletes the Auth users and Firestore documents created by the run.

5k stress scenario:

```sh
bun run test:firebase:concurrent:5k
```

The 5k command is intentionally heavier and may exceed a local laptop emulator's timeout ceiling. Passing this command locally should not be treated as a production capacity guarantee.

Optimized latest-state summary scenario:

```sh
bun run test:firebase:load:summary
```

That scenario writes a derived `babyLatestStates/{babyId}` summary document while seeding care events, then reads one summary document per baby per read pass. It models the intended Home, Handoff, widget refresh, and notification-scheduling path before production Firebase work. `careEvents` remains the source of truth and Timeline remains baby-scoped, ordered, limited, and paginated.

Trusted Functions-emulator summary scenario:

```sh
bun run test:firebase:load:function-summary
```

That scenario lets the Firestore trigger in `functions/index.js` maintain `babyLatestStates/{babyId}` after `careEvents/{eventId}` writes. This is the production-shaped read-model path: clients write source events, and a trusted backend derives compact summary documents. The load script uses an emulator-only `skipLatestStateSummary` flag for baseline and client-summary comparisons so the Functions trigger does not contaminate non-Function runs while the emulator is active.

Use lower values for quick local smoke checks:

```sh
node scripts/firebase-emulator-load-test.mjs --authUsers=10 --households=10 --eventsPerBaby=2 --readPasses=1 --latestLimit=5 --authConcurrency=5 --writeConcurrency=5 --readConcurrency=10 --storageConcurrency=5 --deleteConcurrency=5 --storageObjects=5 --cleanup=true
```

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

## 2026-05-28 Production-Operation Emulator Smoke

Scope tested locally:
- Auth emulator email/password signup.
- Firestore emulator household, baby, user, and care-event writes.
- Firestore emulator baby-scoped latest-event reads.
- Firestore emulator cleanup deletes.
- Storage emulator UI availability.
- Storage emulator anonymous write denial.

Cloud Functions status:
- `firebase.json` now configures the Functions emulator on port `5001`.
- `functions/index.js` contains an emulator Firestore trigger, `maintainBabyLatestState`, that derives `babyLatestStates/{babyId}` from `careEvents/{eventId}`.
- Callable Functions for production user workflows remain future production Firebase work. This benchmark validates the emulator read-model trigger path, not a production deploy.

Emulator endpoints verified:
- Auth: `127.0.0.1:9099`
- Firestore: `127.0.0.1:8080`
- Storage: `127.0.0.1:9199`
- Functions: `127.0.0.1:5001`
- Storage UI: `http://127.0.0.1:4000/storage`

### Small Correctness Run

Command:

```sh
node scripts/firebase-emulator-load-test.mjs --households=3 --eventsPerBaby=8 --readPasses=2 --latestLimit=5 --cleanup=true
```

Result:

```json
{
  "counts": {
    "reads": 30,
    "writes": 33,
    "deletes": 33
  },
  "estimatedFirestoreOperationCostUsd": {
    "totalUsd": 0.000084
  },
  "timingsMs": {
    "reads": 72,
    "total": 563
  }
}
```

### Main Local Load Run

Command:

```sh
node scripts/firebase-emulator-load-test.mjs --households=25 --eventsPerBaby=60 --readPasses=5 --latestLimit=20 --cleanup=true
```

Result:

```json
{
  "counts": {
    "reads": 2500,
    "writes": 1575,
    "deletes": 1575
  },
  "estimatedFirestoreOperationCostUsd": {
    "readsUsd": 0.0015,
    "writesUsd": 0.002835,
    "deletesUsd": 0.000315,
    "totalUsd": 0.00465
  },
  "timingsMs": {
    "writes": 1343,
    "reads": 518,
    "deletes": 1442,
    "total": 3303
  }
}
```

Representative Firestore write input:

```json
{
  "collection": "careEvents",
  "fields": {
    "babyId": { "stringValue": "<babyId>" },
    "type": { "stringValue": "breastfeed" },
    "occurredAt": { "timestampValue": "2026-05-28T21:06:47.730Z" },
    "metadata": {
      "mapValue": {
        "fields": {
          "side": { "stringValue": "left" },
          "durationMin": { "integerValue": "12" }
        }
      }
    },
    "createdBy": { "stringValue": "Load Caregiver 1" },
    "runId": { "stringValue": "<runId>" }
  }
}
```

Representative Firestore write output:

```json
{
  "id": "<careEventId>",
  "path": "careEvents/<careEventId>",
  "name": "projects/babyminimo-demo/databases/(default)/documents/careEvents/<careEventId>"
}
```

Representative Firestore read input:

```json
{
  "structuredQuery": {
    "from": [{ "collectionId": "careEvents" }],
    "where": {
      "fieldFilter": {
        "field": { "fieldPath": "babyId" },
        "op": "EQUAL",
        "value": { "stringValue": "<babyId>" }
      }
    },
    "orderBy": [{ "field": { "fieldPath": "occurredAt" }, "direction": "DESCENDING" }],
    "limit": 20
  }
}
```

Representative Firestore read output:

```json
{
  "returnedDocuments": 20,
  "firstDocument": {
    "name": "projects/babyminimo-demo/databases/(default)/documents/careEvents/<careEventId>",
    "fields": {
      "babyId": { "stringValue": "<babyId>" },
      "type": { "stringValue": "breastfeed" },
      "metadata": {
        "mapValue": {
          "fields": {
            "side": { "stringValue": "left" },
            "durationMin": { "integerValue": "12" }
          }
        }
      }
    }
  }
}
```

Storage anonymous write check:

```json
{
  "status": 403,
  "message": "Permission denied. No WRITE permission."
}
```

Monthly model check at `100,000` users:

```json
{
  "monthlyReads": 243000000,
  "monthlyWrites": 43800000,
  "monthlyDeletes": 100000,
  "estimatedFirestoreOperationCostUsd": {
    "readsUsd": 145.8,
    "writesUsd": 78.84,
    "deletesUsd": 0.02,
    "totalUsd": 224.66
  }
}
```

Operational interpretation:
- The current emulator script exercises Firestore REST write/read/delete shapes that map to BabyMinimo household, baby, selected-user, and care-event data.
- The latest-event query remains baby-scoped and limited, which is the key protection against Timeline/Home read explosions.
- Storage is ready for local rules testing, but Growth Timeline photos remain local-only for v1.
- Production Cloud Functions still need deployment, security, and quota review before launch; the local Functions emulator can now validate the `careEvents` to `babyLatestStates` read-model path.

Rates used by the script:
- reads: `$0.06 / 100k`
- writes: `$0.18 / 100k`
- deletes: `$0.02 / 100k`

These are operation-only defaults. The real production estimate must also include free quota, region, storage, indexes, network egress, backups, Functions, Auth, Cloud Messaging, and App Store/Play billing infrastructure.

Important exclusion: every estimate in this document excludes storage, indexes, egress, Auth, Functions, push notifications, logs, backups, and store fees unless a later section explicitly adds them.

## 2026-05-29 Concurrent Emulator Load Harness

The load script now supports bounded concurrency across:
- Auth emulator signup, password login, and account deletion.
- Firestore household, baby, user, and care-event writes.
- Firestore baby-scoped latest-event reads.
- Storage emulator upload, read, and delete under signed-in `emulator-dev/users/{uid}` paths.

The script records representative input/output samples and verifies cleanup for the current `runId`.

Safety rules:
- Keep `--cleanup=true` for load runs unless intentionally debugging emulator residue.
- The script only targets the local `babyminimo-demo` emulator project by default.
- The Storage sample uses local emulator test paths and does not move Growth Timeline photos to production Storage.
- This is a local behavior and operation-shape test. It is not a guarantee that production Firebase will support 20,000 or 50,000 simultaneous users without quota, region, index, rules, client retry, and billing review.

Cloud Functions are now included for the `babyLatestStates` read-model benchmark. The concurrent Auth/Firestore/Storage harness still does not load-test production callables because those workflows are not implemented yet.

### Verified 1k Concurrent Local Run

Command:

```sh
node scripts/firebase-emulator-load-test.mjs --authUsers=1000 --households=1000 --eventsPerBaby=2 --readPasses=1 --latestLimit=5 --authConcurrency=25 --writeConcurrency=25 --readConcurrency=50 --storageConcurrency=10 --deleteConcurrency=25 --storageObjects=50 --cleanup=true
```

Result:

```json
{
  "runId": "load-1780006696391",
  "counts": {
    "authCreates": 1000,
    "authLogins": 1000,
    "authDeletes": 1000,
    "authFailures": 0,
    "reads": 2000,
    "writes": 5000,
    "deletes": 5000,
    "storageWrites": 50,
    "storageReads": 50,
    "storageDeletes": 50,
    "storageFailures": 0
  },
  "cleanupVerification": {
    "remainingRunDocuments": {
      "users": 0,
      "households": 0,
      "careEvents": 0,
      "babies": 0
    },
    "authDeletionProbe": {
      "signInAfterDeleteStatus": 400,
      "deleted": true
    },
    "createdStorageObjects": 50,
    "deletedStorageObjects": 50
  },
  "timingsMs": {
    "auth": 315,
    "writes": 48919,
    "reads": 3578,
    "storage": 1594,
    "cleanup": 114201,
    "total": 168634
  }
}
```

Representative Auth input/output:

```json
{
  "signupInput": {
    "email": "load-1780006696391-user-1@example.test",
    "password": "[redacted]",
    "returnSecureToken": true
  },
  "signupOutput": {
    "localId": "W2qQF4AhEF5ppY6E5pO0RqYMMY7S",
    "email": "load-1780006696391-user-1@example.test",
    "idToken": "[redacted]"
  }
}
```

Representative Storage input/output:

```json
{
  "uploadInput": {
    "path": "emulator-dev/users/<uid>/load-1780006696391-2.json",
    "contentType": "application/json",
    "bytes": 138
  },
  "uploadOutput": {
    "bucket": "babyminimo-demo.appspot.com",
    "contentType": "application/json",
    "size": 138
  },
  "readOutput": {
    "bytes": 138
  },
  "deleteOutput": {
    "deleted": true
  }
}
```

### 5k Local Emulator Stress Attempt

Command:

```sh
bun run test:firebase:concurrent:5k
```

Observed result:

```json
{
  "runId": "load-1780007002947",
  "countsBeforeFailure": {
    "authCreates": 5000,
    "authLogins": 5000,
    "writes": 7185,
    "deletes": 13
  },
  "failed": "TypeError: fetch failed cause=Headers Timeout Error; cleanup=TypeError: fetch failed cause=read ECONNRESET"
}
```

Interpretation:
- The local emulator accepted the 5,000 Auth signup/login operations.
- The local Firestore emulator started timing out during concurrent writes before read and Storage phases.
- The failed run left partial in-memory emulator data, so the emulator process was stopped to clear the run-scoped Auth users and Firestore documents.
- This is a local emulator/laptop ceiling, not a production Firebase benchmark.
- Before testing 20k or 50k simultaneous users, create a dedicated production-like load-test plan with Firebase quotas, regional indexes, security rules, client retry/backoff behavior, load-test approval boundaries, and a disposable test project.

## Optimization Applied

Before this pass, the care-events adapter read the full `careEvents` collection and filtered by baby on the client. That scales with total household events.

Now care-event reads use:
- `where('babyId', '==', babyId)`
- `orderBy('occurredAt', 'desc')`
- `limit(...)`

This caps latest-event read cost per baby and matches the way Home, Handoff, and Timeline need to query recent state.

The required composite index is declared in `firestore.indexes.json`.

## 2026-05-29 Latest-State Summary Optimization

The phrase "the short default run is slightly more expensive" refers to the write/read tradeoff in the smallest benchmark. Summary mode adds one derived summary write per care event. In a short run with only five latest-state read passes, those extra writes dominate before the app has performed enough repeated Home, Handoff, widget, or notification reads to earn the savings back.

That does not mean the summary model is worse. It means it is a read-amortization optimization: write a compact derived document once per event, then reuse it many times for high-frequency surfaces.

### Default Function-Backed Summary Smoke

Command:

```sh
bun run test:firebase:load:function-summary
```

Result:

```json
{
  "counts": {
    "reads": 50,
    "writes": 430,
    "functionWrites": 400,
    "deletes": 440
  },
  "estimatedFirestoreOperationCostUsd": {
    "readsUsd": 0.00003,
    "clientWritesUsd": 0.000774,
    "functionWritesUsd": 0.00072,
    "deletesUsd": 0.000088,
    "totalUsd": 0.001612
  },
  "timingsMs": {
    "writes": 266,
    "functions": 4374,
    "reads": 11,
    "cleanup": 73,
    "total": 4732
  }
}
```

Interpretation:
- The default latest-query baseline is cheaper at this small read volume because it performs only `1000` reads and `430` client writes.
- The Function summary smoke performs only `50` latest-state reads, but adds `400` derived Function writes.
- Cleanup verified zero remaining run documents across households, babies, users, care events, and baby latest-state summaries.

### Recurring Read Comparison

Baseline command:

```sh
node scripts/firebase-emulator-load-test.mjs --households=10 --eventsPerBaby=40 --readPasses=30 --latestLimit=20 --cleanup=true
```

Baseline result:

```json
{
  "counts": {
    "reads": 6000,
    "writes": 430,
    "functionWrites": 0,
    "deletes": 430
  },
  "estimatedFirestoreOperationCostUsd": {
    "totalUsd": 0.00446
  },
  "timingsMs": {
    "writes": 201,
    "reads": 397,
    "cleanup": 53,
    "total": 654
  }
}
```

Function-backed summary command:

```sh
node scripts/firebase-emulator-load-test.mjs --households=10 --eventsPerBaby=40 --readPasses=30 --latestLimit=20 --summaryReads=true --summaryWriteMode=function --cleanup=true
```

Function-backed summary result:

```json
{
  "counts": {
    "reads": 300,
    "writes": 430,
    "functionWrites": 400,
    "deletes": 440
  },
  "estimatedFirestoreOperationCostUsd": {
    "readsUsd": 0.00018,
    "clientWritesUsd": 0.000774,
    "functionWritesUsd": 0.00072,
    "deletesUsd": 0.000088,
    "totalUsd": 0.001762
  },
  "timingsMs": {
    "writes": 380,
    "functions": 4605,
    "reads": 58,
    "cleanup": 74,
    "total": 5124
  }
}
```

Interpretation:
- The recurring baseline performs `6000` latest-event reads because each baby/read pass fetches up to `20` recent events.
- The Function-backed summary path performs `300` latest-state reads because each baby/read pass fetches one compact summary.
- The recurring summary estimate is about `60%` lower in this operation-only model despite the `400` derived Function writes.
- Function processing adds local emulator latency while the script waits for every summary's `eventCount` to reach the expected number of events. That wait validates eventual consistency and cleanup, but it is not a production latency guarantee.

Representative Function-derived summary output includes:
- `babyId`, `householdId`, `babyName`, `schemaVersion`, and `eventCount`
- `lastEventId`, `lastEventAt`, and `lastActionBy`
- compact `lastFeed`, `lastDiaper`, `lastSleep`, `lastMedication` slots when those event types exist

Production direction:
- Keep client writes focused on source-of-truth `careEvents`.
- Maintain `babyLatestStates` from trusted backend code before launch.
- Treat the emulator-only client summary and skip flags as measurement tools only.
- Keep Timeline paginated and baby-scoped instead of replacing event history with the summary document.

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

Implementation alignment:
- `src/features/demo/handoff.ts` now reads and focus-subscribes to `babyLatestStates/{babyId}` through the existing Handoff summary hook, falling back to local demo data only when the emulator summary is absent or unreachable.
- Home widget refresh calls the same summary adapter, so a local widget snapshot can be built from one compact latest-state read plus the local reminder list instead of a latest-event query.
- Home memoizes latest-event and activity-summary derivations; Timeline memoizes baby-scoped event filtering, item building, search/filter/sort output, and Growth media durability summaries.
- `src/features/subscriptions/localEntitlementCache.ts` adds explicit-refresh local caches for feature flags and plan entitlements with short TTLs, avoiding broad or always-on listeners for rarely changing access data.
- `src/features/notifications/deliveryLogPolicy.ts` defines a 30-day delivery-log retention window that future Firestore TTL or scheduled Functions cleanup can mirror.

## 2026-05-29 Latest-State Summary Read Optimization

PBI/task added:
- `PBI-071: Firebase latest-state summary and read-cost optimization`
- GoalBuddy `T357`

Implementation added to the emulator load script:
- `--summaryReads=true` switches Home/Handoff/widget-style reads from latest `careEvents` queries to one `babyLatestStates/{babyId}` document read per baby/pass.
- `--summaryWriteMode=perEvent` models a production-like trusted backend update that writes the summary after each care event write.
- Representative input/output now includes summary writes and summary reads.
- Cleanup verification includes `babyLatestStates` so local test documents are removed after each run.

Default baseline result from `bun run test:firebase:load`:

```json
{
  "counts": {
    "reads": 1000,
    "writes": 430,
    "deletes": 430
  },
  "estimatedFirestoreOperationCostUsd": {
    "totalUsd": 0.00146
  },
  "timingsMs": {
    "reads": 166,
    "total": 1130
  }
}
```

Default summary result from `bun run test:firebase:load:summary`:

```json
{
  "counts": {
    "reads": 50,
    "writes": 830,
    "deletes": 440
  },
  "estimatedFirestoreOperationCostUsd": {
    "totalUsd": 0.001612
  },
  "timingsMs": {
    "reads": 25,
    "total": 734
  }
}
```

Default interpretation:
- Reads dropped from `1000` to `50`, a `95%` reduction for latest-state surfaces.
- Writes increased because the script models a summary update after every event write.
- At only `5` read passes, total operation cost is roughly flat/slightly higher because the extra summary writes dominate the short run.

Recurring-read baseline command:

```sh
node scripts/firebase-emulator-load-test.mjs --households=10 --eventsPerBaby=40 --readPasses=30 --latestLimit=20 --cleanup=true
```

Recurring-read baseline result:

```json
{
  "counts": {
    "reads": 6000,
    "writes": 430,
    "deletes": 430
  },
  "estimatedFirestoreOperationCostUsd": {
    "totalUsd": 0.00446
  },
  "timingsMs": {
    "reads": 401,
    "total": 767
  }
}
```

Recurring-read summary command:

```sh
node scripts/firebase-emulator-load-test.mjs --households=10 --eventsPerBaby=40 --readPasses=30 --latestLimit=20 --summaryReads=true --summaryWriteMode=perEvent --cleanup=true
```

Recurring-read summary result:

```json
{
  "counts": {
    "reads": 300,
    "writes": 830,
    "deletes": 440
  },
  "estimatedFirestoreOperationCostUsd": {
    "totalUsd": 0.001762
  },
  "timingsMs": {
    "reads": 95,
    "total": 623
  }
}
```

Recurring-read interpretation:
- Reads dropped from `6000` to `300`, a `95%` reduction.
- Total modeled Firestore operation cost dropped from `$0.00446` to `$0.001762`, about a `60.5%` reduction in this recurring-read scenario.
- This confirms the optimization is useful for high-frequency Home/Handoff/widget/notification reads, especially after the extra summary-write cost is amortized.

Remaining production requirement:
- The deployed version should maintain `babyLatestStates` from Firebase Functions or another trusted backend path before production launch.
- Client-maintained summary writes are acceptable only for emulator measurement or temporary local fallback because clients should not be the long-term authority for derived production read models.
