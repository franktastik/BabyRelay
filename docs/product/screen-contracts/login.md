# Login Screen Contract

## Target Screenshot

Approved visual reference:

```text
docs/product/superdesign-reference-assets/screenshots1/Screenshot 2026-05-22 at 23.15.29.png
```

## Required Assets

- Approved BabyMinimo logo/mark asset. Do not recreate the logo with a text glyph when the asset is available.
- Two human caregiver avatars.
- Sage love icon avatar.
- Apple icon.
- Correct Google icon, not a plain `G` glyph.

## Required Structure

- Centered brand mark at the top.
- `Baby MiniMemo` title.
- `Tiny moments. Calm care.` subtitle.
- Avatar stack with two human avatars and a sage heart/love avatar.
- Hero copy: `Coordinating baby care, one memo at a time.`
- Rounded white sign-in card.
- Black Apple button.
- White bordered Google button.
- `OR CONTINUE WITH` divider.
- Household email input with mail icon and right-side action icon.
- Secure password input.
- Remember me and Forgot row.
- Clay `Sign in` CTA.
- `New family? Start your care circle` footer row.
- Small encrypted-family-data note.

## Non-Negotiable Visual Details

- Do not use initials in place of the two human avatars.
- Do not use a text-only logo if the logo asset exists.
- Do not use a plain blue `G` for Google.
- Do not make the form card too narrow or too short compared with the reference.
- Do not let the bottom content disappear behind the home indicator.
- Preserve warm cream background, soft border, soft shadows, rounded controls, and the calm density of the approved screenshot.

## Scroll Behavior

The login screen must remain keyboard-safe and scrollable on small devices. The resting state should visually match the approved screenshot; keyboard-open state may scroll.

## Acceptance Evidence

Return:

- approved screenshot used
- simulator screenshot path
- known visual differences
- verification command output

Minimum verification:

```sh
bunx tsc --noEmit
```
