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

The source frame catalog contains exactly 51 templates after the feminine floral, unique-design, and 3D static-asset expansion. The 3D designs are additive catalog entries with their own stable `three-d-*` IDs; they must not replace, rename, or visually convert the existing flat/stationery frame families.

The user-facing v1 picker exposes 41 active templates: 33 single/detail baby frames and 8 collage frames. The 10 `three-d-*` templates remain experimental and disabled in the normal picker and preview carousel until BabyMinimo has per-photo crop/reposition controls. The current 3D assets can leave visible white gaps for some photo aspect ratios, so they are retained as local static assets for future iteration but are not user-selectable.

- 43 single/detail baby frames: Classic Cream, Sage Keepsake, Storybook, Blush Gallery, Rose Floral, Milestone Card, Print Shop Border, Tiny Toes, Welcome Home, Blush Moon Nap, Little Star, Heirloom Portrait, Rose Garden, Pink Peony, Blush Bow, Red Rose Keepsake, Butterfly Blush, Lace Princess, Garden Party, Curling Vine, Rose Lace, Daisy Chain, Pearl Oval, Three Month Steps, Cloud Dream, Golden Scroll, Meadow Wreath, Ribbon Keepsake, Six Month Steps, Twelve Month Steps, Little Crown, Garden Arch, Fan Fold Trio, 3D Teddy Fan, 3D Safari Trio, 3D Woodland Arch, 3D Dino Cloud, 3D Moon Cloud, 3D Rainbow Trio, 3D Rose Bow, 3D Ocean Sail, 3D Balloon Duo, 3D Castle Portrait.
- Three Month Steps, Six Month Steps, and Twelve Month Steps are stepped milestone layouts, not one-photo ornament variants. They arrange 3, 6, and 12 photo slots like a small staircase to represent baby progress over 3 months, 6 months, and 12 months.
- Fan Fold Trio uses three tall overlapping photo panels fanned from a shared bottom point, based on the product-owner sketch.
- The 10 3D static-asset frames use the product-owner-provided `new-frame-sample/` direction: soft 3D keepsake objects, raised clay/paper framing, nursery toys, moon/clouds, rainbow, roses, ocean, balloons, and castle treatments. These are local frontend assets in v1 and are experimental until photo placement can be adjusted per slot. 3D frame PNGs should have transparent outside canvases and tight object bounds so they do not render as white squares inside the album page.
- 8 collage frames: Two Together, Little Moments Strip, First Smiles Grid, Family Circle, Scrapbook Keepsake, Milestone Collage, First Year Grid, Grandparent Keepsake.

The catalog intentionally includes a feminine/girl-forward group with blush, pink peony, rose, lace, bow, and butterfly treatments. These styles must look meaningfully different from the sage/cream/gold keepsake set instead of reusing the same top-line heart ornament.

The additional unique-design set uses curling vine lines, rose lace, daisy chains, pearl oval matting, stepped milestones, fan-fold panels, cloud/star sleep motifs, golden scrollwork, meadow wreath marks, ribbons, crown rules, and garden arches. Each design should read as its own frame family, not a color-only variant.

Five generated baby test photos are included as local frontend assets and demo Growth Timeline moments so album previews can exercise user-selected media instead of repeating one foot image.

Every frame includes BabyMinimo branding in the preview or catalog metadata.

## UI Behavior

- Timeline shows the album entry point only in the Growth filter context.
- The frame picker paginates 8 frames per page and is collapsed/off by default so the screen does not show the full frame grid unless the user turns it on.
- Enlarged frame previews include left/right controls to select the previous or next frame directly.
- Decorative frame overlays are off by default and can be turned on from a compact On/Off switch below the frame artwork inside the enlarged preview.
- Enlarged frame previews include compact circular palette controls for original, cream, sage, and pink frame colors; palette changes recolor the frame background and main accent/decoration marks without resizing the preview.
- Experimental 3D frames are hidden from the normal frame picker and enlarged-preview next/previous controls. They should not be re-enabled until per-photo crop/reposition controls exist, such as drag-to-position and pinch-to-zoom, because automatic placement alone has shown visible edge gaps on some 3D openings.
- Storybook supports timeline item removal before export.
- First Year Grid renders 12 month slots and uses empty placeholders for missing month photos.
- Export output can be toggled between PDF album and image pages.
- The Build local export action produces a local preview state and typed payload, not a file upload.
- The album text section lets users type a title and note in their own language; those values are stored in the local export payload and rendered into safe text zones.
- Album title and note editing is collapsed/off by default to keep the modal compact; users can turn it on when they want to customize printed text.
- Album title and note inputs enforce frame-safe character limits with visible counters before export.
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
- The 3D frame assets are intentionally disabled from the user-facing v1 picker until a crop/reposition editor can prevent visible white gaps for varied user photo aspect ratios.
