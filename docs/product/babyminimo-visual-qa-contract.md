# BabyMinimo Visual QA Contract

This contract prevents UI drift from the approved BabyMinimo mockups.

## Source Of Truth

Approved visual screenshots live in:

```text
docs/product/superdesign-reference-assets/screenshots1/
```

These screenshots are the visual source of truth for BabyMinimo UI work.

Use fetched Superdesign HTML only for structure, content, and rough implementation clues when it does not conflict with `screenshots1/`.

## No Approximation Rule

Do not approximate these details:

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

If exact matching is blocked by a missing asset, stop and list the missing asset instead of inventing a substitute.

## Required UI Task Evidence

Every UI implementation task must return:

- approved screenshot file used
- changed files
- simulator screenshot captured after implementation
- known visual differences
- verification commands and result

Do not accept "matched the design" without a simulator screenshot.

## Exact Baseline Rule

Approved screenshots are strict visual baselines. For any screen state that has an approved screenshot, the captured simulator screenshot must match that approved image 1:1 with zero differing pixels.

No minor visual difference is acceptable in a baselined region. This includes:

- color, shadow, opacity, and gradient differences
- typography size, weight, line-height, and wrapping differences
- icon, logo, avatar, and image differences
- spacing, card size, border radius, safe area, and bottom nav differences
- visible scroll position differences
- one-pixel layout shifts

If the current implementation does not match the approved screenshot exactly, the task is not visually complete. Either update the implementation to match the approved screenshot, or have the product owner replace the approved screenshot with a new approved baseline.

## Automated Pixel Gate

Visual E2E must run the Maestro screenshot flow and then compare the captured screenshots against the approved baselines:

```sh
bun run test:e2e:visual
```

The comparison config is:

```text
e2e/visual-baselines.json
```

The pixel comparison script is:

```text
scripts/compare-visual-baselines.ts
```

The script fails when:

- an approved baseline is missing
- an actual test screenshot is missing
- image dimensions differ
- the ImageMagick absolute-error pixel count is not zero

Diff images are written under:

```text
docs/product/visual-diffs/
```

## Visual Review Gate

Codex review must compare:

- approved screenshot from `screenshots1/`
- current simulator screenshot
- relevant screen contract, when one exists

The review must explicitly decide:

- `accept`: automated pixel comparison passes with zero differing pixels for every approved baseline in scope
- `tighten`: implementation changes are needed to reach a zero-diff match
- `reject`: implementation drift is structural; replan or reassign a bounded fix

Do not record "known visual differences" as accepted differences for baselined areas. Use that field only to explain why a task is not yet visually complete or why an additional approved baseline is needed.

## Scrollable Screens

Some approved mockups are scrollable. A single screenshot may show only one scroll position.

For scrollable screens, every approved captured position must match 1:1. When the product owner has not yet captured all scroll positions, treat uncaptured positions as coverage gaps, not as permission to approximate.

For scrollable screens, capture and compare:

- top position
- middle position, if content exceeds one viewport
- bottom position

Do not shrink content to force it into one viewport. Preserve native scroll behavior and safe-area-aware bottom padding.

Final release visual acceptance requires complete top/middle/bottom approved baselines for each scrollable screen. Until those captures exist, `bun run test:visual:compare:coverage` may fail even if available top-position screenshots match exactly.

## Screenshot Storage

Implementation evidence screenshots should be stored under:

```text
docs/product/implementation-screenshots/
```

Visual diffs or annotated review notes should be stored under:

```text
docs/product/visual-diffs/
```

Create these folders when the first visual QA artifact is produced.
