# BabyMinimo Superdesign Reference Assets

This folder stores local visual references for the approved BabyMinimo Superdesign mockup direction.

Project ID: `47fa1dd3-10eb-4443-83d1-37824d15cd2a`

## Contents

- `screenshots1/`: approved mockup screenshots captured by the product owner. Use these as the canonical visual reference set.
- `manifest.json`: machine-readable index of the approved `screenshots1/` files.
- `quality-notes.md`: historical notes about old fetched screenshots that did not match the approved mockup direction.

The old `screenshots/` folder was intentionally cleared because those fetched PNGs did not match the approved mockups.

Use `screenshots1/` alongside `docs/product/babyminimo-superdesign-implementation-plan.md` and the fetched draft HTML cache at `/private/tmp/babyminimo-superdesign-html/`.

## Implementation Notes

- Treat `screenshots1/` as the visual reference for spacing, density, typography, card radius, shadows, icon placement, and overall mockup direction.
- Treat the fetched HTML as a structure/content reference when it does not conflict with the approved `screenshots1/` visual direction.
- If historical notes flag an old fetched screenshot, ignore that old screenshot and prefer `screenshots1/`.
- Some mockups represent scrollable screens. Do not compress all content into one viewport just because the screenshot shows a single capture.
- For scrollable screens, verify top, middle, and bottom states when matching the design.

## App Asset Provenance

Active image assets used by the app must either come from the approved `screenshots1/` captures or from an approved logo/mark crop:

- `app/logo.png`: BabyMinimo logo/mark used across auth, onboarding, Home, and sign-out.
- `app/google-logo.png`: Google sign-in mark used on the approved login flow.
- `app/caregiver-avatar-1.png` and `app/caregiver-avatar-2.png`: caregiver avatar crops used for the approved login, onboarding, Home, and Family visual language.
- `app/baby-preview-avatar.png`: baby/avatar image crop used in approved onboarding, logging, Handoff, and preview screens.
- `app/growth-feet-reference.png`: Growth Timeline reference image cropped from the approved integrated Timeline/Growth screenshot.
- `app/caregiver-sarah-clean.png`: account avatar crop derived from the same approved caregiver visual set; use only where a single clean account avatar is required.

Do not introduce new app image assets unless they are traced here to an approved screenshot or explicitly approved by the product owner. The legacy `app/baby-avatars*.png` files are not active implementation assets and should not be referenced by app code.

## Chat Image Caveat

The current durable reference set is `screenshots1/`. Some scrollable screens may still need additional top, middle, or bottom captures before final visual review.
