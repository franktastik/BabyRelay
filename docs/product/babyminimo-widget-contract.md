# BabyMinimo Widget Contract

PBI-045 defines the app-side contract for read-only widgets. Native widget rendering is a later PBI and must not expand this contract without a privacy review.

## Payload

Widget snapshots are JSON-serializable payloads written under:

```text
babyminimo.widget.snapshot.v1
```

The payload includes:

- schema version
- state: `signedOut`, `noSelectedBaby`, `empty`, `ready`, `stale`, or `expired`
- selected baby ID and baby display name when available
- current status: `sleeping`, `awake`, or `unknown`
- last feed summary
- last diaper summary
- last sleep summary
- nearest active due-soon reminder
- generated time, last synced time, expiry time, source, and widget surface

## Privacy Rules

Widgets do not include:

- Growth Timeline photos or image URIs
- free-text caregiver notes
- reminder detail text
- raw care event metadata
- household IDs or household names
- account email, billing, plan, invite, or subscription data
- notification scheduler IDs

Lock Screen and Home Screen surfaces use the same safe payload in v1.

## Refresh Policy

- The app writes a snapshot when it has local/emulator app state available.
- A snapshot is stale after 15 minutes.
- A snapshot expires after 4 hours and should prompt the user to open BabyMinimo.
- Signed-out users get a signed-out payload.
- Users with no selected baby get a no-selected-baby payload.
- Empty baby state is valid and should show a calm "No care events yet" state.

## Native Follow-Up

PBI-046 owns the iOS widget extension, app group storage bridge, widget layouts, and simulator screenshots. PBI-045 intentionally stops at the contract and storage abstraction.

