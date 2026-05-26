# BabyMinimo Album Export Frame Catalog

Date: 2026-05-26

PBI: PBI-069
GoalBuddy: T354

## Scope

The v1 Growth Timeline album export is local-first. It builds a local export payload and preview state for printable PDF albums or individual image pages without backend storage, cloud media sync, print-provider APIs, billing, App Store Connect, or runtime AI generation.

## Frame Asset Decision

The shipped v1 implementation uses approved static frame style definitions in `src/features/album/frameCatalog.ts` and React Native preview components in `app/modals/export-album.tsx`.

The product-owner-provided Image Gen 2 frame examples are the visual direction: warm cream paper, sage, muted gold, soft florals, print-ready margins, and subtle BabyMinimo branding. Runtime AI frame generation is intentionally excluded from the app. Future binary frame art can replace the style definitions as static frontend assets without changing the export payload contract.

Approved frame assets must not contain baked-in English UI text. Image Gen 2 should generate blank/decorative frames with safe text zones, photo wells, ornaments, borders, and optional BabyMinimo brand marks. Text such as frame names, date labels, age labels, captions, "Our Little Story", month labels, and household attribution must be rendered by the app/export layer through runtime i18n.

User-authored album text is separate from localized UI copy. Titles, captions, dedications, and notes should be editable before export and preserved exactly as typed, including languages outside the current app locale. BabyMinimo should not auto-translate user-entered album text unless a later explicit translation feature is approved.

## Localized Text Zones

Frame metadata should define text zones instead of embedding text in pixels:

- title/moment heading
- date and age labels
- caption/body copy
- household or relationship attribution
- month labels for First Year Grid
- optional brand imprint

The renderer should apply the selected app/export locale, support RTL alignment for Arabic and Hebrew, and shrink or wrap long translations so text remains inside print-safe margins.

## Print Size Presets

The export flow should support common photo book sizes:

- 8 x 8 square: default baby book, casual memories, and gifts.
- 8.5 x 11 portrait: standard family album or storybook.
- A4 portrait: European/common bookshelf-friendly output.
- 12 x 12 square: premium keepsake or coffee-table display.

Future native PDF/image rendering should target print-safe margins and 300 DPI output for the selected size. Phone-heavy baby photos usually fit square or portrait presets best; landscape-oriented templates can be added later if user photos justify them.

## Catalog Split

The frame catalog contains exactly 20 templates:

- 12 single/detail baby frames: Classic Cream, Sage Keepsake, Storybook, Minimal White, Soft Floral, Milestone Card, Print Shop Border, Tiny Toes, Welcome Home, Moonlight Nap, Little Star, Heirloom Portrait.
- 8 collage frames: Two Together, Little Moments Strip, First Smiles Grid, Family Circle, Scrapbook Keepsake, Milestone Collage, First Year Grid, Grandparent Keepsake.

Every frame includes BabyMinimo branding in the preview or catalog metadata.

## UI Behavior

- Timeline shows the album entry point only in the Growth filter context.
- The frame picker paginates 8 frames per page.
- Storybook supports timeline item removal before export.
- First Year Grid renders 12 month slots and uses empty placeholders for missing month photos.
- Export output can be toggled between PDF album and image pages.
- The Build local export action produces a local preview state and typed payload, not a file upload.
- The album text section lets users type a title and note in their own language; those values are stored in the local export payload and rendered into safe text zones.
- The export payload can include a local media backup manifest so selected Growth Timeline photos and captions can be backed up together.

## Visual QA Evidence

- `docs/qa/screenshots/pbi-069/timeline-growth-export-entry.png`
- `docs/qa/screenshots/pbi-069/album-modal-frame-selector-page-1.png`
- `docs/qa/screenshots/pbi-069/album-frame-selector-page-2.png`
- `docs/qa/screenshots/pbi-069/storybook-removal-export-ready.png`
- `docs/qa/screenshots/pbi-069/first-year-placeholders-export-ready.png`

## Caveats

- The v1 local export action prepares a local payload/preview state; native PDF/image rendering and share-sheet file writing remain a future implementation slice.
- Static style definitions stand in for final approved binary frame art. No runtime AI call is made inside BabyMinimo.
