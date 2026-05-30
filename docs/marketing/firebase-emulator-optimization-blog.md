# How We Used the Firebase Emulator to Cut BabyMinimo's Repeated Reads

Before moving BabyMinimo's Firebase work toward production, we wanted a practical answer to a simple question: what happens when the app's most-used screens keep asking Firestore for recent baby activity?

The answer matters because baby tracking apps are read-heavy. A family may open Home, Handoff, widgets, and notification surfaces many times a day, while the underlying baby activity changes far less often. If every surface repeatedly queries recent care events, cost and listener pressure can grow faster than the actual product value.

So we used the Firebase Emulator Suite to test the shape of the system locally before making production commitments.

## The Problem

BabyMinimo stores baby care history as source-of-truth events:

```text
careEvents/{eventId}
```

That event log is the right model for Timeline because Timeline needs history. Users expect to scroll, filter, search, and review past feeding, diaper, sleep, medication, note, and growth events.

But Home, Handoff, widgets, and notification scheduling do not need the whole history. Most of the time, they need a compact "what is the latest state for this baby?" answer:

- last feed
- last diaper
- last sleep state
- last medication activity
- last action time
- who acted last
- baby and household identifiers

If those high-frequency surfaces query the latest 20 events every time, the app pays repeated read cost for data it does not need.

## The Optimization

We added a derived read model:

```text
babyLatestStates/{babyId}
```

The source of truth remains `careEvents`. The summary document is only a compact read model maintained from care-event writes.

In the Firebase Functions emulator, a Firestore trigger watches new care events and updates the matching baby summary:

```text
careEvents/{eventId}
  -> maintainBabyLatestState
  -> babyLatestStates/{babyId}
```

This means the high-frequency surfaces can read one document per baby instead of querying a page of recent events.

Timeline stays event-history based. Home, Handoff, widgets, and notification-style reads move toward the summary document.

## Why Use the Firebase Emulator?

The emulator let us test this without touching production Firebase:

- Firestore reads and writes ran locally.
- Functions triggers ran locally.
- Auth, Firestore, Storage, and Functions stayed in the `babyminimo-demo` emulator project.
- Load-test data was run-scoped and deleted after each run.
- We could compare baseline event-query behavior with optimized summary-read behavior.

That gave us realistic implementation feedback before deploying anything.

## What We Implemented

The optimization had two parts: backend-shaped emulator behavior and app-side consumption.

On the emulator side:

- Added a Functions emulator Firestore trigger to maintain `babyLatestStates/{babyId}`.
- Extended the Firebase load-test script with `--summaryReads=true`.
- Added `--summaryWriteMode=function` to verify the production-shaped path where trusted backend code maintains summaries.
- Added cleanup verification so test households, users, babies, care events, and summary docs are removed after the run.

On the app side:

- Handoff now reads and focus-subscribes to `babyLatestStates/{babyId}`.
- Home widget refresh uses the same summary adapter, so widget payloads can be built from one summary read.
- Timeline remains baby-scoped and event-history based.
- Home and Timeline now memoize derived data with `useMemo` where repeated filtering, sorting, search, and summary work was happening during render.
- Feature flags and plan entitlements now have local explicit-refresh caches with short TTLs.
- Notification delivery logs now have a local TTL policy that future Firestore TTL or scheduled cleanup can mirror.

## The Test

We compared two local emulator runs with the same shape:

```sh
node scripts/firebase-emulator-load-test.mjs \
  --households=10 \
  --eventsPerBaby=40 \
  --readPasses=30 \
  --latestLimit=20 \
  --cleanup=true
```

That baseline simulates 10 babies, 40 events per baby, and 30 repeated latest-state read passes. Each pass queries up to 20 recent care events per baby.

Then we ran the Function-backed summary version:

```sh
node scripts/firebase-emulator-load-test.mjs \
  --households=10 \
  --eventsPerBaby=40 \
  --readPasses=30 \
  --latestLimit=20 \
  --summaryReads=true \
  --summaryWriteMode=function \
  --cleanup=true
```

This version still writes the same `careEvents`, but the Functions emulator maintains `babyLatestStates`, and repeated latest-state reads fetch one summary document per baby per pass.

## Results

Baseline latest-event query:

```json
{
  "reads": 6000,
  "writes": 430,
  "functionWrites": 0,
  "deletes": 430,
  "estimatedTotalUsd": 0.00446
}
```

Function-backed summary read:

```json
{
  "reads": 300,
  "writes": 430,
  "functionWrites": 400,
  "deletes": 440,
  "estimatedTotalUsd": 0.001762
}
```

The optimized run reduced repeated latest-state reads from `6000` to `300`.

That is a 95% read reduction for this scenario.

Even after accounting for `400` derived Function summary writes, the modeled operation estimate dropped from about `$0.00446` to `$0.001762`, roughly a 60% reduction for the recurring-read workload.

These are emulator and operation-model numbers, not a production bill. Production pricing depends on region, current Firebase pricing, indexes, network behavior, and real usage. But the direction is clear: repeated state surfaces should not re-read event history when one compact summary document is enough.

## The Important Tradeoff

The short default run can look slightly more expensive in summary mode because every event write also creates or updates a summary document.

That is the write/read tradeoff:

- Summary mode adds one derived write per event.
- It saves reads every time Home, Handoff, widgets, or notification scheduling need latest state.

If there are only a few reads after writes, the extra summary writes can dominate. Once the app performs repeated latest-state reads, the summary model wins quickly.

That matches BabyMinimo's expected usage: parents may open or glance at current state many times between logged events.

## Why We Did Not Replace Timeline

The summary document is not a replacement for Timeline.

Timeline still needs:

- pagination
- baby-scoped history
- filtering
- searching
- growth moments
- chronological review

So Timeline remains backed by scoped care-event history. The optimization only targets surfaces that need current state, not the full event log.

## Frontend Optimization: Where `useMemo` Helped

The Firebase read model reduced backend read pressure. We also checked the app render path.

We found places where derived data was recalculated during render:

- Home was filtering and sorting local events to find the latest selected-baby event.
- Home was re-running selected-baby and activity-summary lookups.
- Timeline was filtering baby events, building timeline items, searching, filtering, sorting, and summarizing media durability on every render.

Those are now memoized so the work only reruns when its inputs change.

This does not replace backend optimization, but it prevents local render cost from growing unnecessarily as local state gets larger.

## What This Proves

The Firebase Emulator gave us proof before production:

- A compact `babyLatestStates/{babyId}` document can serve high-frequency latest-state surfaces.
- Functions can maintain the summary locally from `careEvents`.
- The app can consume the summary for Handoff and widgets.
- Timeline can stay paginated and baby-scoped.
- Load-test cleanup can leave the emulator clean after each run.
- The read reduction is measurable before production deployment.

## Production Direction

Before production, BabyMinimo should keep this boundary:

- Clients write source-of-truth `careEvents`.
- Trusted backend code maintains `babyLatestStates`.
- Home, Handoff, widgets, and notification scheduling read the compact summary.
- Timeline reads paginated event history.
- Feature flags and plan entitlements use explicit refresh and local caching.
- Operational logs such as notification delivery records use TTL or scheduled cleanup.

That keeps the app predictable as usage grows and avoids making every glance at current baby state pay for event-history reads.
